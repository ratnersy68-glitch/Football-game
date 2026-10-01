/**
 * EDITABLE ROSTER FORMAT
 *
 * Hitter row:
 *   [name, number, position, bats, throws, contact, power, eye, speed, fielding, arm, secondaryPositions?, overrides?]
 *   - contact/power are the hitter's overall tools; the RosterManager derives the vs-RHP / vs-LHP
 *     splits from handedness (lefties hit righties better, etc.).
 *   - eye drives plate vision + discipline.
 *   - overrides (optional) lets you set any derived rating directly, e.g. { contactL: 40, stealing: 90 }.
 *   The FIRST NINE hitters are the default batting order (one of them should be the DH).
 *
 * Pitcher row:
 *   [name, number, role, throws, velocityMph, control, break, stamina, 'FF,SL,CH,...']
 *   - role: 'SP' starter, 'RP' reliever, 'CL' closer.
 *   - pitch codes: FF 4-seam, FT 2-seam, SI sinker, FC cutter, SL slider, ST sweeper,
 *     CU curveball, KC knuckle curve, CH changeup, FS splitter.
 *   - A pitcher row whose name matches a hitter on the same team makes that player two-way.
 *
 * All ratings are 0–99. Rosters reflect the 2025 MLB season; edit them as rosters change.
 */
import type { HitterRatings, Hand, PitcherRole, Position } from '../../core/types';

export type HitterRow = [
  name: string,
  number: number,
  pos: Position,
  bats: Hand,
  throws: 'R' | 'L',
  contact: number,
  power: number,
  eye: number,
  speed: number,
  fielding: number,
  arm: number,
  secondary?: string,
  overrides?: Partial<HitterRatings>,
];

export type PitcherRow = [
  name: string,
  number: number,
  role: PitcherRole,
  throws: 'R' | 'L',
  velocity: number,
  control: number,
  breakRating: number,
  stamina: number,
  pitches: string,
];

export interface RosterData {
  hitters: HitterRow[];
  pitchers: PitcherRow[];
}
