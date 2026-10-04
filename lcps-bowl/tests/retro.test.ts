import { describe, it, expect } from 'vitest';
import { PlaySim, NO_INPUT, type ControlInput } from '../src/game/PlaySim';
import { buildDepthChart } from '../src/game/Lineup';
import { generateRoster } from '../src/game/players';
import { RNG } from '../src/game/rng';
import { playById } from '../src/game/Plays';
import { GameSession } from '../src/game/GameSession';
import { getTeam } from '../src/data/teams';

const rng = new RNG(5);
const off = buildDepthChart(generateRoster(68, 68, 68, rng));
const def = buildDepthChart(generateRoster(68, 68, 68, rng));
const mk = (seed: number) => new PlaySim({
  kind: 'scrimmage', los: 30, ballY: 26.67, offPlay: playById('slants'), defCall: { formation: '4-3', coverage: 'Cover 3' },
  offDepth: off, defDepth: def, userTeam: 'O', skill: { O: 0.55, D: 0.55 }, weather: 'clear', seed, firstDownX: 40,
});

describe('Retro Bowl-style controls', () => {
  it('slingshot throw-to-spot: the ball flies to the aimed spot and the play resolves (catch, incompletion or pick)', () => {
    let caught = 0;
    for (let seed = 1; seed <= 24; seed++) {
      const sim = mk(seed);
      sim.snap();
      let thrown = false;
      for (let n = 0; n < 6000 && !sim.done; n++) {
        let ci: ControlInput = NO_INPUT;
        if (!thrown && sim.t > 0.6 && sim.ball.state === 'held' && sim.ball.holder === sim.qbIdx) {
          const r = sim.actors.filter((a) => a.team === 'O' && a.role === 'route')[seed % 3];
          const p = sim.predict(r, 0.7);
          ci = { ...NO_INPUT, throwAt: { x: p.x, y: p.y } };
          thrown = true;
        }
        sim.step(1 / 60, ci);
      }
      expect(sim.done).toBe(true);
      if (thrown && sim.passThrown) {
        expect(sim.events.some((e) => e.t === 'throw')).toBe(true);
        if (sim.events.some((e) => e.t === 'catch')) caught++;
      }
    }
    expect(caught).toBeGreaterThan(6); // aiming at a receiver's spot completes a fair share of passes
  });

  it('a throw at empty grass is not a free completion', () => {
    const sim = mk(3);
    sim.snap();
    let sent = false;
    for (let n = 0; n < 6000 && !sim.done; n++) {
      const ci = !sent && sim.t > 0.5 && sim.ball.holder === sim.qbIdx ? { ...NO_INPUT, throwAt: { x: 78, y: 27 } } : NO_INPUT;
      if (ci !== NO_INPUT) sent = true;
      sim.step(1 / 60, ci);
    }
    expect(sim.events.some((e) => e.t === 'catch')).toBe(false);
  });

  it('drag-back field goals use kicker ratings: centered full pull is good, wild aim or weak pull misses', () => {
    const team = (id: string) => ({ info: getTeam(id), roster: generateRoster(70, 70, 75, new RNG(id.length)) });
    const kick = (aim: number, power: number) => {
      const s = new GameSession({ home: team('riverside'), away: team('heritage'), userSide: 'home', difficulty: 'VARSITY', quarterLen: 120, weather: 'clear', timeOfDay: 'night', seed: 4 });
      s.g.possession = 'home';
      s.startFieldGoal('xp');
      expect(s.phase).toBe('kick_meter');
      s.kickSwipe(aim, power);
      expect(s.phase).toBe('kick_anim');
      return s.kickAnim!;
    };
    expect(kick(0, 1).good).toBe(true);
    expect(kick(2, 1).good).toBe(false);
    expect(kick(-2, 1).good).toBe(false);
    const weak = kick(0, 0.1);
    expect(weak.good).toBe(false);
    expect(weak.short).toBe(true);
  });
});
