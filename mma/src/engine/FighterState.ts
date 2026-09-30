import type { FighterData } from '../data';
import { lastName } from '../data';
import type { FighterState, Side } from './types';

export function createFighterState(data: FighterData, side: Side): FighterState {
  const stance = data.stance === 'Southpaw' ? 'southpaw' : 'orthodox';
  return {
    side, data, name: data.name, last: lastName(data.name),
    pos: { x: side === 0 ? -1.6 : 1.6, z: 0 },
    vel: { x: 0, z: 0 },
    facing: side === 0 ? 0 : Math.PI,
    stance,
    action: null, buffered: null, guard: 'none', move: { x: 0, z: 0 },
    head: 0, body: 0, legL: 0, legR: 0, daze: 0, rockedT: 0, down: null, knockdowns: 0,
    cut: 0, swelling: 0, unanswered: 0,
    stamina: 100, tank: 100,
    comboSeq: [], comboT: 0, counterT: 0, lastLandedT: -99, lastHitT: -99,
    hitFlash: 0, hitDir: 0, hitTarget: null, lastStrikeTime: -99, subScramble: 0,
    anim: '', animT: 0, form: 1,
  };
}

// ---- Derived physical quantities (metres)
export const punchReach = (f: FighterState) => 0.36 + f.data.reachIn * 0.0254 * 0.46;
export const kickReach = (f: FighterState) => 0.46 + f.data.heightIn * 0.0254 * 0.5;

export const staminaFrac = (f: FighterState) => Math.max(0, f.stamina) / 100;
/** 1 when fresh, ~0.62 when empty. */
export const fatigueFactor = (f: FighterState) => 0.62 + 0.38 * Math.sqrt(staminaFrac(f));
export const leadLegKey = (f: FighterState): 'legL' | 'legR' => (f.stance === 'orthodox' ? 'legL' : 'legR');
export const worstLeg = (f: FighterState) => Math.max(f.legL, f.legR);
export const isRocked = (f: FighterState) => f.rockedT > 0;
export const isDown = (f: FighterState) => f.down !== null;

/** Power multiplier (0.9 – 1.3 for typical fighters). */
export const powerMult = (f: FighterState) => 0.45 + f.data.attributes.power * 0.0085;

/** Speed factor applied to action durations (smaller is faster). */
export function durationMult(f: FighterState, legStrike = false) {
  const a = f.data.attributes;
  let m = 1.28 - a.speed * 0.0052;
  m *= 1 + (1 - staminaFrac(f)) * 0.32;
  if (isRocked(f)) m *= 1.22;
  if (legStrike) m *= 1 + worstLeg(f) * 0.0025;
  return m;
}

export function koThreshold(f: FighterState, T: { koThresholdBase: number; koThresholdChin: number; koHeadPenalty: number; koKnockdownPenalty: number }) {
  const a = f.data.attributes;
  let t = T.koThresholdBase + a.chin * T.koThresholdChin - f.head * T.koHeadPenalty - f.knockdowns * T.koKnockdownPenalty;
  if (f.stamina < 25) t -= 6;
  return Math.max(28, t);
}
