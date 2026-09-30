/**
 * E2E: Player Career Milestone 1 loop — create a player, customize gear, enter the stadium,
 * call plays, snap, throw, run after the catch, and see down & distance update. Real keyboard input.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const SP = process.env.SP ?? 'e2e-output/career';
mkdirSync(SP, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(process.env.URL ?? 'http://localhost:5173');
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.screenshot({ path: `${SP}/01-menu.png` });
await page.click('text=Player Career');
await page.click('text=Create New Player');
await page.fill('input[placeholder="First"]', 'Jordan');
await page.fill('input[placeholder="Last"]', 'Hayes');
await page.waitForTimeout(800);
await page.screenshot({ path: `${SP}/02-identity.png` });
await page.click('text=Next: Archetype');
await page.click('.arch-card:has-text("Gunslinger")');
await page.screenshot({ path: `${SP}/03-archetype.png` });
await page.click('text=Next: Body & Look');
await page.click('.chip:has-text("dreads")');
await page.click('.chip:has-text("goatee")');
await page.waitForTimeout(600);
await page.screenshot({ path: `${SP}/04-body.png` });
await page.click('text=Next: Build');
await page.click('text=Auto-Build');
await page.screenshot({ path: `${SP}/05-build.png` });
await page.click('text=Next: Number');
await page.click('.num:text-is("7")');
await page.waitForTimeout(200);
await page.screenshot({ path: `${SP}/06-number.png` });
await page.click('text=Next: Gear');
for (const [row, opt] of [['Facemask', 'Robot'], ['Visor', 'Iridescent'], ['Left Arm', 'Black Sleeve'], ['Right Arm', 'Team Sleeve'], ['Gloves', 'White'], ['Cleats', 'Gold'], ['Towel', 'Both Sides'], ['Socks', 'High White']]) {
  await page.click(`.gear-row:has(.label:text-matches("^${row}$", "i")) .chip:text-matches("^${opt}$", "i")`);
}
await page.click('.preview-bar .btn:has-text("Helmet")');
await page.waitForTimeout(900);
await page.screenshot({ path: `${SP}/07-gear-helmet.png` });
await page.click('.preview-bar .btn:has-text("Full Body")');
await page.waitForTimeout(900);
await page.screenshot({ path: `${SP}/08-gear-full.png` });
await page.click('text=Next: Kickoff');
await page.screenshot({ path: `${SP}/09-kickoff.png` });
await page.click('text=Enter Ohio Stadium');
await page.waitForSelector('.playcall', { timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${SP}/10-playcall.png` });

const state = () => page.evaluate(() => { const g = window.__game; const s = g.snapshot(); return { stage: s.stage, down: s.downLabel, spot: s.spotLabel, ctrl: s.controlledLabel, qb: s.controlledIsQB, ball: g.sim.ball.state, t: g.sim.t }; });
for (let play = 0; play < 6; play++) {
  await page.waitForFunction(() => ['call', 'fourth', 'over'].includes(window.__game.snapshot().stage), null, { timeout: 30000 });
  const s0 = await state();
  if (s0.stage === 'over') break;
  if (s0.stage === 'fourth') {
    await page.screenshot({ path: `${SP}/fourth-down.png` });
    await page.click('text=Go For It');
  }
  await page.waitForSelector('.playcall');
  await page.keyboard.press('Enter'); // coach's call
  await page.waitForTimeout(700);
  if (play === 0) await page.screenshot({ path: `${SP}/11-presnap.png` });
  await page.keyboard.press('Space');
  // drop back
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyS');
  await page.waitForTimeout(900);
  if (play === 0) await page.screenshot({ path: `${SP}/12-pocket.png` });
  // throw to the most open receiver by holding its key
  const slot = await page.evaluate(() => { const g = window.__game; let best = 1, bs = -1; ['X','H','Y','Z','RB'].forEach((s, i) => { const v = g.sim.separation(s); if (v > bs) { bs = v; best = i + 1; } }); return best; });
  await page.keyboard.down(`Digit${slot}`);
  await page.waitForTimeout(play % 2 ? 250 : 550);
  if (play === 0) await page.screenshot({ path: `${SP}/13-charging.png` });
  await page.keyboard.up(`Digit${slot}`);
  await page.waitForTimeout(450);
  if (play === 0) await page.screenshot({ path: `${SP}/14-ball-in-air.png` });
  // run with whoever has it
  await page.keyboard.down('ShiftLeft');
  await page.keyboard.down('KeyW');
  for (let i = 0; i < 150; i++) {
    const s = await state();
    if (s.stage !== 'live') break;
    if (i === 6 && play === 0) await page.screenshot({ path: `${SP}/15-after-catch.png` });
    await page.waitForTimeout(200);
  }
  await page.keyboard.up('KeyW');
  await page.keyboard.up('ShiftLeft');
  try {
    await page.waitForFunction(() => window.__game.snapshot().stage === 'result', null, { timeout: 90000 });
  } catch (e) {
    console.log('STUCK', await page.evaluate(() => { const g = window.__game; const b = g.sim.ball; return JSON.stringify({ stage: g.stage, phase: g.sim.phase, t: g.sim.t, ball: { s: b.state, x: b.x, y: b.y, z: b.z, holder: b.holder, target: b.target }, ctrl: g.sim.controlledId, qb: (({x, y}) => ({x, y}))(g.sim.user) }); }));
    await page.screenshot({ path: `${SP}/stuck.png` });
    throw e;
  }
  await page.screenshot({ path: `${SP}/16-result-${play}.png` });
  console.log('play', play, JSON.stringify(await state()), await page.textContent('.result-head'));
  await page.click('.result-card button:has-text("Continue")');
  await page.waitForTimeout(300);
}
const s = await state();
console.log('final', JSON.stringify(s));
await page.screenshot({ path: `${SP}/17-end.png` });
await page.click('text=Pause').catch(() => {});
await page.waitForTimeout(300);
await page.screenshot({ path: `${SP}/18-pause.png` });
console.log('ERRORS', errors.length, errors.slice(0, 10).join('\n'));
await browser.close();
