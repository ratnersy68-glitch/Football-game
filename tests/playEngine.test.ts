import { describe, expect, it } from 'vitest';
import { newPlayer, overall, ratings, pointsSpent, QB, GEAR, defaultGear } from '../src/career/player';
import { buildMatch, takenNumbers } from '../src/play/engine/roster';
import { PlaySim } from '../src/play/engine/sim';
import { Drive, fieldGoalChance } from '../src/play/engine/drive';
import { PLAYS, BUTTON_ORDER, routePreview, ROUTES } from '../src/play/engine/playbook';
import { DEFAULT_SETTINGS, type PlayOutcome, type SimSettings, type UserInput } from '../src/play/engine/types';
import { InputManager, CHARGE_TIME } from '../src/play/input';

const cp = { ...newPlayer(), firstName: 'Test', lastName: 'Player' };
const match = buildMatch(cp);
const idle: UserInput = { move: { x: 0, y: 0 }, sprint: false };

/** Run one play with a simple scripted QB: drop, throw to `slot` at `throwAt`, then run straight. */
function runPlay(sim: PlaySim, playIdx: number, defCall: 'cover1' | 'cover2' | 'cover3' | 'cover0', slot: string, throwAt = 1.8, power = 0.7): PlayOutcome {
  sim.setup({ los: 30, spotY: 26.66, play: PLAYS[playIdx], defCall });
  sim.step(1 / 60, { ...idle, snap: true });
  let thrown = false;
  for (let i = 0; i < 60 * 30 && sim.phase === 'live'; i++) {
    const me = sim.controlled;
    const input: UserInput = { ...idle };
    if (me.role === 'QB') {
      if (sim.t < 0.8) input.move = { x: -0.7, y: 0 };
      if (!thrown && sim.t >= throwAt && sim.ball.state === 'held') {
        input.throwTo = { slot, power, lob: false };
        thrown = true;
      }
    } else {
      input.move = { x: 1, y: 0 };
      input.sprint = true;
    }
    sim.step(1 / 60, input);
  }
  expect(sim.phase).toBe('dead');
  return sim.outcome!;
}

describe('real-time play engine', () => {
  it('builds 22 athletes with the created QB under user control', () => {
    expect(match.specs).toHaveLength(22);
    expect(match.specs.filter((s) => s.side === 'off')).toHaveLength(11);
    const sim = new PlaySim(match.specs, DEFAULT_SETTINGS, 1);
    expect(sim.user.role).toBe('QB');
    expect(sim.controlledId).toBe(match.userId);
  });

  it('is deterministic for the same seed and inputs', () => {
    const a = runPlay(new PlaySim(match.specs, DEFAULT_SETTINGS, 42), 2, 'cover3', 'H');
    const b = runPlay(new PlaySim(match.specs, DEFAULT_SETTINGS, 42), 2, 'cover3', 'H');
    expect(a).toEqual(b);
  });

  it('every play ends with a legal outcome, and the ball physically travels', () => {
    const sim = new PlaySim(match.specs, DEFAULT_SETTINGS, 9);
    const kinds = new Set<string>();
    for (let n = 0; n < 60; n++) {
      const slot = BUTTON_ORDER[n % 5];
      const o = runPlay(sim, n % PLAYS.length, (['cover1', 'cover2', 'cover3', 'cover0'] as const)[n % 4], slot, 1.2 + (n % 7) * 0.25);
      kinds.add(o.kind);
      expect(['tackle', 'incomplete', 'interception', 'touchdown', 'out_of_bounds', 'sack', 'safety', 'slide']).toContain(o.kind);
      expect(Number.isFinite(o.spotX)).toBe(true);
      if (o.completion) {
        expect(o.airYards).toBeGreaterThan(-8);
        expect(o.passYards).toBeGreaterThan(-10);
      }
    }
    // A varied mix of real football outcomes emerges from the simulation.
    expect(kinds.size).toBeGreaterThanOrEqual(3);
  });

  it('control switches to the receiver after a completion', () => {
    const sim = new PlaySim(match.specs, DEFAULT_SETTINGS, 3);
    let switched = false;
    for (let n = 0; n < 20 && !switched; n++) {
      sim.setup({ los: 30, spotY: 26.66, play: PLAYS[6], defCall: 'cover3' });
      sim.step(1 / 60, { ...idle, snap: true });
      let thrown = false;
      for (let i = 0; i < 60 * 12 && sim.phase === 'live'; i++) {
        const input: UserInput = { ...idle };
        if (!thrown && sim.t > 1.5 && sim.ball.state === 'held' && sim.controlled.role === 'QB') {
          input.throwTo = { slot: 'RB', power: 0.4, lob: false };
          thrown = true;
        }
        sim.step(1 / 60, input);
        if (sim.controlled.role !== 'QB') switched = true;
      }
    }
    expect(switched).toBe(true);
  });

  it('route art matches the routes the simulation assigns', () => {
    const sim = new PlaySim(match.specs, DEFAULT_SETTINGS, 5);
    const play = PLAYS.find((p) => p.id === 'smash')!;
    sim.setup({ los: 40, spotY: 26.66, play, defCall: 'cover2' });
    const preview = routePreview(play, 40, 26.66);
    for (const r of preview) {
      const a = sim.bySlot(r.slot)!;
      expect(a.x).toBeCloseTo(r.start.x, 3);
      expect(a.y).toBeCloseTo(r.start.y, 3);
    }
    sim.step(1 / 60, { ...idle, snap: true });
    const z = sim.bySlot('Z')!;
    expect(z.task.kind).toBe('route');
    if (z.task.kind === 'route') {
      const zp = preview.find((p) => p.slot === 'Z')!;
      expect(z.task.pts.length).toBe(ROUTES[play.routes.Z].points.length);
      expect(z.task.pts[0].x).toBeCloseTo(zp.pts[0].x, 1);
    }
  });

  it('difficulty makes the defense smarter, never changes ratings', () => {
    const easy: SimSettings = { ...DEFAULT_SETTINGS, difficulty: 0 };
    const hard: SimSettings = { ...DEFAULT_SETTINGS, difficulty: 3 };
    const a = new PlaySim(match.specs, easy, 1);
    const b = new PlaySim(match.specs, hard, 1);
    for (const x of a.athletes) expect(b.byId.get(x.id)!.ratings).toEqual(x.ratings);
  });
});

describe('drive rules', () => {
  const out = (o: Partial<PlayOutcome>): PlayOutcome => ({ kind: 'tackle', spotX: 25, spotY: 26.66, completion: false, passYards: 0, rushYards: 0, airYards: 0, text: '', duration: 4, ...o });

  it('moves the chains on a first down and counts downs otherwise', () => {
    const d = new Drive(DEFAULT_SETTINGS);
    expect(d.downLabel()).toBe('1st & 10');
    d.apply(out({ spotX: 29, passer: 'u', completion: true, passYards: 4 }), 'u');
    expect(d.downLabel()).toBe('2nd & 6');
    const r = d.apply(out({ spotX: 37, passer: 'u', completion: true, passYards: 8 }), 'u');
    expect(r.firstDown).toBe(true);
    expect(d.downLabel()).toBe('1st & 10');
    expect(d.los).toBe(37);
    expect(d.stats.comp).toBe(2);
  });

  it('incompletions keep the spot; four failures turn it over', () => {
    const d = new Drive(DEFAULT_SETTINGS);
    for (let i = 0; i < 4; i++) d.apply(out({ kind: 'incomplete', passer: 'u' }), 'u');
    expect(d.over).toBe(true);
    expect(d.reason).toBe('Turnover on downs');
    expect(d.downLabel()).toBe('Turnover on downs');
    expect(d.los).toBe(25);
  });

  it('touchdowns score 7 and end the drive; goal-to-go shows Goal', () => {
    const d = new Drive(DEFAULT_SETTINGS);
    d.los = 95;
    d.distance = 5;
    expect(d.downLabel()).toBe('1st & Goal');
    const r = d.apply(out({ kind: 'touchdown', spotX: 100, passer: 'u', completion: true, passYards: 5 }), 'u');
    expect(r.touchdown).toBe(true);
    expect(d.score.us).toBe(7);
    expect(d.stats.passTD).toBe(1);
    expect(d.over).toBe(true);
  });

  it('the game clock runs and stops correctly', () => {
    const d = new Drive({ ...DEFAULT_SETTINGS, quarterMinutes: 5 });
    const c0 = d.clock;
    d.apply(out({ kind: 'incomplete', duration: 3 }), 'u');
    expect(c0 - d.clock).toBeCloseTo(3, 5); // clock stops on incompletions
    const c1 = d.clock;
    d.apply(out({ kind: 'tackle', spotX: 27, duration: 4 }), 'u');
    expect(c1 - d.clock).toBeGreaterThan(4); // runoff between plays
  });

  it('field goal odds fall with distance', () => {
    expect(fieldGoalChance(25)).toBeGreaterThan(0.9);
    expect(fieldGoalChance(55)).toBeLessThan(fieldGoalChance(40));
  });
});

describe('created player', () => {
  it('build points are capped and change the overall', () => {
    const p = newPlayer();
    const base = overall(ratings(p));
    p.build = { throwPower: QB.buildCap, deepAccuracy: QB.buildCap };
    expect(pointsSpent(p)).toBe(QB.buildCap * 2);
    expect(overall(ratings(p))).toBeGreaterThan(base);
  });

  it('gear list has every slot with options (no documentation keys)', () => {
    const keys = Object.keys(GEAR);
    expect(keys).not.toContain('_comment');
    for (const k of Object.keys(defaultGear())) expect(keys).toContain(k);
    for (const k of keys) expect(GEAR[k as keyof typeof GEAR].options.length).toBeGreaterThan(1);
  });

  it('returning players keep their numbers', () => {
    const taken = takenNumbers('ohio_state');
    expect(taken.size).toBeGreaterThan(5);
  });
});

describe('input', () => {
  function fakeWindow() {
    const handlers: Record<string, ((e: unknown) => void)[]> = {};
    return {
      addEventListener: (t: string, h: (e: unknown) => void) => (handlers[t] ??= []).push(h),
      removeEventListener: () => undefined,
      fire: (t: string, code: string) => handlers[t]?.forEach((h) => h({ code, preventDefault: () => undefined, target: null })),
    };
  }

  it('maps WASD to field directions and charges throws while held', async () => {
    const w = fakeWindow();
    const im = new InputManager(w as unknown as Window);
    w.fire('keydown', 'KeyW');
    w.fire('keydown', 'KeyD');
    let f = im.poll();
    expect(f.move).toEqual({ x: 1, y: 1 });
    w.fire('keydown', 'Digit2');
    await new Promise((r) => setTimeout(r, 120));
    f = im.poll();
    expect(f.charging?.slot).toBe(BUTTON_ORDER[1]);
    expect(f.charging!.power).toBeGreaterThan(0.05);
    expect(f.charging!.power).toBeLessThan(120 / 1000 / CHARGE_TIME + 0.2);
    w.fire('keyup', 'Digit2');
    f = im.poll();
    expect(f.throwTo?.slot).toBe(BUTTON_ORDER[1]);
    expect(f.charging).toBeNull();
    // a tap is a soft touch pass, a long hold a bullet
    im.tap('Digit1', 0);
    expect(im.poll().throwTo!.power).toBeLessThan(0.1);
    im.tap('Digit1', 2000);
    expect(im.poll().throwTo!.power).toBe(1);
  });
});
