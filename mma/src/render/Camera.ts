import { clamp, damp } from '../core/math';
import type { RenderSnap } from '../presentation/Snapshot';
import { APOTHEM } from '../engine/Octagon';

export const TILT = 0.58;
export const HEIGHT_SCALE = 0.84;

export interface View {
  w: number;
  h: number;
  x: number;
  z: number;
  zoom: number;
  shakeX: number;
  shakeY: number;
}

/** Projects world (x, z, height y) to screen pixels for the broadcast camera. */
export function project(v: View, x: number, z: number, y = 0) {
  const depth = 1 + (z - v.z) * 0.035;
  return {
    x: v.w / 2 + (x - v.x) * v.zoom * depth + v.shakeX,
    y: v.h * 0.64 + (z - v.z) * v.zoom * TILT - y * v.zoom * HEIGHT_SCALE * depth + v.shakeY,
    s: v.zoom * depth,
  };
}

/**
 * Broadcast-style camera: keeps both fighters in frame, tightens during exchanges and on the
 * ground, drifts toward the centre near the fence, frames knockdowns/finishes, never whips around.
 */
export class CameraController {
  view: View = { w: 1280, h: 720, x: 0, z: 0, zoom: 90, shakeX: 0, shakeY: 0 };
  private shake = 0;
  private dramatic = 0;
  private dramaticSide: 0 | 1 | -1 = -1;
  shakeEnabled = true;

  kick(amount: number) {
    if (this.shakeEnabled) this.shake = Math.min(1, this.shake + amount);
  }

  focus(side: 0 | 1, seconds: number) {
    this.dramatic = seconds;
    this.dramaticSide = side;
  }

  update(snap: RenderSnap, dt: number, w: number, h: number) {
    const v = this.view;
    v.w = w;
    v.h = h;
    const [a, b] = snap.f;
    let cx = (a.x + b.x) / 2;
    let cz = (a.z + b.z) / 2;
    const dx = Math.abs(a.x - b.x);
    const dz = Math.abs(a.z - b.z);
    // Fit both fighters with generous margins
    const fitW = w / (dx + 5.2);
    const fitH = h / ((dz * TILT + 2.9) * 1.25);
    const base = Math.min(w / 12.5, h / 7.4);
    let zoom = Math.min(fitW, fitH);
    zoom = clamp(zoom, base * 0.75, base * 1.3);
    const dist = Math.hypot(a.x - b.x, a.z - b.z);
    if (snap.mode === 'stand' && dist < 1.8) zoom *= 1.1;
    if (snap.mode === 'clinch') zoom *= 1.12;
    if (snap.mode === 'ground' || snap.mode === 'sub') zoom *= 1.22;
    // near the fence: ease the frame toward the centre so the cage is readable
    const r = Math.hypot(cx, cz);
    if (r > APOTHEM - 2) {
      const k = Math.min(1, (r - (APOTHEM - 2)) / 2) * 0.28;
      cx *= 1 - k;
      cz *= 1 - k;
    }
    if (this.dramatic > 0 && this.dramaticSide !== -1) {
      this.dramatic -= dt;
      const f = snap.f[this.dramaticSide];
      cx = cx * 0.35 + f.x * 0.65;
      cz = cz * 0.35 + f.z * 0.65;
      zoom *= 1.35;
    }
    const k = damp(this.dramatic > 0 ? 3 : 2.2, dt);
    v.x += (cx - v.x) * k;
    v.z += (cz - v.z) * k;
    v.zoom += (zoom - v.zoom) * damp(1.6, dt);
    // shake
    this.shake = Math.max(0, this.shake - dt * 2.8);
    const s = this.shake * this.shake * 9;
    v.shakeX = (Math.random() - 0.5) * s;
    v.shakeY = (Math.random() - 0.5) * s;
  }

  snapTo(snap: RenderSnap, w: number, h: number) {
    this.update(snap, 10, w, h);
    const v = this.view;
    v.x = (snap.f[0].x + snap.f[1].x) / 2;
    v.z = (snap.f[0].z + snap.f[1].z) / 2;
    v.zoom = Math.min(w / 12.5, h / 7.4);
  }
}
