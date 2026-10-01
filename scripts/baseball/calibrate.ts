import { battedBall, makeEnv, predictPath } from '../../src/baseball/engine/BallPhysics';
import { STADIUM_BY_ID } from '../../src/baseball/data/stadiums';
const st = { ...STADIUM_BY_ID.kauffman, dims: [600,600,600,600,600] as any, walls:[1,1,1,1,1] as any };
const env = makeEnv(st, { time: 'Day', weather: 'Clear', temperature: 72, windMph: 0, windDir: 0 });
for (const [ev, la] of [[105,28],[110,28],[100,30],[95,25],[90,35],[102,12],[71,-5],[95,-8],[85,45],[112,31]]) {
  const spin = la > 0 ? Math.min(3000, 1200 + la * 45) : -800;
  const b = battedBall({ x: 0, y: 3, z: 1.3 }, ev, la, 0, spin, 0);
  const path = predictPath(b, env, 12);
  const land = path.find((s, i) => i > 0 && s.event === 'bounce');
  const last = path[path.length - 1];
  console.log(`EV ${ev} LA ${la}: carry ${land ? land.z.toFixed(0) : '-'} ft at t=${land?.t.toFixed(2)}  final ${last.z.toFixed(0)} hang`);
}
