import { app, register, go, update, openSheet, closeSheet, renderSheet, renderNow, toast, confirmSheet } from '../app.js';
import { icon } from '../ui/icons.js';
import { sheetFrame, empty, stepper, toggle } from '../ui/components.js';
import { EQUIPMENT, MUSCLES, PATTERNS, getExercise, allExercises, isAvailable, alternativesFor } from '../data/exercises.js';
import { TEMPLATES, buildSplitFromTemplate, makeSlot } from '../data/templates.js';
import { exerciseHistory, sortedSessions, workSets } from '../engine/history.js';
import { activeSplit, startWorkout, addExerciseToWorkout } from '../flows.js';
import { esc, uid, WEEKDAYS, WEEKDAYS_LONG, weekdayIdx, fmtWeight, fmtVolume, fmtDuration, fmtDate, dayKey, cap, plural, startOfDay, addDays, deepClone } from '../util.js';

const unit = () => app.unit;

// =============== split overview ===============
function weekStrip(sp) {
  const today = weekdayIdx(new Date());
  return `<div class="week-strip">${WEEKDAYS.map((d, i) => {
    const day = sp.days.find((x) => x.id === sp.schedule[i]);
    return `<button class="wd ${day ? 'train' : ''} ${i === today ? 'today' : ''}" data-action="assign-weekday" data-wd="${i}"><b>${d}</b><span>${day ? esc(day.name) : 'Rest'}</span></button>`;
  }).join('')}</div>`;
}

function renderTrain() {
  const st = app.state;
  const sp = activeSplit(st);
  const recent = sortedSessions(st).slice(-3).reverse();
  if (!sp) {
    return `<div class="topbar"><span class="title">TRAIN</span></div>${empty('train', 'No split yet', 'Create a split from a template or build your own.', '<button class="btn primary" data-action="new-split">Create split</button>')}`;
  }
  return `
    <div class="topbar"><span class="title">TRAIN</span><div class="row"><button class="icon-btn" data-action="go-library" aria-label="Exercise library">${icon('search')}</button><button class="icon-btn" data-action="go-calendar2" aria-label="Calendar">${icon('calendar')}</button></div></div>
    ${st.activeWorkout ? `<div class="banner info mb">${icon('timer')}<span class="grow"><b>${esc(st.activeWorkout.name)}</b> is in progress.</span><button class="btn xs primary" data-action="go-workout">Resume</button></div>` : ''}
    <div class="row between mt-16"><div><div class="eyebrow">Active split</div><h1 class="h1 mt-8">${esc(sp.name)}</h1></div>
      <button class="icon-btn" data-action="split-menu" aria-label="Split options">${icon('dots')}</button></div>
    <div class="mt-16">${weekStrip(sp)}</div>
    <p class="tiny faint mt-8">Tap a weekday to assign a training day or rest.</p>
    <div class="section-title"><span class="h2">Training days</span><button class="btn xs ghost" data-action="add-day">${icon('plus', 'sm')} Day</button></div>
    <div class="desk-3 col">
    ${sp.days.map((d) => {
      const names = d.slots.map((s) => getExercise(s.exId, st.customExercises)?.name).filter(Boolean);
      const wds = sp.schedule.map((id, i) => (id === d.id ? WEEKDAYS[i] : null)).filter(Boolean);
      return `<div class="card">
        <div class="row between"><div class="grow"><div class="h2">${esc(d.name)}</div><div class="small muted">${esc(d.focus || 'No focus set')}</div></div>${wds.length ? `<span class="tag accent">${wds.join(' · ')}</span>` : '<span class="tag">Unscheduled</span>'}</div>
        <p class="small faint mt-8" style="min-height:20px">${names.length ? esc(names.slice(0, 4).join(' · ')) + (names.length > 4 ? ` +${names.length - 4}` : '') : 'No exercises yet'}</p>
        <div class="row mt-16"><button class="btn primary sm grow" data-action="start-day" data-day="${d.id}" ${d.slots.length ? '' : 'disabled'}>${icon('play', 'sm')} Start</button><button class="btn ghost sm" data-action="edit-day" data-day="${d.id}">${icon('edit', 'sm')} Edit</button></div>
      </div>`;
    }).join('') || empty('list', 'No training days', 'Add a day to start building your split.')}
    </div>
    <div class="grid grid-2 mt-16">
      <button class="card link tight row" data-action="start-empty">${icon('plus')}<div class="grow" style="text-align:left"><div class="h3">Empty workout</div><div class="tiny faint">Log as you go</div></div></button>
      <button class="card link tight row" data-action="go-library">${icon('search')}<div class="grow" style="text-align:left"><div class="h3">Exercises</div><div class="tiny faint">${allExercises(st.customExercises).length} in library</div></div></button>
    </div>
    <div class="section-title"><span class="h2">Recent workouts</span>${st.sessions.length ? `<button class="small accent bold" data-action="go-history">History</button>` : ''}</div>
    ${recent.length ? `<div class="card">${recent.map(sessionRow).join('')}</div>` : `<div class="card">${empty('calendar', 'No workouts yet', 'Your completed sessions will appear here.')}</div>`}`;
}

function sessionRow(s) {
  const u = unit();
  return `<div class="list-row btnlike" data-action="view-session" data-id="${s.id}"><div class="grow"><div class="h3">${esc(s.name)}</div><div class="small muted">${fmtDate(s.date, { weekday: 'short', month: 'short', day: 'numeric' })} · ${fmtDuration(s.durationSec || 0)} · ${fmtVolume(s.volumeKg || 0, u)}</div></div>${s.prs?.length ? `<span class="tag accent">${s.prs.length} PR</span>` : ''}${icon('chev', 'sm')}</div>`;
}

function splitMenuSheet() {
  const st = app.state;
  return sheetFrame('Split options', `
    <div class="field"><label for="sp-name">Split name</label><input id="sp-name" class="input" value="${esc(activeSplit(st).name)}" data-change="split-rename" maxlength="40"></div>
    ${st.splits.length > 1 ? `<div class="label mt-24">Your splits</div><div class="col mt-8">${st.splits.map((s) => `<button class="option ${s.id === st.activeSplitId ? 'on' : ''}" data-action="split-activate" data-id="${s.id}"><div class="grow"><div class="h3">${esc(s.name)}</div><div class="small muted">${s.days.length} days</div></div><span class="check"></span></button>`).join('')}</div>` : ''}
    <div class="col mt-24">
      <button class="btn ghost block" data-action="new-split">${icon('plus', 'sm')} New split from template</button>
      <button class="btn ghost block" data-action="split-duplicate">${icon('copy', 'sm')} Duplicate this split</button>
      ${st.splits.length > 1 ? `<button class="btn danger block" data-action="split-delete">${icon('trash', 'sm')} Delete this split</button>` : ''}
    </div>`);
}

function newSplitSheet() {
  return sheetFrame('New split', `<p class="small muted">Templates adapt to your equipment and ${app.state.profile.trainingDays}-day schedule. Your current split is kept.</p>
    <div class="col mt-16">${TEMPLATES.map((t) => `<button class="option" data-action="split-create" data-tpl="${t.id}"><div class="grow"><div class="h3">${esc(t.name)}</div><div class="small muted">${esc(t.blurb)}</div></div>${icon('chev')}</button>`).join('')}</div>`);
}

function weekdaySheet() {
  const sp = activeSplit(app.state);
  const wd = app.ui.wd;
  return sheetFrame(WEEKDAYS_LONG[wd], `<div class="col">
    ${sp.days.map((d) => `<button class="option ${sp.schedule[wd] === d.id ? 'on' : ''}" data-action="assign-set" data-day="${d.id}"><div class="grow"><div class="h3">${esc(d.name)}</div><div class="small muted">${esc(d.focus || '')}</div></div><span class="check"></span></button>`).join('')}
    <button class="option ${!sp.schedule[wd] ? 'on' : ''}" data-action="assign-set" data-day=""><div class="grow"><div class="h3">Rest day</div><div class="small muted">Recovery counts</div></div><span class="check"></span></button></div>`);
}

function mutSplit(fn) { update((st) => { const sp = st.splits.find((s) => s.id === st.activeSplitId) || st.splits[0]; fn(sp, st); }); }

// =============== day editor ===============
function renderDay({ id }) {
  const st = app.state;
  const sp = activeSplit(st);
  const d = sp?.days.find((x) => x.id === id);
  if (!d) return `<div class="topbar"><button class="back" data-action="go-train">${icon('back')} Train</button></div>${empty('list', 'Day not found')}`;
  return `
    <div class="topbar"><button class="back" data-action="go-train">${icon('back')} Train</button><button class="icon-btn" data-action="day-menu" data-day="${d.id}" aria-label="Day options">${icon('dots')}</button></div>
    <div class="grid grid-2" style="gap:10px">
      <div class="field"><label for="day-name">Day name</label><input id="day-name" class="input" value="${esc(d.name)}" data-change="day-field" data-k="name" data-day="${d.id}" maxlength="30"></div>
      <div class="field"><label for="day-focus">Focus</label><input id="day-focus" class="input" value="${esc(d.focus || '')}" data-change="day-field" data-k="focus" data-day="${d.id}" placeholder="e.g. Chest & Triceps" maxlength="50"></div>
    </div>
    <div class="section-title"><span class="h2">${plural(d.slots.length, 'exercise')}</span><button class="btn xs primary" data-action="day-add-ex" data-day="${d.id}">${icon('plus', 'sm')} Add</button></div>
    <div class="card" style="padding:4px 14px">
      ${d.slots.length ? d.slots.map((s, i) => {
        const ex = getExercise(s.exId, st.customExercises);
        return `<div class="slot">
          <div class="order"><button data-action="slot-move" data-day="${d.id}" data-i="${i}" data-d="-1" aria-label="Move up" ${i === 0 ? 'disabled style="opacity:.25"' : ''}>${icon('up', 'sm')}</button><button data-action="slot-move" data-day="${d.id}" data-i="${i}" data-d="1" aria-label="Move down" ${i === d.slots.length - 1 ? 'disabled style="opacity:.25"' : ''}>${icon('down', 'sm')}</button></div>
          <div class="grow" data-action="slot-edit" data-day="${d.id}" data-i="${i}" style="cursor:pointer"><div class="h3">${esc(ex?.name || 'Unknown exercise')}</div>
            <div class="small muted">${s.sets} × ${s.repMin}${s.repMax !== s.repMin ? `–${s.repMax}` : ''} · rest ${fmtDuration(s.rest)}${s.rpe ? ` · RPE ${s.rpe}` : ''}${s.warmup ? ' · warm-up' : ''}</div>
            ${s.notes ? `<div class="tiny faint mt-8">${esc(s.notes)}</div>` : ''}</div>
          <button class="icon-btn sm" data-action="slot-edit" data-day="${d.id}" data-i="${i}" aria-label="Edit">${icon('edit', 'sm')}</button>
        </div>`;
      }).join('') : empty('plus', 'No exercises', 'Add exercises from the library.')}
    </div>
    <button class="btn primary hero block mt-24" data-action="start-day" data-day="${d.id}" ${d.slots.length ? '' : 'disabled'}><span class="glint"></span>Start ${esc(d.name)}</button>`;
}

function slotSheet() {
  const { dayId, i } = app.ui.slotEdit;
  const sp = activeSplit(app.state);
  const d = sp.days.find((x) => x.id === dayId);
  const s = d?.slots[i];
  if (!s) return sheetFrame('Exercise', '');
  const ex = getExercise(s.exId, app.state.customExercises);
  const a = `data-day="${dayId}" data-i="${i}"`;
  const row = (label, k, val, disp) => `<div class="row between mt-16"><span class="label">${label}</span>${stepper(val, 'slot-step', `${a} data-k="${k}"`, disp)}</div>`;
  return sheetFrame(ex?.name || 'Exercise', `
    ${row('Sets', 'sets', s.sets)}
    ${row('Min reps', 'repMin', s.repMin)}
    ${row('Max reps', 'repMax', s.repMax)}
    ${row('Rest', 'rest', s.rest, fmtDuration(s.rest))}
    ${row('Target RPE', 'rpe', s.rpe, s.rpe || '—')}
    <div class="row between mt-16"><div><div class="label">Warm-up sets</div><div class="tiny faint">Auto-generated ramp before working sets</div></div>${toggle(s.warmup, 'slot-warmup', a)}</div>
    <div class="field mt-16"><label for="slot-notes">Notes</label><textarea id="slot-notes" class="input" data-change="slot-notes" ${a} placeholder="Seat height, grip, cues…" maxlength="300">${esc(s.notes || '')}</textarea></div>
    <div class="row mt-24"><button class="btn ghost grow" data-action="slot-swap" ${a}>${icon('swap', 'sm')} Swap</button><button class="btn danger grow" data-action="slot-remove" ${a}>${icon('trash', 'sm')} Remove</button></div>
    <p class="tiny faint mt-16">RPE = rate of perceived exertion (10 = no reps left). RPE 8 ≈ 2 reps in reserve.</p>`, { sub: ex ? `${cap(ex.muscles.join(', '))} · ${PATTERNS[ex.pattern]}` : '' });
}

function dayMenuSheet() {
  const id = app.ui.dayMenu;
  return sheetFrame('Day options', `<div class="col">
    <button class="btn ghost block" data-action="day-duplicate" data-day="${id}">${icon('copy', 'sm')} Duplicate day</button>
    <button class="btn danger block" data-action="day-delete" data-day="${id}">${icon('trash', 'sm')} Delete day</button></div>`);
}

// =============== library ===============
function libraryList() {
  const st = app.state;
  const q = (app.ui.libQ || '').toLowerCase().trim();
  const m = app.ui.libMuscle || 'all';
  const availOnly = app.ui.libAvail ?? true;
  const eq = st.profile.equipment;
  let list = allExercises(st.customExercises);
  if (q) list = list.filter((e) => e.name.toLowerCase().includes(q) || e.muscles.some((x) => x.includes(q)) || (PATTERNS[e.pattern] || '').toLowerCase().includes(q));
  if (m !== 'all') list = list.filter((e) => e.muscles.includes(m) || (m === 'custom' && e.custom));
  if (availOnly) list = list.filter((e) => isAvailable(e, eq));
  list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  const picker = app.ui.picker;
  return list.length ? list.map((e) => `<div class="ex-row ${isAvailable(e, eq) ? '' : 'unavail'}" data-action="${picker ? 'pick-ex' : 'ex-detail'}" data-id="${e.id}">
      <div class="ico">${esc(e.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase())}</div>
      <div class="grow"><div class="h3">${esc(e.name)}</div><div class="small muted">${cap(e.muscles.join(', '))} · ${(e.needs.length ? e.needs.map((n) => EQUIPMENT.find((x) => x.id === n)?.label.split(' ')[0]).join(', ') : 'No equipment')}</div></div>
      ${e.rank ? '<span class="tag accent" title="Counts toward Strength Rank">Rank</span>' : ''}${e.custom ? '<span class="tag">Custom</span>' : ''}
      ${picker ? icon('plus') : icon('chev', 'sm')}</div>`).join('') : empty('search', 'No matches', availOnly ? 'Try showing all equipment, or create a custom exercise.' : 'Create a custom exercise for anything missing.');
}

function renderLibrary() {
  const picker = app.ui.picker;
  const title = picker ? (picker.mode === 'swap' ? 'Swap exercise' : 'Add exercise') : 'Exercises';
  return `
    <div class="topbar"><button class="back" data-action="lib-back">${icon('back')} ${picker ? 'Cancel' : 'Train'}</button><span class="title">${title.toUpperCase()}</span><button class="icon-btn" data-action="custom-new" aria-label="New custom exercise">${icon('plus')}</button></div>
    <div class="search"><span>${icon('search')}</span><input id="lib-q" class="input" type="search" placeholder="Search exercises or muscles" value="${esc(app.ui.libQ || '')}" data-input="lib-q" autocomplete="off"></div>
    <div class="chips scroll mt-16">${['all', ...MUSCLES, 'custom'].map((m) => `<button class="chip sm ${(app.ui.libMuscle || 'all') === m ? 'on' : ''}" data-action="lib-muscle" data-m="${m}">${cap(m === 'all' ? 'All' : m)}</button>`).join('')}</div>
    <div class="row between mt-16"><span class="small muted">Only my equipment</span>${toggle(app.ui.libAvail ?? true, 'lib-avail')}</div>
    <div class="card mt-16" style="padding:2px 14px" id="lib-list">${libraryList()}</div>`;
}

function exDetailSheet() {
  const st = app.state;
  const id = app.ui.exDetail;
  const ex = getExercise(id, st.customExercises);
  if (!ex) return sheetFrame('Exercise', '');
  const u = unit();
  const h = exerciseHistory(st, id);
  const last = h[h.length - 1];
  const best = h.reduce((a, b) => (!a || b.e1rm > a.e1rm ? b : a), null);
  const prs = (st.prs || []).filter((p) => p.exId === id).slice(-3).reverse();
  const alts = alternativesFor(id, st.profile.equipment, st.customExercises).slice(0, 5);
  return sheetFrame(ex.name, `
    <div class="chips">${ex.muscles.map((m) => `<span class="tag dark">${m}</span>`).join('')}${(ex.secondary || []).map((m) => `<span class="tag">${m}</span>`).join('')}</div>
    <div class="grid grid-3 mt-16">
      <div class="kv"><span>Pattern</span><b style="font-size:15px">${esc(PATTERNS[ex.pattern] || '')}</b></div>
      <div class="kv"><span>Reps</span><b style="font-size:15px">${ex.reps[0]}–${ex.reps[1]}</b></div>
      <div class="kv"><span>Rest</span><b style="font-size:15px">${fmtDuration(ex.rest)}</b></div>
    </div>
    ${ex.cues?.length ? `<div class="label mt-24">How to</div><ol class="small" style="padding-left:18px;margin:8px 0 0;line-height:1.6">${ex.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : ''}
    <div class="label mt-24">Equipment</div><p class="small mt-8">${ex.needs.length ? ex.needs.map((n) => EQUIPMENT.find((x) => x.id === n)?.label).join(', ') : 'None'}${isAvailable(ex, st.profile.equipment) ? '' : ' <span class="tag warn">Not in your equipment</span>'}</p>
    ${ex.rank ? `<p class="small muted mt-8">${icon('rank', 'sm')} Counts toward the <b>${esc({ bench: 'Press', squat: 'Squat', deadlift: 'Hinge', ohp: 'Overhead', pull: 'Pull' }[ex.rank.p])}</b> pattern of your Strength Rank.</p>` : ''}
    <div class="label mt-24">Your history</div>
    ${h.length ? `<div class="grid grid-3 mt-8">
      <div class="kv"><span>Last</span><b style="font-size:15px">${last.topWeightKg ? fmtWeight(last.topWeightKg, u) : 'BW'} × ${last.topReps}</b></div>
      <div class="kv"><span>Est. max</span><b style="font-size:15px">${best?.e1rm ? fmtWeight(best.e1rm, u) : '—'}</b></div>
      <div class="kv"><span>Sessions</span><b style="font-size:15px">${h.length}</b></div></div>
      ${prs.length ? `<div class="mt-16">${prs.map((p) => `<div class="small row between"><span class="muted">${fmtDate(p.date)}</span><span>${p.weightKg ? fmtWeight(p.weightKg, u) + ' × ' : ''}${p.reps}</span></div>`).join('')}</div>` : ''}`
      : '<p class="small faint mt-8">Not logged yet.</p>'}
    ${alts.length ? `<div class="label mt-24">Alternatives</div><div class="chips mt-8">${alts.map((a) => `<button class="chip sm" data-action="ex-detail" data-id="${a.id}">${esc(a.name)}</button>`).join('')}</div>` : ''}
    ${ex.custom ? `<button class="btn danger block mt-24" data-action="custom-delete" data-id="${ex.id}">${icon('trash', 'sm')} Delete custom exercise</button>` : ''}`,
  { sub: '' });
}

function customSheet() {
  const c = app.ui.custom;
  return sheetFrame('Custom exercise', `
    <div class="field"><label for="cx-name">Name</label><input id="cx-name" class="input" data-input="cx-field" data-k="name" value="${esc(c.name)}" maxlength="40" placeholder="e.g. Landmine Press"></div>
    <div class="label mt-16">Primary muscles</div><div class="chips mt-8">${MUSCLES.map((m) => `<button class="chip sm ${c.muscles.includes(m) ? 'on' : ''}" data-action="cx-muscle" data-m="${m}">${cap(m)}</button>`).join('')}</div>
    <div class="label mt-16">Equipment</div><div class="chips mt-8">${EQUIPMENT.map((e) => `<button class="chip sm ${c.needs.includes(e.id) ? 'on' : ''}" data-action="cx-equip" data-e="${e.id}">${esc(e.label)}</button>`).join('')}</div>
    <div class="label mt-16">How weight is entered</div><div class="seg full mt-8">${[['load', 'Total'], ['perHand', 'Per hand'], ['bw', 'Body weight +']].map(([v, l]) => `<button class="${c.load === v ? 'on' : ''}" data-action="cx-load" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="field mt-16"><label for="cx-notes">Instructions <span class="faint">(optional)</span></label><textarea id="cx-notes" class="input" data-input="cx-field" data-k="cues" maxlength="300">${esc(c.cues)}</textarea></div>
    <p class="tiny faint mt-8">Custom exercises are tracked fully but don't count toward Strength Rank, since there's no reference standard for them.</p>
    <button class="btn primary block mt-16" data-action="cx-save">Save exercise</button>`);
}

// =============== history / session / calendar ===============
function renderHistory() {
  const ss = sortedSessions(app.state).reverse();
  const limit = app.ui.histLimit || 30;
  return `<div class="topbar"><button class="back" data-action="go-train">${icon('back')} Train</button><span class="title">HISTORY</span><span style="width:40px"></span></div>
    ${ss.length ? `<div class="card">${ss.slice(0, limit).map(sessionRow).join('')}</div>${ss.length > limit ? `<button class="btn ghost block mt-16" data-action="hist-more">Show more</button>` : ''}` : empty('calendar', 'No workouts yet')}`;
}

function renderSession({ id }) {
  const st = app.state;
  const s = st.sessions.find((x) => x.id === id);
  const u = unit();
  if (!s) return `<div class="topbar"><button class="back" data-action="go-train">${icon('back')} Train</button></div>${empty('calendar', 'Workout not found')}`;
  return `<div class="topbar"><button class="back" data-action="go-back-hist">${icon('back')} Back</button><button class="icon-btn" data-action="session-delete" data-id="${s.id}" aria-label="Delete workout">${icon('trash')}</button></div>
    <div class="eyebrow">${fmtDate(s.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
    <h1 class="h1 mt-8">${esc(s.name)}</h1>
    <div class="stat-row mt-16"><div class="kv"><b>${fmtDuration(s.durationSec || 0)}</b><span>Duration</span></div><div class="kv"><b>${fmtVolume(s.volumeKg || 0, u)}</b><span>Volume</span></div><div class="kv"><b>${s.exercises.reduce((a, e) => a + workSets(e.sets).length, 0)}</b><span>Sets</span></div></div>
    ${s.prs?.length ? `<div class="card mt-16"><div class="eyebrow">Personal records</div>${s.prs.map((p) => `<div class="pr-item"><div class="pr-badge">${icon('trophy', 'sm')}</div><div class="grow h3">${esc(getExercise(p.exId, st.customExercises)?.name || '')}</div><b>${p.weightKg ? fmtWeight(p.weightKg, u) + ' × ' : ''}${p.reps}</b></div>`).join('')}</div>` : ''}
    <div class="col mt-16">${s.exercises.map((e) => {
      const ex = getExercise(e.exId, st.customExercises);
      return `<div class="card"><div class="ex-name">${esc(ex?.name || e.exId)}</div>
        <div class="mt-8">${e.sets.map((x, i) => `<div class="row between small" style="padding:5px 0;border-bottom:1px solid var(--line)"><span class="faint">${x.type === 'warmup' ? 'W' : i + 1 - e.sets.filter((y, j) => j < i && y.type === 'warmup').length}</span><span class="grow" style="margin-left:14px">${x.weightKg ? fmtWeight(x.weightKg, u) : (ex?.load === 'bw' ? 'BW' : '—')} × ${x.reps}</span>${x.rpe ? `<span class="faint">RPE ${x.rpe}</span>` : ''}</div>`).join('')}</div>
        ${e.notes ? `<p class="small muted mt-8">${esc(e.notes)}</p>` : ''}</div>`;
    }).join('')}</div>
    <div class="field mt-16"><label for="sess-notes">Workout notes</label><textarea id="sess-notes" class="input" data-change="session-notes" data-id="${s.id}" maxlength="1000" placeholder="How did it feel?">${esc(s.notes || '')}</textarea></div>
    <button class="btn primary block mt-16" data-action="session-repeat" data-id="${s.id}" ${st.activeWorkout ? 'disabled' : ''}>${icon('copy', 'sm')} Repeat this workout</button>`;
}

function renderCalendar() {
  const st = app.state;
  const m = app.ui.calMonth ? new Date(app.ui.calMonth) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const first = new Date(m.getFullYear(), m.getMonth(), 1);
  const start = addDays(first, -weekdayIdx(first));
  const byDay = {};
  for (const s of st.sessions) (byDay[dayKey(s.date)] ||= []).push(s);
  const sp = activeSplit(st);
  const today = dayKey(new Date());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    const k = dayKey(d);
    const list = byDay[k] || [];
    const plan = sp && sp.schedule[weekdayIdx(d)] && startOfDay(d) > startOfDay(new Date());
    cells.push(`<div class="d ${d.getMonth() !== m.getMonth() ? 'out' : ''} ${k === today ? 'today' : ''} ${list.length ? 'has' : ''} ${list.some((s) => s.prs?.length) ? 'pr' : ''} ${plan ? 'plan' : ''}" ${list.length ? `data-action="view-session" data-id="${list[list.length - 1].id}"` : ''}>${d.getDate()}</div>`);
    if (i >= 34 && addDays(start, i + 1).getMonth() !== m.getMonth() && (i + 1) % 7 === 0) break;
  }
  const inMonth = st.sessions.filter((s) => { const d = new Date(s.date); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear(); });
  return `<div class="topbar"><button class="back" data-action="go-train">${icon('back')} Back</button><span class="title">CALENDAR</span><span style="width:40px"></span></div>
    <div class="card"><div class="row between"><button class="icon-btn sm" data-action="cal-move" data-d="-1" aria-label="Previous month">${icon('back', 'sm')}</button><div class="h2">${m.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div><button class="icon-btn sm" data-action="cal-move" data-d="1" aria-label="Next month">${icon('chev', 'sm')}</button></div>
    <div class="cal mt-16">${WEEKDAYS.map((d) => `<div class="dow">${d[0]}</div>`).join('')}${cells.join('')}</div>
    <div class="row small faint mt-16" style="gap:14px"><span><b class="num" style="color:var(--text)">${inMonth.length}</b> workouts</span><span>● planned</span><span>dot = PR</span></div></div>
    ${inMonth.length ? `<div class="card mt-16">${[...inMonth].reverse().map(sessionRow).join('')}</div>` : ''}`;
}

// =============== registration ===============
function openPicker(picker) { app.ui.picker = picker; app.ui.libQ = ''; go('train', 'library'); }

register('train', { render: renderTrain, actions: {
  'split-menu': () => openSheet(splitMenuSheet),
  'new-split': () => openSheet(newSplitSheet),
  'split-create': (el) => {
    const tpl = TEMPLATES.find((t) => t.id === el.dataset.tpl);
    const st = app.state;
    let sp;
    if (tpl.id === 'custom') { const d = { id: uid('d'), name: 'Day 1', focus: '', slots: [] }; sp = { id: uid('sp'), name: 'Custom Split', templateId: 'custom', days: [d], schedule: [d.id, null, null, null, null, null, null] }; }
    else sp = buildSplitFromTemplate(tpl, { equipment: st.profile.equipment, trainingDays: st.profile.trainingDays });
    update((s) => { s.splits.push(sp); s.activeSplitId = sp.id; });
    closeSheet(); toast(`${esc(sp.name)} is now active`);
  },
  'split-activate': (el) => { update((s) => { s.activeSplitId = el.dataset.id; }); closeSheet(); },
  'split-duplicate': () => {
    update((s) => { const sp = deepClone(activeSplit(s)); const map = {}; sp.id = uid('sp'); sp.name += ' (copy)'; sp.days.forEach((d) => { const n = uid('d'); map[d.id] = n; d.id = n; d.slots.forEach((x) => { x.uid = uid('s'); }); }); sp.schedule = sp.schedule.map((x) => (x ? map[x] : null)); s.splits.push(sp); s.activeSplitId = sp.id; });
    closeSheet(); toast('Split duplicated');
  },
  'split-delete': async () => {
    closeSheet();
    if (!(await confirmSheet({ title: 'Delete this split?', body: 'Logged workouts are kept. Only the plan is removed.', ok: 'Delete', danger: true }))) return;
    update((s) => { s.splits = s.splits.filter((x) => x.id !== s.activeSplitId); s.activeSplitId = s.splits[0]?.id || null; });
  },
  'assign-weekday': (el) => { app.ui.wd = Number(el.dataset.wd); openSheet(weekdaySheet); },
  'assign-set': (el) => { mutSplit((sp) => { sp.schedule[app.ui.wd] = el.dataset.day || null; }); closeSheet(); },
  'add-day': () => {
    const id = uid('d');
    mutSplit((sp) => { sp.days.push({ id, name: `Day ${sp.days.length + 1}`, focus: '', slots: [] }); });
    go('train', 'day', { id });
  },
  'start-day': (el) => startWorkout({ dayId: el.dataset.day }),
  'start-empty': () => startWorkout({}),
  'edit-day': (el) => go('train', 'day', { id: el.dataset.day }),
  'go-train': () => go('train'),
  'go-library': () => { app.ui.picker = null; go('train', 'library'); },
  'go-history': () => go('train', 'history'),
  'go-calendar2': () => go('train', 'calendar'),
  'go-workout': () => go('train', 'workout'),
  'view-session': (el) => { app.ui.fromCalendar = app.route.view === 'calendar'; go('train', 'session', { id: el.dataset.id }); },
} });

register('day', { tab: 'train', render: renderDay, actions: {
  'day-add-ex': (el) => openPicker({ mode: 'day', dayId: el.dataset.day }),
  'slot-move': (el) => {
    const i = Number(el.dataset.i); const dlt = Number(el.dataset.d);
    mutSplit((sp) => { const d = sp.days.find((x) => x.id === el.dataset.day); const j = i + dlt; if (j < 0 || j >= d.slots.length) return; [d.slots[i], d.slots[j]] = [d.slots[j], d.slots[i]]; });
  },
  'slot-edit': (el) => { app.ui.slotEdit = { dayId: el.dataset.day, i: Number(el.dataset.i) }; openSheet(slotSheet); },
  'slot-step': (el) => {
    const k = el.dataset.k; const dl = Number(el.dataset.delta);
    mutSplit((sp) => {
      const s = sp.days.find((x) => x.id === el.dataset.day).slots[Number(el.dataset.i)];
      if (k === 'rest') s.rest = Math.max(15, Math.min(600, s.rest + dl * 15));
      else if (k === 'rpe') s.rpe = s.rpe ? (s.rpe + dl * 0.5 < 5 ? null : Math.min(10, s.rpe + dl * 0.5)) : (dl > 0 ? 6 : null);
      else if (k === 'sets') s.sets = Math.max(1, Math.min(12, s.sets + dl));
      else if (k === 'repMin') { s.repMin = Math.max(1, Math.min(100, s.repMin + dl)); s.repMax = Math.max(s.repMax, s.repMin); }
      else if (k === 'repMax') { s.repMax = Math.max(1, Math.min(100, s.repMax + dl)); s.repMin = Math.min(s.repMin, s.repMax); }
    });
  },
  'slot-warmup': (el) => mutSplit((sp) => { const s = sp.days.find((x) => x.id === el.dataset.day).slots[Number(el.dataset.i)]; s.warmup = !s.warmup; }),
  'slot-swap': (el) => { closeSheet(); openPicker({ mode: 'swap-slot', dayId: el.dataset.day, i: Number(el.dataset.i), exId: activeSplit(app.state).days.find((x) => x.id === el.dataset.day).slots[Number(el.dataset.i)].exId }); },
  'slot-remove': (el) => { mutSplit((sp) => { sp.days.find((x) => x.id === el.dataset.day).slots.splice(Number(el.dataset.i), 1); }); closeSheet(); },
  'day-menu': (el) => { app.ui.dayMenu = el.dataset.day; openSheet(dayMenuSheet); },
  'day-duplicate': (el) => {
    const id = uid('d');
    mutSplit((sp) => { const d = sp.days.find((x) => x.id === el.dataset.day); const c = deepClone(d); c.id = id; c.name += ' (copy)'; c.slots.forEach((s) => { s.uid = uid('s'); }); sp.days.push(c); });
    closeSheet(); go('train', 'day', { id }); toast('Day duplicated');
  },
  'day-delete': async (el) => {
    closeSheet();
    if (!(await confirmSheet({ title: 'Delete this day?', body: 'It will also be removed from your weekly schedule.', ok: 'Delete', danger: true }))) return;
    mutSplit((sp) => { sp.days = sp.days.filter((x) => x.id !== el.dataset.day); sp.schedule = sp.schedule.map((x) => (x === el.dataset.day ? null : x)); });
    go('train');
  },
}, inputs: {
  'day-field': (el) => mutSplit((sp) => { const d = sp.days.find((x) => x.id === el.dataset.day); d[el.dataset.k] = el.value.trim().slice(0, 50) || (el.dataset.k === 'name' ? 'Untitled' : ''); }),
  'slot-notes': (el) => mutSplit((sp) => { sp.days.find((x) => x.id === el.dataset.day).slots[Number(el.dataset.i)].notes = el.value.slice(0, 300); }),
  'split-rename': (el) => mutSplit((sp) => { sp.name = el.value.trim().slice(0, 40) || 'My Split'; }),
} });

register('library', { tab: 'train', render: renderLibrary, actions: {
  'lib-back': () => {
    const p = app.ui.picker; app.ui.picker = null;
    if (p?.mode === 'day' || p?.mode === 'swap-slot') go('train', 'day', { id: p.dayId });
    else if (p?.mode === 'workout' || p?.mode === 'swap') go('train', 'workout');
    else go('train');
  },
  'lib-muscle': (el) => { app.ui.libMuscle = el.dataset.m; renderNow(); },
  'lib-avail': () => { app.ui.libAvail = !(app.ui.libAvail ?? true); renderNow(); },
  'ex-detail': (el) => { app.ui.exDetail = el.dataset.id; openSheet(exDetailSheet); },
  'pick-ex': (el) => {
    const p = app.ui.picker; const id = el.dataset.id; app.ui.picker = null;
    if (p.mode === 'day') {
      mutSplit((sp, st) => { sp.days.find((x) => x.id === p.dayId).slots.push(makeSlot(id, 3, st.customExercises)); });
      go('train', 'day', { id: p.dayId }); toast(`Added ${esc(getExercise(id, app.state.customExercises).name)}`);
    } else if (p.mode === 'swap-slot') {
      mutSplit((sp, st) => { const d = sp.days.find((x) => x.id === p.dayId); const old = d.slots[p.i]; d.slots[p.i] = { ...makeSlot(id, old.sets, st.customExercises), sets: old.sets, notes: '' }; });
      go('train', 'day', { id: p.dayId });
    } else if (p.mode === 'workout') {
      addExerciseToWorkout(id); go('train', 'workout');
    } else if (p.mode === 'swap') {
      app.actions['wk-swap-apply']?.(id, p.exUid); go('train', 'workout');
    }
  },
  'custom-new': () => { app.ui.custom = { name: '', muscles: [], needs: [], load: 'load', cues: '' }; openSheet(customSheet); },
  'cx-muscle': (el) => { const c = app.ui.custom; const m = el.dataset.m; c.muscles = c.muscles.includes(m) ? c.muscles.filter((x) => x !== m) : [...c.muscles, m]; renderSheet(); },
  'cx-equip': (el) => { const c = app.ui.custom; const e = el.dataset.e; c.needs = c.needs.includes(e) ? c.needs.filter((x) => x !== e) : [...c.needs, e]; renderSheet(); },
  'cx-load': (el) => { app.ui.custom.load = el.dataset.v; renderSheet(); },
  'cx-save': () => {
    const c = app.ui.custom;
    if (!c.name.trim()) { toast('Give the exercise a name'); return; }
    if (!c.muscles.length) { toast('Pick at least one muscle'); return; }
    const ex = { id: uid('cx'), name: c.name.trim(), needs: c.needs, pattern: 'iso', muscles: c.muscles, secondary: [], load: c.load, rank: null, lower: c.muscles.some((m) => ['quads', 'hamstrings', 'glutes', 'calves'].includes(m)), reps: [8, 12], rest: 90, cues: c.cues.trim() ? [c.cues.trim()] : [], alt: [], custom: true };
    update((s) => { s.customExercises.push(ex); });
    closeSheet(); toast('Custom exercise saved');
    if (app.ui.picker) app.actions['pick-ex']({ dataset: { id: ex.id } });
  },
  'custom-delete': async (el) => {
    const id = el.dataset.id;
    const used = app.state.sessions.some((s) => s.exercises.some((e) => e.exId === id)) || app.state.splits.some((sp) => sp.days.some((d) => d.slots.some((x) => x.exId === id)));
    closeSheet();
    if (used) { toast('This exercise is used in your history or split, so it can\'t be deleted.'); return; }
    if (await confirmSheet({ title: 'Delete custom exercise?', ok: 'Delete', danger: true })) update((s) => { s.customExercises = s.customExercises.filter((x) => x.id !== id); });
  },
}, inputs: {
  'lib-q': (el) => { app.ui.libQ = el.value; const list = document.getElementById('lib-list'); if (list) list.innerHTML = libraryList(); },
  'cx-field': (el) => { app.ui.custom[el.dataset.k] = el.value; },
} });

register('history', { tab: 'train', render: renderHistory, actions: { 'hist-more': () => { app.ui.histLimit = (app.ui.histLimit || 30) + 30; renderNow(); } } });

register('session', { tab: 'train', render: renderSession, actions: {
  'go-back-hist': () => go('train', app.ui.fromCalendar ? 'calendar' : 'history'),
  'session-repeat': (el) => startWorkout({ fromSessionId: el.dataset.id }),
  'session-delete': async (el) => {
    if (!(await confirmSheet({ title: 'Delete this workout?', body: 'Its sets and PRs are removed from history. Ranks you\'ve already earned are kept.', ok: 'Delete', danger: true }))) return;
    update((s) => { s.sessions = s.sessions.filter((x) => x.id !== el.dataset.id); s.prs = s.prs.filter((p) => p.sessionId !== el.dataset.id); }, { immediate: true });
    toast('Workout deleted'); go('train', 'history');
  },
}, inputs: {
  'session-notes': (el) => update((s) => { const x = s.sessions.find((y) => y.id === el.dataset.id); if (x) x.notes = el.value.slice(0, 1000); }, { silent: true }),
} });

register('calendar', { tab: 'train', render: renderCalendar, actions: {
  'cal-move': (el) => { const m = app.ui.calMonth ? new Date(app.ui.calMonth) : new Date(new Date().getFullYear(), new Date().getMonth(), 1); app.ui.calMonth = new Date(m.getFullYear(), m.getMonth() + Number(el.dataset.d), 1).toISOString(); renderNow(); },
} });

