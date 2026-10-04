/** Shared types for the football engine and the dynasty layer. */

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'CB' | 'S' | 'K';
export const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'];
export type Grade = 9 | 10 | 11 | 12;
export const GRADE_LABEL: Record<Grade, string> = { 9: 'FR', 10: 'SO', 11: 'JR', 12: 'SR' };

/** Every player carries the full attribute set; position formulas decide which matter. 0-99. */
export interface Attributes {
  spd: number; // speed
  str: number; // strength
  agi: number; // agility
  acc: number; // acceleration
  awr: number; // awareness
  sta: number; // stamina
  // QB
  arm: number;
  accu: number;
  mob: number;
  // RB / ball carrier
  pow: number;
  elu: number;
  car: number; // ball security
  // receiving
  hands: number;
  route: number;
  // blocking
  rblk: number;
  pblk: number;
  // defense
  rush: number;
  shed: number;
  tkl: number;
  cov: number;
  // kicking
  kpow: number;
  kacc: number;
}
export type AttrKey = keyof Attributes;

export interface StatLine {
  gp: number;
  passAtt: number;
  passCmp: number;
  passYds: number;
  passTD: number;
  passInt: number;
  sacked: number;
  rushAtt: number;
  rushYds: number;
  rushTD: number;
  rec: number;
  recYds: number;
  recTD: number;
  fumLost: number;
  tackles: number;
  sacks: number;
  ints: number;
  ff: number;
  pd: number;
  fgm: number;
  fga: number;
  fgLong: number;
  xpm: number;
  xpa: number;
  puntYds: number;
  punts: number;
  retYds: number;
  retTD: number;
  longRush: number;
  longRec: number;
}

export const emptyStats = (): StatLine => ({
  gp: 0, passAtt: 0, passCmp: 0, passYds: 0, passTD: 0, passInt: 0, sacked: 0,
  rushAtt: 0, rushYds: 0, rushTD: 0, rec: 0, recYds: 0, recTD: 0, fumLost: 0,
  tackles: 0, sacks: 0, ints: 0, ff: 0, pd: 0, fgm: 0, fga: 0, fgLong: 0, xpm: 0, xpa: 0,
  puntYds: 0, punts: 0, retYds: 0, retTD: 0, longRush: 0, longRec: 0,
});

export function addStats(into: StatLine, s: StatLine): void {
  for (const k of Object.keys(s) as (keyof StatLine)[]) {
    if (k === 'fgLong' || k === 'longRush' || k === 'longRec') into[k] = Math.max(into[k], s[k]);
    else into[k] += s[k];
  }
}

export interface Injury {
  type: string;
  weeks: number;
}

export interface PlayerData {
  id: string;
  first: string;
  last: string;
  number: number;
  pos: Position;
  grade: Grade;
  height: number; // inches
  weight: number; // lbs
  attrs: Attributes;
  potential: number; // 40-99 ceiling for overall
  xp: number;
  level: number;
  pendingUpgrades: number;
  morale: number; // 0-100
  injury?: Injury;
  season: StatLine;
  career: StatLine;
  /** Season history: year -> statline (for career tables). */
  history?: { year: number; grade: Grade; ovr: number; stats: StatLine }[];
  traits?: string[];
  /** Cosmetic equipment (never affects ratings). */
  gear?: import('../gear/types').PlayerGear;
  /** Personality used for auto-generated drip: TRADITIONAL / CLEAN / FLASHY / OLD SCHOOL / SWAGGER. */
  style?: string;
}

/** Team identity in the database. Ratings are the program's starting point. */
export interface TeamInfo {
  id: string;
  school: string;
  shortName: string;
  mascot: string;
  abbreviation: string;
  city: string;
  colors: { primary: string; secondary: string; accent?: string };
  colorNames: string;
  stadium: string;
  district: string;
  founded: number;
  offenseRating: number;
  defenseRating: number;
  specialTeamsRating: number;
  prestige: number; // 1-5
  rivals: string[];
  history: string;
  logo: string;
  helmet: string;
  /** Helmet design hints for the procedural sprite. */
  helmetStyle: { shell: string; stripe: string; facemask: string };
  uniforms: {
    home: { jersey: string; numbers: string; pants: string };
    away: { jersey: string; numbers: string; pants: string };
  };
}

export type Difficulty = 'FRESHMAN' | 'JV' | 'VARSITY' | 'ALL-STATE' | 'LEGEND';
export const DIFFICULTIES: Difficulty[] = ['FRESHMAN', 'JV', 'VARSITY', 'ALL-STATE', 'LEGEND'];
export type Weather = 'clear' | 'cold' | 'rain' | 'snow' | 'wind';
export type TimeOfDay = 'night' | 'day' | 'dusk';
