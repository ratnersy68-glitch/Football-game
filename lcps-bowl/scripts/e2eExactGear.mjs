// Correction-pack acceptance in the browser:
// play (earn BB) → shop shows the 4 supplied helmet images + 4 supplied pad images → buy a helmet AND pads →
// equip both on the starting QB → reload (persistence) → next game: the QB visibly wears both. Also captures logos.
import { chromium } from 'playwright';
import fs from 'fs';
const OUT = process.argv[2] ?? 'e2e-output/exact';
const URL = process.argv[3] ?? 'http://127.0.0.1:5199/';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CERT')) errors.push(m.text()); });
const shot = (n, o = {}) => page.screenshot({ path: `${OUT}/${n}.png`, ...o });
const wait = (ms) => page.waitForTimeout(ms);
const log = (...a) => console.log(...a);
const bbOf = async (sel) => Number(((await page.textContent(sel)) ?? '').replace(/[^0-9]/g, ''));

await page.goto(URL);
await page.evaluate(async () => {
  localStorage.clear();
  localStorage.setItem('lcps-bowl:settings', JSON.stringify({ difficulty: 'FRESHMAN', quarterLen: 120 }));
  await new Promise((r) => { const q = indexedDB.deleteDatabase('lcps-bowl'); q.onsuccess = q.onerror = q.onblocked = r; });
});
await page.reload();
await wait(800);
await page.click('text=NEW DYNASTY');
await page.click('text=START HERE >> nth=0');
await wait(400);
await shot('x01-team-select-logos');
await page.click('.team-card:has-text("STONE BRIDGE")');
await page.fill('input', 'Taylor');
await page.click('text=BEGIN DYNASTY');
await wait(800);
log('BB at start:', await bbOf('.dh-stats .bb-badge'));

async function playGame(i) {
  await page.click('text=PLAY GAME');
  await wait(700);
  await page.click('text=KICK OFF ▸');
  await wait(1200);
  await page.keyboard.press('Enter');
  await wait(1500);
  if (i === 0) await shot('x02-live-scoreboard');
  await page.keyboard.press('Escape');
  await page.click('text=SIM TO END');
  await wait(1500);
  log(`Game ${i + 1}:`, await page.textContent('.final-result'));
  await page.click('.final-card >> text=CONTINUE ▸');
  await page.waitForSelector('text=GAME REWARDS', { timeout: 120000 });
  await wait(3500);
  if (await page.$('.drop-card')) { await wait(4000); await page.click('text=ADD TO LOCKER'); }
  log('  rewards', await page.textContent('.rw-total'));
  if (i === 0) await shot('x03-rewards');
  await page.click('.setup-go >> text=CONTINUE ▸');
  await wait(800);
}
// Earn enough for one helmet + one pad set (cheapest: F7 1,000 + 2-IN-1 400) by actually playing
for (let i = 0; i < 5; i++) {
  await playGame(i);
  const bb = await bbOf('.dh-stats .bb-badge');
  log('  BB now', bb);
  if (bb >= 1400) break;
}
// Shop: exact images
await page.click('.dyn-tab:has-text("LOCKER")');
await wait(600);
await page.click('.shop-tab:has-text("HELMETS")');
await wait(800);
const helmCards = await page.$$eval('.item-card', (cs) => cs.map((c) => ({ name: c.querySelector('.ic-name')?.textContent, img: c.querySelector('.product-panel img')?.getAttribute('src'), loaded: (c.querySelector('.product-panel img'))?.naturalWidth ?? 0 })));
log('Helmet cards:', JSON.stringify(helmCards));
await shot('x04-shop-helmets');
await page.click('.shop-tab:has-text("SHOULDER PADS")');
await wait(800);
const padCards = await page.$$eval('.item-card', (cs) => cs.map((c) => ({ name: c.querySelector('.ic-name')?.textContent, img: c.querySelector('.product-panel img')?.getAttribute('src'), loaded: (c.querySelector('.product-panel img'))?.naturalWidth ?? 0 })));
log('Pad cards:', JSON.stringify(padCards));
await shot('x05-shop-pads');
// Buy: best helmet we can afford while still affording the cheapest pads
const bb = await bbOf('.locker-head .bb-badge');
const helmPick = [['VICIS ZERO2 TRENCH', 2250], ['VICIS ZERO2', 2000], ['SPEEDFLEX', 1500], ['F7', 1000]].find(([, p]) => p + 400 <= bb) ?? ['F7', 1000];
async function buy(tab, name) {
  await page.click(`.shop-tab:has-text("${tab}")`);
  await wait(400);
  const card = page.locator('.item-card', { has: page.locator(`.ic-name:text-is("${name}")`) });
  await card.locator('.ic-buy').click();
  await wait(400);
  const msg = await card.locator('.ic-msg').textContent().catch(() => '');
  log(`Buy ${name}:`, msg, '→ BB', await bbOf('.locker-head .bb-badge'));
  // duplicate purchase must be impossible (no BUY button once owned)
  log(`  BUY button after purchase: ${await card.locator('.ic-buy').count()}`);
  return card;
}
await buy('HELMETS', helmPick[0]);
await buy('SHOULDER PADS', '2-IN-1 PADS');
// Equip both on the starting QB from the item detail
async function equip(tab, name, file) {
  await page.click(`.shop-tab:has-text("${tab}")`);
  await wait(400);
  await page.locator('.item-card', { has: page.locator(`.ic-name:text-is("${name}")`) }).click();
  await wait(700);
  const qb = await page.$$eval('.item-detail select option', (os) => os.map((o) => ({ v: o.value, t: o.textContent })).find((o) => o.t.startsWith('QB')));
  await page.selectOption('.item-detail select', qb.v);
  await page.click('.item-detail .id-eq-row button:text-is("EQUIP")');
  await wait(400);
  log(`Equip ${name}:`, await page.textContent('.id-msg'), '|', await page.textContent('.id-eq-state'));
  await shot(file);
  await page.keyboard.press('Escape');
  return qb.t;
}
const qbName = await equip('HELMETS', helmPick[0], 'x06-helmet-detail-equipped');
await equip('SHOULDER PADS', '2-IN-1 PADS', 'x07-pads-detail-equipped');
log('QB:', qbName);
// Reload: balance, ownership, equipped state persist
const bbBefore = await bbOf('.locker-head .bb-badge');
await page.reload();
await wait(1000);
log('Menu BB after reload:', await page.textContent('.menu-bb'), '(before reload', bbBefore, ')');
await page.click('text=CONTINUE DYNASTY');
await wait(1200);
await page.click('.dyn-tab:has-text("LOCKER")');
await wait(500);
await page.click('.locker-tab:has-text("MY GEAR")');
await wait(500);
for (const n of [helmPick[0], '2-IN-1 PADS']) log(`After reload ${n}:`, await page.locator('.item-card', { has: page.locator(`.ic-name:text-is("${n}")`) }).locator('.ic-status').textContent());
await shot('x08-mygear-after-reload');
// Standings / playoff picture logos
for (const [tab, file] of [['STANDINGS', 'x09-standings-logos'], ['RANKINGS', 'x10-rankings-logos'], ['PLAYOFF PICTURE', 'x11-playoff-logos']]) {
  await page.click(`.dyn-tab:has-text("${tab}")`);
  await wait(500);
  await shot(file);
}
// Next game: the QB wears both
await page.click('.dyn-tab:has-text("HOME")');
await wait(400);
await page.click('text=PLAY GAME');
await wait(600);
await page.click('text=KICK OFF ▸');
await wait(1200);
await page.keyboard.press('Enter');
let found = false;
for (let i = 0; i < 160 && !found; i++) {
  await wait(350);
  const st = await page.evaluate(() => ({ off: !!document.querySelector('.pc-tabs'), def: !!document.querySelector('.def-row'), modal: document.querySelector('.modal h2')?.textContent ?? '' }));
  if (st.off) {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('1');
    await wait(900);
    const info = await page.evaluate(async () => {
      const w = window.__lcps;
      const s = w.session, sim = s.sim, R = w.renderer;
      const qb = sim.actors[sim.qbIdx];
      const side = s.g.possession;
      const tg = s.team(side);
      const { resolveLook } = await import('/src/gear/look.ts');
      const { drawRig } = await import('/src/gear/rig/draw.ts');
      const look = resolveLook(qb.p, tg.info, side === 'home', tg.theme ?? 'none');
      const stock = resolveLook({ ...qb.p, id: qb.p.id + '-stock' }, tg.info, side === 'home', tg.theme ?? 'none', { ...qb.p.gear, helmet: 'helm-standard', pads: 'pads-standard' });
      const src = document.querySelector('canvas.game-canvas');
      const X = Math.round(R.sx(qb.x)), Y = Math.round(R.sy(qb.y));
      const c = document.createElement('canvas');
      c.width = 1200; c.height = 400; c.id = 'qbcheck';
      Object.assign(c.style, { position: 'fixed', left: 0, top: 0, zIndex: 9999 });
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#2c7a2c'; ctx.fillRect(0, 0, 1200, 400);
      ctx.drawImage(src, X - 24, Y - 42, 48, 48, 0, 20, 288, 288);
      ctx.fillStyle = '#fff'; ctx.font = '14px monospace';
      ctx.fillText('LIVE GAME PIXELS 6x', 6, 16);
      ctx.fillText(`QB LOOK: ${look.helmet.model} + ${look.pads}`, 310, 16);
      ctx.fillText('SAME QB, TEAM-ISSUED', 860, 16);
      ['right', 'toward', 'away'].forEach((d, i) => drawRig(ctx, 340 + i * 90, 300, look, 'skill', d, 'idle', 0, { scale: 5, number: qb.p.number }));
      drawRig(ctx, 880, 300, stock, 'skill', 'right', 'idle', 0, { scale: 5, number: qb.p.number });
      drawRig(ctx, 970, 300, stock, 'skill', 'toward', 'idle', 0, { scale: 5, number: qb.p.number });
      drawRig(ctx, 1060, 300, stock, 'skill', 'away', 'idle', 0, { scale: 5, number: qb.p.number });
      document.body.appendChild(c);
      return { name: qb.p.first + ' ' + qb.p.last, gear: { helmet: qb.p.gear?.helmet, pads: qb.p.gear?.pads }, model: look.helmet.model, pads: look.pads, picked: R.anim.pick(qb) };
    });
    log('QB in next game:', JSON.stringify(info));
    await shot('x12-next-game-presnap');
    await page.locator('#qbcheck').screenshot({ path: `${OUT}/x13-qb-wears-helmet-and-pads.png` });
    found = true;
  } else if (st.def) { await page.keyboard.press('1'); await wait(300); await page.keyboard.press('Space'); await wait(4000); }
  else if (st.modal.includes('KICK') || st.modal.includes('TRY')) await page.keyboard.press('1');
  else await page.keyboard.press('Enter');
}
log('errors:', errors.slice(0, 8));
await browser.close();
