// ASCEND entry point.
import { app, initEvents, renderNow, go } from './app.js';
import { load, subscribe, saveNow, store } from './store.js';
import { requestPersistence } from './db.js';
import { applyMarble } from './ui/marble.js';
import { applyTheme } from './views/profile.js';
import { todaysDay, trainedToday } from './flows.js';
import './views/onboarding.js';
import './views/home.js';
import './views/train.js';
import './views/workout.js';
import './views/rank.js';
import './views/goals.js';
import './views/profile.js';

const TABS = ['home', 'train', 'rank', 'goals', 'profile'];

function routeFromHash() {
  const h = (location.hash || '').slice(1);
  if (TABS.includes(h)) return { tab: h, view: null };
  if (h === 'workout' && store.state.activeWorkout) return { tab: 'train', view: 'workout' };
  if (['analytics', 'achievements', 'records', 'body', 'photos', 'settings', 'data'].includes(h)) return { tab: 'profile', view: h };
  if (['library', 'history', 'calendar'].includes(h)) return { tab: 'train', view: h };
  return { tab: 'home', view: null };
}

function checkReminder() {
  const s = store.state;
  const r = s.prefs?.reminders;
  if (!s.profile || !r?.enabled || s.activeWorkout || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const [h, m] = (r.time || '17:30').split(':').map(Number);
  const key = now.toDateString();
  if (now.getHours() * 60 + now.getMinutes() < h * 60 + m || s.meta.remindedOn === key) return;
  const day = todaysDay(s);
  if (!day || trainedToday(s)) return;
  s.meta.remindedOn = key;
  saveNow();
  try { new Notification('ASCEND', { body: `${day.name} day is on the plan. Keep ascending.`, tag: 'ascend-reminder' }); } catch { /* ignore */ }
}

async function boot() {
  await load();
  applyTheme();
  applyMarble();
  initEvents();
  subscribe(() => applyTheme());
  const r = routeFromHash();
  app.route = { ...r, params: {} };
  renderNow();
  document.getElementById('boot')?.remove();
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => applyTheme());
  window.addEventListener('pagehide', () => { saveNow(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); else { renderNow(); checkReminder(); } });
  setInterval(checkReminder, 60000);
  checkReminder();
  requestPersistence();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline support unavailable */ });
  }
  window.ASCEND = { app, store, go };
}

boot().catch((e) => {
  console.error(e);
  const el = document.getElementById('boot');
  if (el) el.innerHTML = `<p style="font-family:system-ui;padding:24px">ASCEND couldn't start: ${String(e.message || e)}</p>`;
});
