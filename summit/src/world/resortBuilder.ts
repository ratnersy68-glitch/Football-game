/**
 * Deterministic resort generator.
 *
 * Pipeline: raw mountain heightfield → lifts → slope-targeting trail planner (parks and
 * racecourses first, then trails) → per-trail profile shaping (cut/fill so every trail's
 * steepest pitch lands in its difficulty band) → priority-weighted corridor rasterization →
 * base area / station pads / frozen lakes → park features, rails, race gates → trees,
 * rocks, buildings and an obstacle index for collisions.
 */
import { Rng } from '../core/rng';
import { Noise2D } from '../core/noise';
import { clamp, lerp, smoothstep, wrapAngle } from '../core/math';
import { Terrain } from './terrain';
import {
  FeatureSet, makeBerm, makeDrop, makeHalfpipe, makeJibRamp, makeKicker, makeQuarterpipe, makeRollers, resetFeatureIds,
  type Feature,
} from './features';
import type {
  Building, Difficulty, Discipline, Gate, Lake, Lift, P2, Park, RaceCourse, RailDef, Trail, TrailKind,
} from './types';
import { PITCH_BANDS } from './types';
import type { ResortDef } from '../data/resorts';
import { landmarkFor, trailName, DISCIPLINE_INFO } from '../data/names';

export interface Obstacle { x: number; z: number; r: number; kind: 'tree' | 'rock' | 'tower' | 'building' | 'gun' }

export class ObstacleIndex {
  readonly list: Obstacle[] = [];
  private b = new Map<number, number[]>();
  private cs = 8;
  add(o: Obstacle) {
    this.list.push(o);
    const i = this.list.length - 1;
    const r = o.r;
    for (let bx = Math.floor((o.x - r) / this.cs); bx <= Math.floor((o.x + r) / this.cs); bx++)
      for (let bz = Math.floor((o.z - r) / this.cs); bz <= Math.floor((o.z + r) / this.cs); bz++) {
        const k = bx * 100003 + bz;
        let a = this.b.get(k);
        if (!a) { a = []; this.b.set(k, a); }
        a.push(i);
      }
  }
  /** Returns the first obstacle overlapping a circle at xz with radius r. */
  hit(x: number, z: number, r: number): Obstacle | null {
    const a = this.b.get(Math.floor(x / this.cs) * 100003 + Math.floor(z / this.cs));
    if (!a) return null;
    for (const i of a) {
      const o = this.list[i];
      const dx = x - o.x, dz = z - o.z, rr = r + o.r;
      if (dx * dx + dz * dz < rr * rr) return o;
    }
    return null;
  }
}

export interface Resort {
  def: ResortDef;
  terrain: Terrain;
  trails: Trail[];
  lifts: Lift[];
  parks: Park[];
  rails: RailDef[];
  courses: RaceCourse[];
  /** stride 5: x, y, z, scale, variant */
  trees: Float32Array;
  treeCount: number;
  /** stride 5: x, y, z, scale, rot */
  rocks: Float32Array;
  rockCount: number;
  buildings: Building[];
  obstacles: ObstacleIndex;
  zTop: number;
  zBase: number;
  base: { x: number; z: number; r: number };
  genMs: number;
}

const DS = 6;
const MARGIN = 360;
const CELL = 4;

const KEEP_CROSS: Record<string, number> = { bunny: 0.1, green: 0.18, blue: 0.32, black: 0.5, double: 0.65, triple: 0.75, park: 0.04, pipe: 0, race: 0.2 };

interface PathOpts {
  target: number; turnRate: number; wiggle: number; wiggleLen: number;
  laneX: number; laneW: number; maxLen: number; minZEnd: number; occW: number;
  /** Grade above which the route is heavily penalised (switchback instead). */
  gViol?: number;
}

interface Ctx {
  def: ResortDef;
  rng: Rng;
  noise: Noise2D;
  nx: number; nz: number; x0: number; z0: number;
  raw: Float32Array;
  blur: Float32Array;
  zTop: number; zBase: number; len: number; halfW: number;
  occ: Uint8Array; occNx: number; occNz: number;
}

function sample(ctx: Ctx, arr: Float32Array, x: number, z: number): number {
  const fx = clamp((x - ctx.x0) / CELL, 0, ctx.nx - 1.001), fz = clamp((z - ctx.z0) / CELL, 0, ctx.nz - 1.001);
  const i = Math.floor(fx), j = Math.floor(fz);
  const tx = fx - i, tz = fz - j;
  const k = j * ctx.nx + i;
  return (arr[k] * (1 - tx) + arr[k + 1] * tx) * (1 - tz) + (arr[k + ctx.nx] * (1 - tx) + arr[k + ctx.nx + 1] * tx) * tz;
}

function grad(ctx: Ctx, x: number, z: number, e = 8): { gx: number; gz: number } {
  return {
    gx: (sample(ctx, ctx.blur, x + e, z) - sample(ctx, ctx.blur, x - e, z)) / (2 * e),
    gz: (sample(ctx, ctx.blur, x, z + e) - sample(ctx, ctx.blur, x, z - e)) / (2 * e),
  };
}

function rawMountain(ctx: Ctx, x: number, z: number): number {
  const { def, noise } = ctx;
  const V = def.vertical;
  const t = (ctx.zBase - z) / ctx.len;
  const u = x / ctx.halfW;
  const tc = clamp(t, 0, 1.12);
  let prof = t >= 0 ? V * Math.pow(tc, def.profilePow) : t * ctx.len * 0.028;
  if (t > 1.12) prof += (t - 1.12) * ctx.len * 0.15;
  let peakM = 0.6;
  for (const p of def.peaks) peakM += 0.4 * p.h * Math.exp(-(((u - p.x) / p.w) ** 2));
  peakM = Math.min(1.04, peakM) + 0.05 * noise.noise(x / 650, 3.3);
  const mod = lerp(1, peakM, smoothstep(0.2, 1, tc));
  let h = prof * mod;
  const tt = clamp(t, 0, 1);
  h += V * 0.34 * smoothstep(0.66, 1.25, Math.abs(u)) * (0.3 + 0.7 * tt) + 60 * smoothstep(0.9, 1.3, Math.abs(u));
  h += 34 * def.rugged * noise.fbm(x / 420, z / 950, 3) * (0.25 + 0.75 * tt);
  h += 6 * def.rugged * noise.fbm(x / 120 + 40, z / 120, 4) * (0.3 + 0.7 * tt);
  h += 36 * def.rugged * noise.ridged(x / 520, z / 520, 4) * smoothstep(0.55, 1.05, t);
  h += 1.4 * noise.noise(x / 26, z / 26);
  return h;
}

function boxBlur(src: Float32Array, nx: number, nz: number, r: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const w = 2 * r + 1;
  for (let j = 0; j < nz; j++) {
    let acc = 0;
    const row = j * nx;
    for (let i = -r; i <= r; i++) acc += src[row + clamp(i, 0, nx - 1)];
    for (let i = 0; i < nx; i++) {
      tmp[row + i] = acc / w;
      acc += src[row + clamp(i + r + 1, 0, nx - 1)] - src[row + clamp(i - r, 0, nx - 1)];
    }
  }
  for (let i = 0; i < nx; i++) {
    let acc = 0;
    for (let j = -r; j <= r; j++) acc += tmp[clamp(j, 0, nz - 1) * nx + i];
    for (let j = 0; j < nz; j++) {
      out[j * nx + i] = acc / w;
      acc += tmp[clamp(j + r + 1, 0, nz - 1) * nx + i] - tmp[clamp(j - r, 0, nz - 1) * nx + i];
    }
  }
  return out;
}

function occMark(ctx: Ctx, pts: P2[], v = 1) {
  for (const p of pts) {
    const i = Math.floor((p.x - ctx.x0) / 24), j = Math.floor((p.z - ctx.z0) / 24);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
      const ii = i + a, jj = j + b;
      if (ii >= 0 && jj >= 0 && ii < ctx.occNx && jj < ctx.occNz) ctx.occ[jj * ctx.occNx + ii] = Math.min(255, ctx.occ[jj * ctx.occNx + ii] + v);
    }
  }
}
function occAt(ctx: Ctx, x: number, z: number) {
  const i = Math.floor((x - ctx.x0) / 24), j = Math.floor((z - ctx.z0) / 24);
  if (i < 0 || j < 0 || i >= ctx.occNx || j >= ctx.occNz) return 0;
  return ctx.occ[j * ctx.occNx + i];
}

/** Slope-targeting downhill path planner. */
function planPath(ctx: Ctx, start: P2, o: PathOpts, seed: number): P2[] {
  const pts: P2[] = [{ ...start }];
  let x = start.x, z = start.z;
  const g0 = grad(ctx, x, z);
  let heading = Math.atan2(-g0.gx, -g0.gz);
  let sAcc = 0;
  let flat = 0;
  const maxSteps = Math.ceil(o.maxLen / DS);
  for (let step = 0; step < maxSteps; step++) {
    const g = grad(ctx, x, z);
    const S = Math.hypot(g.gx, g.gz) + 1e-6;
    const fall = Math.atan2(-g.gx, -g.gz);
    const wig = o.wiggle * ctx.noise.noise(sAcc / o.wiggleLen + seed * 7.13, seed * 1.7);
    let bestA = heading, bestScore = Infinity;
    for (let k = -12; k <= 12; k++) {
      const a = fall + k * 0.12;
      const dx = Math.sin(a), dz = Math.cos(a);
      const h0 = sample(ctx, ctx.blur, x, z);
      const a1 = (h0 - sample(ctx, ctx.blur, x + dx * 18, z + dz * 18)) / 18;
      const a2 = (h0 - sample(ctx, ctx.blur, x + dx * 42, z + dz * 42)) / 42;
      const along = Math.max(a1, a2) * 0.6 + Math.min(a1, a2) * 0.4;
      const viol = o.gViol ?? o.target * 1.45;
      let score = Math.abs(along - o.target) * 9 + Math.max(0, Math.max(a1, a2) - viol) * 45;
      if (along < 0.012) score += 6;
      score += Math.abs(wrapAngle(a - heading)) * 1.1;
      score += Math.abs(wrapAngle(a - (fall + wig))) * 0.35;
      const nx = x + dx * 36, nz = z + dz * 36;
      score += Math.min(4, occAt(ctx, nx, nz)) * o.occW;
      const lane = x - o.laneX;
      if (Math.abs(lane) > o.laneW) score += Math.max(0, Math.sign(lane) * dx) * 4 * (1 + (Math.abs(lane) - o.laneW) / 35);
      if (Math.abs(nx) > ctx.halfW * 0.86) score += Math.max(0, Math.sign(nx) * dx) * 12;
      if (dz < -0.2) score += 1.5; // discourage climbing back toward the summit
      if (score < bestScore) { bestScore = score; bestA = a; }
    }
    const diff = wrapAngle(bestA - heading);
    heading += clamp(diff, -o.turnRate, o.turnRate);
    x += Math.sin(heading) * DS;
    z += Math.cos(heading) * DS;
    sAcc += DS;
    pts.push({ x, z });
    const along = -(g.gx * Math.sin(heading) + g.gz * Math.cos(heading));
    flat = along < 0.01 ? flat + 1 : 0;
    if (z > o.minZEnd) break;
    if (flat > 30) break;
    if (S < 0.004 && z > ctx.zBase - 200) break;
  }
  return smoothPath(pts);
}

function smoothPath(pts: P2[]): P2[] {
  let p = pts;
  for (let it = 0; it < 3; it++) {
    const q: P2[] = [p[0]];
    for (let i = 1; i < p.length - 1; i++) q.push({ x: 0.25 * p[i - 1].x + 0.5 * p[i].x + 0.25 * p[i + 1].x, z: 0.25 * p[i - 1].z + 0.5 * p[i].z + 0.25 * p[i + 1].z });
    q.push(p[p.length - 1]);
    p = q;
  }
  // resample uniform DS
  const out: P2[] = [p[0]];
  let carry = 0;
  for (let i = 1; i < p.length; i++) {
    const ax = p[i - 1].x, az = p[i - 1].z, bx = p[i].x, bz = p[i].z;
    const l = Math.hypot(bx - ax, bz - az);
    let d = DS - carry;
    while (d <= l) { const t = d / l; out.push({ x: ax + (bx - ax) * t, z: az + (bz - az) * t }); d += DS; }
    carry = l - (d - DS);
  }
  if (out.length > 1) {
    const last = p[p.length - 1], prev = out[out.length - 1];
    if (Math.hypot(last.x - prev.x, last.z - prev.z) > DS * 0.4) out.push(last);
  }
  return out;
}

function cumulative(pts: P2[]): number[] {
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  return s;
}

/** Steepest descent over a window (metres) as gradient, and where it starts. */
export function steepestWindow(prof: number[], s: number[], win = 60): { g: number; i: number } {
  let best = -Infinity, bi = 0;
  let j = 0;
  for (let i = 0; i < prof.length; i++) {
    while (j < prof.length - 1 && s[j] - s[i] < win) j++;
    if (s[j] - s[i] < win * 0.75) break;
    const g = (prof[i] - prof[j]) / (s[j] - s[i]);
    if (g > best) { best = g; bi = i; }
  }
  if (best === -Infinity) best = prof.length > 1 ? (prof[0] - prof[prof.length - 1]) / Math.max(1, s[s.length - 1]) : 0;
  return { g: best, i: bi };
}

/** Shapes a raw centerline profile into a trail profile satisfying gradient constraints. */
function shapeProfile(r: number[], s: number[], gMin: number, gMax: number, pitchMin: number, pitchLen: number, pins?: boolean[]): number[] {
  const n = r.length;
  let t = r.slice();
  const pinned = (i: number) => !!pins && pins[i];
  // 1. steepen a pitch (balanced fill above / cut below) when the raw route is too gentle
  const raw = steepestWindow(r, s, Math.min(pitchLen, (s[n - 1] ?? 0) * 0.6));
  if (pitchMin > 0 && raw.g < pitchMin * 1.04 && n > 10) {
    const w = Math.max(4, Math.round(Math.min(pitchLen, s[n - 1] * 0.45) / DS));
    const E0 = (pitchMin * 1.1 - raw.g) * w * DS;
    const nd = Math.max(5, Math.round(E0 / 2 / 0.14 / DS));
    let best = -Infinity, i0 = -1;
    for (let i = nd; i + w + nd < n; i++) {
      const g = (r[i] - r[i + w]) / (s[i + w] - s[i]);
      if (g > best) { best = g; i0 = i; }
    }
    if (i0 < 0) { i0 = Math.max(1, Math.floor((n - w) / 2)); best = (r[i0] - r[Math.min(n - 1, i0 + w)]) / Math.max(1, s[Math.min(n - 1, i0 + w)] - s[i0]); }
    const E = Math.max(0, (pitchMin * 1.1 - best) * w * DS);
    for (let i = 0; i < n; i++) {
      let d = 0;
      if (i >= i0 - nd && i < i0) d = (E / 2) * smoothstep(i0 - nd, i0, i);
      else if (i >= i0 && i <= i0 + w) d = E / 2 - (E * (i - i0)) / w;
      else if (i > i0 + w && i <= i0 + w + nd) d = -(E / 2) * (1 - smoothstep(i0 + w, i0 + w + nd, i));
      t[i] = pinned(i) ? r[i] : r[i] + d;
    }
  }
  // 2. clamp gradients: forward (anchored at the top) and backward (anchored at the bottom)
  //    passes are both feasible; blending them keeps cut/fill small at both ends.
  //    Pinned points (crossings with already-carved trails) are hard anchors.
  const F = t.slice(), B = t.slice();
  for (let i = 1; i < n; i++) {
    const ds = s[i] - s[i - 1];
    F[i] = pinned(i) ? t[i] : clamp(t[i], F[i - 1] - gMax * ds, F[i - 1] - gMin * ds);
  }
  for (let i = n - 2; i >= 0; i--) {
    const ds = s[i + 1] - s[i];
    B[i] = pinned(i) ? t[i] : clamp(t[i], B[i + 1] + gMin * ds, B[i + 1] + gMax * ds);
  }
  const out = new Array<number>(n);
  let prevA = 0;
  for (let i = 0; i < n; i++) {
    if (pinned(i)) { out[i] = t[i]; prevA = i; continue; }
    let nextA = i;
    while (nextA < n - 1 && !pinned(nextA)) nextA++;
    const w = smoothstep(0, 1, (i - prevA) / Math.max(1, nextA - prevA));
    out[i] = lerp(F[i], B[i], w);
  }
  // re-impose the slope limits after blending (cheap forward clamp, tiny corrections)
  for (let i = 1; i < n; i++) {
    if (pinned(i)) continue;
    const ds = s[i] - s[i - 1];
    out[i] = clamp(out[i], out[i - 1] - gMax * ds, out[i - 1] - gMin * ds);
  }
  t = out;
  return t;
}

/** Finds a straight corridor whose natural grade best matches `target` (parks & pipes). */
function findStraightSite(ctx: Ctx, target: number, len: number, tMin: number, tMax: number, nearX: number, nearZ: number): P2[] {
  let best: { x: number; z: number; a: number } | null = null, bestScore = Infinity;
  const step = 45;
  for (let z = ctx.zBase - tMax * ctx.len; z <= ctx.zBase - tMin * ctx.len - len * 0.6; z += step) {
    for (let x = -ctx.halfW * 0.78; x <= ctx.halfW * 0.78; x += step) {
      const g = grad(ctx, x, z, 20);
      const fall = Math.atan2(-g.gx, -g.gz);
      for (let k = -4; k <= 4; k++) {
        const a = fall + k * 0.2;
        const dx = Math.sin(a), dz = Math.cos(a);
        if (dz < 0.3) continue;
        const h0 = sample(ctx, ctx.blur, x, z);
        let dev = 0, occ = 0;
        for (let d = 15; d <= len; d += 15) {
          const px = x + dx * d, pz = z + dz * d;
          if (Math.abs(px) > ctx.halfW * 0.86 || pz > ctx.zBase + 30) { dev = Infinity; break; }
          dev = Math.max(dev, Math.abs(sample(ctx, ctx.blur, px, pz) - (h0 - target * d)));
          occ += occAt(ctx, px, pz);
        }
        const score = dev + occ * 1.5 + Math.hypot(x - nearX, z - nearZ) * 0.004 + Math.abs(k) * 0.3;
        if (score < bestScore) { bestScore = score; best = { x, z, a }; }
      }
    }
  }
  if (!best) best = { x: nearX, z: nearZ + 40, a: 0 };
  return lineXZ(best.x, best.z, best.x + Math.sin(best.a) * len, best.z + Math.cos(best.a) * len, DS);
}

function laneSign(rng: Rng, k: number) { return (k % 2 === 0 ? 1 : -1) * (rng.chance(0.15) ? -1 : 1); }

interface Planned { kind: TrailKind; d: Difficulty; pts: P2[]; width: number; liftId: number; name?: string; tag?: string; discipline?: Discipline; parkStyle?: Park['style'] }

export function buildResort(def: ResortDef, progress?: (stage: string, f: number) => void, debug?: { shaped: Map<number, number[]> }): Resort {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  resetFeatureIds();
  const rng = new Rng(def.seed);
  const noise = new Noise2D(def.seed);
  const W = def.width, L = def.length;
  const x0 = -W / 2 - MARGIN, z0 = -MARGIN;
  const nx = Math.ceil((W + 2 * MARGIN) / CELL) + 1;
  const nz = Math.ceil((L + 2 * MARGIN) / CELL) + 1;
  const zTop = 140, zBase = L - 280;
  const ctx: Ctx = {
    def, rng, noise, nx, nz, x0, z0,
    raw: new Float32Array(nx * nz), blur: new Float32Array(0),
    zTop, zBase, len: zBase - zTop, halfW: W / 2,
    occ: new Uint8Array(Math.ceil((W + 2 * MARGIN) / 24) * Math.ceil((L + 2 * MARGIN) / 24)),
    occNx: Math.ceil((W + 2 * MARGIN) / 24), occNz: Math.ceil((L + 2 * MARGIN) / 24),
  };
  progress?.('Raising the mountain', 0.05);
  for (let j = 0; j < nz; j++) {
    const z = z0 + j * CELL;
    for (let i = 0; i < nx; i++) ctx.raw[j * nx + i] = rawMountain(ctx, x0 + i * CELL, z);
  }
  ctx.blur = boxBlur(boxBlur(ctx.raw, nx, nz, 3), nx, nz, 3);

  const zAtT = (t: number) => (t <= 0.001 ? zBase + 55 : zBase - t * ctx.len);

  // ---------- Lifts (xz only for now) ----------
  const liftXZ = def.lifts.map((sp) => ({
    sp,
    bx: sp.from[0] * ctx.halfW, bz: zAtT(sp.from[1]),
    tx: sp.to[0] * ctx.halfW, tz: zAtT(Math.min(0.975, sp.to[1])),
  }));
  for (const l of liftXZ) occMark(ctx, lineXZ(l.bx, l.bz, l.tx, l.tz, 20), 1);

  // ---------- Plan + shape + carve corridors sequentially ----------
  // Parks and race courses first, then trails from hardest to easiest: every corridor is
  // planned on the live (already carved) heightfield, so crossings meet at the same snow
  // and the easiest trails — whose limits are strictest — have the final say at crossings.
  progress?.('Cutting trails', 0.25);
  const liftTopsFor = (minT: number, maxT = 2) => liftXZ.map((l, i) => ({ l, i })).filter((o) => o.l.sp.to[1] >= minT && o.l.sp.to[1] <= maxT);
  const N = nx * nz;
  const H = ctx.raw.slice();
  const tid = new Int16Array(N).fill(-1), tw = new Float32Array(N);
  const stamp = new Int32Array(N).fill(-1);
  const bestD = new Float32Array(N), bestK = new Float32Array(N);
  const used = new Set<string>();
  const trails: Trail[] = [];
  const extra = new Map<number, { style?: Park['style']; disc?: Discipline }>();

  const pinsFor = (pts: P2[]) => pts.map((q) => {
    const i = Math.round((q.x - x0) / CELL), j = Math.round((q.z - z0) / CELL);
    return i >= 0 && j >= 0 && i < nx && j < nz && tw[j * nx + i] > 0.55;
  });
  const carve = (p: Planned) => {
    const s = cumulative(p.pts);
    const r = p.pts.map((q) => sample(ctx, ctx.blur, q.x, q.z));
    const pins = pinsFor(p.pts);
    const total = s[s.length - 1];
    let prof: number[];
    let groomed = true, moguls = false, glade = false, icy = 0.05, chute = false;
    const cliffs: { i: number; drop: number }[] = [];
    if (p.kind === 'trail') {
      const band = PITCH_BANDS[p.d];
      const gMin = p.d === 'bunny' ? 0.03 : 0.012;
      prof = shapeProfile(r, s, gMin, band.max * 0.89, band.min, Math.max(100, Math.min(260, total * 0.35)), pins);
      const roll = rng.next();
      if (p.d === 'blue') { icy = 0.12; }
      if (p.d === 'black') { moguls = roll < 0.4; glade = !moguls && roll < 0.62 && def.treeline > 0.6; groomed = !moguls && !glade; icy = 0.35; }
      if (p.d === 'double') { moguls = roll < 0.35; chute = roll >= 0.35 && roll < 0.75; groomed = false; icy = 0.4; glade = roll >= 0.85 && def.treeline > 0.7; }
      if (p.d === 'triple') { groomed = false; chute = roll < 0.7; icy = 0.5; }
      if (p.d === 'triple' || (p.d === 'double' && rng.chance(0.4))) {
        // cliff bands on the steep pitch: a raised rollover then an abrupt drop
        const pitch = steepestWindow(prof, s, Math.min(200, total * 0.4));
        const count = p.d === 'triple' ? rng.int(2, 3) : 1;
        for (let c = 0; c < count; c++) {
          const ic = clamp(pitch.i + 8 + c * rng.int(9, 14), 9, prof.length - 12);
          if (pins.slice(Math.max(0, ic - 9), ic + 3).some(Boolean)) continue;
          const drop = p.d === 'triple' ? rng.range(5, 9) : rng.range(3, 4.5);
          const m = 7;
          for (let j = ic - m; j <= ic; j++) prof[j] += drop * smoothstep(ic - m, ic, j);
          cliffs.push({ i: ic, drop });
        }
      }
    } else if (p.kind === 'park' || p.kind === 'pipe') {
      const g = (r[0] - r[r.length - 1]) / Math.max(1, total);
      const target = p.kind === 'pipe' ? clamp(g, 0.27, 0.31) : clamp(g, p.parkStyle === 'beginner' ? 0.12 : 0.16, p.parkStyle === 'beginner' ? 0.15 : 0.23);
      prof = shapeProfile(r, s, target - 0.012, target + 0.012, 0, 100, pins);
    } else {
      const disc = p.discipline!;
      const lim = disc === 'ski-cross' || disc === 'freestyle' ? [0.12, 0.27] : def.index === 0 ? [0.08, 0.26] : disc === 'slalom' ? [0.2, 0.5] : [0.1, 0.48];
      prof = shapeProfile(r, s, lim[0], lim[1], disc === 'downhill' || disc === 'super-g' ? 0.32 : 0, 200, pins);
      // race pistes are smoothed so grade changes are gradual (no accidental launch ramps)
      for (let it = 0; it < 4; it++) {
        const q = prof.slice();
        for (let i = 3; i < prof.length - 3; i++) if (!pins[i]) q[i] = (prof[i - 3] + prof[i - 2] + prof[i - 1] + prof[i] + prof[i + 1] + prof[i + 2] + prof[i + 3]) / 7;
        prof = q;
      }
      icy = disc === 'slalom' || disc === 'giant-slalom' ? 0.25 : 0.15;
    }
    const kindKey = p.kind === 'trail' ? p.d : p.kind;
    const keep = KEEP_CROSS[kindKey] ?? 0.3;
    const shK = chute ? 0.6 : 2.2;
    const shBase = p.kind === 'pipe' ? 14 : chute ? 5 : p.d === 'triple' ? 7 : 14;
    const sh = prof.map((v, i) => clamp(Math.abs(v - r[i]) * shK, shBase, chute ? 30 : 55));
    const width = chute ? Math.min(p.width, 12) : p.width;
    const name = p.kind === 'trail' ? trailName(rng, def.themeWords, p.d, used)
      : p.kind === 'race' ? `${def.themeWords[(trails.length * 7) % def.themeWords.length]} ${DISCIPLINE_INFO[p.discipline!].label} Course`
      : `${def.themeWords[(trails.length * 5 + 3) % def.themeWords.length]} ${parkLabel(p.parkStyle!)}`;
    const tr: Trail = {
      id: trails.length, name, kind: p.kind, difficulty: p.d, pts: p.pts, prof, s, width, groomed, moguls, glade, icy, chute, cliffs,
      liftId: p.liftId, length: total, vertical: prof[0] - prof[prof.length - 1], avgGrade: 0, maxPitch: 0, landmark: landmarkFor(rng, p.d),
    };
    trails.push(tr);
    debug?.shaped.set(tr.id, prof.slice());
    (debug as { raw?: Map<number, number[]> } | undefined)?.raw?.set(tr.id, r.slice());
    extra.set(tr.id, { style: p.parkStyle, disc: p.discipline });

    // rasterize into the live heightfield
    const half = width / 2;
    const touched: number[] = [];
    for (let i = 0; i < tr.pts.length - 1; i++) {
      const a = tr.pts[i], b = tr.pts[i + 1];
      const rad = half + Math.max(sh[i], sh[i + 1]) + CELL;
      const i0 = Math.max(0, Math.floor((Math.min(a.x, b.x) - rad - x0) / CELL)), i1 = Math.min(nx - 1, Math.ceil((Math.max(a.x, b.x) + rad - x0) / CELL));
      const j0 = Math.max(0, Math.floor((Math.min(a.z, b.z) - rad - z0) / CELL)), j1 = Math.min(nz - 1, Math.ceil((Math.max(a.z, b.z) + rad - z0) / CELL));
      const ex = b.x - a.x, ez = b.z - a.z, l2 = ex * ex + ez * ez;
      for (let j = j0; j <= j1; j++) {
        const z = z0 + j * CELL;
        for (let ii = i0; ii <= i1; ii++) {
          const x = x0 + ii * CELL;
          let t = ((x - a.x) * ex + (z - a.z) * ez) / l2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const d = Math.hypot(a.x + ex * t - x, a.z + ez * t - z);
          const c = j * nx + ii;
          if (stamp[c] !== tr.id) { stamp[c] = tr.id; bestD[c] = d; bestK[c] = i + t; touched.push(c); }
          else if (d < bestD[c]) { bestD[c] = d; bestK[c] = i + t; }
        }
      }
    }
    const endS = tr.s[tr.s.length - 1];
    for (const c of touched) {
      const k = bestK[c];
      const ki = Math.min(tr.pts.length - 2, Math.floor(k)), kt = k - ki;
      const tk = lerp(prof[ki], prof[ki + 1], kt);
      const rk = lerp(r[ki], r[ki + 1], kt);
      const shk = lerp(sh[ki], sh[ki + 1], kt);
      const w = 1 - smoothstep(half, half + shk, bestD[c]);
      const sk = lerp(tr.s[ki], tr.s[ki + 1], kt);
      const endFade = Math.max(0.15, smoothstep(0, 24, endS - sk));
      const ww = w * endFade;
      if (ww <= 0) continue;
      const other = tid[c] >= 0 && tid[c] !== tr.id ? tw[c] * (trails[tid[c]].kind !== 'trail' ? 1.3 : 1) : 0;
      const keepEff = keep + (1 - keep) * smoothstep(0.3, 0.9, other);
      const T = tk + keepEff * (ctx.blur[c] - rk);
      const inCore = bestD[c] <= half + 2;
      const wf = inCore ? ww : ww * (1 - 0.92 * tw[c]);
      H[c] = lerp(H[c], T, wf);
      ctx.blur[c] = lerp(ctx.blur[c], T, wf);
      const mw = (1 - smoothstep(half, half + 3, bestD[c])) * (sk < endS - 2 || bestD[c] < half ? 1 : 0);
      const ownerProtected = tid[c] >= 0 && tid[c] !== tr.id && trails[tid[c]].kind !== 'trail' && tw[c] > 0.3;
      if (mw > 0 && mw >= tw[c] - 0.02 && !(ownerProtected && tr.kind === 'trail')) { tw[c] = Math.max(tw[c], mw); tid[c] = tr.id; }
    }
    occMark(ctx, tr.pts, p.kind === 'trail' ? 2 : 3);
  };

  const parkSpec: Record<Park['style'], { target: number; width: number; len: number; t: [number, number] }> = {
    beginner: { target: 0.14, width: 48, len: 260, t: [0.08, 0.6] },
    standard: { target: 0.19, width: 64, len: 400, t: [0.3, 0.8] },
    slopestyle: { target: 0.21, width: 70, len: 560, t: [0.4, 1] },
    bigair: { target: 0.24, width: 56, len: 300, t: [0.35, 1] },
    rails: { target: 0.17, width: 70, len: 300, t: [0.2, 0.8] },
    superpipe: { target: 0.29, width: 50, len: 240, t: [0.3, 1] },
    halfpipe: { target: 0.29, width: 42, len: 190, t: [0.25, 1] },
  };
  def.parks.forEach((style, k) => {
    const sp = parkSpec[style];
    let cands = liftTopsFor(sp.t[0], sp.t[1]);
    if (!cands.length) cands = liftTopsFor(0);
    const c = cands[k % cands.length];
    const pts = findStraightSite(ctx, sp.target, sp.len, sp.t[0], Math.min(0.92, sp.t[1]), c.l.tx, c.l.tz);
    carve({ kind: style === 'superpipe' || style === 'halfpipe' ? 'pipe' : 'park', d: style === 'beginner' ? 'green' : 'blue', pts, width: sp.width, liftId: c.i, parkStyle: style });
  });

  const raceSpec: Record<Discipline, { target: number; width: number; len: number; minT: number; d: Difficulty; wiggle: number; wlen: number }> = {
    downhill: { target: 0.36, width: 46, len: 1900, minT: 0.75, d: 'black', wiggle: 0.35, wlen: 260 },
    'super-g': { target: 0.36, width: 42, len: 1200, minT: 0.6, d: 'black', wiggle: 0.3, wlen: 200 },
    'giant-slalom': { target: 0.3, width: 38, len: 800, minT: 0.45, d: 'blue', wiggle: 0.25, wlen: 180 },
    slalom: { target: 0.33, width: 34, len: 460, minT: 0.3, d: 'black', wiggle: 0.15, wlen: 150 },
    'ski-cross': { target: 0.2, width: 20, len: 780, minT: 0.35, d: 'blue', wiggle: 0.9, wlen: 70 },
    freestyle: { target: 0.2, width: 50, len: 560, minT: 0.35, d: 'blue', wiggle: 0.2, wlen: 160 },
  };
  def.races.forEach((disc, k) => {
    const sp = raceSpec[disc];
    const beginner = def.index === 0;
    let cands = liftTopsFor(beginner ? 0.4 : sp.minT);
    if (!cands.length) cands = liftTopsFor(0.3);
    const c = cands[(k + 1) % cands.length];
    const side = laneSign(rng, k);
    const start = { x: c.l.tx + side * rng.range(110, 190), z: c.l.tz + 25 };
    const target = beginner ? 0.2 : sp.target;
    const pts = planPath(ctx, start, { target, turnRate: disc === 'ski-cross' ? 0.16 : 0.07, wiggle: sp.wiggle, wiggleLen: sp.wlen, laneX: start.x, laneW: 140, maxLen: sp.len, minZEnd: zBase + 10, occW: 0.5 }, k + 201);
    carve({ kind: 'race', d: beginner ? 'green' : sp.d, pts, width: sp.width, liftId: c.i, discipline: disc });
  });

  const trailOpts: Record<Difficulty, { target: number; turn: number; wig: number; wl: number; laneW: number; width: [number, number]; minT: number; maxT: number }> = {
    bunny: { target: 0.085, turn: 0.2, wig: 0.15, wl: 80, laneW: 50, width: [48, 60], minT: 0, maxT: 0.16 },
    green: { target: 0.15, turn: 0.28, wig: 0.3, wl: 140, laneW: 170, width: [38, 52], minT: 0.25, maxT: def.profilePow > 1.55 ? 0.66 : 0.98 },
    blue: { target: 0.29, turn: 0.25, wig: 0.5, wl: 120, laneW: 180, width: [30, 42], minT: 0.35, maxT: def.profilePow > 1.9 ? 0.9 : 2 },
    black: { target: 0.48, turn: 0.27, wig: 0.4, wl: 100, laneW: 140, width: [24, 34], minT: 0.45, maxT: 2 },
    double: { target: 0.72, turn: 0.27, wig: 0.3, wl: 90, laneW: 100, width: [13, 20], minT: 0.6, maxT: 2 },
    triple: { target: 0.95, turn: 0.3, wig: 0.25, wl: 80, laneW: 80, width: [9, 13], minT: 0.72, maxT: 2 },
  };
  const order: Difficulty[] = ['bunny', 'green', 'blue', 'black', 'double', 'triple'];
  let globalK = 0;
  let doneCount = 0;
  const totalCount = order.reduce((a, d) => a + (def.trails[d] ?? 0), 0);
  for (const d of order) {
    const n = def.trails[d] ?? 0;
    const o = trailOpts[d];
    let cands = d === 'bunny' ? liftXZ.map((l, i) => ({ l, i })).filter((c) => c.l.sp.type === 'surface' && c.l.sp.to[1] <= 0.16) : liftTopsFor(o.minT, o.maxT);
    if (!cands.length && d === 'bunny') cands = [liftXZ.map((l, i) => ({ l, i })).sort((a, b) => a.l.sp.to[1] - b.l.sp.to[1])[0]];
    if (!cands.length) cands = liftTopsFor(o.minT);
    if (!cands.length) cands = liftTopsFor(0.3);
    for (let k = 0; k < n; k++) {
      const c = cands[(k + globalK) % cands.length];
      let best: P2[] | null = null, bestQ = Infinity;
      for (let attempt = 0; attempt < 10; attempt++) {
        const side = laneSign(rng, k + attempt);
        const spread = d === 'bunny' ? rng.range(15, 45) : rng.range(35, Math.min(320, ctx.halfW * 0.35));
        const start = { x: clamp(c.l.tx + side * spread, -ctx.halfW * 0.84, ctx.halfW * 0.84), z: c.l.tz + rng.range(10, 40) };
        const target = o.target * rng.range(0.92, 1.06);
        const pts = planPath(ctx, start, {
          target, turnRate: o.turn, wiggle: o.wig, wiggleLen: o.wl, laneX: start.x + side * rng.range(0, 120), laneW: o.laneW,
          maxLen: d === 'green' || d === 'blue' ? 5200 : 4200, minZEnd: zBase + 25, occW: 0.55, gViol: PITCH_BANDS[d].max * 0.86,
        }, globalK * 13 + k * 3 + attempt);
        const len = (pts.length - 1) * DS;
        const minLen = d === 'bunny' ? 90 : 250;
        const reached = pts[pts.length - 1].z > zBase - 40;
        const ss = cumulative(pts);
        const rr = pts.map((q) => sample(ctx, ctx.blur, q.x, q.z));
        const band = PITCH_BANDS[d];
        const shaped = shapeProfile(rr, ss, 0.012, band.max * 0.89, band.min, Math.max(100, Math.min(260, len * 0.35)), pinsFor(pts));
        let dev = 0;
        for (let i = 0; i < rr.length; i++) dev = Math.max(dev, Math.abs(rr[i] - shaped[i]));
        const pitch = steepestWindow(shaped, ss, 60).g;
        const viol = Math.max(0, pitch - band.max * 0.94) + Math.max(0, band.min * 1.04 - pitch);
        const q = dev + viol * 600 + (reached ? 0 : 400) + (len >= minLen ? 0 : 300);
        if (q < bestQ) { bestQ = q; best = pts; }
        if (q < 14) break;
      }
      carve({ kind: 'trail', d, pts: best!, width: rng.range(o.width[0], o.width[1]), liftId: c.i });
      doneCount++;
      progress?.('Cutting trails', 0.25 + 0.35 * (doneCount / Math.max(1, totalCount)));
    }
    globalK += 3;
  }
  // ---------- Base area, station pads, lakes ----------
  progress?.('Building the base area', 0.65);
  const base = { x: 0, z: zBase + 95, r: def.village ? 270 : 165 };
  const baseH = sample(ctx, ctx.blur, base.x, base.z);
  const flatten = (cx: number, cz: number, r: number, fall: number, target: (x: number, z: number) => number) => {
    const i0 = Math.max(0, Math.floor((cx - r - fall - x0) / CELL)), i1 = Math.min(nx - 1, Math.ceil((cx + r + fall - x0) / CELL));
    const j0 = Math.max(0, Math.floor((cz - r - fall - z0) / CELL)), j1 = Math.min(nz - 1, Math.ceil((cz + r + fall - z0) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const x = x0 + i * CELL, z = z0 + j * CELL;
      const d = Math.hypot(x - cx, z - cz);
      const w = 1 - smoothstep(r, r + fall, d);
      if (w > 0) H[j * nx + i] = lerp(H[j * nx + i], target(x, z), w);
    }
  };
  flatten(base.x, base.z, base.r, 120, (_x, z) => baseH - (z - base.z) * 0.025);
  const bigW = ctx.halfW;
  // lift station pads
  for (const l of liftXZ) {
    const sampleH = (x: number, z: number) => {
      const fx = clamp((x - x0) / CELL, 0, nx - 1), fz = clamp((z - z0) / CELL, 0, nz - 1);
      return H[Math.round(fz) * nx + Math.round(fx)];
    };
    const hb = sampleH(l.bx, l.bz), ht = sampleH(l.tx, l.tz);
    flatten(l.bx, l.bz, 16, 20, () => hb);
    flatten(l.tx, l.tz, 15, 22, () => ht);
  }
  // frozen lakes, off-trail, low on the mountain
  const lakes: Lake[] = [];
  for (let k = 0; k < def.lakes; k++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const lx = (k % 2 === 0 ? -1 : 1) * rng.range(0.45, 0.8) * bigW;
      const lz = zBase - rng.range(0.02, 0.22) * ctx.len;
      const lr = rng.range(38, 70);
      let clear = true;
      for (let a = 0; a < 16 && clear; a++) {
        const ang = (a / 16) * Math.PI * 2;
        for (const rr of [0, lr * 0.5, lr + 20]) {
          const c = Math.round((lz + Math.sin(ang) * rr - z0) / CELL) * nx + Math.round((lx + Math.cos(ang) * rr - x0) / CELL);
          if (tw[c] > 0.01 || stamp[c] >= 0) clear = false;
        }
      }
      if (!clear) continue;
      const ly = sample(ctx, ctx.blur, lx, lz) - 1.5;
      flatten(lx, lz, lr, 45, () => ly);
      lakes.push({ x: lx, z: lz, r: lr - 3, y: ly });
      break;
    }
  }

  // ---------- Terrain object ----------
  progress?.('Freezing the snowpack', 0.72);
  const terrain = new Terrain(nx, nz, CELL, x0, z0, def.seed);
  terrain.H.set(H);
  terrain.trailId.set(tid);
  terrain.trailW.set(tw);
  terrain.trails = trails;
  terrain.lakes = lakes;
  terrain.baseAlt = def.baseAlt;
  terrain.vertical = def.vertical;
  terrain.halfW = ctx.halfW;
  terrain.length = L;
  terrain.glacierLine = def.glacier ? def.vertical * 0.7 : Infinity;

  // final stats measured on the real surface
  for (const tr of trails) {
    const prof = tr.pts.map((p) => terrain.gridHeight(p.x, p.z));
    tr.prof = prof;
    tr.vertical = prof[0] - prof[prof.length - 1];
    tr.avgGrade = tr.vertical / Math.max(1, tr.length);
    tr.maxPitch = steepestWindow(prof, tr.s, 60).g;
  }

  // ---------- Lifts ----------
  const lifts: Lift[] = liftXZ.map((l, i) => buildLift(terrain, i, l.sp.name, l.sp.type, l.bx, l.bz, l.tx, l.tz));

  // ---------- Parks: features & rails ----------
  progress?.('Building terrain parks', 0.8);
  const parks: Park[] = [];
  const rails: RailDef[] = [];
  for (const tr of trails) {
    const style = extra.get(tr.id)?.style;
    if (!style) continue;
    const park: Park = { id: parks.length, name: tr.name, style, trailId: tr.id, featureIds: [], railIds: [] };
    buildPark(terrain, park, tr, rails, rng);
    parks.push(park);
  }

  // ---------- Race courses ----------
  const courses: RaceCourse[] = [];
  for (const tr of trails) {
    const disc = extra.get(tr.id)?.disc;
    if (!disc) continue;
    courses.push(buildCourse(terrain, courses.length, tr, disc, def.index, rng));
  }

  // ---------- Trees, rocks, buildings ----------
  progress?.('Growing forests', 0.88);
  const obstacles = new ObstacleIndex();
  const buildings: Building[] = [];
  placeBuildings(terrain, def, base, lifts, trails, buildings, rng);
  // nothing solid may sit inside a groomed corridor (other than its own sign at the edge)
  for (let i = buildings.length - 1; i >= 0; i--) {
    const b = buildings[i];
    if (b.kind === 'lodge') continue;
    const pad = b.kind === 'cabin' || b.kind === 'village' || b.kind === 'hut' ? 8 : 1.5;
    const w = Math.max(terrain.trailAt(b.x, b.z).w, terrain.trailAt(b.x + pad, b.z).w, terrain.trailAt(b.x - pad, b.z).w, terrain.trailAt(b.x, b.z + pad).w, terrain.trailAt(b.x, b.z - pad).w);
    if (w > 0.15) buildings.splice(i, 1);
  }
  for (const b of buildings) {
    const r = b.kind === 'lodge' ? 14 : b.kind === 'village' ? 9 : b.kind === 'cabin' || b.kind === 'hut' ? 6 : b.kind === 'snowgun' ? 0.5 : b.kind === 'sign' || b.kind === 'mapboard' ? 0.35 : 0;
    if (r > 0) obstacles.add({ x: b.x, z: b.z, r: r * b.scale, kind: b.kind === 'snowgun' ? 'gun' : 'building' });
  }
  for (const l of lifts) for (const t of l.towers) obstacles.add({ x: t.x, z: t.z, r: 0.6, kind: 'tower' });

  // keep a clear skiable line down every trail (glades included)
  const lineHash = new Map<number, { x: number; z: number; r: number }[]>();
  for (const tr of trails) {
    const r = tr.glade ? 3.5 : Math.min(tr.width / 2, 7);
    for (const p of tr.pts) {
      const k = Math.floor(p.x / 8) * 100003 + Math.floor(p.z / 8);
      let a = lineHash.get(k);
      if (!a) { a = []; lineHash.set(k, a); }
      a.push({ x: p.x, z: p.z, r });
    }
  }
  const nearLine = (x: number, z: number) => {
    const bx = Math.floor(x / 8), bz = Math.floor(z / 8);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const a = lineHash.get((bx + i) * 100003 + bz + j);
      if (a) for (const p of a) if ((p.x - x) ** 2 + (p.z - z) ** 2 < (p.r + 1) ** 2) return true;
    }
    return false;
  };
  const treeArr: number[] = [];
  const rockArr: number[] = [];
  const forest = new Noise2D(def.seed + ':forest');
  const spacing = 10.5;
  const liftSegs = lifts.map((l) => [l.bottom.x, l.bottom.z, l.top.x, l.top.z]);
  const nearLift = (x: number, z: number, r: number) => liftSegs.some(([ax, az, bx, bz]) => distSeg(x, z, ax, az, bx, bz) < r);
  for (let z = -MARGIN + 30; z < L + MARGIN - 30; z += spacing) {
    for (let x = -ctx.halfW - MARGIN + 30; x < ctx.halfW + MARGIN - 30; x += spacing) {
      const px = x + rng.range(-4, 4), pz = z + rng.range(-4, 4);
      const y = terrain.gridHeight(px, pz);
      const a = y / def.vertical;
      let dens = def.treeDensity * (0.55 + 0.75 * forest.fbm(px / 380, pz / 380, 3));
      dens *= 1 - smoothstep(def.treeline - 0.1, def.treeline, a);
      if (dens <= 0.05) continue;
      const t = terrain.trailAt(px, pz);
      if (t.id >= 0 && t.w > 0.02) {
        const tr = trails[t.id];
        if (!tr.glade || t.w > 0.98 && rng.chance(0.75)) continue;
        if (tr.kind !== 'trail') continue;
        dens *= 0.35;
      }
      // keep groomed edges clear by a few metres
      const tAhead = Math.max(terrain.trailAt(px + 4, pz).w, terrain.trailAt(px - 4, pz).w, terrain.trailAt(px, pz + 4).w, terrain.trailAt(px, pz - 4).w);
      if (tAhead > 0.3 && !(t.id >= 0 && trails[t.id].glade)) continue;
      const s = terrain.gridSlope(px, pz);
      if (s > 0.95) continue;
      if (Math.hypot(px - base.x, pz - base.z) < base.r + 25) continue;
      if (nearLift(px, pz, 11)) continue;
      if (terrain.features.height(px, pz) > 0 || terrain.lakeAt(px, pz) || lakes.some((l) => Math.hypot(px - l.x, pz - l.z) < l.r + 8)) continue;
      if (!rng.chance(dens)) continue;
      if (nearLine(px, pz)) continue;
      const sc = rng.range(0.75, 1.45);
      treeArr.push(px, y - 0.3, pz, sc, rng.int(0, 2));
      if (Math.abs(px) < ctx.halfW + 40 && pz > -40 && pz < L + 40) obstacles.add({ x: px, z: pz, r: 0.35 + 0.35 * sc, kind: 'tree' });
    }
  }
  // rocks: steep outcrops + chute/triple edges + a few obstacles on expert lines
  for (let z = -MARGIN + 40; z < L + MARGIN - 40; z += 14) {
    for (let x = -ctx.halfW - MARGIN + 40; x < ctx.halfW + MARGIN - 40; x += 14) {
      const px = x + rng.range(-6, 6), pz = z + rng.range(-6, 6);
      const s = terrain.gridSlope(px, pz);
      if (s < 0.75 || !rng.chance(clamp((s - 0.75) * 0.9, 0, 0.5))) continue;
      const t = terrain.trailAt(px, pz);
      if (t.w > 0.3) continue;
      const sc = rng.range(0.8, 2.6);
      rockArr.push(px, terrain.gridHeight(px, pz) - 0.4 * sc, pz, sc, rng.range(0, Math.PI * 2));
      if (Math.abs(px) < ctx.halfW + 40) obstacles.add({ x: px, z: pz, r: sc * 0.75, kind: 'rock' });
    }
  }
  for (const tr of trails) {
    if (tr.kind !== 'trail' || (tr.difficulty !== 'double' && tr.difficulty !== 'triple' && !(tr.difficulty === 'black' && !tr.groomed))) continue;
    const every = tr.chute ? 3 : 7;
    for (let i = 4; i < tr.pts.length - 4; i += every) {
      const p = tr.pts[i], q = tr.pts[i + 1];
      const dx = q.x - p.x, dz = q.z - p.z, l = Math.hypot(dx, dz) || 1;
      const rx = -dz / l, rz = dx / l;
      const edge = tr.chute ? tr.width / 2 + rng.range(0.5, 3) : rng.range(-tr.width * 0.38, tr.width * 0.38);
      const side = rng.chance(0.5) ? 1 : -1;
      if (!tr.chute && Math.abs(edge) < 3.5) continue;
      if (!tr.chute && !rng.chance(0.35)) continue;
      const px = p.x + rx * edge * (tr.chute ? side : 1), pz = p.z + rz * edge * (tr.chute ? side : 1);
      const own = terrain.trailAt(px, pz);
      if (own.w > 0.2 && own.id !== tr.id) continue;
      if (!tr.chute && own.id !== tr.id) continue;
      const sc = tr.chute ? rng.range(1.2, 2.8) : rng.range(0.6, 1.1);
      rockArr.push(px, terrain.gridHeight(px, pz) - 0.35 * sc, pz, sc, rng.range(0, Math.PI * 2));
      obstacles.add({ x: px, z: pz, r: sc * 0.7, kind: 'rock' });
    }
  }

  progress?.('Ready', 1);
  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    def, terrain, trails, lifts, parks, rails, courses,
    trees: new Float32Array(treeArr), treeCount: treeArr.length / 5,
    rocks: new Float32Array(rockArr), rockCount: rockArr.length / 5,
    buildings, obstacles, zTop, zBase, base, genMs: t1 - t0,
  };
}

export async function buildResortAsync(def: ResortDef, progress?: (stage: string, f: number) => void): Promise<Resort> {
  progress?.('Surveying the mountain', 0.01);
  await new Promise((r) => setTimeout(r, 30));
  let last = 0;
  return buildResort(def, (s, f) => {
    progress?.(s, f);
    const now = Date.now();
    if (now - last > 0) last = now;
  });
}

function parkLabel(style: Park['style']): string {
  return { beginner: 'Learning Park', standard: 'Terrain Park', slopestyle: 'Slopestyle Park', bigair: 'Big Air', rails: 'Rail Plaza', superpipe: 'Superpipe', halfpipe: 'Halfpipe' }[style];
}

function lineXZ(ax: number, az: number, bx: number, bz: number, step: number): P2[] {
  const l = Math.hypot(bx - ax, bz - az);
  const n = Math.max(1, Math.ceil(l / step));
  const out: P2[] = [];
  for (let i = 0; i <= n; i++) out.push({ x: ax + ((bx - ax) * i) / n, z: az + ((bz - az) * i) / n });
  return out;
}


function distSeg(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const ex = bx - ax, ez = bz - az, l2 = ex * ex + ez * ez;
  const t = clamp(((px - ax) * ex + (pz - az) * ez) / l2, 0, 1);
  return Math.hypot(ax + ex * t - px, az + ez * t - pz);
}

function buildLift(terrain: Terrain, id: number, name: string, type: Lift['type'], bx: number, bz: number, tx: number, tz: number): Lift {
  const cableH = type === 'gondola' ? 14 : type === 'surface' ? 2.6 : 9;
  const stationH = type === 'surface' ? 2.2 : 4.2;
  const spacingT = type === 'gondola' ? 130 : type === 'surface' ? 45 : 75;
  const by = terrain.gridHeight(bx, bz), ty = terrain.gridHeight(tx, tz);
  const length = Math.hypot(tx - bx, tz - bz, ty - by);
  const horiz = Math.hypot(tx - bx, tz - bz);
  const n = Math.max(1, Math.round((horiz - 30) / spacingT));
  const towers: Lift['towers'] = [];
  towers.push({ x: bx, y: by, z: bz, h: stationH });
  for (let i = 1; i <= n; i++) {
    const f = (15 + ((horiz - 30) * i) / (n + 1)) / horiz;
    const x = bx + (tx - bx) * f, z = bz + (tz - bz) * f;
    towers.push({ x, y: terrain.gridHeight(x, z), z, h: cableH });
  }
  towers.push({ x: tx, y: ty, z: tz, h: stationH });
  // raise towers until the cable clears the snow everywhere (stations stay at load height)
  const minClear = type === 'surface' ? 1.6 : type === 'gondola' ? 8 : 5.5;
  for (let pass = 0; pass < 10; pass++) {
    let changed = false;
    for (let i = 0; i < towers.length - 1; i++) {
      const a = towers[i], b = towers[i + 1];
      const span = Math.hypot(b.x - a.x, b.z - a.z);
      let worst = 0, wf = 0.5;
      for (let f = 0.05; f < 0.97; f += 0.05) {
        const x = lerp(a.x, b.x, f), z = lerp(a.z, b.z, f);
        // near a station the cable may be low (loading), elsewhere it must clear
        const dStation = Math.min(i === 0 ? f * span : Infinity, i + 1 === towers.length - 1 ? (1 - f) * span : Infinity);
        const need = dStation < 18 ? Math.min(minClear, 2.4) : minClear;
        const cy = lerp(a.y + a.h, b.y + b.h, f) - Math.sin(f * Math.PI) * Math.min(1.5, span * 0.006);
        const short = terrain.gridHeight(x, z) + need - cy;
        if (short > worst) { worst = short; wf = f; }
      }
      if (worst > 0.01) {
        changed = true;
        const aFixed = i === 0, bFixed = i + 1 === towers.length - 1;
        if (aFixed && bFixed) {
          // single span between stations: add a tower where it's worst
          const x = lerp(a.x, b.x, wf), z = lerp(a.z, b.z, wf);
          towers.splice(i + 1, 0, { x, y: terrain.gridHeight(x, z), z, h: minClear + 2 });
          break;
        }
        if (aFixed) b.h = Math.min(60, b.h + worst / Math.max(0.15, wf));
        else if (bFixed) a.h = Math.min(60, a.h + worst / Math.max(0.15, 1 - wf));
        else { a.h = Math.min(60, a.h + worst); b.h = Math.min(60, b.h + worst); }
        if ((aFixed && b.h >= 60) || (bFixed && a.h >= 60) || (!aFixed && !bFixed && a.h >= 60)) {
          const x = lerp(a.x, b.x, wf), z = lerp(a.z, b.z, wf);
          towers.splice(i + 1, 0, { x, y: terrain.gridHeight(x, z), z, h: minClear + 2 });
          break;
        }
      }
    }
    if (!changed) break;
  }
  return {
    id, name, type,
    bottom: { x: bx, y: by, z: bz }, top: { x: tx, y: ty, z: tz },
    towers, length,
    speed: type === 'gondola' ? 6 : type === 'surface' ? 3.2 : 5,
    spacing: type === 'gondola' ? 55 : type === 'surface' ? 13 : 17,
    capacityLabel: type === 'gondola' ? '8-passenger gondola' : type === 'surface' ? 'Surface lift' : name.includes('Six') ? 'High-speed six' : name.includes('Quad') || name.includes('Express') ? 'Quad chair' : name.includes('Triple') ? 'Triple chair' : 'Double chair',
  };
}

/** Point along a trail centerline at arc length s, with direction. */
export function trailPoint(tr: Trail, s: number): { x: number; z: number; dx: number; dz: number; i: number } {
  const n = tr.pts.length;
  s = clamp(s, 0, tr.s[n - 1]);
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (tr.s[m] <= s) lo = m; else hi = m; }
  const a = tr.pts[lo], b = tr.pts[hi];
  const seg = tr.s[hi] - tr.s[lo] || 1;
  const t = (s - tr.s[lo]) / seg;
  const dx = (b.x - a.x) / seg, dz = (b.z - a.z) / seg;
  return { x: lerp(a.x, b.x, t), z: lerp(a.z, b.z, t), dx, dz, i: lo };
}

function buildPark(terrain: Terrain, park: Park, tr: Trail, rails: RailDef[], rng: Rng) {
  const fs: FeatureSet = terrain.features;
  const total = tr.s[tr.s.length - 1];
  const grade = tr.avgGrade;
  const add = (f: Feature) => { fs.add(f); park.featureIds.push(f.id); };
  const at = (s: number, v: number) => {
    const p = trailPoint(tr, s);
    return { x: p.x + -p.dz * v, z: p.z + p.dx * v, dx: p.dx, dz: p.dz };
  };
  const kicker = (s: number, v: number, size: Parameters<typeof makeKicker>[0], variant: Parameters<typeof makeKicker>[7] = 'table') => {
    const p = at(s, v);
    const f = makeKicker(size, park.id, p.x, p.z, p.dx, p.dz, grade, variant);
    if (s + f.len < total - 5) add(f);
    return f.len;
  };
  const rail = (s: number, v: number, kind: RailDef['kind'], len: number, h0: number) => {
    const p = at(s, v);
    if (s + len + 8 > total) return;
    if (h0 > 0.45) add(makeJibRamp(park.id, p.x - p.dx * h0 * 4, p.z - p.dz * h0 * 4, p.dx, p.dz, h0 - 0.08, kind === 'box' || kind === 'tube' ? 0.9 : 0.7));
    const pts: RailDef['pts'] = [];
    const segs = kind === 'rainbow' ? 10 : kind === 'kinked' ? 3 : kind === 'flatdown' ? 2 : 1;
    const ybase = terrain.baseHeight(p.x, p.z) + h0;
    for (let i = 0; i <= segs; i++) {
      const f = i / segs;
      const x = p.x + p.dx * len * f, z = p.z + p.dz * len * f;
      const ground = terrain.baseHeight(x, z);
      let y: number;
      if (kind === 'rainbow') y = ground + h0 + Math.sin(f * Math.PI) * 1.1;
      else if (kind === 'flatdown') y = i === 0 ? ybase : i === 1 ? Math.max(ground + h0, ybase - 0.15) : ground + h0;
      else if (kind === 'kinked') y = i === 1 ? ybase - 0.05 : i === 2 ? ground + h0 + 0.35 : ground + h0;
      else y = ground + h0;
      if (kind === 'flatdown' && i === 1) {
        const x1 = p.x + p.dx * len * 0.4, z1 = p.z + p.dz * len * 0.4;
        pts.push({ x: x1, y: ybase, z: z1 });
        continue;
      }
      pts.push({ x, y, z });
    }
    const hw = kind === 'box' ? 0.5 : kind === 'tube' ? 0.55 : 0.32;
    const name = { rail: 'Straight Rail', box: 'Box', tube: 'Tube', downrail: 'Down Rail', rainbow: 'Rainbow Rail', flatdown: 'Flat-Down Rail', kinked: 'Kinked Rail' }[kind];
    const r: RailDef = { id: rails.length, kind, name, pts, halfWidth: hw, parkId: park.id };
    rails.push(r);
    park.railIds.push(r.id);
  };
  switch (park.style) {
    case 'beginner': {
      kicker(30, -11, 'Small');
      rail(36, 11, 'box', 9, 0.35);
      add(makeRollers(park.id, at(70, -11).x, at(70, -11).z, tr.pts[0].x === 0 ? 0 : at(70, -11).dx, at(70, -11).dz, 3, 0.8, 7, 4));
      rail(84, 11, 'box', 10, 0.45);
      kicker(118, -11, 'Small');
      rail(140, 11, 'rail', 9, 0.4);
      kicker(170, -8, 'Small');
      rail(200, 10, 'tube', 8, 0.45);
      break;
    }
    case 'standard': {
      let s = 30;
      for (const size of ['Small', 'Medium', 'Medium', 'Large'] as const) s += kicker(s, -18, size) + 22;
      rail(30, 4, 'box', 10, 0.5);
      rail(70, 4, 'rail', 12, 0.7);
      rail(115, 4, 'downrail', 12, 0.7);
      rail(165, 4, 'rainbow', 11, 0.6);
      rail(215, 4, 'flatdown', 12, 0.75);
      add(makeQuarterpipe(park.id, at(Math.min(total - 26, 300), 20).x, at(Math.min(total - 26, 300), 20).z, at(300, 20).dx, at(300, 20).dz, 4.2, 6));
      rail(60, 22, 'tube', 9, 0.6);
      break;
    }
    case 'slopestyle': {
      // rail section across three lanes, then a jump line of growing size
      rail(28, -20, 'downrail', 13, 0.75);
      rail(28, 0, 'kinked', 14, 0.8);
      rail(28, 20, 'rainbow', 12, 0.7);
      rail(78, -18, 'box', 12, 0.55);
      rail(78, 18, 'flatdown', 13, 0.8);
      const wr = at(110, 0);
      add(makeQuarterpipe(park.id, wr.x + -wr.dz * 26, wr.z + wr.dx * 26, -(-wr.dz), -(wr.dx), 3.4, 9, 'Wall Ride', 'wallride'));
      let s = 135;
      for (const [size, variant] of [['Medium', 'table'], ['Large', 'stepdown'], ['XL', 'table'], ['XL', 'gap']] as const) {
        s += kicker(s, (rng.chance(0.5) ? -1 : 1) * 6, size, variant) + 26;
      }
      break;
    }
    case 'bigair': {
      kicker(40, -16, 'Medium');
      kicker(95, -16, 'Large', 'stepup');
      const s = Math.min(150, total - 120);
      kicker(s, 8, 'Massive');
      add(makeDrop(park.id, at(60, 20).x, at(60, 20).z, at(60, 20).dx, at(60, 20).dz, 3.5, 5, 'Natural Cliff Drop'));
      break;
    }
    case 'rails': {
      const kinds: RailDef['kind'][] = ['rail', 'box', 'downrail', 'flatdown', 'kinked', 'rainbow', 'tube', 'box', 'rail'];
      let k = 0;
      for (let s = 24; s < total - 40; s += 46) {
        for (const v of [-22, 0, 22]) {
          const kind = kinds[k++ % kinds.length];
          rail(s, v, kind, kind === 'box' ? 11 : 12, kind === 'box' || kind === 'tube' ? 0.5 : 0.75);
        }
      }
      const wr = at(Math.min(total - 40, 150), 0);
      add(makeQuarterpipe(park.id, wr.x + -wr.dz * 30, wr.z + wr.dx * 30, wr.dz, -wr.dx, 3.2, 8, 'Wall Ride', 'wallride'));
      break;
    }
    case 'superpipe':
    case 'halfpipe': {
      const sp = park.style === 'superpipe';
      const p0 = at(4, 0);
      const len = total - 14;
      add(makeHalfpipe(park.id, p0.x, p0.z, p0.dx, p0.dz, len, sp ? 6.6 : 4.6, sp ? 18 : 14, sp));
      break;
    }
  }
}

function buildCourse(terrain: Terrain, id: number, tr: Trail, disc: Discipline, resortIndex: number, rng: Rng): RaceCourse {
  const total = tr.s[tr.s.length - 1];
  const half = tr.width / 2;
  const spec: Record<Discipline, { spacing: number; offset: number; width: number; racers: number }> = {
    slalom: { spacing: 13, offset: 3.6, width: 4.5, racers: 6 },
    'giant-slalom': { spacing: 25, offset: 6, width: 6.5, racers: 6 },
    'super-g': { spacing: 40, offset: 8.5, width: 9, racers: 7 },
    downhill: { spacing: 60, offset: 6, width: 11, racers: 7 },
    'ski-cross': { spacing: 45, offset: 0, width: tr.width - 2, racers: 3 },
    freestyle: { spacing: 55, offset: 0, width: tr.width - 6, racers: 3 },
  };
  const sp = spec[disc];
  const startS = 10;
  const endS = total - 22;
  const gates: Gate[] = [];
  let k = 0;
  const offMax = Math.max(0, half - sp.width / 2 - 2.5);
  for (let s = startS + sp.spacing * (disc === 'slalom' ? 1.5 : 1); s < endS - sp.spacing * 0.5; s += sp.spacing * rng.range(0.92, 1.08)) {
    const p = trailPoint(tr, s);
    const off = Math.min(offMax, sp.offset) * (k % 2 === 0 ? 1 : -1) * rng.range(0.8, 1.1);
    gates.push({ x: p.x + -p.dz * off, z: p.z + p.dx * off, dx: p.dx, dz: p.dz, width: sp.width, color: k % 2 === 0 ? 'red' : 'blue', split: false, s });
    k++;
  }
  const nSplit = Math.min(3, Math.floor(gates.length / 4));
  for (let i = 1; i <= nSplit; i++) gates[Math.floor((gates.length * i) / (nSplit + 1))].split = true;
  const fp = trailPoint(tr, endS);
  const finish: Gate = { x: fp.x, z: fp.z, dx: fp.dx, dz: fp.dz, width: tr.width + 6, color: 'red', split: false, s: endS };
  const st = trailPoint(tr, startS - 6);

  if (disc === 'ski-cross' || disc === 'freestyle') {
    // features along the track: berms on tight turns, rollers and kickers on straights
    const fsx = terrain.features;
    const curv: number[] = [];
    for (let i = 0; i < tr.pts.length; i++) {
      const a = tr.pts[Math.max(0, i - 3)], b = tr.pts[i], c = tr.pts[Math.min(tr.pts.length - 1, i + 3)];
      const h1 = Math.atan2(b.x - a.x, b.z - a.z), h2 = Math.atan2(c.x - b.x, c.z - b.z);
      curv.push(wrapAngle(h2 - h1) / 18);
    }
    const busy = new Array(tr.pts.length).fill(false);
    if (disc === 'ski-cross') {
      let i = 8;
      while (i < tr.pts.length - 8) {
        if (Math.abs(curv[i]) > 1 / 70) {
          let j = i;
          while (j < tr.pts.length - 4 && Math.abs(curv[j]) > 1 / 110) j++;
          const sign = Math.sign(curv[i]);
          const a0 = Math.max(0, i - 3), a1 = Math.min(tr.pts.length - 1, j + 3);
          // turning left (heading increasing toward +x?) → the outside is the right side of travel
          const side = sign > 0 ? -1 : 1;
          fsx.add(makeBerm(-1, tr.pts.slice(a0, a1 + 1), side, half, 2.4));
          for (let q = a0; q <= a1; q++) busy[q] = true;
          i = j + 4;
        } else i++;
      }
    }
    let s = 70;
    let toggle = 0;
    while (s < endS - 60) {
      const p = trailPoint(tr, s);
      const span = Math.ceil(40 / 6);
      let free = true;
      for (let q = p.i; q < Math.min(tr.pts.length, p.i + span); q++) if (busy[q]) free = false;
      if (free) {
        if (disc === 'ski-cross') {
          if (toggle % 2 === 0) fsx.add(makeRollers(-1, p.x, p.z, p.dx, p.dz, 3, 1.0, 7.5, half - 1));
          else fsx.add(makeKicker(toggle % 4 === 1 ? 'Small' : 'Medium', -1, p.x, p.z, p.dx, p.dz, tr.avgGrade));
        } else {
          fsx.add(makeKicker(toggle % 3 === 0 ? 'Medium' : 'Large', -1, p.x, p.z, p.dx, p.dz, tr.avgGrade));
        }
        for (let q = p.i; q < Math.min(tr.pts.length, p.i + span); q++) busy[q] = true;
        toggle++;
        s += disc === 'ski-cross' ? 70 : 95;
      } else s += 12;
    }
  }

  return {
    id, name: tr.name, discipline: disc, trailId: tr.id, gates,
    start: { x: st.x, z: st.z, dx: st.dx, dz: st.dz }, finish,
    racers: sp.racers, level: resortIndex,
  };
}

function placeBuildings(terrain: Terrain, def: ResortDef, base: { x: number; z: number; r: number }, lifts: Lift[], trails: Trail[], out: Building[], rng: Rng) {
  out.push({ kind: 'lodge', x: base.x - 30, z: base.z + 40, rot: Math.PI, scale: def.village ? 1.4 : 1, label: `${def.name} Lodge` });
  const cabins = def.village ? 22 : 6;
  for (let i = 0; i < cabins; i++) {
    const a = (i / cabins) * Math.PI * 1.2 + Math.PI * 0.9 + rng.range(-0.1, 0.1);
    const r = base.r * rng.range(0.55, 0.95);
    const x = base.x + Math.cos(a) * r * 1.4, z = base.z + 60 + Math.abs(Math.sin(a)) * r * 0.45;
    if (terrain.trailAt(x, z).w > 0.1) continue;
    out.push({ kind: def.village ? 'village' : 'cabin', x, z, rot: rng.range(-0.4, 0.4) + Math.PI, scale: rng.range(0.85, 1.25) });
  }
  // a few cabins up the mountain beside green trails
  for (const tr of trails) {
    if (tr.kind !== 'trail' || tr.difficulty !== 'green' || !rng.chance(0.5)) continue;
    const i = Math.floor(tr.pts.length * rng.range(0.3, 0.7));
    const p = tr.pts[i], q = tr.pts[Math.min(tr.pts.length - 1, i + 1)];
    const l = Math.hypot(q.x - p.x, q.z - p.z) || 1;
    const off = tr.width / 2 + 14;
    out.push({ kind: 'cabin', x: p.x + (-(q.z - p.z) / l) * off, z: p.z + ((q.x - p.x) / l) * off, rot: Math.atan2(q.x - p.x, q.z - p.z), scale: 0.9 });
  }
  for (const l of lifts) {
    out.push({ kind: 'mapboard', x: l.top.x + 9, z: l.top.z + 10, rot: 0, scale: 1, label: l.name });
    if (l.type === 'gondola') out.push({ kind: 'hut', x: l.top.x - 22, z: l.top.z + 8, rot: 0, scale: 1.2, label: 'Summit Hut' });
  }
  for (const tr of trails) {
    if (tr.kind !== 'trail') continue;
    const p = tr.pts[Math.min(2, tr.pts.length - 1)], q = tr.pts[Math.min(3, tr.pts.length - 1)];
    const l = Math.hypot(q.x - p.x, q.z - p.z) || 1;
    const off = tr.width / 2 + 2;
    out.push({ kind: 'sign', x: p.x + (-(q.z - p.z) / l) * off, z: p.z + ((q.x - p.x) / l) * off, rot: Math.atan2(q.x - p.x, q.z - p.z), scale: 1, label: tr.name, difficulty: tr.difficulty });
    if (tr.groomed && (tr.difficulty === 'green' || tr.difficulty === 'blue')) {
      for (let i = 20; i < tr.pts.length - 10; i += 28) {
        const a = tr.pts[i], b = tr.pts[i + 1];
        const ll = Math.hypot(b.x - a.x, b.z - a.z) || 1;
        const side = i % 56 === 20 ? 1 : -1;
        const o = tr.width / 2 + 1.5;
        out.push({ kind: 'snowgun', x: a.x + side * (-(b.z - a.z) / ll) * o, z: a.z + side * ((b.x - a.x) / ll) * o, rot: Math.atan2(b.x - a.x, b.z - a.z) + side * 1.2, scale: 1 });
      }
    }
  }
}
