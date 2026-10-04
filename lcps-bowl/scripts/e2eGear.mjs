// Browser validation: WIN A GAME → EARN BB → LCPS LOCKER → BUY → EQUIP ON QB → RELOAD → NEXT GAME → QB WEARS IT.
import { chromium } from 'playwright';
const OUT = process.argv[2] ?? 'e2e-output';
const URL = process.argv[3] ?? 'http://127.0.0.1:5199/';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const shot = (n, opts = {}) => page.screenshot({ path: `${OUT}/${n}.png`, ...opts });
const wait = (ms) => page.waitForTimeout(ms);
const log = (...a) => console.log(...a);
await page.goto(URL);
await page.evaluate(async () => {
  localStorage.clear();
  localStorage.setItem('lcps-bowl:settings', JSON.stringify({ difficulty: 'FRESHMAN', quarterLen: 120 }));
  await new Promise((r) => { const q = indexedDB.deleteDatabase('lcps-bowl'); q.onsuccess = q.onerror = q.onblocked = r; });
});
await page.reload();
await wait(800);
// New dynasty
await page.click('text=NEW DYNASTY');
await page.click('text=START HERE >> nth=0');
await page.click('.team-card:has-text("STONE BRIDGE")');
await page.fill('input', 'Taylor');
await page.click('text=BEGIN DYNASTY');
await wait(800);
const bbStart = await page.textContent('.dh-stats .bb-badge');
log('BB at start:', bbStart);
// Game 1
await page.click('text=PLAY GAME');
await wait(800);
await shot('g01-gameday-fit');
await page.click('text=KICK OFF ▸');
await wait(1200);
await page.keyboard.press('Enter');
await wait(1500);
await page.keyboard.press('Escape');
await page.click('text=SIM TO END');
await wait(1500);
const final = await page.textContent('.final-result');
log('Game 1 result:', final);
await page.click('text=CONTINUE ▸');
await page.waitForSelector('text=GAME REWARDS', { timeout: 120000 });
await wait(3500);
if (await page.$('.drop-card')) { await wait(4000); await shot('g02b-drop'); await page.click('text=ADD TO LOCKER'); }
await shot('g02-rewards');
const total = await page.textContent('.rw-total');
log('Rewards:', total);
// Locker
await page.click('text=OPEN LCPS LOCKER');
await wait(800);
await shot('g03-locker-featured');
const bbNow = Number((await page.textContent('.locker-head .bb-badge')).replace(/[^0-9]/g, ''));
log('BB in locker:', bbNow);
await page.click('.shop-tab:has-text("HELMETS")');
await wait(500);
await shot('g04-helmets');
// Try a modern shell, else a visor, else gloves
const wishlist = [['HELMETS', 'SPEED SHELL'], ['VISORS', 'BLUE VISOR'], ['GLOVES', 'TEAM GLOVES']];
let bought = null;
for (const [tab, name] of wishlist) {
  await page.click(`.shop-tab:has-text("${tab}")`);
  await wait(300);
  const card = page.locator('.item-card', { has: page.locator(`.ic-name:text-is("${name}")`) });
  const btn = card.locator('.ic-buy');
  if (await btn.count()) {
    await btn.click();
    await wait(500);
    const msg = await card.locator('.ic-msg').textContent().catch(() => '');
    log(`Buy ${name}:`, msg);
    if (msg && msg.includes('PURCHASED')) { bought = { tab, name }; await shot('g05-bought'); break; }
  }
}
log('Bought:', bought);
// Also try buying something we cannot afford to show the message
await page.click('.shop-tab:has-text("VISORS")');
await wait(300);
const chrome = page.locator('.item-card', { has: page.locator('.ic-name:text-is("CHROME VISOR")') });
await chrome.locator('.ic-buy').click();
await wait(300);
log('Unaffordable:', await chrome.locator('.ic-msg').textContent());
await shot('g06-not-enough');
// Equip on QB via item detail
await page.click(`.shop-tab:has-text("${bought.tab}")`);
await wait(300);
await page.locator('.item-card', { has: page.locator(`.ic-name:text-is("${bought.name}")`) }).click();
await wait(600);
const qbOption = await page.$$eval('.item-detail select option', (os) => os.map((o) => ({ v: o.value, t: o.textContent })).find((o) => o.t.startsWith('QB')));
await page.selectOption('.item-detail select', qbOption.v);
await page.click('.item-detail .id-eq-row button:text-is("EQUIP")');
await wait(400);
log('Equip:', await page.textContent('.id-msg'));
await shot('g07-equipped-detail');
await page.keyboard.press('Escape');
// Customize screen for the QB
await page.click('.locker-tab:has-text("CUSTOMIZE PLAYER")');
await wait(500);
await page.click('.cust-p >> nth=0');
await wait(500);
await shot('g08-customize');
// Persistence: reload the app and continue
await page.reload();
await wait(1000);
log('Menu BB after reload:', await page.textContent('.menu-bb'));
await page.click('text=CONTINUE DYNASTY');
await wait(1200);
await page.click('.dyn-tab:has-text("LOCKER")');
await wait(600);
await page.click('.locker-tab:has-text("MY GEAR")');
await wait(500);
const ownedAfter = await page.$$eval('.ic-name', (e) => e.map((x) => x.textContent));
log('Owned after reload includes purchase:', ownedAfter.includes(bought.name), 'equipped badge:', await page.locator('.item-card', { has: page.locator(`.ic-name:text-is("${bought.name}")`) }).locator('.ic-status').textContent());
await shot('g09-mygear-after-reload');
// Next game: play it and look at the QB pre-snap
await page.click('.dyn-tab:has-text("HOME")');
await wait(400);
await page.click('text=PLAY GAME');
await wait(600);
await page.click('text=KICK OFF ▸');
await wait(1200);
await page.keyboard.press('Enter');
let found = false;
for (let i = 0; i < 120 && !found; i++) {
  await wait(400);
  const st = await page.evaluate(() => ({ off: !!document.querySelector('.pc-tabs'), def: !!document.querySelector('.def-row'), modal: document.querySelector('.modal h2')?.textContent ?? '' }));
  if (st.off) {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('1');
    await wait(900);
    const info = await page.evaluate(() => {
      const w = window.__lcps;
      const sim = w.session.sim;
      const qb = sim.actors[sim.qbIdx];
      const c = document.querySelector('canvas.game-canvas').getBoundingClientRect();
      const k = c.width / 640;
      return { x: c.left + w.renderer.sx(qb.x) * k, y: c.top + w.renderer.sy(qb.y) * k, k, gear: qb.p.gear, name: qb.p.first + ' ' + qb.p.last };
    });
    log('QB in game:', info.name, JSON.stringify({ helmet: info.gear.helmet, visor: info.gear.visor, gloves: info.gear.gloves }));
    await shot('g10-game-presnap');
    await shot('g11-qb-closeup', { clip: { x: info.x - 70, y: info.y - 90, width: 140, height: 110 } });
    // 8x zoom of the actual game-canvas pixels around the QB, plus his resolved look vs a stock helmet
    await page.evaluate(async () => {
      const w = window.__lcps;
      const sim = w.session.sim;
      const qb = sim.actors[sim.qbIdx];
      const src = document.querySelector('canvas.game-canvas');
      const X = Math.round(w.renderer.sx(qb.x)), Y = Math.round(w.renderer.sy(qb.y));
      const { resolveLook } = await import('/src/gear/look.ts');
      const { drawGearedPlayer } = await import('/src/gear/sprite.ts');
      const sideName = w.session.g.possession;
      const side = w.session.team(sideName);
      const c = document.createElement('canvas');
      c.width = 900; c.height = 340; c.id = 'zoomcheck';
      Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: 9999, background: '#2c7a2c' });
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#2c7a2c'; ctx.fillRect(0, 0, 900, 340);
      ctx.drawImage(src, X - 20, Y - 36, 40, 40, 0, 10, 320, 320);
      const mine = resolveLook(qb.p, side.info, sideName === 'home', side.theme ?? 'none');
      const stock = resolveLook(qb.p, side.info, sideName === 'home', side.theme ?? 'none', { ...qb.p.gear, helmet: 'helm-standard' });
      drawGearedPlayer(ctx, 470, 300, mine, 1, 'stand', 0, 12, { presnap: true });
      drawGearedPlayer(ctx, 720, 300, stock, 1, 'stand', 0, 12, { presnap: true });
      ctx.fillStyle = '#fff'; ctx.font = '14px monospace';
      ctx.fillText('IN-GAME PIXELS (8x)', 8, 22); ctx.fillText('QB LOOK: ' + qb.p.gear.helmet, 380, 22); ctx.fillText('SAME FIT, STOCK SHELL', 640, 22);
      document.body.appendChild(c);
    });
    await page.locator('#zoomcheck').screenshot({ path: `${OUT}/g12-qb-zoom.png` });
    found = true;
  } else if (st.def) { await page.keyboard.press('Enter'); await wait(4000); }
  else if (st.modal.includes('KICK') || st.modal.includes('TRY')) await page.keyboard.press('1');
  else await page.keyboard.press('Enter');
}
log('errors:', errors.slice(0, 5));
await browser.close();
