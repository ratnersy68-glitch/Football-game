import { describe, expect, it } from 'vitest';
import { Skier, NO_INPUT, type SkierInput } from '../src/physics/skier';
import { synthTerrain } from './helpers';
import { makeKicker } from '../src/world/features';
import { RailSystem } from '../src/physics/rails';
import { TrickSystem } from '../src/physics/tricks';

const slope = (g: number) => synthTerrain((_x, z) => -g * z, 1400, 2);
const inp = (o: Partial<SkierInput>): SkierInput => ({ ...NO_INPUT, ...o });

function run(s: Skier, world: any, secs: number, input: SkierInput | ((t: number) => SkierInput), cb?: (t: number) => void) {
  const dt = 1 / 60;
  for (let t = 0; t < secs; t += dt) { s.step(dt, typeof input === 'function' ? input(t) : input, world); cb?.(t); }
}

describe('skiing physics', () => {
  it('accelerates downhill under gravity and reaches a realistic terminal speed', () => {
    const terrain = slope(0.3);
    const world = { terrain };
    const s = new Skier();
    s.place(world, 0, 0, 0);
    run(s, world, 3, NO_INPUT);
    const v3 = s.speed;
    expect(v3).toBeGreaterThan(5);
    run(s, world, 40, NO_INPUT);
    const upright = s.speed;
    expect(upright).toBeGreaterThan(18);
    expect(upright).toBeLessThan(32);
    const t = new Skier(); t.place(world, 0, 0, 0);
    run(t, world, 43, inp({ tuck: true }));
    expect(t.speed).toBeGreaterThan(upright * 1.2);
    console.log('speed 3s', v3.toFixed(1), 'terminal upright', (upright * 3.6).toFixed(0), 'km/h tucked', (t.speed * 3.6).toFixed(0), 'km/h');
  });

  it('follows the snow surface exactly while riding', () => {
    const terrain = synthTerrain((x, z) => -0.35 * z + 6 * Math.sin(z / 40) + 3 * Math.sin(x / 30), 1400, 2);
    const world = { terrain };
    const s = new Skier();
    s.place(world, 0, 0, 0);
    let maxGap = 0, airborne = 0;
    run(s, world, 20, (t) => inp({ steer: Math.sin(t * 0.8) * 0.6, carve: true }), () => {
      if (s.state === 'ride') maxGap = Math.max(maxGap, Math.abs(s.pos.y - terrain.height(s.pos.x, s.pos.z)));
      if (s.state === 'air') airborne++;
      expect(s.pos.y).toBeGreaterThan(terrain.height(s.pos.x, s.pos.z) - 0.02);
    });
    expect(maxGap).toBeLessThan(0.01);
    expect(s.state === 'crashed').toBe(false);
  });

  it('turns right with D and carving holds more speed than skidding', () => {
    const terrain = slope(0.25);
    const world = { terrain };
    const a = new Skier(); a.place(world, 0, 0, 0, 15);
    run(a, world, 1.2, inp({ steer: 1 }));
    expect(a.vel.x).toBeLessThan(-2); // right of +z travel is -x
    const carve = new Skier(); carve.place(world, 0, 0, 0, 16);
    const skid = new Skier(); skid.place(world, 0, 0, 0, 16);
    run(carve, world, 4, (t) => inp({ steer: Math.sign(Math.sin(t * 2)), carve: true }));
    run(skid, world, 4, (t) => inp({ steer: Math.sign(Math.sin(t * 2)) }));
    expect(carve.speed).toBeGreaterThan(skid.speed);
  });

  it('brakes to a stop', () => {
    const terrain = slope(0.12);
    const world = { terrain };
    const s = new Skier(); s.place(world, 0, 0, 0, 14);
    run(s, world, 8, inp({ brake: true }));
    expect(s.speed).toBeLessThan(1);
  });

  it('launches off a kicker, flies, and lands cleanly', () => {
    const terrain = slope(0.22);
    terrain.features.add(makeKicker('Medium', 0, 0, 120, 0, 1, 0.22));
    const world = { terrain };
    const s = new Skier(); s.place(world, 0, 119, 0, 12);
    let maxAir = 0, landed: any = null, peak = 0;
    run(s, world, 8, NO_INPUT, () => {
      if (s.state === 'air') { maxAir = Math.max(maxAir, s.airTime); peak = Math.max(peak, s.pos.y - terrain.height(s.pos.x, s.pos.z)); }
      for (const e of s.events) if (e.type === 'land' && e.air && e.air.air > 0.3) landed = e;
      s.events.length = 0;
    });
    console.log('kicker air', maxAir.toFixed(2), 's peak', peak.toFixed(1), 'm landing', landed?.landing, 'impact', landed?.v?.toFixed(1));
    expect(maxAir).toBeGreaterThan(0.6);
    expect(landed?.landing).toBe('clean');
  });

  it('spins a 720 and names it', () => {
    const terrain = slope(0.22);
    terrain.features.add(makeKicker('XL', 0, 0, 120, 0, 1, 0.22));
    const world = { terrain };
    const s = new Skier(); s.place(world, 0, 119, 0, 16);
    const tricks = new TrickSystem();
    let res: any = null;
    run(s, world, 9, () => inp({ spin: s.state === 'air' && s.air.spinAccum < Math.PI * 3.6 ? 1 : 0, grab: s.state === 'air' ? 2 : 0 }), () => {
      for (const e of s.events) if (e.type === 'land' && e.air && e.air.air > 0.3) res = tricks.landAir(e.air, e.landing!);
      s.events.length = 0;
    });
    console.log('trick', res);
    expect(res?.name).toMatch(/720 Mute/);
  });

  it('backflips', () => {
    const terrain = slope(0.22);
    terrain.features.add(makeKicker('XL', 0, 0, 120, 0, 1, 0.22));
    const world = { terrain };
    const s = new Skier(); s.place(world, 0, 119, 0, 16);
    const tricks = new TrickSystem();
    let res: any = null;
    run(s, world, 9, () => inp({ flip: s.state === 'air' && s.air.flipAccum > -Math.PI * 1.55 ? -1 : 0 }), () => {
      for (const e of s.events) if (e.type === 'land' && e.air && e.air.air > 0.3) res = tricks.landAir(e.air, e.landing!);
      s.events.length = 0;
    });
    console.log('flip', res);
    expect(res?.name).toBe('Backflip');
    expect(res?.landing).not.toBe('crash');
  });

  it('grinds a rail and exits', () => {
    const terrain = synthTerrain((_x, z) => -0.18 * z, 600, 1);
    const y0 = (z: number) => -0.18 * z + 0.6;
    const rails = new RailSystem([{ id: 0, kind: 'rail', name: 'Straight Rail', pts: [{ x: 0, y: y0(50), z: 50 }, { x: 0, y: y0(62), z: 62 }], halfWidth: 0.32, parkId: 0 }]);
    const world = { terrain, rails };
    const s = new Skier(); s.place(world, 0, 30, 0, 8);
    let grinded = false, endEv: any = null;
    run(s, world, 6, () => inp({ jump: s.pos.z > 44 && s.pos.z < 47 }), () => {
      if (s.state === 'grind') grinded = true;
      for (const e of s.events) if (e.type === 'grindEnd') endEv = e;
      s.events.length = 0;
    });
    console.log('grind', endEv?.grind, endEv?.reason);
    expect(grinded).toBe(true);
    expect(endEv?.grind.seconds).toBeGreaterThan(0.5);
  });

  it('crashes into trees at speed', () => {
    const terrain = slope(0.3);
    const obstacles = { hit: (x: number, z: number, r: number) => (Math.hypot(x, z - 80) < r + 0.5 ? { x: 0, z: 80, r: 0.5, kind: 'tree' } : null) };
    const world = { terrain, obstacles } as any;
    const s = new Skier(); s.place(world, 0, 0, 0, 12);
    let crashed = false;
    run(s, world, 8, NO_INPUT, () => { if (s.state === "crashed") crashed = true; });
    expect(crashed).toBe(true);
  });
});
