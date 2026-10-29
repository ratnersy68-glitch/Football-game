// Offline support: precache the app shell, then serve stale-while-revalidate.
const VERSION = 'ascend-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  "./css/app.css",
  "./js/app.js",
  "./js/data/exercises.js",
  "./js/data/templates.js",
  "./js/db.js",
  "./js/engine/analytics.js",
  "./js/engine/coach.js",
  "./js/engine/goals.js",
  "./js/engine/history.js",
  "./js/engine/rank.js",
  "./js/engine/strength.js",
  "./js/engine/xp.js",
  "./js/flows.js",
  "./js/main.js",
  "./js/store.js",
  "./js/ui/charts.js",
  "./js/ui/components.js",
  "./js/ui/emblems.js",
  "./js/ui/feedback.js",
  "./js/ui/icons.js",
  "./js/ui/marble.js",
  "./js/ui/reveal.js",
  "./js/util.js",
  "./js/views/goals.js",
  "./js/views/home.js",
  "./js/views/onboarding.js",
  "./js/views/profile.js",
  "./js/views/rank.js",
  "./js/views/train.js",
  "./js/views/workout.js",
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit || (req.mode === 'navigate' ? cache.match('./index.html') : undefined));
    return hit || net;
  }));
});
