export interface Settings {
  audio: boolean;
  volume: number;
  hud: 'full' | 'minimal';
  hints: boolean;
  shake: boolean;
  commentary: boolean;
  clockSpeed: number;
}

const KEY = 'octagon.settings.v1';
export const DEFAULT_SETTINGS: Settings = { audio: true, volume: 0.6, hud: 'full', hints: true, shake: true, commentary: true, clockSpeed: 2.5 };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export const CLOCK_OPTIONS: Array<{ speed: number; label: string }> = [
  { speed: 1, label: '5:00 (real time)' },
  { speed: 2, label: '2:30 per round' },
  { speed: 2.5, label: '2:00 per round' },
  { speed: 3, label: '1:40 per round' },
  { speed: 5, label: '1:00 per round' },
];
