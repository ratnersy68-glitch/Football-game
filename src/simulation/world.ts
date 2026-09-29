/**
 * World construction: turns static team data into live programs with rosters, coaches and depth charts.
 */
import { TEAMS, TEAM_BY_ID } from '../data';
import { Rng } from '../core/rng';
import type { Coach, CoachingSettings, Player, TeamInfo, TeamRecord, TeamSeasonStats, TeamState } from '../models/types';
import { generateCoach } from './coachGenerator';
import { autoDepthChart } from './depthChart';
import { generateRoster, type IdGen } from './rosterGenerator';
import type { GameSetup, GameTeamSetup } from './game/types';

export const DEFAULT_COACHING: CoachingSettings = {
  aggressiveness: 'normal',
  runPassBalance: 0,
  tempo: 'normal',
  fourthDown: 'normal',
  blitz: 'normal',
  coverage: 'balanced',
};

export function emptyRecord(): TeamRecord {
  return { w: 0, l: 0, confW: 0, confL: 0, pf: 0, pa: 0, homeW: 0, homeL: 0, awayW: 0, awayL: 0, streak: 0 };
}

export function emptyTeamSeasonStats(): TeamSeasonStats {
  return {
    games: 0,
    points: 0,
    pointsAllowed: 0,
    totalYards: 0,
    passYards: 0,
    rushYards: 0,
    yardsAllowed: 0,
    turnovers: 0,
    takeaways: 0,
    sacks: 0,
    thirdDownAtt: 0,
    thirdDownConv: 0,
    redZoneAtt: 0,
    redZoneTD: 0,
  };
}

export interface BuiltTeam {
  state: TeamState;
  players: Player[];
  coaches: Coach[];
}

export function buildTeam(rng: Rng, nextId: IdGen, info: TeamInfo): BuiltTeam {
  const players = generateRoster(rng.fork(`roster:${info.id}`), nextId, info);
  const crng = rng.fork(`coaches:${info.id}`);
  const coaches = [generateCoach(crng, nextId, info, 'HC'), generateCoach(crng, nextId, info, 'OC'), generateCoach(crng, nextId, info, 'DC')];
  const state: TeamState = {
    id: info.id,
    currentPrestige: info.prestige,
    rosterIds: players.map((p) => p.id),
    depthChart: autoDepthChart(players),
    coachIds: { HC: coaches[0].id, OC: coaches[1].id, DC: coaches[2].id },
    offScheme: info.offense,
    defScheme: info.defense,
    record: emptyRecord(),
    stats: emptyTeamSeasonStats(),
    elo: 1500,
    pollScore: 0,
  };
  return { state, players, coaches };
}

export interface World {
  teams: Record<string, TeamState>;
  players: Record<string, Player>;
  coaches: Record<string, Coach>;
}

export function buildWorld(seed: number, nextId: IdGen, teams: TeamInfo[] = TEAMS): World {
  const rng = new Rng(seed);
  const world: World = { teams: {}, players: {}, coaches: {} };
  for (const info of teams) {
    const built = buildTeam(rng, nextId, info);
    world.teams[info.id] = built.state;
    for (const p of built.players) world.players[p.id] = p;
    for (const c of built.coaches) world.coaches[c.id] = c;
  }
  return world;
}

export function counterIdGen(start = 1, namespace = ''): { next: IdGen; peek: () => number } {
  let n = start;
  return {
    next: (prefix: string) => `${prefix}${namespace}${n++}`,
    peek: () => n,
  };
}

/** Build the GameSetup for two teams in a world. */
export function gameSetupFor(
  world: World,
  homeId: string,
  awayId: string,
  opts: {
    seed: number;
    neutralSite?: string;
    rivalry?: boolean;
    week?: number;
    settings?: Partial<Record<'home' | 'away', CoachingSettings>>;
    userSide?: 'home' | 'away' | 'both';
    promptFourthDown?: boolean;
  },
): GameSetup {
  const side = (id: string, s: 'home' | 'away'): GameTeamSetup => {
    const state = world.teams[id];
    return {
      info: TEAM_BY_ID[id],
      state,
      coaches: { HC: world.coaches[state.coachIds.HC], OC: world.coaches[state.coachIds.OC], DC: world.coaches[state.coachIds.DC] },
      settings: opts.settings?.[s] ?? { ...DEFAULT_COACHING },
      isUser: opts.userSide === s || opts.userSide === 'both',
    };
  };
  return {
    seed: opts.seed,
    home: side(homeId, 'home'),
    away: side(awayId, 'away'),
    players: world.players,
    neutralSite: opts.neutralSite,
    rivalry: opts.rivalry,
    week: opts.week,
    promptFourthDown: opts.promptFourthDown,
  };
}

/** A standalone two-team world for Quick Sim / tests. */
export function buildExhibition(homeId: string, awayId: string, seed: number): World {
  const ids = counterIdGen(1, 'x');
  return buildWorld(seed, ids.next, [TEAM_BY_ID[homeId], TEAM_BY_ID[awayId]]);
}
