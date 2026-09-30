import { EventBus } from '../core/EventBus';
import { vdist, vnorm, vsub } from '../core/math';
import { Rng } from '../core/rng';
import type { StrikeContext } from '../data';
import { DamageSystem } from './DamageSystem';
import { FightStatistics } from './FightStatistics';
import { createFighterState } from './FighterState';
import { GrapplingSystem } from './GrapplingSystem';
import { JudgeSystem } from './JudgeSystem';
import { MovementSystem } from './MovementSystem';
import { RoundManager } from './RoundManager';
import { StaminaSystem } from './StaminaSystem';
import { StrikeSystem } from './StrikeSystem';
import { SubmissionSystem } from './SubmissionSystem';
import { TUNING } from './tuning';
import {
  emptyCommand, type ClinchState, type Command, type CommandAction, type FightConfig, type FightEvent, type FighterContext,
  type FighterState, type FightMode, type FightResult, type FightStatus, type FinishMethod, type GroundState, type Side,
  type SubmissionState,
} from './types';

export interface LoggedEvent {
  time: number;
  round: number;
  clock: number;
  ev: FightEvent;
}

/**
 * The fight simulation. Pure TypeScript, no DOM: the same engine runs the player's fight in the
 * browser, AI-vs-AI tournament fights, and headless balance tests.
 */
export class FightEngine {
  readonly cfg: FightConfig;
  readonly rng: Rng;
  readonly bus = new EventBus<FightEvent>();
  readonly f: [FighterState, FighterState];

  mode: FightMode = 'stand';
  clinch: ClinchState | null = null;
  ground: GroundState | null = null;
  sub: SubmissionState | null = null;
  status: FightStatus = 'prefight';
  round = 1;
  clock: number;
  time = 0;
  roundTime = 0;
  result: FightResult | null = null;
  lastLanded: [number, number] = [-99, -99];
  lastMiss: [number, number] = [-99, -99];
  lastCmds: [Command, Command] = [emptyCommand(), emptyCommand()];
  log: LoggedEvent[] = [];
  private tick = 0;

  /** Alternating processing order so neither corner systematically wins simultaneous exchanges. */
  order(): FighterState[] {
    return this.tick % 2 === 0 ? [this.f[0], this.f[1]] : [this.f[1], this.f[0]];
  }

  readonly stats = new FightStatistics();
  readonly judges: JudgeSystem;
  readonly movement = new MovementSystem(this);
  readonly strikes = new StrikeSystem(this);
  readonly damage = new DamageSystem(this);
  readonly stamina = new StaminaSystem(this);
  readonly grappling = new GrapplingSystem(this);
  readonly submission = new SubmissionSystem(this);
  readonly rounds = new RoundManager(this);

  constructor(cfg: FightConfig) {
    this.cfg = cfg;
    this.rng = new Rng(cfg.seed);
    this.judges = new JudgeSystem(this.rng.fork());
    this.f = [createFighterState(cfg.fighters[0], 0), createFighterState(cfg.fighters[1], 1)];
    const d = TUNING.startDistance / 2;
    this.f[0].pos = { x: -d, z: 0 };
    this.f[1].pos = { x: d, z: 0 };
    this.clock = cfg.roundSeconds;
    for (const f of this.f) f.form = Math.max(0.85, Math.min(1.15, 1 + this.rng.gauss() * 0.06));
  }

  emit(ev: FightEvent) {
    this.stats.onEvent(ev);
    this.log.push({ time: this.time, round: this.round, clock: this.clock, ev });
    this.bus.emit(ev);
  }

  start() {
    if (this.status !== 'prefight') return;
    this.stats.startRound();
    this.status = 'fighting';
    this.emit({ type: 'roundStart', round: 1 });
  }

  startNextRound() {
    this.rounds.startNextRound();
  }

  distance() {
    return vdist(this.f[0].pos, this.f[1].pos);
  }

  opponent(side: Side) {
    return this.f[side === 0 ? 1 : 0];
  }

  strikeContext(side: Side): StrikeContext | null {
    switch (this.mode) {
      case 'stand': return 'stand';
      case 'clinch': return 'clinch';
      case 'ground': return this.ground!.top === side ? 'groundTop' : 'groundBottom';
      default: return null;
    }
  }

  context(side: Side): FighterContext {
    const f = this.f[side];
    if (this.status !== 'fighting') return 'idle';
    if (f.down) return 'down';
    if (this.mode === 'sub') return this.sub!.attacker === side ? 'subAttack' : 'subDefend';
    if (this.mode === 'stand' && this.opponent(side).down) return 'standingOverDowned';
    return (this.strikeContext(side) ?? 'stand') as FighterContext;
  }

  finish(winner: Side | null, method: FinishMethod, detail: string, decisionType?: 'Unanimous' | 'Split' | 'Majority', betweenRounds = false) {
    if (this.result) return;
    const elapsed = betweenRounds ? this.cfg.roundSeconds : this.cfg.roundSeconds - Math.max(0, this.clock);
    this.result = {
      winner, method, detail, round: this.round, time: elapsed,
      scorecards: this.judges.cards.map((c) => ({ judge: c.judge, rounds: [...c.rounds], total: [...c.total] as [number, number] })),
      decisionType,
    };
    this.status = 'finished';
    this.emit({ type: 'fightEnd', result: this.result });
  }

  update(dt: number, cmds: [Command, Command]) {
    if (this.status !== 'fighting') return;
    this.time += dt;
    this.roundTime += dt;
    this.tick++;
    this.lastCmds = cmds;
    this.applyCommands(dt, cmds);
    this.movement.update(dt, cmds);
    this.strikes.update(dt);
    if (this.result) return;
    this.grappling.update(dt);
    if (this.mode === 'sub') this.submission.update(dt, [cmds[0].subKey, cmds[1].subKey]);
    if (this.result) return;
    this.damage.update(dt);
    this.stamina.update(dt);
    this.trackAggression(dt);
    this.rounds.update(dt);
  }

  private trackAggression(dt: number) {
    if (this.mode !== 'stand') return;
    for (const f of this.f) {
      const o = this.opponent(f.side);
      const to = vnorm(vsub(o.pos, f.pos));
      const fwd = f.vel.x * to.x + f.vel.z * to.z;
      if (fwd > 0.3 && this.distance() < 3.2) this.stats.addAggression(f.side, dt * this.cfg.clockSpeed);
    }
  }

  private applyCommands(dt: number, cmds: [Command, Command]) {
    for (const f of this.order()) {
      const cmd = cmds[f.side];
      const act = f.action;
      const canGuard = !f.down && this.mode !== 'sub' && (!act || act.kind === 'defense' || act.kind === 'stun' || act.kind === 'recover' || act.kind === 'getup' || act.kind === 'transition');
      f.guard = canGuard ? cmd.guard : 'none';
      if (f.buffered) {
        f.buffered.t -= dt;
        if (f.buffered.t <= 0) f.buffered = null;
        else if (this.tryAction(f, f.buffered.a)) f.buffered = null;
      }
      for (const a of cmd.actions) {
        if (this.status !== 'fighting') return;
        if (!this.tryAction(f, a) && (a.type === 'strike' || a.type === 'defend' || a.type === 'feint')) {
          f.buffered = { a, t: TUNING.bufferTime };
        }
      }
    }
  }

  private tryAction(f: FighterState, a: CommandAction): boolean {
    if (this.mode === 'sub' || this.status !== 'fighting') return false;
    switch (a.type) {
      case 'strike':
        if (this.context(f.side) === 'standingOverDowned') return this.grappling.pounce(f);
        return this.strikes.start(f, a.id, false);
      case 'feint':
        return this.mode === 'stand' && this.strikes.start(f, a.id, true);
      case 'defend':
        return this.strikes.startDefense(f, a.move, a.dir);
      case 'clinch':
        return this.grappling.attemptClinch(f);
      case 'takedown':
        return this.grappling.attemptTakedown(f, a.variant);
      case 'transition':
        return this.grappling.attemptTransition(f, a.alt);
      case 'submission':
        return this.submission.attempt(f, a.index);
      case 'getup':
        return this.grappling.attemptGetUp(f);
      case 'switchStance':
        if (this.mode !== 'stand' || f.action || f.down) return false;
        f.stance = f.stance === 'orthodox' ? 'southpaw' : 'orthodox';
        this.stamina.spend(f, 0.5);
        this.emit({ type: 'switchStance', side: f.side });
        return true;
    }
  }
}
