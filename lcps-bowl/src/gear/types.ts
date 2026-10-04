/**
 * Gear system types — cosmetic equipment, Bowl Bucks, and the dynasty locker.
 * Gear NEVER changes ratings or gameplay; it only changes how players look.
 */

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

export type EquipmentCategory =
  | 'helmet' | 'pads' | 'finish' | 'facemask' | 'visor' | 'mouthguard' | 'gloves' | 'sleeve' | 'wristband' | 'armband'
  | 'handwarmer' | 'towel' | 'cleats' | 'socks' | 'spats' | 'undershirt' | 'legsleeve' | 'accessory';

/** Color tokens: 'primary' | 'secondary' (resolved per school) or a hex like '#ffffff'. */
export type ColorToken = string;

export type UnlockRequirement =
  | { kind: 'achievement'; id: string; text: string }
  | { kind: 'titles'; count: number; text: string }
  | { kind: 'threepeat'; text: string }
  | { kind: 'drop'; text: string }
  | { kind: 'beat'; team: string; text: string };

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  rarity: Rarity;
  price: number; // 0 = starter kit (owned from day one)
  /** Palette for the piece; patterns alternate through the list pixel by pixel. */
  colors: ColorToken[];
  /** Shape/style key interpreted by the sprite renderer (helmet model, mask style, cleat style…). */
  style?: string;
  desc: string;
  unlock?: UnlockRequirement;
  collection?: string; // school id for school collections, or 'championship'
  icon?: string;
  /** Shop artwork: an exact supplied product image (public path). */
  image?: string;
  /** Exact supplied product: price/rarity set by the owner (exempt from the rarity price bands). */
  exact?: boolean;
  /** Team-issued default: owned by everyone, not sold. */
  issued?: boolean;
}

export type GloveSide = 'both' | 'left' | 'right';
export type TowelPos = 'front' | 'left' | 'right' | 'back';
export type ShellColor = 'primary' | 'secondary' | 'white' | 'black';
export type MaskColor = 'default' | 'gray' | 'white' | 'black' | 'primary' | 'secondary';
export type PlayerStyle = 'TRADITIONAL' | 'CLEAN' | 'FLASHY' | 'OLD SCHOOL' | 'SWAGGER';
export const PLAYER_STYLES: PlayerStyle[] = ['TRADITIONAL', 'CLEAN', 'FLASHY', 'OLD SCHOOL', 'SWAGGER'];

export interface PlayerGear {
  helmet?: string;
  pads?: string;
  finish?: string;
  shellColor?: ShellColor;
  stripe?: boolean;
  logo?: boolean;
  facemask?: string;
  maskColor?: MaskColor;
  visor?: string;
  mouthguard?: string;
  gloves?: string;
  gloveSide?: GloveSide;
  /** Stackable arm pieces (sleeve, armband, wristband, accessory braces). */
  leftArm?: string[];
  rightArm?: string[];
  handwarmer?: string;
  towel?: string;
  towelPos?: TowelPos;
  undershirt?: string;
  legsleeve?: string;
  socks?: string;
  spats?: string;
  cleats?: string;
  accessory?: string; // neck roll / back plate / eye black
}

export type ThemeId = 'none' | 'blackout' | 'whiteout' | 'pinkout' | 'throwback' | 'playoff' | 'champgold';

export interface AchievementState {
  year: number;
  week: number;
}

export interface DropRecord {
  item: string;
  rarity: Rarity;
  year: number;
  week: number;
}

export interface Locker {
  bb: number;
  lifetimeBB: number;
  owned: string[];
  favorites: string[];
  achievements: Record<string, AchievementState>;
  drops: DropRecord[];
  theme: ThemeId;
  themesUnlocked: ThemeId[];
  /** Counters for unlock tracking. */
  rivalryWins: number;
  gamesPlayed: number;
  /** Items newly unlocked/bought since the player last opened the locker. */
  newItems: string[];
  /** Schools beaten (their collections become purchasable). */
  beaten?: string[];
  /** Gear schema version (see economy.GEAR_SCHEMA). Missing = 1. */
  gearSchema?: number;
  /** Completed-game keys already paid (rewards are paid once per game, even across reloads). */
  rewardedGames?: string[];
  /** Items from older saves that no longer exist in the shop and have no clear replacement. Kept, not sold. */
  legacy?: { id: string; name: string; note: string }[];
}

export interface RewardLine {
  label: string;
  bb: number;
}

export interface GameRewards {
  lines: RewardLine[];
  total: number;
  achievements: { id: string; name: string; bb: number; unlock?: string }[];
  unlocked: string[]; // item ids unlocked (achievements, championships, beat-a-school)
  drop?: { item: string; rarity: Rarity } | null;
  simmed: boolean;
  unlockedCollection?: string;
  /** True when this game had already been paid (no BB awarded again). */
  alreadyPaid?: boolean;
}

/** Fully-resolved visual description used by the sprite renderer. */
export interface Look {
  skin: string;
  jersey: string;
  jerseyShade: string;
  numbers: string;
  pants: string;
  pantsShade: string;
  torso: number; // shoulder width in px (6..9)
  helmet: { model: string; shell: string; shade: string; hi: string; stripe?: string; logo?: string; finish: string };
  /** Shoulder-pad profile key (rig/helmets.ts PAD_PROFILE); pads sit under the jersey. */
  pads?: string;
  teamId?: string;
  /** Rig build from position: skill (QB/WR/DB/K), hybrid (RB/LB/TE), lineman (OL/DL). */
  build?: 'skill' | 'hybrid' | 'lineman';
  number?: number;
  mask: { style: string; color: string };
  visor?: string[];
  mouthguard?: { color: string; style: string; hang: boolean };
  undershirt?: string[];
  neckRoll?: string;
  backPlate?: string;
  eyeBlack?: boolean;
  arms: { L: ArmLook; R: ArmLook };
  towel?: { pos: TowelPos; colors: string[] };
  handwarmer?: string[];
  legsleeve?: string[];
  socks: string[];
  spats?: { level: number; colors: string[] };
  cleats: { colors: string[]; style: string };
}

export interface ArmLook {
  sleeve?: { colors: string[]; len: 'full' | 'half'; padded: boolean };
  band?: string[];
  wrist?: string[];
  glove?: string[];
  brace?: string;
  wristCoach?: boolean;
}
