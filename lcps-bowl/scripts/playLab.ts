/** Play lab: run many isolated plays and report average outcomes. Usage: tsx scripts/playLab.ts [playId|kickoff|punt] [N] [coverage] */
import { PlaySim } from '../src/game/PlaySim';
import { buildDepthChart } from '../src/game/Lineup';
import { generateRoster } from '../src/game/players';
import { RNG } from '../src/game/rng';
import { playById, type Coverage } from '../src/game/Plays';

const id = process.argv[2] ?? 'inside_zone';
const N = Number(process.argv[3] ?? 200);
const cov = (process.argv[4] ?? 'Cover 3') as Coverage;
const verbose = process.argv.includes('-v');
const rng = new RNG(7);
const off = buildDepthChart(generateRoster(65, 65, 65, rng));
const def = buildDepthChart(generateRoster(65, 65, 65, rng));
const res: Record<string, number> = {};
let gain = 0, n = 0, time = 0;
const gains: number[] = [];
for (let i = 0; i < N; i++) {
  const kind = id === 'kickoff' ? 'kickoff' : id === 'punt' ? 'punt' : 'scrimmage';
  const sim = new PlaySim({
    kind, los: kind === 'kickoff' ? 40 : 30, ballY: 26.67, offPlay: kind === 'scrimmage' ? playById(id) : playById('punt'),
    defCall: { formation: '4-3', coverage: cov }, offDepth: off, defDepth: def, userTeam: null,
    skill: { O: 0.55, D: 0.55 }, weather: 'clear', seed: i + 1, firstDownX: 40, down: 1, toGo: 10,
  });
  sim.snap();
  let steps = 0;
  while (!sim.done && steps < 3000) { sim.step(1 / 60); steps++; }
  const o = sim.outcome!;
  res[o.type] = (res[o.type] ?? 0) + 1;
  const g = kind === 'scrimmage' ? (o.team === 'O' ? (o.type === 'td' ? 100 - 30 : o.gain) : -99) : o.returnYds;
  if (g > -99) { gain += g; n++; gains.push(g); }
  time += sim.t;
  if (verbose && i < 25) console.log(o.type, o.desc, 'gain', g.toFixed(1), 't', sim.t.toFixed(1));
}
gains.sort((a, b) => a - b);
console.log(id, cov, 'N', N, res);
console.log('avg', (gain / n).toFixed(2), 'median', gains[gains.length >> 1]?.toFixed(1), 'p90', gains[Math.floor(gains.length * 0.9)]?.toFixed(1), 'avg time', (time / N).toFixed(2));
