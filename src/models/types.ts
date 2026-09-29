/**
 * Core domain models. Pure data (JSON-serializable) so the whole dynasty can be saved as-is.
 * Football logic lives in /simulation; these are only shapes.
 */

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'CB' | 'S' | 'K' | 'P';
export type Side = 'home' | 'away';
export type ClassYear = 1 | 2 | 3 | 4;

export type OffScheme = 'spread' | 'air_raid' | 'pro_style' | 'multiple' | 'power_run' | 'option' | 'rpo_heavy';
export type DefScheme = '4-3' | '3-4' | '4-2-5' | '3-3-5' | 'multiple';
export type Philosophy = 'national' | 'regional' | 'development' | 'transfer';

/** Static identity data for a program, loaded from /data/teams/*.json. */
export interface TeamInfo {
  id: string;
  school: string;
  nickname: string;
  abbreviation: string;
  conference: string;
  city: string;
  state: string;
  stadium: string;
  capacity: number;
  primaryColor: string;
  secondaryColor: string;
  prestige: number;
  facilities: number;
  nilStrength: number;
  recruitingPower: number;
  fanSupport: number;
  rosterStrength: number;
  academicPrestige: number;
  marketSize: number;
  offense: OffScheme;
  defense: DefScheme;
  recruitingStates: string[];
  philosophy: Philosophy;
}

export interface ConferenceInfo {
  id: string;
  name: string;
  shortName: string;
  color: string;
  playable: boolean;
  ranked: boolean;
  conferenceGames: number;
  championshipGame: { enabled: boolean; participants: number; week: number; site?: string; name?: string };
  prestige: number;
}

export interface RivalryInfo {
  id: string;
  teams: [string, string];
  name: string;
  intensity: number;
  annual: boolean;
  rivalryWeek?: boolean;
  neutralSite?: string;
}

export interface HiddenTraits {
  consistency: number;
  developmentRate: number;
  workEthic: number;
  injuryRisk: number;
  loyalty: number;
  playingTimeExpectation: number;
  nilInterest: number;
  championshipInterest: number;
  proPotential: number;
  transferRisk: number;
}

/** Counting stats. Every field optional-by-convention: missing == 0. */
export interface StatLine {
  gp?: number;
  gs?: number;
  passAtt?: number;
  passComp?: number;
  passYds?: number;
  passTD?: number;
  passInt?: number;
  passLong?: number;
  sacked?: number;
  rushAtt?: number;
  rushYds?: number;
  rushTD?: number;
  rushLong?: number;
  fumbles?: number;
  fumblesLost?: number;
  targets?: number;
  rec?: number;
  recYds?: number;
  recTD?: number;
  recLong?: number;
  tackles?: number;
  tfl?: number;
  sacks?: number;
  defInt?: number;
  intYds?: number;
  passDef?: number;
  forcedFum?: number;
  fumRec?: number;
  defTD?: number;
  fgm?: number;
  fga?: number;
  fgLong?: number;
  xpm?: number;
  xpa?: number;
  punts?: number;
  puntYds?: number;
  puntLong?: number;
  kr?: number;
  krYds?: number;
  krTD?: number;
  pr?: number;
  prYds?: number;
  prTD?: number;
}

export interface Injury {
  type: string;
  weeksRemaining: number;
  /** Season week the injury happened. */
  week: number;
}

export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  position: Position;
  archetype: string;
  year: ClassYear;
  /** Has already used a redshirt season (displayed as "RS"). */
  redshirted: boolean;
  jersey: number;
  height: number;
  weight: number;
  hometown: string;
  state: string;
  /** Star rating coming out of high school. */
  stars: number;
  attributes: Record<string, number>;
  overall: number;
  potential: number;
  hidden: HiddenTraits;
  injury: Injury | null;
  seasonStats: StatLine;
  careerStats: StatLine;
  /** Archived season lines (added at each rollover). */
  history?: PlayerSeason[];
}

export interface PlayerSeason {
  season: number;
  teamId: string;
  year: ClassYear;
  overall: number;
  stats: StatLine;
}

export type CoachRole = 'HC' | 'OC' | 'DC';

export interface CoachRatings {
  recruiting: number;
  development: number;
  offense: number;
  defense: number;
  gameManagement: number;
  motivation: number;
  scouting: number;
}

export interface Coach {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  role: CoachRole;
  age: number;
  ratings: CoachRatings;
  offScheme: OffScheme;
  defScheme: DefScheme;
  pipelineStates: string[];
  salary: number;
  contractYears: number;
  reputation: number;
  isUser: boolean;
  careerWins: number;
  careerLosses: number;
  confTitles?: number;
  natTitles?: number;
  playoffApps?: number;
  bowlWins?: number;
  bowlLosses?: number;
  draftPicks?: number;
  heismans?: number;
  coyAwards?: number;
  top5Classes?: number;
  seasons?: CoachSeason[];
}

export interface CoachSeason {
  season: number;
  teamId: string;
  w: number;
  l: number;
  finalRank: number;
  result: string;
}

export type DepthChart = Record<Position, string[]>;

export interface TeamRecord {
  w: number;
  l: number;
  confW: number;
  confL: number;
  pf: number;
  pa: number;
  homeW: number;
  homeL: number;
  awayW: number;
  awayL: number;
  streak: number; // +n win streak, -n losing streak
}

export interface TeamSeasonStats {
  games: number;
  points: number;
  pointsAllowed: number;
  totalYards: number;
  passYards: number;
  rushYards: number;
  yardsAllowed: number;
  turnovers: number;
  takeaways: number;
  sacks: number;
  thirdDownAtt: number;
  thirdDownConv: number;
  redZoneAtt: number;
  redZoneTD: number;
}

/** Mutable per-dynasty state of a program. */
export interface TeamState {
  id: string;
  currentPrestige: number;
  rosterIds: string[];
  depthChart: DepthChart;
  coachIds: Record<CoachRole, string>;
  offScheme: OffScheme;
  defScheme: DefScheme;
  record: TeamRecord;
  stats: TeamSeasonStats;
  elo: number;
  /** Most recent poll score (used for ranking inertia). */
  pollScore: number;
  /** Latest recruiting class ranking (1 = best) from the most recent signing period. */
  classRank?: number;
}

export interface GamePlayerLine extends StatLine {
  playerId: string;
  teamId: string;
}

export interface TeamGameStats {
  score: number;
  firstDowns: number;
  totalYards: number;
  passYards: number;
  rushYards: number;
  passAtt: number;
  passComp: number;
  rushAtt: number;
  turnovers: number;
  sacks: number;
  sackYards: number;
  penalties: number;
  penaltyYards: number;
  thirdDownAtt: number;
  thirdDownConv: number;
  fourthDownAtt: number;
  fourthDownConv: number;
  redZoneAtt: number;
  redZoneTD: number;
  timeOfPossession: number;
  scoreByPeriod: number[];
}

export interface GameResult {
  homeScore: number;
  awayScore: number;
  overtimePeriods: number;
  home: TeamGameStats;
  away: TeamGameStats;
  playerLines: GamePlayerLine[];
  /** Short text summary of the scoring plays. */
  scoring: { quarter: number; clock: number; teamId: string; text: string; home: number; away: number }[];
  injuries: { playerId: string; teamId: string; type: string; weeks: number }[];
  plays: number;
  weather: Weather;
}

export interface Weather {
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'wind' | 'dome';
  temperature: number;
  wind: number;
}

export interface PostseasonInfo {
  kind: 'ccg' | 'bowl' | 'cfp';
  name: string;
  /** CFP round id (R1/QF/SF/F) and bracket slot (e.g. "QF-2"). */
  round?: string;
  slot?: string;
  homeSeed?: number;
  awaySeed?: number;
  conference?: string;
}

export interface Game {
  postseason?: PostseasonInfo;
  id: string;
  season: number;
  week: number;
  homeId: string;
  awayId: string;
  neutralSite?: string;
  conferenceGame: boolean;
  rivalryId?: string;
  seed: number;
  /** Rankings at kickoff (0 = unranked). */
  homeRank?: number;
  awayRank?: number;
  played: boolean;
  result?: GameResult;
}

export interface RankingEntry {
  teamId: string;
  rank: number;
  score: number;
  previousRank: number;
  w: number;
  l: number;
}

export interface RankingWeek {
  season: number;
  week: number;
  poll: RankingEntry[];
}

export type NewsType = 'result' | 'upset' | 'performance' | 'injury' | 'ranking' | 'rivalry' | 'milestone' | 'program';

export interface NewsItem {
  id: string;
  season: number;
  week: number;
  type: NewsType;
  headline: string;
  body?: string;
  teamIds: string[];
  importance: number;
}

export type Level3 = 'low' | 'normal' | 'high';

/** Head-coach game-management sliders that feed the play caller. */
export interface CoachingSettings {
  aggressiveness: 'conservative' | 'normal' | 'aggressive';
  runPassBalance: number; // -2 (run heavy) ... +2 (pass heavy)
  tempo: 'slow' | 'normal' | 'fast' | 'hurry';
  fourthDown: 'conservative' | 'normal' | 'aggressive';
  blitz: Level3;
  coverage: 'man' | 'balanced' | 'zone';
}

export type SeasonPhase = 'regular' | 'ccg' | 'postseason' | 'seasonComplete' | 'offseason';

export interface AwardResult {
  id: string;
  name: string;
  label: string;
  winnerName: string;
  playerId?: string;
  coachId?: string;
  teamId: string;
  position?: string;
  statLine: string;
  finalists?: { name: string; teamId: string; statLine: string }[];
}

export interface DraftPick {
  round: number;
  pick: number;
  overall: number;
  playerId: string;
  playerName: string;
  position: Position;
  teamId: string;
  early: boolean;
}

export interface PostseasonState {
  season: number;
  conferenceChampions: Record<string, string>;
  cfpSeeds: { seed: number; teamId: string; autoBid: boolean }[];
  selectionRanking: string[];
  awards: AwardResult[];
  champion?: string;
  runnerUp?: string;
  titleScore?: string;
}

export interface SeasonHistory {
  season: number;
  champion?: string;
  runnerUp?: string;
  titleScore?: string;
  cfpField: string[];
  conferenceChampions: Record<string, string>;
  awards: AwardResult[];
  finalTop25: { teamId: string; w: number; l: number }[];
  user: { teamId: string; coachName: string; w: number; l: number; confW: number; confL: number; finalRank: number; postseason: string };
  topClass?: string;
  draft: DraftPick[];
}

export interface OffseasonSummary {
  completedSeason: number;
  nextSeason: number;
  userGraduates: { name: string; position: Position; overall: number }[];
  draft: DraftPick[];
  risers: { playerId: string; name: string; position: Position; teamId: string; from: number; to: number }[];
  fallers: { playerId: string; name: string; position: Position; teamId: string; from: number; to: number }[];
  classRankings: { teamId: string; points: number; count: number; avgStars: number; five: number; four: number }[];
  userClass: string[];
  prestige: { teamId: string; from: number; to: number }[];
}

export interface Dynasty {
  version: number;
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  seed: number;
  userTeamId: string;
  userCoachId: string;
  season: number;
  /** Next week to be played (1-based). */
  week: number;
  phase: SeasonPhase;
  teams: Record<string, TeamState>;
  players: Record<string, Player>;
  coaches: Record<string, Coach>;
  schedule: Game[];
  rankings: RankingWeek[];
  news: NewsItem[];
  coachingSettings: CoachingSettings;
  /** Monotonic counter for deterministic id generation. */
  nextId: number;
  postseason: PostseasonState | null;
  history: SeasonHistory[];
  offseason: OffseasonSummary | null;
}
