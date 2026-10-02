import { describe, expect, it } from 'vitest';
import { battedBall, makeEnv, predictPath } from '../src/baseball/engine/BallPhysics';
import { STADIUM_BY_ID } from '../src/baseball/data/stadiums';
import { TEAMS, TEAM_BY_ID, defaultSetup } from '../src/baseball/managers/TeamManager';
import { GameEngine, emptyInput } from '../src/baseball/engine/GameEngine';
import { createPitch, isInZone } from '../src/baseball/engine/PitchEngine';
import { resolveSwing } from '../src/baseball/engine/BattingEngine';
import { DEFAULT_PREFS, type GameSettings } from '../src/baseball/core/types';
import { Rng } from '../src/baseball/core/math';
import { CONTACT_Z, pitchPos, timeAtZ } from '../src/baseball/engine/PitchEngine';

const cond = { time: 'Day' as const, weather: 'Clear' as const, temperature: 72, windMph: 0, windDir: 0 };

function carry(stadium: string, ev: number, la: number, c = cond) {
  const st = { ...STADIUM_BY_ID[stadium], dims: [700, 700, 700, 700, 700] as [number, number, number, number, number] };
  const path = predictPath(battedBall({ x: 0, y: 3, z: 1.4 }, ev, la, 0, 1200 + la * 45, 0), makeEnv(st, c), 12);
  return path.find((s, i) => i > 0 && s.event === 'bounce')!.z;
}

describe('baseball physics', () => {
  it('carries like Statcast batted balls', () => {
    const d = carry('kauffman', 105, 28);
    expect(d).toBeGreaterThan(385);
    expect(d).toBeLessThan(425);
    expect(carry('kauffman', 95, -8)).toBeLessThan(40); // hard grounder
  });
  it('flies further at altitude and in heat', () => {
    expect(carry('coors', 100, 30)).toBeGreaterThan(carry('kauffman', 100, 30) + 15);
    expect(carry('kauffman', 100, 30, { ...cond, temperature: 95 })).toBeGreaterThan(carry('kauffman', 100, 30, { ...cond, temperature: 45 }));
  });
  it('different pitches move differently', () => {
    const p = TEAM_BY_ID.PIT.roster.find((x) => x.name === 'Paul Skenes')!;
    const rng = new Rng(1);
    const ff = createPitch(p, 'R', { code: 'FF', target: { x: 0, y: 2.5 }, meterError: 0 }, 0, rng);
    const cu = createPitch(p, 'R', { code: 'CU', target: { x: 0, y: 2.5 }, meterError: 0 }, 0, rng);
    expect(ff.mph).toBeGreaterThan(cu.mph + 12);
    expect(cu.dev.y).toBeLessThan(ff.dev.y - 1.5); // curveball drops much more
    expect(ff.T).toBeLessThan(cu.T);
  });
  it('a well-timed, well-placed swing barrels the ball; a bad one misses', () => {
    const p = TEAM_BY_ID.NYY.roster.find((x) => x.name === 'Gerrit Cole')!;
    const b = TEAM_BY_ID.NYY.roster.find((x) => x.name === 'Aaron Judge')!;
    const rng = new Rng(2);
    const f = createPitch(p, 'R', { code: 'FF', target: { x: 0, y: 2.6 }, meterError: 0 }, 0, rng);
    const tc = timeAtZ(f, CONTACT_Z);
    const at = pitchPos(f, tc);
    const good = resolveSwing(b, p, f, { type: 'normal', pci: { x: at.x, y: at.y }, pressTime: tc - 0.14 }, { timing: 1, pci: 1 }, rng);
    expect(good.contact).toBe(true);
    expect(good.ev).toBeGreaterThan(100);
    const bad = resolveSwing(b, p, f, { type: 'normal', pci: { x: at.x + 1.5, y: at.y }, pressTime: tc - 0.14 }, { timing: 1, pci: 1 }, rng);
    expect(bad.contact).toBe(false);
    expect(isInZone(0, 2.5)).toBe(true);
  });
});

describe('baseball game engine', () => {
  it('has 30 teams with full rosters', () => {
    expect(TEAMS.length).toBe(30);
    for (const t of TEAMS) {
      expect(t.roster.filter((p) => p.pitcher).length).toBeGreaterThanOrEqual(9);
      expect(defaultSetup(t).lineup.map((l) => l.pos).sort()).toEqual(['1B', '2B', '3B', 'C', 'CF', 'DH', 'LF', 'RF', 'SS']);
    }
  });
  it('plays a complete CPU vs CPU game to a legal final', () => {
    const h = TEAM_BY_ID.LAD, a = TEAM_BY_ID.NYY;
    const settings: GameSettings = { innings: 3, difficulty: 'VETERAN', stadiumId: h.stadiumId, conditions: cond, home: defaultSetup(h), away: defaultSetup(a), userSide: 'none', ghostRunner: true };
    const e = new GameEngine(settings, DEFAULT_PREFS, 42);
    const inp = emptyInput();
    for (let i = 0; i < 60 * 60 * 90 && e.phase !== 'final'; i++) e.update(1 / 60, inp);
    expect(e.phase).toBe('final');
    const s = e.state;
    expect(s.home.runs).not.toBe(s.away.runs);
    expect(s.home.linescore.reduce((x, y) => x + y, 0)).toBe(s.home.runs);
    expect(s.away.linescore.reduce((x, y) => x + y, 0)).toBe(s.away.runs);
    let outs = 0;
    for (const [, p] of e.stats.pitch) outs += p.outs;
    expect(outs).toBeGreaterThanOrEqual(15);
  });
  it('walks force runners and score a run with the bases loaded', () => {
    const h = TEAM_BY_ID.SEA, a = TEAM_BY_ID.HOU;
    const e = new GameEngine({ innings: 9, difficulty: 'VETERAN', stadiumId: h.stadiumId, conditions: cond, home: defaultSetup(h), away: defaultSetup(a), userSide: 'none', ghostRunner: true }, DEFAULT_PREFS, 1);
    const roster = a.roster;
    e.state.bases = [0, 1, 2].map((i) => ({ player: roster[i + 3], responsiblePitcherId: e.state.home.pitcher.id, reachedOnError: false }));
    e.state.balls = 3;
    e.rules.applyPitch('ball');
    expect(e.state.away.runs).toBe(1);
    expect(e.state.bases.every(Boolean)).toBe(true);
  });
});
