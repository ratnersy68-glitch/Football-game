import { clamp, vdist, vnorm, vsub } from '../core/math';
import type { Rng } from '../core/rng';
import { ARCHETYPES, COMBO_BY_ID, STRIKES, SUBS_FROM, type ComboDef, type StrikeDef } from '../data';
import type { FightEngine } from '../engine/FightEngine';
import { fatigueFactor, kickReach, leadLegKey, punchReach, staminaFrac } from '../engine/FighterState';
import { cageDistance, nearestCageNormal } from '../engine/Octagon';
import { emptyCommand, type Action, type Command, type DefenseMove, type Guard, type Side, type SubKey } from '../engine/types';
import { DIFFICULTIES, type DifficultyId, type DifficultyProfile } from './Difficulty';
import { PlayerModel } from './PlayerModel';
import { StrategyEngine, type GamePlan } from './StrategyEngine';

interface Snapshot {
  t: number;
  kind: Action['kind'] | 'none';
  id: string;
  phase: number;
  guard: Guard;
}

interface Perceived {
  /** When the opponent's action actually began. */
  start: number;
  /** When this AI notices it (start + reaction delay). */
  at: number;
  kind: Action['kind'];
  id: string;
  feint: boolean;
  handled: boolean;
}

const GENERIC = ['jab', '1-2', 'jab-legkick', '2'];

/**
 * Tactical AI. Perceives only what is visible (the opponent's actions, delayed by a human-range
 * reaction time), executes the StrategyEngine's game plan, and exploits habits the PlayerModel has
 * picked up.
 */
export class AIController {
  readonly diff: DifficultyProfile;
  readonly model: PlayerModel;
  readonly strategy: StrategyEngine;
  plan: GamePlan;
  private planT = 0;
  private decideT = 0;
  private history: Snapshot[] = [];
  private perceived: Perceived[] = [];
  private lastOppAction: Action | null = null;
  private guardT = 0;
  private guardType: Guard = 'none';
  private queue: string[] = [];
  private queueExpire = 0;
  private circleDir = 1;
  private circleT = 0;
  private subPrompt: SubKey | null = null;
  private subPressAt = 0;
  private mashT = 0;
  private pounceDecided = -1;
  private pounce = false;
  private feintCheck: { at: number; guard: Guard } | null = null;
  private lastCombo = '';
  private repertoire: ComboDef[];
  private anticipate: { at: number; id: string } | null = null;
  private roundSeen = 1;
  private moveNoise = { x: 0, z: 0 };
  private moveNoiseT = 0;

  constructor(private e: FightEngine, readonly side: Side, diffId: DifficultyId, private rng: Rng) {
    this.diff = DIFFICULTIES[diffId];
    this.model = new PlayerModel(e, side);
    this.strategy = new StrategyEngine(e, side, this.diff, this.model);
    this.plan = this.strategy.evaluate();
    this.repertoire = this.buildRepertoire();
    this.circleDir = rng.chance(0.5) ? 1 : -1;
    e.bus.on((ev) => {
      // Seeing the opponent whiff (or get stuffed) is a counter opportunity — noticed after a reaction delay.
      if (ev.type === 'strikeMissed' && ev.side !== this.side && e.mode === 'stand') {
        const at = e.time + this.reactionDelay();
        if (this.rng.chance(this.diff.counterRate * (0.6 + this.plan.counterBias * 0.6))) this.whiffCounterAt = at;
      }
    });
  }

  private whiffCounterAt = -1;
  private lastDecisionInterval = 0.3;

  private get me() {
    return this.e.f[this.side];
  }
  private get op() {
    return this.e.f[this.side === 0 ? 1 : 0];
  }

  private buildRepertoire(): ComboDef[] {
    const d = this.me.data;
    const T = d.tendencies;
    const ids = new Set<string>([...ARCHETYPES[d.archetype].combos, ...GENERIC]);
    if (T.spinning > 0.15) {
      ids.add('spin');
      ids.add('sbk');
    }
    if (T.kicks > 0.35) {
      ids.add('headkick');
      ids.add('jab-bodykick');
    }
    if (d.archetype === 'muayThai' || T.clinch > 0.5) ids.add('knee');
    if (T.legKicks > 0.6) ids.add('calf');
    const list = [...ids].map((id) => COMBO_BY_ID[id]).filter(Boolean);
    for (const sig of d.signatureTechniques) {
      if (STRIKES[sig]?.context === 'stand') list.push({ id: 'sig-' + sig, name: STRIKES[sig].name, seq: [sig] });
    }
    return list;
  }

  // =================================================================== tick
  update(dt: number): Command {
    const e = this.e;
    const cmd = emptyCommand();
    if (e.status !== 'fighting') return cmd;
    if (e.round !== this.roundSeen) {
      this.roundSeen = e.round;
      this.strategy.reviewRound();
      this.planT = 0;
    }
    this.model.observe(dt);
    this.perceive();
    this.planT -= dt;
    if (this.planT <= 0) {
      this.plan = this.strategy.evaluate();
      this.planT = 1.2 + this.rng.next() * 0.6;
    }
    this.guardT -= dt;
    this.decideT -= dt;

    const ctx = e.context(this.side);
    switch (ctx) {
      case 'down':
        this.mashT -= dt;
        if (this.mashT <= 0) {
          cmd.actions.push({ type: 'getup' });
          this.mashT = 0.12 + (1 - this.diff.groundIQ) * 0.35 + this.rng.next() * 0.1;
        }
        return cmd;
      case 'subAttack':
      case 'subDefend':
        this.subTactics(cmd);
        return cmd;
      case 'standingOverDowned':
        this.overDowned(cmd);
        break;
      case 'stand':
        this.react(cmd);
        this.standTactics(cmd, dt);
        break;
      case 'clinch':
        this.react(cmd);
        this.clinchTactics(cmd);
        break;
      case 'groundTop':
      case 'groundBottom':
        this.react(cmd);
        this.groundTactics(cmd, ctx === 'groundTop');
        break;
    }
    if (this.guardT > 0 && cmd.guard === 'none') cmd.guard = this.guardType;
    return cmd;
  }

  // ============================================================ perception
  private reactionDelay(telegraph = 1) {
    const d = this.diff;
    let r = d.reaction + this.rng.gauss() * d.reactionJitter;
    r /= telegraph;
    if (this.me.rockedT > 0) r *= 1.45;
    r *= 1 + (1 - staminaFrac(this.me)) * 0.25;
    return Math.max(0.14, r);
  }

  private perceive() {
    const e = this.e;
    const op = this.op;
    const act = op.action;
    this.history.push({
      t: e.time, kind: act?.kind ?? 'none', id: act?.kind === 'strike' ? act.id : act?.kind === 'shot' ? act.variant : '',
      phase: act && 't' in act ? act.t : 0, guard: op.guard,
    });
    if (this.history.length > 90) this.history.shift();
    if (act && act !== this.lastOppAction) {
      const tele = act.kind === 'strike' ? STRIKES[act.id].telegraph : act.kind === 'shot' ? 1.1 : 1;
      this.perceived.push({
        start: e.time,
        at: e.time + this.reactionDelay(tele), kind: act.kind, id: act.kind === 'strike' ? act.id : act.kind === 'shot' ? act.variant : '',
        feint: act.kind === 'strike' && act.feint, handled: false,
      });
    }
    this.lastOppAction = act;
    if (this.perceived.length > 12) this.perceived.shift();
  }

  /** What the opponent looked like `reaction` seconds ago. */
  private seen(): Snapshot | undefined {
    const t = this.e.time - this.diff.reaction;
    for (let i = this.history.length - 1; i >= 0; i--) if (this.history[i].t <= t) return this.history[i];
    return this.history[0];
  }

  private holdGuard(g: Guard, dur: number) {
    this.guardType = g;
    this.guardT = dur;
  }

  // ============================================================== defense
  private react(cmd: Command) {
    const e = this.e;
    const now = e.time;
    // Pattern anticipation (learned sequences)
    if (this.anticipate && now >= this.anticipate.at) {
      const s = STRIKES[this.anticipate.id];
      this.anticipate = null;
      if (s) this.defendAgainst(cmd, s, true);
    }
    for (const p of this.perceived) {
      if (p.handled || p.at > now) continue;
      p.handled = true;
      if (now - p.at > 0.25) continue; // too stale to act on
      this.onPerceived(cmd, p);
    }
    // feint follow-up: did they bite?
    if (this.feintCheck && now >= this.feintCheck.at) {
      const s = this.seen();
      const fc = this.feintCheck;
      this.feintCheck = null;
      if (s && s.guard === 'high' && fc.guard !== 'high') this.queueCombo(this.rng.pick([['bodyCross'], ['rearBodyKick'], ['calfKick'], ['leadBodyHook', 'leadHook']]));
      else if (s && s.kind === 'defense') this.queueCombo(this.rng.pick([['leadHook'], ['rearUppercut', 'leadHook'], ['cross']]));
      else if (s && s.kind === 'strike') this.queueCombo(['cross']);
    }
  }

  /** Seconds between an opponent action starting and this AI responding to it (for fairness tests). */
  readonly reactionLog: number[] = [];

  private onPerceived(cmd: Command, p: Perceived) {
    const e = this.e;
    this.reactionLog.push(e.time - p.start);
    if (this.reactionLog.length > 500) this.reactionLog.shift();
    const d = this.diff;
    const ctx = e.context(this.side);
    const A = this.me.data.attributes;
    if (p.kind === 'strike') {
      const s = STRIKES[p.id];
      if (!s) return;
      // exploit: counter straight over a habitual jab
      if (ctx === 'stand' && (p.id === 'jab' || p.id === 'bodyJab') && this.model.jabRate > 0.3 && this.rng.chance(d.learning * d.counterRate * 0.8)) {
        this.queue = ['cross'];
        this.queueExpire = e.time + 0.4;
        return;
      }
      this.defendAgainst(cmd, s, false);
      // learned follow-up
      if (d.learning > 0.3) {
        const pr = this.model.predictNext(p.id);
        if (pr && pr.n >= 3 && pr.p > 0.5 && this.rng.chance(d.learning * pr.p)) this.anticipate = { at: e.time + 0.22, id: pr.id };
      }
      return;
    }
    if (p.kind === 'shot') {
      const pr = d.defenseSkill * (0.45 + A.takedownDefense / 180) * fatigueFactor(this.me);
      if (this.rng.chance(pr)) this.holdGuard('low', 0.6);
      return;
    }
    if (p.kind === 'clinchEntry' && ctx === 'stand' && this.plan.clinchDesire < 0.4 && this.rng.chance(d.defenseSkill)) {
      cmd.actions.push({ type: 'defend', move: this.rng.chance(0.5) ? 'pull' : 'sidestep', dir: this.circleDir });
      return;
    }
    if ((p.kind === 'transition' || p.kind === 'getup') && (ctx === 'groundTop' || ctx === 'groundBottom')) {
      if (this.rng.chance(d.groundIQ * 0.85)) this.holdGuard('low', 0.8);
    }
  }

  private defendAgainst(cmd: Command, s: StrikeDef, anticipated: boolean) {
    const e = this.e;
    const d = this.diff;
    const ctx = e.context(this.side);
    const A = this.me.data.attributes;
    if (s.context !== 'stand') {
      // clinch / ground: cover up
      if (this.rng.chance(d.defenseSkill * 0.75)) this.holdGuard(s.target === 'head' ? 'high' : 'low', 0.45);
      return;
    }
    if (ctx !== 'stand') return;
    const dist = e.distance();
    const reach = (s.kind === 'punch' || s.kind === 'elbow' ? punchReach(this.op) : kickReach(this.op)) * s.reach;
    if (dist > reach + 0.35) return;
    const pReact = d.defenseSkill * (0.55 + A.defense / 220) * fatigueFactor(this.me) * (anticipated ? 1.1 : 1);
    if (!this.rng.chance(pReact)) return;
    const right = this.rng.chance(d.defenseChoice);
    const cb = this.plan.counterBias;
    let resp: DefenseMove | Guard | null;
    if (!right) resp = this.rng.pick<DefenseMove | Guard>(['slip', 'duck', 'high', 'low', 'none']);
    else if (s.target === 'leg') {
      // checking improves as the AI learns the opponent loves leg kicks, and once its own leg is hurt
      const learnt = d.learning * Math.min(1, this.model.legKickRate * 2.5) + Math.min(0.4, this.me[leadLegKey(this.me)] / 150) * d.adaptation;
      resp = this.rng.chance(0.3 + A.defense / 250 + learnt) ? 'low' : this.rng.chance(0.4) ? 'pull' : 'none';
    }
    else if (s.target === 'body') resp = this.rng.chance(0.75) ? 'low' : 'pull';
    else {
      switch (s.arc) {
        case 'straight': resp = this.rng.chance(0.25 + cb * 0.45) ? 'slip' : this.rng.chance(0.3) ? 'pull' : 'high'; break;
        case 'hook': resp = this.rng.chance(0.2 + cb * 0.4) ? 'duck' : 'high'; break;
        case 'upper': resp = this.rng.chance(0.5) ? 'pull' : 'high'; break;
        case 'overhand': resp = this.rng.chance(0.4) ? 'high' : this.rng.chance(0.5) ? 'duck' : 'pull'; break;
        case 'headKick': resp = this.rng.chance(0.3) ? 'high' : this.rng.chance(0.55) ? 'duck' : 'pull'; break;
        case 'spin': resp = 'pull'; break;
        default: resp = this.rng.chance(0.6) ? 'high' : 'pull';
      }
    }
    if (resp === 'none' || resp === null) return;
    if (resp === 'high' || resp === 'low') {
      this.holdGuard(resp, 0.45);
      if (this.rng.chance(d.counterRate * (0.3 + cb * 0.5))) this.queueCounter('block', 0.12);
      return;
    }
    cmd.actions.push({ type: 'defend', move: resp, dir: this.circleDir });
    if (this.rng.chance(d.counterRate * (0.5 + cb * 0.6))) this.queueCounter(resp, 0.05);
  }

  private queueCounter(after: DefenseMove | 'block', delay: number) {
    const opts: Record<string, string[][]> = {
      slip: [['cross'], ['leadHook'], ['cross', 'leadHook']],
      duck: [['leadHook'], ['rearUppercut'], ['leadHook', 'cross']],
      pull: [['cross'], ['jab', 'cross'], ['rearLegKick']],
      sidestep: [['leadHook'], ['cross'], ['rearBodyKick']],
      block: [['leadHook'], ['cross'], ['jab', 'cross']],
    };
    this.queue = [...this.rng.pick(opts[after])];
    this.queueExpire = this.e.time + 0.6 + delay;
  }

  private queueCombo(seq: string[]) {
    this.queue = [...seq];
    this.queueExpire = this.e.time + 0.9;
  }

  // ============================================================= standing
  private standTactics(cmd: Command, dt: number) {
    const e = this.e;
    const me = this.me;
    const op = this.op;
    const d = this.diff;
    const plan = this.plan;
    const dist = e.distance();
    const toOp = vnorm(vsub(op.pos, me.pos));
    const lat = { x: -toOp.z, z: toOp.x };

    // ---- punish a whiff
    if (this.whiffCounterAt > 0 && e.time >= this.whiffCounterAt) {
      this.whiffCounterAt = -1;
      if (e.time - e.lastMiss[op.side] < 0.7 && dist < punchReach(me) + 0.3) {
        this.queue = [...this.rng.pick([['cross'], ['leadHook'], ['cross', 'leadHook'], ['rearLegKick']])];
        this.queueExpire = e.time + 0.5;
      }
    }
    // ---- execute queued strikes (combos / counters)
    if (this.queue.length && e.time > this.queueExpire) this.queue = [];
    let wantRange = plan.range;
    if (this.queue.length) {
      const s = STRIKES[this.queue[0]];
      const reach = (s.kind === 'punch' || s.kind === 'elbow' ? punchReach(me) : kickReach(me)) * s.reach;
      wantRange = reach * 0.85;
      const sloppy = dist <= reach + 0.9 && this.rng.chance(d.mistakeRate * 0.08);
      if ((dist <= reach + 0.05 || sloppy) && e.strikes.canStrike(me).ok) {
        cmd.actions.push({ type: 'strike', id: this.queue.shift()! });
        this.queueExpire = e.time + 0.7;
        // mid-combo discipline: stop if the opponent is shelled up and we're tiring
        if (this.queue.length && d.staminaMgmt > 0.6 && staminaFrac(me) < 0.25) this.queue = [];
      }
    }

    // ---- offense decision
    if (this.decideT <= 0 && !this.queue.length && !me.action) {
      this.lastDecisionInterval = d.decisionInterval - this.decideT;
      this.decideT = d.decisionInterval * this.rng.range(0.7, 1.3);
      this.decideOffense(cmd, dist);
    }

    // ---- stance switch to protect a damaged lead leg
    const lead = me[leadLegKey(me)];
    if (lead > 40 && !me.action && this.rng.chance(0.004 * (me.data.tendencies.switchStance + d.adaptation))) cmd.actions.push({ type: 'switchStance' });

    // ---- default guard
    const threat = Math.max(punchReach(op), kickReach(op)) + 0.2;
    // Against a habitual leg kicker, smart fighters keep the lead leg ready to check at kicking range.
    if (this.guardT <= 0 && !this.queue.length && !me.action && dist < kickReach(op) + 0.2 && dist > punchReach(op) && this.model.legKickRate > 0.25 && this.rng.chance(d.learning * 0.05)) this.holdGuard('low', 0.35);
    // Guard discipline: good fighters keep their hands up whenever they're in range and not punching.
    if (this.guardT <= 0 && !this.queue.length && dist < threat && !me.action && this.rng.chance((plan.guardBias + 0.3) * d.defenseSkill * d.defenseSkill * 0.35)) this.holdGuard('high', 0.45 + this.rng.next() * 0.5);

    // ---- footwork
    let fwd = clamp((dist - wantRange) * 1.6, -1, 1);
    if (plan.pressure > 0.6 && dist > wantRange) fwd = Math.max(fwd, 0.6);
    this.circleT -= dt;
    if (this.circleT <= 0) {
      this.circleT = 1.5 + this.rng.next() * 2.5;
      if (this.rng.chance(0.35)) this.circleDir = -this.circleDir;
    }
    let side = this.circleDir * (0.25 + me.data.tendencies.movement * 0.55) * (1 - plan.pressure * 0.6);
    // Cage craft
    const cd = cageDistance(me.pos);
    if (cd < 1.3 && d.cageIQ > 0) {
      const n = nearestCageNormal(me.pos);
      // circle along the fence toward the side with more room rather than backing into it
      const tangentDir = lat.x * -n.z + lat.z * n.x >= 0 ? 1 : -1;
      const toCentre = -(me.pos.x * lat.x + me.pos.z * lat.z) >= 0 ? 1 : -1;
      this.circleDir = tangentDir * toCentre > 0 ? this.circleDir : toCentre;
      side = this.circleDir * (0.6 + 0.4 * d.cageIQ);
      if (fwd < 0) fwd *= 1 - d.cageIQ * 0.8;
    }
    if (plan.pressure > 0.5 && d.cageIQ > 0.3) {
      // cut off the cage: mirror the opponent's lateral movement
      const opLat = op.vel.x * lat.x + op.vel.z * lat.z;
      side = side * 0.3 + clamp(opLat * 0.7, -1, 1) * d.cageIQ;
    }
    if (me.rockedT > 0) {
      // survival instincts scale with fight IQ: veterans cover up and move, novices stand and swing
      const iq = d.defenseSkill;
      fwd = fwd * (1 - iq) + Math.min(fwd, -0.6) * iq;
      side = side * (1 - iq) + this.circleDir * iq;
      if (this.guardT <= 0 && this.rng.chance(iq * 0.25)) this.holdGuard('high', 0.5);
    }
    // sloppy footwork on low difficulties
    this.moveNoiseT -= dt;
    if (this.moveNoiseT <= 0) {
      this.moveNoiseT = 0.5;
      const n = 1 - d.rangeDiscipline;
      this.moveNoise = { x: this.rng.gauss() * n * 0.5, z: this.rng.gauss() * n * 0.5 };
    }
    cmd.move = {
      x: toOp.x * fwd + lat.x * side + this.moveNoise.x,
      z: toOp.z * fwd + lat.z * side + this.moveNoise.z,
    };
    if (cd < 1.3 && d.cageIQ > 0) {
      const n = nearestCageNormal(me.pos);
      cmd.move.x -= n.x * 0.4 * d.cageIQ;
      cmd.move.z -= n.z * 0.4 * d.cageIQ;
    }
    const l = Math.hypot(cmd.move.x, cmd.move.z);
    if (l > 1) cmd.move = { x: cmd.move.x / l, z: cmd.move.z / l };
    if (this.guardT > 0) cmd.guard = this.guardType;
  }

  private decideOffense(cmd: Command, dist: number) {
    const e = this.e;
    const me = this.me;
    const op = this.op;
    const d = this.diff;
    const plan = this.plan;
    const gassed = me.stamina < 10 + d.staminaMgmt * 12;
    if (gassed && this.rng.chance(d.staminaMgmt)) return;
    // Output is a rate (attacks per second) set by the fighter's volume, not by how fast the AI thinks.
    let rate = (0.08 + 0.4 * plan.aggression) * (1 - plan.counterBias * 0.3);
    const seen = this.seen();
    const oppBusy = !!seen && (seen.kind === 'strike' || seen.kind === 'recover' || seen.kind === 'stun');
    // Smart fighters pick their moments: attack into recoveries, be patient against a set, guarded opponent.
    const timing = d.planIQ;
    if (seen && (seen.kind === 'recover' || seen.kind === 'stun')) rate += 1.5 * timing * staminaFrac(me);
    else if (seen && seen.kind === 'strike') rate *= 1 - 0.7 * timing; // don't walk into a combo
    else if (seen && seen.guard === 'high' && seen.kind === 'none') rate *= 1 - 0.3 * timing;
    if (op.rockedT > 0 || op.down) rate = 1.2 + 1.3 * d.planIQ;
    rate *= 1 + d.mistakeRate; // sloppy fighters overcommit
    // gas-tank discipline: smart fighters throttle their output when the tank runs low
    if (me.stamina < plan.staminaReserve) rate *= 1 - d.staminaMgmt * (1 - me.stamina / plan.staminaReserve) * 0.7;
    const interval = this.lastDecisionInterval;
    if (!this.rng.chance(1 - Math.exp(-rate * interval))) return;
    const oppNearCage = cageDistance(op.pos) < 1.0;
    const options: Array<[string, number]> = [['strike', 1]];
    if (dist < 2.1 && plan.tdDesire > 0.02) {
      let w = plan.tdDesire * 0.32 * (0.5 + staminaFrac(me) * 0.6);
      if (oppBusy) w *= 1 + 2 * d.planIQ;
      if (oppNearCage) w *= 1 + 0.6 * d.cageIQ;
      options.push(['takedown', w]);
    }
    if (dist < 1.35 && plan.clinchDesire > 0.1) options.push(['clinch', plan.clinchDesire * 0.28 * (oppNearCage ? 1.4 : 1)]);
    if (plan.feint > 0 && op.rockedT <= 0) options.push(['feint', plan.feint * 0.5]);
    const choice = this.rng.weighted(options, (o) => o[1])![0];
    if (choice === 'takedown') {
      const A = me.data.attributes;
      const variant = this.model.kickRate > 0.4 && this.rng.chance(0.4) ? 'single' : A.clinch > 80 && dist < 1.2 ? 'trip' : 'double';
      cmd.actions.push({ type: 'takedown', variant });
      return;
    }
    if (choice === 'clinch') {
      cmd.actions.push({ type: 'clinch' });
      return;
    }
    if (choice === 'feint') {
      const id = this.rng.pick(['jab', 'cross', 'rearHeadKick', 'overhand', 'rearLegKick']);
      cmd.actions.push({ type: 'feint', id });
      if (d.traps) this.feintCheck = { at: e.time + 0.35 + d.reaction, guard: op.guard };
      return;
    }
    const combo = this.pickCombo(dist);
    if (combo) {
      this.queueCombo(this.retarget(combo.seq));
      this.lastCombo = combo.id;
    }
  }

  /** Re-aim a combo at the body/legs according to the plan's target weights (and signature kicks). */
  private retarget(seq: string[]): string[] {
    const t = this.plan.targets;
    const tsum = t.head + t.body + t.leg;
    const pBody = (t.body / tsum) * 0.7;
    const pLeg = (t.leg / tsum) * 1.1;
    const BODY: Record<string, string> = { jab: 'bodyJab', cross: 'bodyCross', leadHook: 'leadBodyHook', rearHook: 'rearBodyHook' };
    const out = seq.map((id, i) => (i > 0 || seq.length === 1) && BODY[id] && this.rng.chance(pBody) ? BODY[id] : id);
    const last = STRIKES[out[out.length - 1]];
    if (last.kind === 'punch' && out.length < 4 && this.rng.chance(pLeg)) {
      const sig = this.me.data.signatureTechniques;
      const kick = sig.includes('calfKick') || this.rng.chance(0.3) ? 'calfKick' : sig.includes('leadLegKick') && this.rng.chance(0.5) ? 'leadLegKick' : 'rearLegKick';
      out.push(kick);
    }
    return out;
  }

  private pickCombo(dist: number): ComboDef | undefined {
    const me = this.me;
    const plan = this.plan;
    const d = this.diff;
    if (this.lastCombo && this.rng.chance((1 - d.comboVariety) * 0.5)) {
      const c = this.repertoire.find((x) => x.id === this.lastCombo);
      if (c) return c;
    }
    const pR = punchReach(me);
    const kR = kickReach(me);
    const tsum = plan.targets.head + plan.targets.body + plan.targets.leg;
    const scored = this.repertoire.map((c) => {
      const first = STRIKES[c.seq[0]];
      const reach = (first.kind === 'punch' || first.kind === 'elbow' ? pR : kR) * first.reach;
      if (dist > reach + 0.8) return { c, w: 0 };
      let w = c.id.startsWith('sig-') ? 1.4 : 1;
      let kicks = 0;
      let tgt = 0;
      let power = 0;
      for (const id of c.seq) {
        const s = STRIKES[id];
        if (s.kind === 'kick') kicks++;
        tgt += plan.targets[s.target] / tsum;
        if (s.arc === 'spin' || s.arc === 'headKick' || s.id === 'overhand' || s.id === 'flyingKnee') power++;
      }
      tgt /= c.seq.length;
      const kf = kicks / c.seq.length;
      w *= tgt * 3;
      w *= 1 - kf + kf * plan.kickRate * 2.2;
      if (power) w *= 0.5 + plan.risk;
      if (c.seq.some((id) => STRIKES[id].arc === 'spin')) w *= me.data.tendencies.spinning * 3;
      // volume fighters like longer combos, snipers like single shots
      w *= 1 + (c.seq.length - 1.5) * (me.data.tendencies.volume - 0.5) * 0.8;
      if (dist > reach + 0.05) w *= 0.6; // needs a step in
      return { c, w: Math.max(0, w) };
    });
    const sharpen = 1 + (1 - d.comboVariety) * 3;
    return this.rng.weighted(scored, (s) => Math.pow(s.w, sharpen))?.c;
  }

  // =============================================================== downed
  private overDowned(cmd: Command) {

    const op = this.op;
    const me = this.me;
    const down = op.down!;
    if (this.pounceDecided !== op.knockdowns) {
      this.pounceDecided = op.knockdowns;
      const T = me.data.tendencies;
      const p = 0.3 + T.groundPound * 0.35 + T.takedowns * 0.2 + (down.heavy ? 0.25 : 0) + this.diff.planIQ * 0.1;
      this.pounce = this.rng.chance(clamp(p, 0.1, 0.95));
    }
    const toOp = vnorm(vsub(op.pos, me.pos));
    if (this.pounce) {
      cmd.move = toOp;
      if (vdist(me.pos, op.pos) < 1.9) cmd.actions.push({ type: 'strike', id: 'cross' });
    } else {
      cmd.move = { x: -toOp.x * 0.5, z: -toOp.z * 0.5 };
    }
  }

  // =============================================================== clinch
  private clinchTactics(cmd: Command) {
    const e = this.e;
    const me = this.me;
    const d = this.diff;
    const plan = this.plan;
    const c = e.clinch!;
    if (this.decideT > 0 || me.action) return;
    this.decideT = Math.max(0.55, d.decisionInterval * 2.5) * this.rng.range(0.8, 1.5);
    const ctrl = c.control * (this.side === 0 ? 1 : -1);
    const want = plan.clinchDesire + plan.tdDesire * 0.5;
    const T = me.data.tendencies;
    const opPinned = c.pinned === (this.side === 0 ? 1 : 0);
    const options: Array<[string, number]> = [
      ['break', (1 - want) * 1.1 + (me.rockedT > 0 ? -0.5 : 0) + (c.pinned === this.side ? 0.3 : 0)],
      ['position', (me.data.attributes.clinch / 100) * want * (ctrl < 0.4 ? 1.2 : 0.35) * d.groundIQ],
      ['takedown', 0.6 * plan.tdDesire * (ctrl > 0 ? 1.3 : 0.6) * (opPinned ? 1.4 : 1)],
      ['strike', 0.9 + T.clinch * 0.6],
    ];
    if (me.data.attributes.submissions > 80 && plan.groundGoal === 'submit') options.push(['guillotine', 0.06]);
    const pick = this.rng.weighted(options, (o) => o[1])![0];
    switch (pick) {
      case 'break': cmd.actions.push({ type: 'getup' }); break;
      case 'position': cmd.actions.push({ type: 'transition', alt: false }); break;
      case 'takedown': cmd.actions.push({ type: 'takedown', variant: 'trip' }); break;
      case 'guillotine': cmd.actions.push({ type: 'submission', index: 0 }); break;
      default: {
        const muay = me.data.archetype === 'muayThai' ? 1.8 : 1;
        const id = this.rng.weighted(
          [['clinchKneeBody', 1 * muay], ['clinchKneeHead', (ctrl > 0 ? 0.6 : 0.15) * muay], ['clinchElbow', 0.6 * muay], ['clinchPunch', 1], ['clinchBodyPunch', 0.8]] as Array<[string, number]>,
          (x) => x[1],
        )![0];
        cmd.actions.push({ type: 'strike', id });
      }
    }
    // drive the opponent into the fence
    if (ctrl > 0) {
      const op = this.op;
      const n = nearestCageNormal(op.pos);
      cmd.move = { x: n.x, z: n.z };
    }
  }

  // =============================================================== ground
  private groundTactics(cmd: Command, top: boolean) {
    const e = this.e;
    void e;
    const me = this.me;
    const op = this.op;
    const d = this.diff;
    const plan = this.plan;
    const g = e.ground!;
    if (this.decideT > 0 || me.action) return;
    this.decideT = Math.max(0.7, d.decisionInterval * 3) * this.rng.range(0.8, 1.6);
    const A = me.data.attributes;
    const role = top ? 'top' : 'bottom';
    const subs = SUBS_FROM[role][g.pos] ?? [];
    const opHurt = op.rockedT > 0 ? 1 : 0;
    const opTired = 1 - staminaFrac(op);
    const options: Array<[string, number]> = [];
    if (top) {
      const posQ: Record<string, number> = { backControl: 1.5, mount: 1.1, sideControl: 0.6, halfGuard: 0.3, turtle: 0.8, fullGuard: 0 };
      options.push(['strike', (plan.groundGoal === 'pound' ? 1.0 : 0.55) + opHurt * 1.5]);
      if (g.pos !== 'backControl') options.push(['advance', d.groundIQ * (g.pos === 'mount' ? 0.25 : 1) * (plan.groundGoal === 'submit' ? 1.3 : 0.8)]);
      if (subs.length && posQ[g.pos] >= 0.6) options.push(['sub', 0.07 * d.groundIQ * (plan.groundGoal === 'submit' ? 1 : 0.3) * posQ[g.pos] * (0.4 + opTired * 1.5 + opHurt) * (A.submissions / 90)]);
      if (plan.groundGoal === 'standup') options.push(['standup', 0.8]);
    } else {
      if (subs.length) options.push(['sub', 0.2 * Math.pow(A.submissions / 100, 2) * (g.pos === 'fullGuard' ? 1.2 : 0.35) * (plan.groundGoal === 'submit' ? 1.3 : 0.6)]);
      options.push(['escape', d.groundIQ * 0.9]);
      options.push(['getup', (plan.groundGoal === 'standup' || A.submissions < 70 ? 0.9 : 0.4) * (cageDistance(me.pos) < 1.3 ? 1.3 : 1) * d.groundIQ + 0.1]);
      options.push(['strike', 0.35]);
      options.push(['cover', 0.3 + d.defenseSkill * 0.5]);
    }
    const pick = this.rng.weighted(options, (o) => o[1])?.[0];
    switch (pick) {
      case 'strike': {
        const id = top
          ? this.rng.weighted([['gPunch', 1.2], ['gElbow', A.power > 80 || me.data.signatureTechniques.includes('gElbow') ? 1 : 0.5], ['gBodyPunch', 0.4], ['gHammer', 0.5]] as Array<[string, number]>, (x) => x[1])![0]
          : this.rng.chance(0.4) ? 'gUpElbow' : 'gUpPunch';
        cmd.actions.push({ type: 'strike', id });
        break;
      }
      case 'advance': cmd.actions.push({ type: 'transition', alt: g.pos === 'mount' || (g.pos === 'sideControl' && this.rng.chance(0.2)) }); break;
      case 'escape': cmd.actions.push({ type: 'transition', alt: false }); break;
      case 'getup':
      case 'standup': cmd.actions.push({ type: 'getup' }); break;
      case 'sub': {
        const pref = ARCHETYPES[me.data.archetype].subs.concat(me.data.signatureTechniques);
        let idx = subs.findIndex((s) => pref.includes(s));
        if (idx < 0) idx = 0;
        cmd.actions.push({ type: 'submission', index: idx });
        break;
      }
      case 'cover': this.holdGuard('high', 0.8); break;
    }
  }

  // ========================================================== submissions
  private subTactics(cmd: Command) {
    const e = this.e;
    const s = e.sub!;
    const d = this.diff;
    const prompt = s.prompts[this.side];
    if (prompt !== this.subPrompt) {
      this.subPrompt = prompt;
      this.subPressAt = e.time + d.subReaction * this.rng.range(0.75, 1.35) * (1 + (1 - staminaFrac(this.me)) * 0.3);
    }
    if (s.lockout[this.side] > 0) {
      this.subPressAt = Math.max(this.subPressAt, e.time + s.lockout[this.side] + 0.05);
      return;
    }
    if (e.time >= this.subPressAt) {
      const A = this.me.data.attributes;
      const skill = this.side === s.attacker ? A.submissions : A.submissionDefense;
      const acc = d.subAccuracy * (0.75 + skill / 400);
      cmd.subKey = this.rng.chance(acc) ? prompt : this.rng.pick((['up', 'down', 'left', 'right'] as SubKey[]).filter((k) => k !== prompt));
      this.subPressAt = e.time + d.subReaction;
    }
  }
}
