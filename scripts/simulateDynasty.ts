/**
 * Multi-season audit: runs N full seasons (regular season, postseason, offseason) and prints
 * rating/roster/prestige trends to catch inflation. Usage: npm run sim:dynasty -- [seasons=10]
 */
import { TEAM_BY_ID, UNIVERSE_TEAMS } from '../src/data';
import { completeWeek, createDynasty } from '../src/simulation/seasonEngine';
import { startNextSeason, startOffseason } from '../src/simulation/offseasonEngine';
import { teamRatings } from '../src/simulation/teamRatings';

const N = Number(process.argv[2] ?? 10);
const d = createDynasty({ teamId: 'kansas_state', coachFirstName: 'Audit', coachLastName: 'Coach', seed: 2026 });
const t0 = Date.now();
const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
for (let s = 0; s < N; s++) {
  while (d.phase !== 'seasonComplete') completeWeek(d);
  const ps = d.postseason!;
  const uni = UNIVERSE_TEAMS.map((t) => d.teams[t.id]);
  const allOvr = avg(uni.flatMap((t) => t.rosterIds.map((id) => d.players[id].overall)));
  const teamOvr = uni.map((t) => teamRatings(t, d.players).overall);
  const rosterSizes = uni.map((t) => t.rosterIds.length);
  const heis = ps.awards.find((a) => a.id === 'heisman');
  console.log(
    `${d.season} champ ${TEAM_BY_ID[ps.champion!].school.padEnd(14)} ${ps.titleScore}  | team OVR avg ${avg(teamOvr).toFixed(1)} (min ${Math.min(...teamOvr)} max ${Math.max(...teamOvr)}) player avg ${allOvr.toFixed(1)} | roster ${Math.min(...rosterSizes)}-${Math.max(...rosterSizes)} | Heisman ${heis?.winnerName} (${TEAM_BY_ID[heis!.teamId].abbreviation}, ${heis?.position}) | KSU ${d.history.at(-1)!.user.w}-${d.history.at(-1)!.user.l}`,
  );
  const off = startOffseason(d);
  if (s === 0) console.log(`  draft picks ${off.draft.length}, #1 class ${TEAM_BY_ID[off.classRankings[0].teamId].school}, recruits ${off.classRankings.reduce((a, c) => a + c.count, 0)}`);
  startNextSeason(d);
}
const top = [...UNIVERSE_TEAMS].sort((a, b) => d.teams[b.id].currentPrestige - d.teams[a.id].currentPrestige).slice(0, 8);
console.log('Prestige now:', top.map((t) => `${t.abbreviation} ${d.teams[t.id].currentPrestige.toFixed(0)} (was ${t.prestige})`).join(', '));
console.log(`save size ${(JSON.stringify(d).length / 1e6).toFixed(1)} MB, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
