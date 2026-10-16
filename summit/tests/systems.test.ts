import { describe, expect, it } from 'vitest';
import { classifyAir, newAirData, TrickSystem } from '../src/physics/tricks';
import { LiftSystem } from '../src/game/lifts';
import { RESORTS } from '../src/data/resorts';
import { buildResort } from '../src/world/resortBuilder';
import { Skier, NO_INPUT } from '../src/physics/skier';
import { newProfile } from '../src/state/save';
import { applyResult, buy, equip } from '../src/state/progress';
import { STAGES, TOURNAMENTS, careerEvents } from '../src/data/career';
import { ITEMS, gearStats } from '../src/data/equipment';
import { Recorder, encode, decode, sample, emptyFrame, duration } from '../src/game/replay';
import { synthTerrain } from './helpers';

const air = (o: Partial<ReturnType<typeof newAirData>>) => ({ ...newAirData(), air: 1.5, height: 3, ...o });

describe('trick naming', () => {
  it('names spins, flips, corks, misties, rodeos and grabs', () => {
    expect(classifyAir(air({ spinAccum: Math.PI * 2 }))!.name).toBe('360');
    expect(classifyAir(air({ spinAccum: -Math.PI * 3 }))!.name).toBe('540');
    expect(classifyAir(air({ flipAccum: -Math.PI * 2, inversions: 1 }))!.name).toBe('Backflip');
    expect(classifyAir(air({ flipAccum: Math.PI * 4, inversions: 2 }))!.name).toBe('Double Frontflip');
    expect(classifyAir(air({ spinAccum: Math.PI * 6, inversions: 2, offAxisTime: 0.6 }))!.name).toBe('Double Cork 1080');
    expect(classifyAir(air({ spinAccum: Math.PI * 8, inversions: 3, offAxisTime: 1 }))!.name).toBe('Triple Cork 1440');
    expect(classifyAir(air({ spinAccum: Math.PI * 4, inversions: 1, flipAccum: Math.PI * 1.2 }))!.name).toBe('Misty 720');
    expect(classifyAir(air({ spinAccum: Math.PI * 3, inversions: 1, flipAccum: -Math.PI * 1.2 }))!.name).toBe('Rodeo 540');
    const g = newAirData().grabTimes; g[2] = 0.6;
    expect(classifyAir(air({ spinAccum: Math.PI * 4, grabTimes: g }))!.name).toBe('720 Mute');
    expect(classifyAir(air({ air: 0.2, height: 0.3 }))).toBeNull();
  });
  it('scores combos and penalises repeats', () => {
    const t = new TrickSystem();
    const a = t.landAir(air({ spinAccum: Math.PI * 2 }), 'clean')!;
    const b = t.landAir(air({ spinAccum: Math.PI * 2 }), 'clean')!;
    expect(b.score).toBeLessThan(a.score);
    expect(t.comboMult).toBe(2);
    t.tick(3, true);
    expect(t.total).toBe((a.score + b.score) * 2);
    t.landAir(air({ spinAccum: Math.PI * 4 }), 'clean');
    t.bust();
    t.tick(3, true);
    expect(t.total).toBe((a.score + b.score) * 2);
  });
});

describe('lifts', () => {
  it('carries the rider from the bottom station to the top and unloads them downhill', () => {
    const r = buildResort(RESORTS[0]);
    const world = { terrain: r.terrain };
    const lifts = new LiftSystem(r.lifts);
    const s = new Skier();
    const L = r.lifts[1];
    s.place(world, L.bottom.x, L.bottom.z - 6, 0, 0);
    expect(lifts.nearStation(s.pos.x, s.pos.z)).toBe(1);
    lifts.board(1, s);
    let maxY = -Infinity, unloaded = false, t = 0;
    while (t < 2000 && !unloaded) {
      lifts.update(0.25);
      unloaded = lifts.step(0.25, s, world);
      maxY = Math.max(maxY, s.pos.y);
      if (!unloaded) expect(s.pos.y).toBeGreaterThan(r.terrain.gridHeight(s.pos.x, s.pos.z) - 0.5);
      t += 0.25;
    }
    expect(unloaded).toBe(true);
    expect(s.state).toBe('ride');
    expect(Math.hypot(s.pos.x - L.top.x, s.pos.z - L.top.z)).toBeLessThan(25);
    expect(t).toBeGreaterThan(L.length / L.speed * 0.8);
  });
});

describe('progression', () => {
  it('buys, equips and changes physics stats', () => {
    const p = newProfile();
    p.coins = 5000;
    expect(buy(p, 'ski-allmtn')).toBeNull();
    equip(p, 'ski-allmtn');
    expect(p.coins).toBe(4100);
    expect(gearStats(p.equipped, 'ski').carving).toBeGreaterThan(0.5);
    expect(buy(p, 'ski-pro')).toMatch(/Locked/);
    p.coins = 10;
    expect(buy(p, 'ski-park')).toMatch(/Not enough/);
    expect(ITEMS.length).toBeGreaterThan(30);
  });
  it('awards medals once per event and tracks tournaments', () => {
    const p = newProfile();
    const ev = careerEvents()[0];
    const base = { title: 'x', kind: 'race' as const, value: 60, valueLabel: '1:00.00', lines: [], coins: 500, xp: 800 };
    applyResult(p, 'pine-valley', { ...base, medal: 'bronze', eventId: ev.id }, STAGES);
    applyResult(p, 'pine-valley', { ...base, medal: 'gold', eventId: ev.id, value: 55 }, STAGES);
    expect(p.medals).toEqual({ gold: 1, silver: 0, bronze: 0 });
    expect(p.events[ev.id].medal).toBe('gold');
    const t = TOURNAMENTS[0];
    const rows = (rank: number) => [{ name: 'P', country: 'YOU', bib: 1, isPlayer: true, time: 60, raw: 60, missed: 0, trickScore: 0, rank, dnf: false }, { name: 'AI', country: 'X', bib: 2, isPlayer: false, time: 61, raw: 61, missed: 0, trickScore: 0, rank: rank === 1 ? 2 : 1, dnf: false }];
    applyResult(p, 'pine-valley', { ...base, medal: 'gold', race: rows(1), tournament: { id: t.id, index: 0 } }, STAGES);
    applyResult(p, 'pine-valley', { ...base, medal: 'gold', race: rows(1), tournament: { id: t.id, index: 1 } }, STAGES);
    expect(p.tournaments[t.id].done).toBe(true);
    expect(p.tournaments[t.id].place).toBe(1);
    expect(p.achievements).toContain('tourney');
    expect(careerEvents().length).toBeGreaterThan(60);
  });
});

describe('replay', () => {
  it('records, encodes, decodes and samples runs', () => {
    const T = synthTerrain((_x, z) => -0.25 * z, 600, 2);
    const s = new Skier();
    s.place({ terrain: T }, 0, 0, 0, 5);
    const rec = new Recorder(30, 20);
    for (let i = 0; i < 600; i++) { s.step(1 / 60, NO_INPUT, { terrain: T }); rec.record(1 / 60, s); }
    rec.event('test', 100);
    const snap = rec.snapshot('ski');
    const back = decode(encode(snap) as Parameters<typeof decode>[0]);
    expect(back.count).toBe(snap.count);
    const [t0, t1] = duration(back);
    expect(t1 - t0).toBeGreaterThan(9);
    const f = sample(back, (t0 + t1) / 2, emptyFrame());
    expect(f.pos.z).toBeGreaterThan(5);
    expect(back.events[0].text).toBe('test');
  });
});

describe('snowboard', () => {
  it('rides, turns and jumps like a board', () => {
    const T = synthTerrain((_x, z) => -0.3 * z, 1400, 2);
    const s = new Skier();
    s.board = 'snowboard';
    s.place({ terrain: T }, 0, 0, 0, 0);
    for (let i = 0; i < 360; i++) s.step(1 / 60, NO_INPUT, { terrain: T });
    expect(s.speed).toBeGreaterThan(8);
    for (let i = 0; i < 60; i++) s.step(1 / 60, { ...NO_INPUT, steer: -1, carve: true }, { terrain: T });
    expect(s.vel.x).toBeGreaterThan(1);
    s.step(1 / 60, { ...NO_INPUT, jump: true }, { terrain: T });
    s.step(1 / 60, { ...NO_INPUT, jump: true }, { terrain: T });
    s.step(1 / 60, NO_INPUT, { terrain: T });
    expect(s.state).toBe('air');
  });
});
