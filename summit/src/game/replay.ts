/** Run recording (replays + ghosts) and interpolated playback. */
import { Quaternion, Vector3 } from 'three';
import type { Skier } from '../physics/skier';

/** Per frame: t, x, y, z, qx, qy, qz, qw, crouch, compression, tuck, lean, brake, grab, grabAmt, state, speed */
export const STRIDE = 17;
const STATES = ['ride', 'air', 'grind', 'crashed', 'recover', 'lift', 'hold'];

export interface RunEvent { t: number; text: string; score?: number }

export interface Recording {
  hz: number;
  frames: Float32Array;
  count: number;
  events: RunEvent[];
  board: 'ski' | 'snowboard';
  meta?: { resortId: string; title: string; date: number; score?: number; time?: number };
}

export class Recorder {
  private buf: Float32Array;
  private n = 0;
  private acc = 0;
  t = 0;
  events: RunEvent[] = [];
  constructor(private hz = 30, maxSeconds = 150) {
    this.buf = new Float32Array(hz * maxSeconds * STRIDE);
  }
  reset() { this.n = 0; this.t = 0; this.acc = 0; this.events = []; }

  record(dt: number, s: Skier) {
    this.t += dt;
    this.acc += dt;
    if (this.acc < 1 / this.hz) return;
    this.acc -= 1 / this.hz;
    const max = this.buf.length / STRIDE;
    if (this.n >= max) {
      // ring: drop the oldest second
      this.buf.copyWithin(0, this.hz * STRIDE);
      this.n -= this.hz;
      const t0 = this.buf[0];
      this.events = this.events.filter((e) => e.t >= t0);
    }
    const o = this.n * STRIDE;
    const b = this.buf;
    b[o] = this.t; b[o + 1] = s.pos.x; b[o + 2] = s.pos.y; b[o + 3] = s.pos.z;
    b[o + 4] = s.bodyQ.x; b[o + 5] = s.bodyQ.y; b[o + 6] = s.bodyQ.z; b[o + 7] = s.bodyQ.w;
    b[o + 8] = s.crouch; b[o + 9] = s.compression; b[o + 10] = s.tuckAmt; b[o + 11] = s.lean; b[o + 12] = s.brakeAmt;
    b[o + 13] = s.grab; b[o + 14] = s.grabAmt; b[o + 15] = STATES.indexOf(s.state); b[o + 16] = s.speed;
    this.n++;
  }

  event(text: string, score?: number) { this.events.push({ t: this.t, text, score }); }

  snapshot(board: 'ski' | 'snowboard', fromT = 0): Recording {
    let start = 0;
    while (start < this.n && this.buf[start * STRIDE] < fromT) start++;
    const count = this.n - start;
    return { hz: this.hz, frames: this.buf.slice(start * STRIDE, this.n * STRIDE), count, events: this.events.filter((e) => e.t >= fromT), board };
  }
}

export interface Frame {
  t: number; pos: Vector3; q: Quaternion; crouch: number; compression: number; tuck: number; lean: number; brake: number;
  grab: number; grabAmt: number; state: string; speed: number;
}

export function emptyFrame(): Frame {
  return { t: 0, pos: new Vector3(), q: new Quaternion(), crouch: 0, compression: 0, tuck: 0, lean: 0, brake: 0, grab: 0, grabAmt: 0, state: 'ride', speed: 0 };
}

/** Sample a recording at absolute time t (seconds since recording start). */
export function sample(rec: Recording, t: number, out: Frame): Frame {
  const f = rec.frames;
  const n = rec.count;
  if (!n) return out;
  const t0 = f[0];
  let lo = 0, hi = n - 1;
  if (t <= t0) hi = 0;
  else if (t >= f[(n - 1) * STRIDE]) lo = hi = n - 1;
  else while (hi - lo > 1) { const m = (lo + hi) >> 1; if (f[m * STRIDE] <= t) lo = m; else hi = m; }
  const a = lo * STRIDE, b = hi * STRIDE;
  const span = f[b] - f[a];
  const k = span > 0 ? (t - f[a]) / span : 0;
  const L = (i: number) => f[a + i] + (f[b + i] - f[a + i]) * k;
  out.t = t;
  out.pos.set(L(1), L(2), L(3));
  const qa = new Quaternion(f[a + 4], f[a + 5], f[a + 6], f[a + 7]);
  const qb = new Quaternion(f[b + 4], f[b + 5], f[b + 6], f[b + 7]);
  out.q.slerpQuaternions(qa, qb, k);
  out.crouch = L(8); out.compression = L(9); out.tuck = L(10); out.lean = L(11); out.brake = L(12);
  out.grab = f[a + 13]; out.grabAmt = L(14); out.state = STATES[f[a + 15]] ?? 'ride'; out.speed = L(16);
  return out;
}

export function duration(rec: Recording): [number, number] {
  if (!rec.count) return [0, 0];
  return [rec.frames[0], rec.frames[(rec.count - 1) * STRIDE]];
}

/** Compact serialisation for storage (Float32 → base64). */
export function encode(rec: Recording): object {
  const bytes = new Uint8Array(rec.frames.buffer, rec.frames.byteOffset, rec.frames.byteLength);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { hz: rec.hz, count: rec.count, events: rec.events, board: rec.board, meta: rec.meta, data: btoa(s) };
}

export function decode(o: { hz: number; count: number; events: RunEvent[]; board: 'ski' | 'snowboard'; meta?: Recording['meta']; data: string }): Recording {
  const s = atob(o.data);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return { hz: o.hz, count: o.count, events: o.events, board: o.board, meta: o.meta, frames: new Float32Array(bytes.buffer) };
}
