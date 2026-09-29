import { describe, expect, it } from 'vitest';
import { UNIVERSE_TEAMS, SCHEDULE_RULES } from '../src/data';
import { completeWeek, createDynasty, gamesForWeek, simulateGameFully, userGame } from '../src/simulation/seasonEngine';
import { conferenceStandings } from '../src/simulation/standings';
import { MemoryBackend, SaveManager, parseDynasty } from '../src/save/saveManager';
import { autoDepthChart, moveInDepthChart, reconcileDepthChart } from '../src/simulation/depthChart';

describe('dynasty season', () => {
  const d = createDynasty({ teamId: 'ohio_state', coachFirstName: 'Test', coachLastName: 'Coach', seed: 4242 });

  it('creates a world with rosters, coaches and a preseason poll', () => {
    expect(Object.keys(d.teams).length).toBeGreaterThan(100);
    expect(d.teams.ohio_state.rosterIds.length).toBeGreaterThan(80);
    expect(d.coaches[d.userCoachId].isUser).toBe(true);
    expect(d.rankings[0].poll.length).toBe(25);
    expect(new Set(d.rankings[0].poll.map((e) => e.teamId)).size).toBe(25);
  });

  it('same seed creates the same world', () => {
    const d2 = createDynasty({ teamId: 'ohio_state', coachFirstName: 'Test', coachLastName: 'Coach', seed: 4242 });
    expect(d2.schedule.map((g) => g.id)).toEqual(d.schedule.map((g) => g.id));
    expect(Object.values(d2.players).slice(0, 50).map((p) => p.lastName + p.overall)).toEqual(Object.values(d.players).slice(0, 50).map((p) => p.lastName + p.overall));
  });

  it('plays a full regular season', () => {
    const g1 = userGame(d);
    if (g1) simulateGameFully(d, g1);
    while (d.phase === 'regular') completeWeek(d);
    expect(d.week).toBe(SCHEDULE_RULES.regularSeasonWeeks + 1);
    expect(d.schedule.every((g) => g.played)).toBe(true);
    for (const t of UNIVERSE_TEAMS) {
      const r = d.teams[t.id].record;
      expect(r.w + r.l).toBe(SCHEDULE_RULES.gamesPerTeam);
    }
    const totalW = Object.values(d.teams).reduce((a, t) => a + t.record.w, 0);
    const totalL = Object.values(d.teams).reduce((a, t) => a + t.record.l, 0);
    expect(totalW).toBe(totalL);
    expect(d.rankings.length).toBe(SCHEDULE_RULES.regularSeasonWeeks + 1);
    expect(d.news.length).toBeGreaterThan(50);
  });

  it('accumulates season stats into players', () => {
    const qbs = d.teams.ohio_state.depthChart.QB.map((id) => d.players[id]);
    const passYds = qbs.reduce((a, p) => a + (p.seasonStats.passYds ?? 0), 0);
    expect(passYds).toBeGreaterThan(1000);
  });

  it('heals injuries over time', () => {
    for (const p of Object.values(d.players)) if (p.injury) expect(p.injury.weeksRemaining).toBeGreaterThan(0);
  });

  it('builds conference standings with every member', () => {
    const rows = conferenceStandings(d, 'big_ten');
    expect(rows.length).toBe(18);
    for (let i = 1; i < rows.length; i++) {
      const pa = rows[i - 1].confW / Math.max(1, rows[i - 1].confW + rows[i - 1].confL);
      const pb = rows[i].confW / Math.max(1, rows[i].confW + rows[i].confL);
      expect(pa).toBeGreaterThanOrEqual(pb);
    }
  });

  it('does not double-play a week', () => {
    const before = d.teams.ohio_state.record.w + d.teams.ohio_state.record.l;
    completeWeek(d);
    expect(d.teams.ohio_state.record.w + d.teams.ohio_state.record.l).toBe(before);
    expect(gamesForWeek(d, 1).every((g) => g.played)).toBe(true);
  });

  it('saves and loads losslessly', async () => {
    const sm = new SaveManager(new MemoryBackend());
    await sm.save(d, 'slot1', 'Test Save');
    const list = await sm.list();
    expect(list[0].name).toBe('Test Save');
    const loaded = await sm.load('slot1');
    expect(JSON.stringify(loaded)).toBe(JSON.stringify(d));
    await sm.autosave(d);
    expect((await sm.list()).length).toBe(2);
    await sm.remove('slot1');
    expect((await sm.list()).length).toBe(1);
    expect(() => parseDynasty('{"nope":1}')).toThrow();
  });
});

describe('depth chart', () => {
  const d = createDynasty({ teamId: 'texas', coachFirstName: 'A', coachLastName: 'B', seed: 1 });
  const roster = d.teams.texas.rosterIds.map((id) => d.players[id]);
  it('auto depth chart sorts by overall and covers the roster', () => {
    const dc = autoDepthChart(roster);
    const qbs = dc.QB.map((id) => d.players[id].overall);
    expect([...qbs].sort((a, b) => b - a)).toEqual(qbs);
    expect(Object.values(dc).flat().length).toBe(roster.length);
  });
  it('moves players and keeps manual order when reconciling', () => {
    const dc = autoDepthChart(roster);
    const moved = moveInDepthChart(dc, 'QB', 2, 0);
    expect(moved.QB[0]).toBe(dc.QB[2]);
    const rec = reconcileDepthChart(moved, roster);
    expect(rec.QB).toEqual(moved.QB);
  });
});
