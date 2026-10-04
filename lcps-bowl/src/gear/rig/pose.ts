/**
 * Key poses for every action frame, authored from Character_Motion_Guide.png (right-facing key poses)
 * and rebuilt on a fixed skeleton instead of cropping the guide.
 *
 * Angles are absolute, in degrees from straight down; + rotates toward the facing direction.
 * Limb pairs are [upper, lower] (thigh/shin, upper arm/forearm).
 * armMode/legMode 'view': [near, far] relative to the camera. 'anat': [dominant, other] (throwing hand / kicking foot),
 * so a right-handed QB's throwing arm stays his right arm whichever way he faces.
 */
import type { ActionId } from './spec';

export type BallMode = 'none' | 'tuck' | 'hands' | 'handA' | 'handsFront' | 'handsHigh' | 'ground';
export type ViewOverride = 'away' | 'toward' | 'sideOpp';
export type Pair = [number, number];

export interface Pose {
  lean: number;
  legs: [Pair, Pair];
  legMode: 'view' | 'anat';
  arms: [Pair, Pair];
  armMode: 'view' | 'anat' | 'carry';
  lift?: number; // px airborne
  rot?: number; // whole-body pitch (deg), + forward (face down), - backward (on back)
  ground?: boolean; // translate a rotated body so its lowest pixel sits on the ground
  shift?: number; // hip shift forward (px)
  chest?: number; // shoulder lift (px) for breathing
  view?: ViewOverride;
  ball: BallMode;
  spread?: number; // front/back view extra leg spread
  flare?: number; // front/back view extra arm flare
  reachGround?: 0 | 1; // stretch arm a (0) or b (1) so the hand reaches the ground (three-point stance)
}

const P = (o: Partial<Pose> & Pick<Pose, 'legs' | 'arms'>): Pose => ({ lean: 6, legMode: 'view', armMode: 'view', ball: 'none', ...o });

// ---------------------------------------------------------------- shared limb sets
const STAND: [Pair, Pair] = [[5, 0], [-5, 0]];
const ARMS_REST: [Pair, Pair] = [[10, 30], [-6, 18]];
const HOLD_BALL: [Pair, Pair] = [[28, 118], [34, 112]]; // both hands on the football at the chest
const TUCK: Pair = [-4, 96]; // ball arm: elbow tight, forearm across the ribs

// Run cycle (contact, compress, push, opp contact, compress, push) for [near, far] legs
const RUN_LEGS: [Pair, Pair][] = [
  [[32, 14], [-26, -62]],
  [[6, -12], [12, -58]],
  [[-26, -34], [52, 2]],
  [[-26, -62], [32, 14]],
  [[12, -58], [6, -12]],
  [[52, 2], [-26, -34]],
];
const RUN_ARMS: [Pair, Pair][] = [
  [[-36, 18], [42, 102]],
  [[-12, 48], [16, 82]],
  [[26, 92], [-26, 28]],
  [[42, 102], [-36, 18]],
  [[16, 82], [-12, 48]],
  [[-26, 28], [26, 92]],
];
const RUN_LIFT = [0, 0, 1, 0, 0, 1];
const scale = ([a, b]: Pair, k: number): Pair => [a * k, b * k];

const run = (i: number, o: Partial<Pose> = {}) => P({ lean: 12, legs: RUN_LEGS[i], arms: RUN_ARMS[i], lift: RUN_LIFT[i], ...o });
const runBall = (i: number, o: Partial<Pose> = {}) => P({ lean: 12, legs: RUN_LEGS[i], arms: [TUCK, RUN_ARMS[i][1]], armMode: 'carry', lift: RUN_LIFT[i], ball: 'tuck', ...o });
const crouch: [Pair, Pair] = [[28, -22], [-8, -36]];
const IDLE = P({ legs: STAND, arms: ARMS_REST });

export const POSES: Record<ActionId, Pose[]> = {
  idle: [IDLE, P({ legs: STAND, arms: [[12, 32], [-4, 20]], chest: 1 })],
  stanceSkill: [
    P({ lean: 26, legs: [[30, -16], [-6, -26]], arms: [[34, 58], [24, 52]] }),
    P({ lean: 28, shift: 1, legs: [[32, -14], [-4, -24]], arms: [[36, 60], [26, 54]] }),
  ],
  threePoint: [
    P({ lean: 72, legs: [[64, -18], [44, -34]], arms: [[6, 0], [40, 70]], reachGround: 0, spread: 2 }),
    P({ lean: 74, legs: [[66, -16], [46, -32]], arms: [[4, 0], [42, 72]], reachGround: 0, spread: 2 }),
  ],
  walk: [
    P({ legs: [[18, 8], [-16, -24]], arms: [[-14, -4], [14, 28]] }),
    P({ legs: [[2, -8], [4, -2]], arms: [[0, 12], [0, 12]], chest: 1 }),
    P({ legs: [[-16, -24], [18, 8]], arms: [[14, 28], [-14, -4]] }),
    P({ legs: [[4, -2], [2, -8]], arms: [[0, 12], [0, 12]], chest: 1 }),
  ],
  run: [0, 1, 2, 3, 4, 5].map((i) => run(i)),
  runBall: [0, 1, 2, 3, 4, 5].map((i) => runBall(i)),
  sprint: [0, 1, 2, 3, 4, 5].map((i) => P({ lean: 22, legs: [scale(RUN_LEGS[i][0], 1.25), scale(RUN_LEGS[i][1], 1.25)], arms: [scale(RUN_ARMS[i][0], 1.2), scale(RUN_ARMS[i][1], 1.2)], lift: RUN_LIFT[i] * 2 })),
  dropback: [
    P({ lean: -2, legs: [[-24, -14], [10, 0]], arms: HOLD_BALL, ball: 'hands' }),
    P({ lean: -2, legs: [[0, -20], [4, 0]], arms: HOLD_BALL, ball: 'hands', lift: 1 }),
    P({ lean: -2, legs: [[10, 0], [-24, -14]], arms: HOLD_BALL, ball: 'hands' }),
    P({ lean: -2, legs: [[4, 0], [0, -20]], arms: HOLD_BALL, ball: 'hands', lift: 1 }),
  ],
  throw: [
    P({ lean: 2, legs: [[14, 0], [-14, 0]], arms: HOLD_BALL, armMode: 'anat', ball: 'hands' }),
    P({ lean: -4, legs: [[14, 0], [-16, 0]], arms: [[-62, 150], [42, 96]], armMode: 'anat', ball: 'handA' }),
    P({ lean: -8, legs: [[16, 0], [-18, -6]], arms: [[-84, 172], [72, 90]], armMode: 'anat', ball: 'handA' }),
    P({ lean: 0, legs: [[26, 10], [-22, -16]], arms: [[-58, 176], [62, 40]], armMode: 'anat', ball: 'handA' }),
    P({ lean: 12, legs: [[26, 10], [-28, -30]], arms: [[104, 140], [-10, 10]], armMode: 'anat', ball: 'none' }),
    P({ lean: 26, legs: [[30, 12], [-38, -46]], arms: [[62, 22], [-30, 0]], armMode: 'anat', ball: 'none' }),
  ],
  handoff: [
    P({ lean: 4, legs: STAND, arms: HOLD_BALL, armMode: 'anat', ball: 'hands' }),
    P({ lean: 6, legs: [[16, 2], [-8, -6]], arms: [[40, 110], [38, 108]], armMode: 'anat', ball: 'hands' }),
    P({ lean: 10, legs: [[22, 6], [-12, -10]], arms: [[64, 78], [20, 60]], armMode: 'anat', ball: 'handA' }),
    P({ lean: 6, legs: [[16, 2], [-8, -6]], arms: [[12, 40], [-8, 22]], armMode: 'anat', ball: 'none' }),
  ],
  receiveHandoff: [
    run(0, { arms: [[72, 168], [22, 96]] }),
    run(1, { arms: [[74, 170], [24, 98]] }),
    run(2, { arms: [[50, 140], [26, 100]], ball: 'hands' }),
    runBall(3),
  ],
  catchLow: [
    run(0, { arms: [[76, 92], [80, 96]] }),
    run(1, { arms: [[74, 90], [78, 94]], ball: 'handsFront' }),
    run(2, { arms: [[40, 128], [46, 124]], ball: 'hands' }),
    runBall(3),
  ],
  catchHigh: [
    P({ lean: 10, legs: crouch, arms: [[-22, 0], [-26, 0]] }),
    P({ lean: 4, lift: 3, legs: [[30, 0], [-14, -40]], arms: [[150, 170], [146, 166]] }),
    P({ lean: 0, lift: 5, legs: [[20, -30], [-10, -50]], arms: [[172, 180], [166, 180]] }),
    P({ lean: 0, lift: 5, legs: [[20, -30], [-10, -50]], arms: [[170, 176], [164, 176]], ball: 'handsHigh' }),
    P({ lean: 6, lift: 3, legs: [[24, -20], [-6, -44]], arms: [[40, 128], [46, 124]], ball: 'hands' }),
    P({ lean: 14, legs: crouch, arms: [TUCK, [20, 60]], armMode: 'carry', ball: 'tuck' }),
  ],
  juke: [
    runBall(0, { legs: [[36, 26], [-16, -30]], lean: 6, lift: 0 }),
    runBall(1, { legs: [[46, 30], [0, -20]], lean: -6, shift: -2, lift: 0, spread: 3 }),
    runBall(2, { legs: [[-10, -20], [40, 10]], lean: 16, shift: 2, lift: 0, spread: -1 }),
    runBall(2, { lean: 22 }),
  ],
  spin: [
    runBall(0, { legs: [[30, 20], [-10, -24]], lift: 0 }),
    runBall(1, { view: 'away', lift: 0 }),
    runBall(4, { view: 'away', arms: [TUCK, [60, 90]], lift: 0 }),
    runBall(3, { view: 'sideOpp', lift: 0 }),
    runBall(4, { view: 'toward', lift: 0 }),
    runBall(5),
  ],
  stiffArm: [
    runBall(0, { arms: [TUCK, [10, 40]] }),
    runBall(1, { arms: [TUCK, [60, 150]] }),
    runBall(2, { arms: [TUCK, [86, 90]], lean: 16 }),
    runBall(3),
  ],
  block: [
    P({ lean: 34, legs: [[30, -20], [-20, -36]], arms: [[20, 60], [14, 54]] }),
    P({ lean: 32, legs: [[40, 0], [-26, -40]], arms: [[50, 80], [44, 76]] }),
    P({ lean: 30, legs: [[36, -6], [-30, -44]], arms: [[82, 86], [76, 82]] }),
    P({ lean: 32, legs: [[34, -8], [-32, -46]], arms: [[80, 84], [74, 80]], shift: 1 }),
  ],
  shed: [
    P({ lean: 30, legs: [[30, -10], [-26, -40]], arms: [[72, 80], [66, 76]] }),
    P({ lean: 26, legs: [[30, -10], [-26, -40]], arms: [[110, 40], [20, 30]] }),
    P({ lean: 40, shift: 2, legs: [[36, 0], [-30, -44]], arms: [[50, 100], [-30, 0]] }),
    run(0, { lean: 20 }),
  ],
  shuffle: [
    P({ lean: 22, legs: [[16, -16], [-14, -26]], arms: [[40, 88], [34, 84]] }),
    P({ lean: 22, legs: [[22, -10], [-22, -30]], arms: [[40, 88], [34, 84]], spread: 3, lift: 1 }),
    P({ lean: 22, legs: [[6, -20], [-6, -20]], arms: [[40, 88], [34, 84]], spread: -1 }),
    P({ lean: 22, legs: [[22, -10], [-22, -30]], arms: [[40, 88], [34, 84]], spread: 3, lift: 1 }),
  ],
  backpedal: [
    P({ lean: 20, legs: [[10, -26], [-26, -36]], arms: [[30, 80], [-20, 30]] }),
    P({ lean: 20, legs: [[0, -30], [-6, -20]], arms: [[10, 50], [0, 50]], lift: 1 }),
    P({ lean: 20, legs: [[-26, -36], [10, -26]], arms: [[-20, 30], [30, 80]] }),
    P({ lean: 20, legs: [[-6, -20], [0, -30]], arms: [[0, 50], [10, 50]], lift: 1 }),
  ],
  tackle: [
    P({ lean: 30, legs: crouch, arms: [[30, 70], [26, 66]] }),
    P({ lean: 42, legs: [[40, 10], [-30, -40]], arms: [[60, 80], [54, 76]] }),
    P({ lean: 60, legs: [[20, -10], [-46, -30]], arms: [[92, 82], [86, 78]] }),
    P({ lean: 70, legs: [[10, -16], [-50, -40]], arms: [[100, 150], [96, 150]] }),
    P({ lean: 60, rot: 40, legs: [[-10, -20], [-40, -40]], arms: [[100, 150], [96, 150]], ground: true }),
    P({ lean: 10, rot: 84, legs: [[-6, -10], [-12, -16]], arms: [[96, 96], [90, 90]], ground: true }),
  ],
  tackled: [
    runBall(1, { lift: 0 }),
    runBall(1, { lean: -16, lift: 0, arms: [TUCK, [100, 150]] }),
    runBall(4, { lean: -24, rot: -18, arms: [TUCK, [120, 160]], view: 'toward', lift: 0 }),
    P({ lean: -10, rot: -50, legs: [[40, -10], [20, -40]], arms: [TUCK, [140, 170]], armMode: 'carry', ball: 'tuck', ground: true }),
    P({ lean: 0, rot: -84, legs: [[30, 10], [10, -10]], arms: [TUCK, [160, 175]], armMode: 'carry', ball: 'tuck', ground: true }),
    P({ lean: 0, rot: -90, legs: [[20, 0], [6, -6]], arms: [TUCK, [170, 178]], armMode: 'carry', ball: 'tuck', ground: true }),
  ],
  dive: [
    P({ lean: 30, legs: [[30, -20], [-20, -40]], arms: [[-30, 0], [-26, 0]] }),
    P({ lean: 60, lift: 2, legs: [[-20, -20], [-40, -40]], arms: [[120, 120], [116, 116]] }),
    P({ lean: 10, rot: 76, lift: 6, legs: [[-8, -8], [-14, -14]], arms: [[170, 170], [166, 166]] }),
    P({ lean: 10, rot: 84, lift: 3, legs: [[-6, -6], [-12, -12]], arms: [[172, 172], [168, 168]] }),
    P({ lean: 10, rot: 90, legs: [[-4, -4], [-8, -8]], arms: [[174, 174], [170, 170]], ground: true }),
    P({ lean: 10, rot: 90, shift: 2, legs: [[-4, -4], [-8, -8]], arms: [[176, 176], [172, 172]], ground: true }),
  ],
  sack: [
    P({ lean: 10, legs: STAND, arms: HOLD_BALL, ball: 'hands' }),
    P({ lean: -12, shift: -1, legs: [[18, 0], [-10, -10]], arms: HOLD_BALL, ball: 'hands' }),
    P({ lean: 4, legs: [[34, -50], [20, -60]], arms: HOLD_BALL, ball: 'hands' }),
    P({ lean: 10, rot: 50, legs: [[30, -40], [10, -50]], arms: HOLD_BALL, ball: 'hands', ground: true }),
    P({ lean: 0, rot: 84, legs: [[10, -20], [0, -26]], arms: HOLD_BALL, ball: 'hands', ground: true }),
    P({ lean: 0, rot: 90, legs: [[6, -14], [0, -20]], arms: HOLD_BALL, ball: 'hands', ground: true }),
  ],
  interception: [
    run(0, { arms: [[50, 90], [44, 86]] }),
    run(1, { arms: [[150, 170], [144, 166]], lift: 2 }),
    run(2, { arms: [[160, 176], [154, 172]], ball: 'handsHigh', lift: 2 }),
    P({ lean: 8, legs: crouch, arms: [[40, 128], [46, 124]], ball: 'hands' }),
    P({ lean: 10, legs: crouch, arms: [[40, 128], [46, 124]], ball: 'hands', view: 'toward' }),
    runBall(0),
  ],
  snap: [
    P({ lean: 74, legs: [[64, -18], [48, -30]], arms: [[8, 0], [4, 0]], reachGround: 0, ball: 'ground', spread: 3 }),
    P({ lean: 76, legs: [[66, -16], [50, -28]], arms: [[10, 0], [6, 0]], reachGround: 0, ball: 'ground', spread: 3 }),
    P({ lean: 70, legs: [[60, -20], [44, -34]], arms: [[-50, -70], [-46, -66]], spread: 3 }),
    P({ lean: 40, legs: [[34, -10], [-20, -36]], arms: [[40, 70], [34, 66]] }),
  ],
  kick: [
    run(0, { legMode: 'anat' }),
    P({ lean: 6, legMode: 'anat', legs: [[-40, -72], [20, 10]], arms: [[-20, 0], [60, 60]], armMode: 'anat' }),
    P({ lean: 4, legMode: 'anat', legs: [[-62, -100], [18, 8]], arms: [[-30, -10], [80, 80]], armMode: 'anat' }),
    P({ lean: 0, legMode: 'anat', legs: [[60, 40], [14, 6]], arms: [[-40, -20], [90, 100]], armMode: 'anat' }),
    P({ lean: -16, lift: 1, legMode: 'anat', legs: [[110, 100], [8, 4]], arms: [[-40, -20], [92, 120]], armMode: 'anat' }),
    IDLE,
  ],
  punt: [
    P({ lean: 4, legMode: 'anat', legs: [[6, 0], [-6, 0]], arms: [[70, 80], [74, 84]], ball: 'handsFront' }),
    P({ lean: 4, legMode: 'anat', legs: [[-10, -14], [14, 4]], arms: [[86, 90], [88, 92]], ball: 'handsFront' }),
    P({ lean: 2, legMode: 'anat', legs: [[-30, -50], [16, 6]], arms: [[70, 60], [72, 62]] }),
    P({ lean: 0, legMode: 'anat', legs: [[30, 0], [14, 6]], arms: [[-10, 0], [90, 100]], armMode: 'anat' }),
    P({ lean: -10, legMode: 'anat', legs: [[92, 80], [10, 4]], arms: [[-30, -10], [90, 110]], armMode: 'anat' }),
    P({ lean: -18, lift: 2, legMode: 'anat', legs: [[124, 112], [6, 2]], arms: [[-40, -20], [96, 126]], armMode: 'anat' }),
  ],
  kneel: [
    P({ lean: 4, legs: STAND, arms: HOLD_BALL, ball: 'hands' }),
    P({ lean: 6, legs: [[50, -40], [-10, -60]], arms: HOLD_BALL, ball: 'hands' }),
    P({ lean: 4, legs: [[82, 0], [0, -92]], arms: HOLD_BALL, ball: 'hands' }),
    P({ lean: 2, legs: [[84, 0], [0, -92]], arms: HOLD_BALL, ball: 'hands' }),
  ],
  getUp: [
    P({ lean: 10, rot: 90, legs: [[-4, -4], [-8, -8]], arms: [[170, 170], [166, 166]], ground: true }),
    P({ lean: 20, rot: 66, legs: [[30, -60], [10, -70]], arms: [[60, 10], [56, 6]], ground: true }),
    P({ lean: 30, legs: [[82, 0], [0, -92]], arms: [[30, 40], [10, 20]] }),
    P({ lean: 20, legs: [[84, 4], [20, -80]], arms: [[40, 60], [10, 20]] }),
    P({ lean: 14, legs: [[30, -10], [-10, -20]], arms: [[20, 40], [0, 20]] }),
    IDLE,
  ],
  celebrate: [
    P({ lean: 0, legs: STAND, arms: ARMS_REST, chest: 1 }),
    P({ lean: -2, legs: STAND, arms: [[176, 180], [170, 180]], chest: 1, flare: 3 }),
    P({ lean: -2, lift: 2, legs: [[10, -10], [-8, -12]], arms: [[174, 178], [168, 176]], flare: 3 }),
    P({ lean: 4, legs: [[14, 0], [-12, -8]], arms: [[60, 150], [-12, 10]], armMode: 'anat' }),
    P({ lean: 2, legs: STAND, arms: [[20, 40], [-10, 20]] }),
    IDLE,
  ],
};
