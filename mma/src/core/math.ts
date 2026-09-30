export interface Vec2 {
  x: number;
  z: number;
}

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const clamp01 = (v: number) => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => clamp01((v - a) / (b - a));
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
/** Frame-rate independent exponential smoothing factor. */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

export const v2 = (x = 0, z = 0): Vec2 => ({ x, z });
export const vsub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, z: a.z - b.z });
export const vadd = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, z: a.z + b.z });
export const vscale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, z: a.z * s });
export const vlen = (a: Vec2) => Math.hypot(a.x, a.z);
export const vdist = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.z - b.z);
export const vnorm = (a: Vec2): Vec2 => {
  const l = Math.hypot(a.x, a.z);
  return l > 1e-6 ? { x: a.x / l, z: a.z / l } : { x: 0, z: 0 };
};
export const vdot = (a: Vec2, b: Vec2) => a.x * b.x + a.z * b.z;
/** Perpendicular (rotated +90deg). */
export const vperp = (a: Vec2): Vec2 => ({ x: -a.z, z: a.x });
export const angleOf = (a: Vec2) => Math.atan2(a.z, a.x);
export const wrapAngle = (a: number) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

/** Format seconds as M:SS. */
export const fmtClock = (s: number) => {
  const t = Math.max(0, Math.ceil(s - 1e-6));
  const m = Math.floor(t / 60);
  const ss = t % 60;
  return `${m}:${ss.toString().padStart(2, '0')}`;
};
