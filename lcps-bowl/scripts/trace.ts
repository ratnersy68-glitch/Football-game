import { PlaySim } from '../src/game/PlaySim';
import { buildDepthChart } from '../src/game/Lineup';
import { generateRoster } from '../src/game/players';
import { RNG } from '../src/game/rng';
import { playById } from '../src/game/Plays';
const rng = new RNG(7);
const off = buildDepthChart(generateRoster(65, 65, 65, rng));
const def = buildDepthChart(generateRoster(65, 65, 65, rng));
const sim = new PlaySim({ kind: 'scrimmage', los: 30, ballY: 26.67, offPlay: playById(process.argv[2] ?? 'inside_zone'),
  defCall: { formation: '4-3', coverage: 'Cover 3' }, offDepth: off, defDepth: def, userTeam: null,
  skill: { O: 0.55, D: 0.55 }, weather: 'clear', seed: Number(process.argv[3] ?? 1), firstDownX: 40 });
sim.snap();
let k = 0;
while (!sim.done && k < 2000) {
  sim.step(1 / 60);
  if (k % 12 === 0) {
    const c = sim.carrier;
    const line = sim.actors.filter(a => a.team === 'D').map(a => `${a.slot}:${a.role[0]}${a.engaged >= 0 ? '*' : ''}(${a.x.toFixed(0)},${a.y.toFixed(0)})${a.stunT>0?'s':''}`).join(' ');
    console.log(`t=${sim.t.toFixed(2)} ball=${sim.ball.state} car=${c ? c.slot + '(' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ') v' + Math.hypot(c.vx, c.vy).toFixed(1) : '-'} | ${line}`);
  }
  k++;
}
console.log(sim.outcome?.type, sim.outcome?.desc, sim.events.filter(e=>e.t==='missed'||e.t==='shed').length);
