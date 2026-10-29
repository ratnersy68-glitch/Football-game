import { app, register, go, openSheet, closeSheet, renderSheet } from '../app.js';
import { icon } from '../ui/icons.js';
import { bar } from '../ui/components.js';
import { emblem } from '../ui/emblems.js';
import { displayRank, plannedDaysPerWeek } from '../engine/rank.js';
import { levelInfo, titleFor, currentWeekStreak } from '../engine/xp.js';
import { goalStatus, goalTitle } from '../engine/goals.js';
import { getExercise } from '../data/exercises.js';
import { todaysDay, nextPlanned, trainedToday, activeSplit, startWorkout, elapsedSec } from '../flows.js';
import { esc, greeting, fmtWeight, fmtDuration, weekdayIdx, startOfWeek, addDays, dayKey, WEEKDAYS, relDay, daysBetween } from '../util.js';

export function rankCard(state, { compact = false } = {}) {
  const dr = displayRank(state);
  const lv = levelInfo(state.xp.total);
  const nextTxt = !dr.placed
    ? `${3 - dr.placementLeft} of 3 placement workouts`
    : dr.next ? `${Math.round(dr.progress * 100)}% to ${dr.next.name}` : 'Highest rank achieved';
  return `<div class="card dark hero-rank link" data-action="tab" data-tab="rank" style="${compact ? 'padding:14px' : ''}">
    ${emblem(dr.idx, { glow: dr.idx > 0, float: true })}
    <div class="grow">
      <div class="eyebrow" style="color:#8E99A4">${dr.youth ? 'Development rank' : 'Strength rank'}</div>
      <div class="h1" style="letter-spacing:.06em;text-transform:uppercase;margin:2px 0 4px">${esc(dr.rank.name)}</div>
      <div class="small" style="color:#B9C3CC">Level ${lv.level} · ${esc(titleFor(lv.level))}</div>
      <div class="mt-16">${bar(dr.progress)}</div>
      <div class="row between tiny mt-8" style="color:#8E99A4;font-weight:600;letter-spacing:.06em"><span>${esc(nextTxt.toUpperCase())}</span><span>${dr.placed ? `SCORE ${dr.score.toFixed(1)}` : ''}</span></div>
    </div>
  </div>`;
}

export function weekDots(state, now = new Date()) {
  const sp = activeSplit(state);
  const ws = startOfWeek(now);
  const trained = new Set(state.sessions.map((s) => dayKey(s.date)));
  return `<div class="dots">${WEEKDAYS.map((d, i) => {
    const date = addDays(ws, i);
    const done = trained.has(dayKey(date));
    const plan = !!sp?.schedule[i];
    const today = i === weekdayIdx(now);
    return `<i class="${done ? 'done' : ''} ${plan && !done ? 'plan' : ''} ${today ? 'today' : ''}" title="${d}">${d[0]}</i>`;
  }).join('')}</div>`;
}

function missionCard(state) {
  const goals = (state.goals || []).filter((g) => !g.archived);
  const g = goals.find((x) => x.primary && !x.completedAt) || goals.find((x) => !x.completedAt) || goals[0];
  if (!g) {
    return `<div class="card link" data-action="tab" data-tab="goals"><div class="eyebrow">Your mission</div><div class="h2 mt-8">Set a goal</div><p class="small muted mt-8">Give your training a target — a lift, a rep count, body weight or consistency.</p></div>`;
  }
  const st = goalStatus(state, g);
  const unit = state.profile.unit;
  return `<div class="card link" data-action="tab" data-tab="goals">
    <div class="row between"><div class="eyebrow">Your mission</div>${g.completedAt ? '<span class="tag good">Complete</span>' : ''}</div>
    <div class="h2 mt-8">${esc(goalTitle(g, unit))}</div>
    <div class="row between mt-16"><span class="small muted">Current progress</span><b class="num">${Math.round(st.pct * 100)}%</b></div>
    <div class="mt-8">${bar(st.pct)}</div>
    <div class="row between small mt-8"><span class="muted">${st.current != null ? `${esc(st.label)}: ${esc(st.fmt(st.current))}` : 'Log a session to measure'}</span>${st.next ? `<span>Next: <b>${esc(st.next.label)}</b></span>` : ''}</div>
  </div>`;
}

function todayCard(state) {
  const w = state.activeWorkout;
  if (w) {
    const done = w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done && s.type !== 'warmup').length, 0);
    return `<div class="card workout-hero">
      <div class="eyebrow">In progress</div><div class="h1 mt-8">${esc(w.name)}</div>
      <p class="muted mt-8"><span class="num" data-live-elapsed>${fmtDuration(elapsedSec(w))}</span> · ${done} sets logged${w.pausedAt ? ' · Paused' : ''}</p>
      <button class="btn primary hero block mt-24" data-action="go-workout"><span class="glint"></span>Resume workout</button></div>`;
  }
  const day = todaysDay(state);
  if (trainedToday(state)) {
    const s = [...state.sessions].reverse().find((x) => dayKey(x.date) === dayKey(new Date()));
    return `<div class="card workout-hero">
      <div class="eyebrow">Today's workout</div><div class="h1 mt-8">${esc(s.name)} <span class="accent">✓</span></div>
      <p class="muted mt-8">Done in ${fmtDuration(s.durationSec)} · ${s.prs?.length ? `${s.prs.length} PR${s.prs.length > 1 ? 's' : ''}` : 'logged'} · +${s.xp || 0} XP</p>
      <div class="row mt-16"><button class="btn ghost sm" data-action="view-session" data-id="${s.id}">View summary</button></div></div>`;
  }
  if (!day) {
    const n = nextPlanned(state);
    return `<div class="card workout-hero">
      <div class="eyebrow">Today</div><div class="h1 mt-8">Rest day</div>
      <p class="muted mt-8">Recovery is where strength is built.${n ? ` Next up: <b>${esc(n.day.name)}</b> ${n.inDays === 1 ? 'tomorrow' : `in ${n.inDays} days`}.` : ''}</p>
      <div class="row mt-16 wrap"><button class="btn ghost sm" data-action="pick-day">Train anyway</button><button class="btn ghost sm" data-action="tab" data-tab="train">View split</button></div></div>`;
  }
  const exs = day.slots.slice(0, 5).map((s) => getExercise(s.exId, state.customExercises)?.name).filter(Boolean);
  const sets = day.slots.reduce((a, s) => a + s.sets, 0);
  const estMin = Math.round(day.slots.reduce((a, s) => a + s.sets * (45 + s.rest), 0) / 60);
  return `<div class="card workout-hero">
    <div class="eyebrow">Today's workout</div>
    <div class="h1 mt-8">${esc(day.name)} Day</div>
    <div class="muted mt-8">${esc(day.focus || `${day.slots.length} exercises`)}</div>
    <div class="row wrap mt-16" style="gap:6px">${exs.map((n) => `<span class="tag">${esc(n)}</span>`).join('')}${day.slots.length > 5 ? `<span class="tag">+${day.slots.length - 5}</span>` : ''}</div>
    <div class="row small faint mt-16" style="gap:16px"><span>${icon('list', 'sm')} ${day.slots.length} exercises</span><span>${sets} sets</span><span>${icon('timer', 'sm')} ~${estMin} min</span></div>
    ${day.slots.length ? `<button class="btn primary hero block mt-24" data-action="start-today" data-day="${day.id}"><span class="glint"></span>Start workout</button>`
      : `<button class="btn primary block mt-24" data-action="edit-day" data-day="${day.id}">Add exercises to this day</button>`}
  </div>`;
}

function recentPRs(state) {
  const prs = [...(state.prs || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const unit = state.profile.unit;
  if (!prs.length) return `<p class="small faint">Personal records appear here after you beat a previous best.</p>`;
  return prs.map((p) => {
    const ex = getExercise(p.exId, state.customExercises);
    const val = p.kind === 'reps' ? `${p.reps} reps` : `${fmtWeight(p.weightKg, unit)} × ${p.reps}`;
    const sub = p.kind === 'e1rm' ? `Est. max ${fmtWeight(p.value, unit)}` : p.kind === 'weight' ? 'Heaviest weight' : 'Most reps';
    return `<div class="pr-item"><div class="pr-badge">${icon('trophy', 'sm')}</div><div class="grow"><div class="h3">${esc(ex?.name || p.exId)}</div><div class="small muted">${sub} · ${relDay(p.date)}</div></div><b class="num">${val}</b></div>`;
  }).join('');
}

function banners(state) {
  const out = [];
  const p = state.prefs;
  const now = new Date();
  if (p.reminders?.enabled && todaysDay(state) && !trainedToday(state) && !state.activeWorkout) {
    const [h, m] = (p.reminders.time || '17:30').split(':').map(Number);
    if (now.getHours() * 60 + now.getMinutes() >= h * 60 + m) out.push(`<div class="banner info">${icon('bell')}<span>Reminder: <b>${esc(todaysDay(state).name)}</b> is on the plan today.</span></div>`);
  }
  const last = state.meta.lastBackupAt;
  if (state.sessions.length >= 5 && (!last || daysBetween(last, now) > 30)) {
    out.push(`<div class="banner">${icon('download')}<span class="grow">Your data lives only on this device. <b>Export a backup</b> to keep it safe.</span><button class="btn xs" data-action="go-data">Back up</button></div>`);
  }
  return out.length ? `<div class="col mt-16">${out.join('')}</div>` : '';
}

function render() {
  const state = app.state;
  const name = state.profile.name;
  const streak = currentWeekStreak(state);
  const planned = plannedDaysPerWeek(state);
  const thisWeek = new Set(state.sessions.filter((s) => new Date(s.date) >= startOfWeek(new Date())).map((s) => dayKey(s.date))).size;
  return `
    <div class="topbar"><span class="brand">ASCEND</span><div class="row"><button class="icon-btn" data-action="go-calendar" aria-label="Calendar">${icon('calendar')}</button></div></div>
    <div class="hello"><h1 class="h-display">${greeting()}</h1><div class="sub">${name ? `${esc(name.toUpperCase())}, ` : ''}KEEP ASCENDING.</div></div>
    ${banners(state)}
    <div class="desk-2 mt-16">
      <div class="stack">${rankCard(state)}${todayCard(state)}</div>
      <div class="stack" style="margin-top:0">
        ${missionCard(state)}
        <div class="card">
          <div class="row between"><div class="eyebrow">This week</div><span class="small"><b class="num">${thisWeek}</b><span class="muted"> / ${planned} sessions</span></span></div>
          <div class="mt-16">${weekDots(state)}</div>
          <div class="row between small mt-16"><span class="muted">${icon('flame', 'sm')} ${streak ? `${streak}-week plan streak` : 'Start a weekly streak'}</span><span class="faint">${state.sessions.length} workouts total</span></div>
        </div>
        <div class="card"><div class="row between"><div class="eyebrow">Recent records</div>${state.prs.length ? `<button class="small accent bold" data-action="go-prs">All</button>` : ''}</div><div class="mt-8">${recentPRs(state)}</div></div>
      </div>
    </div>`;
}

// ---------- readiness check-in ----------
function checkinSheet() {
  const r = app.ui.checkin || {};
  const row = (k, label, lo, hi) => `<div class="mt-16"><div class="row between"><span class="label">${label}</span><span class="tiny faint">${lo} → ${hi}</span></div>
    <div class="seg full mt-8">${[1, 2, 3, 4, 5].map((v) => `<button class="${r[k] === v ? 'on' : ''}" data-action="checkin-set" data-k="${k}" data-v="${v}">${v}</button>`).join('')}</div></div>`;
  return `<div class="grab"></div><div class="sheet-head"><div><div class="h2">Quick check-in</div><div class="small muted">Optional — helps the coach adjust today's targets.</div></div><button class="icon-btn sm" data-action="sheet-close">${icon('x', 'sm')}</button></div>
    ${row('sleep', 'Sleep quality', 'poor', 'great')}${row('energy', 'Energy', 'drained', 'charged')}${row('soreness', 'Soreness', 'none', 'very sore')}
    <div class="row mt-24"><button class="btn ghost grow" data-action="checkin-go" data-skip="1">Skip</button><button class="btn primary grow" data-action="checkin-go">Start workout</button></div>`;
}

function pickDaySheet() {
  const sp = activeSplit(app.state);
  return `<div class="grab"></div><div class="sheet-head"><div class="h2">Choose a workout</div><button class="icon-btn sm" data-action="sheet-close">${icon('x', 'sm')}</button></div>
    <div class="col">${(sp?.days || []).filter((d) => d.slots.length).map((d) => `<button class="option" data-action="pick-day-go" data-day="${d.id}"><div class="grow"><div class="h3">${esc(d.name)}</div><div class="small muted">${esc(d.focus || '')} · ${d.slots.length} exercises</div></div>${icon('chev')}</button>`).join('')}
    <button class="option" data-action="pick-day-go" data-day=""><div class="grow"><div class="h3">Empty workout</div><div class="small muted">Add exercises as you go</div></div>${icon('chev')}</button></div>`;
}

register('home', {
  render,
  mount(root) {
    clearInterval(app.ui._homeTick);
    if (app.state.activeWorkout) {
      app.ui._homeTick = setInterval(() => {
        const el = root.querySelector('[data-live-elapsed]');
        if (!el || !app.state.activeWorkout) return clearInterval(app.ui._homeTick);
        el.textContent = fmtDuration(elapsedSec(app.state.activeWorkout));
      }, 1000);
    }
  },
  actions: {
    'start-today': (el) => { app.ui.checkin = { dayId: el.dataset.day }; openSheet(checkinSheet); },
    'checkin-set': (el) => { app.ui.checkin[el.dataset.k] = Number(el.dataset.v); renderSheet(); },
    'checkin-go': (el) => {
      const c = app.ui.checkin || {};
      const readiness = el.dataset.skip ? null : { sleep: c.sleep, energy: c.energy, soreness: c.soreness };
      closeSheet();
      startWorkout({ dayId: c.dayId || undefined, readiness: readiness && Object.values(readiness).some((v) => v) ? readiness : null });
    },
    'pick-day': () => openSheet(pickDaySheet),
    'pick-day-go': (el) => { closeSheet(); if (el.dataset.day) { app.ui.checkin = { dayId: el.dataset.day }; openSheet(checkinSheet); } else startWorkout({}); },
    'go-workout': () => go('train', 'workout'),
    'go-calendar': () => go('train', 'calendar'),
    'go-prs': () => go('profile', 'records'),
    'go-data': () => go('profile', 'data'),
    'edit-day': (el) => go('train', 'day', { id: el.dataset.day }),
  },
});
