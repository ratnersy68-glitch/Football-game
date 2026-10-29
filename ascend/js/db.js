// Minimal persistence layer: IndexedDB first, localStorage second, memory as a last resort.
const DB_NAME = 'ascend';
const DB_VERSION = 2;

let dbp = null;
export let mode = 'idb';

function openDb() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('photos')) {
        const ps = db.createObjectStore('photos', { keyPath: 'id' });
        ps.createIndex('user', 'userId');
      }
      if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('indexedDB blocked'));
  });
  return dbp;
}

function tx(store, type, fn) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, type);
    const s = t.objectStore(store);
    let out;
    Promise.resolve(fn(s)).then((r) => { out = r; });
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('aborted'));
  }));
}
const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

const mem = new Map();
const memPhotos = new Map();

function lsGet(k) { try { const v = localStorage.getItem('ascend:' + k); return v == null ? undefined : JSON.parse(v); } catch { return mem.get(k); } }
function lsSet(k, v) { try { localStorage.setItem('ascend:' + k, JSON.stringify(v)); } catch { mode = 'memory'; mem.set(k, v); } }
function lsDel(k) { try { localStorage.removeItem('ascend:' + k); } catch { mem.delete(k); } }

export async function init() {
  try {
    await openDb();
    mode = 'idb';
  } catch {
    try { localStorage.setItem('ascend:probe', '1'); localStorage.removeItem('ascend:probe'); mode = 'local'; } catch { mode = 'memory'; }
  }
  return mode;
}

export async function get(key) {
  if (mode === 'idb') {
    try { return await tx('kv', 'readonly', (s) => reqP(s.get(key))); } catch { mode = 'local'; }
  }
  if (mode === 'local') return lsGet(key);
  return mem.get(key);
}

export async function set(key, value) {
  if (mode === 'idb') {
    try { await tx('kv', 'readwrite', (s) => { s.put(value, key); }); return; } catch { mode = 'local'; }
  }
  if (mode === 'local') return lsSet(key, value);
  mem.set(key, value);
}

export async function del(key) {
  if (mode === 'idb') { try { await tx('kv', 'readwrite', (s) => { s.delete(key); }); return; } catch { mode = 'local'; } }
  if (mode === 'local') return lsDel(key);
  mem.delete(key);
}

// ---------- photos (kept out of the main state blob) ----------
export async function putPhoto(p) {
  if (mode === 'idb') { try { await tx('photos', 'readwrite', (s) => { s.put(p); }); return; } catch { /* fall through */ } }
  memPhotos.set(p.id, p);
}
export async function listPhotos(userId) {
  if (mode === 'idb') {
    try {
      const all = await tx('photos', 'readonly', (s) => reqP(s.index('user').getAll(userId)));
      return all.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch { /* fall through */ }
  }
  return [...memPhotos.values()].filter((p) => p.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
}
export async function deletePhoto(id) {
  if (mode === 'idb') { try { await tx('photos', 'readwrite', (s) => { s.delete(id); }); return; } catch { /* fall through */ } }
  memPhotos.delete(id);
}
export async function clearPhotos(userId) {
  const list = await listPhotos(userId);
  for (const p of list) await deletePhoto(p.id);
}

// ---------- user-added demonstration videos (blobs) ----------
const memVideos = new Map();
export async function putVideo(v) {
  if (mode === 'idb') { try { await tx('videos', 'readwrite', (s) => { s.put(v); }); return; } catch { /* fall through */ } }
  memVideos.set(v.id, v);
}
export async function getVideo(id) {
  if (mode === 'idb') { try { return await tx('videos', 'readonly', (s) => reqP(s.get(id))); } catch { /* fall through */ } }
  return memVideos.get(id);
}
export async function deleteVideo(id) {
  if (mode === 'idb') { try { await tx('videos', 'readwrite', (s) => { s.delete(id); }); return; } catch { /* fall through */ } }
  memVideos.delete(id);
}

export async function requestPersistence() {
  try { if (navigator.storage?.persist) return await navigator.storage.persist(); } catch { /* ignore */ }
  return false;
}
