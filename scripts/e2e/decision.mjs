import { chromium } from 'playwright';
const SP = process.env.SP ?? 'e2e-output';
import { mkdirSync } from 'node:fs';
mkdirSync(SP, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto('http://localhost:5173');
await page.click('text=New Dynasty');
await page.click('.tab:has-text("Big 12")');
await page.click('.school-card:has-text("Kansas State")');
await page.click('text=Become Head Coach');
await page.waitForSelector('.hub-nav', { timeout: 20000 });
// Move QB2 to QB1 on the depth chart.
await page.click('.hub-nav button:has-text("Depth Chart")');
const before = await page.$$eval('.depth-row', (r) => r.map((x) => x.textContent));
await page.click('.depth-row:nth-child(2) .icon-btn:has-text("▲")').catch(() => {});
const rows = await page.$$('.depth-row');
await rows[1].$('button:has-text("▲")').then((b) => b.click());
const after = await page.$$eval('.depth-row', (r) => r.map((x) => x.textContent));
console.log('depth changed:', before[0] !== after[0]);
await page.click('.hub-nav button:has-text("Home")');
const playBtn = await page.$('text=Play Week');
if (!playBtn) { await page.click('text=Sim Week'); await page.waitForTimeout(1500); }
await page.click('text=Play Week');
await page.waitForSelector('canvas');
await page.click('text=Fast Sim');
const dec = await page.waitForSelector('.decision', { timeout: 60000 }).catch(() => null);
if (dec) {
  await page.screenshot({ path: `${SP}/20-decision.png` });
  await page.click('.decision button:has-text("Punt"), .decision button:has-text("Field Goal")');
  console.log('4th-down prompt shown & answered');
}
await page.click('text=Sim To End');
await page.waitForSelector('.final-overlay', { timeout: 20000 });
await page.click('text=Return to Dynasty');
await page.waitForSelector('.hub-nav');
const rec = await page.$eval('.kpi .v', (e) => e.textContent);
console.log('record after game:', rec);
await page.click('.hub-nav button:has-text("Schedule")');
await page.click('text=Box Score');
await page.waitForSelector('.modal');
await page.screenshot({ path: `${SP}/21-boxscore.png` });
await page.keyboard.press('Escape');
await page.mouse.click(10, 10);
await page.waitForTimeout(1500); // allow autosave
await page.reload();
await page.waitForSelector('text=Continue Dynasty');
const sub = await page.$eval('.menu-item:nth-child(2) small', (e) => e.textContent);
console.log('continue:', sub);
await page.click('text=Continue Dynasty');
await page.waitForSelector('.hub-nav');
console.log('after reload record:', await page.$eval('.kpi .v', (e) => e.textContent));
await page.screenshot({ path: `${SP}/22-continued.png` });
console.log('ERRORS', errors);
await browser.close();
