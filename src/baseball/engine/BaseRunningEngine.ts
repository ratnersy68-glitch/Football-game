/**
 * BaseRunningEngine: runner movement along the base paths, AI baserunning decisions
 * (go on contact, freeze on line drives, tag up, take the extra base) and user commands.
 */
import type { Player } from '../core/types';
import { basePos } from './Field';
import type { LivePlay, Runner } from './LivePlay';
import { DIFF_INDEX } from './LivePlay';
import { throwTime } from './FieldingEngine';

const ACCEL = 30;

export function runnerTopSpeed(p: Player): number {
  return 23 + p.ratings.speed * 0.065;
}

export function makeRunner(player: Player, base: number, responsiblePitcherId: string, reachedOnError: boolean, isBatter: boolean, p?: number): Runner {
  const top = runnerTopSpeed(player);
  return {
    id: player.id,
    player,
    p: p ?? base * 90,
    startBase: base,
    goal: base * 90,
    top,
    v: p !== undefined && p > base * 90 + 20 ? top * 0.85 : p !== undefined && p > base * 90 ? 6 : 0,
    delay: 0,
    lastTouched: base,
    out: false,
    scored: false,
    scoreTime: 0,
    mustRetag: false,
    manual: false,
    isBatter,
    slide: 0,
    responsiblePitcherId,
    reachedOnError,
    thinkCd: 0,
    trot: false,
  };
}

export function onBase(r: Runner): boolean {
  const k = Math.round(r.p / 90);
  return Math.abs(r.p - k * 90) < 0.6;
}

/** Time (s) until the defense can have the ball at a base. */
export function defenseTimeTo(play: LivePlay, base: number, tag = true): number {
  const b = play.ball;
  const bp = basePos(base);
  const tagT = tag ? 0.28 : 0.05;
  if (b.mode === 'dead') return Infinity;
  if (b.mode === 'held' && b.holder) {
    const h = b.holder;
    const run = Math.hypot(h.x - bp.x, h.z - bp.z) / h.speed;
    const of = Math.hypot(h.x, h.z) > 170;
    const transfer = Math.max(0, (of ? 0.85 : 0.6) - h.holdTime);
    return Math.min(run, transfer + throwTime(h, bp)) + tagT;
  }
  if (b.mode === 'thrown') {
    const sp = Math.hypot(b.phys.v.x, b.phys.v.z) || 1;
    const left = Math.hypot(b.throwTarget.x - b.phys.p.x, b.throwTarget.z - b.phys.p.z) / sp;
    if (b.throwBase === base) return left + tagT;
    const from = basePos(b.throwBase);
    return left + 0.45 + Math.hypot(from.x - bp.x, from.z - bp.z) / 120 + tagT;
  }
  const it = play.intercept;
  if (!it) return 6;
  const tBall = Math.max(0, it.tAbs - play.t);
  const f = it.f;
  const d = Math.hypot(it.x - bp.x, it.z - bp.z);
  const of = Math.hypot(it.x, it.z) > 170;
  const pickup = (it.air ? 0.2 : 0.35) + (of ? 0.85 : 0.6);
  void d;
  return tBall + pickup + throwTime({ ...f, x: it.x, z: it.z }, bp) + tagT;
}

function runTime(r: Runner, base: number): number {
  const remain = Math.abs(base * 90 - r.p);
  const v0 = r.v;
  const tAcc = Math.max(0, (r.top - v0) / ACCEL);
  const dAcc = v0 * tAcc + 0.5 * ACCEL * tAcc * tAcc;
  if (dAcc >= remain) return Math.sqrt((2 * remain) / ACCEL) + Math.max(0, r.delay);
  return tAcc + (remain - dAcc) / r.top + Math.max(0, r.delay);
}

function occupiedBy(play: LivePlay, base: number, except: Runner): Runner | undefined {
  return play.activeRunners().find((o) => o !== except && (Math.abs(o.p - base * 90) < 0.6 || (o.goal === base * 90 && o.p > (base - 1) * 90)));
}

function aggression(play: LivePlay): number {
  if (play.cfg.userOffense) return 0.15;
  return 0.26 - DIFF_INDEX[play.cfg.difficulty] * 0.035 + play.cfg.rng.gauss(0.08);
}

/** Decide where an AI-controlled runner should be going right now. */
function think(play: LivePlay, r: Runner) {
  if (r.manual || r.trot || r.out || r.scored) return;
  const b = play.ball;
  const outs2 = play.totalOuts() >= 2;
  const assisted = !play.cfg.userOffense || play.cfg.runningAssist;
  const forcedTo = play.isForced(r) && r.lastTouched < r.startBase + 1 ? r.startBase + 1 : 0;
  if (r.mustRetag) { r.goal = r.startBase * 90; return; }
  if (!assisted) {
    // Without assist only the batter and forced runners run on their own.
    if (r.isBatter && r.goal < 90) r.goal = 90;
    if (forcedTo && r.goal < forcedTo * 90) r.goal = forcedTo * 90;
    return;
  }
  const minGoal = Math.max(forcedTo * 90, r.isBatter ? 90 : 0);

  if (b.mode === 'loose' && b.battedInAir) {
    if (outs2) {
      r.goal = Math.max(r.goal, minGoal, (Math.floor(r.p / 90 + 0.001) + 1) * 90);
      if (onBase(r) || Math.abs(r.p - r.goal) < 12) extend(play, r);
      return;
    }
    if (r.isBatter) { r.goal = Math.max(r.goal, 90); return; }
    if (play.flyCatchable) {
      const deep = play.intercept ? Math.hypot(play.intercept.x, play.intercept.z) > 240 : false;
      if (r.startBase === 3 || (r.startBase === 2 && deep)) r.goal = r.startBase * 90;
      else r.goal = r.startBase * 90 + (forcedTo ? 38 : 22);
    } else {
      r.goal = Math.max(minGoal, (r.startBase + 1) * 90);
    }
    return;
  }

  // Ball on the ground, held, or being thrown.
  if (r.goal < minGoal) r.goal = minGoal;
  const k = Math.floor(r.p / 90 + 0.001);
  const movingFwd = r.goal > r.p + 0.1;
  if (movingFwd) {
    const G = Math.round(r.goal / 90);
    if (G * 90 === r.goal && G > forcedTo && G > k && !(r.isBatter && G === 1)) {
      // Abort the advance if it's now clearly hopeless and the base behind is free.
      const margin = defenseTimeTo(play, G) - runTime(r, G);
      if (margin < -0.25 && Math.abs(r.p - G * 90) > 20 && !occupiedBy(play, k, r)) {
        r.goal = k * 90;
        return;
      }
    }
    if (Math.abs(r.p - r.goal) < 14) extend(play, r);
    return;
  }
  if (r.goal % 90 !== 0) {
    // Partway off a base (fly ball dropped / ball now held): pick the safer base.
    const fwd = Math.ceil(r.p / 90), back = Math.floor(r.p / 90);
    const mf = defenseTimeTo(play, fwd) - runTime(r, fwd);
    const mb = defenseTimeTo(play, back) - runTime(r, back);
    r.goal = (mf > mb + 0.2 || forcedTo === fwd) && !occupiedBy(play, fwd, r) ? fwd * 90 : back * 90;
    return;
  }
  if (onBase(r)) extend(play, r);
}

/** At (or nearly at) a base: try for the next one if the margin allows. */
function extend(play: LivePlay, r: Runner) {
  const cur = Math.round(r.goal / 90);
  const next = cur + 1;
  if (next > 4) return;
  const blocker = play.activeRunners().find((o) => o !== r && o.p > r.p && o.goal <= next * 90 && Math.abs(o.goal - next * 90) < 0.5);
  if (blocker) return;
  const ahead = play.activeRunners().find((o) => o !== r && Math.abs(o.p - next * 90) < 0.6 && o.goal <= o.p + 0.1);
  if (ahead) return;
  const b = play.ball;
  // With the ball held in the infield nobody tries to take an extra base.
  if (b.mode === 'held' && b.holder && Math.hypot(b.holder.x, b.holder.z - 60) < 100) return;
  const forced = play.isForced(r) && next === r.startBase + 1;
  const margin = defenseTimeTo(play, next, !forced) - runTime(r, next);
  if (margin > aggression(play)) r.goal = next * 90;
}

export function initialDecisions(play: LivePlay) {
  for (const r of play.runners) {
    if (r.stealingFlag) continue;
    think(play, r);
  }
}

export function updateRunners(play: LivePlay, dt: number) {
  const active = play.activeRunners().sort((a, b) => b.p - a.p);
  for (const r of active) {
    r.thinkCd -= dt;
    if (r.thinkCd <= 0) { think(play, r); r.thinkCd = 0.15; }
  }
  for (let i = 0; i < active.length; i++) {
    const r = active[i];
    r.slide = Math.max(0, r.slide - dt);
    if (r.out || r.scored) continue;
    if (r.delay > 0) { r.delay -= dt; continue; }
    if (play.totalOuts() >= 3 && !play.homeRun) { r.v = 0; continue; }
    if (r.mustRetag) r.goal = r.startBase * 90;
    const target = Math.max(r.goal, r.startBase * 90);
    const diff = target - r.p;
    if (Math.abs(diff) < 0.01) { r.v = 0; continue; }
    const dir = Math.sign(diff);
    const top = r.trot ? r.top * 0.5 : dir < 0 ? r.top * 0.92 : r.top;
    r.v = Math.min(top, r.v + ACCEL * dt);
    const step = r.v * dt;
    let np = Math.abs(diff) <= step ? target : r.p + dir * step;
    if (Math.abs(diff) <= step) r.v *= 0.5;
    // Don't run up the back of the runner ahead.
    const ahead = i > 0 ? active[i - 1] : undefined;
    if (dir > 0 && ahead && !ahead.out && !ahead.scored && np > ahead.p - 3 && ahead.p < 360) np = Math.max(r.p, ahead.p - 3);
    if (dir > 0) {
      for (let k = Math.floor(r.p / 90) + 1; k * 90 <= np + 1e-6 && k <= 4; k++) {
        if (k > r.lastTouched) {
          r.lastTouched = k;
          play.emit('touch', { base: k, runner: r.player.name });
        }
      }
    }
    if (dir < 0 && r.mustRetag && np <= r.startBase * 90 + 0.01) {
      np = r.startBase * 90;
      r.mustRetag = false;
      r.thinkCd = 0;
    }
    r.p = np;
    // Slide into a base when a throw is coming.
    const gb = Math.round(r.goal / 90);
    if (dir > 0 && r.goal % 90 === 0 && Math.abs(r.goal - r.p) < 9 && r.slide <= 0 && gb >= 2 && !r.trot) {
      const b = play.ball;
      if ((b.mode === 'thrown' && b.throwBase === gb) || (b.mode === 'held' && b.holder && Math.hypot(b.holder.x - basePos(gb).x, b.holder.z - basePos(gb).z) < 12)) {
        r.slide = 0.55;
        play.emit('slide');
      }
    }
    if (r.p >= 360) play.scoreRunner(r);
  }
  // Tag-up decisions right after a catch.
  for (const r of play.activeRunners()) {
    if (!r.mustRetag && play.caughtFly && onBase(r) && !r.manual && r.goal === r.p) {
      if (!play.cfg.userOffense || play.cfg.runningAssist) extend(play, r);
    }
  }
}

/** User command: advance (+1) or retreat (-1) runners. sel = startBase of a runner, or null for all. */
export function commandRunners(play: LivePlay, dir: 1 | -1, sel: number | null) {
  for (const r of play.activeRunners()) {
    if (r.trot) continue;
    if (sel !== null && !matchesSelection(r, sel)) continue;
    r.manual = true;
    const k = Math.floor(r.p / 90 + 0.001);
    if (dir > 0) {
      let nb: number;
      if (r.goal % 90 !== 0) nb = Math.ceil(r.p / 90);
      else if (r.goal > r.p + 0.1) nb = Math.round(r.goal / 90) + 1;
      else nb = k + 1;
      r.goal = Math.min(4, nb) * 90;
    } else {
      if (r.isBatter && r.lastTouched < 1) continue; // batter must go to first
      if (play.isForced(r) && r.lastTouched < r.startBase + 1) continue;
      const back = onBase(r) && r.goal <= r.p + 0.1 ? k - 1 : k;
      r.goal = Math.max(r.startBase, back) * 90;
    }
  }
}

function matchesSelection(r: Runner, sel: number): boolean {
  if (sel === 0) return r.isBatter;
  const cur = Math.round(r.p / 90);
  return r.startBase === sel || (onBase(r) && cur === sel);
}

/** Emergency resolution: put every live runner on the nearest legal base. */
export function snapRunners(play: LivePlay) {
  const taken = new Set<number>();
  const rs = play.activeRunners().sort((a, b) => b.p - a.p);
  for (const r of rs) {
    let b = Math.max(r.startBase, Math.round(r.p / 90));
    while (taken.has(b) && b > r.startBase) b--;
    if (b >= 4) { r.p = 360; play.scoreRunner(r); continue; }
    r.p = b * 90;
    r.goal = r.p;
    taken.add(b);
  }
}
