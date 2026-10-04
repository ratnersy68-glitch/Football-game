/**
 * Season — the dynasty orchestrator: creating a dynasty, building game configs, applying results
 * (stats, XP, injuries, records, rivalries, rankings), weekly simulation, playoffs, season end and offseason.
 */
import type { Dynasty, GameRecord, Program, NewsItem, OffseasonReport, UpgradeKey } from './types';
import { LCPS_TEAMS, getTeam, isLcps, isRivalry, rivalryName, programExpectation } from '../data/teams';
import { RNG } from '../game/rng';
import { generateRoster, ovr, fullName, talentFromRating } from '../game/players';
import { addStats, emptyStats, type PlayerData, type Weather, type TimeOfDay } from '../game/types';
import { GameSession, type GameConfig, type GameResult } from '../game/GameSession';
import { generateSchedule } from './Schedule';
import { initialElo, updateElo, computeRankings, rankOf } from './Rankings';
import { computeStandings, recordOf } from './Standings';
import { createBracket, scheduleRound, advanceBracket, roundComplete, teamPlayoffResult, CHAMPIONSHIP_SITE } from './Playoffs';
import { computeAwards } from './Awards';
import { emptyRecordBook, recordGameStats, recordSeasonStats, recordTeamGame, recordTeamSeason } from './Records';
import { gameXp, addXp, autoSpend, practiceXp, offseasonGrowth, generateFreshmanClass, graduate, closeSeasonStats, teamRatings } from './Development';
import { postGameInjuries, healWeek, rollWeeklyEvents } from './Events';
import { buildStory } from './Stories';
import type { Atmosphere } from '../game/render/Renderer';
import type { IntroInfo } from '../screens/GameScreen';
import type { Difficulty } from '../game/types';

export const START_YEAR = 2026;
const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

function seedFrom(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

export function newProgram(teamId: string, rng: RNG): Program {
  const t = getTeam(teamId);
  const fac = Math.max(0, Math.min(5, Math.round(t.prestige - 1 + rng.range(-0.6, 0.6))));
  return {
    teamId,
    prestige: t.prestige,
    facilities: { weightRoom: fac, practice: fac, coaching: Math.max(0, fac - 1 + rng.int(0, 1)), youth: fac, medicine: Math.max(0, fac - 1), film: Math.max(0, fac - 1), community: fac },
    points: teamId ? 10 : 0,
    roster: generateRoster(t.offenseRating, t.defenseRating, t.specialTeamsRating, rng),
    history: [],
    championships: [],
    regionTitles: [],
    elo: initialElo(teamId, t.prestige, t.offenseRating, t.defenseRating),
    streak: 0,
    bestStreak: 0,
  };
}

export function createDynasty(userTeam: string, coachName: string, slot: 1 | 2 | 3, seed = Math.floor(Math.random() * 1e9), playoffFormat: 'standard' | 'expanded' = 'standard'): Dynasty {
  const rng = new RNG(seed);
  const programs: Record<string, Program> = {};
  for (const t of LCPS_TEAMS) programs[t.id] = newProgram(t.id, rng);
  programs[userTeam].points = 25;
  const d: Dynasty = {
    version: 1, slot, userTeam, coachName: coachName || 'Coach', startYear: START_YEAR, year: START_YEAR, week: 1, phase: 'regular', playoffFormat,
    programs, schedule: generateSchedule(START_YEAR, rng), bracket: null, rankings: [], records: emptyRecordBook(), series: {},
    awards: [], champions: [], news: [], events: [],
    coach: { wins: 0, losses: 0, titles: 0, playoffWins: 0, seasons: 0, coyAwards: 0 }, alumni: [],
  };
  d.rankings.push({ week: 0, order: computeRankings(d) });
  const t = getTeam(userTeam);
  d.news.push({ year: d.year, week: 0, kind: 'program', headline: `${coachName.toUpperCase()} TAKES OVER AT ${t.shortName.toUpperCase()}`, body: `The ${t.mascot} hand the keys to a new head coach. Expectation: ${programExpectation(t)}.`, team: userTeam });
  d.events = rollWeeklyEvents(d, rng);
  return d;
}

// ---------------------------------------------------------------- rosters / configs

const guestRosters = new Map<string, PlayerData[]>();
export function rosterFor(d: Dynasty, team: string): PlayerData[] {
  if (isLcps(team)) return d.programs[team].roster;
  const key = `${team}-${d.year}`;
  if (!guestRosters.has(key)) {
    const t = getTeam(team);
    guestRosters.set(key, generateRoster(t.offenseRating, t.defenseRating, t.specialTeamsRating, new RNG(seedFrom(key))));
  }
  return guestRosters.get(key)!;
}

export function coachingBonus(d: Dynasty, team: string, rivalry = false): number {
  if (!isLcps(team)) return 0;
  const prog = d.programs[team];
  const f = prog.facilities;
  // Team morale (wins, rivalry wins) gives a small edge; rivalry nights fire everyone up.
  const morale = prog.roster.reduce((a, p) => a + p.morale, 0) / Math.max(1, prog.roster.length);
  return (f.coaching ?? 0) * 0.012 + (f.film ?? 0) * 0.008 + (morale - 70) / 1500 + (rivalry ? 0.01 : 0);
}

export function currentRoundName(d: Dynasty): string | null {
  if (d.phase !== 'playoffs' || !d.bracket) return null;
  return d.bracket.rounds[d.week] ?? null;
}

export function currentGames(d: Dynasty): GameRecord[] {
  if (d.phase === 'regular') return d.schedule.filter((g) => g.week === d.week);
  if (d.phase === 'playoffs' && d.bracket) return d.schedule.filter((g) => g.week === 11 + d.week);
  return [];
}

export function userGame(d: Dynasty): GameRecord | undefined {
  return currentGames(d).find((g) => g.home === d.userTeam || g.away === d.userTeam);
}

export function isSeniorNight(d: Dynasty, g: GameRecord): boolean {
  if (g.week > 10 || g.home !== d.userTeam) return false;
  const later = d.schedule.filter((x) => x.week > g.week && x.week <= 10 && x.home === d.userTeam);
  return later.length === 0;
}

export function seriesFor(d: Dynasty, a: string, b: string) {
  return d.series[pairKey(a, b)];
}

export function gameSetup(d: Dynasty, g: GameRecord, opts: { difficulty: Difficulty; quarterLen: number; simDefense: boolean; userPlays: boolean }) {
  const rival = g.rivalry;
  const playoff = g.week > 10;
  const championship = g.round === 'LCPS Bowl';
  const userSide = opts.userPlays ? (g.home === d.userTeam ? 'home' : 'away') : null;
  const config: GameConfig = {
    home: { info: getTeam(g.home), roster: rosterFor(d, g.home), depthOrder: d.programs[g.home]?.depthOrder as never, coaching: coachingBonus(d, g.home, g.rivalry) },
    away: { info: getTeam(g.away), roster: rosterFor(d, g.away), depthOrder: d.programs[g.away]?.depthOrder as never, coaching: coachingBonus(d, g.away, g.rivalry) },
    userSide: userSide as 'home' | 'away' | null,
    difficulty: opts.difficulty,
    quarterLen: opts.quarterLen,
    weather: g.weather,
    timeOfDay: 'night' as TimeOfDay,
    simDefense: opts.simDefense,
    seed: seedFrom(g.id),
    rivalry: rival,
    playoffRound: g.round ?? null,
    championship,
  };
  const homeProg = d.programs[g.home];
  const crowd = Math.min(1, 0.45 + (homeProg ? (homeProg.facilities.community ?? 0) * 0.06 + homeProg.prestige * 0.04 : 0.1) + (rival ? 0.2 : 0) + (playoff ? 0.2 : 0) + (championship ? 0.3 : 0));
  const atmo: Atmosphere = { timeOfDay: 'night', weather: g.weather, crowd, rivalry: rival, playoff, championship };
  const ht = getTeam(g.home);
  const at = getTeam(g.away);
  const tags: string[] = [];
  if (championship) tags.push('LCPS BOWL — STATE CHAMPIONSHIP');
  else if (g.round) tags.push(g.round.toUpperCase());
  if (rival) tags.push(rivalryName(g.home, g.away) === 'Rivalry Game' ? 'RIVALRY GAME' : `RIVALRY GAME · ${rivalryName(g.home, g.away).toUpperCase()}`);
  if (isSeniorNight(d, g)) tags.push('SENIOR NIGHT');
  const hr = isLcps(g.home) ? rankOf(d, g.home) : 0;
  const ar = isLcps(g.away) ? rankOf(d, g.away) : 0;
  if (hr && ar && hr <= 10 && ar <= 10) tags.push(`#${ar} vs #${hr}`);
  if (!tags.length) tags.push(`WEEK ${g.week}`);
  const ser = seriesFor(d, g.home, g.away);
  const series = ser && ser.games.length ? `SERIES (since ${d.startYear}): ${getTeam(ser.a).shortName} ${ser.aWins}, ${getTeam(ser.b).shortName} ${ser.bWins}` : undefined;
  const intro: IntroInfo = {
    title: championship ? 'LCPS BOWL' : playoff ? 'PLAYOFF FRIDAY' : 'FRIDAY NIGHT',
    kickoff: championship ? 'Saturday · 7:00 PM' : 'Friday · 7:00 PM',
    stadium: championship ? CHAMPIONSHIP_SITE : ht.stadium,
    tags,
    homeRecord: isLcps(g.home) ? `${recordOf(d, g.home)}${hr ? ` · #${hr}` : ''}` : undefined,
    awayRecord: isLcps(g.away) ? `${recordOf(d, g.away)}${ar ? ` · #${ar}` : ''}` : undefined,
    series,
    pa: championship
      ? `Ladies and gentlemen, welcome to the LCPS Bowl! One game for the championship of Loudoun County!`
      : isSeniorNight(d, g)
        ? `Tonight we honor the seniors of ${ht.shortName} High School, playing their final regular-season home game!`
        : rival
          ? `It's rivalry night at ${ht.stadium.split(' (')[0]}! The ${at.mascot} are in town and this place is PACKED!`
          : `Welcome to ${ht.stadium.split(' (')[0]}! Tonight, the ${at.shortName} ${at.mascot} take on your ${ht.shortName} ${ht.mascot}!`,
  };
  return { config, atmo, intro };
}

// ---------------------------------------------------------------- results

/** Applies a finished game (played by the human or simulated) to the dynasty. */
export function applyResult(d: Dynasty, g: GameRecord, r: GameResult, session?: GameSession, rng = new RNG(seedFrom(g.id) + 7)) {
  if (g.played) return;
  g.played = true;
  g.homeScore = r.homeScore;
  g.awayScore = r.awayScore;
  g.ot = r.ot;
  const winner = r.homeScore > r.awayScore ? g.home : g.away;
  const loser = winner === g.home ? g.away : g.home;
  // Elo & streaks
  const preRankW = isLcps(winner) ? rankOf(d, winner) : 99;
  const preRankL = isLcps(loser) ? rankOf(d, loser) : 99;
  updateElo(d, g);
  for (const t of [g.home, g.away]) {
    if (!isLcps(t)) continue;
    const p = d.programs[t];
    if (t === winner) { p.streak = p.streak > 0 ? p.streak + 1 : 1; p.bestStreak = Math.max(p.bestStreak, p.streak); }
    else p.streak = p.streak < 0 ? p.streak - 1 : -1;
  }
  const loserStreakBefore = isLcps(loser) ? 0 : 0;
  void loserStreakBefore;
  // Player stats, XP, records
  const notes: string[] = [];
  for (const side of [g.home, g.away]) {
    if (!isLcps(side)) continue;
    const prog = d.programs[side];
    const played = new Set<string>();
    const starters = new Set<string>();
    const byPos: Record<string, PlayerData[]> = {};
    for (const p of prog.roster) (byPos[p.pos] ??= []).push(p);
    for (const [pos, n] of [['QB', 1], ['RB', 1], ['WR', 3], ['TE', 1], ['OL', 5], ['DL', 4], ['LB', 3], ['CB', 2], ['S', 2], ['K', 1]] as [string, number][]) {
      (byPos[pos] ?? []).filter((p) => !(p.injury && p.injury.weeks > 0)).sort((a, b) => ovr(b) - ovr(a)).slice(0, n).forEach((p) => starters.add(p.id));
    }
    const opp = getTeam(side === g.home ? g.away : g.home).shortName;
    for (const p of prog.roster) {
      const s = r.stats[p.id];
      if (!s) continue;
      const active = starters.has(p.id) || Object.entries(s).some(([k, v]) => k !== 'gp' && v);
      if (!active) continue;
      played.add(p.id);
      const line = { ...s, gp: 1 };
      addStats(p.season, line);
      addStats(p.career, line);
      recordGameStats(d, side, p, line, `vs ${opp}, ${d.year}`);
      const ups = addXp(p, gameXp(line, starters.has(p.id)) + (side === winner ? 10 : 0));
      if (side !== d.userTeam || !ups) autoSpend(p, rng);
    }
    // Injuries
    const inj = postGameInjuries(prog, played, rng);
    if (side === d.userTeam) for (const i of inj) d.news.push({ year: d.year, week: g.week, kind: 'injury', headline: `INJURY: ${i}`, team: side });
    const us = side === g.home ? r.homeScore : r.awayScore;
    const them = side === g.home ? r.awayScore : r.homeScore;
    recordTeamGame(d, side, us, them, opp);
  }
  // Series history
  const k = pairKey(g.home, g.away);
  const [a, b] = k.split('|');
  const ser = d.series[k] ?? { a, b, aWins: 0, bWins: 0, games: [] };
  if (winner === a) ser.aWins++; else ser.bWins++;
  ser.games.push({ year: d.year, week: g.week, winner, score: `${Math.max(r.homeScore, r.awayScore)}–${Math.min(r.homeScore, r.awayScore)}`, round: g.round });
  d.series[k] = ser;
  // Story & news
  if (session) {
    const upset = preRankW - preRankL >= 5 && preRankL <= 8;
    const prog = isLcps(winner) ? d.programs[winner] : undefined;
    const story = buildStory(session, {
      playoffRound: g.round, championship: g.round === 'LCPS Bowl', upset,
      winnerRecord: prog ? recordOf(d, winner) : undefined,
      seniorNight: isSeniorNight(d, g),
    });
    if (story) {
      g.story = story;
      const involvesUser = g.home === d.userTeam || g.away === d.userTeam;
      if (involvesUser || upset || g.rivalry || g.week > 10) {
        d.news.push({ year: d.year, week: g.week, kind: 'story', headline: story.headline, body: story.body.join(' '), team: winner });
      }
    }
  }
  // Coach & program points
  if (g.home === d.userTeam || g.away === d.userTeam) {
    const prog = d.programs[d.userTeam];
    const won = winner === d.userTeam;
    if (won) d.coach.wins++; else d.coach.losses++;
    let pts = won ? 3 : 1;
    if (won && g.rivalry) pts += 2;
    if (won && preRankL < preRankW - 3) pts += 2;
    if (won && g.week > 10) { pts += 5; d.coach.playoffWins++; }
    prog.points += pts;
    for (const p of prog.roster) p.morale = Math.max(20, Math.min(100, p.morale + (won ? (g.rivalry ? 6 : 3) : -3)));
  }
  if (d.phase === 'playoffs') advanceBracket(d, g);
  if (d.news.length > 300) d.news.splice(0, d.news.length - 300);
  void notes;
}

export function simulateGame(d: Dynasty, g: GameRecord, quarterLen: number): { result: GameResult; session: GameSession } {
  const { config } = gameSetup(d, g, { difficulty: 'VARSITY', quarterLen, simDefense: true, userPlays: false });
  const s = new GameSession(config);
  const result = s.simulateToEnd();
  return { result, session: s };
}

/** Async: simulate all unplayed games this week (yields between games for UI progress). */
export async function simulateRemaining(d: Dynasty, quarterLen: number, onProgress?: (done: number, total: number, label: string) => void) {
  const games = currentGames(d).filter((g) => !g.played);
  let i = 0;
  for (const g of games) {
    onProgress?.(i, games.length, `${getTeam(g.away).shortName} @ ${getTeam(g.home).shortName}`);
    await new Promise((res) => setTimeout(res, 0));
    const { result, session } = simulateGame(d, g, quarterLen);
    applyResult(d, g, result, session);
    i++;
  }
  onProgress?.(i, games.length, 'Done');
}

/** After every game in the week is played: practice, healing, rankings, events, advance. */
export function finishWeek(d: Dynasty): { ended: 'week' | 'regular' | 'round' | 'season' } {
  const rng = new RNG(seedFrom(`${d.year}-${d.phase}-${d.week}`));
  for (const t of LCPS_TEAMS) {
    const prog = d.programs[t.id];
    practiceXp(prog, rng, t.id === d.userTeam);
    const back = healWeek(prog);
    if (t.id === d.userTeam) for (const b of back) d.news.push({ year: d.year, week: d.week, kind: 'injury', headline: `BACK IN ACTION: ${b} is healthy`, team: t.id });
  }
  const order = computeRankings(d);
  const weekNo = d.phase === 'regular' ? d.week : 10 + d.week + 1;
  d.rankings.push({ week: weekNo, order });
  if (d.rankings.length > 40) d.rankings.shift();
  d.news.push({ year: d.year, week: weekNo, kind: 'ranking', headline: `LCPS TOP 5: ${order.slice(0, 5).map((t, i) => `${i + 1}. ${getTeam(t).shortName}`).join('  ')}` });
  let ended: 'week' | 'regular' | 'round' | 'season' = 'week';
  if (d.phase === 'regular') {
    if (d.week >= 10) {
      d.phase = 'playoffs';
      d.week = 0;
      d.bracket = createBracket(d, d.playoffFormat ?? 'standard');
      scheduleRound(d, 0);
      const user = d.userTeam;
      const inIt = d.bracket.seeds.north.includes(user) || d.bracket.seeds.south.includes(user);
      d.news.push({ year: d.year, week: 11, kind: 'event', headline: inIt ? `${getTeam(user).shortName.toUpperCase()} IS IN THE PLAYOFFS!` : `${getTeam(user).shortName} misses the playoffs`, team: user });
      ended = 'regular';
    } else d.week++;
  } else if (d.phase === 'playoffs' && d.bracket) {
    if (d.bracket.champion) {
      endSeason(d);
      ended = 'season';
    } else if (roundComplete(d, d.week)) {
      d.week++;
      scheduleRound(d, d.week);
      ended = 'round';
    }
  }
  if (d.phase === 'regular' || d.phase === 'playoffs') d.events = rollWeeklyEvents(d, rng);
  else d.events = [];
  return { ended };
}

// ---------------------------------------------------------------- season end / offseason

export function endSeason(d: Dynasty) {
  const b = d.bracket!;
  d.phase = 'season_end';
  d.champions.push({ year: d.year, team: b.champion!, runnerUp: b.runnerUp!, score: b.finalScore ?? '' });
  const champ = getTeam(b.champion!);
  d.news.push({ year: d.year, week: 15, kind: 'champion', headline: `${d.year} LCPS BOWL CHAMPIONS: ${champ.shortName.toUpperCase()} ${champ.mascot.toUpperCase()}`, body: `${champ.shortName} defeated ${getTeam(b.runnerUp!).shortName} ${b.finalScore}.`, team: champ.id });
  // Awards
  const aw = computeAwards(d);
  d.awards.push(aw);
  if (d.awards.length > 30) d.awards.shift();
  for (const w of aw.winners) if (w.team === d.userTeam) d.news.push({ year: d.year, week: 16, kind: 'award', headline: `${w.award.toUpperCase()}: ${w.name}`, body: w.line, team: w.team });
  if (aw.winners.find((w) => w.award === 'Coach of the Year')?.team === d.userTeam) d.coach.coyAwards++;
  const st = computeStandings(d, true);
  const reg = computeStandings(d, false);
  const order = computeRankings(d);
  for (const t of LCPS_TEAMS) {
    const prog = d.programs[t.id];
    const row = st.find((x) => x.team === t.id)!;
    const rrow = reg.find((x) => x.team === t.id)!;
    const result = teamPlayoffResult(d, t.id);
    const champion = b.champion === t.id;
    if (champion) prog.championships.push(d.year);
    const regionChamp = b.games.find((g) => g.region && g.winner === t.id && !b.games.some((x) => x.region === g.region && x.round > g.round));
    if (regionChamp) prog.regionTitles.push(d.year);
    prog.history.push({ year: d.year, wins: row.w, losses: row.l, districtWins: rrow.dw, districtLosses: rrow.dl, pf: row.pf, pa: row.pa, finalRank: order.indexOf(t.id) + 1, playoff: result, champion, coach: t.id === d.userTeam ? d.coachName : undefined });
    // Prestige evolves
    const winPct = row.w / Math.max(1, row.w + row.l);
    const pBonus = champion ? 0.6 : result === 'Runner-up' ? 0.35 : result.includes('Regional Final') ? 0.2 : result === 'Missed' ? -0.12 : 0.08;
    prog.prestige = Math.max(1, Math.min(5, prog.prestige + (winPct - 0.55) * 0.9 + pBonus + (prog.facilities.community ?? 0) * 0.03 + (3 - prog.prestige) * 0.05));
    for (const p of prog.roster) recordSeasonStats(d, t.id, p);
    recordTeamSeason(d, t.id, row.w, prog.bestStreak, prog.championships.length);
  }
  const user = d.programs[d.userTeam];
  if (b.champion === d.userTeam) { d.coach.titles++; user.points += 15; }
  user.points += Math.round(user.prestige * 3);
  d.coach.seasons++;
}

/** CPU programs invest in facilities based on prestige. */
function cpuFacilityGrowth(prog: Program, rng: RNG) {
  const keys: UpgradeKey[] = ['weightRoom', 'practice', 'coaching', 'youth', 'medicine', 'film', 'community'];
  const budget = prog.prestige >= 4 ? 2 : prog.prestige >= 3 ? 1 : rng.chance(0.5) ? 1 : 0;
  for (let i = 0; i < budget; i++) {
    const k = rng.pick(keys);
    prog.facilities[k] = Math.min(5, (prog.facilities[k] ?? 0) + 1);
  }
  if (prog.prestige < 2 && rng.chance(0.3)) {
    const k = rng.pick(keys);
    prog.facilities[k] = Math.max(0, (prog.facilities[k] ?? 0) - 1);
  }
}

export function runOffseason(d: Dynasty): OffseasonReport {
  const rng = new RNG(seedFrom(`off-${d.year}`));
  const report: OffseasonReport = { year: d.year, graduated: [], improved: [], freshmen: [], prestigeFrom: d.programs[d.userTeam].history.slice(-1)[0] ? d.programs[d.userTeam].prestige : 0, prestigeTo: 0, pointsEarned: 0 };
  const pointsBefore = d.programs[d.userTeam].points;
  for (const t of LCPS_TEAMS) {
    const prog = d.programs[t.id];
    closeSeasonStats(prog, d.year);
    const grads = graduate(prog);
    if (t.id === d.userTeam) {
      for (const p of grads) {
        report.graduated.push({ name: fullName(p), pos: p.pos, ovr: ovr(p) });
        d.alumni.push({ name: fullName(p), pos: p.pos, years: `${d.year - (p.history?.length ?? 1) + 1}–${d.year}`, ovr: ovr(p), career: p.career });
      }
      if (d.alumni.length > 200) d.alumni.splice(0, d.alumni.length - 200);
    }
    const growth = offseasonGrowth(prog, rng);
    if (t.id === d.userTeam) {
      report.improved = growth.filter((g) => g.to - g.from >= 3).sort((a, b) => (b.to - b.from) - (a.to - a.from)).slice(0, 12).map((g) => ({ name: fullName(g.p), pos: g.p.pos, from: g.from, to: g.to }));
    }
    const base = talentFromRating((getTeam(t.id).offenseRating + getTeam(t.id).defenseRating) / 2);
    const fresh = generateFreshmanClass(prog, base, rng);
    prog.roster.push(...fresh);
    if (t.id === d.userTeam) report.freshmen = fresh.sort((a, b) => b.potential - a.potential).map((p) => ({ name: fullName(p), pos: p.pos, ovr: ovr(p), pot: p.potential }));
    if (t.id !== d.userTeam) { cpuFacilityGrowth(prog, rng); prog.depthOrder = undefined; }
    else if (prog.depthOrder) {
      // Drop graduated players from the custom depth chart
      const ids = new Set(prog.roster.map((p) => p.id));
      for (const k of Object.keys(prog.depthOrder) as (keyof typeof prog.depthOrder)[]) prog.depthOrder[k] = prog.depthOrder[k]!.filter((id) => ids.has(id));
    }
    // Elo regresses toward program strength each year
    const tr = teamRatings(prog.roster);
    prog.elo = prog.elo * 0.5 + (1500 + (tr.ovr - 62) * 9 + (prog.prestige - 3) * 30) * 0.5;
    prog.streak = 0;
    prog.bestStreak = 0;
    for (const p of prog.roster) { p.injury = p.injury && p.injury.weeks > 8 ? { ...p.injury, weeks: Math.max(0, p.injury.weeks - 8) } : undefined; }
  }
  report.prestigeTo = d.programs[d.userTeam].prestige;
  report.pointsEarned = d.programs[d.userTeam].points - pointsBefore;
  d.year++;
  d.week = 1;
  d.phase = 'regular';
  d.bracket = null;
  d.schedule = generateSchedule(d.year, rng);
  d.rankings = [{ week: 0, order: computeRankings(d) }];
  d.lastOffseason = report;
  d.offseasonPending = true;
  d.events = rollWeeklyEvents(d, rng);
  d.news.push({ year: d.year, week: 0, kind: 'program', headline: `${d.year} PRESEASON: ${getTeam(d.userTeam).shortName} welcomes ${report.freshmen.length} newcomers`, team: d.userTeam });
  return report;
}

export function upgradeCost(level: number) {
  return 12 + level * 10;
}

export function buyUpgrade(d: Dynasty, key: UpgradeKey): boolean {
  const prog = d.programs[d.userTeam];
  const lvl = prog.facilities[key] ?? 0;
  if (lvl >= 5) return false;
  const cost = upgradeCost(lvl);
  if (prog.points < cost) return false;
  prog.points -= cost;
  prog.facilities[key] = lvl + 1;
  d.news.push({ year: d.year, week: d.week, kind: 'program', headline: `PROGRAM UPGRADE: ${key} improved to level ${lvl + 1}`, team: d.userTeam });
  return true;
}

export function seasonLabel(d: Dynasty): string {
  if (d.phase === 'regular') return `WEEK ${d.week}`;
  if (d.phase === 'playoffs') return (currentRoundName(d) ?? 'PLAYOFFS').toUpperCase();
  if (d.phase === 'season_end') return 'SEASON COMPLETE';
  return 'OFFSEASON';
}

export function userRecordLine(d: Dynasty) {
  const r = computeStandings(d, true).find((x) => x.team === d.userTeam)!;
  return { w: r.w, l: r.l, dw: r.dw, dl: r.dl, rank: rankOf(d, d.userTeam), streak: r.streak };
}

export function newsFor(d: Dynasty, n = 30): NewsItem[] {
  return [...d.news].reverse().slice(0, n);
}

export { emptyStats, isRivalry };
export type { Weather };
