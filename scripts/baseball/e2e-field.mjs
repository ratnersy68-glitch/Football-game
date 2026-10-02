// User pitches + fields: drives the pitch meter, then lets fielding assist route and throws with the meter.
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
await page.click('.team-card[data-id=SEA]');
await page.click('[data-a=next]');
await page.click('.team-card[data-id=HOU]');
await page.click('[data-a=next]');
await page.click('[data-a=next]');
await page.click('[data-a=next]');
await page.click('[data-a=go]');
await page.waitForTimeout(800);
await page.evaluate(() => {
  const H = window.__bb;
  const a = H.app;
  a.paused = true;
  window.__log = [];
  window.__step = (frames) => {
    const e = a.engine;
    for (let i = 0; i < frames; i++) {
      const inp = H.emptyInput();
      if (e.phase === 'prepitch' && e.userSidePitching()) {
        const up = e.userPitch;
        if (up.stage === 'select') { inp.pitchSelect = currentPitch(e); inp.aim = { x: (Math.random() - 0.5) * 1.2, y: 1.9 + Math.random() * 1.2 }; }
        else if (up.stage === 'aim') { inp.aim = up.target; inp.meterPress = true; }
        else if (up.stage === 'meter' && up.meter >= up.zoneCenter - 0.01) inp.meterPress = true;
      } else if (e.phase === 'live' && e.play) {
        const f = e.play.controlled;
        if (f && f.hasBall && f.holdTime > 0.35) {
          // throw to first with a perfect meter (or to the force base if there is one)
          let base = 1;
          for (const r of e.play.activeRunners()) if (e.play.isForced(r) && r.lastTouched < r.startBase + 1 && r.startBase + 1 > base && Math.abs(r.p - (r.startBase + 1) * 90) > 30) base = r.startBase + 1;
          if (!e.play.activeRunners().some((r) => r.goal > r.p + 0.1)) base = 0;
          if (base) { inp.defense.throwTo = base; inp.defense.throwMeter = 0.8; window.__log.push(`throw to ${base} by ${f.pos}`); }
        }
      } else inp.skip = i % 20 === 0;
      e.update(1 / 60, inp);
      for (const ev of e.drainEvents()) { if (['banner', 'strikeout', 'play:out', 'play:catch', 'homerun', 'walk'].includes(ev.type)) window.__log.push(`${ev.type} ${ev.text ?? ''} ${ev.sub ?? ''} ${JSON.stringify(ev.data ?? {})}`); a.handleEvents([ev]); }
      a.hud.update(e, { throwHold: null, throwFill: 1, swingPreview: 'normal', runnerSel: null, replayAvailable: false });
      a.hud.tick(1 / 60);
    }
    function currentPitch(e) { const p = e.state.half === 'top' ? e.state.home.pitcher : e.state.away.pitcher; return p.pitcher.pitches[Math.floor(Math.random() * p.pitcher.pitches.length)]; }
    const s = e.state;
    return { phase: e.phase, inning: s.inning, half: s.half, outs: s.outs, score: `${s.away.runs}-${s.home.runs}`, count: `${s.balls}-${s.strikes}`, stage: e.userPitch.stage, playT: e.play?.t ?? 0 };
  };
});
const step = (n) => page.evaluate((n) => window.__step(n), n);
let shot = 0;
const snap = async (name) => { await page.waitForTimeout(250); await page.screenshot({ path: `${out}/f${String(++shot).padStart(2, '0')}-${name}.png` }); };
let st = await step(90);
console.log(st);
// get to the meter
for (let k = 0; k < 50 && st.stage !== 'meter'; k++) st = await step(1);
await step(30);
await snap('pitch-meter');
let lives = 0;
for (let k = 0; k < 900 && st.half === 'top'; k++) {
  st = await step(3);
  if (st.phase === 'live' && st.playT < 0.06) {
    lives++;
    if (lives <= 2) { await step(20); await snap(`field-${lives}a`); await step(50); await snap(`field-${lives}b`); }
  }
}
console.log(st);
console.log((await page.evaluate(() => window.__log)).join('\n'));
console.log(errors.join('\n') || 'no page errors');
await browser.close();
