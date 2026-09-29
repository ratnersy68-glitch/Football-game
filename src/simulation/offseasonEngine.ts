/**
 * Offseason: turns a finished season into the next one.
 *   startOffseason:  archive stats → early declarations → NFL draft → graduation → player development →
 *                    signing classes (auto-generated until the recruiting system exists) → prestige evolution
 *   startNextSeason: new schedule, reset records, Elo carry-over, preseason poll
 */
import { POSITION_ORDER, POSITIONS, TEAMS, TEAM_BY_ID, isUniverseTeam } from '../data';
import { Rng, seedFrom } from '../core/rng';
import { clamp } from '../core/util';
import type { ClassYear, DraftPick, Dynasty, OffseasonSummary, Player, Position, TeamState } from '../models/types';
import { autoDepthChart, reconcileDepthChart } from './depthChart';
import { computeOverall } from './playerRatings';
import { generatePlayer, type IdGen } from './rosterGenerator';
import { computePoll, initialElo } from './rankingEngine';
import { generateSchedule } from './scheduleGenerator';
import { emptyRecord, emptyTeamSeasonStats } from './world';

const DRAFT_ROUNDS = 7;
const PICKS_PER_ROUND = 32;
const CLASS_POINTS: Record<number, number> = { 5: 100, 4: 60, 3: 30, 2: 12, 1: 5 };

function nextId(d: Dynasty): IdGen {
  return (prefix: string) => `${prefix}${d.nextId++}`;
}

function name(p: Player): string {
  return `${p.firstName} ${p.lastName}`;
}

function roster(d: Dynasty, t: TeamState): Player[] {
  return t.rosterIds.map((id) => d.players[id]).filter(Boolean);
}

// ───────────────────────── Development ─────────────────────────

const DEV_RATE: Record<number, number> = { 1: 0.38, 2: 0.34, 3: 0.32, 4: 0.25 };

/** One offseason of growth. Returns the overall change. Depends on potential, work ethic, development
 * rate, coaching, facilities, playing time, injuries and luck — including breakouts and busts. */
export function developPlayer(rng: Rng, p: Player, ctx: { coachDev: number; facilities: number }): number {
  const before = p.overall;
  const room = Math.max(0, p.potential - p.overall);
  const h = p.hidden;
  let g = room * (DEV_RATE[p.year] ?? 0.25);
  g += (h.workEthic - 50) / 40 + (h.developmentRate - 50) / 40;
  g += (ctx.coachDev - 70) / 15 + (ctx.facilities - 75) / 25;
  const gp = p.seasonStats.gp ?? 0;
  g += gp >= 8 ? 0.8 : gp === 0 ? -0.4 : 0;
  if (p.injury && p.injury.weeksRemaining >= 6) g -= 1;
  g += rng.normal(0, 1.8);
  const breakout = rng.chance(h.developmentRate > 70 ? 0.09 : 0.05);
  const bust = !breakout && rng.chance(h.workEthic < 35 ? 0.08 : 0.04);
  if (breakout) {
    g += rng.float(3, 8);
    p.potential = Math.min(99, p.potential + rng.int(3, 8));
  } else if (bust) {
    g = -rng.float(0.5, 3);
    p.potential = Math.max(40, p.potential - rng.int(3, 7));
  }
  // Nobody grows far past their ceiling without a breakout.
  if (!breakout) g = Math.min(g, room + 1.5);
  for (const k of Object.keys(POSITIONS[p.position].weights)) {
    p.attributes[k] = clamp(Math.round((p.attributes[k] ?? 50) + g * rng.float(0.55, 1.45)), 25, 99);
  }
  p.overall = computeOverall(p.position, p.attributes);
  p.potential = Math.max(p.overall, p.potential);
  return p.overall - before;
}

// ───────────────────────── Draft ─────────────────────────

const POSITION_DRAFT_VALUE: Partial<Record<Position, number>> = { QB: 3, DL: 1.5, OL: 1, CB: 1, WR: 1, K: -18, P: -18 };

function runDraft(rng: Rng, departing: { p: Player; early: boolean }[]): DraftPick[] {
  const graded = departing
    .map(({ p, early }) => ({ p, early, grade: p.overall * 0.75 + p.hidden.proPotential * 0.25 + (POSITION_DRAFT_VALUE[p.position] ?? 0) + rng.normal(0, 3) }))
    .filter((x) => x.grade >= 62)
    .sort((a, b) => b.grade - a.grade)
    .slice(0, DRAFT_ROUNDS * PICKS_PER_ROUND);
  return graded.map((x, i) => ({
    round: Math.floor(i / PICKS_PER_ROUND) + 1,
    pick: (i % PICKS_PER_ROUND) + 1,
    overall: i + 1,
    playerId: x.p.id,
    playerName: name(x.p),
    position: x.p.position,
    teamId: x.p.teamId,
    early: x.early,
  }));
}

// ───────────────────────── Signing classes ─────────────────────────

function classStrength(rng: Rng, d: Dynasty, t: TeamState): number {
  const info = TEAM_BY_ID[t.id];
  const hc = d.coaches[t.coachIds.HC];
  const finalRank = d.rankings[d.rankings.length - 1]?.poll.find((e) => e.teamId === t.id)?.rank ?? 0;
  const success = finalRank ? 60 + (26 - finalRank) * 1.6 : clamp(30 + t.record.w * 4, 20, 70);
  const philosophy = info.philosophy === 'national' ? 3 : info.philosophy === 'regional' ? 1 : 0;
  return 0.33 * info.recruitingPower + 0.35 * t.currentPrestige + 0.14 * (hc?.ratings.recruiting ?? 60) + 0.18 * success + philosophy + rng.normal(0, 4);
}

function signClass(rng: Rng, d: Dynasty, t: TeamState): Player[] {
  const info = TEAM_BY_ID[t.id];
  const current = roster(d, t);
  const count = (pos: Position) => current.filter((p) => p.position === pos).length;
  const needs: Position[] = [];
  for (const pos of POSITION_ORDER) for (let i = count(pos); i < POSITIONS[pos].rosterCount; i++) needs.push(pos);
  // Classes are 16-25 players; extra spots go to high-attrition positions.
  const extras: Position[] = ['WR', 'DL', 'OL', 'CB', 'LB', 'RB', 'S', 'TE'];
  while (needs.length < 16) needs.push(extras[needs.length % extras.length]);
  const size = Math.min(needs.length, 25);
  const strength = classStrength(rng, d, t);
  const used = new Set(current.map((p) => p.jersey));
  const out: Player[] = [];
  for (const pos of needs.slice(0, size)) {
    const specialist = pos === 'K' || pos === 'P';
    let potential = rng.normal((specialist ? 58 : 50) + strength * (specialist ? 0.25 : 0.42), 6.5);
    if (rng.chance(0.03)) potential += rng.float(5, 12); // under-the-radar gem
    potential = clamp(Math.round(potential), 50, 97);
    const room = Math.max(4, rng.normal(info.philosophy === 'development' ? 15 : 13, 4));
    const target = clamp(Math.round(potential - room), 38, 88);
    const p = generatePlayer(rng, nextId(d), { teamId: t.id, team: info, position: pos, year: 1 as ClassYear, targetOverall: target, usedJerseys: used });
    p.redshirted = false;
    p.potential = Math.max(p.overall, potential);
    out.push(p);
  }
  return out;
}

/** Stars from national rank, with scouting noise (some 3-stars are secretly elite, some 5-stars aren't). */
function assignStars(rng: Rng, recruits: Player[]): void {
  const scored = recruits.map((p) => ({ p, s: p.potential + rng.normal(0, 3.5) })).sort((a, b) => b.s - a.s);
  scored.forEach((x, i) => {
    x.p.stars = i < 32 ? 5 : i < 330 ? 4 : i < 1700 ? 3 : 2;
  });
}

// ───────────────────────── Offseason ─────────────────────────

export function startOffseason(d: Dynasty): OffseasonSummary {
  if (d.phase !== 'seasonComplete') throw new Error('Season is not complete');
  const rng = new Rng(seedFrom(d.seed, d.season, 'offseason'));
  const completed = d.season;

  // 1) Archive season lines.
  for (const p of Object.values(d.players)) {
    if (p.seasonStats.gp) {
      p.history = [...(p.history ?? []), { season: completed, teamId: p.teamId, year: p.year, overall: p.overall, stats: p.seasonStats }];
    }
  }

  // 2) Departures: seniors graduate, some draft-ready juniors declare early.
  const departing: { p: Player; early: boolean }[] = [];
  for (const p of Object.values(d.players)) {
    if (p.year >= 4) departing.push({ p, early: false });
    else if (p.year === 3 && p.overall >= 84 && rng.chance(clamp((p.overall - 82) * 0.1 + (p.hidden.proPotential - 70) * 0.01, 0.05, 0.9))) departing.push({ p, early: true });
  }

  // 3) Draft.
  const draft = runDraft(rng, departing);
  for (const pick of draft) {
    const hc = d.coaches[d.teams[pick.teamId]?.coachIds.HC];
    if (hc) hc.draftPicks = (hc.draftPicks ?? 0) + 1;
  }
  const universeDraft = draft.filter((x) => isUniverseTeam(x.teamId));
  const hist = d.history.find((h) => h.season === completed);
  if (hist) hist.draft = universeDraft;

  const userGraduates = departing
    .filter((x) => x.p.teamId === d.userTeamId)
    .map((x) => ({ name: name(x.p), position: x.p.position, overall: x.p.overall }))
    .sort((a, b) => b.overall - a.overall);

  // 4) Remove departed players.
  const gone = new Set(departing.map((x) => x.p.id));
  for (const id of gone) delete d.players[id];
  for (const t of Object.values(d.teams)) t.rosterIds = t.rosterIds.filter((id) => !gone.has(id));

  // 5) Development + class advancement.
  const changes: { p: Player; delta: number; from: number }[] = [];
  for (const t of Object.values(d.teams)) {
    const staff = [t.coachIds.HC, t.coachIds.OC, t.coachIds.DC].map((id) => d.coaches[id]?.ratings.development ?? 65);
    const ctx = { coachDev: (staff[0] + staff[1] + staff[2]) / 3, facilities: TEAM_BY_ID[t.id]?.facilities ?? 70 };
    for (const p of roster(d, t)) {
      const from = p.overall;
      const delta = developPlayer(rng, p, ctx);
      p.year = Math.min(4, p.year + 1) as ClassYear;
      if (isUniverseTeam(t.id)) changes.push({ p, delta, from });
    }
  }
  const mine = changes.filter((c) => c.p.teamId === d.userTeamId);
  const toRow = (c: (typeof changes)[number]) => ({ playerId: c.p.id, name: name(c.p), position: c.p.position, teamId: c.p.teamId, from: c.from, to: c.p.overall });
  const risers = [...mine].sort((a, b) => b.delta - a.delta).slice(0, 8).map(toRow);
  const fallers = [...mine].filter((c) => c.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 5).map(toRow);

  // 6) Signing classes for every program.
  const classes = new Map<string, Player[]>();
  for (const t of Object.values(d.teams)) classes.set(t.id, signClass(rng, d, t));
  assignStars(rng, [...classes.values()].flat());
  const classRankings = [...classes.entries()]
    .map(([teamId, ps]) => {
      const pts = [...ps].sort((a, b) => b.stars - a.stars).slice(0, 25).reduce((a, p) => a + CLASS_POINTS[p.stars], 0);
      return { teamId, points: pts, count: ps.length, avgStars: ps.reduce((a, p) => a + p.stars, 0) / Math.max(1, ps.length), five: ps.filter((p) => p.stars === 5).length, four: ps.filter((p) => p.stars === 4).length };
    })
    .sort((a, b) => b.points - a.points);
  classRankings.forEach((c, i) => {
    d.teams[c.teamId].classRank = i + 1;
  });
  for (const [teamId, ps] of classes) {
    for (const p of ps) d.players[p.id] = p;
    d.teams[teamId].rosterIds.push(...ps.map((p) => p.id));
  }
  const universeClasses = classRankings.filter((c) => isUniverseTeam(c.teamId));
  universeClasses.slice(0, 5).forEach((c) => {
    const hc = d.coaches[d.teams[c.teamId].coachIds.HC];
    if (hc) hc.top5Classes = (hc.top5Classes ?? 0) + 1;
  });
  if (hist && universeClasses[0]) hist.topClass = universeClasses[0].teamId;

  // 7) Prestige evolves with results but is anchored to history.
  const prestige: OffseasonSummary['prestige'] = [];
  const finalPoll = d.rankings[d.rankings.length - 1]?.poll ?? [];
  for (const t of Object.values(d.teams)) {
    const info = TEAM_BY_ID[t.id];
    const rank = finalPoll.find((e) => e.teamId === t.id)?.rank ?? 0;
    const titles = (d.postseason?.champion === t.id ? 12 : 0) + (Object.values(d.postseason?.conferenceChampions ?? {}).includes(t.id) ? 4 : 0) + (d.postseason?.cfpSeeds.some((s) => s.teamId === t.id) ? 4 : 0);
    const perf = clamp(25 + t.record.w * 4.5 + (rank ? (26 - rank) * 1.2 : 0) + titles, 10, 100);
    const target = isUniverseTeam(t.id) ? 0.6 * perf + 0.4 * info.prestige : info.prestige;
    const from = t.currentPrestige;
    t.currentPrestige = Math.round(clamp(0.8 * from + 0.2 * target, 10, 99) * 10) / 10;
    if (isUniverseTeam(t.id)) prestige.push({ teamId: t.id, from, to: t.currentPrestige });
  }

  // 8) Coaches age.
  for (const c of Object.values(d.coaches)) {
    c.age++;
    c.contractYears = Math.max(0, c.contractYears - 1);
  }

  const summary: OffseasonSummary = {
    completedSeason: completed,
    nextSeason: completed + 1,
    userGraduates,
    draft,
    risers,
    fallers,
    classRankings,
    userClass: classes.get(d.userTeamId)!.sort((a, b) => b.stars - a.stars || b.potential - a.potential).map((p) => p.id),
    prestige: prestige.sort((a, b) => b.to - b.from - (a.to - a.from)),
  };
  d.offseason = summary;
  d.phase = 'offseason';

  const id = () => `n${d.nextId++}`;
  const top = universeClasses[0];
  if (top) d.news.push({ id: id(), season: completed, week: 20, type: 'program', headline: `${TEAM_BY_ID[top.teamId].school} signs the nation's #1 recruiting class`, teamIds: [top.teamId], importance: 85 });
  const first = draft[0];
  if (first) d.news.push({ id: id(), season: completed, week: 20, type: 'milestone', headline: `${first.playerName} (${TEAM_BY_ID[first.teamId]?.school}) goes #1 overall in the NFL Draft`, teamIds: [first.teamId], importance: 80 });
  const userPicks = draft.filter((x) => x.teamId === d.userTeamId);
  if (userPicks.length) d.news.push({ id: id(), season: completed, week: 20, type: 'program', headline: `${TEAM_BY_ID[d.userTeamId].school} has ${userPicks.length} player${userPicks.length === 1 ? '' : 's'} drafted`, teamIds: [d.userTeamId], importance: 70 });
  d.updatedAt = Date.now();
  return summary;
}

export function startNextSeason(d: Dynasty): void {
  if (d.phase !== 'offseason') throw new Error('Offseason not started');
  const next = d.season + 1;

  // Compact old seasons: keep scores/results, drop box-score detail from seasons before this one.
  for (const g of d.schedule) {
    if (g.season < d.season && g.result) {
      g.result.playerLines = [];
      g.result.scoring = [];
    }
  }
  d.schedule = d.schedule.filter((g) => g.season >= d.season - 1 || g.postseason);
  d.news = d.news.filter((n) => n.season >= d.season);
  d.rankings = d.rankings.filter((r) => r.season >= d.season);

  d.season = next;
  d.week = 1;
  d.phase = 'regular';
  d.postseason = null;

  for (const p of Object.values(d.players)) {
    p.seasonStats = {};
    if (p.injury) {
      p.injury.weeksRemaining -= 8;
      p.injury.week = 0;
      if (p.injury.weeksRemaining <= 0) p.injury = null;
    }
  }
  for (const t of Object.values(d.teams)) {
    const r = roster(d, t);
    t.depthChart = t.id === d.userTeamId ? reconcileDepthChart(t.depthChart, r) : autoDepthChart(r);
    t.record = emptyRecord();
    t.stats = emptyTeamSeasonStats();
    t.elo = 0.5 * t.elo + 0.5 * initialElo(t, d.players);
    t.pollScore = 0;
  }
  d.schedule.push(...generateSchedule(next, d.seed, TEAMS));
  d.rankings.push(computePoll(d, 0));
  const top = d.rankings[d.rankings.length - 1].poll[0];
  d.news.push({ id: `n${d.nextId++}`, season: next, week: 0, type: 'ranking', headline: `${TEAM_BY_ID[top.teamId].school} opens the ${next} season at #1 in the preseason Top 25`, teamIds: [top.teamId], importance: 70 });
  d.updatedAt = Date.now();
}
