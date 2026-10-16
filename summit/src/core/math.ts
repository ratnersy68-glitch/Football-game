export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
/** Wrap angle to (-PI, PI]. */
export function wrapAngle(a: number): number {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
}
/** Exponential smoothing factor for a rate (per second) and dt, frame-rate independent. */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
export const approach = (v: number, target: number, maxDelta: number) =>
  v < target ? Math.min(v + maxDelta, target) : Math.max(v - maxDelta, target);

/** Distance from point p to segment ab in 2D, returning t along segment too. */
export function distToSegment2(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz;
  let t = len2 > 0 ? ((px - ax) * dx + (pz - az) * dz) / len2 : 0;
  t = clamp(t, 0, 1);
  const cx = ax + dx * t, cz = az + dz * t;
  const ex = px - cx, ez = pz - cz;
  return { d: Math.sqrt(ex * ex + ez * ez), t, cx, cz, side: dx * (pz - az) - dz * (px - ax) };
}

export function formatTime(sec: number): string {
  if (!isFinite(sec)) return '--:--.--';
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(2)}`;
}
