/** E2E: create a WR at Texas → live a week (class, practice, free time, phone) → play game day in 3D. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const SP = process.env.SP ?? 'e2e-output/season';
mkdirSync(SP, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto(process.env.URL ?? 'http://localhost:5173');
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('saturday26.playSettings', JSON.stringify({ quarterMinutes: 3 })); });
await page.reload();
await page.click('text=Player Career');
await page.click('text=New Career');
await page.fill('input[placeholder="First"]', 'Dre');
await page.fill('input[placeholder="Last"]', 'Wallace');
await page.click('.pos-card:has-text("Wide Receiver")');
await page.screenshot({ path: `${SP}/01-identity.png` });
await page.click('.create-nav .btn.primary');
await page.click('.school-pick:has-text("Texas")>> nth=0');
await page.screenshot({ path: `${SP}/02-school.png` });
for (let i = 0; i < 7; i++) await page.click('.create-nav .btn.primary');
await page.waitForSelector('.career-hub');
await page.waitForTimeout(500);
await page.screenshot({ path: `${SP}/03-hub.png` });
// open the phone: first contact with an invite
const inviter = page.locator('.contact:has(.invite-dot)').first();
if (await inviter.count()) {
  await inviter.click();
  await page.screenshot({ path: `${SP}/04-thread.png` });
  const acc = page.locator('.bubble .btn:has-text("Accept")').first();
  if (await acc.count()) await acc.click();
  await page.screenshot({ path: `${SP}/05-accepted.png` });
  await page.click('.thread-head .icon-btn');
}
// live the week until game day
for (let i = 0; i < 40; i++) {
  if (await page.locator('text=Play the Game (3D)').count()) break;
  const plan = page.locator('.plan-card .btn');
  if (await plan.count()) { await plan.click(); continue; }
  const go = page.locator('.now-card .btn.primary').first();
  if (await go.count()) { await go.click(); continue; }
  const choice = page.locator('.choice').nth(i % 3);
  await choice.click();
}
await page.screenshot({ path: `${SP}/06-gameday.png` });
console.log('meters', await page.locator('.meters').innerText());
await page.click('text=Play the Game (3D)');
await page.waitForFunction(() => window.__game, null, { timeout: 30000 });
const st = () => page.evaluate(() => { const s = window.__game.snapshot(); return { stage: s.stage, q: s.periodLabel, score: s.score, role: s.userRole, down: s.downLabel }; });
let shots = 0;
for (let k = 0; k < 2000; k++) {
  const s = await st();
  if (s.stage === 'final') break;
  if (s.stage === 'sim') { if (shots < 1) { await page.screenshot({ path: `${SP}/07-simcard.png` }); shots++; } await page.keyboard.press('Space'); }
  else if (s.stage === 'call') { await page.keyboard.press('Enter'); }
  else if (s.stage === 'presnap') { if (k < 6) await page.screenshot({ path: `${SP}/08-presnap-${k}.png` }); await page.keyboard.press('Space'); await page.waitForTimeout(1200); if (k < 6) await page.screenshot({ path: `${SP}/09-live-${k}.png` });
    // fast-forward the rest of the play (software rendering is slow here)
    await page.evaluate(() => { const g = window.__game; for (let i = 0; i < 3000 && g.sim.phase === 'live'; i++) g.sim.step(1 / 60, { move: { x: 0, y: 0 }, sprint: false }); }); }
  else if (s.stage === 'live') { await page.evaluate(() => { const g = window.__game; for (let i = 0; i < 3000 && g.sim.phase === 'live'; i++) g.sim.step(1 / 60, { move: { x: 0, y: 0 }, sprint: false }); }); }
  else if (s.stage === 'whistle') { await page.waitForTimeout(800); }
  else if (s.stage === 'result') { await page.keyboard.press('Space'); }
  else if (s.stage === 'fourth') { await page.click('text=Punt'); }
  else if (s.stage === 'over') break;
  await page.waitForTimeout(400);
  if (k % 5 === 0) console.log(k, JSON.stringify(await st()));
}
console.log('after', JSON.stringify(await st()));
await page.screenshot({ path: `${SP}/10-final.png` });
if ((await st()).stage === 'final') {
  await page.click('text=Back to Campus');
  await page.waitForSelector('.career-hub');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SP}/11-hub-after.png` });
  console.log('record', await page.locator('.ch-head .ovr-card').nth(1).innerText());
  await page.click('.tab:has-text("Schedule")');
  await page.screenshot({ path: `${SP}/12-schedule.png` });
  await page.click('.tab:has-text("Season Stats")');
  console.log('stats', (await page.locator('.ch-main .panel').innerText()).replace(/\n/g, ' '));
}
console.log('ERRORS', errors.length, errors.slice(0, 5).join('\n'));
await browser.close();
