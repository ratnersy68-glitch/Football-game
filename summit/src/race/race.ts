/**
 * Race session: start order, countdown, gate detection (between the poles = pass, outside =
 * missed → time penalty), splits, finish, ranking. Every racer — player and AI — runs on
 * the same Skier physics; AI only supplies inputs.
 */
import { Skier, type GearStats, type PhysicsWorld, type SkierInput, NO_INPUT } from '../physics/skier';
import { RacerAI, AI_LEVELS, RacingLine } from '../ai/racerAI';
import type { Gate, RaceCourse, Trail } from '../world/types';
import { AI_RACERS } from '../data/names';
import { Rng } from '../core/rng';
import { TrickSystem } from '../physics/tricks';
import { trailPoint } from '../world/resortBuilder';

export const PENALTY: Record<RaceCourse['discipline'], number> = {
  slalom: 2, 'giant-slalom': 3, 'super-g': 4, downhill: 5, 'ski-cross': 3, freestyle: 3,
};

export interface Racer {
  id: number;
  name: string;
  country: string;
  bib: number;
  isPlayer: boolean;
  skier: Skier;
  ai: RacerAI | null;
  next: number;
  missed: number;
  passed: number;
  splits: number[];
  startAt: number;
  started: boolean;
  finish: number | null;
  dnf: boolean;
  px: number; pz: number;
  tricks: TrickSystem;
  lastGateAt: number;
  watchGate: number;
  watchBest: number;
  watchT: number;
}

export interface RaceResult {
  name: string; country: string; bib: number; isPlayer: boolean; time: number | null; raw: number | null; missed: number; trickScore: number; rank: number; dnf: boolean;
}

export interface RaceOptions {
  level: number;
  playerName: string;
  playerGear: GearStats;
  board: 'ski' | 'snowboard';
  seed: number;
  aiCount?: number;
  /** Seconds before the player each AI starts (alpine stagger). */
  interval?: number;
}

export class RaceSession {
  readonly racers: Racer[] = [];
  readonly gates: Gate[];
  clock = -3.5;
  phase: 'countdown' | 'running' | 'done' = 'countdown';
  readonly simultaneous: boolean;
  readonly penalty: number;
  events: { type: 'gate' | 'miss' | 'split' | 'finish' | 'start'; racer: Racer; gate?: number; t: number }[] = [];
  private lastBeep = 4;
  readonly line: RacingLine;
  beeps: number[] = [];

  constructor(readonly course: RaceCourse, readonly trail: Trail, readonly world: PhysicsWorld, readonly opts: RaceOptions) {
    this.gates = [...course.gates, course.finish];
    this.simultaneous = course.discipline === 'ski-cross' || course.discipline === 'freestyle';
    this.penalty = PENALTY[course.discipline];
    const rng = new Rng(opts.seed);
    const n = Math.max(1, opts.aiCount ?? course.racers);
    const pool = rng.shuffle(AI_RACERS.slice());
    const level = AI_LEVELS[Math.max(0, Math.min(AI_LEVELS.length - 1, opts.level))];
    const interval = opts.interval ?? 3;
    const playerSlot = this.simultaneous ? 0 : n; // player starts last in alpine events
    this.line = new RacingLine(course, (x, z) => world.terrain.height(x, z));
    for (let i = 0; i <= n; i++) {
      const isPlayer = i === playerSlot;
      const who = isPlayer ? { name: opts.playerName, country: 'YOU', skill: 1 } : pool[(i - (i > playerSlot ? 1 : 0)) % pool.length];
      const s = new Skier();
      s.board = isPlayer ? opts.board : 'ski';
      if (isPlayer) s.gear = { ...opts.playerGear };
      else {
        const k = level.skill * (0.92 + 0.08 * who.skill);
        s.gear = { speed: 0.42 + 0.4 * k, control: 0.45 + 0.4 * k, carving: 0.45 + 0.42 * k, stability: 0.4 + 0.45 * k, jump: 0.5, powder: 0.5 };
      }
      const ai = isPlayer ? null : new RacerAI(level.skill * (0.93 + 0.07 * who.skill), opts.seed * 31 + i);
      if (ai && course.discipline === 'freestyle') ai.tricks = true;
      if (ai) ai.line = this.line;
      const r: Racer = {
        id: i, name: who.name, country: who.country, bib: i + 1, isPlayer, skier: s, ai, next: 0, missed: 0, passed: 0, splits: [],
        startAt: this.simultaneous ? 0 : -(playerSlot - i) * interval, started: false, finish: null, dnf: false, px: 0, pz: 0,
        tricks: new TrickSystem(), lastGateAt: 0, watchGate: -1, watchBest: Infinity, watchT: 0,
      };
      this.racers.push(r);
    }
    this.placeAtStart();
    // earlier starters have already been racing: catch them up headlessly
    const first = Math.min(...this.racers.map((r) => r.startAt));
    if (first < -3.5) {
      this.clock = first;
      while (this.clock < -3.5) this.update(1 / 60, NO_INPUT);
      this.events.length = 0;
    }
  }

  get player(): Racer { return this.racers.find((r) => r.isPlayer)!; }

  private placeAtStart() {
    const st = this.course.start;
    const yaw = Math.atan2(st.dx, st.dz);
    const lanes = this.racers.length;
    this.racers.forEach((r, i) => {
      let x = st.x, z = st.z;
      if (this.simultaneous) {
        const off = (i - (lanes - 1) / 2) * Math.min(4, (this.trail.width - 4) / lanes);
        x += -st.dz * off; z += st.dx * off;
        if (r.ai) r.ai.laneOffset = off * 0.5;
      }
      r.skier.place(this.world, x, z, yaw, 0);
      r.skier.state = 'hold';
      r.px = x; r.pz = z;
    });
  }

  /** Advance the race by dt; player input is applied to the player's skier. */
  update(dt: number, playerInput: SkierInput) {
    this.events.length = 0;
    this.beeps.length = 0;
    this.clock += dt;
    if (this.phase === 'countdown') {
      const sec = Math.ceil(-this.clock);
      if (sec < this.lastBeep && sec >= 0 && sec <= 3) { this.lastBeep = sec; this.beeps.push(sec); }
      if (this.clock >= 0) { this.phase = 'running'; this.beeps.push(0); }
    }
    for (const r of this.racers) {
      const s = r.skier;
      if (!r.started) {
        if (this.clock >= r.startAt) {
          r.started = true;
          s.state = 'ride';
          s.vel.set(this.course.start.dx * 2.5, 0, this.course.start.dz * 2.5);
          this.events.push({ type: 'start', racer: r, t: this.clock });
        } else continue;
      }
      if (r.finish !== null) {
        // coast & stop after the finish
        s.step(dt, { ...NO_INPUT, brake: true }, this.world);
        continue;
      }
      let input = playerInput;
      if (r.ai) {
        const others = this.simultaneous ? this.racers.filter((o) => o !== r).map((o) => ({ x: o.skier.pos.x, z: o.skier.pos.z })) : [];
        input = r.ai.drive(s, this.gates, r.next, dt, others, this.world.obstacles);
        // progress watchdog: a racer that cannot get closer to its next gate hikes back to the line
        const g = this.gates[Math.min(r.next, this.gates.length - 1)];
        const dGate = Math.hypot(s.pos.x - g.x, s.pos.z - g.z);
        if (r.next !== r.watchGate || dGate < r.watchBest - 2) { r.watchGate = r.next; r.watchBest = dGate; r.watchT = 0; }
        else r.watchT += dt;
        if (r.ai.stuck > 8 || (r.watchT > 7 && s.state !== 'crashed' && s.state !== 'recover')) this.rescue(r);
      }
      r.px = s.pos.x; r.pz = s.pos.z;
      if (!r.isPlayer) s.events.length = 0;
      s.step(dt, input, this.world);
      // trick scoring for freestyle races
      for (const e of s.events) {
        if (e.type === 'land' && e.air) r.tricks.landAir(e.air, e.landing!);
        if (e.type === 'grindEnd' && e.grind) r.tricks.landGrind(e.grind.name, e.grind.seconds, e.grind.quality, e.grind.bonus);
        if (e.type === 'crash') r.tricks.bust();
      }
      r.tricks.tick(dt, s.grounded);
      this.checkGates(r);
    }
    if (this.simultaneous) this.collide();
    if (this.phase === 'running' && this.racers.every((r) => r.finish !== null || r.dnf)) this.phase = 'done';
  }

  /** Gate crossing between previous and current positions. */
  private checkGates(r: Racer) {
    const s = r.skier;
    for (let guard = 0; guard < 3 && r.next < this.gates.length; guard++) {
      const g = this.gates[r.next];
      const sp = (r.px - g.x) * g.dx + (r.pz - g.z) * g.dz;
      const sc = (s.pos.x - g.x) * g.dx + (s.pos.z - g.z) * g.dz;
      if (!(sp < 0 && sc >= 0)) break;
      const t = sp / (sp - sc);
      const cx = r.px + (s.pos.x - r.px) * t, cz = r.pz + (s.pos.z - r.pz) * t;
      const lat = (cx - g.x) * -g.dz + (cz - g.z) * g.dx;
      const isFinish = r.next === this.gates.length - 1;
      const elapsed = this.clock - r.startAt;
      if (isFinish) {
        if (Math.abs(lat) <= g.width / 2 + 3) {
          r.tricks.bank();
          r.finish = elapsed;
          this.events.push({ type: 'finish', racer: r, t: elapsed });
          r.next++;
        } else break; // must cross the finish between the posts
      } else if (Math.abs(lat) <= g.width / 2 + 0.25) {
        r.passed++;
        this.events.push({ type: 'gate', racer: r, gate: r.next, t: elapsed });
        if (g.split) { r.splits.push(elapsed); this.events.push({ type: 'split', racer: r, gate: r.next, t: elapsed }); }
        r.next++;
      } else {
        r.missed++;
        this.events.push({ type: 'miss', racer: r, gate: r.next, t: elapsed });
        if (g.split) r.splits.push(elapsed);
        r.next++;
      }
      r.lastGateAt = elapsed;
    }
  }

  /** Last-resort recovery for an AI that is truly stuck: hike it back onto the line. */
  private rescue(r: Racer) {
    const g = this.gates[Math.min(r.next, this.gates.length - 1)];
    const p = trailPoint(this.trail, Math.max(0, g.s - 15));
    r.skier.place(this.world, p.x, p.z, Math.atan2(p.dx, p.dz), 3);
    r.px = p.x; r.pz = p.z;
    r.ai?.resync(p.x, p.z);
    r.watchT = 0; r.watchBest = Infinity;
  }

  private collide() {
    const rs = this.racers;
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      const a = rs[i].skier, b = rs[j].skier;
      if (a.state === 'hold' || b.state === 'hold') continue;
      const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 0 && d < 0.9 && Math.abs(a.pos.y - b.pos.y) < 1.5) {
        const nx = dx / d, nz = dz / d, push = (0.9 - d) / 2;
        a.pos.x -= nx * push; a.pos.z -= nz * push; b.pos.x += nx * push; b.pos.z += nz * push;
        const rel = (b.vel.x - a.vel.x) * nx + (b.vel.z - a.vel.z) * nz;
        if (rel < 0) {
          a.vel.x += nx * rel * 0.5; a.vel.z += nz * rel * 0.5; b.vel.x -= nx * rel * 0.5; b.vel.z -= nz * rel * 0.5;
          if (-rel > 7) (Math.random() < 0.5 ? a : b).crash('Ski cross collision');
        }
      }
    }
  }

  /** Player abandons: mark DNF and fast-forward the AI to completion. */
  forfeit() {
    this.player.dnf = true;
  }

  /** Simulate remaining AI racers (used when the player finishes early or quits). */
  simulateRest(maxSeconds = 300) {
    const dt = 1 / 30;
    let t = 0;
    while (this.phase !== 'done' && t < maxSeconds) {
      this.update(dt, NO_INPUT);
      t += dt;
    }
    for (const r of this.racers) if (r.finish === null) r.dnf = true;
    this.phase = 'done';
  }

  totalTime(r: Racer): number | null {
    if (r.finish === null || r.dnf) return null;
    let t = r.finish + r.missed * this.penalty;
    if (this.course.discipline === 'freestyle') t = Math.max(t * 0.5, t - r.tricks.total / 1000);
    return t;
  }

  results(): RaceResult[] {
    const rows = this.racers.map((r) => ({
      name: r.name, country: r.country, bib: r.bib, isPlayer: r.isPlayer, time: this.totalTime(r), raw: r.finish, missed: r.missed,
      trickScore: Math.round(r.tricks.total), rank: 0, dnf: r.dnf || r.finish === null,
    }));
    rows.sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity));
    rows.forEach((r, i) => { r.rank = r.time === null ? 0 : i + 1; });
    return rows;
  }

  /** Live ranking by progress (gates passed, then distance to the next gate). */
  standings(): Racer[] {
    return this.racers.slice().sort((a, b) => {
      if ((a.finish !== null) !== (b.finish !== null)) return a.finish !== null ? -1 : 1;
      if (a.finish !== null && b.finish !== null) return (this.totalTime(a) ?? 0) - (this.totalTime(b) ?? 0);
      if (a.next !== b.next) return b.next - a.next;
      const ga = this.gates[Math.min(a.next, this.gates.length - 1)];
      return Math.hypot(a.skier.pos.x - ga.x, a.skier.pos.z - ga.z) - Math.hypot(b.skier.pos.x - ga.x, b.skier.pos.z - ga.z);
    });
  }
}
