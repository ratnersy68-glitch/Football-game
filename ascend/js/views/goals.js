import { app, register, update, openSheet, closeSheet, renderSheet, toast, confirmSheet } from '../app.js';
import { icon } from '../ui/icons.js';
import { ring, bar, sheetFrame, empty } from '../ui/components.js';
import { goalStatus, goalTitle, GOAL_TYPES, GOAL_CATEGORIES, captureBaseline } from '../engine/goals.js';
import { insights, strengthPlan, COACH_LABEL } from '../engine/coach.js';
import { isYouth } from '../engine/rank.js';
import { allExercises, getExercise } from '../data/exercises.js';
import { esc, toKg, fromKg, roundDisplay, parseNum, uid, daysBetween, fmtDate, fmtWeight } from '../util.js';
import { bwSheet } from './profile.js';
import { runGoalChecks } from '../flows.js';

const unit = () => app.unit;

function missionHero(g) {
  const st = app.state;
  const s = goalStatus(st, g);
  const u = unit();
  const title = goalTitle(g, u);
  const plan = g.type === 'strength' ? strengthPlan(st, g) : null;
  const daysLeft = g.targetDate ? daysBetween(new Date(), g.targetDate) : null;
  const action = nextAction(g, s, plan);
  return `<div class="card marble mission">
    <div class="eyebrow">Mission</div>
    <h1 class="h1 mt-8" style="text-transform:uppercase;letter-spacing:.04em">${esc(title)}</h1>
    ${ring(s.pct, { size: 196, stroke: 12, center: `<div class="big-num">${Math.round(s.pct * 100)}<span style="font-size:22px">%</span></div><div class="tiny faint upper mt-8">${g.completedAt ? 'Complete' : 'to target'}</div>` })}
    <div class="stat-row">
      <div class="kv"><b>${s.current != null ? esc(s.fmt(s.current)) : '—'}</b><span>${esc(s.label)}</span></div>
      <div class="kv"><b>${esc(s.fmt(s.target))}</b><span>Target</span></div>
      <div class="kv"><b>${s.next ? esc(s.next.label) : '✓'}</b><span>Next milestone</span></div>
    </div>
    ${s.milestones.length > 1 ? `<div class="milestones">${s.milestones.map((m) => `<div class="ms ${m.done ? 'done' : ''} ${s.next === m ? 'next' : ''}"><i class="node"></i><span>${esc(m.label)}</span></div>`).join('')}</div>` : ''}
    <div class="row between small mt-16" style="text-align:left">
      <span class="muted">${s.recent != null && g.type !== 'consistency' ? `Last 30 days: <b style="color:var(--text)">${s.recent >= 0 ? '+' : ''}${esc(g.type === 'reps' ? `${s.recent} reps` : fmtWeight(s.recent, u).replace(/^-?/, s.recent < 0 ? '−' : ''))}</b>` : g.type === 'consistency' ? `Current streak: <b style="color:var(--text)">${s.recent} wk</b>` : 'Log sessions to track change'}</span>
      ${daysLeft != null ? `<span class="faint">${daysLeft >= 0 ? `${daysLeft} days to ${fmtDate(g.targetDate)}` : `Target date passed`}</span>` : ''}
    </div>
    ${action ? `<div class="card flat mt-16" style="text-align:left;background:var(--surface)"><div class="ai-label"><i></i>Next recommended action</div><p class="mt-8">${action}</p></div>` : ''}
    ${plan?.ready && !plan.done ? `<details class="explain" style="text-align:left"><summary>Progression plan</summary>
      <p class="small muted mt-8">${esc(plan.text)}</p>
      <div class="col mt-16">${plan.phases.map((p, i) => `<div class="row" style="align-items:flex-start"><span class="tag dark">${i + 1}</span><div><b class="small">${esc(p.title)}</b><p class="small muted">${esc(p.body)}</p></div></div>`).join('')}</div></details>` : plan && !plan.ready ? `<p class="small muted mt-16">${esc(plan.text)}</p>` : ''}
    <div class="row mt-16" style="justify-content:center">
      <button class="btn xs ghost" data-action="goal-edit" data-id="${g.id}">${icon('edit', 'sm')} Edit</button>
      ${g.type === 'custom' && !g.completedAt ? `<button class="btn xs ghost" data-action="goal-manual" data-id="${g.id}">Update progress</button>` : ''}
      ${g.type === 'bodyweight' ? `<button class="btn xs ghost" data-action="goal-logbw">${icon('scale', 'sm')} Log weight</button>` : ''}
    </div>
  </div>`;
}

function nextAction(g, s, plan) {
  const st = app.state;
  const u = unit();
  if (g.completedAt) return 'Goal complete. Set your next mission to keep ascending.';
  switch (g.type) {
    case 'strength': {
      const ex = getExercise(g.exId, st.customExercises);
      if (s.current == null) return `Log ${esc(ex?.name)} in your next session so the coach can measure your starting point.`;
      const inSplit = st.splits.some((sp) => sp.days.some((d) => d.slots.some((x) => x.exId === g.exId)));
      if (!inSplit) return `${esc(ex?.name)} isn't in your split. Add it to at least one training day — you can't progress a lift you don't train.`;
      return `Follow today's targets for ${esc(ex?.name)} and add reps before weight. Next milestone: <b>${esc(s.next?.label || '')}</b> estimated max.${plan?.ready ? '' : ''}`;
    }
    case 'reps': return s.current == null ? 'Log a set to set your baseline.' : `Aim for ${Math.min(s.target, (s.current || 0) + 1)} clean reps on your first set next session. Stop each set 1–2 reps shy of failure on the others.`;
    case 'bodyweight': return isYouth(st)
      ? 'Focus on regular meals, sleep and training consistency. Body-weight changes at your age are best guided by a parent, doctor or dietitian.'
      : `Log your body weight 2–3 times per week at the same time of day; the trend matters more than any single reading. ${s.target > (s.baseline ?? 0) ? 'A slight calorie surplus with enough protein supports gaining muscle.' : 'A moderate calorie deficit while keeping strength training heavy helps preserve muscle.'}`;
    case 'consistency': return `Hit ${g.perWeek} sessions this week. Missed one? Just do the next planned day — no catching up needed.`;
    default: return 'Update your progress whenever you take a step forward.';
  }
}

function goalCard(g) {
  const s = goalStatus(app.state, g);
  return `<div class="card"><div class="row between"><div class="grow"><div class="h3">${esc(goalTitle(g, unit()))}</div><div class="small muted">${esc(GOAL_TYPES.find((t) => t.id === g.type)?.label || '')}${g.completedAt ? ' · Completed' : ''}</div></div><b class="num">${Math.round(s.pct * 100)}%</b></div>
    <div class="mt-16">${bar(s.pct)}</div>
    <div class="row mt-16"><button class="btn xs ghost" data-action="goal-primary" data-id="${g.id}">Make main goal</button><button class="btn xs ghost" data-action="goal-edit" data-id="${g.id}">${icon('edit', 'sm')}</button>${g.type === 'custom' && !g.completedAt ? `<button class="btn xs ghost" data-action="goal-manual" data-id="${g.id}">Update</button>` : ''}</div></div>`;
}

function insightCard(c) {
  const open = app.ui.openWhy === c.id;
  return `<div class="card insight ${c.kind}"><div class="h3">${esc(c.title)}</div><p class="small muted mt-8">${esc(c.body)}</p>
    <button class="small accent bold mt-8" data-action="why-toggle" data-id="${c.id}" style="margin-top:8px">${open ? 'Hide reasoning' : 'Why?'}</button>${open ? `<p class="small mt-8">${esc(c.why)}</p>` : ''}
    ${c.kind === 'stall' && c.exId ? `<div class="row mt-8"><button class="btn xs ghost" data-action="open-ex" data-id="${c.exId}">See alternatives</button></div>` : ''}</div>`;
}

function render() {
  const st = app.state;
  const goals = (st.goals || []).filter((g) => !g.archived);
  const primary = goals.find((g) => g.primary) || goals.find((g) => !g.completedAt) || goals[0];
  const others = goals.filter((g) => g !== primary);
  const cards = insights(st);
  const cat = GOAL_CATEGORIES.find((c) => c.id === st.profile.goalPrimary);
  return `
    <div class="topbar"><span class="title">GOALS</span><button class="btn xs primary" data-action="goal-new">${icon('plus', 'sm')} Goal</button></div>
    ${primary ? missionHero(primary) : `<div class="card marble mission">${empty('goal', 'No mission yet', 'Set a measurable goal and the coach will build milestones around it.', '<button class="btn primary" data-action="goal-new">Create a goal</button>')}</div>`}
    <div class="desk-2 mt-16">
      <div>
        <div class="section-title mt-0"><span class="h2">Coach</span><span class="ai-label"><i></i>${COACH_LABEL}</span></div>
        <div class="col">${cards.map(insightCard).join('')}</div>
        <p class="tiny faint mt-16">Recommendations come from transparent rules applied to your own logs — not from an AI model. They're general guidance, not medical advice; stop and seek professional input if something hurts.</p>
      </div>
      <div>
        <div class="section-title mt-0"><span class="h2">Training focus</span></div>
        <div class="card"><div class="h3">${esc(cat?.label || 'Not set')}</div><p class="small muted mt-8">${esc(cat?.blurb || '')}</p>
          ${(st.profile.goalsSecondary || []).length ? `<div class="chips mt-16">${st.profile.goalsSecondary.map((x) => `<span class="tag">${esc(GOAL_CATEGORIES.find((c) => c.id === x)?.label || x)}</span>`).join('')}</div>` : ''}
          <button class="btn xs ghost mt-16" data-action="focus-edit">Change focus</button></div>
        ${others.length ? `<div class="section-title"><span class="h2">Other goals</span></div><div class="col">${others.map(goalCard).join('')}</div>` : ''}
      </div>
    </div>`;
}

// ---------- goal editor ----------
const GOAL_EXERCISES = () => allExercises(app.state.customExercises).filter((e) => e.rank || e.custom || ['pullup', 'chinup', 'dip', 'pushup'].includes(e.id));

function editorSheet() {
  const f = app.ui.goalForm;
  const u = unit();
  const types = GOAL_TYPES;
  const exList = GOAL_EXERCISES().filter((e) => f.type === 'reps' || e.load !== 'bw' || e.rank);
  let fields = '';
  if (f.type === 'strength' || f.type === 'reps') {
    fields += `<div class="field mt-16"><label for="gf-ex">Exercise</label><select id="gf-ex" class="input" data-change="gf" data-k="exId">${exList.map((e) => `<option value="${e.id}" ${f.exId === e.id ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select></div>`;
  }
  if (f.type === 'strength') fields += `<div class="field mt-16"><label for="gf-v">Target estimated 1RM (${u === 'lb' ? 'lbs' : 'kg'})</label><input id="gf-v" class="input" inputmode="decimal" data-input="gf" data-k="value" value="${esc(f.value)}" placeholder="225"></div>`;
  if (f.type === 'reps') fields += `<div class="field mt-16"><label for="gf-v">Target reps in one set</label><input id="gf-v" class="input" inputmode="numeric" data-input="gf" data-k="value" value="${esc(f.value)}" placeholder="15"></div>`;
  if (f.type === 'bodyweight') fields += `<div class="field mt-16"><label for="gf-v">Target body weight (${u === 'lb' ? 'lbs' : 'kg'})</label><input id="gf-v" class="input" inputmode="decimal" data-input="gf" data-k="value" value="${esc(f.value)}"></div>${isYouth(app.state) ? '<p class="tiny faint mt-8">For lifters under 18, body-weight goals are tracked as a trend only. Talk with a parent or doctor before trying to lose weight.</p>' : '<p class="tiny faint mt-8">Sustainable change is roughly 0.25–1% of body weight per week.</p>'}`;
  if (f.type === 'consistency') fields += `<div class="grid grid-2 mt-16"><div class="field"><label for="gf-pw">Sessions / week</label><input id="gf-pw" class="input" inputmode="numeric" data-input="gf" data-k="perWeek" value="${esc(f.perWeek)}"></div><div class="field"><label for="gf-v">For weeks</label><input id="gf-v" class="input" inputmode="numeric" data-input="gf" data-k="value" value="${esc(f.value)}" placeholder="8"></div></div>`;
  if (f.type === 'custom') fields += `<div class="field mt-16"><label for="gf-t">Goal</label><input id="gf-t" class="input" data-input="gf" data-k="title" value="${esc(f.title)}" placeholder="e.g. Clean pull-up technique" maxlength="60"></div>`;
  return sheetFrame(f.id ? 'Edit goal' : 'New goal', `
    <div class="chips">${types.map((t) => `<button class="chip ${f.type === t.id ? 'on' : ''}" data-action="gf-type" data-v="${t.id}">${esc(t.label)}</button>`).join('')}</div>
    <p class="tiny faint mt-8">${esc(GOAL_TYPES.find((t) => t.id === f.type)?.hint || '')}</p>
    ${fields}
    ${f.type !== 'custom' ? `<div class="field mt-16"><label for="gf-title">Name <span class="faint">(optional)</span></label><input id="gf-title" class="input" data-input="gf" data-k="title" value="${esc(f.title)}" maxlength="60" placeholder="Auto"></div>` : ''}
    <div class="field mt-16"><label for="gf-date">Target date <span class="faint">(optional)</span></label><input id="gf-date" type="date" class="input" data-input="gf" data-k="targetDate" value="${esc(f.targetDate || '')}"></div>
    <p class="tiny faint mt-8">ASCEND never guarantees a date for a strength goal — it tracks the trend and adjusts.</p>
    ${f.err ? `<p class="small mt-8" style="color:var(--danger)">${esc(f.err)}</p>` : ''}
    <button class="btn primary block mt-24" data-action="gf-save">${f.id ? 'Save changes' : 'Create goal'}</button>
    ${f.id ? `<div class="row mt-16"><button class="btn ghost grow" data-action="gf-archive">${icon('check', 'sm')} Archive</button><button class="btn danger grow" data-action="gf-delete">${icon('trash', 'sm')} Delete</button></div>` : ''}`);
}

function manualSheet() {
  const g = app.state.goals.find((x) => x.id === app.ui.manualId);
  const v = g?.manual ?? 0;
  return sheetFrame('Update progress', `<p class="muted">${esc(g?.title || '')}</p>
    <div class="center mt-24"><div class="big-num">${v}%</div></div>
    <input type="range" min="0" max="100" step="5" value="${v}" data-input="manual-range" style="width:100%;margin-top:18px;accent-color:var(--accent)">
    <button class="btn primary block mt-24" data-action="sheet-close">Done</button>`);
}

function focusSheet() {
  const p = app.state.profile;
  return sheetFrame('Training focus', `<div class="col">${GOAL_CATEGORIES.map((c) => `<button class="option ${p.goalPrimary === c.id ? 'on' : ''}" data-action="focus-set" data-v="${c.id}"><div class="grow"><div class="h3">${esc(c.label)}</div><div class="small muted">${esc(c.blurb)}</div></div><span class="check"></span></button>`).join('')}</div>
    <div class="label mt-24">Secondary</div><div class="chips mt-8">${GOAL_CATEGORIES.filter((c) => c.id !== p.goalPrimary && c.id !== 'custom').map((c) => `<button class="chip sm ${(p.goalsSecondary || []).includes(c.id) ? 'on' : ''}" data-action="focus-sec" data-v="${c.id}">${esc(c.label)}</button>`).join('')}</div>`);
}

function openEditor(g) {
  const u = unit();
  app.ui.goalForm = g ? {
    id: g.id, type: g.type, exId: g.exId || 'bench', title: g.title || '', targetDate: g.targetDate || '', completedAt: g.completedAt,
    value: g.type === 'strength' || g.type === 'bodyweight' ? String(roundDisplay(fromKg(g.targetKg, u), u)) : g.type === 'reps' ? String(g.targetReps) : g.type === 'consistency' ? String(g.weeks) : '',
    perWeek: String(g.perWeek || app.state.profile.trainingDays),
  } : { type: 'strength', exId: 'bench', value: '', title: '', targetDate: '', perWeek: String(app.state.profile.trainingDays) };
  openSheet(editorSheet);
}

register('goals', { render, actions: {
  'goal-new': () => openEditor(null),
  'goal-edit': (el) => openEditor(app.state.goals.find((g) => g.id === el.dataset.id)),
  'gf-type': (el) => { const f = app.ui.goalForm; f.type = el.dataset.v; f.value = ''; f.err = null; if (f.type === 'reps' && !['pullup', 'chinup', 'dip', 'pushup'].includes(f.exId)) f.exId = 'pullup'; renderSheet(); },
  'gf-save': () => {
    const f = app.ui.goalForm; const u = unit();
    const v = parseNum(f.value, { min: 0.01 });
    const goal = { type: f.type, title: f.title.trim(), targetDate: f.targetDate || null };
    if (f.type === 'strength') { if (!v || toKg(v, u) > 500) { f.err = 'Enter a realistic target weight.'; renderSheet(); return; } goal.exId = f.exId; goal.targetKg = toKg(v, u); }
    if (f.type === 'reps') { if (!v || v > 300) { f.err = 'Enter a rep target.'; renderSheet(); return; } goal.exId = f.exId; goal.targetReps = Math.round(v); }
    if (f.type === 'bodyweight') { if (!v || toKg(v, u) < 30 || toKg(v, u) > 300) { f.err = 'Enter a realistic body weight.'; renderSheet(); return; } goal.targetKg = toKg(v, u); }
    if (f.type === 'consistency') { const pw = parseNum(f.perWeek, { min: 1, max: 7 }); if (!v || v > 52 || !pw) { f.err = 'Enter sessions per week (1–7) and weeks (1–52).'; renderSheet(); return; } goal.weeks = Math.round(v); goal.perWeek = Math.round(pw); }
    if (f.type === 'custom') { if (!goal.title) { f.err = 'Describe your goal.'; renderSheet(); return; } }
    update((st) => {
      if (f.id) {
        const g = st.goals.find((x) => x.id === f.id);
        const changedTarget = g.type !== goal.type || g.exId !== goal.exId;
        Object.assign(g, goal);
        if (changedTarget) { delete g.baseline; g.completedAt = null; captureBaseline(st, g); }
        if (g.completedAt && goalStatus(st, g).pct < 1) g.completedAt = null;
      } else {
        const g = { id: uid('g'), ...goal, primary: !st.goals.some((x) => x.primary && !x.archived), createdAt: new Date().toISOString(), manual: goal.type === 'custom' ? 0 : undefined };
        st.goals.push(captureBaseline(st, g));
      }
    });
    closeSheet(); toast(f.id ? 'Goal updated' : 'Goal created');
  },
  'gf-archive': () => { const id = app.ui.goalForm.id; update((st) => { const g = st.goals.find((x) => x.id === id); g.archived = true; g.primary = false; const n = st.goals.find((x) => !x.archived); if (n && !st.goals.some((x) => x.primary && !x.archived)) n.primary = true; }); closeSheet(); },
  'gf-delete': async () => {
    const id = app.ui.goalForm.id; closeSheet();
    if (!(await confirmSheet({ title: 'Delete this goal?', ok: 'Delete', danger: true }))) return;
    update((st) => { st.goals = st.goals.filter((x) => x.id !== id); if (!st.goals.some((x) => x.primary && !x.archived)) { const n = st.goals.find((x) => !x.archived); if (n) n.primary = true; } });
  },
  'goal-primary': (el) => update((st) => { st.goals.forEach((g) => { g.primary = g.id === el.dataset.id; }); }),
  'goal-manual': (el) => { app.ui.manualId = el.dataset.id; openSheet(manualSheet); },
  'goal-logbw': () => openSheet(bwSheet),
  'why-toggle': (el) => { app.ui.openWhy = app.ui.openWhy === el.dataset.id ? null : el.dataset.id; update(() => {}, { silent: false }); },
  'open-ex': (el) => { app.ui.exDetail = el.dataset.id; app.actions['ex-detail']?.(el); },
  'focus-edit': () => openSheet(focusSheet),
  'focus-set': (el) => { update((st) => { st.profile.goalPrimary = el.dataset.v; st.profile.goalsSecondary = (st.profile.goalsSecondary || []).filter((x) => x !== el.dataset.v); }); },
  'focus-sec': (el) => update((st) => { const s = new Set(st.profile.goalsSecondary || []); s.has(el.dataset.v) ? s.delete(el.dataset.v) : s.add(el.dataset.v); st.profile.goalsSecondary = [...s]; }),
}, inputs: {
  gf: (el) => { app.ui.goalForm[el.dataset.k] = el.value; },
  'manual-range': (el) => {
    const v = Number(el.value);
    update((st) => { const g = st.goals.find((x) => x.id === app.ui.manualId); g.manual = v; if (v < 100) g.completedAt = null; }, { silent: true });
    const n = el.closest('.sheet').querySelector('.big-num'); if (n) n.textContent = `${v}%`;
    clearTimeout(app.ui._manT); app.ui._manT = setTimeout(() => runGoalChecks(), 500);
  },
} });
