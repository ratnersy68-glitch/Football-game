/**
 * PlaySim — real-time football for one play at a time (fixed timestep, yards & seconds).
 *
 * The user controls exactly one athlete (the QB, then whoever catches his pass). Everyone else is AI with
 * real assignments: routes, pass protection, pass rush, man/zone coverage, pursuit and tackling. The ball is a
 * projectile in 3D; completions happen only when a thrown ball physically reaches a receiver who then wins
 * the catch roll. Nothing about the outcome is predetermined.
 *
 * Field axes: x = downfield (offense attacks +x, goal line at 100), y = across (0..53.33), z = height.
 */
import { Rng } from '../../core/rng';
import { FORMATIONS, PLAYS, ROUTES, runPath, type DefCall, type PlayDef, type Slot } from './playbook';
import type { Athlete, AthleteSpec, Ball, MoveKind, PlayOutcome, SimEvent, SimSettings, Task, UserInput, V2 } from './types';

export const FIELD_W = 53.33;
const G = 10.7; // gravity, yd/s²
const CATCH_Z = 1.3;
const RELEASE_Z = 2.15;
/** Arm's reach for a tackle attempt (yards between centers). */
const TACKLE_REACH = 1.3;
/** A defender laying out can reach a bit farther, at a lower success rate. */
const DIVE_REACH = 2.3;
const RADIUS = 0.42;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const len = (x: number, y: number) => Math.hypot(x, y);

export function maxSpeed(a: Athlete): number {
  const r = a.ratings;
  let s = 5.4 + r.speed * 0.047; // 99 speed ≈ 10 yd/s, 50 speed ≈ 7.8
  if (a.stamina < 40) s *= 0.86 + a.stamina / 290;
  if (a.ball) s *= 0.95;
  // Securing the catch and turning upfield costs a moment.
  if (a.ball && a.pose === 'catch' && a.poseT < 0.45) s *= 0.65;
  return s;
}

function accelOf(a: Athlete): number {
  return 4.5 + a.ratings.acceleration * 0.065; // ~1s to top speed for skill players
}

export interface PlaySetup {
  los: number;
  spotY: number;
  play: PlayDef;
  defCall: DefCall;
}

interface Zone {
  land: V2;
  xr: [number, number];
  yr: [number, number];
  deep: boolean;
}

/** Time for a chaser at `speed` to meet a target at relative position (rx, ry) moving with (vx, vy). */
function interceptTime(rx: number, ry: number, vx: number, vy: number, speed: number): number | null {
  const a = vx * vx + vy * vy - speed * speed;
  const b = 2 * (rx * vx + ry * vy);
  const c = rx * rx + ry * ry;
  if (Math.abs(a) < 1e-6) return b < 0 ? -c / b : null;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  const t1 = (-b - s) / (2 * a);
  const t2 = (-b + s) / (2 * a);
  const t = Math.min(t1 > 0 ? t1 : Infinity, t2 > 0 ? t2 : Infinity);
  return Number.isFinite(t) ? t : null;
}

export class PlaySim {
  athletes: Athlete[] = [];
  byId = new Map<string, Athlete>();
  ball: Ball;
  t = 0;
  phase: 'presnap' | 'live' | 'dead' = 'presnap';
  events: SimEvent[] = [];
  outcome: PlayOutcome | null = null;
  userId: string;
  controlledId: string;
  los = 25;
  spotY = FIELD_W / 2;
  play: PlayDef = PLAYS[0];
  defCall: DefCall = 'cover3';
  private rng: Rng;
  private zones: Record<string, Zone> = {};
  private passer?: string;
  private airYards = 0;
  private qbCrossed = false;
  private biteUntil = 0;
  private snapT = 0;
  /** Non-QB user took manual control this play (otherwise his assignment is run for him). */
  private manual = false;
  /** Last time a non-QB user called for the ball. */
  private callT = -9;
  /** Run plays: the designed hole, and the AI carrier's remaining path through it. */
  private runHole: V2 | null = null;
  private carrierPlan: V2[] = [];
  private carrierHeading = 0;
  private runRead = false;
  private carrierReadAt = 0;

  constructor(
    specs: AthleteSpec[],
    public settings: SimSettings,
    seed: number,
  ) {
    this.rng = new Rng(seed);
    for (const s of specs) {
      const a: Athlete = {
        ...s,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        facing: s.side === 'off' ? 0 : Math.PI,
        stamina: 100,
        task: { kind: 'idle' },
        engageShedAt: 0,
        stunned: 0,
        down: false,
        move: null,
        moveCooldown: 0,
        lastTackleTry: -9,
        history: [],
        reactAt: 0,
        sprinting: false,
        pose: 'stance',
        poseT: 0,
      };
      this.athletes.push(a);
      this.byId.set(a.id, a);
    }
    const user = this.athletes.find((a) => a.user) ?? this.athletes.find((a) => a.role === 'QB')!;
    this.userId = user.id;
    this.controlledId = user.id;
    this.ball = { state: 'dead', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, throwT: 0, attempted: new Set(), spin: 0 };
  }

  get user(): Athlete {
    return this.byId.get(this.userId)!;
  }
  get controlled(): Athlete {
    return this.byId.get(this.controlledId)!;
  }
  offense(): Athlete[] {
    return this.athletes.filter((a) => a.side === 'off');
  }
  defense(): Athlete[] {
    return this.athletes.filter((a) => a.side === 'def');
  }
  bySlot(slot: string): Athlete | undefined {
    return this.athletes.find((a) => a.side === 'off' && a.slot === slot);
  }
  carrier(): Athlete | undefined {
    return this.ball.state === 'held' && this.ball.holder ? this.byId.get(this.ball.holder) : undefined;
  }

  private emit(type: SimEvent['type'], text: string, x?: number, y?: number, who?: string) {
    this.events.push({ type, t: this.t, text, x, y, who });
  }

  drainEvents(): SimEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  // ───────────────────────── Setup ─────────────────────────

  /** Line everyone up for a play. */
  setup(s: PlaySetup): void {
    this.los = s.los;
    this.spotY = s.spotY;
    this.play = s.play;
    this.defCall = s.defCall;
    this.t = 0;
    this.phase = 'presnap';
    this.outcome = null;
    this.events = [];
    this.passer = undefined;
    this.airYards = 0;
    this.qbCrossed = false;
    this.controlledId = this.userId;
    this.manual = false;
    this.callT = -9;
    this.runHole = null;
    this.carrierPlan = [];
    this.carrierHeading = 0;
    this.runRead = false;
    this.carrierReadAt = 0;
    const L = this.los;
    const Y = this.spotY;
    const f = FORMATIONS[s.play.formation];
    for (const a of this.athletes) {
      a.vx = a.vy = 0;
      a.engaged = undefined;
      a.stunned = 0;
      a.down = false;
      a.move = null;
      a.moveCooldown = 0;
      a.lastTackleTry = -9;
      a.history = [];
      a.ball = false;
      a.task = { kind: 'idle' };
      a.pose = 'stance';
      a.facing = a.side === 'off' ? 0 : Math.PI;
      a.stamina = Math.min(100, a.stamina + 35);
    }
    // Offense
    const ol = this.athletes.filter((a) => a.side === 'off' && a.role === 'OL');
    ol.forEach((a, i) => this.place(a, L - 0.7, Y + [-2.6, -1.3, 0, 1.3, 2.6][i]));
    const qb = this.athletes.find((a) => a.side === 'off' && a.role === 'QB')!;
    this.place(qb, f.shotgun ? L - 5 : L - 1.3, Y);
    for (const slot of ['X', 'Z', 'H', 'Y', 'RB'] as Slot[]) {
      const a = this.bySlot(slot);
      if (!a) continue;
      const al = f.align[slot];
      const y = al.y !== undefined ? al.y : Y + (al.dy ?? 0);
      this.place(a, L + al.dx, clamp(y, 2, FIELD_W - 2));
      a.slotKind = slot;
    }
    // Defense
    const d = (slot: string) => this.athletes.find((a) => a.side === 'def' && a.slot === slot);
    const dl = ['LE', 'DT1', 'DT2', 'RE'];
    dl.forEach((sl, i) => {
      const a = d(sl);
      if (a) this.place(a, L + 0.9, Y + [-3.9, -1.2, 1.2, 3.9][i]);
    });
    const X = this.bySlot('X')!;
    const Z = this.bySlot('Z')!;
    const H = this.bySlot('H')!;
    const TE = this.bySlot('Y')!;
    const press = s.defCall === 'cover1' || s.defCall === 'cover0';
    const cbDepth = press ? 1.6 : s.defCall === 'cover2' ? 4.5 : 7;
    const cb1 = d('CB1');
    const cb2 = d('CB2');
    const nb = d('NB');
    if (cb1) this.place(cb1, L + cbDepth, X.y + (X.y < Y ? 0.9 : -0.9));
    if (cb2) this.place(cb2, L + cbDepth, Z.y + (Z.y < Y ? 0.9 : -0.9));
    if (nb) this.place(nb, L + (press ? 2 : 5), H.y + (H.y < Y ? 1 : -1));
    const mlb = d('MLB');
    const wlb = d('WLB');
    if (mlb) this.place(mlb, L + 4.6, Y - 1.5);
    if (wlb) this.place(wlb, L + 4.6, TE.y + (TE.y < Y ? 1.5 : -1.5) * 0.4 + (Y - TE.y) * 0.3);
    const fs = d('FS');
    const ss = d('SS');
    if (s.defCall === 'cover2') {
      if (fs) this.place(fs, L + 13, 13);
      if (ss) this.place(ss, L + 13, FIELD_W - 13);
    } else {
      if (fs) this.place(fs, L + 13.5, Y);
      if (ss) this.place(ss, L + (s.defCall === 'cover0' ? 5 : 8), clamp(Y + (TE.y > Y ? 5 : -5), 6, FIELD_W - 6));
    }
    this.buildZones();
    this.ball = { state: 'dead', x: L, y: Y, z: 0.15, vx: 0, vy: 0, vz: 0, throwT: 0, attempted: new Set(), spin: 0 };
    const center = ol[2];
    if (center) {
      this.ball.x = center.x + 0.7;
      this.ball.y = center.y;
    }
    this.ball.holder = center?.id;
  }

  private place(a: Athlete, x: number, y: number) {
    a.x = x;
    a.y = y;
    a.history = [{ t: 0, x, y }];
  }

  private buildZones() {
    const L = this.los;
    const Y = this.spotY;
    const W = FIELD_W;
    this.zones = {
      deep_mid: { land: { x: L + 15, y: Y }, xr: [L + 10, L + 60], yr: [Y - 13, Y + 13], deep: true },
      deep_left_half: { land: { x: L + 14, y: 13 }, xr: [L + 9, L + 60], yr: [0, W / 2], deep: true },
      deep_right_half: { land: { x: L + 14, y: W - 13 }, xr: [L + 9, L + 60], yr: [W / 2, W], deep: true },
      deep_left_third: { land: { x: L + 13, y: 9 }, xr: [L + 8, L + 60], yr: [0, 18], deep: true },
      deep_mid_third: { land: { x: L + 14, y: W / 2 }, xr: [L + 9, L + 60], yr: [17, W - 17], deep: true },
      deep_right_third: { land: { x: L + 13, y: W - 9 }, xr: [L + 8, L + 60], yr: [W - 18, W], deep: true },
      flat_left: { land: { x: L + 5, y: 9 }, xr: [L - 3, L + 9], yr: [0, 16], deep: false },
      flat_right: { land: { x: L + 5, y: W - 9 }, xr: [L - 3, L + 9], yr: [W - 16, W], deep: false },
      curl_flat_left: { land: { x: L + 8, y: 12 }, xr: [L - 2, L + 13], yr: [0, 19], deep: false },
      curl_flat_right: { land: { x: L + 8, y: W - 12 }, xr: [L - 2, L + 13], yr: [W - 19, W], deep: false },
      hook_left: { land: { x: L + 7, y: Y - 8 }, xr: [L + 1, L + 13], yr: [Y - 15, Y - 2], deep: false },
      hook_mid: { land: { x: L + 7, y: Y }, xr: [L + 1, L + 14], yr: [Y - 7, Y + 7], deep: false },
      hook_right: { land: { x: L + 7, y: Y + 8 }, xr: [L + 1, L + 13], yr: [Y + 2, Y + 15], deep: false },
    };
  }

  // ───────────────────────── Snap / assignments ─────────────────────────

  snap(): void {
    if (this.phase !== 'presnap') return;
    this.phase = 'live';
    this.snapT = this.t;
    const f = FORMATIONS[this.play.formation];
    const qb = this.athletes.find((a) => a.side === 'off' && a.role === 'QB')!;
    const center = this.athletes.filter((a) => a.side === 'off' && a.role === 'OL')[2];
    if (f.shotgun) {
      const tt = 0.38;
      this.ball.state = 'snap';
      this.ball.holder = undefined;
      this.ball.vx = (qb.x - this.ball.x) / tt;
      this.ball.vy = (qb.y - this.ball.y) / tt;
      this.ball.vz = (1.2 - this.ball.z) / tt + 0.5 * G * tt;
      this.ball.target = qb.id;
      this.ball.throwT = this.t;
    } else {
      this.giveBall(qb);
    }
    this.emit('snap', 'Hut!', this.los, this.spotY, center?.id);

    // Offensive assignments
    const run = this.play.run;
    const rb = this.bySlot('RB');
    for (const a of this.offense()) {
      a.pose = 'run';
      if (a.role === 'QB') {
        if (run && rb) a.task = { kind: 'handoff', rb: rb.id };
        else if (a.id === this.userId) a.task = { kind: 'user' };
        else {
          const readAt = this.t + (this.play.depth === 'quick' ? 0.85 : this.play.depth === 'deep' ? 1.5 : 1.15);
          a.task = { kind: 'qbPass', dropX: this.los - 7, readAt, nextRead: readAt };
        }
        continue;
      }
      if (a.role === 'OL') {
        a.task = run ? { kind: 'runBlock' } : { kind: 'passpro' };
        continue;
      }
      if (run) {
        if (a.slotKind === 'RB') {
          const pts = runPath(this.play, this.los, this.spotY, { x: a.x, y: a.y });
          a.task = { kind: 'runPath', pts, idx: 0, startAt: this.t + (run.delay ?? 0) };
          this.runHole = pts[pts.length - 2];
        } else if (a.slotKind === 'Y') a.task = { kind: 'runBlock' };
        else a.task = { kind: 'stalk' };
        continue;
      }
      if (a.slotKind) {
        const r = ROUTES[this.play.routes[a.slotKind]] ?? ROUTES.checkdown;
        const routeTask = this.makeRoute(a, r.name === 'Block & Release' ? ROUTES.block_release : r);
        if (r.points.length === 0) a.task = { kind: 'passpro' };
        else if (this.play.routes[a.slotKind] === 'block_release') a.task = { kind: 'passpro', releaseAt: this.t + 1.4, after: routeTask };
        else if (a.slotKind === 'RB' && this.play.playAction) a.task = { kind: 'fake', until: this.t + 0.9, after: routeTask };
        else a.task = routeTask;
      }
    }

    // Defensive assignments by call.
    const d = (slot: string) => this.athletes.find((a) => a.side === 'def' && a.slot === slot);
    const setT = (slot: string, task: Task) => {
      const a = d(slot);
      if (a) a.task = task;
    };
    const idOf = (slot: string) => this.bySlot(slot)!.id;
    for (const sl of ['LE', 'DT1', 'DT2', 'RE']) setT(sl, { kind: 'rush' });
    switch (this.defCall) {
      case 'cover0':
        setT('CB1', { kind: 'man', target: idOf('X') });
        setT('CB2', { kind: 'man', target: idOf('Z') });
        setT('NB', { kind: 'man', target: idOf('H') });
        setT('FS', { kind: 'man', target: idOf('Y') });
        setT('MLB', { kind: 'man', target: idOf('RB') });
        setT('WLB', { kind: 'rush' });
        setT('SS', { kind: 'rush' });
        break;
      case 'cover1':
        setT('CB1', { kind: 'man', target: idOf('X') });
        setT('CB2', { kind: 'man', target: idOf('Z') });
        setT('NB', { kind: 'man', target: idOf('H') });
        setT('SS', { kind: 'man', target: idOf('Y') });
        setT('WLB', { kind: 'man', target: idOf('RB') });
        setT('MLB', { kind: 'zone', zone: 'hook_mid' });
        setT('FS', { kind: 'zone', zone: 'deep_mid' });
        break;
      case 'cover2':
        setT('CB1', { kind: 'zone', zone: 'flat_left' });
        setT('CB2', { kind: 'zone', zone: 'flat_right' });
        setT('FS', { kind: 'zone', zone: 'deep_left_half' });
        setT('SS', { kind: 'zone', zone: 'deep_right_half' });
        setT('NB', { kind: 'zone', zone: 'hook_left' });
        setT('MLB', { kind: 'zone', zone: 'hook_mid' });
        setT('WLB', { kind: 'zone', zone: 'hook_right' });
        break;
      default:
        setT('CB1', { kind: 'zone', zone: 'deep_left_third' });
        setT('CB2', { kind: 'zone', zone: 'deep_right_third' });
        setT('FS', { kind: 'zone', zone: 'deep_mid_third' });
        setT('NB', { kind: 'zone', zone: 'curl_flat_left' });
        setT('SS', { kind: 'zone', zone: 'curl_flat_right' });
        setT('MLB', { kind: 'zone', zone: 'hook_mid' });
        setT('WLB', { kind: 'zone', zone: 'hook_right' });
    }
    // Play action makes second-level defenders hesitate (QB play-action vs their awareness).
    if (this.play.playAction) {
      const pa = qb.ratings.playAction;
      this.biteUntil = this.t + clamp(0.35 + (pa - 60) * 0.012, 0.2, 0.9);
    } else this.biteUntil = 0;
    for (const a of this.defense()) a.pose = 'run';
    if (run) this.assignRunBlocks();
    else this.assignProtection();
  }

  /** Run blocking: each blocker takes the nearest defender in front of him, linemen before linebackers. */
  private assignRunBlocks() {
    const blockers = this.offense()
      .filter((o) => o.task.kind === 'runBlock')
      .sort((a, b) => Math.abs(a.y - (this.runHole?.y ?? this.spotY)) - Math.abs(b.y - (this.runHole?.y ?? this.spotY)));
    const defenders = this.defense().filter((d) => d.role === 'DL' || d.role === 'LB');
    const taken = new Set<string>();
    for (const b of blockers) {
      let best: Athlete | undefined;
      let bd = Infinity;
      for (const d of defenders) {
        if (taken.has(d.id)) continue;
        const dist = len(d.x - b.x, d.y - b.y) + (d.role === 'LB' ? 2.5 : 0);
        if (dist < bd) {
          bd = dist;
          best = d;
        }
      }
      if (best) {
        taken.add(best.id);
        (b.task as { kind: 'runBlock'; target?: string }).target = best.id;
      }
    }
  }

  private makeRoute(a: Athlete, r: (typeof ROUTES)[string]): Task {
    const side = (FORMATIONS[this.play.formation].align[a.slotKind!]?.side ?? (a.y < this.spotY ? -1 : 1)) as number;
    const pts = r.points.map(([dx, dout]) => ({ x: a.x + dx, y: clamp(a.y + dout * side, 1, FIELD_W - 1) }));
    // Press coverage delays the release depending on release vs press.
    const presser = this.defense().find((d) => Math.abs(d.x - a.x) < 2.5 && Math.abs(d.y - a.y) < 1.8 && (d.role === 'CB' || d.role === 'S'));
    const jam = presser ? clamp(0.25 + (presser.ratings.coverage - a.ratings.release) * 0.012, 0.05, 0.6) : 0;
    return { kind: 'route', pts, idx: 0, continues: !!r.continues, settle: !!r.settle, dir: null, releaseAt: this.t + jam };
  }

  /** Slide protection: OL (and backs asked to block) pick up rushers left to right. */
  private assignProtection() {
    const rushers = this.defense()
      .filter((d) => d.task.kind === 'rush')
      .sort((a, b) => a.y - b.y);
    const blockers = this.offense()
      .filter((o) => o.task.kind === 'passpro' && o.role === 'OL')
      .sort((a, b) => a.y - b.y);
    const backs = this.offense().filter((o) => o.task.kind === 'passpro' && o.role !== 'OL');
    // Pair the 5 OL with the 5 rushers nearest the ball, extra rushers go to backs.
    const byCenter = [...rushers].sort((a, b) => Math.abs(a.y - this.spotY) - Math.abs(b.y - this.spotY));
    const main = byCenter.slice(0, blockers.length).sort((a, b) => a.y - b.y);
    const extra = byCenter.slice(blockers.length);
    blockers.forEach((b, i) => {
      const r = main[Math.min(i, main.length - 1)];
      (b.task as { kind: 'passpro'; target?: string }).target = r?.id;
    });
    backs.forEach((b, i) => {
      const r = extra[i];
      if (r) (b.task as { kind: 'passpro'; target?: string }).target = r.id;
    });
  }

  private giveBall(a: Athlete) {
    for (const x of this.athletes) x.ball = false;
    a.ball = true;
    this.ball.state = 'held';
    this.ball.holder = a.id;
    this.ball.target = undefined;
  }

  // ───────────────────────── Main step ─────────────────────────

  step(dt: number, input: UserInput): void {
    this.t += dt;
    if (this.phase === 'presnap') {
      if (input.snap) this.snap();
      return;
    }
    if (this.phase === 'dead') {
      for (const a of this.athletes) {
        a.vx *= 0.85;
        a.vy *= 0.85;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.poseT += dt;
      }
      return;
    }
    const diff = this.settings.difficulty;
    // Second-level defenders read run keys right after the snap (before the handoff).
    if (this.play.run && !this.runRead && this.t - this.snapT > 0.3) {
      this.runRead = true;
      this.startPursuit();
    }
    for (const a of this.athletes) {
      a.stunned = Math.max(0, a.stunned - dt);
      a.moveCooldown = Math.max(0, a.moveCooldown - dt);
      a.poseT += dt;
      if (a.move && this.t - a.move.t > 0.55) a.move = null;
      a.history.push({ t: this.t, x: a.x, y: a.y });
      if (a.history.length > 90) a.history.shift();
    }

    // User control. A non-QB user's assignment (route, block, run path) is run for him until he
    // touches the stick; handoffs are always automatic.
    const me = this.controlled;
    if (me && !me.down) {
      if (input.callForBall) this.callT = this.t;
      const holding = this.ball.state === 'held' && this.ball.holder === me.id;
      if (me.role !== 'QB' && !holding && len(input.move.x, input.move.y) > 0.15) this.manual = true;
      const scripted = me.task.kind === 'handoff' || me.task.kind === 'runPath';
      if (scripted || (me.role !== 'QB' && !holding && !this.manual)) this.ai(me, dt, diff);
      else this.userControl(me, input, dt);
    }

    // AI.
    for (const a of this.athletes) {
      if (a.id === this.controlledId || a.down) continue;
      this.ai(a, dt, diff);
    }

    this.resolveCollisions();
    this.updateBall(dt);
    if (this.phase === 'live') this.checkTackles();
    if (this.phase === 'live') this.checkBoundaries();

    // Fatigue.
    const fatigueRate = this.settings.sliders.fatigue / 50;
    for (const a of this.athletes) {
      const sp = len(a.vx, a.vy);
      const drain = a.sprinting && sp > 4 ? (4.5 * (1.15 - a.ratings.stamina / 110)) * fatigueRate : -2.5;
      a.stamina = clamp(a.stamina - drain * dt, 0, 100);
    }
  }

  // ───────────────────────── User ─────────────────────────

  private userControl(me: Athlete, input: UserInput, dt: number) {
    if (me.stunned > 0) {
      this.moveToward(me, me.x + me.vx, me.y + me.vy, 0, dt);
      return;
    }
    const isQB = me.role === 'QB';
    const holding = this.ball.state === 'held' && this.ball.holder === me.id;
    // Throws
    if (isQB && holding && !this.qbCrossed) {
      if (input.throwTo) {
        const target = this.bySlot(input.throwTo.slot);
        if (target && target.id !== me.id) {
          this.throwBall(me, target, input.throwTo.power, input.throwTo.lob);
          return;
        }
      }
      if (input.throwAway) {
        this.throwAway(me);
        return;
      }
    }
    // Ball-carrier moves.
    if (holding && input.moveKind && me.moveCooldown <= 0) this.doMove(me, input.moveKind);
    if (this.phase !== 'live') return;

    let mx = input.move.x;
    let my = input.move.y;
    const m = len(mx, my);
    if (m > 1) {
      mx /= m;
      my /= m;
    }
    me.sprinting = input.sprint && m > 0.1 && me.stamina > 3;
    let top = maxSpeed(me) * (me.sprinting ? 1 : 0.72);
    if (me.move?.kind === 'spin') top *= 0.75;
    if (me.move?.kind === 'juke_left' || me.move?.kind === 'juke_right') top *= 1.05;
    const tx = me.x + mx * top;
    const ty = me.y + my * top;
    this.moveToward(me, tx, ty, m > 0.05 ? top * Math.min(1, m) : 0, dt, me.move?.kind?.startsWith('juke') ? 2.2 : 1 + me.ratings.agility / 200);
    if (m > 0.05) me.facing = Math.atan2(my, mx);
    else if (isQB) me.facing = 0;
    if (isQB && me.x > this.los + 0.2 && !this.qbCrossed) {
      this.qbCrossed = true;
      this.startPursuit();
    }
  }

  private doMove(me: Athlete, kind: MoveKind) {
    if (kind === 'slide' || (kind === 'dive' && me.role === 'QB' && this.qbCrossed)) {
      if (me.role === 'QB' && kind === 'slide') {
        me.pose = 'down';
        this.endPlay('slide', me.x + 0.5, me.y, `${me.name} slides.`, me.id);
        return;
      }
    }
    me.move = { kind, t: this.t };
    me.moveCooldown = kind === 'dive' ? 99 : 0.7;
    me.stamina = Math.max(0, me.stamina - 4);
    const f = me.facing;
    const fwd = { x: Math.cos(f), y: Math.sin(f) };
    const left = { x: -fwd.y, y: fwd.x };
    if (kind === 'juke_left' || kind === 'juke_right') {
      const s = kind === 'juke_left' ? 1 : -1;
      const burst = 4 + me.ratings.juke * 0.045 + me.ratings.agility * 0.02;
      me.vx = fwd.x * len(me.vx, me.vy) * 0.45 + left.x * s * burst;
      me.vy = fwd.y * len(me.vx, me.vy) * 0.45 + left.y * s * burst;
      me.pose = 'juke';
    } else if (kind === 'spin') me.pose = 'spin';
    else if (kind === 'stiff_arm') me.pose = 'stiff';
    else if (kind === 'hurdle') me.pose = 'juke';
    else if (kind === 'dive') {
      me.pose = 'dive';
      me.vx = fwd.x * 7;
      me.vy = fwd.y * 7;
    }
    me.poseT = 0;
    this.emit('move', kind.replace('_', ' '), me.x, me.y, me.id);
  }

  // ───────────────────────── Throwing ─────────────────────────

  /** Where will a route runner be `t` seconds from now (following his route at current pace)? */
  predict(a: Athlete, t: number): V2 {
    const task = a.task;
    const speed = Math.max(len(a.vx, a.vy), a.task.kind === 'route' ? maxSpeed(a) * 0.9 : 0);
    if (task.kind !== 'route' || speed < 0.3 || (a.id === this.userId && this.manual)) return { x: a.x + a.vx * t, y: a.y + a.vy * t };
    let px = a.x;
    let py = a.y;
    let rem = speed * t;
    for (let i = task.idx; i < task.pts.length && rem > 0; i++) {
      const p = task.pts[i];
      const d = len(p.x - px, p.y - py);
      if (d >= rem) return { x: px + ((p.x - px) / d) * rem, y: py + ((p.y - py) / d) * rem };
      rem -= d;
      px = p.x;
      py = p.y;
    }
    if (task.settle) return { x: px, y: py };
    const last = task.pts[task.pts.length - 1];
    const prev = task.pts[task.pts.length - 2] ?? { x: a.x, y: a.y };
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const d = len(dx, dy) || 1;
    return { x: px + (dx / d) * rem, y: clamp(py + (dy / d) * rem, 0.5, FIELD_W - 0.5) };
  }

  private throwBall(qb: Athlete, target: Athlete, power: number, lob: boolean) {
    const r = qb.ratings;
    const vMax = 16 + r.throwPower * 0.11;
    let v = 12.5 + (vMax - 12.5) * clamp(power, 0, 1);
    if (lob) v *= 0.72;
    // Lead the receiver along his route.
    let aim = { x: target.x, y: target.y };
    let flight = 0.5;
    for (let i = 0; i < 4; i++) {
      flight = len(aim.x - qb.x, aim.y - qb.y) / v + (lob ? 0.35 : 0.1);
      aim = this.predict(target, flight);
    }
    let dx = aim.x - qb.x;
    let dy = aim.y - qb.y;
    let dist = len(dx, dy);
    const maxD = 30 + r.throwPower * 0.4;
    let short = false;
    if (dist > maxD) {
      dx *= maxD / dist;
      dy *= maxD / dist;
      dist = maxD;
      short = true;
    }
    // Accuracy: depth band, pressure, movement, fatigue, sliders.
    const acc = dist < 12 ? r.shortAccuracy : dist < 25 ? r.mediumAccuracy : r.deepAccuracy;
    let sigma = 0.25 + dist * 0.032;
    sigma *= 1 + (85 - acc) / 38;
    const nearest = Math.min(...this.defense().map((d) => len(d.x - qb.x, d.y - qb.y)));
    const pressured = nearest < 2.6;
    if (pressured) sigma *= 1 + ((2.6 - nearest) / 2.6) * (1.25 - r.underPressure / 100);
    const qbSpeed = len(qb.vx, qb.vy);
    if (qbSpeed > 1.6) sigma *= 1 + (qbSpeed / 7) * (1.25 - r.throwOnRun / 100);
    if (qb.stamina < 40) sigma *= 1.15;
    if (power > 0.85 && dist < 10) sigma *= 1.2; // fastball on a short route
    if (lob && dist > 22) sigma *= 0.9; // touch on deep balls
    sigma *= 1.6 - this.settings.sliders.qbAccuracy / 83;
    const along = this.rng.normal(0, sigma);
    const across = this.rng.normal(0, sigma * 0.8);
    const ux = dx / dist;
    const uy = dy / dist;
    const lx = ux * along - uy * across;
    const ly = uy * along + ux * across;
    const land = { x: qb.x + dx + lx, y: qb.y + dy + ly };
    const hx = land.x - qb.x;
    const hy = land.y - qb.y;
    const hd = len(hx, hy);
    const T = hd / v + (lob ? 0.35 : 0.1);
    const vz = (CATCH_Z - RELEASE_Z + 0.5 * G * T * T) / T;
    this.ball.state = 'air';
    this.ball.holder = undefined;
    this.ball.x = qb.x + Math.cos(qb.facing) * 0.3;
    this.ball.y = qb.y + Math.sin(qb.facing) * 0.3;
    this.ball.z = RELEASE_Z;
    this.ball.vx = hx / T;
    this.ball.vy = hy / T;
    this.ball.vz = vz;
    this.ball.target = target.id;
    this.ball.thrownBy = qb.id;
    this.ball.throwT = this.t;
    this.ball.landing = land;
    this.ball.attempted = new Set([qb.id]);
    this.ball.spin = 18;
    qb.ball = false;
    qb.pose = 'throw';
    qb.poseT = 0;
    this.passer = qb.id;
    this.airYards = land.x - this.los;
    // Describe the throw quality relative to where the receiver will be.
    const miss = along;
    this.ball.quality = short ? 'underthrown' : Math.abs(miss) < 1 && Math.abs(across) < 0.9 ? 'on target' : miss > 1.2 ? 'overthrown' : miss < -1.2 ? 'underthrown' : across > 0 ? 'thrown outside' : 'thrown inside';
    this.emit('throw', `${qb.name} throws to #${target.number} ${target.name}${pressured ? ' under pressure' : ''}`, qb.x, qb.y, qb.id);
    // Defenders react after their read time; the target works back to the ball.
    for (const d of this.defense()) {
      d.reactAt = this.t + clamp(0.3 + (85 - d.ratings.awareness) * 0.006 - this.settings.difficulty * 0.05, 0.08, 0.6);
    }
  }

  private throwAway(qb: Athlete) {
    const y = qb.y < FIELD_W / 2 ? -3 : FIELD_W + 3;
    const x = qb.x + 8;
    const T = 1.1;
    this.ball.state = 'air';
    this.ball.holder = undefined;
    this.ball.x = qb.x;
    this.ball.y = qb.y;
    this.ball.z = RELEASE_Z;
    this.ball.vx = (x - qb.x) / T;
    this.ball.vy = (y - qb.y) / T;
    this.ball.vz = (0.5 - RELEASE_Z + 0.5 * G * T * T) / T;
    this.ball.target = undefined;
    this.ball.attempted = new Set(this.athletes.map((a) => a.id));
    this.ball.throwT = this.t;
    qb.ball = false;
    qb.pose = 'throw';
    this.passer = qb.id;
    this.airYards = 0;
    this.emit('throwaway', `${qb.name} throws it away`, qb.x, qb.y, qb.id);
  }

  private updateBall(dt: number) {
    const b = this.ball;
    if (b.state === 'held') {
      const h = this.byId.get(b.holder!);
      if (h) {
        b.x = h.x + Math.cos(h.facing) * 0.25;
        b.y = h.y + Math.sin(h.facing) * 0.25;
        b.z = h.pose === 'throw' ? 2 : 1.15;
      }
      return;
    }
    if (b.state === 'snap') {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt;
      b.vz -= G * dt;
      const qb = this.byId.get(b.target!);
      if (qb && len(qb.x - b.x, qb.y - b.y) < 0.7) {
        this.giveBall(qb);
        qb.pose = 'run';
      } else if (b.z <= 0.1) {
        // Bad snap (rare): QB falls on it.
        if (qb) this.giveBall(qb);
      }
      return;
    }
    if (b.state !== 'air') return;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.z += b.vz * dt;
    b.vz -= G * dt;
    const flightT = this.t - b.throwT;

    // Batted at the line (shorter QBs get more balls knocked down).
    if (flightT < 0.35 && b.z < 3.2) {
      const qb = this.byId.get(b.thrownBy ?? '');
      const heightFactor = qb ? clamp(0.12 + (76 - qb.ratings.height) * 0.04, 0.02, 0.35) : 0.1;
      for (const d of this.defense()) {
        if (d.role !== 'DL' || b.attempted.has(d.id)) continue;
        if (len(d.x - b.x, d.y - b.y) < 0.9) {
          b.attempted.add(d.id);
          if (this.rng.chance(heightFactor)) {
            b.vx *= -0.2;
            b.vy *= 0.3;
            b.vz = 3;
            b.target = undefined;
            b.lastTouch = d.id;
            d.pose = 'block';
            this.emit('batted', `Batted down at the line by #${d.number} ${d.name}!`, b.x, b.y, d.id);
          }
        }
      }
    }

    // Catch attempts: whoever the ball physically reaches first.
    const cands: { a: Athlete; d: number }[] = [];
    for (const a of this.athletes) {
      if (a.down || a.stunned > 0.3 || b.attempted.has(a.id)) continue;
      if (a.role === 'OL' || a.role === 'DL') continue;
      const d = len(a.x - b.x, a.y - b.y);
      const isRec = a.side === 'off';
      const jump = isRec ? 0.35 + (a.ratings.contested - 60) * 0.01 + (a.ratings.height - 72) * 0.03 : 0.3 + (a.ratings.height - 72) * 0.025;
      const reach = isRec ? 0.95 + (a.id === b.target ? 0.25 : 0) : 0.85;
      const zMax = 2.45 + jump;
      if (d < reach && b.z < zMax && b.z > 0.15) {
        if (!isRec && this.t < a.reactAt && d > 0.45) continue; // defender hasn't located the ball yet
        cands.push({ a, d });
      }
    }
    cands.sort((p, q) => p.d - q.d);
    for (const { a, d } of cands) {
      b.attempted.add(a.id);
      if (this.attemptCatch(a, d)) return;
      if (this.ball.state !== 'air') return;
    }

    if (b.z <= 0.05) {
      b.z = 0;
      b.state = 'ground';
      this.endPlay('incomplete', this.los, this.spotY, `Incomplete${b.quality && b.quality !== 'on target' ? ` — ${b.quality}` : ''}.`);
    }
    if (b.x > 112 || b.x < -12) {
      b.state = 'ground';
      this.endPlay('incomplete', this.los, this.spotY, 'Incomplete — out of the end zone.');
    }
  }

  private attemptCatch(a: Athlete, d: number): boolean {
    const b = this.ball;
    const speed = len(b.vx, b.vy);
    // Nearest opponent contesting the catch point.
    const opp = this.athletes.filter((o) => o.side !== a.side && !o.down && o.role !== 'OL' && o.role !== 'DL');
    const contest = opp.length ? Math.min(...opp.map((o) => len(o.x - b.x, o.y - b.y))) : 9;
    if (a.side === 'off') {
      let p = 0.93 + (a.ratings.catching - 78) * 0.007 - Math.max(0, speed - 19) * 0.012 - d * 0.16;
      if (contest < 1.4) p -= (1.4 - contest) * 0.22 * (1.2 - a.ratings.contested / 100);
      if (b.z > 2.5 || b.z < 0.5) p -= 0.12; // high or low ball
      if (a.id !== b.target) p -= 0.15;
      if (a.stamina < 30) p -= 0.05;
      p += (this.settings.sliders.wrCatching - 50) * 0.004;
      p = clamp(p, 0.08, 0.98);
      if (this.rng.chance(p)) {
        this.giveBall(a);
        a.pose = 'catch';
        a.poseT = 0;
        const diving = d > 0.95;
        this.emit('catch', `${diving ? 'Diving catch' : 'Caught'} by #${a.number} ${a.name}!`, a.x, a.y, a.id);
        // A user QB takes over the catcher; a user receiver keeps his own man and the catcher runs on AI.
        if (a.id === this.userId || this.user.role === 'QB') {
          this.controlledId = a.id;
          a.task = { kind: 'user' };
        } else {
          a.task = { kind: 'carrier' };
          this.carrierHeading = 0;
        }
        this.startPursuit();
        return true;
      }
      // Drop / deflect off hands.
      b.vx *= 0.35;
      b.vy *= 0.35;
      b.vz = Math.abs(b.vz) * 0.25 + 1.2;
      b.target = undefined;
      b.lastTouch = a.id;
      this.emit('drop', `Off the hands of #${a.number} ${a.name}!`, a.x, a.y, a.id);
      return false;
    }
    // Defender: interception, deflection or miss.
    const skill = a.ratings.ballSkills;
    let pInt = 0.14 + (skill - 70) * 0.008 - d * 0.12 + (this.settings.sliders.interceptions - 50) * 0.003 + this.settings.difficulty * 0.02;
    if (b.target && len((this.byId.get(b.target)?.x ?? 99) - b.x, (this.byId.get(b.target)?.y ?? 99) - b.y) > 2) pInt += 0.2; // throw into nobody but a defender
    pInt = clamp(pInt, 0.03, 0.6);
    const r = this.rng.next();
    if (r < pInt) {
      this.giveBall(a);
      a.pose = 'catch';
      this.emit('interception', `INTERCEPTED by #${a.number} ${a.name}!`, a.x, a.y, a.id);
      this.endPlay('interception', a.x, a.y, `Intercepted by #${a.number} ${a.name}.`, a.id);
      return true;
    }
    if (r < pInt + 0.5) {
      b.vx = b.vx * 0.3 + this.rng.normal(0, 2);
      b.vy = b.vy * 0.3 + this.rng.normal(0, 2);
      b.vz = 2 + this.rng.float(0, 2.5);
      b.target = undefined;
      b.lastTouch = a.id;
      a.pose = 'block';
      this.emit('deflection', `Broken up by #${a.number} ${a.name}!`, a.x, a.y, a.id);
    }
    return false;
  }

  // ───────────────────────── AI ─────────────────────────

  private ai(a: Athlete, dt: number, diff: number) {
    if (a.stunned > 0) {
      a.vx *= 0.9;
      a.vy *= 0.9;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      return;
    }
    if (a.engaged) {
      this.engagedStep(a, dt);
      return;
    }
    const t = a.task;
    const top = maxSpeed(a);
    a.sprinting = true;
    // Pass in the air: the target works back to the ball; defenders who have read it break on it.
    if (this.ball.state === 'air' && this.ball.landing) {
      const land = this.ball.landing;
      const tLeft = this.timeToLanding();
      if (a.id === this.ball.target && (t.kind === 'route' || t.kind === 'passpro')) {
        const dist = len(land.x - a.x, land.y - a.y);
        // Keep running the route until the ball is catchable, then attack the catch point.
        if (dist < top * tLeft + 1.5 || tLeft < 0.9) {
          this.moveToward(a, land.x, land.y, top, dt, 1.2, tLeft < 0.4);
          return;
        }
      } else if (a.side === 'def' && this.t >= a.reactAt && t.kind !== 'rush' && !a.engaged) {
        const dist = len(land.x - a.x, land.y - a.y);
        if (dist < tLeft * top + 3) {
          this.moveToward(a, land.x, land.y, top, dt, 1.2, false);
          return;
        }
      }
    }
    switch (t.kind) {
      case 'idle':
        this.moveToward(a, a.x, a.y, 0, dt);
        break;
      case 'fake': {
        const qb = this.athletes.find((x) => x.side === 'off' && x.role === 'QB')!;
        this.moveToward(a, qb.x + 2.5, qb.y + 0.5, top * 0.6, dt);
        if (this.t >= t.until) a.task = t.after;
        break;
      }
      case 'route':
        this.runRoute(a, t, dt);
        break;
      case 'toBall': {
        const land = this.ball.landing;
        if (land && this.ball.state === 'air') this.moveToward(a, land.x, land.y, top, dt);
        else this.moveToward(a, a.x, a.y, 0, dt);
        break;
      }
      case 'passpro':
        this.passPro(a, t, dt);
        break;
      case 'rush':
        this.rush(a, dt, diff);
        break;
      case 'man':
        this.manCover(a, t.target, dt, diff);
        break;
      case 'zone':
        this.zoneCover(a, t.zone, dt, diff);
        break;
      case 'pursue':
        this.pursue(a, dt, diff);
        break;
      case 'block':
        this.downfieldBlock(a, dt);
        break;
      case 'handoff':
        this.handoff(a, t, dt);
        break;
      case 'runPath':
        this.runPathStep(a, t, dt);
        break;
      case 'runBlock':
        this.runBlock(a, t, dt);
        break;
      case 'stalk':
        this.stalk(a, t, dt);
        break;
      case 'qbPass':
        this.aiQuarterback(a, t, dt);
        break;
      case 'carrier':
        this.aiCarrier(a, dt);
        break;
      default:
        this.moveToward(a, a.x, a.y, 0, dt);
    }
  }

  private timeToLanding(): number {
    const b = this.ball;
    // Solve z(t) = CATCH_Z.
    const A = -0.5 * G;
    const B = b.vz;
    const C = b.z - CATCH_Z;
    const disc = B * B - 4 * A * C;
    if (disc < 0) return 0;
    return Math.max(0, (-B - Math.sqrt(disc)) / (2 * A));
  }

  private runRoute(a: Athlete, t: Extract<Task, { kind: 'route' }>, dt: number) {
    const top = maxSpeed(a);
    if (this.t < t.releaseAt) {
      this.moveToward(a, a.x + 0.5, a.y, 1.5, dt);
      return;
    }
    if (t.idx < t.pts.length) {
      const p = t.pts[t.idx];
      const d = len(p.x - a.x, p.y - a.y);
      if (d < 0.8) {
        t.dir = { x: (p.x - (t.pts[t.idx - 1]?.x ?? a.x)) || 1, y: p.y - (t.pts[t.idx - 1]?.y ?? a.y) };
        t.idx++;
      }
      const target = t.pts[Math.min(t.idx, t.pts.length - 1)];
      const lastLeg = t.idx >= t.pts.length - 1;
      // Sharp cuts: better route runners keep more speed through the break.
      const cutBoost = 1 + a.ratings.routeRunning / 120;
      this.moveToward(a, target.x, target.y, top, dt, cutBoost, lastLeg && t.settle);
      return;
    }
    if (t.settle || t.pts.length === 0) {
      // Sit in the soft spot, drift to stay in the QB's window.
      const qb = this.athletes.find((x) => x.side === 'off' && x.role === 'QB')!;
      this.moveToward(a, a.x, a.y, 0, dt);
      a.facing = Math.atan2(qb.y - a.y, qb.x - a.x);
      return;
    }
    const last = t.pts[t.pts.length - 1];
    const prev = t.pts[t.pts.length - 2] ?? { x: last.x - 1, y: last.y };
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const dd = len(dx, dy) || 1;
    let tx = a.x + (dx / dd) * 5;
    let ty = a.y + (dy / dd) * 5;
    if (ty < 1.5 || ty > FIELD_W - 1.5) {
      ty = clamp(ty, 1.5, FIELD_W - 1.5);
      tx = a.x + 5;
    }
    this.moveToward(a, tx, ty, top, dt, 1, false);
  }

  private qb(): Athlete {
    return this.athletes.find((x) => x.side === 'off' && x.role === 'QB')!;
  }

  private passPro(a: Athlete, t: Extract<Task, { kind: 'passpro' }>, dt: number) {
    if (t.releaseAt && this.t >= t.releaseAt && t.after && !a.engaged) {
      a.task = t.after;
      if (a.task.kind === 'route') {
        // Re-base the release route from where the back is now.
        const r = ROUTES.block_release;
        const side = a.y < this.spotY ? -1 : 1;
        a.task.pts = r.points.map(([dx, dout]) => ({ x: a.x + dx, y: clamp(a.y + dout * side, 1, FIELD_W - 1) }));
        a.task.idx = 0;
        a.task.releaseAt = this.t;
      }
      return;
    }
    const qb = this.qb();
    const rusher = t.target ? this.byId.get(t.target) : undefined;
    // After the throw or once the QB leaves the pocket, just stay on your man.
    if (!rusher || rusher.down || rusher.task.kind !== 'rush' || (rusher.engaged && rusher.engaged !== a.id)) {
      // Help: find a free rusher near the QB.
      const free = this.defense().find((d) => d.task.kind === 'rush' && !d.engaged && len(d.x - qb.x, d.y - qb.y) < 6);
      if (free && (a.role !== 'OL' || len(free.x - a.x, free.y - a.y) < 3)) t.target = free.id;
      else {
        const hold = { x: this.los - (a.role === 'OL' ? 1.5 : 3.5), y: a.role === 'OL' ? a.y : qb.y + (a.y < qb.y ? -1.5 : 1.5) };
        this.moveToward(a, hold.x, hold.y, 4, dt);
        a.facing = 0;
        return;
      }
    }
    const r = this.byId.get(t.target!)!;
    // Get between the rusher and the QB.
    const vx = qb.x - r.x;
    const vy = qb.y - r.y;
    const vd = len(vx, vy) || 1;
    const px = r.x + (vx / vd) * 1.0;
    const py = r.y + (vy / vd) * 1.0;
    this.moveToward(a, px, py, maxSpeed(a) * 0.8, dt, 1.4);
    a.facing = Math.atan2(r.y - a.y, r.x - a.x);
    if (len(r.x - a.x, r.y - a.y) < 1.05 && !r.engaged && r.stunned <= 0) this.engage(a, r);
  }

  private engage(blocker: Athlete, def: Athlete) {
    blocker.engaged = def.id;
    def.engaged = blocker.id;
    blocker.pose = 'block';
    def.pose = 'block';
    const br = blocker.role === 'OL' ? blocker.ratings.blocking : blocker.ratings.blocking * 0.85;
    const pr = this.play.run ? (def.ratings.strength + def.ratings.tackle) / 2 : def.task.kind === 'rush' ? def.ratings.passRush : def.ratings.strength;
    const slider = 1 + (this.settings.sliders.passBlocking - 50) / 100;
    // Smarter rush moves at higher difficulty shorten blocks a little (technique, not ratings).
    const moves = 1 - this.settings.difficulty * 0.06;
    const mean = (this.play.run ? 1.5 : 2.6) * Math.pow(Math.max(30, br) / Math.max(30, pr), 1.7) * slider * moves;
    def.engageShedAt = this.t + mean * (0.45 + this.rng.next() * 1.1);
    blocker.engageShedAt = def.engageShedAt;
  }

  private engagedStep(a: Athlete, dt: number) {
    const o = this.byId.get(a.engaged!);
    if (!o || o.engaged !== a.id) {
      a.engaged = undefined;
      return;
    }
    if (a.side === 'def' && (o.task.kind === 'runBlock' || o.task.kind === 'stalk')) {
      // Run block: the blocker drives the defender off the ball and away from the hole (or gets driven back).
      const drive = 0.45 + (o.ratings.blocking - (a.ratings.strength + a.ratings.tackle) / 2) * 0.03;
      const hole = this.runHole ?? { x: this.los, y: this.spotY };
      const side = Math.sign(a.y - hole.y) || 1;
      a.x += drive * dt;
      a.y += side * 0.35 * dt;
      o.x = a.x - 0.95;
      o.y = a.y;
      a.vx = o.vx = drive;
      a.vy = o.vy = side * 0.35;
      a.facing = Math.PI;
      o.facing = 0;
      if (this.t >= a.engageShedAt) {
        a.engaged = undefined;
        o.engaged = undefined;
        o.stunned = 0.4;
        a.pose = 'run';
      }
      return;
    }
    if (a.side === 'def') {
      const qb = this.qb();
      const goal = this.carrier() ?? qb;
      const push = 0.35 + Math.max(0, a.ratings.passRush - o.ratings.blocking) * 0.02;
      const vx = goal.x - a.x;
      const vy = goal.y - a.y;
      const d = len(vx, vy) || 1;
      a.x += (vx / d) * push * dt;
      a.y += (vy / d) * push * dt;
      o.x = a.x + (vx / d) * 0.95;
      o.y = a.y + (vy / d) * 0.95;
      a.vx = (vx / d) * push;
      a.vy = (vy / d) * push;
      o.vx = a.vx;
      o.vy = a.vy;
      a.facing = Math.atan2(vy, vx);
      o.facing = a.facing + Math.PI;
      // Shed.
      if (this.t >= a.engageShedAt || (!this.play.run && this.ball.state === 'held' && this.ball.holder !== qb.id && this.t >= a.engageShedAt - 0.8)) {
        a.engaged = undefined;
        o.engaged = undefined;
        o.stunned = 0.5;
        a.pose = 'run';
        // Rip past the blocker.
        const side = this.rng.chance(0.5) ? 1 : -1;
        a.x += (-vy / d) * side * 0.9;
        a.y += (vx / d) * side * 0.9;
      }
    }
  }

  private rush(a: Athlete, dt: number, diff: number) {
    const qb = this.qb();
    const carrier = this.carrier();
    if (carrier && carrier.id !== qb.id) {
      this.pursue(a, dt, diff);
      return;
    }
    if (this.qbCrossed) {
      this.pursue(a, dt, diff);
      return;
    }
    // Blitzers time their rush off the snap; linemen get off the ball a touch slower than top speed.
    if (a.role !== 'DL' && this.t - this.snapT < 0.3) {
      this.moveToward(a, a.x - 0.5, a.y, 2, dt);
      return;
    }
    const top = maxSpeed(a) * (a.role === 'DL' ? 0.92 : 0.9);
    // Contain: edge rushers keep outside leverage at higher difficulty.
    let tx = qb.x;
    let ty = qb.y;
    if (diff >= 2 && (a.slot === 'LE' || a.slot === 'RE') && len(qb.x - a.x, qb.y - a.y) > 3) {
      ty = qb.y + (a.slot === 'LE' ? -1.2 : 1.2);
    }
    this.moveToward(a, tx, ty, top, dt, 1.2, false);
    a.facing = Math.atan2(qb.y - a.y, qb.x - a.x);
  }

  /** Where the defender believes a player is (reaction delay → cuts create separation). */
  /**
   * Where the defender believes a player is: his position `delay` seconds ago, extrapolated with the
   * velocity he had then. Straight lines are mirrored well; cuts and speed changes create separation.
   */
  private perceived(target: Athlete, delay: number): V2 {
    const tt = this.t - delay;
    const h = target.history;
    let i = h.length - 1;
    while (i > 0 && h[i].t > tt) i--;
    const p = h[i] ?? { t: this.t, x: target.x, y: target.y };
    const q = h[Math.max(0, i - 6)] ?? p;
    const span = p.t - q.t;
    const vx = span > 0 ? (p.x - q.x) / span : 0;
    const vy = span > 0 ? (p.y - q.y) / span : 0;
    const ahead = this.t - p.t;
    return { x: p.x + vx * ahead, y: p.y + vy * ahead };
  }

  private manCover(a: Athlete, targetId: string, dt: number, diff: number) {
    const r = this.byId.get(targetId);
    if (!r) return;
    if (this.t < this.biteUntil && (a.role === 'LB' || a.role === 'S')) {
      this.moveToward(a, a.x - 1, a.y, 3, dt);
      return;
    }
    if (r.task.kind === 'passpro' || r.engaged) {
      // Man is blocking: become a spy on the QB.
      const qb = this.qb();
      this.moveToward(a, Math.max(this.los + 3, qb.x + 5), qb.y, maxSpeed(a) * 0.6, dt);
      return;
    }
    const delay = clamp(0.24 + (r.ratings.routeRunning - a.ratings.coverage) * 0.006 - diff * 0.035, 0.08, 0.55);
    const p = this.perceived(r, delay);
    const inside = r.y < this.spotY ? 1 : -1;
    // Keep a cushion over the top; bail with a vertical stem instead of stepping back toward the line.
    const cushion = r.x - this.los > 12 ? 1.1 : 0.7;
    let tx = p.x + cushion;
    const pvx = r.vx;
    if (pvx > 1 && a.x > p.x - 0.5 && a.x - p.x < 4) tx = Math.max(tx, a.x + 1.5);
    const ty = p.y + inside * 0.7;
    const gap = len(tx - a.x, ty - a.y);
    this.moveToward(a, tx, ty, Math.min(maxSpeed(a), len(r.vx, r.vy) + gap * 3), dt, 1 + a.ratings.agility / 220, false);
    a.facing = Math.atan2(r.y - a.y, r.x - a.x);
  }

  private zoneCover(a: Athlete, zoneId: string, dt: number, diff: number) {
    const z = this.zones[zoneId];
    if (!z) return;
    if (this.t < this.biteUntil && (a.role === 'LB' || a.role === 'S')) {
      this.moveToward(a, a.x - 1, a.y, 3, dt);
      return;
    }
    const delay = clamp(0.3 + (80 - a.ratings.awareness) * 0.006 - diff * 0.04, 0.1, 0.55);
    const recs = this.offense().filter((o) => o.task.kind === 'route');
    let best: { r: Athlete; p: V2; score: number } | null = null;
    for (const r of recs) {
      const p = this.perceived(r, delay);
      if (p.x < z.xr[0] - 2 || p.x > z.xr[1] + 2 || p.y < z.yr[0] - 2 || p.y > z.yr[1] + 2) continue;
      const score = z.deep ? p.x : -len(p.x - z.land.x, p.y - z.land.y);
      if (!best || score > best.score) best = { r, p, score };
    }
    let tx = z.land.x;
    let ty = z.land.y;
    if (best) {
      if (z.deep) {
        // Stay deeper than the deepest threat; with two verticals in the zone, split them.
        const threats = recs
          .map((r) => this.perceived(r, delay))
          .filter((p) => p.x > this.los + 6 && p.y > z.yr[0] - 4 && p.y < z.yr[1] + 4);
        tx = Math.max(z.land.x - 3, best.p.x + 4.5);
        ty = threats.length >= 2 ? threats.reduce((s, p) => s + p.y, 0) / threats.length : best.p.y * 0.75 + z.land.y * 0.25;
      } else {
        tx = best.p.x - 0.4;
        ty = best.p.y + (best.p.y < this.spotY ? 0.6 : -0.6);
      }
    } else if (diff >= 1) {
      // Read the quarterback's eyes/shoulders.
      const qb = this.qb();
      ty += Math.sin(qb.facing) * (2 + diff);
    }
    const gap = len(tx - a.x, ty - a.y);
    const sp = best ? Math.min(maxSpeed(a), len(best.r.vx, best.r.vy) + gap * 3) : Math.min(maxSpeed(a) * 0.8, gap * 3);
    this.moveToward(a, tx, clamp(ty, 1, FIELD_W - 1), sp, dt, 1, false);
    a.facing = Math.atan2(this.qb().y - a.y, this.qb().x - a.x);
  }

  private startPursuit() {
    for (const d of this.defense()) {
      if (d.task.kind === 'rush' && d.engaged) continue;
      d.reactAt = Math.max(d.reactAt, this.t + clamp(0.25 + (80 - d.ratings.awareness) * 0.005 - this.settings.difficulty * 0.04, 0.05, 0.5));
      d.task = { kind: 'pursue' };
    }
    const carrierId = this.carrier()?.id;
    for (const o of this.offense()) {
      if (o.id === carrierId || (o.id === this.controlledId && o.id !== this.userId)) continue;
      if (o.task.kind === 'route' || o.task.kind === 'fake' || o.task.kind === 'toBall' || o.task.kind === 'qbPass') o.task = { kind: 'block' };
    }
  }

  private pursue(a: Athlete, dt: number, diff: number) {
    const c = this.carrier();
    if (!c) {
      const land = this.ball.landing;
      if (land) this.moveToward(a, land.x, land.y, maxSpeed(a), dt);
      return;
    }
    if (this.t < a.reactAt) {
      this.moveToward(a, a.x + a.vx * 0.3, a.y + a.vy * 0.3, len(a.vx, a.vy), dt);
      return;
    }
    const top = maxSpeed(a);
    // Run read before the handoff: fill your gap instead of chasing the quarterback.
    if (this.play.run && c.role === 'QB' && this.runHole) {
      const fx = Math.max(this.los + 1, Math.min(a.x, this.los + 4));
      this.moveToward(a, fx, this.runHole.y + (a.y - this.runHole.y) * 0.4, top * 0.9, dt, 1.2);
      return;
    }
    const d = len(c.x - a.x, c.y - a.y);
    // Pursuit angle: solve for the intercept point; smarter AI commits to the full angle, weaker AI
    // under-leads (chases the hip) and gets outrun.
    let tx = c.x;
    let ty = c.y;
    if (d > 1.6) {
      const T = interceptTime(c.x - a.x, c.y - a.y, c.vx, c.vy, top) ?? Math.min(2, d / top);
      const lead = [0.55, 0.72, 0.88, 1][clamp(diff, 0, 3)] * Math.min(T, 3);
      tx = c.x + c.vx * lead;
      ty = c.y + c.vy * lead;
    }
    this.moveToward(a, tx, ty, top, dt, 1.3, false);
    a.facing = Math.atan2(c.y - a.y, c.x - a.x);
  }

  private downfieldBlock(a: Athlete, dt: number) {
    const c = this.carrier();
    if (!c) {
      this.moveToward(a, a.x, a.y, 0, dt);
      return;
    }
    // Pick the most dangerous unblocked defender near the carrier.
    let best: Athlete | undefined;
    let bestD = 12;
    for (const d of this.defense()) {
      if (d.engaged || d.down || d.stunned > 0) continue;
      const dc = len(d.x - c.x, d.y - c.y);
      const da = len(d.x - a.x, d.y - a.y);
      if (dc < 10 && da < bestD && d.x > c.x - 3) {
        best = d;
        bestD = da;
      }
    }
    if (!best) {
      this.moveToward(a, c.x + 4, c.y + (a.y > c.y ? 2 : -2), maxSpeed(a) * 0.8, dt);
      return;
    }
    const mx = (best.x + c.x) / 2;
    const my = (best.y + c.y) / 2;
    this.moveToward(a, best.x * 0.7 + mx * 0.3, best.y * 0.7 + my * 0.3, maxSpeed(a), dt);
    if (len(best.x - a.x, best.y - a.y) < 1.0 && this.rng.chance(0.08 + a.ratings.blocking * 0.002)) {
      // Downfield blocks are brief.
      a.engaged = best.id;
      best.engaged = a.id;
      a.pose = 'block';
      best.engageShedAt = this.t + 0.4 + this.rng.next() * 0.9 * (a.ratings.blocking / 70);
      a.engageShedAt = best.engageShedAt;
    }
  }

  // ───────────────────────── Movement / collisions ─────────────────────────

  private moveToward(a: Athlete, tx: number, ty: number, speed: number, dt: number, accelMul = 1, arrive = true) {
    let dx = tx - a.x;
    let dy = ty - a.y;
    const d = len(dx, dy);
    let dvx = 0;
    let dvy = 0;
    if (d > 0.05 && speed > 0) {
      const s = arrive ? Math.min(speed, d * 4) : speed;
      dx /= d;
      dy /= d;
      dvx = dx * s;
      dvy = dy * s;
    }
    const acc = accelOf(a) * accelMul;
    let ax = dvx - a.vx;
    let ay = dvy - a.vy;
    const am = len(ax, ay);
    const maxDv = acc * dt;
    if (am > maxDv) {
      ax = (ax / am) * maxDv;
      ay = (ay / am) * maxDv;
    }
    a.vx += ax;
    a.vy += ay;
    a.x += a.vx * dt;
    a.y += a.vy * dt;
    const sp = len(a.vx, a.vy);
    if (sp > 0.6 && a.id !== this.controlledId && !a.engaged) a.facing = Math.atan2(a.vy, a.vx);
    if (a.pose === 'stance' && sp > 0.5) a.pose = 'run';
  }

  private resolveCollisions() {
    const arr = this.athletes;
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      if (a.down) continue;
      for (let j = i + 1; j < arr.length; j++) {
        const b = arr[j];
        if (b.down || a.engaged === b.id) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = len(dx, dy);
        const min = RADIUS * 2;
        if (d > 0.001 && d < min) {
          const push = (min - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          const wa = a.ratings.weight;
          const wb = b.ratings.weight;
          const fa = wb / (wa + wb);
          a.x -= nx * push * 2 * fa;
          a.y -= ny * push * 2 * fa;
          b.x += nx * push * 2 * (1 - fa);
          b.y += ny * push * 2 * (1 - fa);
        }
      }
    }
  }

  // ───────────────────────── Tackling ─────────────────────────

  private checkTackles() {
    const c = this.carrier();
    if (!c) return;
    const isQB = c.role === 'QB';
    const inPocket = isQB && !this.qbCrossed;
    for (const d of this.defense()) {
      if (d.down || d.stunned > 0) continue;
      if (this.t - d.lastTackleTry < 0.75) continue;
      const dist = len(d.x - c.x, d.y - c.y);
      // A blocked defender can still shed and grab a carrier who runs right past him.
      if (d.engaged) {
        if (inPocket || dist > 1.0 || this.ball.holder === undefined) continue;
        d.lastTackleTry = this.t;
        if (!this.rng.chance(0.3 + (d.ratings.tackle + d.ratings.strength - 140) * 0.004)) continue;
        const blocker = this.byId.get(d.engaged);
        if (blocker) blocker.engaged = undefined;
        d.engaged = undefined;
      }
      // Beyond arm's reach a trailing pursuer can still lay out for a diving (shoestring) tackle.
      const diving = dist > TACKLE_REACH;
      if (diving && (dist > DIVE_REACH || inPocket || !this.rng.chance(0.12 + this.settings.difficulty * 0.03))) continue;
      d.lastTackleTry = this.t;
      const r = c.ratings;
      let p = 0.8 + (d.ratings.tackle - 70) * 0.012 - (r.breakTackle - 70) * 0.009;
      if (diving) p -= 0.28;
      // Momentum: heavier & faster players win collisions.
      const cm = r.weight * len(c.vx, c.vy);
      const dm = d.ratings.weight * len(d.vx, d.vy);
      p += clamp((dm - cm) / 4000, -0.15, 0.12);
      // Moves: timing a juke/spin/stiff-arm against a tackler.
      const mv = c.move;
      if (mv) {
        if (mv.kind === 'juke_left' || mv.kind === 'juke_right') p -= 0.1 + r.juke * 0.0045;
        if (mv.kind === 'spin') p -= 0.08 + r.spin * 0.0045;
        if (mv.kind === 'stiff_arm') {
          const front = Math.cos(Math.atan2(d.y - c.y, d.x - c.x) - c.facing) > 0;
          p -= (front ? 0.05 : 0.15) + (r.stiffArm * 0.5 + r.strength * 0.5 - d.ratings.strength * 0.4) * 0.004;
        }
        if (mv.kind === 'hurdle') p -= 0.05 + r.agility * 0.003;
        if (mv.kind === 'dive') p += 0.3;
      }
      if (inPocket) p = 0.72 - (r.breakSack - 70) * 0.011 - len(c.vx, c.vy) * 0.02;
      p += (this.settings.sliders.tackling - 50) * 0.004;
      // Gang tackling.
      const helpers = this.defense().filter((o) => o !== d && !o.down && len(o.x - c.x, o.y - c.y) < 1.6).length;
      p += helpers * 0.12;
      p = clamp(p, 0.04, 0.97);
      if (this.rng.chance(p)) {
        c.pose = 'down';
        d.pose = 'tackle';
        const fwd = Math.max(0, Math.cos(c.facing)) * Math.min(1.2, len(c.vx, c.vy) * 0.12);
        const spotX = c.x + fwd;
        if (inPocket) {
          this.emit('sack', `SACKED by #${d.number} ${d.name}!`, c.x, c.y, d.id);
          this.endPlay('sack', spotX, c.y, `${c.name} is sacked by #${d.number} ${d.name}.`, c.id);
        } else if (spotX <= 0) {
          this.emit('safety', 'SAFETY!', c.x, c.y, d.id);
          this.endPlay('safety', spotX, c.y, `${c.name} is tackled in the end zone. Safety.`, c.id);
        } else {
          this.emit('tackle', `Tackled by #${d.number} ${d.name}`, c.x, c.y, d.id);
          this.endPlay('tackle', spotX, c.y, `${c.name} is brought down by #${d.number} ${d.name}.`, c.id);
        }
        return;
      }
      d.stunned = diving ? 1.5 : 0.9;
      d.pose = 'down';
      d.poseT = 0;
      c.vx *= 0.8;
      c.vy *= 0.8;
      this.emit('missed_tackle', `#${d.number} ${d.name} misses the tackle!`, d.x, d.y, d.id);
    }
    // Dive / slide finish.
    if (c.move?.kind === 'dive' && this.t - c.move.t > 0.45) {
      c.pose = 'down';
      this.endPlay('tackle', c.x, c.y, `${c.name} dives forward.`, c.id);
    }
  }

  private checkBoundaries() {
    const c = this.carrier();
    if (!c) return;
    if (c.x >= 100) {
      c.pose = 'celebrate';
      this.emit('touchdown', 'TOUCHDOWN!', c.x, c.y, c.id);
      this.endPlay('touchdown', 100, c.y, `${c.name} scores!`, c.id);
      return;
    }
    if (c.y < 0 || c.y > FIELD_W) {
      this.emit('out_of_bounds', 'Out of bounds', c.x, c.y, c.id);
      this.endPlay('out_of_bounds', c.x, clamp(c.y, 0, FIELD_W), `${c.name} steps out of bounds.`, c.id);
    }
  }

  private endPlay(kind: PlayOutcome['kind'], spotX: number, spotY: number, text: string, carrierId?: string) {
    if (this.phase === 'dead') return;
    this.phase = 'dead';
    const passer = this.passer;
    const carrier = carrierId ? this.byId.get(carrierId) : undefined;
    const completion = !!passer && !!carrier && carrier.side === 'off' && carrier.id !== passer && kind !== 'interception';
    const gained = Math.round(clamp(spotX, -10, 100) - this.los);
    let passYards = 0;
    let rushYards = 0;
    if (completion) passYards = gained;
    else if (carrier && carrier.side === 'off' && kind !== 'sack' && !(kind === 'incomplete')) rushYards = gained;
    this.outcome = {
      kind,
      spotX: kind === 'incomplete' ? this.los : clamp(spotX, -10, 100),
      spotY: clamp(spotY, 0, FIELD_W),
      carrier: carrierId,
      passer,
      completion,
      passYards,
      rushYards,
      airYards: completion ? Math.round(this.airYards) : 0,
      text,
      duration: this.t - this.snapT,
    };
    for (const a of this.athletes) {
      a.engaged = undefined;
      if (a.pose !== 'down' && a.pose !== 'tackle' && a.pose !== 'celebrate') a.pose = 'run';
    }
    if (kind === 'incomplete') this.ball.state = 'ground';
    else if (this.ball.state === 'held') this.ball.state = 'dead';
  }

  // ───────────────────────── Run game & AI offense ─────────────────────────

  /** QB on a run play: secure the snap, meet the back at the mesh, hand it off. */
  private handoff(a: Athlete, t: Extract<Task, { kind: 'handoff' }>, dt: number) {
    const rb = this.byId.get(t.rb);
    if (!rb || this.ball.state !== 'held' || this.ball.holder !== a.id) {
      this.moveToward(a, a.x, a.y, 0, dt);
      return;
    }
    const mesh = rb.task.kind === 'runPath' ? rb.task.pts[0] : { x: a.x, y: a.y };
    this.moveToward(a, Math.min(a.x, mesh.x + 0.4), a.y + (mesh.y - a.y) * 0.35, 4, dt);
    a.facing = Math.atan2(rb.y - a.y, rb.x - a.x);
    const ready = rb.task.kind !== 'runPath' || rb.task.idx >= 1 || len(rb.x - a.x, rb.y - a.y) < 0.9;
    if (len(rb.x - a.x, rb.y - a.y) > 1.3 || !ready) return;
    const plan = rb.task.kind === 'runPath' ? rb.task.pts.slice(Math.max(1, rb.task.idx)) : [];
    this.giveBall(rb);
    rb.pose = 'run';
    a.task = { kind: 'idle' };
    a.pose = 'run';
    this.emit('handoff', `${a.name} hands off to #${rb.number} ${rb.name}`, a.x, a.y, rb.id);
    if (rb.id === this.userId || a.id === this.userId) {
      this.controlledId = rb.id;
      rb.task = { kind: 'user' };
    } else {
      rb.task = { kind: 'carrier' };
      this.carrierPlan = plan;
      this.carrierHeading = 0;
    }
    this.startPursuit();
  }

  /** Back before the handoff: (wait on draws,) mesh with the QB, then press the hole. */
  private runPathStep(a: Athlete, t: Extract<Task, { kind: 'runPath' }>, dt: number) {
    if (this.t < t.startAt) {
      this.moveToward(a, a.x, a.y, 0, dt);
      return;
    }
    const p = t.pts[Math.min(t.idx, t.pts.length - 1)];
    if (len(p.x - a.x, p.y - a.y) < 0.7 && t.idx < t.pts.length - 1) t.idx++;
    const top = maxSpeed(a) * (t.idx === 0 ? 0.7 : 0.9);
    this.moveToward(a, p.x, p.y, top, dt, 1.2, false);
  }

  /** Run block: get between the defender and the hole, then engage and drive him. */
  private runBlock(a: Athlete, t: Extract<Task, { kind: 'runBlock' }>, dt: number) {
    let d = t.target ? this.byId.get(t.target) : undefined;
    if (!d || d.down || (d.engaged && d.engaged !== a.id)) {
      d = this.nearestFree(a, 6, (x) => x.role !== 'CB' || len(x.x - a.x, x.y - a.y) < 3);
      t.target = d?.id;
      if (!d) {
        this.moveToward(a, a.x + 1.5, a.y, 3, dt);
        return;
      }
    }
    const hole = this.runHole ?? { x: this.los, y: this.spotY };
    const vx = hole.x - d.x;
    const vy = hole.y - d.y;
    const vd = len(vx, vy) || 1;
    this.moveToward(a, d.x + (vx / vd) * 0.9, d.y + (vy / vd) * 0.9, maxSpeed(a) * 0.85, dt, 1.4);
    a.facing = Math.atan2(d.y - a.y, d.x - a.x);
    if (len(d.x - a.x, d.y - a.y) < 1.1 && !d.engaged && d.stunned <= 0) this.engage(a, d);
  }

  /** Receiver stalk block on a run: square up the nearest defensive back and wall him off. */
  private stalk(a: Athlete, t: Extract<Task, { kind: 'stalk' }>, dt: number) {
    let d = t.target ? this.byId.get(t.target) : undefined;
    if (!d || d.down || (d.engaged && d.engaged !== a.id)) {
      d = this.nearestFree(a, 14, (x) => x.role === 'CB' || x.role === 'S');
      t.target = d?.id;
      if (!d) {
        this.moveToward(a, a.x, a.y, 0, dt);
        return;
      }
    }
    const c = this.carrier() ?? this.qb();
    const vx = c.x - d.x;
    const vy = c.y - d.y;
    const vd = len(vx, vy) || 1;
    this.moveToward(a, d.x + (vx / vd) * 1.0, d.y + (vy / vd) * 1.0, maxSpeed(a) * 0.85, dt);
    a.facing = Math.atan2(d.y - a.y, d.x - a.x);
    if (len(d.x - a.x, d.y - a.y) < 1.0 && !d.engaged && this.t - this.snapT > 0.5) {
      a.engaged = d.id;
      d.engaged = a.id;
      a.pose = 'block';
      d.engageShedAt = this.t + 0.6 + this.rng.next() * 1.4 * (a.ratings.blocking / 65);
      a.engageShedAt = d.engageShedAt;
    }
  }

  private nearestFree(a: Athlete, within: number, ok: (d: Athlete) => boolean): Athlete | undefined {
    let best: Athlete | undefined;
    let bd = within;
    for (const d of this.defense()) {
      if (d.down || d.engaged || !ok(d)) continue;
      const dist = len(d.x - a.x, d.y - a.y);
      if (dist < bd) {
        bd = dist;
        best = d;
      }
    }
    return best;
  }

  /** Separation of any offensive player: distance to the nearest non-lineman defender. */
  private sepOf(r: Athlete): number {
    let best = 99;
    for (const d of this.defense()) if (d.role !== 'DL' && !d.down) best = Math.min(best, len(d.x - r.x, d.y - r.y));
    return best;
  }

  /**
   * AI quarterback (when the user plays another position): drop, set, slide away from pressure and
   * read the field — throws to an open man, favors a user who is calling for the ball and open, throws
   * it away under pressure. Awareness speeds up the reads.
   */
  private aiQuarterback(a: Athlete, t: Extract<Task, { kind: 'qbPass' }>, dt: number) {
    if (this.ball.state !== 'held' || this.ball.holder !== a.id) {
      this.moveToward(a, a.x, a.y, 0, dt);
      return;
    }
    const el = this.t - this.snapT;
    let near: Athlete | undefined;
    let nd = 99;
    for (const d of this.defense()) {
      if (d.down || d.engaged) continue;
      const dd = len(d.x - a.x, d.y - a.y);
      if (dd < nd) {
        nd = dd;
        near = d;
      }
    }
    let tx = a.x > t.dropX + 0.2 && el < 1.4 ? t.dropX : a.x;
    let ty = a.y;
    if (near && nd < 3.5) {
      tx -= ((near.x - a.x) / nd) * 1.2;
      ty -= ((near.y - a.y) / nd) * 1.5;
    }
    this.moveToward(a, Math.min(tx, this.los - 1.5), clamp(ty, this.spotY - 4.5, this.spotY + 4.5), 4.5, dt);
    a.facing = 0;
    if (this.t < t.nextRead) return;
    t.nextRead = this.t + clamp(0.24 - a.ratings.awareness * 0.0012, 0.1, 0.22);
    const over = this.t - t.readAt;
    const need = clamp(2.5 - over * 0.8, 1.3, 2.5);
    const calling = this.t - this.callT < 1.3;
    let best: Athlete | undefined;
    let bestScore = -99;
    let fallback: Athlete | undefined;
    let fallbackSep = 1.25;
    for (const r of this.offense()) {
      if (r.id === a.id || r.role === 'OL') continue;
      if (r.task.kind !== 'route' && !(r.id === this.userId && this.manual)) continue;
      const sep = this.sepOf(r);
      const depth = r.x - this.los;
      let score = sep + clamp(depth, -2, 20) * 0.06;
      let needR = need;
      if (r.id === this.userId && calling) {
        score += 1.2;
        needR = Math.min(need, 1.7);
      }
      if (score >= needR && score > bestScore) {
        best = r;
        bestScore = score;
      }
      if (sep > fallbackSep) {
        fallback = r;
        fallbackSep = sep;
      }
    }
    if (!best && ((nd < 1.5 && el > 1.4) || el > 3.6)) {
      if (fallback) best = fallback;
      else if (this.rng.chance(0.45 + a.ratings.awareness / 220)) {
        this.throwAway(a);
        return;
      }
    }
    if (!best) return;
    const dist = len(best.x - a.x, best.y - a.y);
    this.throwBall(a, best, clamp(0.35 + dist / 40, 0.35, 0.95), dist > 30 && this.sepOf(best) > 2.5);
  }

  /**
   * AI ball carrier: follow the designed path through the line, then pick the most open lane among a
   * fan of headings (forward progress vs defenders near the lane vs sideline), with jukes and stiff arms.
   */
  private aiCarrier(a: Athlete, dt: number) {
    const top = maxSpeed(a);
    if (this.carrierPlan.length && a.x < this.los + 1.2) {
      let p = this.carrierPlan[0];
      if (len(p.x - a.x, p.y - a.y) < 0.8 && this.carrierPlan.length > 1) {
        this.carrierPlan.shift();
        p = this.carrierPlan[0];
      }
      this.moveToward(a, p.x, p.y, top, dt, 1.2, false);
      return;
    }
    // Re-read the field a few times a second (vision isn't instant); keep the chosen lane in between.
    if (this.t < this.carrierReadAt) {
      const h = this.carrierHeading;
      this.moveToward(a, a.x + Math.cos(h) * 5, a.y + Math.sin(h) * 5, top, dt, 1 + a.ratings.agility / 220, false);
      a.facing = Math.atan2(a.vy, a.vx);
      return;
    }
    this.carrierReadAt = this.t + clamp(0.32 - a.ratings.awareness * 0.002, 0.12, 0.3);
    let best = 0;
    let bestScore = -Infinity;
    for (let k = -5; k <= 5; k++) {
      const ang = k * 0.26;
      const dx = Math.cos(ang);
      const dy = Math.sin(ang);
      const px = a.x + dx * 4;
      const py = a.y + dy * 4;
      let score = dx * 4;
      if (py < 1.5 || py > FIELD_W - 1.5) score -= 6;
      for (const d of this.defense()) {
        if (d.down || d.engaged) continue;
        const dd = len(d.x - px, d.y - py);
        if (dd < 3.2) score -= (3.2 - dd) * 1.4;
      }
      score -= Math.abs(ang - this.carrierHeading) * 0.6;
      if (score > bestScore) {
        bestScore = score;
        best = ang;
      }
    }
    this.carrierHeading = best;
    this.moveToward(a, a.x + Math.cos(best) * 5, a.y + Math.sin(best) * 5, top, dt, 1 + a.ratings.agility / 220, false);
    a.facing = Math.atan2(a.vy, a.vx);
    if (a.moveCooldown <= 0) {
      const threat = this.defense().find((d) => !d.down && !d.engaged && d.x > a.x - 0.5 && len(d.x - a.x, d.y - a.y) < 1.9);
      if (threat && this.rng.chance(0.08 + a.ratings.juke * 0.0012)) {
        const left = Math.sin(Math.atan2(threat.y - a.y, threat.x - a.x) - a.facing) < 0;
        const kind: MoveKind = a.ratings.stiffArm > a.ratings.juke + 8 ? 'stiff_arm' : left ? 'juke_left' : 'juke_right';
        this.doMove(a, kind);
      }
    }
  }

  /** Open-ness of a receiver for the read-assist icon: nearest defender distance. */
  separation(slot: string): number {
    const r = this.bySlot(slot);
    if (!r) return 0;
    let best = 99;
    for (const d of this.defense()) {
      if (d.role === 'DL') continue;
      best = Math.min(best, len(d.x - r.x, d.y - r.y));
    }
    return best;
  }
}

export { PLAYS };
