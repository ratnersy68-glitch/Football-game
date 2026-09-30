import type { DifficultyId } from '../ai/Difficulty';
import type { FighterData } from '../data';

export type FightContext = 'quick' | 'main' | 'tournament';

export interface FightSetup {
  fighters: [FighterData, FighterData];
  /** The player always fights out of the red corner (side 0). */
  difficulty: DifficultyId;
  arenaId: string;
  rounds: number;
  clockSpeed: number;
  context: FightContext;
  title?: string;
  seed?: number;
}
