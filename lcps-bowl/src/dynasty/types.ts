import type { PlayerData, Position, StatLine, Weather } from '../game/types';

export type UpgradeKey = 'weightRoom' | 'practice' | 'coaching' | 'youth' | 'medicine' | 'film' | 'community';

export const UPGRADES: { key: UpgradeKey; name: string; desc: string }[] = [
  { key: 'weightRoom', name: 'Weight Room', desc: 'Bigger offseason strength & speed gains.' },
  { key: 'practice', name: 'Practice Facilities', desc: 'More weekly practice XP for every player.' },
  { key: 'coaching', name: 'Coaching Staff', desc: 'Smarter teammates on Friday nights + better development.' },
  { key: 'youth', name: 'Youth Development', desc: 'More talented incoming freshmen classes.' },
  { key: 'medicine', name: 'Sports Medicine', desc: 'Fewer injuries and faster recoveries.' },
  { key: 'film', name: 'Film Room', desc: 'Awareness growth; your defense reads tendencies better.' },
  { key: 'community', name: 'Community Support', desc: 'Bigger crowds, higher participation, prestige growth.' },
];

export interface SeasonSummary {
  year: number;
  wins: number;
  losses: number;
  districtWins: number;
  districtLosses: number;
  pf: number;
  pa: number;
  finalRank: number;
  playoff: string; // "Missed", "Regional Semifinal", "Champion"...
  champion: boolean;
  coach?: string;
}

export interface Program {
  teamId: string;
  prestige: number; // 1..5 (float)
  facilities: Record<UpgradeKey, number>; // 0..5
  points: number;
  roster: PlayerData[];
  depthOrder?: Partial<Record<Position, string[]>>;
  history: SeasonSummary[];
  championships: number[];
  regionTitles: number[];
  elo: number;
  streak: number; // +n wins, -n losses
  bestStreak: number;
}

export interface GameRecord {
  id: string;
  week: number; // 1..10, playoffs 11+
  round?: string;
  home: string;
  away: string;
  district: boolean;
  rivalry: boolean;
  neutral?: boolean;
  played: boolean;
  homeScore?: number;
  awayScore?: number;
  ot?: number;
  weather: Weather;
  story?: { headline: string; body: string[] };
  user?: boolean;
  /** One-line top performers. */
  notes?: string[];
}

export interface BracketGame {
  id: string;
  round: number; // 0-based round index
  region?: 'north' | 'south';
  slot: number;
  home?: string; // higher seed
  away?: string;
  homeSeed?: number;
  awaySeed?: number;
  gameId?: string; // GameRecord id once scheduled
  winner?: string;
}

export interface Bracket {
  year: number;
  format: 'standard' | 'expanded';
  rounds: string[];
  seeds: { north: string[]; south: string[] };
  games: BracketGame[];
  champion?: string;
  runnerUp?: string;
  finalScore?: string;
}

export interface RecordEntry {
  value: number;
  player?: string; // name
  playerId?: string;
  team: string;
  year: number;
  detail?: string;
}

export interface RecordBook {
  /** category → top entries (desc). */
  career: Record<string, RecordEntry[]>;
  season: Record<string, RecordEntry[]>;
  game: Record<string, RecordEntry[]>;
  team: Record<string, RecordEntry[]>;
}

export interface SeriesGame {
  year: number;
  week: number;
  winner: string;
  score: string;
  round?: string;
}

export interface Series {
  a: string;
  b: string;
  aWins: number;
  bWins: number;
  games: SeriesGame[];
}

export interface AwardWinner {
  award: string;
  playerId?: string;
  name: string;
  team: string;
  pos?: string;
  line: string;
}

export interface SeasonAwards {
  year: number;
  winners: AwardWinner[];
  allFirst: AwardWinner[];
  allSecond: AwardWinner[];
}

export interface NewsItem {
  year: number;
  week: number;
  kind: 'story' | 'event' | 'ranking' | 'injury' | 'award' | 'champion' | 'program';
  headline: string;
  body?: string;
  team?: string;
}

export type DynastyPhase = 'regular' | 'playoffs' | 'season_end' | 'offseason';

export interface PendingEvent {
  id: string;
  text: string;
  kind: 'injury' | 'breakout' | 'weather' | 'crowd' | 'coach' | 'facility' | 'qb' | 'return' | 'improve';
}

export interface Dynasty {
  version: 1;
  slot: 1 | 2 | 3;
  userTeam: string;
  coachName: string;
  startYear: number;
  year: number;
  week: number; // next regular-season week (1..10); in playoffs: next round index
  phase: DynastyPhase;
  playoffFormat: 'standard' | 'expanded';
  programs: Record<string, Program>;
  schedule: GameRecord[];
  bracket: Bracket | null;
  rankings: { week: number; order: string[] }[];
  records: RecordBook;
  series: Record<string, Series>;
  awards: SeasonAwards[];
  champions: { year: number; team: string; runnerUp: string; score: string }[];
  news: NewsItem[];
  events: PendingEvent[];
  coach: { wins: number; losses: number; titles: number; playoffWins: number; seasons: number; coyAwards: number };
  /** Players who graduated from the user's program (for nostalgia + career records). */
  alumni: { name: string; pos: string; years: string; ovr: number; career: StatLine }[];
  lastOffseason?: OffseasonReport;
  /** Show the offseason report screen until the user starts the new season. */
  offseasonPending?: boolean;
}

export interface OffseasonReport {
  year: number;
  graduated: { name: string; pos: string; ovr: number }[];
  improved: { name: string; pos: string; from: number; to: number }[];
  freshmen: { name: string; pos: string; ovr: number; pot: number }[];
  prestigeFrom: number;
  prestigeTo: number;
  pointsEarned: number;
}
