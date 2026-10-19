// Browser smoke test: menu → free ride → ski with real keyboard input → map → race → park.
// Usage: npm run dev (port 5180) then `node scripts/e2e.mjs [scenario]`
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.URL ?? 'http://localhost:5180/';
const OUT = new URL('../e2e-output/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const scenario = process.argv[2] ?? 'freeride';
const errors = [];
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const shot = (n) => page.screenshot({ path: `${OUT}${scenario}-${n}.png` });
const wait = (ms) => page.waitForTimeout(ms);
const state = () => page.evaluate(() => {
  const g = window.__summit;
  if (!g) return null;
  const s = g.player;
  return { state: s.state, speed: +s.speed.toFixed(2), y: +s.pos.y.toFixed(2), ground: +g.resort.terrain.height(s.pos.x, s.pos.z).toFixed(2), x: +s.pos.x.toFixed(1), z: +s.pos.z.toFixed(1), score: g.tricks.total, fps: g.hud().fps };
});
async function waitLoaded() {
  await page.waitForSelector('[data-testid=hud]', { timeout: 120000 });
  await wait(1500);
}
async function hold(key, ms) { await page.keyboard.down(key); await wait(ms); await page.keyboard.up(key); }

await page.goto(BASE);
await page.waitForSelector('[data-testid=menu-free-ride]');
await shot('01-menu');

if (scenario === 'freeride') {
  await page.click('[data-testid=menu-free-ride]');
  await shot('02-resorts');
  await page.click('[data-testid=resort-pine-valley]');
  await page.click('[data-testid=start-freeride]');
  await waitLoaded();
  await shot('03-start');
  console.log('start', await state());
  await hold('KeyW', 2500);
  console.log('after tuck', await state());
  await shot('04-skiing');
  await page.keyboard.down('KeyD'); await page.keyboard.down('ShiftLeft'); await wait(900); await page.keyboard.up('KeyD'); await page.keyboard.up('ShiftLeft');
  await page.keyboard.down('KeyA'); await wait(900); await page.keyboard.up('KeyA');
  console.log('after turns', await state());
  await shot('05-carve');
  await page.keyboard.down('Space'); await wait(400); await page.keyboard.up('Space');
  await page.keyboard.down('KeyE'); await wait(500); await page.keyboard.up('KeyE');
  await wait(800);
  console.log('after jump', await state());
  await shot('06-jump');
  await page.keyboard.press('KeyC'); await wait(1200); await shot('07-cam-close');
  await page.keyboard.press('KeyC'); await wait(1500); await shot('08-cam-cinematic');
  await page.keyboard.press('KeyC'); await wait(800); await shot('09-cam-first');
  await page.keyboard.press('KeyC'); await page.keyboard.press('KeyC'); await wait(600);
  await page.keyboard.press('KeyM'); await wait(800); await shot('10-map');
  await page.keyboard.press('KeyM'); await wait(500);
  await page.keyboard.press('KeyV'); await wait(2000); await shot('11-replay');
  await page.keyboard.press('Escape'); await wait(500);
  await page.keyboard.press('Escape'); await wait(400); await shot('12-pause');
  console.log('resume present', await page.evaluate(() => !!document.querySelector('[data-testid=resume]')), 'paused', await page.evaluate(() => window.__summit.paused));
  await page.click('[data-testid=resume]', { timeout: 5000 }).catch((e) => console.log('click failed', e.message.split('\n')[0]));
  await wait(300);
  console.log('final', await state());
}
if (scenario === 'race') {
  await page.click('[data-testid=menu-racing]');
  await page.click('[data-testid=race-pine-valley-0]');
  await waitLoaded();
  await shot('02-start-gate');
  await wait(4500);
  await shot('03-go');
  // ski the course holding tuck with gentle steering toward the gates (AI helper reads the line)
  for (let i = 0; i < 40; i++) {
    const steer = await page.evaluate(() => {
      const g = window.__summit; const r = g.race.player; const gate = g.race.gates[Math.min(r.next, g.race.gates.length - 1)];
      const s = r.skier; const want = Math.atan2(gate.x - s.pos.x, gate.z - s.pos.z); const cur = s.speed > 2 ? Math.atan2(s.vel.x, s.vel.z) : s.yaw;
      let e = want - cur; while (e > Math.PI) e -= 2 * Math.PI; while (e < -Math.PI) e += 2 * Math.PI; return e;
    });
    const key = steer > 0.08 ? 'KeyA' : steer < -0.08 ? 'KeyD' : null;
    if (key) await page.keyboard.down(key);
    await page.keyboard.down('ShiftLeft');
    await wait(250);
    if (key) await page.keyboard.up(key);
    await page.keyboard.up('ShiftLeft');
    if (i === 12) await shot('04-racing');
  }
  console.log('race', await page.evaluate(() => { const g = window.__summit; const r = g.race.player; return { next: r.next, missed: r.missed, clock: g.race.clock.toFixed(1), standings: g.race.standings().map((x) => x.name + ':' + x.next) }; }));
  await shot('05-race-late');
}
if (scenario === 'park') {
  await page.click('[data-testid=menu-terrain-parks]');
  await page.click('[data-testid=park-pine-valley-0]');
  await waitLoaded();
  await shot('02-park');
  await hold('KeyW', 1500);
  for (let i = 0; i < 6; i++) {
    await page.keyboard.down('Space'); await wait(300); await page.keyboard.up('Space');
    await page.keyboard.down('KeyE'); await page.keyboard.down('Digit2'); await wait(600); await page.keyboard.up('KeyE'); await page.keyboard.up('Digit2');
    await wait(500);
    if (i === 1) await shot('03-trick');
  }
  console.log('park', await state(), await page.evaluate(() => window.__summit.tricks.results.map((r) => r.name + ' ' + r.score)));
  await shot('04-park-late');
}
if (scenario === 'tutorial') {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('[data-testid=menu-settings]');
  await page.click('text=Low');
  await page.click('text=← Back');
  await page.click('[data-testid=menu-tutorial]');
  await waitLoaded();
  const step = () => page.evaluate(() => window.__summit.tutorialStep);
  await hold('KeyW', 3000); console.log('step after push', await step(), await state());
  await page.keyboard.down('KeyD'); await wait(2200); await page.keyboard.up('KeyD'); console.log('after steer', await step());
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down('KeyA'); await wait(1800); await page.keyboard.up('KeyA'); await page.keyboard.up('ShiftLeft'); console.log('after carve', await step());
  await hold('KeyS', 4000); console.log('after brake', await step());
  await page.keyboard.down('Space'); await wait(500); await page.keyboard.up('Space'); await wait(1500); console.log('after jump', await step());
  console.log('game time', await page.evaluate(() => window.__summit.time.toFixed(1)));
  await shot('02-tutorial');
}
if (scenario === 'screens') {
  for (const m of ['career', 'shop', 'character', 'mountains', 'racing', 'terrain-parks', 'leaderboards', 'settings']) {
    await page.click(`[data-testid=menu-${m}]`);
    await wait(900);
    await shot(`screen-${m}`);
    await page.click('text=← Back');
    await wait(300);
  }
}
if (scenario === 'showcase') {
  const ride = async (id) => {
    await page.goto(BASE + '?unlock=1');
    await page.click('[data-testid=menu-free-ride]');
    await page.click(`[data-testid=resort-${id}]`);
    await page.click('[data-testid=start-freeride]');
    await waitLoaded();
  };
  const teleport = (fn) => page.evaluate(fn);
  await ride('avalanche');
  await teleport(() => { const g = window.__summit; const t = g.resort.trails.find((t) => t.kind === 'trail' && t.difficulty === 'triple'); g.skiTrail(t.id); g.setWeather('clear', 15); });
  await wait(2500); await shot('avalanche-triple-top');
  await hold('KeyW', 2500); await shot('avalanche-triple-ski');
  await teleport(() => { const g = window.__summit; g.setWeather('heavy-snow', 12); const t = g.resort.trails.find((t) => t.kind === 'trail' && t.difficulty === 'double' && t.chute) ?? g.resort.trails.find((t) => t.difficulty === 'double'); g.skiTrail(t.id); });
  await wait(2500); await shot('avalanche-chute-snow');
  await ride('summit-x');
  await teleport(() => { const g = window.__summit; const p = g.resort.parks.find((p) => p.style === 'superpipe'); g.skiTrail(p.trailId); });
  await hold('KeyW', 1500); await wait(1200); await shot('summitx-superpipe');
  await teleport(() => { const g = window.__summit; const p = g.resort.parks.find((p) => p.style === 'slopestyle'); g.skiTrail(p.trailId); g.cam.mode = 'cinematic'; });
  await hold('KeyW', 2000); await wait(1500); await shot('summitx-slopestyle');
  await teleport(() => { const g = window.__summit; const p = g.resort.parks.find((p) => p.style === 'rails'); g.skiTrail(p.trailId); g.cam.mode = 'follow'; });
  await hold('KeyW', 2500); await shot('summitx-rails');
  await ride('alpine-world');
  await teleport(() => { const g = window.__summit; g.setWeather('clear', 17.4); g.travelToBase(); });
  await wait(2500); await shot('alpine-base-sunset');
  await teleport(() => { const g = window.__summit; const L = g.resort.lifts[0]; g.player.place(g.world, L.bottom.x, L.bottom.z - 5, Math.PI, 0); });
  await wait(500); await page.keyboard.press('KeyF'); await wait(3000); await shot('alpine-gondola-ride');
  await teleport(() => { const g = window.__summit; g.lifts.skip(g.player, g.world); g.setWeather('clear', 21.5); });
  await wait(2500); await shot('alpine-night');
  await ride('glacier-ridge');
  await teleport(() => { const g = window.__summit; const L = g.resort.lifts[2]; g.player.place(g.world, L.bottom.x, L.bottom.z - 5, Math.PI, 0); g.setWeather('clear', 10); });
  await wait(400); await page.keyboard.press('KeyF'); await wait(3500); await shot('glacier-chairlift');
  await teleport(() => { const g = window.__summit; g.lifts.skip(g.player, g.world); g.setWeather('fog', 10); });
  await wait(2500); await shot('glacier-top-fog');
}
console.log('errors', errors.slice(0, 10));
await browser.close();
