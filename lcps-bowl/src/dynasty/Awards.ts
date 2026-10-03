/** End-of-season awards and All-LCPS teams, computed from real season stats. */
import type { Dynasty, AwardWinner, SeasonAwards } from './types';
import type { PlayerData, Position, StatLine } from '../game/types';
import { LCPS_TEAMS, getTeam, programExpectation } from '../data/teams';
import { ovr, fullName } from '../game/players';
import { computeStandings } from './Standings';

interface Cand { p: PlayerData; team: string; s: StatLine }

const offScore = (c: Cand) => c.s.passYds * 0.04 + c.s.passTD * 4 - c.s.passInt * 3 + c.s.rushYds * 0.1 + c.s.rushTD * 6 + c.s.recYds * 0.1 + c.s.recTD * 6;
const defScore = (c: Cand) => c.s.tackles * 1 + c.s.sacks * 4 + c.s.ints * 6 + c.s.ff * 3 + c.s.pd * 1.5;
const winBonus = (d: Dynasty, team: string) => {
  const r = computeStandings(d, true).find((x) => x.team === team);
  return r ? (r.w / Math.max(1, r.w + r.l)) * 15 : 0;
};

const line = (c: Cand): string => {
  const s = c.s;
  switch (c.p.pos) {
    case 'QB': return `${s.passCmp}/${s.passAtt}, ${s.passYds} yds, ${s.passTD} TD, ${s.passInt} INT${s.rushYds > 150 ? `; ${s.rushYds} rush yds` : ''}`;
    case 'RB': return `${s.rushAtt} car, ${s.rushYds} yds, ${s.rushTD} TD${s.recYds ? `; ${s.recYds} rec yds` : ''}`;
    case 'WR': case 'TE': return `${s.rec} rec, ${s.recYds} yds, ${s.recTD} TD`;
    case 'K': return `${s.fgm}/${s.fga} FG (long ${s.fgLong}), ${s.xpm}/${s.xpa} XP`;
    case 'OL': return `${ovr(c.p)} OVR — anchored the line`;
    default: return `${Math.round(s.tackles)} tkl, ${s.sacks} sacks, ${s.ints} INT`;
  }
};

export function computeAwards(d: Dynasty): SeasonAwards {
  const cands: Cand[] = [];
  for (const t of LCPS_TEAMS) for (const p of d.programs[t.id].roster) cands.push({ p, team: t.id, s: p.season });
  const W = (award: string, c: Cand | undefined): AwardWinner | null => c ? { award, playerId: c.p.id, name: fullName(c.p), team: c.team, pos: c.p.pos, line: line(c) } : null;
  const best = (pool: Cand[], f: (c: Cand) => number) => [...pool].sort((a, b) => f(b) - f(a));
  const byPos = (...pos: Position[]) => cands.filter((c) => pos.includes(c.p.pos));
  const winners: AwardWinner[] = [];
  const poy = best(cands, (c) => Math.max(offScore(c), defScore(c) * 1.4) + winBonus(d, c.team))[0];
  const opoy = best(cands.filter((c) => c !== poy), (c) => offScore(c) + winBonus(d, c.team) * 0.5)[0];
  const dpoy = best(cands.filter((c) => c !== poy), (c) => defScore(c) + winBonus(d, c.team) * 0.3)[0];
  const qb = best(byPos('QB'), (c) => offScore(c) + winBonus(d, c.team))[0];
  const rb = best(byPos('RB'), (c) => c.s.rushYds * 0.1 + c.s.rushTD * 6 + c.s.recYds * 0.05)[0];
  const wr = best(byPos('WR', 'TE'), (c) => c.s.recYds * 0.1 + c.s.recTD * 6)[0];
  const lineman = best(byPos('OL', 'DL'), (c) => ovr(c.p) + c.s.sacks * 2 + winBonus(d, c.team) * 0.4)[0];
  for (const [a, c] of [['LCPS Player of the Year', poy], ['Offensive Player of the Year', opoy], ['Defensive Player of the Year', dpoy], ['QB of the Year', qb], ['RB of the Year', rb], ['WR of the Year', wr], ['Lineman of the Year', lineman]] as [string, Cand][]) {
    const w = W(a, c);
    if (w) winners.push(w);
  }
  // Coach of the Year: biggest over-performance vs. preseason expectation
  const st = computeStandings(d, true);
  const expRank: Record<string, number> = { Powerhouse: 0.8, 'Championship Contender': 0.7, 'Playoff Contender': 0.6, Competitive: 0.5, Rebuild: 0.35 };
  let coy = { team: LCPS_TEAMS[0].id, val: -99 };
  for (const r of st) {
    const t = getTeam(r.team);
    const exp = expRank[programExpectation({ ...t, prestige: Math.round(d.programs[t.id].prestige) })] ?? 0.5;
    const val = r.w / Math.max(1, r.w + r.l) - exp + (d.bracket?.champion === r.team ? 0.25 : 0);
    if (val > coy.val) coy = { team: r.team, val };
  }
  const coyName = coy.team === d.userTeam ? `Coach ${d.coachName}` : `${getTeam(coy.team).shortName} head coach`;
  winners.push({ award: 'Coach of the Year', name: coyName, team: coy.team, line: `${st.find((x) => x.team === coy.team)!.w}–${st.find((x) => x.team === coy.team)!.l}` });

  // All-LCPS teams
  const slots: [Position[], number, (c: Cand) => number][] = [
    [['QB'], 1, (c) => offScore(c)],
    [['RB'], 2, (c) => c.s.rushYds * 0.1 + c.s.rushTD * 6],
    [['WR'], 3, (c) => c.s.recYds * 0.1 + c.s.recTD * 6],
    [['TE'], 1, (c) => c.s.recYds * 0.1 + ovr(c.p) * 0.5],
    [['OL'], 5, (c) => ovr(c.p) + winBonus(d, c.team) * 0.3],
    [['DL'], 4, (c) => defScore(c) + ovr(c.p) * 0.3],
    [['LB'], 3, (c) => defScore(c) + ovr(c.p) * 0.2],
    [['CB', 'S'], 4, (c) => defScore(c) + c.s.ints * 4 + ovr(c.p) * 0.2],
    [['K'], 1, (c) => c.s.fgm * 4 + c.s.fgLong * 0.2 + c.s.xpm * 0.5],
  ];
  const first: AwardWinner[] = [];
  const second: AwardWinner[] = [];
  for (const [pos, n, f] of slots) {
    const ranked = best(byPos(...pos), f);
    ranked.slice(0, n).forEach((c) => first.push(W(`All-LCPS ${pos.join('/')}`, c)!));
    ranked.slice(n, n * 2).forEach((c) => second.push(W(`All-LCPS ${pos.join('/')}`, c)!));
  }
  return { year: d.year, winners, allFirst: first, allSecond: second };
}
