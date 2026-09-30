/* Style report: shows that fighter attributes/tendencies produce different fights.
   npx vite-node scripts/styleReport.ts [n] */
import { FIGHTER_BY_ID } from '../src/data';
import { simulateFight } from '../src/modes/SimFight';

const n = Number(process.argv[2] ?? 30);
const matchups: Array<[string, string]> = [
  ['jon_jones', 'alex_pereira'],
  ['max_holloway', 'justin_gaethje'],
  ['islam_makhachev', 'charles_oliveira'],
  ['khamzat_chimaev', 'israel_adesanya'],
  ['merab_dvalishvili', 'sean_o_malley'],
];
for (const [aId, bId] of matchups) {
  const A = FIGHTER_BY_ID[aId];
  const B = FIGHTER_BY_ID[bId];
  const agg = [0, 1].map(() => ({ sig: 0, head: 0, body: 0, leg: 0, tda: 0, td: 0, sub: 0, ctrl: 0, kd: 0, clinchKnees: 0 }));
  const res: Record<string, number> = {};
  let rounds = 0;
  for (let i = 0; i < n; i++) {
    const { result, engine } = simulateFight(A, B, { seed: 9000 + i, rounds: 5 });
    rounds += engine.stats.rounds.length;
    const key = result.winner === null ? 'Draw' : `${engine.f[result.winner].last} ${result.method}`;
    res[key] = (res[key] ?? 0) + 1;
    for (const s of [0, 1] as const) {
      const t = engine.stats.totals(s);
      const g = agg[s];
      g.sig += t.sigLanded; g.head += t.headLanded; g.body += t.bodyLanded; g.leg += t.legLanded;
      g.tda += t.tdAttempted; g.td += t.tdLanded; g.sub += t.subAttempts; g.ctrl += t.controlTime; g.kd += t.knockdowns;
    }
  }
  console.log(`\n=== ${A.name} vs ${B.name} (${n} x 5 rounds, avg ${(rounds / n).toFixed(1)} rounds)`);
  console.log('Results:', Object.entries(res).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
  [A, B].forEach((f, s) => {
    const g = agg[s];
    const pr = (x: number) => (x / rounds).toFixed(1);
    console.log(`  ${f.name.padEnd(20)} sig/rd ${pr(g.sig)}  head ${pr(g.head)} body ${pr(g.body)} leg ${pr(g.leg)} | TD ${pr(g.td)}/${pr(g.tda)} per rd | subs ${pr(g.sub)} | ctrl ${pr(g.ctrl)}s/rd | KD ${(g.kd / n).toFixed(2)}/fight`);
  });
}
