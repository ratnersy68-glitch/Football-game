// Proactive coach check-ins, triggered only by real ASCEND events. Short templated lines in the
// coach's style (no AI call, so they're instant and work offline), added to the conversation.
// At most two per day, each event fires once, and nothing is sent if check-ins are turned off.
import { store, update } from './store.js';
import { nudgeLine, DEFAULT_COACH } from './data/coaches.js';
import { getExercise } from './data/exercises.js';
import { sortedSessions, workSets } from './engine/history.js';
import { activeSplit, todaysDay, trainedToday } from './flows.js';
import { dayKey, addDays, weekdayIdx, daysBetween, mean, uid } from './util.js';

const MAX_PER_DAY = 2;

/** Which check-ins are due right now. Pure: returns [{ key, kind, arg }]. */
export function dueNudges(state, now = new Date()) {
  const a = state.aiCoach;
  if (!a?.setupDone || !a.prefs?.nudges || !state.profile) return [];
  const out = [];
  const sessions = sortedSessions(state).filter((s) => new Date(s.date) <= now);
  const today = dayKey(now);
  // before a planned workout
  const day = todaysDay(state, now);
  if (day && day.slots.length && !trainedToday(state, now) && !state.activeWorkout && now.getHours() >= 6) out.push({ key: `pre:${today}`, kind: 'pre', arg: day.name });
  // after a missed planned session (yesterday or the day before), only if they've trained before
  const sp = activeSplit(state);
  if (sp && sessions.length) {
    for (const back of [1, 2]) {
      const d = addDays(now, -back);
      if (new Date(d) < new Date(sessions[0].date)) continue;
      if (sp.schedule[weekdayIdx(d)] && !sessions.some((s) => dayKey(s.date) === dayKey(d))) { out.push({ key: `missed:${dayKey(d)}`, kind: 'missed' }); break; }
    }
  }
  // the day after a demanding session
  const last = sessions[sessions.length - 1];
  if (last && daysBetween(last.date, now) === 1) {
    const sets = (s) => s.exercises.reduce((n, e) => n + workSets(e.sets).length, 0);
    const prior = sessions.slice(-6, -1).map(sets);
    const rpes = last.exercises.flatMap((e) => workSets(e.sets).map((x) => Number(x.rpe)).filter((x) => x > 0));
    const hard = (rpes.length >= 3 && mean(rpes) >= 9) || (prior.length >= 3 && sets(last) >= mean(prior) * 1.35) || (last.durationSec || 0) >= 95 * 60;
    if (hard) out.push({ key: `rec:${last.id}`, kind: 'recovery' });
  }
  return out.filter((n) => !a.nudged?.[n.key]);
}

function deliver(items, now = new Date()) {
  const a = store.state.aiCoach;
  const today = dayKey(now);
  const sentToday = Object.values(a.nudged || {}).filter((d) => dayKey(d) === today).length;
  const take = items.slice(0, Math.max(0, MAX_PER_DAY - sentToday));
  if (!take.length) return [];
  const coach = a.profile || DEFAULT_COACH;
  const msgs = take.map((n) => ({ id: uid('m'), role: 'model', kind: 'nudge', text: nudgeLine(coach, n.kind, n.arg), ts: now.toISOString(), demos: [] }));
  update((s) => {
    s.aiCoach.nudged = s.aiCoach.nudged || {};
    for (const n of take) s.aiCoach.nudged[n.key] = now.toISOString();
    // drop records older than 60 days
    for (const [k, d] of Object.entries(s.aiCoach.nudged)) if (daysBetween(d, now) > 60) delete s.aiCoach.nudged[k];
    s.aiCoach.messages.push(...msgs);
    s.aiCoach.unread = (s.aiCoach.unread || 0) + msgs.length;
  }, { silent: true, immediate: true });
  if (a.prefs.notify && typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
    for (const m of msgs) { try { new Notification(`Coach ${coach.name}`, { body: m.text, tag: `ascend-${m.id}` }); } catch { /* ignore */ } }
  }
  return msgs;
}

export function runNudges(now = new Date()) {
  try { return deliver(dueNudges(store.state, now), now); } catch { return []; }
}

/** After a workout with PRs. */
export function prNudge(session, now = new Date()) {
  const a = store.state.aiCoach;
  if (!a?.setupDone || !a.prefs?.nudges || !session.prs?.length || a.nudged?.[`pr:${session.id}`]) return [];
  const p = session.prs.find((x) => x.kind === 'e1rm') || session.prs[0];
  return deliver([{ key: `pr:${session.id}`, kind: 'pr', arg: getExercise(p.exId, store.state.customExercises)?.name || 'a lift' }], now);
}
