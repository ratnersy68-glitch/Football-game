import { STRIKES, SUBMISSIONS } from '../data';
import type { FightEngine } from '../engine/FightEngine';
import type { FightEvent } from '../engine/types';
import { fmtClock } from '../core/math';
import { snapshot, type RenderSnap } from './Snapshot';

export interface Highlight {
  id: number;
  title: string;
  round: number;
  clock: string;
  kind: 'knockdown' | 'bigStrike' | 'submission' | 'takedown' | 'finish';
  frames: RenderSnap[];
  /** Index of the key moment inside frames. */
  keyIndex: number;
  score: number;
}

const PRE = 3.2;
const POST = 1.6;

/**
 * Keeps a rolling buffer of render snapshots and cuts highlight clips around important moments
 * (knockdowns, big shots, submission attempts, the finish).
 */
export class ReplayRecorder {
  private buf: RenderSnap[] = [];
  private pending: Array<{ at: number; t: number; title: string; kind: Highlight['kind']; round: number; clock: string; score: number }> = [];
  highlights: Highlight[] = [];
  private nextId = 1;
  private lastBigStrike = -99;

  constructor(private e: FightEngine) {
    e.bus.on((ev) => this.onEvent(ev));
  }

  private onEvent(ev: FightEvent) {
    const e = this.e;
    const name = (s: number) => e.f[s].last;
    const clock = fmtClock(e.clock);
    let item: { title: string; kind: Highlight['kind']; score: number } | null = null;
    switch (ev.type) {
      case 'knockdown':
        item = { title: `${name(ev.side === 0 ? 1 : 0)} drops ${name(ev.side)} with a ${ev.by.toLowerCase()}`, kind: 'knockdown', score: 90 };
        break;
      case 'strikeLanded':
        if ((ev.big && ev.dmg >= 8) || (ev.counter === 'timed' && ev.dmg >= 6)) {
          if (e.time - this.lastBigStrike < 3) return;
          this.lastBigStrike = e.time;
          item = { title: `${name(ev.side)}: ${ev.counter ? 'counter ' : ''}${STRIKES[ev.id].name.toLowerCase()}`, kind: 'bigStrike', score: 40 + ev.dmg * 2 };
        }
        break;
      case 'subAttempt':
        item = { title: `${name(ev.side)} attempts a ${SUBMISSIONS[ev.subId].name.toLowerCase()}`, kind: 'submission', score: 55 };
        break;
      case 'takedown':
        if (ev.variant === 'trip' || ev.variant === 'cage') item = { title: `${name(ev.side)} ${ev.variant === 'trip' ? 'trips' : 'drags'} ${name(ev.side === 0 ? 1 : 0)} down`, kind: 'takedown', score: 30 };
        break;
      case 'fightEnd':
        if (ev.result.winner !== null && ev.result.method !== 'DEC') {
          item = { title: `FINISH — ${name(ev.result.winner)} by ${ev.result.method} (${ev.result.detail})`, kind: 'finish', score: 1000 };
        }
        break;
    }
    if (item) this.pending.push({ at: e.time + POST, t: e.time, round: e.round, clock, ...item });
  }

  /** Call once per rendered frame with the live engine. */
  record() {
    const e = this.e;
    const snap = snapshot(e);
    this.buf.push(snap);
    const cutoff = e.time - PRE - POST - 0.5;
    while (this.buf.length && this.buf[0].t < cutoff) this.buf.shift();
    const finished = e.status === 'finished';
    for (const p of [...this.pending]) {
      if (e.time >= p.at || finished) {
        this.cut(p, finished);
        this.pending.splice(this.pending.indexOf(p), 1);
      }
    }
  }

  private cut(p: { t: number; title: string; kind: Highlight['kind']; round: number; clock: string; score: number }, finished: boolean) {
    const frames = this.buf.filter((f) => f.t >= p.t - PRE && f.t <= p.t + POST);
    if (frames.length < 10) return;
    if (finished) {
      // hold on the final frame for a moment
      const last = frames[frames.length - 1];
      for (let i = 0; i < 50; i++) frames.push({ ...last, t: last.t + i / 60 });
    }
    let keyIndex = frames.findIndex((f) => f.t >= p.t);
    if (keyIndex < 0) keyIndex = frames.length - 1;
    this.highlights.push({ id: this.nextId++, title: p.title, round: p.round, clock: p.clock, kind: p.kind, frames, keyIndex, score: p.score });
    // keep the best dozen
    if (this.highlights.length > 12) {
      const worst = this.highlights.filter((h) => h.kind !== 'finish').sort((a, b) => a.score - b.score)[0];
      this.highlights.splice(this.highlights.indexOf(worst), 1);
    }
  }
}
