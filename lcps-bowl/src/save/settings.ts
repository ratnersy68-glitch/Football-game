import { useSyncExternalStore } from 'react';
import type { Difficulty } from '../game/types';
import { Sound } from '../game/audio/Sound';

export interface Settings {
  quarterLen: number;
  difficulty: Difficulty;
  simDefense: boolean;
  showRoutes: boolean;
  master: number;
  sfx: number;
  crowd: number;
  music: number;
  playoffFormat: 'standard' | 'expanded';
  /** RETRO = Retro Bowl-style touch controls (drag-back passing, auto-run, swipe moves, defense auto-simmed). */
  controls: 'retro' | 'classic';
}

const KEY = 'lcps-bowl:settings';
const DEFAULTS: Settings = {
  quarterLen: 180, difficulty: 'VARSITY', simDefense: false, showRoutes: true,
  master: 0.7, sfx: 0.8, crowd: 0.6, music: 0.4, playoffFormat: 'standard', controls: 'retro',
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return { ...DEFAULTS };
}

let current: Settings = typeof window === 'undefined' ? { ...DEFAULTS } : load();
const listeners = new Set<() => void>();
Sound.setVolumes(current);

export function getSettings(): Settings {
  return current;
}

export function setSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* ignore */ }
  Sound.setVolumes(current);
  listeners.forEach((l) => l());
}

export function useSettings(): Settings {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => current, () => current);
}

/** Retro controls always auto-sim defense (you only play offense, like Retro Bowl). */
export const simDefenseOn = (s: Settings = current) => s.controls === 'retro' || s.simDefense;
