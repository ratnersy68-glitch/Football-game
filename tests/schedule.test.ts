import { describe, expect, it } from 'vitest';
import { TEAMS, UNIVERSE_TEAMS, SCHEDULE_RULES } from '../src/data';
import { circleRounds, generateSchedule, validateSchedule } from '../src/simulation/scheduleGenerator';

describe('schedule generation', () => {
  it('circle method yields perfect matchings', () => {
    const rounds = circleRounds(18);
    expect(rounds.length).toBe(17);
    const seen = new Set<string>();
    for (const r of rounds) {
      const inRound = new Set<number>();
      for (const [a, b] of r) {
        expect(inRound.has(a) || inRound.has(b)).toBe(false);
        inRound.add(a).add(b);
        seen.add(a < b ? `${a}-${b}` : `${b}-${a}`);
      }
      expect(inRound.size).toBe(18);
    }
    expect(seen.size).toBe((18 * 17) / 2);
  });

  for (const seed of [1, 2, 3, 99, 2026, 48291]) {
    it(`produces a valid 12-game schedule (seed ${seed})`, () => {
      const games = generateSchedule(2026, seed, TEAMS);
      expect(validateSchedule(games, TEAMS)).toEqual([]);
      for (const t of UNIVERSE_TEAMS) {
        const mine = games.filter((g) => g.homeId === t.id || g.awayId === t.id);
        expect(mine.length).toBe(SCHEDULE_RULES.gamesPerTeam);
        const home = mine.filter((g) => g.homeId === t.id && !g.neutralSite).length;
        expect(home).toBeGreaterThanOrEqual(4);
      }
    });
  }

  it('is deterministic for a seed', () => {
    expect(generateSchedule(2026, 5, TEAMS)).toEqual(generateSchedule(2026, 5, TEAMS));
  });

  it('keeps marquee rivalries (The Game, Iron Bowl) in the final week', () => {
    const games = generateSchedule(2026, 12, TEAMS);
    for (const id of ['the_game', 'iron_bowl']) {
      const g = games.find((x) => x.rivalryId === id);
      expect(g?.week).toBe(SCHEDULE_RULES.rivalryWeek);
    }
  });

  it('plays neutral-site rivalries at their neutral site', () => {
    const games = generateSchedule(2026, 12, TEAMS);
    const rr = games.find((g) => g.rivalryId === 'red_river');
    if (rr) expect(rr.neutralSite).toContain('Cotton Bowl');
  });
});
