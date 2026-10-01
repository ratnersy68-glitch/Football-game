/** GameState: the persistent state of a game in progress (score, inning, count, bases, lineups). */
import type { FieldPos, GameSettings, Player, Position, Team } from '../core/types';
import { TEAM_BY_ID, playerById, relievers } from '../managers/TeamManager';
import { positionPenalty } from '../managers/RosterManager';

export interface BaseOcc { player: Player; responsiblePitcherId: string; reachedOnError: boolean }
export interface LineupEntry { player: Player; pos: Position }

export interface TeamGameState {
  side: 'home' | 'away';
  team: Team;
  lineup: LineupEntry[];
  battingIdx: number;
  pitcher: Player;
  pitchersUsed: Player[];
  removed: Set<string>;
  linescore: number[];
  runs: number;
  hits: number;
  errors: number;
  pitchCounts: Map<string, number>;
  warmup: Map<string, number>; // 0..1
  warming: string | null;
  runsThisInningAllowed: number;
  lob: number;
}

export interface GameState {
  settings: GameSettings;
  inning: number;
  half: 'top' | 'bottom';
  outs: number;
  balls: number;
  strikes: number;
  bases: (BaseOcc | null)[];
  away: TeamGameState;
  home: TeamGameState;
  over: boolean;
  winner: 'home' | 'away' | null;
  log: string[];
  pitchOfRecord: { home: string | null; away: string | null };
  loserOfRecord: { home: string | null; away: string | null };
  lastLeader: 'home' | 'away' | null;
}

function makeTeamState(settings: GameSettings, side: 'home' | 'away'): TeamGameState {
  const setup = settings[side];
  const team = TEAM_BY_ID[setup.teamId];
  const lineup = setup.lineup.map((s) => ({ player: playerById(s.playerId), pos: s.pos }));
  const pitcher = playerById(setup.startingPitcherId);
  return {
    side, team, lineup, battingIdx: 0, pitcher, pitchersUsed: [pitcher], removed: new Set(),
    linescore: [], runs: 0, hits: 0, errors: 0, pitchCounts: new Map([[pitcher.id, 0]]),
    warmup: new Map(relievers(team).map((p) => [p.id, 0])), warming: null, runsThisInningAllowed: 0, lob: 0,
  };
}

export function createGameState(settings: GameSettings): GameState {
  return {
    settings,
    inning: 1,
    half: 'top',
    outs: 0,
    balls: 0,
    strikes: 0,
    bases: [null, null, null],
    away: makeTeamState(settings, 'away'),
    home: makeTeamState(settings, 'home'),
    over: false,
    winner: null,
    log: [],
    pitchOfRecord: { home: null, away: null },
    loserOfRecord: { home: null, away: null },
    lastLeader: null,
  };
}

export const battingTeam = (s: GameState) => (s.half === 'top' ? s.away : s.home);
export const fieldingTeam = (s: GameState) => (s.half === 'top' ? s.home : s.away);
export const currentBatter = (s: GameState) => {
  const t = battingTeam(s);
  return t.lineup[t.battingIdx % 9].player;
};
export const currentPitcher = (s: GameState) => fieldingTeam(s).pitcher;

export function defenseOf(t: TeamGameState): Record<FieldPos, Player> {
  const d: Partial<Record<FieldPos, Player>> = { P: t.pitcher };
  for (const e of t.lineup) if (e.pos !== 'DH' && e.pos !== 'P') d[e.pos as FieldPos] = e.player;
  // Fill any hole (shouldn't happen with a valid lineup) with the first non-pitcher.
  const fallback = t.lineup.find((e) => e.pos === 'DH')?.player ?? t.lineup[0].player;
  for (const p of ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'] as FieldPos[]) if (!d[p]) d[p] = fallback;
  return d as Record<FieldPos, Player>;
}

export function defensePenalties(t: TeamGameState): Record<FieldPos, number> {
  const d = defenseOf(t);
  const out = {} as Record<FieldPos, number>;
  for (const [pos, p] of Object.entries(d) as [FieldPos, Player][]) out[pos] = pos === 'P' ? 0 : positionPenalty(p, pos);
  return out;
}

/** Pitch budget before a pitcher is spent. */
export function pitchBudget(p: Player): number {
  const pr = p.pitcher!;
  return pr.role === 'SP' ? 55 + pr.stamina * 0.65 : 14 + pr.stamina * 0.65;
}

export function fatigue(t: TeamGameState, p: Player = t.pitcher): number {
  const n = t.pitchCounts.get(p.id) ?? 0;
  const warm = t.warmup.get(p.id);
  const coldPenalty = warm !== undefined && p !== t.pitchersUsed[0] ? (1 - Math.min(1, warm)) * 0.35 : 0;
  return n / pitchBudget(p) + coldPenalty;
}

export function scoreLine(s: GameState) {
  return { away: s.away.runs, home: s.home.runs };
}
