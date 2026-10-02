// Browser smoke test: menu flow → game → pitches/swings. Usage: node scripts/baseball/e2e.mjs [outDir]
import { chromium } from 'playwright';
const out = process.argv[2] ?? 'e2e-output';
const url = process.env.URL ?? 'http://localhost:5199/baseball.html';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 820 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(url);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/01-home.png` });
await page.click('text=Play Ball');
await page.waitForTimeout(400);
await page.click('.team-card[data-id=NYY]');
await page.screenshot({ path: `${out}/02-team.png` });
await page.click('[data-a=next]');
await page.click('.team-card[data-id=BOS]');
await page.click('[data-a=next]');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/03-park.png` });
await page.click('[data-a=next]');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/04-lineup.png` });
await page.click('[data-a=next]');
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/05-diff.png` });
await page.click('[data-a=go]');
await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}/06-game-start.png` });
// We are home: top of the 1st we pitch.
for (let i = 0; i < 3; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
}
await page.screenshot({ path: `${out}/07-pitching.png` });
await page.keyboard.press('KeyA');
await page.mouse.move(700, 450);
await page.waitForTimeout(200);
await page.keyboard.press('Space');
await page.waitForTimeout(880);
await page.screenshot({ path: `${out}/08-meter.png` });
await page.keyboard.press('Space');
await page.waitForTimeout(1300);
await page.screenshot({ path: `${out}/09-pitch.png` });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${out}/10-after.png` });
console.log(errors.join('\n') || 'no errors');
await browser.close();
