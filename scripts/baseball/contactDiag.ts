import { GameEngine, emptyInput } from '../../src/baseball/engine/GameEngine';
import { TEAMS, defaultSetup } from '../../src/baseball/managers/TeamManager';
import { DEFAULT_PREFS, type GameSettings } from '../../src/baseball/core/types';
const N = Number(process.argv[2] ?? 4);
const rows: any[] = [];
const swings = { n: 0, miss: 0, foul: 0, inplay: 0, takes: 0, pitches: 0, strikesCalled: 0, balls: 0 };
const Z: Record<string, number> = { zS: 0, zT: 0, oS: 0, oT: 0 };
const labels: Record<string, number> = {}; const timing: Record<string, number> = {};
for (let g = 0; g < N; g++) {
  const a = TEAMS[g % 30], h = TEAMS[(g * 7 + 3) % 30];
  const settings: GameSettings = { innings: 9, difficulty: 'ALL-STAR', stadiumId: h.stadiumId, conditions: { time: 'Night', weather: 'Clear', temperature: 72, windMph: 0, windDir: 0 }, home: defaultSetup(h, g), away: defaultSetup(a, g + 1), userSide: 'none', ghostRunner: true };
  const e = new GameEngine(settings, DEFAULT_PREFS, 50 + g);
  const inp = emptyInput(); let t = 0; let cur: any = null; let pend: boolean | null = null;
  while (e.phase !== 'final' && t < 3 * 3600) {
    e.update(1 / 60, inp); t += 1 / 60;
    if (pend !== null && (e.phase === 'postpitch' || e.phase === 'live')) { const sw = !!e.swing; Z[(pend?'z':'o')+(sw?'S':'T')]++; pend = null; }
    for (const ev of e.drainEvents()) {
      if (ev.type === 'pitchRelease') { swings.pitches++; pend = e.flight!.isStrike; }
      if (ev.type === 'contactResult') { swings.n++; labels[ev.text!] = (labels[ev.text!] ?? 0) + 1; timing[ev.sub!] = (timing[ev.sub!] ?? 0) + 1; if (!(ev.data as any).contact) swings.miss++; }
      if (ev.type === 'contact') { cur = { ...(ev.data as any), label: ev.text }; }
      if (ev.type === 'call') { if (ev.text === 'BALL') swings.balls++; if ((ev.data as any).call === 'called_strike') swings.strikesCalled++; if (ev.text === 'FOUL' && cur) { cur.res = 'FOUL'; rows.push(cur); cur = null; } }
      if (ev.type === 'banner' && cur) { cur.res = ev.text || 'OUT'; cur.desc = ev.sub; rows.push(cur); cur = null; }
      if (ev.type === 'homerun' && cur) { cur.res = 'HR'; rows.push(cur); cur = null; }
    }
  }
}
console.log('swings', swings, labels, timing, Z, 'zone%', ((Z.zS+Z.zT)/(Z.zS+Z.zT+Z.oS+Z.oT)).toFixed(2), 'zswing', (Z.zS/(Z.zS+Z.zT)).toFixed(2), 'chase', (Z.oS/(Z.oS+Z.oT)).toFixed(2));
const bucket = (r: any) => (r.la < 10 ? 'GB' : r.la < 25 ? 'LD' : r.la < 50 ? 'FB' : 'PU');
const by: Record<string, Record<string, number>> = {};
for (const r of rows) { const k = bucket(r) + (r.ev > 95 ? '-hard' : r.ev > 80 ? '-med' : '-soft'); by[k] ??= {}; by[k][r.res] = (by[k][r.res] ?? 0) + 1; }
for (const k of Object.keys(by).sort()) console.log(k.padEnd(10), JSON.stringify(by[k]));
for (const r of rows) if (r.ev > 95 && r.la > 22 && r.la < 45) console.log('hardFB', r.ev.toFixed(0), r.la.toFixed(0), r.spray.toFixed(0), r.dist?.toFixed(0), r.res, r.desc ?? '');
const evs = rows.filter(r=>r.res!=='FOUL').map(r => r.ev); evs.sort((a,b)=>a-b);
console.log('EV median', evs[Math.floor(evs.length/2)]?.toFixed(1), 'p90', evs[Math.floor(evs.length*0.9)]?.toFixed(1));
const las = rows.filter(r=>r.res!=='FOUL').map(r => r.la); las.sort((a,b)=>a-b);
console.log('LA median', las[Math.floor(las.length/2)]?.toFixed(1), 'p10', las[Math.floor(las.length*0.1)]?.toFixed(1), 'p90', las[Math.floor(las.length*0.9)]?.toFixed(1));
const sprays = rows.filter(r=>r.res!=='FOUL').map(r => r.spray); sprays.sort((a,b)=>a-b);
console.log('spray p10/50/90', sprays[Math.floor(sprays.length*0.1)]?.toFixed(0), sprays[Math.floor(sprays.length*0.5)]?.toFixed(0), sprays[Math.floor(sprays.length*0.9)]?.toFixed(0));
