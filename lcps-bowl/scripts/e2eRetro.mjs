// Mobile Retro-controls playtest: landscape phone viewport with touch. Tap to snap, drag back + release to throw,
// carrier auto-runs, swipe to juke/dive, 4th-down choices, drag-back field goals. Screenshots + engine checks.
import { chromium } from 'playwright';
import fs from 'fs';
const OUT = process.argv[2] ?? 'e2e-output/retro';
const URL = process.argv[3] ?? 'http://127.0.0.1:5199/';
const PLAYS = Number(process.argv[4] ?? 10);
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CERT')) errors.push(m.text()); });
const wait = (ms) => page.waitForTimeout(ms);
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
await page.goto(URL);
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('lcps-bowl:settings', JSON.stringify({ quarterLen: 120, difficulty: 'JV' })); });
await page.reload();
await wait(1200);
await shot('r01-menu');
await page.tap('text=EXHIBITION');
await wait(500);
await shot('r02-exhibition');
await page.tap('text=2 MIN');
await page.tap('text=KICK OFF');
await wait(900);
await shot('r03-intro');
const canvas = await page.$('canvas.game-canvas');
const box = await canvas.boundingBox();
const tapField = () => page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height * 0.55);
await tapField();
// Drag helper with the mouse (pointer events are identical for touch and mouse)
async function drag(fx, fy, tx, ty, ms = 260) {
  const x0 = box.x + box.width * fx, y0 = box.y + box.height * fy;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  const n = 8;
  for (let i = 1; i <= n; i++) { await page.mouse.move(x0 + (box.width * (tx - fx) * i) / n, y0 + (box.height * (ty - fy) * i) / n); await wait(ms / n); }
}
const state = () => page.evaluate(() => {
  const s = window.__lcps.session, sim = s.sim;
  return {
    phase: s.phase, gphase: s.g.phase, down: s.g.down, toGo: s.g.toGo, ballOn: s.g.ballOn, score: `${s.g.score.away}-${s.g.score.home}`,
    userTeam: sim?.setup.userTeam ?? null, kind: sim?.setup.kind, snapped: sim?.snapped, qbHolding: !!sim && sim.ball.state === 'held' && sim.ball.holder === sim.qbIdx && !sim.passThrown && !sim.pastLos,
    carrierIsUser: !!sim && !!sim.user && sim.carrier === sim.user, passThrown: sim?.passThrown, outcome: sim?.outcome?.type ?? null,
    retroCall: !!document.querySelector('.retro-call'), kick: !!document.querySelector('.retro-kick'), hint: document.querySelector('.hint')?.textContent ?? '',
    final: !!document.querySelector('.final-card'),
  };
});
let plays = 0, throws = 0, completions = 0, runs = 0, jukes = 0, dives = 0, kicks = 0, fourth = 0, shots = 0;
for (let i = 0; i < 600 && plays < PLAYS; i++) {
  await wait(250);
  const st = await state();
  if (st.final) break;
  if (st.retroCall) { fourth++; await shot(`r10-fourth-down-${fourth}`); await page.tap('.retro-btn >> nth=0'); continue; }
  if (st.kick) {
    kicks++;
    await drag(0.6, 0.5, 0.25, 0.52, 400);
    await shot(`r20-kick-aim-${kicks}`);
    await page.mouse.up();
    await wait(1500);
    continue;
  }
  if (st.phase === 'presnap' && st.userTeam === 'O') {
    if (shots < 2) await shot(`r04-presnap-${shots}`);
    await tapField();
    await wait(900);
    const s2 = await state();
    if (s2.qbHolding) {
      // Pull back from the middle of the screen toward the bottom-left → throw deep right/up
      // aim at the nearest receiver's spot: read it from the engine and convert to a pull-back gesture
      const aimAt = await page.evaluate(() => { const s = window.__lcps.session, sim = s.sim, qb = sim.actors[sim.qbIdx]; const rs = sim.actors.filter((a) => a.team === 'O' && a.role === 'route'); const r = rs[Math.floor(Math.random() * rs.length)]; const p = sim.predict(r, 0.9); return { dxYd: p.x - qb.x, dyYd: p.y - qb.y }; });
      const pullX = -(aimAt.dxYd / 2.6) * 12 / 640, pullY = -(aimAt.dyYd / 1.1) * 5 / 400;
      await drag(0.55, 0.5, 0.55 + pullX, 0.5 + Math.max(-0.45, Math.min(0.45, pullY)), 300);
      if (shots < 3) await shot(`r05-aiming-${shots}`);
      await page.mouse.up();
      throws++;
      await wait(150);
      const s3 = await state();
      if (!s3.passThrown) console.log('  throw not registered', JSON.stringify(s3));
      // wait for the ball to arrive
      for (let k = 0; k < 20; k++) { await wait(120); const s4 = await state(); if (s4.carrierIsUser || s4.outcome) break; }
      const s5 = await state();
      if (s5.carrierIsUser) {
        completions++;
        if (shots < 3) await shot(`r06-after-catch-${shots}`);
        await wait(250);
        // swipe up = juke
        await drag(0.5, 0.6, 0.5, 0.35, 120); await page.mouse.up(); jukes++;
        await wait(400);
        const s6 = await state();
        if (s6.carrierIsUser) { await drag(0.4, 0.5, 0.65, 0.5, 120); await page.mouse.up(); dives++; }
      } else if (s5.outcome) console.log('  pass result', s5.outcome);
      shots++;
    } else runs++;
    plays++;
    continue;
  }
  if (st.phase === 'live' && st.carrierIsUser) { await drag(0.5, 0.5, 0.5, 0.62, 300); await wait(300); await page.mouse.up(); continue; }
  if (['post', 'break', 'kick_anim', 'presnap'].includes(st.phase) || st.phase === 'intro') await tapField();
}
const end = await state();
await shot('r99-end');
console.log(JSON.stringify({ plays, throws, completions, runs, jukes, dives, kicks, fourth, end: end.score, phase: end.phase }));
console.log('errors:', errors.slice(0, 8));
await browser.close();
