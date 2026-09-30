import { describe, expect, it } from 'vitest';
import { advance, createTournament, playerMatch, recordResult, simulateOthers } from '../src/modes/Tournament';

describe('tournament bracket', () => {
  it('seeds 8 fighters and crowns a champion', () => {
    const s = createTournament({ size: 8, division: 'LW', playerId: 'dan_hooker', difficulty: 'normal', arenaId: 'vegas', clockSpeed: 2.5 });
    expect(s.bracket[0].length).toBe(4);
    expect(new Set(s.bracket[0].flatMap((m) => [m.a, m.b])).size).toBe(8);
    let guard = 0;
    while (!s.champion && guard++ < 10) {
      const pm = playerMatch(s);
      if (pm) recordResult(s, pm, { winner: 0, method: 'DEC', detail: 'Unanimous Decision', round: 3, time: 300, scorecards: [] }, [s.playerId, pm.a === s.playerId ? pm.b! : pm.a!]);
      simulateOthers(s);
      advance(s);
    }
    expect(s.champion).toBe('dan_hooker');
  });
  it('supports a 16-fighter open-weight bracket', () => {
    const s = createTournament({ size: 16, division: 'OPEN_M', playerId: 'jon_jones', difficulty: 'pro', arenaId: 'vegas', clockSpeed: 2.5 });
    expect(s.bracket.map((r) => r.length)).toEqual([8, 4, 2, 1]);
  });
});
