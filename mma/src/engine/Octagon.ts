import type { Vec2 } from '../core/math';
import { TUNING } from './tuning';

/** Regular octagon centred at the origin. Normals point outwards at 0°, 45°, ... (a flat side faces the camera). */
export const OCT_NORMALS: Vec2[] = Array.from({ length: 8 }, (_, i) => ({ x: Math.cos((i * Math.PI) / 4), z: Math.sin((i * Math.PI) / 4) }));

export const APOTHEM = TUNING.octagonApothem;
export const CIRCUMRADIUS = APOTHEM / Math.cos(Math.PI / 8);

/** Octagon vertices (for rendering). */
export const OCT_VERTS: Vec2[] = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4 + Math.PI / 8;
  return { x: Math.cos(a) * CIRCUMRADIUS, z: Math.sin(a) * CIRCUMRADIUS };
});

/** Distance from p to the fence (positive inside). */
export function cageDistance(p: Vec2): number {
  let m = -Infinity;
  for (const n of OCT_NORMALS) m = Math.max(m, p.x * n.x + p.z * n.z);
  return APOTHEM - m;
}

/** Outward normal of the nearest fence panel. */
export function nearestCageNormal(p: Vec2): Vec2 {
  let best = OCT_NORMALS[0];
  let m = -Infinity;
  for (const n of OCT_NORMALS) {
    const d = p.x * n.x + p.z * n.z;
    if (d > m) {
      m = d;
      best = n;
    }
  }
  return best;
}

/** Push p back inside the fence (in place). Returns true if it touched the fence. */
export function constrainToCage(p: Vec2, radius: number): boolean {
  let touched = false;
  for (let k = 0; k < 2; k++) {
    for (const n of OCT_NORMALS) {
      const d = p.x * n.x + p.z * n.z - (APOTHEM - radius);
      if (d > 0) {
        p.x -= n.x * d;
        p.z -= n.z * d;
        touched = true;
      }
    }
  }
  return touched;
}
