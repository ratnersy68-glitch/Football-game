import type { Player, TeamState } from '../models/types';
import { avg } from '../core/util';
import { healthyStarters } from './depthChart';

export interface TeamRatings {
  overall: number;
  offense: number;
  defense: number;
  special: number;
  qb: number;
}

/** Roster-based team ratings from current depth chart starters. */
export function teamRatings(team: TeamState, players: Record<string, Player>): TeamRatings {
  const s = (pos: Parameters<typeof healthyStarters>[1], n: number) => healthyStarters(team, pos, n, players).map((p) => p.overall);
  const qb = avg(s('QB', 1));
  const offense = (qb * 3 + avg(s('RB', 1)) * 1 + avg(s('WR', 3)) * 2.2 + avg(s('TE', 1)) * 0.8 + avg(s('OL', 5)) * 3) / 10;
  const defense = (avg(s('DL', 4)) * 3.2 + avg(s('LB', 3)) * 2.4 + avg(s('CB', 3)) * 2.4 + avg(s('S', 2)) * 2) / 10;
  const special = (avg(s('K', 1)) + avg(s('P', 1))) / 2;
  const overall = offense * 0.47 + defense * 0.45 + special * 0.08;
  return { overall: Math.round(overall), offense: Math.round(offense), defense: Math.round(defense), special: Math.round(special), qb: Math.round(qb) };
}
