// The ASCEND ranking system. Ranks are a fictional motivational ladder derived from the user's
// own logged training; they are not a validated strength classification.
import { computeStrength, patternSeries, RANK_PATTERNS } from './strength.js';
import { clamp, mean, DAY_MS, dayKey, daysBetween } from '../util.js';
import { getExercise } from '../data/exercises.js';

export const RANKS = [
  { id: 'unranked', name: 'Unranked', min: -1, c1: '#9AA3AD', c2: '#E7E9EC', glow: '#B9E8FF' },
  { id: 'iron', name: 'Iron', min: 0, c1: '#3A4048', c2: '#8A939C', glow: '#B9E8FF' },
  { id: 'bronze', name: 'Bronze', min: 20, c1: '#7A4A2A', c2: '#D49A6A', glow: '#FFD3B0' },
  { id: 'silver', name: 'Silver', min: 32, c1: '#7C8792', c2: '#F1F4F7', glow: '#DDEBFA' },
  { id: 'gold', name: 'Gold', min: 44, c1: '#9A7420', c2: '#F5DB8B', glow: '#FFE9A8' },
  { id: 'platinum', name: 'Platinum', min: 55, c1: '#5E7C88', c2: '#E3F4F8', glow: '#B9E8FF' },
  { id: 'diamond', name: 'Diamond', min: 65, c1: '#2F7FB8', c2: '#CFF0FF', glow: '#78CFFF' },
  { id: 'elite', name: 'Elite', min: 75, c1: '#20252B', c2: '#78CFFF', glow: '#78CFFF' },
  { id: 'titan', name: 'Titan', min: 84, c1: '#090B0E', c2: '#B9C3CC', glow: '#B9E8FF' },
  { id: 'ascendant', name: 'Ascendant', min: 92, c1: '#FFFFFF', c2: '#78CFFF', glow: '#FFFFFF' },
];

export const PLACEMENT_WORKOUTS = 3;
export const WEIGHTS = { strength: 0.75, consistency: 0.15, improvement: 0.10 };
export const YOUTH_WEIGHTS = { consistency: 0.4, improvement: 0.3, technique: 0.3 };

export function rankIndexForScore(score) {
  let idx = 1;
  for (let i = 1; i < RANKS.length; i++) if (score >= RANKS[i].min) idx = i;
  return idx;
}

export function isYouth(state) {
  const a = Number(state.profile?.age);
  return a > 0 && a < 18;
}

export function plannedDaysPerWeek(state) {
  const split = (state.splits || []).find((s) => s.id === state.activeSplitId);
  const fromSplit = split ? split.schedule.filter(Boolean).length : 0;
  return clamp(fromSplit || Number(state.profile?.trainingDays) || 3, 1, 7);
}

/** Consistency: workout days in the last 28 days vs. what the plan calls for, capped at 100%. */
export function computeConsistency(state, now = new Date()) {
  const sessions = (state.sessions || []).filter((s) => new Date(s.date) <= now);
  const since = now.getTime() - 28 * DAY_MS;
  const days = new Set(sessions.filter((s) => new Date(s.date).getTime() >= since).map((s) => dayKey(s.date)));
  const start = state.profile?.createdAt || sessions[0]?.date || now;
  const age = clamp(daysBetween(start, now) + 1, 7, 28);
  const expected = (plannedDaysPerWeek(state) * age) / 7;
  return { score: clamp(days.size / expected, 0, 1) * 100, done: days.size, expected: Math.round(expected) };
}

/** Improvement: average verified e1RM gain per pattern over the last 12 weeks; 8% gain = 100. */
export function computeImprovement(state, now = new Date(), series = patternSeries(state)) {
  const since = now.getTime() - 84 * DAY_MS;
  const gains = [];
  const perPattern = {};
  for (const p of RANK_PATTERNS) {
    const pts = series[p.id].filter((x) => !x.flagged && new Date(x.date).getTime() >= since && new Date(x.date) <= now);
    if (pts.length < 2) continue;
    const base = pts[0].verified;
    // only results at least a week after the baseline count — same-week jumps aren't "improvement"
    const later = pts.filter((x) => new Date(x.date) - new Date(pts[0].date) >= 7 * DAY_MS);
    if (!later.length || !(base > 0)) continue;
    const best = Math.max(...later.map((x) => x.verified));
    const g = (best - base) / base;
    perPattern[p.id] = g;
    gains.push(g);
  }
  const avg = gains.length ? mean(gains) : 0;
  return { score: clamp(avg / 0.08, 0, 1) * 100, avgGain: avg, perPattern };
}

/** Technique milestones (used instead of adult standards for users under 18). */
export function techniqueMilestones(state) {
  const sessions = state.sessions || [];
  const custom = state.customExercises || [];
  const count = {}; const controlled = {};
  for (const s of sessions) {
    const seen = new Set();
    for (const it of s.exercises || []) {
      const p = getRankPattern(it.exId, custom);
      if (!p) continue;
      if (!seen.has(p)) { count[p] = (count[p] || 0) + 1; seen.add(p); }
      for (const set of it.sets || []) {
        if (set.done && set.type !== 'warmup' && set.rpe != null && set.rpe !== '' && Number(set.rpe) <= 8) {
          controlled[p] = (controlled[p] || 0) + 1;
        }
      }
    }
  }
  const list = [];
  for (const p of RANK_PATTERNS) {
    list.push({ id: `${p.id}_3`, pattern: p.id, label: `${p.label}: practiced in 3 sessions`, done: (count[p.id] || 0) >= 3 });
    list.push({ id: `${p.id}_8`, pattern: p.id, label: `${p.label}: practiced in 8 sessions`, done: (count[p.id] || 0) >= 8 });
    list.push({ id: `${p.id}_ctl`, pattern: p.id, label: `${p.label}: 12 controlled sets (RPE ≤ 8)`, done: (controlled[p.id] || 0) >= 12 });
  }
  return { list, score: (list.filter((m) => m.done).length / list.length) * 100 };
}

function getRankPattern(exId, custom) { return getExercise(exId, custom)?.rank?.p || null; }

/** Full rank evaluation — pure function of state. */
export function evaluateRank(state, now = new Date()) {
  const series = patternSeries(state);
  const strength = computeStrength(state, now, series);
  const consistency = computeConsistency(state, now);
  const improvement = computeImprovement(state, now, series);
  const youth = isYouth(state);
  const workouts = (state.sessions || []).length;
  let score; let components; let technique = null;
  if (youth) {
    technique = techniqueMilestones(state);
    score = YOUTH_WEIGHTS.consistency * consistency.score + YOUTH_WEIGHTS.improvement * improvement.score + YOUTH_WEIGHTS.technique * technique.score;
    components = [
      { id: 'consistency', label: 'Consistency', weight: YOUTH_WEIGHTS.consistency, value: consistency.score },
      { id: 'improvement', label: 'Personal improvement', weight: YOUTH_WEIGHTS.improvement, value: improvement.score },
      { id: 'technique', label: 'Technique milestones', weight: YOUTH_WEIGHTS.technique, value: technique.score },
    ];
  } else {
    score = WEIGHTS.strength * strength.strength + WEIGHTS.consistency * consistency.score + WEIGHTS.improvement * improvement.score;
    components = [
      { id: 'strength', label: 'Strength', weight: WEIGHTS.strength, value: strength.strength },
      { id: 'consistency', label: 'Consistency', weight: WEIGHTS.consistency, value: consistency.score },
      { id: 'improvement', label: 'Improvement', weight: WEIGHTS.improvement, value: improvement.score },
    ];
  }
  const hasData = youth ? workouts > 0 : strength.trainedCount > 0;
  const placed = workouts >= PLACEMENT_WORKOUTS && hasData;
  const idx = placed ? rankIndexForScore(score) : 0;
  const next = idx < RANKS.length - 1 ? RANKS[Math.max(idx + 1, 2)] : null;
  const cur = RANKS[idx];
  const floor = idx === 0 ? 0 : cur.min;
  const progress = next ? clamp((score - floor) / (next.min - floor), 0, 1) : 1;
  return {
    score: Math.round(score * 10) / 10, rawScore: score, idx, rank: cur, next, progress,
    placed, placementLeft: Math.max(0, PLACEMENT_WORKOUTS - workouts),
    youth, strength, consistency, improvement, technique, components,
  };
}

/** Ranks are earned: the displayed rank is the highest earned. Returns a promotion or null. */
export function applyRank(state, now = new Date()) {
  const ev = evaluateRank(state, now);
  state.rank = state.rank || { idx: 0, history: [], best: 0 };
  const prev = state.rank.idx || 0;
  state.rank.lastScore = ev.score;
  state.rank.updatedAt = now.toISOString();
  if (ev.idx > prev) {
    state.rank.idx = ev.idx;
    state.rank.history.push({ idx: ev.idx, date: now.toISOString(), score: ev.score });
    return { from: prev, to: ev.idx, score: ev.score, eval: ev };
  }
  return null;
}

/** Earned rank (never decreases) plus live evaluation for progress display. */
export function displayRank(state, now = new Date()) {
  const ev = evaluateRank(state, now);
  const earned = Math.max(state.rank?.idx || 0, ev.idx);
  const r = RANKS[earned];
  const next = earned < RANKS.length - 1 ? RANKS[earned + 1] : null;
  const floor = earned === 0 ? 0 : r.min;
  const progress = !ev.placed ? (PLACEMENT_WORKOUTS - ev.placementLeft) / PLACEMENT_WORKOUTS
    : next ? clamp((ev.rawScore - floor) / (next.min - floor), 0, 1) : 1;
  return { ...ev, idx: earned, rank: r, next, progress };
}
