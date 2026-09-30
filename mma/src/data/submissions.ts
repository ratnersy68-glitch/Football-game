/** Submission definitions and the positions they can be attempted from. */
export type GroundPosition = 'fullGuard' | 'halfGuard' | 'sideControl' | 'mount' | 'backControl' | 'turtle';

export const POSITION_NAMES: Record<GroundPosition, string> = {
  fullGuard: 'Full Guard',
  halfGuard: 'Half Guard',
  sideControl: 'Side Control',
  mount: 'Full Mount',
  backControl: 'Back Control',
  turtle: 'Turtle',
};

export interface SubmissionDef {
  id: string;
  name: string;
  kind: 'choke' | 'joint';
  /** Starting tightness 0-100 before skill modifiers. */
  baseStart: number;
  /** Multiplier on attacker push. */
  power: number;
  stamina: number;
}

export const SUBMISSIONS: Record<string, SubmissionDef> = {
  rnc: { id: 'rnc', name: 'Rear Naked Choke', kind: 'choke', baseStart: 38, power: 1.25, stamina: 7 },
  guillotine: { id: 'guillotine', name: 'Guillotine Choke', kind: 'choke', baseStart: 28, power: 1.05, stamina: 8 },
  armbar: { id: 'armbar', name: 'Armbar', kind: 'joint', baseStart: 30, power: 1.1, stamina: 8 },
  triangle: { id: 'triangle', name: 'Triangle Choke', kind: 'choke', baseStart: 28, power: 1.05, stamina: 8 },
  kimura: { id: 'kimura', name: 'Kimura', kind: 'joint', baseStart: 30, power: 1.0, stamina: 7 },
  armTriangle: { id: 'armTriangle', name: 'Arm-Triangle Choke', kind: 'choke', baseStart: 30, power: 1.1, stamina: 8 },
};

/**
 * Which submissions each role can attempt from each position. Index 0 = Y, 1 = E+Y, 2 = Q+Y.
 * Standing / clinch guillotines are handled separately by the grappling system.
 */
export const SUBS_FROM: Record<'top' | 'bottom', Partial<Record<GroundPosition, string[]>>> = {
  top: {
    mount: ['armTriangle', 'armbar', 'kimura'],
    sideControl: ['armTriangle', 'kimura'],
    backControl: ['rnc'],
    halfGuard: ['armTriangle', 'kimura'],
    turtle: ['guillotine', 'rnc'],
  },
  bottom: {
    fullGuard: ['triangle', 'armbar', 'kimura'],
    halfGuard: ['kimura', 'guillotine'],
  },
};

/** Position quality for the attacker (bonus to starting tightness). */
export const SUB_POSITION_BONUS: Record<string, number> = {
  'top:backControl': 12,
  'top:mount': 6,
  'top:sideControl': 2,
  'top:halfGuard': -6,
  'top:turtle': 0,
  'bottom:fullGuard': 0,
  'bottom:halfGuard': -8,
  'stand:clinch': -4,
  'stand:sprawl': 2,
};
