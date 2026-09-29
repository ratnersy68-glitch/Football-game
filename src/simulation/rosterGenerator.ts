import { ARCHETYPES, GEOGRAPHY, NAMES, POSITION_ORDER, POSITIONS } from '../data';
import { Rng } from '../core/rng';
import { clamp } from '../core/util';
import type { ClassYear, HiddenTraits, Player, Position, TeamInfo } from '../models/types';
import { computeOverall } from './playerRatings';

export type IdGen = (prefix: string) => string;

/** Starter-quality baseline for a program's roster strength (0-100). */
export function rosterBaseline(rosterStrength: number): number {
  return 43 + rosterStrength * 0.45;
}

const YEAR_OFFSET: Record<ClassYear, number> = { 1: -7, 2: -3, 3: 0, 4: 2 };
const YEAR_GROWTH: Record<ClassYear, number> = { 1: 13, 2: 9, 3: 5, 4: 2 };

function trait(rng: Rng, mean = 50, sd = 18): number {
  return clamp(Math.round(rng.normal(mean, sd)), 1, 99);
}

function pickHomeState(rng: Rng, team: TeamInfo): string {
  if (team.recruitingStates.length && rng.chance(0.72)) {
    // Earlier states in the list are the program's core territory.
    return rng.weighted(team.recruitingStates, (s) => team.recruitingStates.length - team.recruitingStates.indexOf(s) + 1);
  }
  return rng.weightedKey(GEOGRAPHY.talentWeight);
}

function starsFor(rng: Rng, projected: number): number {
  const v = projected + rng.normal(0, 4.5);
  if (v >= 91) return 5;
  if (v >= 84) return 4;
  if (v >= 72) return 3;
  return 2;
}

export interface PlayerGenOptions {
  teamId: string;
  team: TeamInfo;
  position: Position;
  year: ClassYear;
  targetOverall: number;
  usedJerseys: Set<number>;
}

export function generatePlayer(rng: Rng, nextId: IdGen, o: PlayerGenOptions): Player {
  const info = POSITIONS[o.position];
  const arch = rng.pick(ARCHETYPES[o.position]);
  const attrs: Record<string, number> = {};
  for (const k of Object.keys(info.weights)) {
    attrs[k] = o.targetOverall + (arch.mods[k] ?? 0) + rng.normal(0, 4.5);
  }
  // Calibrate so the weighted overall lands on target despite archetype offsets.
  const raw = computeOverall(o.position, attrs);
  const shift = o.targetOverall - raw;
  for (const k of Object.keys(attrs)) attrs[k] = clamp(Math.round(attrs[k] + shift), 25, 99);
  const overall = computeOverall(o.position, attrs);

  const hidden: HiddenTraits = {
    consistency: trait(rng),
    developmentRate: trait(rng),
    workEthic: trait(rng, 58),
    injuryRisk: trait(rng, 40, 16),
    loyalty: trait(rng),
    playingTimeExpectation: trait(rng),
    nilInterest: trait(rng),
    championshipInterest: trait(rng),
    proPotential: 0,
    transferRisk: trait(rng, 40),
  };
  const growth = Math.max(0, rng.normal(YEAR_GROWTH[o.year] + (hidden.developmentRate - 50) * 0.08, 4.5));
  const potential = clamp(Math.round(overall + growth), overall, 99);
  hidden.proPotential = clamp(Math.round(potential * 1.1 - 12 + rng.normal(0, 6)), 1, 99);

  // Stars reflect how scouts saw the player as a recruit: noisy relative to today's projection.
  const recruitProjection = potential - (o.year - 1) * 1.5;
  const stars = starsFor(rng, recruitProjection);

  const state = pickHomeState(rng, o.team);
  const cities = GEOGRAPHY.cities[state] ?? ['Springfield'];

  let jersey = 0;
  for (let tries = 0; tries < 40; tries++) {
    const [lo, hi] = rng.pick(info.jerseys);
    const j = rng.int(lo, hi);
    if (!o.usedJerseys.has(j)) {
      jersey = j;
      break;
    }
  }
  if (!jersey) for (let j = 1; j < 100; j++) if (!o.usedJerseys.has(j)) { jersey = j; break; }
  o.usedJerseys.add(jersey);

  return {
    id: nextId('p'),
    teamId: o.teamId,
    firstName: rng.pick(NAMES.first),
    lastName: rng.pick(NAMES.last),
    position: o.position,
    archetype: arch.id,
    year: o.year,
    redshirted: o.year > 1 && rng.chance(0.3),
    jersey,
    height: rng.int(info.height[0], info.height[1]),
    weight: Math.round(rng.int(info.weight[0], info.weight[1]) / 5) * 5,
    hometown: rng.pick(cities),
    state,
    stars,
    attributes: attrs,
    overall,
    potential,
    hidden,
    injury: null,
    seasonStats: {},
    careerStats: {},
  };
}

/** Build a full scholarship roster for a program. Quality scales with rosterStrength. */
export function generateRoster(rng: Rng, nextId: IdGen, team: TeamInfo): Player[] {
  const base = rosterBaseline(team.rosterStrength);
  const used = new Set<number>();
  const players: Player[] = [];
  for (const pos of POSITION_ORDER) {
    const count = POSITIONS[pos].rosterCount;
    for (let i = 0; i < count; i++) {
      const year = rng.weighted([1, 2, 3, 4] as ClassYear[], (y) => [0.28, 0.26, 0.24, 0.22][y - 1]);
      // Specialists vary less with program strength.
      const posBase = pos === 'K' || pos === 'P' ? 60 + (base - 60) * 0.6 : base;
      const target = clamp(Math.round(posBase + YEAR_OFFSET[year] + rng.normal(0, 5.5)), 35, 97);
      players.push(generatePlayer(rng, nextId, { teamId: team.id, team, position: pos, year, targetOverall: target, usedJerseys: used }));
    }
  }
  return players;
}
