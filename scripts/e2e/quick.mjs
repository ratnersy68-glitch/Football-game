import { chromium } from 'playwright';
const SP = process.env.SP ?? 'e2e-output';
import { mkdirSync } from 'node:fs';
mkdirSync(SP, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto('http://localhost:5173');
await page.click('text=Quick Sim');
await page.fill('input[placeholder^="Seed"]', '48291');
await page.click('text=Kick Off');
await page.waitForSelector('canvas');
await page.click('.btn:has-text("2x")');
for (let i = 0; i < 16; i++) {
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${SP}/q-${String(i).padStart(2, '0')}.png` });
}
const pbp1 = await page.$$eval('.pbp-item', (els) => els.map((e) => e.textContent).reverse().slice(0, 6));
console.log(pbp1.join('\n'));
console.log('ERRORS', errors);
await browser.close();
