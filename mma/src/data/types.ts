export type Gender = 'M' | 'F';

export type WeightClassId =
  | 'HW' | 'LHW' | 'MW' | 'WW' | 'LW' | 'FW' | 'BW' | 'FLW'
  | 'WSW' | 'WFLW' | 'WBW';

export type Stance = 'Orthodox' | 'Southpaw' | 'Switch';

export type ArchetypeId =
  | 'pressureBoxer' | 'kickboxer' | 'muayThai' | 'counterStriker' | 'powerPuncher'
  | 'wrestler' | 'chainWrestler' | 'sambo' | 'bjj' | 'submissionHunter'
  | 'groundAndPound' | 'balanced';

/** All attributes are 1-99. */
export interface Attributes {
  striking: number;
  power: number;
  speed: number;
  accuracy: number;
  defense: number;
  cardio: number;
  chin: number;
  wrestling: number;
  takedowns: number;
  takedownDefense: number;
  submissions: number;
  submissionDefense: number;
  clinch: number;
  groundControl: number;
  recovery: number;
}

export const ATTRIBUTE_KEYS: (keyof Attributes)[] = [
  'striking', 'power', 'speed', 'accuracy', 'defense', 'cardio', 'chin',
  'wrestling', 'takedowns', 'takedownDefense', 'submissions', 'submissionDefense',
  'clinch', 'groundControl', 'recovery',
];

/** Behavioural tendencies (0-1). They drive the AI game plan; they never change outcomes directly. */
export interface Tendencies {
  pressure: number;       // walks forward, cuts off the cage
  volume: number;         // output rate
  kicks: number;          // share of kicks vs punches
  legKicks: number;       // share of kicks aimed at legs
  bodyWork: number;       // share of strikes to the body
  takedowns: number;      // desire to wrestle
  clinch: number;         // desire to clinch
  counter: number;        // prefers to counter rather than lead
  submissionHunt: number; // hunts subs on the ground
  groundPound: number;    // prefers to strike on top
  movement: number;       // footwork / circling
  feints: number;
  spinning: number;
  switchStance: number;
}

export interface FighterRecord {
  w: number;
  l: number;
  d: number;
  nc: number;
}

export interface FighterData {
  id: string;
  name: string;
  nickname: string;
  country: string;
  birthYear: number;
  heightIn: number;
  reachIn: number;
  weightLbs: number;
  stance: Stance;
  weightClass: WeightClassId;
  gender: Gender;
  record: FighterRecord;
  archetype: ArchetypeId;
  attributes: Attributes;
  signatureTechniques: string[];
  tendencies: Tendencies;
  /** Retired / historical great. */
  legend?: boolean;
}

export interface WeightClassDef {
  id: WeightClassId;
  name: string;
  short: string;
  limitLbs: number;
  gender: Gender;
  order: number;
}

export interface ArchetypeDef {
  id: ArchetypeId;
  name: string;
  description: string;
  tendencies: Tendencies;
  /** Combo ids this style favours (see combos.ts). */
  combos: string[];
  /** Submission ids this style favours. */
  subs: string[];
}

export interface ArenaDef {
  id: string;
  name: string;
  city: string;
  inspiredBy: string;
  capacity: number;
  /** Visual theme */
  canvasColor: string;
  canvasLogoColor: string;
  lightColor: string;
  crowdDensity: number; // 0-1
  crowdHue: number;
  accent: string;
  mainEventOnly?: boolean;
  bannerText: string;
}
