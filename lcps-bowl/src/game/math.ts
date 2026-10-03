export interface Vec {
  x: number;
  y: number;
}

export const v = (x: number, y: number): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec, s: number): Vec => ({ x: a.x * s, y: a.y * s });
export const len = (a: Vec): number => Math.hypot(a.x, a.y);
export const dist = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, a.y - b.y);
export const norm = (a: Vec): Vec => {
  const l = Math.hypot(a.x, a.y);
  return l > 1e-6 ? { x: a.x / l, y: a.y / l } : { x: 0, y: 0 };
};
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const clamp = (x: number, lo: number, hi: number): number => (x < lo ? lo : x > hi ? hi : x);
export const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y;

/** Field geometry (yards). Sim frame: offense attacks +x, own goal line at x=0, opponent goal line at x=100. */
export const FIELD_W = 160 / 3; // 53.33 yards
export const CENTER_Y = FIELD_W / 2;
export const HASH_OFFSET = 160 / 3 / 2 - 17.78; // NFHS hashes are 53'4" apart -> ~8.9 yards from center
