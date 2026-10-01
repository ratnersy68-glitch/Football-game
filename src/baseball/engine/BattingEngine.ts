/**
 * BattingEngine: resolves a swing against a pitch. Nothing here is a dice roll for "hit or out":
 * PCI placement vs the ball's real position at the contact plane + swing timing produce a
 * contact quality, which becomes exit velocity, launch angle, spray and spin. The ball physics
 * then decides what happens.
 */
import type { Player } from '../core/types';
import { Rng, clamp } from '../core/math';
import { PITCHES } from '../data/pitchTypes';
import { CONTACT_Z, pitchPos, timeAtZ, type PitchFlight } from './PitchEngine';

export type SwingType = 'normal' | 'power' | 'contact';
export type TimingLabel = 'VERY EARLY' | 'EARLY' | 'GOOD' | 'PERFECT' | 'LATE' | 'VERY LATE';
export type ContactLabel = 'MISS' | 'FOUL' | 'WEAK' | 'OKAY' | 'GOOD' | 'BARRELED' | 'PERFECT-PERFECT';

/** Seconds from button press until the bat reaches the hitting zone. */
export const SWING_LAG = 0.14;

export interface SwingInput {
  type: SwingType;
  pci: { x: number; y: number };
  pressTime: number; // pitch clock time (s after release)
}

export interface SwingMods {
  timing: number; // multiplies timing windows
  pci: number; // multiplies PCI size
}

export interface ContactResult {
  contact: boolean;
  timing: TimingLabel;
  timingMs: number; // negative = early
  label: ContactLabel;
  quality: number;
  ev: number;
  la: number;
  spray: number;
  backspin: number;
  sidespin: number;
  contactPoint: { x: number; y: number; z: number };
  pciDist: number;
}

export function battingSide(batter: Player, pitcher: Player): 'L' | 'R' {
  if (batter.bats === 'S') return pitcher.throws === 'R' ? 'L' : 'R';
  return batter.bats;
}

export function pciRadius(batter: Player, type: SwingType, mods: SwingMods): number {
  const vision = batter.ratings.vision;
  const t = type === 'contact' ? 1.25 : type === 'power' ? 0.78 : 1;
  return 0.29 * (0.72 + vision / 180) * t * mods.pci;
}

export function timingWindows(batter: Player, pitcher: Player, type: SwingType, mods: SwingMods) {
  const con = pitcher.throws === 'R' ? batter.ratings.contactR : batter.ratings.contactL;
  const t = type === 'contact' ? 1.2 : type === 'power' ? 0.85 : 1;
  const k = (0.78 + con / 240) * t * mods.timing;
  return { perfect: 0.011 * k, good: 0.026 * k, ok: 0.048 * k, very: 0.075 * k, max: 0.1 * k };
}

export function resolveSwing(batter: Player, pitcher: Player, flight: PitchFlight, swing: SwingInput, mods: SwingMods, rng: Rng): ContactResult {
  const side = battingSide(batter, pitcher);
  const tc = timeAtZ(flight, CONTACT_Z);
  const contactTime = swing.pressTime + SWING_LAG;
  const dt = contactTime - tc; // < 0 early
  const w = timingWindows(batter, pitcher, swing.type, mods);
  const adt = Math.abs(dt);
  let timing: TimingLabel;
  if (adt <= w.perfect) timing = 'PERFECT';
  else if (adt <= w.good) timing = 'GOOD';
  else if (adt <= w.ok) timing = dt < 0 ? 'EARLY' : 'LATE';
  else timing = dt < 0 ? 'VERY EARLY' : 'VERY LATE';

  // Where is the ball when the bat arrives? (Early swings meet it further out, late ones deeper.)
  const ball = pitchPos(flight, clamp(contactTime, 0, flight.T * 1.2));
  const ballAtPlane = pitchPos(flight, tc);
  const R = pciRadius(batter, swing.type, mods);
  const dx = ballAtPlane.x - swing.pci.x;
  const dy = ballAtPlane.y - swing.pci.y;
  const dist = Math.hypot(dx, dy);
  const reach = R + 0.121;

  const base: ContactResult = {
    contact: false, timing, timingMs: dt * 1000, label: 'MISS', quality: 0, ev: 0, la: 0, spray: 0,
    backspin: 0, sidespin: 0, contactPoint: { x: ball.x, y: ball.y, z: ball.z }, pciDist: dist,
  };
  if (dist > reach || adt > w.max) return base;

  const qLoc = clamp(1 - dist / reach, 0, 1);
  const qTime = adt <= w.perfect ? 1 : clamp(1 - ((adt - w.perfect) / (w.max - w.perfect)) * 0.85, 0, 1);
  const q = Math.pow(qLoc, 0.85) * qTime;

  let label: ContactLabel;
  if (q < 0.12 || (q < 0.24 && rng.chance(0.55))) label = 'FOUL';
  else if (q < 0.3) label = 'WEAK';
  else if (q < 0.5) label = 'OKAY';
  else if (q < 0.72) label = 'GOOD';
  else if (timing === 'PERFECT' && qLoc > 0.82) label = 'PERFECT-PERFECT';
  else label = 'BARRELED';

  const pow = pitcher.throws === 'R' ? batter.ratings.powerR : batter.ratings.powerL;
  const maxEv = 99 + pow * 0.17 + (swing.type === 'power' ? 3.5 : swing.type === 'contact' ? -5 : 0);
  const shape = PITCHES[flight.code];
  let ev = 50 + (maxEv - 50) * Math.pow(q, 0.5) + (flight.mph - 90) * 0.18 + rng.gauss(1.4);
  if (label === 'PERFECT-PERFECT') ev += 2;
  ev = clamp(ev, 30, 121);

  // Launch angle: ball above the PCI centre = bat under the ball = more loft.
  const vo = dy / R;
  let la = 11 + vo * 36 + (swing.type === 'power' ? 4 : swing.type === 'contact' ? -3 : 0) + rng.gauss(4 + (1 - q) * 6);
  if (flight.code === 'SI' || flight.code === 'FT') la -= 4;
  if (flight.code === 'FF' && flight.plate.y > 3.2) la += 3;
  if (shape.ivb < -5) la -= 2;
  la = clamp(la, -70, 85);

  // Spray: early = pull, late = opposite field; inside pitches get pulled.
  const handSign = side === 'R' ? -1 : 1;
  const inside = (side === 'R' ? -ballAtPlane.x : ballAtPlane.x) / 0.83;
  const pull = clamp(-dt / 0.032, -2.6, 2.6) + inside * 0.32;
  let spray = handSign * pull * 27 + rng.gauss(6 + (1 - q) * 14);

  // Barely-touched balls go straight back or are tipped.
  if (label === 'FOUL') {
    spray = rng.chance(0.5) ? 180 + rng.gauss(30) : handSign * (60 + rng.range(0, 60));
    la = rng.range(-10, 70);
    ev = rng.range(45, 70);
  }

  const backspin = la > 0 ? clamp(900 + la * 50 + q * 300, 600, 3200) : clamp(-600 + la * 15, -1800, -200);
  const sidespin = handSign * pull * 260 * (1 - q * 0.5);

  return {
    contact: true, timing, timingMs: dt * 1000, label, quality: q, ev, la, spray, backspin, sidespin,
    contactPoint: { x: ballAtPlane.x, y: ballAtPlane.y, z: CONTACT_Z }, pciDist: dist,
  };
}
