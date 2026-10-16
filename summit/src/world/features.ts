/**
 * Terrain-park and course features expressed as analytic height-above-terrain functions.
 * The same function drives physics (Terrain.height) and the rendered feature meshes,
 * so what you see is exactly what you ride.
 */
import { clamp, smoothstep } from '../core/math';

export type FeatureKind =
  | 'kicker' | 'stepup' | 'stepdown' | 'gap' | 'bigair'
  | 'quarterpipe' | 'halfpipe' | 'roller' | 'berm' | 'drop' | 'wallride' | 'jibramp';

export interface Feature {
  id: number;
  kind: FeatureKind;
  name: string;
  size: string;
  parkId: number;
  x: number; z: number;
  dx: number; dz: number;
  len: number; halfW: number;
  minX: number; minZ: number; maxX: number; maxZ: number;
  /** Height above the underlying terrain at world xz. */
  heightAt(x: number, z: number): number;
  /** Local-frame profile (u forward/downhill, v lateral). */
  local?(u: number, v: number): number;
  pipe?: { halfFloor: number; r: number; wallH: number };
  lipU?: number;
}

/** Smooth max(0, y) with a 1 m blend so feature bases merge into the snow. */
function soft0(y: number): number {
  if (y >= 1) return y;
  if (y <= -1) return 0;
  return ((y + 1) * (y + 1)) / 4;
}

export interface KickerParams {
  h: number; tanLip: number; table: number; landTan: number; halfW: number;
  gap?: number; deckRatio?: number;
  /** Built-up inrun: the snow rises by `build` over `inrun` metres before the ramp. */
  build?: number; inrun?: number;
}

/** Builds a 1D kicker/table/landing profile; returns [length, f(u)]. */
export function kickerProfile(p: KickerParams): { len: number; lipU: number; f: (u: number) => number } {
  const Hb = p.build ?? 0;
  const Li = p.inrun ?? 0;
  const Lr = (2 * p.h) / p.tanLip;
  const back = 2.6;
  const gap = p.gap ?? 0;
  const hd = Hb + p.h * (p.deckRatio ?? 0.85);
  const lipH = Hb + p.h;
  const k = 3;
  const u0 = Li; // ramp start
  const uLip = u0 + Lr;
  let uk: number;
  let deckStart: number;
  if (gap > 0) {
    deckStart = uLip + gap;
    uk = deckStart + 2;
  } else {
    deckStart = uLip + Math.max(0, lipH - hd) / back;
    uk = uLip + p.table;
  }
  const landLen = hd / p.landTan + k + 2;
  const len = uk + landLen + 1.5;
  const gapFloor = Math.max(0, Hb - 1.5);
  const f = (u: number): number => {
    if (u < 0) return 0;
    if (u < u0) return Hb * smoothstep(0, Li, u);
    if (u <= uLip) { const d = u - u0; return Hb + (p.tanLip * d * d) / (2 * Lr); }
    if (gap > 0) {
      if (u < deckStart) return Math.max(gapFloor, lipH - (u - uLip) * back);
      if (u < uk) return Math.min(hd, gapFloor + (u - deckStart) * back * 1.5);
    } else if (u < uk) {
      return Math.max(hd, lipH - (u - uLip) * back);
    }
    const d = u - uk;
    let y: number;
    if (d < k) y = hd - (p.landTan * d * d) / (2 * k);
    else y = hd - (p.landTan * k) / 2 - p.landTan * (d - k);
    return soft0(y);
  };
  return { len, lipU: uLip, f };
}

function lateral(v: number, halfW: number, edge = 1.2): number {
  const a = Math.abs(v);
  return a <= halfW ? 1 : 1 - smoothstep(halfW, halfW + edge, a);
}

let NEXT_ID = 0;
export function resetFeatureIds() { NEXT_ID = 0; }

function straightFeature(
  kind: FeatureKind, name: string, size: string, parkId: number,
  x: number, z: number, dx: number, dz: number, len: number, halfW: number,
  local: (u: number, v: number) => number, extra: Partial<Feature> = {},
): Feature {
  // AABB of rotated rect
  const rx = -dz, rz = dx; // lateral axis
  const corners = [
    [x + rx * -halfW, z + rz * -halfW], [x + rx * halfW, z + rz * halfW],
    [x + dx * len + rx * -halfW, z + dz * len + rz * -halfW], [x + dx * len + rx * halfW, z + dz * len + rz * halfW],
  ];
  const pad = 4;
  const feat: Feature = {
    id: NEXT_ID++, kind, name, size, parkId, x, z, dx, dz, len, halfW,
    minX: Math.min(...corners.map((c) => c[0])) - pad,
    maxX: Math.max(...corners.map((c) => c[0])) + pad,
    minZ: Math.min(...corners.map((c) => c[1])) - pad,
    maxZ: Math.max(...corners.map((c) => c[1])) + pad,
    local,
    heightAt(px: number, pz: number) {
      const ox = px - x, oz = pz - z;
      const u = ox * dx + oz * dz;
      const v = ox * rx + oz * rz;
      if (u < -1 || u > len + 1 || Math.abs(v) > halfW + 3) return 0;
      return local(u, v);
    },
    ...extra,
  };
  return feat;
}

export const KICKER_SIZES: Record<string, { h: number; lipDeg: number; table: number; landDeg: number; halfW: number; build: number; inrun: number }> = {
  Small: { h: 0.9, lipDeg: 24, table: 4, landDeg: 27, halfW: 2.5, build: 0.8, inrun: 12 },
  Medium: { h: 1.5, lipDeg: 28, table: 7, landDeg: 30, halfW: 3.5, build: 1.8, inrun: 18 },
  Large: { h: 2.2, lipDeg: 30, table: 11, landDeg: 32, halfW: 4.5, build: 2.8, inrun: 24 },
  XL: { h: 3.0, lipDeg: 32, table: 15, landDeg: 33, halfW: 5, build: 4, inrun: 30 },
  Massive: { h: 4.2, lipDeg: 34, table: 21, landDeg: 35, halfW: 7, build: 6, inrun: 40 },
};

/** Kicker sized in absolute angles; `grade` is the underlying slope (tan) so lips feel right. */
export function makeKicker(
  size: keyof typeof KICKER_SIZES, parkId: number, x: number, z: number, dx: number, dz: number, grade: number,
  variant: 'table' | 'gap' | 'stepup' | 'stepdown' = 'table',
): Feature {
  const s = KICKER_SIZES[size];
  const tanLip = Math.tan((s.lipDeg * Math.PI) / 180) + grade;
  const landTan = Math.max(0.15, Math.tan((s.landDeg * Math.PI) / 180) - grade);
  let gap = 0, deckRatio = 0.85, table = s.table;
  if (variant === 'gap') { gap = s.table * 0.9; deckRatio = 0.85; }
  if (variant === 'stepup') { gap = s.table * 0.5; deckRatio = 1.45; }
  if (variant === 'stepdown') { gap = 0; table = s.table * 0.8; deckRatio = 0.35; }
  const prof = kickerProfile({ h: s.h, tanLip, table, landTan, halfW: s.halfW, gap, deckRatio, build: s.build * (variant === 'stepdown' ? 1.4 : 1), inrun: s.inrun });
  const kind: FeatureKind = size === 'Massive' ? 'bigair' : variant === 'table' ? 'kicker' : variant;
  const label = size === 'Massive' ? 'Big Air' : `${size} ${variant === 'table' ? 'Kicker' : variant === 'gap' ? 'Gap Jump' : variant === 'stepup' ? 'Step-Up' : 'Step-Down'}`;
  return straightFeature(kind, label, size, parkId, x, z, dx, dz, prof.len, s.halfW + 1.5,
    (u, v) => prof.f(u) * lateral(v, u < s.inrun ? s.halfW + 1.5 : s.halfW, u < s.inrun ? 3 : 1.2), { lipU: prof.lipU });
}

export function makeQuarterpipe(parkId: number, x: number, z: number, dx: number, dz: number, r: number, halfW: number, name = 'Quarterpipe', kind: FeatureKind = 'quarterpipe'): Feature {
  const maxA = (76 * Math.PI) / 180;
  const uw = r * Math.sin(maxA);
  const H = r * (1 - Math.cos(maxA));
  const deck = 3;
  const len = uw + deck + H / 0.7 + 1;
  return straightFeature(kind, name, `${H.toFixed(1)} m`, parkId, x, z, dx, dz, len, halfW + 1.5, (u, v) => {
    let y: number;
    if (u <= 0) y = 0;
    else if (u <= uw) y = r - Math.sqrt(Math.max(0, r * r - u * u));
    else if (u <= uw + deck) y = H;
    else y = soft0(H - (u - uw - deck) * 0.7);
    return y * lateral(v, halfW, 1.5);
  });
}

/** Halfpipe running along +u; floor is the shaped terrain, walls are built snow. */
export function makeHalfpipe(parkId: number, x: number, z: number, dx: number, dz: number, len: number, r: number, floorW: number, superpipe: boolean): Feature {
  const maxA = (80 * Math.PI) / 180;
  const half = floorW / 2;
  const vw = r * Math.sin(maxA);
  const H = r * (1 - Math.cos(maxA));
  const deck = 4;
  const outer = half + vw + deck;
  const halfW = outer + H / 0.9 + 1;
  return straightFeature('halfpipe', superpipe ? 'Superpipe' : 'Halfpipe', `${H.toFixed(1)} m walls`, parkId, x, z, dx, dz, len, halfW, (u, v) => {
    const a = Math.abs(v);
    let y: number;
    if (a <= half) y = 0;
    else if (a <= half + vw) { const d = a - half; y = r - Math.sqrt(Math.max(0, r * r - d * d)); }
    else if (a <= outer) y = H;
    else y = soft0(H - (a - outer) * 0.9);
    const taper = smoothstep(0, 14, u) * (1 - smoothstep(len - 10, len, u));
    return y * taper;
  }, { pipe: { halfFloor: half, r, wallH: H } });
}

export function makeRollers(parkId: number, x: number, z: number, dx: number, dz: number, count: number, amp: number, wave: number, halfW: number): Feature {
  const len = count * wave;
  return straightFeature('roller', 'Rollers', `${count}x`, parkId, x, z, dx, dz, len, halfW + 1,
    (u, v) => {
      if (u < 0 || u > len) return 0;
      const s = Math.sin((Math.PI * u) / wave);
      return amp * s * s * lateral(v, halfW, 2);
    });
}

export function makeDrop(parkId: number, x: number, z: number, dx: number, dz: number, h: number, halfW: number, name = 'Cliff Drop'): Feature {
  const Lr = h * 6;
  const top = 3;
  const len = Lr + top + h / 4 + 1;
  return straightFeature('drop', name, `${h.toFixed(0)} m`, parkId, x, z, dx, dz, len, halfW + 2, (u, v) => {
    let y: number;
    if (u < Lr) y = h * smoothstep(0, Lr, u);
    else if (u < Lr + top) y = h;
    else y = Math.max(0, h - (u - Lr - top) * 4);
    return y * lateral(v, halfW, 2);
  }, { lipU: Lr + top });
}

/** Small ramp that rises to a rail/box entry height. */
export function makeJibRamp(parkId: number, x: number, z: number, dx: number, dz: number, h: number, halfW: number): Feature {
  const L = h * 4;
  return straightFeature('jibramp', 'Jib Ramp', `${h.toFixed(1)} m`, parkId, x, z, dx, dz, L + 0.6, halfW + 1, (u, v) => {
    if (u < 0 || u > L + 0.5) return 0;
    const y = u <= L ? h * smoothstep(0, L, u) : h - (u - L) * 4;
    return Math.max(0, y) * lateral(v, halfW, 0.8);
  });
}

/** Banked turn following a polyline; `side` +1 banks on the right of travel, -1 on the left. */
export function makeBerm(parkId: number, pts: { x: number; z: number }[], side: number, trackHalf: number, bankH: number): Feature {
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (const p of pts) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
  const pad = trackHalf + bankH * 2 + 6;
  const n = pts.length;
  const segLen: number[] = [];
  let total = 0;
  for (let i = 0; i < n - 1; i++) { const l = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].z - pts[i].z); segLen.push(l); total += l; }
  const f: Feature = {
    id: NEXT_ID++, kind: 'berm', name: 'Banked Turn', size: `${bankH.toFixed(1)} m`, parkId,
    x: pts[0].x, z: pts[0].z, dx: 0, dz: 1, len: total, halfW: trackHalf,
    minX: minX - pad, maxX: maxX + pad, minZ: minZ - pad, maxZ: maxZ + pad,
    heightAt(px: number, pz: number) {
      let best = Infinity, bs = 0, bside = 0, acc = 0;
      for (let i = 0; i < n - 1; i++) {
        const ax = pts[i].x, az = pts[i].z, bx = pts[i + 1].x, bz = pts[i + 1].z;
        const ex = bx - ax, ez = bz - az, l2 = ex * ex + ez * ez;
        const t = clamp(((px - ax) * ex + (pz - az) * ez) / l2, 0, 1);
        const cx = ax + ex * t - px, cz = az + ez * t - pz;
        const d = Math.hypot(cx, cz);
        if (d < best) {
          best = d; bs = acc + segLen[i] * t;
          // right of travel (three.js: right = forward x up = (-dz, dx)) → sign
          const cross = ex * (pz - az) - ez * (px - ax);
          bside = cross < 0 ? 1 : -1; // +1 = right side
        }
        acc += segLen[i];
      }
      const vOut = bside === side ? best : -best;
      const taper = smoothstep(0, 12, bs) * (1 - smoothstep(total - 12, total, bs));
      if (taper <= 0) return 0;
      const inner = trackHalf * 0.15;
      const wallEnd = trackHalf + 1.5;
      let y: number;
      if (vOut <= inner) y = 0;
      else if (vOut <= wallEnd) { const t = (vOut - inner) / (wallEnd - inner); y = bankH * t * t; }
      else y = soft0(bankH - (vOut - wallEnd) * 0.8);
      return y * taper;
    },
  };
  return f;
}

/** Spatial bucket index answering "max feature height at xz". */
export class FeatureSet {
  readonly list: Feature[] = [];
  private buckets = new Map<number, number[]>();
  private readonly cs = 24;
  add(f: Feature) {
    this.list.push(f);
    const idx = this.list.length - 1;
    const cs = this.cs;
    for (let bx = Math.floor(f.minX / cs); bx <= Math.floor(f.maxX / cs); bx++) {
      for (let bz = Math.floor(f.minZ / cs); bz <= Math.floor(f.maxZ / cs); bz++) {
        const key = bx * 100003 + bz;
        let arr = this.buckets.get(key);
        if (!arr) { arr = []; this.buckets.set(key, arr); }
        arr.push(idx);
      }
    }
  }
  height(x: number, z: number): number {
    const arr = this.buckets.get(Math.floor(x / this.cs) * 100003 + Math.floor(z / this.cs));
    if (!arr) return 0;
    let h = 0;
    for (let i = 0; i < arr.length; i++) {
      const f = this.list[arr[i]];
      if (x < f.minX || x > f.maxX || z < f.minZ || z > f.maxZ) continue;
      const y = f.heightAt(x, z);
      if (y > h) h = y;
    }
    return h;
  }
  /** Feature at a point with height > eps (for surface lookups and pipe assist). */
  featureAt(x: number, z: number, eps = 0.05): Feature | null {
    const arr = this.buckets.get(Math.floor(x / this.cs) * 100003 + Math.floor(z / this.cs));
    if (!arr) return null;
    let best: Feature | null = null, h = eps;
    for (const i of arr) {
      const f = this.list[i];
      if (x < f.minX || x > f.maxX || z < f.minZ || z > f.maxZ) continue;
      const y = f.heightAt(x, z);
      if (y > h || (f.kind === 'halfpipe' && y >= 0 && f.local && isInsidePipe(f, x, z))) { h = Math.max(h, y); best = f; }
    }
    return best;
  }
}

function isInsidePipe(f: Feature, x: number, z: number): boolean {
  const ox = x - f.x, oz = z - f.z;
  const u = ox * f.dx + oz * f.dz;
  const v = ox * -f.dz + oz * f.dx;
  return u > 0 && u < f.len && Math.abs(v) < (f.pipe?.halfFloor ?? 0) + (f.pipe?.r ?? 0);
}
