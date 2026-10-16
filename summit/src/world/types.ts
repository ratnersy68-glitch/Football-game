export type Difficulty = 'bunny' | 'green' | 'blue' | 'black' | 'double' | 'triple';
export type TrailKind = 'trail' | 'park' | 'pipe' | 'race';
export type Surface = 'groomed' | 'hardpack' | 'ice' | 'powder' | 'slush' | 'moguls' | 'rock';
export type LiftType = 'chair' | 'gondola' | 'surface';
export type Discipline = 'downhill' | 'slalom' | 'giant-slalom' | 'super-g' | 'ski-cross' | 'freestyle';

export const DIFFICULTIES: Difficulty[] = ['bunny', 'green', 'blue', 'black', 'double', 'triple'];

export const DIFFICULTY_INFO: Record<Difficulty, { label: string; short: string; color: string; symbol: string; order: number }> = {
  bunny: { label: 'Learning Area', short: 'Bunny', color: '#7fd28a', symbol: '◯', order: 0 },
  green: { label: 'Beginner', short: 'Green', color: '#2fa34a', symbol: '●', order: 1 },
  blue: { label: 'Intermediate', short: 'Blue', color: '#2a6fdb', symbol: '■', order: 2 },
  black: { label: 'Advanced', short: 'Black', color: '#111111', symbol: '◆', order: 3 },
  double: { label: 'Expert', short: 'Double Black', color: '#111111', symbol: '◆◆', order: 4 },
  triple: { label: 'Extreme', short: 'Triple Black', color: '#111111', symbol: '◆◆◆', order: 5 },
};

/**
 * Steepest-pitch gradient bands (tan of slope angle, measured over a 60 m window) each
 * difficulty is shaped into. Tests verify every generated trail lands inside its band.
 */
export const PITCH_BANDS: Record<Difficulty, { min: number; max: number }> = {
  bunny: { min: 0.05, max: 0.14 },
  green: { min: 0.1, max: 0.25 },
  blue: { min: 0.24, max: 0.41 },
  black: { min: 0.4, max: 0.61 },
  double: { min: 0.6, max: 0.86 },
  triple: { min: 0.86, max: 1.35 },
};

export interface P2 { x: number; z: number }

export interface Trail {
  id: number;
  name: string;
  kind: TrailKind;
  difficulty: Difficulty;
  /** Centerline points (world xz), roughly `step` metres apart, top → bottom. */
  pts: P2[];
  /** Shaped centerline surface height at each point. */
  prof: number[];
  /** Cumulative arc length at each point. */
  s: number[];
  width: number;
  groomed: boolean;
  moguls: boolean;
  glade: boolean;
  icy: number;
  chute: boolean;
  cliffs: { i: number; drop: number }[];
  liftId: number;
  length: number;
  vertical: number;
  avgGrade: number;
  /** Steepest 60 m pitch as gradient (tan). */
  maxPitch: number;
  landmark: string;
}

export interface Lift {
  id: number;
  name: string;
  type: LiftType;
  bottom: { x: number; y: number; z: number };
  top: { x: number; y: number; z: number };
  towers: { x: number; y: number; z: number; h: number }[];
  length: number;
  speed: number;
  spacing: number;
  /** Cable height above ground at stations (load height). */
  capacityLabel: string;
}

export interface RailDef {
  id: number;
  kind: 'rail' | 'box' | 'tube' | 'downrail' | 'rainbow' | 'flatdown' | 'kinked';
  name: string;
  pts: { x: number; y: number; z: number }[];
  halfWidth: number;
  parkId: number;
}

export interface Gate {
  x: number; z: number;
  /** Unit direction of travel through the gate. */
  dx: number; dz: number;
  width: number;
  color: 'red' | 'blue';
  split: boolean;
  s: number;
}

export interface RaceCourse {
  id: number;
  name: string;
  discipline: Discipline;
  trailId: number;
  gates: Gate[];
  start: { x: number; z: number; dx: number; dz: number };
  finish: Gate;
  racers: number;
  level: number;
}

export interface Park {
  id: number;
  name: string;
  style: 'beginner' | 'slopestyle' | 'bigair' | 'rails' | 'superpipe' | 'halfpipe' | 'standard';
  trailId: number;
  featureIds: number[];
  railIds: number[];
}

export interface Lake { x: number; z: number; r: number; y: number }

export interface Building {
  kind: 'lodge' | 'cabin' | 'station' | 'snowgun' | 'sign' | 'village' | 'hut' | 'mapboard';
  x: number; z: number; rot: number; scale: number;
  label?: string;
  difficulty?: Difficulty;
}
