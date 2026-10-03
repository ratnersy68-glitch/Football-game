// Browser playtest: menu → exhibition → full game with simple scripted inputs. Saves screenshots + reports errors.
import { chromium } from 'playwright';
const OUT = process.argv[2] ?? 'e2e-output';
const URL = process.argv[3] ?? 'http://127.0.0.1:5199/';
const MAX = Number(process.argv[4] ?? 220);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CERT')) errors.push(m.text()); });
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const wait = (ms) => page.waitForTimeout(ms);
await page.goto(URL);
await wait(1500);
await shot('01-menu');
await page.click('text=EXHIBITION');
await wait(400);
// quickest game for testing
await page.click('text=2 MIN');
await shot('02-exhibition');
await page.click('text=KICK OFF');
await wait(800);
await shot('03-intro');
await page.keyboard.press('Enter');
let shots = 0;
let offPlays = 0, defPlays = 0;
for (let i = 0; i < MAX; i++) {
  await wait(400);
  const st = await page.evaluate(() => ({
    off: !!document.querySelector('.pc-tabs'),
    def: !!document.querySelector('.def-row'),
    modal: document.querySelector('.modal h2')?.textContent ?? '',
    hint: document.querySelector('.hint')?.textContent ?? '',
    km: !!document.querySelector('.kick-meter'),
    final: !!document.querySelector('.final-card'),
    score: document.querySelector('.scoreboard')?.textContent ?? '',
  }));
  if (st.final) { await wait(800); await shot('99-final'); break; }
  if (st.off) {
    offPlays++;
    if (shots < 3) await shot(`05-playcall-${shots}`);
    const cat = offPlays % 3;
    for (let k = 0; k < cat; k++) await page.keyboard.press('ArrowRight');
    await page.keyboard.press(String(1 + (offPlays % 3)));
    await wait(500);
    if (shots < 3) await shot(`06-presnap-${shots}`);
    await page.keyboard.press('Space');
    await wait(1100);
    if (shots < 3) await shot(`07-live-${shots}`);
    await page.keyboard.press(String(1 + (offPlays % 4)));
    await page.keyboard.down('ShiftLeft');
    await page.keyboard.down('KeyD');
    await wait(1600);
    await page.keyboard.up('KeyD');
    await page.keyboard.up('ShiftLeft');
    shots++;
  } else if (st.def) {
    defPlays++;
    if (defPlays < 3) await shot(`08-defcall-${defPlays}`);
    await page.keyboard.press(String(1 + (defPlays % 4)));
    await page.keyboard.press('Enter');
    await wait(1600);
    if (defPlays < 3) await shot(`09-defense-${defPlays}`);
    await page.keyboard.down('KeyA');
    await wait(900);
    await page.keyboard.up('KeyA');
  } else if (st.km) {
    await shot('11-kickmeter');
    await wait(300);
    await page.keyboard.press('Space');
    await wait(500);
    await page.keyboard.press('Space');
    await wait(1200);
    await shot('12-kick');
  } else if (st.modal.includes('KICK') || st.modal.includes('TRY')) {
    await page.keyboard.press('1');
  } else {
    await page.keyboard.press('Enter');
  }
}
console.log(JSON.stringify({ offPlays, defPlays, errors: errors.slice(0, 10) }));
await shot('98-end');
await browser.close();
