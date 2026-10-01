import { GameEngine, emptyInput } from '../../src/baseball/engine/GameEngine';
import { TEAMS, defaultSetup } from '../../src/baseball/managers/TeamManager';
import { DEFAULT_PREFS, type GameSettings } from '../../src/baseball/core/types';
const t2: Record<string, number> = {};
for (let g = 0; g < 8; g++) {
  const a = TEAMS[g + 3], h = TEAMS[g + 13];
  const settings: GameSettings = { innings: 9, difficulty: 'ALL-STAR', stadiumId: h.stadiumId, conditions: { time: 'Night', weather: 'Clear', temperature: 72, windMph: 0, windDir: 0 }, home: defaultSetup(h, g), away: defaultSetup(a, g + 1), userSide: 'none', ghostRunner: true };
  const e = new GameEngine(settings, DEFAULT_PREFS, 900 + g);
  const inp = emptyInput(); let t = 0; let before: any = null;
  while (e.phase !== 'final' && t < 3 * 3600) {
    e.update(1 / 60, inp); t += 1 / 60;
    if (e.phase === 'live' && !before && e.play?.cfg.batter) before = { r1: e.state.bases[0]?.player.id, r2: e.state.bases[1]?.player.id, outs: e.state.outs };
    if (e.phase !== 'live' && before && e.lastOutcome) {
      const o = e.lastOutcome;
      const scored = new Set(o.runs.map((r) => r.runnerId));
      const res = o.batterResult;
      if (before.r2 && (res === '1B')) { const k = `R2 on 1B: ${scored.has(before.r2) ? 'scored' : o.bases.includes(before.r2) ? 'held@' + (o.bases.indexOf(before.r2) + 1) : 'out'}`; t2[k] = (t2[k] ?? 0) + 1; }
      if (before.r1 && (res === '1B')) { const k = `R1 on 1B: ${scored.has(before.r1) ? 'scored' : o.bases.includes(before.r1) ? 'to@' + (o.bases.indexOf(before.r1) + 1) : 'out'}`; t2[k] = (t2[k] ?? 0) + 1; }
      if (before.r1 && (res === '2B')) { const k = `R1 on 2B: ${scored.has(before.r1) ? 'scored' : o.bases.includes(before.r1) ? 'to@' + (o.bases.indexOf(before.r1) + 1) : 'out'}`; t2[k] = (t2[k] ?? 0) + 1; }
      if (res !== 'none') { t2['res ' + res] = (t2['res ' + res] ?? 0) + 1; }
      before = null;
    }
    e.drainEvents();
  }
}
console.log(t2);
