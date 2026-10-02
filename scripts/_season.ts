import { newPlayer, playerOverall } from '../src/career/player';
import * as S from '../src/career/season';
const strat = process.argv[2] ?? 'balanced';
const p = { ...newPlayer('WR', 'alabama'), firstName: 'T', lastName: 'B' };
const c = S.newCareer(p, 11);
const ovr0 = playerOverall(c.player);
let steps = 0;
while (!c.over && steps++ < 2000) {
  if (S.pendingGame(c)) { S.simCurrentGame(c); continue; }
  const sch = S.scheduledAt(c, c.day, c.slot);
  if (sch.fixed) { S.doSlot(c, strat === 'slacker' && sch.activity === 'class' ? 'skip' : 'attend'); continue; }
  if (sch.activity) { S.doSlot(c); continue; }
  const m = c.meters;
  let a = 'rest';
  if (strat === 'party') a = c.slot === 2 ? 'party' : 'gaming';
  else if (strat === 'grind') a = m.energy < 35 ? 'rest' : c.slot === 2 ? 'weights' : 'drills';
  else a = m.energy < 40 ? 'rest' : m.grades < 60 ? 'study' : m.morale < 50 ? 'hangout' : c.slot === 2 ? 'weights' : 'film';
  S.doSlot(c, a);
}
const r = S.record(c);
console.log(strat, 'steps', steps, 'record', r, 'meters', Object.fromEntries(Object.entries(c.meters).map(([k, v]) => [k, Math.round(v)])), 'ovr', ovr0, '->', playerOverall(c.player), 'msgs', c.messages.length);
console.log('games played', c.schedule.filter(g => g.result?.played).length, 'stats', JSON.stringify(c.seasonStats));
console.log('top gains', Object.entries(c.gains).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}+${v.toFixed(1)}`).join(' '));
