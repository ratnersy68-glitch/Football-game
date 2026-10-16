/**
 * AI racer driver. The AI produces exactly the SkierInput a human would and rides the
 * real physics. It follows a racing line (Catmull-Rom through the gate centres) with
 * pure pursuit, and a speed plan built from the line's turn curvature, terrain
 * rollovers (so it doesn't launch) and a backward braking pass. Skill scales grip
 * usage, speed cap and reaction; random mistakes are injected for lower skills.
 */
import { Rng } from '../core/rng';
import { clamp, wrapAngle } from '../core/math';
import { NO_INPUT, type Skier, type SkierInput } from '../physics/skier';
import type { Gate, RaceCourse } from '../world/types';
import type { ObstacleIndex } from '../world/resortBuilder';

export const AI_LEVELS = [
  { name: 'Beginner', skill: 0.45 },
  { name: 'Amateur', skill: 0.58 },
  { name: 'Intermediate', skill: 0.7 },
  { name: 'Pro', skill: 0.82 },
  { name: 'Elite', skill: 0.92 },
  { name: 'World Class', skill: 1.0 },
] as const;

const BASE_LAT = 10;

export class RacingLine {
  readonly x: number[] = [];
  readonly z: number[] = [];
  readonly vmax: number[] = [];
  readonly ds = 2.5;

  constructor(course: RaceCourse, heightAt: (x: number, z: number) => number) {
    const ctrl: { x: number; z: number }[] = [];
    const st = course.start;
    ctrl.push({ x: st.x - st.dx * 5, z: st.z - st.dz * 5 }, { x: st.x, z: st.z });
    for (const g of course.gates) ctrl.push({ x: g.x, z: g.z });
    const f = course.finish;
    ctrl.push({ x: f.x, z: f.z }, { x: f.x + f.dx * 25, z: f.z + f.dz * 25 }, { x: f.x + f.dx * 50, z: f.z + f.dz * 50 });
    for (let i = 1; i < ctrl.length - 2; i++) {
      const p0 = ctrl[i - 1], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[i + 2];
      const len = Math.hypot(p2.x - p1.x, p2.z - p1.z);
      const n = Math.max(1, Math.round(len / this.ds));
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        this.x.push(cr(p0.x, p1.x, p2.x, p3.x));
        this.z.push(cr(p0.z, p1.z, p2.z, p3.z));
      }
    }
    const N = this.x.length;
    const h = this.x.map((x, i) => heightAt(x, this.z[i]));
    for (let i = 0; i < N; i++) {
      const a = Math.max(0, i - 2), b = Math.min(N - 1, i + 2);
      let k = 0;
      if (b > i && i > a) {
        const h1 = Math.atan2(this.x[i] - this.x[a], this.z[i] - this.z[a]);
        const h2 = Math.atan2(this.x[b] - this.x[i], this.z[b] - this.z[i]);
        const d = Math.hypot(this.x[b] - this.x[a], this.z[b] - this.z[a]) / 2;
        k = Math.abs(wrapAngle(h2 - h1)) / Math.max(1, d);
      }
      let v = Math.sqrt(BASE_LAT / Math.max(k, 1e-4));
      // rollovers: vertical convexity over ~10 m
      const c0 = Math.max(0, i - 4), c1 = Math.min(N - 1, i + 4);
      if (c1 - i === 4 && i - c0 === 4) {
        const kv = (2 * h[i] - h[c0] - h[c1]) / Math.pow(4 * this.ds, 2);
        if (kv > 0) v = Math.min(v, Math.sqrt((9.81 * 0.8) / kv));
      }
      this.vmax.push(Math.min(60, v));
    }
    for (let i = N - 2; i >= 0; i--) {
      const grade = (h[i] - h[i + 1]) / this.ds;
      const decel = clamp(2.8 + 0.13 * this.vmax[i + 1] - 9.81 * grade, 0.8, 6);
      this.vmax[i] = Math.min(this.vmax[i], Math.sqrt(this.vmax[i + 1] ** 2 + 2 * decel * this.ds));
    }
  }

  nearest(x: number, z: number, hint: number): number {
    const N = this.x.length;
    let best = hint, bd = Infinity;
    for (let i = Math.max(0, hint - 20); i < Math.min(N, hint + 60); i++) {
      const d = (this.x[i] - x) ** 2 + (this.z[i] - z) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
}

export class RacerAI {
  private rng: Rng;
  private mistakeT = 0;
  private mistakeSteer = 0;
  private prevErr = 0;
  private stuckT = 0;
  private trickT = 0;
  private trickDir = 1;
  private unstickSide = 0;
  private idx = 0;
  tricks = false;
  laneOffset = 0;
  line: RacingLine | null = null;

  constructor(public skill: number, seed: number) {
    this.rng = new Rng(seed);
  }

  /** Called after a hike-back so the line search restarts near the racer. */
  resync(x: number, z: number) {
    if (!this.line) return;
    let best = 0, bd = Infinity;
    for (let i = 0; i < this.line.x.length; i++) {
      const d = (this.line.x[i] - x) ** 2 + (this.line.z[i] - z) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    this.idx = best;
    this.stuckT = 0;
  }

  drive(s: Skier, gates: Gate[], next: number, dt: number, others: { x: number; z: number }[] = [], obstacles?: ObstacleIndex): SkierInput {
    const inp: SkierInput = { ...NO_INPUT };
    if (s.state === 'crashed' || s.state === 'recover' || s.state === 'hold') return inp;
    const L = this.line;
    const sp = s.speed;
    if (!L) return inp;
    const N = L.x.length;
    this.idx = L.nearest(s.pos.x, s.pos.z, this.idx);
    // never aim far past the next gate we still owe
    const g = gates[Math.min(next, gates.length - 1)];
    const look = Math.round((3 + sp * (0.2 + 0.06 * this.skill)) / L.ds);
    let ti = Math.min(N - 1, this.idx + look);
    const gi = L.nearest(g.x, g.z, this.idx);
    if (gi > this.idx && ti > gi + 2) ti = gi + 2;
    // lane offset (ski cross) along the line normal
    const tx2 = L.x[Math.min(N - 1, ti + 1)] - L.x[Math.max(0, ti - 1)], tz2 = L.z[Math.min(N - 1, ti + 1)] - L.z[Math.max(0, ti - 1)];
    const tl = Math.hypot(tx2, tz2) || 1;
    let ax = L.x[ti] + (-tz2 / tl) * this.laneOffset, az = L.z[ti] + (tx2 / tl) * this.laneOffset;

    if (s.state === 'air') {
      if (this.tricks && s.airTime > 0.15 && s.vel.y > -2 && this.trickT <= 0 && this.rng.chance(dt * 3 * this.skill)) {
        this.trickT = 0.25 + this.rng.next() * 0.5 * this.skill; this.trickDir = this.rng.chance(0.5) ? 1 : -1;
      }
      if (this.trickT > 0) { this.trickT -= dt; inp.spin = this.trickDir; inp.grab = 2; }
      const want = Math.atan2(ax - s.pos.x, az - s.pos.z);
      inp.steer = clamp(-wrapAngle(want - Math.atan2(s.vel.x, s.vel.z)) * 3, -1, 1);
      return inp;
    }
    // racers just ahead: pass on the other side
    for (const o of others) {
      const ox = o.x - s.pos.x, oz = o.z - s.pos.z;
      const d = Math.hypot(ox, oz);
      if (d > 0.1 && d < 7 && sp > 1) {
        const ahead = (ox * s.vel.x + oz * s.vel.z) / (sp * d);
        if (ahead > 0.7) { const side = (ox * -s.vel.z + oz * s.vel.x) > 0 ? -1 : 1; ax += (-s.vel.z / sp) * side * 2.2; az += (s.vel.x / sp) * side * 2.2; }
      }
    }
    if (obstacles) {
      const hx = sp > 1 ? s.vel.x / sp : Math.sin(s.yaw), hz = sp > 1 ? s.vel.z / sp : Math.cos(s.yaw);
      for (const d of [3, 7, 12]) {
        const o = obstacles.hit(s.pos.x + hx * d, s.pos.z + hz * d, 0.9);
        if (o) {
          const side = (o.x - s.pos.x) * -hz + (o.z - s.pos.z) * hx > 0 ? -1 : 1;
          ax = s.pos.x + hx * (d + 4) + -hz * side * (o.r + 2.5);
          az = s.pos.z + hz * (d + 4) + hx * side * (o.r + 2.5);
          break;
        }
      }
    }
    if (this.stuckT > 1.5) {
      this.unstickSide = this.unstickSide || (this.rng.chance(0.5) ? 1 : -1);
      ax = s.pos.x + Math.sin(s.yaw + this.unstickSide * 1.2) * 6;
      az = s.pos.z + Math.cos(s.yaw + this.unstickSide * 1.2) * 6;
    } else this.unstickSide = 0;

    const want = Math.atan2(ax - s.pos.x, az - s.pos.z);
    const cur = sp > 2 ? Math.atan2(s.vel.x, s.vel.z) : s.yaw;
    const err = wrapAngle(want - cur);
    const derr = (err - this.prevErr) / Math.max(dt, 1e-3);
    this.prevErr = err;
    let steer = -(err * (2.8 + 1.6 * this.skill) + derr * 0.1);
    if (this.mistakeT > 0) { this.mistakeT -= dt; steer += this.mistakeSteer; }
    else if (this.rng.chance(dt * (1 - this.skill) * 0.3)) { this.mistakeT = 0.25 + this.rng.next() * 0.5; this.mistakeSteer = (this.rng.next() - 0.5) * 1.4; }
    inp.steer = clamp(steer, -1, 1);
    inp.carve = this.skill > 0.55 || Math.abs(err) < 0.3;
    // speed plan
    const grip = (0.72 + 0.3 * this.skill) * Math.sqrt(s.gear.carving + 0.5) / Math.sqrt(1.3);
    const cap = 15 + 33 * this.skill * this.skill;
    let vPlan = Math.min(cap, L.vmax[Math.min(N - 1, this.idx + 3)] * grip);
    const off = Math.hypot(L.x[this.idx] - s.pos.x, L.z[this.idx] - s.pos.z);
    if (off > 8) vPlan = Math.min(vPlan, 14);
    if (sp > vPlan * 1.04 || Math.abs(err) > 1.1) inp.brake = sp > 4;
    else if (Math.abs(err) < 0.2 && sp < vPlan * 0.97) inp.tuck = true;
    if (sp < 0.8) this.stuckT += dt; else this.stuckT = 0;
    if (sp < 5 && !inp.brake) inp.tuck = true;
    return inp;
  }

  get stuck() { return this.stuckT; }
}
