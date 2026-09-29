import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const srv = createServer((req, res) => { try { res.end(readFileSync((req.url === '/' ? 'scripts/e2e/embed-host.html' : 'dist-embed' + req.url))); } catch { res.statusCode = 404; res.end(); } }).listen(8765);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:8765/');
const f = page.frameLocator('#f');
await f.locator('text=New Dynasty').click();
await f.locator('.tab:has-text("SEC")').click();
await f.locator('.school-card:has-text("Texas A&M")').click();
await f.locator('text=Become Head Coach').click();
await f.locator('.hub-nav').waitFor({ timeout: 20000 });
await f.locator('text=Play Week').click();
await f.locator('canvas').waitFor();
await page.waitForTimeout(4000);
await page.screenshot({ path: (process.env.SP ?? 'e2e-output') + '/40-embed.png' });
const popup = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
await f.locator('.fs-btn').click();
const p = await popup;
if (p) { await p.waitForLoadState(); await p.waitForTimeout(1500); console.log('new tab opened, menu visible:', await p.locator('text=New Dynasty').count() > 0); }
else console.log('fullscreen entered in place (no popup)');
console.log('ERRORS', errors);
await browser.close(); srv.close();
