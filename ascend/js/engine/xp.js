// XP, levels, cosmetic unlocks and achievements.
// XP rewards sustainable behaviour: sessions beyond the weekly plan earn no workout XP,
// and nothing rewards training through pain or skipping rest.
import { sortedSessions, sessionVolumeKg } from './history.js';
import { plannedDaysPerWeek, evaluateRank } from './rank.js';
import { startOfWeek, addDays, dayKey, daysBetween, DAY_MS } from '../util.js';

export const XP = { workout: 100, pr: 40, prCap: 3, weekPlan: 150, milestone: 150, goal: 500, achievement: 75, rankUp: 200 };

/** Cumulative XP required to reach level L (L ≥ 1). */
export const xpForLevel = (L) => Math.round(250 * Math.pow(L - 1, 1.45));

export function levelInfo(total) {
  let L = 1;
  while (xpForLevel(L + 1) <= total) L++;
  const a = xpForLevel(L); const b = xpForLevel(L + 1);
  return { level: L, into: total - a, need: b - a, progress: (total - a) / (b - a), nextAt: b };
}

export const THEMES = [
  { id: 'ice', name: 'Ice', level: 1, accent: '#78CFFF', soft: '#B9E8FF' },
  { id: 'glacier', name: 'Glacier', level: 3, accent: '#5CC9C0', soft: '#BDEFEA' },
  { id: 'graphite', name: 'Graphite', level: 5, accent: '#8C96A3', soft: '#DCE1E7' },
  { id: 'aurora', name: 'Aurora', level: 8, accent: '#8E9BFF', soft: '#D6DBFF' },
  { id: 'ember', name: 'Ember', level: 12, accent: '#F2A36B', soft: '#FBDCC6' },
  { id: 'marble', name: 'Marble Hall', level: 16, accent: '#78CFFF', soft: '#E7E9EC', marble: true },
];

export const TITLES = [
  { level: 1, name: 'Initiate' }, { level: 4, name: 'Disciplined' }, { level: 7, name: 'Relentless' },
  { level: 10, name: 'Iron-Willed' }, { level: 14, name: 'Architect' }, { level: 20, name: 'Ascendant Mind' },
];

export const FRAMES = [
  { id: 'none', name: 'Clean', level: 1 }, { id: 'ring', name: 'Halo Ring', level: 2 },
  { id: 'double', name: 'Twin Ring', level: 6 }, { id: 'marble', name: 'Marble Disc', level: 10 }, { id: 'rays', name: 'Radiant', level: 15 },
];

export function titleFor(level) {
  return [...TITLES].reverse().find((t) => level >= t.level)?.name || 'Initiate';
}

const sessionsInWeek = (sessions, weekStart) => {
  const end = addDays(weekStart, 7);
  return new Set(sessions.filter((s) => new Date(s.date) >= weekStart && new Date(s.date) < end).map((s) => dayKey(s.date))).size;
};

/** XP breakdown for a just-finished session (already appended to state.sessions). */
export function sessionXp(state, session) {
  const items = [];
  const planned = plannedDaysPerWeek(state);
  const sessions = sortedSessions(state);
  const ws = startOfWeek(session.date);
  const countThisWeek = sessionsInWeek(sessions.filter((s) => new Date(s.date) <= new Date(session.date)), ws);
  const sameDayEarlier = sessions.some((s) => s.id !== session.id && dayKey(s.date) === dayKey(session.date) && new Date(s.date) < new Date(session.date));
  if (sameDayEarlier) {
    items.push({ amount: 0, reason: 'Second session today — no extra workout XP' });
  } else if (countThisWeek <= planned) {
    items.push({ amount: XP.workout, reason: 'Planned workout completed' });
  } else {
    items.push({ amount: 0, reason: 'Beyond your weekly plan — rest earns more than extra sessions' });
  }
  const prs = (session.prs || []).slice(0, XP.prCap);
  if (prs.length) items.push({ amount: prs.length * XP.pr, reason: `${prs.length} personal record${prs.length > 1 ? 's' : ''}` });
  if (countThisWeek === planned && !sameDayEarlier) items.push({ amount: XP.weekPlan, reason: 'Weekly plan complete' });
  return items;
}

export function addXp(state, amount, reason, date = new Date()) {
  if (!amount) return;
  state.xp = state.xp || { total: 0, log: [] };
  state.xp.total += amount;
  state.xp.log.push({ date: new Date(date).toISOString(), amount, reason });
  if (state.xp.log.length > 500) state.xp.log = state.xp.log.slice(-500);
}

// ---------- achievements ----------
function weeksOnPlan(state, now) {
  const sessions = sortedSessions(state);
  if (!sessions.length) return 0;
  const planned = plannedDaysPerWeek(state);
  let streak = 0; let best = 0;
  for (let w = startOfWeek(sessions[0].date); w <= now; w = addDays(w, 7)) {
    if (addDays(w, 7) > now) break; // only completed weeks
    if (sessionsInWeek(sessions, w) >= planned) { streak++; best = Math.max(best, streak); } else streak = 0;
  }
  return best;
}

function recoveryDays(state) {
  // count rest days taken immediately after 3+ consecutive training days
  const days = [...new Set(sortedSessions(state).map((s) => dayKey(s.date)))].sort();
  let n = 0; let run = 1;
  for (let i = 1; i <= days.length; i++) {
    const gap = i < days.length ? daysBetween(days[i - 1], days[i]) : 99;
    if (gap === 1) run++;
    else { if (run >= 3 && gap >= 2 && i < days.length) n++; run = 1; }
  }
  return n;
}

export const ACHIEVEMENTS = [
  { id: 'first_rep', name: 'First Rep', desc: 'Log your first workout.', test: (s) => s.sessions.length >= 1 },
  { id: 'first_week', name: 'First Week Complete', desc: 'Hit every planned session in a calendar week.', test: (s, n) => weeksOnPlan(s, n) >= 1 },
  { id: 'ten', name: '10 Workouts Logged', desc: 'Ten sessions in the books.', test: (s) => s.sessions.length >= 10 },
  { id: 'twentyfive', name: 'Quarter Century', desc: 'Log 25 workouts.', test: (s) => s.sessions.length >= 25 },
  { id: 'fifty', name: 'Fifty Strong', desc: 'Log 50 workouts.', test: (s) => s.sessions.length >= 50 },
  { id: 'hundred', name: 'The Hundred', desc: 'Log 100 workouts.', test: (s) => s.sessions.length >= 100 },
  { id: 'first_pr', name: 'New Personal Record', desc: 'Set your first PR.', test: (s) => (s.prs || []).length >= 1 },
  { id: 'pr10', name: 'Record Breaker', desc: 'Set 10 personal records.', test: (s) => (s.prs || []).length >= 10 },
  { id: 'thirty', name: '30-Day Progress', desc: 'Train for 30 days with 8+ sessions logged.', test: (s, n) => s.sessions.length >= 8 && daysBetween(sortedSessions(s)[0].date, n) >= 30 },
  { id: 'breakthrough', name: 'Strength Breakthrough', desc: 'Raise a movement pattern\'s verified strength by 10%.', test: (s, n, ev) => Object.values(ev.improvement.perPattern).some((g) => g >= 0.10) },
  { id: 'consistency', name: 'Consistency Champion', desc: 'Hit your weekly plan four weeks in a row.', test: (s, n) => weeksOnPlan(s, n) >= 4 },
  { id: 'recovery', name: 'Smart Recovery', desc: 'Take a rest day after 3+ straight training days, five times.', test: (s) => recoveryDays(s) >= 5 },
  { id: 'placed', name: 'Ranked', desc: 'Complete your placement workouts.', test: (s, n, ev) => ev.placed },
  { id: 'gold', name: 'Golden Standard', desc: 'Reach Gold rank.', test: (s) => (s.rank?.idx || 0) >= 4 },
  { id: 'well_rounded', name: 'Well-Rounded', desc: 'Train every available movement pattern.', test: (s, n, ev) => !ev.youth && ev.strength.trainedCount >= ev.strength.feasibleCount && ev.strength.feasibleCount >= 3 },
  { id: 'tonnage', name: '100 Tonnes', desc: 'Move 100,000 kg (220,462 lbs) of total volume.', test: (s) => s.sessions.reduce((a, x) => a + (x.volumeKg ?? sessionVolumeKg(s, x)), 0) >= 100000 },
  { id: 'goal', name: 'Goal Completed', desc: 'Complete a goal.', test: (s) => (s.goals || []).some((g) => g.completedAt) },
  { id: 'self_aware', name: 'Self-Aware', desc: 'Log body weight on 5 different days.', test: (s) => new Set((s.bodyweights || []).map((b) => dayKey(b.date))).size >= 5 },
];

/** Grants any newly earned achievements; returns the list of new ones. */
export function checkAchievements(state, now = new Date()) {
  state.achievements = state.achievements || {};
  const ev = evaluateRank(state, now);
  const earned = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id]) continue;
    let ok = false;
    try { ok = !!a.test(state, now, ev); } catch { ok = false; }
    if (ok) {
      state.achievements[a.id] = now.toISOString();
      addXp(state, XP.achievement, `Achievement: ${a.name}`, now);
      earned.push(a);
    }
  }
  return earned;
}

export function streakInfo(state, now = new Date()) {
  return { weeksOnPlan: weeksOnPlan(state, now), recentDays: sortedSessions(state).filter((s) => now - new Date(s.date) <= 7 * DAY_MS).length };
}

/** Current streak of consecutive completed weeks meeting the plan (counting this week if met). */
export function currentWeekStreak(state, now = new Date()) {
  const sessions = sortedSessions(state);
  const planned = plannedDaysPerWeek(state);
  let w = startOfWeek(now);
  let n = sessionsInWeek(sessions, w) >= planned ? 1 : 0;
  w = addDays(w, -7);
  while (sessions.length && w >= addDays(startOfWeek(sessions[0].date), 0)) {
    if (sessionsInWeek(sessions, w) >= planned) n++; else break;
    w = addDays(w, -7);
  }
  return n;
}
