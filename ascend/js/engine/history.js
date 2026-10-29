// Queries over logged sessions: per-exercise history, previous performance and PR detection.
import { getExercise } from '../data/exercises.js';
import { e1rm, setLoadKg, setVolumeKg, rirFromRpe, bodyweightAt, PLAUSIBLE_MAX } from './strength.js';
import { sum } from '../util.js';

export const workSets = (sets) => (sets || []).filter((s) => s.done && s.type !== 'warmup' && Number(s.reps) > 0);

export function sortedSessions(state) {
  return [...(state.sessions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
}

/** Summary of each session in which exId was performed, oldest first. */
export function exerciseHistory(state, exId, { before } = {}) {
  const ex = getExercise(exId, state.customExercises);
  const out = [];
  for (const s of sortedSessions(state)) {
    if (before && new Date(s.date) >= new Date(before)) continue;
    const items = (s.exercises || []).filter((i) => i.exId === exId);
    if (!items.length) continue;
    const sets = items.flatMap((i) => workSets(i.sets));
    if (!sets.length) continue;
    const bw = bodyweightAt(state, s.date);
    let best = 0; let top = null; let maxReps = 0;
    for (const st of sets) {
      const v = e1rm(setLoadKg(ex, st, bw), Number(st.reps), rirFromRpe(st.rpe)) || 0;
      if (v > best) best = v;
      if (!top || Number(st.weightKg) > Number(top.weightKg) || (Number(st.weightKg) === Number(top.weightKg) && Number(st.reps) > Number(top.reps))) top = st;
      maxReps = Math.max(maxReps, Number(st.reps));
    }
    out.push({
      date: s.date, sessionId: s.id, sets, bw,
      e1rm: best, e1rmExternal: ex?.load === 'bw' ? Math.max(0, best - bw) : best,
      topWeightKg: Number(top.weightKg) || 0, topReps: Number(top.reps) || 0, maxReps,
      volumeKg: sum(sets.map((st) => setVolumeKg(ex, st))),
    });
  }
  return out;
}

export function lastPerformance(state, exId, before) {
  const h = exerciseHistory(state, exId, { before });
  return h.length ? h[h.length - 1] : null;
}

export function sessionVolumeKg(state, session) {
  let v = 0;
  for (const it of session.exercises || []) {
    const ex = getExercise(it.exId, state.customExercises);
    for (const s of it.sets || []) v += setVolumeKg(ex, s);
  }
  return v;
}

export function sessionSetCount(session) {
  return sum((session.exercises || []).map((i) => workSets(i.sets).length));
}

/**
 * PRs set in `session` relative to all earlier sessions. The first time an exercise is logged
 * establishes a baseline and is not a PR. Implausible entries never count.
 */
export function detectPRs(state, session) {
  const prs = [];
  const bw = bodyweightAt(state, session.date);
  const seen = new Set();
  for (const it of session.exercises || []) {
    if (seen.has(it.exId)) continue;
    seen.add(it.exId);
    const ex = getExercise(it.exId, state.customExercises);
    const sets = (session.exercises || []).filter((i) => i.exId === it.exId).flatMap((i) => workSets(i.sets));
    if (!ex || !sets.length) continue;
    const hist = exerciseHistory(state, it.exId, { before: session.date }).filter((h) => h.sessionId !== session.id);
    if (!hist.length) continue;
    const prevE1 = Math.max(...hist.map((h) => h.e1rm));
    const prevW = Math.max(...hist.map((h) => h.topWeightKg));
    const prevReps = Math.max(...hist.map((h) => h.maxReps));
    let bestE1 = 0; let bestSet = null; let topW = 0; let topWSet = null; let maxReps = 0; let maxRepsSet = null;
    for (const s of sets) {
      const v = e1rm(setLoadKg(ex, s, bw), Number(s.reps), rirFromRpe(s.rpe)) || 0;
      if (v > bestE1) { bestE1 = v; bestSet = s; }
      if (Number(s.weightKg) > topW) { topW = Number(s.weightKg); topWSet = s; }
      if (Number(s.reps) > maxReps) { maxReps = Number(s.reps); maxRepsSet = s; }
    }
    if (ex.rank && bestE1 * ex.rank.f / bw > PLAUSIBLE_MAX[ex.rank.p]) continue;
    const base = { exId: it.exId, date: session.date, sessionId: session.id };
    if (bestE1 > prevE1 * 1.005 && prevE1 > 0) {
      prs.push({ ...base, kind: 'e1rm', value: bestE1, prev: prevE1, weightKg: Number(bestSet.weightKg), reps: Number(bestSet.reps) });
    } else if (topW > prevW && ex.load !== 'assist' && topW > 0) {
      prs.push({ ...base, kind: 'weight', value: topW, prev: prevW, weightKg: topW, reps: Number(topWSet.reps) });
    } else if ((ex.load === 'bw' || !(topW > 0)) && maxReps > prevReps) {
      prs.push({ ...base, kind: 'reps', value: maxReps, prev: prevReps, weightKg: Number(maxRepsSet.weightKg) || 0, reps: maxReps });
    }
  }
  return prs;
}

/** Best estimated 1RM for an exercise within the last `days` days (raw, not pattern-converted). */
export function currentE1rm(state, exId, days = 90, now = new Date()) {
  const since = now.getTime() - days * 86400000;
  const h = exerciseHistory(state, exId).filter((x) => new Date(x.date).getTime() >= since && new Date(x.date) <= now);
  if (!h.length) return null;
  const best = h.reduce((a, b) => (b.e1rm > a.e1rm ? b : a));
  return { ...best, value: best.e1rm };
}
