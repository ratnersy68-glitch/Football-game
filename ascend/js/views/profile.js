import { app, register, go, update, openSheet, closeSheet, renderSheet, renderNow, toast, confirmSheet } from '../app.js';
import { store, exportData, importData, listSnapshots, restoreSnapshot, resetAll, saveNow, db } from '../store.js';
import { icon } from '../ui/icons.js';
import { bar, seg, toggle, sheetFrame, empty } from '../ui/components.js';
import { emblem, medalSVG } from '../ui/emblems.js';
import { lineChart, barChart } from '../ui/charts.js';
import { levelInfo, titleFor, THEMES, FRAMES, ACHIEVEMENTS, currentWeekStreak } from '../engine/xp.js';
import { displayRank } from '../engine/rank.js';
import { goalStatus, goalTitle } from '../engine/goals.js';
import { RANGES, rangeStart, weeklyVolume, weeklyConsistency, e1rmSeries, bodyweightSeries, muscleDistribution, loggedExercises, summary } from '../engine/analytics.js';
import { EQUIPMENT, EQUIPMENT_PRESETS, getExercise } from '../data/exercises.js';
import { logBodyweight } from '../flows.js';
import { EXPERIENCE } from './onboarding.js';
import { esc, fmtWeight, fmtVolume, fmtNum, fromKg, toKg, roundDisplay, parseNum, fmtDate, fmtMinutes, cap, cmToFtIn, uid, dayKey, relDay } from '../util.js';

const unit = () => app.unit;
const back = (to = 'profile', label = 'Profile') => `<button class="back" data-action="pf-go" data-v="${to}">${icon('back')} ${label}</button>`;

export function applyTheme() {
  const p = store.state.prefs;
  const root = document.documentElement;
  const dark = p.theme === 'dark' || (p.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.theme = dark ? 'dark' : 'light';
  root.dataset.motion = p.motion === 'reduced' ? 'reduced' : p.motion === 'full' ? 'full' : '';
  const th = THEMES.find((t) => t.id === p.accent) || THEMES[0];
  const lv = levelInfo(store.state.xp.total).level;
  const ok = th.level <= lv ? th : THEMES[0];
  root.style.setProperty('--accent', ok.accent);
  root.style.setProperty('--accent-soft', ok.soft);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#090B0E' : '#F8F9FA');
}

function avatar(st, size = 76) {
  const lv = levelInfo(st.xp.total).level;
  const fr = FRAMES.find((f) => f.id === st.prefs.frame && f.level <= lv) || FRAMES[0];
  const initial = (st.profile.name || 'A').trim()[0]?.toUpperCase() || 'A';
  const ringStyle = { none: '', ring: 'box-shadow:0 0 0 3px var(--accent)', double: 'box-shadow:0 0 0 3px var(--surface),0 0 0 5px var(--accent),0 0 0 8px var(--surface),0 0 0 9px var(--accent)', marble: 'border:4px solid transparent;background:var(--marble-img) border-box', rays: 'box-shadow:0 0 0 3px var(--accent),0 0 24px var(--accent)' }[fr.id];
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;display:grid;place-items:center;background:var(--black);color:#fff;font-size:${size * 0.4}px;font-weight:800;flex:none;${ringStyle}">${esc(initial)}</div>`;
}

// =============== profile home ===============
function render() {
  const st = app.state;
  const p = st.profile;
  const u = unit();
  const lv = levelInfo(st.xp.total);
  const dr = displayRank(st);
  const totalVol = st.sessions.reduce((a, s) => a + (s.volumeKg || 0), 0);
  const h = cmToFtIn(p.heightCm);
  const link = (v, ic, label, sub) => `<button class="list-row btnlike" style="width:100%;text-align:left" data-action="pf-go" data-v="${v}"><span class="icon-btn sm">${icon(ic, 'sm')}</span><div class="grow"><div class="h3">${label}</div>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>${icon('chev', 'sm')}</button>`;
  return `
    <div class="topbar"><span class="title">PROFILE</span><button class="icon-btn" data-action="pf-go" data-v="settings" aria-label="Settings">${icon('settings')}</button></div>
    <div class="card"><div class="row" style="gap:16px">${avatar(st)}<div class="grow"><div class="h2">${esc(p.name || 'Athlete')}</div><div class="small muted">Level ${lv.level} · ${esc(titleFor(lv.level))}</div>
      <div class="mt-8">${bar(lv.progress)}</div><div class="tiny faint mt-8">${fmtNum(lv.into)} / ${fmtNum(lv.need)} XP to level ${lv.level + 1}</div></div>
      <div style="width:64px;height:64px">${emblem(dr.idx)}</div></div>
      <hr class="sep"><div class="grid grid-3"><div class="kv"><b>${p.age}</b><span>Age</span></div><div class="kv"><b>${u === 'lb' ? `${h.ft}′${h.inch}″` : `${p.heightCm} cm`}</b><span>Height</span></div><div class="kv"><b>${fmtWeight(p.bodyweightKg, u, { suffix: false })}</b><span>${u === 'lb' ? 'lbs' : 'kg'}</span></div></div>
      <button class="btn xs ghost mt-16" data-action="pf-edit">${icon('edit', 'sm')} Edit profile</button></div>
    <div class="grid grid-2 mt-16">
      <div class="card tight"><div class="kv"><b>${st.sessions.length}</b><span>Workouts</span></div></div>
      <div class="card tight"><div class="kv"><b>${fmtVolume(totalVol, u)}</b><span>Total volume</span></div></div>
      <div class="card tight"><div class="kv"><b>${st.prs.length}</b><span>Records</span></div></div>
      <div class="card tight"><div class="kv"><b>${currentWeekStreak(st)} wk</b><span>Plan streak</span></div></div>
    </div>
    <div class="card mt-16" style="padding:2px 16px">
      ${link('analytics', 'chart', 'Strength analytics', 'e1RM, volume, consistency, body weight')}
      ${link('achievements', 'trophy', 'Achievements & unlocks', `${Object.keys(st.achievements).length} / ${ACHIEVEMENTS.length} earned`)}
      ${link('records', 'bolt', 'Personal records', `${st.prs.length} recorded`)}
      ${link('body', 'scale', 'Body weight', st.bodyweights.length ? `Last logged ${relDay(st.bodyweights[st.bodyweights.length - 1].date)}` : 'Not logged')}
      ${link('photos', 'camera', 'Progress photos', 'Private · stored on this device only')}
      ${link('calendar', 'calendar', 'Workout calendar', '')}
    </div>
    <div class="card mt-16" style="padding:2px 16px">
      ${link('settings', 'settings', 'Settings', 'Units, theme, motion, reminders, equipment')}
      ${link('data', 'download', 'Data & backup', st.meta.lastBackupAt ? `Last export ${relDay(st.meta.lastBackupAt)}` : 'Export, restore, snapshots')}
    </div>
    <p class="center tiny faint mt-24">ASCEND · EARN YOUR RANK.<br>Private, offline, no accounts, no ads.</p>`;
}

function editSheet() {
  const p = app.state.profile; const u = unit(); const f = app.ui.pf;
  return sheetFrame('Edit profile', `
    <div class="field"><label for="pf-name">Name</label><input id="pf-name" class="input" data-input="pf-f" data-k="name" value="${esc(f.name)}" maxlength="40"></div>
    <div class="grid grid-2 mt-16"><div class="field"><label for="pf-age">Age</label><input id="pf-age" class="input" inputmode="numeric" data-input="pf-f" data-k="age" value="${esc(f.age)}"></div>
      <div class="field"><label for="pf-h">Height (cm)</label><input id="pf-h" class="input" inputmode="numeric" data-input="pf-f" data-k="heightCm" value="${esc(f.heightCm)}"></div></div>
    <div class="label mt-16">Experience</div><div class="chips mt-8">${EXPERIENCE.map((e) => `<button class="chip sm ${f.experience === e.id ? 'on' : ''}" data-action="pf-exp" data-v="${e.id}">${esc(e.label)}</button>`).join('')}</div>
    <div class="label mt-16">Training days per week</div><div class="seg full mt-8">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<button class="${Number(f.trainingDays) === n ? 'on' : ''}" data-action="pf-days" data-v="${n}">${n}</button>`).join('')}</div>
    ${Number(f.age) >= 18 ? `<div class="label mt-16">Strength standards</div><div class="seg full mt-8">${[['male', 'Male'], ['female', 'Female'], ['neutral', 'Blended']].map(([v, l]) => `<button class="${f.sexStandard === v ? 'on' : ''}" data-action="pf-sex" data-v="${v}">${l}</button>`).join('')}</div>` : ''}
    ${f.err ? `<p class="small mt-16" style="color:var(--danger)">${esc(f.err)}</p>` : ''}
    <button class="btn primary block mt-24" data-action="pf-save">Save</button>
    <p class="tiny faint mt-8">Body weight is updated from your body-weight log (${fmtWeight(p.bodyweightKg, u)}).</p>`);
}

export function bwSheet() {
  const u = unit();
  const last = app.state.profile.bodyweightKg;
  return sheetFrame('Log body weight', `
    <div class="big-input-wrap"><input id="bw-in" class="big-input" inputmode="decimal" placeholder="${roundDisplay(fromKg(last, u), u)}" data-enter="bw-save"><span>${u === 'lb' ? 'lbs' : 'kg'}</span></div>
    <div class="field mt-16"><label for="bw-date">Date</label><input id="bw-date" type="date" class="input" value="${dayKey(new Date())}" max="${dayKey(new Date())}"></div>
    <button class="btn primary block mt-24" data-action="bw-save">Save</button>`);
}

// =============== analytics ===============
function renderAnalytics() {
  const st = app.state; const u = unit();
  const range = app.ui.range || '3m';
  const now = new Date(); const from = rangeStart(range, now, st);
  const sm = summary(st, from, now);
  const exs = loggedExercises(st);
  const exId = app.ui.anEx && exs.some((e) => e.id === app.ui.anEx) ? app.ui.anEx : exs[0]?.id;
  const e1 = exId ? e1rmSeries(st, exId, from, now) : [];
  const vol = weeklyVolume(st, from, now);
  const con = weeklyConsistency(st, from, now);
  const bw = bodyweightSeries(st, from, now);
  const md = muscleDistribution(st, from, now);
  const bwGoal = st.goals.find((g) => g.type === 'bodyweight' && !g.archived);
  const sGoal = st.goals.find((g) => g.type === 'strength' && g.exId === exId && !g.archived);
  const maxM = Math.max(1, ...md.map((m) => m.sets));
  const weeks = Math.max(1, vol.length);
  const fy = (v) => fmtNum(v, 1);
  return `<div class="topbar">${back()}<span class="title">ANALYTICS</span><span style="width:40px"></span></div>
    ${seg(RANGES.map((r) => ({ id: r.id, label: r.label })), range, 'an-range', { full: true })}
    <div class="grid grid-2 mt-16" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
      <div class="card tight"><div class="kv"><b>${sm.workouts}</b><span>Workouts</span></div></div>
      <div class="card tight"><div class="kv"><b>${sm.perWeek.toFixed(1)}</b><span>Per week</span></div></div>
      <div class="card tight"><div class="kv"><b>${fmtVolume(sm.volumeKg, u)}</b><span>Volume</span></div></div>
      <div class="card tight"><div class="kv"><b>${sm.prs}</b><span>Records</span></div></div>
    </div>
    ${!st.sessions.length ? `<div class="card mt-16">${empty('chart', 'No data yet', 'Charts are built only from workouts you log. Finish a session to see your first data points.')}</div>` : `
    <div class="card mt-16"><div class="row between"><div class="eyebrow">Estimated one-rep max</div>${e1.length ? `<b class="num">${fmtWeight(e1[e1.length - 1].y, u)}</b>` : ''}</div>
      <div class="chips scroll mt-16">${exs.slice(0, 12).map((e) => `<button class="chip sm ${e.id === exId ? 'on' : ''}" data-action="an-ex" data-id="${e.id}">${esc(e.ex.name)}</button>`).join('')}</div>
      <div class="mt-16">${e1.length >= 1 ? lineChart(e1.map((p) => ({ ...p, y: fromKg(p.y, u) })), { fmtY: fy, tip: (p) => `${fmtWeight(toKg(p.y, u), u)} e1RM · ${fmtWeight(p.top, u)} × ${p.reps} · ${fmtDate(p.x)}`, goal: sGoal ? fromKg(sGoal.targetKg, u) : null }) : '<p class="small faint">No sets with 12 or fewer reps in this range.</p>'}</div>
      ${e1.length >= 2 ? `<p class="small muted mt-8">${(() => { const d = e1[e1.length - 1].y - e1[0].y; return `${d >= 0 ? '+' : '−'}${fmtWeight(Math.abs(d), u)} (${((d / e1[0].y) * 100).toFixed(1)}%) over this period`; })()}</p>` : ''}
    </div>
    <div class="desk-2 mt-16">
      <div class="card"><div class="eyebrow">Weekly volume</div><div class="mt-16">${barChart(vol.map((v) => ({ ...v, y: fromKg(v.y, u) })), { fmtY: (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)), tip: (p) => `${fmtVolume(toKg(p.y, u), u)} · week of ${fmtDate(p.x)}` })}</div>
        <p class="tiny faint mt-8">Working sets only: weight × reps. Avg ${fmtVolume(vol.reduce((a, v) => a + v.y, 0) / weeks, u)} / week.</p></div>
      <div class="card"><div class="eyebrow">Weekly consistency</div><div class="mt-16">${barChart(con.map((c) => ({ ...c, hit: c.y >= c.planned })), { target: con[0]?.planned, tip: (p) => `${p.y} / ${p.planned} sessions · week of ${fmtDate(p.x)}` })}</div>
        <p class="tiny faint mt-8">Highlighted weeks met your ${con[0]?.planned}-day plan. Dashed line = plan.</p></div>
    </div>
    <div class="desk-2 mt-16">
      <div class="card"><div class="eyebrow">Muscle-group distribution</div><div class="mt-16">${md.length ? md.map((m) => `<div class="hbar"><span>${cap(m.muscle)}</span><div class="b"><i style="width:${(m.sets / maxM) * 100}%"></i></div><span class="num small" style="text-align:right">${fmtNum(m.sets, 1)}</span></div>`).join('') : '<p class="small faint">No sets in range.</p>'}</div>
        <p class="tiny faint mt-8">Hard sets in range (secondary muscles count ½).</p></div>
      <div class="card"><div class="row between"><div class="eyebrow">Body weight</div><button class="btn xs ghost" data-action="bw-open">${icon('plus', 'sm')} Log</button></div>
        <div class="mt-16">${bw.length >= 2 ? lineChart(bw.map((p) => ({ ...p, y: fromKg(p.y, u) })), { fmtY: fy, tip: (p) => `${fmtWeight(toKg(p.y, u), u)} · ${fmtDate(p.x)}`, goal: bwGoal ? fromKg(bwGoal.targetKg, u) : null, height: 220 }) : '<p class="small faint">Log your body weight at least twice to see a trend.</p>'}</div></div>
    </div>`}
    ${st.goals.filter((g) => !g.archived).length ? `<div class="card mt-16"><div class="eyebrow">Goal progress</div>${st.goals.filter((g) => !g.archived).map((g) => { const s = goalStatus(st, g); return `<div class="mt-16"><div class="row between small"><b>${esc(goalTitle(g, u))}</b><span class="num">${Math.round(s.pct * 100)}%</span></div><div class="mt-8">${bar(s.pct)}</div></div>`; }).join('')}</div>` : ''}
    <div class="card mt-16"><div class="eyebrow">Time trained</div><div class="row between mt-8"><span class="muted">In this range</span><b>${fmtMinutes(sm.durationSec)}</b></div><div class="row between mt-8"><span class="muted">Hard sets</span><b>${sm.sets}</b></div></div>`;
}

// =============== achievements ===============
function renderAchievements() {
  const st = app.state; const lv = levelInfo(st.xp.total);
  const got = st.achievements;
  return `<div class="topbar">${back()}<span class="title">ACHIEVEMENTS</span><span style="width:40px"></span></div>
    <div class="card dark"><div class="row between"><div><div class="eyebrow" style="color:#8E99A4">Level</div><div class="big-num" style="color:#fff">${lv.level}</div></div><div style="text-align:right"><div class="h3" style="color:#fff">${esc(titleFor(lv.level))}</div><div class="small" style="color:#8E99A4">${fmtNum(st.xp.total)} XP total</div></div></div>
      <div class="mt-16">${bar(lv.progress)}</div><p class="tiny mt-8" style="color:#8E99A4">XP comes from planned workouts, records, milestones and consistency. Sessions beyond your weekly plan earn no workout XP — rest is part of the process.</p></div>
    <div class="section-title"><span class="h2">Accent themes</span></div>
    <div class="chips">${THEMES.map((t) => `<button class="chip ${st.prefs.accent === t.id ? 'on' : ''}" data-action="pf-accent" data-v="${t.id}" ${t.level > lv.level ? 'disabled style="opacity:.5"' : ''}><span style="width:12px;height:12px;border-radius:50%;background:${t.accent};display:inline-block"></span>${esc(t.name)}${t.level > lv.level ? ` · L${t.level}` : ''}</button>`).join('')}</div>
    <div class="section-title"><span class="h2">Profile frames</span></div>
    <div class="chips">${FRAMES.map((f) => `<button class="chip ${st.prefs.frame === f.id ? 'on' : ''}" data-action="pf-frame" data-v="${f.id}" ${f.level > lv.level ? 'disabled style="opacity:.5"' : ''}>${esc(f.name)}${f.level > lv.level ? ` · L${f.level}` : ''}</button>`).join('')}</div>
    <div class="section-title"><span class="h2">Achievements</span><span class="small faint">${Object.keys(got).length} / ${ACHIEVEMENTS.length}</span></div>
    <div class="ach-grid">${ACHIEVEMENTS.map((a) => `<div class="ach ${got[a.id] ? 'got' : ''}">${medalSVG(!!got[a.id])}<b>${esc(a.name)}</b><small>${esc(a.desc)}</small>${got[a.id] ? `<small class="accent">${fmtDate(got[a.id])}</small>` : ''}</div>`).join('')}</div>
    <div class="section-title"><span class="h2">Recent XP</span></div>
    <div class="card">${[...st.xp.log].reverse().slice(0, 12).map((l) => `<div class="row between small" style="padding:7px 0;border-bottom:1px solid var(--line)"><span class="muted">${esc(l.reason)}</span><b>+${l.amount}</b></div>`).join('') || '<p class="small faint">No XP yet.</p>'}</div>`;
}

// =============== records ===============
function renderRecords() {
  const st = app.state; const u = unit();
  const byEx = {};
  for (const p of st.prs) (byEx[p.exId] ||= []).push(p);
  const groups = Object.entries(byEx).sort((a, b) => new Date(b[1][b[1].length - 1].date) - new Date(a[1][a[1].length - 1].date));
  return `<div class="topbar">${back()}<span class="title">RECORDS</span><span style="width:40px"></span></div>
    ${groups.length ? groups.map(([id, list]) => {
      const ex = getExercise(id, st.customExercises);
      return `<div class="card mt-16"><div class="h3">${esc(ex?.name || id)}</div>${[...list].reverse().map((p) => `<div class="row between small" style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="muted">${fmtDate(p.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span><span>${p.kind === 'e1rm' ? `e1RM ${fmtWeight(p.value, u)}` : p.kind === 'weight' ? 'Heaviest' : 'Most reps'}</span><b>${p.weightKg ? fmtWeight(p.weightKg, u) + ' × ' : ''}${p.reps}</b></div>`).join('')}</div>`;
    }).join('') : `<div class="card">${empty('trophy', 'No records yet', 'Beat a previous best on any exercise to set a record. Your first session with an exercise sets the baseline.')}</div>`}`;
}

// =============== body ===============
function renderBody() {
  const st = app.state; const u = unit();
  const list = [...st.bodyweights].reverse();
  const series = st.bodyweights.map((b) => ({ x: new Date(b.date), y: b.kg }));
  return `<div class="topbar">${back()}<span class="title">BODY WEIGHT</span><button class="icon-btn" data-action="bw-open" aria-label="Log body weight">${icon('plus')}</button></div>
    <div class="card"><div class="row between"><div class="kv"><b>${fmtWeight(st.profile.bodyweightKg, u)}</b><span>Current</span></div>${series.length >= 2 ? `<div class="kv" style="text-align:right"><b>${(() => { const d = series[series.length - 1].y - series[0].y; return `${d >= 0 ? '+' : '−'}${fmtWeight(Math.abs(d), u)}`; })()}</b><span>Since first log</span></div>` : ''}</div>
      ${series.length >= 2 ? `<div class="mt-16">${lineChart(series.map((p) => ({ ...p, y: fromKg(p.y, u) })), { fmtY: (v) => fmtNum(v, 1), tip: (p) => `${fmtWeight(toKg(p.y, u), u)} · ${fmtDate(p.x)}` })}</div>` : ''}</div>
    <div class="card mt-16">${list.map((b) => `<div class="list-row"><div class="grow"><b>${fmtWeight(b.kg, u)}</b><div class="small muted">${fmtDate(b.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div></div><button class="icon-btn sm" data-action="bw-del" data-date="${esc(b.date)}" aria-label="Delete entry" ${list.length <= 1 ? 'disabled' : ''}>${icon('trash', 'sm')}</button></div>`).join('')}</div>
    <p class="tiny faint mt-16">Weigh in at the same time of day for the most useful trend. Body weight is only used to calculate relative strength.</p>`;
}

// =============== photos ===============
function renderPhotos() {
  const photos = app.ui.photos;
  if (!photos) { loadPhotos(); }
  return `<div class="topbar">${back()}<span class="title">PHOTOS</span><button class="icon-btn" data-action="ph-add" aria-label="Add photo">${icon('plus')}</button></div>
    <div class="banner info">${icon('lock')}<span>Photos never leave this device. They're excluded from backups unless you choose to include them.</span></div>
    <input type="file" id="ph-file" accept="image/*" class="hide" data-change="ph-file">
    <div class="mt-16">${!photos ? '<p class="small faint">Loading…</p>' : photos.length ? `<div class="photos">${photos.map((p) => `<div class="ph" data-action="ph-view" data-id="${p.id}"><img src="${p.data}" alt="Progress photo ${fmtDate(p.date)}" loading="lazy"><span>${fmtDate(p.date)}</span></div>`).join('')}</div>` : `<div class="card">${empty('camera', 'No photos yet', 'Take a photo every few weeks in similar lighting to see change that the scale and mirror miss.', '<button class="btn primary" data-action="ph-add">Add photo</button>')}</div>`}</div>`;
}
async function loadPhotos() { app.ui.photos = await db.listPhotos(store.userId); if (app.route.view === 'photos') renderNow(); }

function downscale(file, max = 1080) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// =============== settings ===============
function renderSettings() {
  const st = app.state; const p = st.prefs; const pr = st.profile;
  const row = (label, sub, ctrl) => `<div class="list-row"><div class="grow"><div class="h3">${label}</div>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>${ctrl}</div>`;
  return `<div class="topbar">${back()}<span class="title">SETTINGS</span><span style="width:40px"></span></div>
    <div class="card" style="padding:2px 16px">
      ${row('Weight unit', 'All history converts automatically', seg([{ id: 'lb', label: 'lbs' }, { id: 'kg', label: 'kg' }], pr.unit, 'set-unit'))}
      ${row('Appearance', '', seg([{ id: 'system', label: 'Auto' }, { id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }], p.theme, 'set-theme'))}
      ${row('Motion', 'Reduced motion simplifies the rank reveal', seg([{ id: 'system', label: 'Auto' }, { id: 'full', label: 'Full' }, { id: 'reduced', label: 'Reduced' }], p.motion, 'set-motion'))}
      ${row('Sound effects', 'Set completion, rest timer, reveals', toggle(p.sound, 'set-toggle', 'data-k="sound"'))}
      ${row('Haptics', 'On devices that support vibration', toggle(p.haptics, 'set-toggle', 'data-k="haptics"'))}
    </div>
    <div class="section-title"><span class="h2">Workout</span></div>
    <div class="card" style="padding:2px 16px">
      ${row('Auto-start rest timer', 'After each working set', toggle(p.autoRest, 'set-toggle', 'data-k="autoRest"'))}
      ${row('Default rest', 'Used when an exercise has none set', `<div class="stepper"><button class="icon-btn sm" data-action="set-rest" data-d="-15">${icon('minus', 'sm')}</button><b class="num" style="min-width:52px;text-align:center">${Math.floor(p.defaultRest / 60)}:${String(p.defaultRest % 60).padStart(2, '0')}</b><button class="icon-btn sm" data-action="set-rest" data-d="15">${icon('plus', 'sm')}</button></div>`)}
    </div>
    <div class="section-title"><span class="h2">Reminders</span></div>
    <div class="card" style="padding:2px 16px">
      ${row('Workout reminders', 'On planned training days', toggle(p.reminders.enabled, 'set-remind'))}
      ${p.reminders.enabled ? row('Time', '', `<input type="time" class="input" style="width:130px;height:40px" value="${esc(p.reminders.time)}" data-change="set-remind-time">`) : ''}
    </div>
    ${p.reminders.enabled ? `<p class="tiny faint mt-8">Reminders appear when ASCEND is open (or installed and running in the background, where the browser allows notifications). There's no server, so nothing is sent from the cloud.</p>` : ''}
    <div class="section-title"><span class="h2">Equipment</span></div>
    <div class="card"><div class="chips">${[['full', 'Full gym'], ['home', 'Home gym'], ['dumbbell', 'Dumbbells'], ['bodyweight', 'Body weight']].map(([k, l]) => `<button class="chip sm" data-action="set-equip-preset" data-v="${k}">${l}</button>`).join('')}</div>
      <div class="chips mt-16">${EQUIPMENT.map((e) => `<button class="chip sm ${pr.equipment.includes(e.id) ? 'on' : ''}" data-action="set-equip" data-v="${e.id}">${esc(e.label)}</button>`).join('')}</div>
      <p class="tiny faint mt-16">Used to filter the exercise library, suggest substitutions and decide which movement patterns count toward your rank.</p></div>`;
}

// =============== data ===============
function renderData() {
  const st = app.state;
  const snaps = app.ui.snaps;
  if (!snaps) listSnapshots().then((s) => { app.ui.snaps = s; if (app.route.view === 'data') renderNow(); });
  const mode = { idb: 'IndexedDB (persistent)', local: 'Local storage', memory: 'Memory only — data will be lost when you close this tab' }[db.mode];
  return `<div class="topbar">${back()}<span class="title">DATA</span><span style="width:40px"></span></div>
    <div class="card"><div class="eyebrow">Storage</div><p class="mt-8"><b>${mode}</b></p><p class="small muted mt-8">Everything stays on this device. ${st.sessions.length} workouts, ${st.bodyweights.length} body-weight entries, ${st.goals.length} goals.</p>
      ${db.mode === 'memory' ? `<div class="banner mt-16">${icon('info')}<span>This browser is blocking storage. Export a backup before closing.</span></div>` : ''}</div>
    <div class="card mt-16"><div class="eyebrow">Export</div><p class="small muted mt-8">Download a complete JSON backup you can restore on any device.</p>
      <div class="row between mt-16"><span class="small">Include progress photos</span>${toggle(app.ui.expPhotos, 'exp-photos')}</div>
      <button class="btn primary block mt-16" data-action="exp-go">${icon('download', 'sm')} Export backup</button>
      <button class="btn ghost block mt-8" data-action="exp-csv">${icon('download', 'sm')} Export sets as CSV</button></div>
    <div class="card mt-16"><div class="eyebrow">Restore</div><p class="small muted mt-8">Replace current data with a backup file. A snapshot of your current data is saved first.</p>
      <input type="file" id="imp-file" accept="application/json,.json" class="hide" data-change="imp-file">
      <button class="btn ghost block mt-16" data-action="imp-go">${icon('upload', 'sm')} Restore from file</button></div>
    <div class="card mt-16"><div class="eyebrow">Automatic snapshots</div><p class="small muted mt-8">The last 3 snapshots are kept on this device after each workout and before any restore or reset.</p>
      ${snaps ? (snaps.length ? snaps.map((s) => `<div class="list-row"><div class="grow"><b class="small">${new Date(s.at).toLocaleString()}</b><div class="tiny faint">${s.sessions} workouts</div></div><button class="btn xs ghost" data-action="snap-restore" data-i="${s.i}">Restore</button></div>`).join('') : '<p class="small faint mt-8">None yet.</p>') : ''}</div>
    <div class="card mt-16"><div class="eyebrow">Danger zone</div><button class="btn danger block mt-16" data-action="reset-all">Erase all data</button></div>`;
}

function download(name, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// =============== registration ===============
const common = {
  'pf-go': (el) => go('profile', el.dataset.v === 'profile' ? null : el.dataset.v === 'calendar' ? 'calendar' : el.dataset.v),
  'bw-open': () => openSheet(bwSheet),
  'bw-save': () => {
    const u = unit(); const v = parseNum(document.getElementById('bw-in')?.value, { min: 1 });
    const kg = v == null ? null : toKg(v, u);
    if (!kg || kg < 30 || kg > 300) { toast('Enter a realistic body weight'); return; }
    const dv = document.getElementById('bw-date')?.value;
    const date = dv ? new Date(`${dv}T${new Date().toTimeString().slice(0, 8)}`) : new Date();
    closeSheet(); logBodyweight(kg, date); toast('Body weight logged');
  },
};

register('profile', { render, actions: {
  ...common,
  'pf-edit': () => { const p = app.state.profile; app.ui.pf = { name: p.name || '', age: String(p.age), heightCm: String(p.heightCm), experience: p.experience, trainingDays: p.trainingDays, sexStandard: p.sexStandard }; openSheet(editSheet); },
  'pf-exp': (el) => { app.ui.pf.experience = el.dataset.v; renderSheet(); },
  'pf-days': (el) => { app.ui.pf.trainingDays = Number(el.dataset.v); renderSheet(); },
  'pf-sex': (el) => { app.ui.pf.sexStandard = el.dataset.v; renderSheet(); },
  'pf-save': () => {
    const f = app.ui.pf; const age = parseNum(f.age, { min: 13, max: 100 }); const h = parseNum(f.heightCm, { min: 120, max: 230 });
    if (!age) { f.err = 'Age must be between 13 and 100.'; renderSheet(); return; }
    if (!h) { f.err = 'Height must be 120–230 cm.'; renderSheet(); return; }
    update((st) => { Object.assign(st.profile, { name: f.name.trim().slice(0, 40), age: Math.round(age), heightCm: Math.round(h), experience: f.experience, trainingDays: f.trainingDays, sexStandard: age < 18 ? 'neutral' : f.sexStandard }); });
    closeSheet(); toast('Profile saved');
  },
}, inputs: { 'pf-f': (el) => { app.ui.pf[el.dataset.k] = el.value; } } });

register('analytics', { tab: 'profile', render: renderAnalytics, actions: {
  ...common,
  'an-range': (el) => { app.ui.range = el.dataset.value; renderNow(); },
  'an-ex': (el) => { app.ui.anEx = el.dataset.id; renderNow(); },
} });
register('achievements', { tab: 'profile', render: renderAchievements, actions: {
  'pf-accent': (el) => update((st) => { st.prefs.accent = el.dataset.v; }),
  'pf-frame': (el) => update((st) => { st.prefs.frame = el.dataset.v; }),
} });
register('records', { tab: 'profile', render: renderRecords });
register('body', { tab: 'profile', render: renderBody, actions: {
  'bw-del': async (el) => {
    if (!(await confirmSheet({ title: 'Delete this entry?', ok: 'Delete', danger: true }))) return;
    update((st) => { st.bodyweights = st.bodyweights.filter((b) => b.date !== el.dataset.date); st.profile.bodyweightKg = st.bodyweights[st.bodyweights.length - 1]?.kg || st.profile.bodyweightKg; });
  },
} });
register('photos', { tab: 'profile', render: renderPhotos, actions: {
  'ph-add': () => document.getElementById('ph-file')?.click(),
  'ph-view': (el) => {
    const p = app.ui.photos.find((x) => x.id === el.dataset.id);
    openSheet(() => sheetFrame(fmtDate(p.date, { month: 'long', day: 'numeric', year: 'numeric' }), `<img src="${p.data}" alt="Progress photo" style="border-radius:16px;width:100%"><button class="btn danger block mt-16" data-action="ph-del" data-id="${p.id}">${icon('trash', 'sm')} Delete photo</button>`));
  },
  'ph-del': async (el) => {
    closeSheet();
    if (!(await confirmSheet({ title: 'Delete this photo?', ok: 'Delete', danger: true }))) return;
    await db.deletePhoto(el.dataset.id); app.ui.photos = null; renderNow();
  },
}, inputs: {
  'ph-file': async (el) => {
    const f = el.files?.[0]; if (!f) return;
    try {
      const data = await downscale(f);
      await db.putPhoto({ id: uid('ph'), userId: store.userId, date: new Date().toISOString(), data });
      app.ui.photos = null; renderNow(); toast('Photo saved privately');
    } catch { toast('Could not read that image'); }
    el.value = '';
  },
} });
register('settings', { tab: 'profile', render: renderSettings, actions: {
  'set-unit': (el) => update((st) => { st.profile.unit = el.dataset.value; }),
  'set-theme': (el) => { update((st) => { st.prefs.theme = el.dataset.value; }); applyTheme(); },
  'set-motion': (el) => { update((st) => { st.prefs.motion = el.dataset.value; }); applyTheme(); },
  'set-toggle': (el) => update((st) => { st.prefs[el.dataset.k] = !st.prefs[el.dataset.k]; }),
  'set-rest': (el) => update((st) => { st.prefs.defaultRest = Math.max(15, Math.min(600, st.prefs.defaultRest + Number(el.dataset.d))); }),
  'set-remind': async () => {
    const on = !app.state.prefs.reminders.enabled;
    if (on && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch { /* ignore */ } }
    update((st) => { st.prefs.reminders.enabled = on; });
  },
  'set-equip-preset': (el) => update((st) => { st.profile.equipment = [...EQUIPMENT_PRESETS[el.dataset.v]]; }),
  'set-equip': (el) => update((st) => { const s = new Set(st.profile.equipment); s.has(el.dataset.v) ? s.delete(el.dataset.v) : s.add(el.dataset.v); st.profile.equipment = [...s]; }),
}, inputs: {
  'set-remind-time': (el) => update((st) => { st.prefs.reminders.time = el.value || '17:30'; }),
} });
register('data', { tab: 'profile', render: renderData, actions: {
  'exp-photos': () => { app.ui.expPhotos = !app.ui.expPhotos; renderNow(); },
  'exp-go': async () => {
    const data = await exportData({ includePhotos: !!app.ui.expPhotos });
    download(`ascend-backup-${dayKey(new Date())}.json`, JSON.stringify(data));
    update((st) => { st.meta.lastBackupAt = new Date().toISOString(); });
    toast('Backup exported');
  },
  'exp-csv': () => {
    const st = app.state; const u = unit();
    const rows = [['date', 'workout', 'exercise', 'set_type', `weight_${u}`, 'reps', 'rpe']];
    for (const s of st.sessions) for (const e of s.exercises) for (const x of e.sets) rows.push([s.date, s.name, getExercise(e.exId, st.customExercises)?.name || e.exId, x.type, x.weightKg != null ? roundDisplay(fromKg(x.weightKg, u), u) : '', x.reps ?? '', x.rpe ?? '']);
    download(`ascend-sets-${dayKey(new Date())}.csv`, rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
  },
  'imp-go': () => document.getElementById('imp-file')?.click(),
  'snap-restore': async (el) => {
    if (!(await confirmSheet({ title: 'Restore this snapshot?', body: 'Current data will be replaced.', ok: 'Restore' }))) return;
    await restoreSnapshot(Number(el.dataset.i)); app.ui.snaps = null; toast('Snapshot restored'); go('home');
  },
  'reset-all': async () => {
    if (!(await confirmSheet({ title: 'Erase all data?', body: 'Your profile, workouts, goals and photos will be deleted from this device. A final snapshot is kept, but export a backup first if you want to keep anything.', ok: 'Erase everything', danger: true }))) return;
    await resetAll(); app.ui = {}; go('home'); toast('All data erased');
  },
}, inputs: {
  'imp-file': async (el) => {
    const f = el.files?.[0]; if (!f) return;
    let obj; try { obj = JSON.parse(await f.text()); } catch { toast('That file isn\'t valid JSON'); return; }
    if (!(await confirmSheet({ title: 'Restore backup?', body: `This replaces your current data with the backup from ${obj?.exportedAt ? new Date(obj.exportedAt).toLocaleDateString() : 'the file'}.`, ok: 'Restore' }))) { el.value = ''; return; }
    try { await importData(obj); await saveNow(); app.ui.snaps = null; toast('Backup restored'); go('home'); } catch (e) { toast(esc(e.message)); }
    el.value = '';
  },
} });
