/**
 * GameController: owns the simulation, the drive, the renderer and input, and runs the fixed-timestep
 * loop. The React play screen only renders overlays from `snapshot()` and calls the public actions
 * (callPlay, advance, fourthDown, newDrive...). Stage flow:
 *
 *   call → presnap → live → whistle → result → (fourth | call | over)
 */
import { Rng } from '../core/rng';
import { Drive, fieldGoalChance, type ResultSummary } from './engine/drive';
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

export type Stage = 'call' | 'presnap' | 'live' | 'whistle' | 'result' | 'fourth' | 'over';

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

  constructor(
    canvas: HTMLCanvasElement,
    readonly player: CreatedPlayer,
    readonly settings: SimSettings,
    seed = Date.now() % 100000,
  ) {
    this.rng = new Rng(seed);
    this.match = buildMatch(player, 'michigan', 26);
    this.sim = new PlaySim(this.match.specs, settings, seed + 1);
    this.drive = new Drive(settings);
    const home = TEAM_BY_ID[this.match.offenseTeam];
    const away = TEAM_BY_ID[this.match.defenseTeam];
    this.renderer = new GameRenderer(canvas, this.match.specs, looksForMatch(this.match.specs, player, this.match.offenseTeam, this.match.defenseTeam), {
      homeName: (home?.school ?? 'HOME').toUpperCase(),
      homeNick: (home?.nickname ?? '').toUpperCase(),
      homeColor: home?.primaryColor ?? '#BB0000',
      homeColor2: '#FFFFFF',
      awayName: (away?.school ?? 'AWAY').toUpperCase(),
      awayColor: away?.primaryColor ?? '#00274C',
    });
    this.input = new InputManager();
    this.suggested = this.drive.coachCall(this.rng);
    // Line up the first play in the background so the stadium shows behind the play call screen.
    this.sim.setup({ los: this.drive.los, spotY: this.drive.spotY, play: this.suggested, defCall: 'cover3' });
    this.renderer.resetCamera(this.sim);
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
    if (this.drive.over) this.stage = 'over';
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
      this.stage = 'over';
    } else {
      this.drive.punt();
      this.banner('PUNT', 'info');
      this.stage = 'over';
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
        default:
          break;
      }
    }
    // Expire old banners
    this.banners = this.banners.filter((b) => now - b.t < 2600);
    const board = this.drive;
    this.renderer.setBoard(
      [`Q${board.quarter}  ${fmtClock(this.displayClock())}`, `OSU ${board.score.us}  MICH ${board.score.them}`, `${board.downLabel()} · ${board.spotLabel()}`],
      '#BB0000',
    );
    this.renderer.render(this.sim, this.paused ? 0 : dt, {
      readAssist: this.settings.readAssist,
      charging: this.charging?.slot ?? null,
      showRoutes: this.showRoutes,
      firstDownX: this.firstDownX(),
    });
    this.emit(this.banners.length !== bannersBefore);
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
      version: this.version,
    };
  }
}

export function fmtClock(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}
