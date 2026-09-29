/**
 * GameSimulation — the play-by-play football engine.
 *
 * The engine is a stepwise state machine: every call to step() resolves exactly one play (or period
 * transition) and returns a PlayEvent describing it. The visualizer only ever *reads* PlayEvents; it
 * never influences outcomes. Coaching settings can change between steps, and a seeded RNG makes a game
 * fully reproducible for a given seed and sequence of decisions.
 */
import { FORMATIONS, GAME_CONFIG, OFF_SCHEMES, DEF_SCHEMES, PASS_CONCEPTS, RUN_CONCEPTS } from '../../data';
import { Rng } from '../../core/rng';
import { avg, clamp } from '../../core/util';
import type { CoachingSettings, GameResult, Player, Position, Side, StatLine, Weather } from '../../models/types';
import { GameStats } from './stats';
import {
  buildSideContext,
  defensiveFront,
  eff,
  FATIGUE_COST,
  FatigueTracker,
  pickRotation,
  type SideContext,
} from './personnel';
import type {
  DefLineup,
  FourthDownChoice,
  GameSetup,
  OffLineup,
  PendingDecision,
  PlayEvent,
  PlayKind,
  StepOptions,
} from './types';
import { generateWeather } from './weather';

const other = (s: Side): Side => (s === 'home' ? 'away' : 'home');
const QUARTER = GAME_CONFIG.quarterLengthSec;
const HASH_LEFT = 53.33 / 2 - 6.67 / 2 - 3.33; // ~20 yds from far sideline (college hashes)
const HASH_RIGHT = 53.33 - HASH_LEFT;

const INJURY_TYPES: { type: string; weeks: [number, number]; w: number }[] = [
  { type: 'Ankle sprain', weeks: [1, 2], w: 26 },
  { type: 'Hamstring strain', weeks: [1, 3], w: 20 },
  { type: 'Concussion', weeks: [1, 3], w: 12 },
  { type: 'Shoulder sprain', weeks: [1, 4], w: 12 },
  { type: 'High ankle sprain', weeks: [3, 6], w: 10 },
  { type: 'Knee (MCL) sprain', weeks: [3, 6], w: 8 },
  { type: 'Broken hand', weeks: [2, 5], w: 5 },
  { type: 'Broken collarbone', weeks: [6, 9], w: 3 },
  { type: 'Torn ACL', weeks: [14, 16], w: 3 },
  { type: 'Achilles tear', weeks: [14, 16], w: 1 },
];

interface OtState {
  period: number;
  /** 0 = first possession of the period, 1 = second. */
  possession: 0 | 1;
  first: Side;
  shootout: boolean;
}

interface GState {
  quarter: number;
  clock: number;
  possession: Side;
  ballOn: number;
  down: number;
  distance: number;
  score: { home: number; away: number };
  timeouts: { home: number; away: number };
  clockRunning: boolean;
  phase: 'kickoff' | 'scrimmage' | 'pat' | 'final';
  kickingSide: Side;
  kickType: 'kickoff' | 'free_kick';
  openingReceiver: Side;
  ot: OtState | null;
  momentum: number; // + favors home
  driveIndex: number;
  driveRedZone: boolean;
  spotY: number;
}

export class GameSimulation {
  readonly setup: GameSetup;
  readonly weather: Weather;
  readonly events: PlayEvent[] = [];
  private rng: Rng;
  /** Separate stream for visual-only randomness so visuals never perturb outcomes. */
  private vrng: Rng;
  private s: GState;
  private stats: GameStats;
  private ctx: Record<Side, SideContext>;
  private fatigue = new FatigueTracker();
  private knockedOut = new Set<string>();
  private appeared = new Set<string>();
  private injuries: GameResult['injuries'] = [];
  private scoring: GameResult['scoring'] = [];
  private homeEdge: number;
  /** Game-day form per side (rating points): some days a team just has it, some days it doesn't. */
  private form: Record<Side, number>;
  private rosterBySide: Record<Side, Player[]>;

  constructor(setup: GameSetup) {
    this.setup = setup;
    this.rng = new Rng(setup.seed);
    this.vrng = new Rng(setup.seed ^ 0x5f3759df);
    this.weather = setup.weather ?? generateWeather(this.rng.fork('weather'), setup.home.info, setup.week ?? 6, setup.neutralSite);
    this.ctx = { home: buildSideContext('home', setup), away: buildSideContext('away', setup) };
    this.rosterBySide = {
      home: setup.home.state.rosterIds.map((id) => setup.players[id]).filter(Boolean),
      away: setup.away.state.rosterIds.map((id) => setup.players[id]).filter(Boolean),
    };
    const teamOf = new Map<string, string>();
    for (const side of ['home', 'away'] as Side[]) for (const p of this.rosterBySide[side]) teamOf.set(p.id, setup[side].info.id);
    this.stats = new GameStats((id) => teamOf.get(id) ?? '');

    // Home-field edge in rating points: base + crowd size/passion, amplified for rivalries. Zero on neutral sites.
    const info = setup.home.info;
    const crowd = clamp(info.capacity / 105000, 0.2, 1) * 0.6 + (info.fanSupport / 100) * 0.4;
    this.homeEdge = setup.neutralSite ? 0 : GAME_CONFIG.homeFieldBase + GAME_CONFIG.homeFieldCrowdMax * crowd * (setup.rivalry ? 1.15 : 1);

    const formRng = this.rng.fork('form');
    const consistency = (side: Side) => {
      const qb = setup[side].state.depthChart.QB?.[0];
      return setup.players[qb ?? '']?.hidden.consistency ?? 50;
    };
    this.form = {
      home: formRng.normal(0, 4.0 - consistency('home') / 60),
      away: formRng.normal(0, 4.0 - consistency('away') / 60),
    };

    const openingReceiver: Side = this.rng.chance(0.5) ? 'home' : 'away';
    this.s = {
      quarter: 1,
      clock: QUARTER,
      possession: openingReceiver,
      ballOn: 25,
      down: 1,
      distance: 10,
      score: { home: 0, away: 0 },
      timeouts: { home: GAME_CONFIG.timeoutsPerHalf, away: GAME_CONFIG.timeoutsPerHalf },
      clockRunning: false,
      phase: 'kickoff',
      kickingSide: other(openingReceiver),
      kickType: 'kickoff',
      openingReceiver,
      ot: null,
      momentum: 0,
      driveIndex: 0,
      driveRedZone: false,
      spotY: 53.33 / 2,
    };
  }

  // ─────────────────────────────── public API ───────────────────────────────

  get isFinal(): boolean {
    return this.s.phase === 'final';
  }

  get score() {
    return { ...this.s.score };
  }

  /** Snapshot for the scoreboard. */
  get situation() {
    const s = this.s;
    return {
      quarter: s.quarter,
      clock: s.clock,
      possession: s.possession,
      ballOn: s.ballOn,
      down: s.down,
      distance: s.distance,
      score: { ...s.score },
      timeouts: { ...s.timeouts },
      phase: s.phase,
      ot: s.ot ? { ...s.ot } : null,
    };
  }

  setSettings(side: Side, settings: CoachingSettings): void {
    this.setup[side].settings = settings;
  }

  /** A 4th-down decision the user should make before the next step, if any. */
  pendingDecision(): PendingDecision | null {
    const s = this.s;
    if (!this.setup.promptFourthDown || s.phase !== 'scrimmage' || s.down !== 4) return null;
    if (!this.setup[s.possession].isUser) return null;
    if (!s.ot && s.clock <= 0) return null;
    if (this.shouldKneel()) return null;
    const fgDist = 117 - s.ballOn;
    return {
      kind: 'fourth_down',
      side: s.possession,
      distance: s.distance,
      ballOn: s.ballOn,
      fieldGoalDistance: fgDist,
      recommendation: this.aiFourthDown(),
      canPunt: !s.ot,
    };
  }

  step(opts: StepOptions = {}): PlayEvent | null {
    const s = this.s;
    if (s.phase === 'final') return null;
    if (!s.ot && s.clock <= 0 && s.phase !== 'pat') return this.endPeriod();
    if (s.phase === 'kickoff') return this.kickoff();
    if (s.phase === 'pat') return this.conversion();
    return this.scrimmage(opts);
  }

  simulateToEnd(maxPlays = 1000): void {
    let n = 0;
    while (!this.isFinal && n++ < maxPlays) this.step();
    if (!this.isFinal) throw new Error('Game failed to finish');
  }

  result(): GameResult {
    const home = this.stats.team.home;
    const away = this.stats.team.away;
    home.score = this.s.score.home;
    away.score = this.s.score.away;
    // Games played: everyone who took a snap. Built on copies so result() can be called repeatedly (live box score).
    const byId = new Map(this.stats.lines().map((l) => [l.playerId, { ...l }]));
    for (const id of this.appeared) {
      const line = byId.get(id);
      if (line) line.gp = 1;
      else {
        const teamId = this.setup.players[id]?.teamId;
        if (teamId) byId.set(id, { playerId: id, teamId, gp: 1 });
      }
    }
    return {
      homeScore: this.s.score.home,
      awayScore: this.s.score.away,
      overtimePeriods: this.s.ot ? this.s.ot.period : 0,
      home: { ...home, scoreByPeriod: [...home.scoreByPeriod] },
      away: { ...away, scoreByPeriod: [...away.scoreByPeriod] },
      playerLines: [...byId.values()],
      scoring: [...this.scoring],
      injuries: [...this.injuries],
      plays: this.events.length,
      weather: this.weather,
    };
  }

  // ─────────────────────────────── helpers ───────────────────────────────

  private homeDir(): 1 | -1 {
    const q = this.s.quarter;
    if (q > 4) return 1;
    return q % 2 === 1 ? 1 : -1;
  }

  private dirFor(side: Side): 1 | -1 {
    const d = this.homeDir();
    return side === 'home' ? d : (-d as 1 | -1);
  }

  private sign(side: Side): number {
    return side === 'home' ? 1 : -1;
  }

  private inside2(): boolean {
    const q = this.s.quarter;
    return (q === 2 || q === 4) && this.s.clock <= GAME_CONFIG.clockStopsOnFirstDownInsideSec;
  }

  private margin(side: Side): number {
    return this.s.score[side] - this.s.score[other(side)];
  }

  private name(id?: string): string {
    if (!id) return 'Unknown';
    const p = this.setup.players[id];
    return p ? `#${p.jersey} ${p.firstName[0]}. ${p.lastName}` : 'Unknown';
  }

  private abbr(side: Side): string {
    return this.setup[side].info.abbreviation;
  }

  private fieldLabel(ballOn: number, offense: Side): string {
    if (ballOn === 50) return '50';
    return ballOn < 50 ? `${this.abbr(offense)} ${ballOn}` : `${this.abbr(other(offense))} ${100 - ballOn}`;
  }

  private avail(side: Side, pos: Position): Player[] {
    return this.ctx[side].avail[pos].filter((p) => !this.knockedOut.has(p.id));
  }

  private bonus(side: Side, unit: 'off' | 'def'): number {
    const c = this.ctx[side];
    const home = side === 'home' ? this.homeEdge : 0;
    const mom = this.s.momentum * this.sign(side) * 1.2;
    // Vanilla play calling and reserves when the game is out of hand.
    const letUp = unit === 'off' && this.garbageTime(side) ? -5 : 0;
    return (unit === 'off' ? c.offCoachBonus : c.defCoachBonus) + home + mom + this.form[side] + letUp;
  }

  private e(p: Player | undefined, attr: string, side: Side, unit: 'off' | 'def'): number {
    return eff(p, attr, this.ctx[side], this.fatigue, this.bonus(side, unit));
  }

  private baseEvent(kind: PlayKind): PlayEvent {
    const s = this.s;
    return {
      index: this.events.length,
      driveIndex: s.driveIndex,
      quarter: s.quarter,
      clockBefore: s.clock,
      clockAfter: s.clock,
      offense: s.possession,
      down: s.down,
      distance: s.distance,
      ballOn: s.ballOn,
      direction: this.dirFor(s.possession),
      kind,
      yards: 0,
      scoreAfter: { ...s.score },
      possessionAfter: s.possession,
      ballOnAfter: s.ballOn,
      downAfter: s.down,
      distanceAfter: s.distance,
      timeoutsAfter: { ...s.timeouts },
      quarterAfter: s.quarter,
      text: '',
      spotY: s.spotY,
      spotYAfter: s.spotY,
    };
  }

  private finish(ev: PlayEvent): PlayEvent {
    const s = this.s;
    ev.clockAfter = s.clock;
    ev.scoreAfter = { ...s.score };
    ev.possessionAfter = s.possession;
    ev.ballOnAfter = s.ballOn;
    ev.downAfter = s.down;
    ev.distanceAfter = s.distance;
    ev.timeoutsAfter = { ...s.timeouts };
    ev.quarterAfter = s.quarter;
    ev.final = s.phase === 'final';
    ev.spotYAfter = s.spotY;
    this.s.momentum = clamp(this.s.momentum * 0.92, -1, 1);
    this.events.push(ev);
    return ev;
  }

  /** Lateral landing spot for the next snap (visual only). */
  private nextSpot(lateralHint = 0): void {
    const y = this.s.spotY + lateralHint + this.vrng.normal(0, 4);
    this.s.spotY = clamp(y, HASH_LEFT, HASH_RIGHT);
  }

  private resetSpot(): void {
    this.s.spotY = 53.33 / 2;
  }

  private runClock(sec: number, offense: Side): void {
    if (this.s.ot) return;
    const used = Math.min(this.s.clock, Math.max(0, sec));
    this.s.clock = Math.max(0, this.s.clock - sec);
    this.stats.team[offense].timeOfPossession += used;
  }

  private addPoints(side: Side, pts: number, type: string, text: string): void {
    this.s.score[side] += pts;
    const periodIdx = Math.min(this.s.quarter, 5) - 1;
    const byP = this.stats.team[side].scoreByPeriod;
    while (byP.length <= periodIdx) byP.push(0);
    byP[periodIdx] += pts;
    this.scoring.push({
      quarter: this.s.quarter,
      clock: this.s.clock,
      teamId: this.setup[side].info.id,
      text: `${type}: ${text}`,
      home: this.s.score.home,
      away: this.s.score.away,
    });
  }

  private newDrive(side: Side, ballOn: number): void {
    const s = this.s;
    s.possession = side;
    s.ballOn = clamp(Math.round(ballOn), 1, 99);
    s.down = 1;
    s.distance = Math.min(10, 100 - s.ballOn);
    s.driveIndex++;
    s.driveRedZone = false;
  }

  private markAppeared(ids: string[]): void {
    for (const id of ids) this.appeared.add(id);
  }

  private tire(onField: string[]): void {
    const set = new Set(onField);
    for (const side of ['home', 'away'] as Side[]) {
      this.fatigue.update(set, this.rosterBySide[side], (p) => FATIGUE_COST[p.position]);
    }
  }

  /** Chance of an injury to a player involved in contact. */
  private maybeInjure(ev: PlayEvent, ids: (string | undefined)[], side: Side[]): void {
    if (ev.injury) return;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (!id) continue;
      const p = this.setup.players[id];
      if (!p) continue;
      const risk = 0.0032 * (0.5 + p.hidden.injuryRisk / 80);
      if (!this.rng.chance(risk)) continue;
      const kind = this.rng.weighted(INJURY_TYPES, (t) => t.w);
      const weeks = this.rng.int(kind.weeks[0], kind.weeks[1]);
      this.knockedOut.add(id);
      ev.injury = { playerId: id, side: side[i], type: kind.type, weeks };
      this.injuries.push({ playerId: id, teamId: this.setup[side[i]].info.id, type: kind.type, weeks });
      return;
    }
  }

  // ─────────────────────────────── period flow ───────────────────────────────

  private endPeriod(): PlayEvent {
    const s = this.s;
    const ev = this.baseEvent('period_end');
    const q = s.quarter;
    if (q === 1 || q === 3) {
      ev.text = `End of the ${q === 1 ? '1st' : '3rd'} quarter.`;
      ev.highlight = 'END OF QUARTER';
      s.quarter++;
      s.clock = QUARTER;
      s.clockRunning = false;
    } else if (q === 2) {
      ev.text = 'Halftime.';
      ev.highlight = 'HALFTIME';
      s.quarter = 3;
      s.clock = QUARTER;
      s.clockRunning = false;
      s.timeouts = { home: GAME_CONFIG.timeoutsPerHalf, away: GAME_CONFIG.timeoutsPerHalf };
      s.phase = 'kickoff';
      s.kickType = 'kickoff';
      s.kickingSide = s.openingReceiver;
      s.possession = other(s.openingReceiver);
      this.resetSpot();
    } else if (q === 4) {
      if (s.score.home === s.score.away) {
        ev.text = 'End of regulation — we are headed to OVERTIME!';
        ev.highlight = 'OVERTIME';
        const first: Side = this.rng.chance(0.5) ? 'home' : 'away';
        s.quarter = 5;
        s.clock = 0;
        s.ot = { period: 1, possession: 0, first, shootout: false };
        s.timeouts = { home: GAME_CONFIG.overtime.timeoutsPerPeriod, away: GAME_CONFIG.overtime.timeoutsPerPeriod };
        this.startOtPossession(first);
      } else {
        this.endGame(ev);
      }
    }
    return this.finish(ev);
  }

  private endGame(ev: PlayEvent): void {
    const s = this.s;
    s.phase = 'final';
    const w: Side = s.score.home > s.score.away ? 'home' : 'away';
    ev.highlight = ev.highlight ?? 'FINAL';
    const ot = s.ot ? ` (${s.ot.period > 1 ? s.ot.period : ''}OT)` : '';
    ev.text = `${ev.text ? ev.text + ' ' : ''}FINAL${ot}: ${this.setup[w].info.school} ${s.score[w]}, ${this.setup[other(w)].info.school} ${s.score[other(w)]}.`;
  }

  private startOtPossession(side: Side): void {
    const s = this.s;
    const cfg = GAME_CONFIG.overtime;
    this.newDrive(side, cfg.startBallOn);
    this.resetSpot();
    s.clockRunning = false;
    if (s.ot && s.ot.period >= cfg.twoPointShootoutFromPeriod) {
      s.ot.shootout = true;
      s.phase = 'pat';
    } else s.phase = 'scrimmage';
  }

  /** An overtime possession has ended (score, turnover, downs or missed kick). */
  private endOtPossession(ev: PlayEvent): void {
    const s = this.s;
    const ot = s.ot!;
    if (ot.possession === 0) {
      ot.possession = 1;
      this.startOtPossession(other(ot.first));
      return;
    }
    if (s.score.home !== s.score.away || ot.period >= GAME_CONFIG.overtime.maxPeriods) {
      if (s.score.home === s.score.away) {
        // Safety valve: never allow a tie (extremely unlikely). Home crowd wins the coin flip.
        s.score.home += 2;
      }
      this.endGame(ev);
      return;
    }
    ot.period++;
    ot.possession = 0;
    ot.first = other(ot.first);
    s.quarter++;
    s.timeouts = { home: GAME_CONFIG.overtime.timeoutsPerPeriod, away: GAME_CONFIG.overtime.timeoutsPerPeriod };
    this.startOtPossession(ot.first);
  }

  /** In the 2nd possession of an OT period, a go-ahead score ends the game immediately. */
  private otWalkoff(): boolean {
    const s = this.s;
    if (!s.ot || s.ot.possession !== 1) return false;
    return this.margin(s.possession) > 0;
  }

  // ─────────────────────────────── kicks ───────────────────────────────

  private kickoffUnit(side: Side, kicker?: Player): string[] {
    const ids: string[] = [];
    if (kicker) ids.push(kicker.id);
    const order: Position[] = ['LB', 'S', 'CB', 'WR', 'TE', 'RB', 'DL'];
    for (const pos of order) {
      for (const p of this.avail(side, pos).slice(1, 4)) {
        if (ids.length >= 11) break;
        if (!ids.includes(p.id)) ids.push(p.id);
      }
    }
    return ids.slice(0, 11);
  }

  private returnUnit(side: Side, returner?: Player): string[] {
    const ids: string[] = [];
    if (returner) ids.push(returner.id);
    const order: Position[] = ['WR', 'CB', 'S', 'LB', 'TE', 'RB', 'OL'];
    for (const pos of order) {
      for (const p of this.avail(side, pos).slice(1, 4)) {
        if (ids.length >= 11) break;
        if (!ids.includes(p.id)) ids.push(p.id);
      }
    }
    return ids.slice(0, 11);
  }

  private bestReturner(side: Side, punt: boolean): Player | undefined {
    const pool = [...this.avail(side, 'WR').slice(0, 5), ...this.avail(side, 'RB').slice(0, 3), ...this.avail(side, 'CB').slice(0, 4)];
    const score = (p: Player) => (p.attributes.speed ?? 60) + (p.attributes.acceleration ?? 60) * 0.5 + (punt ? (p.attributes.hands ?? 60) * 0.3 : 0);
    // Starters rarely return kicks: prefer backups with speed.
    return pool.sort((a, b) => score(b) - score(a))[1] ?? pool[0];
  }

  private kickoff(): PlayEvent {
    const s = this.s;
    const k = s.kickingSide;
    const r = other(k);
    s.possession = k;
    const ev = this.baseEvent(s.kickType === 'free_kick' ? 'free_kick' : 'kickoff');
    ev.offense = k;
    ev.direction = this.dirFor(k);
    const from = s.kickType === 'free_kick' ? GAME_CONFIG.safetyFreeKickFrom : GAME_CONFIG.kickoffFrom;
    ev.ballOn = from;
    ev.down = 0;
    ev.distance = 0;
    const kicker = this.avail(k, 'K')[0] ?? this.avail(k, 'P')[0];
    const returner = this.bestReturner(r, false);
    ev.kicker = kicker?.id;
    ev.returner = returner?.id;
    ev.kickUnit = this.kickoffUnit(k, kicker);
    ev.returnUnit = this.returnUnit(r, returner);
    this.markAppeared([...ev.kickUnit, ...ev.returnUnit]);
    this.resetSpot();

    const power = kicker?.attributes.power ?? 65;
    const trailing = -this.margin(k);
    const onside = s.kickType === 'kickoff' && !s.ot && s.quarter === 4 && s.clock < 200 && trailing > 0 && trailing <= 16;

    if (onside) {
      ev.kind = 'onside_kick';
      ev.kickDistance = 10 + this.rng.int(0, 3);
      if (this.rng.chance(0.13)) {
        ev.kickResult = 'recovered';
        ev.highlight = 'ONSIDE RECOVERED';
        this.newDrive(k, from + ev.kickDistance);
        ev.text = `ONSIDE KICK by ${this.name(kicker?.id)} — RECOVERED by ${this.abbr(k)}!`;
        s.momentum += this.sign(k) * 0.4;
      } else {
        ev.kickResult = 'returned';
        this.newDrive(r, 100 - (from + ev.kickDistance));
        ev.text = `Onside kick by ${this.name(kicker?.id)} is recovered by ${this.abbr(r)} at the ${this.fieldLabel(s.ballOn, r)}.`;
      }
      this.runClock(3, k);
      s.clockRunning = false;
      s.phase = 'scrimmage';
      return this.finish(ev);
    }

    const dist = s.kickType === 'free_kick' ? this.rng.normal(44 + (power - 75) * 0.2, 6) : this.rng.normal(61 + (power - 75) * 0.3, 5);
    const landing = from + dist; // in kicking team frame
    ev.kickDistance = Math.round(dist);
    const spot = Math.round(100 - landing); // receiving frame
    const retSpeed = returner?.attributes.speed ?? 75;

    if (s.kickType === 'kickoff' && this.rng.chance(0.012)) {
      ev.kickResult = 'out_of_bounds';
      this.newDrive(r, 35);
      ev.text = `${this.name(kicker?.id)} kicks it out of bounds. Penalty — ${this.abbr(r)} ball at the ${this.fieldLabel(35, r)}.`;
      s.phase = 'scrimmage';
      s.clockRunning = false;
      return this.finish(ev);
    }

    if (spot <= 0 && (spot < -4 || this.rng.chance(0.85))) {
      ev.kickResult = 'touchback';
      this.newDrive(r, GAME_CONFIG.touchbackKickoff);
      ev.text = `${this.name(kicker?.id)} kicks ${ev.kickDistance} yards into the end zone. Touchback.`;
    } else if (spot > 0 && spot <= 25 && this.rng.chance(0.3)) {
      ev.kickResult = 'fair_catch';
      this.newDrive(r, GAME_CONFIG.fairCatchKickoff);
      ev.text = `${this.name(kicker?.id)} kicks ${ev.kickDistance} yards. Fair catch by ${this.name(returner?.id)} — ball placed at the ${this.fieldLabel(25, r)}.`;
    } else {
      ev.kickResult = 'returned';
      const start = Math.max(spot, -3);
      let ret = Math.max(2, this.rng.normal(22 + (retSpeed - 80) * 0.25, 7));
      if (this.rng.chance(0.035)) ret += 10 + this.rng.exp(20);
      ret = Math.max(Math.round(ret), 8 - start);
      const end = start + ret;
      const tackler = this.rng.pick(ev.kickUnit.slice(1));
      ev.returnYards = ret;
      this.stats.add(returner?.id, 'kr', 1);
      this.stats.add(returner?.id, 'krYds', Math.min(ret, 100 - start));
      this.runClock(5 + ret / 9, r);
      if (end >= 100) {
        ev.yards = 100 - start;
        this.stats.add(returner?.id, 'krTD', 1);
        ev.highlight = 'TOUCHDOWN';
        ev.text = `${this.name(returner?.id)} takes the kickoff ${100 - start} yards for a TOUCHDOWN!`;
        s.possession = r;
        this.touchdown(ev, r, `${this.name(returner?.id)} kickoff return`);
        return this.finish(ev);
      }
      if (this.rng.chance(0.006)) {
        ev.turnover = 'fumble';
        ev.highlight = 'FUMBLE';
        ev.tackler = tackler;
        this.stats.add(returner?.id, 'fumbles', 1);
        this.stats.add(returner?.id, 'fumblesLost', 1);
        this.stats.add(tackler, 'forcedFum', 1);
        this.stats.team[r].turnovers++;
        this.newDrive(k, 100 - end);
        ev.text = `${this.name(returner?.id)} returns the kick but FUMBLES! Recovered by ${this.abbr(k)} at the ${this.fieldLabel(s.ballOn, k)}.`;
        s.momentum += this.sign(k) * 0.35;
      } else {
        ev.tackler = tackler;
        this.stats.add(tackler, 'tackles', 1);
        this.newDrive(r, end);
        ev.text = `${this.name(kicker?.id)} kicks ${ev.kickDistance} yards, returned ${ret} yards by ${this.name(returner?.id)} to the ${this.fieldLabel(s.ballOn, r)}.`;
        if (ret >= 40) ev.highlight = 'BIG PLAY';
      }
      this.nextSpot(this.vrng.normal(0, 6));
    }
    s.phase = 'scrimmage';
    s.clockRunning = false;
    return this.finish(ev);
  }

  private fgProbability(kicker: Player | undefined, dist: number, side: Side): number {
    const power = kicker?.attributes.power ?? 60;
    const acc = kicker?.attributes.accuracy ?? 60;
    let L = 48 + (power - 75) * 0.28 + (acc - 75) * 0.18;
    if (this.weather.condition === 'wind') L -= 4;
    if (this.weather.condition === 'snow') L -= 3;
    if (this.weather.condition === 'rain') L -= 1.5;
    const pressure = side === 'away' ? this.homeEdge * 0.3 : 0;
    const p = 1 / (1 + Math.exp((dist - L + pressure) / 4.3));
    return clamp(p, 0.01, 0.985);
  }

  private fieldGoal(ev: PlayEvent): PlayEvent {
    const s = this.s;
    const off = s.possession;
    const def = other(off);
    ev.kind = 'field_goal';
    const kicker = this.avail(off, 'K')[0] ?? this.avail(off, 'P')[0];
    const holder = this.avail(off, 'P')[0] ?? this.avail(off, 'QB')[1];
    ev.kicker = kicker?.id;
    ev.kickUnit = [kicker?.id, holder?.id, ...this.avail(off, 'OL').slice(0, 5).map((p) => p.id), ...this.avail(off, 'TE').slice(0, 2).map((p) => p.id)].filter(
      (x): x is string => !!x,
    );
    ev.returnUnit = this.defLineupIds(def, 1, false);
    this.markAppeared(ev.kickUnit);
    const dist = 100 - s.ballOn + 17;
    ev.kickDistance = dist;
    this.stats.add(kicker?.id, 'fga', 1);
    this.runClock(5, off);
    if (this.rng.chance(0.012)) {
      ev.kickResult = 'blocked';
      ev.highlight = 'BLOCKED';
      ev.text = `${dist}-yard field goal attempt by ${this.name(kicker?.id)} is BLOCKED!`;
      s.momentum += this.sign(def) * 0.3;
      if (s.ot) {
        this.endOtPossession(ev);
      } else {
        this.newDrive(def, 100 - (s.ballOn - 7));
        s.clockRunning = false;
      }
      return this.finish(ev);
    }
    const p = this.fgProbability(kicker, dist, off);
    if (this.rng.chance(p)) {
      ev.kickResult = 'good';
      ev.highlight = 'FIELD GOAL';
      this.stats.add(kicker?.id, 'fgm', 1);
      this.stats.add(kicker?.id, 'fgLong', dist);
      ev.score = { team: off, type: 'FG', points: 3 };
      this.addPoints(off, 3, 'FG', `${this.name(kicker?.id)} ${dist} yd field goal`);
      ev.text = `${this.name(kicker?.id)}'s ${dist}-yard field goal is GOOD.`;
      s.momentum += this.sign(off) * 0.08;
      if (s.ot) {
        if (this.otWalkoff()) this.endGame(ev);
        else this.endOtPossession(ev);
      } else {
        s.phase = 'kickoff';
        s.kickType = 'kickoff';
        s.kickingSide = off;
      }
    } else {
      ev.kickResult = 'no_good';
      ev.highlight = 'NO GOOD';
      const side = this.vrng.chance(0.5) ? 'wide left' : 'wide right';
      ev.text = `${this.name(kicker?.id)}'s ${dist}-yard field goal attempt is NO GOOD — ${dist >= 52 && this.vrng.chance(0.5) ? 'short' : side}.`;
      s.momentum += this.sign(def) * 0.12;
      if (s.ot) this.endOtPossession(ev);
      else {
        this.newDrive(def, Math.max(20, 100 - s.ballOn));
        s.clockRunning = false;
      }
    }
    return this.finish(ev);
  }

  private punt(ev: PlayEvent): PlayEvent {
    const s = this.s;
    const off = s.possession;
    const def = other(off);
    ev.kind = 'punt';
    const punter = this.avail(off, 'P')[0] ?? this.avail(off, 'K')[0];
    const returner = this.bestReturner(def, true);
    ev.kicker = punter?.id;
    ev.returner = returner?.id;
    ev.kickUnit = this.kickoffUnit(off, punter);
    ev.returnUnit = this.returnUnit(def, returner);
    this.markAppeared([...ev.kickUnit, ...ev.returnUnit]);
    const power = punter?.attributes.power ?? 60;
    const acc = punter?.attributes.accuracy ?? 60;
    this.stats.add(punter?.id, 'punts', 1);

    if (this.rng.chance(0.005)) {
      ev.kickResult = 'blocked';
      ev.highlight = 'BLOCKED';
      this.runClock(4, off);
      this.stats.add(punter?.id, 'puntYds', 0);
      const spot = s.ballOn - 8;
      if (spot <= 0) {
        ev.text = `The punt is BLOCKED and recovered in the end zone for a TOUCHDOWN!`;
        s.possession = def;
        s.ballOn = 99;
        this.touchdown(ev, def, 'blocked punt recovery');
        return this.finish(ev);
      }
      this.newDrive(def, 100 - spot);
      ev.text = `${this.name(punter?.id)}'s punt is BLOCKED! ${this.abbr(def)} takes over at the ${this.fieldLabel(s.ballOn, def)}.`;
      s.momentum += this.sign(def) * 0.4;
      s.clockRunning = false;
      return this.finish(ev);
    }

    let dist = this.rng.normal(41 + (power - 75) * 0.3, Math.max(3, 5.5 - (acc - 75) * 0.05));
    if (this.weather.condition === 'wind') dist -= 3;
    // Short fields: pooch it rather than kick through the end zone.
    const toGoal = 100 - s.ballOn;
    if (toGoal < 50) dist = Math.min(dist, toGoal - this.rng.int(2, 12) + (this.rng.chance(0.3) ? 12 : 0));
    dist = Math.round(Math.max(20, dist));
    const landing = s.ballOn + dist;
    ev.kickDistance = dist;
    this.stats.add(punter?.id, 'puntYds', Math.min(dist, toGoal));
    this.stats.add(punter?.id, 'puntLong', Math.min(dist, toGoal));

    if (landing >= 100) {
      if (landing - 100 < 4 && this.rng.chance(0.35)) {
        ev.kickResult = 'downed';
        const at = this.rng.int(2, 6);
        this.runClock(8, off);
        this.newDrive(def, at);
        ev.text = `${this.name(punter?.id)} punts ${toGoal - at} yards, downed at the ${this.fieldLabel(at, def)}.`;
      } else {
        ev.kickResult = 'touchback';
        this.runClock(7, off);
        this.newDrive(def, GAME_CONFIG.touchbackPunt);
        ev.text = `${this.name(punter?.id)} punts ${dist} yards into the end zone. Touchback.`;
      }
      s.clockRunning = false;
      this.resetSpot();
      return this.finish(ev);
    }

    const spot = 100 - landing; // receiving frame
    const r = this.rng.next();
    const fairP = spot < 15 ? 0.55 : 0.35;
    if (r < fairP) {
      ev.kickResult = 'fair_catch';
      this.runClock(8, off);
      this.newDrive(def, spot);
      ev.text = `${this.name(punter?.id)} punts ${dist} yards. Fair catch by ${this.name(returner?.id)} at the ${this.fieldLabel(spot, def)}.`;
    } else if (r < fairP + 0.08) {
      ev.kickResult = 'out_of_bounds';
      this.runClock(7, off);
      this.newDrive(def, spot);
      ev.text = `${this.name(punter?.id)} punts ${dist} yards, out of bounds at the ${this.fieldLabel(spot, def)}.`;
    } else if (spot < 12 && r < fairP + 0.2) {
      ev.kickResult = 'downed';
      this.runClock(8, off);
      this.newDrive(def, spot);
      ev.text = `${this.name(punter?.id)} punts ${dist} yards, downed at the ${this.fieldLabel(spot, def)}.`;
    } else if (this.rng.chance(0.012)) {
      ev.kickResult = 'muffed';
      ev.turnover = 'muff';
      ev.highlight = 'FUMBLE';
      this.runClock(8, off);
      this.stats.team[def].turnovers++;
      this.newDrive(off, landing);
      ev.text = `${this.name(punter?.id)} punts ${dist} yards — MUFFED by ${this.name(returner?.id)}! ${this.abbr(off)} recovers at the ${this.fieldLabel(s.ballOn, off)}.`;
      s.momentum += this.sign(off) * 0.4;
    } else {
      ev.kickResult = 'returned';
      const speed = returner?.attributes.speed ?? 75;
      let ret = Math.max(0, this.rng.normal(8 + (speed - 80) * 0.15, 6));
      if (this.rng.chance(0.03)) ret += 10 + this.rng.exp(18);
      ret = Math.round(ret);
      ev.returnYards = ret;
      this.stats.add(returner?.id, 'pr', 1);
      this.stats.add(returner?.id, 'prYds', Math.min(ret, 100 - spot));
      this.runClock(8 + ret / 9, off);
      if (spot + ret >= 100) {
        this.stats.add(returner?.id, 'prTD', 1);
        ev.text = `${this.name(punter?.id)} punts ${dist} yards and ${this.name(returner?.id)} takes it back ${100 - spot} yards for a TOUCHDOWN!`;
        s.possession = def;
        this.touchdown(ev, def, `${this.name(returner?.id)} punt return`);
        return this.finish(ev);
      }
      const tackler = this.rng.pick(ev.kickUnit.slice(1));
      ev.tackler = tackler;
      this.stats.add(tackler, 'tackles', 1);
      this.newDrive(def, spot + ret);
      ev.text = `${this.name(punter?.id)} punts ${dist} yards, returned ${ret} yards by ${this.name(returner?.id)} to the ${this.fieldLabel(s.ballOn, def)}.`;
      if (ret >= 25) ev.highlight = 'BIG PLAY';
    }
    s.clockRunning = false;
    this.nextSpot(this.vrng.normal(0, 5));
    return this.finish(ev);
  }

  // ─────────────────────────────── conversions ───────────────────────────────

  private goForTwo(side: Side): boolean {
    const s = this.s;
    if (s.ot) return s.ot.period >= GAME_CONFIG.overtime.mustGoForTwoFromPeriod;
    if (s.quarter < 4 && !(s.quarter === 3 && s.clock < 300)) return false;
    const m = this.margin(side); // after the touchdown
    const agg = this.setup[side].settings.aggressiveness;
    const chart = new Set([-10, -5, -2, 1, 5, 12]);
    if (agg === 'aggressive') chart.add(-8).add(-1).add(9);
    return chart.has(m);
  }

  private conversion(): PlayEvent {
    const s = this.s;
    const off = s.possession;
    const def = other(off);
    const two = s.ot?.shootout || this.goForTwo(off);
    const ev = this.baseEvent(two ? 'two_point' : 'extra_point');
    if (!two) {
      const kicker = this.avail(off, 'K')[0] ?? this.avail(off, 'P')[0];
      ev.kicker = kicker?.id;
      ev.ballOn = GAME_CONFIG.extraPointBallOn;
      ev.kickDistance = 100 - ev.ballOn + 17;
      ev.kickUnit = [kicker?.id, this.avail(off, 'P')[0]?.id, ...this.avail(off, 'OL').slice(0, 5).map((p) => p.id), ...this.avail(off, 'TE').slice(0, 2).map((p) => p.id)].filter(
        (x): x is string => !!x,
      );
      ev.returnUnit = this.defLineupIds(def, 1, false);
      this.stats.add(kicker?.id, 'xpa', 1);
      const acc = kicker?.attributes.accuracy ?? 60;
      const p = clamp(0.955 + (acc - 75) * 0.002 - (this.weather.condition === 'snow' ? 0.03 : 0), 0.86, 0.995);
      if (this.rng.chance(p)) {
        this.stats.add(kicker?.id, 'xpm', 1);
        ev.kickResult = 'good';
        ev.score = { team: off, type: 'XP', points: 1 };
        this.addPoints(off, 1, 'XP', `${this.name(kicker?.id)} extra point`);
        ev.text = `${this.name(kicker?.id)}'s extra point is good.`;
      } else {
        ev.kickResult = 'no_good';
        ev.highlight = 'NO GOOD';
        ev.text = `${this.name(kicker?.id)}'s extra point is NO GOOD!`;
      }
    } else {
      ev.ballOn = GAME_CONFIG.twoPointBallOn;
      ev.down = 0;
      ev.distance = 3;
      const lineup = this.offLineup(off, s.ballOn >= 97 ? 'goal_line' : 'shotgun_doubles');
      ev.formation = lineup.formation;
      ev.offLineup = lineup.ids;
      const dl = this.defLineup(def, lineup.wr, true);
      ev.defLineup = dl.ids;
      ev.defense = { blitz: false, coverage: 'man', front: dl.front };
      const passing = this.rng.chance(0.55);
      const offPower = passing ? this.passBlockRating(off, lineup.players) * 0.4 + avg(lineup.players.WR.map((p) => p.overall)) * 0.6 : this.runBlockRating(off, lineup.players);
      const defPower = passing ? this.coverageUnit(def, dl.players) : this.runDefRating(def, dl.players);
      const p = clamp(0.45 + (offPower - defPower) * 0.012, 0.25, 0.7);
      const ok = this.rng.chance(p);
      const qb = lineup.players.QB[0];
      if (passing) {
        const target = this.rng.pick([...lineup.players.WR, ...lineup.players.TE]);
        ev.passer = qb?.id;
        ev.target = target?.id;
        ev.airYards = 3;
        ev.complete = ok;
        ev.text = ok
          ? `Two-point try: ${this.name(qb?.id)} finds ${this.name(target?.id)} in the end zone. GOOD!`
          : `Two-point try: ${this.name(qb?.id)}'s pass for ${this.name(target?.id)} falls incomplete.`;
      } else {
        const rb = lineup.players.RB[0] ?? qb;
        ev.rusher = rb?.id;
        ev.text = ok ? `Two-point try: ${this.name(rb?.id)} pushes into the end zone. GOOD!` : `Two-point try: ${this.name(rb?.id)} is stopped short!`;
      }
      ev.yards = ok ? 3 : 0;
      ev.highlight = ok ? 'TWO-POINT GOOD' : 'TWO-POINT FAILED';
      if (ok) {
        ev.score = { team: off, type: '2PT', points: 2 };
        this.addPoints(off, 2, '2PT', ev.text.replace('Two-point try: ', ''));
      }
    }
    this.resetSpot();
    if (s.ot) {
      if (this.otWalkoff()) this.endGame(ev);
      else this.endOtPossession(ev);
    } else {
      s.phase = 'kickoff';
      s.kickType = 'kickoff';
      s.kickingSide = off;
    }
    s.clockRunning = false;
    return this.finish(ev);
  }

  private touchdown(ev: PlayEvent, side: Side, desc: string): void {
    const s = this.s;
    ev.score = { team: side, type: 'TD', points: 6 };
    ev.highlight = 'TOUCHDOWN';
    this.addPoints(side, 6, 'TD', desc);
    if (ev.offense === side && s.driveRedZone && ev.kind !== 'kickoff') this.stats.team[side].redZoneTD++;
    s.possession = side;
    s.ballOn = 97;
    s.down = 1;
    s.distance = 3;
    s.clockRunning = false;
    s.momentum += this.sign(side) * 0.3;
    this.resetSpot();
    if (s.ot && this.otWalkoff()) {
      this.endGame(ev);
      return;
    }
    s.phase = 'pat';
  }

  private safety(ev: PlayEvent, defense: Side): void {
    const s = this.s;
    ev.score = { team: defense, type: 'SAFETY', points: 2 };
    ev.highlight = 'SAFETY';
    this.addPoints(defense, 2, 'SAFETY', `${ev.tackler ? this.name(ev.tackler) : this.abbr(defense)} safety`);
    s.momentum += this.sign(defense) * 0.35;
    this.resetSpot();
    if (s.ot) {
      // Not possible in college OT from the 25, but keep the state machine sound.
      this.endOtPossession(ev);
      return;
    }
    s.phase = 'kickoff';
    s.kickType = 'free_kick';
    s.kickingSide = other(defense);
    s.clockRunning = false;
  }

  // ─────────────────────────────── personnel ───────────────────────────────

  /** Blowout: the leading team empties the bench. */
  private garbageTime(side: Side): boolean {
    const s = this.s;
    const m = this.margin(side);
    return !s.ot && ((s.quarter >= 3 && m >= 28) || (s.quarter === 2 && m >= 35) || (s.quarter === 4 && m >= 17 && s.clock < 300));
  }

  /** Available players at a position, skipping starters during garbage time. */
  private depth(side: Side, pos: Position, starters: number): Player[] {
    const list = this.avail(side, pos);
    if (!this.garbageTime(side) || list.length <= starters) return list;
    const skip = Math.min(starters, list.length - starters);
    return [...list.slice(skip), ...list.slice(0, skip)];
  }

  private offLineup(side: Side, formationId: string) {
    const f = FORMATIONS[formationId] ?? FORMATIONS.shotgun_doubles;
    const QB = this.depth(side, 'QB', 1).slice(0, 1);
    const RB = pickRotation(this.depth(side, 'RB', 1), f.personnel.RB, this.fatigue, 2);
    const WR = pickRotation(this.depth(side, 'WR', 3), f.personnel.WR, this.fatigue, 2);
    const TE = pickRotation(this.depth(side, 'TE', 1), f.personnel.TE, this.fatigue, 1);
    const OL = this.depth(side, 'OL', 5).slice(0, 5);
    const players = { QB, RB, WR, TE, OL };
    const ids: OffLineup = {
      QB: QB.map((p) => p.id),
      RB: RB.map((p) => p.id),
      WR: WR.map((p) => p.id),
      TE: TE.map((p) => p.id),
      OL: OL.map((p) => p.id),
    };
    return { formation: formationId, players, ids, wr: WR.length };
  }

  private defLineup(side: Side, offWR: number, goalLine: boolean) {
    const front = defensiveFront(this.ctx[side], offWR, goalLine);
    const DL = pickRotation(this.depth(side, 'DL', 4), front.DL, this.fatigue, 3);
    const LB = pickRotation(this.depth(side, 'LB', 3), front.LB, this.fatigue, 1);
    const CB = pickRotation(this.depth(side, 'CB', 2), front.CB, this.fatigue, 1);
    const S = pickRotation(this.depth(side, 'S', 2), front.S, this.fatigue, 1);
    const players = { DL, LB, CB, S };
    const ids: DefLineup = { DL: DL.map((p) => p.id), LB: LB.map((p) => p.id), CB: CB.map((p) => p.id), S: S.map((p) => p.id) };
    return { players, ids, front: front.name };
  }

  private defLineupIds(side: Side, wr: number, goal: boolean): string[] {
    const d = this.defLineup(side, wr, goal).ids;
    return [...d.DL, ...d.LB, ...d.CB, ...d.S];
  }

  // unit ratings (rating-point scale ~40-99)
  private runBlockRating(side: Side, o: { OL: Player[]; TE: Player[] }): number {
    const ol = avg(o.OL.map((p) => this.e(p, 'runBlock', side, 'off') * 0.65 + this.e(p, 'strength', side, 'off') * 0.35));
    const te = o.TE.map((p) => this.e(p, 'runBlock', side, 'off'));
    return (ol * 5 + te.reduce((a, b) => a + b, 0) * 0.6) / (5 + te.length * 0.6);
  }

  private passBlockRating(side: Side, o: { OL: Player[] }): number {
    return avg(o.OL.map((p) => this.e(p, 'passBlock', side, 'off') * 0.7 + this.e(p, 'footwork', side, 'off') * 0.3));
  }

  private runDefRating(side: Side, d: { DL: Player[]; LB: Player[]; CB: Player[]; S: Player[] }): number {
    const dl = avg(d.DL.map((p) => this.e(p, 'runDefense', side, 'def') * 0.5 + this.e(p, 'blockShed', side, 'def') * 0.3 + this.e(p, 'strength', side, 'def') * 0.2));
    const lb = avg(d.LB.map((p) => this.e(p, 'tackling', side, 'def') * 0.4 + this.e(p, 'blockShed', side, 'def') * 0.3 + this.e(p, 'awareness', side, 'def') * 0.3));
    const box = d.DL.length + d.LB.length;
    return dl * 0.55 + lb * 0.45 + (box - 7) * 1.8;
  }

  private passRushRating(side: Side, d: { DL: Player[] }): number {
    const rushers = d.DL.map((p) => this.e(p, 'passRush', side, 'def') * 0.75 + this.e(p, 'strength', side, 'def') * 0.25).sort((a, b) => b - a);
    return avg(rushers.slice(0, 3)) * 0.7 + avg(rushers) * 0.3 + (d.DL.length - 4) * 1.5;
  }

  private coverageUnit(side: Side, d: { CB: Player[]; S: Player[] }): number {
    return avg([...d.CB, ...d.S].map((p) => this.coverValue(p, side, 'man')));
  }

  private getOpen(p: Player, side: Side): number {
    switch (p.position) {
      case 'WR':
        return this.e(p, 'routeRunning', side, 'off') * 0.45 + this.e(p, 'speed', side, 'off') * 0.25 + this.e(p, 'release', side, 'off') * 0.3;
      case 'TE':
        return this.e(p, 'routeRunning', side, 'off') * 0.5 + this.e(p, 'speed', side, 'off') * 0.3 + this.e(p, 'hands', side, 'off') * 0.2 - 3;
      case 'RB':
        return this.e(p, 'receiving', side, 'off') * 0.6 + this.e(p, 'speed', side, 'off') * 0.4 - 4;
      default:
        return 55;
    }
  }

  private coverValue(p: Player, side: Side, cov: 'man' | 'zone'): number {
    if (p.position === 'LB') return this.e(p, 'coverage', side, 'def') * 0.7 + this.e(p, 'speed', side, 'def') * 0.3 - 5;
    if (p.position === 'DL') return 40;
    return cov === 'man'
      ? this.e(p, 'manCoverage', side, 'def') * 0.55 + this.e(p, 'speed', side, 'def') * 0.3 + this.e(p, 'acceleration', side, 'def') * 0.15
      : this.e(p, 'zoneCoverage', side, 'def') * 0.6 + this.e(p, 'ballSkills', side, 'def') * 0.2 + this.e(p, 'speed', side, 'def') * 0.2;
  }

  // ─────────────────────────────── play calling ───────────────────────────────

  private tempoFor(side: Side): keyof typeof GAME_CONFIG.tempo {
    const s = this.s;
    const m = this.margin(side);
    if (m < 0 && ((s.quarter === 4 && s.clock < 300) || (s.quarter === 4 && m <= -9 && s.clock < 600))) return 'hurry';
    if (s.quarter === 2 && s.clock < 120) return 'hurry';
    if ((m > 0 && s.quarter === 4) || this.garbageTime(side)) return 'slow';
    const t = this.setup[side];
    if (t.isUser) return t.settings.tempo;
    return OFF_SCHEMES[t.state.offScheme]?.tempo ?? 'normal';
  }

  private huddleTime(side: Side): number {
    const tempo = this.tempoFor(side);
    const [lo, hi] = GAME_CONFIG.tempo[tempo];
    let t = this.rng.float(lo, hi);
    if (tempo === 'slow' && this.margin(side) > 0 && this.s.quarter === 4) t = this.rng.float(36, 39);
    return t;
  }

  /** Should the team that wants the clock stopped burn a timeout now? */
  private maybeTimeout(): Side | undefined {
    const s = this.s;
    const off = s.possession;
    const def = other(off);
    const lateGame = s.quarter === 4 && s.clock < 180;
    const lateHalf = s.quarter === 2 && s.clock < 60;
    const dm = this.margin(def);
    if (lateGame && dm <= 0 && dm >= -16 && s.timeouts[def] > 0) return def;
    const om = this.margin(off);
    if ((lateGame && om <= 0) || (lateHalf && s.ballOn >= 40)) {
      if (s.timeouts[off] > 0 && s.clock < (lateGame ? 120 : 45)) return off;
    }
    return undefined;
  }

  private shouldKneel(): boolean {
    const s = this.s;
    if (s.ot) return false;
    const off = s.possession;
    const def = other(off);
    const m = this.margin(off);
    if (s.quarter === 4 && m > 0 && (s.down < 4 || s.clock <= 6)) {
      const kneelsLeft = 4 - s.down + 1;
      const defTO = s.timeouts[def];
      // Each kneel burns ~40s of play clock unless the defense stops it with a timeout.
      const burnable = kneelsLeft * 41 - defTO * 40 + (s.clockRunning ? 40 : 0);
      if (s.clock <= burnable - 2) return true;
    }
    if (s.quarter === 2 && s.clock <= 35 && s.ballOn < 35 && m >= -3) return true;
    return false;
  }


  private aiFourthDown(): FourthDownChoice {
    const s = this.s;
    const off = s.possession;
    const t = this.setup[off];
    const gm = t.coaches.HC?.ratings.gameManagement ?? 70;
    const agg = t.settings.fourthDown === 'aggressive' ? 1.5 : t.settings.fourthDown === 'conservative' ? -1 : 0;
    const coachAgg = (gm - 70) / 25; // smarter coaches go for it a bit more often
    const bias = agg + coachAgg;
    const dist = s.distance;
    const fgDist = 117 - s.ballOn;
    const fgP = this.fgProbability(this.avail(off, 'K')[0], fgDist, off);
    const m = this.margin(off);

    if (s.ot) {
      if (m < -3) return 'go';
      if (dist <= 1 && s.ballOn >= 90) return 'go';
      return fgP >= 0.3 ? 'field_goal' : 'go';
    }
    // Desperation.
    const late = s.quarter === 4;
    if (late && m < 0) {
      if (m >= -3 && fgP >= 0.35 && s.clock < 120) return 'field_goal';
      if (s.clock < 360 || (m < -8 && s.clock < 600)) return 'go';
    }
    if (late && m > 0 && s.clock < 120 && s.ballOn < 60 && dist > 1) return 'punt';

    if (s.ballOn >= 97 && dist <= 2) return bias >= -0.5 ? 'go' : 'field_goal';
    if (s.ballOn >= 60) {
      if (dist <= 1 + Math.max(0, bias)) return 'go';
      if (dist <= 3 + bias && s.ballOn >= 88) return fgP > 0.85 && bias < 0.5 ? 'field_goal' : 'go';
      if (fgP >= 0.38) return 'field_goal';
      if (dist <= 4 + bias * 1.5) return 'go';
      return s.ballOn >= 65 && dist <= 6 + bias ? 'go' : 'punt';
    }
    if (s.ballOn >= 50) return dist <= 2 + bias ? 'go' : 'punt';
    if (s.ballOn >= 35) return dist <= 1 + Math.max(0, bias) * 0.8 ? (bias >= 0 ? 'go' : 'punt') : 'punt';
    return dist <= 1 && bias >= 1.5 ? 'go' : 'punt';
  }

  private passProbability(side: Side): number {
    const s = this.s;
    const t = this.setup[side];
    const scheme = OFF_SCHEMES[t.state.offScheme] ?? OFF_SCHEMES.multiple;
    let p = 1 - scheme.runRate;
    if (t.isUser) p += t.settings.runPassBalance * 0.07;
    const d = s.distance;
    if (s.down === 3 && d >= 7) p += 0.36;
    else if (s.down === 3 && d >= 4) p += 0.2;
    else if (s.down >= 3 && d <= 2) p -= 0.28;
    else if (s.down === 2 && d >= 10) p += 0.12;
    else if (s.down === 2 && d <= 3) p -= 0.08;
    if (s.down === 4) p += d >= 4 ? 0.35 : -0.15;
    if (s.ballOn >= 96) p -= 0.15;
    const m = this.margin(side);
    const second = s.quarter >= 3;
    if (second && m <= -14) p += 0.15;
    if (this.tempoFor(side) === 'hurry') p += 0.25;
    if (s.quarter === 4 && m > 0 && s.clock < 480) p -= 0.28;
    if (this.garbageTime(side)) p -= 0.3;
    if (s.quarter === 4 && m > 0 && s.clock < 480 && s.down === 3 && d >= 7) p += 0.1;
    if (this.weather.condition === 'snow') p -= 0.06;
    if (this.weather.condition === 'wind') p -= 0.04;
    return clamp(p, 0.08, 0.94);
  }

  private chooseFormation(side: Side, pass: boolean): string {
    const s = this.s;
    const scheme = OFF_SCHEMES[this.setup[side].state.offScheme] ?? OFF_SCHEMES.multiple;
    if (s.ballOn >= 97 && s.distance <= 3 && !pass && this.rng.chance(0.6)) return 'goal_line';
    const weights: Record<string, number> = { ...scheme.formations };
    if (pass && s.distance >= 7) {
      for (const k of Object.keys(weights)) if (!FORMATIONS[k]?.shotgun) weights[k] *= 0.3;
      weights.shotgun_spread = (weights.shotgun_spread ?? 0) + 10;
    }
    return this.rng.weightedKey(weights);
  }

  private choosePassConcept(side: Side): string {
    const s = this.s;
    const t = this.setup[side];
    const scheme = OFF_SCHEMES[t.state.offScheme] ?? OFF_SCHEMES.multiple;
    const w: Record<string, number> = { ...scheme.pass };
    const agg = t.settings.aggressiveness;
    for (const k of Object.keys(w)) {
      const c = PASS_CONCEPTS[k];
      if (!c) continue;
      const deep = (c.depth.deep ?? 0) / 100;
      const quick = c.quick ? 1 : 0;
      if (agg === 'aggressive') w[k] *= 1 + deep * 0.8;
      if (agg === 'conservative') w[k] *= (1 - deep * 0.5) * (1 + quick * 0.3);
      if (s.distance >= 12) w[k] *= 1 + deep * 0.8 + ((c.depth.medium ?? 0) / 100) * 0.6 - (c.depth.screen ?? 0) / 150;
      if (s.distance <= 3) w[k] *= 1 + quick * 0.6 - deep * 0.4;
      if (s.ballOn >= 90) w[k] *= 1 - deep * 0.7;
    }
    return this.rng.weightedKey(w);
  }

  private chooseRunConcept(side: Side, formation: string): string {
    const s = this.s;
    const scheme = OFF_SCHEMES[this.setup[side].state.offScheme] ?? OFF_SCHEMES.multiple;
    const w: Record<string, number> = { ...scheme.run };
    if (!FORMATIONS[formation]?.shotgun) {
      w.read_option = (w.read_option ?? 0) * 0.3;
      w.qb_draw = 0;
    }
    if (s.distance <= 2) {
      w.power = (w.power ?? 0) + 15;
      w.dive = (w.dive ?? 0) + 10;
    }
    return this.rng.weightedKey(w);
  }

  private defenseCall(side: Side): { blitz: boolean; coverage: 'man' | 'zone' } {
    const s = this.s;
    const t = this.setup[side];
    const scheme = DEF_SCHEMES[t.state.defScheme] ?? DEF_SCHEMES.multiple;
    let blitz = scheme.blitzRate;
    let man = scheme.manRate;
    const st = t.settings;
    // CPU coordinators use scheme defaults; the user's sliders only affect their own team.
    if (t.isUser) {
      blitz *= st.blitz === 'high' ? 1.6 : st.blitz === 'low' ? 0.5 : 1;
      man += st.coverage === 'man' ? 0.25 : st.coverage === 'zone' ? -0.25 : 0;
    }
    if (s.down === 3 && s.distance >= 7) blitz *= 1.35;
    const offM = this.margin(s.possession);
    if (s.quarter === 4 && offM < -8 && s.clock < 300) {
      blitz *= 0.3; // prevent
      man -= 0.3;
    }
    return { blitz: this.rng.chance(clamp(blitz, 0.03, 0.7)), coverage: this.rng.chance(clamp(man, 0.05, 0.95)) ? 'man' : 'zone' };
  }

  // ─────────────────────────────── scrimmage ───────────────────────────────

  private scrimmage(opts: StepOptions): PlayEvent {
    const s = this.s;
    const off = s.possession;
    const def = other(off);

    // Clock between snaps.
    let timeout: Side | undefined;
    if (s.clockRunning && !s.ot) {
      timeout = this.maybeTimeout();
      if (timeout) {
        s.timeouts[timeout]--;
        s.clockRunning = false;
      } else {
        const runoff = this.huddleTime(off);
        if (runoff >= s.clock) {
          this.stats.team[off].timeOfPossession += s.clock;
          s.clock = 0;
          return this.endPeriod();
        }
        this.runClock(runoff, off);
      }
    }

    if (s.ballOn >= 80 && !s.driveRedZone) {
      s.driveRedZone = true;
      this.stats.team[off].redZoneAtt++;
    }

    const ev = this.baseEvent('run');
    ev.timeout = timeout;

    // Victory formation / end-of-half kneel.
    if (this.shouldKneel()) {
      ev.kind = 'kneel';
      const lineup = this.offLineup(off, 'i_form');
      ev.formation = 'i_form';
      ev.offLineup = lineup.ids;
      ev.defLineup = this.defLineup(def, lineup.wr, false).ids;
      const qb = lineup.players.QB[0];
      ev.rusher = qb?.id;
      const loss = s.ballOn > 2 ? -1 : 0;
      ev.yards = loss;
      this.stats.add(qb?.id, 'rushAtt', 1);
      this.stats.add(qb?.id, 'rushYds', loss);
      this.stats.team[off].rushAtt++;
      this.stats.team[off].rushYards += loss;
      this.runClock(2, off);
      ev.text = `${this.name(qb?.id)} takes a knee.`;
      this.advance(ev, loss, false);
      if (s.phase === 'scrimmage' && s.possession === off) s.clockRunning = true;
      return this.finish(ev);
    }

    // End-of-half/game kicks & heaves.
    const lastPlay = !s.ot && (s.quarter === 2 || s.quarter === 4) && s.clock <= 7;
    const fgDist = 117 - s.ballOn;
    const kicker = this.avail(off, 'K')[0];
    if (lastPlay) {
      const m = this.margin(off);
      const fgHelps = s.quarter === 2 || (m <= 0 && m >= -3);
      if (fgHelps && this.fgProbability(kicker, fgDist, off) >= 0.2) return this.fieldGoal(ev);
    }

    // 4th down.
    let userCall = false;
    if (s.down === 4) {
      let choice: FourthDownChoice;
      if (opts.fourthDown && this.setup[off].isUser) {
        choice = opts.fourthDown;
        userCall = true;
      } else choice = this.aiFourthDown();
      if (s.ot && choice === 'punt') choice = 'go';
      ev.userCall = userCall;
      if (choice === 'punt') return this.punt(ev);
      if (choice === 'field_goal') return this.fieldGoal(ev);
      this.stats.team[off].fourthDownAtt++;
    } else if (s.down === 3) {
      this.stats.team[off].thirdDownAtt++;
    }

    // Pre-snap penalties.
    const pen = GAME_CONFIG.penalties;
    const pr = this.rng.next();
    const presnapLineup = () => {
      const f = this.chooseFormation(off, false);
      const lu = this.offLineup(off, f);
      ev.formation = f;
      ev.offLineup = lu.ids;
      ev.defLineup = this.defLineup(def, lu.wr, f === 'goal_line').ids;
    };
    const fsYards = Math.min(5, Math.floor((s.ballOn - 1) / 2));
    const offYards = Math.min(5, Math.floor((100 - s.ballOn - 1) / 2));
    if (pr < pen.falseStart && fsYards >= 1) {
      const yards = fsYards;
      ev.kind = 'penalty';
      presnapLineup();
      ev.penalty = { on: off, name: 'False start', yards, accepted: true };
      this.stats.team[off].penalties++;
      this.stats.team[off].penaltyYards += yards;
      if (s.down === 3) this.stats.team[off].thirdDownAtt--;
      if (s.down === 4) this.stats.team[off].fourthDownAtt--;
      s.ballOn -= yards;
      s.distance += yards;
      const oline = this.avail(off, 'OL').slice(0, 5);
      ev.text = `FALSE START, ${this.name(this.rng.pick(oline)?.id)}. ${yards}-yard penalty.`;
      s.clockRunning = false;
      return this.finish(ev);
    }
    if (pr >= pen.falseStart && pr < pen.falseStart + pen.offside && offYards >= 1) {
      const yards = offYards;
      ev.kind = 'penalty';
      presnapLineup();
      ev.penalty = { on: def, name: 'Offside', yards, accepted: true };
      this.stats.team[def].penalties++;
      this.stats.team[def].penaltyYards += yards;
      if (s.down === 3) this.stats.team[off].thirdDownAtt--;
      if (s.down === 4) this.stats.team[off].fourthDownAtt--;
      s.ballOn += yards;
      if (yards >= s.distance) {
        s.down = 1;
        s.distance = Math.min(10, 100 - s.ballOn);
        ev.firstDown = true;
        this.stats.team[off].firstDowns++;
      } else s.distance -= yards;
      ev.text = `OFFSIDE, defense. ${yards}-yard penalty${ev.firstDown ? ' — automatic FIRST DOWN' : ''}.`;
      s.clockRunning = false;
      return this.finish(ev);
    }

    // Hail Mary to end a half/game.
    const needTD = !s.ot && s.quarter === 4 && this.margin(off) < -3;
    let forcePass = false;
    let forceConcept: string | undefined;
    if (lastPlay && (needTD || (s.quarter === 2 && s.ballOn >= 50))) {
      forcePass = true;
      if (100 - s.ballOn > 30) forceConcept = 'hail_mary';
    }
    const isPass = forcePass || this.rng.chance(this.passProbability(off));
    ev.userCall = userCall;
    if (isPass) this.passPlay(ev, forceConcept);
    else this.runPlay(ev);
    return this.finish(ev);
  }

  /** Apply a scrimmage gain: touchdown, safety, first down, or next down / turnover on downs. */
  private advance(ev: PlayEvent, gain: number, stopClockOnFirstDown: boolean): 'td' | 'safety' | 'first' | 'down' | 'downs' {
    const s = this.s;
    const off = s.possession;
    const def = other(off);
    const nb = s.ballOn + gain;
    const prevDown = s.down;
    if (nb >= 100) {
      if (prevDown === 3) this.stats.team[off].thirdDownConv++;
      if (prevDown === 4) this.stats.team[off].fourthDownConv++;
      this.stats.team[off].firstDowns++;
      return 'td';
    }
    if (nb <= 0) {
      this.safety(ev, def);
      return 'safety';
    }
    s.ballOn = nb;
    if (gain >= s.distance) {
      s.down = 1;
      s.distance = Math.min(10, 100 - nb);
      ev.firstDown = true;
      this.stats.team[off].firstDowns++;
      if (prevDown === 3) this.stats.team[off].thirdDownConv++;
      if (prevDown === 4) this.stats.team[off].fourthDownConv++;
      if (stopClockOnFirstDown && this.inside2()) s.clockRunning = false;
      return 'first';
    }
    if (s.down >= 4) {
      ev.turnover = 'downs';
      ev.highlight = ev.highlight ?? 'TURNOVER ON DOWNS';
      s.momentum += this.sign(def) * 0.25;
      if (s.ot) {
        this.endOtPossession(ev);
      } else {
        this.newDrive(def, 100 - nb);
        s.clockRunning = false;
      }
      return 'downs';
    }
    s.down++;
    s.distance -= gain;
    return 'down';
  }

  private tacklerFor(def: { DL: Player[]; LB: Player[]; CB: Player[]; S: Player[] }, gain: number): Player | undefined {
    const pool: { p: Player; w: number }[] = [];
    const add = (arr: Player[], w: number) => {
      for (const p of arr) pool.push({ p, w: w * (0.5 + (p.attributes.tackling ?? p.attributes.runDefense ?? p.attributes.blockShed ?? 60) / 100) });
    };
    if (gain <= 2) {
      add(def.DL, 1.1);
      add(def.LB, 1.3);
      add(def.S, 0.15);
    } else if (gain <= 8) {
      add(def.DL, 0.3);
      add(def.LB, 1.4);
      add(def.S, 0.6);
      add(def.CB, 0.35);
    } else {
      add(def.LB, 0.5);
      add(def.S, 1.3);
      add(def.CB, 1.0);
    }
    if (!pool.length) return undefined;
    return this.rng.weighted(pool, (x) => x.w).p;
  }

  private weatherFumble(): number {
    return this.weather.condition === 'rain' ? 1.4 : this.weather.condition === 'snow' ? 1.6 : 1;
  }

  private runPlay(ev: PlayEvent): void {
    const s = this.s;
    const off = s.possession;
    const def = other(off);
    const formation = this.chooseFormation(off, false);
    const conceptId = this.chooseRunConcept(off, formation);
    const concept = RUN_CONCEPTS[conceptId] ?? RUN_CONCEPTS.inside_zone;
    const lineup = this.offLineup(off, formation);
    const call = this.defenseCall(def);
    const dl = this.defLineup(def, lineup.wr, formation === 'goal_line');
    ev.kind = 'run';
    ev.formation = formation;
    ev.concept = conceptId;
    ev.conceptName = concept.name;
    ev.offLineup = lineup.ids;
    ev.defLineup = dl.ids;
    ev.defense = { ...call, front: dl.front };

    const qb = lineup.players.QB[0];
    const rb = lineup.players.RB[0];
    let carrier: Player | undefined = rb ?? qb;
    if (concept.carrier === 'QB') carrier = qb;
    else if (concept.carrier === 'option') {
      const qbSpeed = qb?.attributes.speed ?? 60;
      const keep = clamp(0.12 + (qbSpeed - 72) * 0.012, 0.05, 0.45);
      if (this.rng.chance(keep)) carrier = qb;
    }
    ev.rusher = carrier?.id;
    const isQB = carrier?.position === 'QB';

    const block = this.runBlockRating(off, lineup.players);
    const rdef = this.runDefRating(def, dl.players);
    let adv = (block - rdef) / 14;
    if (call.blitz) adv += 0.1;
    const c = carrier;
    const skill = c
      ? isQB
        ? (this.e(c, 'speed', off, 'off') * 0.5 + this.e(c, 'agility', off, 'off') * 0.5 - 75) / 10
        : (this.e(c, 'vision', off, 'off') * 0.3 + this.e(c, 'elusiveness', off, 'off') * 0.25 + this.e(c, 'power', off, 'off') * 0.2 + this.e(c, 'acceleration', off, 'off') * 0.25 - 75) / 10
      : -1;
    const speed = c ? this.e(c, 'speed', off, 'off') : 70;

    let gain: number;
    const tflP = clamp((0.1 - adv * 0.025 - skill * 0.01 + (call.blitz ? 0.04 : 0)) * concept.tfl, 0.03, 0.26);
    if (this.rng.chance(tflP)) {
      gain = -this.rng.int(1, 4);
    } else {
      const base = 3.4 + adv * 1.0 + skill * 0.6 + concept.mean - (s.ballOn >= 85 ? 0.7 : 0);
      gain = Math.max(0, this.rng.normal(base, 2.5 * concept.variance));
      const shortYardage = s.distance <= 2 && (concept.gap === 'inside' || isQB);
      if (shortYardage && gain < s.distance && this.rng.chance(0.25 + adv * 0.05)) gain = s.distance + this.rng.int(0, 2);
      const bp = clamp((0.035 + (speed - 80) * 0.0018 + adv * 0.008 + skill * 0.008 + (call.blitz ? 0.015 : 0)) * concept.breakaway, 0.008, 0.11);
      if (this.rng.chance(bp)) gain += 8 + this.rng.exp(14);
    }
    if (this.weather.condition === 'snow' || this.weather.condition === 'rain') gain -= 0.3;
    gain = Math.round(gain);
    gain = Math.min(gain, 100 - s.ballOn);

    const tackler = this.tacklerFor(dl.players, gain);
    ev.yards = gain;
    ev.outOfBounds = concept.gap === 'outside' && gain > 3 && this.rng.chance(0.22);
    this.stats.add(c?.id, 'rushAtt', 1);
    this.stats.add(c?.id, 'rushYds', gain);
    this.stats.add(c?.id, 'rushLong', gain);
    this.stats.team[off].rushAtt++;
    this.stats.team[off].rushYards += gain;
    this.stats.team[off].totalYards += gain;

    const onField = [...Object.values(lineup.ids).flat(), ...Object.values(dl.ids).flat()];
    this.markAppeared(onField);
    this.tire(onField);
    this.runClock(this.rng.float(4, 6.5) + Math.max(0, gain) / 10, off);

    const lateral = concept.gap === 'outside' ? this.vrng.pick([-1, 1]) * this.vrng.float(6, 14) : this.vrng.normal(0, 3);
    const playName = `${concept.name}`;
    const who = this.name(c?.id);
    const scored = s.ballOn + gain >= 100;

    // Fumble?
    const ballSec = c ? (isQB ? 65 : this.e(c, 'ballSecurity', off, 'off')) : 60;
    const fumP = clamp(0.011 * (1 + (70 - ballSec) / 35) * this.weatherFumble(), 0.003, 0.03);
    if (!scored && s.ballOn + gain > 0 && this.rng.chance(fumP)) {
      this.stats.add(c?.id, 'fumbles', 1);
      this.stats.add(tackler?.id, 'forcedFum', 1);
      this.stats.add(tackler?.id, 'tackles', 1);
      ev.tackler = tackler?.id;
      if (this.rng.chance(0.55)) {
        const recoverer = this.rng.pick([...dl.players.DL, ...dl.players.LB, ...dl.players.S]);
        this.stats.add(c?.id, 'fumblesLost', 1);
        this.stats.add(recoverer?.id, 'fumRec', 1);
        this.stats.team[off].turnovers++;
        ev.turnover = 'fumble';
        ev.highlight = 'FUMBLE';
        ev.defender = recoverer?.id;
        ev.text = `${playName} — ${who} runs for ${gain} but FUMBLES! Recovered by ${this.name(recoverer?.id)}.`;
        s.momentum += this.sign(def) * 0.35;
        const spot = s.ballOn + gain;
        this.nextSpot(lateral);
        if (s.ot) this.endOtPossession(ev);
        else {
          this.newDrive(def, 100 - spot);
          s.clockRunning = false;
        }
        this.maybeInjure(ev, [c?.id, tackler?.id], [off, def]);
        return;
      }
      ev.text = `${playName} — ${who} fumbles after a ${gain}-yard run but ${this.abbr(off)} recovers.`;
    }

    const result = this.advance(ev, gain, true);
    this.nextSpot(lateral);
    if (result === 'td') {
      this.stats.add(c?.id, 'rushTD', 1);
      ev.text = `${playName} — ${who} runs ${gain} yards for a TOUCHDOWN!`;
      this.touchdown(ev, off, `${who} ${gain} yd run`);
    } else if (result === 'safety') {
      ev.tackler = tackler?.id;
      this.stats.add(tackler?.id, 'tackles', 1);
      this.stats.add(tackler?.id, 'tfl', 1);
      ev.text = `${playName} — ${who} is tackled in the end zone by ${this.name(tackler?.id)}. SAFETY!`;
    } else {
      ev.tackler = tackler?.id;
      this.stats.add(tackler?.id, 'tackles', 1);
      if (gain < 0) this.stats.add(tackler?.id, 'tfl', 1);
      if (!ev.text) {
        const dir = concept.gap === 'outside' ? 'around the edge' : 'up the middle';
        const yardsText = gain === 0 ? 'no gain' : gain < 0 ? `a loss of ${-gain}` : `${gain} yard${gain === 1 ? '' : 's'}`;
        ev.text = `${playName} — ${who} runs ${dir} for ${yardsText}.${ev.outOfBounds ? ' Out of bounds.' : ''} Tackled by ${this.name(tackler?.id)}.`;
      }
      if (ev.firstDown) ev.text += ' FIRST DOWN.';
      if (result === 'downs') ev.text += ' TURNOVER ON DOWNS.';
      if (gain >= 20) ev.highlight = 'BIG PLAY';
      if (result === 'down' || result === 'first') s.clockRunning = !(this.inside2() && (ev.outOfBounds || result === 'first'));
    }
    this.maybeHolding(ev, gain, off, result);
    this.maybeInjure(ev, [c?.id, tackler?.id], [off, def]);
  }

  /** Post-play accepted holding on the offense (only if it helps the defense). */
  private maybeHolding(ev: PlayEvent, gain: number, off: Side, result: string): void {
    const s = this.s;
    if (result !== 'down' && result !== 'first') return;
    if (s.possession !== off || s.phase !== 'scrimmage') return;
    if (gain <= 0 || !this.rng.chance(GAME_CONFIG.penalties.holding)) return;
    // Undo the play result: ball back to previous spot minus 10.
    const yards = Math.min(10, Math.floor(ev.ballOn / 2));
    s.ballOn = ev.ballOn - yards;
    s.down = ev.down;
    s.distance = ev.distance + yards;
    if (ev.firstDown) {
      ev.firstDown = false;
      this.stats.team[off].firstDowns--;
      if (ev.down === 3) this.stats.team[off].thirdDownConv--;
      if (ev.down === 4) this.stats.team[off].fourthDownConv--;
    }
    // Stats for the nullified play are removed from team totals (player totals keep it simple).
    this.stats.team[off].totalYards -= gain;
    if (ev.kind === 'run') this.stats.team[off].rushYards -= gain;
    else this.stats.team[off].passYards -= gain;
    this.stats.team[off].penalties++;
    this.stats.team[off].penaltyYards += yards;
    if (ev.down === 3) this.stats.team[off].thirdDownAtt--;
    if (ev.down === 4) this.stats.team[off].fourthDownAtt--;
    this.unrecordPlay(ev, gain);
    const holder = this.rng.pick(this.avail(off, 'OL').slice(0, 5));
    ev.penalty = { on: off, name: 'Holding', yards, accepted: true };
    ev.firstDown = false;
    ev.text += ` — FLAG: Holding, ${this.name(holder?.id)}. ${yards}-yard penalty, replay ${ev.down === 1 ? '1st' : ev.down === 2 ? '2nd' : ev.down === 3 ? '3rd' : '4th'} down.`;
    if (ev.highlight === 'BIG PLAY') ev.highlight = undefined;
    s.clockRunning = false;
  }

  /** Remove individual stats credited on a play that a penalty wiped out. */
  private unrecordPlay(ev: PlayEvent, gain: number): void {
    const sub = (id: string | undefined, k: keyof StatLine, v: number) => this.stats.add(id, k, -v);
    if (ev.kind === 'run') {
      sub(ev.rusher, 'rushAtt', 1);
      sub(ev.rusher, 'rushYds', gain);
      this.stats.team[ev.offense].rushAtt--;
    } else if (ev.kind === 'pass' && ev.complete) {
      sub(ev.passer, 'passAtt', 1);
      sub(ev.passer, 'passComp', 1);
      sub(ev.passer, 'passYds', gain);
      sub(ev.target, 'targets', 1);
      sub(ev.target, 'rec', 1);
      sub(ev.target, 'recYds', gain);
      this.stats.team[ev.offense].passAtt--;
      this.stats.team[ev.offense].passComp--;
    }
    if (ev.tackler) sub(ev.tackler, 'tackles', 1);
  }

  private passPlay(ev: PlayEvent, forceConcept?: string): void {
    const s = this.s;
    const off = s.possession;
    const def = other(off);
    const conceptId = forceConcept ?? this.choosePassConcept(off);
    const concept = PASS_CONCEPTS[conceptId] ?? PASS_CONCEPTS.curl_flat;
    let formation = this.chooseFormation(off, true);
    if (concept.screen === 'RB' || concept.playAction) {
      if (formation === 'shotgun_spread') formation = 'shotgun_doubles';
    }
    if (conceptId === 'hail_mary') formation = 'shotgun_spread';
    const lineup = this.offLineup(off, formation);
    const call = this.defenseCall(def);
    const dl = this.defLineup(def, lineup.wr, false);
    ev.kind = 'pass';
    ev.formation = formation;
    ev.concept = conceptId;
    ev.conceptName = concept.name;
    ev.offLineup = lineup.ids;
    ev.defLineup = dl.ids;
    ev.defense = { ...call, front: dl.front };
    const qb = lineup.players.QB[0];
    ev.passer = qb?.id;
    const onField = [...Object.values(lineup.ids).flat(), ...Object.values(dl.ids).flat()];
    this.markAppeared(onField);
    this.tire(onField);

    // ── Pressure / sack / scramble
    const rush = this.passRushRating(def, dl.players) + (call.blitz ? 6 : 0);
    let block = this.passBlockRating(off, lineup.players);
    if (call.blitz && lineup.players.RB[0]) block += (this.e(lineup.players.RB[0], 'passProtection', off, 'off') - 70) * 0.05;
    let pressureP = 0.25 + (rush - block) * 0.009 + (call.blitz ? 0.1 : 0);
    if (concept.quick) pressureP -= 0.13;
    if (concept.screen) pressureP -= 0.18;
    if (concept.playAction) pressureP += 0.04;
    if (conceptId === 'hail_mary') pressureP += 0.12;
    pressureP = clamp(pressureP, 0.04, 0.62);
    const pressured = this.rng.chance(pressureP);
    ev.pressured = pressured;
    const qbName = this.name(qb?.id);

    if (pressured && !concept.screen) {
      const pocket = qb ? this.e(qb, 'pocketAwareness', off, 'off') : 60;
      const ph = qb ? this.e(qb, 'pressureHandling', off, 'off') : 60;
      const qspd = qb ? this.e(qb, 'speed', off, 'off') : 60;
      const sackP = clamp(0.28 + (70 - pocket) * 0.004 + (70 - ph) * 0.003 - (qspd - 70) * 0.003, 0.1, 0.5);
      const scrambleP = qspd >= 76 ? clamp(0.22 + (qspd - 76) * 0.02, 0.1, 0.5) : 0.06;
      const r = this.rng.next();
      if (r < sackP) {
        // SACK
        const sacker = this.rng.weighted([...dl.players.DL, ...(call.blitz ? dl.players.LB : [])], (p) => (p.attributes.passRush ?? p.attributes.speed ?? 60) - 40);
        let loss = -this.rng.int(3, 10);
        if (s.ballOn + loss <= 0 && this.rng.chance(0.6)) loss = -(s.ballOn - 1);
        ev.kind = 'sack';
        ev.yards = loss;
        ev.tackler = sacker?.id;
        ev.defender = sacker?.id;
        ev.highlight = 'SACK';
        this.stats.add(qb?.id, 'sacked', 1);
        this.stats.add(sacker?.id, 'sacks', 1);
        this.stats.add(sacker?.id, 'tackles', 1);
        this.stats.add(sacker?.id, 'tfl', 1);
        this.stats.team[def].sacks++;
        this.stats.team[off].sackYards += -loss;
        this.stats.team[off].totalYards += loss;
        this.stats.team[off].passYards += loss;
        this.runClock(this.rng.float(4, 6), off);
        s.momentum += this.sign(def) * 0.08;
        // Strip sack?
        if (this.rng.chance(0.09)) {
          this.stats.add(qb?.id, 'fumbles', 1);
          this.stats.add(sacker?.id, 'forcedFum', 1);
          if (this.rng.chance(0.5)) {
            const rec = this.rng.pick(dl.players.DL);
            this.stats.add(qb?.id, 'fumblesLost', 1);
            this.stats.add(rec?.id, 'fumRec', 1);
            this.stats.team[off].turnovers++;
            ev.turnover = 'fumble';
            ev.highlight = 'FUMBLE';
            const spot = s.ballOn + loss;
            ev.text = `${qbName} is SACKED by ${this.name(sacker?.id)} and FUMBLES! Recovered by ${this.name(rec?.id)}.`;
            s.momentum += this.sign(def) * 0.3;
            if (spot <= 0) {
              s.possession = def;
              this.touchdown(ev, def, `${this.name(rec?.id)} fumble recovery`);
              this.stats.add(rec?.id, 'defTD', 1);
              return;
            }
            if (s.ot) this.endOtPossession(ev);
            else {
              this.newDrive(def, 100 - spot);
              s.clockRunning = false;
            }
            return;
          }
        }
        const res = this.advance(ev, loss, false);
        if (res === 'safety') ev.text = `${qbName} is SACKED in the end zone by ${this.name(sacker?.id)}. SAFETY!`;
        else {
          ev.text = `${qbName} is SACKED by ${this.name(sacker?.id)} for a loss of ${-loss}.`;
          if (res === 'downs') ev.text += ' TURNOVER ON DOWNS.';
          else s.clockRunning = true;
        }
        this.nextSpot(this.vrng.normal(0, 2));
        this.maybeInjure(ev, [qb?.id, sacker?.id], [off, def]);
        return;
      }
      if (r < sackP + scrambleP) {
        // SCRAMBLE
        ev.kind = 'scramble';
        ev.rusher = qb?.id;
        let gain = Math.round(this.rng.normal(4 + (qspd - 75) * 0.12, 4.5));
        if (this.rng.chance(0.05 + (qspd - 75) * 0.002)) gain += 8 + Math.round(this.rng.exp(12));
        gain = clamp(gain, -3, 100 - s.ballOn);
        ev.yards = gain;
        ev.outOfBounds = this.rng.chance(0.4);
        this.stats.add(qb?.id, 'rushAtt', 1);
        this.stats.add(qb?.id, 'rushYds', gain);
        this.stats.add(qb?.id, 'rushLong', gain);
        this.stats.team[off].rushAtt++;
        this.stats.team[off].rushYards += gain;
        this.stats.team[off].totalYards += gain;
        this.runClock(this.rng.float(5, 8), off);
        const tackler = this.tacklerFor(dl.players, gain);
        const res = this.advance(ev, gain, true);
        this.nextSpot(this.vrng.pick([-1, 1]) * this.vrng.float(4, 12));
        if (res === 'td') {
          this.stats.add(qb?.id, 'rushTD', 1);
          ev.text = `${qbName} escapes the pressure and scrambles ${gain} yards for a TOUCHDOWN!`;
          this.touchdown(ev, off, `${qbName} ${gain} yd run`);
        } else if (res !== 'safety') {
          ev.tackler = tackler?.id;
          this.stats.add(tackler?.id, 'tackles', 1);
          ev.text = `${qbName} is flushed from the pocket and scrambles for ${gain} yard${Math.abs(gain) === 1 ? '' : 's'}${ev.outOfBounds ? ', out of bounds' : ''}.`;
          if (ev.firstDown) ev.text += ' FIRST DOWN.';
          if (res === 'downs') ev.text += ' TURNOVER ON DOWNS.';
          else s.clockRunning = !(ev.firstDown && this.inside2()) && !(ev.outOfBounds && this.inside2());
          if (gain >= 20) ev.highlight = 'BIG PLAY';
        }
        this.maybeInjure(ev, [qb?.id, tackler?.id], [off, def]);
        return;
      }
      if (r < sackP + scrambleP + 0.1) {
        // THROW AWAY
        ev.throwaway = true;
        ev.complete = false;
        this.stats.add(qb?.id, 'passAtt', 1);
        this.stats.team[off].passAtt++;
        this.runClock(this.rng.float(4, 6), off);
        ev.text = `${qbName} is under pressure and throws it away.`;
        this.advance(ev, 0, false);
        if (ev.turnover === 'downs') ev.text += ' TURNOVER ON DOWNS.';
        s.clockRunning = false;
        return;
      }
      // Otherwise a hurried throw below.
    }

    // ── Target selection
    const receivers: Player[] = [...lineup.players.WR, ...lineup.players.TE, ...lineup.players.RB.slice(0, 1)];
    const cover = this.coverageAssignments(receivers, dl.players);
    let target: Player | undefined;
    let depthKey: 'screen' | 'short' | 'medium' | 'deep';
    if (concept.screen) {
      target = concept.screen === 'RB' ? lineup.players.RB[0] ?? receivers[0] : this.rng.pick(lineup.players.WR.slice(0, 3));
      depthKey = 'screen';
    } else {
      const scored = receivers.map((p, i) => {
        const d = cover.get(p.id);
        const sep = (this.getOpen(p, off) - (d ? this.coverValue(d, def, call.coverage) : 50)) / 16 + this.rng.normal(0, 1.0);
        const roleBias = p.position === 'WR' ? [0.45, 0.3, 0.12, 0][i] ?? 0 : p.position === 'TE' ? 0.05 : -0.35;
        return { p, sep, score: sep + roleBias };
      });
      const dm = qb ? this.e(qb, 'decisionMaking', off, 'off') : 60;
      const best = scored.reduce((a, b) => (b.score > a.score ? b : a));
      const pick = this.rng.chance(clamp(0.35 + dm * 0.006, 0.4, 0.95)) ? best : this.rng.weighted(scored, (x) => Math.exp(x.score));
      target = pick.p;
      const dw = { ...concept.depth };
      if (target.position === 'RB') {
        dw.deep = (dw.deep ?? 0) * 0.1;
        dw.medium = (dw.medium ?? 0) * 0.4;
        dw.short = (dw.short ?? 0) + 30;
      }
      depthKey = this.rng.weightedKey(dw as Record<'screen' | 'short' | 'medium' | 'deep', number>);
    }
    if (!target) target = receivers[0];
    const covDef = cover.get(target.id) ?? dl.players.S[0] ?? dl.players.CB[0];
    const covVal = covDef ? this.coverValue(covDef, def, call.coverage) : 50;
    const sep = (this.getOpen(target, off) - covVal) / 16 + this.rng.normal(0, 0.9) + (concept.playAction ? 0.3 : 0) + (call.blitz ? 0.35 : 0);
    ev.target = target.id;
    ev.defender = covDef?.id;

    const toGoal = 100 - s.ballOn;
    let air: number;
    switch (depthKey) {
      case 'screen':
        air = this.rng.int(-3, 1);
        break;
      case 'short':
        air = this.rng.int(1, 9);
        break;
      case 'medium':
        air = this.rng.int(10, 19);
        break;
      default:
        air = conceptId === 'hail_mary' ? toGoal + this.rng.int(0, 4) : this.rng.int(20, 48);
    }
    air = Math.min(air, toGoal + 4);
    if (s.ballOn + air <= 0) air = 1 - s.ballOn;
    ev.airYards = air;

    // ── Completion / interception
    const accKey = depthKey === 'deep' ? 'deepAccuracy' : depthKey === 'medium' ? 'mediumAccuracy' : 'shortAccuracy';
    let acc = qb ? this.e(qb, accKey, off, 'off') : 55;
    if (depthKey === 'deep' && qb) acc = acc * 0.75 + this.e(qb, 'throwPower', off, 'off') * 0.25;
    const hands = target.position === 'RB' ? this.e(target, 'receiving', off, 'off') : this.e(target, 'hands', off, 'off');
    const base = { screen: 0.83, short: 0.7, medium: 0.54, deep: 0.36 }[depthKey];
    let compP = base + (acc - 75) * 0.0035 + sep * 0.05 + (hands - 75) * 0.002 - (s.ballOn >= 85 ? 0.05 : 0);
    if (sep < 0 && target.attributes.contestedCatch) compP += (target.attributes.contestedCatch - 70) * 0.002;
    if (pressured) compP -= 0.14;
    if (this.weather.condition === 'rain') compP -= 0.04;
    if (this.weather.condition === 'snow') compP -= 0.06;
    if (this.weather.condition === 'wind' && depthKey === 'deep') compP -= 0.08;
    if (air >= toGoal) compP -= 0.06; // tighter windows in the end zone
    if (conceptId === 'hail_mary') compP = 0.08;
    compP = clamp(compP, 0.05, 0.95);
    const dmk = qb ? this.e(qb, 'decisionMaking', off, 'off') : 60;
    const ballSkills = covDef?.attributes.ballSkills ?? covDef?.attributes.coverage ?? 60;
    let intP = 0.019 + (72 - dmk) * 0.0009 + (depthKey === 'deep' ? 0.018 : depthKey === 'medium' ? 0.008 : 0) + (pressured ? 0.02 : 0) + Math.max(0, -sep) * 0.012 + (ballSkills - 75) * 0.0006;
    if (depthKey === 'screen') intP *= 0.3;
    if (conceptId === 'hail_mary') intP = 0.15;
    intP = clamp(intP, 0.003, 0.2);

    this.stats.add(qb?.id, 'passAtt', 1);
    this.stats.add(target.id, 'targets', 1);
    this.stats.team[off].passAtt++;
    const tName = this.name(target.id);
    const cName = concept.name;
    const roll = this.rng.next();

    if (roll < intP) {
      // INTERCEPTION
      const picker = covDef && this.rng.chance(0.8) ? covDef : this.rng.pick([...dl.players.S, ...dl.players.CB]) ?? covDef;
      ev.complete = false;
      ev.turnover = 'interception';
      ev.highlight = 'INTERCEPTION';
      ev.defender = picker?.id;
      this.stats.add(qb?.id, 'passInt', 1);
      this.stats.add(picker?.id, 'defInt', 1);
      this.stats.team[off].turnovers++;
      s.momentum += this.sign(def) * 0.4;
      const spotOff = s.ballOn + air; // offense frame where caught
      this.runClock(this.rng.float(5, 8), off);
      if (s.ot) {
        ev.text = `${cName} — ${qbName}'s pass for ${tName} is INTERCEPTED by ${this.name(picker?.id)}!`;
        this.endOtPossession(ev);
        return;
      }
      let ret = Math.max(0, Math.round(this.rng.normal(8, 9)));
      if (this.rng.chance(0.06)) ret += Math.round(15 + this.rng.exp(25));
      let defBallOn = spotOff >= 100 ? 0 : 100 - spotOff; // defense frame
      if (spotOff >= 100 && ret < 10) {
        ev.returnYards = 0;
        ev.text = `${cName} — ${qbName}'s pass is INTERCEPTED in the end zone by ${this.name(picker?.id)}. Touchback.`;
        this.newDrive(def, 20);
        s.clockRunning = false;
        this.nextSpot(this.vrng.normal(0, 5));
        return;
      }
      defBallOn = Math.max(defBallOn, 1) + ret;
      ev.returnYards = ret;
      this.stats.add(picker?.id, 'intYds', ret);
      if (defBallOn >= 100) {
        this.stats.add(picker?.id, 'defTD', 1);
        ev.text = `${cName} — ${qbName}'s pass is INTERCEPTED by ${this.name(picker?.id)} and returned for a TOUCHDOWN! PICK SIX!`;
        s.possession = def;
        this.touchdown(ev, def, `${this.name(picker?.id)} interception return`);
        return;
      }
      this.newDrive(def, defBallOn);
      ev.text = `${cName} — ${qbName}'s pass intended for ${tName} is INTERCEPTED by ${this.name(picker?.id)}, returned ${ret} yards to the ${this.fieldLabel(s.ballOn, def)}.`;
      s.clockRunning = false;
      this.nextSpot(this.vrng.normal(0, 6));
      this.maybeInjure(ev, [picker?.id], [def]);
      return;
    }

    if (roll < intP + compP) {
      // COMPLETE
      ev.complete = true;
      let yac: number;
      const yacAttr = target.position === 'WR' ? this.e(target, 'yac', off, 'off') : target.position === 'RB' ? this.e(target, 'elusiveness', off, 'off') : this.e(target, 'speed', off, 'off') - 5;
      if (depthKey === 'screen') yac = Math.max(0, this.rng.normal(5 + (yacAttr - 75) * 0.08, 4.5));
      else if (depthKey === 'short') yac = this.rng.exp(Math.max(1.2, 2.8 + (yacAttr - 75) * 0.04 + sep * 0.4));
      else if (depthKey === 'medium') yac = this.rng.exp(Math.max(1, 2.3 + (yacAttr - 75) * 0.04 + sep * 0.4));
      else yac = this.rng.exp(Math.max(1, 3.5 + sep * 0.8));
      const bp = clamp(0.04 + (yacAttr - 80) * 0.002 + sep * 0.01, 0.01, 0.1);
      if (depthKey !== 'deep' && this.rng.chance(bp)) yac += 10 + this.rng.exp(15);
      yac = Math.round(yac);
      let gain = air + yac;
      if (s.ballOn + air >= 100) {
        gain = toGoal;
        yac = 0;
      }
      gain = Math.min(gain, toGoal);
      yac = gain - air;
      ev.yards = gain;
      ev.yac = yac;
      ev.outOfBounds = depthKey !== 'screen' && this.rng.chance(this.tempoFor(off) === 'hurry' ? 0.35 : 0.15);
      this.stats.add(qb?.id, 'passComp', 1);
      this.stats.add(qb?.id, 'passYds', gain);
      this.stats.add(qb?.id, 'passLong', gain);
      this.stats.add(target.id, 'rec', 1);
      this.stats.add(target.id, 'recYds', gain);
      this.stats.add(target.id, 'recLong', gain);
      this.stats.team[off].passComp++;
      this.stats.team[off].passYards += gain;
      this.stats.team[off].totalYards += gain;
      this.runClock(this.rng.float(5, 7.5) + Math.max(0, yac) / 12, off);
      const tackler = gain >= toGoal ? undefined : covDef && this.rng.chance(0.65) ? covDef : this.tacklerFor(dl.players, gain);
      const lateral = this.vrng.normal(0, 7);

      // Fumble after catch
      if (gain < toGoal && this.rng.chance(0.006 * this.weatherFumble())) {
        this.stats.add(target.id, 'fumbles', 1);
        this.stats.add(tackler?.id, 'forcedFum', 1);
        this.stats.add(tackler?.id, 'tackles', 1);
        if (this.rng.chance(0.55)) {
          this.stats.add(target.id, 'fumblesLost', 1);
          this.stats.team[off].turnovers++;
          ev.turnover = 'fumble';
          ev.highlight = 'FUMBLE';
          ev.tackler = tackler?.id;
          ev.text = `${cName} — ${qbName} completes to ${tName} for ${gain}, but he FUMBLES! ${this.abbr(def)} recovers.`;
          s.momentum += this.sign(def) * 0.35;
          const spot = s.ballOn + gain;
          this.nextSpot(lateral);
          if (s.ot) this.endOtPossession(ev);
          else {
            this.newDrive(def, 100 - spot);
            s.clockRunning = false;
          }
          return;
        }
      }

      const res = this.advance(ev, gain, true);
      this.nextSpot(lateral);
      if (res === 'td') {
        this.stats.add(qb?.id, 'passTD', 1);
        this.stats.add(target.id, 'recTD', 1);
        ev.text = `${cName} — ${qbName} ${air >= toGoal ? 'hits' : 'finds'} ${tName} for a ${gain}-yard TOUCHDOWN!`;
        this.touchdown(ev, off, `${tName} ${gain} yd pass from ${qbName}`);
      } else if (res === 'safety') {
        ev.text = `${cName} — ${tName} is tackled in the end zone. SAFETY!`;
      } else {
        ev.tackler = tackler?.id;
        this.stats.add(tackler?.id, 'tackles', 1);
        if (gain < 0) this.stats.add(tackler?.id, 'tfl', 1);
        ev.text = `${cName} — ${qbName} completes to ${tName} for ${gain === 0 ? 'no gain' : `${gain} yard${Math.abs(gain) === 1 ? '' : 's'}`}${ev.outOfBounds ? ', out of bounds' : ''}.`;
        if (ev.firstDown) ev.text += ' FIRST DOWN.';
        if (res === 'downs') ev.text += ' TURNOVER ON DOWNS.';
        else s.clockRunning = !(ev.firstDown && this.inside2()) && !(ev.outOfBounds && this.inside2());
        if (gain >= 25) ev.highlight = 'BIG PLAY';
      }
      this.maybeHolding(ev, gain, off, res);
      this.maybeInjure(ev, [target.id, tackler?.id], [off, def]);
      return;
    }

    // INCOMPLETE (maybe DPI)
    ev.complete = false;
    this.runClock(this.rng.float(4, 6), off);
    const breakup = covDef && sep < 0.5 && this.rng.chance(0.45);
    if (breakup) this.stats.add(covDef?.id, 'passDef', 1);
    const dpiChance = depthKey === 'medium' || depthKey === 'deep' ? GAME_CONFIG.penalties.passInterference * 2.2 : GAME_CONFIG.penalties.passInterference * 0.4;
    if (air > 0 && this.rng.chance(dpiChance)) {
      // College DPI: 15 yards max from the previous spot, automatic first down.
      let yards = Math.min(15, air);
      // Spot fouls in the end zone put the ball at the 2 (or half the distance inside it).
      if (s.ballOn + yards >= 99) yards = s.ballOn >= 98 ? Math.floor((100 - s.ballOn) / 2) : 98 - s.ballOn;
      yards = Math.max(0, yards);
      this.stats.add(qb?.id, 'passAtt', -1);
      this.stats.add(target.id, 'targets', -1);
      this.stats.team[off].passAtt--;
      if (s.down === 3) this.stats.team[off].thirdDownAtt--;
      if (s.down === 4) this.stats.team[off].fourthDownAtt--;
      this.stats.team[def].penalties++;
      this.stats.team[def].penaltyYards += yards;
      ev.penalty = { on: def, name: 'Pass interference', yards, autoFirst: true, accepted: true };
      s.ballOn += yards;
      s.down = 1;
      s.distance = Math.min(10, 100 - s.ballOn);
      ev.firstDown = true;
      this.stats.team[off].firstDowns++;
      ev.text = `${cName} — ${qbName} throws for ${tName}... FLAG: Pass interference on ${this.name(covDef?.id)}. ${yards ? `${yards} yard${yards === 1 ? '' : 's'}, ` : ''}automatic FIRST DOWN.`;
      s.clockRunning = false;
      this.nextSpot(this.vrng.normal(0, 6));
      return;
    }
    const why = breakup ? `broken up by ${this.name(covDef?.id)}` : pressured ? 'hurried throw falls incomplete' : this.vrng.pick(['incomplete', 'off his fingertips', 'overthrown', 'thrown behind him']);
    ev.text = `${cName} — ${qbName}'s pass for ${tName} is ${breakup ? why : why === 'hurried throw falls incomplete' ? 'hurried and falls incomplete' : `incomplete (${why})`}.`;
    const res = this.advance(ev, 0, false);
    if (res === 'downs') ev.text += ' TURNOVER ON DOWNS.';
    s.clockRunning = false;
  }

  private coverageAssignments(receivers: Player[], d: { DL: Player[]; LB: Player[]; CB: Player[]; S: Player[] }): Map<string, Player> {
    const map = new Map<string, Player>();
    const cbs = [...d.CB];
    const ss = [...d.S];
    const lbs = [...d.LB];
    for (const r of receivers) {
      let who: Player | undefined;
      if (r.position === 'WR') who = cbs.shift() ?? ss.shift() ?? lbs.shift();
      else if (r.position === 'TE') who = ss.shift() ?? lbs.shift() ?? cbs.shift();
      else who = lbs.shift() ?? ss.shift() ?? cbs.shift();
      if (who) map.set(r.id, who);
    }
    return map;
  }
}

/** Convenience: simulate a full game and return the result plus the engine (for events). */
export function simulateGame(setup: GameSetup): { result: GameResult; engine: GameSimulation } {
  const engine = new GameSimulation(setup);
  engine.simulateToEnd();
  return { result: engine.result(), engine };
}
