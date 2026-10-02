/**
 * ReplaySystem: records renderer snapshots for the current pitch/play and plays the last
 * one back with pause, slow motion, scrubbing and a free orbit camera.
 */
import type { Snapshot } from './GameEngine';

export class ReplaySystem {
  private rec: { dt: number; snap: Snapshot }[] = [];
  last: { dt: number; snap: Snapshot }[] = [];
  lastNotable: string[] = [];
  recording = false;
  // playback
  active = false;
  t = 0;
  speed = 1;
  paused = false;

  start() {
    this.rec = [];
    this.recording = true;
  }

  push(dt: number, snap: Snapshot) {
    if (!this.recording) return;
    this.rec.push({ dt, snap: structuredClone(snap) });
    if (this.rec.length > 60 * 40) this.rec.shift();
  }

  /** Finish the current recording and keep it as "the last play". */
  commit(notable: string[]) {
    if (this.rec.length > 20) {
      this.last = this.rec;
      this.lastNotable = notable;
    }
    this.rec = [];
    this.recording = false;
  }

  get duration(): number {
    return this.last.reduce((a, f) => a + f.dt, 0);
  }

  open() {
    if (!this.last.length) return false;
    this.active = true;
    this.t = 0;
    this.speed = 1;
    this.paused = false;
    return true;
  }

  close() {
    this.active = false;
  }

  step(dt: number) {
    if (!this.paused) this.t += dt * this.speed;
    const d = this.duration;
    if (this.t > d + 0.6) this.t = 0; // loop
    if (this.t < 0) this.t = 0;
  }

  scrub(delta: number) {
    this.t = Math.max(0, Math.min(this.duration, this.t + delta));
  }

  frame(): Snapshot | null {
    if (!this.last.length) return null;
    let acc = 0;
    for (const f of this.last) {
      acc += f.dt;
      if (acc >= this.t) return f.snap;
    }
    return this.last[this.last.length - 1].snap;
  }
}
