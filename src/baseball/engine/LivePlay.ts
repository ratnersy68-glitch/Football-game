/**
 * LivePlay: everything that happens while the ball is alive — batted-ball flight, fair/foul,
 * fielders chasing / catching / throwing, runners advancing / retreating / tagging up, force
 * outs, tag outs, appeals, scoring. Fielder logic lives in FieldingEngine and runner logic in
 * BaseRunningEngine; this module owns the state and the rules that tie them together.
 */
import type { Difficulty, FieldPos, Player, Stadium } from '../core/types';
import { G, Rng, sprayAngle, type V2 } from '../core/math';
import { BALL_R, predictPath, stepBall, type BallEnv, type BallState, type PathSample } from './BallPhysics';
import { basePos, defaultPositions, pathPos, FIELD_POSITIONS } from './Field';
import * as FE from './FieldingEngine';
import * as BR from './BaseRunningEngine';

export type AnimName = 'idle' | 'ready' | 'run' | 'throw' | 'catch' | 'dive' | 'slide' | 'jump' | 'crouch' | 'pitch' | 'swing' | 'bat' | 'trot' | 'celebrate' | 'down';

export interface Fielder {
  pos: FieldPos;
  player: Player;
  x: number; z: number;
  vx: number; vz: number;
  facing: number; // radians, 0 = facing CF (+z)
  home: V2;
  task: 'idle' | 'chase' | 'cover' | 'backup' | 'tag' | 'hold';
  coverBase: number;
  target: V2 | null;
  react: number;
  speed: number;
  fld: number; // effective fielding rating (with out-of-position penalty)
  routeErr: V2;
  dive: number;
  down: number;
  diveDir: V2;
  jump: number;
  hasBall: boolean;
  holdTime: number;
  catchCd: number;
  throwAnim: number;
  catchAnim: number;
  thinkCd: number;
}

export interface Runner {
  id: string;
  player: Player;
  p: number; // path distance from home (0..360)
  startBase: number; // 0 = batter
  goal: number;
  top: number;
  v: number;
  delay: number;
  lastTouched: number;
  out: boolean;
  scored: boolean;
  scoreTime: number;
  mustRetag: boolean;
  manual: boolean;
  isBatter: boolean;
  slide: number;
  responsiblePitcherId: string;
  reachedOnError: boolean;
  thinkCd: number;
  trot: boolean;
  stealingFlag?: boolean;
}

export interface LiveBall {
  mode: 'loose' | 'held' | 'thrown' | 'dead';
  phys: BallState;
  prev: { x: number; y: number; z: number };
  holder: Fielder | null;
  touchedGround: boolean;
  battedInAir: boolean; // a batted ball that has not yet touched the ground
  fair: 'pending' | 'fair' | 'foul';
  thrower: Fielder | null;
  throwBase: number;
  throwTarget: V2;
  path: PathSample[];
  pathT0: number;
  touchedByFielder: boolean;
  trail: boolean;
}

export type OutHow = 'fly' | 'line' | 'pop' | 'force' | 'tag' | 'appeal' | 'ground';
export interface OutRecord { runnerId: string; how: OutHow; base: number; putout: string | null; assists: string[]; time: number; force: boolean }

export type BatterResult = 'out' | '1B' | '2B' | '3B' | 'HR' | 'ROE' | 'FC' | 'GRD' | 'none';

export interface PlayOutcome {
  kind: 'foul' | 'inplay' | 'nonbatted';
  homeRun: boolean;
  groundRuleDouble: boolean;
  outs: OutRecord[];
  runs: { runnerId: string; unearned: boolean; responsiblePitcherId: string }[];
  batterResult: BatterResult;
  /** Final occupants of 1B/2B/3B (runner ids). */
  bases: (string | null)[];
  errors: string[]; // player ids charged with errors
  hitType: 'GB' | 'LD' | 'FB' | 'PU' | null;
  sacFly: boolean;
  doublePlay: boolean;
  triplePlay: boolean;
  caughtStealing: string[];
  stolenBases: string[];
  notable: string[];
  description: string;
  fielderFirstTouch: FieldPos | null;
}

export interface PlayConfig {
  stadium: Stadium;
  env: BallEnv;
  rng: Rng;
  outsBefore: number;
  defense: Record<FieldPos, Player>;
  fieldingPenalty: Record<FieldPos, number>;
  /** Runners at the start: [base, player, responsible pitcher, reachedOnError, initial p override] */
  runners: { base: number; player: Player; responsiblePitcherId: string; reachedOnError: boolean; p?: number; stealing?: boolean }[];
  batter: Player | null; // null for steals / wild pitches
  pitcherId: string;
  userDefense: boolean;
  userOffense: boolean;
  fieldingAssist: boolean;
  runningAssist: boolean;
  difficulty: Difficulty;
  /** Batted ball: initial physics state. */
  batted?: BallState;
  launchAngle?: number;
  /** Non-batted start: ball held by the catcher (steal) or loose near home (wild pitch). */
  start?: 'catcher' | 'wild';
  wildBall?: BallState;
  swingType?: 'normal' | 'power' | 'contact';
}

export interface PlayEvent { type: string; data?: Record<string, unknown> }

export const DIFF_INDEX: Record<Difficulty, number> = { ROOKIE: 0, MINORS: 1, VETERAN: 2, 'ALL-STAR': 3, 'HALL OF FAME': 4, LEGEND: 5 };

export class LivePlay {
  cfg: PlayConfig;
  t = 0;
  fielders: Fielder[] = [];
  runners: Runner[] = [];
  ball: LiveBall;
  outs: OutRecord[] = [];
  runsScored: { runner: Runner; time: number }[] = [];
  errors: string[] = [];
  events: PlayEvent[] = [];
  over = false;
  overTimer = -1;
  settledTime = 0;
  controlled: Fielder | null = null;
  userMoved = false;
  homeRun = false;
  groundRuleDouble = false;
  foul = false;
  caughtFly = false;
  firstTouch: Fielder | null = null;
  batterReachedBeforeError = -1;
  errorBeforeBatterSafe = false;
  notable = new Set<string>();
  chaser: Fielder | null = null;
  chaseCd = 0;
  intercept: FE.Intercept | null = null;
  flyCatchable = false;
  assists = new Map<string, string[]>();
  lastThrower: Fielder | null = null;
  maxTime = 40;

  constructor(cfg: PlayConfig) {
    this.cfg = cfg;
    const pos = defaultPositions(cfg.stadium);
    for (const fp of FIELD_POSITIONS) {
      const p = cfg.defense[fp];
      const home = pos[fp];
      const start = fp === 'P' ? { x: 0, z: 55 } : home;
      const fld = Math.max(10, p.ratings.fielding - (cfg.fieldingPenalty[fp] ?? 0));
      const err = cfg.rng.gauss(1);
      this.fielders.push({
        pos: fp, player: p, x: start.x, z: start.z, vx: 0, vz: 0, facing: Math.PI, home,
        task: 'idle', coverBase: -1, target: null,
        react: Math.max(0.15, 0.6 - p.ratings.reaction * 0.0038 + cfg.rng.gauss(0.04)),
        speed: 20.5 + p.ratings.speed * 0.062, fld,
        routeErr: { x: err * (100 - fld) * 0.12, z: cfg.rng.gauss(1) * (100 - fld) * 0.12 },
        dive: 0, down: 0, diveDir: { x: 0, z: 0 }, jump: 0, hasBall: false, holdTime: 0, catchCd: 0, throwAnim: 0, catchAnim: 0, thinkCd: 0,
      });
    }
    for (const r of cfg.runners) {
      const rr = BR.makeRunner(r.player, r.base, r.responsiblePitcherId, r.reachedOnError, false, r.p);
      if (r.stealing) { rr.stealingFlag = true; rr.goal = (r.base + 1) * 90; }
      this.runners.push(rr);
    }
    if (cfg.batter) {
      const br = BR.makeRunner(cfg.batter, 0, cfg.pitcherId, false, true);
      br.delay = cfg.swingType === 'power' ? 0.42 : cfg.swingType === 'contact' ? 0.3 : 0.35;
      br.goal = 90;
      this.runners.push(br);
    }

    const phys: BallState = cfg.batted ?? cfg.wildBall ?? { p: { x: 0, y: 3, z: -2.6 }, v: { x: 0, y: 0, z: 0 }, backspin: 0, sidespin: 0, rolling: false, bounces: 0, stopped: false };
    this.ball = {
      mode: 'loose', phys, prev: { ...phys.p }, holder: null, touchedGround: false, battedInAir: !!cfg.batted, fair: cfg.batted ? 'pending' : 'fair',
      thrower: null, throwBase: -1, throwTarget: { x: 0, z: 0 }, path: [], pathT0: 0, touchedByFielder: false, trail: !!cfg.batted && cfg.batted.v.y !== undefined,
    };
    if (cfg.start === 'catcher') {
      const c = this.fielder('C');
      c.hasBall = true;
      c.react = 0.5;
      this.ball.mode = 'held';
      this.ball.holder = c;
      this.ball.fair = 'fair';
      this.controlled = c;
    } else if (cfg.start === 'wild') {
      this.ball.touchedGround = true;
    }
    if (this.ball.mode === 'loose') this.repath();
    FE.initAssignments(this);
    BR.initialDecisions(this);
  }

  fielder(pos: FieldPos): Fielder {
    return this.fielders.find((f) => f.pos === pos)!;
  }

  emit(type: string, data?: Record<string, unknown>) {
    this.events.push({ type, data });
  }

  repath() {
    this.ball.path = predictPath(this.ball.phys, this.cfg.env, 9, 1 / 60);
    this.ball.pathT0 = this.t;
    this.chaseCd = 0;
  }

  activeRunners(): Runner[] {
    return this.runners.filter((r) => !r.out && !r.scored);
  }

  totalOuts(): number {
    return this.cfg.outsBefore + this.outs.length;
  }

  batterRunner(): Runner | undefined {
    return this.runners.find((r) => r.isBatter);
  }

  /** Forced-ness follows the chain from the batter-runner. */
  isForced(r: Runner): boolean {
    if (this.caughtFly) return false;
    const br = this.batterRunner();
    if (!br || br.out) return false;
    if (r.isBatter) return true;
    for (let b = 1; b <= r.startBase; b++) {
      const prev = this.runners.find((x) => x.startBase === b - 1 && (b - 1 > 0 || x.isBatter));
      if (!prev || prev.out) return false;
    }
    return true;
  }

  handPos(f: Fielder): { x: number; y: number; z: number } {
    return { x: f.x + Math.sin(f.facing + 0.6) * 0.9, y: f.dive > 0 ? 1 : 4.6, z: f.z + Math.cos(f.facing + 0.6) * 0.9 };
  }

  // ------------------------------------------------------------------
  update(dt: number, input: FE.DefenseInput | null) {
    if (this.over) return;
    this.t += dt;
    this.events = this.events.length > 200 ? [] : this.events;
    this.updateBall(dt);
    FE.updateFielders(this, dt, input);
    if (!this.homeRun && !this.foul) FE.checkCatches(this);
    BR.updateRunners(this, dt);
    if (!this.homeRun && !this.foul) this.checkOuts();
    this.checkEnd(dt);
  }

  private updateBall(dt: number) {
    const b = this.ball;
    b.prev = { ...b.phys.p };
    if (b.mode === 'held' && b.holder) {
      const h = this.handPos(b.holder);
      b.phys.p = h;
      b.phys.v = { x: 0, y: 0, z: 0 };
      return;
    }
    if (b.mode === 'dead') {
      if (this.homeRun) {
        // Fly on into the seats.
        const p = b.phys.p, v = b.phys.v;
        if (p.y > -20) {
          v.y -= G * dt;
          p.x += v.x * dt; p.y += v.y * dt; p.z += v.z * dt;
        }
      } else if (!b.phys.stopped) {
        for (let i = 0; i < 4; i++) stepBall(b.phys, dt / 4, this.cfg.env);
      }
      return;
    }
    if (b.mode === 'thrown') {
      const p = b.phys.p, v = b.phys.v;
      v.y -= G * dt;
      p.x += v.x * dt; p.y += v.y * dt; p.z += v.z * dt;
      if (p.y <= BALL_R) {
        // Throw in the dirt: becomes a loose ball.
        p.y = BALL_R;
        v.y = Math.abs(v.y) * 0.35;
        v.x *= 0.6; v.z *= 0.6;
        b.mode = 'loose';
        b.touchedGround = true;
        b.phys.rolling = false;
        b.phys.stopped = false;
        b.phys.backspin = 0; b.phys.sidespin = 0;
        this.emit('bounce');
        this.repath();
      } else if (Math.hypot(p.x - b.throwTarget.x, p.z - b.throwTarget.z) > 20 && this.passedTarget()) {
        // Sailed past the target: now a loose ball.
        b.mode = 'loose';
        b.phys.rolling = false;
        b.phys.stopped = false;
        this.repath();
      }
      return;
    }
    // Loose ball physics
    const sub = 4;
    for (let i = 0; i < sub; i++) {
      const ev = stepBall(b.phys, dt / sub, this.cfg.env);
      if (!ev) continue;
      if (ev === 'homerun') {
        const ang = sprayAngle(b.phys.p.x, b.phys.p.z);
        if (b.battedInAir && Math.abs(ang) <= 45.5) {
          this.declareHomeRun();
        } else if (b.fair === 'fair' || (b.touchedGround && Math.abs(ang) <= 45)) {
          this.declareGroundRuleDouble();
        } else {
          this.declareFoul();
        }
        return;
      }
      if (ev === 'outofplay') {
        if (b.fair === 'fair') this.declareGroundRuleDouble();
        else this.declareFoul();
        return;
      }
      if (ev === 'bounce') {
        if (b.battedInAir) {
          b.battedInAir = false;
          b.touchedGround = true;
          const r = Math.hypot(b.phys.p.x, b.phys.p.z);
          if (b.fair === 'pending' && (r > 96 || b.phys.p.z > 75)) this.decideFair();
          this.emit('land', { x: b.phys.p.x, z: b.phys.p.z });
        }
        b.touchedGround = true;
        this.repath();
      }
      if (ev === 'wall') {
        b.touchedGround = true;
        if (b.battedInAir) {
          b.battedInAir = false;
          if (b.fair === 'pending') this.decideFair();
        }
        this.emit('wall');
        this.repath();
      }
    }
    if (b.fair === 'pending' && !b.battedInAir) {
      const r = Math.hypot(b.phys.p.x, b.phys.p.z);
      if (r > 96 || b.phys.p.z > 75 || b.phys.stopped) this.decideFair();
    }
    if (b.fair === 'pending' && b.battedInAir) {
      // Way back over the backstop etc. is foul once it comes down out of reach.
      if (b.phys.p.z < -4 && b.phys.p.y < 2) this.decideFair();
    }
  }

  private passedTarget(): boolean {
    const b = this.ball;
    const toT = { x: b.throwTarget.x - b.phys.p.x, z: b.throwTarget.z - b.phys.p.z };
    return toT.x * b.phys.v.x + toT.z * b.phys.v.z < 0;
  }

  decideFair() {
    const b = this.ball;
    if (b.fair !== 'pending') return;
    const ang = sprayAngle(b.phys.p.x, b.phys.p.z);
    const fair = Math.abs(ang) <= 45.3 && b.phys.p.z > -0.5;
    b.fair = fair ? 'fair' : 'foul';
    if (!fair) this.declareFoul();
    else this.emit('fair');
  }

  declareFoul() {
    if (this.foul) return;
    this.foul = true;
    this.ball.fair = 'foul';
    this.ball.mode = 'dead';
    this.emit('foul');
    this.overTimer = 0.9;
  }

  declareHomeRun() {
    this.homeRun = true;
    this.ball.fair = 'fair';
    this.ball.mode = 'dead';
    this.notable.add('homerun');
    this.emit('homerun');
    for (const r of this.activeRunners()) {
      r.goal = 360;
      r.trot = true;
      r.manual = true;
      r.mustRetag = false;
      r.delay = Math.min(r.delay, 0.2);
    }
    for (const f of this.fielders) { f.task = 'idle'; f.target = null; }
  }

  declareGroundRuleDouble() {
    this.groundRuleDouble = true;
    this.ball.mode = 'dead';
    this.emit('grd');
    const br = this.batterRunner();
    for (const r of this.activeRunners()) {
      const base = r.isBatter ? 2 : Math.min(4, r.startBase + 2);
      r.goal = base * 90;
      r.manual = true;
      r.trot = true;
      r.mustRetag = false;
    }
    if (br) br.goal = 180;
    this.overTimer = 2.2;
  }

  // ------------------------------------------------------------------
  /** Force outs, tag outs and appeals. */
  checkOuts() {
    const b = this.ball;
    if (b.mode !== 'held' || !b.holder) return;
    const h = b.holder;
    if (h.down > 0) return;
    for (const r of this.activeRunners()) {
      if (r.out) continue;
      // Force out
      if (this.isForced(r)) {
        const fb = r.startBase + 1;
        if (r.lastTouched < fb) {
          const bp = basePos(fb);
          if (Math.hypot(h.x - bp.x, h.z - bp.z) < 3.2) {
            this.recordOut(r, 'force', fb, h);
            continue;
          }
        }
      }
      // Appeal: runner left early on a caught fly and has not retouched.
      if (r.mustRetag) {
        const bp = basePos(r.startBase);
        if (Math.hypot(h.x - bp.x, h.z - bp.z) < 3.2) {
          this.recordOut(r, 'appeal', r.startBase, h);
          continue;
        }
      }
      // Tag out
      if (!BR.onBase(r)) {
        const rp = pathPos(r.p);
        if (Math.hypot(h.x - rp.x, h.z - rp.z) < 3.0) {
          this.recordOut(r, 'tag', Math.round(r.p / 90), h);
        }
      }
    }
  }

  recordOut(r: Runner, how: OutHow, base: number, putout: Fielder | null) {
    if (r.out) return;
    r.out = true;
    r.v = 0;
    const asst = putout ? this.assists.get(putout.player.id) ?? [] : [];
    const rec: OutRecord = { runnerId: r.id, how, base, putout: putout?.player.id ?? null, assists: [...asst], time: this.t, force: how === 'force' || (r.isBatter && r.lastTouched < 1) };
    this.outs.push(rec);
    this.emit('out', { how, base, runner: r.player.name, pos: putout?.pos });
    // A close play is worth a replay.
    if (how === 'tag' || how === 'force') {
      const dist = Math.abs(r.p - base * 90);
      if (dist < 6) this.notable.add('close');
    }
    if (this.outs.length >= 2) this.notable.add('doubleplay');
    if (this.totalOuts() >= 3) {
      this.overTimer = 0.9;
      // Runs after the 3rd out (or any run, if it's a force / batter out before 1B) don't count.
      const force = rec.force;
      this.runsScored = this.runsScored.filter((s) => !force && s.time < rec.time);
      for (const rr of this.runners) if (!rr.out && !rr.scored) rr.v = 0;
    }
  }

  scoreRunner(r: Runner) {
    if (r.scored || r.out) return;
    if (this.totalOuts() >= 3) return;
    r.scored = true;
    r.scoreTime = this.t;
    this.runsScored.push({ runner: r, time: this.t });
    this.emit('run', { runner: r.player.name });
  }

  private checkEnd(dt: number) {
    if (this.overTimer >= 0) {
      this.overTimer -= dt;
      if (this.overTimer <= 0) this.over = true;
      return;
    }
    if (this.homeRun) {
      if (this.activeRunners().length === 0) this.over = true;
      if (this.t > 25) this.over = true;
      return;
    }
    if (this.t > this.maxTime) {
      BR.snapRunners(this);
      this.over = true;
      return;
    }
    const b = this.ball;
    if (b.mode === 'held' && b.holder) {
      const runners = this.activeRunners();
      const settled = runners.every((r) => BR.onBase(r) && Math.abs(r.p - r.goal) < 0.5 && r.delay <= 0 && !r.mustRetag);
      const inInfield = Math.hypot(b.holder.x, b.holder.z - 60) < 110;
      if (settled && (inInfield || runners.length === 0 || b.holder.holdTime > 1.5)) {
        this.settledTime += dt;
        if (this.settledTime > 0.45) this.over = true;
      } else this.settledTime = 0;
    } else this.settledTime = 0;
  }

  // ------------------------------------------------------------------
  /** Build the outcome summary for the rules engine. */
  outcome(): PlayOutcome {
    const br = this.batterRunner();
    const runs = this.runsScored.map((s) => ({
      runnerId: s.runner.id,
      unearned: s.runner.reachedOnError || this.errors.length > 0,
      responsiblePitcherId: s.runner.responsiblePitcherId,
    }));
    const bases: (string | null)[] = [null, null, null];
    for (const r of this.activeRunners()) {
      const b = Math.round(r.p / 90);
      if (b >= 1 && b <= 3) {
        if (!bases[b - 1]) bases[b - 1] = r.id;
        else {
          // Two runners on one base (rare): push the trailing one back.
          const other = b - 2;
          if (other >= 0 && !bases[other]) bases[other] = r.id;
        }
      }
    }
    const la = this.cfg.launchAngle ?? 0;
    const hitType = this.cfg.batter ? (la < 10 ? 'GB' : la < 25 ? 'LD' : la < 50 ? 'FB' : 'PU') : null;
    let batterResult: BatterResult = 'none';
    if (this.cfg.batter && !this.foul) {
      if (this.homeRun) batterResult = 'HR';
      else if (br?.out) batterResult = 'out';
      else if (this.groundRuleDouble) batterResult = 'GRD';
      else if (br) {
        const reached = br.scored ? 4 : Math.round(br.p / 90);
        if (this.errorBeforeBatterSafe) batterResult = 'ROE';
        else {
          const b = this.batterReachedBeforeError > 0 ? Math.min(this.batterReachedBeforeError, reached) : reached;
          const otherOut = this.outs.some((o) => o.runnerId !== br.id);
          if (otherOut && b <= 1) batterResult = 'FC';
          else batterResult = (['1B', '1B', '2B', '3B', 'HR'][Math.max(1, Math.min(4, b))] as BatterResult);
        }
      }
    }
    const sacFly = this.caughtFly && this.cfg.outsBefore < 2 && runs.length > 0 && !!br?.out;
    const desc = this.describe(batterResult);
    return {
      kind: this.foul ? 'foul' : this.cfg.batter ? 'inplay' : 'nonbatted',
      homeRun: this.homeRun,
      groundRuleDouble: this.groundRuleDouble,
      outs: this.outs,
      runs,
      batterResult,
      bases,
      errors: this.errors,
      hitType,
      sacFly,
      doublePlay: this.outs.length === 2,
      triplePlay: this.outs.length >= 3,
      caughtStealing: this.runners.filter((r) => r.stealingFlag && r.out).map((r) => r.id),
      stolenBases: this.runners.filter((r) => r.stealingFlag && !r.out && (r.scored || Math.round(r.p / 90) > r.startBase)).map((r) => r.id),
      notable: [...this.notable],
      description: desc,
      fielderFirstTouch: this.firstTouch?.pos ?? null,
    };
  }

  private describe(res: BatterResult): string {
    const br = this.batterRunner();
    const name = br?.player.name ?? '';
    const ft = this.firstTouch?.pos;
    const where = ft ? ` to ${({ P: 'pitcher', C: 'catcher', '1B': 'first', '2B': 'second', '3B': 'third', SS: 'short', LF: 'left', CF: 'center', RF: 'right' } as Record<string, string>)[ft]}` : '';
    if (this.foul) return 'Foul ball';
    if (!this.cfg.batter) return '';
    switch (res) {
      case 'HR': return `${name} homers!`;
      case 'GRD': return `${name} ground-rule double`;
      case '1B': return `${name} singles${where}`;
      case '2B': return `${name} doubles${where}`;
      case '3B': return `${name} triples${where}`;
      case 'ROE': return `${name} reaches on an error${where}`;
      case 'FC': return `${name} reaches on a fielder's choice`;
      case 'out': {
        if (this.outs.length >= 3) return `TRIPLE PLAY!`;
        if (this.outs.length === 2) return `${name} grounds into a double play`;
        const o = this.outs.find((x) => x.runnerId === br?.id);
        if (o?.how === 'fly') return `${name} flies out${where}`;
        if (o?.how === 'line') return `${name} lines out${where}`;
        if (o?.how === 'pop') return `${name} pops out${where}`;
        return `${name} grounds out${where}`;
      }
      default: return '';
    }
  }
}
