// Offline support: precache the app shell, then serve stale-while-revalidate.
// Demonstration images (media/) are not precached; each is cached the first time it's viewed.
const VERSION = 'ascend-v3';
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
  "./js/data/form.js",
  "./js/data/media.js",
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
  "./js/ui/demo.js",
  "./js/ui/emblems.js",
  "./js/ui/feedback.js",
  "./js/ui/icons.js",
  "./js/ui/marble.js",
  "./js/ui/reveal.js",
  "./js/util.js",
  "./js/coachApi.js",
  "./js/coachNudges.js",
  "./js/data/coaches.js",
  "./js/engine/coachContext.js",
  "./js/ui/avatars.js",
  "./js/ui/chat.js",
  "./js/ui/voice.js",
  "./js/views/coach.js",
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
  const url = new URL(req.url);
  // never cache the coach API — status and replies must always be live
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/api/')) return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit || (req.mode === 'navigate' ? cache.match('./index.html') : undefined));
    return hit || net;
  }));
});
