/**
 * Playbook: formations, routes, offensive plays and defensive calls.
 *
 * Coordinates are in yards relative to the ball at the snap:
 *   dx: + is downfield (toward the opponent's end zone), - is the offensive backfield.
 *   dy: + is toward the bottom sideline of the screen.
 * Route waypoints use (downfield, inward) where inward points toward the middle of the field from the
 * receiver's alignment, so one route definition works on either side.
 */

export type SkillSlot = 'X' | 'Z' | 'S' | 'Y' | 'H' | 'F';
export type OLSlot = 'LT' | 'LG' | 'C' | 'RG' | 'RT';

export interface SlotSpec {
  slot: SkillSlot;
  pos: 'WR' | 'TE' | 'RB';
  dx: number;
  dy: number;
}

export interface Formation {
  id: string;
  name: string;
  qbDepth: number; // yards behind LOS
  skill: SlotSpec[];
}

const OL_DY: Record<OLSlot, number> = { LT: -2.6, LG: -1.3, C: 0, RG: 1.3, RT: 2.6 };
export const OL_SLOTS: OLSlot[] = ['LT', 'LG', 'C', 'RG', 'RT'];
export const olDy = (s: OLSlot) => OL_DY[s];

export const FORMATIONS: Record<string, Formation> = {
  gun_spread: {
    id: 'gun_spread', name: 'Shotgun Spread', qbDepth: 5,
    skill: [
      { slot: 'X', pos: 'WR', dx: -0.6, dy: -19 },
      { slot: 'S', pos: 'WR', dx: -1.4, dy: -10 },
      { slot: 'Y', pos: 'TE', dx: -1.4, dy: 9 },
      { slot: 'Z', pos: 'WR', dx: -0.6, dy: 19 },
      { slot: 'H', pos: 'RB', dx: -5.2, dy: 1.8 },
    ],
  },
  gun_trips: {
    id: 'gun_trips', name: 'Shotgun Trips', qbDepth: 5,
    skill: [
      { slot: 'X', pos: 'WR', dx: -0.6, dy: -19 },
      { slot: 'Y', pos: 'TE', dx: -1.0, dy: 4.2 },
      { slot: 'S', pos: 'WR', dx: -1.4, dy: 10.5 },
      { slot: 'Z', pos: 'WR', dx: -0.6, dy: 18 },
      { slot: 'H', pos: 'RB', dx: -5.2, dy: -1.8 },
    ],
  },
  singleback: {
    id: 'singleback', name: 'Singleback', qbDepth: 1.2,
    skill: [
      { slot: 'X', pos: 'WR', dx: -0.6, dy: -18 },
      { slot: 'S', pos: 'WR', dx: -1.4, dy: -10 },
      { slot: 'Y', pos: 'TE', dx: -0.8, dy: 4.0 },
      { slot: 'Z', pos: 'WR', dx: -1.4, dy: 17 },
      { slot: 'H', pos: 'RB', dx: -6.5, dy: 0 },
    ],
  },
  iform: {
    id: 'iform', name: 'I-Formation', qbDepth: 1.2,
    skill: [
      { slot: 'X', pos: 'WR', dx: -0.6, dy: -18 },
      { slot: 'Y', pos: 'TE', dx: -0.8, dy: 4.0 },
      { slot: 'Z', pos: 'WR', dx: -1.4, dy: 16 },
      { slot: 'F', pos: 'RB', dx: -4.0, dy: 0 },
      { slot: 'H', pos: 'RB', dx: -7.0, dy: 0 },
    ],
  },
  pistol: {
    id: 'pistol', name: 'Pistol', qbDepth: 3.5,
    skill: [
      { slot: 'X', pos: 'WR', dx: -0.6, dy: -18 },
      { slot: 'S', pos: 'WR', dx: -1.4, dy: 10 },
      { slot: 'Y', pos: 'TE', dx: -0.8, dy: -4.0 },
      { slot: 'Z', pos: 'WR', dx: -0.6, dy: 18 },
      { slot: 'H', pos: 'RB', dx: -6.5, dy: 0 },
    ],
  },
  goal_line: {
    id: 'goal_line', name: 'Goal Line', qbDepth: 1.2,
    skill: [
      { slot: 'X', pos: 'TE', dx: -0.8, dy: -4.0 },
      { slot: 'Y', pos: 'TE', dx: -0.8, dy: 4.0 },
      { slot: 'Z', pos: 'WR', dx: -1.2, dy: 12 },
      { slot: 'F', pos: 'RB', dx: -4.0, dy: 0 },
      { slot: 'H', pos: 'RB', dx: -6.8, dy: 0 },
    ],
  },
  punt: {
    id: 'punt', name: 'Punt', qbDepth: 12,
    skill: [
      { slot: 'X', pos: 'WR', dx: -0.6, dy: -20 },
      { slot: 'Z', pos: 'WR', dx: -0.6, dy: 20 },
      { slot: 'Y', pos: 'TE', dx: -1.0, dy: 3.9 },
      { slot: 'S', pos: 'TE', dx: -1.0, dy: -3.9 },
      { slot: 'H', pos: 'RB', dx: -6.5, dy: 1 },
    ],
  },
};

export interface RouteDef {
  pts: [number, number][]; // (downfield, inward) waypoints relative to alignment
  end: 'sit' | 'continue';
  label: string;
}

export const ROUTES: Record<string, RouteDef> = {
  go: { pts: [[45, -1]], end: 'continue', label: 'GO' },
  fade: { pts: [[5, -1.5], [45, -4]], end: 'continue', label: 'FADE' },
  seam: { pts: [[45, 1]], end: 'continue', label: 'SEAM' },
  slant: { pts: [[2, 0], [9, 7]], end: 'continue', label: 'SLANT' },
  quick_out: { pts: [[5, 0], [5.5, -14]], end: 'continue', label: 'OUT' },
  out: { pts: [[10, 0], [10.5, -14]], end: 'continue', label: 'OUT' },
  hitch: { pts: [[6, 0], [5, 0.5]], end: 'sit', label: 'HITCH' },
  curl: { pts: [[12, 0], [10, 1.5]], end: 'sit', label: 'CURL' },
  stick: { pts: [[6, 0], [6, 1.5]], end: 'sit', label: 'STICK' },
  dig: { pts: [[12, 0], [12.5, 22]], end: 'continue', label: 'DIG' },
  post: { pts: [[11, 0], [36, 12]], end: 'continue', label: 'POST' },
  corner: { pts: [[11, 0], [26, -10]], end: 'continue', label: 'CORNER' },
  drag: { pts: [[2, 0], [4, 30]], end: 'continue', label: 'DRAG' },
  shallow: { pts: [[1.5, 0], [5, 30]], end: 'continue', label: 'CROSS' },
  deep_cross: { pts: [[9, 0], [18, 30]], end: 'continue', label: 'CROSS' },
  flat: { pts: [[1, -3], [3, -12], [4, -20]], end: 'sit', label: 'FLAT' },
  wheel: { pts: [[1, -5], [5, -10], [40, -11]], end: 'continue', label: 'WHEEL' },
  swing: { pts: [[-1.5, -4], [1, -12], [3, -18]], end: 'sit', label: 'SWING' },
  angle: { pts: [[2, -3], [7, 5]], end: 'continue', label: 'ANGLE' },
  check: { pts: [[1.5, -3], [5, -4]], end: 'sit', label: 'CHECK' },
  screen: { pts: [[-2.5, -4], [-2.5, -7]], end: 'sit', label: 'SCREEN' },
  bubble: { pts: [[-1.5, -2], [-0.5, -5]], end: 'sit', label: 'BUBBLE' },
  te_screen: { pts: [[-1, 2], [0, 4]], end: 'sit', label: 'SCREEN' },
  block: { pts: [], end: 'sit', label: 'BLOCK' },
  release: { pts: [[3, 0], [12, 0]], end: 'continue', label: 'RELEASE' },
};

export type PlayCategory = 'RUN' | 'SHORT' | 'MEDIUM' | 'DEEP' | 'PLAY ACTION' | 'SCREEN' | 'SPECIAL';
export const PLAY_CATEGORIES: PlayCategory[] = ['RUN', 'SHORT', 'MEDIUM', 'DEEP', 'PLAY ACTION', 'SCREEN', 'SPECIAL'];

export type PlayKind = 'run' | 'pass' | 'option' | 'punt' | 'fg' | 'kneel' | 'spike' | 'sneak';

export interface OffPlay {
  id: string;
  name: string;
  cat: PlayCategory;
  formation: string;
  kind: PlayKind;
  routes: Partial<Record<SkillSlot, string>>;
  /** Run plays: which slot carries ('H' default, 'QB' for keepers). */
  carrier?: SkillSlot | 'QB';
  /** Run aiming point (dy relative to ball) and a counter/misdirection first step. */
  aim?: number;
  counter?: boolean;
  toss?: boolean;
  draw?: boolean;
  /** Pass plays */
  drop?: number; // dropback depth in yards
  playAction?: boolean;
  rollout?: number; // dy of boot/rollout destination
  screen?: boolean;
  desc: string;
}

const P = (p: OffPlay) => p;

export const OFFENSE_PLAYS: OffPlay[] = [
  // RUN
  P({ id: 'inside_zone', name: 'Inside Zone', cat: 'RUN', formation: 'singleback', kind: 'run', aim: 1.5, routes: { X: 'block', S: 'block', Z: 'block', Y: 'block' }, desc: 'Downhill run between the tackles. Find the crease.' }),
  P({ id: 'power', name: 'Power', cat: 'RUN', formation: 'iform', kind: 'run', aim: 3.5, routes: { X: 'block', Z: 'block', Y: 'block', F: 'block' }, desc: 'Fullback leads off-tackle. Physical football.' }),
  P({ id: 'counter', name: 'Counter', cat: 'RUN', formation: 'gun_spread', kind: 'run', aim: -4, counter: true, routes: { X: 'block', S: 'block', Z: 'block', Y: 'block' }, desc: 'Fake one way, cut back against the flow.' }),
  P({ id: 'sweep', name: 'Sweep', cat: 'RUN', formation: 'singleback', kind: 'run', aim: 11, toss: true, routes: { X: 'block', S: 'block', Z: 'block', Y: 'block' }, desc: 'Toss to the edge and race the defense to the sideline.' }),
  P({ id: 'qb_read', name: 'QB Read', cat: 'RUN', formation: 'gun_spread', kind: 'option', aim: 2, routes: { X: 'block', S: 'block', Z: 'block', Y: 'block' }, desc: 'Read option. Press 1 to give to the back, or keep it yourself.' }),
  P({ id: 'draw', name: 'Draw', cat: 'RUN', formation: 'gun_trips', kind: 'run', aim: 0.5, draw: true, routes: { X: 'go', S: 'go', Z: 'go', Y: 'block' }, desc: 'Show pass, then hand it off up the middle.' }),
  P({ id: 'iso', name: 'Iso', cat: 'RUN', formation: 'iform', kind: 'run', aim: -1.5, routes: { X: 'block', Z: 'block', Y: 'block', F: 'block' }, desc: 'Fullback isolates the linebacker. Hit the hole hard.' }),
  P({ id: 'stretch', name: 'Outside Zone', cat: 'RUN', formation: 'pistol', kind: 'run', aim: -8, routes: { X: 'block', S: 'block', Z: 'block', Y: 'block' }, desc: 'Stretch the defense wide, then plant and go.' }),

  // SHORT
  P({ id: 'slants', name: 'Slant', cat: 'SHORT', formation: 'gun_spread', kind: 'pass', drop: 3, routes: { X: 'slant', S: 'flat', Y: 'stick', Z: 'slant', H: 'check' }, desc: 'Quick slants on both sides. Get it out fast.' }),
  P({ id: 'quick_out', name: 'Quick Out', cat: 'SHORT', formation: 'gun_spread', kind: 'pass', drop: 3, routes: { X: 'quick_out', S: 'hitch', Y: 'hitch', Z: 'quick_out', H: 'block' }, desc: 'Outs and hitches. Move the chains.' }),
  P({ id: 'mesh', name: 'Mesh', cat: 'SHORT', formation: 'gun_trips', kind: 'pass', drop: 4, routes: { X: 'drag', S: 'shallow', Y: 'stick', Z: 'corner', H: 'swing' }, desc: 'Crossing drags rub defenders in man coverage.' }),
  P({ id: 'stick', name: 'Stick', cat: 'SHORT', formation: 'gun_trips', kind: 'pass', drop: 3, routes: { X: 'slant', S: 'flat', Y: 'stick', Z: 'go', H: 'check' }, desc: 'Stick-flat combo. Read the flat defender.' }),
  P({ id: 'hitch', name: 'All Hitch', cat: 'SHORT', formation: 'gun_spread', kind: 'pass', drop: 3, routes: { X: 'hitch', S: 'hitch', Y: 'hitch', Z: 'hitch', H: 'check' }, desc: 'Everybody stops at 6. Beats soft cushions.' }),

  // MEDIUM
  P({ id: 'curl', name: 'Curl Flat', cat: 'MEDIUM', formation: 'singleback', kind: 'pass', drop: 5, routes: { X: 'curl', S: 'flat', Y: 'seam', Z: 'curl', H: 'check' }, desc: 'Curls outside, flat underneath.' }),
  P({ id: 'flood', name: 'Flood', cat: 'MEDIUM', formation: 'gun_trips', kind: 'pass', drop: 5, routes: { X: 'post', Y: 'flat', S: 'out', Z: 'go', H: 'check' }, desc: 'Three levels to one side. High-low the corner.' }),
  P({ id: 'dig', name: 'Dig', cat: 'MEDIUM', formation: 'gun_spread', kind: 'pass', drop: 5, routes: { X: 'dig', S: 'seam', Y: 'dig', Z: 'go', H: 'check' }, desc: 'In-breaking routes at 12 yards.' }),
  P({ id: 'smash', name: 'Smash', cat: 'MEDIUM', formation: 'gun_spread', kind: 'pass', drop: 5, routes: { X: 'hitch', S: 'corner', Y: 'corner', Z: 'hitch', H: 'check' }, desc: 'Hitch + corner. Beats Cover 2.' }),
  P({ id: 'out', name: 'Deep Out', cat: 'MEDIUM', formation: 'singleback', kind: 'pass', drop: 5, routes: { X: 'out', S: 'curl', Y: 'drag', Z: 'out', H: 'check' }, desc: 'Sideline outs at 10. Needs an arm.' }),

  // DEEP
  P({ id: 'four_verts', name: 'Four Verticals', cat: 'DEEP', formation: 'gun_spread', kind: 'pass', drop: 6, routes: { X: 'go', S: 'seam', Y: 'seam', Z: 'go', H: 'check' }, desc: 'Everybody deep. Stress the safeties.' }),
  P({ id: 'post', name: 'Post', cat: 'DEEP', formation: 'singleback', kind: 'pass', drop: 7, routes: { X: 'post', S: 'dig', Y: 'block', Z: 'post', H: 'block' }, desc: 'Max protect, two posts. Take the shot.' }),
  P({ id: 'corner', name: 'Corner', cat: 'DEEP', formation: 'gun_trips', kind: 'pass', drop: 6, routes: { X: 'corner', Y: 'drag', S: 'corner', Z: 'post', H: 'block' }, desc: 'Corner routes away from the safety.' }),
  P({ id: 'deep_cross', name: 'Deep Cross', cat: 'DEEP', formation: 'gun_spread', kind: 'pass', drop: 6, routes: { X: 'deep_cross', S: 'go', Y: 'drag', Z: 'go', H: 'check' }, desc: 'Deep crosser behind clear-outs.' }),

  // PLAY ACTION
  P({ id: 'pa_boot', name: 'PA Boot', cat: 'PLAY ACTION', formation: 'singleback', kind: 'pass', drop: 6, playAction: true, rollout: 9, routes: { X: 'deep_cross', S: 'go', Y: 'flat', Z: 'corner', H: 'block' }, desc: 'Fake the run, boot to the right, flood the side.' }),
  P({ id: 'pa_post', name: 'PA Post', cat: 'PLAY ACTION', formation: 'iform', kind: 'pass', drop: 7, playAction: true, routes: { X: 'post', Z: 'dig', Y: 'seam', F: 'block', H: 'block' }, desc: 'Sell the run, hit the post behind the linebackers.' }),
  P({ id: 'pa_shot', name: 'PA Deep Shot', cat: 'PLAY ACTION', formation: 'pistol', kind: 'pass', drop: 7, playAction: true, routes: { X: 'go', S: 'post', Y: 'drag', Z: 'go', H: 'block' }, desc: 'Play-action go routes. Swing for the fences.' }),

  // SCREEN
  P({ id: 'rb_screen', name: 'RB Screen', cat: 'SCREEN', formation: 'gun_spread', kind: 'pass', drop: 6, screen: true, routes: { X: 'go', S: 'go', Y: 'release', Z: 'go', H: 'screen' }, desc: 'Let the rush come, dump it to the back behind a wall.' }),
  P({ id: 'bubble', name: 'Bubble Screen', cat: 'SCREEN', formation: 'gun_trips', kind: 'pass', drop: 2, screen: true, routes: { X: 'go', Y: 'block', S: 'bubble', Z: 'block', H: 'block' }, desc: 'Quick bubble to the slot with blockers out front.' }),
  P({ id: 'te_screen', name: 'TE Screen', cat: 'SCREEN', formation: 'singleback', kind: 'pass', drop: 5, screen: true, routes: { X: 'go', S: 'go', Y: 'te_screen', Z: 'go', H: 'block' }, desc: 'Tight end slips out behind the rush.' }),

  // SPECIAL
  P({ id: 'punt', name: 'Punt', cat: 'SPECIAL', formation: 'punt', kind: 'punt', routes: {}, desc: 'Flip the field.' }),
  P({ id: 'fg', name: 'Field Goal', cat: 'SPECIAL', formation: 'punt', kind: 'fg', routes: {}, desc: 'Kick it through the uprights.' }),
  P({ id: 'sneak', name: 'QB Sneak', cat: 'SPECIAL', formation: 'goal_line', kind: 'sneak', carrier: 'QB', aim: 0.4, routes: { X: 'block', Y: 'block', Z: 'block', F: 'block', H: 'block' }, desc: 'Push the pile for a yard.' }),
  P({ id: 'goal_dive', name: 'Goal Line Dive', cat: 'SPECIAL', formation: 'goal_line', kind: 'run', aim: 1.2, routes: { X: 'block', Y: 'block', Z: 'block', F: 'block' }, desc: 'Heavy set, run behind the fullback.' }),
  P({ id: 'spike', name: 'Spike', cat: 'SPECIAL', formation: 'gun_spread', kind: 'spike', routes: {}, desc: 'Stop the clock. Costs a down.' }),
  P({ id: 'kneel', name: 'QB Kneel', cat: 'SPECIAL', formation: 'singleback', kind: 'kneel', routes: {}, desc: 'Run out the clock.' }),
];

export const playById = (id: string) => {
  const p = OFFENSE_PLAYS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown play ${id}`);
  return p;
};

// ---------------- DEFENSE ----------------

export type DefFormationId = '4-3' | '3-4' | 'Nickel' | 'Dime' | 'Goal Line';
export type Coverage = 'Man' | 'Cover 2' | 'Cover 3' | 'Cover 4' | 'Blitz' | 'Zone Blitz';
export const DEF_FORMATIONS: DefFormationId[] = ['4-3', '3-4', 'Nickel', 'Dime', 'Goal Line'];
export const COVERAGES: Coverage[] = ['Man', 'Cover 2', 'Cover 3', 'Cover 4', 'Blitz', 'Zone Blitz'];

export const DEF_PERSONNEL: Record<DefFormationId, { DL: number; LB: number; CB: number; S: number }> = {
  '4-3': { DL: 4, LB: 3, CB: 2, S: 2 },
  '3-4': { DL: 3, LB: 4, CB: 2, S: 2 },
  Nickel: { DL: 4, LB: 2, CB: 3, S: 2 },
  Dime: { DL: 4, LB: 1, CB: 4, S: 2 },
  'Goal Line': { DL: 5, LB: 3, CB: 2, S: 1 },
};

export const COVERAGE_DESC: Record<Coverage, string> = {
  Man: 'Lock up every receiver one-on-one. A free safety plays deep.',
  'Cover 2': 'Two deep safeties split the field. Corners squat the flats.',
  'Cover 3': 'Three deep, four under. Safe against the deep ball.',
  'Cover 4': 'Quarters: four deep defenders. Take away everything long.',
  Blitz: 'Send extra rushers. Man coverage behind it — high risk, high reward.',
  'Zone Blitz': 'Bring a linebacker, drop a lineman. Confuse the quarterback.',
};

export interface DefCall {
  formation: DefFormationId;
  coverage: Coverage;
}
