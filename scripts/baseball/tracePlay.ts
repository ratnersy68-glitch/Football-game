import { LivePlay } from '../../src/baseball/engine/LivePlay';
import { battedBall, makeEnv } from '../../src/baseball/engine/BallPhysics';
import { STADIUM_BY_ID } from '../../src/baseball/data/stadiums';
import { TEAM_BY_ID, defaultLineup, playerById } from '../../src/baseball/managers/TeamManager';
import { Rng } from '../../src/baseball/core/math';
import type { FieldPos, Player } from '../../src/baseball/core/types';
const st = STADIUM_BY_ID.kauffman;
const env = makeEnv(st, { time: 'Day', weather: 'Clear', temperature: 72, windMph: 0, windDir: 0 });
const def = {} as Record<FieldPos, Player>;
const t = TEAM_BY_ID.KC;
for (const s of defaultLineup(t)) if (s.pos !== 'DH') def[s.pos as FieldPos] = playerById(s.playerId);
def.P = t.roster.find((p) => p.pitcher)!;
const pen = Object.fromEntries(Object.keys(def).map((k) => [k, 0])) as any;
const off = TEAM_BY_ID.NYY.roster;
const [ev, la, spray] = (process.argv[2] ?? '95,8,5').split(',').map(Number);
const play = new LivePlay({ stadium: st, env, rng: new Rng(3), outsBefore: 0, defense: def, fieldingPenalty: pen,
  runners: [{ base: 2, player: off[2], responsiblePitcherId: 'x', reachedOnError: false, p: 196 }], batter: off[1], pitcherId: 'x',
  userDefense: false, userOffense: false, fieldingAssist: true, runningAssist: true, difficulty: 'ALL-STAR',
  batted: battedBall({ x: 0, y: 3, z: 1.4 }, ev, la, spray, la > 0 ? 1500 : -600, 0), launchAngle: la });
let last = -1;
while (!play.over && play.t < 20) {
  play.update(1 / 120, null);
  for (const e of play.events) if (!['touch'].includes(e.type)) console.log(play.t.toFixed(2), 'EV', e.type, JSON.stringify(e.data ?? {}));
  play.events = [];
  if (Math.floor(play.t * 4) !== last) {
    last = Math.floor(play.t * 4);
    const rs = play.runners.map((r) => `${r.isBatter ? 'B' : 'R' + r.startBase} p${r.p.toFixed(0)} v${r.v.toFixed(1)} g${r.goal}${r.out ? ' OUT' : ''}${r.scored ? ' SC' : ''}`).join(' | ');
    const b = play.ball;
    console.log(play.t.toFixed(2), b.mode, `ball(${b.phys.p.x.toFixed(0)},${b.phys.p.y.toFixed(0)},${b.phys.p.z.toFixed(0)})`, b.holder?.pos ?? '', 'chaser', play.chaser?.pos ?? '-', '|', rs);
  }
}
const o = play.outcome();
console.log(o.batterResult, o.description, 'runs', o.runs.length, 'outs', o.outs.map((x) => x.how + '@' + x.base));
