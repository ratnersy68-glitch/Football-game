// Browser test: new dynasty → pick school → coach → home → sim game → week results → pages.
import { chromium } from 'playwright';
const OUT = process.argv[2] ?? 'e2e-output';
const URL = process.argv[3] ?? 'http://127.0.0.1:5199/';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CERT') && !m.text().includes('404')) errors.push(m.text()); });
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: false });
const wait = (ms) => page.waitForTimeout(ms);
await page.goto(URL);
await wait(1200);
await page.click('text=NEW DYNASTY');
await wait(400);
await shot('d01-slots');
await page.click('text=START HERE >> nth=0');
await wait(400);
await shot('d02-teamselect');
await page.click('.team-card:has-text("RIVERSIDE")');
await wait(300);
await page.fill('input', 'Taylor');
await shot('d03-coach');
await page.click('text=BEGIN DYNASTY');
await wait(800);
await shot('d04-home');
for (const tab of ['ROSTER', 'SCHEDULE', 'STANDINGS', 'PLAYOFF PICTURE', 'RANKINGS', 'TEAM', 'PLAYERS', 'COACHING', 'RECRUITING', 'PROGRAM', 'STATS', 'RECORDS', 'NEWS']) {
  await page.click(`.dyn-tab:has-text("${tab}")`);
  await wait(250);
  await shot(`d05-${tab.toLowerCase().replace(' ', '-')}`);
}
await page.click('.dyn-tab:has-text("HOME")');
for (let w = 0; w < 3; w++) {
  await page.click('text=SIM GAME');
  await page.waitForSelector('text=AROUND LOUDOUN COUNTY', { timeout: 120000 });
  await wait(300);
  if (w === 0) await shot('d06-week-results');
  await page.click('text=CONTINUE');
  await wait(400);
}
await shot('d07-home-after');
await page.click('.dyn-tab:has-text("STANDINGS")');
await wait(300);
await shot('d08-standings-after');
console.log(JSON.stringify({ errors: errors.slice(0, 10) }));
await browser.close();
