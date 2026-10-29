// Aggregations for the analytics screen. Everything is derived from logged data.
import { getExercise } from '../data/exercises.js';
import { sortedSessions, exerciseHistory, workSets, sessionVolumeKg } from './history.js';
import { muscleSets } from './coach.js';
import { plannedDaysPerWeek } from './rank.js';
import { startOfWeek, addDays, dayKey, DAY_MS } from '../util.js';

export const RANGES = [
  { id: '1w', label: 'Week', days: 7 },
  { id: '1m', label: 'Month', days: 30 },
  { id: '3m', label: '3M', days: 91 },
  { id: '6m', label: '6M', days: 182 },
  { id: '1y', label: 'Year', days: 365 },
  { id: 'all', label: 'All', days: Infinity },
];

export function rangeStart(rangeId, now = new Date(), state) {
  const r = RANGES.find((x) => x.id === rangeId) || RANGES[2];
  if (r.days === Infinity) {
    const first = sortedSessions(state)[0]?.date || state.bodyweights?.[0]?.date || now;
    return new Date(Math.min(new Date(first).getTime(), now.getTime() - 7 * DAY_MS));
  }
  return new Date(now.getTime() - r.days * DAY_MS);
}

export function sessionsInRange(state, from, to) {
  return sortedSessions(state).filter((s) => { const t = new Date(s.date); return t >= from && t <= to; });
}

/** Weekly buckets from `from` to `to` (Monday starts). */
export function weekBuckets(from, to) {
  const out = [];
  for (let w = startOfWeek(from); w <= to; w = addDays(w, 7)) out.push(w);
  return out;
}

export function weeklyVolume(state, from, to) {
  const ss = sessionsInRange(state, from, to);
  return weekBuckets(from, to).map((w) => {
    const end = addDays(w, 7);
    const v = ss.filter((s) => new Date(s.date) >= w && new Date(s.date) < end).reduce((a, s) => a + (s.volumeKg ?? sessionVolumeKg(state, s)), 0);
    return { x: w, y: v };
  });
}

export function weeklyConsistency(state, from, to) {
  const ss = sessionsInRange(state, from, to);
  const planned = plannedDaysPerWeek(state);
  return weekBuckets(from, to).map((w) => {
    const end = addDays(w, 7);
    const days = new Set(ss.filter((s) => new Date(s.date) >= w && new Date(s.date) < end).map((s) => dayKey(s.date))).size;
    return { x: w, y: days, planned };
  });
}

export function e1rmSeries(state, exId, from, to) {
  return exerciseHistory(state, exId).filter((h) => { const t = new Date(h.date); return t >= from && t <= to; })
    .map((h) => ({ x: new Date(h.date), y: h.e1rm, top: h.topWeightKg, reps: h.topReps }));
}

export function bodyweightSeries(state, from, to) {
  return [...(state.bodyweights || [])].filter((b) => { const t = new Date(b.date); return t >= from && t <= to; })
    .sort((a, b) => new Date(a.date) - new Date(b.date)).map((b) => ({ x: new Date(b.date), y: b.kg }));
}

export function muscleDistribution(state, from, to) {
  const ms = muscleSets(state, from, to);
  return Object.entries(ms).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([m, v]) => ({ muscle: m, sets: v }));
}

/** Exercises the user has logged, most frequent first (for the exercise picker). */
export function loggedExercises(state) {
  const count = {};
  for (const s of state.sessions || []) for (const i of s.exercises || []) if (workSets(i.sets).length) count[i.exId] = (count[i.exId] || 0) + 1;
  return Object.entries(count).sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ id, n, ex: getExercise(id, state.customExercises) })).filter((x) => x.ex);
}

export function summary(state, from, to) {
  const ss = sessionsInRange(state, from, to);
  const vol = ss.reduce((a, s) => a + (s.volumeKg ?? sessionVolumeKg(state, s)), 0);
  const sets = ss.reduce((a, s) => a + s.exercises.reduce((b, i) => b + workSets(i.sets).length, 0), 0);
  const dur = ss.reduce((a, s) => a + (s.durationSec || 0), 0);
  const prs = (state.prs || []).filter((p) => { const t = new Date(p.date); return t >= from && t <= to; });
  const weeks = Math.max(1, (to - from) / (7 * DAY_MS));
  return { workouts: ss.length, volumeKg: vol, sets, durationSec: dur, prs: prs.length, perWeek: ss.length / weeks };
}
