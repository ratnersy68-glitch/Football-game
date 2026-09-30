/* Balance report: npm run sim -- [n] [fighterA] [fighterB] [difficulty] */
import { FIGHTERS, FIGHTER_BY_ID } from '../src/data';
import { simulateFight } from '../src/modes/SimFight';
import type { DifficultyId } from '../src/ai/Difficulty';

const n = Number(process.argv[2] ?? 60);
const aId = process.argv[3];
const bId = process.argv[4];
const diff = (process.argv[5] ?? 'pro') as DifficultyId;
const men = FIGHTERS.filter((f) => f.gender === 'M');
const methods: Record<string, number> = {};
const details: Record<string, number> = {};
let wins = [0, 0];
const finishRounds: number[] = [];
const tot = { sig: 0, td: 0, tda: 0, kd: 0, sub: 0, ctrl: 0, rounds: 0 };
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  let a = aId ? FIGHTER_BY_ID[aId] : men[Math.floor(Math.random() * men.length)];
  let b = bId ? FIGHTER_BY_ID[bId] : men[Math.floor(Math.random() * men.length)];
  if (!aId && !bId) {
    const pool = men.filter((f) => f.weightClass === a.weightClass && f.id !== a.id);
    b = pool[Math.floor(Math.random() * pool.length)];
  }
  const { result, engine } = simulateFight(a, b, { seed: 1000 + i, difficulty: [diff, diff] });
  methods[result.method] = (methods[result.method] ?? 0) + 1;
  const k = result.method + ' ' + result.detail.replace(/ \(Technical\)/, '');
  details[k] = (details[k] ?? 0) + 1;
  if (result.winner !== null) wins[result.winner]++;
  for (const s of [0, 1] as const) {
    const t = engine.stats.totals(s);
    tot.sig += t.sigLanded;
    tot.td += t.tdLanded;
    tot.tda += t.tdAttempted;
    tot.kd += t.knockdowns;
    tot.sub += t.subAttempts;
    tot.ctrl += t.controlTime;
  }
  tot.rounds += engine.stats.rounds.length;
  if (result.method !== 'DEC' && result.method !== 'DRAW') finishRounds.push(result.round - 1 + result.time / 300);
  if (aId && n <= 20) console.log(`${a.name} vs ${b.name}: ${result.winner === null ? 'DRAW' : engine.f[result.winner].name} ${result.method} (${result.detail}) R${result.round} ${Math.floor(result.time / 60)}:${String(Math.floor(result.time % 60)).padStart(2, '0')}`);
}
console.log(`\n${n} fights in ${((Date.now() - t0) / 1000).toFixed(1)}s   wins A/B: ${wins.join('/')}`);
console.log('Methods:', Object.entries(methods).map(([k, v]) => `${k} ${((v / n) * 100).toFixed(0)}%`).join('  '));
console.log('Details:', Object.entries(details).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${k}:${v}`).join(', '));
console.log('Avg finish (rounds):', (finishRounds.reduce((a, b) => a + b, 0) / Math.max(1, finishRounds.length)).toFixed(2));
const per = (x: number) => (x / tot.rounds / 2).toFixed(2);
console.log(`Per fighter per round: sig ${per(tot.sig)}  TD ${per(tot.td)}/${per(tot.tda)}  KD ${per(tot.kd)}  subAtt ${per(tot.sub)}  ctrl ${per(tot.ctrl)}s`);
