// Cross-screen workflows: starting/finishing workouts and everything that happens after.
import { app, update, go, toast, confirmSheet } from './app.js';
import { store, snapshot, saveNow } from './store.js';
import { getExercise } from './data/exercises.js';
import { makeSlot } from './data/templates.js';
import { targetFor, warmupRamp, readinessScore } from './engine/coach.js';
import { detectPRs, sessionVolumeKg, workSets } from './engine/history.js';
import { applyRank, displayRank, RANKS } from './engine/rank.js';
import { checkGoals, goalTitle } from './engine/goals.js';
import { sessionXp, addXp, checkAchievements, XP, levelInfo } from './engine/xp.js';
import { reveal } from './ui/reveal.js';
import { haptic, sound } from './ui/feedback.js';
import { uid, weekdayIdx, fmtWeight, dayKey } from './util.js';

export function activeSplit(state = store.state) {
  return state.splits.find((s) => s.id === state.activeSplitId) || state.splits[0] || null;
}

/** Today's planned split day (or null on a rest day). */
export function todaysDay(state = store.state, now = new Date()) {
  const sp = activeSplit(state);
  if (!sp) return null;
  const id = sp.schedule[weekdayIdx(now)];
  return id ? sp.days.find((d) => d.id === id) || null : null;
}

/** Next planned day after today (for rest-day messaging). */
export function nextPlanned(state = store.state, now = new Date()) {
  const sp = activeSplit(state);
  if (!sp) return null;
  for (let i = 1; i <= 7; i++) {
    const id = sp.schedule[(weekdayIdx(now) + i) % 7];
    const d = id && sp.days.find((x) => x.id === id);
    if (d) return { day: d, inDays: i };
  }
  return null;
}

export function trainedToday(state = store.state, now = new Date()) {
  return state.sessions.some((s) => dayKey(s.date) === dayKey(now));
}

function buildExercise(state, slot, readiness) {
  const t = targetFor(state, slot, { readiness });
  const ex = getExercise(slot.exId, state.customExercises);
  const sets = [];
  if (slot.warmup && t.weightKg) {
    for (const w of warmupRamp(t.weightKg, state.profile.unit, ex)) sets.push({ type: 'warmup', weightKg: null, reps: null, rpe: null, done: false, tw: w.weightKg, tr: w.reps });
  }
  for (let i = 0; i < (t.sets || slot.sets); i++) sets.push({ type: 'work', weightKg: null, reps: null, rpe: null, done: false, tw: t.weightKg, tr: t.reps });
  return { uid: uid('x'), exId: slot.exId, slot: { sets: slot.sets, repMin: slot.repMin, repMax: slot.repMax, rest: slot.rest, rpe: slot.rpe, warmup: slot.warmup }, notes: slot.notes || '', target: t, sets };
}

/** Begin a workout from a split day, a previous session, or blank. */
export function startWorkout({ dayId, fromSessionId, readiness } = {}) {
  const state = store.state;
  if (state.activeWorkout) { go('train', 'workout'); return; }
  const sp = activeSplit(state);
  let name = 'Quick Workout'; let focus = ''; let slots = [];
  if (dayId && sp) {
    const d = sp.days.find((x) => x.id === dayId);
    if (d) { name = d.name; focus = d.focus || ''; slots = d.slots; }
  } else if (fromSessionId) {
    const s = state.sessions.find((x) => x.id === fromSessionId);
    if (s) {
      name = s.name; focus = s.focus || '';
      slots = s.exercises.map((e) => ({ ...makeSlot(e.exId, Math.max(1, workSets(e.sets).length), state.customExercises), ...(e.slot || {}) }));
    }
  }
  const rs = readinessScore(readiness);
  update((st) => {
    st.activeWorkout = {
      id: uid('w'), startedAt: new Date().toISOString(), name, focus, dayId: dayId || null, splitId: sp?.id || null,
      readiness: readiness || null, notes: '', pausedMs: 0, pausedAt: null, rest: null,
      exercises: slots.map((sl) => buildExercise(st, sl, rs)),
    };
  }, { immediate: true });
  haptic('success');
  go('train', 'workout');
}

export function addExerciseToWorkout(exId) {
  update((st) => {
    const slot = makeSlot(exId, 3, st.customExercises);
    st.activeWorkout.exercises.push(buildExercise(st, slot, readinessScore(st.activeWorkout.readiness)));
  });
}

export function elapsedSec(w, now = Date.now()) {
  if (!w) return 0;
  const paused = w.pausedMs + (w.pausedAt ? now - new Date(w.pausedAt).getTime() : 0);
  return Math.max(0, (now - new Date(w.startedAt).getTime() - paused) / 1000);
}

export function startRest(seconds, exUid) {
  update((st) => { if (st.activeWorkout) st.activeWorkout.rest = { endsAt: Date.now() + seconds * 1000, total: seconds, exUid }; }, { silent: true });
}

export async function finishWorkout() {
  const state = store.state;
  const w = state.activeWorkout;
  if (!w) return;
  const done = w.exercises.map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) })).filter((e) => e.sets.length);
  if (!done.length) {
    const ok = await confirmSheet({ title: 'No completed sets', body: 'Nothing has been logged in this workout. Discard it?', ok: 'Discard', danger: true });
    if (ok) { update((st) => { st.activeWorkout = null; }, { immediate: true }); go('train'); }
    return;
  }
  const now = new Date();
  const session = {
    id: w.id, date: w.startedAt, endedAt: now.toISOString(), durationSec: Math.round(elapsedSec(w)),
    name: w.name, focus: w.focus, dayId: w.dayId, splitId: w.splitId, notes: w.notes, readiness: w.readiness,
    exercises: done.map((e) => ({
      uid: e.uid, exId: e.exId, notes: e.notes, slot: e.slot,
      sets: e.sets.map((s) => ({ type: s.type, weightKg: s.weightKg, reps: s.reps, rpe: s.rpe, done: true, ts: s.ts })),
    })),
  };
  const before = displayRank(state, now);
  const lvlBefore = levelInfo(state.xp.total).level;
  let promo = null; let goalEvents = []; let achievements = []; let xpItems = [];
  update((st) => {
    st.sessions.push(session);
    session.volumeKg = sessionVolumeKg(st, session);
    session.prs = detectPRs(st, session);
    st.prs.push(...session.prs);
    xpItems = sessionXp(st, session);
    xpItems.forEach((x) => addXp(st, x.amount, x.reason, now));
    for (const e of session.exercises) if (st.coach.accepted[e.exId]) delete st.coach.accepted[e.exId];
    promo = applyRank(st, now);
    if (promo) addXp(st, XP.rankUp, `Promoted to ${RANKS[promo.to].name}`, now);
    goalEvents = checkGoals(st, now);
    for (const ev of goalEvents) addXp(st, ev.completed ? XP.goal : XP.milestone, ev.completed ? `Goal complete: ${goalTitle(ev.goal, st.profile.unit)}` : 'Goal milestone', now);
    achievements = checkAchievements(st, now);
    session.xp = st.xp.log.filter((l) => new Date(l.date) >= now).reduce((a, l) => a + l.amount, 0);
    st.activeWorkout = null;
  }, { immediate: true });
  await saveNow();
  snapshot().catch(() => {});
  app.ui.summary = { sessionId: session.id, achievements: achievements.map((a) => a.id), xpItems, goalEvents: goalEvents.map((e) => ({ id: e.goal.id, completed: !!e.completed, label: e.milestone?.label })), levelUp: levelInfo(store.state.xp.total).level > lvlBefore };
  go('train', 'summary', { id: session.id });
  sound('reveal');
  haptic('success');
  await celebrate({ promo, goalEvents, prs: session.prs, before });
}

/** Run reveals in order: rank promotion first, then goals, then the headline PR. */
export async function celebrate({ promo, goalEvents = [], prs = [] }) {
  const st = store.state;
  const unit = st.profile.unit;
  if (promo) {
    const dr = displayRank(st);
    const next = RANKS[promo.to + 1];
    await reveal({
      type: 'rank', rankIdx: promo.to, title: RANKS[promo.to].name.toUpperCase(),
      subtitle: promo.from === 0 ? (dr.youth ? 'DEVELOPMENT RANK EARNED' : 'FIRST STRENGTH RANK EARNED') : (dr.youth ? 'DEVELOPMENT RANK ACHIEVED' : 'STRENGTH RANK ACHIEVED'),
      progress: next ? { pct: dr.progress, from: RANKS[promo.to].name.toUpperCase(), label: `${Math.round(dr.progress * 100)}% TO ${next.name.toUpperCase()}` } : null,
    });
  }
  for (const ev of goalEvents.slice(0, 2)) {
    await reveal({ type: 'milestone', rankIdx: displayRank(st).idx, title: ev.completed ? 'GOAL COMPLETE' : 'MILESTONE', subtitle: ev.completed ? goalTitle(ev.goal, unit).toUpperCase() : `${ev.milestone.label} · ${goalTitle(ev.goal, unit)}`.toUpperCase() });
  }
  if (prs.length && !promo) {
    const p = prs.find((x) => x.kind === 'e1rm') || prs[0];
    const ex = getExercise(p.exId, st.customExercises);
    sound('pr');
    await reveal({ type: 'milestone', art: prArt(), title: 'NEW RECORD', subtitle: `${ex?.name || ''} · ${p.weightKg ? fmtWeight(p.weightKg, unit) + ' × ' : ''}${p.reps}`.toUpperCase() });
  }
}

function prArt() {
  return `<svg class="emblem" viewBox="0 0 200 200"><defs><linearGradient id="prg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#78CFFF"/></linearGradient></defs>
    <polygon points="100,12 176,56 176,144 100,188 24,144 24,56" fill="none" stroke="#78CFFF" stroke-width="2"/>
    <polygon points="100,40 150,70 150,130 100,160 50,130 50,70" fill="url(#prg)" opacity=".95"/>
    <polyline points="66,118 100,80 134,118" fill="none" stroke="#090B0E" stroke-width="12"/><polyline points="74,140 100,112 126,140" fill="none" stroke="#090B0E" stroke-width="8" opacity=".6"/></svg>`;
}

export async function discardWorkout() {
  const ok = await confirmSheet({ title: 'Discard workout?', body: 'All sets logged in this session will be deleted. This can\'t be undone.', ok: 'Discard', danger: true });
  if (!ok) return;
  update((st) => { st.activeWorkout = null; }, { immediate: true });
  toast('Workout discarded');
  go('train');
}

export function logBodyweight(kg, date = new Date()) {
  update((st) => {
    const k = dayKey(date);
    st.bodyweights = st.bodyweights.filter((b) => dayKey(b.date) !== k);
    st.bodyweights.push({ date: new Date(date).toISOString(), kg });
    st.bodyweights.sort((a, b) => new Date(a.date) - new Date(b.date));
    st.profile.bodyweightKg = st.bodyweights[st.bodyweights.length - 1].kg;
  }, { immediate: true });
  runGoalChecks();
}

/** Re-evaluate goals outside of a workout (body weight, manual progress) and celebrate. */
export function runGoalChecks() {
  const evs = [];
  update((st) => {
    const now = new Date();
    for (const ev of checkGoals(st, now)) {
      evs.push(ev);
      addXp(st, ev.completed ? XP.goal : XP.milestone, ev.completed ? `Goal complete: ${goalTitle(ev.goal, st.profile.unit)}` : 'Goal milestone', now);
    }
    checkAchievements(st, now);
  });
  if (evs.length) celebrate({ goalEvents: evs });
}
