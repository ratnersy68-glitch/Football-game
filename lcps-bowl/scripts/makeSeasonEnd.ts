/** Builds a dynasty at the end of its first season and writes the serialized save to a file (for UI tests). */
import { writeFileSync } from 'node:fs';
import { createDynasty, currentGames, simulateGame, applyResult, finishWeek } from '../src/dynasty/Season';
import { serialize } from '../src/save/storage';
import { GameSession } from '../src/game/GameSession';
GameSession.HEADLESS_DT = 1 / 20;
const team = process.argv[3] ?? 'stone-bridge';
const d = createDynasty(team, 'Taylor', 1, 99);
let guard = 0;
while (d.phase !== 'season_end' && guard++ < 30) {
  for (const g of currentGames(d).filter((x) => !x.played)) {
    const { result, session } = simulateGame(d, g, 120);
    applyResult(d, g, result, session);
  }
  finishWeek(d);
}
writeFileSync(process.argv[2] ?? '/tmp/season_end.json', JSON.stringify({ raw: serialize(d), meta: { team, teamName: team, coach: 'Taylor', year: d.year, week: 'SEASON COMPLETE', record: '', championships: d.programs[team].championships.length } }));
console.log('champion', d.bracket?.champion, 'user', team);
