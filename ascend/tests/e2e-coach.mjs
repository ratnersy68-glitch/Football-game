// Browser test of the AI coach, end to end through the real ASCEND server, with Google's API
// replaced by tests/mock-gemini.mjs. Run: node ascend/tests/e2e-coach.mjs   (OUT=dir for screenshots)
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from '../server/server.mjs';
import { startMockGemini } from './mock-gemini.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = process.env.OUT || 'e2e-output/ascend-coach';
mkdirSync(OUT, { recursive: true });
const SECRET = 'test-key-SECRET-9f3a7c';

const mock = await startMockGemini();
const env = { GEMINI_API_KEY: SECRET, GEMINI_API_BASE: `http://127.0.0.1:${mock.port}/v1beta/models` };
const srv = createServer({ env });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const URL = `http://127.0.0.1:${srv.address().port}/`;
const noKey = createServer({ env: {} });
await new Promise((r) => noKey.listen(0, '127.0.0.1', r));

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
const page = await ctx.newPage();
const errors = []; const bodies = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/status of (4|5)\d\d/.test(m.text())) errors.push('console: ' + m.text()); });
page.on('response', async (r) => { try { bodies.push(await r.text()); } catch { /* binary */ } });
let n = 0;
const shot = (name, full = false) => page.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-${name}.png`, fullPage: full });
const click = (sel) => page.locator(sel).first().click();
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
const control = (mode) => fetch(`http://127.0.0.1:${mock.port}/__control`, { method: 'POST', body: JSON.stringify({ mode }) });
const lastReq = async () => (await fetch(`http://127.0.0.1:${mock.port}/__last`)).json();
const sysText = (r) => r.body.systemInstruction.parts[0].text;

try {
  // ---------- seed a trainee with two logged bench sessions ----------
  await page.goto(URL);
  await page.waitForFunction(() => window.ASCEND);
  await page.evaluate(async () => {
    const { buildSplitFromTemplate, TEMPLATES } = await import('./js/data/templates.js');
    const { EQUIPMENT_PRESETS } = await import('./js/data/exercises.js');
    const { saveNow } = await import('./js/store.js');
    const st = window.ASCEND.store.state;
    const LB = 0.45359237; const ago = (d) => new Date(Date.now() - d * 864e5).toISOString();
    st.profile = { id: 'p', name: 'Sam', age: 28, heightCm: 178, bodyweightKg: 82, unit: 'lb', experience: 'intermediate', trainingDays: 4, equipment: EQUIPMENT_PRESETS.full, goalPrimary: 'strength', goalsSecondary: [], sexStandard: 'male', createdAt: ago(20) };
    const sp = buildSplitFromTemplate(TEMPLATES.find((t) => t.id === 'full'), { equipment: EQUIPMENT_PRESETS.full });
    sp.schedule = [0, 1, 2, 3, 4, 5, 6].map((i) => sp.days[i % 3].id);
    st.splits = [sp]; st.activeSplitId = sp.id;
    const mk = (id, d) => ({ id, date: ago(d), name: 'Full Body A', durationSec: 3300, exercises: [{ uid: id + 'b', exId: 'bench', sets: [1, 2, 3].map(() => ({ type: 'work', weightKg: 135 * LB, reps: 8, rpe: 8, done: true })) }, { uid: id + 's', exId: 'squat', sets: [1, 2, 3].map(() => ({ type: 'work', weightKg: 185 * LB, reps: 5, rpe: 8, done: true })) }] });
    st.sessions = [mk('s1', 5), mk('s2', 3)];
    st.goals = [{ id: 'g1', type: 'strength', exId: 'bench', targetKg: 225 * LB, baseline: 160 * LB, primary: true, createdAt: ago(10), milestonesHit: [] }];
    st.bodyweights = [{ date: ago(20), kg: 82 }];
    await saveNow();
  });
  await page.reload();
  await page.waitForSelector('.hello');

  // ---------- Phase 2: coach tab + setup ----------
  await click('[data-action="tab"][data-tab="coach"]');
  await page.waitForSelector('text=BUILD YOUR COACH');
  await shot('coach-intro');
  await click('[data-action="cs-next"]');
  await click('[data-action="cs-preset"][data-v="drill"]');
  await shot('coach-personality', true);
  await click('[data-action="cs-next"]');
  await click('[data-action="cs-name"][data-v="Marcus"]');
  await click('[data-action="cs-set"][data-k="voice"][data-v="deep"]');
  await click('[data-action="cs-set"][data-k="avatar"][data-v="atlas"]');
  await shot('coach-identity', true);
  await click('[data-action="cs-next"]');
  await click('[data-action="cs-consent"]');
  await shot('coach-privacy');
  await click('[data-action="cs-finish"]');
  await page.waitForSelector('.reveal');
  await page.waitForTimeout(4600);
  await shot('coach-reveal');
  assert(await page.locator('.reveal:has-text("YOUR COACH IS READY.")').count(), 'intro title');
  assert(await page.locator('.reveal:has-text("COACH MARCUS")').count(), 'intro name');
  await click('.reveal [data-r="close"]');
  await page.waitForSelector('.reveal', { state: 'detached' });

  // ---------- Phase 3: greeting + chat ----------
  await page.waitForSelector('.msg.coach', { timeout: 8000 });
  assert((await page.locator('.msg.coach .bubble').first().innerText()).includes("I'm Marcus"), 'personalised greeting from Gemini');
  await click('.chat-starters button:has-text("What should I train today?")');
  await page.waitForSelector('.chat-typing:not(.hide)', { timeout: 2000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelectorAll('.msg.coach').length >= 2);
  await page.fill('.chat-compose textarea', 'What should I bench today?');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('.msg.coach').length >= 3);
  let req = await lastReq();
  assert(req.key === SECRET, 'server sent key in header');
  assert(/The Drill Sergeant/.test(sysText(req)), 'drill sergeant persona in system prompt');
  assert(/## Barbell Bench Press/.test(sysText(req)) && /135×8@8, 135×8@8, 135×8@8/.test(sysText(req)), 'real bench history in context');
  assert(/MAIN Bench 225 lbs/.test(sysText(req)), 'goal in context');
  assert(req.body.contents.length >= 3 && req.body.contents[0].role === 'user', 'multi-turn history sent');
  const reply = await page.locator('.msg.coach .bubble').last().innerText();
  assert(reply.includes('135×8@8'), 'reply quotes saved numbers');
  assert(await page.locator('.msg.coach').last().locator('.msg-demos button').count(), 'demo link on reply');
  await shot('chat', false);

  // ---------- failures + retry ----------
  await control('429');
  await page.fill('.chat-compose textarea', 'Should I increase my weight?');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.msg.user.err');
  assert(await page.locator('.msg-err:has-text("too many requests")').count(), 'rate limit message');
  await shot('chat-error');
  await control('ok');
  await click('[data-c="retry"]');
  await page.waitForFunction(() => !document.querySelector('.msg.user.err') && document.querySelectorAll('.msg.coach').length >= 4);

  // ---------- persistence ----------
  const count = await page.locator('.msg').count();
  const before = await page.evaluate(() => window.ASCEND.store.state.aiCoach.messages.map((m) => m.id));
  await page.reload();
  await page.waitForSelector('.chat-log .msg');
  const after = await page.evaluate(() => window.ASCEND.store.state.aiCoach.messages.map((m) => ({ id: m.id, kind: m.kind, text: m.text })));
  assert(JSON.stringify(after.slice(0, before.length).map((m) => m.id)) === JSON.stringify(before), 'conversation persists after reload');
  // reopening the app on a planned training day triggers a real check-in (at most two a day)
  const nudges = after.slice(before.length);
  assert(nudges.length >= 1 && nudges.length <= 2 && nudges.every((m) => m.kind === 'nudge'), `proactive check-ins ${JSON.stringify(nudges)}`);
  assert(nudges.some((m) => /Full Body/.test(m.text)), 'pre-workout check-in names today\'s workout');
  assert(await page.locator('.msg').count() === count + nudges.length, 'all messages rendered');
  await shot('chat-nudges');

  // ---------- memory ----------
  await click('.msg.user [data-c="remember"]');
  await page.fill('.mem-edit textarea', 'Prefers morning workouts');
  await click('[data-c="mem-save"]');
  await page.fill('.chat-compose textarea', 'Am I making progress?');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('.msg.coach').length >= 5);
  assert(/- Prefers morning workouts/.test(sysText(await lastReq())), 'memory sent to Gemini');

  // ---------- switch personality, data preserved ----------
  await click('[data-c="settings"]');
  await page.waitForSelector('text=COACH SETTINGS');
  assert(await page.locator('textarea[aria-label="Memory"]').count() === 1, 'memory listed');
  await shot('coach-settings', true);
  await click('[data-action="cs-rebuild"]');
  await click('[data-action="cs-preset"][data-v="hype"]');
  await click('[data-action="cs-next"]'); await click('[data-action="cs-next"]');
  await click('[data-action="cs-finish"]');
  await page.waitForSelector('.reveal'); await click('.reveal [data-r="skip"]'); await click('.reveal [data-r="close"]');
  await page.waitForSelector('.reveal', { state: 'detached' });
  assert(await page.evaluate(() => window.ASCEND.store.state.sessions.length) === 2, 'workouts preserved when switching coach');
  await page.fill('.chat-compose textarea', 'How close am I to my goal?');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('.msg.coach').length >= 6);
  assert(/The Hype Coach/.test(sysText(await lastReq())), 'new persona used');

  // ---------- Phase 6: Ask Coach during a workout ----------
  await click('[data-action="tab"][data-tab="train"]');
  await click('[data-action="start-day"]:not([disabled])');
  await page.waitForSelector('.ex-card');
  const first = page.locator('.set-row:not(.warm)').first();
  await first.locator('input').nth(0).fill('140'); await first.locator('input').nth(1).fill('8');
  await first.locator('.set-check').click();
  await page.waitForTimeout(200);
  await click('.ex-actions [data-action="wk-ask"]');
  await page.waitForSelector('.coach-overlay .chat-focus');
  await shot('ask-coach-overlay');
  await click('.coach-overlay .chat-starters button:has-text("How long should I rest?")');
  await page.waitForFunction(() => document.querySelectorAll('.coach-overlay .msg.coach').length >= 1 && !document.querySelector('.coach-overlay .chat-typing:not(.hide)'));
  req = await lastReq();
  assert(/ACTIVE WORKOUT in progress/.test(sysText(req)) && /currently on Barbell Back Squat/.test(sysText(req)), 'live workout context');
  assert(/1\/\d sets done \(140×8\)/.test(sysText(req)), 'in-progress set included: ' + sysText(req).split('ACTIVE WORKOUT')[1]?.slice(0, 400));
  await click('.coach-overlay .chat-focus [data-c="demo"]');
  await page.waitForSelector('.demo');
  await click('.demo-top [data-d="close"]');
  await click('.coach-overlay [data-c="close"]');
  await page.waitForSelector('.coach-overlay', { state: 'detached' });
  assert(await page.locator('.set-row.done').count() === 1, 'workout progress kept after Ask Coach');

  // ---------- Phase 8: rank-up coach takeover ----------
  const total = await page.locator('.set-row').count();
  for (let i = 0; i < total; i++) {
    const row = page.locator('.set-row').nth(i);
    if (await row.evaluate((el) => el.classList.contains('done'))) continue;
    const ins = row.locator('input');
    if (!(await ins.nth(0).inputValue()) && (await ins.nth(0).getAttribute('placeholder')) === '—') await ins.nth(0).fill('50');
    if (!(await ins.nth(1).inputValue()) && (await ins.nth(1).getAttribute('placeholder')) === '—') await ins.nth(1).fill('8');
    await row.locator('.set-check').click();
  }
  await click('[data-action="wk-finish"]');
  await page.waitForSelector('.reveal', { timeout: 6000 });
  await page.waitForTimeout(5200);
  await shot('rank-takeover');
  const say = await page.locator('.rv-coach').innerText();
  assert(/COACH MARCUS/.test(say) && /THAT'S WHAT I'M TALKING ABOUT/.test(say), `hype rank line: ${say}`);
  while (await page.locator('.reveal').count()) { await click('.reveal [data-r="skip"]').catch(() => {}); await click('.reveal [data-r="close"]').catch(() => {}); await page.waitForTimeout(700); }
  assert(await page.evaluate(() => window.ASCEND.store.state.aiCoach.unread) >= 1, 'coach unread badge after takeover');

  // ---------- voice controls render ----------
  await click('[data-action="tab"][data-tab="coach"]');
  await page.waitForSelector('.chat-compose');
  const sp = page.locator('[data-c="speak-toggle"]');
  if (await sp.count()) { await sp.click(); assert((await sp.getAttribute('aria-pressed')) === 'true', 'speak toggle'); await sp.click(); }
  await shot('chat-final', false);

  // ---------- secrets never reach the browser ----------
  assert(!bodies.some((b) => b.includes(SECRET)), 'API key never appears in any response to the browser');

  // ---------- missing key & static copy ----------
  const p2 = await ctx.newPage();
  await p2.goto(`http://127.0.0.1:${noKey.address().port}/`);
  await p2.waitForFunction(() => window.ASCEND);
  await p2.evaluate(() => {
    const st = window.ASCEND.store.state;
    st.profile = { name: 'T', age: 30, heightCm: 175, bodyweightKg: 75, unit: 'kg', experience: 'beginner', trainingDays: 3, equipment: ['dumbbell'], sexStandard: 'neutral', createdAt: new Date().toISOString() };
    st.aiCoach.setupDone = true; st.aiCoach.prefs.consent = true;
    window.ASCEND.go('coach');
  });
  await p2.waitForSelector('text=Developer setup needed');
  await p2.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-missing-key.png` });
  await p2.close();
  // mobile layout: nothing wider than the viewport
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 0, `horizontal overflow ${overflow}px`);
} finally {
  await browser.close(); srv.close(); noKey.close(); mock.srv.close();
}
if (errors.length) { console.error('Errors:\n' + errors.join('\n')); process.exit(1); }
console.log(`ASCEND coach e2e passed · ${n} screenshots in ${OUT}`);
