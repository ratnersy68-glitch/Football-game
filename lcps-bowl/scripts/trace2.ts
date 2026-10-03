import { PlaySim } from '../src/game/PlaySim';
import { buildDepthChart } from '../src/game/Lineup';
import { generateRoster } from '../src/game/players';
import { RNG } from '../src/game/rng';
import { playById, type Coverage } from '../src/game/Plays';
const rng = new RNG(7);
const off = buildDepthChart(generateRoster(65, 65, 65, rng));
const def = buildDepthChart(generateRoster(65, 65, 65, rng));
const sim = new PlaySim({ kind: 'scrimmage', los: 30, ballY: 26.67, offPlay: playById(process.argv[2]),
  defCall: { formation: '4-3', coverage: (process.argv[4] ?? 'Man') as Coverage }, offDepth: off, defDepth: def, userTeam: null,
  skill: { O: 0.55, D: 0.55 }, weather: 'clear', seed: Number(process.argv[3] ?? 1), firstDownX: 40 });
sim.snap();
let k = 0;
while (!sim.done && k < 2000) {
  sim.step(1 / 60);
  if (k % 12 === 0 || sim.done) {
    const O = sim.actors.filter(a => a.team === 'O' && (a.role === 'route' || a.role==='carrier'|| a.slot==='QB')).map(a => `${a.slot}${a.number ?? ''}:${a.role.slice(0,2)}(${a.x.toFixed(1)},${a.y.toFixed(1)})`).join(' ');
    const D = sim.actors.filter(a => a.team === 'D' && a.pos !== 'DL').map(a => `${a.slot}:${a.role.slice(0,2)}${a.manTarget!=null?'>'+sim.actors[a.manTarget].slot:''}(${a.x.toFixed(1)},${a.y.toFixed(1)})${a.reactT>0?'r':''}`).join(' ');
    console.log(`t=${sim.t.toFixed(2)} b=${sim.ball.state}${sim.ball.state==='air'?`->(${sim.ball.tx.toFixed(1)},${sim.ball.ty.toFixed(1)})`:''} | ${O} || ${D}`);
  }
  k++;
}
console.log(sim.outcome?.type, sim.outcome?.desc);
