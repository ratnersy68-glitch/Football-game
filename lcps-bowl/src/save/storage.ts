/**
 * Save system — localStorage, three dynasty slots plus per-slot autosave.
 * Saves are JSON (compacted: per-game logs are not stored).
 */
export const SLOTS = [1, 2, 3] as const;
export type Slot = (typeof SLOTS)[number];

const key = (slot: Slot) => `lcps-bowl:dynasty:${slot}`;
const metaKey = (slot: Slot) => `lcps-bowl:meta:${slot}`;
const LAST = 'lcps-bowl:last-slot';

export interface SaveMeta {
  slot: Slot;
  exists: boolean;
  team?: string;
  teamName?: string;
  year?: number;
  week?: string;
  record?: string;
  savedAt?: number;
  championships?: number;
}

export function listSaves(): SaveMeta[] {
  return SLOTS.map((slot) => {
    try {
      const raw = localStorage.getItem(metaKey(slot));
      if (raw) return { ...JSON.parse(raw), slot, exists: true } as SaveMeta;
    } catch { /* ignore */ }
    return { slot, exists: false };
  });
}

export function lastSlot(): Slot | null {
  try {
    const v = Number(localStorage.getItem(LAST));
    return (SLOTS as readonly number[]).includes(v) ? (v as Slot) : null;
  } catch {
    return null;
  }
}

export function saveSlot<T>(slot: Slot, data: T, meta: Omit<SaveMeta, 'slot' | 'exists'>): boolean {
  try {
    localStorage.setItem(key(slot), JSON.stringify(data));
    localStorage.setItem(metaKey(slot), JSON.stringify({ ...meta, savedAt: Date.now() }));
    localStorage.setItem(LAST, String(slot));
    return true;
  } catch (e) {
    console.error('Save failed', e);
    return false;
  }
}

export function loadSlot<T>(slot: Slot): T | null {
  try {
    const raw = localStorage.getItem(key(slot));
    if (!raw) return null;
    localStorage.setItem(LAST, String(slot));
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function deleteSlot(slot: Slot) {
  try {
    localStorage.removeItem(key(slot));
    localStorage.removeItem(metaKey(slot));
  } catch { /* ignore */ }
}

export function exportSlot(slot: Slot): string | null {
  try { return localStorage.getItem(key(slot)); } catch { return null; }
}
