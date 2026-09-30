import { STRIKES } from '../data';
import type { FightEvent, Side } from './types';

export interface RoundStats {
  totalLanded: number;
  totalAttempted: number;
  sigLanded: number;
  sigAttempted: number;
  headLanded: number;
  headAttempted: number;
  bodyLanded: number;
  bodyAttempted: number;
  legLanded: number;
  legAttempted: number;
  knockdowns: number;
  tdLanded: number;
  tdAttempted: number;
  controlTime: number;
  subAttempts: number;
  reversals: number;
  // judging inputs
  damageDealt: number;
  nearFinishes: number;
  rockedOpp: number;
  aggression: number;
}

export const emptyRoundStats = (): RoundStats => ({
  totalLanded: 0, totalAttempted: 0, sigLanded: 0, sigAttempted: 0, headLanded: 0, headAttempted: 0,
  bodyLanded: 0, bodyAttempted: 0, legLanded: 0, legAttempted: 0, knockdowns: 0, tdLanded: 0, tdAttempted: 0,
  controlTime: 0, subAttempts: 0, reversals: 0, damageDealt: 0, nearFinishes: 0, rockedOpp: 0, aggression: 0,
});

export function sumStats(list: RoundStats[]): RoundStats {
  const t = emptyRoundStats();
  for (const r of list) for (const k of Object.keys(t) as (keyof RoundStats)[]) t[k] += r[k];
  return t;
}

/** Per-round, per-fighter fight statistics (UFC-style). Fed by FightEvents. */
export class FightStatistics {
  rounds: Array<[RoundStats, RoundStats]> = [];

  startRound() {
    this.rounds.push([emptyRoundStats(), emptyRoundStats()]);
  }

  cur(side: Side): RoundStats {
    if (!this.rounds.length) this.startRound();
    return this.rounds[this.rounds.length - 1][side];
  }

  totals(side: Side): RoundStats {
    return sumStats(this.rounds.map((r) => r[side]));
  }

  addControl(side: Side, s: number) {
    this.cur(side).controlTime += s;
  }
  addAggression(side: Side, s: number) {
    this.cur(side).aggression += s;
  }
  addSubAttempt(side: Side) {
    this.cur(side).subAttempts++;
  }
  noteSubEscape(_side: Side) {}

  onEvent(ev: FightEvent) {
    switch (ev.type) {
      case 'strikeLanded':
      case 'strikeBlocked':
      case 'strikeMissed': {
        const s = STRIKES[ev.id];
        const st = this.cur(ev.side);
        const landed = ev.type === 'strikeLanded';
        st.totalAttempted++;
        if (landed) st.totalLanded++;
        if (s.sig) {
          st.sigAttempted++;
          if (landed) st.sigLanded++;
          const key = s.target;
          (st as any)[key + 'Attempted']++;
          if (landed) (st as any)[key + 'Landed']++;
        }
        if (landed) st.damageDealt += ev.dmg * (s.target === 'head' ? 1.2 : s.target === 'body' ? 1 : 0.85);
        break;
      }
      case 'knockdown':
        this.cur((ev.side === 0 ? 1 : 0) as Side).knockdowns++;
        break;
      case 'rocked':
        this.cur((ev.side === 0 ? 1 : 0) as Side).rockedOpp++;
        break;
      case 'takedownAttempt':
        this.cur(ev.side).tdAttempted++;
        break;
      case 'takedown':
        this.cur(ev.side).tdLanded++;
        break;
      case 'positionChange':
        if (ev.kind === 'sweep') this.cur(ev.side).reversals++;
        break;
      case 'subTight':
        this.cur(ev.side).nearFinishes++;
        break;
    }
  }
}
