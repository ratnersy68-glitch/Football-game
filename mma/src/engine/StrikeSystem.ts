import { clamp, vdist, vnorm, vsub, wrapAngle } from '../core/math';
import { recogniseCombo, STRIKES, type Arc, type StrikeDef } from '../data';
import type { FightEngine } from './FightEngine';
import { durationMult, fatigueFactor, isDown, isRocked, kickReach, powerMult, punchReach, staminaFrac } from './FighterState';
import { TUNING } from './tuning';
import type { DefenseMove, FighterState } from './types';

/** How each defensive movement treats each strike arc on head strikes. 0 = evaded, <1 = harder to hit, >1 = walked into it. */
const EVADE: Record<DefenseMove, Partial<Record<Arc, number>>> = {
  slip: { straight: 0, overhand: 1.2, hook: 1.25, upper: 0.6, headKick: 0.8, spin: 0.6, knee: 1, elbow: 0.8 },
  duck: { straight: 0.35, overhand: 0.12, hook: 0, upper: 1.35, headKick: 0, spin: 0, knee: 1.5, elbow: 0.4 },
  pull: { straight: 0.2, overhand: 0.2, hook: 0.1, upper: 0.1, headKick: 0.25, spin: 0.2, knee: 0.3, elbow: 0.2 },
  sidestep: { straight: 0.3, overhand: 0.35, hook: 0.45, upper: 0.3, headKick: 0.4, spin: 0.3, knee: 0.4, elbow: 0.4 },
};

export const DEFENSE_DUR: Record<DefenseMove, number> = { slip: 0.4, duck: 0.45, pull: 0.36, sidestep: 0.32 };

export class StrikeSystem {
  constructor(private e: FightEngine) {}

  /** Can f begin a new strike now (possibly chaining out of a previous strike's recovery)? */
  canStrike(f: FighterState): { ok: boolean; chain: boolean } {
    const act = f.action;
    if (f.down) return { ok: false, chain: false };
    if (!act) return { ok: true, chain: this.e.time - f.lastStrikeTime < TUNING.comboWindow + 0.3 };
    if (act.kind === 'strike' && !act.feint && act.resolved) {
      const rec = act.t - act.w - act.a;
      const cancelFrac = 0.3 + f.data.attributes.speed * 0.0045;
      if (rec >= act.r * (1 - cancelFrac)) return { ok: true, chain: true };
    }
    if (act.kind === 'defense' && act.t > act.dur * 0.55) return { ok: true, chain: false };
    return { ok: false, chain: false };
  }

  start(f: FighterState, id: string, feint: boolean): boolean {
    const e = this.e;
    const s = STRIKES[id];
    if (!s) return false;
    const { ok, chain } = this.canStrike(f);
    if (!ok) return false;
    const ctx = e.strikeContext(f.side);
    if (ctx !== s.context) return false;
    const leg = s.kind === 'kick' || s.kind === 'knee';
    let mult = durationMult(f, leg);
    const chained = chain && f.comboSeq.length > 0 && !feint;
    if (chained) mult *= TUNING.comboSpeedup - f.data.attributes.speed * 0.0008;
    if (!chained) f.comboSeq = [];
    if (!feint) f.comboSeq.push(id);
    const prev = f.action;
    f.action = {
      kind: 'strike', id, t: 0, w: s.windup * mult, a: s.active, r: s.recovery * mult, resolved: false, feint,
      combo: chained && prev && prev.kind === 'strike' ? prev.combo + 1 : 0,
      counterWindow: f.counterT > 0,
    };
    f.counterT = 0;
    e.stamina.spend(f, feint ? 0.4 : s.stamina * 0.8);
    f.lastStrikeTime = e.time;
    if (!feint) e.emit({ type: 'strikeThrown', side: f.side, id });
    return true;
  }

  update(dt: number) {
    const e = this.e;
    for (const f of e.order()) {
      if (f.counterT > 0) f.counterT -= dt;
      const act = f.action;
      if (!act) continue;
      if (act.kind === 'strike') {
        act.t += dt;
        if (act.feint && act.t >= act.w * 0.6) {
          f.action = null;
          e.emit({ type: 'feint', side: f.side, id: act.id });
          continue;
        }
        if (!act.resolved && act.t >= act.w) {
          act.resolved = true;
          this.resolve(f, STRIKES[act.id]);
          if (e.result) return;
        }
        if (f.action === act && act.t >= act.w + act.a + act.r) f.action = null;
      } else if (act.kind === 'defense' || act.kind === 'stun' || act.kind === 'recover') {
        act.t += dt;
        if (act.t >= act.dur) f.action = null;
      }
    }
  }

  startDefense(f: FighterState, move: DefenseMove, dir: number) {
    const e = this.e;
    if (e.mode !== 'stand' || f.down) return false;
    if (f.action && !(f.action.kind === 'defense' && f.action.t > f.action.dur * 0.6) && !(f.action.kind === 'strike' && f.action.resolved && f.action.t > f.action.w + f.action.a + f.action.r * 0.5)) return false;
    const mult = 0.85 + (1 - staminaFrac(f)) * 0.3 + (isRocked(f) ? 0.25 : 0);
    f.action = { kind: 'defense', move, t: 0, dur: DEFENSE_DUR[move] * mult, dir: dir || 1 };
    e.stamina.spend(f, move === 'pull' || move === 'sidestep' ? 0.7 : 0.8);
    return true;
  }

  private defenseFactor(d: FighterState, s: StrikeDef): { factor: number; move: DefenseMove | null } {
    const act = d.action;
    if (!act || act.kind !== 'defense') return { factor: 1, move: null };
    const live = act.t <= act.dur * 0.82;
    if (!live) return { factor: 1, move: null };
    if (act.move === 'sidestep') return { factor: s.target === 'leg' ? 0.5 : EVADE.sidestep[s.arc] ?? 0.4, move: 'sidestep' };
    if (s.target !== 'head') {
      if (act.move === 'pull') return { factor: s.target === 'body' ? 0.55 : 0.8, move: 'pull' };
      return { factor: act.move === 'duck' && s.arc === 'knee' ? 1.4 : 1, move: null };
    }
    return { factor: EVADE[act.move][s.arc] ?? 1, move: act.move };
  }

  resolve(a: FighterState, s: StrikeDef) {
    const e = this.e;
    const d = e.f[a.side === 0 ? 1 : 0];
    const A = a.data.attributes;
    const D = d.data.attributes;
    let hitChance = TUNING.baseHitChance + s.accuracy + (A.accuracy - 60) * 0.004 + (A.striking - 60) * 0.0015;
    let dmgMult = 1;
    let punish = 1;
    let counter: '' | 'timed' | 'whiff' = '';

    if (s.context === 'stand') {
      if (e.mode !== 'stand' || isDown(d)) return this.miss(a, s, null);
      const dist = vdist(a.pos, d.pos);
      const reach = (s.kind === 'punch' || s.kind === 'elbow' ? punchReach(a) : kickReach(a)) * s.reach;
      const pullBonus = d.action?.kind === 'defense' && d.action.move === 'pull' && d.action.t < d.action.dur * 0.85 ? 0.45 : 0;
      if (dist - pullBonus > reach + 0.12) {
        return this.miss(a, s, pullBonus > 0 && dist <= reach + 0.12 ? 'pull' : null);
      }
      const toD = vnorm(vsub(d.pos, a.pos));
      if (Math.abs(wrapAngle(Math.atan2(toD.z, toD.x) - a.facing)) > 1.1) return this.miss(a, s, null);
      if (s.kind === 'kick' && dist < reach * 0.45) dmgMult *= 0.55; // smothered
      // Angle: defender still turning to face the attacker
      const toA = Math.atan2(-toD.z, -toD.x);
      const offAngle = Math.abs(wrapAngle(toA - d.facing));
      if (offAngle > 0.45) hitChance += 0.12 + Math.min(0.15, (offAngle - 0.45) * 0.3);
      // Lateral movement makes you harder to hit
      const lateral = Math.abs(d.vel.x * -toD.z + d.vel.z * toD.x);
      hitChance -= Math.min(0.1, lateral * 0.04) * (D.defense / 80);
      hitChance += (A.speed - D.speed) * 0.0015;
    } else if (s.context === 'clinch') {
      if (e.mode !== 'clinch' || !e.clinch) return this.miss(a, s, null);
      const ctrl = e.clinch.control * (a.side === 0 ? 1 : -1);
      hitChance += 0.12 + (A.clinch - D.clinch) * 0.005 + ctrl * 0.12;
      if (s.id === 'clinchKneeHead' && ctrl < 0) hitChance -= 0.2;
    } else {
      if (e.mode !== 'ground' || !e.ground) return this.miss(a, s, null);
      const top = e.ground.top === a.side;
      hitChance += 0.02 + (top ? (A.groundControl - D.groundControl) * 0.004 : -0.08);
      dmgMult *= top ? POS_DAMAGE[e.ground.pos] : e.ground.pos === 'fullGuard' ? 1 : 0.45;
      if (top && e.ground.pos === 'fullGuard') hitChance -= (D.submissions - 60) * 0.003; // active guard ties up posture
    }

    // Defensive movement (standing only)
    if (s.context === 'stand') {
      const df = this.defenseFactor(d, s);
      if (df.move && df.factor === 0) {
        d.counterT = 0.6;
        return this.miss(a, s, df.move);
      }
      if (df.factor < 1) hitChance *= df.factor + (1 - df.factor) * 0.25;
      else if (df.factor > 1) punish = df.factor;
    }

    // Counters: landing while the opponent is mid-strike or recovering from a whiff
    const dAct = d.action;
    const myAct = a.action;
    if (dAct?.kind === 'strike' && !dAct.feint) {
      // A true counter: we started *after* they did and still landed first.
      const startedAfter = myAct?.kind === 'strike' && myAct.t < dAct.t;
      if (dAct.t < dAct.w + dAct.a && startedAfter) counter = 'timed';
      else if (e.lastMiss[d.side] > e.time - 0.6) counter = 'whiff';
    } else if (dAct?.kind === 'shot' && (s.arc === 'knee' || s.arc === 'upper')) {
      counter = 'timed';
      dmgMult *= 1.35;
    }
    const act = a.action;
    if (!counter && act?.kind === 'strike' && act.counterWindow) counter = 'whiff';
    if (counter === 'timed') hitChance += 0.1;
    if (counter === 'whiff') hitChance += 0.15;

    // State of both fighters
    hitChance += (1 - staminaFrac(d)) * 0.14 - (1 - staminaFrac(a)) * 0.1;
    hitChance -= (D.defense - 60) * 0.0032 * fatigueFactor(d) * (isRocked(d) ? 0.5 : 1);
    if (isRocked(d)) hitChance += 0.12;
    if (isRocked(a)) hitChance -= 0.12;
    if (dAct?.kind === 'stun') hitChance += 0.22;
    if (d.swelling > 12 && s.target === 'head') hitChance += Math.min(0.08, (d.swelling - 12) * 0.006);
    if (e.cfg.fighters[a.side].signatureTechniques.includes(s.id)) hitChance += 0.04;

    hitChance += (a.form - d.form) * 0.8;

    // Blocking
    let blocked = false;
    let checked = false;
    if (d.guard === 'high' && s.target === 'head' && !(s.arc === 'upper' && e.rng.chance(0.5)) && !(s.arc === 'knee' && e.rng.chance(0.35))) blocked = true;
    if (d.guard === 'low' && s.target !== 'head') {
      blocked = true;
      checked = s.target === 'leg';
    }
    if (d.down || (dAct && dAct.kind !== 'defense' && dAct.kind !== 'strike' && s.context === 'stand' && dAct.kind !== 'stun')) blocked = false;

    hitChance = clamp(hitChance, 0.06, 0.95);
    if (!blocked && !e.rng.chance(hitChance)) return this.miss(a, s, null);

    // Damage
    const weightRatio = clamp(Math.pow(a.data.weightLbs / d.data.weightLbs, 0.6), 0.6, 1.5);
    let dmg = s.damage * powerMult(a) * a.form * (0.55 + 0.45 * fatigueFactor(a)) * dmgMult * weightRatio * e.rng.range(0.85, 1.15);
    if (s.kind === 'kick') dmg *= 1 - Math.max(a.legL, a.legR) * 0.003;
    if (counter === 'timed') dmg *= 1.3;
    else if (counter === 'whiff') dmg *= 1.15;
    dmg *= punish;
    if (e.cfg.fighters[a.side].signatureTechniques.includes(s.id)) dmg *= 1.08;
    const flush = !blocked && e.rng.chance(0.04 + (A.accuracy - 60) * 0.0015 + (counter ? 0.1 : 0) + (isRocked(d) ? 0.06 : 0));
    if (flush) dmg *= 1.25;

    if (blocked) {
      let leak = 0.12 + (1 - D.defense / 100) * 0.15 + (1 - staminaFrac(d)) * 0.1;
      if (s.arc === 'headKick') leak = 0.32;
      if (s.id === 'calfKick') leak = 0.4;
      if (isRocked(d)) leak *= 1.8;
      e.stamina.spend(d, dmg * 0.12);
      if (checked && (s.id === 'rearLegKick' || s.id === 'leadLegKick')) {
        // shin-on-shin: the kicker pays
        const kickLeg = s.limb === 'rearLeg' ? (a.stance === 'orthodox' ? 'legR' : 'legL') : a.stance === 'orthodox' ? 'legL' : 'legR';
        a[kickLeg] += dmg * 0.35;
        a.action = { kind: 'stun', t: 0, dur: 0.25 };
      }
      e.damage.applyHit(a, d, s, { dmg: dmg * leak, counter: '', flush: false, blocked: true, punish: 1 });
      e.emit({ type: 'strikeBlocked', side: a.side, id: s.id, checked });
      return;
    }

    e.lastLanded[a.side] = e.time;
    a.lastLandedT = e.time;
    const combo = a.comboSeq.length >= 2 ? recogniseCombo(a.comboSeq)?.name ?? null : null;
    const big = dmg >= 7 || flush || counter === 'timed';
    e.emit({ type: 'strikeLanded', side: a.side, id: s.id, dmg, target: s.target, counter, flush, combo, big });
    e.damage.applyHit(a, d, s, { dmg, counter, flush, blocked: false, punish });
    if (e.result) return;

    // Hit reaction: stagger and interrupt
    if (!d.down && (e.mode as string) !== 'sub') {
      const heavy = dmg >= 5 || (s.target === 'head' && dmg >= 4.2);
      if (d.action?.kind === 'strike' && !d.action.resolved && heavy) {
        d.action = { kind: 'stun', t: 0, dur: 0.12 + dmg * 0.02 };
      } else if (!d.action && dmg >= 5) {
        d.action = { kind: 'stun', t: 0, dur: 0.08 + dmg * 0.012 };
      } else if (d.action?.kind === 'shot' && counter === 'timed') {
        d.action = { kind: 'stun', t: 0, dur: 0.4 };
      }
      if (s.context === 'stand' && e.mode === 'stand') {
        const dir = vnorm(vsub(d.pos, a.pos));
        const kb = s.knockback * (0.6 + dmg / 8);
        d.pos.x += dir.x * kb;
        d.pos.z += dir.z * kb;
      }
    }
    if (e.mode === 'ground' && e.ground) e.ground.lastAction = e.roundTime;
    if (e.mode === 'clinch' && e.clinch) e.clinch.lastAction = e.roundTime;
  }

  private miss(a: FighterState, s: StrikeDef, evaded: string | null) {
    const e = this.e;
    e.stamina.spend(a, s.stamina * (TUNING.missStaminaMult - 1));
    e.lastMiss[a.side] = e.time;
    e.emit({ type: 'strikeMissed', side: a.side, id: s.id, evaded });
  }
}

const POS_DAMAGE: Record<string, number> = {
  fullGuard: 0.55, halfGuard: 0.75, sideControl: 0.85, mount: 1.2, backControl: 0.95, turtle: 0.9,
};
