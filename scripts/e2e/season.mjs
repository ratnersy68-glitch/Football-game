// Full season through the UI: sim every week, postseason, celebration, offseason, next season, history.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const SP = process.env.SP ?? 'e2e-output';
mkdirSync(SP, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('dialog', (d) => d.accept());
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto(process.env.URL ?? 'http://localhost:5173');
await page.click('text=New Dynasty');
await page.click('.school-card:has-text("Ohio State")');
await page.click('text=Become Head Coach');
await page.waitForSelector('.hub-nav', { timeout: 20000 });
let steps = 0;
let shotPost = false;
while (steps++ < 40) {
  if (await page.$('text=Advance to Offseason')) break;
  const label = await page.$eval('.hub-top .meta', (e) => e.textContent);
  if (!shotPost && /Bowl Season|CFP/.test(label)) {
    shotPost = true;
    await page.screenshot({ path: `${SP}/30-postseason-home.png`, fullPage: true });
  }
  const simGame = await page.$('button:has-text("Sim Game")');
  if (simGame) {
    await simGame.click();
    await page.waitForSelector('.modal', { timeout: 30000 });
    await page.click('.modal button:has-text("Close")');
  } else {
    const b = await page.$('.next-game button.btn.primary');
    await b.click();
  }
  await page.waitForFunction((l) => document.querySelector('.hub-top .meta')?.textContent !== l || !!document.querySelector('.celebrate'), label, { timeout: 30000 });
}
console.log('steps', steps);
await page.screenshot({ path: `${SP}/31-season-complete.png`, fullPage: true });
await page.click('.hub-nav button:has-text("CFP & Bowls")');
await page.waitForTimeout(400);
await page.screenshot({ path: `${SP}/32-bracket.png`, fullPage: true });
await page.click('.hub-nav button:has-text("Home")');
await page.click('text=Advance to Offseason');
await page.waitForSelector('text=Offseason', { timeout: 30000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${SP}/33-offseason.png`, fullPage: true });
await page.click('text=/Begin \\d+ Season/');
await page.waitForFunction(() => /2027 Season/.test(document.querySelector('.hub-top .meta')?.textContent ?? ''), null, { timeout: 30000 });
await page.click('.hub-nav button:has-text("History")');
await page.click('table.data tbody tr');
await page.waitForTimeout(400);
await page.screenshot({ path: `${SP}/34-history.png`, fullPage: true });
await page.click('.hub-nav button:has-text("Coach Profile")');
await page.screenshot({ path: `${SP}/35-coach.png`, fullPage: true });
console.log('meta:', await page.$eval('.hub-top .meta', (e) => e.textContent));
console.log('ERRORS', errors);
await browser.close();
