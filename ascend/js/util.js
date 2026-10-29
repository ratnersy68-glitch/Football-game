// Pure helpers shared by the engine and the UI. No DOM access at module load.

export const KG_PER_LB = 0.45359237;
export const DAY_MS = 86400000;
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function uid(prefix = '') {
  const r = Math.random().toString(36).slice(2, 8);
  return prefix + Date.now().toString(36) + r;
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sum = (arr) => arr.reduce((a, b) => a + b, 0);
export const mean = (arr) => (arr.length ? sum(arr) / arr.length : 0);

// ---------- units ----------
export const toKg = (v, unit) => (unit === 'lb' ? v * KG_PER_LB : v);
export const fromKg = (kg, unit) => (unit === 'lb' ? kg / KG_PER_LB : kg);

/** Round a displayed weight to the nearest sensible plate step. */
export function roundDisplay(v, unit) {
  const step = unit === 'lb' ? 0.5 : 0.25;
  return Math.round(v / step) * step;
}

export function fmtWeight(kg, unit, { suffix = true, decimals } = {}) {
  if (kg == null || !isFinite(kg)) return '—';
  const v = roundDisplay(fromKg(kg, unit), unit);
  const d = decimals ?? (Number.isInteger(v) ? 0 : 1);
  const s = v.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: 0 });
  return suffix ? `${s} ${unit === 'lb' ? 'lbs' : 'kg'}` : s;
}

export function fmtNum(n, d = 0) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: 0 });
}

/** Volume shown compactly: 12,450 lbs or 12.4k lbs */
export function fmtVolume(kg, unit) {
  const v = fromKg(kg, unit);
  const u = unit === 'lb' ? 'lbs' : 'kg';
  if (v >= 100000) return `${(v / 1000).toFixed(0)}k ${u}`;
  if (v >= 10000) return `${(v / 1000).toFixed(1)}k ${u}`;
  return `${Math.round(v).toLocaleString()} ${u}`;
}

/** Smallest load jump the coach will suggest, in kg. */
export function plateStepKg(unit, lower = false) {
  if (unit === 'lb') return (lower ? 10 : 5) * KG_PER_LB;
  return lower ? 5 : 2.5;
}

export function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  let ft = Math.floor(totalIn / 12);
  let inch = Math.round(totalIn - ft * 12);
  if (inch === 12) { ft += 1; inch = 0; }
  return { ft, inch };
}

// ---------- dates ----------
export function dayKey(d) {
  const x = new Date(d);
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${x.getFullYear()}-${m}-${day}`;
}
export function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
/** Monday-based weekday index 0..6 */
export function weekdayIdx(d) { return (new Date(d).getDay() + 6) % 7; }
export function startOfWeek(d) { const x = startOfDay(d); x.setDate(x.getDate() - weekdayIdx(x)); return x; }
export function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
export function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS); }

export function fmtDate(d, opts = { month: 'short', day: 'numeric' }) {
  return new Date(d).toLocaleDateString(undefined, opts);
}
export function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
export function fmtMinutes(sec) {
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}
export function relDay(d, now = new Date()) {
  const n = daysBetween(d, now);
  if (n === 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 7) return `${n} days ago`;
  return fmtDate(d);
}

// ---------- strings ----------
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
export const plural = (n, w, p = w + 's') => `${n} ${n === 1 ? w : p}`;

/** Parse a user-typed number; returns null for blank / invalid. */
export function parseNum(v, { min = -Infinity, max = Infinity } = {}) {
  if (v === '' || v == null) return null;
  const n = Number(String(v).replace(',', '.'));
  if (!isFinite(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'GOOD EVENING.';
  if (h < 12) return 'GOOD MORNING.';
  if (h < 18) return 'GOOD AFTERNOON.';
  return 'GOOD EVENING.';
}

export function deepClone(o) {
  return typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o));
}
