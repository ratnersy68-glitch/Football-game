// Application state: one JSON document per account, persisted through db.js.
// Accounts are namespaced so additional profiles can be added later without migration.
import * as db from './db.js';
import { uid, deepClone } from './util.js';

export const SCHEMA_VERSION = 1;
const SNAPSHOT_COUNT = 3;

export function emptyState() {
  return {
    schema: SCHEMA_VERSION,
    profile: null,
    prefs: {
      theme: 'system', motion: 'system', sound: true, haptics: true, accent: 'ice', frame: 'ring',
      defaultRest: 120, reminders: { enabled: false, time: '17:30' }, autoRest: true,
    },
    splits: [], activeSplitId: null,
    customExercises: [],
    sessions: [],
    activeWorkout: null,
    goals: [],
    bodyweights: [],
    prs: [],
    rank: { idx: 0, history: [], lastScore: 0 },
    xp: { total: 0, log: [] },
    achievements: {},
    coach: { accepted: {} },
    meta: { createdAt: new Date().toISOString(), lastBackupAt: null, seenReveal: {} },
  };
}

/** Bring older / partial documents up to the current shape without dropping data. */
export function migrate(doc) {
  const base = emptyState();
  const out = { ...base, ...doc };
  out.prefs = { ...base.prefs, ...(doc.prefs || {}) };
  out.prefs.reminders = { ...base.prefs.reminders, ...(doc.prefs?.reminders || {}) };
  out.rank = { ...base.rank, ...(doc.rank || {}) };
  out.xp = { ...base.xp, ...(doc.xp || {}) };
  out.coach = { ...base.coach, ...(doc.coach || {}) };
  out.meta = { ...base.meta, ...(doc.meta || {}) };
  for (const k of ['splits', 'customExercises', 'sessions', 'goals', 'bodyweights', 'prs']) if (!Array.isArray(out[k])) out[k] = [];
  out.schema = SCHEMA_VERSION;
  return out;
}

export const store = {
  userId: null,
  state: emptyState(),
  listeners: new Set(),
  saveTimer: null,
  dirty: false,
};

export function subscribe(fn) { store.listeners.add(fn); return () => store.listeners.delete(fn); }

async function accounts() {
  return (await db.get('accounts')) || { active: null, list: [] };
}

export async function load() {
  await db.init();
  let acc = await accounts();
  if (!acc.active) {
    const id = uid('u');
    acc = { active: id, list: [{ id, createdAt: new Date().toISOString() }] };
    await db.set('accounts', acc);
  }
  store.userId = acc.active;
  const doc = await db.get(`user:${acc.active}`);
  store.state = doc ? migrate(doc) : emptyState();
  return store.state;
}

/** Mutate state through this so every change is persisted. */
export function update(fn, { immediate = false, silent = false } = {}) {
  fn(store.state);
  store.dirty = true;
  if (immediate) saveNow();
  else if (silent) scheduleSave(); // keystroke-level edits: debounce
  else if (!store.queued) { store.queued = true; queueMicrotask(() => { store.queued = false; saveNow(); }); }
  if (!silent) store.listeners.forEach((l) => l(store.state));
}

export function scheduleSave() {
  clearTimeout(store.saveTimer);
  store.saveTimer = setTimeout(saveNow, 300);
}

export async function saveNow() {
  clearTimeout(store.saveTimer);
  if (!store.userId) return;
  store.dirty = false;
  await db.set(`user:${store.userId}`, store.state);
}

/** Rolling snapshots after significant events (e.g. finishing a workout). */
export async function snapshot() {
  const key = `snaps:${store.userId}`;
  const list = (await db.get(key)) || [];
  list.unshift({ at: new Date().toISOString(), data: deepClone(store.state) });
  await db.set(key, list.slice(0, SNAPSHOT_COUNT));
}
export async function listSnapshots() {
  return ((await db.get(`snaps:${store.userId}`)) || []).map((s, i) => ({ i, at: s.at, sessions: s.data.sessions?.length || 0 }));
}
export async function restoreSnapshot(i) {
  const list = (await db.get(`snaps:${store.userId}`)) || [];
  if (!list[i]) throw new Error('Snapshot not found');
  store.state = migrate(list[i].data);
  await saveNow();
  store.listeners.forEach((l) => l(store.state));
}

// ---------- export / restore ----------
export async function exportData({ includePhotos = false } = {}) {
  const out = { app: 'ASCEND', schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data: store.state };
  if (includePhotos) out.photos = await db.listPhotos(store.userId);
  return out;
}

export function validateImport(obj) {
  const errors = [];
  if (!obj || typeof obj !== 'object') errors.push('Not a JSON object.');
  else {
    if (obj.app !== 'ASCEND') errors.push('This file was not exported from ASCEND.');
    if (!obj.data || typeof obj.data !== 'object') errors.push('Missing data section.');
    else {
      if (!obj.data.profile) errors.push('Missing profile.');
      if (obj.data.sessions && !Array.isArray(obj.data.sessions)) errors.push('Sessions are malformed.');
      if (Array.isArray(obj.data.sessions) && obj.data.sessions.some((s) => !s || !s.date || !Array.isArray(s.exercises))) errors.push('Some sessions are malformed.');
    }
    if (obj.schema > SCHEMA_VERSION) errors.push('File is from a newer version of ASCEND.');
  }
  return errors;
}

export async function importData(obj) {
  const errors = validateImport(obj);
  if (errors.length) throw new Error(errors.join(' '));
  await snapshot(); // keep the current data recoverable
  store.state = migrate(obj.data);
  store.state.meta.lastBackupAt = store.state.meta.lastBackupAt || null;
  if (Array.isArray(obj.photos)) {
    for (const p of obj.photos) if (p?.id && p?.data) await db.putPhoto({ ...p, userId: store.userId });
  }
  await saveNow();
  store.listeners.forEach((l) => l(store.state));
}

export async function resetAll() {
  await snapshot();
  await db.clearPhotos(store.userId);
  store.state = emptyState();
  await saveNow();
  store.listeners.forEach((l) => l(store.state));
}

export { db };
