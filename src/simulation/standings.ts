import { TEAM_BY_ID } from '../data';
import type { Dynasty, TeamState } from '../models/types';

export interface StandingRow {
  teamId: string;
  confW: number;
  confL: number;
  w: number;
  l: number;
  pf: number;
  pa: number;
  streak: number;
}

const pct = (w: number, l: number) => (w + l === 0 ? 0 : w / (w + l));

/** Head-to-head result between two teams this season (+1 a won, -1 b won, 0 none/split). */
function headToHead(d: Dynasty, a: string, b: string): number {
  let n = 0;
  for (const g of d.schedule) {
    if (!g.played || g.season !== d.season) continue;
    if (!((g.homeId === a && g.awayId === b) || (g.homeId === b && g.awayId === a))) continue;
    const homeWon = g.result!.homeScore > g.result!.awayScore;
    const aWon = (g.homeId === a) === homeWon;
    n += aWon ? 1 : -1;
  }
  return Math.sign(n);
}

/** Conference standings sorted by conference win %, head-to-head, overall win %, point differential, Elo. */
export function conferenceStandings(d: Dynasty, confId: string): StandingRow[] {
  const teams = Object.values(d.teams).filter((t) => TEAM_BY_ID[t.id]?.conference === confId);
  const rows = teams.map((t: TeamState) => ({
    teamId: t.id,
    confW: t.record.confW,
    confL: t.record.confL,
    w: t.record.w,
    l: t.record.l,
    pf: t.record.pf,
    pa: t.record.pa,
    streak: t.record.streak,
  }));
  rows.sort((x, y) => {
    const c = pct(y.confW, y.confL) - pct(x.confW, x.confL);
    if (c) return c;
    const h = headToHead(d, y.teamId, x.teamId);
    if (h) return h;
    const o = pct(y.w, y.l) - pct(x.w, x.l);
    if (o) return o;
    const pd = y.pf - y.pa - (x.pf - x.pa);
    if (pd) return pd;
    return d.teams[y.teamId].elo - d.teams[x.teamId].elo;
  });
  return rows;
}
