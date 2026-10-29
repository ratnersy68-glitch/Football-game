// Strength estimation + the Strength component of the ASCEND score.
//
// Methodology (also rendered in the app, see views/rank.js):
//  1. Estimated 1RM per working set = average of the Epley and Brzycki formulas, using
//     effective reps = reps + reps-in-reserve (RIR = 10 − RPE). Sets above 12 effective reps
//     are excluded: rep-max formulas lose accuracy there, so high-rep "junk" sets can't inflate rank.
//  2. Each rankable exercise converts its e1RM into a reference-lift equivalent for one of five
//     movement patterns (squat, deadlift, bench, overhead press, pull) using a fixed factor.
//  3. Progressive verification: one session can raise a pattern's verified strength by at most
//     10%. Bigger jumps are confirmed by subsequent sessions. Ratios beyond plausible human
//     limits are flagged and ignored.
//  4. The verified e1RM ÷ body weight is mapped onto commonly cited strength-standard bands.
//     These bands are approximate community standards, NOT a validated scientific classification.
import { getExercise, isAvailable, allExercises } from '../data/exercises.js';
import { clamp, mean, DAY_MS } from '../util.js';

export const RANK_PATTERNS = [
  { id: 'squat', label: 'Squat', ref: 'Back squat' },
  { id: 'deadlift', label: 'Hinge', ref: 'Deadlift' },
  { id: 'bench', label: 'Press', ref: 'Bench press' },
  { id: 'ohp', label: 'Overhead', ref: 'Overhead press' },
  { id: 'pull', label: 'Pull', ref: 'Barbell row' },
];

export const LEVEL_LABELS = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
const LEVEL_SCORES = [20, 40, 60, 80, 95];

// e1RM ÷ body weight at the start of each level band.
export const STANDARDS = {
  male: {
    squat: [0.75, 1.25, 1.5, 2.0, 2.5],
    deadlift: [1.0, 1.5, 1.75, 2.5, 3.0],
    bench: [0.5, 0.75, 1.0, 1.5, 2.0],
    ohp: [0.35, 0.55, 0.75, 1.0, 1.25],
    pull: [0.5, 0.75, 1.0, 1.25, 1.6],
  },
  female: {
    squat: [0.5, 0.75, 1.0, 1.5, 1.9],
    deadlift: [0.6, 1.0, 1.25, 1.75, 2.25],
    bench: [0.3, 0.5, 0.7, 1.0, 1.3],
    ohp: [0.2, 0.35, 0.5, 0.7, 0.9],
    pull: [0.3, 0.5, 0.7, 0.9, 1.15],
  },
};
STANDARDS.neutral = Object.fromEntries(Object.keys(STANDARDS.male).map((k) => [
  k, STANDARDS.male[k].map((v, i) => +((v + STANDARDS.female[k][i]) / 2).toFixed(3)),
]));

/** Reference-equivalent ratios beyond these are treated as data-entry errors. */
export const PLAUSIBLE_MAX = { squat: 3.6, deadlift: 4.2, bench: 2.7, ohp: 1.8, pull: 2.2 };
export const MAX_SESSION_GAIN = 0.10;
export const MAX_E1RM_REPS = 12;

/** Estimated one-rep max. Returns null when the set can't produce a reliable estimate. */
export function e1rm(load, reps, rir = 0) {
  if (!(load > 0) || !(reps >= 1)) return null;
  const r = reps + Math.max(0, rir || 0);
  if (r > MAX_E1RM_REPS) return null;
  if (r === 1) return load;
  const epley = load * (1 + r / 30);
  const brzycki = load * 36 / (37 - r);
  return (epley + brzycki) / 2;
}

export const rirFromRpe = (rpe) => (rpe == null || rpe === '' ? 0 : clamp(10 - Number(rpe), 0, 5));

/** Total external load moved in a set, in kg, accounting for dumbbells and body weight. */
export function setLoadKg(ex, set, bwKg) {
  const w = Number(set.weightKg) || 0;
  switch (ex?.load) {
    case 'perHand': return w * 2;
    case 'bw': return bwKg + w;
    case 'assist': return Math.max(0, bwKg - w);
    default: return w;
  }
}

/** Volume counts external load × reps (body-weight exercises count added weight only). */
export function setVolumeKg(ex, set) {
  if (set.type === 'warmup' || !set.done) return 0;
  const w = Number(set.weightKg) || 0;
  const reps = Number(set.reps) || 0;
  if (ex?.load === 'perHand') return w * 2 * reps;
  if (ex?.load === 'assist') return 0;
  return w * reps;
}

/** Body weight on a given date from the log (latest entry on/before the date). */
export function bodyweightAt(state, date) {
  const t = new Date(date).getTime();
  const log = state.bodyweights || [];
  let best = null;
  for (const b of log) {
    const bt = new Date(b.date).getTime();
    if (bt <= t + DAY_MS && (!best || bt > new Date(best.date).getTime())) best = b;
  }
  return best?.kg || state.profile?.bodyweightKg || 75;
}

export function bestSetE1rm(ex, sets, bwKg) {
  let best = null;
  for (const s of sets) {
    if (!s.done || s.type === 'warmup') continue;
    const v = e1rm(setLoadKg(ex, s, bwKg), Number(s.reps), rirFromRpe(s.rpe));
    if (v && (!best || v > best.e1rm)) best = { e1rm: v, set: s };
  }
  return best;
}

/**
 * Walk all sessions chronologically and produce, per pattern, a series of verified
 * reference-equivalent e1RMs: [{date, sessionId, raw, verified, exId, bw, flagged}]
 */
export function patternSeries(state) {
  const custom = state.customExercises || [];
  const sessions = [...(state.sessions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const series = Object.fromEntries(RANK_PATTERNS.map((p) => [p.id, []]));
  const verified = {};
  for (const s of sessions) {
    const bw = bodyweightAt(state, s.date);
    const bestPerPattern = {};
    for (const item of s.exercises || []) {
      const ex = getExercise(item.exId, custom);
      if (!ex?.rank) continue;
      const best = bestSetE1rm(ex, item.sets || [], bw);
      if (!best) continue;
      const eq = best.e1rm * ex.rank.f;
      const cur = bestPerPattern[ex.rank.p];
      if (!cur || eq > cur.eq) bestPerPattern[ex.rank.p] = { eq, exId: ex.id, e1rm: best.e1rm };
    }
    for (const [p, b] of Object.entries(bestPerPattern)) {
      const ratio = b.eq / bw;
      if (ratio > PLAUSIBLE_MAX[p]) {
        series[p].push({ date: s.date, sessionId: s.id, raw: b.eq, verified: verified[p] ?? 0, exId: b.exId, bw, flagged: true });
        continue;
      }
      const prev = verified[p];
      const v = prev == null ? b.eq : Math.max(prev, Math.min(b.eq, prev * (1 + MAX_SESSION_GAIN)));
      verified[p] = v;
      series[p].push({ date: s.date, sessionId: s.id, raw: b.eq, verified: v, exId: b.exId, bw, capped: b.eq > v + 1e-9, flagged: false });
    }
  }
  return series;
}

/** Map a body-weight ratio onto 0–100 using the standard bands. */
export function ratioToScore(ratio, bands) {
  if (!(ratio > 0)) return 0;
  if (ratio < bands[0]) return LEVEL_SCORES[0] * (ratio / bands[0]);
  for (let i = 0; i < bands.length - 1; i++) {
    if (ratio < bands[i + 1]) {
      const t = (ratio - bands[i]) / (bands[i + 1] - bands[i]);
      return LEVEL_SCORES[i] + t * (LEVEL_SCORES[i + 1] - LEVEL_SCORES[i]);
    }
  }
  const top = bands[bands.length - 1];
  return Math.min(100, LEVEL_SCORES[4] + 5 * ((ratio - top) / (top * 0.15)));
}

export function levelIndex(ratio, bands) {
  let i = -1;
  for (let k = 0; k < bands.length; k++) if (ratio >= bands[k]) i = k;
  return i;
}

/** Which patterns the user can realistically train with their equipment. */
export function feasiblePatterns(state) {
  const eq = state.profile?.equipment || [];
  const all = allExercises(state.customExercises || []);
  return RANK_PATTERNS.filter((p) => all.some((e) => e.rank?.p === p.id && isAvailable(e, eq))).map((p) => p.id);
}

/**
 * Strength component.
 * strength = mean(trained pattern scores) × (0.6 + 0.4 × trained / feasible)
 * Uses the best verified value from the last 180 days.
 */
export function computeStrength(state, now = new Date(), series = patternSeries(state)) {
  const std = STANDARDS[state.profile?.sexStandard] || STANDARDS.neutral;
  const feasible = feasiblePatterns(state);
  const since = now.getTime() - 180 * DAY_MS;
  const patterns = {};
  const flagged = [];
  for (const p of RANK_PATTERNS) {
    const pts = series[p.id].filter((x) => new Date(x.date).getTime() >= since && new Date(x.date) <= now);
    pts.filter((x) => x.flagged).forEach((x) => flagged.push({ pattern: p.id, ...x }));
    const valid = pts.filter((x) => !x.flagged);
    const best = valid.reduce((a, b) => (!a || b.verified > a.verified ? b : a), null);
    const bw = best?.bw || state.profile?.bodyweightKg || 75;
    const ratio = best ? best.verified / bw : 0;
    patterns[p.id] = {
      id: p.id, label: p.label, ref: p.ref,
      trained: !!best, feasible: feasible.includes(p.id) || !!best,
      eqKg: best?.verified || 0, rawKg: best?.raw || 0, ratio, exId: best?.exId,
      score: best ? ratioToScore(ratio, std[p.id]) : 0,
      level: best ? levelIndex(ratio, std[p.id]) : -1,
      bands: std[p.id], capped: valid.some((x) => x.capped),
    };
  }
  const trained = Object.values(patterns).filter((p) => p.trained);
  const feasibleCount = Math.max(1, Object.values(patterns).filter((p) => p.feasible).length);
  const coverage = trained.length / feasibleCount;
  const strength = trained.length ? mean(trained.map((p) => p.score)) * (0.6 + 0.4 * Math.min(1, coverage)) : 0;
  return { patterns, strength, coverage, trainedCount: trained.length, feasibleCount, flagged };
}
