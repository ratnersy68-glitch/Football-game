/**
 * Simulated possessions for the parts of a game the user doesn't play: the opponent's drives, drives
 * while the user is on the bench, and fully simulated games (ineligible / "Sim Game"). Outcomes come
 * from the two units' roster ratings and field position.
 */
import { Rng } from '../../core/rng';
import type { PositionId } from '../../career/player';
import { emptyDriveStats, type DriveStats } from './drive';

export interface UnitRatings {
  offense: number;
  defense: number;
}

export type PossessionResult = 'TD' | 'FG' | 'Missed FG' | 'Punt' | 'Interception' | 'Fumble' | 'Downs';

export interface SimPossession {
  result: PossessionResult;
  points: number;
  plays: number;
  yards: number;
  seconds: number;
  /** Line of scrimmage for the OTHER team's next drive (their own yard line, 0–100). */
  nextLos: number;
  text: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Simulate one possession. `start` is the offense's own yard line. `quarterMinutes` scales the clock
 * so short-quarter games still have a realistic number of possessions.
 */
export function simPossession(off: number, def: number, start: number, rng: Rng, quarterMinutes: number, teamName = 'They'): SimPossession {
  const edge = (off - def) / 10;
  const fp = (start - 25) / 50; // field position bonus
  const pTD = clamp(0.21 + edge * 0.07 + fp * 0.18, 0.05, 0.6);
  const pFG = clamp(0.13 + edge * 0.02 + fp * 0.08, 0.05, 0.3);
  const pTO = clamp(0.12 - edge * 0.025, 0.04, 0.22);
  const r = rng.next();
  const scale = quarterMinutes / 15;
  let result: PossessionResult;
  let yards: number;
  if (r < pTD) {
    result = 'TD';
    yards = 100 - start;
  } else if (r < pTD + pFG) {
    yards = clamp(Math.round(100 - start - rng.float(8, 30)), 0, 100 - start - 3);
    const dist = 100 - (start + yards) + 17;
    result = rng.chance(clamp(1 / (1 + Math.exp((dist - 49) / 4.5)), 0.05, 0.97)) ? 'FG' : 'Missed FG';
  } else if (r < pTD + pFG + pTO) {
    result = rng.chance(0.65) ? 'Interception' : rng.chance(0.5) ? 'Fumble' : 'Downs';
    yards = clamp(Math.round(rng.float(-3, 45)), -5, 95 - start);
  } else {
    result = 'Punt';
    yards = clamp(Math.round(rng.float(-4, 32)), -8, 90 - start);
  }
  const plays = clamp(Math.round(Math.abs(yards) / rng.float(4.5, 7.5) + rng.float(1, 3)), 3, 15);
  const seconds = Math.round(plays * rng.float(24, 36) * scale);
  const endSpot = start + yards; // offense's yard line where it ended
  let nextLos: number;
  let points = 0;
  switch (result) {
    case 'TD':
      points = 7;
      nextLos = 25;
      break;
    case 'FG':
      points = 3;
      nextLos = 25;
      break;
    case 'Missed FG':
      nextLos = clamp(100 - endSpot, 20, 45);
      break;
    case 'Punt':
      nextLos = clamp(Math.round(100 - (endSpot + rng.float(34, 46))), 5, 35);
      break;
    default:
      nextLos = clamp(Math.round(100 - endSpot + (result === 'Interception' ? rng.float(-5, 15) : 0)), 5, 60);
  }
  const text = describe(teamName, result, plays, yards, seconds);
  return { result, points, plays, yards, seconds, nextLos, text };
}

function describe(team: string, r: PossessionResult, plays: number, yards: number, seconds: number): string {
  const tm = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const drive = `${plays} plays, ${yards} yards, ${tm}`;
  switch (r) {
    case 'TD':
      return `${team} drive for a touchdown (${drive}).`;
    case 'FG':
      return `${team} kick a field goal (${drive}).`;
    case 'Missed FG':
      return `${team} miss a field goal (${drive}).`;
    case 'Punt':
      return `${team} punt (${drive}).`;
    case 'Interception':
      return `${team} throw an interception (${drive}).`;
    case 'Fumble':
      return `${team} fumble it away (${drive}).`;
    default:
      return `${team} turn it over on downs (${drive}).`;
  }
}

export interface QuickGameResult {
  us: number;
  them: number;
  stats: DriveStats;
  log: string[];
}

/**
 * Simulate a whole game (both offenses) and the user's stat line from his ratings and role.
 * `involvement` is 0 when the user doesn't play (ineligible/injured), 1 for a full game.
 */
export function simGame(us: UnitRatings, them: UnitRatings, rng: Rng, position: PositionId, userOvr: number, involvement: number, quarterMinutes = 15, usName = 'We', themName = 'They'): QuickGameResult {
  let su = 0;
  let st = 0;
  const log: string[] = [];
  let usStart = 25;
  let themStart = 25;
  let usFirst = rng.chance(0.5);
  let usTDs = 0;
  let usYards = 0;
  const possessions = 11 + rng.int(0, 3);
  for (let i = 0; i < possessions; i++) {
    const usBall = usFirst ? i % 2 === 0 : i % 2 === 1;
    if (usBall) {
      const p = simPossession(us.offense, them.defense, usStart, rng, quarterMinutes, usName);
      su += p.points;
      if (p.result === 'TD') usTDs++;
      usYards += Math.max(0, p.yards);
      themStart = p.nextLos;
      log.push(p.text);
    } else {
      const p = simPossession(them.offense, us.defense, themStart, rng, quarterMinutes, themName);
      st += p.points;
      usStart = p.nextLos;
      log.push(p.text);
    }
  }
  while (su === st) {
    // Overtime: alternate possessions from the 25 until someone leads.
    const a = simPossession(us.offense, them.defense, 75, rng, quarterMinutes, usName);
    const b = simPossession(them.offense, us.defense, 75, rng, quarterMinutes, themName);
    su += a.points;
    st += b.points;
    log.push(`OT: ${a.text} ${b.text}`);
    usFirst = !usFirst;
  }
  const stats = emptyDriveStats();
  if (involvement > 0) {
    const q = (userOvr - 70) / 20; // -1..+1 roughly
    const share = involvement;
    if (position === 'QB') {
      stats.att = Math.round((26 + rng.int(-6, 8)) * share);
      stats.comp = Math.round(stats.att * clamp(0.6 + q * 0.08 + rng.float(-0.08, 0.08), 0.4, 0.82));
      stats.passYds = Math.round(Math.max(usYards * 0.62, stats.comp * (10 + q * 2 + rng.float(-2, 2))));
      stats.passTD = Math.round(usTDs * 0.65);
      stats.int = rng.chance(0.45 - q * 0.15) ? rng.int(1, 2) : 0;
      stats.rushAtt = rng.int(2, 8);
      stats.rushYds = Math.round(stats.rushAtt * rng.float(1, 6));
      stats.sacks = rng.int(0, 3);
    } else if (position === 'RB') {
      stats.rushAtt = Math.round((16 + rng.int(-5, 6)) * share);
      stats.rushYds = Math.round(stats.rushAtt * clamp(4.4 + q * 1.2 + rng.float(-1.6, 2), 1, 9));
      stats.rushTD = Math.round(usTDs * 0.35 * share);
      stats.rec = rng.int(0, 4);
      stats.recYds = stats.rec * rng.int(4, 11);
    } else {
      stats.rec = Math.round((position === 'WR' ? 4.5 : 3) * (1 + q * 0.4) * share + rng.int(-2, 3));
      stats.rec = Math.max(0, stats.rec);
      stats.recYds = Math.round(stats.rec * clamp(12 + q * 3 + rng.float(-4, 6), 5, 25));
      stats.recTD = Math.round(usTDs * (position === 'WR' ? 0.25 : 0.15) * share + (rng.chance(0.2) ? 1 : 0) * share);
    }
    stats.longest = Math.max(stats.recYds > 0 ? Math.round(stats.recYds * 0.45) : 0, stats.rushYds > 0 ? Math.round(stats.rushYds * 0.35) : 0, stats.passYds > 0 ? Math.round(stats.passYds * 0.2) : 0);
  }
  return { us: su, them: st, stats, log };
}
