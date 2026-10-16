import { describe, expect, it } from 'vitest';
import { RESORTS, TOTAL_TRAILS } from '../src/data/resorts';
import { buildResort, type Resort } from '../src/world/resortBuilder';
import { PITCH_BANDS, DIFFICULTIES } from '../src/world/types';
import { cablePath, carrierAt } from '../src/world/liftPath';

const built = new Map<string, Resort>();
const get = (i: number) => {
  const d = RESORTS[i];
  if (!built.has(d.id)) built.set(d.id, buildResort(d));
  return built.get(d.id)!;
};

describe('resort catalogue', () => {
  it('has 8 resorts and 203 trails', () => {
    expect(RESORTS.length).toBe(8);
    expect(TOTAL_TRAILS).toBe(203);
  });
  it('is deterministic', () => {
    const a = buildResort(RESORTS[0]), b = buildResort(RESORTS[0]);
    expect(a.trails.map((t) => t.name)).toEqual(b.trails.map((t) => t.name));
    for (let i = 0; i < a.terrain.H.length; i += 997) expect(a.terrain.H[i]).toBe(b.terrain.H[i]);
  });
});

for (let i = 0; i < RESORTS.length; i++) {
  describe(RESORTS[i].name, () => {
    it('generates the advertised content', () => {
      const r = get(i);
      const def = RESORTS[i];
      const trails = r.trails.filter((t) => t.kind === 'trail');
      const want = Object.values(def.trails).reduce((a, b) => a + (b ?? 0), 0);
      expect(trails.length).toBe(want);
      for (const d of DIFFICULTIES) expect(trails.filter((t) => t.difficulty === d).length).toBe(def.trails[d] ?? 0);
      expect(r.lifts.length).toBe(def.lifts.length);
      expect(r.parks.length).toBe(def.parks.length);
      expect(r.courses.length).toBe(def.races.length);
      expect(new Set(trails.map((t) => t.name)).size).toBe(trails.length);
      for (let k = 0; k < r.terrain.H.length; k += 101) expect(Number.isFinite(r.terrain.H[k])).toBe(true);
    });

    it('every trail is a skiable route from top to the base whose steepest pitch matches its rating', () => {
      const r = get(i);
      const trails = r.trails.filter((t) => t.kind === 'trail');
      let strict = 0;
      for (const t of trails) {
        const band = PITCH_BANDS[t.difficulty];
        expect(t.length).toBeGreaterThan(t.difficulty === 'bunny' ? 80 : 240);
        expect(t.vertical).toBeGreaterThan(5);
        // continuous route (no teleports)
        for (let k = 1; k < t.pts.length; k++) expect(Math.hypot(t.pts[k].x - t.pts[k - 1].x, t.pts[k].z - t.pts[k - 1].z)).toBeLessThan(9);
        expect(t.maxPitch).toBeGreaterThanOrEqual(band.min * 0.95);
        expect(t.maxPitch).toBeLessThanOrEqual(band.max * 1.15);
        if (t.maxPitch >= band.min && t.maxPitch <= band.max) strict++;
        // centreline free of trees/rocks
        for (let k = 2; k < t.pts.length - 2; k += 3) {
          const o = r.obstacles.hit(t.pts[k].x, t.pts[k].z, 0.3);
          if (o) expect(['tower', 'rock', 'gun', 'building']).toContain(o.kind);
          if (o) expect(o.kind).not.toBe('tree');
        }
      }
      expect(strict / trails.length).toBeGreaterThanOrEqual(0.9);
    });

    it('difficulty ladder: harder ratings are steeper on average', () => {
      const r = get(i);
      const avg = (d: string) => {
        const t = r.trails.filter((x) => x.kind === 'trail' && x.difficulty === d);
        return t.length ? t.reduce((a, b) => a + b.maxPitch, 0) / t.length : NaN;
      };
      const order = ['green', 'blue', 'black', 'double', 'triple'].map(avg).filter((v) => !Number.isNaN(v));
      for (let k = 1; k < order.length; k++) expect(order[k]).toBeGreaterThan(order[k - 1]);
    });

    it('lifts climb from bottom to top with cables above the snow', () => {
      const r = get(i);
      for (const l of r.lifts) {
        expect(l.top.y).toBeGreaterThan(l.bottom.y + 10);
        const c = cablePath(l);
        for (let d = 30; d < c.length - 30; d += 10) {
          const p = carrierAt(c, d);
          expect(p.y - r.terrain.gridHeight(p.x, p.z)).toBeGreaterThan(l.type === 'surface' ? 1.2 : c.hang + 1.2);
        }
      }
    });
  });
}
