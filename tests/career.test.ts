import { describe, expect, it } from 'vitest';
import { newPlayer, playerOverall, posDef, type PositionId } from '../src/career/player';
import { buildMatch } from '../src/play/engine/roster';
import { PlaySim } from '../src/play/engine/sim';
import { PLAYS } from '../src/play/engine/playbook';
import { DEFAULT_SETTINGS } from '../src/play/engine/types';
import { Drive } from '../src/play/engine/drive';
import { simGame, simPossession } from '../src/play/engine/possession';
import { Rng } from '../src/core/rng';
import * as S from '../src/career/season';

const idle = { move: { x: 0, y: 0 }, sprint: false };

function playOut(sim: PlaySim, playId: string, carry = true) {
  sim.setup({ los: 30, spotY: 26.66, play: PLAYS.find((p) => p.id === playId)!, defCall: 'cover3' });
  sim.step(1 / 60, { ...idle, snap: true });
  for (let i = 0; i < 60 * 25 && sim.phase === 'live'; i++) {
    const me = sim.controlled;
    const holding = sim.ball.state === 'held' && sim.ball.holder === me.id;
    sim.step(1 / 60, holding && carry ? { move: { x: 1, y: 0 }, sprint: true } : idle);
  }
  return { o: sim.outcome!, ev: sim.drainEvents() };
}

describe('positions', () => {
  it('every playable position builds a roster with the user in his slot', () => {
    for (const pos of ['QB', 'RB', 'WR', 'TE'] as PositionId[]) {
      const cp = { ...newPlayer(pos, 'georgia'), firstName: 'A', lastName: 'B' };
      const m = buildMatch(cp, 'florida');
      expect(m.specs).toHaveLength(22);
      expect(m.specs.filter((s) => s.side === 'off' && s.role === 'QB')).toHaveLength(1);
      const user = m.specs.find((s) => s.user)!;
      expect(user.role).toBe(pos === 'TE' ? 'TE' : pos);
      expect(posDef(pos).attributes.length).toBeGreaterThan(8);
      expect(playerOverall(cp)).toBeGreaterThan(50);
    }
  });
});

describe('run game and AI offense', () => {
  it('a run play hands off and the back gains yards on his own', () => {
    const cp = { ...newPlayer('WR'), firstName: 'A', lastName: 'B' };
    const sim = new PlaySim(buildMatch(cp).specs, DEFAULT_SETTINGS, 2);
    let total = 0;
    for (let i = 0; i < 20; i++) {
      const { o, ev } = playOut(sim, 'inside_zone');
      expect(ev.some((e) => e.type === 'handoff')).toBe(true);
      expect(o.passer).toBeUndefined();
      total += o.spotX - 30;
    }
    expect(total / 20).toBeGreaterThan(1);
    expect(total / 20).toBeLessThan(15);
  });

  it('a user RB gets the handoff and controls the run', () => {
    const cp = { ...newPlayer('RB'), firstName: 'A', lastName: 'B' };
    const sim = new PlaySim(buildMatch(cp).specs, DEFAULT_SETTINGS, 3);
    const { o } = playOut(sim, 'power');
    expect(o.carrier).toBe(sim.userId);
  });

  it('the AI quarterback throws when the user plays receiver', () => {
    const cp = { ...newPlayer('WR'), firstName: 'A', lastName: 'B' };
    const sim = new PlaySim(buildMatch(cp).specs, DEFAULT_SETTINGS, 4);
    let throws = 0;
    for (let i = 0; i < 20; i++) if (playOut(sim, 'slants').ev.some((e) => e.type === 'throw' || e.type === 'throwaway')) throws++;
    expect(throws).toBeGreaterThan(14);
  });
});

describe('simulated possessions & games', () => {
  it('better offenses score more', () => {
    const rng = new Rng(1);
    let good = 0;
    let bad = 0;
    for (let i = 0; i < 400; i++) {
      good += simPossession(85, 70, 25, rng, 15).points;
      bad += simPossession(70, 85, 25, rng, 15).points;
    }
    expect(good).toBeGreaterThan(bad * 1.5);
  });

  it('a simulated game always has a winner and a stat line', () => {
    const rng = new Rng(9);
    for (let i = 0; i < 50; i++) {
      const r = simGame({ offense: 80, defense: 78 }, { offense: 78, defense: 80 }, rng, 'RB', 75, 1);
      expect(r.us).not.toBe(r.them);
      expect(r.stats.rushAtt).toBeGreaterThan(0);
    }
  });

  it('the drive clock rolls quarters and reaches the end of the game', () => {
    const d = new Drive({ ...DEFAULT_SETTINGS, quarterMinutes: 5 });
    for (let i = 0; i < 40; i++) d.runClock(60);
    expect(d.gameOver).toBe(true);
    expect(d.quarter).toBe(4);
  });
});

describe('career season', () => {
  const play = (strategy: 'balanced' | 'party') => {
    const c = S.newCareer({ ...newPlayer('WR', 'texas'), firstName: 'T', lastName: 'B' }, 5);
    let n = 0;
    while (!c.over && n++ < 2000) {
      if (S.pendingGame(c)) {
        S.simCurrentGame(c);
        continue;
      }
      const sch = S.scheduledAt(c, c.day, c.slot);
      if (sch.fixed) S.doSlot(c, 'attend');
      else if (sch.activity) S.doSlot(c);
      else if (strategy === 'party') S.doSlot(c, c.slot === 2 ? 'party' : 'gaming');
      else S.doSlot(c, c.meters.energy < 40 ? 'rest' : c.meters.grades < 60 ? 'study' : c.slot === 2 ? 'weights' : 'drills');
    }
    return c;
  };

  it('uses the school\'s real 12-game schedule', () => {
    const c = S.newCareer({ ...newPlayer('QB', 'texas'), firstName: 'T', lastName: 'B' }, 5);
    expect(c.schedule).toHaveLength(12);
    expect(c.contacts.length).toBeGreaterThanOrEqual(7);
    expect(c.messages.length).toBeGreaterThan(0);
  });

  it('a whole season can be lived; choices change grades, trust and growth', () => {
    const good = play('balanced');
    const bad = play('party');
    expect(good.over && bad.over).toBe(true);
    expect(good.schedule.every((g) => g.played)).toBe(true);
    expect(good.meters.grades).toBeGreaterThan(bad.meters.grades);
    expect(good.meters.trust).toBeGreaterThan(bad.meters.trust);
    expect(playerOverall(good.player)).toBeGreaterThan(playerOverall(bad.player));
    // The partier loses eligibility and misses games.
    expect(bad.schedule.filter((g) => !g.result?.played).length).toBeGreaterThan(0);
  });

  it('phone invites can be accepted and become plans', () => {
    const c = S.newCareer({ ...newPlayer('RB', 'lsu'), firstName: 'T', lastName: 'B' }, 8);
    let inv = c.messages.find((m) => m.invite?.status === 'pending');
    for (let i = 0; i < 10 && !inv; i++) {
      S.doSlot(c, 'attend');
      inv = c.messages.find((m) => m.invite?.status === 'pending');
    }
    expect(inv).toBeDefined();
    S.answerInvite(c, inv!.id, true);
    expect(c.plans[S.planKey(inv!.invite!.day, inv!.invite!.slot)]?.with).toBe(inv!.contact);
  });
});
