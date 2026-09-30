import type { FightEngine } from './FightEngine';
import { TUNING } from './tuning';

/** Round clock, 10-second warning, horn, between-round recovery, corner/doctor checks and decisions. */
export class RoundManager {
  tenWarned = false;
  constructor(private e: FightEngine) {}

  update(dt: number) {
    const e = this.e;
    if (e.status !== 'fighting') return;
    e.clock -= dt * e.cfg.clockSpeed;
    if (!this.tenWarned && e.clock <= 10) {
      this.tenWarned = true;
      e.emit({ type: 'tenSeconds', round: e.round });
    }
    if (e.clock <= 0) this.endRound();
  }

  endRound() {
    const e = this.e;
    e.clock = 0;
    if (e.sub) e.submission.cancel();
    const scores = e.judges.scoreRound(e.stats.rounds[e.round - 1]);
    e.emit({ type: 'roundEnd', round: e.round, scores });
    if (e.round >= e.cfg.rounds) {
      const d = e.judges.decision();
      if (d.winner === null) e.finish(null, 'DRAW', d.drawType ?? 'Draw');
      else e.finish(d.winner, 'DEC', `${d.type} Decision`, d.type as 'Unanimous' | 'Split' | 'Majority');
      return;
    }
    e.status = 'betweenRounds';
    for (const f of e.f) {
      e.damage.betweenRounds(f);
      e.stamina.betweenRounds(f);
    }
    // Doctor / corner checks
    for (const f of e.f) {
      const other = f.side === 0 ? 1 : 0;
      if (f.cut > 60 && e.rng.chance((f.cut - 55) / 160)) {
        e.finish(other, 'TKO', 'Doctor Stoppage (Cut)', undefined, true);
        return;
      }
      if (f.swelling > 16 && e.rng.chance((f.swelling - 14) / 90)) {
        e.finish(other, 'TKO', 'Doctor Stoppage (Eye)', undefined, true);
        return;
      }
      const legWorst = Math.max(f.legL, f.legR);
      if ((legWorst > 100 && e.rng.chance((legWorst - 95) / 80)) || (f.head > 300 && e.rng.chance((f.head - 290) / 150))) {
        e.finish(other, 'TKO', 'Corner Stoppage', undefined, true);
        return;
      }
    }
  }

  startNextRound() {
    const e = this.e;
    if (e.status !== 'betweenRounds') return;
    e.round++;
    e.clock = e.cfg.roundSeconds;
    e.roundTime = 0;
    this.tenWarned = false;
    e.mode = 'stand';
    e.clinch = null;
    e.ground = null;
    e.sub = null;
    const d = TUNING.startDistance / 2;
    e.f[0].pos = { x: -d, z: 0 };
    e.f[1].pos = { x: d, z: 0 };
    e.f[0].facing = 0;
    e.f[1].facing = Math.PI;
    for (const f of e.f) {
      f.action = null;
      f.buffered = null;
      f.vel = { x: 0, z: 0 };
      f.comboSeq = [];
    }
    e.stats.startRound();
    e.status = 'fighting';
    e.emit({ type: 'roundStart', round: e.round });
  }
}
