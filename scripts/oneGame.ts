import { buildExhibition, gameSetupFor } from '../src/simulation/world';
import { GameSimulation } from '../src/simulation/game/gameEngine';
const [home = 'ohio_state', away = 'michigan', seedArg = '48291'] = process.argv.slice(2);
const w = buildExhibition(home, away, 1);
const eng = new GameSimulation(gameSetupFor(w, home, away, { seed: Number(seedArg) }));
while (!eng.isFinal) {
  const e = eng.step()!;
  const q = e.quarter; const c = `${Math.floor(e.clockBefore/60)}:${String(Math.floor(e.clockBefore%60)).padStart(2,'0')}`;
  console.log(`Q${q} ${c} ${e.offense} ${e.down}&${e.distance} @${e.ballOn} | ${e.text} [${e.scoreAfter.home}-${e.scoreAfter.away}]`);
}
const r = eng.result();
console.log(JSON.stringify({ h: r.home, a: r.away }, null, 0));
