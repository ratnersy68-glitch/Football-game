/** Rail / box / tube lookup for grind attachment. */
import type { RailDef } from '../world/types';

export interface RailHit {
  rail: RailDef;
  seg: number;
  t: number;
  x: number; y: number; z: number;
  /** Unit tangent of the segment (pointing from pts[seg] to pts[seg+1]). */
  tx: number; ty: number; tz: number;
  dist: number;
}

export class RailSystem {
  readonly rails: RailDef[];
  private buckets = new Map<number, number[]>();
  private readonly cs = 16;
  constructor(rails: RailDef[]) {
    this.rails = rails;
    rails.forEach((r, idx) => {
      for (let i = 0; i < r.pts.length - 1; i++) {
        const a = r.pts[i], b = r.pts[i + 1];
        const minX = Math.min(a.x, b.x) - 2, maxX = Math.max(a.x, b.x) + 2;
        const minZ = Math.min(a.z, b.z) - 2, maxZ = Math.max(a.z, b.z) + 2;
        for (let bx = Math.floor(minX / this.cs); bx <= Math.floor(maxX / this.cs); bx++)
          for (let bz = Math.floor(minZ / this.cs); bz <= Math.floor(maxZ / this.cs); bz++) {
            const k = bx * 100003 + bz;
            let arr = this.buckets.get(k);
            if (!arr) { arr = []; this.buckets.set(k, arr); }
            if (!arr.includes(idx)) arr.push(idx);
          }
      }
    });
  }

  /** Nearest rail point horizontally within the rail's contact half-width. */
  query(x: number, z: number): RailHit | null {
    const arr = this.buckets.get(Math.floor(x / this.cs) * 100003 + Math.floor(z / this.cs));
    if (!arr) return null;
    let best: RailHit | null = null;
    for (const idx of arr) {
      const r = this.rails[idx];
      for (let i = 0; i < r.pts.length - 1; i++) {
        const a = r.pts[i], b = r.pts[i + 1];
        const ex = b.x - a.x, ez = b.z - a.z, l2 = ex * ex + ez * ez;
        if (l2 < 1e-6) continue;
        let t = ((x - a.x) * ex + (z - a.z) * ez) / l2;
        if (t < -0.02 || t > 1.02) continue;
        t = Math.max(0, Math.min(1, t));
        const px = a.x + ex * t, pz = a.z + ez * t;
        const d = Math.hypot(x - px, z - pz);
        if (d > r.halfWidth) continue;
        if (!best || d < best.dist) {
          const ey = b.y - a.y;
          const len = Math.sqrt(l2 + ey * ey);
          best = { rail: r, seg: i, t, x: px, y: a.y + ey * t, z: pz, tx: ex / len, ty: ey / len, tz: ez / len, dist: d };
        }
      }
    }
    return best;
  }

  /** Position and tangent at (seg, t), advancing by ds along the polyline; returns null past the ends. */
  advance(rail: RailDef, seg: number, t: number, ds: number): { seg: number; t: number; x: number; y: number; z: number; tx: number; ty: number; tz: number } | null {
    let s = seg, tt = t, rem = ds;
    for (let guard = 0; guard < 64; guard++) {
      const a = rail.pts[s], b = rail.pts[s + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) || 1e-6;
      const nt = tt + rem / len;
      if (nt >= 0 && nt <= 1) {
        tt = nt;
        return { seg: s, t: tt, x: a.x + (b.x - a.x) * tt, y: a.y + (b.y - a.y) * tt, z: a.z + (b.z - a.z) * tt, tx: (b.x - a.x) / len, ty: (b.y - a.y) / len, tz: (b.z - a.z) / len };
      }
      if (nt > 1) {
        rem -= (1 - tt) * len;
        s++; tt = 0;
        if (s >= rail.pts.length - 1) return null;
      } else {
        rem += tt * len;
        s--; tt = 1;
        if (s < 0) return null;
      }
    }
    return null;
  }
}
