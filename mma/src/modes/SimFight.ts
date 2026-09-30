import { AIController } from '../ai/AIController';
import type { DifficultyId } from '../ai/Difficulty';
import { Rng } from '../core/rng';
import type { FighterData } from '../data';
import { FightEngine } from '../engine/FightEngine';
import type { FightResult } from '../engine/types';

export interface SimOptions {
  rounds?: number;
  seed?: number;
  difficulty?: [DifficultyId, DifficultyId];
  /** Fight-clock seconds per sim second (1 = real 5-minute rounds of simulated action). */
  clockSpeed?: number;
  dt?: number;
}

/**
 * Runs a complete AI-vs-AI fight headlessly using the real engine (used for tournament fights the
 * player isn't in, and for balance tests).
 */
export function simulateFight(a: FighterData, b: FighterData, o: SimOptions = {}): { result: FightResult; engine: FightEngine } {
  const seed = o.seed ?? Math.floor(Math.random() * 2 ** 31);
  const engine = new FightEngine({
    fighters: [a, b], rounds: o.rounds ?? 3, roundSeconds: 300, clockSpeed: o.clockSpeed ?? 2.5, seed, arenaId: 'apex', headless: true,
  });
  const rng = new Rng(seed ^ 0x5bd1e995);
  const diff = o.difficulty ?? ['pro', 'pro'];
  const ai = [new AIController(engine, 0, diff[0], rng.fork()), new AIController(engine, 1, diff[1], rng.fork())];
  const dt = o.dt ?? 1 / 30;
  engine.start();
  let guard = 0;
  while (engine.status !== 'finished' && guard++ < 2_000_000) {
    if (engine.status === 'betweenRounds') {
      engine.startNextRound();
      continue;
    }
    engine.update(dt, [ai[0].update(dt), ai[1].update(dt)]);
  }
  return { result: engine.result!, engine };
}
