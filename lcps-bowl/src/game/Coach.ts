/**
 * Coach AI — play calling, fourth-down, PAT, timeout and clock decisions for CPU teams.
 * Higher difficulty = smarter situational football and recognition of the human's tendencies.
 */
import type { RNG } from './rng';
import { OFFENSE_PLAYS, type OffPlay, type PlayCategory, type DefCall, type Coverage, type DefFormationId } from './Plays';
import type { GameState, Side } from './Rules';
import { other } from './Rules';
import type { DepthChart } from './Lineup';
import { ovr } from './players';

export interface Tendencies {
  counts: Record<PlayCategory, number>;
  total: number;
  recent: PlayCategory[];
}
export const newTendencies = (): Tendencies => ({
  counts: { RUN: 0, SHORT: 0, MEDIUM: 0, DEEP: 0, 'PLAY ACTION': 0, SCREEN: 0, SPECIAL: 0 },
  total: 0,
  recent: [],
});
export function recordTendency(t: Tendencies, cat: PlayCategory) {
  t.counts[cat]++;
  t.total++;
  t.recent.push(cat);
  if (t.recent.length > 8) t.recent.shift();
}

export function fgDistance(ballOn: number) {
  return Math.round(100 - ballOn + 17);
}

export function fgRange(depth: DepthChart): number {
  const k = depth.K[0];
  return k ? 30 + k.attrs.kpow * 0.28 : 32;
}

export function fgProbability(distance: number, depth: DepthChart, weather: string): number {
  const k = depth.K[0];
  const kpow = k?.attrs.kpow ?? 45;
  const kacc = k?.attrs.kacc ?? 45;
  const range = 30 + kpow * 0.28;
  let p = 1.0 - (distance - 18) * 0.016 * (1.35 - kacc / 100) - Math.max(0, distance - range) * 0.16;
  if (weather === 'wind') p -= 0.08;
  if (weather === 'rain') p -= 0.05;
  if (weather === 'snow') p -= 0.08;
  return Math.max(0.02, Math.min(0.98, p));
}

const timeLeftInHalf = (g: GameState) => (g.quarter === 2 || g.quarter === 4 ? g.clock : g.quarter === 1 || g.quarter === 3 ? g.clock + g.quarterLen : 0);

/** CPU offensive play call. Returns a play id. */
export function cpuOffenseCall(g: GameState, side: Side, depth: DepthChart, skill: number, rng: RNG, weather: string): { play: OffPlay; hurry: boolean } {
  const lead = g.score[side] - g.score[other(side)];
  const late = g.quarter >= 4 && !g.ot;
  const twoMin = (g.quarter === 2 || g.quarter === 4) && g.clock < 75;
  const hurry = (late && lead < 0 && g.clock < g.quarterLen * 0.5) || (g.quarter === 2 && g.clock < 50 && g.ballOn > 35);
  const pick = (id: string) => OFFENSE_PLAYS.find((p) => p.id === id)!;

  // Victory formation
  if (late && lead > 0 && g.clock <= (5 - g.down) * 24 && g.down <= 4 && !(g.down === 4)) return { play: pick('kneel'), hurry: false };
  if (g.quarter === 2 && g.clock < 25 && g.ballOn < 40 && lead >= 0 && g.down < 4) return { play: pick('kneel'), hurry: false };

  // Fourth down
  if (g.down === 4) {
    const fgD = fgDistance(g.ballOn);
    const range = fgRange(depth);
    const pFG = fgProbability(fgD, depth, weather);
    const desperate = late && lead < 0 && (g.clock < 150 || lead < -8);
    const needTD = late && lead < -3 && g.clock < 60;
    if (!needTD && fgD <= range && pFG > 0.35 && !(desperate && lead < -3)) {
      // Short yardage near the goal: sometimes go for it
      if (g.toGo <= 1 && g.ballOn >= 95 && skill > 0.5 && rng.chance(0.35)) return { play: pick(rng.chance(0.5) ? 'sneak' : 'goal_dive'), hurry };
      return { play: pick('fg'), hurry: false };
    }
    const goForIt = desperate || needTD || (g.toGo <= 2 && g.ballOn >= 45 && rng.chance(0.35 + skill * 0.3)) || (g.toGo <= 1 && g.ballOn >= 35 && rng.chance(0.25 + skill * 0.2)) || (g.ballOn >= 60 && g.toGo <= 4 && fgD > range && rng.chance(0.5));
    if (!goForIt) return { play: pick('punt'), hurry: false };
  }

  // Clock: spike if no timeouts and clock running late
  if ((late || g.quarter === 2) && g.clockRunning && g.clock < 20 && g.timeouts[side] === 0 && lead <= 0 && g.down < 4 && g.ballOn > 50) {
    return { play: pick('spike'), hurry: true };
  }

  // Situation → category weights
  const qb = depth.QB[0];
  const rb = depth.RB[0];
  const passBias = ((qb ? ovr(qb) : 50) - (rb ? ovr(rb) : 50)) / 100;
  const w: Record<PlayCategory, number> = { RUN: 4, SHORT: 2.5, MEDIUM: 2, DEEP: 1, 'PLAY ACTION': 1, SCREEN: 0.8, SPECIAL: 0 };
  const tg = g.toGo;
  if (g.down === 1) { w.RUN = 4.5; w['PLAY ACTION'] = 1.4; }
  if (g.down === 2 && tg >= 7) { w.RUN = 2.5; w.MEDIUM = 2.5; w.SCREEN = 1.2; }
  if (g.down >= 3 && tg >= 7) { w.RUN = 0.6; w.SHORT = 1.5; w.MEDIUM = 3.5; w.DEEP = 1.6; w.SCREEN = 0.8; w['PLAY ACTION'] = 0.3; }
  if (g.down >= 3 && tg <= 3) { w.RUN = 4; w.SHORT = 3; w.MEDIUM = 0.8; w.DEEP = 0.3; }
  if (tg <= 1) { w.RUN = 6; w.SPECIAL = 1.2; }
  if (twoMin && lead <= 0) { w.RUN *= 0.25; w.MEDIUM *= 1.6; w.DEEP *= 1.5; w.SHORT *= 1.3; }
  if (late && lead > 0) { w.RUN *= 2.5; w.DEEP *= 0.2; }
  if (late && lead < -8) { w.RUN *= 0.3; w.DEEP *= 2; }
  if (weather === 'rain' || weather === 'snow' || weather === 'wind') { w.RUN *= 1.4; w.DEEP *= 0.5; }
  if (g.ballOn >= 90) { w.DEEP = 0; w['PLAY ACTION'] *= 1.5; w.SPECIAL = g.ballOn >= 97 ? 2 : 0.5; w.MEDIUM *= 0.5; }
  w.RUN *= 1 - passBias;
  w.SHORT *= 1 + passBias * 0.5;
  w.MEDIUM *= 1 + passBias;
  w.DEEP *= 1 + passBias;
  const cats = Object.keys(w) as PlayCategory[];
  const cat = rng.weighted(cats, cats.map((c) => w[c]));
  let options = OFFENSE_PLAYS.filter((p) => p.cat === cat && !['punt', 'fg', 'kneel', 'spike'].includes(p.id));
  if (cat === 'SPECIAL') options = OFFENSE_PLAYS.filter((p) => p.id === 'sneak' || p.id === 'goal_dive');
  if (g.ballOn >= 85) options = options.filter((p) => !['four_verts', 'post', 'pa_shot', 'deep_cross'].includes(p.id));
  if (!options.length) options = OFFENSE_PLAYS.filter((p) => p.cat === 'RUN');
  return { play: rng.pick(options), hurry };
}

/** CPU defensive call, informed (at higher skill) by the human's tendencies. */
export function cpuDefenseCall(g: GameState, skill: number, rng: RNG, tend?: Tendencies): DefCall {
  if (rng.chance(1 - skill * 0.8)) {
    // Generic call
    const forms: DefFormationId[] = ['4-3', '4-3', '3-4', 'Nickel'];
    const covs: Coverage[] = ['Cover 2', 'Cover 3', 'Cover 3', 'Man', 'Cover 4', 'Blitz', 'Zone Blitz'];
    let f = rng.pick(forms);
    if (g.toGo >= 8 && g.down >= 2) f = 'Nickel';
    if (g.ballOn >= 97 || (g.toGo <= 1 && g.down >= 3)) f = 'Goal Line';
    return { formation: f, coverage: rng.pick(covs) };
  }
  const tg = g.toGo;
  let runP = 0.5;
  let deepP = 0.15;
  if (tend && tend.total >= 4) {
    const recentRun = tend.recent.filter((c) => c === 'RUN').length / Math.max(1, tend.recent.length);
    runP = (tend.counts.RUN / tend.total) * 0.5 + recentRun * 0.5;
    deepP = (tend.counts.DEEP + tend.counts['PLAY ACTION']) / tend.total;
  }
  if (g.down >= 3 && tg >= 7) runP *= 0.3;
  if (tg <= 2) runP = Math.max(runP, 0.65);
  if (g.ballOn >= 97 || (tg <= 1 && g.down >= 3)) return { formation: 'Goal Line', coverage: rng.chance(0.5) ? 'Man' : 'Blitz' };
  if (runP > 0.55) return { formation: rng.chance(0.6) ? '4-3' : '3-4', coverage: rng.weighted<Coverage>(['Cover 3', 'Blitz', 'Zone Blitz', 'Man'], [3, 2, 2, 1.5]) };
  if (deepP > 0.3 || (g.down >= 3 && tg >= 12)) return { formation: g.down >= 3 && tg >= 10 ? 'Dime' : 'Nickel', coverage: rng.weighted<Coverage>(['Cover 4', 'Cover 3', 'Cover 2'], [3, 2, 1.5]) };
  if (g.down >= 3 && tg >= 6) return { formation: 'Nickel', coverage: rng.weighted<Coverage>(['Cover 2', 'Man', 'Blitz', 'Cover 4', 'Zone Blitz'], [2, 2, 1.5, 1.5, 1.5]) };
  return { formation: rng.chance(0.5) ? '4-3' : 'Nickel', coverage: rng.weighted<Coverage>(['Cover 3', 'Cover 2', 'Man', 'Cover 4', 'Zone Blitz', 'Blitz'], [3, 2, 2, 1, 1, 1]) };
}

/** Should the CPU go for two? (Simplified chart, used late in games.) */
export function cpuGoForTwo(g: GameState, side: Side, skill: number, rng: RNG): boolean {
  const diff = g.score[side] - g.score[other(side)]; // after the TD
  if (g.ot && g.ot.period >= 3) return true;
  if (g.quarter >= 4 || (g.quarter === 3 && g.clock < g.quarterLen * 0.3)) {
    if ([-2, -5, -9, -10, 1, 5, 12].includes(diff)) return skill > 0.3 || rng.chance(0.5);
  }
  return rng.chance(0.04);
}

/** Should the CPU call a timeout now (before the next snap) to save clock? */
export function cpuWantsTimeout(g: GameState, side: Side, onOffense: boolean, skill: number): boolean {
  if (g.timeouts[side] <= 0 || !g.clockRunning || g.ot) return false;
  const lead = g.score[side] - g.score[other(side)];
  const half = g.quarter === 2 || g.quarter === 4;
  if (!half) return false;
  if (skill < 0.25) return false;
  const left = timeLeftInHalf(g);
  if (onOffense) {
    // Trailing/tied late, or end of half in scoring range
    if (g.quarter === 4 && lead <= 0 && left < 90) return true;
    if (g.quarter === 2 && left < 40 && g.ballOn > 50) return true;
  } else {
    // Defense trailing late wants the ball back
    if (g.quarter === 4 && lead < 0 && lead >= -16 && left < 150) return true;
  }
  return false;
}
