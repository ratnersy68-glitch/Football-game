import { describe, it, expect } from 'vitest';
import { PlaySim, NO_INPUT, type ControlInput, type SimSetup } from '../src/game/PlaySim';
import { buildDepthChart } from '../src/game/Lineup';
import { generateRoster } from '../src/game/players';
import { RNG } from '../src/game/rng';
import { playById } from '../src/game/Plays';
import { GameSession } from '../src/game/GameSession';
import { HumanBot } from '../src/game/Bot';
import { getTeam } from '../src/data/teams';

const rng = new RNG(5);
const off = buildDepthChart(generateRoster(68, 68, 68, rng));
const def = buildDepthChart(generateRoster(68, 68, 68, rng));

function run(setup: Partial<SimSetup>, input: (s: PlaySim) => ControlInput = () => NO_INPUT, seed = 1) {
  const sim = new PlaySim({
    kind: 'scrimmage', los: 30, ballY: 26.67, offPlay: playById('inside_zone'), defCall: { formation: '4-3', coverage: 'Cover 3' },
    offDepth: off, defDepth: def, userTeam: null, skill: { O: 0.55, D: 0.55 }, weather: 'clear', seed, firstDownX: 40, ...setup,
  });
  sim.snap();
  let n = 0;
  while (!sim.done && n++ < 5000) sim.step(1 / 60, input(sim));
  return sim;
}

describe('play simulation', () => {
  it('every kind of play terminates with an outcome', () => {
    for (const id of ['inside_zone', 'sweep', 'qb_read', 'slants', 'four_verts', 'pa_boot', 'rb_screen', 'sneak', 'punt', 'kneel', 'spike']) {
      for (let seed = 1; seed <= 5; seed++) {
        const sim = run({ offPlay: playById(id), kind: id === 'punt' ? 'punt' : 'scrimmage' }, undefined, seed);
        expect(sim.done, id).toBe(true);
        expect(sim.outcome, id).not.toBeNull();
      }
    }
  });

  it('run plays credit the rusher with yards from the line of scrimmage', () => {
    const sim = run({ offPlay: playById('inside_zone') }, undefined, 3);
    const o = sim.outcome!;
    if (o.type !== 'td' && o.team === 'O') {
      expect(o.rusher).toBeDefined();
      expect(o.rushYds).toBe(Math.round(o.spotX - 30));
    }
  });

  it('a human QB can throw to a numbered receiver', () => {
    let threw = false;
    const sim = run({ offPlay: playById('slants'), userTeam: 'O' }, (s) => {
      if (!threw && s.t > 0.9) { threw = true; return { ...NO_INPUT, throwTo: 1 }; }
      return NO_INPUT;
    }, 2);
    expect(sim.passThrown).toBe(true);
    expect(sim.outcome!.passAttempt).toBe(true);
  });

  it('a human ball carrier running at the sideline goes out of bounds (or is tackled first)', () => {
    let oob = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const sim = run({ offPlay: playById('sweep'), userTeam: 'O', ballY: 40 }, (s) => (s.carrier === s.user ? { ...NO_INPUT, mx: 0.3, my: 1, sprint: true } : NO_INPUT), seed);
      if (sim.outcome!.type === 'oob') { oob++; expect(sim.outcome!.clockStops).toBe(true); }
    }
    expect(oob).toBeGreaterThan(0);
  });

  it('a QB who never throws from his own end zone eventually gets sacked for a safety (or escapes)', () => {
    let safeties = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const sim = run({ offPlay: playById('four_verts'), userTeam: 'O', los: 2, defCall: { formation: 'Nickel', coverage: 'Blitz' } }, (s) => (s.user && s.carrier === s.user && s.t > 0.8 ? { ...NO_INPUT, mx: -0.3 } : NO_INPUT), seed);
      if (sim.outcome!.type === 'safety') { safeties++; expect(sim.outcome!.scoringTeam).toBe('D'); }
    }
    expect(safeties).toBeGreaterThan(0);
  });

  it('kickoffs are returned by the receiving team', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const sim = new PlaySim({ kind: 'kickoff', los: 40, ballY: 26.67, offDepth: off, defDepth: def, userTeam: null, skill: { O: 0.5, D: 0.5 }, weather: 'clear', seed });
      sim.snap();
      let n = 0;
      while (!sim.done && n++ < 5000) sim.step(1 / 60);
      const o = sim.outcome!;
      expect(['tackle', 'touchback', 'oob', 'td', 'recovered', 'downed']).toContain(o.type);
      if (o.type === 'tackle') expect(o.team).toBe('D');
    }
  });

  it('interceptions happen and flip possession', () => {
    let ints = 0;
    for (let seed = 1; seed <= 150 && ints === 0; seed++) {
      // A human QB forcing deep balls into quarters coverage
      let threw = false;
      const sim = run({ offPlay: playById('four_verts'), defCall: { formation: 'Dime', coverage: 'Cover 4' }, userTeam: 'O', skill: { O: 0.5, D: 0.95 } }, (s) => {
        if (!threw && s.t > 1.7) { threw = true; return { ...NO_INPUT, throwTo: 1 + (seed % 4) }; }
        return NO_INPUT;
      }, seed);
      if (sim.outcome!.interceptor) { ints++; expect(['tackle', 'td', 'touchback', 'oob', 'recovered']).toContain(sim.outcome!.type); expect(sim.outcome!.team === 'D' || sim.outcome!.type === 'recovered').toBe(true); }
    }
    expect(ints).toBeGreaterThan(0);
  });
});

describe('full games', () => {
  const team = (id: string) => ({ info: getTeam(id), roster: generateRoster(getTeam(id).offenseRating, getTeam(id).defenseRating, getTeam(id).specialTeamsRating, new RNG(id.length)) });

  it('CPU vs CPU games always finish with consistent scoring', () => {
    for (let i = 0; i < 4; i++) {
      const s = new GameSession({ home: team('riverside'), away: team('stone-bridge'), userSide: null, difficulty: 'VARSITY', quarterLen: 120, weather: i % 2 ? 'rain' : 'clear', timeOfDay: 'night', seed: 100 + i });
      const r = s.simulateToEnd();
      expect(s.isOver).toBe(true);
      expect(r.homeScore).not.toBe(r.awayScore);
      const fromLog = (side: 'home' | 'away') => r.scoring.filter((x) => x.team === side).reduce((a, b) => a + b.points, 0);
      expect(fromLog('home')).toBe(r.homeScore);
      expect(fromLog('away')).toBe(r.awayScore);
      expect(r.qScores.home.reduce((a, b) => a + b, 0)).toBe(r.homeScore);
    }
  });

  it('interactive games driven by a human-like bot finish', () => {
    for (const diff of ['FRESHMAN', 'LEGEND'] as const) {
      const s = new GameSession({ home: team('heritage'), away: team('tuscarora'), userSide: 'home', difficulty: diff, quarterLen: 120, weather: 'clear', timeOfDay: 'night', seed: 7 });
      new HumanBot(3).play(s);
      expect(s.isOver).toBe(true);
      expect(s.playCount).toBeGreaterThan(20);
    }
  });

  it('timeouts stop the clock and are limited to three per half', () => {
    const s = new GameSession({ home: team('riverside'), away: team('dominion'), userSide: 'home', difficulty: 'VARSITY', quarterLen: 120, weather: 'clear', timeOfDay: 'night', seed: 9 });
    s.g.pendingRunoff = 16;
    s.g.clockRunning = true;
    expect(s.callTimeout('home')).toBe(true);
    expect(s.g.pendingRunoff).toBe(0);
    s.callTimeout('home');
    s.callTimeout('home');
    expect(s.callTimeout('home')).toBe(false);
    expect(s.g.timeouts.home).toBe(0);
  });
});
