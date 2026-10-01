/**
 * RosterManager: expands the compact, hand-editable roster rows into full Player objects
 * with every rating the engine needs (platoon splits, discipline, stealing, reaction, ...).
 */
import type { HitterRatings, PitchCode, Player, Position } from '../core/types';
import type { HitterRow, PitcherRow, RosterData } from '../data/rosters/format';
import { PITCHES } from '../data/pitchTypes';

const clamp99 = (v: number) => Math.max(1, Math.min(99, Math.round(v)));

function slug(teamId: string, name: string): string {
  return `${teamId}-${name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}`;
}

export function hitterRatings(row: HitterRow): HitterRatings {
  const [, , pos, bats, , contact, power, eye, speed, fielding, arm, , overrides] = row;
  // Platoon splits: same-side matchups are harder.
  let cR = contact, cL = contact, pR = power, pL = power;
  if (bats === 'L') { cR = contact + 3; cL = contact - 7; pR = power + 2; pL = power - 7; }
  else if (bats === 'R') { cR = contact - 2; cL = contact + 4; pR = power - 1; pL = power + 3; }
  const base: HitterRatings = {
    contactR: clamp99(cR),
    contactL: clamp99(cL),
    powerR: clamp99(pR),
    powerL: clamp99(pL),
    vision: clamp99(eye * 0.7 + contact * 0.3),
    discipline: clamp99(eye),
    speed: clamp99(speed),
    stealing: clamp99(speed * 0.85 + eye * 0.1 + 4),
    fielding: clamp99(fielding),
    arm: clamp99(arm),
    reaction: clamp99(fielding * 0.6 + speed * 0.25 + (pos === 'C' ? 10 : 8)),
  };
  return { ...base, ...(overrides ?? {}) };
}

function buildHitter(teamId: string, row: HitterRow): Player {
  const [name, number, pos, bats, throws, , , , , , , secondary] = row;
  return {
    id: slug(teamId, name),
    teamId,
    name,
    number,
    pos,
    secondary: secondary ? (secondary.split(',').map((s) => s.trim()) as Position[]) : [],
    bats,
    throws,
    ratings: hitterRatings(row),
  };
}

function buildPitcher(teamId: string, row: PitcherRow, existing?: Player): Player {
  const [name, number, role, throws, velocity, control, breakRating, stamina, pitchStr] = row;
  const pitches = pitchStr.split(',').map((s) => s.trim()).filter((p): p is PitchCode => p in PITCHES);
  const pitcher = { velocity, control, break: breakRating, stamina, pitches, role };
  if (existing) {
    existing.pitcher = pitcher; // two-way player
    return existing;
  }
  return {
    id: slug(teamId, name),
    teamId,
    name,
    number,
    pos: 'P',
    secondary: [],
    bats: throws === 'L' ? 'L' : 'R',
    throws,
    ratings: {
      contactR: 12, contactL: 12, powerR: 10, powerL: 10, vision: 15, discipline: 15,
      speed: 35, stealing: 10, fielding: 55 + Math.round(control / 10), arm: Math.min(99, velocity - 15), reaction: 55,
    },
    pitcher,
  };
}

export function buildRoster(teamId: string, data: RosterData): Player[] {
  const hitters = data.hitters.map((r) => buildHitter(teamId, r));
  const byName = new Map(hitters.map((h) => [h.name, h]));
  const pitchers: Player[] = [];
  for (const row of data.pitchers) {
    const twoWay = byName.get(row[0]);
    const p = buildPitcher(teamId, row, twoWay);
    if (!twoWay) pitchers.push(p);
  }
  return [...hitters, ...pitchers];
}

export const isPitcher = (p: Player) => !!p.pitcher;
export const isHitter = (p: Player) => p.pos !== 'P';

/** Can this player field this position competently? (Used for warnings in lineup editing.) */
export function canPlay(p: Player, pos: Position): boolean {
  if (pos === 'DH') return true;
  if (pos === 'P') return !!p.pitcher;
  if (p.pos === pos || p.secondary.includes(pos)) return true;
  if (pos === '1B') return p.pos !== 'C' || p.secondary.includes('1B');
  if (['LF', 'RF'].includes(pos)) return ['LF', 'CF', 'RF'].includes(p.pos);
  return false;
}

/** Penalty applied to fielding when out of position (0 = natural). */
export function positionPenalty(p: Player, pos: Position): number {
  if (pos === 'DH' || p.pos === pos || p.secondary.includes(pos)) return 0;
  if (canPlay(p, pos)) return 8;
  if (pos === 'C') return 35;
  if (pos === 'SS' || pos === 'CF') return 22;
  return 15;
}
