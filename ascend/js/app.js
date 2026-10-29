// App shell: routing, rendering, event delegation, sheets and toasts.
import { store, update as storeUpdate, subscribe } from './store.js';
import { mountCharts } from './ui/charts.js';
import { icon } from './ui/icons.js';
import { haptic } from './ui/feedback.js';

export const app = {
  route: { tab: 'home', view: null, params: {} },
  ui: {},
  views: {},
  actions: {},
  inputs: {},
  sheet: null,
  get state() { return store.state; },
  get unit() { return store.state.profile?.unit || 'lb'; },
};

const TABS = [
  { id: 'home', label: 'HOME', icon: 'home' },
  { id: 'train', label: 'TRAIN', icon: 'train' },
  { id: 'rank', label: 'RANK', icon: 'rank' },
  { id: 'goals', label: 'GOALS', icon: 'goal' },
  { id: 'profile', label: 'PROFILE', icon: 'profile' },
];

export function register(name, view) {
  app.views[name] = view;
  Object.assign(app.actions, view.actions || {});
  Object.assign(app.inputs, view.inputs || {});
}

export function update(fn, opts) { storeUpdate(fn, opts); }

let pending = false;
export function render() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; renderNow(); });
}

export function renderNow() {
  const root = document.getElementById('app');
  const s = store.state;
  let html = '';
  let viewName;
  if (!s.profile) viewName = 'onboarding';
  else if (app.route.view) viewName = app.route.view;
  else viewName = app.route.tab;
  const view = app.views[viewName] || app.views.home;
  const key = `${viewName}|${JSON.stringify(app.route.params)}`;
  const fresh = root.dataset.key !== key;
  const body = view.render(app.route.params || {});
  const showNav = s.profile && !view.noNav;
  html = view.fullBleed ? body : `<div class="shell"><div class="${fresh ? 'view' : ''}">${body}</div></div>`;
  if (showNav) html += nav();
  root.innerHTML = html;
  root.dataset.key = key;
  renderSheet();
  mountCharts(root);
  view.mount?.(root, app.route.params || {});
  applyTitle(viewName);
}

function applyTitle(v) { document.title = v === 'home' || v === 'onboarding' ? 'ASCEND' : `ASCEND · ${v[0].toUpperCase()}${v.slice(1)}`; }

function nav() {
  const active = app.route.view ? (app.views[app.route.view]?.tab || app.route.tab) : app.route.tab;
  return `<nav class="nav" aria-label="Main">${TABS.map((t) => `<button class="${active === t.id ? 'on' : ''}" data-action="tab" data-tab="${t.id}" aria-current="${active === t.id ? 'page' : 'false'}">${icon(t.icon)}<span>${t.label}</span></button>`).join('')}</nav>`;
}

export function go(tab, view = null, params = {}, { scroll = true } = {}) {
  app.route = { tab: tab || app.route.tab, view, params };
  try { history.replaceState(null, '', `#${view || tab}`); } catch { /* sandboxed */ }
  renderNow();
  if (scroll) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

// ---------- sheets ----------
export function openSheet(fn) { app.sheet = fn; renderSheet(); }
export function closeSheet() {
  app.sheet = null;
  const el = document.getElementById('sheet-root');
  el.innerHTML = '';
}
export function renderSheet() {
  const el = document.getElementById('sheet-root');
  if (!app.sheet) { el.innerHTML = ''; return; }
  const prev = el.querySelector('.sheet');
  const top = prev ? prev.scrollTop : 0;
  const active = document.activeElement;
  const activeId = active && el.contains(active) ? active.id : null;
  el.innerHTML = `<div class="scrim" data-action="sheet-scrim"><div class="sheet" role="dialog" aria-modal="true">${app.sheet()}</div></div>`;
  const sh = el.querySelector('.sheet');
  if (prev) { sh.style.animation = 'none'; el.querySelector('.scrim').style.animation = 'none'; }
  sh.scrollTop = top;
  if (activeId) document.getElementById(activeId)?.focus();
  mountCharts(sh);
}

// ---------- toasts ----------
export function toast(msg, ms = 2600) {
  const wrap = document.getElementById('toast-root');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="dot"></span><span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s, transform .3s'; t.style.opacity = '0'; t.style.transform = 'translateY(-8px)'; }, ms);
  setTimeout(() => t.remove(), ms + 350);
}

/** Promise-based confirm rendered as a sheet. */
export function confirmSheet({ title, body = '', ok = 'Confirm', cancel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    app.ui._confirm = (v) => { app.ui._confirm = null; closeSheet(); resolve(v); };
    openSheet(() => `<div class="grab"></div><div class="h2">${title}</div>${body ? `<p class="muted mt-8">${body}</p>` : ''}
      <div class="row mt-24"><button class="btn ghost grow" data-action="confirm-no">${cancel}</button><button class="btn ${danger ? 'danger' : 'primary'} grow" data-action="confirm-yes">${ok}</button></div>`);
  });
}

// ---------- event delegation ----------
export function initEvents() {
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    const name = el.dataset.action;
    if (name === 'sheet-scrim') { if (ev.target === el) { if (app.ui._confirm) app.ui._confirm(false); else closeSheet(); } return; }
    if (name === 'sheet-close') { if (app.ui._confirm) app.ui._confirm(false); else closeSheet(); return; }
    if (name === 'confirm-yes') { app.ui._confirm?.(true); return; }
    if (name === 'confirm-no') { app.ui._confirm?.(false); return; }
    if (name === 'tab') { haptic('tap'); go(el.dataset.tab); return; }
    const fn = app.actions[name];
    if (fn) { ev.preventDefault(); fn(el, ev); }
  });
  const onInput = (ev) => {
    const el = ev.target.closest('[data-input]');
    if (!el) return;
    const fn = app.inputs[el.dataset.input];
    if (fn) fn(el, ev);
  };
  document.addEventListener('input', onInput);
  document.addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-change]');
    if (el) { const fn = app.inputs[el.dataset.change]; if (fn) fn(el, ev); }
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && app.sheet) { if (app.ui._confirm) app.ui._confirm(false); else closeSheet(); }
    if (ev.key === 'Enter' && ev.target.matches?.('[data-enter]')) { const fn = app.actions[ev.target.dataset.enter]; if (fn) { ev.preventDefault(); fn(ev.target, ev); } }
  });
  subscribe(() => render());
}

export { store };
