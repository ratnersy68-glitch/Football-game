/**
 * Typed access to all static game data. Everything tunable lives in the JSON files next to this one.
 * Adding a conference or team means editing data, not engine code.
 */
import conferencesJson from './conferences.json';
import bigTen from './teams/bigten.json';
import sec from './teams/sec.json';
import big12 from './teams/big12.json';
import nonConference from './teams/nonconference.json';
import rivalriesJson from './rivalries.json';
import namesJson from './names.json';
import geographyJson from './geography.json';
import positionsJson from './positions.json';
import archetypesJson from './archetypes.json';
import schemesJson from './schemes.json';
import playbookJson from './playbook.json';
import gameConfigJson from './gameConfig.json';
import rankingConfigJson from './rankingConfig.json';
import scheduleRulesJson from './scheduleRules.json';
import type { ConferenceInfo, DefScheme, OffScheme, Position, RivalryInfo, TeamInfo } from '../models/types';

export const CONFERENCES: ConferenceInfo[] = conferencesJson as ConferenceInfo[];
export const CONFERENCE_BY_ID: Record<string, ConferenceInfo> = Object.fromEntries(CONFERENCES.map((c) => [c.id, c]));

/** Fill in fields that the compact non-conference data omits. */
function normalizeTeam(raw: Partial<TeamInfo> & { id: string }): TeamInfo {
  const p = raw.prestige ?? 30;
  return {
    school: raw.id,
    nickname: '',
    abbreviation: raw.id.slice(0, 4).toUpperCase(),
    conference: 'fcs',
    city: '',
    state: 'TX',
    stadium: 'Stadium',
    capacity: 20000,
    primaryColor: '#444444',
    secondaryColor: '#FFFFFF',
    facilities: Math.min(95, p + 10),
    nilStrength: Math.min(95, p + 5),
    recruitingPower: p,
    fanSupport: Math.min(95, p + 15),
    rosterStrength: 40,
    academicPrestige: 60,
    marketSize: 40,
    offense: 'spread',
    defense: '4-3',
    recruitingStates: [raw.state ?? 'TX'],
    philosophy: 'regional',
    ...raw,
    prestige: p,
  } as TeamInfo;
}

export const TEAMS: TeamInfo[] = [...bigTen, ...sec, ...big12, ...nonConference].map((t) =>
  normalizeTeam(t as Partial<TeamInfo> & { id: string }),
);
export const TEAM_BY_ID: Record<string, TeamInfo> = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

/** Programs that are full members of the simulated universe (selectable, ranked, conference races). */
export const UNIVERSE_TEAMS: TeamInfo[] = TEAMS.filter((t) => CONFERENCE_BY_ID[t.conference]?.playable);
export const OPPONENT_POOL: TeamInfo[] = TEAMS.filter((t) => !CONFERENCE_BY_ID[t.conference]?.playable);

export function teamsInConference(confId: string): TeamInfo[] {
  return TEAMS.filter((t) => t.conference === confId);
}

export function isUniverseTeam(id: string): boolean {
  const t = TEAM_BY_ID[id];
  return !!t && !!CONFERENCE_BY_ID[t.conference]?.playable;
}

export const RIVALRIES: RivalryInfo[] = rivalriesJson as RivalryInfo[];

export function rivalryBetween(a: string, b: string): RivalryInfo | undefined {
  return RIVALRIES.find((r) => (r.teams[0] === a && r.teams[1] === b) || (r.teams[0] === b && r.teams[1] === a));
}

export function rivalsOf(teamId: string): { rival: TeamInfo; rivalry: RivalryInfo }[] {
  return RIVALRIES.filter((r) => r.teams.includes(teamId))
    .sort((a, b) => b.intensity - a.intensity)
    .map((r) => ({ rival: TEAM_BY_ID[r.teams[0] === teamId ? r.teams[1] : r.teams[0]], rivalry: r }))
    .filter((x) => !!x.rival);
}

export const NAMES: { first: string[]; last: string[] } = namesJson;
export const GEOGRAPHY: { cities: Record<string, string[]>; talentWeight: Record<string, number> } = geographyJson;

export interface PositionInfo {
  name: string;
  side: 'offense' | 'defense' | 'special';
  rosterCount: number;
  height: [number, number];
  weight: [number, number];
  jerseys: [number, number][];
  weights: Record<string, number>;
}
export const POSITION_ORDER: Position[] = positionsJson.order as Position[];
export const POSITIONS: Record<Position, PositionInfo> = positionsJson.positions as unknown as Record<Position, PositionInfo>;
export const ATTRIBUTE_LABELS: Record<string, string> = positionsJson.attributeLabels;
export const HIDDEN_TRAITS: string[] = positionsJson.hiddenTraits;

export interface ArchetypeInfo {
  id: string;
  name: string;
  mods: Record<string, number>;
}
export const ARCHETYPES: Record<Position, ArchetypeInfo[]> = archetypesJson as unknown as Record<Position, ArchetypeInfo[]>;

export function archetypeName(pos: Position, id: string): string {
  return ARCHETYPES[pos]?.find((a) => a.id === id)?.name ?? id;
}

export interface OffSchemeInfo {
  name: string;
  runRate: number;
  tempo: 'slow' | 'normal' | 'fast';
  formations: Record<string, number>;
  run: Record<string, number>;
  pass: Record<string, number>;
  fit: Partial<Record<Position, Record<string, number>>>;
}
export interface DefSchemeInfo {
  name: string;
  personnel: { DL: number; LB: number; CB: number; S: number };
  blitzRate: number;
  manRate: number;
  fit: Partial<Record<Position, Record<string, number>>>;
}
export const OFF_SCHEMES: Record<OffScheme, OffSchemeInfo> = schemesJson.offense as unknown as Record<OffScheme, OffSchemeInfo>;
export const DEF_SCHEMES: Record<DefScheme, DefSchemeInfo> = schemesJson.defense as unknown as Record<DefScheme, DefSchemeInfo>;

export interface FormationInfo {
  name: string;
  personnel: { RB: number; TE: number; WR: number };
  shotgun: boolean;
  pistol?: boolean;
}
export interface RunConceptInfo {
  name: string;
  carrier: 'RB' | 'QB' | 'option';
  gap: 'inside' | 'outside';
  mean: number;
  variance: number;
  tfl: number;
  breakaway: number;
}
export interface PassConceptInfo {
  name: string;
  depth: Partial<Record<'screen' | 'short' | 'medium' | 'deep', number>>;
  quick?: boolean;
  playAction?: boolean;
  screen?: 'WR' | 'RB';
  rpo?: boolean;
}
export const FORMATIONS: Record<string, FormationInfo> = playbookJson.formations as Record<string, FormationInfo>;
export const RUN_CONCEPTS: Record<string, RunConceptInfo> = playbookJson.run as Record<string, RunConceptInfo>;
export const PASS_CONCEPTS: Record<string, PassConceptInfo> = playbookJson.pass as Record<string, PassConceptInfo>;

export const GAME_CONFIG = gameConfigJson;
export type GameConfig = typeof gameConfigJson;
export const RANKING_CONFIG = rankingConfigJson;
export const SCHEDULE_RULES = scheduleRulesJson;

import logosJson from './logos.json';
const LOGOS = logosJson as { urlTemplate: string; darkUrlTemplate: string; espnIds: Record<string, number>; overrides: Record<string, string> };

/** Official logo URL for a program (loaded at runtime by the browser), or undefined if unknown. */
export function logoUrl(teamId: string, dark = false): string | undefined {
  if (LOGOS.overrides[teamId]) return LOGOS.overrides[teamId];
  const id = LOGOS.espnIds[teamId];
  if (!id) return undefined;
  return (dark ? LOGOS.darkUrlTemplate : LOGOS.urlTemplate).replace('{id}', String(id));
}

import playoffJson from './playoffConfig.json';
import bowlsJson from './bowls.json';
import awardsJson from './awards.json';

export type BracketRef = number | string;
export interface PlayoffRound {
  id: string;
  name: string;
  week: number;
  site: 'higherSeedHome' | 'bowl' | 'neutral';
  bowls?: string[];
  neutralSite?: string;
  games: [BracketRef, BracketRef][];
}
export interface PlayoffConfig {
  name: string;
  teamCount: number;
  selection: { autoBidConferenceChampions: number; championMustBeRankedWithin: number };
  seeding: { mode: 'ranking'; championsGetTopSeeds: number };
  byes: number;
  rounds: PlayoffRound[];
  bowlSites: Record<string, string>;
}
export const PLAYOFF_CONFIG = playoffJson as unknown as PlayoffConfig;
export const BOWLS: { minWins: number; week: number; bowls: { name: string; site: string }[] } = bowlsJson;
export const AWARDS = awardsJson as {
  heisman: { name: string; short: string };
  positional: { id: string; name: string; label: string; positions: Position[] }[];
  coach: { id: string; name: string };
};
