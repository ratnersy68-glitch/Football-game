import type { Vec2 } from '../core/math';
import type { FighterData, GroundPosition } from '../data';

export type Side = 0 | 1;
export const other = (s: Side): Side => (s === 0 ? 1 : 0);

export type DefenseMove = 'slip' | 'duck' | 'pull' | 'sidestep';
export type TakedownVariant = 'double' | 'single' | 'trip' | 'cage';
export type Guard = 'none' | 'high' | 'low';

export type Action =
  | { kind: 'strike'; id: string; t: number; w: number; a: number; r: number; resolved: boolean; feint: boolean; combo: number; counterWindow: boolean }
  | { kind: 'defense'; move: DefenseMove; t: number; dur: number; dir: number }
  | { kind: 'shot'; variant: TakedownVariant; t: number; w: number; timed: boolean; caughtKick: boolean }
  | { kind: 'clinchEntry'; t: number; w: number }
  | { kind: 'transition'; alt: boolean; t: number; w: number; defended: boolean }
  | { kind: 'getup'; t: number; w: number }
  | { kind: 'stun'; t: number; dur: number }
  | { kind: 'recover'; t: number; dur: number; label: string };

export type CommandAction =
  | { type: 'strike'; id: string }
  | { type: 'feint'; id: string }
  | { type: 'defend'; move: DefenseMove; dir: number }
  | { type: 'clinch' }
  | { type: 'takedown'; variant: 'double' | 'single' | 'trip' }
  | { type: 'transition'; alt: boolean }
  | { type: 'submission'; index: number }
  | { type: 'getup' }
  | { type: 'switchStance' };

export type SubKey = 'up' | 'down' | 'left' | 'right';

/** What a controller (keyboard/pad or AI) asks its fighter to do this tick. */
export interface Command {
  /** World-space desired movement, length <= 1. */
  move: Vec2;
  guard: Guard;
  actions: CommandAction[];
  /** Direction pressed this tick (submission scramble). */
  subKey?: SubKey;
}

export const emptyCommand = (): Command => ({ move: { x: 0, z: 0 }, guard: 'none', actions: [] });

export type FighterContext = 'stand' | 'clinch' | 'groundTop' | 'groundBottom' | 'down' | 'subAttack' | 'subDefend' | 'standingOverDowned' | 'idle';

export interface DownState {
  t: number;
  dur: number;
  heavy: boolean;
}

export interface FighterState {
  side: Side;
  data: FighterData;
  name: string;
  last: string;
  pos: Vec2;
  vel: Vec2;
  facing: number;
  stance: 'orthodox' | 'southpaw';
  action: Action | null;
  buffered: { a: CommandAction; t: number } | null;
  guard: Guard;
  move: Vec2;

  // Damage
  head: number;
  body: number;
  legL: number;
  legR: number;
  daze: number;
  rockedT: number;
  down: DownState | null;
  knockdowns: number;
  cut: number;
  swelling: number;
  /** Unanswered damage while hurt; the referee watches this. */
  unanswered: number;

  // Stamina
  stamina: number;
  tank: number;

  // Striking flow
  comboSeq: string[];
  comboT: number;
  counterT: number; // window in which this fighter's next strike counts as a counter
  lastLandedT: number;
  lastHitT: number;
  hitFlash: number;
  hitDir: number;
  hitTarget: 'head' | 'body' | 'leg' | null;
  lastStrikeTime: number;
  subScramble: number;

  /** Fight-night form (≈0.9–1.1): some nights you have it, some nights you don't. */
  form: number;

  /** Visual-only hint for renderers (e.g. 'sprawl', 'caught'). */
  anim: string;
  animT: number;
}

export interface ClinchState {
  /** Positive = side 0 has the better position, negative = side 1. */
  control: number;
  /** Side whose back is against the cage, or -1. */
  pinned: -1 | Side;
  t: number;
  lastAction: number;
}

export interface GroundState {
  top: Side;
  pos: GroundPosition;
  t: number;
  lastAction: number;
}

export interface SubmissionState {
  attacker: Side;
  subId: string;
  /** 0 = escaped, 100 = finished. */
  progress: number;
  t: number;
  prompts: [SubKey, SubKey];
  promptT: [number, number];
  lockout: [number, number];
  from: 'ground' | 'stand';
  /** Ground state to restore on escape. */
  resume: GroundState | null;
}

export type FinishMethod = 'KO' | 'TKO' | 'SUB' | 'DEC' | 'DRAW';

export interface Scorecard {
  judge: string;
  rounds: Array<[number, number]>;
  total: [number, number];
}

export interface FightResult {
  winner: Side | null;
  method: FinishMethod;
  detail: string;
  round: number;
  /** Elapsed time in the round, seconds. */
  time: number;
  scorecards: Scorecard[];
  decisionType?: 'Unanimous' | 'Split' | 'Majority';
}

export interface FightConfig {
  fighters: [FighterData, FighterData];
  rounds: number;
  roundSeconds: number;
  /** Fight clock seconds per real second. */
  clockSpeed: number;
  seed: number;
  arenaId: string;
  title?: string;
  mainEvent?: boolean;
  /** When true the engine skips presentation-only work (headless sims). */
  headless?: boolean;
}

export type FightStatus = 'prefight' | 'fighting' | 'betweenRounds' | 'finished';
export type FightMode = 'stand' | 'clinch' | 'ground' | 'sub';

export type FightEvent =
  | { type: 'strikeThrown'; side: Side; id: string }
  | { type: 'strikeLanded'; side: Side; id: string; dmg: number; target: 'head' | 'body' | 'leg'; counter: '' | 'timed' | 'whiff'; flush: boolean; combo: string | null; big: boolean }
  | { type: 'strikeBlocked'; side: Side; id: string; checked: boolean }
  | { type: 'strikeMissed'; side: Side; id: string; evaded: string | null }
  | { type: 'feint'; side: Side; id: string }
  | { type: 'rocked'; side: Side }
  | { type: 'knockdown'; side: Side; heavy: boolean; by: string; kind: 'head' | 'body' | 'leg' }
  | { type: 'pounce'; side: Side }
  | { type: 'recoveredFromKnockdown'; side: Side }
  | { type: 'takedownAttempt'; side: Side; variant: TakedownVariant }
  | { type: 'takedown'; side: Side; variant: TakedownVariant; pos: GroundPosition }
  | { type: 'takedownDefended'; side: Side; how: 'sprawl' | 'stuffed' | 'counter' }
  | { type: 'kickCaught'; side: Side }
  | { type: 'clinchAttempt'; side: Side; success: boolean }
  | { type: 'clinchBroken'; side: Side | -1; reason: 'break' | 'ref' | 'strike' }
  | { type: 'cagePin'; side: Side }
  | { type: 'positionChange'; side: Side; from: string; to: string; kind: 'pass' | 'sweep' | 'escape' | 'back' }
  | { type: 'transitionDefended'; side: Side }
  | { type: 'standup'; reason: 'getup' | 'ref' | 'disengage'; side: Side | -1 }
  | { type: 'subAttempt'; side: Side; subId: string }
  | { type: 'subEscape'; side: Side; subId: string }
  | { type: 'subTight'; side: Side; subId: string }
  | { type: 'cut'; side: Side; severity: number }
  | { type: 'legHurt'; side: Side; level: number }
  | { type: 'bodyHurt'; side: Side; level: number }
  | { type: 'tired'; side: Side }
  | { type: 'switchStance'; side: Side }
  | { type: 'roundStart'; round: number }
  | { type: 'tenSeconds'; round: number }
  | { type: 'roundEnd'; round: number; scores: Array<[number, number]> }
  | { type: 'stall'; mode: FightMode }
  | { type: 'fightEnd'; result: FightResult };
