/**
 * Difficulty changes how the AI *thinks*, never its fighter's attributes or health.
 * Reaction times stay in a human range even on Legendary; the AI only ever sees the opponent's
 * visible actions after its reaction delay — never the player's inputs.
 */
export type DifficultyId = 'easy' | 'normal' | 'hard' | 'pro' | 'legendary';

export interface DifficultyProfile {
  id: DifficultyId;
  name: string;
  blurb: string;
  reaction: number;        // mean seconds from a visible wind-up to a defensive response
  reactionJitter: number;
  decisionInterval: number;
  defenseSkill: number;    // chance to respond at all to a perceived attack
  defenseChoice: number;   // chance the response is the *right* one for that strike
  counterRate: number;
  comboVariety: number;    // 0 = predictable favourite combos
  staminaMgmt: number;
  groundIQ: number;
  subAccuracy: number;
  subReaction: number;
  learning: number;        // exploitation of observed player tendencies
  adaptation: number;      // in-fight and between-round strategy changes
  planIQ: number;          // pre-fight matchup analysis
  cageIQ: number;
  scoreAwareness: number;
  feints: number;
  traps: boolean;
  rangeDiscipline: number;
  mistakeRate: number;
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyProfile> = {
  easy: {
    id: 'easy', name: 'Easy', blurb: 'Slow reactions, predictable combos, gasses out, rarely counters.',
    reaction: 0.46, reactionJitter: 0.15, decisionInterval: 0.6, defenseSkill: 0.25, defenseChoice: 0.4, counterRate: 0.05,
    comboVariety: 0.15, staminaMgmt: 0.05, groundIQ: 0.25, subAccuracy: 0.5, subReaction: 0.6, learning: 0, adaptation: 0,
    planIQ: 0.1, cageIQ: 0.15, scoreAwareness: 0, feints: 0, traps: false, rangeDiscipline: 0.35, mistakeRate: 0.3,
  },
  normal: {
    id: 'normal', name: 'Normal', blurb: 'A competent, well-rounded opponent.',
    reaction: 0.32, reactionJitter: 0.1, decisionInterval: 0.42, defenseSkill: 0.45, defenseChoice: 0.65, counterRate: 0.2,
    comboVariety: 0.55, staminaMgmt: 0.5, groundIQ: 0.55, subAccuracy: 0.68, subReaction: 0.45, learning: 0.15, adaptation: 0.2,
    planIQ: 0.4, cageIQ: 0.45, scoreAwareness: 0.3, feints: 0.1, traps: false, rangeDiscipline: 0.6, mistakeRate: 0.15,
  },
  hard: {
    id: 'hard', name: 'Hard', blurb: 'Recognises patterns, counters repeated attacks, smarter wrestling.',
    reaction: 0.26, reactionJitter: 0.07, decisionInterval: 0.3, defenseSkill: 0.6, defenseChoice: 0.8, counterRate: 0.4,
    comboVariety: 0.72, staminaMgmt: 0.72, groundIQ: 0.72, subAccuracy: 0.78, subReaction: 0.37, learning: 0.55, adaptation: 0.5,
    planIQ: 0.65, cageIQ: 0.7, scoreAwareness: 0.6, feints: 0.25, traps: false, rangeDiscipline: 0.75, mistakeRate: 0.08,
  },
  pro: {
    id: 'pro', name: 'Pro', blurb: 'Adapts mid-fight, manages distance and stamina, attacks weaknesses, strong cage craft.',
    reaction: 0.215, reactionJitter: 0.05, decisionInterval: 0.22, defenseSkill: 0.7, defenseChoice: 0.9, counterRate: 0.55,
    comboVariety: 0.85, staminaMgmt: 0.88, groundIQ: 0.84, subAccuracy: 0.85, subReaction: 0.31, learning: 0.78, adaptation: 0.78,
    planIQ: 0.85, cageIQ: 0.9, scoreAwareness: 0.85, feints: 0.4, traps: true, rangeDiscipline: 0.88, mistakeRate: 0.04,
  },
  legendary: {
    id: 'legendary', name: 'Legendary', blurb: 'Elite timing, learns your habits, feints, sets traps, changes strategy between rounds.',
    reaction: 0.185, reactionJitter: 0.04, decisionInterval: 0.16, defenseSkill: 0.78, defenseChoice: 0.95, counterRate: 0.7,
    comboVariety: 0.95, staminaMgmt: 0.96, groundIQ: 0.93, subAccuracy: 0.9, subReaction: 0.26, learning: 1, adaptation: 1,
    planIQ: 1, cageIQ: 1, scoreAwareness: 1, feints: 0.6, traps: true, rangeDiscipline: 0.95, mistakeRate: 0.02,
  },
};

export const DIFFICULTY_LIST = Object.values(DIFFICULTIES);
