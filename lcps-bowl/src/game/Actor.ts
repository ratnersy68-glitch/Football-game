import type { PlayerData, Position } from './types';
import type { Vec } from './math';

export type TeamSide = 'O' | 'D';

export type Role =
  | 'qb' // passer / holder before the ball is out
  | 'route' // receiver running a route
  | 'pblock'
  | 'rblock'
  | 'lead' // lead blocker (fullback)
  | 'carry' // runner on a designed run before/after the handoff
  | 'carrier' // has the ball
  | 'rush' // pass rusher / run defender attacking the backfield
  | 'man'
  | 'zone'
  | 'pursue'
  | 'ballhawk' // going for a thrown ball
  | 'kicker'
  | 'cover' // kick coverage
  | 'returner'
  | 'kblock' // kick-return blocker
  | 'idle';

export interface Actor {
  idx: number;
  team: TeamSide;
  p: PlayerData;
  pos: Position;
  slot: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  facing: 1 | -1;
  radius: number;
  mass: number;
  maxSpd: number;
  accel: number;
  role: Role;
  // route running
  route?: { pts: Vec[]; end: 'sit' | 'continue'; i: number; label: string };
  number?: number; // receiver icon number (1-5)
  // coverage
  manTarget?: number;
  zoneSpot?: Vec;
  zoneDeep?: boolean;
  blitzDelay?: number;
  rushLane?: number;
  // engagement
  engaged: number; // idx of engaged opponent, -1 if none
  engageT: number;
  shedFrom: number; // blocker idx we just beat
  shedCd: number;
  blockTarget: number;
  // state
  stunT: number;
  tackleCd: number;
  diveT: number;
  jukeT: number;
  jukeCd: number;
  spinT: number;
  spinCd: number;
  reactT: number; // reaction delay before switching assignment
  down: boolean;
  stamina: number;
  hist: Vec[]; // position history for coverage lag
  anim: number; // run-cycle phase
  desire: Vec; // desired direction (unit-ish) * speed fraction
  carrierTouches: number;
}

export function makeActor(idx: number, team: TeamSide, p: PlayerData, slot: string, x: number, y: number, role: Role): Actor {
  const a = p.attrs;
  const heavy = Math.max(0, (p.weight - 200) / 100);
  return {
    idx, team, p, pos: p.pos, slot, x, y, vx: 0, vy: 0, startX: x, startY: y,
    facing: team === 'O' ? 1 : -1,
    radius: 0.42 + heavy * 0.12,
    mass: p.weight / 200,
    maxSpd: 4.7 + a.spd * 0.043 - heavy * 0.25,
    accel: 8 + a.acc * 0.09,
    role,
    engaged: -1, engageT: 0, shedFrom: -1, shedCd: 0, blockTarget: -1,
    stunT: 0, tackleCd: 0, diveT: 0, jukeT: 0, jukeCd: 0, spinT: 0, spinCd: 0, reactT: 0,
    down: false, stamina: 1, hist: [], anim: Math.random() * 10, desire: { x: 0, y: 0 }, carrierTouches: 0,
  };
}

export const isFree = (a: Actor) => a.engaged < 0 && a.stunT <= 0 && !a.down;
