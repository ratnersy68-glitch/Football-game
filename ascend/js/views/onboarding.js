import { app, register, renderNow, update, go, toast } from '../app.js';
import { icon } from '../ui/icons.js';
import { option } from '../ui/components.js';
import { emblem } from '../ui/emblems.js';
import { haptic } from '../ui/feedback.js';
import { TEMPLATES, buildSplitFromTemplate, spreadDays } from '../data/templates.js';
import { EQUIPMENT, EQUIPMENT_PRESETS } from '../data/exercises.js';
import { GOAL_CATEGORIES, captureBaseline } from '../engine/goals.js';
import { esc, toKg, fromKg, uid } from '../util.js';

const EXPERIENCE = [
  { id: 'new', label: 'Brand new', sub: 'Never trained consistently' },
  { id: 'beginner', label: 'Beginner', sub: 'Under 1 year of regular lifting' },
  { id: 'intermediate', label: 'Intermediate', sub: '1–3 years, steady progress' },
  { id: 'advanced', label: 'Advanced', sub: '3+ years, progress comes slowly' },
];

const TARGET_LIFTS = [
  { id: 'bench', label: 'Bench press' }, { id: 'squat', label: 'Squat' }, { id: 'deadlift', label: 'Deadlift' },
  { id: 'ohp', label: 'Overhead press' }, { id: 'pullup', label: 'Pull-ups (reps)', reps: true },
];

const STEPS = ['welcome', 'name', 'age', 'unit', 'height', 'weight', 'experience', 'days', 'equipment', 'split', 'goal', 'target', 'standards', 'done'];

function ob() {
  if (!app.ui.ob) {
    app.ui.ob = { step: 0, dir: 1, d: { name: '', age: '', unit: 'lb', heightCm: null, hFt: '', hIn: '', hCm: '', weight: '', experience: '', days: 4, equipPreset: 'full', equipment: [...EQUIPMENT_PRESETS.full], template: '', customDays: 4, goal: '', secondary: [], tType: '', tLift: 'bench', tValue: '', tTitle: '', tDate: '', sex: '' } };
  }
  return app.ui.ob;
}

const isYouth = (d) => Number(d.age) > 0 && Number(d.age) < 18;
const steps = () => STEPS.filter((s) => !(s === 'standards' && isYouth(ob().d)));

function valid(step, d) {
  switch (step) {
    case 'age': { const a = Number(d.age); return a >= 13 && a <= 100 ? null : (d.age && a < 13 ? 'ASCEND is designed for ages 13 and up.' : 'Enter an age between 13 and 100.'); }
    case 'height': {
      const cm = d.unit === 'lb' ? (Number(d.hFt) * 12 + Number(d.hIn || 0)) * 2.54 : Number(d.hCm);
      return cm >= 120 && cm <= 230 ? null : 'Enter a realistic height.';
    }
    case 'weight': { const kg = toKg(Number(d.weight), d.unit); return kg >= 30 && kg <= 300 ? null : 'Enter a realistic body weight.'; }
    case 'experience': return d.experience ? null : 'Choose one.';
    case 'split': return d.template ? null : 'Pick a split, or Fully Custom.';
    case 'goal': return d.goal ? null : 'Choose your main goal.';
    case 'target': {
      if (!d.tType || d.tType === 'skip') return null;
      if (d.tType === 'custom') return d.tTitle.trim() ? null : 'Describe your goal.';
      const v = Number(d.tValue);
      if (d.tType === 'reps') return v >= 1 && v <= 100 ? null : 'Enter a rep target.';
      if (d.tType === 'consistency') return v >= 1 && v <= 52 ? null : 'Enter a number of weeks (1–52).';
      return v > 0 && toKg(v, d.unit) < 500 ? null : 'Enter a target weight.';
    }
    default: return null;
  }
}

function header(title, sub = '') {
  return `<div class="eyebrow">${esc(sub)}</div><h1 class="ob-q">${title}</h1>`;
}

function stepBody(step, d) {
  const u = d.unit === 'lb' ? 'lbs' : 'kg';
  switch (step) {
    case 'name': return `${header('What should we call you?', 'Profile')}
      <p class="muted">Optional. Stored only on this device.</p>
      <div class="field mt-24"><input id="ob-name" class="input" data-input="ob-field" data-k="name" value="${esc(d.name)}" placeholder="Your name" autocomplete="given-name" maxlength="40" data-enter="ob-next"></div>`;
    case 'age': return `${header('How old are you?', 'About you')}
      <p class="muted">Used to keep coaching age-appropriate. Under 18, ASCEND ranks personal development and technique instead of adult strength standards.</p>
      <div class="big-input-wrap"><input id="ob-age" class="big-input" inputmode="numeric" data-input="ob-field" data-k="age" value="${esc(d.age)}" placeholder="—" maxlength="3" data-enter="ob-next"><span>years</span></div>`;
    case 'unit': return `${header('Preferred weight unit', 'Units')}
      <div class="col mt-24">${option('Pounds', 'lbs · feet & inches', d.unit === 'lb', 'ob-set', 'data-k="unit" data-v="lb"')}${option('Kilograms', 'kg · centimetres', d.unit === 'kg', 'ob-set', 'data-k="unit" data-v="kg"')}</div>
      <p class="small faint mt-16">You can switch any time in Profile. All history converts automatically.</p>`;
    case 'height': return `${header('How tall are you?', 'About you')}
      ${d.unit === 'lb'
        ? `<div class="row mt-24" style="justify-content:center;gap:18px"><div class="big-input-wrap" style="width:130px"><input id="ob-hft" class="big-input" inputmode="numeric" data-input="ob-field" data-k="hFt" value="${esc(d.hFt)}" placeholder="5" maxlength="1"><span>ft</span></div><div class="big-input-wrap" style="width:130px"><input class="big-input" inputmode="numeric" data-input="ob-field" data-k="hIn" value="${esc(d.hIn)}" placeholder="10" maxlength="2" data-enter="ob-next"><span>in</span></div></div>`
        : `<div class="big-input-wrap"><input id="ob-hcm" class="big-input" inputmode="numeric" data-input="ob-field" data-k="hCm" value="${esc(d.hCm)}" placeholder="178" maxlength="3" data-enter="ob-next"><span>cm</span></div>`}`;
    case 'weight': return `${header('Current body weight', 'About you')}
      <p class="muted">Strength is measured relative to body weight. Update it any time.</p>
      <div class="big-input-wrap"><input id="ob-weight" class="big-input" inputmode="decimal" data-input="ob-field" data-k="weight" value="${esc(d.weight)}" placeholder="—" maxlength="5" data-enter="ob-next"><span>${u}</span></div>`;
    case 'experience': return `${header('Training experience', 'Background')}
      <div class="col mt-24">${EXPERIENCE.map((e) => option(e.label, e.sub, d.experience === e.id, 'ob-set', `data-k="experience" data-v="${e.id}"`)).join('')}</div>`;
    case 'days': return `${header('How many days can you train each week?', 'Schedule')}
      <p class="muted">Be realistic — consistency beats ambition. ASCEND never rewards training beyond your plan.</p>
      <div class="row mt-32" style="justify-content:center"><div class="stepper"><button class="icon-btn" data-action="ob-days" data-delta="-1" aria-label="Fewer days">${icon('minus')}</button>
      <div class="val num" style="font-size:64px;min-width:110px">${d.days}</div><button class="icon-btn" data-action="ob-days" data-delta="1" aria-label="More days">${icon('plus')}</button></div></div>
      <p class="center faint mt-8">days per week</p>`;
    case 'equipment': return `${header('What equipment do you have?', 'Equipment')}
      <div class="chips mt-16">${[['full', 'Full gym'], ['home', 'Home gym'], ['dumbbell', 'Dumbbells only'], ['bodyweight', 'Body weight']].map(([k, l]) => `<button class="chip ${d.equipPreset === k ? 'on' : ''}" data-action="ob-equip-preset" data-v="${k}">${l}</button>`).join('')}</div>
      <div class="col mt-16">${EQUIPMENT.map((e) => option(e.label, '', d.equipment.includes(e.id), 'ob-equip', `data-v="${e.id}"`)).join('')}</div>`;
    case 'split': return `${header('Your current workout split', 'Training')}
      <p class="muted">A starting point only — rename days, move exercises and change the schedule any time. Exercises you can't do with your equipment are swapped automatically.</p>
      <div class="col mt-16">${TEMPLATES.map((t) => option(t.name, t.blurb, d.template === t.id, 'ob-set', `data-k="template" data-v="${t.id}"`)).join('')}</div>
      ${d.template === 'custom' ? `<div class="card flat mt-16"><div class="label">Number of training days to create</div><div class="row mt-8"><div class="stepper"><button class="icon-btn" data-action="ob-cdays" data-delta="-1">${icon('minus')}</button><div class="val">${d.customDays}</div><button class="icon-btn" data-action="ob-cdays" data-delta="1">${icon('plus')}</button></div></div><p class="small faint mt-8">You'll add exercises in the split builder.</p></div>` : ''}`;
    case 'goal': return `${header('What\'s your main goal?', 'Mission')}
      <div class="col mt-16">${GOAL_CATEGORIES.map((g) => option(g.label, g.blurb, d.goal === g.id, 'ob-set', `data-k="goal" data-v="${g.id}"`)).join('')}</div>
      ${d.goal ? `<div class="label mt-24">Secondary goals <span class="faint">(optional)</span></div><div class="chips mt-8">${GOAL_CATEGORIES.filter((g) => g.id !== d.goal && g.id !== 'custom').map((g) => `<button class="chip sm ${d.secondary.includes(g.id) ? 'on' : ''}" data-action="ob-secondary" data-v="${g.id}">${g.label}</button>`).join('')}</div>` : ''}`;
    case 'target': return targetStep(d);
    case 'standards': return `${header('Strength standards context', 'Ranking')}
      <p class="muted">Strength standards differ on average between male and female lifters. This only selects which comparison bands the rank uses — it's never shown elsewhere.</p>
      <div class="col mt-16">${option('Male standards', '', d.sex === 'male', 'ob-set', 'data-k="sex" data-v="male"')}${option('Female standards', '', d.sex === 'female', 'ob-set', 'data-k="sex" data-v="female"')}${option('Prefer not to say', 'Uses blended standards', d.sex === 'neutral' || !d.sex, 'ob-set', 'data-k="sex" data-v="neutral"')}</div>`;
    case 'done': return `<div class="center" style="padding-top:24px">${emblem(0, { glow: true, float: true, cls: '' }).replace('emblem-wrap', 'emblem-wrap" style="width:150px;height:150px;margin:0 auto')}
      <h1 class="ob-q mt-24">Your climb starts now.</h1>
      <p class="muted">Complete <b>3 placement workouts</b> to earn your first ${isYouth(d) ? 'development' : 'strength'} rank.</p></div>
      <div class="card flat mt-24 stack">
        <div class="row between"><span class="muted">Plan</span><b>${esc(TEMPLATES.find((t) => t.id === d.template)?.name || '')} · ${d.days} days/week</b></div>
        <div class="row between"><span class="muted">Main goal</span><b>${esc(GOAL_CATEGORIES.find((g) => g.id === d.goal)?.label || '')}</b></div>
        ${d.tType && d.tType !== 'skip' ? `<div class="row between"><span class="muted">Mission</span><b>${esc(targetLabel(d))}</b></div>` : ''}
      </div>
      ${isYouth(d) ? `<div class="banner info mt-16">${icon('shield')}<span>Because you're under 18, the coach focuses on technique, recovery and steady progress — no max-effort lifts or aggressive cutting.</span></div>` : ''}`;
    default: return '';
  }
}

function targetLabel(d) {
  const u = d.unit === 'lb' ? 'lbs' : 'kg';
  const lift = TARGET_LIFTS.find((l) => l.id === d.tLift);
  switch (d.tType) {
    case 'strength': return `${lift.label} ${d.tValue} ${u}`;
    case 'reps': return `${d.tValue} pull-ups`;
    case 'bodyweight': return `Body weight ${d.tValue} ${u}`;
    case 'consistency': return `${d.days}×/week for ${d.tValue} weeks`;
    case 'custom': return d.tTitle;
    default: return '';
  }
}

function targetStep(d) {
  const u = d.unit === 'lb' ? 'lbs' : 'kg';
  const types = [
    ['strength', 'Lift a target weight', 'e.g. Bench press 225 lbs'],
    ['reps', 'Hit a rep target', 'e.g. 15 strict pull-ups'],
    ['bodyweight', 'Reach a body weight', isYouth(d) ? 'Shown as a trend only' : 'e.g. Gain 10 lbs of muscle'],
    ['consistency', 'Train consistently', `e.g. ${d.days} days/week for 8 weeks`],
    ['custom', 'Something else', 'Track progress manually'],
    ['skip', 'Set this later', ''],
  ].filter(([id]) => !(isYouth(d) && id === 'bodyweight' && d.goal === 'fatloss'));
  let detail = '';
  if (d.tType === 'strength') {
    detail = `<div class="chips mt-16">${TARGET_LIFTS.filter((l) => !l.reps).map((l) => `<button class="chip ${d.tLift === l.id ? 'on' : ''}" data-action="ob-set" data-k="tLift" data-v="${l.id}">${l.label}</button>`).join('')}</div>
      <div class="big-input-wrap"><input id="ob-tval" class="big-input" inputmode="decimal" data-input="ob-field" data-k="tValue" value="${esc(d.tValue)}" placeholder="225" maxlength="5"><span>${u}</span></div>
      <p class="small faint center">Target one-rep max, estimated from your working sets — no max testing needed.</p>`;
  } else if (d.tType === 'reps') {
    detail = `<div class="big-input-wrap"><input id="ob-tval" class="big-input" inputmode="numeric" data-input="ob-field" data-k="tValue" value="${esc(d.tValue)}" placeholder="15" maxlength="3"><span>pull-ups</span></div>`;
  } else if (d.tType === 'bodyweight') {
    detail = `<div class="big-input-wrap"><input id="ob-tval" class="big-input" inputmode="decimal" data-input="ob-field" data-k="tValue" value="${esc(d.tValue)}" placeholder="${esc(d.weight || '')}" maxlength="5"><span>${u}</span></div><p class="small faint center">Aim for gradual change — roughly 0.25–1% of body weight per week.</p>`;
  } else if (d.tType === 'consistency') {
    detail = `<div class="big-input-wrap"><input id="ob-tval" class="big-input" inputmode="numeric" data-input="ob-field" data-k="tValue" value="${esc(d.tValue)}" placeholder="8" maxlength="2"><span>weeks</span></div>`;
  } else if (d.tType === 'custom') {
    detail = `<div class="field mt-16"><input id="ob-ttitle" class="input" data-input="ob-field" data-k="tTitle" value="${esc(d.tTitle)}" placeholder="e.g. Improve pull-up form" maxlength="60"></div>`;
  }
  return `${header('Define your mission', 'Goal')}
    <div class="col mt-16">${types.map(([id, l, s]) => option(l, s, d.tType === id, 'ob-set', `data-k="tType" data-v="${id}"`)).join('')}</div>
    ${detail}
    ${d.tType && d.tType !== 'skip' ? `<div class="field mt-16"><label for="ob-tdate">Target date <span class="faint">(optional)</span></label><input id="ob-tdate" type="date" class="input" data-input="ob-field" data-k="tDate" value="${esc(d.tDate)}"></div><p class="small faint mt-8">A date keeps you focused, but the coach will never promise you'll hit a strength target by a specific day.</p>` : ''}`;
}

function render() {
  const o = ob();
  const list = steps();
  const step = list[Math.min(o.step, list.length - 1)];
  if (step === 'welcome') {
    return `<div class="welcome marble">
      <div class="beam"></div>
      <div class="brand" style="color:#20252B">PRIVATE TRAINING</div>
      <div><h1 class="logo">ASCEND</h1><div class="tag-line">EARN YOUR RANK.</div>
        <p style="margin-top:22px;max-width:380px;color:#3a4048">Track every set. Follow an honest coach. Climb ten ranks earned only by real, recorded strength.</p></div>
      <div class="col" style="max-width:420px;width:100%">
        <button class="btn primary hero block" data-action="ob-next"><span class="glint"></span>Begin</button>
        <button class="btn ghost block" data-action="ob-restore" style="background:rgba(255,255,255,.6)">${icon('upload', 'sm')} Restore from backup</button>
        <input type="file" id="ob-file" accept="application/json,.json" class="hide" data-change="ob-file">
      </div>
    </div>`;
  }
  const err = o.err;
  const isLast = step === 'done';
  return `<div class="ob">
    <div class="row between" style="margin-bottom:14px"><button class="back" data-action="ob-back">${icon('back')} Back</button><span class="brand">ASCEND</span><span style="width:60px"></span></div>
    <div class="ob-progress">${list.slice(1).map((_, i) => `<i class="${i < o.step ? 'on' : ''}"></i>`).join('')}</div>
    <div class="ob-body ${o.dir < 0 ? 'back' : ''}">${stepBody(step, o.d)}
      ${err ? `<p class="small mt-16" style="color:var(--danger)" role="alert">${esc(err)}</p>` : ''}</div>
    <div class="ob-actions">
      ${['name', 'target'].includes(step) ? `<button class="btn ghost" data-action="ob-skip">Skip</button>` : ''}
      <button class="btn primary block grow ${isLast ? 'hero' : ''}" data-action="${isLast ? 'ob-finish' : 'ob-next'}">${isLast ? '<span class="glint"></span>Enter ASCEND' : 'Continue'}</button>
    </div>
  </div>`;
}

function focusFirst() {
  const el = document.querySelector('.ob-body input:not([type=date])');
  if (el && !('ontouchstart' in window)) el.focus();
}

function move(delta) {
  const o = ob();
  const list = steps();
  const step = list[o.step];
  if (delta > 0) {
    const e = valid(step, o.d);
    if (e) { o.err = e; haptic('warn'); renderNow(); return; }
  }
  o.err = null;
  o.dir = delta;
  o.step = Math.max(0, Math.min(list.length - 1, o.step + delta));
  haptic('tap');
  renderNow();
  window.scrollTo(0, 0);
  setTimeout(focusFirst, 60);
}

function finish() {
  const d = ob().d;
  const unit = d.unit;
  const heightCm = unit === 'lb' ? (Number(d.hFt) * 12 + Number(d.hIn || 0)) * 2.54 : Number(d.hCm);
  const bw = toKg(Number(d.weight), unit);
  const now = new Date();
  update((st) => {
    st.profile = {
      id: uid('p'), name: d.name.trim(), age: Number(d.age), heightCm: Math.round(heightCm), bodyweightKg: bw, unit,
      experience: d.experience, trainingDays: d.days, equipment: d.equipment, goalPrimary: d.goal, goalsSecondary: d.secondary,
      sexStandard: isYouth(d) ? 'neutral' : (d.sex || 'neutral'), createdAt: now.toISOString(),
    };
    st.bodyweights = [{ date: now.toISOString(), kg: bw }];
    const tpl = TEMPLATES.find((t) => t.id === d.template) || TEMPLATES[0];
    let split;
    if (tpl.id === 'custom') {
      const days = Array.from({ length: d.customDays }, (_, i) => ({ id: uid('d'), name: `Day ${i + 1}`, focus: '', slots: [] }));
      split = { id: uid('sp'), name: 'My Split', templateId: 'custom', days, schedule: spreadDays(Math.min(d.days, d.customDays), days.length).map((x) => (x == null ? null : days[x].id)) };
    } else {
      split = buildSplitFromTemplate(tpl, { equipment: d.equipment, trainingDays: d.days });
    }
    st.splits = [split];
    st.activeSplitId = split.id;
    st.goals = [];
    if (d.tType && d.tType !== 'skip') {
      const g = { id: uid('g'), type: d.tType, category: d.goal, primary: true, createdAt: now.toISOString(), targetDate: d.tDate || null };
      if (d.tType === 'strength') { g.exId = d.tLift; g.targetKg = toKg(Number(d.tValue), unit); }
      if (d.tType === 'reps') { g.exId = 'pullup'; g.targetReps = Number(d.tValue); }
      if (d.tType === 'bodyweight') g.targetKg = toKg(Number(d.tValue), unit);
      if (d.tType === 'consistency') { g.perWeek = d.days; g.weeks = Number(d.tValue); }
      if (d.tType === 'custom') { g.title = d.tTitle.trim(); g.manual = 0; }
      st.goals.push(captureBaseline(st, g, now));
    }
  }, { immediate: true });
  app.ui.ob = null;
  haptic('success');
  go('home');
  toast('Welcome to ASCEND');
}

register('onboarding', {
  noNav: true, fullBleed: true,
  render,
  mount() { /* focus handled on step change */ },
  actions: {
    'ob-next': () => move(1),
    'ob-back': () => move(-1),
    'ob-skip': () => { const o = ob(); const step = steps()[o.step]; if (step === 'target') o.d.tType = 'skip'; if (step === 'name') o.d.name = ''; o.err = null; move(1); },
    'ob-set': (el) => {
      const o = ob(); o.d[el.dataset.k] = el.dataset.v; o.err = null; haptic('tap');
      if (el.dataset.k === 'unit') {
        // convert anything already typed
        if (o.d.weight) o.d.weight = String(Math.round(fromKg(toKg(Number(o.d.weight), el.dataset.v === 'lb' ? 'kg' : 'lb'), el.dataset.v)));
      }
      if (el.dataset.k === 'tType') o.d.tValue = '';
      const y = window.scrollY; renderNow(); window.scrollTo(0, y);
      if (el.dataset.k === 'tType') setTimeout(() => document.getElementById('ob-tval')?.focus(), 30);
    },
    'ob-days': (el) => { const o = ob(); o.d.days = Math.max(1, Math.min(7, o.d.days + Number(el.dataset.delta))); haptic('tap'); renderNow(); },
    'ob-cdays': (el) => { const o = ob(); o.d.customDays = Math.max(1, Math.min(7, o.d.customDays + Number(el.dataset.delta))); renderNow(); },
    'ob-equip-preset': (el) => { const o = ob(); o.d.equipPreset = el.dataset.v; o.d.equipment = [...EQUIPMENT_PRESETS[el.dataset.v]]; renderNow(); },
    'ob-equip': (el) => {
      const o = ob(); const v = el.dataset.v; const set = new Set(o.d.equipment);
      set.has(v) ? set.delete(v) : set.add(v); o.d.equipment = [...set]; o.d.equipPreset = '';
      const y = window.scrollY; renderNow(); window.scrollTo(0, y);
    },
    'ob-secondary': (el) => {
      const o = ob(); const v = el.dataset.v; const set = new Set(o.d.secondary);
      set.has(v) ? set.delete(v) : set.add(v); o.d.secondary = [...set];
      const y = window.scrollY; renderNow(); window.scrollTo(0, y);
    },
    'ob-finish': finish,
    'ob-restore': () => document.getElementById('ob-file')?.click(),
  },
  inputs: {
    'ob-field': (el) => {
      const o = ob(); o.d[el.dataset.k] = el.value; o.err = null;
      if (el.dataset.k === 'hFt' && el.value.length === 1) el.parentElement.nextElementSibling?.querySelector('input')?.focus();
    },
    'ob-file': async (el) => {
      const f = el.files?.[0]; if (!f) return;
      const { importData } = await import('../store.js');
      try { await importData(JSON.parse(await f.text())); app.ui.ob = null; go('home'); toast('Backup restored'); } catch (e) { toast(esc(e.message || 'Could not read that file')); }
    },
  },
});

// helpers used elsewhere
export { EXPERIENCE, TARGET_LIFTS };
