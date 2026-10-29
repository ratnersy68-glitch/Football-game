// Exercise library.
//  needs   — equipment that must be available (see EQUIPMENT)
//  load    — 'load' (weight entered is the total), 'perHand' (weight per dumbbell / per side),
//            'bw' (body weight + added weight), 'assist' (body weight − assistance)
//  rank    — { p, f }: contributes to the Strength Rank movement pattern p; f converts this
//            exercise's estimated 1RM into a reference-lift equivalent (see engine/strength.js)
//  lower   — uses lower-body load steps for progression suggestions
//  reps    — default rep range [min, max]

export const EQUIPMENT = [
  { id: 'barbell', label: 'Barbell & plates' },
  { id: 'rack', label: 'Squat rack' },
  { id: 'bench', label: 'Bench' },
  { id: 'dumbbell', label: 'Dumbbells' },
  { id: 'machine', label: 'Machines' },
  { id: 'cable', label: 'Cable station' },
  { id: 'pullupbar', label: 'Pull-up bar' },
  { id: 'kettlebell', label: 'Kettlebells' },
  { id: 'band', label: 'Resistance bands' },
  { id: 'cardio', label: 'Cardio equipment' },
];

export const EQUIPMENT_PRESETS = {
  full: ['barbell', 'rack', 'bench', 'dumbbell', 'machine', 'cable', 'pullupbar', 'kettlebell', 'band', 'cardio'],
  home: ['barbell', 'rack', 'bench', 'dumbbell', 'pullupbar'],
  dumbbell: ['dumbbell', 'bench'],
  bodyweight: ['pullupbar'],
};

export const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'quads', 'hamstrings', 'glutes', 'calves', 'core', 'traps'];

export const PATTERNS = {
  squat: 'Squat', hinge: 'Hinge', hpush: 'Horizontal push', vpush: 'Vertical push',
  hpull: 'Horizontal pull', vpull: 'Vertical pull', lunge: 'Single-leg', iso: 'Isolation',
  core: 'Core', carry: 'Carry', cardio: 'Conditioning',
};

const E = (id, name, needs, pattern, muscles, secondary, opts = {}) => ({
  id, name, needs, pattern, muscles, secondary,
  load: opts.load || 'load',
  rank: opts.rank || null,
  lower: !!opts.lower,
  reps: opts.reps || [8, 12],
  rest: opts.rest || 90,
  cues: opts.cues || [],
  alt: opts.alt || [],
});

export const EXERCISES = [
  // ---- chest / horizontal push
  E('bench', 'Barbell Bench Press', ['barbell', 'bench'], 'hpush', ['chest'], ['triceps', 'shoulders'], {
    rank: { p: 'bench', f: 1 }, reps: [5, 8], rest: 150,
    cues: ['Eyes under the bar, feet planted, shoulder blades pinned back.', 'Lower under control to the lower chest.', 'Press up and slightly back toward the face. Use a spotter or safeties near your limit.'],
    alt: ['db_bench', 'machine_press', 'smith_bench', 'pushup'] }),
  E('incline_bench', 'Incline Barbell Press', ['barbell', 'bench'], 'hpush', ['chest'], ['shoulders', 'triceps'], {
    rank: { p: 'bench', f: 1.2 }, reps: [6, 10], rest: 120,
    cues: ['Bench at 30–45°.', 'Touch the upper chest, elbows slightly tucked.', 'Drive the bar straight up over the shoulders.'],
    alt: ['incline_db', 'bench', 'machine_press'] }),
  E('db_bench', 'Dumbbell Bench Press', ['dumbbell', 'bench'], 'hpush', ['chest'], ['triceps', 'shoulders'], {
    load: 'perHand', rank: { p: 'bench', f: 1.18 }, reps: [8, 12], rest: 120,
    cues: ['Weight entered is per dumbbell.', 'Lower until a deep stretch at the chest.', 'Press up and in without clanging the bells.'],
    alt: ['bench', 'machine_press', 'pushup'] }),
  E('incline_db', 'Incline Dumbbell Press', ['dumbbell', 'bench'], 'hpush', ['chest'], ['shoulders', 'triceps'], {
    load: 'perHand', rank: { p: 'bench', f: 1.38 }, reps: [8, 12], rest: 120,
    cues: ['Weight entered is per dumbbell.', 'Bench at 30°, slight arch, shoulders down.', 'Lower to upper chest, press up over the shoulders.'],
    alt: ['incline_bench', 'db_bench', 'machine_press'] }),
  E('machine_press', 'Machine Chest Press', ['machine'], 'hpush', ['chest'], ['triceps', 'shoulders'], {
    rank: { p: 'bench', f: 0.85 }, reps: [8, 12],
    cues: ['Handles at mid-chest height.', 'Press without locking out hard.', 'Control the return for a full stretch.'],
    alt: ['db_bench', 'bench', 'pushup'] }),
  E('smith_bench', 'Smith Machine Bench Press', ['machine', 'bench'], 'hpush', ['chest'], ['triceps', 'shoulders'], {
    rank: { p: 'bench', f: 0.95 }, reps: [6, 10],
    cues: ['Set the hooks so the bar touches lower chest.', 'Set the safety stops.', 'Press smoothly to lockout.'],
    alt: ['bench', 'machine_press'] }),
  E('pushup', 'Push-Up', [], 'hpush', ['chest'], ['triceps', 'shoulders', 'core'], {
    load: 'bw', rank: { p: 'bench', f: 0.75 * 0.64 }, reps: [8, 20], rest: 60,
    cues: ['Body in one straight line, glutes tight.', 'Chest to just above the floor.', 'Add a weight vest or plate on the back to progress (log it as added weight).'],
    alt: ['db_bench', 'machine_press', 'dip'] }),
  E('dip', 'Dip', ['pullupbar'], 'hpush', ['chest', 'triceps'], ['shoulders'], {
    load: 'bw', reps: [6, 12], rest: 120,
    cues: ['Lean slightly forward for chest, upright for triceps.', 'Lower to roughly upper arm parallel — only as deep as is comfortable for your shoulders.', 'Log a belt or vest as added weight.'],
    alt: ['pushup', 'close_grip_bench', 'pushdown'] }),
  E('cable_fly', 'Cable Fly', ['cable'], 'iso', ['chest'], ['shoulders'], {
    reps: [10, 15], rest: 60,
    cues: ['Soft elbows, fixed arm angle.', 'Squeeze the hands together in front of the chest.', 'Return slowly into the stretch.'],
    alt: ['db_fly', 'pec_deck'] }),
  E('db_fly', 'Dumbbell Fly', ['dumbbell', 'bench'], 'iso', ['chest'], [], {
    load: 'perHand', reps: [10, 15], rest: 60,
    cues: ['Weight entered is per dumbbell.', 'Open wide with slightly bent elbows.', 'Stop at a comfortable stretch.'],
    alt: ['cable_fly', 'pec_deck'] }),
  E('pec_deck', 'Pec Deck', ['machine'], 'iso', ['chest'], [], {
    reps: [10, 15], rest: 60, cues: ['Shoulders down and back.', 'Bring handles together, pause, return slowly.'], alt: ['cable_fly', 'db_fly'] }),

  // ---- shoulders / vertical push
  E('ohp', 'Overhead Press', ['barbell'], 'vpush', ['shoulders'], ['triceps', 'core'], {
    rank: { p: 'ohp', f: 1 }, reps: [5, 8], rest: 150,
    cues: ['Grip just outside shoulders, glutes and abs braced.', 'Press straight up, move the head through at the top.', 'Do not lean back excessively.'],
    alt: ['db_shoulder_press', 'machine_shoulder_press', 'arnold_press'] }),
  E('db_shoulder_press', 'Dumbbell Shoulder Press', ['dumbbell'], 'vpush', ['shoulders'], ['triceps'], {
    load: 'perHand', rank: { p: 'ohp', f: 0.95 }, reps: [8, 12], rest: 120,
    cues: ['Weight entered is per dumbbell.', 'Seated or standing, ribs down.', 'Press up until arms are straight overhead.'],
    alt: ['ohp', 'machine_shoulder_press', 'arnold_press'] }),
  E('machine_shoulder_press', 'Machine Shoulder Press', ['machine'], 'vpush', ['shoulders'], ['triceps'], {
    rank: { p: 'ohp', f: 0.85 }, reps: [8, 12],
    cues: ['Handles at shoulder height.', 'Press without shrugging.'], alt: ['db_shoulder_press', 'ohp'] }),
  E('arnold_press', 'Arnold Press', ['dumbbell'], 'vpush', ['shoulders'], ['triceps'], {
    load: 'perHand', rank: { p: 'ohp', f: 1.05 }, reps: [8, 12],
    cues: ['Weight entered is per dumbbell.', 'Start palms facing you, rotate out as you press.'], alt: ['db_shoulder_press', 'ohp'] }),
  E('lateral_raise', 'Lateral Raise', ['dumbbell'], 'iso', ['shoulders'], [], {
    load: 'perHand', reps: [12, 20], rest: 60,
    cues: ['Weight entered is per dumbbell.', 'Lead with the elbows, raise to shoulder height.', 'Slow on the way down. Light weight, strict form.'],
    alt: ['cable_lateral', 'machine_lateral'] }),
  E('cable_lateral', 'Cable Lateral Raise', ['cable'], 'iso', ['shoulders'], [], {
    reps: [12, 20], rest: 60, cues: ['Cable from the low pulley, across the body.', 'Raise to shoulder height.'], alt: ['lateral_raise'] }),
  E('machine_lateral', 'Machine Lateral Raise', ['machine'], 'iso', ['shoulders'], [], {
    reps: [12, 20], rest: 60, cues: ['Pads on the outside of the elbows.', 'Raise to shoulder height, pause briefly.'], alt: ['lateral_raise'] }),
  E('rear_delt_fly', 'Rear Delt Fly', ['dumbbell'], 'iso', ['shoulders'], ['back'], {
    load: 'perHand', reps: [12, 20], rest: 60,
    cues: ['Weight entered is per dumbbell.', 'Hinge forward, arms slightly bent.', 'Sweep out to the sides, squeeze the rear shoulders.'],
    alt: ['face_pull', 'reverse_pec_deck'] }),
  E('reverse_pec_deck', 'Reverse Pec Deck', ['machine'], 'iso', ['shoulders'], ['back'], {
    reps: [12, 20], rest: 60, cues: ['Chest on the pad.', 'Open the arms wide, pause, return slowly.'], alt: ['rear_delt_fly', 'face_pull'] }),
  E('face_pull', 'Face Pull', ['cable'], 'iso', ['shoulders'], ['back', 'traps'], {
    reps: [12, 20], rest: 60, cues: ['Rope at face height.', 'Pull toward the forehead, elbows high, rotate the hands back.'], alt: ['rear_delt_fly', 'band_pull_apart'] }),
  E('band_pull_apart', 'Band Pull-Apart', ['band'], 'iso', ['shoulders'], ['back'], {
    reps: [15, 25], rest: 45, cues: ['Arms straight, pull the band to the chest.', 'Squeeze shoulder blades together.'], alt: ['face_pull', 'rear_delt_fly'] }),
  E('shrug', 'Dumbbell Shrug', ['dumbbell'], 'iso', ['traps'], ['forearms'], {
    load: 'perHand', reps: [10, 15], rest: 60, cues: ['Weight entered is per dumbbell.', 'Shrug straight up, pause, lower fully.'], alt: ['bb_shrug'] }),
  E('bb_shrug', 'Barbell Shrug', ['barbell'], 'iso', ['traps'], ['forearms'], {
    reps: [10, 15], rest: 60, cues: ['Shrug straight up, no rolling.', 'Pause at the top.'], alt: ['shrug'] }),

  // ---- back / pulls
  E('pullup', 'Pull-Up', ['pullupbar'], 'vpull', ['back'], ['biceps', 'forearms'], {
    load: 'bw', rank: { p: 'pull', f: 0.75 }, reps: [5, 10], rest: 120,
    cues: ['Overhand grip slightly wider than shoulders.', 'Pull until the chin clears the bar, lower fully.', 'Log a belt or vest as added weight.'],
    alt: ['chinup', 'lat_pulldown', 'assisted_pullup'] }),
  E('chinup', 'Chin-Up', ['pullupbar'], 'vpull', ['back', 'biceps'], ['forearms'], {
    load: 'bw', rank: { p: 'pull', f: 0.72 }, reps: [5, 10], rest: 120,
    cues: ['Underhand shoulder-width grip.', 'Chest toward the bar, full hang at the bottom.'], alt: ['pullup', 'lat_pulldown'] }),
  E('assisted_pullup', 'Assisted Pull-Up', ['machine'], 'vpull', ['back'], ['biceps'], {
    load: 'assist', rank: { p: 'pull', f: 0.75 }, reps: [6, 12], rest: 90,
    cues: ['Weight entered is the assistance — less assistance means harder.', 'Full range from dead hang to chin over bar.'], alt: ['lat_pulldown', 'pullup'] }),
  E('lat_pulldown', 'Lat Pulldown', ['cable'], 'vpull', ['back'], ['biceps'], {
    rank: { p: 'pull', f: 0.9 }, reps: [8, 12], rest: 90,
    cues: ['Thighs locked under the pad.', 'Pull the bar to the upper chest, elbows down and back.', 'Control the bar up to a full stretch.'],
    alt: ['pullup', 'assisted_pullup', 'band_pulldown'] }),
  E('band_pulldown', 'Band Lat Pulldown', ['band'], 'vpull', ['back'], ['biceps'], {
    reps: [12, 20], rest: 60, cues: ['Anchor the band high.', 'Pull elbows down to your sides.'], alt: ['lat_pulldown', 'pullup'] }),
  E('bb_row', 'Barbell Row', ['barbell'], 'hpull', ['back'], ['biceps', 'shoulders'], {
    rank: { p: 'pull', f: 1 }, reps: [6, 10], rest: 120,
    cues: ['Hinge to ~45°, neutral spine.', 'Row to the lower ribs.', 'No heaving — if the torso moves a lot, the weight is too heavy.'],
    alt: ['db_row', 'cable_row', 'tbar_row'] }),
  E('db_row', 'One-Arm Dumbbell Row', ['dumbbell', 'bench'], 'hpull', ['back'], ['biceps'], {
    load: 'perHand', rank: { p: 'pull', f: 0.85 }, reps: [8, 12], rest: 90,
    cues: ['Weight entered is the dumbbell (one side).', 'Hand and knee on the bench, flat back.', 'Pull the elbow toward the hip.'],
    alt: ['bb_row', 'cable_row'] }),
  E('cable_row', 'Seated Cable Row', ['cable'], 'hpull', ['back'], ['biceps'], {
    rank: { p: 'pull', f: 0.85 }, reps: [8, 12], rest: 90,
    cues: ['Tall chest, slight knee bend.', 'Pull the handle to the stomach, squeeze the shoulder blades.', 'Let the shoulders reach forward on the return.'],
    alt: ['db_row', 'bb_row', 'machine_row'] }),
  E('machine_row', 'Chest-Supported Machine Row', ['machine'], 'hpull', ['back'], ['biceps'], {
    rank: { p: 'pull', f: 0.85 }, reps: [8, 12], rest: 90, cues: ['Chest on the pad.', 'Row to the ribs, pause, return slowly.'], alt: ['cable_row', 'db_row'] }),
  E('tbar_row', 'T-Bar Row', ['barbell'], 'hpull', ['back'], ['biceps'], {
    rank: { p: 'pull', f: 0.95 }, reps: [6, 10], rest: 120, cues: ['Hinge with a flat back.', 'Pull the handle to the chest.'], alt: ['bb_row', 'cable_row'] }),
  E('inverted_row', 'Inverted Row', ['rack'], 'hpull', ['back'], ['biceps'], {
    load: 'bw', reps: [8, 15], rest: 90, cues: ['Bar at waist height, body straight.', 'Pull chest to the bar.'], alt: ['db_row', 'cable_row'] }),

  // ---- arms
  E('db_curl', 'Dumbbell Curl', ['dumbbell'], 'iso', ['biceps'], ['forearms'], {
    load: 'perHand', reps: [8, 12], rest: 60, cues: ['Weight entered is per dumbbell.', 'Elbows pinned at your sides.', 'Lower slowly, no swinging.'], alt: ['bb_curl', 'cable_curl', 'hammer_curl'] }),
  E('hammer_curl', 'Hammer Curl', ['dumbbell'], 'iso', ['biceps', 'forearms'], [], {
    load: 'perHand', reps: [8, 12], rest: 60, cues: ['Weight entered is per dumbbell.', 'Neutral grip, thumbs up.', 'Curl without moving the elbows.'], alt: ['db_curl', 'cable_curl'] }),
  E('bb_curl', 'Barbell Curl', ['barbell'], 'iso', ['biceps'], ['forearms'], {
    reps: [8, 12], rest: 60, cues: ['Shoulder-width grip.', 'Curl without leaning back.'], alt: ['db_curl', 'cable_curl'] }),
  E('cable_curl', 'Cable Curl', ['cable'], 'iso', ['biceps'], [], {
    reps: [10, 15], rest: 60, cues: ['Low pulley, elbows still.', 'Squeeze at the top.'], alt: ['db_curl', 'band_curl'] }),
  E('preacher_curl', 'Preacher Curl', ['machine'], 'iso', ['biceps'], [], {
    reps: [8, 12], rest: 60, cues: ['Armpits on the pad.', 'Lower to almost straight, under control.'], alt: ['db_curl', 'cable_curl'] }),
  E('band_curl', 'Band Curl', ['band'], 'iso', ['biceps'], [], {
    reps: [12, 20], rest: 45, cues: ['Stand on the band, curl with elbows still.'], alt: ['db_curl'] }),
  E('pushdown', 'Triceps Pushdown', ['cable'], 'iso', ['triceps'], [], {
    reps: [10, 15], rest: 60, cues: ['Elbows pinned to your sides.', 'Push down to full extension, control up.'], alt: ['overhead_ext', 'skull_crusher', 'dip'] }),
  E('overhead_ext', 'Overhead Triceps Extension', ['dumbbell'], 'iso', ['triceps'], [], {
    reps: [10, 15], rest: 60, cues: ['One dumbbell held with both hands.', 'Lower behind the head, extend fully.'], alt: ['pushdown', 'skull_crusher'] }),
  E('skull_crusher', 'Skull Crusher', ['barbell', 'bench'], 'iso', ['triceps'], [], {
    reps: [8, 12], rest: 60, cues: ['EZ bar or barbell, lower toward the forehead.', 'Keep elbows pointing up.'], alt: ['overhead_ext', 'pushdown'] }),
  E('close_grip_bench', 'Close-Grip Bench Press', ['barbell', 'bench'], 'hpush', ['triceps'], ['chest', 'shoulders'], {
    rank: { p: 'bench', f: 1.1 }, reps: [6, 10], rest: 120, cues: ['Hands shoulder-width.', 'Elbows tucked, touch the lower chest.'], alt: ['dip', 'pushdown'] }),
  E('band_pushdown', 'Band Pushdown', ['band'], 'iso', ['triceps'], [], {
    reps: [12, 20], rest: 45, cues: ['Anchor the band high, elbows pinned.'], alt: ['pushdown'] }),
  E('wrist_curl', 'Wrist Curl', ['dumbbell'], 'iso', ['forearms'], [], {
    load: 'perHand', reps: [12, 20], rest: 45, cues: ['Forearms on thighs, curl the wrist only.'], alt: ['farmer_carry'] }),

  // ---- legs
  E('squat', 'Barbell Back Squat', ['barbell', 'rack'], 'squat', ['quads', 'glutes'], ['hamstrings', 'core'], {
    rank: { p: 'squat', f: 1 }, reps: [5, 8], rest: 180, lower: true,
    cues: ['Bar on the upper back, brace before each rep.', 'Sit down between the hips to at least parallel if mobility allows.', 'Drive up with the chest and hips together. Set the safety pins.'],
    alt: ['front_squat', 'hack_squat', 'leg_press', 'goblet_squat'] }),
  E('front_squat', 'Front Squat', ['barbell', 'rack'], 'squat', ['quads'], ['glutes', 'core'], {
    rank: { p: 'squat', f: 1.18 }, reps: [5, 8], rest: 180, lower: true,
    cues: ['Bar on the front shoulders, elbows high.', 'Stay upright, sit straight down.'], alt: ['squat', 'goblet_squat', 'hack_squat'] }),
  E('goblet_squat', 'Goblet Squat', ['dumbbell'], 'squat', ['quads', 'glutes'], ['core'], {
    reps: [8, 15], rest: 90, lower: true,
    cues: ['Hold one dumbbell at the chest.', 'Elbows inside the knees at the bottom.', 'Great for learning squat technique.'], alt: ['squat', 'leg_press', 'bodyweight_squat'] }),
  E('hack_squat', 'Hack Squat', ['machine'], 'squat', ['quads'], ['glutes'], {
    rank: { p: 'squat', f: 0.7 }, reps: [8, 12], rest: 150, lower: true, cues: ['Back flat on the pad.', 'Lower deep under control, drive through mid-foot.'], alt: ['leg_press', 'squat'] }),
  E('leg_press', 'Leg Press', ['machine'], 'squat', ['quads', 'glutes'], ['hamstrings'], {
    rank: { p: 'squat', f: 0.5 }, reps: [8, 15], rest: 150, lower: true,
    cues: ['Feet shoulder-width on the platform.', 'Lower until hips are about to tuck, then press.', 'Do not lock the knees hard at the top.'], alt: ['hack_squat', 'squat', 'goblet_squat'] }),
  E('smith_squat', 'Smith Machine Squat', ['machine'], 'squat', ['quads', 'glutes'], [], {
    rank: { p: 'squat', f: 0.9 }, reps: [6, 10], rest: 150, lower: true, cues: ['Feet slightly forward of the bar.', 'Set the safety stops.'], alt: ['squat', 'leg_press'] }),
  E('bodyweight_squat', 'Bodyweight Squat', [], 'squat', ['quads', 'glutes'], [], {
    load: 'bw', reps: [12, 25], rest: 60, lower: true, cues: ['Arms forward for balance.', 'Sit down and stand up with control.'], alt: ['goblet_squat', 'split_squat'] }),
  E('split_squat', 'Bulgarian Split Squat', ['dumbbell', 'bench'], 'lunge', ['quads', 'glutes'], ['hamstrings'], {
    load: 'perHand', reps: [8, 12], rest: 90, lower: true, cues: ['Weight entered is per dumbbell.', 'Rear foot on the bench, front shin fairly vertical.', 'Lower straight down. Log reps per leg.'], alt: ['lunge', 'step_up'] }),
  E('lunge', 'Walking Lunge', ['dumbbell'], 'lunge', ['quads', 'glutes'], ['hamstrings'], {
    load: 'perHand', reps: [8, 12], rest: 90, lower: true, cues: ['Weight entered is per dumbbell.', 'Long steps, back knee toward the floor. Log reps per leg.'], alt: ['split_squat', 'step_up'] }),
  E('step_up', 'Step-Up', ['dumbbell', 'bench'], 'lunge', ['quads', 'glutes'], [], {
    load: 'perHand', reps: [8, 12], rest: 90, lower: true, cues: ['Weight entered is per dumbbell.', 'Drive through the top foot, no push from the bottom leg.'], alt: ['lunge', 'split_squat'] }),
  E('leg_ext', 'Leg Extension', ['machine'], 'iso', ['quads'], [], {
    reps: [10, 15], rest: 60, lower: true, cues: ['Knee in line with the machine pivot.', 'Extend fully, lower slowly.'], alt: ['split_squat', 'goblet_squat'] }),
  E('deadlift', 'Deadlift', ['barbell'], 'hinge', ['hamstrings', 'glutes', 'back'], ['traps', 'forearms', 'core'], {
    rank: { p: 'deadlift', f: 1 }, reps: [3, 6], rest: 180, lower: true,
    cues: ['Bar over mid-foot, shins touch the bar.', 'Brace and pull the slack out before lifting.', 'Push the floor away, keep the bar close, lock out with the glutes.'],
    alt: ['trap_bar_dl', 'rdl', 'sumo_dl'] }),
  E('sumo_dl', 'Sumo Deadlift', ['barbell'], 'hinge', ['glutes', 'hamstrings', 'quads'], ['back'], {
    rank: { p: 'deadlift', f: 1 }, reps: [3, 6], rest: 180, lower: true, cues: ['Wide stance, toes out, hands inside the knees.', 'Spread the floor and stand up tall.'], alt: ['deadlift', 'trap_bar_dl'] }),
  E('trap_bar_dl', 'Trap Bar Deadlift', ['barbell'], 'hinge', ['quads', 'glutes', 'hamstrings'], ['back', 'traps'], {
    rank: { p: 'deadlift', f: 0.95 }, reps: [4, 8], rest: 180, lower: true, cues: ['Stand centered in the bar.', 'Brace, push the floor away, stand tall.'], alt: ['deadlift', 'rdl'] }),
  E('rdl', 'Romanian Deadlift', ['barbell'], 'hinge', ['hamstrings', 'glutes'], ['back'], {
    rank: { p: 'deadlift', f: 1.28 }, reps: [6, 10], rest: 120, lower: true,
    cues: ['Soft knees, push the hips back.', 'Lower until you feel a strong hamstring stretch — back stays flat.', 'Squeeze the glutes to stand.'], alt: ['db_rdl', 'deadlift', 'leg_curl'] }),
  E('db_rdl', 'Dumbbell Romanian Deadlift', ['dumbbell'], 'hinge', ['hamstrings', 'glutes'], ['back'], {
    load: 'perHand', rank: { p: 'deadlift', f: 1.3 }, reps: [8, 12], rest: 90, lower: true,
    cues: ['Weight entered is per dumbbell.', 'Dumbbells slide down the thighs as the hips go back.'], alt: ['rdl', 'kb_swing'] }),
  E('hip_thrust', 'Barbell Hip Thrust', ['barbell', 'bench'], 'hinge', ['glutes'], ['hamstrings'], {
    reps: [8, 12], rest: 120, lower: true, cues: ['Upper back on the bench, bar over the hips (use a pad).', 'Drive up until hips are level, chin tucked.'], alt: ['glute_bridge', 'rdl'] }),
  E('glute_bridge', 'Glute Bridge', [], 'hinge', ['glutes'], ['hamstrings'], {
    load: 'bw', reps: [12, 20], rest: 60, lower: true, cues: ['Feet flat, drive hips up, squeeze.', 'Add a dumbbell on the hips as added weight.'], alt: ['hip_thrust'] }),
  E('leg_curl', 'Lying Leg Curl', ['machine'], 'iso', ['hamstrings'], [], {
    reps: [10, 15], rest: 60, lower: true, cues: ['Hips pressed into the pad.', 'Curl fully, lower slowly.'], alt: ['seated_leg_curl', 'rdl', 'nordic'] }),
  E('seated_leg_curl', 'Seated Leg Curl', ['machine'], 'iso', ['hamstrings'], [], {
    reps: [10, 15], rest: 60, lower: true, cues: ['Lap pad snug.', 'Curl down, pause, return slowly.'], alt: ['leg_curl', 'rdl'] }),
  E('nordic', 'Nordic Hamstring Curl', [], 'iso', ['hamstrings'], [], {
    load: 'bw', reps: [3, 8], rest: 120, lower: true, cues: ['Anchor the ankles.', 'Lower as slowly as you can, push back up with the hands.'], alt: ['leg_curl'] }),
  E('kb_swing', 'Kettlebell Swing', ['kettlebell'], 'hinge', ['glutes', 'hamstrings'], ['core', 'back'], {
    reps: [12, 20], rest: 60, lower: true, cues: ['Hike the bell back, snap the hips forward.', 'Arms are ropes — the hips do the work.'], alt: ['db_rdl', 'hip_thrust'] }),
  E('calf_raise', 'Standing Calf Raise', ['machine'], 'iso', ['calves'], [], {
    reps: [10, 15], rest: 60, lower: true, cues: ['Full stretch at the bottom, pause.', 'Rise as high as possible.'], alt: ['db_calf_raise', 'seated_calf'] }),
  E('seated_calf', 'Seated Calf Raise', ['machine'], 'iso', ['calves'], [], {
    reps: [12, 20], rest: 60, lower: true, cues: ['Pause at the bottom stretch.'], alt: ['calf_raise'] }),
  E('db_calf_raise', 'Dumbbell Calf Raise', ['dumbbell'], 'iso', ['calves'], [], {
    load: 'perHand', reps: [12, 20], rest: 60, lower: true, cues: ['Weight entered is per dumbbell.', 'Stand on a step for full range.'], alt: ['calf_raise'] }),

  // ---- core / carry / conditioning
  E('plank', 'Plank', [], 'core', ['core'], [], {
    load: 'bw', reps: [30, 60], rest: 60, cues: ['Log seconds as reps.', 'Squeeze glutes, ribs down, breathe.'], alt: ['dead_bug', 'ab_wheel'] }),
  E('hanging_leg_raise', 'Hanging Leg Raise', ['pullupbar'], 'core', ['core'], [], {
    load: 'bw', reps: [8, 15], rest: 60, cues: ['Avoid swinging.', 'Curl the pelvis up, not just the legs.'], alt: ['cable_crunch', 'dead_bug'] }),
  E('cable_crunch', 'Cable Crunch', ['cable'], 'core', ['core'], [], {
    reps: [10, 15], rest: 60, cues: ['Kneel, rope by the head.', 'Crunch the ribs toward the hips.'], alt: ['hanging_leg_raise', 'ab_wheel'] }),
  E('ab_wheel', 'Ab Wheel Rollout', [], 'core', ['core'], ['back'], {
    load: 'bw', reps: [6, 12], rest: 60, cues: ['Ribs down, roll out only as far as you can keep a flat back.'], alt: ['plank', 'dead_bug'] }),
  E('dead_bug', 'Dead Bug', [], 'core', ['core'], [], {
    load: 'bw', reps: [8, 12], rest: 45, cues: ['Low back pressed into the floor.', 'Extend opposite arm and leg slowly.'], alt: ['plank'] }),
  E('pallof', 'Pallof Press', ['cable'], 'core', ['core'], [], {
    reps: [10, 12], rest: 45, cues: ['Stand side-on to the cable.', 'Press out and resist rotation.'], alt: ['plank'] }),
  E('farmer_carry', "Farmer's Carry", ['dumbbell'], 'carry', ['forearms', 'traps', 'core'], [], {
    load: 'perHand', reps: [20, 40], rest: 90, cues: ['Weight entered is per hand. Log metres or steps as reps.', 'Tall posture, short quick steps.'], alt: ['shrug'] }),
  E('rower', 'Rowing Machine', ['cardio'], 'cardio', ['back', 'quads'], ['core'], {
    load: 'bw', reps: [5, 20], rest: 60, cues: ['Log minutes as reps.', 'Legs, then hips, then arms.'], alt: ['bike', 'treadmill'] }),
  E('bike', 'Stationary Bike', ['cardio'], 'cardio', ['quads'], ['calves'], {
    load: 'bw', reps: [10, 30], rest: 60, cues: ['Log minutes as reps.'], alt: ['rower', 'treadmill'] }),
  E('treadmill', 'Treadmill', ['cardio'], 'cardio', ['quads', 'calves'], [], {
    load: 'bw', reps: [10, 30], rest: 60, cues: ['Log minutes as reps.'], alt: ['bike', 'rower'] }),
];

const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

/** Look up a built-in or custom exercise. */
export function getExercise(id, custom = []) {
  return BY_ID.get(id) || custom.find((c) => c.id === id) || null;
}

export function allExercises(custom = []) {
  return [...EXERCISES, ...custom];
}

export function isAvailable(ex, equipment) {
  return (ex.needs || []).every((n) => equipment.includes(n));
}

/** Alternatives for a swap: listed alternatives first, then same-pattern / same-muscle exercises. */
export function alternativesFor(id, equipment, custom = []) {
  const ex = getExercise(id, custom);
  if (!ex) return [];
  const listed = (ex.alt || []).map((a) => getExercise(a, custom)).filter(Boolean);
  const similar = allExercises(custom).filter((e) => e.id !== id && !ex.alt.includes(e.id)
    && e.pattern === ex.pattern && e.muscles.some((m) => ex.muscles.includes(m)));
  const out = [...listed, ...similar];
  return out.sort((a, b) => Number(isAvailable(b, equipment)) - Number(isAvailable(a, equipment)));
}
