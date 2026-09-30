import { AIController } from '../ai/AIController';
import { audio } from '../audio/AudioSystem';
import { Rng } from '../core/rng';
import { ARENA_BY_ID, STRIKES } from '../data';
import { FightEngine } from '../engine/FightEngine';
import type { CommandAction, FightEvent, SubKey } from '../engine/types';
import { PlayerController } from '../input/PlayerController';
import type { InputManager } from '../input/InputManager';
import { CommentarySystem } from '../presentation/CommentarySystem';
import { CrowdSystem } from '../presentation/CrowdSystem';
import { ReplayRecorder } from '../presentation/ReplayRecorder';
import { snapshot } from '../presentation/Snapshot';
import { Renderer } from '../render/Renderer';
import type { Settings } from '../ui/Settings';
import type { FightSetup } from './types';

const STEP = 1 / 60;

export interface SessionHooks {
  bigText(text: string, ms?: number): void;
  commentary(text: string, color: boolean): void;
}

/**
 * One live fight: engine + player controller + AI + presentation (renderer, commentary, crowd,
 * replay, audio). Runs the simulation on a fixed 60 Hz step with slow motion for big moments.
 */
export class FightSession {
  readonly engine: FightEngine;
  readonly renderer: Renderer;
  readonly commentary: CommentarySystem;
  readonly crowd: CrowdSystem;
  readonly replay: ReplayRecorder;
  readonly player: PlayerController;
  readonly ai: AIController;
  paused = false;
  private acc = 0;
  private timeScale = 1;
  private slowT = 0;
  private visTime = 0;
  private pendingActions: CommandAction[] = [];
  private pendingSub: SubKey | undefined;
  finishedFor = 0;

  constructor(readonly setup: FightSetup, canvas: HTMLCanvasElement, readonly input: InputManager, private settings: Settings, private hooks: SessionHooks) {
    const seed = setup.seed ?? Math.floor(Math.random() * 2 ** 31);
    this.engine = new FightEngine({
      fighters: setup.fighters, rounds: setup.rounds, roundSeconds: 300, clockSpeed: setup.clockSpeed, seed,
      arenaId: setup.arenaId, mainEvent: setup.context === 'main', title: setup.title,
    });
    const rng = new Rng(seed ^ 0x9e3779b9);
    this.player = new PlayerController(this.engine, 0, input);
    this.ai = new AIController(this.engine, 1, setup.difficulty, rng.fork());
    this.renderer = new Renderer(canvas, ARENA_BY_ID[setup.arenaId] ?? ARENA_BY_ID.vegas, setup.fighters);
    this.renderer.camera.shakeEnabled = settings.shake;
    this.commentary = new CommentarySystem(this.engine, rng.fork());
    this.crowd = new CrowdSystem(this.engine);
    this.replay = new ReplayRecorder(this.engine);
    this.engine.bus.on((ev) => this.onEvent(ev));
    this.renderer.camera.snapTo(snapshot(this.engine), canvas.clientWidth || 1280, canvas.clientHeight || 720);
  }

  start() {
    this.engine.start();
  }

  private slow(scale: number, seconds: number) {
    this.timeScale = scale;
    this.slowT = seconds;
  }

  private onEvent(ev: FightEvent) {
    const e = this.engine;
    const cam = this.renderer.camera;
    switch (ev.type) {
      case 'strikeLanded': {
        const s = STRIKES[ev.id];
        audio.hit(s.kind, ev.dmg);
        cam.kick(Math.min(0.6, ev.dmg / 22) * (ev.counter ? 1.4 : 1));
        break;
      }
      case 'strikeBlocked': audio.block(); break;
      case 'strikeMissed': if (STRIKES[ev.id].power) audio.whoosh(); break;
      case 'rocked': this.hooks.bigText(ev.side === 0 ? "YOU'RE HURT!" : e.f[1].data.gender === 'F' ? "SHE'S HURT!" : "HE'S HURT!", 900); break;
      case 'knockdown':
        audio.thud();
        cam.kick(1);
        cam.focus(ev.side, 1.6);
        this.slow(0.35, 0.9);
        this.hooks.bigText('KNOCKDOWN!', 1400);
        break;
      case 'takedown': audio.thud(); cam.kick(0.3); break;
      case 'roundStart': audio.horn(); this.hooks.bigText(`ROUND ${ev.round}`, 1200); break;
      case 'roundEnd': audio.horn(); break;
      case 'tenSeconds': audio.clapper(); this.hooks.bigText('10 SECONDS', 900); break;
      case 'subAttempt': this.hooks.bigText(ev.side === 0 ? 'SUBMISSION ATTEMPT!' : 'DEFEND THE SUBMISSION!', 900); break;
      case 'fightEnd': {
        const r = ev.result;
        if (r.method === 'KO' || r.method === 'TKO') {
          this.slow(0.3, 1.6);
          if (r.winner !== null) cam.focus(r.winner === 0 ? 1 : 0, 3);
        }
        audio.horn();
        const txt = r.method === 'KO' ? 'KNOCKOUT!' : r.method === 'TKO' ? 'TKO!' : r.method === 'SUB' ? 'TAP OUT!' : r.method === 'DRAW' ? 'DRAW' : 'TO THE JUDGES';
        this.hooks.bigText(txt, 2600);
        void e;
        break;
      }
    }
  }

  /** Called every animation frame. */
  frame(realDt: number) {
    const e = this.engine;
    // gather input once per frame; actions are delivered to the first sim step
    const cmd = this.player.update();
    this.pendingActions.push(...cmd.actions);
    if (cmd.subKey) this.pendingSub = cmd.subKey;
    if (this.paused) {
      this.pendingActions = [];
      this.render(0);
      return;
    }
    if (this.slowT > 0) {
      this.slowT -= realDt;
      if (this.slowT <= 0) this.timeScale = 1;
    }
    const simDt = realDt * this.timeScale;
    this.acc += simDt;
    let steps = 0;
    while (this.acc >= STEP && steps < 6) {
      this.acc -= STEP;
      steps++;
      if (e.status !== 'fighting') continue;
      const pc = { ...cmd, actions: this.pendingActions, subKey: this.pendingSub };
      this.pendingActions = [];
      this.pendingSub = undefined;
      e.update(STEP, [pc, this.ai.update(STEP)]);
      this.replay.record();
    }
    if (e.status === 'finished') this.finishedFor += realDt;
    this.crowd.update(realDt);
    this.commentary.update();
    for (const l of this.commentary.take()) if (this.settings.commentary) this.hooks.commentary(l.text, l.voice === 'color');
    for (const c of this.crowd.takeCues()) audio.cue(c);
    audio.crowd(this.crowd.excitement, e.status === 'fighting');
    this.render(simDt);
  }

  render(simDt: number) {
    this.visTime += simDt || 0;
    this.renderer.render(snapshot(this.engine), Math.max(simDt, 1 / 240), this.visTime, this.crowd.excitement);
  }
}
