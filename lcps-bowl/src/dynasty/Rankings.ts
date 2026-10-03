/** LCPS power rankings: margin-aware Elo (captures strength of schedule & quality wins) blended with record. */
import type { Dynasty, GameRecord } from './types';
import { LCPS_TEAMS, isLcps, getTeam } from '../data/teams';
import { computeStandings } from './Standings';

export const GUEST_ELO = 1450;

export function initialElo(teamId: string, prestige: number, off: number, def: number): number {
  void teamId;
  return 1500 + ((off + def) / 2 - 64) * 9 + (prestige - 3) * 30;
}

export function eloOf(d: Dynasty, team: string): number {
  return d.programs[team]?.elo ?? GUEST_ELO;
}

export function updateElo(d: Dynasty, g: GameRecord) {
  if (!g.played) return;
  const ha = g.neutral ? 0 : 35;
  const rh = eloOf(d, g.home) + ha;
  const ra = eloOf(d, g.away);
  const exp = 1 / (1 + Math.pow(10, (ra - rh) / 400));
  const margin = g.homeScore! - g.awayScore!;
  const actual = margin > 0 ? 1 : 0;
  const mult = Math.log(Math.abs(margin) + 1) * (2.2 / ((actual ? rh - ra : ra - rh) * 0.001 + 2.2));
  const k = 32 * mult;
  const delta = k * (actual - exp);
  if (isLcps(g.home)) d.programs[g.home].elo += delta;
  if (isLcps(g.away)) d.programs[g.away].elo -= delta;
}

/** Ranking score: Elo is the backbone; record and point differential nudge it. */
export function computeRankings(d: Dynasty): string[] {
  const st = computeStandings(d, true);
  const score = (team: string) => {
    const r = st.find((x) => x.team === team)!;
    const gp = Math.max(1, r.w + r.l);
    return eloOf(d, team) + (r.w / gp - 0.5) * 120 * Math.min(1, gp / 4) + ((r.pf - r.pa) / gp) * 1.2;
  };
  return LCPS_TEAMS.map((t) => t.id).sort((a, b) => score(b) - score(a));
}

export function rankOf(d: Dynasty, team: string): number {
  const cur = d.rankings[d.rankings.length - 1];
  const order = cur ? cur.order : computeRankings(d);
  return order.indexOf(team) + 1;
}

export function rankingMovement(d: Dynasty, team: string): number {
  if (d.rankings.length < 2) return 0;
  const prev = d.rankings[d.rankings.length - 2].order.indexOf(team);
  const cur = d.rankings[d.rankings.length - 1].order.indexOf(team);
  return prev - cur;
}

export const teamName = (id: string) => getTeam(id).shortName;
