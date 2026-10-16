/** Cable geometry and carrier positions for chairlifts, gondolas and surface lifts. */
import type { Lift } from './types';

export interface CablePath {
  lift: Lift;
  pts: { x: number; y: number; z: number }[];
  cum: number[];
  length: number;
  /** Lateral unit vector (right of the uphill direction). */
  rx: number; rz: number;
  hang: number;
}

export function cablePath(lift: Lift): CablePath {
  const pts = lift.towers.map((t) => ({ x: t.x, y: t.y + t.h, z: t.z }));
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y, pts[i].z - pts[i - 1].z));
  const dx = lift.top.x - lift.bottom.x, dz = lift.top.z - lift.bottom.z;
  const l = Math.hypot(dx, dz) || 1;
  // right of travel in three.js (forward × up) = (-dz, dx) rotated: right = (-fz, fx)?? use (dz, -dx)
  return { lift, pts, cum, length: cum[cum.length - 1], rx: -dz / l, rz: dx / l, hang: lift.type === 'gondola' ? 3.4 : lift.type === 'surface' ? 0 : 2.6 };
}

/** Position on the cable at distance d from the bottom; side +1 = uphill line, -1 = downhill line. */
export function cableAt(c: CablePath, d: number, side: 1 | -1 = 1): { x: number; y: number; z: number; dx: number; dy: number; dz: number } {
  d = Math.max(0, Math.min(c.length, d));
  let i = 1;
  while (i < c.cum.length - 1 && c.cum[i] < d) i++;
  const a = c.pts[i - 1], b = c.pts[i];
  const seg = c.cum[i] - c.cum[i - 1] || 1;
  const t = (d - c.cum[i - 1]) / seg;
  const off = c.lift.type === 'surface' ? 1.2 : 2.3;
  const sag = Math.sin(t * Math.PI) * Math.min(1.5, seg * 0.006);
  return {
    x: a.x + (b.x - a.x) * t + c.rx * off * side,
    y: a.y + (b.y - a.y) * t - sag,
    z: a.z + (b.z - a.z) * t + c.rz * off * side,
    dx: (b.x - a.x) / seg, dy: (b.y - a.y) / seg, dz: (b.z - a.z) / seg,
  };
}

/** Carrier i position along the full loop (up then down). */
export function carrierAt(c: CablePath, p: number) {
  const L = c.length;
  p = ((p % (2 * L)) + 2 * L) % (2 * L);
  if (p <= L) return { ...cableAt(c, p, 1), up: true, d: p };
  const q = cableAt(c, 2 * L - p, -1);
  return { ...q, dx: -q.dx, dy: -q.dy, dz: -q.dz, up: false, d: 2 * L - p };
}

export function carrierCount(c: CablePath): number {
  return Math.max(4, Math.floor((2 * c.length) / c.lift.spacing));
}
