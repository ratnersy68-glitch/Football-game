import { createDynasty, completeWeek } from '../src/simulation/seasonEngine';
import { TEAM_BY_ID } from '../src/data';
const t0 = Date.now();
const d = createDynasty({ teamId: 'ohio_state', coachFirstName: 'Test', coachLastName: 'Coach', seed: 42 });
console.log('create ms', Date.now() - t0, 'players', Object.keys(d.players).length, 'json MB', (JSON.stringify(d).length / 1e6).toFixed(2));
while (d.phase === 'regular') completeWeek(d);
console.log('season ms', Date.now() - t0, 'json MB', (JSON.stringify(d).length / 1e6).toFixed(2));
for (const e of d.rankings.at(-1)!.poll.slice(0, 12)) console.log(e.rank, TEAM_BY_ID[e.teamId].school, `${e.w}-${e.l}`, e.previousRank);
console.log(d.news.filter(n=>n.week>=12).sort((a,b)=>b.importance-a.importance).slice(0,10).map(n=>n.headline).join('\n'));
