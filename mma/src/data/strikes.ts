/**
 * Strike definitions. Timings are in seconds for a speed-70 fighter; the StrikeSystem scales them
 * by the fighter's speed, stamina and damage. Reach is a multiplier of the fighter's punch or kick reach.
 */
export type StrikeContext = 'stand' | 'clinch' | 'groundTop' | 'groundBottom';
export type Limb = 'leadHand' | 'rearHand' | 'leadLeg' | 'rearLeg';
export type Target = 'head' | 'body' | 'leg';
export type Arc = 'straight' | 'hook' | 'upper' | 'overhand' | 'kick' | 'headKick' | 'spin' | 'knee' | 'elbow' | 'ground';

export interface StrikeDef {
  id: string;
  name: string;
  context: StrikeContext;
  limb: Limb;
  kind: 'punch' | 'kick' | 'knee' | 'elbow';
  arc: Arc;
  target: Target;
  /** Multiplier of punchReach (hands/elbows) or kickReach (legs/knees). Ignored in clinch/ground. */
  reach: number;
  windup: number;
  active: number;
  recovery: number;
  damage: number;
  /** How much of the damage converts into "daze" (the short-term brain-scramble meter behind rocks/KDs). */
  daze: number;
  stamina: number;
  /** Additive hit-chance modifier. */
  accuracy: number;
  /** Counts as a significant strike. */
  sig: boolean;
  cutRisk: number;
  /** Pushes the target back (metres). */
  knockback: number;
  /** How obvious the wind-up is to the defender (1 = normal). Spinning/overhand are telegraphed. */
  telegraph: number;
  /** Signature/commentary tag for leg kicks: which leg. Leg kicks always target the defender's lead leg. */
  power: boolean;
}

const S = (d: Partial<StrikeDef> & Pick<StrikeDef, 'id' | 'name' | 'limb' | 'kind' | 'arc' | 'target'>): StrikeDef => ({
  context: 'stand', reach: 1, windup: 0.22, active: 0.08, recovery: 0.26, damage: 4, daze: 1, stamina: 2,
  accuracy: 0, sig: true, cutRisk: 0.03, knockback: 0.04, telegraph: 1, power: false, ...d,
});

export const STRIKES: Record<string, StrikeDef> = {};
const add = (s: StrikeDef) => (STRIKES[s.id] = s);

// ---- Standing punches
add(S({ id: 'jab', name: 'Jab', limb: 'leadHand', kind: 'punch', arc: 'straight', target: 'head', reach: 1.0, windup: 0.15, active: 0.07, recovery: 0.17, damage: 2.4, daze: 0.5, stamina: 1.2, accuracy: 0.1, telegraph: 0.8 }));
add(S({ id: 'cross', name: 'Cross', limb: 'rearHand', kind: 'punch', arc: 'straight', target: 'head', reach: 1.03, windup: 0.21, active: 0.08, recovery: 0.25, damage: 5.0, daze: 1.05, stamina: 2.3, accuracy: 0.02, power: true, cutRisk: 0.05 }));
add(S({ id: 'leadHook', name: 'Left Hook', limb: 'leadHand', kind: 'punch', arc: 'hook', target: 'head', reach: 0.8, windup: 0.23, active: 0.09, recovery: 0.28, damage: 5.8, daze: 1.35, stamina: 2.8, accuracy: -0.02, power: true, cutRisk: 0.05 }));
add(S({ id: 'rearHook', name: 'Right Hook', limb: 'rearHand', kind: 'punch', arc: 'hook', target: 'head', reach: 0.8, windup: 0.28, active: 0.1, recovery: 0.32, damage: 6.6, daze: 1.45, stamina: 3.3, accuracy: -0.05, power: true, cutRisk: 0.05 }));
add(S({ id: 'leadUppercut', name: 'Lead Uppercut', limb: 'leadHand', kind: 'punch', arc: 'upper', target: 'head', reach: 0.66, windup: 0.22, active: 0.09, recovery: 0.28, damage: 5.0, daze: 1.1, stamina: 2.6, accuracy: -0.02, power: true }));
add(S({ id: 'rearUppercut', name: 'Rear Uppercut', limb: 'rearHand', kind: 'punch', arc: 'upper', target: 'head', reach: 0.68, windup: 0.26, active: 0.09, recovery: 0.3, damage: 6.0, daze: 1.2, stamina: 3.0, accuracy: -0.04, power: true }));
add(S({ id: 'overhand', name: 'Overhand', limb: 'rearHand', kind: 'punch', arc: 'overhand', target: 'head', reach: 0.97, windup: 0.33, active: 0.1, recovery: 0.4, damage: 7.8, daze: 1.35, stamina: 4.2, accuracy: -0.12, power: true, telegraph: 1.3, cutRisk: 0.07 }));
add(S({ id: 'supermanPunch', name: 'Superman Punch', limb: 'rearHand', kind: 'punch', arc: 'overhand', target: 'head', reach: 1.18, windup: 0.32, active: 0.1, recovery: 0.4, damage: 6.4, daze: 1.15, stamina: 4.8, accuracy: -0.08, power: true, telegraph: 1.2 }));
add(S({ id: 'bodyJab', name: 'Body Jab', limb: 'leadHand', kind: 'punch', arc: 'straight', target: 'body', reach: 0.95, windup: 0.16, active: 0.07, recovery: 0.2, damage: 2.8, daze: 0, stamina: 1.4, accuracy: 0.12, telegraph: 0.8 }));
add(S({ id: 'bodyCross', name: 'Body Cross', limb: 'rearHand', kind: 'punch', arc: 'straight', target: 'body', reach: 0.95, windup: 0.22, active: 0.08, recovery: 0.27, damage: 5.2, daze: 0, stamina: 2.4, accuracy: 0.05, power: true }));
add(S({ id: 'leadBodyHook', name: 'Lead Body Hook', limb: 'leadHand', kind: 'punch', arc: 'hook', target: 'body', reach: 0.76, windup: 0.25, active: 0.09, recovery: 0.3, damage: 6.2, daze: 0, stamina: 3.0, accuracy: 0.02, power: true }));
add(S({ id: 'rearBodyHook', name: 'Rear Body Hook', limb: 'rearHand', kind: 'punch', arc: 'hook', target: 'body', reach: 0.76, windup: 0.28, active: 0.1, recovery: 0.32, damage: 6.8, daze: 0, stamina: 3.3, accuracy: 0, power: true }));
add(S({ id: 'spinningBackfist', name: 'Spinning Backfist', limb: 'rearHand', kind: 'punch', arc: 'spin', target: 'head', reach: 1.0, windup: 0.36, active: 0.1, recovery: 0.45, damage: 6.2, daze: 1.4, stamina: 4.5, accuracy: -0.14, power: true, telegraph: 1.4 }));

// ---- Standing kicks / knees
add(S({ id: 'leadLegKick', name: 'Inside Leg Kick', limb: 'leadLeg', kind: 'kick', arc: 'kick', target: 'leg', reach: 0.95, windup: 0.25, active: 0.09, recovery: 0.3, damage: 4.2, daze: 0, stamina: 3.0, accuracy: 0.06, telegraph: 0.9 }));
add(S({ id: 'rearLegKick', name: 'Leg Kick', limb: 'rearLeg', kind: 'kick', arc: 'kick', target: 'leg', reach: 1.0, windup: 0.32, active: 0.1, recovery: 0.36, damage: 6.6, daze: 0, stamina: 4.2, accuracy: 0.03, power: true }));
add(S({ id: 'calfKick', name: 'Calf Kick', limb: 'rearLeg', kind: 'kick', arc: 'kick', target: 'leg', reach: 0.94, windup: 0.28, active: 0.09, recovery: 0.34, damage: 6.2, daze: 0, stamina: 3.8, accuracy: 0.05, power: true, telegraph: 0.9 }));
add(S({ id: 'leadBodyKick', name: 'Lead Body Kick', limb: 'leadLeg', kind: 'kick', arc: 'kick', target: 'body', reach: 1.02, windup: 0.3, active: 0.1, recovery: 0.34, damage: 6.0, daze: 0, stamina: 4.4, accuracy: 0.0 }));
add(S({ id: 'rearBodyKick', name: 'Body Kick', limb: 'rearLeg', kind: 'kick', arc: 'kick', target: 'body', reach: 1.05, windup: 0.37, active: 0.11, recovery: 0.4, damage: 8.6, daze: 0, stamina: 5.5, accuracy: -0.03, power: true }));
add(S({ id: 'leadHeadKick', name: 'Lead Head Kick', limb: 'leadLeg', kind: 'kick', arc: 'headKick', target: 'head', reach: 1.0, windup: 0.37, active: 0.11, recovery: 0.42, damage: 8.4, daze: 1.45, stamina: 6.0, accuracy: -0.08, power: true, telegraph: 1.1 }));
add(S({ id: 'rearHeadKick', name: 'Head Kick', limb: 'rearLeg', kind: 'kick', arc: 'headKick', target: 'head', reach: 1.02, windup: 0.44, active: 0.12, recovery: 0.5, damage: 11, daze: 1.6, stamina: 7.0, accuracy: -0.12, power: true, telegraph: 1.25 }));
add(S({ id: 'frontKick', name: 'Front Kick', limb: 'leadLeg', kind: 'kick', arc: 'kick', target: 'body', reach: 1.12, windup: 0.26, active: 0.09, recovery: 0.3, damage: 4.0, daze: 0, stamina: 3.2, accuracy: 0.06, knockback: 0.45 }));
add(S({ id: 'spinningBackKick', name: 'Spinning Back Kick', limb: 'rearLeg', kind: 'kick', arc: 'spin', target: 'body', reach: 1.02, windup: 0.42, active: 0.12, recovery: 0.5, damage: 10.5, daze: 0, stamina: 7.0, accuracy: -0.1, power: true, telegraph: 1.4, knockback: 0.35 }));
add(S({ id: 'standingElbow', name: 'Elbow', limb: 'rearHand', kind: 'elbow', arc: 'elbow', target: 'head', reach: 0.5, windup: 0.22, active: 0.08, recovery: 0.28, damage: 5.6, daze: 1.3, stamina: 2.8, accuracy: 0.0, power: true, cutRisk: 0.2 }));
add(S({ id: 'leadKnee', name: 'Knee to the Body', limb: 'leadLeg', kind: 'knee', arc: 'knee', target: 'body', reach: 0.6, windup: 0.22, active: 0.09, recovery: 0.26, damage: 6.0, daze: 0, stamina: 3.0, accuracy: 0.04 }));
add(S({ id: 'stepKnee', name: 'Step-in Knee', limb: 'rearLeg', kind: 'knee', arc: 'knee', target: 'head', reach: 0.62, windup: 0.26, active: 0.1, recovery: 0.3, damage: 8.0, daze: 1.4, stamina: 4.2, accuracy: -0.06, power: true }));
add(S({ id: 'flyingKnee', name: 'Flying Knee', limb: 'rearLeg', kind: 'knee', arc: 'knee', target: 'head', reach: 0.95, windup: 0.38, active: 0.12, recovery: 0.55, damage: 11, daze: 1.7, stamina: 7.0, accuracy: -0.16, power: true, telegraph: 1.3 }));

// ---- Clinch
const C = (d: Parameters<typeof S>[0]) => S({ context: 'clinch', reach: 0, ...d });
add(C({ id: 'clinchPunch', name: 'Short Punch', limb: 'rearHand', kind: 'punch', arc: 'hook', target: 'head', windup: 0.17, active: 0.07, recovery: 0.2, damage: 2.8, daze: 0.8, stamina: 1.6, accuracy: 0.08 }));
add(C({ id: 'clinchBodyPunch', name: 'Body Shot', limb: 'leadHand', kind: 'punch', arc: 'hook', target: 'body', windup: 0.17, active: 0.07, recovery: 0.2, damage: 3.0, daze: 0, stamina: 1.6, accuracy: 0.1 }));
add(C({ id: 'clinchElbow', name: 'Elbow', limb: 'rearHand', kind: 'elbow', arc: 'elbow', target: 'head', windup: 0.22, active: 0.08, recovery: 0.28, damage: 5.4, daze: 1.3, stamina: 2.8, accuracy: 0.0, power: true, cutRisk: 0.22 }));
add(C({ id: 'clinchKneeBody', name: 'Knee to the Body', limb: 'rearLeg', kind: 'knee', arc: 'knee', target: 'body', windup: 0.24, active: 0.09, recovery: 0.28, damage: 5.6, daze: 0, stamina: 3.0, accuracy: 0.06 }));
add(C({ id: 'clinchKneeHead', name: 'Knee to the Head', limb: 'rearLeg', kind: 'knee', arc: 'knee', target: 'head', windup: 0.3, active: 0.1, recovery: 0.34, damage: 7.8, daze: 1.3, stamina: 4.2, accuracy: -0.1, power: true }));

// ---- Ground (top)
const GT = (d: Omit<Parameters<typeof S>[0], 'arc'>) => S({ context: 'groundTop', reach: 0, arc: 'ground', ...d });
add(GT({ id: 'gPunch', name: 'Ground Punch', limb: 'rearHand', kind: 'punch', target: 'head', windup: 0.2, active: 0.08, recovery: 0.24, damage: 2.6, daze: 0.9, stamina: 1.8, accuracy: 0.02 }));
add(GT({ id: 'gBodyPunch', name: 'Body Punch', limb: 'leadHand', kind: 'punch', target: 'body', windup: 0.18, active: 0.07, recovery: 0.22, damage: 2.6, daze: 0, stamina: 1.5, accuracy: 0.08 }));
add(GT({ id: 'gElbow', name: 'Elbow', limb: 'rearHand', kind: 'elbow', target: 'head', windup: 0.24, active: 0.08, recovery: 0.28, damage: 3.6, daze: 1.1, stamina: 2.5, accuracy: -0.02, cutRisk: 0.3, power: true }));
add(GT({ id: 'gHammer', name: 'Hammerfist', limb: 'leadHand', kind: 'punch', target: 'head', windup: 0.16, active: 0.07, recovery: 0.2, damage: 2.2, daze: 0.8, stamina: 1.3, accuracy: 0.06 }));

// ---- Ground (bottom)
const GB = (d: Omit<Parameters<typeof S>[0], 'arc'>) => S({ context: 'groundBottom', reach: 0, arc: 'ground', ...d });
add(GB({ id: 'gUpPunch', name: 'Punch from Bottom', limb: 'rearHand', kind: 'punch', target: 'head', windup: 0.2, active: 0.07, recovery: 0.24, damage: 1.7, daze: 0.35, stamina: 1.5, accuracy: -0.02, sig: false }));
add(GB({ id: 'gUpElbow', name: 'Elbow from Bottom', limb: 'rearHand', kind: 'elbow', target: 'head', windup: 0.22, active: 0.08, recovery: 0.28, damage: 3.0, daze: 0.55, stamina: 2.0, accuracy: -0.04, cutRisk: 0.25 }));

/** Logical strike buttons (keyboard J K U I N M, or pad equivalents). */
export type StrikeButton = 'jab' | 'cross' | 'leadHook' | 'rearHook' | 'leadKick' | 'rearKick';
export interface StrikeMods {
  body: boolean;    // E
  special: boolean; // Q
  high: boolean;    // Shift
}

/**
 * Maps a button + modifiers to a strike id for the current context. Pure function shared by the
 * player controller and documentation (controls screen).
 */
export function resolveStrike(ctx: StrikeContext, btn: StrikeButton, m: StrikeMods, close = false): string {
  if (ctx === 'clinch') {
    switch (btn) {
      case 'jab': case 'cross': return m.body ? 'clinchBodyPunch' : 'clinchPunch';
      case 'leadHook': case 'rearHook': return 'clinchElbow';
      case 'leadKick': case 'rearKick': return m.high ? 'clinchKneeHead' : 'clinchKneeBody';
    }
  }
  if (ctx === 'groundTop') {
    switch (btn) {
      case 'jab': case 'cross': return m.body ? 'gBodyPunch' : 'gPunch';
      case 'leadHook': case 'rearHook': return 'gElbow';
      default: return 'gHammer';
    }
  }
  if (ctx === 'groundBottom') {
    return btn === 'leadHook' || btn === 'rearHook' ? 'gUpElbow' : 'gUpPunch';
  }
  // standing
  if (m.special && m.high) {
    if (btn === 'leadKick') return 'spinningBackKick';
    if (btn === 'rearKick') return 'flyingKnee';
    if (btn === 'jab' || btn === 'cross') return 'supermanPunch';
    return btn === 'leadHook' ? 'leadUppercut' : 'rearUppercut';
  }
  switch (btn) {
    case 'jab': return m.special ? 'spinningBackfist' : m.body ? 'bodyJab' : 'jab';
    case 'cross': return m.special ? 'overhand' : m.body ? 'bodyCross' : 'cross';
    case 'leadHook': return m.special ? (close ? 'standingElbow' : 'leadUppercut') : m.body ? 'leadBodyHook' : 'leadHook';
    case 'rearHook': return m.special ? (close ? 'standingElbow' : 'rearUppercut') : m.body ? 'rearBodyHook' : 'rearHook';
    case 'leadKick':
      if (m.special) return close ? 'leadKnee' : 'frontKick';
      return m.high ? 'leadHeadKick' : m.body ? 'leadBodyKick' : 'leadLegKick';
    case 'rearKick':
      if (m.special) return close ? 'stepKnee' : 'calfKick';
      return m.high ? 'rearHeadKick' : m.body ? 'rearBodyKick' : 'rearLegKick';
  }
}
