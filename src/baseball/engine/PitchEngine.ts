/**
 * PitchEngine: turns (pitcher, pitch type, intended target, meter accuracy) into a physical
 * trajectory. Movement is modelled as a deviation that grows like (t/T)^late so breaking
 * balls visibly "break" late, changeups arrive later than a fastball from the same release.
 */
import type { PitchCode, Player } from '../core/types';
import { G, MPH, Rng, clamp, type V3 } from '../core/math';
import { PITCHES } from '../data/pitchTypes';

export const PLATE_Z = 0.71; // the plate plane used for balls/strikes (middle of the plate)
export const CONTACT_Z = 1.4; // where the bat meets the ball (front of the plate)
export const CATCHER_Z = -2.4;
export const ZONE = { halfWidth: 0.708 + 0.121, bottom: 1.55 - 0.121, top: 3.45 + 0.121 };
export const ZONE_CENTER_Y = (1.55 + 3.45) / 2;

export interface PitchFlight {
  code: PitchCode;
  mph: number;
  release: V3;
  v0: V3;
  az: number; // drag deceleration along z
  dev: V3; // total break deviation at plate (ft)
  late: number;
  T: number; // flight time to PLATE_Z
  target: { x: number; y: number };
  plate: { x: number; y: number }; // actual location at the plate
  isStrike: boolean;
  hitsBatter: boolean;
  wild: boolean; // badly located (in the dirt / way outside): catcher may not hold it
}

export const armSign = (p: Player) => (p.throws === 'R' ? -1 : 1);

export function pitchPos(f: PitchFlight, t: number): V3 {
  const k = Math.pow(Math.max(0, t) / f.T, f.late);
  return {
    x: f.release.x + f.v0.x * t + f.dev.x * k,
    y: f.release.y + f.v0.y * t - 0.5 * G * t * t + f.dev.y * k,
    z: f.release.z + f.v0.z * t + 0.5 * f.az * t * t,
  };
}

/** Time at which the pitch crosses a given z plane. */
export function timeAtZ(f: PitchFlight, z: number): number {
  // z(t) = rz + vz t + 0.5 az t^2
  const a = 0.5 * f.az, b = f.v0.z, c = f.release.z - z;
  if (Math.abs(a) < 1e-9) return -c / b;
  const disc = b * b - 4 * a * c;
  const s = Math.sqrt(Math.max(0, disc));
  const t1 = (-b - s) / (2 * a), t2 = (-b + s) / (2 * a);
  const ts = [t1, t2].filter((t) => t > 0).sort((x, y) => x - y);
  return ts[0] ?? f.T;
}

export function isInZone(x: number, y: number): boolean {
  return Math.abs(x) <= ZONE.halfWidth && y >= ZONE.bottom && y <= ZONE.top;
}

export interface PitchCommand {
  code: PitchCode;
  target: { x: number; y: number };
  /** Meter result: 0 = perfect. Negative = early release, positive = late. |1| = worst. */
  meterError: number;
}

/** Velocity and break penalties as a pitcher tires. fatigue: 0 fresh .. 1+ exhausted */
export function createPitch(pitcher: Player, batterBats: 'L' | 'R', cmd: PitchCommand, fatigue: number, rng: Rng): PitchFlight {
  const pr = pitcher.pitcher!;
  const shape = PITCHES[cmd.code];
  const sign = armSign(pitcher);
  const tired = clamp(fatigue - 0.6, 0, 1); // fatigue only bites late
  const mph = pr.velocity * shape.speed - tired * 4 + rng.gauss(0.6);
  const speed = mph * MPH;

  const release: V3 = { x: sign * 1.75, y: 5.9 - (cmd.code === 'SI' ? 0.2 : 0), z: 54.0 };
  const dist = release.z - PLATE_Z;
  const T = dist / (0.95 * speed);
  const vz = -dist / (0.95 * T);
  const az = (-0.1 * vz) / T;

  // Movement (ft). Breaking-ball movement scales with the break rating.
  const brk = shape.fastball ? 0.85 + pr.break / 330 : 0.68 + pr.break / 160;
  const fatigueBreak = 1 - tired * 0.25;
  const dev: V3 = {
    x: ((shape.hb * sign) / 12) * brk * fatigueBreak * (1 + rng.gauss(0.06)),
    y: (shape.ivb / 12) * brk * fatigueBreak * (1 + rng.gauss(0.06)),
    z: 0,
  };

  // Command: scatter grows with poor control, fatigue, and a bad meter.
  const ctl = pr.control / 100;
  const baseSd = (0.09 + (1 - ctl) * 0.24) * (1 + tired * 1.3);
  const m = clamp(cmd.meterError, -1.2, 1.2);
  let px = cmd.target.x + rng.gauss(baseSd);
  let py = cmd.target.y + rng.gauss(baseSd);
  const miss = Math.abs(m) * (1.15 - ctl * 0.45);
  if (m < 0) {
    // Early release: pitch sails up and arm-side (mistakes "hang").
    py += miss * 1.0;
    px += sign * miss * 0.45;
  } else if (m > 0) {
    // Late release: yanked down and glove-side, into the dirt.
    py -= miss * 1.2;
    px -= sign * miss * 0.35;
  }
  px = clamp(px, -4.2, 4.2);
  py = clamp(py, -0.6, 6.5);

  const v0: V3 = {
    x: (px - release.x - dev.x) / T,
    y: (py - release.y + 0.5 * G * T * T - dev.y) / T,
    z: vz,
  };

  const batterSide = batterBats === 'R' ? -1 : 1;
  const hitsBatter = px * batterSide > 1.95 && py > 0.4 && py < 5.6;
  return {
    code: cmd.code,
    mph,
    release,
    v0,
    az,
    dev,
    late: shape.late,
    T,
    target: { ...cmd.target },
    plate: { x: px, y: py },
    isStrike: isInZone(px, py),
    hitsBatter,
    wild: py < 0.55 || Math.abs(px) > 2.6 || py > 5.4,
  };
}
