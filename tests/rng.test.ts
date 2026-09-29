import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/rng';

describe('Rng', () => {
  it('is reproducible from a seed', () => {
    const a = new Rng(48291);
    const b = new Rng(48291);
    for (let i = 0; i < 1000; i++) expect(a.next()).toBe(b.next());
  });
  it('can resume from a saved state', () => {
    const a = new Rng(7);
    for (let i = 0; i < 50; i++) a.next();
    const b = Rng.fromState(a.state);
    for (let i = 0; i < 100; i++) expect(b.next()).toBe(a.next());
  });
  it('produces values in range', () => {
    const r = new Rng(1);
    for (let i = 0; i < 5000; i++) {
      const v = r.int(3, 9);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(9);
      const f = r.next();
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
    }
  });
});
