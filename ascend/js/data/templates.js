// Workout split templates. Each day lists exercise ids with [sets]; rep ranges and rest
// come from the library defaults. Templates are a starting point only — everything is editable.
import { getExercise, alternativesFor, isAvailable } from './exercises.js';
import { uid } from '../util.js';

const D = (name, focus, list) => ({ name, focus, list });
const REST = null;

const PUSH = D('Push', 'Chest, Shoulders & Triceps', [['bench', 3], ['incline_db', 3], ['db_shoulder_press', 3], ['lateral_raise', 3], ['pushdown', 3]]);
const PULL = D('Pull', 'Back, Rear Delts & Biceps', [['lat_pulldown', 3], ['cable_row', 3], ['db_curl', 3], ['hammer_curl', 2], ['rear_delt_fly', 3]]);
const LEGS = D('Legs', 'Quads, Hamstrings & Calves', [['squat', 3], ['rdl', 3], ['leg_press', 3], ['leg_curl', 3], ['calf_raise', 3]]);
const PUSH_B = D('Push B', 'Shoulders, Chest & Triceps', [['ohp', 3], ['db_bench', 3], ['cable_fly', 3], ['lateral_raise', 3], ['overhead_ext', 3]]);
const PULL_B = D('Pull B', 'Back Thickness & Biceps', [['deadlift', 2], ['pullup', 3], ['db_row', 3], ['face_pull', 3], ['bb_curl', 3]]);
const LEGS_B = D('Legs B', 'Glutes, Hamstrings & Quads', [['front_squat', 3], ['hip_thrust', 3], ['split_squat', 3], ['leg_ext', 3], ['seated_calf', 3]]);
const UPPER = D('Upper', 'Chest, Back, Shoulders & Arms', [['bench', 3], ['bb_row', 3], ['db_shoulder_press', 3], ['lat_pulldown', 3], ['db_curl', 2], ['pushdown', 2]]);
const LOWER = D('Lower', 'Quads, Hamstrings, Glutes & Calves', [['squat', 3], ['rdl', 3], ['leg_press', 3], ['leg_curl', 3], ['calf_raise', 3]]);
const UPPER_B = D('Upper B', 'Shoulders, Back & Chest', [['ohp', 3], ['pullup', 3], ['incline_db', 3], ['cable_row', 3], ['lateral_raise', 3], ['hammer_curl', 2]]);
const LOWER_B = D('Lower B', 'Posterior Chain & Single-Leg', [['deadlift', 3], ['split_squat', 3], ['hip_thrust', 3], ['leg_ext', 2], ['hanging_leg_raise', 3]]);
const FULL_A = D('Full Body A', 'Squat, Press & Pull', [['squat', 3], ['bench', 3], ['bb_row', 3], ['lateral_raise', 2], ['plank', 2]]);
const FULL_B = D('Full Body B', 'Hinge, Overhead & Vertical Pull', [['deadlift', 2], ['ohp', 3], ['lat_pulldown', 3], ['split_squat', 2], ['db_curl', 2]]);
const FULL_C = D('Full Body C', 'Single-Leg, Incline & Row', [['front_squat', 3], ['incline_db', 3], ['db_row', 3], ['leg_curl', 2], ['pushdown', 2]]);
const CHEST_BACK = D('Chest & Back', 'Arnold: Chest + Back', [['bench', 3], ['pullup', 3], ['incline_db', 3], ['bb_row', 3], ['cable_fly', 2], ['lat_pulldown', 2]]);
const SHOULDERS_ARMS = D('Shoulders & Arms', 'Arnold: Delts, Biceps, Triceps', [['ohp', 3], ['lateral_raise', 3], ['bb_curl', 3], ['skull_crusher', 3], ['hammer_curl', 2], ['pushdown', 2]]);
const BRO_CHEST = D('Chest', 'Chest', [['bench', 4], ['incline_db', 3], ['machine_press', 3], ['cable_fly', 3]]);
const BRO_BACK = D('Back', 'Back', [['deadlift', 2], ['pullup', 3], ['bb_row', 3], ['lat_pulldown', 3], ['face_pull', 2]]);
const BRO_SHOULDERS = D('Shoulders', 'Shoulders & Traps', [['ohp', 4], ['lateral_raise', 4], ['rear_delt_fly', 3], ['shrug', 3]]);
const BRO_ARMS = D('Arms', 'Biceps & Triceps', [['bb_curl', 3], ['close_grip_bench', 3], ['hammer_curl', 3], ['pushdown', 3], ['preacher_curl', 2], ['overhead_ext', 2]]);
const BRO_LEGS = D('Legs', 'Legs', [['squat', 4], ['leg_press', 3], ['rdl', 3], ['leg_ext', 3], ['calf_raise', 4]]);

// schedule: Monday-first, index into days or REST
export const TEMPLATES = [
  { id: 'ppl', name: 'Push / Pull / Legs', blurb: '3 days · each muscle once a week', days: [PUSH, PULL, LEGS], schedule: [0, REST, 1, REST, 2, REST, REST] },
  { id: 'ppl6', name: 'Push / Pull / Legs ×2', blurb: '6 days · high frequency, for experienced lifters', days: [PUSH, PULL, LEGS, PUSH_B, PULL_B, LEGS_B], schedule: [0, 1, 2, 3, 4, 5, REST] },
  { id: 'ul', name: 'Upper / Lower', blurb: '4 days · balanced strength & size', days: [UPPER, LOWER, UPPER_B, LOWER_B], schedule: [0, 1, REST, 2, 3, REST, REST] },
  { id: 'arnold', name: 'Arnold Split', blurb: '6 days · chest/back, shoulders/arms, legs', days: [CHEST_BACK, SHOULDERS_ARMS, LEGS], schedule: [0, 1, 2, 0, 1, 2, REST] },
  { id: 'full', name: 'Full Body', blurb: '3 days · ideal for beginners', days: [FULL_A, FULL_B, FULL_C], schedule: [0, REST, 1, REST, 2, REST, REST] },
  { id: 'bro', name: 'Bro Split', blurb: '5 days · one muscle group per day', days: [BRO_CHEST, BRO_BACK, BRO_SHOULDERS, BRO_LEGS, BRO_ARMS], schedule: [0, 1, 2, 3, 4, REST, REST] },
  { id: 'four', name: '4-Day Split', blurb: '4 days · upper/lower emphasis', days: [UPPER, LOWER, UPPER_B, LOWER_B], schedule: [0, 1, REST, 2, 3, REST, REST] },
  { id: 'five', name: '5-Day Split', blurb: '5 days · PPL + upper/lower', days: [PUSH, PULL, LEGS, UPPER_B, LOWER_B], schedule: [0, 1, 2, REST, 3, 4, REST] },
  { id: 'six', name: '6-Day Split', blurb: '6 days · PPL twice with variations', days: [PUSH, PULL, LEGS, PUSH_B, PULL_B, LEGS_B], schedule: [0, 1, 2, 3, 4, 5, REST] },
  { id: 'custom', name: 'Fully Custom', blurb: 'Start from a blank slate', days: [], schedule: [REST, REST, REST, REST, REST, REST, REST] },
];

/** Spread n training days across the week (Mon-first), used when the user's day count differs from a template. */
export function spreadDays(nTrainingDays, nDays) {
  const patterns = {
    1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6],
  };
  const slots = patterns[Math.max(1, Math.min(7, nTrainingDays))];
  const sched = Array(7).fill(null);
  slots.forEach((wd, i) => { sched[wd] = nDays ? i % nDays : null; });
  return sched;
}

export function makeSlot(exId, sets, custom = []) {
  const ex = getExercise(exId, custom);
  return {
    uid: uid('s'), exId, sets: sets ?? 3,
    repMin: ex?.reps?.[0] ?? 8, repMax: ex?.reps?.[1] ?? 12,
    rest: ex?.rest ?? 90, rpe: 8, warmup: ex?.rank ? true : false, notes: '',
  };
}

/** Build a concrete split object from a template, swapping exercises the user can't do. */
export function buildSplitFromTemplate(tpl, { equipment, trainingDays } = {}) {
  const days = tpl.days.map((d) => ({
    id: uid('d'), name: d.name, focus: d.focus,
    slots: d.list.map(([exId, sets]) => {
      let id = exId;
      const ex = getExercise(exId);
      if (equipment && ex && !isAvailable(ex, equipment)) {
        const alt = alternativesFor(exId, equipment).find((a) => isAvailable(a, equipment));
        if (alt) id = alt.id;
      }
      return makeSlot(id, sets);
    }),
  }));
  // de-duplicate slots that collapsed to the same exercise after substitution
  for (const d of days) {
    const seen = new Set();
    d.slots = d.slots.filter((s) => (seen.has(s.exId) ? false : seen.add(s.exId)));
  }
  const tplTraining = tpl.schedule.filter((x) => x != null).length;
  const idxSched = trainingDays && tpl.days.length && trainingDays !== tplTraining
    ? spreadDays(trainingDays, tpl.days.length)
    : tpl.schedule;
  return {
    id: uid('sp'), name: tpl.name, templateId: tpl.id,
    days, schedule: idxSched.map((x) => (x == null ? null : days[x]?.id ?? null)),
  };
}
