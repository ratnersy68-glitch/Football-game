// Gameplay motion check: plays real downs in an exhibition, samples the animation director against engine state
// (throw → flight → catch → tuck → carry, tackles, kicks) and saves zoomed in-game crops as contact sheets.
import { chromium } from 'playwright';
import fs from 'fs';
const OUT = process.argv[2] ?? 'e2e-output/motion';
const URL = process.argv[3] ?? 'http://127.0.0.1:5199/';
const PLAYS = Number(process.argv[4] ?? 8);
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CERT')) errors.push(m.text()); });
const wait = (ms) => page.waitForTimeout(ms);
await page.goto(URL);
await wait(800);
await page.click('text=EXHIBITION');
await wait(300);
await page.click('text=2 MIN');
await page.click('text=KICK OFF');
await wait(800);
await page.keyboard.press('Enter');

// Sample the live play: director picks for key actors + ball state, and an 6x crop around the ball every ~60 ms
async function samplePlay(tag) {
  const frames = [];
  const log = [];
  for (let i = 0; i < 70; i++) {
    const r = await page.evaluate(() => {
      const w = window.__lcps;
      const s = w.session, sim = s.sim;
      if (!sim) return null;
      const R = w.renderer;
      const b = sim.ball;
      const pick = (a) => a ? { idx: a.idx, pos: a.pos, ...R.anim.pick(a) } : null;
      const qb = sim.actors[sim.qbIdx];
      const holder = b.state === 'held' && b.holder >= 0 ? sim.actors[b.holder] : null;
      const tgt = b.target >= 0 ? sim.actors[b.target] : null;
      const focus = holder ?? (b.state === 'air' || b.state === 'loose' ? { x: b.x, y: b.y } : qb ?? sim.actors[0]);
      const cv = document.querySelector('canvas.game-canvas');
      const X = Math.round(R.sx(focus.x)), Y = Math.round(R.sy(focus.y));
      const c = document.createElement('canvas'); c.width = 64 * 5; c.height = 48 * 5;
      const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(cv, X - 32, Y - 38, 64, 48, 0, 0, 64 * 5, 48 * 5);
      const evs = sim.events.map((e) => e.t);
      return { t: +sim.t.toFixed(2), phase: s.phase, ball: b.state, kind: b.kind, holder: holder?.idx ?? -1, done: sim.done, qb: pick(qb), holderPick: pick(holder), tgt: pick(tgt), evs, img: c.toDataURL('image/png'), outcome: sim.outcome?.type ?? null };
    });
    if (!r) break;
    frames.push(r.img);
    delete r.img;
    log.push(r);
    if (r.done && log.filter((x) => x.done).length > 14) break;
    await wait(55);
  }
  // contact sheet
  await page.evaluate(async ({ frames, file }) => {
    const cols = 10, w = 320, h = 240;
    const c = document.createElement('canvas'); c.width = cols * w; c.height = Math.ceil(frames.length / cols) * h;
    const ctx = c.getContext('2d');
    for (let i = 0; i < frames.length; i++) {
      const im = new Image(); im.src = frames[i]; await im.decode();
      ctx.drawImage(im, (i % cols) * w, Math.floor(i / cols) * h);
      ctx.fillStyle = '#fff'; ctx.font = '14px monospace'; ctx.fillText(String(i), (i % cols) * w + 4, Math.floor(i / cols) * h + 16);
    }
    window.__sheet = c.toDataURL('image/png');
  }, { frames, file: tag });
  const data = await page.evaluate(() => window.__sheet);
  fs.writeFileSync(`${OUT}/${tag}.png`, Buffer.from(data.split(',')[1], 'base64'));
  fs.writeFileSync(`${OUT}/${tag}.json`, JSON.stringify(log, null, 1));
  return log;
}

let n = 0, guard = 0;
const summary = [];
while (n < PLAYS && guard++ < 400) {
  await wait(300);
  const st = await page.evaluate(() => ({ off: !!document.querySelector('.pc-tabs'), def: !!document.querySelector('.def-row'), modal: document.querySelector('.modal h2')?.textContent ?? '', final: !!document.querySelector('.final-card'), live: window.__lcps?.session?.phase }));
  if (st.final) break;
  if (st.off) {
    // alternate pass (tab 2) and run (tab 1)
    const pass = n % 2 === 0;
    if (pass) await page.keyboard.press('ArrowRight');
    await page.keyboard.press(pass ? '2' : '1');
    await wait(400);
    await page.keyboard.press('Space');
    if (pass) { await wait(900); await page.keyboard.press('1'); }
    const log = await samplePlay(`play${n}-${pass ? 'pass' : 'run'}`);
    summary.push({ n, pass, seq: [...new Set(log.map((l) => `${l.ball}:${l.holderPick ? l.holderPick.pos + '/' + l.holderPick.action : '-'}`))].join(' > '), outcome: log.at(-1)?.outcome, evs: log.at(-1)?.evs });
    n++;
  } else if (st.def) {
    await page.keyboard.press('1');
    await wait(300);
    await page.keyboard.press('Space');
    const log = await samplePlay(`play${n}-def`);
    summary.push({ n, def: true, seq: [...new Set(log.map((l) => `${l.ball}:${l.holderPick ? l.holderPick.pos + '/' + l.holderPick.action : '-'}`))].join(' > '), outcome: log.at(-1)?.outcome, evs: log.at(-1)?.evs });
    n++;
  } else if (st.modal.includes('KICK') || st.modal.includes('TRY') || st.modal.includes('PUNT')) await page.keyboard.press('1');
  else await page.keyboard.press('Enter');
}
for (const s of summary) console.log(JSON.stringify(s));
console.log('errors:', errors.slice(0, 8));
await browser.close();
