/**
 * Minimal global store (no external state library). Components subscribe via useStore().
 * The Dynasty object is mutated by simulation functions; call bump() afterwards to re-render.
 */
import { useSyncExternalStore } from 'react';
import type { Dynasty } from '../models/types';
import { IndexedDbBackend, MemoryBackend, SaveManager } from '../save/saveManager';
import { setLogosEnabled } from '../visualization/logoCache';

export type Screen =
  | { name: 'menu' }
  | { name: 'teamSelect'; seed?: number; conference?: string }
  | { name: 'overview'; teamId: string; seed: number }
  | { name: 'load' }
  | { name: 'settings' }
  | { name: 'quickSim' }
  | { name: 'quickGame'; homeId: string; awayId: string; seed: number }
  | { name: 'hub'; tab?: HubTab }
  | { name: 'game'; gameId: string }
  | { name: 'career' }
  | { name: 'createPlayer'; step?: number }
  | { name: 'play' };

export type HubTab = 'home' | 'roster' | 'depth' | 'schedule' | 'gameplan' | 'top25' | 'conference' | 'postseason' | 'news' | 'history' | 'coach';

export interface AppSettings {
  speed: number;
  camera: 'broadcast' | 'overhead';
  fourthDownPrompts: boolean;
  autosave: boolean;
  logos: boolean;
}

const SETTINGS_KEY = 'saturday26.settings';
const DEFAULT_SETTINGS: AppSettings = { speed: 1, camera: 'broadcast', fourthDownPrompts: true, autosave: true, logos: true };

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable */
  }
  return { ...DEFAULT_SETTINGS };
}

interface State {
  screen: Screen;
  dynasty: Dynasty | null;
  slotId: string | null;
  slotName: string | null;
  settings: AppSettings;
  version: number;
  toast: string | null;
}

const initialSettings = loadSettings();
setLogosEnabled(initialSettings.logos);

let state: State = {
  screen: { name: 'menu' },
  dynasty: null,
  slotId: null,
  slotName: null,
  settings: initialSettings,
  version: 0,
  toast: null,
};
const listeners = new Set<() => void>();

export const saves = new SaveManager(typeof indexedDB !== 'undefined' ? new IndexedDbBackend() : new MemoryBackend());

export function getState(): State {
  return state;
}

export function setState(patch: Partial<State>): void {
  state = { ...state, ...patch, version: state.version + 1 };
  listeners.forEach((l) => l());
}

/** Re-render after mutating the dynasty in place. */
export function bump(): void {
  setState({});
}

export function navigate(screen: Screen): void {
  setState({ screen });
  window.scrollTo?.(0, 0);
}

export function updateSettings(patch: Partial<AppSettings>): void {
  const settings = { ...state.settings, ...patch };
  setLogosEnabled(settings.logos);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
  setState({ settings });
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string): void {
  setState({ toast: msg });
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => setState({ toast: null }), 2600);
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export async function autosave(): Promise<void> {
  const d = state.dynasty;
  if (!d || !state.settings.autosave) return;
  try {
    await saves.autosave(d);
  } catch (e) {
    console.error('Autosave failed', e);
    toast('Autosave failed');
  }
}
