/** Persisted settings for the playable game (difficulty, quarter length, read assist, sliders). */
import { DEFAULT_SETTINGS, type SimSettings } from './engine/types';

const KEY = 'saturday26.playSettings';

export const DIFFICULTY_NAMES = ['Freshman', 'Varsity', 'All-Conference', 'Heisman'];
export const DIFFICULTY_BLURBS = [
  'Defenders react late and take poor pursuit angles.',
  'Solid, sound college defense.',
  'Faster reads, better angles, the coordinator adapts to your tendencies.',
  'Elite reactions and angles, disguised pressure. Ratings never change — only the brains.',
];

export function loadPlaySettings(): SimSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<SimSettings>;
      return { ...DEFAULT_SETTINGS, ...p, sliders: { ...DEFAULT_SETTINGS.sliders, ...(p.sliders ?? {}) } };
    }
  } catch {
    /* storage unavailable */
  }
  return { ...DEFAULT_SETTINGS, sliders: { ...DEFAULT_SETTINGS.sliders } };
}

export function savePlaySettings(s: SimSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}
