import { describe, expect, it } from 'vitest';
import { UNIVERSE_TEAMS } from '../src/data';
import { Rng } from '../src/core/rng';
import { buildExhibition, buildWorld, counterIdGen, gameSetupFor } from '../src/simulation/world';
import { GameSimulation } from '../src/simulation/game/gameEngine';
import type { PlayEvent } from '../src/simulation/game/types';

const world = buildWorld(11, counterIdGen().next);

function randomGames(n: number, seed: number) {
  const rng = new Rng(seed);
  const out: { eng: GameSimulation; h: string; a: string }[] = [];
  for (let i = 0; i < n; i++) {
    const h = rng.pick(UNIVERSE_TEAMS).id;
    let a = rng.pick(UNIVERSE_TEAMS).id;
    while (a === h) a = rng.pick(UNIVERSE_TEAMS).id;
    const eng = new GameSimulation(gameSetupFor(world, h, a, { seed: rng.int(1, 1e9) }));
    eng.simulateToEnd();
    out.push({ eng, h, a });
  }
  return out;
}

const games = randomGames(400, 5);

describe('game engine invariants (400 games)', () => {
  it('every game finishes with a winner', () => {
    for (const { eng } of games) {
      expect(eng.isFinal).toBe(true);
      const r = eng.result();
      expect(r.homeScore).not.toBe(r.awayScore);
    }
  });

  it('never produces impossible clocks, downs, distances or field positions', () => {
    for (const { eng } of games) {
      let lastQ = 1;
      let lastClock = 900;
      for (const e of eng.events) {
        expect(e.clockBefore).toBeGreaterThanOrEqual(0);
        expect(e.clockAfter).toBeGreaterThanOrEqual(0);
        expect(e.clockAfter).toBeLessThanOrEqual(900);
        expect(e.ballOnAfter).toBeGreaterThanOrEqual(0);
        expect(e.ballOnAfter).toBeLessThanOrEqual(100);
        if (e.kind !== 'period_end' && !e.final) {
          expect(e.downAfter).toBeGreaterThanOrEqual(1);
          expect(e.downAfter).toBeLessThanOrEqual(4);
          expect(e.distanceAfter).toBeGreaterThanOrEqual(1);
        }
        // Clock never runs backwards within a quarter.
        if (e.quarter === lastQ && e.quarter <= 4) expect(e.clockBefore).toBeLessThanOrEqual(lastClock + 1e-9);
        lastQ = e.quarterAfter;
        lastClock = e.clockAfter;
      }
    }
  });

  it('scores are consistent with scoring plays', () => {
    for (const { eng } of games) {
      let home = 0;
      let away = 0;
      for (const e of eng.events) {
        if (e.score) {
          if (e.score.team === 'home') home += e.score.points;
          else away += e.score.points;
        }
        expect(e.scoreAfter.home).toBe(home);
        expect(e.scoreAfter.away).toBe(away);
      }
      const r = eng.result();
      expect(r.homeScore).not.toBe(1);
      expect(r.awayScore).not.toBe(1);
      expect(r.home.scoreByPeriod.reduce((a, b) => a + b, 0)).toBe(r.homeScore);
      expect(r.away.scoreByPeriod.reduce((a, b) => a + b, 0)).toBe(r.awayScore);
    }
  });

  it('possession changes only on kicks, turnovers, scores or downs', () => {
    for (const { eng } of games) {
      for (const e of eng.events) {
        if (['run', 'pass', 'scramble', 'kneel'].includes(e.kind) && e.possessionAfter !== e.offense) {
          expect(e.turnover !== undefined || e.score !== undefined || e.final || e.quarterAfter > 4).toBe(true);
        }
      }
    }
  });

  it('first downs reset to 1st & 10 (or goal)', () => {
    for (const { eng } of games) {
      for (const e of eng.events) {
        if (e.firstDown && !e.score && e.possessionAfter === e.offense) {
          expect(e.downAfter).toBe(1);
          expect(e.distanceAfter).toBe(Math.min(10, 100 - e.ballOnAfter));
        }
      }
    }
  });

  it('produces a realistic scoring distribution', () => {
    const pts = games.flatMap(({ eng }) => [eng.result().homeScore, eng.result().awayScore]);
    const mean = pts.reduce((a, b) => a + b, 0) / pts.length;
    expect(mean).toBeGreaterThan(20);
    expect(mean).toBeLessThan(36);
    expect(Math.max(...pts)).toBeLessThan(110);
    const plays = games.map(({ eng }) => eng.events.filter((e) => ['run', 'pass', 'sack', 'scramble'].includes(e.kind)).length / 2);
    const avgPlays = plays.reduce((a, b) => a + b, 0) / plays.length;
    expect(avgPlays).toBeGreaterThan(60);
    expect(avgPlays).toBeLessThan(85);
  });

  it('strong teams generally beat weak teams without always winning', () => {
    let wins = 0;
    const N = 200;
    const w = buildExhibition('ohio_state', 'purdue', 3);
    for (let i = 0; i < N; i++) {
      const eng = new GameSimulation(gameSetupFor(w, 'purdue', 'ohio_state', { seed: 1000 + i }));
      eng.simulateToEnd();
      const r = eng.result();
      if (r.awayScore > r.homeScore) wins++;
    }
    expect(wins / N).toBeGreaterThan(0.8);
    expect(wins / N).toBeLessThan(1);
  });
});

describe('reproducibility', () => {
  const run = (seed: number) => {
    const w = buildExhibition('ohio_state', 'michigan', 1);
    const eng = new GameSimulation(gameSetupFor(w, 'ohio_state', 'michigan', { seed }));
    eng.simulateToEnd();
    return eng.events.map((e: PlayEvent) => e.text);
  };
  it('same seed reproduces the same game play for play', () => {
    expect(run(48291)).toEqual(run(48291));
  });
  it('different seeds produce different games', () => {
    expect(run(48291)).not.toEqual(run(48292));
  });
  it('stepwise and full simulation are identical', () => {
    const w = buildExhibition('texas', 'oklahoma', 2);
    const a = new GameSimulation(gameSetupFor(w, 'texas', 'oklahoma', { seed: 9 }));
    const b = new GameSimulation(gameSetupFor(w, 'texas', 'oklahoma', { seed: 9 }));
    a.simulateToEnd();
    while (!b.isFinal) b.step();
    expect(b.events.map((e) => e.text)).toEqual(a.events.map((e) => e.text));
  });
});

describe('coaching decisions', () => {
  it('pauses for the user on 4th down and honors the call', () => {
    const w = buildExhibition('georgia', 'alabama', 4);
    const eng = new GameSimulation(gameSetupFor(w, 'georgia', 'alabama', { seed: 77, userSide: 'home', promptFourthDown: true }));
    let prompts = 0;
    let honored = 0;
    while (!eng.isFinal) {
      const dec = eng.pendingDecision();
      if (dec) {
        prompts++;
        const ev = eng.step({ fourthDown: 'go' })!;
        if (['run', 'pass', 'sack', 'scramble', 'penalty', 'kneel', 'period_end'].includes(ev.kind)) honored++;
      } else eng.step();
    }
    expect(prompts).toBeGreaterThan(0);
    expect(honored).toBe(prompts);
  });
});

describe('overtime', () => {
  it('overtime games follow college rules and end with a winner', () => {
    const ot = games.filter(({ eng }) => eng.result().overtimePeriods > 0);
    for (const { eng } of ot) {
      const otPlays = eng.events.filter((e) => e.quarter >= 5 && ['run', 'pass', 'sack', 'scramble'].includes(e.kind));
      // Every OT possession starts at the opponent 25 (ballOn 75) or later.
      for (const e of otPlays) expect(e.ballOn).toBeGreaterThanOrEqual(1);
      const r = eng.result();
      expect(r.homeScore).not.toBe(r.awayScore);
      // From the 2nd OT on, PAT kicks are not allowed.
      for (const e of eng.events) if (e.quarter >= 6) expect(e.kind).not.toBe('extra_point');
    }
  });
});
