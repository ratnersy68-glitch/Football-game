/**
 * Playoffs — VHSL-inspired: two regions (Region 4C = Catoctin + Dulles, Region 5D/6 = Potomac + Independence)
 * seed by record and power rating; regional champions meet in the LCPS BOWL (state championship stand-in).
 * Format is configurable: 'standard' (4 seeds/region, 3 rounds) or 'expanded' (6 seeds/region, 4 rounds).
 */
import type { Bracket, BracketGame, Dynasty, GameRecord } from './types';
import { computeStandings } from './Standings';
import { eloOf } from './Rankings';
import { weatherForWeek } from './Schedule';
import { RNG } from '../game/rng';
import { isRivalry } from '../data/teams';

export const ROUND_NAMES = {
  standard: ['Regional Semifinal', 'Regional Final', 'LCPS Bowl'],
  expanded: ['First Round', 'Regional Semifinal', 'Regional Final', 'LCPS Bowl'],
};

export const CHAMPIONSHIP_SITE = 'Segra Field · Leesburg (neutral site)';

export function seedRegion(d: Dynasty, region: 'north' | 'south', n: number): string[] {
  const rows = computeStandings(d).filter((r) => r.region === region);
  rows.sort((a, b) => {
    const pa = a.w / Math.max(1, a.w + a.l);
    const pb = b.w / Math.max(1, b.w + b.l);
    if (pb !== pa) return pb - pa;
    return eloOf(d, b.team) - eloOf(d, a.team);
  });
  return rows.slice(0, n).map((r) => r.team);
}

export function createBracket(d: Dynasty, format: 'standard' | 'expanded'): Bracket {
  const n = format === 'standard' ? 4 : 6;
  const seeds = { north: seedRegion(d, 'north', n), south: seedRegion(d, 'south', n) };
  const rounds = ROUND_NAMES[format];
  const games: BracketGame[] = [];
  let slot = 0;
  for (const region of ['north', 'south'] as const) {
    const s = seeds[region];
    if (format === 'standard') {
      games.push({ id: `${region}-r0-a`, round: 0, region, slot: slot++, home: s[0], away: s[3], homeSeed: 1, awaySeed: 4 });
      games.push({ id: `${region}-r0-b`, round: 0, region, slot: slot++, home: s[1], away: s[2], homeSeed: 2, awaySeed: 3 });
      games.push({ id: `${region}-r1`, round: 1, region, slot: slot++ });
    } else {
      games.push({ id: `${region}-r0-a`, round: 0, region, slot: slot++, home: s[2], away: s[5], homeSeed: 3, awaySeed: 6 });
      games.push({ id: `${region}-r0-b`, round: 0, region, slot: slot++, home: s[3], away: s[4], homeSeed: 4, awaySeed: 5 });
      games.push({ id: `${region}-r1-a`, round: 1, region, slot: slot++, home: s[0], homeSeed: 1 });
      games.push({ id: `${region}-r1-b`, round: 1, region, slot: slot++, home: s[1], homeSeed: 2 });
      games.push({ id: `${region}-r2`, round: 2, region, slot: slot++ });
    }
  }
  games.push({ id: 'final', round: rounds.length - 1, slot: slot++ });
  return { year: d.year, format, rounds, seeds, games };
}

const seedOf = (b: Bracket, team: string) => {
  for (const r of ['north', 'south'] as const) {
    const i = b.seeds[r].indexOf(team);
    if (i >= 0) return i + 1;
  }
  return 99;
};

/** Returns GameRecords for the current playoff round (creating them if needed). */
export function scheduleRound(d: Dynasty, round: number): GameRecord[] {
  const b = d.bracket!;
  const rng = new RNG(d.year * 31 + round);
  const out: GameRecord[] = [];
  for (const bg of b.games.filter((g) => g.round === round)) {
    if (!bg.home || !bg.away) continue;
    if (bg.gameId) { const ex = d.schedule.find((g) => g.id === bg.gameId); if (ex) { out.push(ex); continue; } }
    const final = bg.id === 'final';
    const gr: GameRecord = {
      id: `${d.year}-po-${bg.id}`,
      week: 11 + round,
      round: b.rounds[round],
      home: bg.home,
      away: bg.away,
      district: false,
      rivalry: isRivalry(bg.home, bg.away),
      neutral: final,
      played: false,
      weather: weatherForWeek(11 + round, rng),
    };
    bg.gameId = gr.id;
    d.schedule.push(gr);
    out.push(gr);
  }
  return out;
}

/** Record a finished playoff game and fill the next round when ready. */
export function advanceBracket(d: Dynasty, g: GameRecord) {
  const b = d.bracket!;
  const bg = b.games.find((x) => x.gameId === g.id);
  if (!bg) return;
  const winner = g.homeScore! > g.awayScore! ? g.home : g.away;
  bg.winner = winner;
  if (bg.id === 'final') {
    b.champion = winner;
    b.runnerUp = winner === g.home ? g.away : g.home;
    b.finalScore = `${Math.max(g.homeScore!, g.awayScore!)}–${Math.min(g.homeScore!, g.awayScore!)}${g.ot ? ' (OT)' : ''}`;
    return;
  }
  // Place winner into the next game
  const region = bg.region!;
  const next = b.games.filter((x) => x.round === bg.round + 1 && (x.region === region || x.id === 'final'));
  if (b.format === 'expanded' && bg.round === 0) {
    // Re-seed: #1 hosts the lowest remaining seed
    const r0 = b.games.filter((x) => x.round === 0 && x.region === region);
    if (r0.every((x) => x.winner)) {
      const ws = r0.map((x) => x.winner!).sort((a, c) => seedOf(b, c) - seedOf(b, a)); // lowest seed first
      const [ga, gb] = next.filter((x) => x.region === region).sort((a, c) => (a.homeSeed ?? 9) - (c.homeSeed ?? 9));
      ga.away = ws[0];
      ga.awaySeed = seedOf(b, ws[0]);
      gb.away = ws[1];
      gb.awaySeed = seedOf(b, ws[1]);
    }
    return;
  }
  const target = next.find((x) => x.region === region) ?? next.find((x) => x.id === 'final')!;
  const s = seedOf(b, winner);
  if (!target.home) { target.home = winner; target.homeSeed = s; }
  else if (!target.away) { target.away = winner; target.awaySeed = s; }
  // Higher seed hosts
  if (target.home && target.away && target.id !== 'final' && (target.awaySeed ?? 99) < (target.homeSeed ?? 99)) {
    [target.home, target.away] = [target.away, target.home];
    [target.homeSeed, target.awaySeed] = [target.awaySeed, target.homeSeed];
  }
}

export function roundComplete(d: Dynasty, round: number): boolean {
  return d.bracket!.games.filter((g) => g.round === round && g.home && g.away).every((g) => !!g.winner);
}

export function teamPlayoffResult(d: Dynasty, team: string): string {
  const b = d.bracket;
  if (!b) return 'Missed';
  if (b.champion === team) return 'Champion';
  const mine = b.games.filter((g) => g.home === team || g.away === team);
  if (!mine.length) return 'Missed';
  const lost = mine.find((g) => g.winner && g.winner !== team);
  if (lost) return lost.id === 'final' ? 'Runner-up' : `Lost ${b.rounds[lost.round]}`;
  return 'Alive';
}
