// Builds the training context sent to the AI coach for one question.
// ASCEND keeps all data on-device (no server database), so this runs in the app and selects only
// what's relevant: profile basics, rank, goals, plan, recent frequency, and detailed history only
// for the exercises the question is about. Every number comes from saved records.
import { getExercise } from '../data/exercises.js';
import { demoFor } from '../data/media.js';
import { exerciseHistory, sortedSessions, workSets } from './history.js';
import { displayRank, plannedDaysPerWeek, isYouth, RANKS } from './rank.js';
import { goalStatus, goalTitle, GOAL_CATEGORIES } from './goals.js';
import { insights, strengthPlan, targetFor, readinessScore } from './coach.js';
import { levelInfo } from './xp.js';
import { LEVEL_LABELS } from './strength.js';
import { EQUIPMENT } from '../data/exercises.js';
import { fmtWeight, fmtDate, fmtDuration, WEEKDAYS, weekdayIdx, dayKey, DAY_MS, daysBetween, startOfWeek } from '../util.js';

const ALIASES = {
  bench: ['bench', 'bench press'], ohp: ['overhead press', 'ohp', 'military press', 'shoulder press'], squat: ['squat', 'back squat'],
  deadlift: ['deadlift'], pullup: ['pull-up', 'pullup', 'pull up', 'pull-ups', 'pullups'], chinup: ['chin-up', 'chinup', 'chin up'],
  rdl: ['rdl', 'romanian'], bb_row: ['barbell row', 'bent over row', 'row'], lat_pulldown: ['pulldown', 'lat pulldown'],
  hip_thrust: ['hip thrust'], leg_press: ['leg press'], db_curl: ['curl', 'bicep curl', 'biceps curl'], pushdown: ['pushdown', 'tricep pushdown'],
  lateral_raise: ['lateral raise', 'lateral raises', 'side raise'], dip: ['dip', 'dips'], pushup: ['push-up', 'pushup', 'push up', 'push-ups'],
};

const EQUIP_WORDS = /^(barbell|dumbbell|cable|machine|smith machine|seated|standing|one-arm|lying|chest-supported)\s+/i;

/** Exercises the question refers to, most specific first. Limited to the library. */
export function mentionedExercises(state, question = '') {
  const q = ` ${question.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ')} `;
  if (!q.trim()) return [];
  const relevant = new Set([
    ...state.sessions.flatMap((s) => s.exercises.map((e) => e.exId)),
    ...(state.splits || []).flatMap((sp) => sp.days.flatMap((d) => d.slots.map((x) => x.exId))),
    ...(state.goals || []).map((g) => g.exId).filter(Boolean),
  ]);
  const hits = [];
  const consider = (id, score) => { if (!hits.some((h) => h.id === id)) hits.push({ id, score }); };
  for (const [id, words] of Object.entries(ALIASES)) {
    for (const w of words) if (q.includes(` ${w} `) || q.includes(` ${w}s `)) consider(id, w.length + (relevant.has(id) ? 10 : 0));
  }
  for (const id of relevant) {
    const ex = getExercise(id, state.customExercises);
    if (!ex) continue;
    const full = ex.name.toLowerCase();
    const short = full.replace(EQUIP_WORDS, '');
    if (q.includes(full)) consider(id, 100 + full.length);
    else if (short.length >= 4 && q.includes(short)) consider(id, 40 + short.length);
  }
  return hits.sort((a, b) => b.score - a.score).map((h) => h.id).slice(0, 4);
}

function setLine(sets, unit, ex) {
  return sets.map((s) => {
    const w = Number(s.weightKg) ? fmtWeight(s.weightKg, unit, { suffix: false }) : (ex?.load === 'bw' ? 'BW' : '0');
    return `${ex?.load === 'bw' && Number(s.weightKg) ? `BW+${w}` : w}×${s.reps}${s.rpe ? `@${s.rpe}` : ''}`;
  }).join(', ');
}

function exerciseBlock(state, exId, unit, { detail = true, now }) {
  const ex = getExercise(exId, state.customExercises);
  if (!ex) return '';
  const h = exerciseHistory(state, exId, { before: new Date(now.getTime() + 1) });
  const perHand = ex.load === 'perHand' ? ' (weights are per dumbbell)' : ex.load === 'bw' ? ' (body weight + added weight)' : ex.load === 'assist' ? ' (weight = assistance)' : '';
  const lines = [`## ${ex.name}${perHand} — ${demoFor(exId) ? 'demonstration available in app' : 'no demonstration bundled'}`];
  if (!h.length) {
    lines.push('Never logged.');
  } else {
    const recent = h.slice(-(detail ? 4 : 1)).reverse();
    for (const s of recent) lines.push(`- ${fmtDate(s.date, { month: 'short', day: 'numeric', year: 'numeric' })}: ${setLine(s.sets, unit, ex)}${s.e1rm ? ` (est. 1RM ${fmtWeight(s.e1rm, unit)})` : ''}`);
    if (detail) {
      const best = h.reduce((a, b) => (b.e1rm > a.e1rm ? b : a));
      if (best.e1rm) lines.push(`Best est. 1RM: ${fmtWeight(best.e1rm, unit)} on ${fmtDate(best.date)}. Logged in ${h.length} session${h.length > 1 ? 's' : ''}.`);
      const prs = (state.prs || []).filter((p) => p.exId === exId).slice(-3);
      if (prs.length) lines.push(`PRs: ${prs.map((p) => `${fmtDate(p.date)} ${p.weightKg ? fmtWeight(p.weightKg, unit) + '×' : ''}${p.reps} (${p.kind === 'e1rm' ? 'est. max' : p.kind === 'weight' ? 'heaviest' : 'reps'})`).join('; ')}`);
    }
  }
  if (detail) {
    const slot = (state.splits || []).flatMap((sp) => sp.days.flatMap((d) => d.slots)).find((s) => s.exId === exId) || { exId, sets: 3, repMin: ex.reps[0], repMax: ex.reps[1] };
    const t = targetFor(state, slot, { now });
    lines.push(`Plan: ${slot.sets} sets × ${slot.repMin}–${slot.repMax} reps. ASCEND rules-based target next session: ${t.weightKg ? `${fmtWeight(t.weightKg, unit)} × ${t.reps}` : `${t.repMin}–${t.repMax} reps, weight not yet established`}${t.suggestion ? ` (suggests ${fmtWeight(t.suggestion.weightKg, unit)} × ${t.suggestion.reps} if the user confirms)` : ''}. Reason: ${t.why}`);
    if (ex.alt?.length) lines.push(`Substitutes in library: ${ex.alt.slice(0, 4).map((a) => getExercise(a, state.customExercises)?.name).filter(Boolean).join(', ')}`);
  }
  return lines.join('\n');
}

/**
 * @param {object} opts question, focusExId (exercise the user is on during a workout), now
 * @returns {{ text: string, exercises: string[] }}
 */
export function buildCoachContext(state, { question = '', focusExId = null, now = new Date() } = {}) {
  const p = state.profile;
  const unit = p.unit || 'lb';
  const u = unit === 'lb' ? 'lbs' : 'kg';
  const out = [];
  const youth = isYouth(state);
  out.push(`Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Weight unit: ${u}.`);
  out.push(`Trainee: ${p.name ? `${p.name}, ` : ''}age ${p.age}${youth ? ' (UNDER 18)' : ''}, body weight ${fmtWeight(p.bodyweightKg, unit)}, experience: ${p.experience}, plans ${plannedDaysPerWeek(state)} training days/week. Equipment: ${(p.equipment || []).map((e) => EQUIPMENT.find((x) => x.id === e)?.label).filter(Boolean).join(', ') || 'none listed'}.`);
  const cat = GOAL_CATEGORIES.find((c) => c.id === p.goalPrimary);
  out.push(`Training focus: ${cat?.label || 'not set'}${(p.goalsSecondary || []).length ? `; secondary: ${p.goalsSecondary.map((x) => GOAL_CATEGORIES.find((c) => c.id === x)?.label).filter(Boolean).join(', ')}` : ''}.`);

  // rank
  const dr = displayRank(state, now);
  if (dr.placed) {
    const pats = Object.values(dr.strength.patterns).filter((x) => x.trained).map((x) => `${x.label} ${x.ratio.toFixed(2)}×BW (${LEVEL_LABELS[x.level] || 'developing'})`).join(', ');
    out.push(`${youth ? 'Development' : 'Strength'} rank: ${dr.rank.name} (ASCEND score ${dr.score.toFixed(1)}${dr.next ? `; ${Math.max(0, dr.next.min - dr.rawScore).toFixed(1)} points to ${dr.next.name}` : '; top rank'}). Components: ${dr.components.map((c) => `${c.label} ${Math.round(c.value)}`).join(', ')}.${pats ? ` Patterns: ${pats}.` : ''}`);
    const last = (state.rank?.history || []).at(-1);
    if (last) out.push(`Last promotion: ${RANKS[last.idx].name} on ${fmtDate(last.date)}.`);
  } else {
    out.push(`Strength rank: not yet placed (${dr.placementLeft} placement workout${dr.placementLeft === 1 ? '' : 's'} left).`);
  }
  const lv = levelInfo(state.xp?.total || 0);
  out.push(`Level ${lv.level} (${state.xp?.total || 0} XP). Workouts logged: ${state.sessions.length}. PRs: ${(state.prs || []).length}.`);

  // plan
  const sp = (state.splits || []).find((s) => s.id === state.activeSplitId) || state.splits?.[0];
  let todayIds = [];
  if (sp) {
    out.push(`Split "${sp.name}": ${WEEKDAYS.map((d, i) => `${d} ${sp.days.find((x) => x.id === sp.schedule[i])?.name || 'rest'}`).join(', ')}.`);
    const today = sp.days.find((x) => x.id === sp.schedule[weekdayIdx(now)]);
    const trained = state.sessions.some((s) => dayKey(s.date) === dayKey(now));
    if (today) {
      todayIds = today.slots.map((s) => s.exId);
      out.push(`Today's scheduled workout: ${today.name}${today.focus ? ` (${today.focus})` : ''}${trained ? ' — already completed today' : ''}: ${today.slots.map((s) => `${getExercise(s.exId, state.customExercises)?.name} ${s.sets}×${s.repMin}–${s.repMax}`).join('; ')}.`);
    } else out.push(`Today is a scheduled rest day${trained ? ' (but the user trained today)' : ''}.`);
  }

  // frequency + recovery
  const ss = sortedSessions(state).filter((s) => new Date(s.date) <= now);
  const in7 = ss.filter((s) => now - new Date(s.date) <= 7 * DAY_MS).length;
  const in28 = new Set(ss.filter((s) => now - new Date(s.date) <= 28 * DAY_MS).map((s) => dayKey(s.date))).size;
  const thisWeek = new Set(ss.filter((s) => new Date(s.date) >= startOfWeek(now)).map((s) => dayKey(s.date))).size;
  out.push(`Frequency: ${in7} sessions in the last 7 days, ${in28} training days in the last 28, ${thisWeek} so far this week (plan ${plannedDaysPerWeek(state)}).`);
  if (ss.length) {
    out.push('Recent sessions: ' + ss.slice(-3).reverse().map((s) => `${fmtDate(s.date)} ${s.name} (${fmtDuration(s.durationSec || 0)}, ${s.exercises.reduce((a, e) => a + workSets(e.sets).length, 0)} sets${s.prs?.length ? `, ${s.prs.length} PR` : ''}${s.readiness ? `, readiness ${readinessScore(s.readiness)?.toFixed(1)}/5` : ''})`).join('; ') + '.');
    const gap = daysBetween(ss.at(-1).date, now);
    if (gap > 0) out.push(`Days since last session: ${gap}.`);
    const lastR = [...ss].reverse().find((s) => s.readiness);
    if (lastR) out.push(`Latest recovery check-in (${fmtDate(lastR.date)}): sleep ${lastR.readiness.sleep ?? '–'}/5, energy ${lastR.readiness.energy ?? '–'}/5, soreness ${lastR.readiness.soreness ?? '–'}/5 (5 = very sore).`);
  } else out.push('No workouts logged yet.');

  // goals
  const goals = (state.goals || []).filter((g) => !g.archived);
  if (goals.length) {
    out.push('Goals:');
    for (const g of goals.slice(0, 4)) {
      const s = goalStatus(state, g, now);
      let line = `- ${g.primary ? 'MAIN ' : ''}${goalTitle(g, unit)} [${g.type}]: ${s.current != null ? `${s.label} ${s.fmt(s.current)}` : 'not measured yet'}, target ${s.fmt(s.target)}, progress ${Math.round(s.pct * 100)}%`;
      if (s.baseline != null && g.type !== 'consistency' && g.type !== 'custom') line += `, baseline ${s.fmt(s.baseline)}`;
      if (s.next) line += `, next milestone ${s.next.label}`;
      if (s.recent != null && g.type !== 'consistency') line += `, change last 30 days ${s.recent >= 0 ? '+' : ''}${g.type === 'reps' ? `${s.recent} reps` : fmtWeight(s.recent, unit)}`;
      if (g.targetDate) line += `, user's target date ${fmtDate(g.targetDate, { month: 'short', day: 'numeric', year: 'numeric' })}`;
      if (g.completedAt) line += ' — COMPLETED';
      if (g.type === 'strength' && !g.completedAt) {
        const plan = strengthPlan(state, g, now);
        if (plan.ready && plan.weeks) line += `. Typical-rate estimate ${plan.weeks[0]}–${plan.weeks[1]} weeks (not a promise)`;
      }
      out.push(line + '.');
    }
  } else out.push('Goals: none set.');

  const cards = insights(state, now).filter((c) => c.id !== 'week').slice(0, 5);
  if (cards.length) out.push(`ASCEND rules-based coach signals: ${cards.map((c) => c.title).join('; ')}.`);

  // active workout
  const w = state.activeWorkout;
  if (w) {
    const mins = Math.round((now - new Date(w.startedAt) - (w.pausedMs || 0)) / 60000);
    out.push(`ACTIVE WORKOUT in progress: ${w.name}, ${mins} min in.${focusExId ? ` The user is currently on ${getExercise(focusExId, state.customExercises)?.name}.` : ''}`);
    for (const e of w.exercises) {
      const ex = getExercise(e.exId, state.customExercises);
      const done = e.sets.filter((s) => s.done && s.type !== 'warmup');
      out.push(`- ${ex?.name}: ${done.length}/${e.sets.filter((s) => s.type !== 'warmup').length} sets done${done.length ? ` (${setLine(done, unit, ex)})` : ''}; today's target ${e.target?.weightKg ? `${fmtWeight(e.target.weightKg, unit)} × ${e.target.reps}` : `${e.target?.repMin}–${e.target?.repMax} reps`}; planned rest ${fmtDuration(e.slot?.rest || state.prefs.defaultRest)}.`);
    }
  }

  // exercise detail
  const mentioned = mentionedExercises(state, question);
  const goalEx = goals.filter((g) => g.exId && !g.completedAt).map((g) => g.exId);
  const detailIds = [...new Set([focusExId, ...mentioned].filter(Boolean))];
  if (!detailIds.length) detailIds.push(...goalEx.slice(0, 1));
  const briefIds = [...new Set([...goalEx, ...todayIds])].filter((id) => !detailIds.includes(id)).slice(0, 6);
  if (detailIds.length || briefIds.length) {
    out.push('EXERCISE HISTORY (most recent first; format weight×reps@RPE):');
    for (const id of detailIds) out.push(exerciseBlock(state, id, unit, { detail: true, now }));
    for (const id of briefIds) out.push(exerciseBlock(state, id, unit, { detail: false, now }));
  }
  return { text: out.join('\n'), exercises: [...detailIds, ...briefIds] };
}

