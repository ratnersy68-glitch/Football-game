import { PlaySim, NO_INPUT } from '../src/game/PlaySim';
import { buildDepthChart } from '../src/game/Lineup';
import { generateRoster } from '../src/game/players';
import { RNG } from '../src/game/rng';
import { playById } from '../src/game/Plays';
const rng = new RNG(7);
const off = buildDepthChart(generateRoster(60, 60, 60, rng));
const def = buildDepthChart(generateRoster(Number(process.env.DEF ?? 70), Number(process.env.DEF ?? 70), 70, rng));
const times: number[] = [];
let n = 0, sacks = 0;
for (let seed = 1; seed <= 300; seed++) {
  const sim = new PlaySim({ kind: 'scrimmage', los: 30, ballY: 26.67, offPlay: playById(process.argv[2] ?? 'four_verts'), defCall: { formation: '4-3', coverage: (process.argv[3] ?? 'Cover 3') as any }, offDepth: off, defDepth: def, userTeam: 'O', skill: { O: 0.6, D: 0.55 }, weather: 'clear', seed });
  sim.snap();
  let k = 0;
  while (!sim.done && k++ < 4000) sim.step(1 / 60, NO_INPUT);
  n++;
  if (sim.outcome!.sack || sim.outcome!.type === 'safety' || sim.events.some(e => e.t === 'sack')) { sacks++; times.push(sim.t); }
}
times.sort((a, b) => a - b);
console.log('sacks', sacks, '/', n, 'p10', times[Math.floor(times.length * 0.1)]?.toFixed(2), 'median', times[times.length >> 1]?.toFixed(2), 'p90', times[Math.floor(times.length * 0.9)]?.toFixed(2));
