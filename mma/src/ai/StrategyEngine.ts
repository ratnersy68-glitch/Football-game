import { clamp, clamp01 } from '../core/math';
import type { FightEngine } from '../engine/FightEngine';
import { kickReach, punchReach, staminaFrac, worstLeg } from '../engine/FighterState';
import { JudgeSystem } from '../engine/JudgeSystem';
import { cageDistance } from '../engine/Octagon';
import type { Side } from '../engine/types';
import type { DifficultyProfile } from './Difficulty';
import type { PlayerModel } from './PlayerModel';

export type GroundGoal = 'pound' | 'submit' | 'control' | 'standup';
export type StrategyMode = 'default' | 'wrestle' | 'pressure' | 'counter' | 'kick' | 'body';

export interface GamePlan {
  range: number;          // preferred distance (m)
  aggression: number;     // how readily to initiate (0-1)
  pressure: number;       // walk forward / cut off the cage
  counterBias: number;
  targets: { head: number; body: number; leg: number };
  kickRate: number;
  tdDesire: number;
  clinchDesire: number;
  groundGoal: GroundGoal;
  risk: number;
  feint: number;
  guardBias: number;      // how much to keep the hands up by default
  staminaReserve: number;
  mode: StrategyMode;
  notes: string[];
}

interface Matchup {
  strikeEdge: number;
  wrestleEdge: number;   // my takedown offence vs their defence
  defendEdge: number;    // my takedown defence vs their offence
  groundEdge: number;
  subEdge: number;
  reachAdv: number;      // metres
  powerEdge: number;
}

const strikeComposite = (a: any) => a.striking * 0.45 + a.accuracy * 0.25 + a.speed * 0.15 + a.defense * 0.15;

/**
 * The fight strategy engine: turns style, matchup, damage, stamina, score and observed opponent
 * habits into a game plan the tactical controller executes.
 */
export class StrategyEngine {
  readonly matchup: Matchup;
  mode: StrategyMode = 'default';
  private roundResults: number[] = [];

  constructor(private e: FightEngine, private side: Side, private diff: DifficultyProfile, private model: PlayerModel) {
    const me = e.f[side].data.attributes;
    const op = e.f[side === 0 ? 1 : 0].data.attributes;
    this.matchup = {
      strikeEdge: strikeComposite(me) - strikeComposite(op),
      wrestleEdge: me.takedowns * 0.6 + me.wrestling * 0.4 - (op.takedownDefense * 0.8 + op.wrestling * 0.2),
      defendEdge: me.takedownDefense * 0.8 + me.wrestling * 0.2 - (op.takedowns * 0.6 + op.wrestling * 0.4),
      groundEdge: me.groundControl * 0.6 + me.submissions * 0.4 - (op.groundControl * 0.6 + op.submissions * 0.4),
      subEdge: me.submissions - op.submissionDefense,
      reachAdv: (e.f[side].data.reachIn - e.f[side === 0 ? 1 : 0].data.reachIn) * 0.0254,
      powerEdge: me.power - op.power,
    };
  }

  /** Between-round review. Adaptive AIs change strategy when a round is going the wrong way. */
  reviewRound() {
    const e = this.e;
    const r = e.stats.rounds[e.round - 1];
    if (!r) return;
    const est = JudgeSystem.estimateRound(r) * (this.side === 0 ? 1 : -1);
    this.roundResults.push(est);
    if (!e.rng.chance(this.diff.adaptation)) return;
    const mine = r[this.side];
    const theirs = r[this.side === 0 ? 1 : 0];
    const m = this.matchup;
    if (est < -5) {
      // losing: pick the most promising alternative
      const striking = mine.damageDealt - theirs.damageDealt;
      const tdRate = mine.tdAttempted ? mine.tdLanded / mine.tdAttempted : 0.5;
      const options: Array<[StrategyMode, number]> = [
        ['wrestle', (m.wrestleEdge > -5 ? 1 : 0.2) * (tdRate + 0.3) * (striking < 0 ? 1.5 : 0.8)],
        ['pressure', (m.strikeEdge > -8 ? 0.9 : 0.4) + (theirs.aggression > mine.aggression ? 0.4 : 0)],
        ['counter', this.model.pressureRate > 0.3 ? 1.1 : 0.4],
        ['kick', m.reachAdv > 0 ? 0.8 : 0.5],
        ['body', this.model.highGuardRate > 0.3 ? 1.2 : 0.5],
      ];
      options.sort((a, b) => b[1] - a[1]);
      const pick = options.find((o) => o[0] !== this.mode) ?? options[0];
      this.mode = pick[0];
    } else if (est > 10 && this.mode !== 'default') {
      // it's working: keep it
    }
  }

  evaluate(): GamePlan {
    const e = this.e;
    const d = this.diff;
    const me = e.f[this.side];
    const op = e.f[this.side === 0 ? 1 : 0];
    const T = me.data.tendencies;
    const A = me.data.attributes;
    const m = this.matchup;
    const iq = d.planIQ;
    const notes: string[] = [];
    const tdAbility = clamp01((A.takedowns * 0.6 + A.wrestling * 0.4 - 45) / 40);

    const pR = punchReach(me);
    const kR = kickReach(me);
    const plan: GamePlan = {
      range: 0,
      aggression: 0.3 + T.volume * 0.55,
      pressure: T.pressure,
      counterBias: T.counter,
      targets: { head: 1, body: 0.35 + T.bodyWork * 1.3, leg: 0.25 + T.legKicks * 0.5 + T.kicks * T.legKicks * 2.2 },
      kickRate: T.kicks,
      tdDesire: T.takedowns,
      clinchDesire: T.clinch,
      groundGoal: T.submissionHunt > T.groundPound ? 'submit' : 'pound',
      risk: 0.5,
      feint: T.feints * d.feints,
      guardBias: 0.25 + (1 - T.pressure) * 0.2,
      staminaReserve: 20 + d.staminaMgmt * 20,
      mode: this.mode,
      notes,
    };

    // ---- Pre-fight matchup analysis
    if (iq > 0) {
      if (m.wrestleEdge > 8) {
        plan.tdDesire = clamp01(plan.tdDesire + (m.wrestleEdge * 0.012 * iq) * tdAbility);
        notes.push('Wrestling edge: look for takedowns');
      } else if (m.wrestleEdge < -12) plan.tdDesire *= 1 - 0.5 * iq;
      if (m.strikeEdge < -8 && (A.takedowns > 70 || A.clinch > 75)) {
        plan.tdDesire = clamp01(plan.tdDesire + (0.25 * iq) * tdAbility);
        plan.clinchDesire = clamp01(plan.clinchDesire + 0.15 * iq);
        notes.push('Outgunned on the feet: close the distance');
      }
      if (m.defendEdge < -12) {
        plan.clinchDesire *= 1 - 0.5 * iq;
        plan.pressure *= 1 - 0.3 * iq;
        notes.push('Dangerous wrestler: stay off the fence');
      }
      if (m.groundEdge < -12) plan.groundGoal = 'standup';
      if (m.groundEdge > 10 && A.submissions > 80) plan.groundGoal = 'submit';
    }

    // Preferred range: long fighters fight long, short fighters come forward.
    const outside = kR * 0.98;
    const pocket = pR * 0.82;
    let range = T.pressure > 0.7 ? pocket : T.kicks > 0.4 || T.counter > 0.6 ? outside : (pocket + outside) / 2;
    if (iq > 0 && m.reachAdv > 0.06) range = range + (outside - range) * 0.5 * iq;
    if (iq > 0 && m.reachAdv < -0.06) plan.pressure = clamp01(plan.pressure + 0.2 * iq);
    if (plan.tdDesire > 0.6) range = Math.min(range, 1.7);
    plan.range = range;

    // ---- Strategy mode (changed between rounds by adaptive AIs)
    switch (this.mode) {
      case 'wrestle': plan.tdDesire = clamp01(plan.tdDesire + (0.35) * tdAbility); plan.clinchDesire = clamp01(plan.clinchDesire + 0.2); plan.pressure = clamp01(plan.pressure + 0.2); notes.push('Switching to wrestling'); break;
      case 'pressure': plan.pressure = clamp01(plan.pressure + 0.35); plan.aggression = clamp01(plan.aggression + 0.2); plan.range = pocket; notes.push('More pressure'); break;
      case 'counter': plan.counterBias = clamp01(plan.counterBias + 0.35); plan.pressure *= 0.5; plan.range = outside; notes.push('Sitting back to counter'); break;
      case 'kick': plan.kickRate = clamp01(plan.kickRate + 0.3); plan.targets.leg += 0.8; plan.range = outside; notes.push('Kicking from range'); break;
      case 'body': plan.targets.body += 1; notes.push('Going to the body'); break;
    }

    // ---- Live factors
    const exploit = Math.max(d.learning, iq * 0.6);
    const opLeg = worstLeg(op);
    if (opLeg > 25) {
      plan.targets.leg += (opLeg / 100) * 2.2 * exploit;
      if (opLeg > 40 && exploit > 0.3) notes.push('Opponent leg compromised: keep kicking it');
    }
    if (op.body > 30) plan.targets.body += (op.body / 100) * 1.4 * exploit;
    if (op.rockedT > 0 || op.down) {
      plan.aggression = 1;
      plan.pressure = 1;
      plan.risk = 0.9;
      plan.range = pR * 0.75;
      notes.push('Opponent hurt: go for the finish');
    }
    if (me.rockedT > 0) {
      plan.aggression *= 0.2;
      plan.pressure = 0;
      plan.range = kR * 1.3;
      plan.guardBias = 0.95;
      if (A.clinch > 70 || A.wrestling > 75) plan.clinchDesire = clamp01(plan.clinchDesire + 0.5);
      notes.push('Hurt: survive, tie up, clear the head');
    }
    const stam = me.stamina;
    if (stam < plan.staminaReserve && d.staminaMgmt > 0.2) {
      const k = d.staminaMgmt * (1 - stam / Math.max(1, plan.staminaReserve));
      plan.aggression *= 1 - 0.55 * k;
      plan.range += 0.4 * k;
      plan.tdDesire *= 1 - 0.5 * k;
      notes.push('Managing the gas tank');
    }
    if (staminaFrac(op) < 0.3 && exploit > 0.3) {
      plan.aggression = clamp01(plan.aggression + 0.2);
      plan.tdDesire = clamp01(plan.tdDesire + (0.1) * tdAbility);
    }

    // ---- Score awareness: protect a lead late, take risks when behind
    if (d.scoreAwareness > 0) {
      const lead = this.estimateLead();
      const finalRound = e.round === e.cfg.rounds;
      const late = finalRound && e.clock < e.cfg.roundSeconds * 0.5;
      if (lead > 0.5 && late && e.rng.chance(d.scoreAwareness)) {
        plan.risk = 0.2;
        plan.aggression *= 0.75;
        plan.pressure *= 0.6;
        plan.range += 0.25;
        plan.guardBias = Math.max(plan.guardBias, 0.5);
        if (m.wrestleEdge > 5) plan.tdDesire = clamp01(plan.tdDesire + (0.2) * tdAbility);
        notes.push('Ahead late: fight safe');
      } else if (lead < -0.5 && (finalRound || e.round >= e.cfg.rounds - 1)) {
        const urgency = finalRound ? 1 : 0.5;
        plan.risk = 0.9;
        plan.aggression = clamp01(plan.aggression + 0.35 * urgency * d.scoreAwareness);
        plan.pressure = clamp01(plan.pressure + 0.35 * urgency * d.scoreAwareness);
        if (A.takedowns > 75) plan.tdDesire = clamp01(plan.tdDesire + (0.2 * urgency) * tdAbility);
        plan.targets.head += 0.4 * urgency;
        notes.push('Behind: need a finish, take risks');
      }
    }

    // ---- In-fight adaptation from this round's exchanges
    const cur = e.stats.rounds[e.round - 1];
    if (cur && d.adaptation > 0) {
      const mine = cur[this.side];
      const theirs = cur[this.side === 0 ? 1 : 0];
      if (theirs.damageDealt > mine.damageDealt * 1.6 + 15 && (A.takedowns > 68 || A.clinch > 72)) {
        plan.tdDesire = clamp01(plan.tdDesire + (0.3 * d.adaptation) * tdAbility);
        notes.push('Losing the striking: change levels');
      }
      if (mine.tdAttempted >= 3 && mine.tdLanded === 0) plan.tdDesire *= 1 - 0.45 * d.adaptation;
      if (theirs.tdLanded >= 2) {
        plan.range += 0.3 * d.adaptation;
        plan.clinchDesire *= 1 - 0.4 * d.adaptation;
      }
    }

    // ---- Exploit observed habits
    if (d.learning > 0) {
      const L = d.learning;
      if (this.model.highGuardRate > 0.3) {
        plan.targets.body += 0.8 * L;
        plan.targets.leg += 0.6 * L;
        notes.push('They shell up high: attack body and legs');
      }
      if (this.model.lowGuardRate > 0.25) plan.targets.head += 0.6 * L;
      if (this.model.jabRate > 0.34 && this.model.totalStrikes > 10) {
        plan.counterBias = clamp01(plan.counterBias + 0.35 * L);
        notes.push('Jab-heavy opponent: counter over it');
      }
      if (this.model.pressureRate > 0.3) {
        plan.counterBias = clamp01(plan.counterBias + 0.25 * L);
        if (A.takedowns > 65) plan.tdDesire = clamp01(plan.tdDesire + (0.2 * L) * tdAbility);
      }
      if (this.model.tdAgainstAttempts >= 2 && this.model.tdDefenseWeakness > 0.55) plan.tdDesire = clamp01(plan.tdDesire + (0.3 * L) * tdAbility);
      if (this.model.feintBite > 0.5) plan.feint = clamp01(plan.feint + 0.2 * L);
    }

    // Cage awareness: being stuck on the fence against a wrestler/pressure fighter is bad.
    if (d.cageIQ > 0.5 && cageDistance(me.pos) < 1.0 && m.defendEdge < 0) plan.pressure = Math.max(plan.pressure, 0.4);

    plan.aggression = clamp(plan.aggression, 0.05, 1);
    return plan;
  }

  /** Rough rounds-won lead from this AI's perspective (+ = ahead). */
  estimateLead(): number {
    const e = this.e;
    let lead = 0;
    const sgn = this.side === 0 ? 1 : -1;
    e.stats.rounds.forEach((r, i) => {
      const est = JudgeSystem.estimateRound(r) * sgn;
      const weight = i === e.round - 1 ? 1 - e.clock / e.cfg.roundSeconds : 1;
      lead += Math.sign(est) * Math.min(1, Math.abs(est) / 10) * weight;
    });
    return lead;
  }
}
