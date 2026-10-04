/**
 * Character animation contract from docs/correction-pack/LCPS_Bowl_Character_Techpack.md.
 * Frame counts, playback FPS, loop modes, next states and zero-based gameplay events per action.
 * Event frames are art timing only: gameplay (PlaySim) stays authoritative for release/catch/tackle/kick.
 */
import type { Position } from '../../game/types';

export const CELL = 48;
export const ORIGIN = { x: 24, y: 42 } as const; // standing foot baseline, constant in every frame and layer

export type Build = 'skill' | 'hybrid' | 'lineman';
export type Dir = 'right' | 'left' | 'toward' | 'away';
export const DIRS: Dir[] = ['right', 'left', 'toward', 'away'];
export const BUILDS: Build[] = ['skill', 'hybrid', 'lineman'];

export const BUILD_OF: Record<Position, Build> = {
  QB: 'skill', WR: 'skill', CB: 'skill', S: 'skill', K: 'skill',
  RB: 'hybrid', LB: 'hybrid', TE: 'hybrid',
  OL: 'lineman', DL: 'lineman',
};
export const buildFor = (pos: Position): Build => BUILD_OF[pos] ?? 'hybrid';

export type ActionId =
  | 'idle' | 'stanceSkill' | 'threePoint' | 'walk' | 'run' | 'runBall' | 'sprint' | 'dropback' | 'throw'
  | 'handoff' | 'receiveHandoff' | 'catchLow' | 'catchHigh' | 'juke' | 'spin' | 'stiffArm' | 'block' | 'shed'
  | 'shuffle' | 'backpedal' | 'tackle' | 'tackled' | 'dive' | 'sack' | 'interception' | 'snap' | 'kick' | 'punt'
  | 'kneel' | 'getUp' | 'celebrate';

export interface ActionSpec {
  id: ActionId;
  label: string;
  frames: number;
  fps: number;
  /** true = loop all frames; [a, b] = loop only frames a..b once reached (block hold); false = one-shot. */
  loop: boolean | [number, number];
  /** State after a one-shot finishes. 'hold' = stay on the last frame (grounded) until gameplay moves on. */
  next: ActionId | 'hold';
  /** Zero-based art frames that line up with gameplay events. */
  events: Record<string, number>;
  /** Keyframes, in order (techpack wording). */
  keys: string[];
}

const A = (id: ActionId, label: string, frames: number, fps: number, loop: ActionSpec['loop'], next: ActionSpec['next'], events: Record<string, number>, keys: string[]): ActionSpec => ({ id, label, frames, fps, loop, next, events, keys });

export const ACTIONS: ActionSpec[] = [
  A('idle', 'Idle', 2, 3, true, 'idle', {}, ['neutral', 'shoulder lift']),
  A('stanceSkill', 'Pre-snap skill stance', 2, 3, true, 'stanceSkill', {}, ['knees bent', 'weight shift']),
  A('threePoint', 'Three-point stance', 2, 3, true, 'threePoint', {}, ['hand down', 'settle']),
  A('walk', 'Walk', 4, 6, true, 'walk', {}, ['left contact', 'passing', 'right contact', 'passing']),
  A('run', 'Run without ball', 6, 10, true, 'run', {}, ['contact', 'compress', 'push', 'opp contact', 'compress', 'push']),
  A('runBall', 'Run with ball', 6, 10, true, 'runBall', {}, ['contact', 'compress', 'push', 'opp contact', 'compress', 'push']),
  A('sprint', 'Sprint', 6, 12, true, 'sprint', {}, ['contact', 'compress', 'push', 'opp contact', 'compress', 'push']),
  A('dropback', 'QB dropback', 4, 8, true, 'dropback', {}, ['back step', 'pass', 'back step', 'pass']),
  A('throw', 'Throw', 6, 12, false, 'idle', { release: 4 }, ['set', 'draw back', 'cock', 'step', 'release', 'follow through']),
  A('handoff', 'Handoff', 4, 10, false, 'idle', { transfer: 2 }, ['secure', 'rotate', 'extend', 'retract']),
  A('receiveHandoff', 'Receive handoff', 4, 10, false, 'runBall', { accept: 2 }, ['approach', 'pocket', 'accept', 'tuck']),
  A('catchLow', 'Low / chest catch', 4, 12, false, 'runBall', { secure: 1 }, ['reach', 'contact', 'pull in', 'tuck']),
  A('catchHigh', 'High catch', 6, 10, false, 'runBall', { contact: 3 }, ['load', 'jump', 'reach', 'contact', 'tuck', 'land']),
  A('juke', 'Juke', 4, 12, false, 'runBall', {}, ['plant', 'lean', 'shift', 'accelerate']),
  A('spin', 'Spin', 6, 12, false, 'runBall', {}, ['plant', 'quarter turn', 'back view', 'opposite side', 'front quarter', 'recover']),
  A('stiffArm', 'Stiff arm', 4, 10, false, 'runBall', { contact: 2 }, ['tuck', 'raise forearm', 'extend', 'recover']),
  A('block', 'Block', 4, 8, [2, 3], 'block', { contact: 2 }, ['crouch', 'step', 'extend hands', 'hold']),
  A('shed', 'Shed block', 4, 10, false, 'run', {}, ['brace', 'swipe', 'turn shoulder', 'disengage']),
  A('shuffle', 'Defensive shuffle', 4, 8, true, 'shuffle', {}, ['low stance', 'lateral step', 'close feet', 'lateral step']),
  A('backpedal', 'Backpedal', 4, 8, true, 'backpedal', {}, ['low hips', 'back step', 'low hips', 'back step']),
  A('tackle', 'Tackle', 6, 12, false, 'hold', { contact: 2 }, ['lower', 'plant', 'drive shoulder', 'wrap', 'descend', 'grounded']),
  A('tackled', 'Get tackled', 6, 12, false, 'hold', { impact: 1 }, ['run interrupted', 'impact', 'twist', 'collapse', 'land', 'settle']),
  A('dive', 'Dive', 6, 12, false, 'hold', { ground: 4 }, ['load', 'push off', 'horizontal', 'descend', 'ground contact', 'slide']),
  A('sack', 'Sack (QB)', 6, 12, false, 'hold', { contact: 1 }, ['protect ball', 'contact', 'buckle', 'fall', 'land', 'settle']),
  A('interception', 'Interception', 6, 10, false, 'runBall', { contact: 2 }, ['track', 'reach', 'contact', 'secure', 'pivot', 'return ready']),
  A('snap', 'Center snap', 4, 10, false, 'block', { detach: 2 }, ['three-point hold', 'grip', 'drive back', 'rise']),
  A('kick', 'Kick / field goal', 6, 12, false, 'idle', { launch: 3 }, ['approach', 'plant', 'backswing', 'strike', 'follow through', 'recover']),
  A('punt', 'Punt', 6, 10, false, 'idle', { release: 2, strike: 4 }, ['hold', 'extend', 'drop', 'leg swing', 'contact', 'follow through']),
  A('kneel', 'Kneel', 4, 8, false, 'hold', { knee: 2 }, ['secure', 'lower', 'knee contact', 'hold']),
  A('getUp', 'Get up', 6, 8, false, 'idle', {}, ['prone', 'hands down', 'one knee', 'plant foot', 'rise', 'ready']),
  A('celebrate', 'Celebrate', 6, 8, true, 'idle', {}, ['stand tall', 'arms up', 'bounce', 'fist pump', 'settle', 'neutral']),
];

export const ACTION: Record<ActionId, ActionSpec> = Object.fromEntries(ACTIONS.map((a) => [a.id, a])) as Record<ActionId, ActionSpec>;

/** Which actions each position's state machine actually uses (techpack position table). */
export const POSITION_ACTIONS: Record<string, ActionId[]> = {
  QB: ['stanceSkill', 'dropback', 'throw', 'handoff', 'runBall', 'sprint', 'sack', 'kneel', 'tackled', 'getUp', 'celebrate'],
  RB: ['stanceSkill', 'receiveHandoff', 'runBall', 'juke', 'spin', 'stiffArm', 'catchLow', 'catchHigh', 'tackled', 'dive', 'block', 'getUp', 'celebrate'],
  WR: ['stanceSkill', 'run', 'sprint', 'catchLow', 'catchHigh', 'runBall', 'juke', 'spin', 'stiffArm', 'block', 'tackled', 'dive', 'getUp', 'celebrate'],
  TE: ['threePoint', 'run', 'catchLow', 'catchHigh', 'runBall', 'block', 'tackled', 'getUp', 'celebrate'],
  OL: ['threePoint', 'snap', 'block', 'walk', 'run', 'getUp'],
  DL: ['threePoint', 'run', 'shed', 'tackle', 'block', 'getUp', 'celebrate'],
  LB: ['stanceSkill', 'shuffle', 'run', 'sprint', 'tackle', 'shed', 'interception', 'dive', 'getUp', 'celebrate'],
  CB: ['stanceSkill', 'backpedal', 'shuffle', 'sprint', 'catchLow', 'interception', 'tackle', 'dive', 'getUp', 'celebrate'],
  S: ['stanceSkill', 'backpedal', 'shuffle', 'sprint', 'catchHigh', 'interception', 'tackle', 'dive', 'getUp', 'celebrate'],
  K: ['idle', 'run', 'kick', 'punt', 'tackle', 'celebrate'],
};

/** Frame index for an action at time t (seconds since it started), honoring the loop mode. */
export function frameAt(a: ActionSpec, t: number, rate = 1): { frame: number; done: boolean } {
  const raw = Math.floor(Math.max(0, t) * a.fps * rate);
  if (a.loop === true) return { frame: raw % a.frames, done: false };
  if (Array.isArray(a.loop)) {
    const [lo, hi] = a.loop;
    if (raw <= hi) return { frame: raw, done: false };
    return { frame: lo + ((raw - lo) % (hi - lo + 1)), done: false };
  }
  if (raw >= a.frames) return { frame: a.frames - 1, done: true };
  return { frame: raw, done: false };
}

/** Seconds into an action at which a given frame starts (used to start one-shots on their event frame). */
export const timeOfFrame = (a: ActionSpec, frame: number) => frame / a.fps + 0.0001;
