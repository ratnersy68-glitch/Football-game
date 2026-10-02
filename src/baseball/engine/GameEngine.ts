/**
 * GameEngine: the game's state machine.
 *
 *   atbat_intro → prepitch → windup → pitch ─┬─ (no contact) → postpitch → prepitch / next batter
 *                                            └─ (contact)    → live → postplay → next batter
 *   ... → half_end → atbat_intro ... → final
 *
 * The engine is headless (no DOM / Three.js). The renderer reads `snapshot()`, the UI reads
 * public fields + the event queue, and input arrives through `update(dt, input)`.
 */
import type { FieldPos, GameSettings, PitchCode, Player, UserPrefs } from '../core/types';
import { MPH, Rng, clamp, type V3 } from '../core/math';
import { STADIUM_BY_ID } from '../data/stadiums';
import { PITCHES } from '../data/pitchTypes';
import { playerById } from '../managers/TeamManager';
import { battedBall, makeEnv, stepBall, type BallEnv, type BallState } from './BallPhysics';
import { battingSide, resolveSwing, SWING_LAG, type ContactResult, type SwingInput, type SwingMods, type SwingType } from './BattingEngine';
import { CATCHER_Z, ZONE_CENTER_Y, createPitch, pitchPos, timeAtZ, type PitchCommand, type PitchFlight } from './PitchEngine';
import { pathPos, defaultPositions, FIELD_POSITIONS } from './Field';
import { LivePlay, DIFF_INDEX, type AnimName, type PlayOutcome } from './LivePlay';
import type { DefenseInput } from './FieldingEngine';
import { commandRunners } from './BaseRunningEngine';
import { RulesEngine, type PitchCall } from './RulesEngine';
import { StatsManager } from './StatsManager';
import { createGameState, battingTeam, currentBatter, currentPitcher, defenseOf, defensePenalties, fatigue, fieldingTeam, type GameState, type TeamGameState } from './GameState';
import { choosePitch, managePitching, planSwing, stealDecision, type AISwingPlan, type PitchHistory } from '../ai/AIController';
import { simulatePA } from './QuickSim';

export type Phase = 'atbat_intro' | 'prepitch' | 'windup' | 'pitch' | 'postpitch' | 'live' | 'postplay' | 'half_end' | 'final';

export interface EngineEvent { type: string; text?: string; sub?: string; data?: Record<string, unknown> }

export interface FrameInput {
  pci: { x: number; y: number };
  aim: { x: number; y: number };
  swing: SwingType | null;
  pitchSelect: PitchCode | null;
  meterPress: boolean;
  defense: DefenseInput;
  runnerCmd: { dir: 1 | -1; sel: number | null } | null;
  skip: boolean;
}

export const emptyInput = (): FrameInput => ({
  pci: { x: 0, y: ZONE_CENTER_Y }, aim: { x: 0, y: ZONE_CENTER_Y }, swing: null, pitchSelect: null, meterPress: false,
  defense: { move: { x: 0, z: 0 }, sprint: false, dive: false, throwTo: null, throwMeter: 0 }, runnerCmd: null, skip: false,
});

export interface Actor {
  id: string;
  side: 'home' | 'away' | 'ump';
  kind: 'fielder' | 'runner' | 'batter' | 'umpire';
  pos?: FieldPos;
  x: number; z: number; y: number;
  facing: number;
  anim: AnimName;
  animT: number;
  speed: number;
  number: number;
  bats: 'L' | 'R';
  throws: 'L' | 'R';
  hasBall: boolean;
  controlled: boolean;
  selected?: boolean;
}

export interface Snapshot {
  t: number;
  actors: Actor[];
  ball: { x: number; y: number; z: number; visible: boolean; trail: boolean; color: string; speed: number };
  landing: { x: number; z: number; r: number } | null;
}

export interface UserPitchState {
  stage: 'select' | 'aim' | 'meter' | 'locked';
  code: PitchCode;
  target: { x: number; y: number };
  meter: number;
  locked: number | null;
  zoneCenter: number;
  zoneHalf: number;
}

const BAT_TIMING = [1.55, 1.32, 1.15, 1.0, 0.9, 0.82];
const BAT_PCI = [1.42, 1.26, 1.12, 1.0, 0.92, 0.85];
const PITCH_SCALE = [0.78, 0.84, 0.9, 0.95, 1, 1];
const WINDUP = 1.15;

export class GameEngine {
  settings: GameSettings;
  prefs: UserPrefs;
  rng: Rng;
  state: GameState;
  stats = new StatsManager();
  rules: RulesEngine;
  env: BallEnv;
  phase: Phase = 'atbat_intro';
  phaseT = 0;
  clock = 0;
  events: EngineEvent[] = [];

  // pitch
  flight: PitchFlight | null = null;
  pitchCmd: PitchCommand | null = null;
  pitchT = 0;
  pitchDone = false;
  swing: SwingInput | null = null;
  swingResolved = false;
  contact: ContactResult | null = null;
  aiPlan: AISwingPlan | null = null;
  lastCall: string = '';
  history: { home: PitchHistory; away: PitchHistory } = { home: { codes: [] }, away: { codes: [] } };
  userPitch: UserPitchState = { stage: 'select', code: 'FF', target: { x: 0, y: ZONE_CENTER_Y }, meter: 0, locked: null, zoneCenter: 0.85, zoneHalf: 0.05 };
  pci = { x: 0, y: ZONE_CENTER_Y };
  stealers = new Map<number, number>(); // base index (0..2) -> path distance
  stealCommitted = false;
  cpuThink = 0;
  paEnded = false;

  // live play
  play: LivePlay | null = null;
  lastOutcome: PlayOutcome | null = null;
  lastPlayNotable: string[] = [];
  postplayDur = 1.6;
  runnerSel: number | null = null;
  hrInfo: { name: string; ev: number; la: number; dist: number } | null = null;
  landingOffset = { x: 0, z: 0 };
  tiredWarned = new Set<string>();

  constructor(settings: GameSettings, prefs: UserPrefs, seed?: number) {
    this.settings = settings;
    this.prefs = prefs;
    this.rng = new Rng(seed);
    this.state = createGameState(settings);
    this.rules = new RulesEngine(this.state, this.stats);
    this.env = makeEnv(STADIUM_BY_ID[settings.stadiumId], settings.conditions);
    this.startAtBat();
  }

  get stadium() { return STADIUM_BY_ID[this.settings.stadiumId]; }
  get diffIndex() { return DIFF_INDEX[this.settings.difficulty]; }
  userSideBatting(): boolean { return this.settings.userSide !== 'none' && battingTeam(this.state).side === this.settings.userSide; }
  userSidePitching(): boolean { return this.settings.userSide !== 'none' && fieldingTeam(this.state).side === this.settings.userSide; }

  emit(type: string, text?: string, sub?: string, data?: Record<string, unknown>) {
    this.events.push({ type, text, sub, data });
  }

  drainEvents(): EngineEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  setPhase(p: Phase) {
    this.phase = p;
    this.phaseT = 0;
  }

  timeScale(): number {
    if ((this.phase === 'windup' || this.phase === 'pitch') && this.userSideBatting()) {
      if (this.prefs.pitchSpeed === 'real') return 1;
      if (this.prefs.pitchSpeed === 'slow') return 0.72;
      return PITCH_SCALE[this.diffIndex];
    }
    return 1;
  }

  // ------------------------------------------------------------------ flow

  private startAtBat() {
    const s = this.state;
    this.setPhase('atbat_intro');
    this.flight = null;
    this.contact = null;
    this.swing = null;
    this.play = null;
    this.stealers.clear();
    // CPU manager: pitching change?
    const ft = fieldingTeam(s);
    const cpuDefense = this.settings.userSide === 'none' || ft.side !== this.settings.userSide;
    if (cpuDefense) {
      const rp = managePitching(s, ft);
      if (rp) this.changePitcher(ft, rp);
    } else {
      const f = fatigue(ft);
      if (f > 0.85 && !this.tiredWarned.has(ft.pitcher.id)) {
        this.tiredWarned.add(ft.pitcher.id);
        this.emit('toast', `${ft.pitcher.name} is tiring`, `${ft.pitchCounts.get(ft.pitcher.id)} pitches — ESC › Bullpen to make a change`);
      }
    }
    const b = currentBatter(s);
    this.stats.addBatter(battingTeam(s).side, b.id);
    this.emit('batterUp', b.name, undefined, { id: b.id });
  }

  changePitcher(t: TeamGameState, p: Player) {
    const old = t.pitcher;
    this.rules.changePitcher(t, p);
    this.emit('pitchingChange', p.name, `replaces ${old.name}`, { id: p.id });
  }

  private startPrepitch() {
    this.setPhase('prepitch');
    this.contact = null;
    this.swing = null;
    this.swingResolved = false;
    this.flight = null;
    this.pitchDone = false;
    this.stealCommitted = false;
    this.stealers.clear();
    this.cpuThink = 0.55 + this.rng.range(0, 0.6);
    const p = currentPitcher(this.state);
    const pr = p.pitcher!;
    const keep = pr.pitches.includes(this.userPitch.code) ? this.userPitch.code : pr.pitches[0];
    this.userPitch = { stage: 'select', code: keep, target: { ...this.userPitch.target }, meter: 0, locked: null, zoneCenter: 0.86, zoneHalf: 0.022 + pr.control * 0.00055 };
    // CPU offense may send a runner.
    if (!this.userSideBatting() || this.settings.userSide === 'none') {
      const base = stealDecision(this.state, this.settings.difficulty, this.rng);
      if (base >= 0) this.stealers.set(base, (base + 1) * 90);
    }
  }

  private beginWindup(cmd: PitchCommand) {
    this.pitchCmd = cmd;
    this.setPhase('windup');
    this.emit('windup');
  }

  private releasePitch() {
    const s = this.state;
    const pitcher = currentPitcher(s);
    const batter = currentBatter(s);
    const ft = fieldingTeam(s);
    const side = battingSide(batter, pitcher);
    this.flight = createPitch(pitcher, side, this.pitchCmd!, fatigue(ft), this.rng);
    this.pitchT = 0;
    this.setPhase('pitch');
    this.history[ft.side].codes.push(this.flight.code);
    this.emit('pitchRelease', undefined, undefined, { mph: this.flight.mph, code: this.flight.code });
    if (!this.userSideBatting()) {
      this.aiPlan = planSwing(s, batter, pitcher, this.flight, this.settings.difficulty, this.rng, this.history[ft.side]);
    } else this.aiPlan = null;
  }

  swingMods(): SwingMods {
    if (this.userSideBatting()) return { timing: BAT_TIMING[this.diffIndex], pci: BAT_PCI[this.diffIndex] };
    return { timing: 1, pci: 1 };
  }

  // ------------------------------------------------------------------ update

  update(realDt: number, input: FrameInput) {
    if (this.state.over && this.phase === 'final') return;
    const dt = Math.min(0.05, realDt) * this.timeScale();
    this.clock += dt;
    this.phaseT += dt;
    this.pci = { x: clamp(input.pci.x, -2.2, 2.2), y: clamp(input.pci.y, 0.6, 4.6) };
    if (input.runnerCmd && this.userSideBatting() && input.runnerCmd.sel !== undefined) this.runnerSel = input.runnerCmd.sel;
    switch (this.phase) {
      case 'atbat_intro':
        if (this.phaseT > 1.5 || (input.skip && this.phaseT > 0.25)) this.startPrepitch();
        break;
      case 'prepitch':
        this.updatePrepitch(dt, input);
        break;
      case 'windup':
        this.updateStealers(dt, this.phaseT > WINDUP - 0.45);
        if (this.userSideBatting() && input.runnerCmd && input.runnerCmd.dir > 0) this.userSteal(input.runnerCmd.sel);
        if (this.phaseT >= WINDUP) this.releasePitch();
        break;
      case 'pitch':
        this.updatePitch(dt, input);
        break;
      case 'postpitch':
        if (this.phaseT > 0.75 || (input.skip && this.phaseT > 0.2)) this.afterPostpitch();
        break;
      case 'live':
        this.updateLive(dt, input);
        break;
      case 'postplay':
        if (this.phaseT > this.postplayDur || (input.skip && this.phaseT > 0.35)) this.afterPlay();
        break;
      case 'half_end':
        if (this.phaseT > 2.6 || (input.skip && this.phaseT > 0.4)) this.startAtBat();
        break;
      case 'final':
        break;
    }
  }

  private updatePrepitch(dt: number, input: FrameInput) {
    if (this.userSideBatting() && input.runnerCmd && input.runnerCmd.dir > 0) this.userSteal(input.runnerCmd.sel);
    if (this.userSidePitching()) {
      const up = this.userPitch;
      const pr = currentPitcher(this.state).pitcher!;
      if (input.pitchSelect && pr.pitches.includes(input.pitchSelect)) {
        up.code = input.pitchSelect;
        if (up.stage === 'select') up.stage = 'aim';
        this.emit('pitchSelected', PITCHES[up.code].name);
      }
      if (up.stage === 'aim' || up.stage === 'select') {
        up.target = { x: clamp(input.aim.x, -2, 2), y: clamp(input.aim.y, 0.5, 4.6) };
        if (input.meterPress) {
          if (up.stage === 'select') up.stage = 'aim';
          up.stage = 'meter';
          up.meter = 0;
          this.emit('meterStart');
        }
      } else if (up.stage === 'meter') {
        up.meter += dt / 1.05;
        if (input.meterPress || up.meter >= 1.15) {
          up.locked = Math.min(up.meter, 1.15);
          up.stage = 'locked';
          const off = up.locked - up.zoneCenter;
          const err = Math.abs(off) <= up.zoneHalf ? 0 : Math.sign(off) * Math.min(1.2, (Math.abs(off) - up.zoneHalf) / 0.28);
          const grade = err === 0 ? 'PERFECT' : Math.abs(err) < 0.25 ? 'GOOD' : Math.abs(err) < 0.6 ? (err < 0 ? 'EARLY' : 'LATE') : err < 0 ? 'VERY EARLY' : 'VERY LATE';
          this.emit('meterResult', grade);
          this.beginWindup({ code: up.code, target: up.target, meterError: err });
        }
      }
      return;
    }
    // CPU pitcher (user batting, or CPU vs CPU)
    this.cpuThink -= dt;
    if (this.cpuThink <= 0) {
      const s = this.state;
      const cmd = choosePitch(s, currentPitcher(s), currentBatter(s), this.settings.difficulty, this.rng, this.history[fieldingTeam(s).side]);
      this.beginWindup(cmd);
    }
  }

  private userSteal(sel: number | null) {
    const s = this.state;
    const bases = sel !== null && sel >= 1 && sel <= 3 ? [sel - 1] : [0, 1, 2];
    for (const b of bases) {
      if (!s.bases[b]) continue;
      if (b < 2 && s.bases[b + 1] && !this.stealers.has(b + 1) && !bases.includes(b + 1)) continue;
      if (!this.stealers.has(b)) {
        this.stealers.set(b, (b + 1) * 90);
        this.emit('toast', `${s.bases[b]!.player.name} is running!`);
      }
    }
  }

  private updateStealers(dt: number, running: boolean) {
    if (!running) return;
    for (const [b, p] of this.stealers) {
      const occ = this.state.bases[b];
      if (!occ) continue;
      const speed = 21.5 + occ.player.ratings.speed * 0.062;
      const start = (b + 1) * 90;
      const jump = (occ.player.ratings.stealing / 100) * 0.9;
      const np = Math.min(start + 89, Math.max(p, start + 8 * jump) + speed * dt * Math.min(1, (p - start + 5) / 15));
      this.stealers.set(b, np);
    }
  }

  private updatePitch(dt: number, input: FrameInput) {
    const f = this.flight!;
    this.pitchT += dt;
    this.updateStealers(dt, true);
    const s = this.state;
    const batter = currentBatter(s);
    const pitcher = currentPitcher(s);
    // Swing input
    if (!this.swing) {
      if (this.userSideBatting() && input.swing && this.pitchT < f.T + 0.05) {
        this.swing = { type: input.swing, pci: { ...this.pci }, pressTime: this.pitchT };
        this.emit('swing', input.swing);
      } else if (this.aiPlan?.swing && this.pitchT >= this.aiPlan.swing.pressTime) {
        this.swing = this.aiPlan.swing;
        this.emit('swing', this.swing.type);
      }
    }
    // Resolve contact when the bat arrives.
    if (this.swing && !this.swingResolved && this.pitchT >= this.swing.pressTime + SWING_LAG) {
      this.swingResolved = true;
      const res = resolveSwing(batter, pitcher, f, this.swing, this.swingMods(), this.rng);
      this.contact = res;
      this.emit('contactResult', res.label, res.timing, { ev: res.ev, la: res.la, quality: res.quality, contact: res.contact });
      if (res.contact) {
        this.startBattedPlay(res);
        return;
      }
    }
    // Pitch reaches the catcher.
    const tCatch = timeAtZ(f, CATCHER_Z);
    if (this.pitchT >= tCatch && !this.pitchDone) {
      this.pitchDone = true;
      this.resolveTakenPitch();
    }
  }

  private resolveTakenPitch() {
    const f = this.flight!;
    const s = this.state;
    const swung = !!this.swing;
    let call: PitchCall;
    if (!swung && f.hitsBatter) call = 'hbp';
    else if (swung) call = 'swinging_strike';
    else call = f.isStrike ? 'called_strike' : 'ball';
    this.rules.countPitch(call !== 'ball' && call !== 'hbp');
    this.lastCall = { ball: 'BALL', called_strike: 'STRIKE', swinging_strike: 'STRIKE', foul: 'FOUL', hbp: 'HIT BY PITCH' }[call];
    const ev = this.rules.applyPitch(call);
    this.paEnded = ev !== null;
    this.emit('call', this.lastCall, `${s.balls}-${s.strikes}`, { call, ev });
    if (ev === 'strikeout') this.emit('strikeout', currentPitcherName(s), undefined, { risp: !!(s.bases[1] || s.bases[2]) || s.outs >= 3 });
    if (ev === 'walk') this.emit('walk');

    // Wild pitch / passed ball or a steal attempt makes the ball live.
    const runnersOn = s.bases.some(Boolean);
    const catcher = defenseOf(fieldingTeam(s)).C;
    const dropChance = f.wild ? 0.28 + (100 - catcher.ratings.fielding) / 260 : 0.003;
    const wild = runnersOn && ev !== 'walk' && ev !== 'hbp' && s.outs < 3 && this.rng.chance(dropChance) && call !== 'hbp';
    const steal = this.stealers.size > 0 && ev !== 'walk' && ev !== 'hbp' && s.outs < 3;
    if (wild || steal) {
      this.startNonBattedPlay(wild ? 'wild' : 'catcher');
      return;
    }
    this.stealers.clear();
    this.setPhase('postpitch');
  }

  private afterPostpitch() {
    const r = this.rules.checkProgress();
    if (r === 'final') return this.finishGame();
    if (r === 'half') return this.endHalf();
    if (this.paEnded) return this.startAtBat();
    this.startPrepitch();
  }

  private playConfigBase() {
    const s = this.state;
    const ft = fieldingTeam(s);
    return {
      stadium: this.stadium,
      env: this.env,
      rng: this.rng,
      outsBefore: s.outs,
      defense: defenseOf(ft),
      fieldingPenalty: defensePenalties(ft),
      pitcherId: ft.pitcher.id,
      userDefense: this.userSidePitching(),
      userOffense: this.userSideBatting(),
      fieldingAssist: this.prefs.fieldingAssist,
      runningAssist: this.prefs.runningAssist,
      difficulty: this.settings.difficulty,
    };
  }

  private currentRunners(stealing: boolean) {
    const s = this.state;
    const out = [];
    for (let i = 0; i < 3; i++) {
      const occ = s.bases[i];
      if (!occ) continue;
      const lead = stealing ? [10, 16, 10][i] : 0;
      const st = this.stealers.get(i) ?? (lead ? (i + 1) * 90 + lead : undefined);
      out.push({ base: i + 1, player: occ.player, responsiblePitcherId: occ.responsiblePitcherId, reachedOnError: occ.reachedOnError, p: st, stealing: stealing && this.stealers.has(i) });
    }
    return out;
  }

  private startBattedPlay(res: ContactResult) {
    const s = this.state;
    const ball = battedBall({ x: res.contactPoint.x, y: res.contactPoint.y, z: res.contactPoint.z }, res.ev, res.la, res.spray, res.backspin, res.sidespin);
    this.play = new LivePlay({
      ...this.playConfigBase(),
      runners: this.currentRunners(true),
      batter: currentBatter(s),
      batted: ball,
      launchAngle: res.la,
      swingType: this.swing?.type,
    });
    this.rules.countPitch(true);
    const dist = projectDistance(ball, this.env);
    this.hrInfo = { name: currentBatter(s).name, ev: res.ev, la: res.la, dist };
    // Landing-indicator inaccuracy depends on the controlled fielder's skill.
    const ctrl = this.play.controlled;
    const err = ctrl ? (100 - ctrl.fld) / 100 : 0.3;
    this.landingOffset = { x: this.rng.gauss(err * 9), z: this.rng.gauss(err * 9) };
    this.emit('contact', res.label, undefined, { ev: res.ev, la: res.la, spray: res.spray, dist, quality: res.quality });
    this.setPhase('live');
  }

  private startNonBattedPlay(kind: 'wild' | 'catcher') {
    let wildBall: BallState | undefined;
    if (kind === 'wild') {
      const a = this.rng.range(-0.9, 0.9);
      const sp = this.rng.range(25, 45);
      wildBall = { p: { x: this.flight!.plate.x * 0.5, y: 0.4, z: -2.2 }, v: { x: Math.sin(a) * sp * 0.6, y: 4, z: -Math.cos(a) * sp }, backspin: 0, sidespin: 0, rolling: false, bounces: 1, stopped: false };
      this.emit('wildpitch', this.flight!.wild ? 'WILD PITCH' : 'PASSED BALL');
    }
    this.play = new LivePlay({
      ...this.playConfigBase(),
      runners: this.currentRunners(true),
      batter: null,
      start: kind,
      wildBall,
    });
    this.hrInfo = null;
    this.setPhase('live');
  }

  private updateLive(dt: number, input: FrameInput) {
    const play = this.play!;
    if (this.userSideBatting() && input.runnerCmd) commandRunners(play, input.runnerCmd.dir, input.runnerCmd.sel);
    play.update(dt, this.userSidePitching() ? input.defense : null);
    for (const e of play.events) this.emit('play:' + e.type, undefined, undefined, e.data);
    play.events = [];
    if (play.homeRun && (play.t > 7.5 || (input.skip && play.t > 1.2))) {
      for (const r of play.activeRunners()) play.scoreRunner(r);
      play.over = true;
    }
    if (play.over) this.finishPlay();
  }

  private finishPlay() {
    const play = this.play!;
    const o = play.outcome();
    this.lastOutcome = o;
    const s = this.state;
    if (o.kind === 'foul') {
      this.lastCall = 'FOUL';
      this.paEnded = false;
      this.rules.applyPitch('foul');
      this.emit('call', 'FOUL', `${s.balls}-${s.strikes}`, { call: 'foul' });
      this.play = null;
      this.setPhase('postpitch');
      return;
    }
    const batter = play.cfg.batter;
    const runsBefore = battingTeam(s).runs;
    this.rules.applyPlay(o, batter ? batter.id : null);
    const runs = battingTeam(s).runs - runsBefore;
    this.lastPlayNotable = o.notable;
    this.postplayDur = 1.7;
    if (o.homeRun && this.hrInfo) {
      this.emit('homerun', this.hrInfo.name, undefined, { ...this.hrInfo, runs });
      this.postplayDur = 4.2;
    } else if (o.triplePlay) this.emit('banner', 'TRIPLE PLAY!', '', { kind: 'big' });
    else if (o.doublePlay) this.emit('banner', 'DOUBLE PLAY', '', { kind: 'big' });
    else if (o.notable.includes('robbed')) this.emit('banner', 'ROBBED!', 'Leaping catch at the wall', { kind: 'big' });
    else if (o.notable.includes('diving')) this.emit('banner', 'DIVING CATCH!', '', { kind: 'big' });
    else if (batter) {
      const label: Record<string, string> = { '1B': 'SINGLE', '2B': 'DOUBLE', '3B': 'TRIPLE', GRD: 'GROUND-RULE DOUBLE', ROE: 'ERROR', FC: "FIELDER'S CHOICE" };
      const t = label[o.batterResult];
      if (t) this.emit('banner', t, o.description, { kind: 'hit' });
      else if (o.sacFly) this.emit('banner', 'SAC FLY', o.description, { kind: 'small' });
      else this.emit('banner', o.outs.length ? 'OUT' : '', o.description, { kind: 'small' });
    } else {
      if (o.stolenBases.length) this.emit('banner', 'STOLEN BASE', '', { kind: 'hit' });
      if (o.caughtStealing.length) this.emit('banner', 'CAUGHT STEALING', '', { kind: 'small' });
    }
    if (runs > 0 && !o.homeRun) this.emit('runsScored', `${runs} run${runs > 1 ? 's' : ''} score${runs > 1 ? '' : 's'}`);
    this.stealers.clear();
    this.setPhase('postplay');
  }

  private afterPlay() {
    const r = this.rules.checkProgress();
    this.play = null;
    if (r === 'final') return this.finishGame();
    if (r === 'half') return this.endHalf();
    // A non-batted play (steal / wild pitch) keeps the same batter unless the PA just ended.
    if (this.lastOutcome && this.lastOutcome.kind === 'nonbatted' && !this.paEnded) return this.startPrepitch();
    this.startAtBat();
  }

  private endHalf() {
    const s = this.state;
    this.setPhase('half_end');
    this.play = null;
    const prevHalf = s.half === 'top' ? 'BOTTOM' : 'TOP';
    const prevInning = s.half === 'top' ? s.inning - 1 : s.inning;
    this.emit('halfEnd', `END OF ${prevHalf === 'TOP' ? 'THE TOP' : 'THE'} ${ordinal(prevInning)}`, `${s.away.team.name} ${s.away.runs}, ${s.home.team.name} ${s.home.runs}`);
  }

  private finishGame() {
    this.setPhase('final');
    this.play = null;
    const s = this.state;
    const w = s.winner === 'home' ? s.home : s.away;
    const walkoff = s.winner === 'home' && s.half === 'bottom' && s.outs < 3;
    this.emit('final', walkoff ? 'WALK-OFF!' : 'FINAL', `${w.team.city} ${w.team.name} win ${Math.max(s.home.runs, s.away.runs)}–${Math.min(s.home.runs, s.away.runs)}`);
  }

  // ------------------------------------------------------------------ management

  /** Swap a lineup slot for a bench player (pinch hitter / runner / defensive sub). */
  substitute(side: 'home' | 'away', slot: number, playerId: string, pos?: string) {
    const t = this.state[side];
    const entry = t.lineup[slot];
    const incoming = playerById(playerId);
    if (t.removed.has(playerId) || t.lineup.some((e) => e.player.id === playerId)) return false;
    t.removed.add(entry.player.id);
    // If the replaced player is on base, the sub runs for him.
    for (const b of this.state.bases) if (b && b.player.id === entry.player.id) b.player = incoming;
    t.lineup[slot] = { player: incoming, pos: (pos as typeof entry.pos) ?? entry.pos };
    this.stats.addBatter(side, incoming.id);
    this.emit('toast', `${incoming.name} replaces ${entry.player.name}`);
    return true;
  }

  swapPositions(side: 'home' | 'away', a: number, b: number) {
    const t = this.state[side];
    const pa = t.lineup[a].pos;
    t.lineup[a].pos = t.lineup[b].pos;
    t.lineup[b].pos = pa;
  }

  bringInPitcher(side: 'home' | 'away', playerId: string) {
    const t = this.state[side];
    const p = playerById(playerId);
    if (t.removed.has(p.id) || t.pitcher.id === p.id) return;
    this.changePitcher(t, p);
  }

  warmUp(side: 'home' | 'away', playerId: string | null) {
    this.state[side].warming = playerId;
  }

  /** Explicit user request only. */
  simulateHalfInning() {
    if (this.state.over) return;
    const s = this.state;
    const half = s.half, inning = s.inning;
    this.play = null;
    let guard = 0;
    while (!s.over && s.half === half && s.inning === inning && guard++ < 60) {
      for (const t of [s.home, s.away]) {
        const rp = managePitching(s, t);
        if (fieldingTeam(s) === t && rp) this.rules.changePitcher(t, rp);
      }
      s.balls = 0; s.strikes = 0;
      simulatePA(s, this.rules, this.rng);
      const r = this.rules.checkProgress();
      if (r === 'final') { this.finishGame(); return; }
      if (r === 'half') break;
    }
    this.emit('toast', 'Half-inning simulated');
    this.endHalf();
  }

  simulateToEnd() {
    let guard = 0;
    while (!this.state.over && guard++ < 80) this.simulateHalfInning();
    if (this.state.over) this.finishGame();
  }

  // ------------------------------------------------------------------ snapshot for the renderer

  snapshot(): Snapshot {
    const s = this.state;
    const actors: Actor[] = [];
    const ft = fieldingTeam(s);
    const bt = battingTeam(s);
    const def = defenseOf(ft);
    const hand = (p: Player): 'L' | 'R' => (p.bats === 'S' ? 'R' : p.bats);
    const mk = (p: Player, side: 'home' | 'away', kind: Actor['kind'], x: number, z: number, facing: number, anim: AnimName, animT = 0, speed = 0, extra: Partial<Actor> = {}): Actor => ({
      id: p.id + (kind === 'fielder' ? '' : ''), side, kind, x, z, y: 0, facing, anim, animT, speed, number: p.number, bats: hand(p), throws: p.throws, hasBall: false, controlled: false, ...extra,
    });
    let ball: Snapshot['ball'] = { x: 0, y: 0, z: 0, visible: false, trail: false, color: '#ffffff', speed: 0 };
    let landing: Snapshot['landing'] = null;
    const play = this.play;
    if (play && (this.phase === 'live' || this.phase === 'postplay')) {
      for (const f of play.fielders) {
        let anim: AnimName = 'ready';
        let animT = 0;
        const sp = Math.hypot(f.vx, f.vz);
        if (f.down > 0) anim = 'down';
        else if (f.dive > 0) { anim = 'dive'; animT = 1 - f.dive / 0.42; }
        else if (f.jump > 0) { anim = 'jump'; animT = 1 - f.jump / 0.6; }
        else if (f.throwAnim > 0) { anim = 'throw'; animT = 1 - f.throwAnim / 0.4; }
        else if (f.catchAnim > 0) { anim = 'catch'; animT = 1 - f.catchAnim / 0.35; }
        else if (sp > 2) anim = 'run';
        else if (f.pos === 'C' && !play.cfg.batter && play.t < 0.3) anim = 'crouch';
        actors.push(mk(f.player, ft.side, 'fielder', f.x, f.z, f.facing, anim, animT, sp, { pos: f.pos, hasBall: f.hasBall, controlled: play.controlled === f && play.cfg.userDefense }));
      }
      for (const r of play.runners) {
        if (r.scored && play.t - r.scoreTime > 1.2) continue;
        if (r.out && play.t > 0) {
          const o = play.outs.find((x) => x.runnerId === r.id);
          if (o && play.t - o.time > 1.5) continue;
        }
        const pp = pathPos(r.p);
        const moving = r.delay <= 0 && Math.abs(r.goal - r.p) > 0.05 && !r.out;
        const dir = r.goal >= r.p ? 1 : -1;
        const nxt = pathPos(Math.min(360, Math.max(0, r.p + dir * 2)));
        const facing = Math.atan2(nxt.x - pp.x, nxt.z - pp.z);
        const anim: AnimName = r.slide > 0 ? 'slide' : r.out ? 'idle' : moving ? (r.trot ? 'trot' : 'run') : 'idle';
        const selected = this.runnerSel !== null && (r.startBase === this.runnerSel || Math.round(r.p / 90) === this.runnerSel);
        actors.push(mk(r.player, bt.side, 'runner', pp.x, pp.z, r.isBatter && r.delay > 0 ? (hand(r.player) === 'R' ? Math.PI / 2 : -Math.PI / 2) : facing, r.isBatter && r.delay > 0 ? 'swing' : anim, r.isBatter && r.delay > 0 ? 1 : 1 - r.slide / 0.55, moving ? r.v : 0, { selected: selected && play.cfg.userOffense }));
        if (r.isBatter && r.delay > 0) {
          const a = actors[actors.length - 1];
          a.x = hand(r.player) === 'R' ? -2.7 : 2.7;
          a.z = 0.6;
          a.kind = 'batter';
        }
      }
      const b = play.ball;
      const v = b.phys.v;
      ball = { x: b.phys.p.x, y: b.phys.p.y, z: b.phys.p.z, visible: b.mode !== 'held', trail: b.mode !== 'held' && Math.hypot(v.x, v.y, v.z) > 60, color: '#ffffff', speed: Math.hypot(v.x, v.y, v.z) };
      if (b.mode === 'loose' && b.battedInAir && b.path.length) {
        const elapsed = play.t - b.pathT0;
        let land = null;
        for (let i = 1; i < b.path.length; i++) {
          const sm = b.path[i];
          if (sm.t < elapsed) continue;
          if (sm.event === 'bounce' || sm.event === 'homerun' || sm.event === 'outofplay' || sm.event === 'wall') { land = sm; break; }
        }
        if (land) {
          const tl = Math.max(0, land.t - elapsed);
          landing = { x: land.x + this.landingOffset.x * Math.min(1, tl / 2), z: land.z + this.landingOffset.z * Math.min(1, tl / 2), r: 2.6 + tl * 5 };
        }
      }
    } else {
      // Pre-pitch alignment.
      const pos = defaultPositions(this.stadium);
      for (const fp of FIELD_POSITIONS) {
        const p = def[fp];
        const home = pos[fp];
        let anim: AnimName = 'ready';
        let animT = 0;
        let x = home.x, z = home.z;
        let facing = Math.PI;
        if (fp === 'P') {
          x = 0; z = 60.5;
          if (this.phase === 'windup') { anim = 'pitch'; animT = clamp(this.phaseT / WINDUP, 0, 1) * 0.8; }
          else if (this.phase === 'pitch' || this.phase === 'postpitch') { anim = 'pitch'; animT = 0.8 + clamp(this.pitchT / 0.6, 0, 1) * 0.2; z = 58.5; }
          else anim = 'idle';
        }
        if (fp === 'C') { anim = 'crouch'; z = -3.4; facing = 0; }
        actors.push(mk(p, ft.side, 'fielder', x, z, facing, anim, animT, 0, { pos: fp, hasBall: fp === 'P' && this.phase !== 'pitch' && this.phase !== 'postpitch' }));
      }
      const batter = currentBatter(s);
      const bh = battingSide(batter, ft.pitcher);
      let anim: AnimName = 'bat';
      let animT = 0;
      if (this.swing && (this.phase === 'pitch' || this.phase === 'postpitch')) {
        anim = 'swing';
        animT = clamp((this.pitchT - this.swing.pressTime) / (SWING_LAG * 2.2), 0, 1);
      }
      actors.push(mk(batter, bt.side, 'batter', bh === 'R' ? -2.7 : 2.7, 0.6, bh === 'R' ? Math.PI / 2 : -Math.PI / 2, anim, animT, 0, { bats: bh }));
      for (let i = 0; i < 3; i++) {
        const occ = s.bases[i];
        if (!occ) continue;
        const sp = this.stealers.get(i);
        const pp = pathPos(sp ?? (i + 1) * 90 + 6);
        const moving = sp !== undefined && sp > (i + 1) * 90 + 8;
        const nxt = pathPos((i + 1) * 90 + 10);
        const selected = this.runnerSel === i + 1;
        actors.push(mk(occ.player, bt.side, 'runner', pp.x, pp.z, Math.atan2(nxt.x - pp.x, nxt.z - pp.z), moving ? 'run' : 'idle', 0, moving ? 25 : 0, { selected: selected && this.userSideBatting() }));
      }
      if (this.flight && (this.phase === 'pitch' || this.phase === 'postpitch')) {
        const tCatch = timeAtZ(this.flight, CATCHER_Z);
        const t = Math.min(this.pitchT, tCatch);
        const p = pitchPos(this.flight, t);
        ball = { x: p.x, y: p.y, z: p.z, visible: this.pitchT < tCatch + 0.4, trail: this.pitchT < tCatch, color: PITCHES[this.flight.code].color, speed: this.flight.mph * MPH };
      }
    }
    actors.push({ id: 'ump-hp', side: 'ump', kind: 'umpire', x: 0, z: -6.2, y: 0, facing: 0, anim: 'crouch', animT: 0, speed: 0, number: 0, bats: 'R', throws: 'R', hasBall: false, controlled: false });
    actors.push({ id: 'ump-1b', side: 'ump', kind: 'umpire', x: 78, z: 52, y: 0, facing: -1.0, anim: 'ready', animT: 0, speed: 0, number: 0, bats: 'R', throws: 'R', hasBall: false, controlled: false });
    return { t: this.clock, actors, ball, landing };
  }
}

function currentPitcherName(s: GameState) {
  return currentPitcher(s).name;
}

export function ordinal(n: number): string {
  const s = ['TH', 'ST', 'ND', 'RD'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Distance the ball would travel with no walls (for HR graphics). */
export function projectDistance(b0: BallState, env: BallEnv): number {
  const open = { ...env, stadium: { ...env.stadium, dims: [999, 999, 999, 999, 999] as [number, number, number, number, number], walls: [1, 1, 1, 1, 1] as [number, number, number, number, number], wallZones: undefined, foulWidth: 999, backstop: 999 } };
  const b: BallState = { ...b0, p: { ...b0.p }, v: { ...b0.v } };
  for (let i = 0; i < 4000; i++) {
    const ev = stepBall(b, 1 / 240, open);
    if (ev === 'bounce' || b.rolling) break;
  }
  return Math.hypot(b.p.x, b.p.z);
}

export type { V3 };
