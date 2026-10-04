/** Human-bot audit: the bot plays through the interactive path vs the CPU. Usage: tsx scripts/botGames.ts N qlen difficulty */
import { GameSession } from '../src/game/GameSession';
import { HumanBot } from '../src/game/Bot';
import { LCPS_TEAMS } from '../src/data/teams';
import { generateRoster } from '../src/game/players';
import { RNG } from '../src/game/rng';
import type { Difficulty } from '../src/game/types';
const N = Number(process.argv[2] ?? 6);
const q = Number(process.argv[3] ?? 180);
const diff = (process.argv[4] ?? 'VARSITY') as Difficulty;
const rng = new RNG(3);
let us = 0, them = 0, wins = 0, plays = 0;
const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const [a, b] = rng.shuffle([...LCPS_TEAMS]).slice(0, 2);
  const s = new GameSession({
    home: { info: a, roster: generateRoster(a.offenseRating, a.defenseRating, a.specialTeamsRating, rng) },
    away: { info: b, roster: generateRoster(b.offenseRating, b.defenseRating, b.specialTeamsRating, rng) },
    userSide: 'home', difficulty: diff, quarterLen: q, weather: 'clear', timeOfDay: 'night', seed: i + 11,
  });
  const bot = new HumanBot(i + 1);
  bot.play(s);
  const r = s.result();
  const tot = s.g.totals.home;
  console.log(`${a.abbreviation}(bot) ${r.homeScore} - ${r.awayScore} ${b.abbreviation}${r.ot ? ' OT' : ''} | over=${s.isOver} plays=${s.playCount} botPass ${tot.passYds} rush ${tot.rushYds} TO ${tot.turnovers} | cpu pass ${s.g.totals.away.passYds} rush ${s.g.totals.away.rushYds}`);
  us += r.homeScore; them += r.awayScore; if (r.homeScore > r.awayScore) wins++; plays += s.playCount;
}
console.log(`${diff}: bot avg ${(us / N).toFixed(1)} vs cpu ${(them / N).toFixed(1)}, wins ${wins}/${N}, ${((Date.now() - t0) / N / 1000).toFixed(1)}s/game`);
