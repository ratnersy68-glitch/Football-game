/** Cached preview world so ratings shown during team selection match the dynasty that gets created. */
import { TEAMS } from '../data';
import { buildWorld, type World } from '../simulation/world';
import { nextIdFn } from '../simulation/seasonEngine';
import { teamRatings, type TeamRatings } from '../simulation/teamRatings';

let cache: { seed: number; world: World; ratings: Record<string, TeamRatings> } | null = null;

export function previewWorld(seed: number) {
  if (cache?.seed === seed) return cache;
  const world = buildWorld(seed, nextIdFn({ nextId: 1 }), TEAMS);
  const ratings: Record<string, TeamRatings> = {};
  for (const t of Object.values(world.teams)) ratings[t.id] = teamRatings(t, world.players);
  cache = { seed, world, ratings };
  return cache;
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
