/**
 * QuickSim: ratings-based plate-appearance simulator, used ONLY when the player explicitly
 * chooses "Simulate half-inning" / "Simulate to end" from the pause menu.
 */
import type { Player } from '../core/types';
import type { Rng } from '../core/math';
import type { GameState } from './GameState';
import { currentBatter, currentPitcher } from './GameState';
import type { PlayOutcome, OutRecord } from './LivePlay';
import type { RulesEngine } from './RulesEngine';

function blank(): PlayOutcome {
  return {
    kind: 'inplay', homeRun: false, groundRuleDouble: false, outs: [], runs: [], batterResult: 'out', bases: [null, null, null],
    errors: [], hitType: null, sacFly: false, doublePlay: false, triplePlay: false, caughtStealing: [], stolenBases: [], notable: [], description: '', fielderFirstTouch: null,
  };
}

const out = (id: string): OutRecord => ({ runnerId: id, how: 'ground', base: 1, putout: null, assists: [], time: 0, force: true });

export function simulatePA(s: GameState, rules: RulesEngine, rng: Rng) {
  const b: Player = currentBatter(s);
  const p: Player = currentPitcher(s);
  const pr = p.pitcher!;
  const R = p.throws === 'R';
  const con = R ? b.ratings.contactR : b.ratings.contactL;
  const pow = R ? b.ratings.powerR : b.ratings.powerL;
  const eye = b.ratings.discipline;
  const stuff = (pr.break + (pr.velocity - 85) * 3 + pr.control) / 3;
  const pitches = Math.round(3 + rng.range(0, 2.6));
  for (let i = 0; i < pitches; i++) rules.countPitch(rng.chance(0.63));
  const pK = 0.21 + (stuff - 70) / 220 - (con - 65) / 260;
  const pBB = 0.08 + (eye - 60) / 650 - (pr.control - 65) / 500;
  const r = rng.next();
  if (r < pBB) { s.balls = 3; rules.applyPitch('ball'); return; }
  if (r < pBB + 0.01) { rules.applyPitch('hbp'); return; }
  if (r < pBB + 0.01 + pK) { s.strikes = 2; rules.applyPitch('swinging_strike'); return; }

  const o = blank();
  const bases = s.bases.map((x) => x?.player.id ?? null);
  const pHit = 0.3 + (con - 65) / 420 - (stuff - 70) / 650;
  const hr = 0.045 + (pow - 60) / 650;
  const x = rng.next();
  const scoreFrom = (ids: (string | null)[]) => ids.filter(Boolean).forEach((id) => o.runs.push({ runnerId: id!, unearned: false, responsiblePitcherId: s.bases.find((q) => q?.player.id === id)?.responsiblePitcherId ?? p.id }));
  if (x < hr) {
    o.batterResult = 'HR'; o.homeRun = true;
    scoreFrom(bases);
    o.runs.push({ runnerId: b.id, unearned: false, responsiblePitcherId: p.id });
    o.description = `${b.name} homers!`;
  } else if (x < pHit) {
    const y = rng.next();
    const kind = y < 0.7 ? 1 : y < 0.95 ? 2 : 3;
    o.batterResult = (['1B', '2B', '3B'] as const)[kind - 1];
    const nb: (string | null)[] = [null, null, null];
    // Runners advance kind bases, plus an extra base sometimes from 2nd on a single.
    for (let i = 2; i >= 0; i--) {
      const id = bases[i];
      if (!id) continue;
      const extra = kind === 1 && i >= 1 && rng.chance(0.6) ? 1 : kind === 2 && i === 0 && rng.chance(0.4) ? 1 : 0;
      const to = i + kind + extra;
      if (to >= 3) scoreFrom([id]);
      else nb[to] = id;
    }
    nb[kind - 1] = b.id;
    o.bases = nb;
    o.description = `${b.name} ${['singles', 'doubles', 'triples'][kind - 1]}`;
  } else {
    o.batterResult = 'out';
    o.outs.push(out(b.id));
    o.bases = [...bases];
    const fly = rng.chance(0.45);
    if (!fly && bases[0] && s.outs < 2 && rng.chance(0.3)) {
      o.outs.push(out(bases[0]));
      o.bases[0] = null;
      o.doublePlay = true;
      o.description = `${b.name} grounds into a double play`;
    } else if (fly && bases[2] && s.outs < 2 && rng.chance(0.55)) {
      scoreFrom([bases[2]]);
      o.bases[2] = null;
      o.sacFly = true;
    } else o.description = `${b.name} ${fly ? 'flies out' : 'grounds out'}`;
    if (!fly && !o.doublePlay && s.outs < 2) {
      // Productive out: runners move up a base.
      if (o.bases[2] && rng.chance(0.4)) { scoreFrom([o.bases[2]]); o.bases[2] = null; }
      if (o.bases[1] && !o.bases[2]) { o.bases[2] = o.bases[1]; o.bases[1] = null; }
    }
  }
  rules.applyPlay(o, b.id);
}
