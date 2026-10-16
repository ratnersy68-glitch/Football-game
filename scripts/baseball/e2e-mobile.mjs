// Phone emulation: landscape iPhone-size viewport with touch. Taps through menus and uses the touch buttons.
import { chromium } from 'playwright';
const out = process.argv[2] ?? 'e2e-output';
const url = process.env.URL ?? 'http://localhost:5199/baseball.html';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto(url);
await page.waitForTimeout(2500);
let n = 0;
const snap = async (name) => { await page.waitForTimeout(700); await page.screenshot({ path: `${out}/m${String(++n).padStart(2, '0')}-${name}.png` }); };
await snap('home');
await page.tap('text=Play Ball');
await page.tap('.team-card[data-id=NYM]');
await snap('teams');
await page.tap('[data-a=next]');
await page.tap('.team-card[data-id=ATL]');
await page.tap('[data-a=next]');
await page.tap('.seg[data-g=side] [data-v=Away]');
await page.waitForTimeout(400);
await page.tap('[data-a=next]');
await snap('lineup');
await page.tap('[data-a=next]');
await snap('difficulty');
await page.tap('[data-a=go]');
await page.waitForTimeout(1500);
// skip intro via the touch ▶ button
for (let i = 0; i < 6; i++) { const b = await page.$('.tc-group[data-g=wait]:not([style*="none"]) .tbtn'); if (b) await b.tap(); await page.waitForTimeout(600); }
await snap('batting');
// drag to move the PCI, then tap SWING
const cv = await page.$('canvas');
const box = await cv.boundingBox();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.width / 2, y: box.height / 2 }] });
for (let i = 1; i <= 5; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.width / 2 + i * 8, y: box.height / 2 - i * 4 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
const pci = await page.evaluate(() => window.__bb.app.ctrl.pci);
console.log('pci after drag', pci);
const phase = await page.evaluate(() => window.__bb.app.engine.phase);
console.log('phase', phase);
await page.waitForTimeout(3000);
await page.tap('.tc-group[data-g=bat] .big');
await snap('swing');
const st = await page.evaluate(() => { const e = window.__bb.app.engine; return { phase: e.phase, swing: !!e.swing, count: `${e.state.balls}-${e.state.strikes}` }; });
console.log(st);
// pause button
await page.tap('.tc-top .tbtn');
await snap('pause');
console.log(errors.join('\n') || 'no page errors');
await browser.close();
