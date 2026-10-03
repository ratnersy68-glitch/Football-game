import type { Dynasty, GameRecord } from './types';
import { LCPS_TEAMS, getTeam, regionOf } from '../data/teams';

export interface StandingRow {
  team: string;
  w: number;
  l: number;
  dw: number;
  dl: number;
  pf: number;
  pa: number;
  streak: string;
  district: string;
  region: 'north' | 'south';
  last5: string[];
}

export function teamGames(d: Dynasty, team: string, regularOnly = false): GameRecord[] {
  return d.schedule.filter((g) => (g.home === team || g.away === team) && (!regularOnly || g.week <= 10));
}

export function result(g: GameRecord, team: string): 'W' | 'L' | null {
  if (!g.played || g.homeScore == null || g.awayScore == null) return null;
  const us = g.home === team ? g.homeScore : g.awayScore;
  const them = g.home === team ? g.awayScore : g.homeScore;
  return us > them ? 'W' : 'L';
}

export function computeStandings(d: Dynasty, includePlayoffs = false): StandingRow[] {
  return LCPS_TEAMS.map((t) => {
    const games = teamGames(d, t.id, !includePlayoffs).filter((g) => g.played);
    let w = 0, l = 0, dw = 0, dl = 0, pf = 0, pa = 0;
    const res: string[] = [];
    for (const g of games) {
      const us = g.home === t.id ? g.homeScore! : g.awayScore!;
      const them = g.home === t.id ? g.awayScore! : g.homeScore!;
      pf += us;
      pa += them;
      const win = us > them;
      if (win) w++; else l++;
      if (g.district) { if (win) dw++; else dl++; }
      res.push(win ? 'W' : 'L');
    }
    let streak = '';
    if (res.length) {
      const last = res[res.length - 1];
      let n = 0;
      for (let i = res.length - 1; i >= 0 && res[i] === last; i--) n++;
      streak = `${last}${n}`;
    }
    return { team: t.id, w, l, dw, dl, pf, pa, streak, district: t.district, region: regionOf(t), last5: res.slice(-5) };
  });
}

export function recordOf(d: Dynasty, team: string, includePlayoffs = true): string {
  const r = computeStandings(d, includePlayoffs).find((x) => x.team === team);
  return r ? `${r.w}–${r.l}` : '0–0';
}

export function sortStandings(rows: StandingRow[], key: string, dir: 1 | -1 = -1): StandingRow[] {
  const val = (r: StandingRow): number | string => {
    switch (key) {
      case 'team': return getTeam(r.team).shortName;
      case 'w': return r.w - r.l * 0.001;
      case 'l': return r.l;
      case 'district': return r.dw - r.dl * 0.5;
      case 'pf': return r.pf;
      case 'pa': return r.pa;
      case 'diff': return r.pf - r.pa;
      default: return r.w / Math.max(1, r.w + r.l) + (r.pf - r.pa) * 0.0001;
    }
  };
  return [...rows].sort((a, b) => {
    const va = val(a);
    const vb = val(b);
    if (typeof va === 'string' || typeof vb === 'string') return String(va).localeCompare(String(vb)) * (dir === -1 ? 1 : -1);
    return dir === -1 ? vb - va : va - vb;
  });
}
