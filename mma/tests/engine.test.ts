import { describe, expect, it } from 'vitest';
import { FIGHTER_BY_ID, FIGHTERS, STRIKES } from '../src/data';
import { FightEngine } from '../src/engine/FightEngine';
import { koThreshold } from '../src/engine/FighterState';
import { JudgeSystem } from '../src/engine/JudgeSystem';
import { emptyCommand, type Command } from '../src/engine/types';
import { TUNING } from '../src/engine/tuning';
import { Rng } from '../src/core/rng';
import { simulateFight } from '../src/modes/SimFight';

const F = (id: string) => FIGHTER_BY_ID[id];
const mk = (a = 'islam_makhachev', b = 'charles_oliveira', seed = 1) =>
  new FightEngine({ fighters: [F(a), F(b)], rounds: 3, roundSeconds: 300, clockSpeed: 2.5, seed, arenaId: 'vegas' });
const idle = (): [Command, Command] => [emptyCommand(), emptyCommand()];

describe('fighter database', () => {
  it('has a large roster across all divisions with valid attributes', () => {
    expect(FIGHTERS.length).toBeGreaterThanOrEqual(100);
    const divisions = new Set(FIGHTERS.map((f) => f.weightClass));
    expect(divisions.size).toBe(11);
    for (const f of FIGHTERS) for (const v of Object.values(f.attributes)) expect(v).toBeGreaterThan(0), expect(v).toBeLessThan(100);
    for (const id of ['jon_jones', 'tom_aspinall', 'alex_pereira', 'magomed_ankalaev', 'israel_adesanya', 'khamzat_chimaev', 'dricus_du_plessis', 'sean_strickland', 'robert_whittaker', 'islam_makhachev', 'ilia_topuria', 'charles_oliveira', 'justin_gaethje', 'dustin_poirier', 'max_holloway', 'alexander_volkanovski', 'sean_o_malley', 'merab_dvalishvili']) {
      expect(FIGHTER_BY_ID[id], id).toBeDefined();
    }
  });
  it('elite fighters are not generic: attribute profiles differ strongly by style', () => {
    const p = F('alex_pereira').attributes;
    const k = F('khamzat_chimaev').attributes;
    expect(p.power - k.power).toBeGreaterThan(5);
    expect(k.takedowns - p.takedowns).toBeGreaterThan(50);
  });
});

describe('fight engine', () => {
  it('is deterministic for a given seed', () => {
    const a = simulateFight(F('max_holloway'), F('justin_gaethje'), { seed: 42 }).result;
    const b = simulateFight(F('max_holloway'), F('justin_gaethje'), { seed: 42 }).result;
    expect(a).toEqual(b);
  });

  it('runs the round clock, ends rounds and reaches a decision if nobody is finished', () => {
    const e = mk();
    e.start();
    let steps = 0;
    while (e.status !== 'finished' && steps++ < 100000) {
      if (e.status === 'betweenRounds') e.startNextRound();
      else e.update(1 / 30, idle());
    }
    expect(e.result?.method === 'DEC' || e.result?.method === 'DRAW').toBe(true);
    expect(e.judges.cards.every((c) => c.rounds.length === 3)).toBe(true);
    // idle fighters: every round should be close; the 10-point must system still produces scores
    for (const c of e.judges.cards) for (const r of c.rounds) expect(Math.max(...r)).toBe(10);
  });

  it('knocks a fighter out when daze exceeds the chin-based threshold', () => {
    const e = mk('alex_pereira', 'jamahal_hill');
    e.start();
    const d = e.f[1];
    d.daze = koThreshold(d, TUNING) - 1;
    e.damage.applyHit(e.f[0], d, STRIKES.leadHook, { dmg: 12, counter: 'timed', flush: true, blocked: false, punish: 1 });
    expect(e.result?.method).toBe('KO');
    expect(e.result?.winner).toBe(0);
    expect(e.result?.detail).toBe('Left Hook');
  });

  it('better chins take more to put away', () => {
    const e = mk('max_holloway', 'justin_gaethje');
    expect(koThreshold(e.f[0], TUNING)).toBeGreaterThan(koThreshold(e.f[1], TUNING));
  });

  it('body damage drains stamina; leg damage slows movement', () => {
    const e = mk();
    e.start();
    const d = e.f[1];
    const s0 = d.stamina;
    e.damage.applyHit(e.f[0], d, STRIKES.rearBodyKick, { dmg: 9, counter: '', flush: false, blocked: false, punish: 1 });
    expect(d.stamina).toBeLessThan(s0 - 3);
    const v0 = e.movement.maxSpeed(d);
    d.legL = 70;
    d.legR = 70;
    expect(e.movement.maxSpeed(d)).toBeLessThan(v0 * 0.75);
  });

  it('missed strikes cost more stamina than landed ones', () => {
    const cost = (dist: number) => {
      const e = mk('islam_makhachev', 'charles_oliveira', 5);
      e.start();
      e.f[0].pos = { x: -dist / 2, z: 0 };
      e.f[1].pos = { x: dist / 2, z: 0 };
      const before = e.f[0].stamina;
      e.strikes.start(e.f[0], 'cross', false);
      for (let i = 0; i < 20; i++) e.update(1 / 60, idle());
      return before - e.f[0].stamina;
    };
    // at 7 m the cross can only whiff; at 0.9 m it connects (or is blocked)
    expect(cost(7)).toBeGreaterThan(cost(0.9) + 0.5);
  });

  it('a high guard blocks head punches; a slip makes straight punches miss', () => {
    const e = mk();
    e.start();
    const [a, d] = e.f;
    a.pos = { x: -0.5, z: 0 };
    d.pos = { x: 0.5, z: 0 };
    let blocked = 0;
    let evaded = 0;
    e.bus.on((ev) => {
      if (ev.type === 'strikeBlocked') blocked++;
      if (ev.type === 'strikeMissed' && ev.evaded === 'slip') evaded++;
    });
    const guard: Command = { ...emptyCommand(), guard: 'high' };
    e.strikes.start(a, 'cross', false);
    for (let i = 0; i < 40; i++) e.update(1 / 60, [emptyCommand(), guard]);
    expect(blocked).toBe(1);
    e.strikes.startDefense(d, 'slip', 1);
    e.strikes.start(a, 'jab', false);
    for (let i = 0; i < 40; i++) e.update(1 / 60, idle());
    expect(evaded).toBe(1);
  });

  it('never lets fighters leave the octagon or overlap', () => {
    const e = mk();
    e.start();
    const push: Command = { ...emptyCommand(), move: { x: 1, z: 1 } };
    for (let i = 0; i < 600; i++) e.update(1 / 60, [push, push]);
    for (const f of e.f) expect(Math.hypot(f.pos.x, f.pos.z)).toBeLessThan(TUNING.octagonApothem / Math.cos(Math.PI / 8));
    expect(e.distance()).toBeGreaterThanOrEqual(TUNING.minSeparation - 0.01);
  });
});

describe('submissions are an interactive scramble, not a dice roll', () => {
  const run = (attackerPresses: boolean, defenderPresses: boolean) => {
    const e = mk('charles_oliveira', 'justin_gaethje', 3);
    e.start();
    e.grappling.startGround(0, 'backControl', { x: 0, z: 0 });
    e.submission.attempt(e.f[0], 0);
    let steps = 0;
    while (e.mode === 'sub' && steps++ < 4000) {
      const s = e.sub!;
      const c0 = emptyCommand();
      const c1 = emptyCommand();
      if (steps % 20 === 0) {
        if (attackerPresses) c0.subKey = s.prompts[0];
        if (defenderPresses) c1.subKey = s.prompts[1];
      }
      e.update(1 / 60, [c0, c1]);
    }
    return e;
  };
  it('an active attacker against a passive defender gets the tap', () => {
    expect(run(true, false).result?.method).toBe('SUB');
  });
  it('an active defender against a passive attacker escapes', () => {
    const e = run(false, true);
    expect(e.result).toBeNull();
    expect(e.mode).not.toBe('sub');
  });
});

describe('judging (10-point must)', () => {
  const card = (rounds: Array<[number, number]>) => ({ judge: 'x', rounds, total: rounds.reduce((t, r) => [t[0] + r[0], t[1] + r[1]], [0, 0]) as [number, number] });
  const decide = (a: Array<[number, number]>, b: Array<[number, number]>, c: Array<[number, number]>) => {
    const j = new JudgeSystem(new Rng(1));
    j.cards = [card(a), card(b), card(c)];
    return j.decision();
  };
  it('unanimous, split, majority and draw', () => {
    expect(decide([[10, 9], [10, 9], [10, 9]], [[10, 9], [10, 9], [9, 10]], [[10, 9], [10, 9], [10, 9]])).toMatchObject({ winner: 0, type: 'Unanimous' });
    expect(decide([[10, 9], [10, 9], [9, 10]], [[9, 10], [9, 10], [10, 9]], [[10, 9], [9, 10], [10, 9]])).toMatchObject({ winner: 0, type: 'Split' });
    expect(decide([[10, 9], [10, 9], [9, 10]], [[10, 9], [9, 10], [10, 10]], [[10, 9], [10, 9], [9, 10]])).toMatchObject({ winner: 0, type: 'Majority' });
    expect(decide([[10, 9], [9, 10], [10, 10]], [[10, 9], [9, 10], [10, 10]], [[10, 9], [9, 10], [10, 10]]).type).toBe('Draw');
  });
  it('a dominant round with knockdowns can be scored 10-8', () => {
    const j = new JudgeSystem(new Rng(2));
    const base = { totalLanded: 0, totalAttempted: 0, sigAttempted: 0, headLanded: 0, headAttempted: 0, bodyLanded: 0, bodyAttempted: 0, legLanded: 0, legAttempted: 0, tdLanded: 0, tdAttempted: 0, controlTime: 0, subAttempts: 0, reversals: 0, nearFinishes: 0, rockedOpp: 0, aggression: 0 };
    const scores = j.scoreRound([{ ...base, sigLanded: 40, damageDealt: 180, knockdowns: 2, rockedOpp: 2 }, { ...base, sigLanded: 6, damageDealt: 20, knockdowns: 0 }]);
    expect(scores.every((s) => s[0] === 10 && s[1] <= 8)).toBe(true);
  });
});
