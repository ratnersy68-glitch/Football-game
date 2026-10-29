import { app, register, go, update, openSheet, closeSheet, toast, confirmSheet } from '../app.js';
import { icon } from '../ui/icons.js';
import { sheetFrame, empty, bar } from '../ui/components.js';
import { getExercise } from '../data/exercises.js';
import { makeSlot } from '../data/templates.js';
import { lastPerformance, workSets, sessionVolumeKg } from '../engine/history.js';
import { warmupRamp, readinessScore, COACH_LABEL, targetFor } from '../engine/coach.js';
import { goalStatus, goalTitle } from '../engine/goals.js';
import { displayRank } from '../engine/rank.js';
import { levelInfo, ACHIEVEMENTS } from '../engine/xp.js';
import { emblem } from '../ui/emblems.js';
import { demoThumb, hasDemo } from '../ui/demo.js';
import { finishWorkout, discardWorkout, elapsedSec, startRest, startWorkout } from '../flows.js';
import { haptic, sound } from '../ui/feedback.js';
import { esc, fmtWeight, fromKg, toKg, roundDisplay, parseNum, fmtDuration, fmtVolume, uid } from '../util.js';
import { store } from '../store.js';

const unit = () => app.unit;
const wk = () => app.state.activeWorkout;
const findEx = (w, u) => w.exercises.find((e) => e.uid === u);
const dispW = (kg) => (kg == null ? '' : String(roundDisplay(fromKg(kg, unit()), unit())));

function lastLine(st, e, ex) {
  const last = lastPerformance(st, e.exId, wk().startedAt);
  if (!last) return 'First time';
  const w = last.topWeightKg ? fmtWeight(last.topWeightKg, unit()) : (ex?.load === 'bw' ? 'BW' : '—');
  return `${w} × ${last.topReps}`;
}

function targetLine(t, ex) {
  if (!t || t.kind === 'start' || t.weightKg == null) return t ? `${t.repMin}–${t.repMax} reps` : '—';
  const w = t.weightKg ? fmtWeight(t.weightKg, unit()) : (ex?.load === 'bw' ? 'BW' : '—');
  return `${w} × ${t.reps}`;
}

function coachNote(e) {
  const t = e.target;
  if (!t) return '';
  if (t.needsConfirm && t.suggestion && !e.decided) {
    const s = t.suggestion;
    return `<div class="coach-note suggest"><div class="row between"><span class="ai-label"><i></i>${t.kind === 'deload' ? 'Coach: reset option' : 'Coach: ready to progress'}</span></div>
      <p class="mt-8" style="color:var(--text)">${esc(t.why)}</p>
      <div class="row mt-8"><button class="btn xs primary" data-action="wk-accept" data-ex="${e.uid}">Use ${esc(fmtWeight(s.weightKg, unit()))} × ${s.reps}</button><button class="btn xs ghost" data-action="wk-keep" data-ex="${e.uid}">Keep ${esc(fmtWeight(t.weightKg, unit()))}</button></div></div>`;
  }
  if (!e.showWhy) return `<button class="coach-note" style="display:block;width:calc(100% - 32px);text-align:left" data-action="wk-why" data-ex="${e.uid}">${icon('info', 'sm')} Why this target?</button>`;
  return `<div class="coach-note" data-action="wk-why" data-ex="${e.uid}"><span class="ai-label"><i></i>${COACH_LABEL}</span><p class="mt-8">${esc(t.why)}</p></div>`;
}

function setRow(e, s, i, n, ex) {
  const flash = app.ui.flash === `${e.uid}:${i}`;
  const isBw = ex?.load === 'bw' || ex?.load === 'assist';
  const wPh = s.tw != null ? dispW(s.tw) : (isBw ? '0' : '—');
  return `<div class="set-row ${s.done ? 'done' : ''} ${s.type === 'warmup' ? 'warm' : ''} ${flash ? 'flash' : ''}">
    <span class="idx" data-action="wk-set-menu" data-ex="${e.uid}" data-i="${i}" title="Set options">${s.type === 'warmup' ? 'W' : n}</span>
    <input inputmode="decimal" aria-label="Weight" placeholder="${esc(wPh)}" value="${dispW(s.weightKg)}" data-input="wk-field" data-k="weightKg" data-ex="${e.uid}" data-i="${i}" maxlength="6">
    <input inputmode="numeric" aria-label="Reps" placeholder="${s.tr ?? '—'}" value="${s.reps ?? ''}" data-input="wk-field" data-k="reps" data-ex="${e.uid}" data-i="${i}" maxlength="3">
    <input class="rpe" inputmode="decimal" aria-label="RPE" placeholder="RPE" value="${s.rpe ?? ''}" data-input="wk-field" data-k="rpe" data-ex="${e.uid}" data-i="${i}" maxlength="4">
    <button class="set-check" data-action="wk-done" data-ex="${e.uid}" data-i="${i}" aria-label="${s.done ? 'Mark set incomplete' : 'Complete set'}">${icon('check')}</button>
  </div>`;
}

function exCard(e) {
  const st = app.state;
  const ex = getExercise(e.exId, st.customExercises);
  let n = 0;
  const wu = ex?.load === 'perHand' ? ' (each)' : ex?.load === 'bw' ? ' (+added)' : ex?.load === 'assist' ? ' (assist)' : '';
  return `<div class="card ex-card" id="ex-${e.uid}">
    <div class="ex-top"><div class="row between"><div class="ex-name grow">${esc(ex?.name || 'Exercise')}</div><button class="icon-btn sm" data-action="wk-ex-menu" data-ex="${e.uid}" aria-label="Exercise options">${icon('dots', 'sm')}</button></div>
      <button class="demo-row" data-action="demo-open" data-ex="${esc(e.exId)}">${demoThumb(e.exId, { tag: 'span' })}<span class="grow"><span class="watch"><i>▶</i>Watch demonstration</span><span class="tiny faint" style="display:block">${hasDemo(e.exId) ? 'Your sets stay logged' : 'Steps, mistakes & form tips'}</span></span>${icon('chev', 'sm')}</button>
      <div class="ex-meta"><div class="m"><span>Last session</span><b>${esc(lastLine(st, e, ex))}</b></div><div class="m target"><span>Today's target</span><b>${esc(targetLine(e.target, ex))}</b></div></div></div>
    ${coachNote(e)}
    ${e.notes ? `<p class="small muted" style="padding:10px 16px 0">${icon('note', 'sm')} ${esc(e.notes)}</p>` : ''}
    <div class="set-head mt-8"><span>Set</span><span style="text-align:center">${unit() === 'lb' ? 'lbs' : 'kg'}${wu}</span><span style="text-align:center">Reps</span><span style="text-align:center">RPE</span><span></span></div>
    ${e.sets.map((s, i) => setRow(e, s, i, s.type === 'warmup' ? 0 : ++n, ex)).join('')}
    <div class="ex-actions">
      <button class="btn xs ghost" data-action="wk-add-set" data-ex="${e.uid}">${icon('plus', 'sm')} Set</button>
      ${!e.sets.some((s) => s.type === 'warmup') && e.target?.weightKg ? `<button class="btn xs ghost" data-action="wk-warmups" data-ex="${e.uid}">Warm-ups</button>` : ''}
      <button class="btn xs ghost" data-action="wk-rest" data-ex="${e.uid}">${icon('timer', 'sm')} ${fmtDuration(e.slot?.rest || st.prefs.defaultRest)}</button>
      <button class="btn xs ghost" data-action="wk-swap" data-ex="${e.uid}">${icon('swap', 'sm')} Swap</button>
    </div>
  </div>`;
}

function render() {
  const w = wk();
  const st = app.state;
  if (!w) return `<div class="topbar"><button class="back" data-action="go-train">${icon('back')} Train</button></div>${empty('train', 'No active workout', '', '<button class="btn primary" data-action="go-train">Choose a workout</button>')}`;
  const done = w.exercises.reduce((a, e) => a + workSets(e.sets).length, 0);
  const planned = w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.type !== 'warmup').length, 0);
  const rs = readinessScore(w.readiness);
  return `
    <div class="wk-head"><div class="row between" style="max-width:1120px;margin:0 auto">
      <button class="icon-btn sm" data-action="wk-minimize" aria-label="Minimize">${icon('chevDown', 'sm')}</button>
      <div class="center grow"><div class="h3">${esc(w.name)}</div><div class="wk-timer faint"><span data-wk-elapsed>${fmtDuration(elapsedSec(w))}</span>${w.pausedAt ? ' · PAUSED' : ''}</div></div>
      <button class="icon-btn sm" data-action="wk-pause" aria-label="${w.pausedAt ? 'Resume' : 'Pause'}">${icon(w.pausedAt ? 'play' : 'pause', 'sm')}</button>
    </div><div class="mt-8" style="max-width:1120px;margin:8px auto 0">${bar(planned ? done / planned : 0)}</div></div>
    ${rs != null && rs <= 2 ? `<div class="banner info">${icon('heart')}<span>Low readiness today — targets are set to match last time. Quality over quantity.</span></div>` : ''}
    <div class="col mt-16" style="max-width:720px;margin-left:auto;margin-right:auto;gap:14px">
      ${w.exercises.map((e) => exCard(e)).join('') || empty('plus', 'Empty workout', 'Add your first exercise.')}
      <button class="btn ghost block" data-action="wk-add-ex">${icon('plus', 'sm')} Add exercise</button>
      <div class="field mt-8"><label for="wk-notes">Workout notes</label><textarea id="wk-notes" class="input" data-input="wk-notes" placeholder="Energy, technique, anything worth remembering" maxlength="1000">${esc(w.notes || '')}</textarea></div>
      <button class="btn danger block" data-action="wk-discard">Discard workout</button>
      <div style="height:90px"></div>
    </div>
    <div class="wk-footer"><div class="inner"><div class="grow small muted" style="align-self:center"><b class="num" style="color:var(--text)">${done}</b> / ${planned} sets</div><button class="btn primary" data-action="wk-finish" style="min-width:160px">${icon('check', 'sm')} Finish</button></div></div>
    <div id="rest-root"></div>`;
}

function restPill() {
  const w = wk();
  const root = document.getElementById('rest-root');
  if (!root) return;
  if (!w?.rest) { root.innerHTML = ''; return; }
  const left = Math.max(0, Math.ceil((w.rest.endsAt - Date.now()) / 1000));
  const pct = 1 - left / w.rest.total;
  const r = 12; const c = 2 * Math.PI * r;
  if (!root.firstChild) {
    root.innerHTML = `<div class="rest-pill" role="timer" aria-live="off"><svg class="ring-mini" viewBox="0 0 30 30" style="transform:rotate(-90deg)"><circle cx="15" cy="15" r="${r}" stroke="rgba(127,127,127,.3)" stroke-width="3" fill="none"/><circle data-rest-ring cx="15" cy="15" r="${r}" stroke="var(--accent)" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}"/></svg>
      <span class="t" data-rest-t>${fmtDuration(left)}</span><button data-action="rest-add" data-s="-15">−15</button><button data-action="rest-add" data-s="15">+15</button><button data-action="rest-skip">Skip</button></div>`;
  }
  root.querySelector('[data-rest-t]').textContent = fmtDuration(left);
  root.querySelector('[data-rest-ring]').setAttribute('stroke-dashoffset', String(c * (1 - pct)));
}

function tick() {
  const w = wk();
  if (!w) return;
  const el = document.querySelector('[data-wk-elapsed]');
  if (el) el.textContent = fmtDuration(elapsedSec(w));
  if (w.rest) {
    if (Date.now() >= w.rest.endsAt) {
      update((s) => { s.activeWorkout.rest = null; }, { silent: true });
      sound('rest'); haptic('success');
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        try { new Notification('Rest complete', { body: 'Time for your next set.', tag: 'ascend-rest', silent: false }); } catch { /* ignore */ }
      }
      const root = document.getElementById('rest-root'); if (root) root.innerHTML = '';
    } else restPill();
  }
}

function mutW(fn, opts) { update((s) => { if (s.activeWorkout) fn(s.activeWorkout, s); }, opts); }

function exMenuSheet() {
  const w = wk(); const e = findEx(w, app.ui.exMenu); if (!e) return sheetFrame('Exercise', '');
  const ex = getExercise(e.exId, app.state.customExercises);
  const i = w.exercises.indexOf(e);
  return sheetFrame(ex?.name || 'Exercise', `
    <div class="field"><label for="ex-notes">Exercise notes</label><textarea id="ex-notes" class="input" data-input="wk-ex-notes" data-ex="${e.uid}" maxlength="300" placeholder="Seat height, grip, cues…">${esc(e.notes || '')}</textarea></div>
    ${ex?.cues?.length ? `<div class="label mt-16">Technique</div><ol class="small" style="padding-left:18px;margin:6px 0 0;line-height:1.6">${ex.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : ''}
    <div class="grid grid-2 mt-24">
      <button class="btn ghost" data-action="wk-ex-move" data-ex="${e.uid}" data-d="-1" ${i === 0 ? 'disabled' : ''}>${icon('up', 'sm')} Move up</button>
      <button class="btn ghost" data-action="wk-ex-move" data-ex="${e.uid}" data-d="1" ${i === w.exercises.length - 1 ? 'disabled' : ''}>${icon('down', 'sm')} Move down</button>
      <button class="btn ghost" data-action="wk-swap" data-ex="${e.uid}">${icon('swap', 'sm')} Swap</button>
      <button class="btn danger" data-action="wk-ex-remove" data-ex="${e.uid}">${icon('trash', 'sm')} Remove</button>
    </div>`);
}

function setMenuSheet() {
  const { ex: u, i } = app.ui.setMenu;
  const e = findEx(wk(), u); const s = e?.sets[i]; if (!s) return sheetFrame('Set', '');
  return sheetFrame('Set options', `<div class="col">
    <button class="btn ghost block" data-action="wk-set-type" data-ex="${u}" data-i="${i}">${s.type === 'warmup' ? 'Mark as working set' : 'Mark as warm-up'}</button>
    <button class="btn ghost block" data-action="wk-set-dup" data-ex="${u}" data-i="${i}">${icon('copy', 'sm')} Duplicate set</button>
    <button class="btn danger block" data-action="wk-set-del" data-ex="${u}" data-i="${i}">${icon('trash', 'sm')} Delete set</button></div>`);
}

// ---------- summary ----------
function renderSummary({ id }) {
  const st = app.state;
  const s = st.sessions.find((x) => x.id === id);
  if (!s) { return `<div class="topbar"><button class="back" data-action="go-home">${icon('back')} Home</button></div>${empty('check', 'Workout saved')}`; }
  const u = unit();
  const sum = app.ui.summary?.sessionId === id ? app.ui.summary : {};
  const sets = s.exercises.reduce((a, e) => a + workSets(e.sets).length, 0);
  const dr = displayRank(st);
  const lv = levelInfo(st.xp.total);
  const goals = (st.goals || []).filter((g) => !g.archived && !g.completedAt).slice(0, 2);
  return `
    <div class="card marble center" style="padding:32px 18px 26px;overflow:hidden">
      <div class="eyebrow">Workout complete</div>
      <h1 class="h-display mt-8" style="font-size:40px">${esc(s.name)}</h1>
      <p class="muted mt-8">${new Date(s.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      <div class="stat-row mt-24">
        <div class="kv"><b>${fmtVolume(s.volumeKg ?? sessionVolumeKg(st, s), u)}</b><span>Volume</span></div>
        <div class="kv"><b>${sets}</b><span>Sets</span></div>
        <div class="kv"><b>${fmtDuration(s.durationSec)}</b><span>Time</span></div>
      </div>
    </div>
    ${s.prs?.length ? `<div class="card mt-16"><div class="row between"><div class="eyebrow">Personal records</div><span class="tag accent">${s.prs.length} new</span></div>
      ${s.prs.map((p) => `<div class="pr-item"><div class="pr-badge">${icon('trophy', 'sm')}</div><div class="grow"><div class="h3">${esc(getExercise(p.exId, st.customExercises)?.name || '')}</div><div class="small muted">${p.kind === 'e1rm' ? `Est. max ${fmtWeight(p.value, u)} (was ${fmtWeight(p.prev, u)})` : p.kind === 'weight' ? `Heaviest weight (was ${fmtWeight(p.prev, u)})` : `Most reps (was ${p.prev})`}</div></div><b class="num">${p.weightKg ? fmtWeight(p.weightKg, u) + ' × ' : ''}${p.reps}</b></div>`).join('')}</div>` : ''}
    <div class="card mt-16"><div class="row between"><div class="eyebrow">Experience</div><b class="accent">+${s.xp || 0} XP</b></div>
      ${(sum.xpItems || []).map((x) => `<div class="row between small mt-8"><span class="muted">${esc(x.reason)}</span><span>${x.amount ? `+${x.amount}` : '—'}</span></div>`).join('')}
      <div class="row between small mt-16"><span>Level ${lv.level}${sum.levelUp ? ' <span class="tag accent">Level up</span>' : ''}</span><span class="faint">${lv.into} / ${lv.need}</span></div><div class="mt-8">${bar(lv.progress)}</div>
      ${(sum.achievements || []).length ? `<div class="mt-16">${sum.achievements.map((a) => `<span class="tag dark" style="margin:0 6px 6px 0">${esc(ACHIEVEMENTS.find((x) => x.id === a)?.name || a)}</span>`).join('')}</div>` : ''}
    </div>
    <div class="card dark hero-rank mt-16">${emblem(dr.idx, { glow: dr.idx > 0 })}<div class="grow"><div class="eyebrow" style="color:#8E99A4">${dr.youth ? 'Development rank' : 'Strength rank'}</div><div class="h2 mt-8" style="text-transform:uppercase;letter-spacing:.08em">${esc(dr.rank.name)}</div>
      <div class="mt-16">${bar(dr.progress)}</div><div class="tiny mt-8" style="color:#8E99A4">${dr.placed ? (dr.next ? `${Math.round(dr.progress * 100)}% to ${esc(dr.next.name)}` : 'Top rank') : `${dr.placementLeft} placement workout${dr.placementLeft === 1 ? '' : 's'} left`}</div></div></div>
    ${goals.length ? `<div class="card mt-16"><div class="eyebrow">Goal progress</div>${goals.map((g) => { const gs = goalStatus(st, g); return `<div class="mt-16"><div class="row between small"><b>${esc(goalTitle(g, u))}</b><span class="num">${Math.round(gs.pct * 100)}%</span></div><div class="mt-8">${bar(gs.pct)}</div>${gs.next ? `<div class="tiny faint mt-8">Next milestone: ${esc(gs.next.label)}</div>` : ''}</div>`; }).join('')}</div>` : ''}
    <div class="row mt-24"><button class="btn ghost grow" data-action="view-session" data-id="${s.id}">Details</button><button class="btn primary grow" data-action="go-home">Done</button></div>`;
}

register('workout', {
  tab: 'train', noNav: true,
  render,
  mount() {
    clearInterval(app.ui._wkTick);
    app.ui._wkTick = setInterval(() => { if (app.route.view !== 'workout') { clearInterval(app.ui._wkTick); return; } tick(); }, 500);
    restPill();
    if (app.ui.flash) { const f = app.ui.flash; setTimeout(() => { if (app.ui.flash === f) app.ui.flash = null; }, 800); }
    if (app.ui.scrollTo) { document.getElementById(app.ui.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); app.ui.scrollTo = null; }
  },
  actions: {
    'wk-minimize': () => go('home'),
    'wk-pause': () => mutW((w) => {
      if (w.pausedAt) { w.pausedMs += Date.now() - new Date(w.pausedAt).getTime(); w.pausedAt = null; } else { w.pausedAt = new Date().toISOString(); w.rest = null; }
    }),
    'wk-done': (el) => {
      const u = el.dataset.ex; const i = Number(el.dataset.i);
      const w = wk(); const e = findEx(w, u); const s = e.sets[i];
      const ex = getExercise(e.exId, app.state.customExercises);
      if (s.done) { mutW((ww) => { findEx(ww, u).sets[i].done = false; }); return; }
      const weightKg = s.weightKg ?? s.tw ?? (ex?.load === 'bw' || ex?.load === 'assist' ? 0 : null);
      const reps = s.reps ?? s.tr;
      if (weightKg == null) { toast('Enter the weight for this set'); el.closest('.set-row').querySelector('input')?.focus(); return; }
      if (!(reps >= 1)) { toast('Enter the reps for this set'); el.closest('.set-row').querySelectorAll('input')[1]?.focus(); return; }
      if (w.pausedAt) mutW((ww) => { ww.pausedMs += Date.now() - new Date(ww.pausedAt).getTime(); ww.pausedAt = null; }, { silent: true });
      app.ui.flash = `${u}:${i}`;
      const rest = e.slot?.rest || app.state.prefs.defaultRest;
      mutW((ww) => {
        const ss = findEx(ww, u).sets[i];
        Object.assign(ss, { weightKg, reps, done: true, ts: new Date().toISOString() });
        // carry a changed weight forward to later untouched sets of the same type
        findEx(ww, u).sets.forEach((x, j) => { if (j > i && !x.done && x.type === ss.type && x.weightKg == null) x.tw = weightKg; });
        if (app.state.prefs.autoRest && ss.type !== 'warmup') ww.rest = { endsAt: Date.now() + rest * 1000, total: rest, exUid: u };
      });
      haptic('set'); sound('set');
    },
    'wk-add-set': (el) => mutW((w) => {
      const e = findEx(w, el.dataset.ex);
      const last = [...e.sets].reverse().find((s) => s.type !== 'warmup');
      e.sets.push({ type: 'work', weightKg: null, reps: null, rpe: null, done: false, tw: last?.weightKg ?? last?.tw ?? e.target?.weightKg ?? null, tr: last?.reps ?? last?.tr ?? e.target?.reps ?? null });
    }),
    'wk-warmups': (el) => mutW((w, st) => {
      const e = findEx(w, el.dataset.ex);
      const ex = getExercise(e.exId, st.customExercises);
      const ramp = warmupRamp(e.target.weightKg, st.profile.unit, ex).map((x) => ({ type: 'warmup', weightKg: null, reps: null, rpe: null, done: false, tw: x.weightKg, tr: x.reps }));
      e.sets.unshift(...ramp);
    }),
    'wk-rest': (el) => { const e = findEx(wk(), el.dataset.ex); startRest(e.slot?.rest || app.state.prefs.defaultRest, e.uid); restPill(); },
    'rest-add': (el) => { mutW((w) => { if (w.rest) { w.rest.endsAt += Number(el.dataset.s) * 1000; w.rest.total = Math.max(15, w.rest.total + Number(el.dataset.s)); } }, { silent: true }); restPill(); },
    'rest-skip': () => { mutW((w) => { w.rest = null; }, { silent: true }); const r = document.getElementById('rest-root'); if (r) r.innerHTML = ''; },
    'wk-why': (el) => mutW((w) => { const e = findEx(w, el.dataset.ex); e.showWhy = !e.showWhy; }),
    'wk-accept': (el) => {
      const u = el.dataset.ex;
      mutW((w, st) => {
        const e = findEx(w, u); const sg = e.target.suggestion;
        st.coach.accepted[e.exId] = { weightKg: sg.weightKg, date: new Date().toISOString() };
        e.decided = true; e.target = { ...e.target, weightKg: sg.weightKg, reps: sg.reps, kind: 'increase', why: `You accepted ${fmtWeight(sg.weightKg, st.profile.unit)} × ${sg.reps}. ${e.target.why}` };
        const ex = getExercise(e.exId, st.customExercises);
        e.sets.forEach((s) => { if (!s.done && s.type === 'work') { s.tw = sg.weightKg; s.tr = sg.reps; } if (!s.done && s.type === 'warmup') s.del = true; });
        if (e.sets.some((s) => s.del)) {
          e.sets = e.sets.filter((s) => !s.del);
          e.sets.unshift(...warmupRamp(sg.weightKg, st.profile.unit, ex).map((x) => ({ type: 'warmup', weightKg: null, reps: null, rpe: null, done: false, tw: x.weightKg, tr: x.reps })));
        }
      });
      haptic('tap');
    },
    'wk-keep': (el) => mutW((w) => { findEx(w, el.dataset.ex).decided = true; }),
    'wk-ex-menu': (el) => { app.ui.exMenu = el.dataset.ex; openSheet(exMenuSheet); },
    'wk-ex-move': (el) => { mutW((w) => { const i = w.exercises.findIndex((e) => e.uid === el.dataset.ex); const j = i + Number(el.dataset.d); if (j < 0 || j >= w.exercises.length) return; [w.exercises[i], w.exercises[j]] = [w.exercises[j], w.exercises[i]]; }); closeSheet(); },
    'wk-ex-remove': async (el) => {
      const u = el.dataset.ex;
      const e = findEx(wk(), u);
      closeSheet();
      if (e.sets.some((s) => s.done) && !(await confirmSheet({ title: 'Remove exercise?', body: 'Its completed sets will be removed from this workout.', ok: 'Remove', danger: true }))) return;
      mutW((w) => { w.exercises = w.exercises.filter((x) => x.uid !== u); });
    },
    'wk-swap': (el) => { closeSheet(); app.ui.picker = { mode: 'swap', exUid: el.dataset.ex, exId: findEx(wk(), el.dataset.ex).exId }; app.ui.libQ = ''; app.ui.libMuscle = 'all'; go('train', 'library'); },
    'wk-swap-apply': (newId, exUid) => {
      mutW((w, st) => {
        const i = w.exercises.findIndex((e) => e.uid === exUid); if (i < 0) return;
        const old = w.exercises[i];
        const doneSets = old.sets.filter((s) => s.done);
        const remaining = Math.max(1, old.sets.filter((s) => !s.done && s.type !== 'warmup').length);
        const slot = { ...makeSlot(newId, remaining, st.customExercises), sets: remaining };
        const t = targetFor(st, slot, { readiness: readinessScore(w.readiness) });
        const fresh = { uid: uid('x'), exId: newId, slot: { ...old.slot, ...slot, sets: remaining }, notes: '', target: t,
          sets: Array.from({ length: remaining }, () => ({ type: 'work', weightKg: null, reps: null, rpe: null, done: false, tw: t.weightKg, tr: t.reps })) };
        if (doneSets.length) { old.sets = doneSets; w.exercises.splice(i + 1, 0, fresh); } else w.exercises[i] = fresh;
        app.ui.scrollTo = `ex-${fresh.uid}`;
      });
      toast(`Swapped to ${esc(getExercise(newId, store.state.customExercises)?.name || '')}`);
    },
    'wk-set-menu': (el) => { app.ui.setMenu = { ex: el.dataset.ex, i: Number(el.dataset.i) }; openSheet(setMenuSheet); },
    'wk-set-type': (el) => { mutW((w) => { const s = findEx(w, el.dataset.ex).sets[Number(el.dataset.i)]; s.type = s.type === 'warmup' ? 'work' : 'warmup'; }); closeSheet(); },
    'wk-set-dup': (el) => { mutW((w) => { const e = findEx(w, el.dataset.ex); const s = e.sets[Number(el.dataset.i)]; e.sets.splice(Number(el.dataset.i) + 1, 0, { ...s, done: false, ts: null }); }); closeSheet(); },
    'wk-set-del': (el) => { mutW((w) => { findEx(w, el.dataset.ex).sets.splice(Number(el.dataset.i), 1); }); closeSheet(); },
    'wk-add-ex': () => { app.ui.picker = { mode: 'workout' }; app.ui.libQ = ''; go('train', 'library'); },
    'wk-finish': () => finishWorkout(),
    'wk-discard': () => discardWorkout(),
  },
  inputs: {
    'wk-field': (el) => {
      const k = el.dataset.k; const i = Number(el.dataset.i);
      let v;
      if (k === 'weightKg') { const n = parseNum(el.value, { min: 0, max: unit() === 'lb' ? 2000 : 900 }); v = n == null ? null : toKg(n, unit()); }
      else if (k === 'reps') { const n = parseNum(el.value, { min: 0, max: 300 }); v = n == null ? null : Math.round(n); }
      else { const n = parseNum(el.value, { min: 1, max: 10 }); v = n == null ? null : Math.round(n * 2) / 2; }
      el.classList.toggle('invalid', el.value !== '' && v == null);
      mutW((w) => { const s = findEx(w, el.dataset.ex)?.sets[i]; if (s) s[k] = v; }, { silent: true });
    },
    'wk-notes': (el) => mutW((w) => { w.notes = el.value.slice(0, 1000); }, { silent: true }),
    'wk-ex-notes': (el) => mutW((w) => { const e = findEx(w, el.dataset.ex); if (e) e.notes = el.value.slice(0, 300); }, { silent: true }),
  },
});

register('summary', { tab: 'train', render: renderSummary, actions: {
  'go-home': () => go('home'),
  'repeat-last': (el) => startWorkout({ fromSessionId: el.dataset.id }),
} });

