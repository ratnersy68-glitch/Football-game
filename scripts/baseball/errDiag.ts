import { GameEngine, emptyInput } from '../../src/baseball/engine/GameEngine';
import { TEAMS, defaultSetup } from '../../src/baseball/managers/TeamManager';
import { DEFAULT_PREFS, type GameSettings } from '../../src/baseball/core/types';
const tally: Record<string, number> = {};
for (let g = 0; g < 6; g++) {
  const a = TEAMS[g], h = TEAMS[g + 10];
  const settings: GameSettings = { innings: 9, difficulty: 'ALL-STAR', stadiumId: h.stadiumId, conditions: { time: 'Night', weather: 'Clear', temperature: 72, windMph: 0, windDir: 0 }, home: defaultSetup(h, g), away: defaultSetup(a, g + 1), userSide: 'none', ghostRunner: true };
  const e = new GameEngine(settings, DEFAULT_PREFS, 300 + g);
  const inp = emptyInput(); let t = 0; let lastThrow = false;
  while (e.phase !== 'final' && t < 3 * 3600) {
    e.update(1 / 60, inp); t += 1 / 60;
    for (const ev of e.drainEvents()) {
      if (ev.type === 'play:throw') lastThrow = true;
      if (ev.type === 'play:catch' || ev.type === 'play:catchThrow') lastThrow = false;
      if (ev.type === 'play:error') { const k = `${(ev.data as any).pos}-${lastThrow ? 'throw' : 'field'}`; tally[k] = (tally[k] ?? 0) + 1; }
      if (ev.type === 'play:bobble') { const k = `bobble-${lastThrow ? 'throw' : 'field'}`; tally[k] = (tally[k] ?? 0) + 1; }
      if (ev.type === 'contact') lastThrow = false;
    }
  }
}
console.log(tally);
