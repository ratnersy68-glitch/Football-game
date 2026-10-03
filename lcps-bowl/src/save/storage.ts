/**
 * Save system — three dynasty slots. The dynasty blob lives in IndexedDB (no 5 MB localStorage cap);
 * a small metadata record per slot lives in localStorage for instant menus. Falls back to localStorage
 * (and finally memory) if IndexedDB is unavailable.
 */
export const SLOTS = [1, 2, 3] as const;
export type Slot = (typeof SLOTS)[number];

const metaKey = (slot: Slot) => `lcps-bowl:meta:${slot}`;
const lsKey = (slot: Slot) => `lcps-bowl:dynasty:${slot}`;
const LAST = 'lcps-bowl:last-slot';
const DB = 'lcps-bowl';
const STORE = 'dynasties';

export interface SaveMeta {
  slot: Slot;
  exists: boolean;
  team?: string;
  teamName?: string;
  coach?: string;
  year?: number;
  week?: string;
  record?: string;
  savedAt?: number;
  championships?: number;
}

const memory = new Map<string, string>();

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPut(key: string, value: string): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

async function idbGet(key: string): Promise<string | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as string) ?? null);
    req.onerror = () => resolve(null);
  });
}

async function idbDel(key: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

export function listSaves(): SaveMeta[] {
  return SLOTS.map((slot) => {
    try {
      const raw = localStorage.getItem(metaKey(slot)) ?? memory.get(metaKey(slot));
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

/** Compact serializer: stat lines and attributes become arrays (≈60% smaller saves). */
const STAT_KEYS = ['gp', 'passAtt', 'passCmp', 'passYds', 'passTD', 'passInt', 'sacked', 'rushAtt', 'rushYds', 'rushTD', 'rec', 'recYds', 'recTD', 'fumLost', 'tackles', 'sacks', 'ints', 'ff', 'pd', 'fgm', 'fga', 'fgLong', 'xpm', 'xpa', 'puntYds', 'punts', 'retYds', 'retTD', 'longRush', 'longRec'];
const ATTR_KEYS = ['spd', 'str', 'agi', 'acc', 'awr', 'sta', 'arm', 'accu', 'mob', 'pow', 'elu', 'car', 'hands', 'route', 'rblk', 'pblk', 'rush', 'shed', 'tkl', 'cov', 'kpow', 'kacc'];

function pack(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(pack);
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if ('passAtt' in o && 'rushYds' in o && 'tackles' in o) {
      const arr = STAT_KEYS.map((k) => (o[k] as number) || 0);
      while (arr.length && arr[arr.length - 1] === 0) arr.pop();
      return { $s: arr };
    }
    if ('spd' in o && 'kacc' in o && 'route' in o) return { $a: ATTR_KEYS.map((k) => o[k]) };
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(o)) if (x !== undefined) out[k] = pack(x);
    return out;
  }
  return v;
}

function unpack(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(unpack);
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if ('$s' in o) {
      const arr = o.$s as number[];
      return Object.fromEntries(STAT_KEYS.map((k, i) => [k, arr[i] ?? 0]));
    }
    if ('$a' in o) {
      const arr = o.$a as number[];
      return Object.fromEntries(ATTR_KEYS.map((k, i) => [k, arr[i] ?? 50]));
    }
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(o)) out[k] = unpack(x);
    return out;
  }
  return v;
}

export function serialize<T>(data: T): string {
  return JSON.stringify(pack(data));
}
export function deserialize<T>(raw: string): T {
  return unpack(JSON.parse(raw)) as T;
}

export async function saveSlot<T>(slot: Slot, data: T, meta: Omit<SaveMeta, 'slot' | 'exists'>): Promise<boolean> {
  const raw = serialize(data);
  let ok = await idbPut(lsKey(slot), raw);
  if (!ok) {
    try { localStorage.setItem(lsKey(slot), raw); ok = true; } catch { memory.set(lsKey(slot), raw); ok = true; }
  }
  const m = JSON.stringify({ ...meta, savedAt: Date.now() });
  try {
    localStorage.setItem(metaKey(slot), m);
    localStorage.setItem(LAST, String(slot));
  } catch {
    memory.set(metaKey(slot), m);
  }
  return ok;
}

export async function loadSlot<T>(slot: Slot): Promise<T | null> {
  let raw = await idbGet(lsKey(slot));
  if (!raw) { try { raw = localStorage.getItem(lsKey(slot)); } catch { raw = null; } }
  if (!raw) raw = memory.get(lsKey(slot)) ?? null;
  if (!raw) return null;
  try {
    localStorage.setItem(LAST, String(slot));
  } catch { /* ignore */ }
  try {
    return deserialize<T>(raw);
  } catch {
    return null;
  }
}

export async function deleteSlot(slot: Slot) {
  await idbDel(lsKey(slot));
  try {
    localStorage.removeItem(lsKey(slot));
    localStorage.removeItem(metaKey(slot));
  } catch { /* ignore */ }
  memory.delete(lsKey(slot));
  memory.delete(metaKey(slot));
}

export async function exportSlot(slot: Slot): Promise<string | null> {
  return (await idbGet(lsKey(slot))) ?? (() => { try { return localStorage.getItem(lsKey(slot)); } catch { return null; } })();
}
