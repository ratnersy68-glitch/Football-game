/**
 * Regular-season schedule generation.
 *
 * Conference slates use a circle-method round robin so every conference week is a perfect matching
 * (no double-booking by construction). Team-to-slot assignment is searched to include as many annual
 * rivalries as possible and to put "rivalry week" games in the final week. Non-conference games fill the
 * remaining open weeks against other power programs or the opponent pool.
 * All rules come from data/scheduleRules.json + conferences.json + rivalries.json.
 */
import { CONFERENCES, RIVALRIES, SCHEDULE_RULES, TEAM_BY_ID, isUniverseTeam, rivalryBetween } from '../data';
import { Rng, seedFrom } from '../core/rng';
import type { Game, RivalryInfo, TeamInfo } from '../models/types';

interface Pairing {
  a: string;
  b: string;
  week: number;
  conference: boolean;
}

/** Circle-method round robin over positions 0..n-1 (n even). Returns n-1 rounds of position pairs. */
export function circleRounds(n: number): [number, number][][] {
  const rounds: [number, number][][] = [];
  const pos = Array.from({ length: n }, (_, i) => i);
  for (let r = 0; r < n - 1; r++) {
    const round: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) round.push([pos[i], pos[n - 1 - i]]);
    rounds.push(round);
    // rotate all but the first
    pos.splice(1, 0, pos.pop()!);
  }
  return rounds;
}

function key(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Non-conference rivalry-week opponent for a team (e.g. Georgia → Georgia Tech), if any. */
function nonConfRivalryWeek(teamId: string, allIds: Set<string>): RivalryInfo | undefined {
  const conf = TEAM_BY_ID[teamId].conference;
  return RIVALRIES.find((r) => {
    if (!r.rivalryWeek || !r.annual || !r.teams.includes(teamId)) return false;
    const other = r.teams[0] === teamId ? r.teams[1] : r.teams[0];
    return allIds.has(other) && TEAM_BY_ID[other]?.conference !== conf;
  });
}

function buildConference(rng: Rng, confId: string, teams: TeamInfo[], confGames: number, allIds: Set<string>, finalWeek: number): Pairing[] {
  const ids = teams.map((t) => t.id);
  if (ids.length % 2 === 1) ids.push('__bye__');
  const n = ids.length;
  const rounds = circleRounds(n);
  const games = Math.min(confGames, n - 1);

  const confRivals = RIVALRIES.filter((r) => r.annual && r.teams.every((t) => ids.includes(t)));
  const rivalryWeekPairs = confRivals.filter((r) => r.rivalryWeek);
  const ncWeekTeams = ids.filter((id) => id !== '__bye__' && nonConfRivalryWeek(id, allIds));

  let best: { pairs: Pairing[]; score: number } | null = null;
  for (let attempt = 0; attempt < 250; attempt++) {
    const chosen = rng.shuffle(rounds.map((_, i) => i)).slice(0, games);
    const finalRound = rounds[chosen[chosen.length - 1]];
    const slots = rng.shuffle(finalRound.map((p) => [...p] as [number, number]));
    const assign = new Array<string | undefined>(n).fill(undefined);
    const used = new Set<string>();
    // 1) Rivalry-week pairs in the final round.
    for (const r of rng.shuffle([...rivalryWeekPairs])) {
      if (used.has(r.teams[0]) || used.has(r.teams[1])) continue;
      const slot = slots.shift();
      if (!slot) break;
      assign[slot[0]] = r.teams[0];
      assign[slot[1]] = r.teams[1];
      used.add(r.teams[0]).add(r.teams[1]);
    }
    // 2) Teams with non-conference rivalry-week games paired together (their game moves to an open week).
    const nc = rng.shuffle(ncWeekTeams.filter((t) => !used.has(t)));
    while (nc.length >= 2) {
      const slot = slots.shift();
      if (!slot) break;
      const a = nc.shift()!;
      const b = nc.shift()!;
      assign[slot[0]] = a;
      assign[slot[1]] = b;
      used.add(a).add(b);
    }
    // 3) Everyone else anywhere.
    const rest = rng.shuffle(ids.filter((t) => !used.has(t)));
    for (let i = 0; i < n; i++) if (!assign[i]) assign[i] = rest.shift();

    const pairs: Pairing[] = [];
    const present = new Set<string>();
    chosen.forEach((ri, order) => {
      for (const [x, y] of rounds[ri]) {
        const a = assign[x]!;
        const b = assign[y]!;
        if (a === '__bye__' || b === '__bye__') continue;
        pairs.push({ a, b, week: order, conference: true });
        present.add(key(a, b));
      }
    });
    let score = 0;
    for (const r of confRivals) if (present.has(key(r.teams[0], r.teams[1]))) score += r.intensity;
    if (!best || score > best.score) best = { pairs, score };
  }

  // Map round order -> actual weeks: conference play from week 4 to the final week, with byes sprinkled mid-season.
  const confWeeks: number[] = [];
  const window: number[] = [];
  for (let w = 4; w <= finalWeek; w++) window.push(w);
  const byeCount = Math.max(0, window.length - games);
  const byeCandidates = window.filter((w) => w >= 5 && w <= finalWeek - 2);
  const byes = new Set(rng.shuffle([...byeCandidates]).slice(0, byeCount));
  for (const w of window) if (!byes.has(w)) confWeeks.push(w);
  // If the window is too short (very large conference slates), borrow early weeks.
  for (let w = 3; confWeeks.length < games && w >= 1; w--) confWeeks.unshift(w);
  void confId;
  return best!.pairs.map((p) => ({ ...p, week: confWeeks[p.week] }));
}

export function generateSchedule(season: number, dynastySeed: number, teams: TeamInfo[]): Game[] {
  const rng = new Rng(seedFrom(dynastySeed, 'schedule', season));
  const rules = SCHEDULE_RULES;
  const finalWeek = rules.regularSeasonWeeks;
  const allIds = new Set(teams.map((t) => t.id));
  const universe = teams.filter((t) => isUniverseTeam(t.id));
  const pool = teams.filter((t) => !isUniverseTeam(t.id));

  const pairings: Pairing[] = [];
  for (const conf of CONFERENCES.filter((c) => c.playable)) {
    const members = universe.filter((t) => t.conference === conf.id);
    if (members.length < 2) continue;
    pairings.push(...buildConference(rng, conf.id, members, conf.conferenceGames, allIds, finalWeek));
  }

  const busy = new Map<string, Set<number>>();
  const isBusy = (t: string, w: number) => busy.get(t)?.has(w) ?? false;
  const mark = (t: string, w: number) => {
    if (!busy.has(t)) busy.set(t, new Set());
    busy.get(t)!.add(w);
  };
  const unmark = (t: string, w: number) => busy.get(t)?.delete(w);
  for (const p of pairings) {
    mark(p.a, p.week);
    mark(p.b, p.week);
  }
  const count = new Map<string, number>();
  const inc = (t: string) => count.set(t, (count.get(t) ?? 0) + 1);
  for (const p of pairings) {
    inc(p.a);
    inc(p.b);
  }
  const scheduled = new Set(pairings.map((p) => key(p.a, p.b)));
  const weeks = Array.from({ length: finalWeek }, (_, i) => i + 1);

  const freeCommon = (a: string, b: string, prefer: number[]): number | undefined => {
    for (const w of prefer) if (!isBusy(a, w) && !isBusy(b, w)) return w;
    for (const w of rng.shuffle([...weeks])) if (!isBusy(a, w) && !isBusy(b, w)) return w;
    return undefined;
  };

  // Non-conference rivalry week: move the conflicting conference game to an open week.
  for (const t of universe) {
    const r = nonConfRivalryWeek(t.id, allIds);
    if (!r) continue;
    const opp = r.teams[0] === t.id ? r.teams[1] : r.teams[0];
    if (scheduled.has(key(t.id, opp))) continue;
    if ((count.get(opp) ?? 0) >= rules.gamesPerTeam && isUniverseTeam(opp)) continue;
    for (const side of [t.id, opp]) {
      const conflict = pairings.find((p) => p.week === finalWeek && (p.a === side || p.b === side));
      if (conflict) {
        const w = freeCommon(conflict.a, conflict.b, [...weeks].reverse().filter((x) => x !== finalWeek));
        if (w === undefined) continue;
        unmark(conflict.a, finalWeek);
        unmark(conflict.b, finalWeek);
        conflict.week = w;
        mark(conflict.a, w);
        mark(conflict.b, w);
      }
    }
    if (!isBusy(t.id, finalWeek) && !isBusy(opp, finalWeek)) {
      pairings.push({ a: t.id, b: opp, week: finalWeek, conference: false });
      mark(t.id, finalWeek);
      mark(opp, finalWeek);
      inc(t.id);
      inc(opp);
      scheduled.add(key(t.id, opp));
    }
  }

  // Other annual non-conference rivalries (Cy-Hawk, Apple Cup, USC–Notre Dame...).
  for (const r of RIVALRIES) {
    if (!r.annual) continue;
    const [a, b] = r.teams;
    if (!allIds.has(a) || !allIds.has(b) || scheduled.has(key(a, b))) continue;
    if (!isUniverseTeam(a) && !isUniverseTeam(b)) continue;
    if (TEAM_BY_ID[a].conference === TEAM_BY_ID[b].conference && isUniverseTeam(a)) continue;
    const need = (t: string) => !isUniverseTeam(t) || (count.get(t) ?? 0) < rules.gamesPerTeam;
    if (!need(a) || !need(b)) continue;
    const w = freeCommon(a, b, rules.earlyNonConferenceWeeks);
    if (w === undefined) continue;
    pairings.push({ a, b, week: w, conference: false });
    mark(a, w);
    mark(b, w);
    inc(a);
    inc(b);
    scheduled.add(key(a, b));
  }

  // Fill remaining non-conference slots.
  const tierW = rules.tierWeights as Record<string, number>;
  for (const t of rng.shuffle([...universe])) {
    let guard = 0;
    while ((count.get(t.id) ?? 0) < rules.gamesPerTeam && guard++ < 40) {
      const open = weeks.filter((w) => !isBusy(t.id, w));
      const early = open.filter((w) => rules.earlyNonConferenceWeeks.includes(w));
      const week = early.length ? early[0] : rng.pick(open);
      if (week === undefined) break;
      let opp: string | undefined;
      if (rng.chance(rules.crossPowerGameRate)) {
        const candidates = universe.filter(
          (o) => o.conference !== t.conference && (count.get(o.id) ?? 0) < rules.gamesPerTeam && !isBusy(o.id, week) && !scheduled.has(key(o.id, t.id)),
        );
        if (candidates.length) opp = rng.pick(candidates).id;
      }
      if (!opp) {
        const candidates = pool.filter((o) => !isBusy(o.id, week) && !scheduled.has(key(o.id, t.id)));
        if (candidates.length) opp = rng.weighted(candidates, (o) => (tierW[o.conference] ?? 1) / Math.max(1, (count.get(o.id) ?? 0) + 1)).id;
      }
      if (!opp) continue;
      pairings.push({ a: t.id, b: opp, week, conference: false });
      mark(t.id, week);
      mark(opp, week);
      inc(t.id);
      inc(opp);
      scheduled.add(key(t.id, opp));
    }
  }

  // Home/away assignment.
  const homeCount = new Map<string, number>();
  const hc = (t: string) => homeCount.get(t) ?? 0;
  const games: Game[] = [];
  pairings.sort((x, y) => x.week - y.week || (x.a < y.a ? -1 : 1));
  for (const p of pairings) {
    const rivalry = rivalryBetween(p.a, p.b);
    let home = p.a;
    let away = p.b;
    const aU = isUniverseTeam(p.a);
    const bU = isUniverseTeam(p.b);
    if (aU !== bU) {
      const uni = aU ? p.a : p.b;
      const other = aU ? p.b : p.a;
      const poolIsPower = TEAM_BY_ID[other].prestige >= 60;
      const homeRate = poolIsPower ? 0.5 : rules.pocketGameHomeRate;
      [home, away] = rng.chance(homeRate) ? [uni, other] : [other, uni];
    } else if (rivalry && rivalry.annual) {
      // Series alternate home sites by year.
      const [first, second] = [...rivalry.teams].sort();
      [home, away] = season % 2 === 0 ? [first, second] : [second, first];
    } else if (hc(p.a) !== hc(p.b)) {
      [home, away] = hc(p.a) < hc(p.b) ? [p.a, p.b] : [p.b, p.a];
    } else if (rng.chance(0.5)) {
      [home, away] = [p.b, p.a];
    }
    homeCount.set(home, hc(home) + 1);
    const id = `g${season}_w${p.week}_${home}_${away}`;
    games.push({
      id,
      season,
      week: p.week,
      homeId: home,
      awayId: away,
      neutralSite: rivalry?.neutralSite,
      conferenceGame: p.conference,
      rivalryId: rivalry?.id,
      seed: seedFrom(dynastySeed, season, id),
      played: false,
    });
  }
  return games;
}

export interface ScheduleProblem {
  teamId: string;
  problem: string;
}

/** Structural validation used by tests and debug tools. */
export function validateSchedule(games: Game[], teams: TeamInfo[]): ScheduleProblem[] {
  const problems: ScheduleProblem[] = [];
  const byTeam = new Map<string, Game[]>();
  for (const g of games) {
    for (const t of [g.homeId, g.awayId]) {
      if (!byTeam.has(t)) byTeam.set(t, []);
      byTeam.get(t)!.push(g);
    }
    if (g.homeId === g.awayId) problems.push({ teamId: g.homeId, problem: 'plays itself' });
  }
  for (const t of teams) {
    const list = byTeam.get(t.id) ?? [];
    const weeks = new Set<number>();
    for (const g of list) {
      if (weeks.has(g.week)) problems.push({ teamId: t.id, problem: `double-booked week ${g.week}` });
      weeks.add(g.week);
    }
    if (!isUniverseTeam(t.id)) continue;
    if (list.length !== SCHEDULE_RULES.gamesPerTeam) problems.push({ teamId: t.id, problem: `${list.length} games` });
    const conf = CONFERENCES.find((c) => c.id === t.conference)!;
    const confGames = list.filter((g) => g.conferenceGame).length;
    if (confGames !== conf.conferenceGames) problems.push({ teamId: t.id, problem: `${confGames} conference games` });
  }
  return problems;
}
