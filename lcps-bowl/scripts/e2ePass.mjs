import { chromium } from 'playwright';
const OUT = process.argv[2];
const URL = process.argv[3] ?? 'http://127.0.0.1:5199/';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const wait = (ms) => page.waitForTimeout(ms);
await page.goto(URL);
await wait(800);
await page.click('text=EXHIBITION');
await page.click('text=5 MIN');
await page.click('text=PLAY DEFENSE');
await page.click('text=KICK OFF');
await wait(500);
await page.keyboard.press('Enter');
let didPass = false, didDef = false;
for (let i = 0; i < 200 && !(didPass && didDef); i++) {
  await wait(300);
  const st = await page.evaluate(() => ({ off: !!document.querySelector('.pc-tabs'), def: !!document.querySelector('.def-row'), modal: document.querySelector('.modal h2')?.textContent ?? '' }));
  if (st.off && !didPass) {
    await page.keyboard.press('ArrowRight');
    await wait(200);
    await shot('p01-short-tab');
    await page.keyboard.press('1');
    await wait(700);
    await shot('p02-presnap');
    await page.keyboard.press('Space');
    await wait(1000);
    await shot('p03-dropback');
    await page.keyboard.press('2');
    await wait(250);
    await shot('p04-throw');
    await wait(900);
    await shot('p05-after');
    didPass = true;
  } else if (st.off) {
    await page.keyboard.press('1'); await wait(500); await page.keyboard.press('Space'); await wait(3000);
  } else if (st.def && !didDef) {
    await page.keyboard.press('2');
    await page.keyboard.press('ArrowRight');
    await wait(200);
    await shot('p06-defcall');
    await page.keyboard.press('Enter');
    await wait(900);
    await shot('p07-def-presnap');
    await wait(2500);
    await shot('p08-def-live');
    didDef = true;
  } else if (st.def) {
    await page.keyboard.press('Enter'); await wait(4000);
  } else if (st.modal.includes('KICK') || st.modal.includes('TRY')) {
    await page.keyboard.press('1');
  } else {
    await page.keyboard.press('Enter');
  }
}
console.log(JSON.stringify({ didPass, didDef, errors }));
await browser.close();
