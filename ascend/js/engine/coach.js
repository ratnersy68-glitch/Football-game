// Rules-based training coach. Runs entirely on-device and needs no AI service.
// Every recommendation carries a plain-language `why` so the logic is never a black box.
// Load increases are always small and always require the user's confirmation.
import { getExercise, MUSCLES } from '../data/exercises.js';
import { exerciseHistory, sortedSessions, workSets, currentE1rm } from './history.js';
import { isYouth, plannedDaysPerWeek } from './rank.js';
import { clamp, mean, DAY_MS, KG_PER_LB, fromKg, toKg, fmtWeight, daysBetween, startOfWeek, dayKey } from '../util.js';

export const COACH_LABEL = 'Rules-based coach · on-device';

/** Round a kg value to the nearest loadable increment in the user's unit. */
export function roundLoad(kg, unit, ex) {
  const step = unit === 'lb' ? (ex?.load === 'perHand' ? 5 : 5) : (ex?.load === 'perHand' ? 1 : 2.5);
  const v = fromKg(kg, unit);
  return toKg(Math.max(0, Math.round(v / step) * step), unit);
}

function incrementKg(unit, ex) {
  if (unit === 'lb') return (ex?.lower && ex?.load !== 'perHand' ? 10 : 5) * KG_PER_LB;
  if (ex?.load === 'perHand') return 2;
  return ex?.lower ? 5 : 2.5;
}

const avgRpe = (sets) => {
  const r = sets.map((s) => Number(s.rpe)).filter((x) => x > 0);
  return r.length ? mean(r) : null;
};

/**
 * Today's target for one exercise slot.
 * Returns { kind, weightKg, reps, sets, why, needsConfirm, suggestion? }
 *   kind: start | reps | increase | hold | deload | reentry
 */
export function targetFor(state, slot, { now = new Date(), readiness } = {}) {
  const unit = state.profile?.unit || 'lb';
  const ex = getExercise(slot.exId, state.customExercises);
  const youth = isYouth(state);
  const repMin = youth ? Math.max(6, slot.repMin) : slot.repMin;
  const repMax = Math.max(repMin, slot.repMax);
  const hist = exerciseHistory(state, slot.exId, { before: now });
  const base = { sets: slot.sets, repMin, repMax };
  if (!hist.length) {
    return {
      ...base, kind: 'start', weightKg: null, reps: repMax,
      why: `No history yet. Pick a weight you could lift for about ${repMax + 2} reps with good form (RPE 7) — leave room to learn the movement.`,
    };
  }
  const last = hist[hist.length - 1];
  const lastSets = last.sets;
  const lastW = last.topWeightKg;
  const topSetReps = Math.max(...lastSets.filter((s) => Number(s.weightKg) === lastW).map((s) => Number(s.reps)));
  const allAtTop = lastSets.filter((s) => Number(s.weightKg) >= lastW).every((s) => Number(s.reps) >= repMax);
  const rpe = avgRpe(lastSets);
  const gapDays = daysBetween(last.date, now);
  const accepted = state.coach?.accepted?.[slot.exId];

  if (accepted && new Date(accepted.date) > new Date(last.date)) {
    return { ...base, kind: 'increase', weightKg: accepted.weightKg, reps: repMin, accepted: true,
      why: `You confirmed a step up to ${fmtWeight(accepted.weightKg, unit)}. Aim for ${repMin}+ clean reps per set, then build back toward ${repMax}.` };
  }

  if (gapDays > 14) {
    const w = roundLoad(lastW * 0.9, unit, ex);
    return { ...base, kind: 'reentry', weightKg: w, reps: Math.min(repMax, Math.max(repMin, topSetReps)),
      why: `It's been ${gapDays} days since you last did this. Starting ~10% lighter lets your joints and technique catch up; you'll be back to ${fmtWeight(lastW, unit)} within a session or two.` };
  }

  if (readiness != null && readiness <= 2) {
    return { ...base, kind: 'hold', weightKg: lastW, reps: topSetReps, sets: Math.max(1, slot.sets - 1),
      why: 'Your check-in shows low readiness today. Match last session\'s weight and reps and drop one set — consistency beats forcing progress on a bad day.' };
  }

  // stall detection: no e1RM gain over the last 3 exposures
  if (hist.length >= 4) {
    const recent = hist.slice(-3).map((h) => h.e1rm);
    const before = Math.max(...hist.slice(0, -3).map((h) => h.e1rm));
    if (Math.max(...recent) <= before * 1.01) {
      const w = roundLoad(lastW * 0.9, unit, ex);
      return { ...base, kind: 'deload', weightKg: lastW, reps: topSetReps, needsConfirm: true,
        suggestion: { weightKg: w, reps: Math.min(repMax, repMin + 2) },
        why: `Estimated max hasn't moved in 3 sessions. Option: reset to ${fmtWeight(w, unit)} for ${Math.min(repMax, repMin + 2)} reps and rebuild, or swap to a close variation for 3–4 weeks.` };
    }
  }

  if (allAtTop && (rpe == null || rpe <= 8.5) && lastW > 0) {
    const inc = incrementKg(unit, ex);
    const maxJump = lastW * (youth ? 0.05 : 0.075);
    if (inc > maxJump && inc > 0) {
      return { ...base, kind: 'reps', weightKg: lastW, reps: repMax + 1,
        why: `You hit ${repMax} reps on every set. The next available jump (${fmtWeight(inc, unit)}) is large relative to this load, so add a rep or two beyond the range first.` };
    }
    const next = roundLoad(lastW + inc, unit, ex);
    return { ...base, kind: 'increase', weightKg: lastW, reps: Math.min(repMax, topSetReps + 1), needsConfirm: true,
      suggestion: { weightKg: next, reps: repMin },
      why: `All sets reached the top of your ${repMin}–${repMax} range${rpe ? ` at RPE ${rpe.toFixed(1)}` : ''}. A small step to ${fmtWeight(next, unit)} is reasonable — confirm when you feel ready.` };
  }

  const reps = clamp(topSetReps + 1, repMin, repMax);
  return { ...base, kind: 'reps', weightKg: lastW, reps,
    why: topSetReps < repMin
      ? `Last time you got ${topSetReps} reps — below your ${repMin}–${repMax} range. Keep ${fmtWeight(lastW, unit)} and aim for ${reps}.`
      : `Double progression: keep ${fmtWeight(lastW, unit)} and add one rep. When every set reaches ${repMax}, the coach will suggest a small weight increase.` };
}

/** Weekly working sets per muscle (primary = 1, secondary = 0.5) over a window. */
export function muscleSets(state, from, to) {
  const out = Object.fromEntries(MUSCLES.map((m) => [m, 0]));
  for (const s of state.sessions || []) {
    const t = new Date(s.date);
    if (t < from || t > to) continue;
    for (const it of s.exercises || []) {
      const ex = getExercise(it.exId, state.customExercises);
      if (!ex) continue;
      const n = workSets(it.sets).length;
      ex.muscles.forEach((m) => { if (m in out) out[m] += n; });
      (ex.secondary || []).forEach((m) => { if (m in out) out[m] += n * 0.5; });
    }
  }
  return out;
}

/** Coaching insights for the Goals screen. Pure; returns cards sorted by priority. */
export function insights(state, now = new Date()) {
  const cards = [];
  const unit = state.profile?.unit || 'lb';
  const sessions = sortedSessions(state).filter((s) => new Date(s.date) <= now);
  const youth = isYouth(state);
  const planned = plannedDaysPerWeek(state);

  if (!sessions.length) {
    cards.push({ id: 'first', priority: 10, kind: 'action', title: 'Log your first workout',
      body: 'The coach learns from what you actually lift. After one session it can set targets; after three you get your placement rank.',
      why: 'Every recommendation is based on your own history — there is nothing to adjust yet.' });
    return cards;
  }

  // missed workouts / returning
  const last = sessions[sessions.length - 1];
  const gap = daysBetween(last.date, now);
  const expectedGap = Math.ceil(7 / planned) + 1;
  if (gap > Math.max(4, expectedGap * 2)) {
    cards.push({ id: 'return', priority: 9, kind: 'recovery', title: `Welcome back — ${gap} days since your last session`,
      body: 'Pick up with your next planned day instead of trying to make up missed sessions. Loads will be suggested ~10% lighter for anything you haven\'t done in two weeks.',
      why: 'Cramming missed workouts into fewer days raises fatigue and injury risk without extra benefit.' });
  }

  // consecutive training days
  let streak = 0;
  for (let i = 0; i < 7; i++) {
    const k = dayKey(new Date(now.getTime() - i * DAY_MS));
    if (sessions.some((s) => dayKey(s.date) === k)) streak++; else if (i > 0) break;
  }
  const weekStart = startOfWeek(now);
  const thisWeek = new Set(sessions.filter((s) => new Date(s.date) >= weekStart).map((s) => dayKey(s.date))).size;
  if (streak >= 4 || thisWeek > planned + 1) {
    cards.push({ id: 'rest', priority: 8, kind: 'recovery', title: 'Schedule a rest day',
      body: streak >= 4 ? `You've trained ${streak} days in a row. Take a full rest day before your next session.` : `You've trained ${thisWeek} days this week against a plan of ${planned}. Extra sessions don't earn more XP — recovery is where adaptation happens.`,
      why: 'Muscles and connective tissue adapt between sessions. Sleep, food and rest days are part of the program.' });
  }

  // workload spike
  const sets7 = sessions.filter((s) => now - new Date(s.date) <= 7 * DAY_MS).reduce((a, s) => a + s.exercises.reduce((b, i) => b + workSets(i.sets).length, 0), 0);
  const prior = [1, 2, 3].map((w) => sessions.filter((s) => { const d = now - new Date(s.date); return d > w * 7 * DAY_MS && d <= (w + 1) * 7 * DAY_MS; })
    .reduce((a, s) => a + s.exercises.reduce((b, i) => b + workSets(i.sets).length, 0), 0));
  const priorAvg = mean(prior.filter((x) => x > 0));
  if (priorAvg > 0 && sets7 > priorAvg * 1.4 && sets7 - priorAvg >= 8) {
    cards.push({ id: 'spike', priority: 7, kind: 'warning', title: 'Workload jumped sharply',
      body: `${sets7} hard sets in the last 7 days vs. ~${Math.round(priorAvg)} per week before. Consider keeping next week closer to ${Math.round(priorAvg * 1.15)}.`,
      why: 'Sudden spikes in training load (>~30–40% week to week) are associated with excessive soreness and overuse issues.' });
  }

  // volume balance
  const ms = muscleSets(state, new Date(now.getTime() - 7 * DAY_MS), now);
  const daysActive = daysBetween(sessions[0].date, now);
  if (daysActive >= 6) {
    const low = Object.entries(ms).filter(([m, v]) => ['chest', 'back', 'quads', 'hamstrings', 'shoulders', 'glutes'].includes(m) && v < 4);
    const high = Object.entries(ms).filter(([, v]) => v > 24);
    if (high.length) {
      cards.push({ id: 'vol_high', priority: 6, kind: 'warning', title: `High weekly volume: ${high.map(([m]) => m).join(', ')}`,
        body: `${high.map(([m, v]) => `${m} ${Math.round(v)} sets`).join(' · ')} in the last week. Most people grow well on 10–20 hard sets per muscle per week.`,
        why: 'Beyond ~20–25 weekly sets per muscle, extra sets tend to add fatigue faster than results.' });
    }
    if (low.length) {
      cards.push({ id: 'vol_low', priority: 4, kind: 'balance', title: `Under-trained this week: ${low.map(([m]) => m).join(', ')}`,
        body: 'Fewer than 4 hard sets in the last 7 days. If that\'s not intentional, add 2–3 sets to an upcoming session.',
        why: 'Around 10+ weekly sets per muscle is a common evidence-based target for growth; 4–6 can maintain.' });
    }
    const push = ms.chest + ms.shoulders * 0.5; const pull = ms.back;
    if (push > 6 && pull < push * 0.6) {
      cards.push({ id: 'balance', priority: 5, kind: 'balance', title: 'More pushing than pulling',
        body: `~${Math.round(push)} pushing vs ~${Math.round(pull)} pulling sets this week. Add a row or pulldown to balance it out.`,
        why: 'Balanced push/pull work supports shoulder health and posture.' });
    }
  }

  // stalled exercises
  const exIds = [...new Set(sessions.flatMap((s) => s.exercises.map((i) => i.exId)))];
  for (const id of exIds) {
    const h = exerciseHistory(state, id, { before: new Date(now.getTime() + 1) });
    if (h.length < 4) continue;
    const recent = h.slice(-3).map((x) => x.e1rm);
    const best = Math.max(...h.slice(0, -3).map((x) => x.e1rm));
    if (best > 0 && Math.max(...recent) <= best * 1.01 && daysBetween(h[h.length - 1].date, now) < 21) {
      const ex = getExercise(id, state.customExercises);
      cards.push({ id: `stall_${id}`, priority: 5, kind: 'stall', exId: id, title: `${ex?.name} has stalled`,
        body: `No improvement over the last 3 sessions. Options: a 10% reset and rebuild, an extra rest day, or swap to ${ex?.alt?.length ? getExercise(ex.alt[0], state.customExercises)?.name : 'a close variation'} for 3–4 weeks.`,
        why: 'Plateaus usually respond to managing fatigue or changing the stimulus, not to grinding the same load harder.' });
    }
  }

  if (youth) {
    cards.push({ id: 'youth', priority: 3, kind: 'info', title: 'Technique first',
      body: 'Keep most sets at RPE 6–8 with smooth, controlled reps. Skip one-rep-max attempts — rep ranges of 6+ build strength safely while you\'re still growing.',
      why: 'For lifters under 18, the coach prioritizes movement quality, recovery and gradual progress over maximal loads.' });
  }

  // weekly plan progress
  const remaining = Math.max(0, planned - thisWeek);
  cards.push({ id: 'week', priority: 2, kind: 'info', title: remaining ? `${remaining} planned session${remaining > 1 ? 's' : ''} left this week` : 'Weekly plan complete',
    body: remaining ? 'Stick to your planned days. If you miss one, just continue with the next day in your split.' : `You hit your ${planned}-day plan. Enjoy your rest days — they count.`,
    why: 'Consistency over weeks matters far more than any single workout.' });

  void unit;
  return cards.sort((a, b) => b.priority - a.priority);
}

const MONTHLY_RATE = { new: 0.04, beginner: 0.03, intermediate: 0.012, advanced: 0.006 };

/**
 * Progression plan for a strength goal. Never promises a date — returns a wide range in weeks.
 */
export function strengthPlan(state, goal, now = new Date()) {
  const unit = state.profile?.unit || 'lb';
  const cur = currentE1rm(state, goal.exId, 90, now);
  const ex = getExercise(goal.exId, state.customExercises);
  if (!cur) {
    return { ready: false, text: `Log ${ex?.name || 'this lift'} once and the coach will estimate your current max and lay out milestones.` };
  }
  const current = cur.value;
  const target = goal.targetKg;
  if (current >= target) return { ready: true, done: true, current, text: 'Your estimated max already meets this target. Consider a test day with a spotter, or set the next target.' };
  let rate = MONTHLY_RATE[state.profile?.experience] ?? 0.015;
  if (isYouth(state)) rate *= 0.75;
  const months = Math.log(target / current) / Math.log(1 + rate);
  const lo = Math.max(2, Math.round(months * 4.3 * 0.8));
  const hi = Math.max(lo + 2, Math.round(months * 4.3 * 1.6));
  const step = unit === 'lb' ? 10 * KG_PER_LB : 5;
  const ms = [];
  for (let v = Math.ceil((current + 0.01) / step) * step; v < target - 0.01; v += step) ms.push(v);
  ms.push(target);
  const phases = [
    { title: 'Build', body: `Train ${ex?.name} ${planned2(state)}× per week in the ${goal.exId === 'deadlift' ? '3–6' : '4–8'} rep range, adding reps before weight.` },
    { title: 'Consolidate', body: 'Every 4–6 weeks, take a lighter week (≈ –10% load, fewer sets) to let fatigue drop and strength show.' },
    { title: 'Express', body: isYouth(state) ? 'Measure progress with rep-maxes at RPE 8 — no true max attempts.' : 'Near the target, a heavy single at RPE 9 with a spotter or safeties confirms the estimate. Optional.' },
  ];
  return {
    ready: true, current, target, milestones: ms.slice(0, 8), weeks: [lo, hi], rate, phases,
    text: `At a typical rate for your experience (~${(rate * 100).toFixed(1)}% per month) this could take roughly ${lo}–${hi} weeks. That's an estimate, not a promise: sleep, nutrition, stress and consistency all move it.`,
  };
}
function planned2(state) { return Math.min(3, Math.max(1, Math.round(plannedDaysPerWeek(state) / 2))); }

/** Readiness 1–5 from a pre-workout check-in (sleep, energy, soreness where 5 = very sore). */
export function readinessScore(r) {
  if (!r) return null;
  const vals = [r.sleep, r.energy, r.soreness != null ? 6 - r.soreness : null].filter((x) => x != null);
  return vals.length ? mean(vals) : null;
}

/** Warm-up ramp for a working weight (kg). */
export function warmupRamp(workKg, unit, ex) {
  if (!(workKg > 0)) return [];
  const empty = ex?.load === 'load' && ex?.needs?.includes('barbell') ? (unit === 'lb' ? 45 * KG_PER_LB : 20) : 0;
  const plan = [[0.4, 8], [0.6, 5], [0.8, 3]];
  if (workKg < (unit === 'lb' ? 95 * KG_PER_LB : 40)) plan.splice(0, 1);
  return plan.map(([p, r]) => ({ weightKg: Math.max(empty, roundLoad(workKg * p, unit, ex)), reps: r }))
    .filter((s, i, arr) => s.weightKg < workKg && (i === 0 || s.weightKg > arr[i - 1].weightKg));
}
