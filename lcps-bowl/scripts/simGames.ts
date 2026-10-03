/** Headless audit: simulate N full games CPU vs CPU and print averages. Usage: npm run sim -- 20 */
import { GameSession } from '../src/game/GameSession';
import { LCPS_TEAMS } from '../src/data/teams';
import { generateRoster } from '../src/game/players';
import { RNG } from '../src/game/rng';
import { addStats, emptyStats } from '../src/game/types';

const N = Number(process.argv[2] ?? 10);
const qlen = Number(process.argv[3] ?? 300);
const rng = new RNG(42);
const agg = { pts: 0, plays: 0, rushYds: 0, passYds: 0, to: 0, firstDowns: 0, ot: 0, sacks: 0 };
const st = emptyStats();
let t0 = Date.now();
const scores: string[] = [];
for (let i = 0; i < N; i++) {
  const [a, b] = rng.shuffle([...LCPS_TEAMS]).slice(0, 2);
  const s = new GameSession({
    home: { info: a, roster: generateRoster(a.offenseRating, a.defenseRating, a.specialTeamsRating, rng) },
    away: { info: b, roster: generateRoster(b.offenseRating, b.defenseRating, b.specialTeamsRating, rng) },
    userSide: null, difficulty: 'VARSITY', quarterLen: qlen, weather: 'clear', timeOfDay: 'night', seed: i * 7 + 1,
  });
  const r = s.simulateToEnd();
  scores.push(`${b.abbreviation} ${r.awayScore} @ ${a.abbreviation} ${r.homeScore}${r.ot ? ' (OT' + r.ot + ')' : ''} plays=${s.playCount}`);
  agg.pts += r.homeScore + r.awayScore;
  for (const t of [r.totals.home, r.totals.away]) {
    agg.plays += t.plays; agg.rushYds += t.rushYds; agg.passYds += t.passYds; agg.to += t.turnovers; agg.firstDowns += t.firstDowns; agg.sacks += t.sacks;
  }
  if (r.ot) agg.ot++;
  for (const line of Object.values(r.stats)) addStats(st, line);
}
const per = (x: number) => (x / (N * 2)).toFixed(1);
console.log(scores.join('\n'));
console.log(`\n${N} games, ${(Date.now() - t0) / N | 0} ms/game, quarter=${qlen}s`);
console.log(`per team: pts ${per(agg.pts)} plays ${per(agg.plays)} rush ${per(agg.rushYds)} pass ${per(agg.passYds)} TO ${per(agg.to)} 1D ${per(agg.firstDowns)} sacks ${per(agg.sacks)} OT games ${agg.ot}`);
console.log(`cmp% ${(st.passCmp / Math.max(1, st.passAtt) * 100).toFixed(1)}  att/team ${per(st.passAtt)}  ypa ${(st.passYds / Math.max(1, st.passAtt)).toFixed(1)}  int/team ${per(st.passInt)}`);
console.log(`rush att/team ${per(st.rushAtt)} ypc ${(st.rushYds / Math.max(1, st.rushAtt)).toFixed(1)}  fum lost ${per(st.fumLost)}  FG ${st.fgm}/${st.fga}  XP ${st.xpm}/${st.xpa}  punts/team ${per(st.punts)} avg ${(st.puntYds / Math.max(1, st.punts)).toFixed(1)}  ret yds/team ${per(st.retYds)} retTD ${st.retTD}`);
t0 = 0;
