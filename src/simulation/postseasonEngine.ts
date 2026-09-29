/**
 * Postseason: conference championship games, the College Football Playoff (format read from
 * data/playoffConfig.json) and non-playoff bowls (data/bowls.json).
 */
import { BOWLS, CONFERENCES, PLAYOFF_CONFIG, TEAM_BY_ID, isUniverseTeam, rivalryBetween, type BracketRef, type PlayoffRound } from '../data';
import { Rng, seedFrom } from '../core/rng';
import type { Dynasty, Game, PostseasonInfo } from '../models/types';
import { isRankable } from './rankingEngine';
import { conferenceStandings } from './standings';

export function winnerOf(g: Game): string | undefined {
  if (!g.played || !g.result) return undefined;
  return g.result.homeScore > g.result.awayScore ? g.homeId : g.awayId;
}

export function loserOf(g: Game): string | undefined {
  if (!g.played || !g.result) return undefined;
  return g.result.homeScore > g.result.awayScore ? g.awayId : g.homeId;
}

function makeGame(d: Dynasty, week: number, homeId: string, awayId: string, ps: PostseasonInfo, neutralSite?: string): Game {
  const id = `g${d.season}_w${week}_${ps.kind}_${ps.slot ?? ps.name.replace(/\W+/g, '')}_${homeId}_${awayId}`;
  return {
    id,
    season: d.season,
    week,
    homeId,
    awayId,
    neutralSite,
    conferenceGame: false,
    rivalryId: rivalryBetween(homeId, awayId)?.id,
    seed: seedFrom(d.seed, d.season, id),
    played: false,
    postseason: ps,
  };
}

/** Teams ranked by the latest poll score (full order, beyond the Top 25). */
export function rankingOrder(d: Dynasty): string[] {
  return Object.values(d.teams)
    .filter((t) => isRankable(t.id))
    .sort((a, b) => b.pollScore - a.pollScore)
    .map((t) => t.id);
}

export function postseasonGames(d: Dynasty, season = d.season): Game[] {
  return d.schedule.filter((g) => g.season === season && g.postseason);
}

// ───────────────────────── Conference championships ─────────────────────────

/** Create title games for every conference that plays one. Returns the week they are played. */
export function createConferenceChampionships(d: Dynasty): number | null {
  let week: number | null = null;
  for (const conf of CONFERENCES) {
    const cg = conf.championshipGame;
    if (!conf.playable || !cg.enabled || cg.participants < 2) continue;
    const rows = conferenceStandings(d, conf.id);
    if (rows.length < 2) continue;
    const [a, b] = rows;
    week = cg.week;
    d.schedule.push(
      makeGame(d, cg.week, a.teamId, b.teamId, { kind: 'ccg', name: cg.name ?? `${conf.name} Championship`, conference: conf.id, homeSeed: 1, awaySeed: 2 }, cg.site || 'Neutral site'),
    );
  }
  return week;
}

export function recordConferenceChampions(d: Dynasty): Record<string, string> {
  const champs: Record<string, string> = {};
  for (const conf of CONFERENCES.filter((c) => c.playable)) {
    const ccg = d.schedule.find((g) => g.season === d.season && g.postseason?.kind === 'ccg' && g.postseason.conference === conf.id);
    const w = ccg ? winnerOf(ccg) : conferenceStandings(d, conf.id)[0]?.teamId;
    if (w) champs[conf.id] = w;
  }
  return champs;
}

// ───────────────────────── Playoff selection ─────────────────────────

export function selectPlayoffField(d: Dynasty, champions: Record<string, string>): { seed: number; teamId: string; autoBid: boolean }[] {
  const cfg = PLAYOFF_CONFIG;
  const order = rankingOrder(d);
  const rank = (id: string) => {
    const i = order.indexOf(id);
    return i < 0 ? 999 : i + 1;
  };
  const champs = Object.values(champions)
    .filter((id) => rank(id) <= cfg.selection.championMustBeRankedWithin)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, cfg.selection.autoBidConferenceChampions);
  const field = new Set<string>(champs);
  for (const id of order) {
    if (field.size >= cfg.teamCount) break;
    field.add(id);
  }
  // If auto-bids pushed the field over the limit, drop the lowest-ranked at-large teams.
  let list = [...field].sort((a, b) => rank(a) - rank(b));
  while (list.length > cfg.teamCount) {
    const idx = [...list].reverse().findIndex((id) => !champs.includes(id));
    list.splice(list.length - 1 - idx, 1);
  }
  // Seeding: optionally reserve top seeds for the highest-ranked champions, otherwise straight ranking.
  const reserved = champs.slice(0, cfg.seeding.championsGetTopSeeds);
  list = [...reserved, ...list.filter((id) => !reserved.includes(id))];
  return list.map((teamId, i) => ({ seed: i + 1, teamId, autoBid: champs.includes(teamId) }));
}

function resolveRef(d: Dynasty, ref: BracketRef): { teamId?: string; seed?: number } {
  const seeds = d.postseason?.cfpSeeds ?? [];
  if (typeof ref === 'number') {
    const s = seeds.find((x) => x.seed === ref);
    return { teamId: s?.teamId, seed: ref };
  }
  const g = postseasonGames(d).find((x) => x.postseason?.kind === 'cfp' && x.postseason.slot === ref);
  if (!g) return {};
  const w = winnerOf(g);
  const seed = w === g.homeId ? g.postseason?.homeSeed : g.postseason?.awaySeed;
  return { teamId: w, seed };
}

/** Create the games of a playoff round (seeds or winners of earlier slots must be known). */
export function createPlayoffRound(d: Dynasty, round: PlayoffRound): Game[] {
  const out: Game[] = [];
  round.games.forEach(([a, b], i) => {
    const A = resolveRef(d, a);
    const B = resolveRef(d, b);
    if (!A.teamId || !B.teamId) return;
    const aHome = (A.seed ?? 99) <= (B.seed ?? 99);
    const home = aHome ? A : B;
    const away = aHome ? B : A;
    const bowl = round.site === 'bowl' ? round.bowls?.[i] : undefined;
    const neutral = round.site === 'higherSeedHome' ? undefined : bowl ? PLAYOFF_CONFIG.bowlSites[bowl] ?? bowl : round.neutralSite;
    const name = bowl ? `${round.name} · ${bowl}` : round.name;
    const g = makeGame(d, round.week, home.teamId!, away.teamId!, { kind: 'cfp', name, round: round.id, slot: `${round.id}-${i + 1}`, homeSeed: home.seed, awaySeed: away.seed }, neutral);
    out.push(g);
  });
  d.schedule.push(...out);
  return out;
}

/** First playoff round: teams with byes wait for the next round. */
export function firstRound(): PlayoffRound {
  return PLAYOFF_CONFIG.rounds[0];
}

export function roundForWeek(week: number): PlayoffRound | undefined {
  return PLAYOFF_CONFIG.rounds.find((r) => r.week === week);
}

export function nextRoundAfter(week: number): PlayoffRound | undefined {
  return PLAYOFF_CONFIG.rounds.find((r) => r.week > week);
}

// ───────────────────────── Bowls ─────────────────────────

export function createBowls(d: Dynasty, exclude: Set<string>): Game[] {
  const rng = new Rng(seedFrom(d.seed, d.season, 'bowls'));
  const played = new Set(d.schedule.filter((g) => g.season === d.season).map((g) => [g.homeId, g.awayId].sort().join('|')));
  const eligible = Object.values(d.teams)
    .filter((t) => isUniverseTeam(t.id) && !exclude.has(t.id) && t.record.w >= BOWLS.minWins)
    .sort((a, b) => b.pollScore - a.pollScore)
    .map((t) => t.id);
  const games: Game[] = [];
  const used = new Set<string>();
  const pool = Object.values(d.teams)
    .filter((t) => !isUniverseTeam(t.id) && (TEAM_BY_ID[t.id]?.prestige ?? 0) >= 35)
    .map((t) => t.id);
  for (const bowl of BOWLS.bowls) {
    const a = eligible.find((id) => !used.has(id));
    if (!a) break;
    used.add(a);
    let b = eligible.find((id) => !used.has(id) && TEAM_BY_ID[id].conference !== TEAM_BY_ID[a].conference && !played.has([a, id].sort().join('|')));
    if (!b) {
      const candidates = pool.filter((id) => !used.has(id) && !played.has([a, id].sort().join('|')));
      if (!candidates.length) break;
      b = rng.pick(candidates);
    }
    used.add(b);
    const aHome = d.teams[a].pollScore >= (d.teams[b]?.pollScore ?? 0);
    games.push(makeGame(d, BOWLS.week, aHome ? a : b, aHome ? b : a, { kind: 'bowl', name: bowl.name }, bowl.site));
  }
  d.schedule.push(...games);
  return games;
}

/** Human-readable description of how a team's postseason went. */
export function postseasonSummary(d: Dynasty, teamId: string, season = d.season): string {
  const games = postseasonGames(d, season).filter((g) => g.played && (g.homeId === teamId || g.awayId === teamId));
  if (!games.length) return d.teams[teamId]?.record.w >= BOWLS.minWins ? 'No bowl' : 'Missed bowl eligibility';
  const last = games[games.length - 1];
  const won = winnerOf(last) === teamId;
  const name = last.postseason!.kind === 'cfp' ? (last.postseason!.round === 'F' ? 'National Championship' : last.postseason!.name.split(' · ')[0]) : last.postseason!.name;
  if (last.postseason!.round === 'F' && won) return 'NATIONAL CHAMPIONS';
  return `${won ? 'Won' : 'Lost'} ${name}`;
}
