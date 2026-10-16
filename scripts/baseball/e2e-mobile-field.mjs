// Phone emulation as the home team: tap a pitch, PITCH meter, then fielding joystick + throw buttons.
import { chromium } from 'playwright';
const out = process.argv[2] ?? 'e2e-output';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto(process.env.URL ?? 'http://localhost:5199/baseball.html');
await page.waitForTimeout(2000);
await page.tap('text=Play Ball');
await page.tap('.team-card[data-id=PHI]'); await page.tap('[data-a=next]');
await page.tap('.team-card[data-id=MIL]'); await page.tap('[data-a=next]');
await page.tap('[data-a=next]'); await page.tap('[data-a=next]'); await page.tap('[data-a=go]');
await page.waitForTimeout(1200);
let n = 0;
const snap = async (name) => { await page.waitForTimeout(600); await page.screenshot({ path: `${out}/f${++n}-${name}.png` }); };
// Fast-forward to prepitch.
await page.evaluate(() => { const e = window.__bb.app.engine; for (let i = 0; i < 400 && e.phase !== 'prepitch'; i++) { const inp = window.__bb.emptyInput(); inp.skip = i % 10 === 0; e.update(1 / 60, inp); } window.__bb.app.handleEvents(e.drainEvents()); });
await snap('pitch-ui');
await page.tap('.pitchpanel [data-pkey=KeyS]');
await page.waitForTimeout(500);
const sel = await page.evaluate(() => window.__bb.app.engine.userPitch);
console.log('after tapping pitch S:', sel.stage, sel.code);
await page.tap('.tc-group[data-g=pitch] .big');
await page.waitForTimeout(900);
await snap('meter');
await page.tap('.tc-group[data-g=pitch] .big');
await page.waitForTimeout(400);
console.log('stage', await page.evaluate(() => window.__bb.app.engine.userPitch.stage));
// Force a ball in play to see the fielding controls.
await page.evaluate(() => {
  const a = window.__bb.app, e = a.engine;
  a.paused = true;
  for (let k = 0; k < 4000 && !(e.phase === 'live' && e.play.cfg.batter); k++) {
    const inp = window.__bb.emptyInput();
    if (e.phase === 'prepitch') { const up = e.userPitch; if (up.stage === 'select') inp.pitchSelect = 'FF'; else if (up.stage === 'aim') { inp.aim = { x: 0, y: 2.5 }; inp.meterPress = true; } else if (up.stage === 'meter' && up.meter >= up.zoneCenter) inp.meterPress = true; }
    else inp.skip = k % 15 === 0;
    e.update(1 / 60, inp); e.drainEvents();
  }
  for (let k = 0; k < 40; k++) e.update(1 / 60, window.__bb.emptyInput());
  a.paused = false;
});
await snap('fielding');
// Joystick: drag the stick up.
const stick = await page.$('.tc-stick');
const sb = await stick.boundingBox();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sb.x + sb.width / 2, y: sb.y + sb.height / 2 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sb.x + sb.width / 2, y: sb.y }] });
await page.waitForTimeout(200);
console.log('stick', await page.evaluate(() => window.__bb.app.ctrl.stick));
await snap('stick');
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
console.log('stick released', await page.evaluate(() => window.__bb.app.ctrl.stick));
console.log(errors.join('\n') || 'no page errors');
await browser.close();
