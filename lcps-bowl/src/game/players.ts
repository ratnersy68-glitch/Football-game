import { RNG } from './rng';
import { FIRST_NAMES, LAST_NAMES } from '../data/names';
import type { Attributes, AttrKey, Grade, PlayerData, Position } from './types';
import { emptyStats } from './types';

/** Overall formula weights per position. */
export const OVR_WEIGHTS: Record<Position, Partial<Record<AttrKey, number>>> = {
  QB: { accu: 3, arm: 2.5, awr: 2, mob: 1, spd: 0.5, agi: 0.5 },
  RB: { spd: 2.5, elu: 2, pow: 1.2, car: 1.2, acc: 1.5, agi: 1.2, hands: 0.4 },
  WR: { spd: 2.5, hands: 2.5, route: 2, acc: 1.2, agi: 1, awr: 0.6 },
  TE: { hands: 2, rblk: 1.5, route: 1.2, str: 1, spd: 1, pblk: 0.8 },
  OL: { str: 2, rblk: 2.5, pblk: 2.5, awr: 1, agi: 0.4 },
  DL: { str: 2, rush: 2.5, shed: 2.5, tkl: 1, spd: 0.8, acc: 0.6 },
  LB: { tkl: 2.5, spd: 1.5, cov: 1.2, shed: 1, awr: 1.5, str: 0.8 },
  CB: { spd: 2.5, cov: 3, hands: 1, acc: 1.2, agi: 1, tkl: 0.5 },
  S: { spd: 2, cov: 2.2, tkl: 1.5, hands: 1, awr: 1.5 },
  K: { kpow: 3, kacc: 3 },
};

/** Typical attribute offsets relative to a player's overall (how a position "looks"). */
const POS_BIAS: Record<Position, Partial<Record<AttrKey, number>>> = {
  QB: { spd: -10, str: -20, arm: 4, accu: 2, awr: 2, mob: -6, pow: -25, elu: -15, car: -5, hands: -25, route: -40, rblk: -45, pblk: -45, rush: -50, shed: -50, tkl: -50, cov: -50, kpow: -45, kacc: -45 },
  RB: { spd: 2, str: -8, agi: 2, acc: 2, arm: -40, accu: -45, mob: -30, hands: -12, route: -18, rblk: -22, pblk: -18, rush: -45, shed: -40, tkl: -35, cov: -40, kpow: -45, kacc: -45 },
  WR: { spd: 3, str: -20, agi: 2, acc: 2, arm: -45, accu: -45, mob: -35, pow: -22, elu: -8, car: -10, rblk: -30, pblk: -35, rush: -50, shed: -45, tkl: -40, cov: -30, kpow: -45, kacc: -45 },
  TE: { spd: -10, str: 0, agi: -10, acc: -8, arm: -45, accu: -45, mob: -35, pow: -8, elu: -25, car: -10, route: -6, rush: -40, shed: -30, tkl: -30, cov: -40, kpow: -45, kacc: -45 },
  OL: { spd: -30, str: 4, agi: -20, acc: -22, arm: -50, accu: -50, mob: -45, pow: -20, elu: -45, car: -40, hands: -45, route: -50, rush: -25, shed: -25, tkl: -30, cov: -55, kpow: -50, kacc: -50 },
  DL: { spd: -18, str: 4, agi: -15, acc: -12, arm: -50, accu: -50, mob: -45, pow: -15, elu: -45, car: -40, hands: -40, route: -50, rblk: -25, pblk: -30, cov: -45, kpow: -50, kacc: -50 },
  LB: { spd: -6, str: -6, arm: -50, accu: -50, mob: -40, pow: -20, elu: -35, car: -35, hands: -25, route: -45, rblk: -30, pblk: -35, rush: -12, kpow: -50, kacc: -50 },
  CB: { spd: 3, str: -25, agi: 3, acc: 3, arm: -50, accu: -50, mob: -40, pow: -30, elu: -15, car: -25, hands: -10, route: -35, rblk: -45, pblk: -50, rush: -40, shed: -35, tkl: -12, kpow: -50, kacc: -50 },
  S: { spd: -2, str: -15, arm: -50, accu: -50, mob: -40, pow: -25, elu: -25, car: -30, hands: -12, route: -40, rblk: -45, pblk: -50, rush: -30, shed: -25, kpow: -50, kacc: -50 },
  K: { spd: -25, str: -30, agi: -20, acc: -25, awr: -10, arm: -20, accu: -35, mob: -45, pow: -45, elu: -45, car: -45, hands: -40, route: -50, rblk: -55, pblk: -55, rush: -55, shed: -55, tkl: -45, cov: -55 },
};

const ATTR_KEYS: AttrKey[] = [
  'spd', 'str', 'agi', 'acc', 'awr', 'sta', 'arm', 'accu', 'mob', 'pow', 'elu', 'car', 'hands', 'route',
  'rblk', 'pblk', 'rush', 'shed', 'tkl', 'cov', 'kpow', 'kacc',
];
export { ATTR_KEYS };

export const ATTR_LABEL: Record<AttrKey, string> = {
  spd: 'SPD', str: 'STR', agi: 'AGI', acc: 'ACC', awr: 'AWR', sta: 'STA', arm: 'ARM', accu: 'ACC%', mob: 'MOB',
  pow: 'POW', elu: 'ELU', car: 'CAR', hands: 'HND', route: 'RTE', rblk: 'RBK', pblk: 'PBK', rush: 'RSH',
  shed: 'SHD', tkl: 'TKL', cov: 'COV', kpow: 'KPW', kacc: 'KAC',
};

/** Which attributes are shown/upgradable per position. */
export const POS_KEY_ATTRS: Record<Position, AttrKey[]> = {
  QB: ['arm', 'accu', 'mob', 'awr', 'spd'],
  RB: ['spd', 'pow', 'elu', 'car', 'acc'],
  WR: ['spd', 'hands', 'route', 'acc', 'agi'],
  TE: ['hands', 'route', 'rblk', 'str', 'spd'],
  OL: ['str', 'rblk', 'pblk', 'awr', 'agi'],
  DL: ['str', 'rush', 'shed', 'tkl', 'spd'],
  LB: ['tkl', 'spd', 'cov', 'shed', 'awr'],
  CB: ['spd', 'cov', 'hands', 'acc', 'tkl'],
  S: ['spd', 'cov', 'hands', 'tkl', 'awr'],
  K: ['kpow', 'kacc'],
};

export function overall(pos: Position, a: Attributes): number {
  const w = OVR_WEIGHTS[pos];
  let s = 0;
  let t = 0;
  for (const k of Object.keys(w) as AttrKey[]) {
    s += a[k] * (w[k] as number);
    t += w[k] as number;
  }
  return Math.round(s / t);
}

const clampAttr = (x: number) => Math.max(15, Math.min(99, Math.round(x)));

const SIZE: Record<Position, { h: [number, number]; w: [number, number] }> = {
  QB: { h: [70, 76], w: [165, 215] },
  RB: { h: [67, 73], w: [160, 210] },
  WR: { h: [68, 75], w: [150, 195] },
  TE: { h: [72, 77], w: [195, 240] },
  OL: { h: [71, 77], w: [225, 305] },
  DL: { h: [71, 77], w: [210, 285] },
  LB: { h: [69, 75], w: [180, 230] },
  CB: { h: [67, 73], w: [145, 185] },
  S: { h: [69, 74], w: [160, 200] },
  K: { h: [67, 74], w: [145, 190] },
};

let idCounter = 0;
export function newPlayerId(rng: RNG): string {
  idCounter++;
  return `p${Date.now().toString(36).slice(-4)}${idCounter.toString(36)}${rng.int(0, 1295).toString(36)}`;
}

export function generateAttributes(pos: Position, targetOvr: number, rng: RNG): Attributes {
  const bias = POS_BIAS[pos];
  const a = {} as Attributes;
  for (const k of ATTR_KEYS) {
    a[k] = clampAttr(targetOvr + (bias[k] ?? 0) + rng.normal(0, 6));
  }
  a.sta = clampAttr(60 + rng.normal(0, 10) + (targetOvr - 60) * 0.4);
  // Pull key attributes to hit the target overall.
  for (let i = 0; i < 4; i++) {
    const diff = targetOvr - overall(pos, a);
    if (Math.abs(diff) < 1) break;
    for (const k of Object.keys(OVR_WEIGHTS[pos]) as AttrKey[]) a[k] = clampAttr(a[k] + diff);
  }
  return a;
}

export interface GenOptions {
  pos: Position;
  grade: Grade;
  talent: number; // team-level talent baseline (~45-85)
  rng: RNG;
  usedNumbers?: Set<number>;
  potentialBoost?: number;
}

const NUMBER_RANGES: Record<Position, [number, number][]> = {
  QB: [[1, 19]],
  RB: [[1, 49]],
  WR: [[1, 19], [80, 89]],
  TE: [[80, 89], [40, 49]],
  OL: [[50, 79]],
  DL: [[50, 79], [90, 99]],
  LB: [[30, 59], [40, 49]],
  CB: [[1, 39]],
  S: [[1, 49]],
  K: [[1, 19], [90, 99]],
};

export function pickNumber(pos: Position, rng: RNG, used: Set<number>): number {
  for (let tries = 0; tries < 60; tries++) {
    const [lo, hi] = rng.pick(NUMBER_RANGES[pos]);
    const n = rng.int(lo, hi);
    if (!used.has(n)) {
      used.add(n);
      return n;
    }
  }
  for (let n = 1; n < 100; n++) if (!used.has(n)) { used.add(n); return n; }
  return 0;
}

export function generatePlayer(o: GenOptions): PlayerData {
  const { pos, grade, talent, rng } = o;
  const gradeBonus = { 9: -9, 10: -4, 11: 0, 12: 4 }[grade];
  const target = Math.max(30, Math.min(94, talent + gradeBonus + rng.normal(0, 7)));
  const attrs = generateAttributes(pos, target, rng);
  const ovr = overall(pos, attrs);
  const potential = Math.max(ovr + 2, Math.min(99, Math.round(ovr + (12 - grade) * rng.range(2, 6) + rng.normal(4, 6) + (o.potentialBoost ?? 0))));
  const size = SIZE[pos];
  const growth = (12 - grade) * 0.4;
  const used = o.usedNumbers ?? new Set<number>();
  return {
    id: newPlayerId(rng),
    first: rng.pick(FIRST_NAMES),
    last: rng.pick(LAST_NAMES),
    number: pickNumber(pos, rng, used),
    pos,
    grade,
    height: Math.round(rng.range(size.h[0], size.h[1]) - growth),
    weight: Math.round(rng.range(size.w[0], size.w[1]) - growth * 6),
    attrs,
    potential,
    xp: 0,
    level: 1,
    pendingUpgrades: 0,
    morale: 70,
    season: emptyStats(),
    career: emptyStats(),
    history: [],
  };
}

/** Roster composition for a high school varsity squad. */
export const ROSTER_TEMPLATE: Record<Position, number> = {
  QB: 3, RB: 4, WR: 6, TE: 3, OL: 9, DL: 7, LB: 6, CB: 5, S: 4, K: 1,
};

export function generateRoster(offTalent: number, defTalent: number, stTalent: number, rng: RNG): PlayerData[] {
  const used = new Set<number>();
  const roster: PlayerData[] = [];
  const grades: Grade[] = [9, 10, 11, 12];
  for (const pos of Object.keys(ROSTER_TEMPLATE) as Position[]) {
    const talent = pos === 'K' ? stTalent : ['QB', 'RB', 'WR', 'TE', 'OL'].includes(pos) ? offTalent : defTalent;
    for (let i = 0; i < ROSTER_TEMPLATE[pos]; i++) {
      // Starters skew upperclassmen.
      const grade = i === 0 ? rng.weighted(grades, [0.5, 1.5, 3, 4]) : rng.weighted(grades, [2, 2.5, 2.5, 2.5]);
      roster.push(generatePlayer({ pos, grade, talent, rng, usedNumbers: used }));
    }
  }
  return roster;
}

export const ovr = (p: PlayerData) => overall(p.pos, p.attrs);
export const fullName = (p: PlayerData) => `${p.first} ${p.last}`;
export const shortName = (p: PlayerData) => `${p.first[0]}. ${p.last}`;
export const heightStr = (inches: number) => `${Math.floor(inches / 12)}'${inches % 12}"`;
