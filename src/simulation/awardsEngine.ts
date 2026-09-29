/**
 * Season awards, decided from this season's statistics and team success (names in data/awards.json).
 */
import { AWARDS, TEAM_BY_ID, isUniverseTeam } from '../data';
import type { AwardResult, Dynasty, Player, Position, StatLine } from '../models/types';

const n = (v?: number) => v ?? 0;

function rankOf(d: Dynasty, teamId: string): number {
  return d.rankings[d.rankings.length - 1]?.poll.find((e) => e.teamId === teamId)?.rank ?? 0;
}

export function statLine(p: Player, s: StatLine = p.seasonStats): string {
  switch (p.position) {
    case 'QB':
      return `${n(s.passYds)} pass yds, ${n(s.passTD)} TD, ${n(s.passInt)} INT, ${n(s.rushYds)} rush yds`;
    case 'RB':
      return `${n(s.rushYds)} rush yds, ${n(s.rushTD)} TD, ${n(s.recYds)} rec yds`;
    case 'WR':
    case 'TE':
      return `${n(s.rec)} rec, ${n(s.recYds)} yds, ${n(s.recTD)} TD`;
    case 'DL':
      return `${n(s.sacks)} sacks, ${n(s.tfl)} TFL, ${n(s.tackles)} tkl`;
    case 'LB':
      return `${n(s.tackles)} tkl, ${n(s.tfl)} TFL, ${n(s.sacks)} sacks, ${n(s.defInt)} INT`;
    case 'CB':
    case 'S':
      return `${n(s.defInt)} INT, ${n(s.passDef)} PD, ${n(s.tackles)} tkl`;
    default:
      return `${p.overall} OVR`;
  }
}

function teamBonus(d: Dynasty, teamId: string): number {
  const r = rankOf(d, teamId);
  return d.teams[teamId].record.w * 2 + (r ? (26 - r) * 1.2 : 0);
}

function score(d: Dynasty, p: Player): number {
  const s = p.seasonStats;
  const tb = teamBonus(d, p.teamId);
  switch (p.position) {
    case 'QB':
      return n(s.passYds) / 25 + n(s.passTD) * 4 - n(s.passInt) * 4 + n(s.rushYds) / 12 + n(s.rushTD) * 5 + tb;
    case 'RB':
      return n(s.rushYds) / 11 + n(s.rushTD) * 6 + n(s.recYds) / 12 + n(s.recTD) * 6 + tb * 0.8;
    case 'WR':
    case 'TE':
      return n(s.recYds) / 10 + n(s.recTD) * 6 + n(s.rec) * 0.4 + tb * 0.6;
    case 'DL':
      return n(s.sacks) * 6 + n(s.tfl) * 3 + n(s.tackles) * 0.4 + n(s.forcedFum) * 4 + n(s.fumRec) * 3 + tb * 0.3;
    case 'LB':
      return n(s.tackles) * 0.8 + n(s.tfl) * 2.5 + n(s.sacks) * 4 + n(s.defInt) * 6 + n(s.passDef) * 1.5 + n(s.forcedFum) * 4 + tb * 0.3;
    case 'CB':
    case 'S':
      return n(s.defInt) * 7 + n(s.passDef) * 2.5 + n(s.tackles) * 0.5 + n(s.defTD) * 6 + n(s.forcedFum) * 3 + tb * 0.3;
    case 'OL': {
      const t = d.teams[p.teamId].stats;
      const games = Math.max(1, t.games);
      const starter = d.teams[p.teamId].depthChart.OL.slice(0, 5).includes(p.id);
      return starter ? p.overall * 1.5 + (t.rushYards / games) / 8 + (t.totalYards / games) / 30 + tb * 0.5 : 0;
    }
    default:
      return 0;
  }
}

function candidates(d: Dynasty, positions: Position[]): Player[] {
  return Object.values(d.players).filter((p) => positions.includes(p.position) && isUniverseTeam(p.teamId) && n(p.seasonStats.gp) >= 6);
}

function toResult(id: string, name: string, label: string, p: Player, finalists: Player[]): AwardResult {
  return {
    id,
    name,
    label,
    winnerName: `${p.firstName} ${p.lastName}`,
    playerId: p.id,
    teamId: p.teamId,
    position: p.position,
    statLine: statLine(p),
    finalists: finalists.map((f) => ({ name: `${f.firstName} ${f.lastName}`, teamId: f.teamId, statLine: `${f.position} · ${statLine(f)}` })),
  };
}

/** Compute all season awards. `preseasonRanks` = team → preseason poll rank (0 = unranked). */
export function computeAwards(d: Dynasty, confChampions: Record<string, string>): AwardResult[] {
  const out: AwardResult[] = [];
  const heismanPool = candidates(d, ['QB', 'RB', 'WR', 'TE'])
    .map((p) => ({ p, s: score(d, p) * (p.position === 'QB' ? 0.92 : p.position === 'RB' ? 0.9 : 0.86) }))
    .sort((a, b) => b.s - a.s);
  if (heismanPool.length) {
    const top = heismanPool.slice(0, 4).map((x) => x.p);
    out.push(toResult('heisman', AWARDS.heisman.name, 'Most outstanding player', top[0], top.slice(1)));
  }
  for (const a of AWARDS.positional) {
    const pool = candidates(d, a.positions)
      .map((p) => ({ p, s: score(d, p) }))
      .sort((x, y) => y.s - x.s);
    if (!pool.length) continue;
    const top = pool.slice(0, 3).map((x) => x.p);
    out.push(toResult(a.id, a.name, a.label, top[0], top.slice(1)));
  }

  // Coach of the Year: most wins over preseason expectation, plus titles and final rank.
  const pre = d.rankings.find((r) => r.season === d.season && r.week === 0);
  const coachScores = Object.values(d.teams)
    .filter((t) => isUniverseTeam(t.id))
    .map((t) => {
    const preRank = pre?.poll.find((e) => e.teamId === t.id)?.rank ?? 32;
    const expected = 10.8 - preRank * 0.19;
    const r = rankOf(d, t.id);
    const s = (t.record.w - expected) * 8 + (r ? 26 - r : 0) + (Object.values(confChampions).includes(t.id) ? 8 : 0);
    return { t, s };
  })
    .sort((a, b) => b.s - a.s);
  if (coachScores.length) {
    const top = coachScores.slice(0, 3);
    const c = d.coaches[top[0].t.coachIds.HC];
    const rec = (id: string) => `${d.teams[id].record.w}-${d.teams[id].record.l}`;
    out.push({
      id: AWARDS.coach.id,
      name: AWARDS.coach.name,
      label: 'Coach of the Year',
      winnerName: c ? `${c.firstName} ${c.lastName}` : TEAM_BY_ID[top[0].t.id].school,
      coachId: c?.id,
      teamId: top[0].t.id,
      statLine: `${rec(top[0].t.id)} (preseason ${pre?.poll.find((e) => e.teamId === top[0].t.id)?.rank ? `#${pre?.poll.find((e) => e.teamId === top[0].t.id)?.rank}` : "unranked"})`,
      finalists: top.slice(1).map((x) => {
        const cc = d.coaches[x.t.coachIds.HC];
        return { name: cc ? `${cc.firstName} ${cc.lastName}` : '', teamId: x.t.id, statLine: `${TEAM_BY_ID[x.t.id].school} ${rec(x.t.id)}` };
      }),
    });
  }
  return out;
}
