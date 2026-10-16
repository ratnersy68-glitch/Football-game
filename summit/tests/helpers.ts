import { Terrain } from '../src/world/terrain';

/** Synthetic terrain: height = f(x, z), 1 m cells over a square. */
export function synthTerrain(f: (x: number, z: number) => number, size = 600, cell = 2): Terrain {
  const n = Math.ceil(size / cell) + 1;
  const t = new Terrain(n, n, cell, -size / 2, -50, 'synth');
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) t.H[j * n + i] = f(-size / 2 + i * cell, -50 + j * cell);
  // no micro detail on synthetic test surfaces
  (t as unknown as { detailHeight: (x: number, z: number) => number }).detailHeight = () => 0;
  t.conditions = { powder: 0, ice: 0, slushLine: 0, label: 'test' };
  t.surfaceAt = () => 'groomed';
  return t;
}
