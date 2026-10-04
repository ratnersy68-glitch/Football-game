/**
 * GameSession — runs one complete football game: phases, play calling, the live PlaySim,
 * kicks, clock, quarters, overtime and the final result. Works interactively (driven by the
 * render loop) or headless (CPU vs CPU, tests) via `simulateToEnd()`.
 */
import { RNG } from './rng';
import { PlaySim, NO_INPUT, type ControlInput, type PlayOutcome, type SimSetup } from './PlaySim';
import { buildDepthChart, type DepthChart } from './Lineup';
import { OFFENSE_PLAYS, type OffPlay, type DefCall } from './Plays';
import {
  newGameState, applyScrimmage, applyKick, applyFieldGoal, applyPat, runClock, advancePeriod, other, stat,
  RUNOFF, HURRY_RUNOFF, type GameState, type Side, type RuleEvent,
} from './Rules';
import { cpuOffenseCall, cpuDefenseCall, cpuGoForTwo, cpuWantsTimeout, fgDistance, fgProbability, newTendencies, recordTendency, type Tendencies } from './Coach';
import type { Difficulty, PlayerData, TeamInfo, TimeOfDay, Weather } from './types';
import { CENTER_Y } from './math';

export interface TeamGameSetup {
  info: TeamInfo;
  roster: PlayerData[];
  depthOrder?: Partial<Record<string, string[]>>;
  /** Coaching / program bonus applied to AI skill (0..0.15). */
  coaching?: number;
  /** Cosmetic team-wide gear theme. */
  theme?: import('../gear/types').ThemeId;
}

export interface GameConfig {
  home: TeamGameSetup;
  away: TeamGameSetup;
  userSide: Side | null;
  difficulty: Difficulty;
  quarterLen: number;
  weather: Weather;
  timeOfDay: TimeOfDay;
  simDefense?: boolean;
  seed?: number;
  rivalry?: boolean;
  playoffRound?: string | null;
  championship?: boolean;
  crowd?: number; // 0..1
}

export type SessionPhase =
  | 'intro'
  | 'playcall' // user picks offense or defense (or kickoff type)
  | 'presnap'
  | 'live'
  | 'post'
  | 'pat_choice'
  | 'kick_meter'
  | 'kick_anim'
  | 'break'
  | 'final';

export interface Banner {
  text: string;
  sub?: string;
  color?: string;
  t: number;
  big?: boolean;
}

export const DIFF_SKILL: Record<Difficulty, number> = { FRESHMAN: 0.12, JV: 0.32, VARSITY: 0.52, 'ALL-STATE': 0.74, LEGEND: 0.94 };

export interface KickMeter {
  stage: 'aim' | 'power' | 'done';
  aim: number;
  power: number;
  t: number;
  speed: number;
  distance: number;
  kind: 'fg' | 'xp';
}

export interface KickAnim {
  t: number;
  dur: number;
  good: boolean;
  distance: number;
  lateral: number; // where it crosses (-1..1 relative to posts; |x|<1 between posts)
  short: boolean;
  kind: 'fg' | 'xp';
  team: Side;
}

export interface GameResult {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  ot: number;
  stats: Record<string, import('./types').StatLine>;
  totals: GameState['totals'];
  scoring: GameState['scoring'];
  qScores: GameState['qScores'];
  biggestLead: GameState['biggestLead'];
  leadChanges: number;
  lastScore?: GameState['scoring'][number];
}

export class GameSession {
  static HEADLESS_DT = 1 / 24;
  readonly cfg: GameConfig;
  readonly g: GameState;
  readonly rng: RNG;
  readonly depth: Record<Side, DepthChart>;
  phase: SessionPhase = 'intro';
  sim: PlaySim | null = null;
  banners: Banner[] = [];
  events: RuleEvent[] = [];
  phaseT = 0;
  kick: KickMeter | null = null;
  kickAnim: KickAnim | null = null;
  tend: Record<Side, Tendencies> = { home: newTendencies(), away: newTendencies() };
  /** Current calls */
  offCall: OffPlay | null = null;
  defCall: DefCall | null = null;
  hurry = false;
  userDefPick = -1;
  onsideNext = false;
  lastOutcome: PlayOutcome | null = null;
  lastDesc = '';
  breakText = '';
  soundQueue: string[] = [];
  /** Set by UI to request an action from the playcall overlay */
  private presnapWait = 0;
  headless = false;
  playCount = 0;

  constructor(cfg: GameConfig) {
    this.cfg = cfg;
    this.rng = new RNG(cfg.seed ?? Math.floor(Math.random() * 1e9));
    const openingReceiver: Side = this.rng.chance(0.5) ? 'home' : 'away';
    this.g = newGameState(cfg.home.info.id, cfg.away.info.id, cfg.quarterLen, openingReceiver);
    this.depth = {
      home: buildDepthChart(cfg.home.roster, cfg.home.depthOrder as never),
      away: buildDepthChart(cfg.away.roster, cfg.away.depthOrder as never),
    };
    for (const side of ['home', 'away'] as Side[]) {
      for (const p of side === 'home' ? cfg.home.roster : cfg.away.roster) {
        if (!p.injury || p.injury.weeks <= 0) stat(this.g, p.id)!.gp = 1;
      }
    }
  }

  team(side: Side): TeamGameSetup {
    return side === 'home' ? this.cfg.home : this.cfg.away;
  }

  get userSide(): Side | null {
    return this.cfg.userSide;
  }

  skill(side: Side): number {
    const base = this.cfg.userSide == null ? 0.55 : side === this.cfg.userSide ? 0.6 + (0.6 - DIFF_SKILL[this.cfg.difficulty]) * 0.25 : DIFF_SKILL[this.cfg.difficulty];
    return Math.max(0.05, Math.min(0.99, base + (this.team(side).coaching ?? 0)));
  }

  banner(text: string, sub?: string, t = 1.6, big = false, color?: string) {
    this.banners.push({ text, sub, t, big, color });
    if (this.banners.length > 3) this.banners.shift();
  }

  sound(s: string) {
    if (!this.headless) this.soundQueue.push(s);
  }

  /** Who is the user on the next play? 'O' | 'D' | null. */
  userRoleNext(): 'O' | 'D' | null {
    const us = this.cfg.userSide;
    if (!us) return null;
    const g = this.g;
    if (g.phase === 'kickoff') return us === other(g.possession) ? 'O' : 'D';
    return us === g.possession ? 'O' : 'D';
  }

  // ------------------------------------------------------------------ flow

  start() {
    this.phase = 'intro';
    this.phaseT = 0;
    if (this.headless) this.nextPhase();
  }

  /** Decide what happens next based on the rules state. */
  nextPhase() {
    const g = this.g;
    this.sim = null;
    this.phaseT = 0;
    if (g.gameOver || g.phase === 'final') { this.finish(); return; }
    const us = this.cfg.userSide;
    if (g.phase === 'kickoff') {
      const kicking = other(g.possession);
      if (us === kicking && !this.headless) {
        this.phase = 'playcall';
        return;
      }
      // CPU onside decision
      const lead = g.score[kicking] - g.score[g.possession];
      this.onsideNext = g.quarter >= 4 && !g.ot && lead < 0 && lead >= -16 && g.clock < 120 && this.rng.chance(0.85);
      this.setupKickoff();
      return;
    }
    if (g.phase === 'pat') {
      if (us === g.possession && !this.headless) { this.phase = 'pat_choice'; return; }
      const two = cpuGoForTwo(g, g.possession, this.skill(g.possession), this.rng);
      this.doPat(two ? 'two' : 'kick');
      return;
    }
    // Scrimmage
    if (us && !this.headless) {
      const onOffense = us === g.possession;
      if (onOffense || !this.cfg.simDefense) {
        this.phase = 'playcall';
        this.prepareCpuCalls(onOffense ? 'def' : 'off');
        return;
      }
    }
    // CPU vs CPU snap (or user defense auto-sim)
    this.cpuTimeouts();
    this.prepareCpuCalls('both');
    this.confirmCalls();
  }

  private cpuTimeouts() {
    const g = this.g;
    for (const side of ['home', 'away'] as Side[]) {
      if (side === this.cfg.userSide) continue;
      if (cpuWantsTimeout(g, side, side === g.possession, this.skill(side))) this.callTimeout(side);
    }
  }

  /** CPU picks its half of the calls. */
  prepareCpuCalls(which: 'off' | 'def' | 'both') {
    const g = this.g;
    const off = g.possession;
    const def = other(off);
    if (which === 'off' || which === 'both') {
      const c = cpuOffenseCall(g, off, this.depth[off], this.skill(off), this.rng, this.cfg.weather);
      this.offCall = c.play;
      this.hurry = c.hurry;
    }
    if (which === 'def' || which === 'both') {
      this.defCall = cpuDefenseCall(g, this.skill(def), this.rng, this.tend[off]);
      if (this.offCall && (this.offCall.kind === 'punt' || this.offCall.kind === 'fg')) this.defCall = { formation: '4-3', coverage: 'Man' };
    }
  }

  /** UI: user picks an offensive play. */
  userCallOffense(playId: string, hurry = false) {
    const p = OFFENSE_PLAYS.find((x) => x.id === playId);
    if (!p || this.phase !== 'playcall') return;
    this.offCall = p;
    this.hurry = hurry;
    this.cpuTimeouts();
    this.prepareCpuCalls('def');
    if (p.kind === 'punt' || p.kind === 'fg') this.defCall = { formation: '4-3', coverage: 'Man' };
    this.confirmCalls();
  }

  /** UI: user picks a defensive call. */
  userCallDefense(call: DefCall) {
    if (this.phase !== 'playcall') return;
    this.defCall = call;
    this.cpuTimeouts();
    this.prepareCpuCalls('off');
    this.confirmCalls();
  }

  /** UI: user kicking off. */
  userKickoff(onside: boolean) {
    if (this.phase !== 'playcall') return;
    this.onsideNext = onside;
    this.setupKickoff();
  }

  callTimeout(side: Side): boolean {
    const g = this.g;
    if (g.timeouts[side] <= 0 || g.phase === 'final') return false;
    g.timeouts[side]--;
    const hadRunoff = g.pendingRunoff > 0;
    g.pendingRunoff = 0;
    g.clockRunning = false;
    const name = this.team(side).info.shortName.toUpperCase();
    this.banner(`TIMEOUT ${name}`, `${g.timeouts[side]} LEFT${hadRunoff ? ' — CLOCK STOPPED' : ''}`, 1.4);
    this.sound('whistle');
    return true;
  }

  /** Apply the between-plays runoff; returns true if the period ended instead of snapping. */
  private applyRunoff(): boolean {
    const g = this.g;
    if (g.pendingRunoff > 0 && g.clockRunning && !g.ot) {
      const expired = runClock(g, g.pendingRunoff);
      g.pendingRunoff = 0;
      if (expired) {
        this.endOfPeriod();
        return true;
      }
    }
    g.pendingRunoff = 0;
    return false;
  }

  private confirmCalls() {
    const g = this.g;
    const off = this.offCall!;
    if (this.applyRunoff()) return;
    recordTendency(this.tend[g.possession], off.cat);
    if (off.kind === 'fg') {
      this.startFieldGoal('fg');
      return;
    }
    const kind = off.kind === 'punt' ? 'punt' : 'scrimmage';
    const offSide = g.possession;
    const defSide = other(offSide);
    const userRole = this.cfg.userSide == null ? null : this.cfg.userSide === offSide ? 'O' : (this.cfg.simDefense ? null : 'D');
    const setup: SimSetup = {
      kind,
      los: g.ballOn,
      ballY: g.ballY,
      offPlay: off,
      flip: this.rng.chance(0.5) && !off.rollout,
      defCall: this.defCall ?? { formation: '4-3', coverage: 'Cover 3' },
      offDepth: this.depth[offSide],
      defDepth: this.depth[defSide],
      userTeam: this.headless ? null : (userRole as 'O' | 'D' | null),
      skill: { O: this.skill(offSide), D: this.skill(defSide) },
      weather: this.cfg.weather,
      seed: this.rng.int(0, 1e9),
      firstDownX: g.ballOn + g.toGo,
      userDefPick: this.userDefPick,
      down: g.down,
      toGo: g.toGo,
      userBoost: this.cfg.difficulty === 'FRESHMAN' ? 0.8 : this.cfg.difficulty === 'JV' ? 0.4 : 0,
    };
    if (setup.flip && off.kind === 'pass') setup.flip = this.rng.chance(0.5);
    this.sim = new PlaySim(setup);
    this.phase = 'presnap';
    this.phaseT = 0;
    this.presnapWait = userRole === 'O' ? 999 : userRole === 'D' ? 2.2 + this.rng.range(0, 0.6) : 0.9 + this.rng.range(0, 0.4);
  }

  private setupKickoff() {
    const g = this.g;
    const kicking = other(g.possession);
    const userRole = this.cfg.userSide == null ? null : this.cfg.userSide === kicking ? 'O' : 'D';
    const setup: SimSetup = {
      kind: 'kickoff',
      los: g.kickFrom,
      ballY: CENTER_Y,
      offDepth: this.depth[kicking],
      defDepth: this.depth[g.possession],
      userTeam: this.headless ? null : (userRole as 'O' | 'D' | null),
      skill: { O: this.skill(kicking), D: this.skill(g.possession) },
      weather: this.cfg.weather,
      seed: this.rng.int(0, 1e9),
      onside: this.onsideNext,
    };
    this.onsideNext = false;
    this.sim = new PlaySim(setup);
    this.phase = 'presnap';
    this.phaseT = 0;
    this.presnapWait = 1.1;
  }

  /** UI: snap the ball. */
  snap() {
    if (this.phase !== 'presnap' || !this.sim) return;
    this.sim.snap();
    this.phase = 'live';
    this.phaseT = 0;
    this.sound(this.sim.setup.kind === 'kickoff' ? 'kick' : 'hike');
  }

  // ------------------------------------------------------------------ kicking (FG / PAT)

  startFieldGoal(kind: 'fg' | 'xp') {
    const g = this.g;
    const distance = kind === 'xp' ? 20 : fgDistance(g.ballOn);
    const kicker = this.depth[g.possession].K[0];
    if (this.cfg.userSide === g.possession && !this.headless) {
      const kacc = kicker?.attrs.kacc ?? 50;
      this.kick = { stage: 'aim', aim: 0, power: 0, t: 0, speed: 2.2 + (100 - kacc) * 0.03, distance, kind };
      this.phase = 'kick_meter';
      return;
    }
    const p = fgProbability(distance, this.depth[g.possession], this.cfg.weather);
    const good = this.rng.chance(p);
    const short = !good && distance > 40 && this.rng.chance(0.5);
    this.startKickAnim(kind, good, distance, good ? this.rng.range(-0.7, 0.7) : (this.rng.chance(0.5) ? -1 : 1) * this.rng.range(1.1, 1.8), short);
  }

  /** UI: press during the kick meter. */
  kickPress() {
    const k = this.kick;
    if (!k || this.phase !== 'kick_meter') return;
    if (k.stage === 'aim') {
      k.stage = 'power';
      k.t = 0;
      return;
    }
    if (k.stage === 'power') {
      k.stage = 'done';
      const g = this.g;
      const kicker = this.depth[g.possession].K[0];
      const kpow = kicker?.attrs.kpow ?? 50;
      const kacc = kicker?.attrs.kacc ?? 50;
      const range = 32 + kpow * 0.3;
      const carry = k.power * range + 4;
      const wind = this.cfg.weather === 'wind' ? this.rng.range(-0.25, 0.25) : 0;
      const lateral = (k.aim * 1.25 + wind) * (0.6 + k.distance / 60) / (0.18 + kacc * 0.0016) * 0.18;
      const good = Math.abs(lateral) < 1 && carry >= k.distance;
      this.startKickAnim(k.kind, good, k.distance, lateral, carry < k.distance);
    }
  }

  private startKickAnim(kind: 'fg' | 'xp', good: boolean, distance: number, lateral: number, short: boolean) {
    this.kickAnim = { t: 0, dur: 1.5, good, distance, lateral, short, kind, team: this.g.possession };
    this.phase = 'kick_anim';
    this.phaseT = 0;
    this.sound('kick');
  }

  private finishKick() {
    const ka = this.kickAnim!;
    const g = this.g;
    const kicker = this.depth[g.possession].K[0];
    const team = this.team(g.possession).info.shortName.toUpperCase();
    let ev: RuleEvent[];
    if (ka.kind === 'xp') {
      ev = applyPat(g, 'kick', ka.good, kicker?.id);
      this.banner(ka.good ? 'EXTRA POINT GOOD' : 'NO GOOD!', team, 1.4);
    } else {
      ev = applyFieldGoal(g, ka.good, ka.distance, kicker?.id);
      if (!g.ot) runClock(g, 4);
      this.banner(ka.good ? 'FIELD GOAL IS GOOD!' : 'NO GOOD!', `${ka.distance} YARDS`, 2, ka.good);
      this.lastDesc = `${kicker ? kicker.last : 'Kicker'} ${ka.good ? 'connects on' : 'misses'} a ${ka.distance}-yard field goal.`;
      this.log(this.lastDesc);
    }
    this.sound(ka.good ? 'cheer' : 'groan');
    this.kickAnim = null;
    this.kick = null;
    this.phase = 'post';
    this.phaseT = 0;
    this.handleEvents(ev);
    this.afterPlayClock();
  }

  /** UI: PAT choice. */
  userPat(kind: 'kick' | 'two') {
    if (this.phase !== 'pat_choice') return;
    this.doPat(kind);
  }

  private doPat(kind: 'kick' | 'two') {
    const g = this.g;
    if (kind === 'kick') {
      this.startFieldGoal('xp');
      return;
    }
    // Two-point try: a real play from the 3
    g.ballOn = 97;
    g.down = 1;
    g.toGo = 3;
    if (this.cfg.userSide && !this.headless && (this.cfg.userSide === g.possession || !this.cfg.simDefense)) {
      this.phase = 'playcall';
      this.prepareCpuCalls(this.cfg.userSide === g.possession ? 'def' : 'off');
      return;
    }
    this.prepareCpuCalls('both');
    if (this.offCall && (this.offCall.kind === 'punt' || this.offCall.kind === 'fg' || this.offCall.kind === 'kneel' || this.offCall.kind === 'spike')) {
      this.offCall = OFFENSE_PLAYS.find((p) => p.id === 'slants')!;
    }
    this.confirmCalls();
  }

  isTwoPointTry(): boolean {
    return this.g.phase === 'pat';
  }

  // ------------------------------------------------------------------ update loop

  update(dt: number, input: ControlInput = NO_INPUT) {
    this.phaseT += dt;
    for (const b of this.banners) b.t -= dt;
    this.banners = this.banners.filter((b) => b.t > 0);
    switch (this.phase) {
      case 'intro':
        if (this.phaseT > (this.headless ? 0 : 0.5)) this.nextPhase();
        break;
      case 'presnap':
        if (this.sim && this.phaseT > this.presnapWait) this.snap();
        break;
      case 'live': {
        const sim = this.sim!;
        sim.step(dt, input);
        if (sim.setup.kind !== 'scrimmage' || true) {
          // Live clock (real time)
          const g = this.g;
          if (!g.ot && g.phase !== 'pat') {
            g.clock = Math.max(0, g.clock - dt);
            g.totals[g.possession].top += dt;
          }
        }
        if (sim.done && sim.outcome) {
          this.phase = 'post';
          this.phaseT = 0;
          this.onPlayEnd(sim.outcome);
        }
        break;
      }
      case 'post':
        if (this.phaseT > (this.headless ? 0 : 1.5)) this.nextPhase();
        break;
      case 'kick_meter': {
        const k = this.kick!;
        k.t += dt;
        if (k.stage === 'aim') k.aim = Math.sin(k.t * k.speed);
        else if (k.stage === 'power') k.power = Math.abs(Math.sin(k.t * 2.2));
        break;
      }
      case 'kick_anim': {
        const ka = this.kickAnim!;
        ka.t += dt;
        if (ka.t >= (this.headless ? 0 : ka.dur + 0.6)) this.finishKick();
        break;
      }
      case 'break':
        if (this.phaseT > (this.headless ? 0 : 2.6)) this.nextPhase();
        break;
      default:
        break;
    }
  }

  /** Skip presentation pauses (UI "continue" key). */
  skip() {
    if (this.phase === 'post' && this.phaseT > 0.35) this.nextPhase();
    else if (this.phase === 'break' && this.phaseT > 0.5) this.nextPhase();
    else if (this.phase === 'intro') this.nextPhase();
    else if (this.phase === 'kick_anim' && this.kickAnim && this.kickAnim.t > this.kickAnim.dur) this.finishKick();
  }

  private log(desc: string) {
    const g = this.g;
    g.log.push({ q: g.quarter, clock: g.clock, team: g.possession, down: g.down, toGo: g.toGo, ballOn: g.ballOn, desc });
    if (g.log.length > 400) g.log.shift();
  }

  private onPlayEnd(o: PlayOutcome) {
    const g = this.g;
    this.lastOutcome = o;
    this.playCount++;
    const sim = this.sim!;
    let ev: RuleEvent[];
    const wasPat = g.phase === 'pat';
    const offSide = sim.setup.kind === 'kickoff' ? other(g.possession) : g.possession;
    this.log(o.desc);
    this.lastDesc = o.desc;
    if (wasPat) {
      // Two-point conversion result
      const good = o.type === 'td' && o.scoringTeam === 'O';
      const defScore = o.type === 'td' && o.scoringTeam === 'D';
      ev = applyPat(g, 'two', good, undefined, defScore);
      if (good) creditTwoPoint(g, o);
    } else if (sim.setup.kind === 'kickoff' || sim.setup.kind === 'punt') {
      ev = applyKick(g, o, offSide);
    } else {
      ev = applyScrimmage(g, o, { off: offSide });
    }
    // Clock bookkeeping
    if (!wasPat) {
      if (g.clockRunning && !g.ot) g.pendingRunoff = this.hurry ? HURRY_RUNOFF : RUNOFF;
      else g.pendingRunoff = 0;
    }
    // Sounds
    if (o.type === 'td') this.sound('touchdown');
    else if (o.type === 'incomplete') this.sound('whistle');
    else if (o.bigHit) this.sound('bighit');
    else if (o.type === 'tackle') this.sound('tackle');
    if (o.completion) this.sound('catch');
    this.handleEvents(ev);
    this.afterPlayClock();
  }

  private handleEvents(ev: RuleEvent[]) {
    const g = this.g;
    for (const e of ev) {
      const teamName = e.team ? this.team(e.team).info.shortName.toUpperCase() : undefined;
      switch (e.type) {
        case 'touchdown':
        case 'kick_return_td':
          this.banner('TOUCHDOWN!', teamName, 2.6, true, e.team ? this.team(e.team).info.colors.primary : undefined);
          break;
        case 'safety':
          this.banner('SAFETY!', teamName, 2.2, true);
          break;
        case 'first_down':
          this.banner('FIRST DOWN', undefined, 1.1);
          this.sound('chains');
          break;
        case 'turnover':
          this.banner(e.text, teamName, 2, true);
          this.sound('groan');
          break;
        case 'turnover_downs':
          this.banner('TURNOVER ON DOWNS', teamName, 1.8);
          break;
        case 'two_pt':
          this.banner('2-POINT GOOD!', teamName, 1.8);
          break;
        case 'two_pt_fail':
          this.banner('NO GOOD', 'CONVERSION FAILS', 1.5);
          break;
        case 'touchback':
          this.banner('TOUCHBACK', undefined, 1.0);
          break;
        case 'sack':
          this.banner('SACK!', teamName, 1.2);
          break;
        case 'big_play':
          this.banner(e.text, undefined, 1.2);
          break;
        case 'onside':
          this.banner('ONSIDE RECOVERY!', teamName, 2);
          break;
        case 'overtime':
          this.breakText = e.text;
          this.banner(e.text, 'BALL ON THE 10', 2.4, true);
          break;
        case 'final':
          break;
        default:
          break;
      }
      this.events.push(e);
    }
    void g;
  }

  /** After a play: if the clock has expired, end the period (after any try). */
  private afterPlayClock() {
    const g = this.g;
    if (g.gameOver) return;
    if (g.phase === 'pat') return; // the try happens with 0:00
    if (!g.ot && g.clock <= 0 && g.quarter <= 4) this.endOfPeriod();
  }

  private endOfPeriod() {
    const g = this.g;
    const ev = advancePeriod(g);
    for (const e of ev) {
      if (e.type === 'halftime') { this.breakText = 'HALFTIME'; this.banner('HALFTIME', `${this.scoreLine()}`, 3, true); }
      else if (e.type === 'end_quarter') { this.breakText = e.text; this.banner(e.text, this.scoreLine(), 2.2); }
      else if (e.type === 'overtime') { this.breakText = e.text; this.banner('OVERTIME!', 'BALL ON THE 10', 2.6, true); }
      else if (e.type === 'final') this.breakText = 'FINAL';
      this.events.push(e);
    }
    this.sound('horn');
    if (g.gameOver) { this.finish(); return; }
    this.phase = 'break';
    this.phaseT = 0;
    this.sim = null;
  }

  private scoreLine() {
    return `${this.cfg.away.info.abbreviation} ${this.g.score.away} — ${this.cfg.home.info.abbreviation} ${this.g.score.home}`;
  }

  private finished = false;
  private finish() {
    if (this.finished) return;
    this.finished = true;
    this.phase = 'final';
    this.g.phase = 'final';
    this.g.gameOver = true;
    this.sim = null;
    this.sound('horn');
  }

  get isOver() {
    return this.phase === 'final';
  }

  result(): GameResult {
    const g = this.g;
    return {
      home: g.home,
      away: g.away,
      homeScore: g.score.home,
      awayScore: g.score.away,
      ot: g.ot ? g.ot.period : 0,
      stats: g.stats,
      totals: g.totals,
      scoring: g.scoring,
      qScores: g.qScores,
      biggestLead: g.biggestLead,
      leadChanges: g.leadChanges,
      lastScore: g.scoring[g.scoring.length - 1],
    };
  }

  /** Headless: play the whole game with AI on both sides. */
  simulateToEnd(maxSteps = 400000): GameResult {
    this.headless = true;
    if (this.phase === 'intro') this.nextPhase();
    const dt = GameSession.HEADLESS_DT;
    let steps = 0;
    while (!this.isOver && steps < maxSteps) {
      this.update(dt);
      steps++;
      // Headless: auto-handle states that wait for user input
      if (this.phase === 'playcall' || this.phase === 'pat_choice' || this.phase === 'kick_meter') this.nextPhase();
    }
    if (!this.isOver) {
      // Never let a broken state prevent a game from finishing.
      this.g.gameOver = true;
      this.finish();
    }
    return this.result();
  }
}

function creditTwoPoint(_g: GameState, _o: PlayOutcome) {
  // Two-point conversions are not counted toward passing/rushing totals in this game's stat sheet.
}
