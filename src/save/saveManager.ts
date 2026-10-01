/**
 * Dynasty persistence. Saves are full JSON snapshots of the Dynasty object, stored in IndexedDB in the
 * browser (localStorage is too small for ~10MB worlds). A memory backend is used in tests.
 */
import { SCHEDULE_RULES, TEAM_BY_ID } from '../data';
import { createConferenceChampionships } from '../simulation/postseasonEngine';
import type { Dynasty } from '../models/types';
import { DYNASTY_VERSION } from '../simulation/seasonEngine';

export interface SaveMeta {
  slotId: string;
  name: string;
  dynastyId: string;
  teamId: string;
  season: number;
  week: number;
  record: string;
  savedAt: number;
  auto: boolean;
}

export interface StorageBackend {
  get(store: 'meta' | 'data', key: string): Promise<unknown>;
  put(store: 'meta' | 'data', key: string, value: unknown): Promise<void>;
  delete(store: 'meta' | 'data', key: string): Promise<void>;
  all(store: 'meta'): Promise<unknown[]>;
}

export class MemoryBackend implements StorageBackend {
  private stores = { meta: new Map<string, unknown>(), data: new Map<string, unknown>() };
  async get(store: 'meta' | 'data', key: string) {
    const v = this.stores[store].get(key);
    return v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  }
  async put(store: 'meta' | 'data', key: string, value: unknown) {
    this.stores[store].set(key, JSON.parse(JSON.stringify(value)));
  }
  async delete(store: 'meta' | 'data', key: string) {
    this.stores[store].delete(key);
  }
  async all(store: 'meta') {
    return [...this.stores[store].values()];
  }
}

export class IndexedDbBackend implements StorageBackend {
  private dbp: Promise<IDBDatabase>;
  constructor(name = 'saturday26') {
    this.dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
        if (!db.objectStoreNames.contains('data')) db.createObjectStore('data');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  private async tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.dbp;
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const req = fn(t.objectStore(store));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  get(store: 'meta' | 'data', key: string) {
    return this.tx(store, 'readonly', (s) => s.get(key));
  }
  async put(store: 'meta' | 'data', key: string, value: unknown) {
    await this.tx(store, 'readwrite', (s) => s.put(value, key));
  }
  async delete(store: 'meta' | 'data', key: string) {
    await this.tx(store, 'readwrite', (s) => s.delete(key));
  }
  all(store: 'meta') {
    return this.tx(store, 'readonly', (s) => s.getAll());
  }
}

/**
 * IndexedDB when the page may use it, otherwise memory (saves last for the session) — some sandboxed
 * embeds (e.g. website builders) deny IndexedDB.
 */
export class BrowserBackend implements StorageBackend {
  private ready: Promise<StorageBackend>;
  constructor(name = 'saturday26') {
    this.ready = (async () => {
      try {
        const idb = new IndexedDbBackend(name);
        await idb.all('meta');
        return idb;
      } catch {
        return new MemoryBackend();
      }
    })();
  }
  async get(store: 'meta' | 'data', key: string) {
    return (await this.ready).get(store, key);
  }
  async put(store: 'meta' | 'data', key: string, value: unknown) {
    return (await this.ready).put(store, key, value);
  }
  async delete(store: 'meta' | 'data', key: string) {
    return (await this.ready).delete(store, key);
  }
  async all(store: 'meta') {
    return (await this.ready).all(store);
  }
}

export function metaFor(d: Dynasty, slotId: string, name: string, auto: boolean): SaveMeta {
  const r = d.teams[d.userTeamId].record;
  return {
    slotId,
    name,
    dynastyId: d.id,
    teamId: d.userTeamId,
    season: d.season,
    week: d.week,
    record: `${r.w}-${r.l}`,
    savedAt: Date.now(),
    auto,
  };
}

export class SaveManager {
  constructor(private backend: StorageBackend) {}

  async save(d: Dynasty, slotId: string, name: string, auto = false): Promise<SaveMeta> {
    d.updatedAt = Date.now();
    const meta = metaFor(d, slotId, name, auto);
    // Stored as a string: faster structured clone for big objects and identical to the export format.
    await this.backend.put('data', slotId, JSON.stringify(d));
    await this.backend.put('meta', slotId, meta);
    return meta;
  }

  async autosave(d: Dynasty): Promise<SaveMeta> {
    return this.save(d, `auto_${d.id}`, `${TEAM_BY_ID[d.userTeamId]?.school ?? 'Dynasty'} (Autosave)`, true);
  }

  async load(slotId: string): Promise<Dynasty> {
    const raw = await this.backend.get('data', slotId);
    if (!raw) throw new Error(`Save ${slotId} not found`);
    return parseDynasty(typeof raw === 'string' ? raw : JSON.stringify(raw));
  }

  async list(): Promise<SaveMeta[]> {
    const metas = (await this.backend.all('meta')) as SaveMeta[];
    return metas.sort((a, b) => b.savedAt - a.savedAt);
  }

  async remove(slotId: string): Promise<void> {
    await this.backend.delete('data', slotId);
    await this.backend.delete('meta', slotId);
  }
}

export function parseDynasty(json: string): Dynasty {
  const d = JSON.parse(json) as Dynasty;
  if (!d || typeof d !== 'object' || !d.teams || !d.players || !d.schedule) throw new Error('Not a SATURDAY 26 dynasty file');
  if (d.version > DYNASTY_VERSION) throw new Error(`Save is from a newer version (${d.version})`);
  return migrateDynasty(d);
}

/** Upgrade older saves in place. v1 (Milestone 1) had no postseason, history or offseason. */
export function migrateDynasty(d: Dynasty): Dynasty {
  if (d.version < 2) {
    d.postseason = d.postseason ?? null;
    d.history = d.history ?? [];
    d.offseason = d.offseason ?? null;
    if ((d.phase as string) === 'regularComplete' || (d.phase as string) === 'preseason') {
      // v1 stopped after week 14: resume at championship week.
      d.phase = 'regular';
      d.week = SCHEDULE_RULES.regularSeasonWeeks;
      const ccgWeek = createConferenceChampionships(d);
      if (ccgWeek !== null) {
        d.phase = 'ccg';
        d.week = ccgWeek;
      }
    }
    d.version = 2;
  }
  return d;
}

export function newSlotId(): string {
  return `slot_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
