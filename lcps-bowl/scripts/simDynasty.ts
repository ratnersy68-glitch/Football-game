/** Headless dynasty audit: simulate N full seasons (including the user's games) and print results. */
import { createDynasty, currentGames, simulateGame, applyResult, finishWeek, runOffseason } from '../src/dynasty/Season';
import { getTeam } from '../src/data/teams';
import { computeStandings } from '../src/dynasty/Standings';
import { teamRatings } from '../src/dynasty/Development';

const seasons = Number(process.argv[2] ?? 2);
const qlen = Number(process.argv[3] ?? 180);
const d = createDynasty('riverside', 'Tester', 1, 12345, process.argv[4] === 'expanded' ? 'expanded' : 'standard');
const t0 = Date.now();
for (let s = 0; s < seasons; s++) {
  let guard = 0;
  while (d.phase !== 'season_end' && guard++ < 40) {
    for (const g of currentGames(d).filter((x) => !x.played)) {
      const { result, session } = simulateGame(d, g, qlen);
      applyResult(d, g, result, session);
    }
    finishWeek(d);
  }
  const st = computeStandings(d, true).sort((a, b) => b.w - a.w);
  const champ = d.champions[d.champions.length - 1];
  console.log(`${d.year}: champion ${getTeam(champ.team).shortName} over ${getTeam(champ.runnerUp).shortName} ${champ.score}`);
  console.log('  top:', st.slice(0, 5).map((r) => `${getTeam(r.team).abbreviation} ${r.w}-${r.l}`).join(', '), ' | RIV', st.find((r) => r.team === 'riverside')!.w);
  const aw = d.awards[d.awards.length - 1];
  console.log('  POY:', aw.winners[0].name, getTeam(aw.winners[0].team).abbreviation, aw.winners[0].line);
  const json = JSON.stringify(d);
  console.log(`  save size ${(json.length / 1024).toFixed(0)} KB, elapsed ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  const rep = runOffseason(d);
  console.log(`  offseason: ${rep.graduated.length} grads, ${rep.freshmen.length} freshmen, RIV ovr now ${teamRatings(d.programs.riverside.roster).ovr}`);
}
console.log('records sample:', JSON.stringify(d.records.season.passYds?.[0]), JSON.stringify(d.records.team.points?.[0]));
