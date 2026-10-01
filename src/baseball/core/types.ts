/** Shared data shapes for players, teams, stadiums and game settings. */

export type Hand = 'R' | 'L' | 'S';
export type Position = 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'DH' | 'P';
export type FieldPos = Exclude<Position, 'DH'>;
export type PitcherRole = 'SP' | 'RP' | 'CL';

export type PitchCode = 'FF' | 'FT' | 'SI' | 'FC' | 'SL' | 'ST' | 'CU' | 'KC' | 'CH' | 'FS';

/** All ratings are 0–99. */
export interface HitterRatings {
  contactR: number; // contact vs right-handed pitchers
  contactL: number; // contact vs left-handed pitchers
  powerR: number;
  powerL: number;
  vision: number; // plate vision: pitch recognition / PCI size
  discipline: number; // chase avoidance
  speed: number;
  stealing: number;
  fielding: number;
  arm: number;
  reaction: number;
}

export interface PitcherRatings {
  velocity: number; // top fastball velocity in MPH (e.g. 97)
  control: number;
  break: number;
  stamina: number;
  pitches: PitchCode[];
  role: PitcherRole;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  number: number;
  pos: Position;
  secondary: Position[];
  bats: Hand;
  throws: 'R' | 'L';
  ratings: HitterRatings;
  pitcher?: PitcherRatings;
}

export interface TeamColors { primary: string; secondary: string; accent: string; text: string }

export interface Team {
  id: string; // abbreviation, e.g. NYY
  city: string;
  name: string; // nickname, e.g. Yankees
  league: 'AL' | 'NL';
  division: 'East' | 'Central' | 'West';
  colors: TeamColors;
  stadiumId: string;
  roster: Player[];
}

export interface TeamAttributes { power: number; contact: number; speed: number; defense: number; starting: number; bullpen: number; overall: number }

export interface Stadium {
  id: string;
  name: string;
  city: string;
  /** Wall distance (ft) at -45° (LF line), -22.5° (LC), 0° (CF), 22.5° (RC), 45° (RF line). */
  dims: [number, number, number, number, number];
  /** Wall height (ft) at the same five angles; interpolated linearly. */
  walls: [number, number, number, number, number];
  /** Optional sharp wall-height overrides: from..to angle (deg) has height h (e.g. the Green Monster). */
  wallZones?: { from: number; to: number; h: number }[];
  altitude: number; // ft above sea level (thinner air carries further)
  foulWidth: number; // ft of foul territory beside the lines
  backstop: number; // ft from home plate to the backstop
  wallColor: string;
  seatColor: string;
  roof?: 'open' | 'retractable' | 'dome';
  feature?: string;
}

export type Difficulty = 'ROOKIE' | 'MINORS' | 'VETERAN' | 'ALL-STAR' | 'HALL OF FAME' | 'LEGEND';
export const DIFFICULTIES: Difficulty[] = ['ROOKIE', 'MINORS', 'VETERAN', 'ALL-STAR', 'HALL OF FAME', 'LEGEND'];

export type TimeOfDay = 'Day' | 'Afternoon' | 'Night';
export type Weather = 'Clear' | 'Cloudy' | 'Light Rain';

export interface Conditions {
  time: TimeOfDay;
  weather: Weather;
  temperature: number; // °F
  windMph: number;
  windDir: number; // degrees, direction the wind blows TOWARD (0 = out to CF)
}

export interface LineupSlot { playerId: string; pos: Position }

export interface TeamSetup {
  teamId: string;
  lineup: LineupSlot[]; // 9 batting slots
  startingPitcherId: string;
}

export interface GameSettings {
  innings: number;
  difficulty: Difficulty;
  stadiumId: string;
  conditions: Conditions;
  home: TeamSetup;
  away: TeamSetup;
  userSide: 'home' | 'away' | 'none';
  ghostRunner: boolean;
}

export interface UserPrefs {
  pitchSpeed: 'auto' | 'slow' | 'real';
  fieldingAssist: boolean;
  runningAssist: boolean;
  showStrikeZone: boolean;
  cameraShake: boolean;
  volume: number;
  crowdVolume: number;
}

export const DEFAULT_PREFS: UserPrefs = {
  pitchSpeed: 'auto',
  fieldingAssist: true,
  runningAssist: true,
  showStrikeZone: true,
  cameraShake: true,
  volume: 0.8,
  crowdVolume: 0.5,
};
