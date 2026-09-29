export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const round = (v: number, digits = 0) => {
  const m = Math.pow(10, digits);
  return Math.round(v * m) / m;
};
export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
export const avg = (arr: number[]) => (arr.length ? sum(arr) / arr.length : 0);

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatHeight(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

export function pct(n: number, d: number, digits = 1): string {
  if (!d) return '0.0';
  return ((100 * n) / d).toFixed(digits);
}

let idCounter = 0;
export function uid(prefix: string): string {
  idCounter = (idCounter + 1) % 1e9;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
