import type { DifficultyId } from '../ai/Difficulty';
import { composites, FIGHTER_BY_ID, FIGHTERS, WEIGHT_CLASS_BY_ID, type FighterData, type WeightClassId } from '../data';
import type { FightResult } from '../engine/types';
import { simulateFight } from './SimFight';

export type TournamentDivision = WeightClassId | 'OPEN_M' | 'OPEN_F';

export interface TMatch {
  a: string | null;
  b: string | null;
  winner: string | null;
  method?: string;
  detail?: string;
  round?: number;
  time?: number;
}

export interface TournamentState {
  version: 1;
  size: 8 | 16;
  division: TournamentDivision;
  playerId: string;
  difficulty: DifficultyId;
  arenaId: string;
  clockSpeed: number;
  bracket: TMatch[][];
  round: number;
  champion: string | null;
  seeds: Record<string, number>;
}

const KEY = 'octagon.tournament.v1';

export const overall = (f: FighterData) => {
  const c = composites(f);
  return (c.STR + c.GRP + c.STA + c.PWR + c.SPD + c.DEF) / 6;
};

export function divisionPool(d: TournamentDivision): FighterData[] {
  if (d === 'OPEN_M') return FIGHTERS.filter((f) => f.gender === 'M');
  if (d === 'OPEN_F') return FIGHTERS.filter((f) => f.gender === 'F');
  return FIGHTERS.filter((f) => f.weightClass === d);
}

export function divisionLabel(d: TournamentDivision) {
  if (d === 'OPEN_M') return "Open Weight Grand Prix (Men)";
  if (d === 'OPEN_F') return "Open Weight Grand Prix (Women)";
  return WEIGHT_CLASS_BY_ID[d].name;
}

/** Standard bracket seeding order for n players (1 v n, n/2 v n/2+1, ...). */
function seedOrder(n: number): number[] {
  let order = [1];
  while (order.length < n) {
    const m = order.length * 2 + 1;
    order = order.flatMap((s) => [s, m - s]);
  }
  return order;
}

export function createTournament(opts: { size: 8 | 16; division: TournamentDivision; playerId: string; difficulty: DifficultyId; arenaId: string; clockSpeed: number }): TournamentState {
  const pool = divisionPool(opts.division).filter((f) => f.id !== opts.playerId).sort((a, b) => overall(b) - overall(a));
  const player = FIGHTER_BY_ID[opts.playerId];
  const field = [player, ...pool.slice(0, opts.size - 1)].sort((a, b) => overall(b) - overall(a));
  const seeds: Record<string, number> = {};
  field.forEach((f, i) => (seeds[f.id] = i + 1));
  const order = seedOrder(opts.size);
  const r0: TMatch[] = [];
  for (let i = 0; i < order.length; i += 2) r0.push({ a: field[order[i] - 1].id, b: field[order[i + 1] - 1].id, winner: null });
  const bracket: TMatch[][] = [r0];
  let n = r0.length;
  while (n > 1) {
    n /= 2;
    bracket.push(Array.from({ length: n }, () => ({ a: null, b: null, winner: null })));
  }
  return { version: 1, ...opts, bracket, round: 0, champion: null, seeds };
}

export function roundName(state: TournamentState, r: number) {
  const left = state.bracket[r].length * 2;
  return left === 2 ? 'Final' : left === 4 ? 'Semi-finals' : left === 8 ? 'Quarter-finals' : 'Opening Round';
}

export const isFinal = (state: TournamentState, r = state.round) => r === state.bracket.length - 1;

export function playerAlive(state: TournamentState) {
  for (const round of state.bracket) for (const m of round) if (m.winner && (m.a === state.playerId || m.b === state.playerId) && m.winner !== state.playerId) return false;
  return true;
}

export function playerMatch(state: TournamentState): TMatch | null {
  if (state.champion) return null;
  const m = state.bracket[state.round].find((x) => (x.a === state.playerId || x.b === state.playerId) && !x.winner);
  return m ?? null;
}

export function recordResult(state: TournamentState, m: TMatch, r: FightResult, sideIds: [string, string]) {
  m.winner = r.winner === null ? sideIds[Math.random() < 0.5 ? 0 : 1] : sideIds[r.winner];
  m.method = r.method === 'DRAW' ? 'DRAW (advanced on judges’ review)' : r.method;
  m.detail = r.detail;
  m.round = r.round;
  m.time = r.time;
}

/** Simulate every undecided non-player bout in the current round with the real engine (AI vs AI). */
export function simulateOthers(state: TournamentState) {
  const rounds = isFinal(state) ? 5 : 3;
  for (const m of state.bracket[state.round]) {
    if (m.winner || !m.a || !m.b || m.a === state.playerId || m.b === state.playerId) continue;
    const { result } = simulateFight(FIGHTER_BY_ID[m.a], FIGHTER_BY_ID[m.b], { rounds, difficulty: ['pro', 'pro'], clockSpeed: 2.5 });
    recordResult(state, m, result, [m.a, m.b]);
  }
}

/** Once every bout in the round has a winner, seed the next round. */
export function advance(state: TournamentState): boolean {
  const cur = state.bracket[state.round];
  if (cur.some((m) => !m.winner)) return false;
  if (isFinal(state)) {
    state.champion = cur[0].winner;
    return true;
  }
  const next = state.bracket[state.round + 1];
  cur.forEach((m, i) => {
    const slot = next[Math.floor(i / 2)];
    if (i % 2 === 0) slot.a = m.winner;
    else slot.b = m.winner;
  });
  state.round++;
  return true;
}

export function saveTournament(s: TournamentState | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function loadTournament(): TournamentState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as TournamentState;
    if (s.version !== 1 || !FIGHTER_BY_ID[s.playerId]) return null;
    return s;
  } catch {
    return null;
  }
}
