/**
 * Large-scale simulation audit: simulate N games between random universe teams and report
 * league-wide averages plus sanity violations. Usage: npm run simtest -- [games=2000]
 */
import { UNIVERSE_TEAMS } from '../src/data';
import { Rng } from '../src/core/rng';
import { buildWorld, counterIdGen, gameSetupFor } from '../src/simulation/world';
import { GameSimulation } from '../src/simulation/game/gameEngine';
import { teamRatings } from '../src/simulation/teamRatings';

const N = Number(process.argv[2] ?? 2000);
const ids = counterIdGen();
const world = buildWorld(7, ids.next);
const rng = new Rng(99);
const agg: Record<string, number> = {};
const add = (k: string, v: number) => (agg[k] = (agg[k] ?? 0) + v);
let violations = 0;
let favWins = 0, favGames = 0, ties = 0, ots = 0;
const buckets: Record<string, [number, number]> = { '0-2': [0, 0], '3-5': [0, 0], '6-9': [0, 0], '10-14': [0, 0], '15+': [0, 0] };
let marginSlope = 0, slopeN = 0;
const scores: number[] = [];
const t0 = Date.now();
for (let g = 0; g < N; g++) {
  const h = rng.pick(UNIVERSE_TEAMS).id;
  let a = rng.pick(UNIVERSE_TEAMS).id;
  while (a === h) a = rng.pick(UNIVERSE_TEAMS).id;
  const eng = new GameSimulation(gameSetupFor(world, h, a, { seed: rng.int(1, 1e9) }));
  eng.simulateToEnd();
  for (const e of eng.events) {
    if (e.clockAfter < 0 || e.clockBefore < 0) violations++;
    if (e.kind !== 'period_end' && e.quarterAfter <= 4 && (e.downAfter < 1 || e.downAfter > 4)) { violations++; console.log('bad down', e); }
    if (e.distanceAfter < 1 && e.kind !== 'period_end') { violations++; console.log('bad dist', e.text, e.distanceAfter); }
    if (e.ballOnAfter < 0 || e.ballOnAfter > 100) { violations++; console.log('bad ballOn', e.text); }
  }
  const r = eng.result();
  if (r.homeScore === r.awayScore) ties++;
  if (r.overtimePeriods) ots++;
  if (r.homeScore === 1 || r.awayScore === 1) violations++;
  scores.push(r.homeScore, r.awayScore);
  for (const t of [r.home, r.away]) {
    add('pts', t.score); add('yds', t.totalYards); add('passYds', t.passYards); add('rushYds', t.rushYards);
    add('att', t.passAtt); add('comp', t.passComp); add('rushAtt', t.rushAtt); add('to', t.turnovers); add('sacks', t.sacks);
    add('pen', t.penalties); add('penYds', t.penaltyYards); add('3a', t.thirdDownAtt); add('3c', t.thirdDownConv); add('4a', t.fourthDownAtt); add('4c', t.fourthDownConv);
    add('rza', t.redZoneAtt); add('rztd', t.redZoneTD); add('fd', t.firstDowns); add('sackYds', t.sackYards);
  }
  for (const l of r.playerLines) { add('int', l.passInt ?? 0); add('punts', l.punts ?? 0); add('fga', l.fga ?? 0); add('fgm', l.fgm ?? 0); add('fumLost', l.fumblesLost ?? 0); add('passTD', l.passTD ?? 0); add('rushTD', l.rushTD ?? 0); }
  add('plays', eng.events.filter((e) => ['run', 'pass', 'sack', 'scramble'].includes(e.kind)).length);
  add('injuries', r.injuries.length);
  const hr = teamRatings(world.teams[h], world.players).overall + 2;
  const ar = teamRatings(world.teams[a], world.players).overall;
  if (Math.abs(hr - ar) >= 5) { favGames++; if ((hr > ar) === (r.homeScore > r.awayScore)) favWins++; }
  const gap = Math.abs(hr - ar);
  const b = gap <= 2 ? '0-2' : gap <= 5 ? '3-5' : gap <= 9 ? '6-9' : gap <= 14 ? '10-14' : '15+';
  buckets[b][1]++;
  if ((hr >= ar) === (r.homeScore > r.awayScore)) buckets[b][0]++;
  if (gap >= 3) { marginSlope += ((r.homeScore - r.awayScore) * Math.sign(hr - ar)) / gap; slopeN++; }
}
const T = N * 2;
const f = (k: string, d = T) => (agg[k] / d).toFixed(2);
console.log(`${N} games in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(`PPG ${f('pts')}  YPG ${f('yds')}  pass ${f('passYds')}  rush ${f('rushYds')}  plays/tm ${f('plays')}`);
console.log(`Comp% ${(100 * agg.comp / agg.att).toFixed(1)}  att ${f('att')}  YPA ${(agg.passYds / agg.att).toFixed(2)}  YPC ${(agg.rushYds / agg.rushAtt).toFixed(2)}  rushAtt ${f('rushAtt')}`);
console.log(`TO ${f('to')}  INT ${f('int')}  FumLost ${f('fumLost')}  sacks ${f('sacks')}  pen ${f('pen')}/${f('penYds')}  FD ${f('fd')}`);
console.log(`3rd ${(100 * agg['3c'] / agg['3a']).toFixed(1)}%  4th ${(100 * agg['4c'] / agg['4a']).toFixed(1)}% (${f('4a')}/tm)  RZ TD ${(100 * agg.rztd / agg.rza).toFixed(1)}%  punts ${f('punts')}  FGA ${f('fga')} FG% ${(100 * agg.fgm / agg.fga).toFixed(1)}`);
console.log(`passTD ${f('passTD')} rushTD ${f('rushTD')}  injuries/game ${f('injuries', N)}  OT% ${(100 * ots / N).toFixed(1)}  ties ${ties}`);
console.log(`Favorite (>=5 ovr) win% ${(100 * favWins / favGames).toFixed(1)} over ${favGames} games`);
console.log('Better-rated (+2 home) win% by gap:', Object.entries(buckets).map(([k, [w, n]]) => `${k}: ${(100 * w / Math.max(1, n)).toFixed(0)}% (${n})`).join('  '));
console.log(`Avg margin per rating point: ${(marginSlope / slopeN).toFixed(2)}`);
scores.sort((a, b) => a - b);
console.log(`score p10 ${scores[Math.floor(T * 0.1)]} p50 ${scores[Math.floor(T * 0.5)]} p90 ${scores[Math.floor(T * 0.9)]} max ${scores[T - 1]}`);
console.log(`violations: ${violations}`);
if (violations > 0 || ties > 0) process.exit(1);
