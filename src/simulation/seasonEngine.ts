/**
 * Season flow: create a dynasty, play games, apply results, advance weeks.
 * The UI calls these; they mutate the Dynasty object in place (it is plain JSON and gets saved as-is).
 */
import { BOWLS, CONFERENCE_BY_ID, PLAYOFF_CONFIG, SCHEDULE_RULES, TEAMS, TEAM_BY_ID, isUniverseTeam } from '../data';
import { seedFrom } from '../core/rng';
import type { Coach, CoachingSettings, DefScheme, Dynasty, Game, GameResult, OffScheme, SeasonHistory, Side } from '../models/types';
import { computeAwards } from './awardsEngine';
import {
  createBowls,
  createConferenceChampionships,
  createPlayoffRound,
  firstRound,
  loserOf,
  nextRoundAfter,
  postseasonGames,
  postseasonSummary,
  recordConferenceChampions,
  selectPlayoffField,
  winnerOf,
} from './postseasonEngine';
import { autoDepthChart, reconcileDepthChart } from './depthChart';
import { GameSimulation } from './game/gameEngine';
import type { GameSetup } from './game/types';
import { mergeStatLine } from './game/stats';
import { gameNews, rankingNews } from './newsEngine';
import { computePoll, currentRank, initialElo, updateElo } from './rankingEngine';
import { generateSchedule } from './scheduleGenerator';
import { buildWorld, DEFAULT_COACHING, gameSetupFor } from './world';

export const DYNASTY_VERSION = 2;

export interface NewDynastyOptions {
  teamId: string;
  coachFirstName: string;
  coachLastName: string;
  offScheme?: OffScheme;
  defScheme?: DefScheme;
  seed?: number;
  name?: string;
}

export function nextIdFn(d: Pick<Dynasty, 'nextId'>): (prefix: string) => string {
  return (prefix: string) => `${prefix}${d.nextId++}`;
}

export function createDynasty(opts: NewDynastyOptions): Dynasty {
  const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const holder = { nextId: 1 };
  const world = buildWorld(seed, nextIdFn(holder), TEAMS);
  const team = world.teams[opts.teamId];
  if (!team) throw new Error(`Unknown team ${opts.teamId}`);
  const info = TEAM_BY_ID[opts.teamId];

  // The user replaces the program's head coach.
  const old = world.coaches[team.coachIds.HC];
  const userCoach: Coach = {
    ...old,
    firstName: opts.coachFirstName.trim() || 'Coach',
    lastName: opts.coachLastName.trim() || 'Player',
    age: 42,
    ratings: { recruiting: 70, development: 70, offense: 70, defense: 70, gameManagement: 70, motivation: 70, scouting: 70 },
    offScheme: opts.offScheme ?? info.offense,
    defScheme: opts.defScheme ?? info.defense,
    reputation: 55,
    isUser: true,
    careerWins: 0,
    careerLosses: 0,
    contractYears: 5,
  };
  world.coaches[userCoach.id] = userCoach;
  team.offScheme = userCoach.offScheme;
  team.defScheme = userCoach.defScheme;

  const season = SCHEDULE_RULES.startYear;
  const d: Dynasty = {
    version: DYNASTY_VERSION,
    id: `dyn_${seed.toString(36)}_${Date.now().toString(36)}`,
    name: opts.name ?? `${info.school} Dynasty`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    seed,
    userTeamId: opts.teamId,
    userCoachId: userCoach.id,
    season,
    week: 1,
    phase: 'regular',
    teams: world.teams,
    players: world.players,
    coaches: world.coaches,
    schedule: generateSchedule(season, seed, TEAMS),
    rankings: [],
    news: [],
    coachingSettings: { ...DEFAULT_COACHING },
    nextId: holder.nextId,
    postseason: null,
    history: [],
    offseason: null,
  };
  for (const t of Object.values(d.teams)) {
    t.elo = initialElo(t, d.players);
    t.pollScore = 0;
  }
  const pre = computePoll(d, 0);
  d.rankings.push(pre);
  const id = nextIdFn(d);
  d.news.push({
    id: id('n'),
    season,
    week: 0,
    type: 'program',
    headline: `${info.school} names ${userCoach.firstName} ${userCoach.lastName} head coach`,
    teamIds: [info.id],
    importance: 100,
  });
  const top = pre.poll[0];
  d.news.push({
    id: id('n'),
    season,
    week: 0,
    type: 'ranking',
    headline: `${TEAM_BY_ID[top.teamId].school} opens the ${season} season at #1 in the preseason Top 25`,
    teamIds: [top.teamId],
    importance: 70,
  });
  return d;
}

export function gamesForWeek(d: Dynasty, week: number): Game[] {
  return d.schedule.filter((g) => g.season === d.season && g.week === week);
}

export function userGame(d: Dynasty, week = d.week): Game | undefined {
  return gamesForWeek(d, week).find((g) => g.homeId === d.userTeamId || g.awayId === d.userTeamId);
}

export function userSideOf(d: Dynasty, g: Game): Side | undefined {
  return g.homeId === d.userTeamId ? 'home' : g.awayId === d.userTeamId ? 'away' : undefined;
}

export function buildGameSetup(d: Dynasty, g: Game, opts: { promptFourthDown?: boolean } = {}): GameSetup {
  const userSide = userSideOf(d, g);
  const settings: Partial<Record<Side, CoachingSettings>> = {};
  if (userSide) settings[userSide] = { ...d.coachingSettings };
  g.homeRank = currentRank(d, g.homeId);
  g.awayRank = currentRank(d, g.awayId);
  return gameSetupFor(d, g.homeId, g.awayId, {
    seed: g.seed,
    neutralSite: g.neutralSite,
    rivalry: !!g.rivalryId,
    week: g.week,
    settings,
    userSide,
    promptFourthDown: opts.promptFourthDown,
  });
}

/** Record a finished game into standings, stats, injuries, Elo and news. */
export function applyGameResult(d: Dynasty, g: Game, result: GameResult): void {
  if (g.played) return;
  g.played = true;
  g.result = result;
  const home = d.teams[g.homeId];
  const away = d.teams[g.awayId];
  const homeWon = result.homeScore > result.awayScore;
  const rec = (t: typeof home, won: boolean, pf: number, pa: number, isHome: boolean) => {
    const r = t.record;
    if (won) r.w++;
    else r.l++;
    if (g.conferenceGame) won ? r.confW++ : r.confL++;
    if (!g.neutralSite) {
      if (isHome) won ? r.homeW++ : r.homeL++;
      else won ? r.awayW++ : r.awayL++;
    }
    r.pf += pf;
    r.pa += pa;
    r.streak = won ? (r.streak > 0 ? r.streak + 1 : 1) : r.streak < 0 ? r.streak - 1 : -1;
  };
  rec(home, homeWon, result.homeScore, result.awayScore, true);
  rec(away, !homeWon, result.awayScore, result.homeScore, false);

  const teamStat = (t: typeof home, mine: GameResult['home'], theirs: GameResult['home']) => {
    const s = t.stats;
    s.games++;
    s.points += mine.score;
    s.pointsAllowed += theirs.score;
    s.totalYards += mine.totalYards;
    s.passYards += mine.passYards;
    s.rushYards += mine.rushYards;
    s.yardsAllowed += theirs.totalYards;
    s.turnovers += mine.turnovers;
    s.takeaways += theirs.turnovers;
    s.sacks += mine.sacks;
    s.thirdDownAtt += mine.thirdDownAtt;
    s.thirdDownConv += mine.thirdDownConv;
    s.redZoneAtt += mine.redZoneAtt;
    s.redZoneTD += mine.redZoneTD;
  };
  teamStat(home, result.home, result.away);
  teamStat(away, result.away, result.home);

  for (const line of result.playerLines) {
    const p = d.players[line.playerId];
    if (!p) continue;
    const { playerId: _pid, teamId: _tid, ...stats } = line;
    mergeStatLine(p.seasonStats, stats);
    mergeStatLine(p.careerStats, stats);
  }
  for (const inj of result.injuries) {
    const p = d.players[inj.playerId];
    if (p && (!p.injury || p.injury.weeksRemaining < inj.weeks)) p.injury = { type: inj.type, weeksRemaining: inj.weeks, week: g.week };
  }

  // Coach records.
  for (const [t, won] of [[home, homeWon], [away, !homeWon]] as const) {
    const hc = d.coaches[t.coachIds.HC];
    if (hc) won ? hc.careerWins++ : hc.careerLosses++;
  }

  // Keep full box scores for the user's games; trim CPU box scores to notable lines to keep saves small.
  if (g.homeId !== d.userTeamId && g.awayId !== d.userTeamId) {
    result.playerLines = result.playerLines.filter(
      (l) => (l.passAtt ?? 0) > 0 || (l.rushAtt ?? 0) >= 5 || (l.rec ?? 0) >= 2 || (l.tackles ?? 0) >= 4 || (l.sacks ?? 0) > 0 || (l.defInt ?? 0) > 0 || (l.fga ?? 0) > 0,
    );
  }

  updateElo(home, away, g);
  d.news.push(...gameNews(d, g, () => nextIdFn(d)('n')));
}

export function simulateGameFully(d: Dynasty, g: Game): GameResult {
  const engine = new GameSimulation(buildGameSetup(d, g));
  engine.simulateToEnd();
  const result = engine.result();
  applyGameResult(d, g, result);
  return result;
}

/** Simulate every unplayed game in the current week, then advance to the next week. */
/** Simulate every unplayed game in the current week, then advance the season (regular → CCG → bowls/CFP → champion). */
export function completeWeek(d: Dynasty): void {
  if (d.phase === 'seasonComplete' || d.phase === 'offseason') return;
  const week = d.week;
  for (const g of gamesForWeek(d, week)) if (!g.played) simulateGameFully(d, g);

  // Injuries heal (only those from earlier weeks tick down this week).
  for (const p of Object.values(d.players)) {
    if (!p.injury) continue;
    if (p.injury.week < week) p.injury.weeksRemaining--;
    if (p.injury.weeksRemaining <= 0) p.injury = null;
  }
  // CPU coaches reset depth charts every week; the user's order is preserved.
  for (const t of Object.values(d.teams)) {
    const roster = t.rosterIds.map((id) => d.players[id]).filter(Boolean);
    t.depthChart = t.id === d.userTeamId ? reconcileDepthChart(t.depthChart, roster) : autoDepthChart(roster);
  }

  const id = () => nextIdFn(d)('n');
  if (d.phase === 'regular' || d.phase === 'ccg') {
    const prev = d.rankings[d.rankings.length - 1];
    const poll = computePoll(d, week);
    d.rankings.push(poll);
    d.news.push(...rankingNews(d, poll, prev, id));
  }

  if (d.phase === 'regular') {
    d.week = week + 1;
    if (week >= SCHEDULE_RULES.regularSeasonWeeks) {
      d.news.push(...seasonSummaryNews(d));
      const ccgWeek = createConferenceChampionships(d);
      if (ccgWeek !== null) {
        d.phase = 'ccg';
        d.week = ccgWeek;
        for (const g of gamesForWeek(d, ccgWeek))
          d.news.push({ id: id(), season: d.season, week, type: 'program', headline: `${g.postseason!.name} set: ${school(g.homeId)} vs ${school(g.awayId)}`, teamIds: [g.homeId, g.awayId], importance: 75 });
      } else setupPostseason(d);
    }
  } else if (d.phase === 'ccg') {
    setupPostseason(d);
  } else if (d.phase === 'postseason') {
    const next = nextRoundAfter(week);
    const cfpDone = !next;
    if (next) {
      const games = createPlayoffRound(d, next);
      d.week = next.week;
      if (!games.length) crownChampion(d);
    }
    if (cfpDone) crownChampion(d);
  }
  d.updatedAt = Date.now();
}

function school(id: string): string {
  return TEAM_BY_ID[id]?.school ?? id;
}

/** After championship week: awards, playoff selection, first round and bowls. */
function setupPostseason(d: Dynasty): void {
  const id = () => nextIdFn(d)('n');
  const champions = recordConferenceChampions(d);
  const awards = computeAwards(d, champions);
  const seeds = selectPlayoffField(d, champions);
  const top25 = d.rankings[d.rankings.length - 1]?.poll.map((e) => e.teamId) ?? [];
  d.postseason = { season: d.season, conferenceChampions: champions, cfpSeeds: seeds, selectionRanking: top25, awards };
  for (const [conf, teamId] of Object.entries(champions)) {
    const coach = d.coaches[d.teams[teamId].coachIds.HC];
    if (coach) coach.confTitles = (coach.confTitles ?? 0) + 1;
    d.news.push({ id: id(), season: d.season, week: d.week, type: 'milestone', headline: `${school(teamId)} are ${CONFERENCE_BY_ID[conf].name} champions`, teamIds: [teamId], importance: 80 });
  }
  for (const s of seeds) {
    const coach = d.coaches[d.teams[s.teamId].coachIds.HC];
    if (coach) coach.playoffApps = (coach.playoffApps ?? 0) + 1;
  }
  const byes = seeds.slice(0, PLAYOFF_CONFIG.byes).map((s) => school(s.teamId));
  d.news.push({
    id: id(),
    season: d.season,
    week: d.week,
    type: 'milestone',
    headline: `Playoff field set: ${school(seeds[0]?.teamId ?? '')} is the #1 seed${byes.length > 1 ? `; byes for ${byes.slice(1).join(', ')}` : ''}`,
    teamIds: seeds.map((s) => s.teamId),
    importance: 95,
  });
  if (seeds.some((s) => s.teamId === d.userTeamId)) {
    const s = seeds.find((x) => x.teamId === d.userTeamId)!;
    d.news.push({ id: id(), season: d.season, week: d.week, type: 'program', headline: `${school(d.userTeamId)} makes the College Football Playoff as the #${s.seed} seed`, teamIds: [d.userTeamId], importance: 99 });
  }
  const heisman = awards.find((a) => a.id === 'heisman');
  if (heisman) {
    d.news.push({ id: id(), season: d.season, week: d.week, type: 'milestone', headline: `${heisman.winnerName} (${school(heisman.teamId)}) wins the ${heisman.name}`, teamIds: [heisman.teamId], importance: 92 });
    const coach = d.coaches[d.teams[heisman.teamId].coachIds.HC];
    if (coach) coach.heismans = (coach.heismans ?? 0) + 1;
  }
  const coy = awards.find((a) => a.id === 'coy');
  if (coy?.coachId && d.coaches[coy.coachId]) d.coaches[coy.coachId].coyAwards = (d.coaches[coy.coachId].coyAwards ?? 0) + 1;

  const r1 = firstRound();
  createPlayoffRound(d, r1);
  createBowls(d, new Set(seeds.map((s) => s.teamId)));
  d.phase = 'postseason';
  d.week = Math.min(r1.week, BOWLS.week);
}

function crownChampion(d: Dynasty): void {
  const ps = d.postseason;
  const final = postseasonGames(d).filter((g) => g.postseason?.kind === 'cfp' && g.played).sort((a, b) => b.week - a.week)[0];
  const champ = final ? winnerOf(final) : undefined;
  if (ps && final && champ) {
    ps.champion = champ;
    ps.runnerUp = loserOf(final);
    const r = final.result!;
    ps.titleScore = `${Math.max(r.homeScore, r.awayScore)}-${Math.min(r.homeScore, r.awayScore)}`;
    const coach = d.coaches[d.teams[champ].coachIds.HC];
    if (coach) coach.natTitles = (coach.natTitles ?? 0) + 1;
    d.news.push({ id: nextIdFn(d)('n'), season: d.season, week: final.week, type: 'milestone', headline: `${school(champ)} win the national championship, beating ${school(ps.runnerUp!)} ${ps.titleScore}`, teamIds: [champ], importance: 100 });
  }
  // Bowl records for head coaches.
  for (const g of postseasonGames(d).filter((x) => x.played && x.postseason?.kind !== 'ccg')) {
    const w = winnerOf(g)!;
    const l = loserOf(g)!;
    const cw = d.coaches[d.teams[w]?.coachIds.HC];
    const cl = d.coaches[d.teams[l]?.coachIds.HC];
    if (cw) cw.bowlWins = (cw.bowlWins ?? 0) + 1;
    if (cl) cl.bowlLosses = (cl.bowlLosses ?? 0) + 1;
  }
  const poll = computePoll(d, d.week);
  d.rankings.push(poll);
  d.phase = 'seasonComplete';
  recordSeasonHistory(d);
}

/** Store the season permanently (viewable for decades). */
function recordSeasonHistory(d: Dynasty): void {
  const ps = d.postseason;
  const user = d.teams[d.userTeamId];
  const coach = d.coaches[d.userCoachId];
  const finalPoll = d.rankings[d.rankings.length - 1]?.poll ?? [];
  const finalRank = finalPoll.find((e) => e.teamId === d.userTeamId)?.rank ?? 0;
  const entry: SeasonHistory = {
    season: d.season,
    champion: ps?.champion,
    runnerUp: ps?.runnerUp,
    titleScore: ps?.titleScore,
    cfpField: ps?.cfpSeeds.map((s) => s.teamId) ?? [],
    conferenceChampions: ps?.conferenceChampions ?? {},
    awards: ps?.awards ?? [],
    finalTop25: finalPoll.map((e) => ({ teamId: e.teamId, w: e.w, l: e.l })),
    user: {
      teamId: d.userTeamId,
      coachName: `${coach.firstName} ${coach.lastName}`,
      w: user.record.w,
      l: user.record.l,
      confW: user.record.confW,
      confL: user.record.confL,
      finalRank,
      postseason: postseasonSummary(d, d.userTeamId),
    },
    draft: [],
  };
  d.history = d.history.filter((h) => h.season !== d.season);
  d.history.push(entry);
  coach.seasons = [...(coach.seasons ?? []).filter((x) => x.season !== d.season), { season: d.season, teamId: d.userTeamId, w: user.record.w, l: user.record.l, finalRank, result: entry.user.postseason }];
}

/** Deterministic seed helper for exhibition games. */
export function exhibitionSeed(homeId: string, awayId: string): number {
  return seedFrom(homeId, awayId, Date.now());
}

export function isUserTeamGame(d: Dynasty, g: Game): boolean {
  return g.homeId === d.userTeamId || g.awayId === d.userTeamId;
}

export function universeTeamIds(d: Dynasty): string[] {
  return Object.keys(d.teams).filter(isUniverseTeam);
}


function seasonSummaryNews(d: Dynasty): Dynasty['news'] {
  const out: Dynasty['news'] = [];
  const top = d.rankings[d.rankings.length - 1]?.poll[0];
  const week = SCHEDULE_RULES.regularSeasonWeeks;
  if (top) {
    out.push({
      id: nextIdFn(d)('n'),
      season: d.season,
      week,
      type: 'milestone',
      headline: `Regular season complete: ${TEAM_BY_ID[top.teamId].school} (${top.w}-${top.l}) finishes #1`,
      teamIds: [top.teamId],
      importance: 90,
    });
  }
  const u = d.teams[d.userTeamId].record;
  out.push({
    id: nextIdFn(d)('n'),
    season: d.season,
    week,
    type: 'milestone',
    headline: `${TEAM_BY_ID[d.userTeamId].school} finishes the regular season ${u.w}-${u.l} (${u.confW}-${u.confL} conference)`,
    teamIds: [d.userTeamId],
    importance: 85,
  });
  return out;
}
