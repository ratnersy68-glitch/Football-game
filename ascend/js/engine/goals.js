// Goal engine: progress, milestones and completion for each goal type.
// Goal Progress is deliberately separate from the Strength Rank.
import { getExercise } from '../data/exercises.js';
import { currentE1rm, exerciseHistory, sortedSessions } from './history.js';
import { bodyweightAt } from './strength.js';
import { clamp, KG_PER_LB, fmtWeight, startOfWeek, addDays, dayKey, DAY_MS } from '../util.js';

export const GOAL_CATEGORIES = [
  { id: 'muscle', label: 'Build muscle', blurb: 'Hypertrophy-focused volume in moderate rep ranges' },
  { id: 'strength', label: 'Increase strength', blurb: 'Heavier loads, lower reps, longer rest' },
  { id: 'fatloss', label: 'Lose body fat', blurb: 'Keep strength while trending body weight down' },
  { id: 'athletic', label: 'Athletic performance', blurb: 'Power, balanced strength, single-leg work' },
  { id: 'endurance', label: 'Improve endurance', blurb: 'Higher reps, shorter rest, conditioning' },
  { id: 'maintain', label: 'Maintain physique', blurb: 'Efficient training to hold what you have' },
  { id: 'custom', label: 'Custom goal', blurb: 'Define your own mission' },
];

export const GOAL_TYPES = [
  { id: 'strength', label: 'Lift target', hint: 'e.g. Bench press 225 lbs' },
  { id: 'reps', label: 'Rep target', hint: 'e.g. 15 strict pull-ups' },
  { id: 'bodyweight', label: 'Body weight', hint: 'e.g. Gain 10 lbs' },
  { id: 'consistency', label: 'Consistency', hint: 'e.g. Train 4 days/week for 8 weeks' },
  { id: 'custom', label: 'Custom', hint: 'Track progress manually' },
];

export function goalTitle(goal, unit) {
  const ex = goal.exId ? getExercise(goal.exId) : null;
  switch (goal.type) {
    case 'strength': return goal.title || `${shortName(ex?.name)} ${fmtWeight(goal.targetKg, unit)}`;
    case 'reps': return goal.title || `${goal.targetReps} ${ex?.name || 'reps'}`;
    case 'bodyweight': return goal.title || `Reach ${fmtWeight(goal.targetKg, unit)} body weight`;
    case 'consistency': return goal.title || `Train ${goal.perWeek}×/week for ${goal.weeks} weeks`;
    default: return goal.title || 'Custom goal';
  }
}
const shortName = (n = '') => n.replace(/^Barbell /, '').replace(/ Press$/, '');

/** Consistency: number of completed weeks (Mon–Sun) since the goal began that met perWeek. */
function consistencyWeeks(state, goal, now) {
  const start = startOfWeek(goal.createdAt);
  let met = 0; let streak = 0;
  for (let w = start; w <= now; w = addDays(w, 7)) {
    const end = addDays(w, 7);
    const days = new Set(sortedSessions(state).filter((s) => new Date(s.date) >= w && new Date(s.date) < end).map((s) => dayKey(s.date))).size;
    if (days >= goal.perWeek) { met++; streak++; } else if (end <= now) streak = 0;
  }
  return { met, streak };
}

/** Status snapshot for any goal. All values in kg / reps / weeks / percent. */
export function goalStatus(state, goal, now = new Date()) {
  const unit = state.profile?.unit || 'lb';
  let current = null; let baseline = goal.baseline ?? null; let target = null; let pct = 0; let fmt = (v) => String(Math.round(v));
  let milestones = []; let recent = null; let label = '';
  const stepKg = unit === 'lb' ? 10 * KG_PER_LB : 5;
  const monthAgo = new Date(now.getTime() - 30 * DAY_MS);
  switch (goal.type) {
    case 'strength': {
      const c = currentE1rm(state, goal.exId, 90, now);
      current = c?.value ?? null;
      target = goal.targetKg;
      fmt = (v) => fmtWeight(v, unit);
      label = 'Estimated max';
      pct = current ? clamp(current / target, 0, 1) : 0;
      const start = baseline ?? current ?? 0;
      milestones = steps(start, target, stepKg).map((v) => ({ value: v, label: fmt(v), done: current != null && current >= v - 0.01 }));
      const old = currentE1rm(state, goal.exId, 90, monthAgo);
      if (current && old) recent = current - old.value;
      break;
    }
    case 'reps': {
      const h = exerciseHistory(state, goal.exId).filter((x) => new Date(x.date) <= now);
      const last90 = h.filter((x) => now - new Date(x.date) <= 90 * DAY_MS);
      current = last90.length ? Math.max(...last90.map((x) => x.maxReps)) : null;
      target = goal.targetReps;
      label = 'Best set';
      fmt = (v) => `${Math.round(v)} reps`;
      pct = current ? clamp(current / target, 0, 1) : 0;
      const start = baseline ?? current ?? 0;
      const st = Math.max(1, Math.round((target - start) / 5));
      milestones = steps(start, target, st).map((v) => ({ value: v, label: fmt(v), done: current != null && current >= v }));
      const older = h.filter((x) => new Date(x.date) <= monthAgo && now - new Date(x.date) <= 120 * DAY_MS);
      if (current != null && older.length) recent = current - Math.max(...older.map((x) => x.maxReps));
      break;
    }
    case 'bodyweight': {
      current = bodyweightAt(state, now);
      target = goal.targetKg;
      baseline = baseline ?? current;
      label = 'Body weight';
      fmt = (v) => fmtWeight(v, unit);
      const span = target - baseline;
      pct = Math.abs(span) < 0.01 ? 1 : clamp((current - baseline) / span, 0, 1);
      const sk = unit === 'lb' ? 2 * KG_PER_LB : 1;
      const dir = Math.sign(span) || 1;
      const ms = [];
      for (let v = baseline + dir * Math.max(sk, Math.abs(span) / 5); dir > 0 ? v < target - 0.01 : v > target + 0.01; v += dir * Math.max(sk, Math.abs(span) / 5)) ms.push(v);
      ms.push(target);
      milestones = ms.map((v) => ({ value: v, label: fmt(v), done: dir > 0 ? current >= v - 0.05 : current <= v + 0.05 }));
      recent = current - bodyweightAt(state, monthAgo);
      break;
    }
    case 'consistency': {
      const { met, streak } = consistencyWeeks(state, goal, now);
      current = met; target = goal.weeks; baseline = 0;
      label = 'Weeks on plan';
      fmt = (v) => `${Math.round(v)} wk`;
      pct = clamp(met / goal.weeks, 0, 1);
      milestones = steps(0, goal.weeks, Math.max(1, Math.round(goal.weeks / 4))).map((v) => ({ value: v, label: fmt(v), done: met >= v }));
      recent = streak;
      break;
    }
    default: {
      current = goal.manual ?? 0; target = 100; baseline = 0;
      label = 'Self-reported';
      fmt = (v) => `${Math.round(v)}%`;
      pct = clamp(current / 100, 0, 1);
      milestones = [25, 50, 75, 100].map((v) => ({ value: v, label: fmt(v), done: current >= v }));
    }
  }
  const next = milestones.find((m) => !m.done) || null;
  return { current, baseline, target, pct, milestones, next, recent, fmt, label, done: pct >= 1 };
}

function steps(start, target, step) {
  const out = [];
  if (!(step > 0)) return [target];
  for (let v = Math.ceil((start + 0.01) / step) * step; v < target - 0.01 && out.length < 12; v += step) out.push(v);
  out.push(target);
  return out;
}

/** Updates goals in place; returns events {goal, milestone?, completed?} for celebrations/XP. */
export function checkGoals(state, now = new Date()) {
  const events = [];
  for (const g of state.goals || []) {
    if (g.completedAt || g.archived) continue;
    const st = goalStatus(state, g, now);
    g.milestonesHit = g.milestonesHit || [];
    if (g.baseline == null && (g.type === 'strength' || g.type === 'reps') && st.current != null) {
      // first measurement establishes the starting point; nothing to celebrate yet
      g.baseline = st.current;
      g.milestonesHit = goalStatus(state, g, now).milestones.filter((m) => m.done).map((m) => Math.round(m.value * 100) / 100);
      if (st.done) { g.completedAt = now.toISOString(); events.push({ goal: g, completed: true }); }
      continue;
    }
    for (const m of st.milestones) {
      const key = Math.round(m.value * 100) / 100;
      if (m.done && !g.milestonesHit.includes(key) && m.value !== st.target) {
        g.milestonesHit.push(key);
        events.push({ goal: g, milestone: m });
      }
    }
    if (st.done) {
      g.completedAt = now.toISOString();
      events.push({ goal: g, completed: true });
    }
  }
  return events;
}

/** Baseline captured when a goal is created so progress has a fixed starting point. */
export function captureBaseline(state, goal, now = new Date()) {
  const st = goalStatus(state, { ...goal, baseline: undefined }, now);
  if (goal.type === 'strength' || goal.type === 'reps' || goal.type === 'bodyweight') {
    if (st.current != null) goal.baseline = st.current; else delete goal.baseline;
  }
  // milestones already satisfied at creation aren't celebrated later
  goal.milestonesHit = st.milestones.filter((m) => m.done).map((m) => Math.round(m.value * 100) / 100);
  return goal;
}
