/**
 * Small vector + numeric helpers used by the headless engine (no Three.js here so the
 * engine runs identically in the browser, in Node scripts and in tests).
 *
 * FIELD COORDINATES (feet): home plate (back tip) at the origin, +z toward center field,
 * +x toward the first-base side, +y up. The pitcher's rubber is at z = 60.5.
 */
export interface V2 { x: number; z: number }
export interface V3 { x: number; y: number; z: number }

export const v3 = (x = 0, y = 0, z = 0): V3 => ({ x, y, z });
export const copy3 = (a: V3): V3 => ({ x: a.x, y: a.y, z: a.z });
export const add3 = (a: V3, b: V3): V3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const sub3 = (a: V3, b: V3): V3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const scale3 = (a: V3, s: number): V3 => ({ x: a.x * s, y: a.y * s, z: a.z * s });
export const len3 = (a: V3): number => Math.hypot(a.x, a.y, a.z);
export const cross3 = (a: V3, b: V3): V3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
export const norm3 = (a: V3): V3 => { const l = len3(a) || 1; return { x: a.x / l, y: a.y / l, z: a.z / l }; };

export const dist2 = (ax: number, az: number, bx: number, bz: number): number => Math.hypot(ax - bx, az - bz);

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smooth = (t: number): number => t * t * (3 - 2 * t);
export const DEG = Math.PI / 180;
export const MPH = 1.46667; // mph -> ft/s
export const G = 32.174; // ft/s^2

/** Spray angle (deg) of a ground point: 0 = straight to CF, -45 = LF line, +45 = RF line. */
export const sprayAngle = (x: number, z: number): number => Math.atan2(x, z) / DEG;

/** Seeded RNG (mulberry32) so tests and replays can be reproducible. */
export class Rng {
  private s: number;
  constructor(seed = (Math.random() * 2 ** 32) >>> 0) { this.s = seed >>> 0; }
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a: number, b: number): number { return a + (b - a) * this.next(); }
  chance(p: number): boolean { return this.next() < p; }
  /** Standard normal sample (Box–Muller). */
  gauss(sd = 1, mean = 0): number {
    const u = Math.max(1e-9, this.next());
    const v = this.next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  pick<T>(arr: readonly T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  /** Weighted pick: weights need not sum to 1. */
  weighted<T>(items: readonly T[], weights: readonly number[]): T {
    let total = 0;
    for (const w of weights) total += Math.max(0, w);
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, weights[i]);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }
}

export const rng = new Rng();
