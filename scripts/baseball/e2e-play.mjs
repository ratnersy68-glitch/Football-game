// Drives real at-bats through the in-page hook: user bats (perfect-ish swings), then fields.
import { chromium } from 'playwright';
const out = process.argv[2] ?? 'e2e-output';
const url = process.env.URL ?? 'http://localhost:5199/baseball.html';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message + '\n' + e.stack));
await page.goto(url);
await page.waitForTimeout(1500);
await page.click('text=Play Ball');
await page.click(`.team-card[data-id=${process.env.TEAM ?? 'LAD'}]`);
await page.click('[data-a=next]');
await page.click(`.team-card[data-id=${process.env.OPP ?? 'SF'}]`);
await page.click('[data-a=next]');
await page.click('.seg[data-g=side] [data-v=Away]');
await page.waitForTimeout(300);
await page.click('[data-a=next]');
await page.click('[data-a=next]');
await page.click(`.diff[data-d="${process.env.DIFF ?? 'VETERAN'}"]`);
await page.click('[data-a=go]');
await page.waitForTimeout(800);

// Step helper in page: advances the engine with fixed dt and an input function.
await page.evaluate(() => {
  const H = window.__bb;
  const a = H.app;
  a.paused = true; // stop the rAF loop from advancing logic; rendering continues
  window.__step = (frames, mode) => {
    const e = a.engine;
    for (let i = 0; i < frames; i++) {
      const inp = H.emptyInput();
      if (mode === 'skip' && i % 10 === 0) inp.skip = true;
      if (mode === 'bat' && e.phase === 'pitch' && !e.swing && e.flight) {
        const tc = H.timeAtZ(e.flight, H.CONTACT_Z);
        const p = H.pitchPos(e.flight, tc);
        // Swing at strikes only, aim a hair under the ball for lift.
        const inZone = Math.abs(e.flight.plate.x) < 0.85 && e.flight.plate.y > 1.4 && e.flight.plate.y < 3.6;
        if (inZone && e.pitchT >= tc - 0.14 - 0.004) { inp.swing = 'normal'; inp.pci = { x: p.x, y: p.y - 0.07 }; }
        else inp.pci = { x: 0, y: 2.5 };
      }
      if (mode === 'bat' && e.phase !== 'pitch') inp.skip = i % 20 === 0;
      e.update(1 / 60, inp);
      a.handleEvents(e.drainEvents());
      a.hud.update(e, { throwHold: null, throwFill: 1, swingPreview: 'normal', runnerSel: null, replayAvailable: false });
      a.hud.tick(1 / 60);
    }
    return { phase: e.phase, inning: e.state.inning, half: e.state.half, outs: e.state.outs, score: `${e.state.away.runs}-${e.state.home.runs}`, count: `${e.state.balls}-${e.state.strikes}`, playT: e.play?.t ?? 0, contact: e.contact ? `${e.contact.label} ${e.contact.ev.toFixed(0)}mph ${e.contact.la.toFixed(0)}°` : '' };
  };
});
const step = (n, mode = 'bat') => page.evaluate(([n, m]) => window.__step(n, m), [n, mode]);
let shot = 0;
const snap = async (name) => { await page.waitForTimeout(250); await page.screenshot({ path: `${out}/p${String(++shot).padStart(2, '0')}-${name}.png` }); };

let st = await step(100);
console.log('start', st);
await snap('batting-view');
// Play until a ball is put in play, screenshot the swing moment and the flight.
let inPlay = 0;
for (let k = 0; k < 400 && inPlay < 3; k++) {
  st = await step(2);
  if (st.contact && st.phase !== 'live') console.log('swing', st.contact, st.phase);
  {
    const s2 = st;
    if (s2.phase === 'live' && s2.playT < 0.1) {
      inPlay++;
      console.log('contact', s2);
      await snap(`contact${inPlay}`);
      for (let j = 0; j < 4; j++) { const s3 = await step(45); console.log('  live', s3.phase, s3.playT.toFixed(1)); await snap(`flight${inPlay}-${j}`); if (s3.phase !== 'live') break; }
    }
  }
}
console.log('after batting', await step(1));
// Advance to the bottom half (we field).
for (let k = 0; k < 200; k++) { st = await step(60); if (st.half === 'bottom') break; }
console.log('bottom', st);
await snap('pitching-view');
console.log(errors.join('\n') || 'no page errors');
await browser.close();
