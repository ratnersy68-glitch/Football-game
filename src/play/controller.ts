/**
 * GameController: owns the simulation, the drive, the renderer and input, and runs the fixed-timestep
 * loop. The React play screen only renders overlays from `snapshot()` and calls the public actions
 * (callPlay, advance, fourthDown, newDrive...). Stage flow:
 *
 *   call → presnap → live → whistle → result → (fourth | call | over)
 */
import { Rng } from '../core/rng';
import { Drive, fieldGoalChance, type DriveStats, type ResultSummary } from './engine/drive';
import { simPossession } from './engine/possession';
import { DEF_CALL_NAMES, PLAYS, type PlayDef, type Slot } from './engine/playbook';
import { buildMatch, type MatchRoster } from './engine/roster';
import { PlaySim } from './engine/sim';
import type { SimEvent, SimSettings } from './engine/types';
import { InputManager, type Frame } from './input';
import { CAMERA_NAMES, GameRenderer, looksForMatch } from './render/scene';
import type { CreatedPlayer } from '../career/player';
import { TEAM_BY_ID } from '../data';

export const STEP = 1 / 60;
export const PLAY_CLOCK = 25;

export type Stage = 'call' | 'presnap' | 'live' | 'whistle' | 'result' | 'fourth' | 'over' | 'sim' | 'final';

export interface GameOptions {
  opponentId: string;
  /** Is the user's team at home (home stadium, home uniforms)? */
  home: boolean;
  /** 'drive' = one practice drive (exhibition); 'game' = full game with simulated opponent possessions. */
  mode: 'drive' | 'game';
  seed?: number;
  /** Coach benched the user for the first quarter (low trust): those drives are simulated. */
  benchQ1?: boolean;
  /** Player energy 0–100 from the career: caps in-game stamina. */
  energy?: number;
}

export interface GameEndResult {
  us: number;
  them: number;
  won: boolean;
  stats: DriveStats;
}

export interface TeamBadge {
  abbr: string;
  name: string;
  color: string;
  color2: string;
}

export interface Banner {
  id: number;
  text: string;
  kind: 'good' | 'bad' | 'info' | 'big';
  t: number;
}

export interface Snapshot {
  stage: Stage;
  paused: boolean;
  quarter: number;
  clock: number;
  score: { us: number; them: number };
  downLabel: string;
  spotLabel: string;
  los: number;
  playName: string;
  defName: string | null;
  suggested: string;
  playClock: number;
  charging: { slot: Slot; power: number } | null;
  lobHeld: boolean;
  stamina: number;
  controlledLabel: string;
  controlledIsQB: boolean;
  controlledHasBall: boolean;
  controlledIsUser: boolean;
  banners: Banner[];
  result: ResultSummary | null;
  stats: Drive['stats'];
  log: string[];
  overReason: string;
  camera: string;
  showRoutes: boolean;
  fgDistance: number;
  fgChance: number;
  gamepad: boolean;
  firstDownX: number | null;
  mode: 'drive' | 'game';
  teams: { us: TeamBadge; them: TeamBadge };
  periodLabel: string;
  /** Simulated possession card (opponent drive, bench, halftime). */
  simCard: { title: string; text: string } | null;
  final: GameEndResult | null;
  /** The user's own position on this play's offense. */
  userRole: string;
  version: number;
}

const EVENT_BANNERS: Partial<Record<SimEvent['type'], Banner['kind']>> = {
  catch: 'good',
  touchdown: 'big',
  interception: 'bad',
  sack: 'bad',
  drop: 'bad',
  deflection: 'bad',
  batted: 'bad',
  missed_tackle: 'good',
  throwaway: 'info',
  out_of_bounds: 'info',
  safety: 'bad',
};

export class GameController {
  readonly sim: PlaySim;
  drive: Drive;
  readonly match: MatchRoster;
  readonly renderer: GameRenderer;
  readonly input: InputManager;
  private rng: Rng;
  stage: Stage = 'call';
  paused = false;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private whistleT = 0;
  private playClock = PLAY_CLOCK;
  private banners: Banner[] = [];
  private bannerId = 0;
  private result: ResultSummary | null = null;
  private suggested: PlayDef;
  private charging: Frame['charging'] = null;
  private lobHeld = false;
  private showRoutes = true;
  private version = 0;
  private lastEmit = 0;
  private listeners = new Set<(s: Snapshot) => void>();
  private revealDef = false;
  private disposed = false;
  private pendingThrow: Frame['throwTo'] | null = null;
  readonly opts: GameOptions;
  readonly teams: { us: TeamBadge; them: TeamBadge };
  private simCard: { title: string; text: string } | null = null;
  private afterSim: (() => void) | null = null;
  private finalResult: GameEndResult | null = null;
  private usFirst = true;
  private halfSwitched = false;
  private staminaCap = 100;

  constructor(
    canvas: HTMLCanvasElement,
    readonly player: CreatedPlayer,
    readonly settings: SimSettings,
    opts: Partial<GameOptions> = {},
  ) {
    this.opts = { opponentId: 'michigan', home: true, mode: 'drive', ...opts };
    const seed = this.opts.seed ?? Date.now() % 100000;
    this.rng = new Rng(seed);
    this.match = buildMatch(player, this.opts.opponentId, 26);
    this.sim = new PlaySim(this.match.specs, settings, seed + 1);
    const us = TEAM_BY_ID[this.match.offenseTeam];
    const them = TEAM_BY_ID[this.match.defenseTeam];
    const badge = (t: typeof us, fallback: string): TeamBadge => ({
      abbr: t?.abbreviation ?? fallback,
      name: t?.school ?? fallback,
      color: t?.primaryColor ?? '#444444',
      color2: t?.secondaryColor ?? '#FFFFFF',
    });
    this.teams = { us: badge(us, 'HOME'), them: badge(them, 'AWAY') };
    this.drive = new Drive(settings, { us: this.teams.us.abbr, them: this.teams.them.abbr });
    const homeT = this.opts.home ? us : them;
    const awayT = this.opts.home ? them : us;
    this.renderer = new GameRenderer(
      canvas,
      this.match.specs,
      looksForMatch(this.match.specs, player, this.match.offenseTeam, this.match.defenseTeam, this.opts.home),
      {
        homeName: (homeT?.school ?? 'HOME').toUpperCase(),
        homeNick: (homeT?.nickname ?? '').toUpperCase(),
        homeAbbr: homeT?.abbreviation ?? 'HOME',
        homeColor: homeT?.primaryColor ?? '#BB0000',
        homeColor2: readableOn(homeT?.primaryColor ?? '#BB0000', homeT?.secondaryColor ?? '#FFFFFF'),
        awayName: (awayT?.school ?? 'AWAY').toUpperCase(),
        awayColor: awayT?.primaryColor ?? '#00274C',
      },
    );
    this.input = new InputManager();
    this.staminaCap = 55 + (this.opts.energy ?? 100) * 0.45;
    this.suggested = this.drive.coachCall(this.rng);
    // Line up the first play in the background so the stadium shows behind the play call screen.
    this.sim.setup({ los: this.drive.los, spotY: this.drive.spotY, play: this.suggested, defCall: 'cover3' });
    this.capStamina();
    this.renderer.resetCamera(this.sim);
    if (this.opts.mode === 'game') {
      this.usFirst = this.rng.chance(0.5);
      this.banner(this.usFirst ? `${this.teams.us.abbr} RECEIVES THE OPENING KICKOFF` : `${this.teams.them.abbr} RECEIVES THE OPENING KICKOFF`, 'info');
      this.nextPossession(this.usFirst ? 'us' : 'them', 25);
    }
  }

  private capStamina() {
    const u = this.sim.user;
    u.stamina = Math.min(u.stamina, this.staminaCap);
  }

  // ───────────── possessions (full-game mode) ─────────────

  private nextPossession(team: 'us' | 'them', los: number) {
    const benched = team === 'us' && this.opts.benchQ1 && this.drive.quarter === 1 && !this.drive.ot;
    if (team === 'them' || benched) {
      const u = this.match.units;
      const p =
        team === 'them'
          ? simPossession(u.them.offense, u.us.defense, los, this.rng, this.settings.quarterMinutes, this.teams.them.name)
          : simPossession(u.us.offense, u.them.defense, los, this.rng, this.settings.quarterMinutes, this.teams.us.name);
      if (team === 'them') this.drive.score.them += p.points;
      else this.drive.score.us += p.points;
      this.drive.runClock(p.seconds);
      const title = team === 'them' ? `${this.teams.them.abbr} possession` : `${this.teams.us.abbr} possession — you're on the bench`;
      this.simCard = { title, text: p.text };
      this.afterSim = () => this.afterPossession(team, p.nextLos);
      this.stage = 'sim';
      this.emit(true);
      return;
    }
    this.drive.newDrive(los);
    this.toCall();
    this.emit(true);
  }

  /** Decide who has the ball next: halftime, end of regulation, overtime, or a normal change of possession. */
  private afterPossession(by: 'us' | 'them', nextLosForOther: number) {
    const d = this.drive;
    if (!this.halfSwitched && d.quarter >= 3 && !d.ot) {
      this.halfSwitched = true;
      this.banner('HALFTIME', 'info');
      this.nextPossession(this.usFirst ? 'them' : 'us', 25);
      return;
    }
    if (d.gameOver || d.ot) {
      if (d.gameOver && !d.ot) {
        if (d.score.us === d.score.them) {
          d.ot = true;
          d.quarter = 5;
          this.banner('OVERTIME', 'big');
          this.nextPossession('us', 75);
        } else this.endGame();
        return;
      }
      // Overtime rounds: we go first from their 25, then they do.
      if (by === 'us') this.nextPossession('them', 75);
      else if (d.score.us !== d.score.them) this.endGame();
      else this.nextPossession('us', 75);
      return;
    }
    this.nextPossession(by === 'us' ? 'them' : 'us', nextLosForOther);
  }

  /** Where the opponent starts after our drive ends. */
  private theirStartAfterOurDrive(): number {
    const d = this.drive;
    const o = this.sim.outcome;
    switch (d.reason) {
      case 'Touchdown':
        return 25;
      case 'Interception':
        return Math.max(5, Math.min(95, Math.round(100 - (o?.spotX ?? d.los))));
      case 'Safety':
        return 40;
      case 'Punt':
        return Math.max(5, Math.min(35, Math.round(100 - (d.los + 40))));
      default:
        if (d.reason.startsWith('Field goal good')) return 25;
        return Math.max(20, Math.min(95, Math.round(100 - d.los)));
    }
  }

  private endGame() {
    const d = this.drive;
    this.finalResult = { us: d.score.us, them: d.score.them, won: d.score.us > d.score.them, stats: { ...d.stats } };
    this.stage = 'final';
    this.banner(this.finalResult.won ? 'FINAL — WIN!' : 'FINAL', this.finalResult.won ? 'big' : 'info');
    this.emit(true);
  }

  /** Continue from a simulated-possession card. */
  continueSim(): void {
    if (this.stage !== 'sim' || !this.afterSim) return;
    const f = this.afterSim;
    this.afterSim = null;
    this.simCard = null;
    f();
    this.emit(true);
  }

  // ───────────── lifecycle ─────────────

  start(): void {
    this.last = performance.now();
    const loop = (now: number) => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);
      this.frame(now);
    };
    this.raf = requestAnimationFrame(loop);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.input.dispose();
    this.renderer.dispose();
    this.listeners.clear();
  }

  subscribe(fn: (s: Snapshot) => void): () => void {
    this.listeners.add(fn);
    fn(this.snapshot());
    return () => this.listeners.delete(fn);
  }

  private emit(force = false) {
    const now = performance.now();
    if (!force && now - this.lastEmit < 50) return;
    this.lastEmit = now;
    this.version++;
    const s = this.snapshot();
    this.listeners.forEach((l) => l(s));
  }

  // ───────────── actions ─────────────

  /** Call a play (from the play-call screen) and line up. */
  callPlay(playId: string): void {
    if (this.stage !== 'call') return;
    const play = PLAYS.find((p) => p.id === playId) ?? this.suggested;
    this.drive.noteCall(play);
    const defCall = this.drive.defenseCall(this.rng);
    this.sim.setup({ los: this.drive.los, spotY: this.drive.spotY, play, defCall });
    this.capStamina();
    this.renderer.resetCamera(this.sim);
    this.stage = 'presnap';
    this.pendingThrow = null;
    this.input.presnap = true;
    this.playClock = PLAY_CLOCK;
    this.revealDef = false;
    this.result = null;
    this.emit(true);
  }

  snap(): void {
    if (this.stage !== 'presnap' || this.paused) return;
    this.sim.step(STEP, { move: { x: 0, y: 0 }, sprint: false, snap: true });
    this.stage = 'live';
    this.input.presnap = false;
    this.emit(true);
  }

  /** Continue from the result card. */
  advance(): void {
    if (this.stage !== 'result') return;
    if (this.drive.over && this.opts.mode === 'game') this.afterPossession('us', this.theirStartAfterOurDrive());
    else if (this.drive.over) this.stage = 'over';
    else if (this.drive.down === 4) this.stage = 'fourth';
    else this.toCall();
    this.emit(true);
  }

  fourthDown(choice: 'go' | 'fg' | 'punt'): void {
    if (this.stage !== 'fourth') return;
    if (choice === 'go') {
      this.toCall();
    } else if (choice === 'fg') {
      const r = this.drive.kickFieldGoal(this.rng);
      this.banner(r.good ? `FIELD GOAL IS GOOD! (${r.distance} yds)` : `FIELD GOAL NO GOOD (${r.distance} yds)`, r.good ? 'big' : 'bad');
      if (this.opts.mode === 'game') this.afterPossession('us', r.good ? 25 : Math.max(20, Math.round(100 - this.drive.los)));
      else this.stage = 'over';
    } else {
      this.drive.punt();
      this.banner('PUNT', 'info');
      if (this.opts.mode === 'game') this.afterPossession('us', this.theirStartAfterOurDrive());
      else this.stage = 'over';
    }
    this.emit(true);
  }

  newDrive(resetGame = false): void {
    if (resetGame) this.drive = new Drive(this.settings);
    else this.drive.newDrive();
    this.banners = [];
    this.toCall();
    this.emit(true);
  }

  setPaused(p: boolean): void {
    this.paused = p;
    this.emit(true);
  }

  cycleCamera(): void {
    this.renderer.cycleCamera();
    this.emit(true);
  }

  toggleRoutes(): void {
    this.showRoutes = !this.showRoutes;
    this.emit(true);
  }

  private toCall() {
    this.stage = 'call';
    this.suggested = this.drive.coachCall(this.rng);
    this.result = null;
  }

  private banner(text: string, kind: Banner['kind']) {
    this.banners.push({ id: ++this.bannerId, text, kind, t: performance.now() });
    if (this.banners.length > 4) this.banners.shift();
  }

  // ───────────── loop ─────────────

  private frame(now: number) {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const f = this.input.poll();
    this.charging = f.charging;
    this.lobHeld = f.lobHeld;
    if (f.pause && this.stage !== 'call') this.setPaused(!this.paused);
    if (f.cameraCycle) this.cycleCamera();
    if (f.toggleRoutes) this.toggleRoutes();
    if (f.zoom) this.renderer.zoom = Math.min(2.2, Math.max(0.55, this.renderer.zoom + f.zoom * 0.08));
    if (f.heightDelta) this.renderer.height = Math.min(2.2, Math.max(0.4, this.renderer.height + f.heightDelta * dt * 0.8));
    const bannersBefore = this.banners.length;

    if (!this.paused) {
      switch (this.stage) {
        case 'presnap':
          this.playClock -= dt;
          if (f.snap) this.snap();
          else if (this.playClock <= 0) this.delayOfGame();
          break;
        case 'live': {
          this.acc += dt;
          let first = true;
          // A throw released while the snap is still in the air is held until the QB secures the ball.
          if (f.throwTo && this.sim.ball.state === 'snap') {
            this.pendingThrow = f.throwTo;
            f.throwTo = undefined;
          } else if (!f.throwTo && this.pendingThrow && this.sim.ball.state === 'held' && this.sim.carrier()?.id === this.sim.userId) {
            f.throwTo = this.pendingThrow;
            this.pendingThrow = null;
          }
          while (this.acc >= STEP && this.stage === 'live') {
            this.acc -= STEP;
            this.sim.step(STEP, {
              move: f.move,
              sprint: f.sprint,
              throwTo: first ? f.throwTo : undefined,
              moveKind: first ? f.moveKind : undefined,
              throwAway: first ? f.throwAway : false,
              callForBall: first ? f.callForBall : false,
            });
            first = false;
            for (const e of this.sim.drainEvents()) this.onEvent(e);
            if (this.sim.phase === 'dead') this.onWhistle();
          }
          break;
        }
        case 'whistle':
          this.sim.step(dt, { move: { x: 0, y: 0 }, sprint: false });
          this.whistleT += dt;
          if (this.whistleT > 1.7) {
            this.stage = 'result';
            this.emit(true);
          }
          break;
        case 'result':
          this.sim.step(dt, { move: { x: 0, y: 0 }, sprint: false });
          if (f.snap) this.advance();
          break;
        case 'sim':
          if (f.snap) this.continueSim();
          break;
        default:
          break;
      }
    }
    // Expire old banners
    this.banners = this.banners.filter((b) => now - b.t < 2600);
    const board = this.drive;
    this.renderer.setBoard(
      [
        `${this.periodLabel()}  ${board.ot ? '' : fmtClock(this.displayClock())}`,
        `${this.teams.us.abbr} ${board.score.us}  ${this.teams.them.abbr} ${board.score.them}`,
        this.stage === 'final' ? 'FINAL' : `${board.downLabel()} · ${board.spotLabel()}`,
      ],
      (this.opts.home ? this.teams.us : this.teams.them).color,
    );
    this.renderer.render(this.sim, this.paused ? 0 : dt, {
      readAssist: this.settings.readAssist,
      charging: this.charging?.slot ?? null,
      showRoutes: this.showRoutes,
      firstDownX: this.firstDownX(),
    });
    this.emit(this.banners.length !== bannersBefore);
  }

  private periodLabel(): string {
    return this.drive.ot ? 'OT' : `Q${this.drive.quarter}`;
  }

  private firstDownX(): number | null {
    if (this.drive.goalToGo) return null;
    return this.drive.los + this.drive.distance;
  }

  private displayClock(): number {
    return Math.max(0, this.drive.clock - (this.stage === 'live' ? this.sim.t : 0));
  }

  private delayOfGame() {
    const d = this.drive;
    const yards = Math.min(5, Math.floor((d.los - 1) / 2));
    d.los -= yards;
    d.distance += yards;
    this.banner(`FLAG — DELAY OF GAME, ${yards} YARDS`, 'bad');
    this.sim.setup({ los: d.los, spotY: d.spotY, play: this.sim.play, defCall: this.sim.defCall });
    this.capStamina();
    this.renderer.resetCamera(this.sim);
    this.playClock = PLAY_CLOCK;
    this.emit(true);
  }

  private onEvent(e: SimEvent) {
    const kind = EVENT_BANNERS[e.type];
    if (!kind) return;
    this.banner(e.text.toUpperCase(), kind);
  }

  private onWhistle() {
    const o = this.sim.outcome!;
    this.revealDef = true;
    this.result = this.drive.apply(o, this.match.userId);
    if (this.result.firstDown && !this.result.touchdown) this.banner('FIRST DOWN!', 'good');
    this.stage = 'whistle';
    this.whistleT = 0;
    this.acc = 0;
    this.emit(true);
  }

  snapshot(): Snapshot {
    const d = this.drive;
    const c = this.sim.controlled;
    const fgDistance = 100 - d.los + 17;
    return {
      stage: this.stage,
      paused: this.paused,
      quarter: d.quarter,
      clock: this.displayClock(),
      score: { ...d.score },
      downLabel: d.downLabel(),
      spotLabel: d.spotLabel(),
      los: d.los,
      playName: this.sim.play.name,
      defName: this.revealDef ? DEF_CALL_NAMES[this.sim.defCall] : null,
      suggested: this.suggested.id,
      playClock: Math.max(0, this.playClock),
      charging: this.charging,
      lobHeld: this.lobHeld,
      stamina: c.stamina,
      controlledLabel: `#${c.number} ${c.name}`,
      controlledIsQB: c.role === 'QB',
      controlledHasBall: this.sim.ball.state === 'held' && this.sim.ball.holder === c.id,
      controlledIsUser: c.id === this.sim.userId,
      banners: [...this.banners],
      result: this.result,
      stats: { ...d.stats },
      log: [...d.log],
      overReason: d.reason,
      camera: CAMERA_NAMES[this.renderer.cameraMode],
      showRoutes: this.showRoutes,
      fgDistance,
      fgChance: fieldGoalChance(fgDistance),
      gamepad: this.input.gamepadConnected,
      firstDownX: this.firstDownX(),
      mode: this.opts.mode,
      teams: this.teams,
      periodLabel: this.periodLabel(),
      simCard: this.simCard,
      final: this.finalResult,
      userRole: this.sim.user.role,
      version: this.version,
    };
  }
}

export function fmtClock(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** A team's secondary color if it reads on the primary, else white. */
function readableOn(primary: string, secondary: string): string {
  const lum = (h: string) => {
    const n = parseInt(h.replace('#', ''), 16);
    return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  };
  return Math.abs(lum(primary) - lum(secondary)) > 0.3 ? secondary : '#FFFFFF';
}
