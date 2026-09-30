import { describe, expect, it } from 'vitest';
import { AIController } from '../src/ai/AIController';
import { Rng } from '../src/core/rng';
import { FIGHTER_BY_ID } from '../src/data';
import { FightEngine } from '../src/engine/FightEngine';
import { emptyCommand } from '../src/engine/types';
import { simulateFight } from '../src/modes/SimFight';

const F = (id: string) => FIGHTER_BY_ID[id];

function styleStats(aId: string, bId: string, n = 8) {
  const out = [0, 1].map(() => ({ tda: 0, leg: 0, sig: 0, rounds: 0 }));
  for (let i = 0; i < n; i++) {
    const { engine } = simulateFight(F(aId), F(bId), { seed: 100 + i });
    for (const s of [0, 1] as const) {
      const t = engine.stats.totals(s);
      out[s].tda += t.tdAttempted;
      out[s].leg += t.legLanded;
      out[s].sig += t.sigLanded;
      out[s].rounds += engine.stats.rounds.length;
    }
  }
  return out;
}

describe('AI fights according to style', () => {
  it('wrestlers shoot, strikers do not', () => {
    const [merab, omalley] = styleStats('merab_dvalishvili', 'sean_o_malley');
    expect(merab.tda / merab.rounds).toBeGreaterThan(1);
    expect(omalley.tda / omalley.rounds).toBeLessThan(0.3);
  });
  it('leg kickers attack the legs', () => {
    const [gaethje, holloway] = styleStats('justin_gaethje', 'max_holloway');
    expect(gaethje.leg / gaethje.sig).toBeGreaterThan((holloway.leg / holloway.sig) * 1.2);
  });
});

describe('difficulty changes intelligence, not attributes', () => {
  it('Legendary beats Easy in a mirror match most of the time', () => {
    let wins = 0;
    const n = 30;
    for (let i = 0; i < n; i++) {
      const { result } = simulateFight(F('robert_whittaker'), F('robert_whittaker'), { seed: 500 + i, difficulty: ['legendary', 'easy'] });
      if (result.winner === 0) wins++;
    }
    expect(wins / n).toBeGreaterThan(0.65);
  });
  it('fighter attributes are untouched by difficulty', () => {
    const before = JSON.stringify(F('jon_jones').attributes);
    simulateFight(F('jon_jones'), F('tom_aspinall'), { seed: 1, difficulty: ['legendary', 'easy'] });
    expect(JSON.stringify(F('jon_jones').attributes)).toBe(before);
  });
});

describe('AI fairness', () => {
  it('only responds to what it has seen, after a human reaction time — even on Legendary', () => {
    const { engine } = simulateFight(F('israel_adesanya'), F('sean_strickland'), { seed: 11, difficulty: ['legendary', 'legendary'] });
    void engine;
    const e = new FightEngine({ fighters: [F('israel_adesanya'), F('sean_strickland')], rounds: 3, roundSeconds: 300, clockSpeed: 2.5, seed: 9, arenaId: 'vegas' });
    const r = new Rng(9);
    const ai = [new AIController(e, 0, 'legendary', r.fork()), new AIController(e, 1, 'legendary', r.fork())];
    e.start();
    for (let i = 0; i < 60 * 90 && e.status === 'fighting'; i++) e.update(1 / 60, [ai[0].update(1 / 60), ai[1].update(1 / 60)]);
    const log = [...ai[0].reactionLog, ...ai[1].reactionLog];
    expect(log.length).toBeGreaterThan(50);
    expect(Math.min(...log)).toBeGreaterThanOrEqual(0.14);
  });
  it('the AI controller has no access to the opponent controller or its commands', () => {
    // Structural check: AIController only receives the engine (visible state) and its own side.
    expect(AIController.length).toBe(4);
    const e = new FightEngine({ fighters: [F('jon_jones'), F('alex_pereira')], rounds: 3, roundSeconds: 300, clockSpeed: 2.5, seed: 1, arenaId: 'vegas' });
    const ai = new AIController(e, 1, 'legendary', new Rng(1));
    expect(Object.values(ai).some((v) => v && typeof v === 'object' && 'input' in (v as object))).toBe(false);
    void emptyCommand;
  });
});
