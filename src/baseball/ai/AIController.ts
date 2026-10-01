/**
 * AIController: the computer manager, pitcher and hitter.
 *  - The AI pitcher sequences pitches by count, batter quality and what it has thrown, and
 *    executes with a meter error that depends on difficulty and the pitcher's control.
 *  - The AI hitter never sees the selected pitch: it perceives the ball's location and speed
 *    with noise (better hitters see it better) and sits on the fastball, so changeups after
 *    heaters really do fool it.
 *  - Difficulty changes decision quality and execution, not physics.
 */
import type { Difficulty, PitchCode, Player } from '../core/types';
import { Rng, clamp } from '../core/math';
import { PITCHES } from '../data/pitchTypes';
import { battingSide, SWING_LAG, type SwingInput, type SwingType } from '../engine/BattingEngine';
import { CONTACT_Z, ZONE, isInZone, pitchPos, timeAtZ, type PitchCommand, type PitchFlight } from '../engine/PitchEngine';
import { DIFF_INDEX } from '../engine/LivePlay';
import type { GameState, TeamGameState } from '../engine/GameState';
import { fatigue } from '../engine/GameState';

export interface PitchHistory { codes: PitchCode[] }

const bestBreaking = (codes: PitchCode[]) => codes.filter((c) => !PITCHES[c].fastball).sort((a, b) => Math.abs(PITCHES[b].ivb - 8) + Math.abs(PITCHES[b].hb) - (Math.abs(PITCHES[a].ivb - 8) + Math.abs(PITCHES[a].hb)))[0];

export function choosePitch(state: GameState, pitcher: Player, batter: Player, diff: Difficulty, rng: Rng, hist: PitchHistory): PitchCommand {
  const pr = pitcher.pitcher!;
  const d = DIFF_INDEX[diff];
  const smart = d / 5; // 0 rookie .. 1 legend
  const { balls, strikes } = state;
  const reps = pr.pitches;
  const last = hist.codes.slice(-3);
  const ahead = strikes > balls;
  const behind = balls > strikes && balls >= 2;
  const bat = battingSide(batter, pitcher);
  const elite = (batter.ratings.powerR + batter.ratings.contactR) / 2 > 78;
  const firstBaseOpen = !state.bases[0];

  const weights = reps.map((code, i) => {
    const s = PITCHES[code];
    let w = i === 0 ? 1.6 : 1.1 - i * 0.08;
    if (s.fastball) {
      if (behind) w *= 1.9;
      if (balls === 0 && strikes === 0) w *= 1.4;
    } else {
      if (ahead) w *= 1 + 0.8 * smart + 0.3;
      if (strikes === 2) w *= 1.3 + 0.6 * smart;
      // Changeups / sliders away from same-side vs opposite-side hitters.
      if ((code === 'CH' || code === 'FS') && bat !== pitcher.throws) w *= 1.3;
      if ((code === 'SL' || code === 'ST') && bat === pitcher.throws) w *= 1.3;
    }
    // Change speeds after fastballs (smart AIs).
    const fbRun = last.filter((c) => PITCHES[c].fastball).length;
    if (!s.fastball && fbRun >= 2) w *= 1 + smart;
    const repeats = last.filter((c) => c === code).length;
    if (repeats >= 2) w *= 0.45 + (1 - smart) * 0.4;
    return Math.max(0.02, w);
  });
  // Lower difficulties are less deliberate: flatten the weights.
  const flat = weights.map((w) => w * smart + (1 - smart) * 1);
  let code = rng.weighted(reps, flat);
  if (strikes === 2 && rng.chance(0.25 * smart)) code = bestBreaking(reps) ?? code;

  // ---- Location
  const away = bat === 'R' ? 1 : -1; // +x is away from a right-handed hitter
  const s = PITCHES[code];
  let tx: number;
  let ty: number;
  const r = rng.next();
  if (strikes === 2 && !s.fastball && r < 0.55 + smart * 0.2) {
    // Chase pitch: bury it.
    tx = away * rng.range(0.3, 0.9);
    ty = rng.range(0.95, 1.35);
  } else if (strikes === 2 && s.fastball && r < 0.4) {
    tx = rng.range(-0.5, 0.5);
    ty = rng.range(3.4, 3.85); // high heat
  } else if (behind || (balls === 3)) {
    tx = away * rng.range(-0.25, 0.45);
    ty = rng.range(2.1, 2.9);
  } else if (elite && firstBaseOpen && rng.chance(0.4 * smart)) {
    // Pitch carefully: nibble.
    tx = away * rng.range(0.7, 0.98);
    ty = rng.pick([1.6, 3.35]) + rng.gauss(0.1);
  } else if (rng.chance(0.12)) {
    // Challenge him.
    tx = rng.range(-0.35, 0.35);
    ty = rng.range(2.2, 2.9);
  } else {
    const edge = 0.8 + smart * 0.26;
    tx = (rng.chance(0.65) ? away : -away) * rng.range(edge - 0.3, edge + 0.22);
    ty = s.ivb < 3 ? rng.range(1.1, 2.1) : rng.range(1.5, 3.6);
  }

  // ---- Execution
  const sd = [0.48, 0.38, 0.29, 0.22, 0.17, 0.13][d] * (1.25 - (pr.control / 100) * 0.45);
  let meterError = rng.gauss(sd);
  const mistake = [0.14, 0.1, 0.07, 0.045, 0.03, 0.02][d];
  if (rng.chance(mistake)) {
    // Hanging pitch over the middle.
    tx = rng.range(-0.3, 0.3);
    ty = rng.range(2.4, 3.0);
    meterError = -0.25;
  }
  return { code, target: { x: tx, y: ty }, meterError };
}

export interface AISwingPlan { swing: SwingInput | null; perceived: { x: number; y: number }; decision: 'swing' | 'take' }

export function planSwing(state: GameState, batter: Player, pitcher: Player, flight: PitchFlight, diff: Difficulty, rng: Rng, hist: PitchHistory): AISwingPlan {
  const d = DIFF_INDEX[diff];
  const diffK = [1.5, 1.28, 1.1, 1.0, 0.9, 0.82][d];
  const r = batter.ratings;
  const recog = (r.vision * 0.6 + r.discipline * 0.4) / 100;
  const shape = PITCHES[flight.code];
  const move = Math.hypot(shape.hb, shape.ivb - 8) / 12;
  const noise = (0.6 - recog * 0.4) * diffK * (1 + move * 0.34 + Math.max(0, flight.mph - 90) / 35);
  const perceived = { x: flight.plate.x + rng.gauss(noise), y: flight.plate.y + rng.gauss(noise * 0.9) };
  const { balls, strikes } = state;
  let pSwing: number;
  if (isInZone(perceived.x, perceived.y)) {
    pSwing = 0.78 + (strikes === 2 ? 0.24 : 0) - (balls === 3 && strikes === 0 ? 0.55 : 0) - (balls === 0 && strikes === 0 ? 0.12 : 0) + (balls === 3 && strikes === 2 ? 0.1 : 0);
  } else {
    const out = Math.max(Math.abs(perceived.x) - ZONE.halfWidth, ZONE.bottom - perceived.y, perceived.y - ZONE.top, 0);
    pSwing = (1 - r.discipline / 100) * 0.62 * Math.exp(-out * 2.3) * (strikes === 2 ? 1.5 : 1) * diffK;
    if (balls === 3 && strikes < 2) pSwing *= 0.5;
  }
  pSwing = clamp(pSwing, 0, 0.97);
  if (!rng.chance(pSwing)) return { swing: null, perceived, decision: 'take' };

  const pow = pitcher.throws === 'R' ? r.powerR : r.powerL;
  const con = pitcher.throws === 'R' ? r.contactR : r.contactL;
  let type: SwingType = 'normal';
  if (strikes === 2 && con < 75) type = 'contact';
  else if ((balls === 2 && strikes === 0) || (balls === 3 && strikes === 1) || (balls === 1 && strikes === 0)) {
    if (pow > 72 && rng.chance(0.5)) type = 'power';
  } else if (pow > 85 && rng.chance(0.2)) type = 'power';

  // Timing: hitters sit fastball, adjusting by how well they read the pitch.
  const tc = timeAtZ(flight, CONTACT_Z);
  const fbMph = pitcher.pitcher!.velocity;
  const expectedT = tc * (flight.mph / fbMph);
  const lastFb = hist.codes.length && PITCHES[hist.codes[hist.codes.length - 1]].fastball;
  const read = clamp(recog * 1.05 - move * 0.12 - (lastFb && !shape.fastball ? 0.1 : 0), 0.05, 0.95) / diffK;
  const anticip = (expectedT - tc) * (1 - clamp(read, 0, 0.95)) * 0.7;
  const sd = clamp(0.036 - con * 0.00019, 0.012, 0.04) * diffK;
  const press = tc + anticip + rng.gauss(sd) + 0.006 - SWING_LAG;

  // PCI: where they think the ball will be, a hair under it for lift.
  const at = pitchPos(flight, tc);
  const pci = {
    x: at.x + (perceived.x - flight.plate.x) * 0.6 + rng.gauss(noise * 0.22),
    y: at.y + (perceived.y - flight.plate.y) * 0.6 + rng.gauss(noise * 0.22) - (pow > 70 ? 0.06 : 0.02),
  };
  return { swing: { type, pci, pressTime: press }, perceived, decision: 'swing' };
}

/** Should the CPU send a runner? Returns the base index (0-based) of the runner to send, or -1. */
export function stealDecision(state: GameState, diff: Difficulty, rng: Rng): number {
  if (state.outs === 2 && state.strikes === 2 && state.balls === 3) return -1;
  const d = DIFF_INDEX[diff];
  const r1 = state.bases[0], r2 = state.bases[1], r3 = state.bases[2];
  if (r1 && !r2) {
    const st = r1.player.ratings.stealing;
    const p = Math.max(0, (st - 62) / 100) * (0.22 + d * 0.02);
    if (rng.chance(p)) return 0;
  }
  if (r2 && !r3 && state.outs < 2) {
    const st = r2.player.ratings.stealing;
    const p = Math.max(0, (st - 76) / 100) * 0.18;
    if (rng.chance(p)) return 1;
  }
  return -1;
}

/** CPU manager: warm up / change pitchers. Returns the reliever to bring in, if any. */
export function managePitching(state: GameState, t: TeamGameState): Player | null {
  const f = fatigue(t);
  const bullpen = t.team.roster.filter((p) => p.pitcher && p.pitcher.role !== 'SP' && !t.pitchersUsed.includes(p) && !t.removed.has(p.id));
  if (!bullpen.length) return null;
  const late = state.inning >= Math.max(2, state.settings.innings - 1);
  const lead = (t.side === 'home' ? state.home.runs - state.away.runs : state.away.runs - state.home.runs);
  const closer = bullpen.find((p) => p.pitcher!.role === 'CL');
  const pickBest = () => bullpen.filter((p) => p.pitcher!.role !== 'CL' || late).sort((a, b) => (b.pitcher!.control + b.pitcher!.break + b.pitcher!.velocity) - (a.pitcher!.control + a.pitcher!.break + a.pitcher!.velocity))[0] ?? bullpen[0];
  const candidate = late && lead > 0 && lead <= 3 && closer && state.inning >= state.settings.innings ? closer : pickBest();
  if (f > 0.68 && !t.warming) t.warming = candidate.id;
  const bad = t.runsThisInningAllowed >= 4 || (t.runsThisInningAllowed >= 3 && f > 0.6);
  const closerTime = late && state.inning >= state.settings.innings && lead > 0 && lead <= 3 && closer && t.pitcher !== closer && t.pitcher.pitcher!.role !== 'CL' && state.outs === 0 && state.balls === 0 && state.strikes === 0;
  if (f > 1.0 || bad || closerTime) {
    return closerTime ? closer! : t.warming ? bullpen.find((p) => p.id === t.warming) ?? candidate : candidate;
  }
  return null;
}
