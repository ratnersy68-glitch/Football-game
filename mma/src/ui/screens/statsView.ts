import type { FightEngine } from '../../engine/FightEngine';
import { sumStats, type RoundStats } from '../../engine/FightStatistics';
import { fmtClock } from '../../core/math';
import { h } from '../dom';

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) + '%' : '—');

/** UFC-style stats table for one round (index) or the whole fight (index = -1). */
export function roundStatsTable(e: FightEngine, index: number) {
  const rs: [RoundStats, RoundStats] = index < 0
    ? [sumStats(e.stats.rounds.map((r) => r[0])), sumStats(e.stats.rounds.map((r) => r[1]))]
    : e.stats.rounds[index];
  const [a, b] = rs;
  const row = (label: string, x: string | number, y: string | number) => h('tr', null, h('td', { class: 'l' }, String(x)), h('td', { class: 'm' }, label), h('td', { class: 'r' }, String(y)));
  return h('table', { class: 'stats' },
    h('tr', null, h('th', { style: 'text-align:right;color:#ff5a5f' }, e.f[0].last), h('th', null, index < 0 ? 'Totals' : `Round ${index + 1}`), h('th', { style: 'text-align:left;color:#7ea2ff' }, e.f[1].last)),
    row('Knockdowns', a.knockdowns, b.knockdowns),
    row('Sig. Strikes', `${a.sigLanded} of ${a.sigAttempted}`, `${b.sigLanded} of ${b.sigAttempted}`),
    row('Sig. Str. %', pct(a.sigLanded, a.sigAttempted), pct(b.sigLanded, b.sigAttempted)),
    row('Total Strikes', `${a.totalLanded} of ${a.totalAttempted}`, `${b.totalLanded} of ${b.totalAttempted}`),
    row('Head', `${a.headLanded} of ${a.headAttempted}`, `${b.headLanded} of ${b.headAttempted}`),
    row('Body', `${a.bodyLanded} of ${a.bodyAttempted}`, `${b.bodyLanded} of ${b.bodyAttempted}`),
    row('Leg', `${a.legLanded} of ${a.legAttempted}`, `${b.legLanded} of ${b.legAttempted}`),
    row('Takedowns', `${a.tdLanded} of ${a.tdAttempted}`, `${b.tdLanded} of ${b.tdAttempted}`),
    row('Takedown %', pct(a.tdLanded, a.tdAttempted), pct(b.tdLanded, b.tdAttempted)),
    row('Sub. Attempts', a.subAttempts, b.subAttempts),
    row('Reversals', a.reversals, b.reversals),
    row('Control Time', fmtClock(a.controlTime), fmtClock(b.controlTime)),
  );
}
