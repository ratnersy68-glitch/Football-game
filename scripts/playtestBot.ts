/** Headless playtest: a bot QB plays many snaps; prints outcome distribution for tuning. */
import { newPlayer } from '../src/career/player';
import { buildMatch } from '../src/play/engine/roster';
import { PlaySim } from '../src/play/engine/sim';
import { Drive } from '../src/play/engine/drive';
import { BUTTON_ORDER } from '../src/play/engine/playbook';
import { DEFAULT_SETTINGS, type UserInput } from '../src/play/engine/types';
import { Rng } from '../src/core/rng';

const N = Number(process.argv[2] ?? 300);
const diff = Number(process.argv[3] ?? 1);
const cp = newPlayer();
cp.firstName = 'Test'; cp.lastName = 'Bot';
const m = buildMatch(cp);
const settings = { ...DEFAULT_SETTINGS, difficulty: diff };
const sim = new PlaySim(m.specs, settings, 1);
const rng = new Rng(5);
const counts: Record<string, number> = {};
let missed = 0, yac = 0, sackT = 0, sep = 0, sepN = 0;
let comp = 0, att = 0, yds = 0, airSum = 0, dur = 0, stuck = 0, tds = 0, drives = 0;
const quality: Record<string, number> = {};
const sackBy: Record<string, number> = {};
const yacs: number[] = [];
let drive = new Drive(settings);
for (let n = 0; n < N; n++) {
  if (drive.over) { drive = new Drive(settings); drives++; }
  const play = drive.coachCall(rng);
  sim.setup({ los: drive.los, spotY: drive.spotY, play, defCall: drive.defenseCall(rng) });
  const throwAt = rng.float(1.6, 2.8);
  let thrown = false;
  let steps = 0;
  sim.step(1 / 60, { move: { x: 0, y: 0 }, sprint: false, snap: true });
  while (sim.phase === 'live' && steps < 60 * 25) {
    steps++;
    const me = sim.controlled;
    const input: UserInput = { move: { x: 0, y: 0 }, sprint: false };
    if (me.role === 'QB') {
      if (sim.t < 0.9 && !thrown) input.move = { x: -0.6, y: 0 };
      if (!thrown && sim.t > throwAt && sim.ball.state === 'held') {
        let best = BUTTON_ORDER[0], bestScore = -1;
        for (const s of BUTTON_ORDER) { const d = sim.separation(s); const r = sim.bySlot(s)!; const depth = r.x - sim.los; const score = d + depth * 0.05; if (score > bestScore && r.task.kind === 'route') { bestScore = score; best = s; } }
        input.throwTo = { slot: best, power: 0.7, lob: false };
        sep += sim.separation(best); sepN++;
        thrown = true;
      }
    } else {
      input.move = { x: 1, y: (26.6 - me.y) * 0.02 };
      input.sprint = true;
    }
    sim.step(1 / 60, input);
  }
  if (sim.phase !== 'dead') { stuck++; continue; }
  const evs = sim.drainEvents();
  missed += evs.filter((e) => e.type === 'missed_tackle').length;
  const catchEv = evs.find((e) => e.type === 'catch');
  if (catchEv && sim.outcome) { yac += sim.outcome.spotX - catchEv.x!; yacs.push(Math.round(sim.outcome.spotX - catchEv.x!)); }
  if (sim.outcome?.kind === 'sack') { sackT += sim.outcome.duration; const k = `${sim.defCall} ${evs.find((e) => e.type === 'sack')?.who}`; sackBy[k] = (sackBy[k] ?? 0) + 1; }
  const o = sim.outcome!;
  counts[o.kind] = (counts[o.kind] ?? 0) + 1;
  if (o.passer) { att++; if (o.completion) { comp++; yds += o.passYards; airSum += o.airYards; } }
  if (o.kind === 'touchdown') tds++;
  if (sim.ball.quality) quality[sim.ball.quality] = (quality[sim.ball.quality] ?? 0) + 1;
  dur += o.duration;
  drive.apply(o, m.userId);
}
console.log(`plays ${N} diff ${diff} stuck ${stuck} drives ${drives}`);
console.log('outcomes', counts);
console.log(`comp% ${(100 * comp / att).toFixed(1)}  ypa ${(yds / att).toFixed(2)}  y/comp ${(yds / Math.max(1, comp)).toFixed(1)} air/comp ${(airSum / Math.max(1, comp)).toFixed(1)}  avg play ${(dur / N).toFixed(2)}s  TD ${tds}`);
console.log('throw quality', quality);
console.log(`missed tackles/play ${(missed / N).toFixed(2)}  YAC/comp ${(yac / Math.max(1, comp)).toFixed(1)}  avg sack time ${(sackT / Math.max(1, counts.sack ?? 1)).toFixed(2)}s  avg sep at throw ${(sep / Math.max(1, sepN)).toFixed(2)}`);
if (process.env.SACKS) console.log(sackBy);
yacs.sort((a, b) => a - b); console.log('YAC p25/p50/p75/p90', [0.25, 0.5, 0.75, 0.9].map((q) => yacs[Math.floor(q * yacs.length)]).join('/'));
