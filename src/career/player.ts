/**
 * The user's created player: identity, body, appearance, build, number and gear.
 * Pure data + rating math (no UI). Everything here is data-driven from src/career/data/*.json.
 */
import posJson from './data/positions.json';
import gearJson from './data/gear.json';
import uniformsJson from './data/uniforms.json';
import { TEAM_BY_ID } from '../data';

export interface AttributeDef {
  id: string;
  label: string;
  group: string;
}
export interface ArchetypeDef {
  id: string;
  name: string;
  blurb: string;
  base: Record<string, number>;
}
export interface BodyTypeDef {
  id: string;
  name: string;
  mods: Record<string, number>;
  weight: [number, number];
}

export type PositionId = 'QB' | 'RB' | 'WR' | 'TE';

export interface PositionDef {
  attributes: AttributeDef[];
  weights: Record<string, number>;
  archetypes: ArchetypeDef[];
  bodyTypes: BodyTypeDef[];
  height: [number, number];
  defaultHeight: number;
  defaultWeight: number;
  defaultJersey: number;
}

export const POSITIONS = posJson as unknown as {
  buildPoints: number;
  buildCap: number;
  list: { id: string; name: string; available: boolean }[];
  positions: Record<PositionId, PositionDef>;
};
export const BUILD_POINTS = POSITIONS.buildPoints;
export const BUILD_CAP = POSITIONS.buildCap;

export function posDef(p: CreatedPlayer | PositionId): PositionDef {
  const id = typeof p === 'string' ? p : p.position;
  return POSITIONS.positions[id] ?? POSITIONS.positions.QB;
}

export type GearKey = Exclude<keyof typeof gearJson, "_comment">;
/** Gear slots and their options (the JSON's `_comment` documentation key is stripped). */
export const GEAR = Object.fromEntries(Object.entries(gearJson).filter(([k]) => k !== '_comment')) as unknown as Record<GearKey, { label: string; options: [string, string][] }>;
export type Gear = Record<GearKey, string>;

export interface Appearance {
  skinTone: string;
  face: number;
  hair: 'buzz' | 'short' | 'fade' | 'curly' | 'dreads' | 'long' | 'mullet';
  hairColor: string;
  facialHair: 'none' | 'stubble' | 'mustache' | 'goatee' | 'beard';
  eyeColor: string;
}

export interface CreatedPlayer {
  version: 1;
  firstName: string;
  lastName: string;
  nickname: string;
  hometown: string;
  state: string;
  position: PositionId;
  /** Ratings gained through training during the career (added on top of base + build). */
  progress?: Record<string, number>;
  archetype: string;
  heightIn: number;
  weight: number;
  bodyType: string;
  appearance: Appearance;
  /** Build points spent per attribute (0..buildCap). */
  build: Record<string, number>;
  jersey: number;
  preferredJersey: number;
  gear: Gear;
  teamId: string;
}

export const SKIN_TONES = ['#f6d7c3', '#e8b894', '#d09a6b', '#a86f45', '#7c4d2c', '#4f2f1b'];
export const HAIR_COLORS = ['#1a1310', '#3b2518', '#6b4423', '#a0703c', '#d4b06a', '#b5452a', '#9a9a9a'];
export const EYE_COLORS = ['#3d2a1c', '#6a4a2a', '#3f6b8a', '#4f7a4a', '#7b8a92'];
export const HAIR_STYLES: Appearance['hair'][] = ['buzz', 'short', 'fade', 'curly', 'dreads', 'long', 'mullet'];
export const FACIAL_HAIR: Appearance['facialHair'][] = ['none', 'stubble', 'mustache', 'goatee', 'beard'];

export function defaultGear(): Gear {
  return {
    facemask: 'open',
    facemaskColor: 'team',
    visor: 'none',
    mouthguard: 'none',
    eyeBlack: 'stripe',
    leftSleeve: 'none',
    rightSleeve: 'none',
    wristbands: 'playcard',
    gloves: 'team',
    handWarmer: 'none',
    towel: 'front',
    backPlate: 'none',
    shoulderPads: 'normal',
    socks: 'team',
    cleats: 'black',
  };
}

export function newPlayer(position: PositionId = 'QB', teamId = 'ohio_state'): CreatedPlayer {
  const d = posDef(position);
  return {
    version: 1,
    firstName: '',
    lastName: '',
    nickname: '',
    hometown: 'Columbus',
    state: 'OH',
    position,
    archetype: d.archetypes[0].id,
    heightIn: d.defaultHeight,
    weight: d.defaultWeight,
    bodyType: (d.bodyTypes[1] ?? d.bodyTypes[0]).id,
    appearance: { skinTone: SKIN_TONES[2], face: 1, hair: 'short', hairColor: HAIR_COLORS[0], facialHair: 'none', eyeColor: EYE_COLORS[0] },
    build: {},
    jersey: d.defaultJersey,
    preferredJersey: d.defaultJersey,
    gear: defaultGear(),
    teamId,
    progress: {},
  };
}

/** Switch position: archetype, body, size, build and number reset to that position's defaults. */
export function withPosition(p: CreatedPlayer, position: PositionId): CreatedPlayer {
  if (p.position === position) return p;
  const fresh = newPlayer(position, p.teamId);
  return { ...p, position, archetype: fresh.archetype, bodyType: fresh.bodyType, heightIn: fresh.heightIn, weight: fresh.weight, build: {}, jersey: fresh.jersey, preferredJersey: fresh.preferredJersey, progress: {} };
}

export function archetypeOf(p: CreatedPlayer): ArchetypeDef {
  const d = posDef(p);
  return d.archetypes.find((a) => a.id === p.archetype) ?? d.archetypes[0];
}

export function bodyTypeOf(p: CreatedPlayer): BodyTypeDef {
  const d = posDef(p);
  return d.bodyTypes.find((b) => b.id === p.bodyType) ?? d.bodyTypes[1] ?? d.bodyTypes[0];
}

/** Base ratings before build points: archetype + body type + height/weight. */
export function baseRatings(p: CreatedPlayer): Record<string, number> {
  const arch = archetypeOf(p);
  const body = bodyTypeOf(p);
  const out: Record<string, number> = {};
  const hDelta = p.heightIn - posDef(p).defaultHeight; // inches over the position's typical height
  const [wLo, wHi] = body.weight;
  const wDelta = (p.weight - (wLo + wHi) / 2) / 10;
  for (const a of posDef(p).attributes) {
    let v = arch.base[a.id] ?? 60;
    v += body.mods[a.id] ?? 0;
    // Taller: better vision / high-point catches; shorter: quicker.
    if (a.id === 'awareness' || a.id === 'underPressure' || a.id === 'contested') v += hDelta * 0.6;
    if (a.id === 'agility' || a.id === 'acceleration') v -= hDelta * 0.8;
    // Heavier within the body type: stronger and harder to bring down, a bit slower.
    if (a.id === 'strength' || a.id === 'breakSack' || a.id === 'breakTackle' || a.id === 'blocking') v += wDelta * 1.5;
    if (a.id === 'speed') v -= wDelta * 1.2;
    out[a.id] = Math.round(Math.max(35, Math.min(95, v)));
  }
  return out;
}

export function ratings(p: CreatedPlayer): Record<string, number> {
  const base = baseRatings(p);
  const out: Record<string, number> = {};
  for (const a of posDef(p).attributes) out[a.id] = Math.min(99, base[a.id] + (p.build[a.id] ?? 0) + Math.floor(p.progress?.[a.id] ?? 0));
  return out;
}

export function pointsSpent(p: CreatedPlayer): number {
  return Object.values(p.build).reduce((s, v) => s + v, 0);
}

export function overall(r: Record<string, number>, position: PositionId = 'QB'): number {
  let t = 0;
  let w = 0;
  for (const [k, wt] of Object.entries(posDef(position).weights)) {
    t += (r[k] ?? 60) * wt;
    w += wt;
  }
  // Scale so an average freshman lands in the 60s-70s and a maxed build in the high 70s/low 80s.
  return Math.round(Math.max(40, Math.min(99, (t / w) * 1.06 - 1)));
}

export function starRating(ovr: number): number {
  return ovr >= 82 ? 5 : ovr >= 76 ? 4 : ovr >= 68 ? 3 : 2;
}

/** Approximate national recruiting ranks for a given overall (for the build screen). */
export function recruitRanks(ovr: number): { position: number; national: number } {
  const national = Math.max(1, Math.round(1500 * Math.exp(-(ovr - 62) / 5.2)));
  return { national, position: Math.max(1, Math.round(national / 11)) };
}

export function heightLabel(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

/** Overall rating for a created player at his position. */
export function playerOverall(p: CreatedPlayer): number {
  return overall(ratings(p), p.position);
}

export function displayName(p: CreatedPlayer): string {
  return `${p.firstName || 'First'} ${p.lastName || 'Last'}`;
}

// ───────────────── Uniforms ─────────────────

export interface UniformColors {
  helmet: string;
  helmetStripe: string;
  jersey: string;
  number: string;
  numberOutline: string;
  pants: string;
  socks: string;
  trim: string;
}

export function uniformFor(teamId: string, kind: 'home' | 'away' | 'alternate'): UniformColors {
  const u = (uniformsJson as unknown as Record<string, Record<string, UniformColors>>)[teamId];
  if (u?.[kind]) return u[kind];
  const t = TEAM_BY_ID[teamId];
  const p = t?.primaryColor ?? '#444444';
  const s = t?.secondaryColor ?? '#FFFFFF';
  return kind === 'away'
    ? { helmet: p, helmetStripe: s, jersey: '#FFFFFF', number: p, numberOutline: s, pants: '#E8E8E8', socks: p, trim: p }
    : { helmet: p, helmetStripe: s, jersey: p, number: s, numberOutline: '#000000', pants: s === '#FFFFFF' ? '#E8E8E8' : s, socks: p, trim: s };
}

/** Resolve a gear color token (team/team2/named) to a hex color. */
export function gearColor(token: string, u: UniformColors): string {
  switch (token) {
    case 'team':
      return u.jersey === '#FFFFFF' ? u.trim : u.jersey;
    case 'team2':
      return u.trim;
    case 'white':
    case 'short_white':
    case 'high_white':
      return '#F4F4F4';
    case 'black':
      return '#141414';
    case 'gold':
      return '#D4A93A';
    case 'chrome':
      return '#D8DDE2';
    case 'gray':
      return '#8A8F96';
    case 'red_white':
      return '#C8102E';
    default:
      return '#888888';
  }
}

// ───────────────── Persistence ─────────────────

const KEY = 'saturday26.createdPlayer';

export function savePlayer(p: CreatedPlayer): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable */
  }
}

export function loadPlayer(): CreatedPlayer | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as CreatedPlayer;
    return { ...newPlayer(p.position ?? 'QB', p.teamId ?? 'ohio_state'), ...p, gear: { ...defaultGear(), ...p.gear }, appearance: { ...newPlayer().appearance, ...p.appearance }, progress: p.progress ?? {} };
  } catch {
    return null;
  }
}
