import { describe, expect, it } from 'vitest';
import { RESORTS } from '../src/data/resorts';
import { buildResort } from '../src/world/resortBuilder';
import { RaceSession } from '../src/race/race';
import { RailSystem } from '../src/physics/rails';
import { BASE_GEAR } from '../src/physics/skier';

const which = process.env.R ? [RESORTS[+process.env.R]] : RESORTS;

describe('AI racers physically ski every racecourse', () => {
  for (const def of which) {
    if (!def.races.length) continue;
    it(`${def.name}`, () => {
      const resort = buildResort(def);
      const world = { terrain: resort.terrain, obstacles: resort.obstacles, rails: new RailSystem(resort.rails) };
      for (const course of resort.courses) {
        for (const level of [0, 3, 5]) {
          const race = new RaceSession(course, resort.trails[course.trailId], world, { level, playerName: 'P', playerGear: BASE_GEAR, board: 'ski', seed: 7 + level, aiCount: 3 });
          race.forfeit();
          race.simulateRest(420);
          const res = race.results().filter((r) => !r.isPlayer);
          const finished = res.filter((r) => !r.dnf);
          const gates = course.gates.length;
          const avgMiss = finished.reduce((a, r) => a + r.missed, 0) / Math.max(1, finished.length);
          console.log(`${def.name} | ${course.discipline.padEnd(12)} lvl ${level} gates ${gates} finished ${finished.length}/${res.length} times ${finished.map((r) => r.raw!.toFixed(1)).join(',')} missed avg ${avgMiss.toFixed(1)}`);
          expect(finished.length).toBe(res.length);
          if (level >= 3) expect(avgMiss).toBeLessThanOrEqual(Math.max(1, gates * 0.12));
        }
      }
    });
  }
});
