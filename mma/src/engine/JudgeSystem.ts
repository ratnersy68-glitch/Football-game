import { Rng } from '../core/rng';
import type { RoundStats } from './FightStatistics';
import type { Scorecard, Side } from './types';

interface JudgeProfile {
  name: string;
  striking: number;
  grappling: number;
  noise: number;
}

const JUDGES: JudgeProfile[] = [
  { name: 'Judge D. Alvarez', striking: 1.3, grappling: 0.7, noise: 0.42 },
  { name: 'Judge S. Whitfield', striking: 0.8, grappling: 1.45, noise: 0.42 },
  { name: 'Judge M. Okafor', striking: 1.0, grappling: 1.0, noise: 0.4 },
];

/**
 * Three independent judges on the 10-point must system. Priorities follow the unified rules:
 * effective striking/grappling (impact, damage, near finishes) first, then aggression, then control.
 */
export class JudgeSystem {
  cards: Scorecard[] = JUDGES.map((j) => ({ judge: j.name, rounds: [], total: [0, 0] }));
  constructor(private rng: Rng) {}

  static impact(s: RoundStats, grapW = 1, strW = 1) {
    const striking = s.damageDealt * 0.9 + s.sigLanded * 0.55;
    const grappling = s.tdLanded * 5 + (s.controlTime / 60) * 6 + s.subAttempts * 3.5 + s.reversals * 3;
    const finish = s.knockdowns * 24 + s.rockedOpp * 7 + s.nearFinishes * 10;
    return strW * striking + grapW * grappling + finish;
  }

  /** Quick unbiased estimate used by AI and the corner: [+ means side 0 ahead]. */
  static estimateRound(r: [RoundStats, RoundStats]) {
    return JudgeSystem.impact(r[0]) - JudgeSystem.impact(r[1]);
  }

  scoreRound(r: [RoundStats, RoundStats]): Array<[number, number]> {
    const out: Array<[number, number]> = [];
    JUDGES.forEach((j, i) => {
      const i0 = JudgeSystem.impact(r[0], j.grappling, j.striking);
      const i1 = JudgeSystem.impact(r[1], j.grappling, j.striking);
      let diff = i0 - i1 + this.rng.gauss() * j.noise * Math.sqrt(i0 + i1 + 4) * 2.2;
      if (Math.abs(diff) < 1.5) {
        // close on impact: aggression, then control
        diff += (r[0].aggression - r[1].aggression) * 0.08 + (r[0].controlTime - r[1].controlTime) * 0.02;
      }
      let score: [number, number];
      if (Math.abs(diff) < 0.4 && i0 + i1 < 6) score = [10, 10];
      else {
        const winner: Side = diff > 0 ? 0 : 1;
        const w = r[winner];
        const l = r[winner === 0 ? 1 : 0];
        const wi = winner === 0 ? i0 : i1;
        const li = winner === 0 ? i1 : i0;
        const kdDiff = w.knockdowns - l.knockdowns;
        const dominance = wi / Math.max(4, li);
        let loser = 9;
        if ((dominance > 2.8 && wi - li > 38) || kdDiff >= 2 || (kdDiff >= 1 && wi - li > 30 && dominance > 2.2)) loser = 8;
        if (kdDiff >= 3 || (dominance > 6 && wi - li > 110 && kdDiff >= 2)) loser = 7;
        score = winner === 0 ? [10, loser] : [loser, 10];
      }
      out.push(score);
      this.cards[i].rounds.push(score);
      this.cards[i].total[0] += score[0];
      this.cards[i].total[1] += score[1];
    });
    return out;
  }

  decision(): { winner: Side | null; type: 'Unanimous' | 'Split' | 'Majority' | 'Draw'; drawType?: string } {
    const votes = this.cards.map((c) => (c.total[0] > c.total[1] ? 0 : c.total[1] > c.total[0] ? 1 : -1));
    const w0 = votes.filter((v) => v === 0).length;
    const w1 = votes.filter((v) => v === 1).length;
    const dr = votes.filter((v) => v === -1).length;
    if (w0 === 3) return { winner: 0, type: 'Unanimous' };
    if (w1 === 3) return { winner: 1, type: 'Unanimous' };
    if (w0 === 2 && w1 === 1) return { winner: 0, type: 'Split' };
    if (w1 === 2 && w0 === 1) return { winner: 1, type: 'Split' };
    if (w0 === 2 && dr === 1) return { winner: 0, type: 'Majority' };
    if (w1 === 2 && dr === 1) return { winner: 1, type: 'Majority' };
    const drawType = dr >= 2 ? (dr === 3 ? 'Unanimous Draw' : 'Majority Draw') : 'Split Draw';
    return { winner: null, type: 'Draw', drawType };
  }
}
