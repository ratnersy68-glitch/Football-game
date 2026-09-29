import { describe, expect, it } from 'vitest';
import { buildExhibition, gameSetupFor } from '../src/simulation/world';
import { GameSimulation } from '../src/simulation/game/gameEngine';
import { buildAnimation } from '../src/visualization/playAnimator';
import { sample } from '../src/visualization/animation';

describe('visualization mirrors the simulation', () => {
  const games = [1, 2, 3, 4, 5].map((seed) => {
    const w = buildExhibition('alabama', 'auburn', seed);
    const eng = new GameSimulation(gameSetupFor(w, 'alabama', 'auburn', { seed }));
    eng.simulateToEnd();
    return { eng, players: w.players };
  });

  it('lines players up on the correct side of the ball and ends the ball at the engine spot', () => {
    let checked = 0;
    for (const { eng, players } of games) {
      for (const ev of eng.events) {
        const a = buildAnimation(ev, players);
        if (!a || !['run', 'pass', 'sack', 'scramble'].includes(ev.kind) || ev.turnover || ev.penalty) continue;
        checked++;
        const losX = ev.direction === 1 ? ev.ballOn : 100 - ev.ballOn;
        for (const act of a.actors) {
          const u = (sample(act.path, 0).x - losX) * ev.direction;
          if (act.side === ev.offense) expect(u).toBeLessThanOrEqual(0.1);
          else expect(u).toBeGreaterThanOrEqual(0.3);
        }
        if (ev.score || ev.complete === false || ev.throwaway) continue;
        const end = sample(a.ball, a.duration);
        const want = ev.direction === 1 ? ev.ballOn + ev.yards : 100 - ev.ballOn - ev.yards;
        expect(Math.abs(end.x - want)).toBeLessThan(1.2);
      }
    }
    expect(checked).toBeGreaterThan(300);
  });

  it('builds an animation for every play type without throwing', () => {
    for (const { eng, players } of games) {
      for (const ev of eng.events) {
        const a = buildAnimation(ev, players);
        if (ev.kind === 'period_end') expect(a).toBeNull();
        else {
          expect(a).not.toBeNull();
          expect(a!.duration).toBeGreaterThan(0.5);
          expect(a!.duration).toBeLessThan(20);
        }
      }
    }
  });
});
