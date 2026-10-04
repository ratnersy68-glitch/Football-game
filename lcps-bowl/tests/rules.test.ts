import { describe, it, expect } from 'vitest';
import {
  newGameState, applyScrimmage, applyKick, applyFieldGoal, applyPat, runClock, advancePeriod, downText, yardLineText, type GameState,
} from '../src/game/Rules';
import type { PlayOutcome } from '../src/game/PlaySim';

function outcome(p: Partial<PlayOutcome>): PlayOutcome {
  return {
    type: 'tackle', kind: 'scrimmage', spotX: 30, spotY: 26.67, team: 'O', turnover: false, clockStops: false, elapsed: 5, los: 25,
    completion: false, passAttempt: false, sack: false, gain: 0, returnYds: 0, kickYds: 0, passYds: 0, airYds: 0, rushYds: 0,
    bigHit: false, desc: '', events: [], ...p,
  };
}

function scrimmageState(): GameState {
  const g = newGameState('riverside', 'briar-woods', 300, 'home');
  g.phase = 'scrimmage';
  g.possession = 'home';
  g.ballOn = 25;
  g.down = 1;
  g.toGo = 10;
  return g;
}

describe('downs and distance', () => {
  it('advances the down on a short gain', () => {
    const g = scrimmageState();
    applyScrimmage(g, outcome({ spotX: 29, rushYds: 4, rusher: 'p1' }), { off: 'home' });
    expect(g.down).toBe(2);
    expect(g.toGo).toBeCloseTo(6);
    expect(g.ballOn).toBe(29);
    expect(g.clockRunning).toBe(true);
  });

  it('awards a first down when the line to gain is reached', () => {
    const g = scrimmageState();
    const ev = applyScrimmage(g, outcome({ spotX: 36 }), { off: 'home' });
    expect(ev.some((e) => e.type === 'first_down')).toBe(true);
    expect(g.down).toBe(1);
    expect(g.toGo).toBe(10);
    expect(g.totals.home.firstDowns).toBe(1);
  });

  it('uses goal-to-go inside the 10', () => {
    const g = scrimmageState();
    applyScrimmage(g, outcome({ spotX: 95 }), { off: 'home' });
    expect(g.toGo).toBe(5);
    expect(downText(g)).toBe('1ST & GOAL');
  });

  it('turns the ball over on downs after a failed 4th down', () => {
    const g = scrimmageState();
    g.down = 4;
    g.toGo = 3;
    g.ballOn = 60;
    const ev = applyScrimmage(g, outcome({ spotX: 61 }), { off: 'home' });
    expect(ev.some((e) => e.type === 'turnover_downs')).toBe(true);
    expect(g.possession).toBe('away');
    expect(g.ballOn).toBe(39);
    expect(g.down).toBe(1);
  });

  it('incomplete passes stop the clock and keep the spot', () => {
    const g = scrimmageState();
    applyScrimmage(g, outcome({ type: 'incomplete', spotX: 25, clockStops: true, passAttempt: true, passer: 'qb' }), { off: 'home' });
    expect(g.ballOn).toBe(25);
    expect(g.down).toBe(2);
    expect(g.clockRunning).toBe(false);
    expect(g.stats.qb.passAtt).toBe(1);
  });

  it('out of bounds stops the clock', () => {
    const g = scrimmageState();
    applyScrimmage(g, outcome({ type: 'oob', spotX: 31, clockStops: true }), { off: 'home' });
    expect(g.clockRunning).toBe(false);
    expect(g.ballOn).toBe(31);
  });

  it('formats yard lines from the offense perspective', () => {
    expect(yardLineText(25, 'RIV', 'BW')).toBe('RIV 25');
    expect(yardLineText(70, 'RIV', 'BW')).toBe('BW 30');
    expect(yardLineText(50, 'RIV', 'BW')).toBe('50');
  });
});

describe('scoring', () => {
  it('touchdown gives 6 and moves to the try', () => {
    const g = scrimmageState();
    const ev = applyScrimmage(g, outcome({ type: 'td', spotX: 100, scoringTeam: 'O', clockStops: true, rusher: 'rb', rushYds: 75 }), { off: 'home' });
    expect(g.score.home).toBe(6);
    expect(g.phase).toBe('pat');
    expect(ev[0].type).toBe('touchdown');
    expect(g.stats.rb.rushTD).toBe(1);
  });

  it('extra point and two-point conversion', () => {
    const g = scrimmageState();
    g.score.home = 6;
    g.phase = 'pat';
    applyPat(g, 'kick', true, 'k');
    expect(g.score.home).toBe(7);
    expect(g.phase).toBe('kickoff');
    expect(g.possession).toBe('away'); // receiving team
    expect(g.stats.k.xpm).toBe(1);
    g.phase = 'pat';
    g.possession = 'home';
    applyPat(g, 'two', true);
    expect(g.score.home).toBe(9);
  });

  it('field goal good gives 3 and a kickoff; miss gives the defense the ball', () => {
    const g = scrimmageState();
    g.ballOn = 75;
    applyFieldGoal(g, true, 42, 'k');
    expect(g.score.home).toBe(3);
    expect(g.phase).toBe('kickoff');
    expect(g.stats.k.fgLong).toBe(42);
    const g2 = scrimmageState();
    g2.ballOn = 70;
    applyFieldGoal(g2, false, 47, 'k');
    expect(g2.possession).toBe('away');
    expect(g2.ballOn).toBe(30);
    expect(g2.phase).toBe('scrimmage');
  });

  it('safety gives 2 and a free kick from the 20', () => {
    const g = scrimmageState();
    g.ballOn = 3;
    const ev = applyScrimmage(g, outcome({ type: 'safety', spotX: 0, scoringTeam: 'D', clockStops: true, sack: true }), { off: 'home' });
    expect(ev[0].type).toBe('safety');
    expect(g.score.away).toBe(2);
    expect(g.phase).toBe('kickoff');
    expect(g.kickFrom).toBe(20);
    expect(g.possession).toBe('away'); // scoring team receives the free kick
  });

  it('defensive touchdown (pick six) scores for the defense', () => {
    const g = scrimmageState();
    applyScrimmage(g, outcome({ type: 'td', spotX: 0, team: 'D', scoringTeam: 'D', interceptor: 'cb', passer: 'qb', passAttempt: true, clockStops: true }), { off: 'home' });
    expect(g.score.away).toBe(6);
    expect(g.possession).toBe('away');
    expect(g.totals.home.turnovers).toBe(1);
    expect(g.stats.cb.ints).toBe(1);
    expect(g.stats.qb.passInt).toBe(1);
  });
});

describe('turnovers and possession', () => {
  it('interception flips possession at the spot', () => {
    const g = scrimmageState();
    g.ballOn = 40;
    const ev = applyScrimmage(g, outcome({ type: 'tackle', spotX: 55, team: 'D', turnover: true, interceptor: 'cb', passer: 'qb', passAttempt: true, clockStops: true }), { off: 'home' });
    expect(ev.some((e) => e.type === 'turnover')).toBe(true);
    expect(g.possession).toBe('away');
    expect(g.ballOn).toBe(45);
    expect(g.down).toBe(1);
  });

  it('fumble recovered by the defense in its own end zone is a touchback', () => {
    const g = scrimmageState();
    applyScrimmage(g, outcome({ type: 'touchback', spotX: 100, team: 'D', fumbleLost: 'rb', clockStops: true }), { off: 'home' });
    expect(g.possession).toBe('away');
    expect(g.ballOn).toBe(20);
    expect(g.stats.rb.fumLost).toBe(1);
  });

  it('sack loses yardage and credits the defender', () => {
    const g = scrimmageState();
    g.ballOn = 40;
    const ev = applyScrimmage(g, outcome({ type: 'tackle', spotX: 33, sack: true, sacker: 'de', carrierAtEnd: 'qb' }), { off: 'home' });
    expect(g.ballOn).toBe(33);
    expect(g.toGo).toBe(17);
    expect(ev.some((e) => e.type === 'sack')).toBe(true);
    expect(g.stats.de.sacks).toBe(1);
    expect(g.totals.away.sacks).toBe(1);
  });
});

describe('kicks', () => {
  it('kickoff touchback puts the receiving team at the 20', () => {
    const g = newGameState('a', 'b', 300, 'home');
    const ev = applyKick(g, outcome({ kind: 'kickoff', type: 'touchback', spotX: 100, team: 'D' }), 'away');
    expect(ev.some((e) => e.type === 'touchback')).toBe(true);
    expect(g.possession).toBe('home');
    expect(g.ballOn).toBe(20);
    expect(g.phase).toBe('scrimmage');
  });

  it('kickoff return converts the spot to the receiving team frame', () => {
    const g = newGameState('a', 'b', 300, 'home');
    applyKick(g, outcome({ kind: 'kickoff', type: 'tackle', spotX: 72, team: 'D', returner: 'kr', returnYds: 20 }), 'away');
    expect(g.ballOn).toBe(28);
    expect(g.stats.kr.retYds).toBe(20);
  });

  it('onside kick recovered by the kicking team keeps possession', () => {
    const g = newGameState('a', 'b', 300, 'home');
    const ev = applyKick(g, outcome({ kind: 'kickoff', type: 'recovered', spotX: 52, team: 'O' }), 'away');
    expect(ev.some((e) => e.type === 'onside')).toBe(true);
    expect(g.possession).toBe('away');
    expect(g.ballOn).toBe(52);
  });

  it('punt changes possession', () => {
    const g = scrimmageState();
    g.down = 4;
    applyKick(g, outcome({ kind: 'punt', type: 'fair_catch', spotX: 64, team: 'D', kicker: 'p', kickYds: 39 }), 'home');
    expect(g.possession).toBe('away');
    expect(g.ballOn).toBe(36);
    expect(g.stats.p.punts).toBe(1);
  });
});

describe('clock, halftime, end of game, overtime', () => {
  it('runs the clock and detects expiry', () => {
    const g = scrimmageState();
    g.clock = 10;
    expect(runClock(g, 4)).toBe(false);
    expect(g.clock).toBe(6);
    expect(runClock(g, 30)).toBe(true);
    expect(g.clock).toBe(0);
  });

  it('quarter → next quarter keeps possession; halftime sets up the second-half kickoff', () => {
    const g = scrimmageState();
    g.clock = 0;
    advancePeriod(g);
    expect(g.quarter).toBe(2);
    expect(g.clock).toBe(300);
    expect(g.possession).toBe('home');
    g.clock = 0;
    const ev = advancePeriod(g);
    expect(ev[0].type).toBe('halftime');
    expect(g.quarter).toBe(3);
    expect(g.phase).toBe('kickoff');
    expect(g.possession).toBe('away'); // opening receiver was home → away receives second half
    expect(g.timeouts.home).toBe(3);
  });

  it('ends the game when regulation ends with a leader', () => {
    const g = scrimmageState();
    g.quarter = 4;
    g.clock = 0;
    g.score.home = 21;
    g.score.away = 14;
    const ev = advancePeriod(g);
    expect(ev[0].type).toBe('final');
    expect(g.gameOver).toBe(true);
  });

  it('goes to overtime when tied, each team gets the ball at the 10', () => {
    const g = scrimmageState();
    g.quarter = 4;
    g.clock = 0;
    g.score.home = 14;
    g.score.away = 14;
    const ev = advancePeriod(g);
    expect(ev[0].type).toBe('overtime');
    expect(g.ot).not.toBeNull();
    expect(g.ballOn).toBe(90);
    const first = g.possession;
    // First team kicks a field goal → other team gets its turn
    applyFieldGoal(g, true, 27, 'k');
    expect(g.possession).not.toBe(first);
    expect(g.ballOn).toBe(90);
    expect(g.gameOver).toBe(false);
    // Second team turns it over → game over
    applyScrimmage(g, outcome({ type: 'tackle', spotX: 92, team: 'D', interceptor: 'x', passer: 'y', passAttempt: true }), { off: g.possession });
    expect(g.gameOver).toBe(true);
    expect(g.score[first]).toBe(17);
  });

  it('a second overtime starts if still tied', () => {
    const g = scrimmageState();
    g.quarter = 4;
    g.clock = 0;
    g.score.home = 7;
    g.score.away = 7;
    advancePeriod(g);
    applyFieldGoal(g, false, 27, 'k');
    applyFieldGoal(g, false, 27, 'k');
    expect(g.gameOver).toBe(false);
    expect(g.ot!.period).toBe(2);
  });

  it('mercy rule: 35-point lead in the second half runs the clock', () => {
    const g = scrimmageState();
    g.quarter = 3;
    g.score.home = 35;
    applyScrimmage(g, outcome({ type: 'td', spotX: 100, scoringTeam: 'O', clockStops: true }), { off: 'home' });
    expect(g.mercy).toBe(true);
    g.phase = 'scrimmage';
    applyScrimmage(g, outcome({ type: 'oob', spotX: 40, clockStops: true }), { off: 'home' });
    expect(g.clockRunning).toBe(true);
  });
});
