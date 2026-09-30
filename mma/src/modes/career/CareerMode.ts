/**
 * CAREER / CHAMPIONSHIP MODE — architecture hook (not exposed in the UI yet).
 *
 * Everything a career needs already exists as reusable pieces:
 *  - FightSetup + FightSession run any fight (player vs AI) and return a FightResult + stats.
 *  - simulateFight() resolves AI-vs-AI bouts on the rest of the card with the real engine.
 *  - Tournament.ts shows how multi-fight state is modelled and persisted.
 *
 * A career layer should own the state below, generate fight offers between fights, apply
 * training/ageing to Attributes, and keep rankings per division. FighterData is plain data, so a
 * career can clone a fighter and evolve its attributes without touching the engine.
 */
import type { DifficultyId } from '../../ai/Difficulty';
import type { Attributes, FighterRecord, WeightClassId } from '../../data';

export interface CareerFightLog {
  opponentId: string;
  won: boolean | null;
  method: string;
  round: number;
  time: number;
  title: boolean;
}

export interface CareerState {
  version: 1;
  fighterId: string;
  division: WeightClassId;
  attributes: Attributes;
  record: FighterRecord;
  ranking: number | null;
  champion: boolean;
  difficulty: DifficultyId;
  history: CareerFightLog[];
  /** Divisional rankings: fighter ids best-first. */
  rankings: Partial<Record<WeightClassId, string[]>>;
}

export interface CareerService {
  start(fighterId: string, difficulty: DifficultyId): CareerState;
  nextOffers(state: CareerState): string[];
  applyResult(state: CareerState, log: CareerFightLog): CareerState;
}
