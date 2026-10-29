// Run with: node --test ascend/tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { e1rm, ratioToScore, STANDARDS, patternSeries, computeStrength, setLoadKg } from '../js/engine/strength.js';
import { evaluateRank, applyRank, rankIndexForScore, RANKS, computeConsistency } from '../js/engine/rank.js';
import { targetFor, insights, strengthPlan, warmupRamp, roundLoad } from '../js/engine/coach.js';
import { goalStatus, checkGoals, captureBaseline } from '../js/engine/goals.js';
import { detectPRs, exerciseHistory } from '../js/engine/history.js';
import { sessionXp, levelInfo, checkAchievements, xpForLevel } from '../js/engine/xp.js';
import { buildSplitFromTemplate, TEMPLATES } from '../js/data/templates.js';
import { getExercise, EQUIPMENT_PRESETS, isAvailable } from '../js/data/exercises.js';
import { KG_PER_LB, DAY_MS } from '../js/util.js';

const LB = KG_PER_LB;
const NOW = new Date('2026-06-30T18:00:00');
const daysAgo = (n) => new Date(NOW.getTime() - n * DAY_MS).toISOString();

function mk(over = {}) {
  return {
    sessions: [], goals: [], bodyweights: [], prs: [], customExercises: [], splits: [], rank: { idx: 0, history: [] },
    xp: { total: 0, log: [] }, achievements: {}, coach: { accepted: {} },
    profile: { age: 28, bodyweightKg: 80, unit: 'lb', experience: 'intermediate', trainingDays: 4, sexStandard: 'male',
      equipment: EQUIPMENT_PRESETS.full, createdAt: daysAgo(60), ...over.profile },
  };
}

let sid = 0;
function session(date, items) {
  return {
    id: 'S' + (++sid), date, durationSec: 3600,
    exercises: items.map(([exId, sets]) => ({ uid: 'u' + sid + exId, exId, sets: sets.map(([w, r, rpe]) => ({ type: 'work', weightKg: w, reps: r, rpe, done: true })) })),
  };
}

test('e1RM formulas', () => {
  assert.equal(e1rm(100, 1), 100);
  const v = e1rm(100, 5);
  assert.ok(v > 112 && v < 117, `got ${v}`);
  assert.equal(e1rm(100, 13), null, 'high-rep sets excluded');
  assert.equal(e1rm(100, 10, 3), null, 'reps + RIR > 12 excluded');
  assert.equal(e1rm(0, 5), null);
});

test('load accounting for dumbbells and body weight', () => {
  assert.equal(setLoadKg(getExercise('db_bench'), { weightKg: 30 }, 80), 60);
  assert.equal(setLoadKg(getExercise('pullup'), { weightKg: 10 }, 80), 90);
  assert.equal(setLoadKg(getExercise('assisted_pullup'), { weightKg: 30 }, 80), 50);
});

test('ratio → score bands are monotonic and capped', () => {
  const b = STANDARDS.male.bench;
  let prev = -1;
  for (let r = 0; r <= 3; r += 0.05) { const s = ratioToScore(r, b); assert.ok(s >= prev); assert.ok(s <= 100); prev = s; }
  assert.equal(Math.round(ratioToScore(1.0, b)), 60);
});

test('progressive verification caps single-session jumps at 10%', () => {
  const s = mk();
  s.sessions.push(session(daysAgo(10), [['bench', [[80, 5]]]]));
  s.sessions.push(session(daysAgo(5), [['bench', [[120, 5]]]]));
  const ser = patternSeries(s).bench;
  assert.equal(ser.length, 2);
  assert.ok(ser[1].capped);
  assert.ok(Math.abs(ser[1].verified - ser[0].verified * 1.1) < 1e-6);
});

test('implausible entries are flagged and ignored', () => {
  const s = mk();
  s.sessions.push(session(daysAgo(3), [['bench', [[400, 5]]]]));
  const st = computeStrength(s, NOW);
  assert.equal(st.patterns.bench.trained, false);
  assert.equal(st.flagged.length, 1);
});

test('junk volume does not raise the strength score', () => {
  const a = mk(); const b = mk();
  for (let i = 0; i < 4; i++) a.sessions.push(session(daysAgo(20 - i * 4), [['bench', [[80, 5]]]]));
  for (let i = 0; i < 4; i++) b.sessions.push(session(daysAgo(20 - i * 4), [['bench', [[80, 5], ...Array(15).fill([40, 30])]]]));
  assert.equal(computeStrength(a, NOW).strength, computeStrength(b, NOW).strength);
});

test('placement then rank promotion', () => {
  const s = mk();
  s.sessions.push(session(daysAgo(6), [['bench', [[80, 5]]], ['squat', [[110, 5]]]]));
  s.sessions.push(session(daysAgo(4), [['deadlift', [[140, 5]]], ['pullup', [[0, 8]]]]));
  assert.equal(evaluateRank(s, NOW).placed, false);
  assert.equal(applyRank(s, NOW), null);
  s.sessions.push(session(daysAgo(2), [['ohp', [[50, 5]]], ['bench', [[82.5, 5]]]]));
  const ev = evaluateRank(s, NOW);
  assert.equal(ev.placed, true);
  assert.ok(ev.idx >= 1);
  const promo = applyRank(s, NOW);
  assert.ok(promo && promo.to === ev.idx);
  assert.equal(applyRank(s, NOW), null, 'no repeat promotion');
});

test('rank thresholds', () => {
  assert.equal(RANKS[rankIndexForScore(0)].id, 'iron');
  assert.equal(RANKS[rankIndexForScore(56)].id, 'platinum');
  assert.equal(RANKS[rankIndexForScore(99)].id, 'ascendant');
});

test('youth users are ranked without adult strength standards', () => {
  const s = mk({ profile: { age: 15 } });
  for (let i = 0; i < 3; i++) s.sessions.push(session(daysAgo(9 - i * 3), [['goblet_squat', [[20, 10, 7]]], ['pushup', [[0, 10, 7]]]]));
  const ev = evaluateRank(s, NOW);
  assert.equal(ev.youth, true);
  assert.ok(ev.components.every((c) => c.id !== 'strength'));
  assert.ok(ev.technique);
});

test('consistency is capped at the plan', () => {
  const s = mk();
  for (let i = 0; i < 28; i++) s.sessions.push(session(daysAgo(i), [['bench', [[60, 8]]]]));
  assert.equal(computeConsistency(s, NOW).score, 100);
});

test('coach: double progression then a confirmed small increase', () => {
  const s = mk();
  const slot = { exId: 'bench', sets: 3, repMin: 6, repMax: 10 };
  s.sessions.push(session(daysAgo(3), [['bench', [[135 * LB, 8], [135 * LB, 8], [135 * LB, 7]]]]));
  let t = targetFor(s, slot, { now: NOW });
  assert.equal(t.kind, 'reps');
  assert.equal(t.reps, 9);
  assert.ok(Math.abs(t.weightKg - 135 * LB) < 1e-6);
  s.sessions.push(session(daysAgo(1), [['bench', [[135 * LB, 10, 8], [135 * LB, 10, 8], [135 * LB, 10, 8]]]]));
  t = targetFor(s, slot, { now: NOW });
  assert.equal(t.kind, 'increase');
  assert.equal(t.needsConfirm, true);
  assert.ok(Math.abs(t.suggestion.weightKg / LB - 140) < 0.01, `suggest ${t.suggestion.weightKg / LB}`);
  assert.ok(Math.abs(t.weightKg - 135 * LB) < 1e-6, 'weight unchanged until confirmed');
});

test('coach: re-entry after a long break, deload on stall', () => {
  const s = mk();
  const slot = { exId: 'squat', sets: 3, repMin: 5, repMax: 8 };
  s.sessions.push(session(daysAgo(30), [['squat', [[100, 5]]]]));
  assert.equal(targetFor(s, slot, { now: NOW }).kind, 'reentry');
  const s2 = mk();
  for (let i = 0; i < 5; i++) s2.sessions.push(session(daysAgo(15 - i * 3), [['squat', [[100, 5]]]]));
  const t = targetFor(s2, slot, { now: NOW });
  assert.equal(t.kind, 'deload');
  assert.ok(t.suggestion.weightKg < 100);
});

test('coach insights flag rest after many consecutive days', () => {
  const s = mk();
  for (let i = 0; i < 5; i++) s.sessions.push(session(daysAgo(i), [['bench', [[60, 8]]]]));
  assert.ok(insights(s, NOW).some((c) => c.id === 'rest'));
});

test('strength plan gives a range, never a date', () => {
  const s = mk();
  s.sessions.push(session(daysAgo(2), [['bench', [[150 * LB, 5]]]]));
  const p = strengthPlan(s, { exId: 'bench', targetKg: 225 * LB }, NOW);
  assert.ok(p.ready && p.weeks[0] < p.weeks[1]);
  assert.match(p.text, /not a promise/);
});

test('goal progress, milestones and completion', () => {
  const s = mk();
  s.sessions.push(session(daysAgo(20), [['bench', [[150 * LB, 5]]]]));
  const g = captureBaseline(s, { id: 'g1', type: 'strength', exId: 'bench', targetKg: 225 * LB, createdAt: daysAgo(20) }, new Date(daysAgo(19)));
  s.goals.push(g);
  let st = goalStatus(s, g, NOW);
  assert.ok(st.pct > 0.7 && st.pct < 0.8);
  assert.ok(st.next);
  s.sessions.push(session(daysAgo(1), [['bench', [[165 * LB, 5]]]]));
  const ev = checkGoals(s, NOW);
  assert.ok(ev.some((e) => e.milestone));
  st = goalStatus(s, g, NOW);
  assert.ok(st.pct > 0.8);
});

test('PR detection ignores first exposure', () => {
  const s = mk();
  const a = session(daysAgo(5), [['bench', [[80, 5]]]]);
  s.sessions.push(a);
  assert.equal(detectPRs(s, a).length, 0);
  const b = session(daysAgo(2), [['bench', [[85, 5]]]]);
  s.sessions.push(b);
  const prs = detectPRs(s, b);
  assert.equal(prs.length, 1);
  assert.equal(prs[0].kind, 'e1rm');
  assert.equal(exerciseHistory(s, 'bench').length, 2);
});

test('XP: no workout XP beyond the weekly plan', () => {
  const s = mk({ profile: { trainingDays: 2 } });
  const mon = new Date('2026-06-29T10:00:00');
  for (let i = 0; i < 3; i++) s.sessions.push(session(new Date(mon.getTime() + i * DAY_MS).toISOString(), [['bench', [[60, 8]]]]));
  const third = sessionXp(s, s.sessions[2]);
  assert.equal(third[0].amount, 0);
  const second = sessionXp(s, s.sessions[1]);
  assert.ok(second.some((x) => x.reason === 'Weekly plan complete'));
});

test('levels and achievements', () => {
  assert.equal(levelInfo(0).level, 1);
  assert.equal(levelInfo(xpForLevel(5)).level, 5);
  const s = mk();
  s.sessions.push(session(daysAgo(1), [['bench', [[60, 8]]]]));
  const got = checkAchievements(s, NOW).map((a) => a.id);
  assert.ok(got.includes('first_rep'));
  assert.ok(s.xp.total > 0);
});

test('templates adapt to equipment and training days', () => {
  for (const t of TEMPLATES) {
    const sp = buildSplitFromTemplate(t, { equipment: EQUIPMENT_PRESETS.dumbbell, trainingDays: 3 });
    for (const d of sp.days) for (const sl of d.slots) {
      const ex = getExercise(sl.exId);
      assert.ok(ex, sl.exId);
    }
    if (t.days.length) assert.equal(sp.schedule.filter(Boolean).length, 3, t.id);
  }
  const ppl = buildSplitFromTemplate(TEMPLATES[0], { equipment: EQUIPMENT_PRESETS.dumbbell });
  const avail = ppl.days.flatMap((d) => d.slots).filter((sl) => isAvailable(getExercise(sl.exId), EQUIPMENT_PRESETS.dumbbell)).length;
  assert.ok(avail >= ppl.days.flatMap((d) => d.slots).length * 0.6);
});

test('warm-up ramp and load rounding', () => {
  const r = warmupRamp(100, 'kg', getExercise('squat'));
  assert.ok(r.length >= 2 && r.every((x) => x.weightKg < 100));
  assert.equal(roundLoad(61.3, 'kg', getExercise('bench')), 62.5);
});
