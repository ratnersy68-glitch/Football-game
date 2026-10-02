/**
 * Builds the 22 athletes for the playable game from the generated college rosters (real schools, generated
 * players) plus the user's created player at QB.
 */
import type { Player } from '../../models/types';
import { buildExhibition } from '../../simulation/world';
import { teamRatings } from '../../simulation/teamRatings';
import type { UnitRatings } from './possession';
import { ratings as createdRatings, type CreatedPlayer, type PositionId } from '../../career/player';
import type { AthleteSpec, Ratings, Role } from './types';

const base = (): Ratings => ({
  speed: 70,
  acceleration: 70,
  agility: 70,
  strength: 70,
  weight: 210,
  height: 74,
  catching: 50,
  routeRunning: 50,
  release: 50,
  contested: 50,
  blocking: 40,
  passRush: 40,
  tackle: 50,
  coverage: 40,
  ballSkills: 40,
  awareness: 65,
  breakTackle: 55,
  juke: 55,
  spin: 50,
  stiffArm: 50,
  carry: 70,
  throwPower: 50,
  shortAccuracy: 40,
  mediumAccuracy: 40,
  deepAccuracy: 40,
  throwOnRun: 40,
  underPressure: 50,
  breakSack: 50,
  playAction: 50,
  stamina: 80,
});

/** Map a generated college player's position attributes to engine ratings. */
export function toRatings(p: Player): Ratings {
  const a = p.attributes;
  const r = base();
  r.weight = p.weight;
  r.height = p.height;
  r.awareness = Math.round(55 + (p.overall - 60) * 0.7);
  switch (p.position) {
    case 'QB':
      Object.assign(r, {
        speed: a.speed,
        acceleration: a.speed - 2,
        agility: a.agility,
        throwPower: a.throwPower,
        shortAccuracy: a.shortAccuracy,
        mediumAccuracy: a.mediumAccuracy,
        deepAccuracy: a.deepAccuracy,
        throwOnRun: (a.agility + a.mediumAccuracy) / 2,
        underPressure: a.pressureHandling,
        awareness: a.decisionMaking,
        breakSack: a.pocketAwareness,
        playAction: (a.decisionMaking + a.pocketAwareness) / 2,
        strength: 60,
        carry: 65,
        catching: 45,
      });
      break;
    case 'WR':
      Object.assign(r, { speed: a.speed, acceleration: a.acceleration, agility: (a.acceleration + a.routeRunning) / 2, catching: a.hands, routeRunning: a.routeRunning, release: a.release, contested: a.contestedCatch, breakTackle: 45 + a.yac * 0.3, juke: a.yac, spin: a.yac - 5, strength: 55, tackle: 35 });
      break;
    case 'TE':
      Object.assign(r, { speed: a.speed, acceleration: a.speed - 2, agility: 65, catching: a.hands, routeRunning: a.routeRunning, release: 60, contested: a.contestedCatch, blocking: (a.runBlock + a.passBlock) / 2, strength: a.strength, breakTackle: 70, tackle: 45 });
      break;
    case 'RB':
      Object.assign(r, { speed: a.speed, acceleration: a.acceleration, agility: a.elusiveness, catching: a.receiving, routeRunning: a.receiving - 5, release: 60, contested: 50, blocking: a.passProtection, breakTackle: a.power, juke: a.elusiveness, spin: a.elusiveness - 3, stiffArm: a.power, carry: a.ballSecurity, strength: a.power - 5, tackle: 40 });
      break;
    case 'OL':
      Object.assign(r, { speed: 55, acceleration: 58, agility: 50, blocking: a.passBlock * 0.7 + a.footwork * 0.3, strength: a.strength, tackle: 40 });
      break;
    case 'DL':
      Object.assign(r, { speed: 60 + (a.passRush - 70) * 0.5, acceleration: 68, agility: 60, passRush: a.passRush * 0.7 + a.blockShed * 0.3, strength: a.strength, tackle: a.runDefense * 0.5 + a.blockShed * 0.5 });
      break;
    case 'LB':
      Object.assign(r, { speed: a.speed, acceleration: a.speed, agility: 70, tackle: a.tackling, coverage: a.coverage, ballSkills: a.coverage - 10, awareness: a.awareness, passRush: a.blockShed * 0.8, strength: 72 });
      break;
    case 'CB':
    case 'S':
      Object.assign(r, { speed: a.speed, acceleration: a.acceleration, agility: a.acceleration, tackle: a.tackling, coverage: a.manCoverage * 0.5 + a.zoneCoverage * 0.5, ballSkills: a.ballSkills, awareness: 55 + a.zoneCoverage * 0.3, passRush: 50, strength: 60 });
      break;
  }
  for (const k of Object.keys(r) as (keyof Ratings)[]) if (k !== 'weight' && k !== 'height') r[k] = Math.round(Math.max(20, Math.min(99, r[k])));
  return r;
}

/** Engine ratings the created player's position doesn't build directly. */
const CREATED_DEFAULTS: Record<PositionId, Partial<Ratings>> = {
  QB: { catching: 45, carry: 65 },
  RB: { release: 62, contested: 52, tackle: 40, routeRunning: 55 },
  WR: { blocking: 45, carry: 72, stiffArm: 50, tackle: 35 },
  TE: { juke: 50, spin: 45, carry: 72, agility: 64, tackle: 45 },
};

export function createdToRatings(cp: CreatedPlayer): Ratings {
  const q = createdRatings(cp);
  const r = base();
  Object.assign(r, CREATED_DEFAULTS[cp.position] ?? {}, q);
  r.weight = cp.weight;
  r.height = cp.heightIn;
  if (cp.position === 'QB') {
    r.breakTackle = Math.round((q.strength + q.breakSack) / 2);
    r.juke = Math.round((q.agility + q.speed) / 2 - 4);
    r.spin = Math.round(q.agility - 6);
    r.stiffArm = Math.round(q.strength - 4);
  }
  return r;
}

const name = (p: Player) => `${p.firstName[0]}. ${p.lastName}`;

export interface MatchRoster {
  specs: AthleteSpec[];
  userId: string;
  offenseTeam: string;
  defenseTeam: string;
  /** Roster-based unit ratings, for simulated possessions. */
  units: { us: UnitRatings; them: UnitRatings };
}

/** The offensive slot the created player occupies. */
export function slotForPosition(pos: PositionId): string {
  return pos === 'QB' ? 'QB' : pos === 'RB' ? 'RB' : pos === 'TE' ? 'Y' : 'X';
}

export function buildMatch(cp: CreatedPlayer, opponentId = 'michigan', seed = 26): MatchRoster {
  const us = cp.teamId;
  const world = buildExhibition(us, opponentId, seed);
  const pick = (teamId: string, pos: Player['position'], n: number, skip: string[] = []) =>
    world.teams[teamId].depthChart[pos]
      .map((id) => world.players[id])
      .filter((p) => p && !skip.includes(p.id))
      .slice(0, n);
  const specs: AthleteSpec[] = [];
  const add = (p: Player, side: 'off' | 'def', role: Role, slot: string) =>
    specs.push({ id: p.id, side, role, slot, name: name(p), number: p.jersey, ratings: toRatings(p) });

  // Offense: the user takes his position's slot; everybody else comes from the real depth chart.
  const userId = 'user';
  const userSlot = slotForPosition(cp.position);
  const userRole: Role = cp.position === 'QB' ? 'QB' : cp.position === 'RB' ? 'RB' : cp.position === 'TE' ? 'TE' : 'WR';
  specs.push({
    id: userId,
    side: 'off',
    role: userRole,
    slot: userSlot,
    name: `${cp.firstName[0] ?? 'Q'}. ${cp.lastName || 'Player'}`,
    number: cp.jersey,
    ratings: createdToRatings(cp),
    user: true,
  });
  if (userSlot !== 'QB') add(pick(us, 'QB', 1)[0], 'off', 'QB', 'QB');
  const wrSlots = ['X', 'Z', 'H'].filter((s) => s !== userSlot);
  pick(us, 'WR', wrSlots.length).forEach((p, i) => add(p, 'off', 'WR', wrSlots[i]));
  if (userSlot !== 'Y') add(pick(us, 'TE', 1)[0], 'off', 'TE', 'Y');
  if (userSlot !== 'RB') add(pick(us, 'RB', 1)[0], 'off', 'RB', 'RB');
  pick(us, 'OL', 5).forEach((p, i) => add(p, 'off', 'OL', ['LT', 'LG', 'C', 'RG', 'RT'][i]));
  // Avoid the user's number on a teammate.
  for (const s of specs) if (s.side === 'off' && s.id !== userId && s.number === cp.jersey) s.number = s.number + 20 > 99 ? s.number - 20 : s.number + 20;

  // Defense: nickel 4-2-5.
  const dl = pick(opponentId, 'DL', 4);
  ['LE', 'DT1', 'DT2', 'RE'].forEach((sl, i) => add(dl[i], 'def', 'DL', sl));
  const lb = pick(opponentId, 'LB', 2);
  add(lb[0], 'def', 'LB', 'MLB');
  add(lb[1], 'def', 'LB', 'WLB');
  const cb = pick(opponentId, 'CB', 3);
  add(cb[0], 'def', 'CB', 'CB1');
  add(cb[1], 'def', 'CB', 'CB2');
  add(cb[2], 'def', 'CB', 'NB');
  const s = pick(opponentId, 'S', 2);
  add(s[0], 'def', 'S', 'FS');
  add(s[1], 'def', 'S', 'SS');
  const tr = (id: string) => teamRatings(world.teams[id], world.players);
  const u = tr(us);
  const t = tr(opponentId);
  return { specs, userId, offenseTeam: us, defenseTeam: opponentId, units: { us: { offense: u.offense, defense: u.defense }, them: { offense: t.offense, defense: t.defense } } };
}

/** Real teammates for the phone: name, position and number of key players on the user's team. */
export function teammates(teamId: string, seed = 26): { id: string; first: string; last: string; position: string; number: number; year: string }[] {
  const world = buildExhibition(teamId, teamId === 'michigan' ? 'ohio_state' : 'michigan', seed);
  const t = world.teams[teamId];
  const out: { id: string; first: string; last: string; position: string; number: number; year: string }[] = [];
  for (const pos of ['QB', 'RB', 'WR', 'TE', 'OL', 'LB', 'CB', 'S', 'DL'] as const) {
    for (const id of t.depthChart[pos].slice(0, pos === 'WR' || pos === 'OL' ? 2 : 1)) {
      const p = world.players[id];
      out.push({ id: p.id, first: p.firstName, last: p.lastName, position: pos, number: p.jersey, year: String(p.year) });
    }
  }
  return out;
}

/** Jersey numbers already worn on the team's roster (for the number request). */
export function takenNumbers(teamId: string, seed = 26): Set<number> {
  const world = buildExhibition(teamId, teamId === 'michigan' ? 'ohio_state' : 'michigan', seed);
  const t = world.teams[teamId];
  const qbs = t.depthChart.QB.slice(0, 3);
  // Returning QBs keep their numbers; other skill players too.
  const keep = [...qbs, ...t.depthChart.WR.slice(0, 5), ...t.depthChart.RB.slice(0, 2), ...t.depthChart.CB.slice(0, 4), ...t.depthChart.S.slice(0, 3)];
  return new Set(keep.map((id) => world.players[id].jersey));
}
