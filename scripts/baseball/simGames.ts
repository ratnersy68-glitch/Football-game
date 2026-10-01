import { GameEngine, emptyInput } from '../../src/baseball/engine/GameEngine';
import { TEAMS, defaultSetup } from '../../src/baseball/managers/TeamManager';
import { DEFAULT_PREFS, type GameSettings } from '../../src/baseball/core/types';
import { Rng } from '../../src/baseball/core/math';

const N = Number(process.argv[2] ?? 20);
const verbose = process.argv.includes('-v');
const rng = new Rng(7);
const tot = { R: 0, H: 0, HR: 0, K: 0, BB: 0, E: 0, PA: 0, AB: 0, D: 0, T: 0, SB: 0, CS: 0, DP: 0, games: 0, simT: 0, stuck: 0, longPlays: 0, pitches: 0, foul: 0 };
for (let g = 0; g < N; g++) {
  const a = TEAMS[Math.floor(rng.next() * 30)], h = TEAMS[Math.floor(rng.next() * 30)];
  const settings: GameSettings = { innings: 9, difficulty: 'ALL-STAR', stadiumId: h.stadiumId, conditions: { time: 'Night', weather: 'Clear', temperature: 72, windMph: 5, windDir: 0 }, home: defaultSetup(h, g), away: defaultSetup(a, g + 1), userSide: 'none', ghostRunner: true };
  const e = new GameEngine(settings, DEFAULT_PREFS, 1000 + g);
  let t = 0;
  const inp = emptyInput();
  let maxPlay = 0;
  while (e.phase !== 'final' && t < 4 * 3600) {
    e.update(1 / 60, inp);
    t += 1 / 60;
    if (e.play) maxPlay = Math.max(maxPlay, e.play.t);
    for (const ev of e.drainEvents()) {
      if (ev.type === 'call' && ev.text === 'FOUL') tot.foul++;
      if (verbose && ['banner','homerun','call','strikeout','halfEnd','final','pitchingChange','runsScored'].includes(ev.type)) console.log(`  [${e.state.half} ${e.state.inning} ${e.state.outs}o] ${ev.type} ${ev.text ?? ''} ${ev.sub ?? ''}`);
    }
  }
  if (e.phase !== 'final') tot.stuck++;
  if (maxPlay > 35) tot.longPlays++;
  const s = e.state;
  let line = '';
  for (const side of ['away', 'home'] as const) {
    const ts = s[side];
    line += `${ts.team.id} ${ts.linescore.join(' ')} | ${ts.runs} ${ts.hits} ${ts.errors}   `;
    tot.R += ts.runs; tot.H += ts.hits; tot.E += ts.errors;
  }
  for (const [, b] of e.stats.bat) { tot.HR += b.HR; tot.K += b.SO; tot.BB += b.BB; tot.PA += b.PA; tot.AB += b.AB; tot.D += b.D; tot.T += b.T; tot.SB += b.SB; tot.CS += b.CS; }
  for (const [, p] of e.stats.pitch) tot.pitches += p.pitches;
  tot.games++; tot.simT += t;
  console.log(`G${g} ${line} (${(t / 60).toFixed(0)} min sim, maxPlay ${maxPlay.toFixed(1)}s)`);
}
const n = tot.games * 2;
console.log(`\nPer team-game: R ${(tot.R / n).toFixed(2)} H ${(tot.H / n).toFixed(2)} HR ${(tot.HR / n).toFixed(2)} 2B ${(tot.D/n).toFixed(2)} 3B ${(tot.T/n).toFixed(2)} K ${(tot.K / n).toFixed(2)} BB ${(tot.BB / n).toFixed(2)} E ${(tot.E / n).toFixed(2)} SB ${(tot.SB/n).toFixed(2)} CS ${(tot.CS/n).toFixed(2)} PA ${(tot.PA / n).toFixed(1)} pitches ${(tot.pitches/n).toFixed(0)} fouls ${(tot.foul/n).toFixed(1)}`);
console.log(`AVG ${(tot.H / tot.AB).toFixed(3)}  stuck ${tot.stuck}  longPlays ${tot.longPlays}`);
