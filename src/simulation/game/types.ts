import type { CoachingSettings, Player, Side, TeamInfo, TeamState, Weather, Coach } from '../../models/types';

export interface GameTeamSetup {
  info: TeamInfo;
  state: TeamState;
  coaches: { HC?: Coach; OC?: Coach; DC?: Coach };
  settings: CoachingSettings;
  /** When true, the engine pauses on 4th down for a user decision (if the caller asks). */
  isUser?: boolean;
}

export interface GameSetup {
  seed: number;
  home: GameTeamSetup;
  away: GameTeamSetup;
  players: Record<string, Player>;
  neutralSite?: string;
  rivalry?: boolean;
  week?: number;
  weather?: Weather;
  /** Ask the user on their team's 4th downs. */
  promptFourthDown?: boolean;
}

export type PlayKind =
  | 'kickoff'
  | 'onside_kick'
  | 'free_kick'
  | 'run'
  | 'pass'
  | 'sack'
  | 'scramble'
  | 'punt'
  | 'field_goal'
  | 'extra_point'
  | 'two_point'
  | 'kneel'
  | 'spike'
  | 'penalty'
  | 'period_end';

export type Highlight =
  | 'TOUCHDOWN'
  | 'FIELD GOAL'
  | 'INTERCEPTION'
  | 'FUMBLE'
  | 'SAFETY'
  | 'SACK'
  | 'BIG PLAY'
  | 'TURNOVER ON DOWNS'
  | 'NO GOOD'
  | 'BLOCKED'
  | 'ONSIDE RECOVERED'
  | 'OVERTIME'
  | 'HALFTIME'
  | 'FINAL'
  | 'END OF QUARTER'
  | 'TWO-POINT GOOD'
  | 'TWO-POINT FAILED';

export interface OffLineup {
  QB: string[];
  RB: string[];
  WR: string[];
  TE: string[];
  OL: string[];
}
export interface DefLineup {
  DL: string[];
  LB: string[];
  CB: string[];
  S: string[];
}

export interface PenaltyInfo {
  on: Side;
  name: string;
  yards: number;
  autoFirst?: boolean;
  accepted: boolean;
}

export interface ScoreInfo {
  team: Side;
  type: 'TD' | 'FG' | 'XP' | '2PT' | 'SAFETY' | 'DEF2';
  points: number;
}

export interface PlayEvent {
  index: number;
  driveIndex: number;
  quarter: number;
  clockBefore: number;
  clockAfter: number;
  offense: Side;
  down: number;
  distance: number;
  ballOn: number;
  /** +1: offense moves toward the right end zone in world coordinates, -1: toward the left. */
  direction: 1 | -1;
  kind: PlayKind;
  formation?: string;
  concept?: string;
  conceptName?: string;
  defense?: { blitz: boolean; coverage: 'man' | 'zone'; front: string };
  offLineup?: OffLineup;
  defLineup?: DefLineup;
  /** Special-teams units (kicking side / receiving side) for kick plays. */
  kickUnit?: string[];
  returnUnit?: string[];
  passer?: string;
  rusher?: string;
  target?: string;
  tackler?: string;
  defender?: string;
  kicker?: string;
  returner?: string;
  yards: number;
  airYards?: number;
  yac?: number;
  complete?: boolean;
  pressured?: boolean;
  outOfBounds?: boolean;
  throwaway?: boolean;
  turnover?: 'interception' | 'fumble' | 'downs' | 'muff';
  returnYards?: number;
  kickDistance?: number;
  kickResult?: 'good' | 'no_good' | 'blocked' | 'touchback' | 'fair_catch' | 'returned' | 'downed' | 'out_of_bounds' | 'recovered' | 'muffed';
  penalty?: PenaltyInfo;
  score?: ScoreInfo;
  firstDown?: boolean;
  timeout?: Side;
  scoreAfter: { home: number; away: number };
  possessionAfter: Side;
  ballOnAfter: number;
  downAfter: number;
  distanceAfter: number;
  timeoutsAfter: { home: number; away: number };
  quarterAfter: number;
  text: string;
  highlight?: Highlight;
  injury?: { playerId: string; side: Side; type: string; weeks: number };
  /** Lateral ball spot in yards from the far sideline (visual only, deterministic). */
  spotY: number;
  spotYAfter: number;
  /** Whether a human made the call on this play. */
  userCall?: boolean;
  final?: boolean;
}

export type FourthDownChoice = 'go' | 'field_goal' | 'punt';

export interface PendingDecision {
  kind: 'fourth_down';
  side: Side;
  distance: number;
  ballOn: number;
  fieldGoalDistance: number;
  recommendation: FourthDownChoice;
  canPunt: boolean;
}

export interface StepOptions {
  fourthDown?: FourthDownChoice;
}
