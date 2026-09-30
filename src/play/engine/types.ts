import type { Slot } from './playbook';

export interface V2 {
  x: number;
  y: number;
}

/** 0–99 ratings used by the real-time engine (weight in lbs, height in inches). */
export interface Ratings {
  speed: number;
  acceleration: number;
  agility: number;
  strength: number;
  weight: number;
  height: number;
  catching: number;
  routeRunning: number;
  release: number;
  contested: number;
  blocking: number;
  passRush: number;
  tackle: number;
  coverage: number;
  ballSkills: number;
  awareness: number;
  breakTackle: number;
  juke: number;
  spin: number;
  stiffArm: number;
  carry: number;
  throwPower: number;
  shortAccuracy: number;
  mediumAccuracy: number;
  deepAccuracy: number;
  throwOnRun: number;
  underPressure: number;
  breakSack: number;
  playAction: number;
  stamina: number;
}

export type Role = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'CB' | 'S';
export type Side = 'off' | 'def';

export interface AthleteSpec {
  id: string;
  side: Side;
  role: Role;
  /** Offensive receiver slot (X/Z/H/Y/RB) or defensive label (LE, DT1, MLB, CB1, FS...). */
  slot: string;
  name: string;
  number: number;
  ratings: Ratings;
  user?: boolean;
}

export type MoveKind = 'juke_left' | 'juke_right' | 'spin' | 'stiff_arm' | 'hurdle' | 'dive' | 'slide';

export type Task =
  | { kind: 'idle' }
  | { kind: 'user' }
  | { kind: 'route'; pts: V2[]; idx: number; continues: boolean; settle: boolean; dir: V2 | null; releaseAt: number }
  | { kind: 'passpro'; target?: string; releaseAt?: number; after?: Task }
  | { kind: 'rush' }
  | { kind: 'man'; target: string }
  | { kind: 'zone'; zone: string }
  | { kind: 'pursue' }
  | { kind: 'block' }
  | { kind: 'carrier' }
  | { kind: 'toBall' }
  | { kind: 'fake'; until: number; after: Task };

export interface Athlete extends AthleteSpec {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: number;
  stamina: number;
  task: Task;
  /** Opponent id when locked in a block. */
  engaged?: string;
  engageShedAt: number;
  stunned: number;
  down: boolean;
  move: { kind: MoveKind; t: number } | null;
  moveCooldown: number;
  lastTackleTry: number;
  history: { t: number; x: number; y: number }[];
  /** Reaction time until this defender "sees" a throw / catch. */
  reactAt: number;
  sprinting: boolean;
  /** Visual pose hints for the renderer. */
  /** Currently carrying the ball. */
  ball?: boolean;
  pose: 'stance' | 'run' | 'throw' | 'catch' | 'block' | 'tackle' | 'down' | 'celebrate' | 'juke' | 'spin' | 'stiff' | 'dive';
  poseT: number;
  slotKind?: Slot;
}

export type SimEventType =
  | 'snap'
  | 'throw'
  | 'catch'
  | 'drop'
  | 'incomplete'
  | 'interception'
  | 'deflection'
  | 'batted'
  | 'tackle'
  | 'missed_tackle'
  | 'sack'
  | 'touchdown'
  | 'out_of_bounds'
  | 'slide'
  | 'move'
  | 'safety'
  | 'throwaway';

export interface SimEvent {
  type: SimEventType;
  t: number;
  text: string;
  x?: number;
  y?: number;
  who?: string;
}

export interface Ball {
  state: 'dead' | 'snap' | 'held' | 'air' | 'ground';
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  holder?: string;
  target?: string;
  thrownBy?: string;
  throwT: number;
  landing?: V2;
  quality?: string;
  attempted: Set<string>;
  lastTouch?: string;
  spin: number;
}

export interface PlayOutcome {
  kind: 'tackle' | 'incomplete' | 'interception' | 'touchdown' | 'out_of_bounds' | 'sack' | 'safety' | 'slide';
  /** Ball spot (field x) where the play ended. */
  spotX: number;
  spotY: number;
  carrier?: string;
  passer?: string;
  completion: boolean;
  passYards: number;
  rushYards: number;
  airYards: number;
  text: string;
  duration: number;
}

export interface UserInput {
  /** Movement intent in field axes (+x downfield, +y toward far sideline), magnitude 0..1. */
  move: V2;
  sprint: boolean;
  /** Edge-triggered actions for this tick. */
  snap?: boolean;
  throwTo?: { slot: string; power: number; lob: boolean };
  moveKind?: MoveKind;
  throwAway?: boolean;
}

export interface SimSettings {
  /** 0 Freshman, 1 Varsity, 2 All-Conference, 3 Heisman. Smarter AI only — never rating boosts. */
  difficulty: number;
  quarterMinutes: number;
  /** Show open/covered colors on receiver icons. */
  readAssist: boolean;
  sliders: {
    qbAccuracy: number;
    passBlocking: number;
    wrCatching: number;
    tackling: number;
    interceptions: number;
    fatigue: number;
  };
}

export const DEFAULT_SETTINGS: SimSettings = {
  difficulty: 1,
  quarterMinutes: 5,
  readAssist: true,
  sliders: { qbAccuracy: 50, passBlocking: 50, wrCatching: 50, tackling: 50, interceptions: 50, fatigue: 50 },
};
