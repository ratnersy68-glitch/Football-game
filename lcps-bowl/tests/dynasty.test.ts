import { describe, it, expect } from 'vitest';
import { createDynasty, currentGames, simulateGame, applyResult, finishWeek, runOffseason, buyUpgrade } from '../src/dynasty/Season';
import { generateSchedule } from '../src/dynasty/Schedule';
import { LCPS_TEAMS } from '../src/data/teams';
import { RNG } from '../src/game/rng';
import { serialize, deserialize } from '../src/save/storage';
import { GameSession } from '../src/game/GameSession';

describe('schedule', () => {
  it('gives every LCPS team 10 games with full district round-robins and rivalry week', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const games = generateSchedule(2026, new RNG(seed));
      for (const t of LCPS_TEAMS) {
        const mine = games.filter((g) => g.home === t.id || g.away === t.id);
        expect(mine.length).toBe(10);
        expect(new Set(mine.map((g) => g.week)).size).toBe(10);
        for (const o of LCPS_TEAMS) {
          if (o.id !== t.id && o.district === t.district) expect(mine.some((g) => g.home === o.id || g.away === o.id)).toBe(true);
        }
      }
      expect(games.filter((g) => g.week === 10 && g.rivalry).length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('dynasty season', () => {
  it('plays a full season through the LCPS Bowl, then the offseason', () => {
    GameSession.HEADLESS_DT = 1 / 20;
    const d = createDynasty('riverside', 'Test', 1, 77);
    let guard = 0;
    while (d.phase !== 'season_end' && guard++ < 30) {
      for (const g of currentGames(d).filter((x) => !x.played)) {
        const { result, session } = simulateGame(d, g, 120);
        applyResult(d, g, result, session);
      }
      finishWeek(d);
    }
    expect(d.phase).toBe('season_end');
    expect(d.champions.length).toBe(1);
    expect(d.bracket!.champion).toBeDefined();
    expect(d.awards[0].winners.length).toBeGreaterThanOrEqual(8);
    expect(d.awards[0].allFirst.length).toBeGreaterThan(20);
    expect(Object.keys(d.records.game).length).toBeGreaterThan(3);
    const seniors = d.programs.riverside.roster.filter((p) => p.grade === 12).map((p) => p.id);
    const before = d.programs.riverside.roster.length;
    d.programs.riverside.points = 100;
    expect(buyUpgrade(d, 'youth')).toBe(true);
    runOffseason(d);
    expect(d.year).toBe(2027);
    expect(d.phase).toBe('regular');
    const ids = new Set(d.programs.riverside.roster.map((p) => p.id));
    for (const s of seniors) expect(ids.has(s)).toBe(false);
    expect(d.programs.riverside.roster.some((p) => p.grade === 9)).toBe(true);
    expect(d.programs.riverside.roster.length).toBeGreaterThan(before - seniors.length);
    expect(d.programs.riverside.history.length).toBe(1);
    // Save round-trip
    const back = deserialize<typeof d>(serialize(d));
    expect(back.programs.riverside.roster[0].attrs.spd).toBe(d.programs.riverside.roster[0].attrs.spd);
    expect(back.programs.riverside.roster[0].career.gp).toBe(d.programs.riverside.roster[0].career.gp);
    expect(back.records).toEqual(d.records);
    GameSession.HEADLESS_DT = 1 / 24;
  }, 300000);
});
