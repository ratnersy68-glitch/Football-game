/**
 * BallPhysics: batted/thrown ball flight with drag, Magnus lift (backspin / sidespin), wind,
 * air density from temperature + altitude, ground bounces/rolling, and stadium wall collisions.
 * Pure TypeScript, deterministic, used both live and for landing-point prediction.
 */
import type { Conditions, Stadium } from '../core/types';
import { G, MPH, sprayAngle, type V3 } from '../core/math';
import { wallDistance, wallHeight } from '../data/stadiums';

export const BALL_R = 0.121; // ft
const K = 0.005473; // 0.5 * rho * A / m at sea level, standard temp (1/ft)
const CD = 0.37;
const CL_SCALE = 0.62;

export interface BallEnv {
  rho: number; // air density factor relative to sea level at 70°F
  wind: V3; // ft/s
  stadium: Stadium;
}

export function makeEnv(stadium: Stadium, cond: Conditions): BallEnv {
  const altitude = Math.exp(-stadium.altitude / 27000);
  const temp = (459.67 + 70) / (459.67 + cond.temperature);
  const rain = cond.weather === 'Light Rain' ? 1.015 : 1;
  const indoors = stadium.roof === 'dome';
  const w = indoors ? 0 : cond.windMph * MPH;
  const rad = (cond.windDir * Math.PI) / 180;
  return { rho: altitude * temp * rain, wind: { x: Math.sin(rad) * w, y: 0, z: Math.cos(rad) * w }, stadium };
}

export interface BallState {
  p: V3;
  v: V3;
  backspin: number; // rpm (negative = topspin)
  sidespin: number; // rpm (+ curves toward the right of travel)
  rolling: boolean;
  bounces: number;
  stopped: boolean;
}

export type BallEvent = 'bounce' | 'wall' | 'homerun' | 'outofplay' | 'stopped' | null;

const spinFactor = (rpm: number, speed: number) => {
  const s = (BALL_R * Math.abs(rpm) * 2 * Math.PI) / 60 / Math.max(20, speed);
  return (CL_SCALE * s) / (2.32 * s + 0.4);
};

export function isDirt(x: number, z: number, st: Stadium): boolean {
  const dm = Math.hypot(x, z - 60.5);
  if (dm < 95 && z > -10) {
    // Inner grass diamond (inside the base paths) is grass.
    const u = (x + z) / Math.SQRT2;
    const w = (z - x) / Math.SQRT2;
    const inGrass = u > 6 && w > 6 && u < 84 && w < 84 && Math.hypot(x, z - 60.5) > 9;
    return !inGrass;
  }
  const a = sprayAngle(x, z);
  const r = Math.hypot(x, z);
  if (Math.abs(a) <= 45 && r > wallDistance(st, a) - 15) return true; // warning track
  return false;
}

/** Advance the ball one step. Returns an event when something notable happens. */
export function stepBall(b: BallState, dt: number, env: BallEnv): BallEvent {
  if (b.stopped) return null;
  const st = env.stadium;
  let event: BallEvent = null;
  if (!b.rolling) {
    const vr = { x: b.v.x - env.wind.x * Math.min(1, b.p.y / 20), y: b.v.y, z: b.v.z - env.wind.z * Math.min(1, b.p.y / 20) };
    const sp = Math.hypot(vr.x, vr.y, vr.z) || 1;
    const k = K * env.rho;
    // Drag
    let ax = -k * CD * sp * vr.x;
    let ay = -k * CD * sp * vr.y - G;
    let az = -k * CD * sp * vr.z;
    // Magnus: backspin lifts perpendicular to velocity (toward +y); sidespin curves horizontally.
    const ux = vr.x / sp, uy = vr.y / sp, uz = vr.z / sp;
    let lx = -uy * ux, ly = 1 - uy * uy, lz = -uy * uz;
    const ll = Math.hypot(lx, ly, lz) || 1;
    lx /= ll; ly /= ll; lz /= ll;
    const lift = k * spinFactor(b.backspin, sp) * sp * sp * Math.sign(b.backspin);
    ax += lx * lift; ay += ly * lift; az += lz * lift;
    const hl = Math.hypot(ux, uz) || 1;
    const sx = uz / hl, sz = -ux / hl;
    const side = k * spinFactor(b.sidespin, sp) * sp * sp * Math.sign(b.sidespin);
    ax += sx * side; az += sz * side;
    b.v.x += ax * dt; b.v.y += ay * dt; b.v.z += az * dt;
    b.p.x += b.v.x * dt; b.p.y += b.v.y * dt; b.p.z += b.v.z * dt;
    const decay = Math.exp(-dt / 30);
    b.backspin *= decay; b.sidespin *= decay;
    if (b.p.y <= BALL_R && b.v.y < 0) {
      b.p.y = BALL_R;
      const dirt = isDirt(b.p.x, b.p.z, st);
      if (Math.abs(b.v.y) > 5) {
        const cor = dirt ? 0.48 : 0.4;
        b.v.y = -b.v.y * cor;
        const fr = dirt ? 0.8 : 0.72;
        b.v.x *= fr; b.v.z *= fr;
        b.backspin *= 0.2; b.sidespin *= 0.2;
        b.bounces++;
        event = 'bounce';
      } else {
        b.v.y = 0;
        b.rolling = true;
        b.backspin = 0; b.sidespin = 0;
        b.bounces++;
        event = 'bounce';
      }
    }
  } else {
    const sp = Math.hypot(b.v.x, b.v.z);
    const dirt = isDirt(b.p.x, b.p.z, st);
    const decel = (dirt ? 9 : 12) + sp * 0.06;
    if (sp <= decel * dt) {
      b.v.x = 0; b.v.z = 0;
      b.stopped = true;
      event = 'stopped';
    } else {
      b.v.x -= (b.v.x / sp) * decel * dt;
      b.v.z -= (b.v.z / sp) * decel * dt;
    }
    b.p.x += b.v.x * dt; b.p.z += b.v.z * dt;
    b.p.y = BALL_R;
  }

  // ----- Boundaries -----
  const r = Math.hypot(b.p.x, b.p.z);
  const a = sprayAngle(b.p.x, b.p.z);
  if (Math.abs(a) <= 45 && b.p.z > 0) {
    const W = wallDistance(st, a);
    if (r >= W - BALL_R) {
      const h = wallHeight(st, a);
      if (b.p.y > h) {
        return 'homerun';
      }
      // Carom off the wall.
      const ux = b.p.x / r, uz = b.p.z / r;
      const vr = b.v.x * ux + b.v.z * uz;
      if (vr > 0) {
        b.v.x -= 1.4 * vr * ux;
        b.v.z -= 1.4 * vr * uz;
        b.v.x *= 0.85; b.v.z *= 0.85;
        b.v.y *= 0.8;
      }
      const back = W - BALL_R - 0.2;
      b.p.x = ux * back; b.p.z = uz * back;
      return 'wall';
    }
  } else {
    // Foul territory: stands parallel to the lines and the backstop behind home.
    const dRight = (b.p.x - b.p.z) * Math.SQRT1_2; // > 0 beyond the RF line
    const dLeft = (-b.p.x - b.p.z) * Math.SQRT1_2;
    const d = Math.max(dRight, dLeft);
    const behind = b.p.z < 0 && r > st.backstop;
    if (d > st.foulWidth || behind) {
      if (b.p.y > 4 || r > 420) return 'outofplay';
      // Bounce off the short wall.
      b.v.x *= -0.3; b.v.z *= -0.3;
      b.p.x *= 0.995; b.p.z *= 0.995;
      return 'wall';
    }
  }
  return event;
}

export interface PathSample { t: number; x: number; y: number; z: number; rolling: boolean; event: BallEvent }

/** Predict the ball's path (no fielders) for landing indicators and fielder routing. */
export function predictPath(b0: BallState, env: BallEnv, maxT = 9, step = 1 / 60): PathSample[] {
  const b: BallState = { ...b0, p: { ...b0.p }, v: { ...b0.v } };
  const out: PathSample[] = [{ t: 0, x: b.p.x, y: b.p.y, z: b.p.z, rolling: b.rolling, event: null }];
  let t = 0;
  const sub = 4;
  while (t < maxT) {
    let ev: BallEvent = null;
    for (let i = 0; i < sub; i++) {
      const e = stepBall(b, step / sub, env);
      if (e && !ev) ev = e;
      if (e === 'homerun' || e === 'outofplay') break;
    }
    t += step;
    out.push({ t, x: b.p.x, y: b.p.y, z: b.p.z, rolling: b.rolling, event: ev });
    if (ev === 'homerun' || ev === 'outofplay' || b.stopped) break;
  }
  return out;
}

/** First point where the ball comes down to catchable height / the ground. */
export function firstLanding(path: PathSample[]): PathSample | null {
  for (let i = 1; i < path.length; i++) {
    if (path[i].event === 'bounce' || path[i].event === 'homerun' || path[i].event === 'outofplay') return path[i];
  }
  return null;
}

/** Batted ball from exit velocity (mph), launch angle (deg), spray (deg). */
export function battedBall(start: V3, evMph: number, laDeg: number, sprayDeg: number, backspin: number, sidespin: number): BallState {
  const s = evMph * MPH;
  const la = (laDeg * Math.PI) / 180;
  const sp = (sprayDeg * Math.PI) / 180;
  return {
    p: { ...start },
    v: { x: s * Math.cos(la) * Math.sin(sp), y: s * Math.sin(la), z: s * Math.cos(la) * Math.cos(sp) },
    backspin,
    sidespin,
    rolling: false,
    bounces: 0,
    stopped: false,
  };
}
