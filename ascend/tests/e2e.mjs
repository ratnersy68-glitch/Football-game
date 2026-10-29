// Browser test of the critical flows. Serve the ascend/ folder first, e.g.
//   python3 -m http.server 4321 --directory ascend
//   node ascend/tests/e2e.mjs            (URL=http://127.0.0.1:4321/  OUT=e2e-output/ascend)
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

// works with a project-local or globally installed Playwright
const { chromium } = createRequire(import.meta.url)('playwright');

const URL = process.env.URL || 'http://127.0.0.1:4321/';
const OUT = process.env.OUT || 'e2e-output/ascend';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
let n = 0;
const shot = async (name, full = false) => page.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-${name}.png`, fullPage: full });
const click = (sel) => page.locator(sel).first().click();
const assert = (cond, msg) => { if (!cond) { throw new Error('ASSERT: ' + msg); } };

await page.goto(URL);
await page.waitForSelector('.welcome');
await page.waitForTimeout(400);
await shot('welcome');

// ---------- onboarding ----------
await click('[data-action="ob-next"]');
await page.fill('#ob-name', 'Sam'); await click('[data-action="ob-next"]');
await page.fill('#ob-age', '28'); await click('[data-action="ob-next"]');
await click('[data-action="ob-set"][data-v="lb"]'); await click('[data-action="ob-next"]');
await page.fill('#ob-hft', '5'); await page.locator('[data-k="hIn"]').fill('10'); await click('[data-action="ob-next"]');
await page.fill('#ob-weight', '180'); await shot('ob-weight'); await click('[data-action="ob-next"]');
await click('[data-action="ob-set"][data-v="intermediate"]'); await click('[data-action="ob-next"]');
await click('[data-action="ob-days"][data-delta="1"]'); await click('[data-action="ob-days"][data-delta="-1"]'); await click('[data-action="ob-next"]');
await click('[data-action="ob-equip-preset"][data-v="full"]'); await click('[data-action="ob-next"]');
await click('[data-action="ob-set"][data-v="ul"]'); await shot('ob-split'); await click('[data-action="ob-next"]');
await click('[data-action="ob-set"][data-v="strength"]'); await click('[data-action="ob-secondary"][data-v="muscle"]'); await click('[data-action="ob-next"]');
await click('[data-action="ob-set"][data-k="tType"][data-v="strength"]');
await page.fill('#ob-tval', '225'); await shot('ob-target'); await click('[data-action="ob-next"]');
await click('[data-action="ob-set"][data-v="male"]'); await click('[data-action="ob-next"]');
await shot('ob-done');
await click('[data-action="ob-finish"]');
await page.waitForSelector('.hello');
await page.waitForTimeout(500);
await shot('home', true);
assert(await page.locator('text=KEEP ASCENDING').count(), 'home greeting');
assert(await page.locator('text=Bench 225 lbs').count(), 'mission card shows goal');

// ---------- split editing ----------
await click('[data-action="tab"][data-tab="train"]');
await page.waitForSelector('.week-strip');
await shot('train', true);
await click('[data-action="edit-day"]');
await page.waitForSelector('#day-name');
const before = await page.locator('.slot').count();
await click('[data-action="day-add-ex"]');
await page.waitForSelector('#lib-q');
await click('[data-action="lib-muscle"][data-m="mobility"]');
await page.waitForTimeout(150);
assert(await page.locator('.ex-row:has-text("Cat-Cow")').count(), 'mobility category');
await shot('library-mobility');
await click('[data-action="lib-muscle"][data-m="all"]');
await page.fill('#lib-q', 'hammer');
await page.waitForTimeout(150);
await shot('library-search');
await click('[data-action="pick-ex"]');
await page.waitForSelector('#day-name');
assert(await page.locator('.slot').count() === before + 1, 'exercise added to day');
await click('[data-action="slot-move"][data-d="-1"]:not([disabled]) >> nth=-1');
await page.waitForTimeout(200); // reorder re-renders on the next frame
await page.fill('#day-name', 'Upper Power'); await page.locator('#day-name').blur();
await page.waitForTimeout(100);
await click('[data-action="slot-edit"]');
await page.waitForSelector('.sheet');
await click('[data-action="slot-step"][data-k="sets"][data-delta="1"]');
await shot('slot-sheet');
await click('[data-action="sheet-close"]');
await shot('day-editor', true);
await click('[data-action="tab"][data-tab="train"]');
assert(await page.locator('text=Upper Power').count(), 'day renamed');

// ---------- three workouts (placement) ----------
async function doWorkout(i, weight) {
  await click('[data-action="tab"][data-tab="train"]');
  await page.waitForSelector('[data-action="start-day"]');
  await click('[data-action="start-day"]:not([disabled])');
  await page.waitForSelector('.ex-card');
  if (i === 0) await shot('workout-start');
  const rows = page.locator('.set-row');
  const count = await rows.count();
  for (let r = 0; r < count; r++) {
    const row = rows.nth(r);
    const inputs = row.locator('input');
    if (await row.evaluate((el) => el.classList.contains('warm'))) { await row.locator('.set-check').click(); continue; }
    await inputs.nth(0).fill(String(weight));
    await inputs.nth(1).fill(String(8 + i));
    await inputs.nth(2).fill('8');
    await row.locator('.set-check').click();
    if (r === 0 && i === 0) { await page.waitForTimeout(150); await shot('set-complete'); }
  }
  await page.waitForTimeout(200);
  if (i === 0) {
    // watch the demonstration mid-workout, then come back to logged sets
    await click('[data-action="demo-open"]');
    await page.waitForSelector('.demo .demo-seq img.b');
    await page.waitForTimeout(1600);
    await shot('demo-player');
    await page.locator('.demo-panel').evaluate((el) => el.scrollTo(0, 99999));
    await page.waitForTimeout(200);
    await shot('demo-info');
    assert(await page.locator('.demo-chip:has-text("PHOTO SEQUENCE")').count(), 'demo labelled as photo sequence');
    assert(await page.locator('.demo-info:has-text("Common mistakes")').count(), 'common mistakes shown');
    await click('.demo-top [data-d="close"]');
    await page.waitForSelector('.demo', { state: 'detached' });
    assert(await page.locator('.set-row.done').count() === count, 'sets still logged after watching');
    assert(await page.locator('.rest-pill').count(), 'rest timer shown');
    await shot('workout-logged', true);
    await click('[data-action="rest-skip"]');
  }
  await click('[data-action="wk-finish"]');
  await page.waitForSelector('text=Workout complete', { timeout: 5000 });
}
async function dismissReveals() {
  await page.waitForTimeout(300);
  while (await page.locator('.reveal').count()) {
    await click('.reveal [data-r="skip"]').catch(() => {});
    await click('.reveal [data-r="close"]').catch(() => {});
    await page.waitForTimeout(800);
  }
}

await doWorkout(0, 135);
await dismissReveals();
await shot('summary-1', true);
await click('[data-action="go-home"]');
await doWorkout(1, 135);
// second workout beats first → PR reveal (milestone variant)
await page.waitForSelector('.reveal', { timeout: 4000 });
await page.waitForTimeout(1800);
await shot('pr-reveal');
await click('.reveal [data-r="skip"]');
await click('.reveal [data-r="close"]');
await dismissReveals();
await click('[data-action="go-home"]');
await doWorkout(2, 140);
// third workout → placement → rank reveal
await page.waitForSelector('.reveal', { timeout: 4000 });
await page.waitForTimeout(1500); await shot('rank-reveal-1.5s');
await page.waitForTimeout(1300); await shot('rank-reveal-2.8s');
await page.waitForTimeout(2600); await shot('rank-reveal-final');
assert(await page.locator('.reveal .title h1').innerText().then((t) => t.length > 0), 'rank title');
await click('.reveal [data-r="close"]');
await dismissReveals();
await shot('summary-3', true);

// ---------- rank screen ----------
await click('[data-action="tab"][data-tab="rank"]');
await page.waitForSelector('.rank-hero');
await page.waitForTimeout(300);
await shot('rank', true);
assert(!(await page.locator('.rank-name:has-text("Unranked")').count()), 'ranked after placement');

// ---------- goal change ----------
await click('[data-action="tab"][data-tab="goals"]');
await page.waitForSelector('.mission');
await shot('goals', true);
await click('.mission [data-action="goal-edit"]');
await page.fill('#gf-v', '250');
await click('[data-action="gf-save"]');
await page.waitForTimeout(300);
assert(await page.locator('text=Bench 250 lbs').count(), 'goal updated');
await click('[data-action="goal-new"]');
await click('[data-action="gf-type"][data-v="consistency"]');
await page.fill('#gf-v', '8');
await click('[data-action="gf-save"]');
await page.waitForTimeout(300);
await shot('goals-2', true);

// ---------- profile + subviews ----------
await click('[data-action="tab"][data-tab="profile"]');
await page.waitForSelector('text=Strength analytics');
await shot('profile', true);
for (const v of ['analytics', 'achievements', 'records', 'body', 'photos', 'settings', 'data']) {
  await page.evaluate((v) => window.ASCEND.go('profile', v), v);
  await page.waitForTimeout(250);
  await shot(`pf-${v}`, true);
}
await page.evaluate(() => window.ASCEND.go('train', 'calendar'));
await page.waitForTimeout(200);
await shot('calendar', true);
await page.evaluate(() => window.ASCEND.go('train', 'history'));
await page.waitForTimeout(200);
await click('[data-action="view-session"]');
await page.waitForTimeout(200);
await shot('session', true);

// body weight log
await page.evaluate(() => window.ASCEND.go('profile', 'body'));
await click('[data-action="bw-open"]');
await page.fill('#bw-in', '178.5');
await click('[data-action="bw-save"]');
await page.waitForTimeout(300);
assert(await page.locator('text=178.5 lbs').count(), 'body weight logged');

// unit switch
await page.evaluate(() => window.ASCEND.go('profile', 'settings'));
await click('[data-action="set-unit"][data-value="kg"]');
await page.evaluate(() => window.ASCEND.go('home'));
await page.waitForTimeout(200);
assert(await page.locator('text=/kg/').count(), 'kg shown after switch');
await click('[data-action="tab"][data-tab="profile"]');
await page.evaluate(() => window.ASCEND.go('profile', 'settings'));
await click('[data-action="set-unit"][data-value="lb"]');

// ---------- persistence ----------
const sessionsBefore = await page.evaluate(() => window.ASCEND.store.state.sessions.length);
await page.reload();
await page.waitForSelector('.hello, .topbar');
const sessionsAfter = await page.evaluate(() => window.ASCEND.store.state.sessions.length);
assert(await page.evaluate(() => window.ASCEND.store.state.profile.unit) === 'lb', 'unit change persisted across reload');
assert(sessionsBefore === 3 && sessionsAfter === 3, `sessions persisted (${sessionsBefore} → ${sessionsAfter})`);

// active workout survives reload
await page.evaluate(() => window.ASCEND.go('train'));
await click('[data-action="start-empty"]');
await page.waitForSelector('[data-action="wk-add-ex"]');
await click('[data-action="wk-add-ex"]');
await page.fill('#lib-q', 'pull-up');
await page.waitForTimeout(150);
await click('[data-action="pick-ex"]');
await page.waitForSelector('.ex-card');
await page.locator('.set-row input').nth(1).fill('10');
await page.waitForTimeout(400);
await page.reload();
await page.waitForSelector('.ex-card'); // reopens straight into the active workout
await click('[data-action="wk-minimize"]');
assert(await page.locator('text=Resume workout').count(), 'home offers to resume');
await click('[data-action="go-workout"]');
await page.waitForSelector('.ex-card');
assert(await page.locator('.set-row input').nth(1).inputValue() === '10', 'typed reps persisted');
await page.evaluate(() => { window.ASCEND.store.state.activeWorkout = null; });

// ---------- dark mode + desktop ----------
await page.emulateMedia({ colorScheme: 'dark' });
await page.evaluate(() => window.ASCEND.go('home'));
await page.waitForTimeout(300);
await shot('home-dark', true);
await page.evaluate(() => window.ASCEND.go('rank'));
await page.waitForTimeout(300);
await shot('rank-dark', true);
await page.setViewportSize({ width: 1280, height: 860 });
await page.emulateMedia({ colorScheme: 'light' });
await page.evaluate(() => window.ASCEND.go('home'));
await page.waitForTimeout(300);
await shot('home-desktop', true);

await browser.close();
if (errors.length) { console.error('Errors:\n' + errors.join('\n')); process.exit(1); }
console.log(`ASCEND e2e passed · ${n} screenshots in ${OUT}`);
