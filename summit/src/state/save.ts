/** Player profile + settings persistence (localStorage) and run storage (IndexedDB). */
import { DEFAULT_APPEARANCE, DEFAULT_EQUIPPED, type Appearance, type Slot } from '../data/equipment';
import { IS_TOUCH } from '../game/touch';
import type { Quality } from '../render/sceneSetup';
import type { Action } from '../game/input';
import type { WeatherKind } from '../render/sceneSetup';
import { STAGES, type Medal } from '../data/career';

export interface Settings {
  quality: Quality;
  sensitivity: number;
  cameraDistance: number;
  cameraShake: boolean;
  fov: number;
  bindings: Partial<Record<Action, string[]>>;
  master: number; sfx: number; amb: number;
  units: 'kmh' | 'mph';
  showFps: boolean;
  dynamicWeather: boolean;
  weather: WeatherKind | 'random';
  hour: number;
  aiLevel: number;
}

export interface Profile {
  version: 1;
  name: string;
  coins: number;
  xp: number;
  appearance: Appearance;
  equipped: Record<Slot, string>;
  owned: string[];
  board: 'ski' | 'snowboard';
  medals: Record<Medal, number>;
  /** course key → best time (s) */
  records: Record<string, { time: number; level: number; date: number }>;
  bestTrick: { name: string; score: number } | null;
  bestCombo: number;
  events: Record<string, { medal: Medal | null; value: number }>;
  tournaments: Record<string, { race: number; points: Record<string, number>; done: boolean; place?: number }>;
  sponsors: string[];
  achievements: string[];
  ridden: Record<string, number[]>;
  trailsDone: Record<string, number[]>;
  stats: { distance: number; topSpeed: number; maxAir: number; tricks: number; races: number; crashes: number; runs: number };
  settings: Settings;
  lastResort: string;
}

export const DEFAULT_SETTINGS: Settings = {
  quality: IS_TOUCH ? 'low' : 'medium', sensitivity: 1, cameraDistance: 1, cameraShake: true, fov: 62, bindings: {},
  master: 0.8, sfx: 1, amb: 0.8, units: 'kmh', showFps: false, dynamicWeather: false, weather: 'clear', hour: 11, aiLevel: 2,
};

export function newProfile(): Profile {
  return {
    version: 1, name: 'Rider', coins: 500, xp: 0, appearance: { ...DEFAULT_APPEARANCE }, equipped: { ...DEFAULT_EQUIPPED },
    owned: Object.values(DEFAULT_EQUIPPED), board: 'ski', medals: { gold: 0, silver: 0, bronze: 0 }, records: {}, bestTrick: null, bestCombo: 0,
    events: {}, tournaments: {}, sponsors: [], achievements: [], ridden: {}, trailsDone: {},
    stats: { distance: 0, topSpeed: 0, maxAir: 0, tricks: 0, races: 0, crashes: 0, runs: 0 },
    settings: { ...DEFAULT_SETTINGS }, lastResort: 'pine-valley',
  };
}

const KEY = 'summit.profile.v1';
let memory: string | null = null;

function storage(): Storage | null {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; }
}

export function loadProfile(): Profile {
  let raw: string | null = memory;
  try { raw = storage()?.getItem(KEY) ?? memory; } catch { /* private mode */ }
  if (!raw) return newProfile();
  try {
    const p = JSON.parse(raw) as Profile;
    const base = newProfile();
    return { ...base, ...p, settings: { ...base.settings, ...p.settings }, stats: { ...base.stats, ...p.stats }, equipped: { ...base.equipped, ...p.equipped }, medals: { ...base.medals, ...p.medals }, appearance: { ...base.appearance, ...p.appearance } };
  } catch {
    return newProfile();
  }
}

export function saveProfile(p: Profile) {
  const raw = JSON.stringify(p);
  memory = raw;
  try { storage()?.setItem(KEY, raw); } catch { /* quota / private mode: keep in memory */ }
}

export function stageOf(p: Profile): number {
  const medals = p.medals.gold + p.medals.silver + p.medals.bronze;
  let s = 0;
  for (let i = 0; i < STAGES.length; i++) if (p.xp >= STAGES[i].xp && medals >= STAGES[i].medals) s = i;
  return s;
}

export function totalMedals(p: Profile) { return p.medals.gold + p.medals.silver + p.medals.bronze; }

// ---------------------------------------------------------------- run storage (IndexedDB)
const DB = 'summit-db';
const STORE = 'runs';
const mem = new Map<string, unknown>();

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((res) => {
    try {
      if (typeof indexedDB === 'undefined') return res(null);
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
    } catch { res(null); }
  });
}

export async function putRun(key: string, value: unknown): Promise<void> {
  mem.set(key, value);
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((res) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => res();
    tx.onerror = () => res();
  });
}

export async function getRun<T>(key: string): Promise<T | null> {
  const db = await openDb();
  if (!db) return (mem.get(key) as T) ?? null;
  return new Promise((res) => {
    const tx = db.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => res((r.result as T) ?? (mem.get(key) as T) ?? null);
    r.onerror = () => res((mem.get(key) as T) ?? null);
  });
}

export async function listRuns(prefix: string): Promise<string[]> {
  const db = await openDb();
  if (!db) return [...mem.keys()].filter((k) => k.startsWith(prefix));
  return new Promise((res) => {
    const tx = db.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).getAllKeys();
    r.onsuccess = () => res((r.result as string[]).filter((k) => String(k).startsWith(prefix)));
    r.onerror = () => res([]);
  });
}

export async function deleteRun(key: string) {
  mem.delete(key);
  const db = await openDb();
  if (!db) return;
  db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
}
