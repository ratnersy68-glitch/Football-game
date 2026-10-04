/**
 * PlaySim — the real-time, physics-based simulation of ONE football play.
 *
 * Frame of reference: the team that snaps/kicks is 'O' and always attacks +x.
 * x = 0 is O's goal line, x = 100 the opponent's goal line; end zones run to -10 and 110.
 * y = 0..53.33 across the field (screen top to bottom).
 *
 * The sim is pure logic (no rendering). It is driven by `step(dt, input)` and produces a PlayOutcome.
 * Every actor is controlled by AI except, optionally, one actor driven by the human (`userTeam`).
 */
import { RNG } from './rng';
import { CENTER_Y, FIELD_W, clamp, dist, norm, type Vec } from './math';
import { makeActor, isFree, type Actor, type TeamSide } from './Actor';
import { LineupPicker, type DepthChart } from './Lineup';
import { FORMATIONS, OL_SLOTS, ROUTES, olDy, DEF_PERSONNEL, type OffPlay, type DefCall } from './Plays';
import type { PlayerData, Weather } from './types';
import { thinkActor, assignBlocks, cpuQbDecision, cpuCarrierMoves, type AiCtx } from './AI';

export type PlayKindSim = 'scrimmage' | 'kickoff' | 'punt';

export interface ControlInput {
  mx: number;
  my: number;
  sprint: boolean;
  juke: -1 | 0 | 1;
  spin: boolean;
  dive: boolean;
  stiff: boolean; // stiff arm (ball carrier)
  throwTo: number | null;
  throwAway: boolean;
  switchPlayer: boolean;
  action: boolean; // primary action pressed this frame (space)
  actionHeld: boolean;
  give: boolean; // option: hand off (key 1)
}

export const NO_INPUT: ControlInput = {
  mx: 0, my: 0, sprint: false, juke: 0, spin: false, dive: false, stiff: false, throwTo: null, throwAway: false,
  switchPlayer: false, action: false, actionHeld: false, give: false,
};

export interface SimSetup {
  kind: PlayKindSim;
  los: number;
  ballY: number;
  offPlay?: OffPlay;
  flip?: boolean;
  defCall?: DefCall;
  offDepth: DepthChart;
  defDepth: DepthChart;
  userTeam: TeamSide | null;
  /** AI skill 0..1 for each side (affects reactions, reads, pursuit angles). */
  skill: { O: number; D: number };
  weather: Weather;
  seed?: number;
  onside?: boolean;
  firstDownX?: number;
  /** User's preferred defender slot index when on defense. */
  userDefPick?: number;
  down?: number;
  toGo?: number;
  /** Rating bonus for the human's team, small (difficulty). */
  userBoost?: number;
}

export type BallState = 'held' | 'air' | 'loose' | 'dead' | 'snap';

export interface Ball {
  state: BallState;
  holder: number;
  x: number;
  y: number;
  z: number;
  // flight
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  t: number;
  dur: number;
  peak: number;
  target: number; // intended receiver
  kind: 'pass' | 'pitch' | 'kick' | 'punt' | 'snap' | 'away' | 'onside';
}

export type SimEvent =
  | { t: 'handoff'; to: number }
  | { t: 'throw'; qb: number; target: number; airYds: number }
  | { t: 'catch'; by: number; x: number }
  | { t: 'int'; by: number; x: number }
  | { t: 'incomplete'; reason: 'drop' | 'defended' | 'overthrow' | 'away' | 'oob'; by?: number }
  | { t: 'tackle'; by: number; carrier: number; assist?: number }
  | { t: 'missed'; by: number }
  | { t: 'sack'; by: number; qb: number }
  | { t: 'fumble'; carrier: number; forcedBy: number; recoveredBy: number; lost: boolean }
  | { t: 'juke'; by: number }
  | { t: 'stiff'; by: number }
  | { t: 'kick'; by: number; landX: number }
  | { t: 'fieldedKick'; by: number; x: number }
  | { t: 'shed'; by: number }
  | { t: 'pancake'; by: number }
  | { t: 'hit'; by: number }
  | { t: 'touchdown'; by: number };

export type OutcomeType =
  | 'tackle' | 'oob' | 'td' | 'incomplete' | 'safety' | 'touchback' | 'fair_catch' | 'kneel' | 'spike'
  | 'grounding' | 'recovered' | 'downed';

export interface PlayOutcome {
  type: OutcomeType;
  kind: PlayKindSim;
  spotX: number; // dead-ball spot in sim frame
  spotY: number;
  team: TeamSide; // team possessing at the end
  scoringTeam?: TeamSide;
  turnover: boolean; // scrimmage possession change
  clockStops: boolean;
  elapsed: number;
  los: number;
  // stat attribution (PlayerData ids)
  passer?: string;
  target?: string;
  receiver?: string;
  rusher?: string; // designed runner or scrambling QB
  carrierAtEnd?: string;
  tackler?: string;
  assist?: string;
  sacker?: string;
  interceptor?: string;
  fumbleForcer?: string;
  fumbleLost?: string;
  kicker?: string;
  returner?: string;
  completion: boolean;
  passAttempt: boolean;
  sack: boolean;
  /** Yards gained by offense from LOS (for scrimmage plays without turnover). */
  gain: number;
  returnYds: number;
  kickYds: number;
  passYds: number;
  airYds: number;
  rushYds: number;
  pd?: string; // pass defensed by
  bigHit: boolean;
  desc: string;
  events: SimEvent[];
  touchbackSpot?: number;
}

const CATCH_R = 1.55;
const DT_HIST = 0.05;

export class PlaySim {
  readonly setup: SimSetup;
  readonly rng: RNG;
  actors: Actor[] = [];
  ball: Ball;
  t = 0;
  snapped = false;
  done = false;
  outcome: PlayOutcome | null = null;
  userIdx = -1;
  events: SimEvent[] = [];
  qbIdx = -1;
  kickerIdx = -1;
  carrierStartTeam: TeamSide = 'O';
  designedRunner = -1;
  handedOff = false;
  qbRun = false;
  passThrown = false;
  pastLos = false; // runner crossed LOS (no more forward passes)
  caughtInEndzone = false;
  kickLanded = false;
  fairCatch = false;
  possessionChanged = false;
  passer = -1;
  passTarget = -1;
  receiver = -1;
  interceptor = -1;
  rusher = -1;
  catchX = 0;
  carryStartX = 0;
  kickStartX = 0;
  fumbleInfo: { forcer: number; lost: number } | null = null;
  lastTackleAssist = -1;
  pdBy = -1;
  airYds = 0;
  qbPressure = 0;
  histAcc = 0;
  message = '';
  messageT = 0;
  bigHit = false;
  /** Pre-snap zone/man assignments for drawing. */
  defCall?: DefCall;
  ai: AiCtx;
  private aiThinkAcc = 0;
  private optionDecided = false;

  constructor(setup: SimSetup) {
    this.setup = setup;
    this.rng = new RNG(setup.seed ?? Math.floor(Math.random() * 1e9));
    this.ball = {
      state: 'held', holder: -1, x: setup.los, y: setup.ballY, z: 0.3,
      fx: 0, fy: 0, tx: 0, ty: 0, t: 0, dur: 0, peak: 0, target: -1, kind: 'snap',
    };
    this.defCall = setup.defCall;
    this.ai = { sim: this, rng: this.rng, blockTimer: 0 };
    if (setup.kind === 'scrimmage') this.setupScrimmage();
    else if (setup.kind === 'kickoff') this.setupKickoff();
    else this.setupPunt();
    this.chooseUser();
  }

  // ------------------------------------------------------------------ setup

  private add(team: TeamSide, p: PlayerData, slot: string, x: number, y: number, role: Actor['role']): Actor {
    const a = makeActor(this.actors.length, team, p, slot, x, clamp(y, 1, FIELD_W - 1), role);
    if (this.setup.userTeam === team && this.setup.userBoost) {
      a.maxSpd += this.setup.userBoost * 0.25;
    }
    // Weather: snow and rain slow everyone a touch.
    if (this.setup.weather === 'snow') a.maxSpd *= 0.93;
    if (this.setup.weather === 'rain') a.maxSpd *= 0.97;
    this.actors.push(a);
    return a;
  }

  private setupScrimmage() {
    const s = this.setup;
    const play = s.offPlay!;
    const flip = s.flip ? -1 : 1;
    const form = FORMATIONS[play.formation];
    const los = s.los;
    const by = s.ballY;
    const op = new LineupPicker(s.offDepth);
    // Offensive line
    for (const sl of OL_SLOTS) this.add('O', op.take('OL'), sl, los - 0.7, by + olDy(sl) * flip, 'pblock');
    // QB
    const qb = this.add('O', op.take('QB'), 'QB', los - form.qbDepth, by, 'qb');
    this.qbIdx = qb.idx;
    // Skill
    for (const spec of form.skill) {
      const pl = op.take(spec.pos);
      const a = this.add('O', pl, spec.slot, los + spec.dx, by + spec.dy * flip, 'route');
      const rname = play.routes[spec.slot] ?? (spec.pos === 'RB' ? 'block' : 'go');
      this.setRoute(a, rname, flip);
    }
    // Run assignments
    const isRun = play.kind === 'run' || play.kind === 'option' || play.kind === 'sneak';
    if (isRun) {
      for (const a of this.actors) {
        if (a.team !== 'O') continue;
        if (a.role === 'pblock') a.role = 'rblock';
        if (a.role === 'route' && a.route && a.route.pts.length === 0) a.role = 'rblock';
      }
      const carrierSlot = play.carrier ?? 'H';
      const runner = carrierSlot === 'QB' ? qb : this.actors.find((a) => a.team === 'O' && a.slot === carrierSlot) ?? qb;
      if (runner !== qb) runner.role = 'carry';
      this.designedRunner = runner.idx;
      const fb = this.actors.find((a) => a.team === 'O' && a.slot === 'F');
      if (fb && fb !== runner) fb.role = 'lead';
    } else if (play.kind === 'pass') {
      for (const a of this.actors) {
        if (a.team === 'O' && a.role === 'route' && a.route && a.route.pts.length === 0) a.role = 'pblock';
      }
    } else {
      // spike / kneel: everyone blocks
      for (const a of this.actors) if (a.team === 'O' && a !== qb) a.role = 'pblock';
    }
    // Receiver numbers (top-to-bottom on screen) for pass plays.
    if (play.kind === 'pass') {
      const recv = this.actors.filter((a) => a.team === 'O' && a.role === 'route').sort((a, b) => a.y - b.y);
      recv.forEach((a, i) => (a.number = i + 1));
    }
    if (play.kind === 'option') {
      const rb = this.actors[this.designedRunner];
      if (rb) rb.number = 1;
    }
    this.ball.holder = qb.idx;
    this.ball.x = qb.x;
    this.ball.y = qb.y;
    this.setupDefense();
  }

  setRoute(a: Actor, name: string, flip: number) {
    const def = ROUTES[name] ?? ROUTES.go;
    const side = a.y < this.setup.ballY - 0.5 ? -1 : a.y > this.setup.ballY + 0.5 ? 1 : flip;
    // inward = toward the ball/middle = -side
    const pts = def.pts.map(([dx, di]) => ({ x: a.x + dx, y: clamp(a.y - side * di, 1.2, FIELD_W - 1.2) }));
    a.route = { pts, end: def.end, i: 0, label: def.label };
  }

  private setupDefense() {
    const s = this.setup;
    const call = s.defCall ?? { formation: '4-3', coverage: 'Cover 3' };
    const per = DEF_PERSONNEL[call.formation];
    const dp = new LineupPicker(s.defDepth);
    const los = s.los;
    const by = s.ballY;
    const goalLine = call.formation === 'Goal Line';
    const dlDy: Record<number, number[]> = { 3: [-2.6, 0, 2.6], 4: [-3.8, -1.3, 1.3, 3.8], 5: [-5, -2.5, 0, 2.5, 5] };
    const lbDy: Record<number, number[]> = { 1: [0], 2: [-2.8, 2.8], 3: [-4.5, 0, 4.5], 4: [-6.5, -2.2, 2.2, 6.5] };
    const dls: Actor[] = [];
    (dlDy[per.DL] ?? dlDy[4]).forEach((dy, i) => dls.push(this.add('D', dp.take('DL'), `DL${i + 1}`, los + 1.0, by + dy, 'rush')));
    const lbs: Actor[] = [];
    (lbDy[per.LB] ?? []).forEach((dy, i) => lbs.push(this.add('D', dp.take('LB'), `LB${i + 1}`, los + (goalLine ? 3 : 4.6), by + dy, 'zone')));
    const recv = this.actors.filter((a) => a.team === 'O' && (a.role === 'route' || a.role === 'carry' || a.role === 'lead' || (a.slot !== 'QB' && !OL_SLOTS.includes(a.slot as never))))
      .filter((a) => a.slot !== 'QB' && !OL_SLOTS.includes(a.slot as never))
      .sort((a, b) => a.y - b.y);
    const wide = recv.filter((a) => a.pos !== 'RB' && a.slot !== 'H' && a.slot !== 'F');
    const outsideL = wide[0];
    const outsideR = wide[wide.length - 1];
    const slots = wide.slice(1, -1);
    const cbs: Actor[] = [];
    const cbTargets: (Actor | undefined)[] = [outsideL, outsideR, slots[0], slots[slots.length - 1]];
    for (let i = 0; i < per.CB; i++) {
      const tgt = cbTargets[i];
      const y = tgt ? tgt.y + (tgt.y < CENTER_Y ? -0.8 : 0.8) : by + (i % 2 ? 12 : -12);
      cbs.push(this.add('D', dp.take('CB'), `CB${i + 1}`, los + (goalLine ? 2 : 5.5), y, 'man'));
      if (tgt) cbs[i].manTarget = tgt.idx;
    }
    const ss: Actor[] = [];
    for (let i = 0; i < per.S; i++) {
      const y = per.S === 1 ? by : by + (i === 0 ? -9 : 9);
      ss.push(this.add('D', dp.take('S'), i === 0 ? 'FS' : 'SS', los + (goalLine ? 6 : 12), y, 'zone'));
    }
    assignCoverage(this, call, { dls, lbs, cbs, ss, recv });
  }

  private setupKickoff() {
    const s = this.setup;
    const los = s.los;
    const kp = new LineupPicker(s.offDepth);
    const kicker = this.add('O', kp.take('K'), 'K', los - 6, CENTER_Y, 'kicker');
    this.kickerIdx = kicker.idx;
    const cov: ('LB' | 'S' | 'CB' | 'RB' | 'WR' | 'TE')[] = ['LB', 'S', 'CB', 'LB', 'RB', 'WR', 'S', 'LB', 'TE', 'CB'];
    const ys = [4, 9, 14, 19, 23.5, 30, 34.5, 39.5, 44.5, 49.5];
    cov.forEach((pos, i) => {
      const y = s.onside ? clamp(ys[i] * 0.6 + (CENTER_Y < 30 ? 2 : 0), 2, 51) : ys[i];
      this.add('O', kp.take(pos), `C${i + 1}`, los - 1, y, 'cover');
    });
    const rp = new LineupPicker(s.defDepth);
    const r1 = this.add('D', rp.takeFastest(['RB', 'WR', 'CB']), 'R1', 97, CENTER_Y - 3, 'returner');
    this.add('D', rp.takeFastest(['RB', 'WR', 'CB', 'S']), 'R2', 92, CENTER_Y + 6, 'kblock');
    const front: ('LB' | 'TE' | 'DL' | 'S' | 'RB' | 'WR' | 'OL' | 'CB')[] = ['TE', 'LB', 'DL', 'LB', 'TE', 'S', 'OL', 'LB', 'CB'];
    const fy = [8, 15, 22, 29, 36, 44, 20, 33, 26.6];
    const fx = [52, 52, 52, 52, 52, 52, 72, 72, 82];
    front.forEach((pos, i) => this.add('D', rp.take(pos), `B${i + 1}`, s.onside ? Math.min(fx[i], 54) : fx[i], fy[i], 'kblock'));
    this.ball.holder = -1;
    this.ball.state = 'dead';
    this.ball.x = los;
    this.ball.y = CENTER_Y;
    this.ball.z = 0.2;
    void r1;
  }

  private setupPunt() {
    const s = this.setup;
    const los = s.los;
    const by = s.ballY;
    const op = new LineupPicker(s.offDepth);
    for (const sl of OL_SLOTS) this.add('O', op.take('OL'), sl, los - 0.7, by + olDy(sl), 'pblock');
    const punter = this.add('O', op.take('K'), 'P', los - 12, by, 'kicker');
    this.kickerIdx = punter.idx;
    this.add('O', op.take('CB'), 'G1', los - 0.6, 3, 'cover');
    this.add('O', op.take('WR'), 'G2', los - 0.6, FIELD_W - 3, 'cover');
    this.add('O', op.take('TE'), 'W1', los - 1, by - 3.9, 'pblock');
    this.add('O', op.take('LB'), 'W2', los - 1, by + 3.9, 'pblock');
    this.add('O', op.take('RB'), 'PP', los - 6.5, by + 1, 'pblock');
    const dp = new LineupPicker(s.defDepth);
    const retX = Math.min(los + 42, 104);
    this.add('D', dp.takeFastest(['RB', 'WR', 'CB']), 'R1', retX, by, 'returner');
    const rushYs = [-4, -1.5, 1.5, 4, -6.5, 6.5];
    rushYs.forEach((dy, i) => this.add('D', dp.take(i < 4 ? 'DL' : 'LB'), `PR${i + 1}`, los + 1, by + dy, 'rush'));
    this.add('D', dp.take('CB'), 'V1', los + 1.5, 4, 'kblock');
    this.add('D', dp.take('CB'), 'V2', los + 1.5, FIELD_W - 4, 'kblock');
    this.add('D', dp.take('S'), 'M1', los + 12, by - 6, 'kblock');
    this.add('D', dp.take('LB'), 'M2', los + 12, by + 6, 'kblock');
    this.ball.holder = -1;
    this.ball.state = 'dead';
    this.ball.x = los - 0.5;
    this.ball.y = by;
  }

  private chooseUser() {
    const s = this.setup;
    if (!s.userTeam) return;
    if (s.kind === 'scrimmage') {
      if (s.userTeam === 'O') this.userIdx = this.qbIdx;
      else {
        const defs = this.defenders();
        const pick = s.userDefPick ?? -1;
        if (pick >= 0 && pick < defs.length) this.userIdx = defs[pick].idx;
        else {
          const lb = defs.find((a) => a.slot === 'LB2') ?? defs.find((a) => a.slot === 'LB1') ?? defs.find((a) => a.slot === 'SS') ?? defs[defs.length - 1];
          this.userIdx = lb.idx;
        }
      }
    } else {
      if (s.userTeam === 'D') this.userIdx = this.actors.find((a) => a.slot === 'R1')!.idx;
      else this.userIdx = this.actors.find((a) => a.team === 'O' && (a.slot === 'C5' || a.slot === 'G1'))?.idx ?? -1;
    }
  }

  defenders(): Actor[] {
    return this.actors.filter((a) => a.team === 'D');
  }

  /** Pre-snap: cycle the user's defender. Returns new pick index. */
  cycleUserDefender(dir = 1): number {
    const defs = this.defenders();
    const cur = defs.findIndex((a) => a.idx === this.userIdx);
    const next = (cur + dir + defs.length) % defs.length;
    this.userIdx = defs[next].idx;
    return next;
  }

  get user(): Actor | undefined {
    return this.userIdx >= 0 ? this.actors[this.userIdx] : undefined;
  }

  get carrier(): Actor | undefined {
    return this.ball.state === 'held' && this.ball.holder >= 0 ? this.actors[this.ball.holder] : undefined;
  }

  flash(msg: string, t = 1.2) {
    this.message = msg;
    this.messageT = t;
  }

  // ------------------------------------------------------------------ snap

  snap() {
    if (this.snapped) return;
    this.snapped = true;
    const s = this.setup;
    if (s.kind === 'scrimmage') {
      const play = s.offPlay!;
      if (play.kind === 'kneel') {
        this.endPlay({ type: 'kneel', spotX: s.los - 1, team: 'O', clockStops: false, desc: 'QB takes a knee.' });
        return;
      }
      if (play.kind === 'spike') {
        this.endPlay({ type: 'spike', spotX: s.los, team: 'O', clockStops: true, desc: 'Ball spiked to stop the clock.', passAttempt: true });
        return;
      }
      const qb = this.actors[this.qbIdx];
      const form = FORMATIONS[play.formation];
      if (form.qbDepth > 2) {
        // Shotgun snap flight
        this.ball.state = 'air';
        this.ball.kind = 'snap';
        this.ball.fx = s.los - 0.3;
        this.ball.fy = s.ballY;
        this.ball.tx = qb.x;
        this.ball.ty = qb.y;
        this.ball.t = 0;
        this.ball.dur = 0.28;
        this.ball.peak = 0.6;
        this.ball.target = qb.idx;
        this.ball.holder = -1;
      }
    } else if (s.kind === 'punt') {
      const p = this.actors[this.kickerIdx];
      this.ball.state = 'air';
      this.ball.kind = 'snap';
      this.ball.fx = s.los - 0.3;
      this.ball.fy = s.ballY;
      this.ball.tx = p.x;
      this.ball.ty = p.y;
      this.ball.t = 0;
      this.ball.dur = 0.5;
      this.ball.peak = 0.8;
      this.ball.target = p.idx;
    }
  }

  // ------------------------------------------------------------------ main loop

  step(dt: number, input: ControlInput = NO_INPUT) {
    if (this.done || !this.snapped) return;
    this.t += dt;
    if (this.messageT > 0) this.messageT -= dt;
    // Safety valve: no play lasts forever.
    if (this.t > 40) {
      const c = this.carrier;
      if (c) this.carrierDown(c, -1, 'dive');
      else this.endPlay({ type: this.setup.kind === 'scrimmage' ? 'incomplete' : 'downed', spotX: this.setup.kind === 'scrimmage' ? this.setup.los : Math.min(99, this.ball.x), team: this.setup.kind === 'scrimmage' ? 'O' : 'D', clockStops: true, desc: 'Whistle — ball dead.' });
      return;
    }
    this.handleUserMeta(input);
    // Timers
    for (const a of this.actors) {
      if (a.stunT > 0) a.stunT -= dt;
      if (a.tackleCd > 0) a.tackleCd -= dt;
      if (a.jukeT > 0) a.jukeT -= dt;
      if (a.jukeCd > 0) a.jukeCd -= dt;
      if (a.spinT > 0) a.spinT -= dt;
      if (a.spinCd > 0) a.spinCd -= dt;
      if (a.stiffT > 0) a.stiffT -= dt;
      if (a.stiffCd > 0) a.stiffCd -= dt;
      if (a.shedCd > 0) a.shedCd -= dt;
      if (a.reactT > 0) a.reactT -= dt;
    }
    this.histAcc += dt;
    if (this.histAcc >= DT_HIST) {
      this.histAcc = 0;
      for (const a of this.actors) {
        a.hist.push({ x: a.x, y: a.y });
        if (a.hist.length > 24) a.hist.shift();
      }
    }
    // Scripted events (handoffs, kicks)
    this.scripted(input);
    if (this.done) return;
    // AI blocking assignment refresh
    this.aiThinkAcc += dt;
    if (this.aiThinkAcc > 0.15) {
      this.aiThinkAcc = 0;
      assignBlocks(this.ai);
    }
    // Decide desired velocities
    for (const a of this.actors) {
      if (a.idx === this.userIdx && this.setup.userTeam) this.userDesire(a, input);
      else thinkActor(this.ai, a);
    }
    // CPU QB / carrier special decisions
    const qb = this.actors[this.qbIdx];
    if (qb && this.ball.state === 'held' && this.ball.holder === qb.idx && this.setup.kind === 'scrimmage' && !(this.setup.userTeam === 'O')) {
      cpuQbDecision(this.ai, qb);
    }
    if (this.done) return;
    const c = this.carrier;
    if (c && !(c.idx === this.userIdx && this.setup.userTeam)) cpuCarrierMoves(this.ai, c);
    // Integrate
    this.integrate(dt);
    this.engagements(dt);
    this.collisions();
    this.updateBall(dt);
    if (this.done) return;
    this.tackles(dt);
    if (this.done) return;
    this.checkBoundaries();
  }

  private handleUserMeta(input: ControlInput) {
    const s = this.setup;
    if (!s.userTeam) return;
    const u = this.user;
    // Switch player (defense or when chasing)
    if (input.switchPlayer) {
      const myTeam = s.userTeam;
      const holderTeam = this.carrier?.team;
      if (!(this.carrier && this.carrier.team === myTeam)) {
        const target: Vec = this.ball.state === 'air' ? { x: this.ball.tx, y: this.ball.ty } : { x: this.ball.x, y: this.ball.y };
        let best: Actor | null = null;
        let bd = 1e9;
        for (const a of this.actors) {
          if (a.team !== myTeam || a.down || a.idx === this.userIdx) continue;
          const d = dist(a, target);
          if (d < bd) { bd = d; best = a; }
        }
        if (best) this.userIdx = best.idx;
        void holderTeam;
      }
    }
    // Auto-follow the ball when our team possesses it.
    const c = this.carrier;
    if (c && c.team === s.userTeam && c.idx !== this.userIdx) {
      this.userIdx = c.idx;
    }
    // When the other team gets the ball and our controlled player is far away, hop to the closest pursuer.
    if (c && c.team !== s.userTeam && u && dist(u, c) > 14 && this.t % 1 < 0.02) {
      let best: Actor | null = null;
      let bd = 1e9;
      for (const a of this.actors) {
        if (a.team !== s.userTeam || a.down) continue;
        const d = dist(a, c);
        if (d < bd) { bd = d; best = a; }
      }
      if (best && bd < dist(u, c) - 4) this.userIdx = best.idx;
    }
  }

  /** Human control → desired velocity for the controlled actor. */
  private userDesire(a: Actor, input: ControlInput) {
    if (a.down || (a.stunT > 0 && this.carrier !== a)) { a.desire = { x: 0, y: 0 }; return; }
    // Returners auto-settle under kicks; the human takes over once the ball is caught.
    if (a.role === 'returner' && this.ball.state !== 'held') { thinkActor(this.ai, a); return; }
    // Kick coverage before the kick is in the air: hold the line.
    if (this.setup.kind === 'kickoff' && this.ball.state === 'dead') { thinkActor(this.ai, a); return; }
    const isCarrier = this.carrier === a;
    const isQbHolding = isCarrier && a.idx === this.qbIdx && !this.pastLos && this.setup.kind === 'scrimmage' && this.setup.offPlay?.kind === 'pass';
    // Scripted phases: QB dropback / handoff mesh / designed carrier before handoff
    if (this.setup.kind === 'scrimmage' && this.setup.userTeam === 'O') {
      const play = this.setup.offPlay!;
      if (a.idx === this.qbIdx && !this.handedOff && (play.kind === 'run') && this.ball.holder === a.idx) {
        thinkActor(this.ai, a);
        return;
      }
      if (isQbHolding && this.t < this.dropTime() && input.mx === 0 && input.my === 0) {
        thinkActor(this.ai, a);
        return;
      }
      if (play.kind === 'option' && !this.optionDecided && this.ball.holder === a.idx) {
        thinkActor(this.ai, a);
        return;
      }
    }
    let mx = input.mx;
    let my = input.my;
    const l = Math.hypot(mx, my);
    if (l > 1) { mx /= l; my /= l; }
    let frac = 0.9;
    if (input.sprint && a.stamina > 0.05) frac = 1.06;
    if (isQbHolding) frac = Math.min(frac, 0.8);
    a.desire = { x: mx * frac, y: my * frac };
    // Moves for ball carriers
    if (isCarrier && !isQbHolding) {
      if (input.juke !== 0 && a.jukeCd <= 0) this.doJuke(a, input.juke);
      if (input.spin && a.spinCd <= 0) this.doSpin(a);
      if (input.stiff && a.stiffCd <= 0) this.doStiffArm(a);
      if (input.dive && a.diveT <= 0) this.doDive(a, mx, my);
    } else if (!isCarrier) {
      // Defender / chaser actions: only when the other team has (or is about to catch) the ball
      const c = this.carrier;
      const chasing = (c && c.team !== a.team) || (this.ball.state === 'air' && this.ball.kind === 'pass' && a.team === 'D');
      if (chasing && (input.dive || input.action) && a.diveT <= 0 && a.stunT <= 0) this.doDive(a, mx, my);
    }
  }

  doJuke(a: Actor, dir: -1 | 1) {
    a.jukeT = 0.38;
    a.jukeCd = 0.85;
    a.vy += dir * (2.8 + a.p.attrs.agi * 0.025);
    a.vx *= 0.85;
    a.stamina = Math.max(0, a.stamina - 0.06);
    this.events.push({ t: 'juke', by: a.idx });
  }

  /** Stiff arm: the free arm extends into the nearest tackler; harder to bring down for a moment. Cosmetic gear has no effect. */
  doStiffArm(a: Actor) {
    a.stiffT = 0.4;
    a.stiffCd = 1.1;
    a.stamina = Math.max(0, a.stamina - 0.05);
    this.events.push({ t: 'stiff', by: a.idx });
  }

  doSpin(a: Actor) {
    a.spinT = 0.45;
    a.spinCd = 1.3;
    a.stamina = Math.max(0, a.stamina - 0.08);
  }

  doDive(a: Actor, mx: number, my: number) {
    a.diveT = 0.42;
    let dx = mx;
    let dy = my;
    if (Math.hypot(dx, dy) < 0.1) {
      const c = this.carrier;
      if (c && c !== a) { const n = norm({ x: c.x - a.x, y: c.y - a.y }); dx = n.x; dy = n.y; }
      else { dx = a.team === 'O' ? 1 : -1; dy = 0; }
    }
    const n = norm({ x: dx, y: dy });
    a.vx = n.x * (a.maxSpd + 1.5);
    a.vy = n.y * (a.maxSpd + 1.5);
  }

  dropTime(): number {
    const play = this.setup.offPlay;
    if (!play || play.kind !== 'pass') return 0;
    return 0.25 + (play.drop ?? 5) * 0.11 + (play.playAction ? 0.55 : 0);
  }

  // ------------------------------------------------------------------ scripted moments

  private scripted(input: ControlInput) {
    const s = this.setup;
    if (s.kind === 'scrimmage') {
      const play = s.offPlay!;
      const qb = this.actors[this.qbIdx];
      if (this.ball.state !== 'held' || this.ball.holder !== qb.idx) return;
      const rb = this.designedRunner >= 0 ? this.actors[this.designedRunner] : undefined;
      if (play.kind === 'run' && rb && rb !== qb && !this.handedOff) {
        if (play.toss) {
          if (this.t > 0.22) this.pitchTo(rb);
        } else {
          const minT = play.draw ? 0.85 : 0.3;
          if (this.t > minT && dist(qb, rb) < 1.25) this.handoff(rb);
          else if (this.t > 1.6) this.handoff(rb);
        }
      }
      if (play.kind === 'option' && rb && !this.optionDecided) {
        const userQb = s.userTeam === 'O';
        if (userQb && input.give && this.t > 0.15) { this.optionDecided = true; this.handoff(rb); return; }
        if (!userQb && this.t > 0.45 && dist(qb, rb) < 1.6) {
          // CPU read: keep if the unblocked end crashes on the back.
          const edge = this.actors.filter((a) => a.team === 'D' && a.role === 'rush' && a.engaged < 0)
            .sort((a, b) => dist(a, rb) - dist(b, rb))[0];
          this.optionDecided = true;
          const keep = edge && dist(edge, rb) < 3.2 && this.rng.chance(0.4 + s.skill.O * 0.5);
          if (!keep) { this.handoff(rb); return; }
          this.rusher = qb.idx;
          this.qbRun = true;
          qb.role = 'carrier';
        }
        if (this.t > 0.85 && !this.optionDecided) {
          this.optionDecided = true;
          this.rusher = qb.idx;
          this.qbRun = true;
          qb.role = 'carrier';
          this.flash('KEEPER!', 0.8);
        }
      }
      if (play.kind === 'sneak' && this.rusher < 0) { this.rusher = qb.idx; this.qbRun = true; qb.role = 'carrier'; }
      if (play.kind === 'pass' && play.playAction && rb && this.t > 0.2 && this.t < 0.7) rb.role = 'carry';
      if (play.kind === 'pass' && play.playAction && rb && this.t >= 0.7 && rb.role === 'carry') rb.role = 'pblock';
      // User throws
      if (s.userTeam === 'O' && play.kind === 'pass' && !this.pastLos) {
        if (input.throwTo != null && this.t > 0.2) {
          const tgt = this.actors.find((a) => a.team === 'O' && a.number === input.throwTo && a.role === 'route');
          if (tgt) this.throwTo(qb, tgt);
        } else if (input.throwAway && this.t > 0.2) {
          this.throwAway(qb);
        }
      }
    } else if (s.kind === 'kickoff') {
      const k = this.actors[this.kickerIdx];
      if (!this.kickLanded && this.ball.state === 'dead' && this.t > 0.05) {
        // Kicker approaches the ball
        if (dist(k, { x: s.los, y: CENTER_Y }) < 0.8 || this.t > 1.2) this.kickoffKick(k);
      }
    } else if (s.kind === 'punt') {
      const p = this.actors[this.kickerIdx];
      if (this.ball.state === 'held' && this.ball.holder === p.idx && this.t > 1.15) this.puntKick(p);
    }
  }

  handoff(to: Actor) {
    this.ball.holder = to.idx;
    this.ball.state = 'held';
    this.handedOff = true;
    this.rusher = to.idx;
    to.role = 'carrier';
    this.carryStartX = to.x;
    this.events.push({ t: 'handoff', to: to.idx });
    const qb = this.actors[this.qbIdx];
    qb.role = 'idle';
    this.defReact(0.15);
  }

  pitchTo(to: Actor) {
    const qb = this.actors[this.qbIdx];
    this.handedOff = true;
    this.launch(qb, to.x + to.vx * 0.35, to.y + to.vy * 0.35, 0.35, 1.2, 'pitch', to.idx);
    qb.role = 'idle';
    this.defReact(0.1);
  }

  /** Makes defenders begin flowing to the ball after a reaction delay. */
  defReact(base: number) {
    const skill = this.setup.skill.D;
    const pa = this.setup.offPlay?.playAction;
    for (const a of this.actors) {
      if (a.team !== 'D') continue;
      const delay = base + (1 - skill) * 0.35 + (100 - a.p.attrs.awr) * 0.004 + (pa && a.pos === 'LB' ? 0.35 : 0);
      a.reactT = Math.max(a.reactT, delay * this.rng.range(0.7, 1.2));
    }
  }

  launch(from: Actor, tx: number, ty: number, dur: number, peak: number, kind: Ball['kind'], target: number) {
    const b = this.ball;
    b.state = 'air';
    b.kind = kind;
    b.fx = from.x;
    b.fy = from.y;
    b.tx = tx;
    b.ty = ty;
    b.t = 0;
    b.dur = dur;
    b.peak = peak;
    b.target = target;
    b.holder = -1;
  }

  /** Predict where a route-runner will be after time t (follows its route). */
  predict(a: Actor, t: number): Vec {
    const spd = Math.max(Math.hypot(a.vx, a.vy), a.maxSpd * 0.85);
    if (!a.route || a.role !== 'route') return { x: a.x + a.vx * t, y: a.y + a.vy * t };
    let x = a.x;
    let y = a.y;
    let remaining = spd * t;
    let i = a.route.i;
    const pts = a.route.pts;
    while (remaining > 0 && i < pts.length) {
      const p = pts[i];
      const d = Math.hypot(p.x - x, p.y - y);
      if (d >= remaining) {
        x += ((p.x - x) / d) * remaining;
        y += ((p.y - y) / d) * remaining;
        remaining = 0;
      } else {
        x = p.x;
        y = p.y;
        remaining -= d;
        i++;
      }
    }
    if (remaining > 0 && a.route.end === 'continue' && pts.length) {
      const last = pts[pts.length - 1];
      const prev = pts.length > 1 ? pts[pts.length - 2] : { x: a.startX, y: a.startY };
      const n = norm({ x: last.x - prev.x, y: last.y - prev.y });
      x += n.x * remaining;
      y += n.y * remaining;
    }
    return { x, y: clamp(y, 0.5, FIELD_W - 0.5) };
  }

  throwTo(qb: Actor, tgt: Actor) {
    if (this.passThrown || this.ball.holder !== qb.idx) return;
    const a = qb.p.attrs;
    const speed = 16 + a.arm * 0.1;
    let p = { x: tgt.x, y: tgt.y };
    let ft = 0.5;
    for (let i = 0; i < 4; i++) {
      const d = dist(qb, p);
      ft = d / speed + (d > 22 ? 0.35 : d > 12 ? 0.15 : 0.05);
      p = this.predict(tgt, ft);
    }
    const d = dist(qb, p);
    // Accuracy
    const pressure = this.pressureOn(qb);
    const moving = Math.hypot(qb.vx, qb.vy) > 2.5 ? 1 : 0;
    const weather = this.setup.weather === 'rain' ? 1.2 : this.setup.weather === 'snow' ? 1.25 : this.setup.weather === 'wind' ? 1.15 : 1;
    const armPenalty = d > 20 + a.arm * 0.3 ? (d - (20 + a.arm * 0.3)) * 0.12 : 0;
    const err = ((1.32 - a.accu / 100) * (0.3 + d * 0.06) * (1 + pressure * 1.1 + moving * 0.45) + armPenalty) * weather;
    p.x += this.rng.normal(0, err * 0.85);
    p.y += this.rng.normal(0, err);
    p.x = Math.min(p.x, 112);
    this.launch(qb, p.x, p.y, ft, Math.min(9, 1 + d * 0.18), 'pass', tgt.idx);
    this.passThrown = true;
    this.passer = qb.idx;
    this.passTarget = tgt.idx;
    this.airYds = p.x - this.setup.los;
    qb.role = 'idle';
    this.events.push({ t: 'throw', qb: qb.idx, target: tgt.idx, airYds: this.airYds });
    // Defenders react to the throw
    const skill = this.setup.skill.D;
    for (const df of this.actors) {
      if (df.team !== 'D' || df.role === 'rush') continue;
      df.reactT = 0.12 + (1 - skill) * 0.28 + (100 - df.p.attrs.awr) * 0.003;
      if (df.role === 'man' || df.role === 'zone' || df.role === 'pursue') df.role = 'ballhawk';
    }
    tgt.role = 'route';
  }

  throwAway(qb: Actor) {
    if (this.passThrown) return;
    const inPocket = Math.abs(qb.y - this.setup.ballY) < 4.5 && qb.x > this.setup.los - 9;
    const side = qb.y < CENTER_Y ? -3 : FIELD_W + 3;
    this.launch(qb, qb.x + 8, side, 0.7, 3, 'away', -1);
    this.passThrown = true;
    this.passer = qb.idx;
    qb.role = 'idle';
    if (inPocket && this.pressureOn(qb) > 0.4) {
      this.groundingPending = true;
    }
  }
  groundingPending = false;

  pressureOn(qb: Actor): number {
    let p = 0;
    for (const a of this.actors) {
      if (a.team === qb.team || !isFree(a)) continue;
      const d = dist(a, qb);
      if (d < 4) p = Math.max(p, 1 - d / 4);
    }
    this.qbPressure = p;
    return p;
  }

  private kickoffKick(k: Actor) {
    const s = this.setup;
    const a = k.p.attrs;
    let landX: number;
    let landY: number;
    let hang: number;
    if (s.onside) {
      landX = s.los + 11 + this.rng.range(0, 3);
      landY = clamp(CENTER_Y + this.rng.pick([-1, 1]) * this.rng.range(14, 22), 3, FIELD_W - 3);
      hang = 0.9;
      this.launch(k, landX, landY, hang, 1.2, 'onside', -1);
    } else {
      const distance = 37 + a.kpow * 0.16 + this.rng.normal(0, 4) - (s.weather === 'wind' ? this.rng.range(0, 6) : 0);
      landX = Math.min(s.los + distance, 109);
      landY = clamp(CENTER_Y + this.rng.normal(0, 7), 6, FIELD_W - 6);
      hang = 3.1 + a.kpow * 0.01;
      this.launch(k, landX, landY, hang, 18, 'kick', -1);
    }
    this.kickStartX = s.los;
    this.events.push({ t: 'kick', by: k.idx, landX });
    // Returner heads to the ball
    const r = this.actors.find((x) => x.slot === 'R1');
    if (r) r.role = 'returner';
  }

  private puntKick(p: Actor) {
    const s = this.setup;
    const a = p.p.attrs;
    // Defender in the punter's face → blocked
    const blocker = this.actors.find((d) => d.team === 'D' && isFree(d) && dist(d, p) < 1.3);
    if (blocker && this.rng.chance(0.55)) {
      this.flash('BLOCKED!', 1.5);
      this.launch(p, p.x + this.rng.range(-3, 3), p.y + this.rng.range(-3, 3), 0.6, 1.5, 'onside', -1);
      this.kickStartX = s.los;
      return;
    }
    const distance = 30 + a.kpow * 0.15 + this.rng.normal(0, 4.5) - (s.weather === 'wind' ? this.rng.range(0, 5) : 0);
    const landX = Math.min(p.x + distance, 112);
    const landY = clamp(p.y + this.rng.normal(0, 6), 5, FIELD_W - 5);
    const hang = 3.3 + a.kpow * 0.012;
    this.launch(p, landX, landY, hang, 16, 'punt', -1);
    this.kickStartX = s.los;
    this.events.push({ t: 'kick', by: p.idx, landX });
    for (const x of this.actors) if (x.team === 'O' && x.idx !== p.idx) x.role = 'cover';
    for (const x of this.actors) if (x.team === 'D' && x.slot !== 'R1') x.role = 'kblock';
    p.role = 'cover';
  }

  // ------------------------------------------------------------------ physics

  private integrate(dt: number) {
    for (const a of this.actors) {
      if (a.engaged >= 0) continue; // engagement handles position
      if (a.down) {
        a.vx *= 0.8;
        a.vy *= 0.8;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        continue;
      }
      if (a.diveT > 0) {
        a.diveT -= dt;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.vx *= 0.93;
        a.vy *= 0.93;
        if (a.diveT <= 0) {
          a.stunT = this.carrier === a ? 0 : 0.7;
          if (this.carrier === a) {
            // Dive ends the run (ball carrier goes down).
            this.carrierDown(a, -1, 'dive');
            return;
          }
        }
        continue;
      }
      let max = a.maxSpd;
      const isCarrier = this.carrier === a;
      if (isCarrier) max *= 0.94;
      if (a.spinT > 0) max *= 0.82;
      if (a.stunT > 0) max *= isCarrier ? 0.6 : 0.25;
      if (a.role === 'route' && !this.passThrown) max *= 0.95;
      // Stamina
      const sprinting = Math.hypot(a.desire.x, a.desire.y) > 1.0;
      if (sprinting) a.stamina = Math.max(0, a.stamina - dt * (0.22 - a.p.attrs.sta * 0.0012));
      else a.stamina = Math.min(1, a.stamina + dt * 0.12);
      if (a.stamina < 0.15) max *= 0.92;
      const tvx = a.desire.x * max;
      const tvy = a.desire.y * max;
      let dvx = tvx - a.vx;
      let dvy = tvy - a.vy;
      const dl = Math.hypot(dvx, dvy);
      const acc = a.accel * (isCarrier ? 1.05 : 1) * (a.jukeT > 0 ? 1.4 : 1);
      const lim = acc * dt;
      if (dl > lim) {
        dvx = (dvx / dl) * lim;
        dvy = (dvy / dl) * lim;
      }
      a.vx += dvx;
      a.vy += dvy;
      // Cap
      const sp = Math.hypot(a.vx, a.vy);
      const cap = max * 1.12 + (a.jukeT > 0 ? 2.2 : 0);
      if (sp > cap) {
        a.vx = (a.vx / sp) * cap;
        a.vy = (a.vy / sp) * cap;
      }
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      if (Math.abs(a.vx) > 0.4) a.facing = a.vx > 0 ? 1 : -1;
      a.anim += sp * dt * 1.6;
      // Non-carriers stay on the field (roughly)
      if (!isCarrier) {
        a.y = clamp(a.y, -2, FIELD_W + 2);
        a.x = clamp(a.x, -12, 112);
      }
    }
  }

  private engagements(dt: number) {
    const s = this.setup;
    const passPro = s.kind === 'scrimmage' && s.offPlay?.kind === 'pass' && !this.passThrown && !this.pastLos;
    // Form new engagements
    for (const b of this.actors) {
      if (!(b.role === 'pblock' || b.role === 'rblock' || b.role === 'lead' || b.role === 'kblock')) continue;
      if (b.engaged >= 0 || b.down || b.stunT > 0) continue;
      if (this.carrier === b) continue;
      for (const d of this.actors) {
        if (d.team === b.team || d.engaged >= 0 || d.down || this.carrier === d) continue;
        if (d.role === 'kicker' || d.diveT > 0) continue;
        if (d.shedCd > 0 && (d.shedFrom === b.idx || (passPro && d.shedCd > 0.35))) continue;
        // Coverage defenders only get blocked once the ball is past the line (runs/screens/returns)
        if ((d.role === 'man' || d.role === 'zone' || d.role === 'ballhawk') && passPro) continue;
        const dd = dist(b, d);
        if (dd < b.radius + d.radius + 0.35) {
          // Quick win at the line?
          const net = this.blockNet(b, d, passPro);
          if (this.rng.chance(0.03 + Math.max(0, net) * 0.25)) {
            d.shedFrom = b.idx;
            d.shedCd = 0.6;
            continue;
          }
          b.engaged = d.idx;
          d.engaged = b.idx;
          b.engageT = 0;
          d.engageT = 0;
          break;
        }
      }
    }
    // Resolve existing engagements
    for (const b of this.actors) {
      if (b.engaged < 0) continue;
      const d = this.actors[b.engaged];
      if (d.engaged !== b.idx) { b.engaged = -1; continue; }
      if (!(b.role === 'pblock' || b.role === 'rblock' || b.role === 'lead' || b.role === 'kblock')) continue;
      // b is the blocker
      b.engageT += dt;
      d.engageT += dt;
      const net = this.blockNet(b, d, passPro);
      // Shed?
      const rate = (passPro ? 0.17 : 0.5) * Math.exp(net * 3.2) * (1 + d.engageT * (passPro ? 0.3 : 0.15)) * (passPro ? 1 + Math.max(0, this.t - 3) * 0.6 : 1);
      // A ball carrier running away from the block makes it harder to hold
      if (this.rng.chance(rate * dt) || (this.carrier && dist(d, this.carrier) < 1.4 && this.rng.chance(dt * 1.6))) {
        b.engaged = -1;
        d.engaged = -1;
        d.shedFrom = b.idx;
        d.shedCd = 0.9;
        b.stunT = 0.25;
        d.vx = d.desire.x * 2;
        d.vy = d.desire.y * 2;
        if (net > 0.12) this.events.push({ t: 'shed', by: d.idx });
        continue;
      }
      // Pancake?
      if (net < -0.25 && this.rng.chance(dt * 0.25)) {
        b.engaged = -1;
        d.engaged = -1;
        d.down = true;
        d.stunT = 1.6;
        this.events.push({ t: 'pancake', by: b.idx });
        continue;
      }
      // Movement of the pair: defender pushes toward its desire, blocker resists.
      const want = norm(d.desire);
      const push = net * 3.2 + (passPro ? 0.45 + d.engageT * 0.18 : 0.2);
      const lateralSlide = (d.p.attrs.agi - b.p.attrs.agi) * 0.012;
      const vx = want.x * push + -want.y * lateralSlide * Math.sign(want.y || 1) * 0.3;
      const vy = want.y * push * 0.6 + (this.carrier ? Math.sign(this.carrier.y - d.y) * lateralSlide * 0.4 : 0);
      // Blocker also drives in run game
      const drive = !passPro ? norm({ x: b.desire.x, y: b.desire.y }) : { x: 0, y: 0 };
      const mvx = vx + drive.x * Math.max(0, -net) * 1.5;
      const mvy = vy + drive.y * Math.max(0, -net) * 1.5;
      d.x += mvx * dt;
      d.y += mvy * dt;
      d.vx = mvx;
      d.vy = mvy;
      // Keep blocker glued in front of defender (between defender and the protected point)
      const prot = this.carrier ?? this.actors[this.qbIdx] ?? b;
      const toProt = norm({ x: prot.x - d.x, y: prot.y - d.y });
      const gap = b.radius + d.radius + 0.05;
      const bx = d.x + toProt.x * gap;
      const by = d.y + toProt.y * gap;
      const glue = 1 - Math.exp(-dt * 21);
      b.vx = ((bx - b.x) * glue) / Math.max(dt, 1e-3);
      b.vy = ((by - b.y) * glue) / Math.max(dt, 1e-3);
      b.x += (bx - b.x) * glue;
      b.y += (by - b.y) * glue;
      b.anim += dt * 2;
      d.anim += dt * 2;
      // Engagement breaks if separated (e.g., carrier passed)
      if (dist(b, d) > 2.2) {
        b.engaged = -1;
        d.engaged = -1;
      }
    }
  }

  blockNet(b: Actor, d: Actor, passPro: boolean): number {
    const ba = b.p.attrs;
    const da = d.p.attrs;
    const blk = ba.str * 0.45 + (passPro ? ba.pblk : ba.rblk) * 0.55;
    const def = da.str * 0.4 + (passPro ? da.rush : da.shed) * 0.6;
    const skillAdj = (b.team === 'D' ? this.setup.skill.D : this.setup.skill.O) * 0.04 - (d.team === 'D' ? this.setup.skill.D : this.setup.skill.O) * 0.04;
    return (def - blk) / 100 - skillAdj * 0.5 + (b.mass - d.mass) * -0.05;
  }

  private collisions() {
    const n = this.actors.length;
    const carrier = this.carrier;
    for (let i = 0; i < n; i++) {
      const a = this.actors[i];
      for (let j = i + 1; j < n; j++) {
        const b = this.actors[j];
        if (a.engaged === b.idx) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const r = a.radius + b.radius;
        const d2 = dx * dx + dy * dy;
        if (d2 >= r * r || d2 < 1e-6) continue;
        // Downed players and diving tacklers are not obstacles for long
        if (a.down || b.down) continue;
        // A rusher who just beat his block slips past linemen for a moment
        if (a.team !== b.team && ((a.shedCd > 0.25 && (b.role === 'pblock' || b.role === 'rblock')) || (b.shedCd > 0.25 && (a.role === 'pblock' || a.role === 'rblock')))) continue;
        // Ball carrier vs defender: handled as tackle attempt, but still collide lightly
        const d = Math.sqrt(d2);
        const overlap = r - d;
        const nx = dx / d;
        const ny = dy / d;
        const ma = a.mass * (carrier === a ? 1.3 : 1);
        const mb = b.mass * (carrier === b ? 1.3 : 1);
        const wa = mb / (ma + mb);
        const wb = ma / (ma + mb);
        a.x -= nx * overlap * wa;
        a.y -= ny * overlap * wa;
        b.x += nx * overlap * wb;
        b.y += ny * overlap * wb;
        // Dampen approach velocities
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv < 0) {
          a.vx += nx * rv * wa * 0.8;
          a.vy += ny * rv * wa * 0.8;
          b.vx -= nx * rv * wb * 0.8;
          b.vy -= ny * rv * wb * 0.8;
        }
      }
    }
  }

  // ------------------------------------------------------------------ ball

  private updateBall(dt: number) {
    const b = this.ball;
    if (b.state === 'held') {
      const h = this.actors[b.holder];
      b.x = h.x + h.facing * 0.25;
      b.y = h.y;
      b.z = 0.9;
      if (h.role !== 'carrier' && h.idx !== this.qbIdx) h.role = 'carrier';
      if (h.idx === this.qbIdx && !this.pastLos && h.x > this.setup.los + 0.3 && this.setup.kind === 'scrimmage') {
        this.pastLos = true;
        h.role = 'carrier';
        if (this.rusher < 0) this.rusher = h.idx;
        this.defReact(0.05);
      }
      if (h.idx !== this.qbIdx || this.handedOff) {
        if (!this.pastLos && h.x > this.setup.los) this.pastLos = true;
      }
      return;
    }
    if (b.state !== 'air') return;
    b.t += dt;
    const f = Math.min(1, b.t / b.dur);
    b.x = b.fx + (b.tx - b.fx) * f;
    b.y = b.fy + (b.ty - b.fy) * f;
    b.z = 0.9 + 4 * b.peak * f * (1 - f) * (b.kind === 'kick' || b.kind === 'punt' ? 1 : 0.6);
    if (b.kind === 'kick' || b.kind === 'punt') {
      // Kick: returner may catch near the end
      if (f >= 1) this.resolveKickArrival();
      return;
    }
    if (b.kind === 'onside') {
      if (f >= 1) this.resolveLooseBall(b.tx, b.ty, 'onside');
      return;
    }
    if (b.kind === 'snap') {
      if (f >= 1) {
        const tgt = this.actors[b.target];
        b.state = 'held';
        b.holder = tgt.idx;
        if (this.setup.kind === 'scrimmage' && this.rng.chance(0.004)) {
          // Rare bad snap → fumble at QB's feet
          this.resolveLooseBall(tgt.x - 1, tgt.y, 'fumble', tgt);
        }
      }
      return;
    }
    if (b.kind === 'pitch') {
      if (f >= 1) {
        const tgt = this.actors[b.target];
        if (dist(tgt, { x: b.tx, y: b.ty }) < 2.2 && this.rng.chance(0.985)) {
          this.handoff(tgt);
        } else {
          this.resolveLooseBall(b.tx, b.ty, 'fumble', tgt);
        }
      }
      return;
    }
    if (b.kind === 'away') {
      if (f >= 1) {
        if (this.groundingPending) {
          this.endPlay({ type: 'grounding', spotX: this.actors[this.passer].x, team: 'O', clockStops: true, desc: 'Intentional grounding — loss of down.', passAttempt: true });
        } else {
          this.events.push({ t: 'incomplete', reason: 'away' });
          this.endPlay({ type: 'incomplete', spotX: this.setup.los, team: 'O', clockStops: true, desc: 'Pass thrown away.', passAttempt: true });
        }
      }
      return;
    }
    // Pass in flight: catch window opens near arrival
    if (f >= 1) this.resolvePassArrival();
  }

  private resolvePassArrival() {
    const b = this.ball;
    const bp = { x: b.tx, y: b.ty };
    const s = this.setup;
    const outOfBounds = bp.y < 0 || bp.y > FIELD_W || bp.x > 110;
    let bestO: Actor | null = null;
    let qO = 0;
    let bestD: Actor | null = null;
    let qD = 0;
    for (const a of this.actors) {
      if (a.down || a.engaged >= 0 || a.idx === this.passer) continue;
      if (a.stunT > 0.3) continue;
      const reach = CATCH_R + (a.diveT > 0 ? 0.6 : 0) + (a.p.height - 72) * 0.03;
      const d = dist(a, bp);
      if (d > reach) continue;
      const q = 1 - d / reach;
      if (a.team === 'O') { if (q > qO) { qO = q; bestO = a; } }
      else if (q > qD) { qD = q; bestD = a; }
    }
    const rainPen = s.weather === 'rain' ? 0.07 : s.weather === 'snow' ? 0.05 : 0;
    // Defender play on the ball
    if (bestD && !outOfBounds) {
      const da = bestD.p.attrs;
      const userBonus = this.userIdx === bestD.idx ? 0.1 : 0;
      const pInt = qD * (0.08 + da.hands * 0.0028 + userBonus) * (qD > qO ? 1.25 : 0.6) * (0.75 + s.skill.D * 0.5);
      if (this.rng.chance(pInt)) {
        this.interception(bestD);
        return;
      }
      const pDef = qD * (0.3 + da.cov * 0.004) * (qD > qO * 0.8 ? 1 : 0.5);
      if (this.rng.chance(pDef)) {
        this.pdBy = bestD.idx;
        this.events.push({ t: 'incomplete', reason: 'defended', by: bestD.idx });
        this.flash('BROKEN UP!', 1);
        this.endPlay({ type: 'incomplete', spotX: s.los, team: 'O', clockStops: true, desc: `Pass broken up by ${bestD.p.last}.`, passAttempt: true });
        return;
      }
    }
    if (bestO && !outOfBounds) {
      const oa = bestO.p.attrs;
      const contested = bestD ? qD * 0.32 : 0;
      const pCatch = clamp(0.36 + oa.hands * 0.0058 + qO * 0.28 - contested - rainPen + (this.userIdx === bestO.idx ? 0.03 : 0), 0.08, 0.975);
      if (this.rng.chance(pCatch)) {
        this.catchBall(bestO);
        return;
      }
      this.events.push({ t: 'incomplete', reason: 'drop', by: bestO.idx });
      this.flash(qO > 0.55 && !bestD ? 'DROPPED!' : 'INCOMPLETE', 1);
      this.endPlay({ type: 'incomplete', spotX: s.los, team: 'O', clockStops: true, desc: qO > 0.55 && !bestD ? `Dropped by ${bestO.p.last}.` : 'Incomplete.', passAttempt: true });
      return;
    }
    this.events.push({ t: 'incomplete', reason: outOfBounds ? 'oob' : 'overthrow' });
    this.flash('INCOMPLETE', 1);
    this.endPlay({ type: 'incomplete', spotX: s.los, team: 'O', clockStops: true, desc: 'Incomplete pass.', passAttempt: true });
  }

  private catchBall(r: Actor) {
    const b = this.ball;
    b.state = 'held';
    b.holder = r.idx;
    r.role = 'carrier';
    this.receiver = r.idx;
    this.catchX = r.x;
    this.carryStartX = r.x;
    this.events.push({ t: 'catch', by: r.idx, x: r.x });
    if (r.x > this.setup.los) this.pastLos = true;
    for (const a of this.actors) if (a.team === 'D') { a.role = 'pursue'; a.reactT = Math.min(a.reactT, 0.15); }
    for (const a of this.actors) if (a.team === 'O' && a !== r && a.role === 'route') a.role = 'rblock';
    // Catch in the end zone = touchdown immediately
    if (r.x >= 100 && r.y > 0 && r.y < FIELD_W) this.touchdown(r);
  }

  private interception(d: Actor) {
    const b = this.ball;
    b.state = 'held';
    b.holder = d.idx;
    d.role = 'carrier';
    this.interceptor = d.idx;
    this.possessionChanged = true;
    this.caughtInEndzone = d.x >= 100;
    this.carryStartX = d.x;
    this.events.push({ t: 'int', by: d.idx, x: d.x });
    this.flash('INTERCEPTED!', 1.6);
    for (const a of this.actors) {
      if (a.team === 'O') { a.role = 'pursue'; a.engaged = -1; a.reactT = 0.3; }
      else if (a !== d) { a.role = 'kblock'; a.engaged = -1; }
    }
  }

  private resolveKickArrival() {
    const b = this.ball;
    const s = this.setup;
    const land = { x: b.tx, y: b.ty };
    this.kickLanded = true;
    // Ball in end zone
    if (land.x >= 100 && b.kind === 'punt') {
      this.flash('TOUCHBACK', 1.2);
      this.endPlay({ type: 'touchback', spotX: 100, team: 'D', clockStops: true, desc: 'Punt into the end zone. Touchback.', kickYds: 100 - s.los });
      return;
    }
    if (land.y < 0 || land.y > FIELD_W) {
      const spot = b.kind === 'kick' ? s.los + 25 : land.x;
      this.endPlay({ type: 'oob', spotX: Math.min(spot, 99), team: 'D', clockStops: true, desc: b.kind === 'kick' ? 'Kick out of bounds.' : 'Punt out of bounds.', kickYds: land.x - s.los });
      return;
    }
    // Returner catch?
    let r: Actor | null = null;
    let rd = 1e9;
    for (const a of this.actors) {
      if (a.team !== 'D' || a.down) continue;
      const d = dist(a, land);
      if (d < rd) { rd = d; r = a; }
    }
    if (r && rd < 2.2) {
      if (this.rng.chance(0.012)) {
        this.flash('MUFFED!', 1.2);
        this.resolveLooseBall(land.x + this.rng.range(-2, 2), land.y + this.rng.range(-2, 2), 'muff', r);
        return;
      }
      b.state = 'held';
      b.holder = r.idx;
      r.role = 'carrier';
      this.receiver = r.idx;
      this.catchX = r.x;
      this.carryStartX = r.x;
      this.caughtInEndzone = r.x >= 100;
      this.events.push({ t: 'fieldedKick', by: r.idx, x: r.x });
      for (const a of this.actors) if (a.team === 'D' && a !== r) { a.role = 'kblock'; }
      for (const a of this.actors) if (a.team === 'O') { a.role = 'cover'; }
      // Fair catch on punts when coverage is close (AI), or user holding action
      if (b.kind === 'punt') {
        const cover = Math.min(...this.actors.filter((a) => a.team === 'O').map((a) => dist(a, r!)));
        const userReturner = this.setup.userTeam === 'D' && this.userIdx === r.idx;
        const wantFair = userReturner ? this.userWantsFair : cover < 5.5;
        if (wantFair) {
          this.fairCatch = true;
          this.flash('FAIR CATCH', 1);
          this.endPlay({ type: 'fair_catch', spotX: r.x, team: 'D', clockStops: true, desc: `Fair catch by ${r.p.last}.`, kickYds: r.x - s.los });
          return;
        }
      }
      // Touchback decision: deep in the end zone the AI kneels.
      if (this.caughtInEndzone) {
        const userReturner = this.setup.userTeam === 'D' && this.userIdx === r.idx;
        if (!userReturner && (r.x > 103 || this.rng.chance(0.5))) {
          this.flash('TOUCHBACK', 1);
          this.endPlay({ type: 'touchback', spotX: 100, team: 'D', clockStops: true, desc: 'Downed in the end zone. Touchback.', kickYds: 100 - s.los });
          return;
        }
      }
      return;
    }
    // Nobody there: kickoff into the end zone → touchback; else bounce & pick up
    if (land.x >= 100) {
      this.flash('TOUCHBACK', 1.2);
      this.endPlay({ type: 'touchback', spotX: 100, team: 'D', clockStops: true, desc: 'Touchback.', kickYds: 100 - s.los });
      return;
    }
    if (b.kind === 'punt') {
      // Punt rolls and is downed
      const roll = this.rng.range(2, 9);
      const spot = Math.min(land.x + roll, 99.5);
      if (spot >= 100) {
        this.endPlay({ type: 'touchback', spotX: 100, team: 'D', clockStops: true, desc: 'Punt rolls into the end zone.', kickYds: 100 - s.los });
      } else {
        this.endPlay({ type: 'downed', spotX: spot, team: 'D', clockStops: true, desc: 'Punt downed.', kickYds: spot - s.los });
      }
      return;
    }
    // Kickoff bounces – nearest receiving player scoops it
    this.resolveLooseBall(land.x + this.rng.range(0, 3), land.y, 'kick');
  }
  userWantsFair = false;

  /**
   * Loose ball (fumble, muff, onside). Recovery chosen by proximity; the ball is dead at the spot
   * except kick bounces which the receiving team returns.
   */
  resolveLooseBall(x: number, y: number, why: 'fumble' | 'muff' | 'onside' | 'kick', lostBy?: Actor) {
    const spot = { x, y: clamp(y, 0.5, FIELD_W - 0.5) };
    const cands = this.actors.filter((a) => !a.down || dist(a, spot) < 1.5);
    const weights = cands.map((a) => {
      const d = dist(a, spot);
      let w = Math.exp(-d / 1.6);
      if (why === 'onside' && a.team === 'D') w *= 2.6; // receiving team favored
      if (why === 'kick' && a.team === 'D') w *= 12;
      return w;
    });
    const rec = this.rng.weighted(cands, weights);
    if (why === 'kick') {
      this.ball.state = 'held';
      this.ball.holder = rec.idx;
      rec.role = 'carrier';
      rec.x = spot.x;
      rec.y = spot.y;
      this.receiver = rec.idx;
      this.carryStartX = rec.x;
      this.catchX = rec.x;
      if (rec.team === 'D') {
        for (const a of this.actors) if (a.team === 'D' && a !== rec) a.role = 'kblock';
        for (const a of this.actors) if (a.team === 'O') a.role = 'cover';
      }
      this.events.push({ t: 'fieldedKick', by: rec.idx, x: rec.x });
      return;
    }
    const prevTeam: TeamSide = why === 'onside' ? 'O' : lostBy ? lostBy.team : 'O';
    const changed = rec.team !== prevTeam;
    if (why === 'onside') {
      this.flash(rec.team === 'O' ? 'ONSIDE RECOVERED!' : 'RECEIVING TEAM RECOVERS', 1.5);
      this.endPlay({ type: 'recovered', spotX: spot.x, team: rec.team, clockStops: true, desc: rec.team === 'O' ? `Onside kick recovered by ${rec.p.last}!` : `Onside kick recovered by ${rec.p.last}.`, kickYds: spot.x - this.setup.los });
      return;
    }
    if (lostBy) {
      this.fumbleInfo = { forcer: this.lastTackler, lost: changed ? lostBy.idx : -1 };
      this.events.push({ t: 'fumble', carrier: lostBy.idx, forcedBy: this.lastTackler, recoveredBy: rec.idx, lost: changed });
    }
    if (changed) {
      this.possessionChanged = this.setup.kind === 'scrimmage' ? !this.possessionChanged : this.possessionChanged;
      this.flash('FUMBLE! TURNOVER!', 1.6);
    } else this.flash('FUMBLE — RECOVERED', 1.2);
    const team = rec.team;
    // End zone recoveries
    if (team === 'D' && spot.x <= 0 && this.setup.kind === 'scrimmage') {
      this.endPlay({ type: 'td', spotX: spot.x, team: 'D', scoringTeam: 'D', clockStops: true, desc: `Fumble recovered in the end zone by ${rec.p.last}. TOUCHDOWN!` });
      return;
    }
    if (team === 'O' && spot.x <= 0 && this.setup.kind === 'scrimmage') {
      this.endPlay({ type: 'safety', spotX: 0, team: 'O', scoringTeam: 'D', clockStops: true, desc: 'Fumble recovered in the end zone. SAFETY.' });
      return;
    }
    if (team === 'O' && spot.x >= 100) {
      this.endPlay({ type: 'td', spotX: 100, team: 'O', scoringTeam: 'O', clockStops: true, desc: `Fumble recovered in the end zone by ${rec.p.last}. TOUCHDOWN!` });
      return;
    }
    if (team === 'D' && spot.x >= 100) {
      this.endPlay({ type: 'touchback', spotX: 100, team: 'D', clockStops: true, desc: 'Fumble through the end zone. Touchback.' });
      return;
    }
    this.endPlay({ type: 'recovered', spotX: spot.x, team, clockStops: changed, desc: `Fumble! Recovered by ${rec.p.last}${changed ? ' — turnover!' : '.'}` });
  }

  // ------------------------------------------------------------------ tackling

  lastTackler = -1;

  private tackles(_dt: number) {
    const c = this.carrier;
    if (!c) return;
    // QB in pocket not yet a "carrier" for tackling? Still can be sacked.
    const s = this.setup;
    let contactors = 0;
    for (const d of this.actors) {
      if (d.team === c.team || d.down || d.engaged >= 0 || d.stunT > 0 || d.tackleCd > 0) continue;
      const reach = d.radius + c.radius + 0.15 + (d.diveT > 0 ? 0.55 : 0);
      if (dist(d, c) > reach) continue;
      contactors++;
      const ca = c.p.attrs;
      const da = d.p.attrs;
      const isQbSack = c.idx === this.qbIdx && !this.pastLos && !this.handedOff && s.kind === 'scrimmage';
      const elus = isQbSack ? ca.mob * 0.6 + ca.agi * 0.4 : ca.elu * 0.55 + ca.agi * 0.45;
      let p = 0.74 + (da.tkl - elus) / 170 + (da.str - (isQbSack ? ca.str : ca.pow)) / 320;
      if (isQbSack) p += 0.12;
      if (c.jukeT > 0) p -= 0.26 * (0.6 + ca.agi / 250);
      if (c.spinT > 0) p -= 0.24 * (0.6 + ca.agi / 250);
      if (c.stiffT > 0 && !isQbSack) p -= 0.2 * (0.5 + ca.str / 200);
      if (d.diveT > 0) p += 0.06;
      // Gang tackle bonus
      const helpers = this.actors.filter((x) => x.team === d.team && x !== d && isFree(x) && dist(x, c) < 1.8).length;
      p += helpers * 0.12;
      // Speed of contact: a carrier at full speed with power breaks arm tackles
      const sp = Math.hypot(c.vx, c.vy);
      if (sp > 6) p -= (ca.pow - 50) / 600;
      // Difficulty: CPU defenders vs the human carrier
      if (s.userTeam && c.idx === this.userIdx) p += (s.skill.D - 0.5) * 0.12;
      if (s.userTeam && d.idx === this.userIdx) p += 0.08;
      if (this.ball.state !== 'held') return;
      p = clamp(p, 0.18, 0.96);
      if (this.rng.chance(p)) {
        this.lastTackler = d.idx;
        // Assist credit
        const assist = this.actors.find((x) => x.team === d.team && x !== d && isFree(x) && dist(x, c) < 1.6);
        this.lastTackleAssist = assist ? assist.idx : -1;
        // Big hit?
        const relSpeed = Math.hypot(c.vx - d.vx, c.vy - d.vy);
        if (relSpeed > 9 && da.str > 60) { this.bigHit = true; this.events.push({ t: 'hit', by: d.idx }); }
        // Fumble?
        const fumP = (0.004 + (100 - (isQbSack ? 70 : ca.car)) * 0.00018 + (relSpeed > 9 ? 0.012 : 0) + (s.weather === 'rain' ? 0.008 : 0) + (isQbSack ? 0.03 : 0)) * (s.userTeam && c.idx === this.userIdx ? 0.7 : 1);
        if (this.rng.chance(fumP)) {
          c.down = true;
          this.resolveLooseBall(c.x + this.rng.range(-1, 1.5), c.y + this.rng.range(-1.5, 1.5), 'fumble', c);
          return;
        }
        this.carrierDown(c, d.idx, isQbSack ? 'sack' : 'tackle');
        return;
      } else {
        d.tackleCd = 0.9;
        d.stunT = d.diveT > 0 ? 1.0 : 0.45;
        if (d.diveT > 0) d.down = true;
        c.vx *= 0.6;
        c.vy *= 0.6;
        c.stunT = Math.max(c.stunT, 0.3 - ca.agi * 0.0015);
        this.events.push({ t: 'missed', by: d.idx });
        if (c.jukeT > 0 || c.spinT > 0 || c.stiffT > 0) this.flash(c.jukeT > 0 ? 'JUKED!' : c.spinT > 0 ? 'SPIN MOVE!' : 'STIFF ARM!', 0.7);
        else if (contactors === 1 && this.rng.chance(0.4)) this.flash('BROKEN TACKLE!', 0.7);
      }
    }
  }

  /** Ends the play with the ball carrier down at his spot. */
  carrierDown(c: Actor, by: number, how: 'tackle' | 'sack' | 'dive') {
    const s = this.setup;
    c.down = true;
    const fwd = c.team === 'O' ? 1 : -1;
    const fall = how === 'dive' ? 0 : clamp(c.vx * fwd * 0.08, -0.5, 0.8) * fwd;
    let spotX = c.x + fall;
    if (how === 'sack') {
      this.events.push({ t: 'sack', by, qb: c.idx });
      this.flash('SACKED!', 1.2);
    } else if (by >= 0) {
      this.events.push({ t: 'tackle', by, carrier: c.idx, assist: this.lastTackleAssist >= 0 ? this.lastTackleAssist : undefined });
    }
    // Scoring / end zone situations
    if (c.team === 'O') {
      if (spotX >= 100) { this.touchdown(c); return; }
      if (spotX <= 0) {
        if (s.kind === 'scrimmage' || !this.caughtInEndzone) {
          this.endPlay({ type: 'safety', spotX: 0, team: 'O', scoringTeam: 'D', clockStops: true, desc: `Tackled in the end zone. SAFETY!`, sack: how === 'sack', tacklerIdx: by });
          return;
        }
      }
    } else {
      if (spotX <= 0) { this.touchdown(c); return; }
      if (spotX >= 100) {
        if (this.caughtInEndzone || s.kind !== 'scrimmage') {
          this.endPlay({ type: 'touchback', spotX: 100, team: 'D', clockStops: true, desc: 'Downed in the end zone. Touchback.', tacklerIdx: by });
        } else {
          this.endPlay({ type: 'safety', spotX: 100, team: 'D', scoringTeam: 'O', clockStops: true, desc: 'Tackled in the end zone. SAFETY!', tacklerIdx: by });
        }
        return;
      }
    }
    spotX = clamp(spotX, 0.5, 99.5);
    const desc = how === 'sack' ? `${c.p.last} sacked by ${this.actors[by].p.last}.` : how === 'dive' ? `${c.p.last} dives forward.` : `${c.p.last} brought down by ${by >= 0 ? this.actors[by].p.last : 'the defense'}.`;
    this.endPlay({ type: 'tackle', spotX, team: c.team, clockStops: false, desc, sack: how === 'sack', tacklerIdx: by });
  }

  private touchdown(c: Actor) {
    this.events.push({ t: 'touchdown', by: c.idx });
    this.flash('TOUCHDOWN!', 2);
    this.endPlay({ type: 'td', spotX: c.team === 'O' ? 100 : 0, team: c.team, scoringTeam: c.team, clockStops: true, desc: `${c.p.first} ${c.p.last} TOUCHDOWN!` });
  }

  private checkBoundaries() {
    const c = this.carrier;
    if (!c) return;
    if (c.y < 0 || c.y > FIELD_W) {
      const s = this.setup;
      let x = clamp(c.x, -10, 110);
      if (c.team === 'O') {
        if (x >= 100) { this.touchdown(c); return; }
        if (x <= 0 && (s.kind === 'scrimmage' || !this.caughtInEndzone)) {
          this.endPlay({ type: 'safety', spotX: 0, team: 'O', scoringTeam: 'D', clockStops: true, desc: 'Out of bounds in the end zone. SAFETY!' });
          return;
        }
      } else {
        if (x <= 0) { this.touchdown(c); return; }
        if (x >= 100) { this.endPlay({ type: 'touchback', spotX: 100, team: 'D', clockStops: true, desc: 'Out of the end zone. Touchback.' }); return; }
      }
      x = clamp(x, 0.5, 99.5);
      this.endPlay({ type: 'oob', spotX: x, team: c.team, clockStops: true, desc: `${c.p.last} pushed out of bounds.` });
      return;
    }
    // Crossing the goal line on the run
    if (c.team === 'O' && c.x >= 100 && (c.idx !== this.qbIdx || this.pastLos || this.handedOff || this.setup.kind !== 'scrimmage')) {
      this.touchdown(c);
      return;
    }
    if (c.team === 'D' && c.x <= 0) {
      this.touchdown(c);
      return;
    }
    // Back of the end zone
    if (c.x > 110 || c.x < -10) {
      if (c.team === 'D' && c.x > 110) this.endPlay({ type: 'touchback', spotX: 100, team: 'D', clockStops: true, desc: 'Out the back of the end zone. Touchback.' });
      else if (c.team === 'O' && c.x < -10) this.endPlay({ type: 'safety', spotX: 0, team: 'O', scoringTeam: 'D', clockStops: true, desc: 'SAFETY!' });
    }
  }

  // ------------------------------------------------------------------ result

  endPlay(o: {
    type: OutcomeType;
    spotX: number;
    team: TeamSide;
    scoringTeam?: TeamSide;
    clockStops: boolean;
    desc: string;
    passAttempt?: boolean;
    sack?: boolean;
    kickYds?: number;
    tacklerIdx?: number;
  }) {
    if (this.done) return;
    this.done = true;
    this.ball.state = 'dead';
    const s = this.setup;
    const id = (i: number) => (i >= 0 ? this.actors[i]?.p.id : undefined);
    const c = this.carrier ?? (this.ball.holder >= 0 ? this.actors[this.ball.holder] : undefined);
    const turnover = s.kind === 'scrimmage' && o.team === 'D';
    const spot = o.spotX;
    // Yardage attribution
    let gain = 0;
    let passYds = 0;
    let rushYds = 0;
    let returnYds = 0;
    const completion = this.receiver >= 0 && s.kind === 'scrimmage' && this.passer >= 0 && this.actors[this.receiver].team === 'O';
    if (s.kind === 'scrimmage') {
      const endForOffense = turnover ? (this.fumbleInfo ? this.actors[this.fumbleInfo.lost >= 0 ? this.fumbleInfo.lost : 0]?.x ?? s.los : s.los) : spot;
      gain = (o.type === 'incomplete' || o.type === 'spike' || o.type === 'grounding') ? 0 : endForOffense - s.los;
      if (o.type === 'grounding') gain = Math.min(0, this.actors[this.passer]?.x - s.los);
      if (completion) passYds = Math.round(gain);
      else if (this.rusher >= 0 && !o.sack) rushYds = Math.round(gain);
      if (this.interceptor >= 0) returnYds = Math.round(this.catchX - Math.max(0, Math.min(100, spot)));
    } else {
      if (this.receiver >= 0 && this.actors[this.receiver].team === 'D' && o.type !== 'fair_catch') {
        returnYds = Math.round(this.catchX - Math.max(0, Math.min(100, spot)));
      }
    }
    const qb = this.actors[this.qbIdx];
    this.outcome = {
      type: o.type,
      kind: s.kind,
      spotX: spot,
      spotY: c ? clamp(c.y, 0, FIELD_W) : s.ballY,
      team: o.team,
      scoringTeam: o.scoringTeam,
      turnover,
      clockStops: o.clockStops,
      elapsed: this.t,
      los: s.los,
      passer: id(this.passer),
      target: id(this.passTarget),
      receiver: completion ? id(this.receiver) : undefined,
      rusher: !o.sack && this.rusher >= 0 ? id(this.rusher) : undefined,
      carrierAtEnd: c ? c.p.id : undefined,
      tackler: o.tacklerIdx != null && o.tacklerIdx >= 0 && !o.sack ? id(o.tacklerIdx) : undefined,
      assist: o.tacklerIdx != null && o.tacklerIdx >= 0 && !o.sack ? id(this.lastTackleAssist) : undefined,
      sacker: o.sack && o.tacklerIdx != null ? id(o.tacklerIdx) : undefined,
      interceptor: id(this.interceptor),
      fumbleForcer: this.fumbleInfo ? id(this.fumbleInfo.forcer) : undefined,
      fumbleLost: this.fumbleInfo && this.fumbleInfo.lost >= 0 ? id(this.fumbleInfo.lost) : undefined,
      kicker: id(this.kickerIdx),
      returner: s.kind !== 'scrimmage' && this.receiver >= 0 ? id(this.receiver) : this.interceptor >= 0 ? id(this.interceptor) : undefined,
      completion,
      passAttempt: !!o.passAttempt || this.passer >= 0 && o.type !== 'grounding' || completion,
      sack: !!o.sack,
      gain,
      returnYds,
      kickYds: o.kickYds ?? (s.kind !== 'scrimmage' && this.receiver >= 0 ? this.catchX - s.los : 0),
      passYds,
      airYds: this.airYds,
      rushYds,
      pd: id(this.pdBy),
      bigHit: this.bigHit,
      desc: o.desc,
      events: this.events,
    };
    if (o.type === 'spike') this.outcome.passAttempt = false;
    void qb;
  }
}

// ---------------------------------------------------------------------- coverage assignment

function assignCoverage(
  sim: PlaySim,
  call: DefCall,
  g: { dls: Actor[]; lbs: Actor[]; cbs: Actor[]; ss: Actor[]; recv: Actor[] },
) {
  const s = sim.setup;
  const los = s.los;
  const by = s.ballY;
  const deepX = (d: number) => Math.min(los + d, 108);
  const zone = (a: Actor, x: number, y: number, deep = false) => {
    a.role = 'zone';
    a.zoneSpot = { x, y: clamp(y, 3, FIELD_W - 3) };
    a.zoneDeep = deep;
    a.manTarget = undefined;
  };
  const man = (a: Actor, t: Actor | undefined) => {
    if (!t) return false;
    a.role = 'man';
    a.manTarget = t.idx;
    return true;
  };
  const rush = (a: Actor, delay = 0) => {
    a.role = 'rush';
    a.blitzDelay = delay;
    a.rushLane = a.y - by;
  };
  g.dls.forEach((d) => rush(d));
  const routeRunners = g.recv.filter((r) => r.role === 'route' || r.role === 'carry' || r.slot === 'H' || r.slot === 'F');
  const wide = g.recv.filter((r) => r.slot !== 'H' && r.slot !== 'F');
  const backs = g.recv.filter((r) => r.slot === 'H' || r.slot === 'F');
  const strongSide = wide.filter((r) => r.y > by).length >= wide.filter((r) => r.y < by).length ? 1 : -1;
  const cov = call.coverage;
  if (cov === 'Man' || cov === 'Blitz') {
    const covered = new Set<number>();
    g.cbs.forEach((c) => { if (c.manTarget != null && man(c, sim.actors[c.manTarget])) covered.add(c.manTarget); });
    const rest = [...wide.filter((r) => !covered.has(r.idx)), ...backs];
    const pool = [...g.ss.slice(cov === 'Blitz' ? 0 : 1), ...g.lbs];
    for (const r of rest) {
      // nearest defender in pool by lateral position
      let best = -1;
      let bd = 1e9;
      pool.forEach((d, i) => { const dd = Math.abs(d.y - r.y) + (d.pos === 'S' && r.pos === 'TE' ? -3 : 0); if (dd < bd) { bd = dd; best = i; } });
      if (best < 0) break;
      const d = pool.splice(best, 1)[0];
      man(d, r);
      covered.add(r.idx);
    }
    if (cov === 'Man') {
      if (g.ss[0]) zone(g.ss[0], deepX(14), CENTER_Y, true);
      // Leftover LBs: spy / hook
      pool.forEach((d) => zone(d, los + 6, by));
    } else {
      // Blitz: leftover pool rushes; if a back stays in to block, his man rushes too.
      pool.forEach((d, i) => rush(d, 0.05 * i));
      for (const d of [...g.lbs, ...g.ss]) {
        if (d.role === 'man' && d.manTarget != null) {
          const t = sim.actors[d.manTarget];
          if ((t.role === 'pblock' || t.role === 'rblock') && (t.slot === 'H' || t.slot === 'F')) rush(d, 0.25);
        }
      }
      if (g.lbs.length && !g.lbs.some((l) => l.role === 'rush')) rush(g.lbs[0], 0);
    }
    return;
  }
  // Zones
  const flatL = by - 15;
  const flatR = by + 15;
  if (cov === 'Cover 2') {
    zone(g.ss[0] ?? g.lbs[0], deepX(15), CENTER_Y - 11, true);
    if (g.ss[1]) zone(g.ss[1], deepX(15), CENTER_Y + 11, true);
    if (g.cbs[0]) zone(g.cbs[0], los + 4, Math.min(flatL, 12));
    if (g.cbs[1]) zone(g.cbs[1], los + 4, Math.max(flatR, FIELD_W - 12));
    const hooks = [by - 7, by + 7, by];
    const under = [...g.lbs, ...g.cbs.slice(2)];
    under.forEach((d, i) => zone(d, los + 7 + (i === 2 ? 2 : 0), hooks[i % 3] + (i > 2 ? (i % 2 ? 6 : -6) : 0)));
    if (!g.ss[1] && g.ss[0]) zone(g.ss[0], deepX(15), CENTER_Y, true);
  } else if (cov === 'Cover 3' || cov === 'Zone Blitz') {
    if (g.cbs[0]) zone(g.cbs[0], deepX(13), 9, true);
    if (g.cbs[1]) zone(g.cbs[1], deepX(13), FIELD_W - 9, true);
    zone(g.ss[0] ?? g.lbs[0], deepX(16), CENTER_Y, true);
    const underSpots = [
      { x: los + 5, y: strongSide > 0 ? flatR : flatL },
      { x: los + 7, y: by - 5 },
      { x: los + 7, y: by + 5 },
      { x: los + 5, y: strongSide > 0 ? flatL : flatR },
      { x: los + 8, y: by },
    ];
    const under: Actor[] = [...g.ss.slice(1), ...g.lbs, ...g.cbs.slice(2)];
    if (cov === 'Zone Blitz') {
      // One LB blitzes, the end on the other side drops into the hook.
      const blitzer = under.find((d) => d.pos === 'LB');
      if (blitzer) { under.splice(under.indexOf(blitzer), 1); rush(blitzer, 0); }
      const dropper = g.dls[g.dls.length - 1];
      if (dropper) under.push(dropper);
    }
    under.forEach((d, i) => { const sp = underSpots[i % underSpots.length]; zone(d, sp.x, sp.y); });
  } else if (cov === 'Cover 4') {
    if (g.cbs[0]) zone(g.cbs[0], deepX(12), 8, true);
    if (g.cbs[1]) zone(g.cbs[1], deepX(12), FIELD_W - 8, true);
    if (g.ss[0]) zone(g.ss[0], deepX(13), CENTER_Y - 7, true);
    if (g.ss[1]) zone(g.ss[1], deepX(13), CENTER_Y + 7, true);
    const spots = [{ x: los + 5, y: flatL }, { x: los + 7, y: by }, { x: los + 5, y: flatR }, { x: los + 7, y: by - 7 }, { x: los + 7, y: by + 7 }];
    [...g.lbs, ...g.cbs.slice(2)].forEach((d, i) => { const sp = spots[i % spots.length]; zone(d, sp.x, sp.y); });
  }
  void routeRunners;
}
