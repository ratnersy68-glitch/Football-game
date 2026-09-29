import { describe, expect, it } from 'vitest';
import { CONFERENCES, PLAYOFF_CONFIG, UNIVERSE_TEAMS, logoUrl, TEAMS } from '../src/data';
import { completeWeek, createDynasty } from '../src/simulation/seasonEngine';
import { postseasonGames, winnerOf } from '../src/simulation/postseasonEngine';
import { developPlayer, startNextSeason, startOffseason } from '../src/simulation/offseasonEngine';
import { teamRatings } from '../src/simulation/teamRatings';
import { MemoryBackend, SaveManager, parseDynasty } from '../src/save/saveManager';
import { Rng } from '../src/core/rng';
import type { Dynasty } from '../src/models/types';

function playSeason(d: Dynasty) {
  let guard = 0;
  while (d.phase !== 'seasonComplete' && guard++ < 40) completeWeek(d);
}

describe('postseason', () => {
  const d = createDynasty({ teamId: 'michigan', coachFirstName: 'A', coachLastName: 'B', seed: 77 });
  playSeason(d);
  const games = postseasonGames(d);
  const ps = d.postseason!;

  it('plays a title game in every conference between the top two teams', () => {
    const ccgs = games.filter((g) => g.postseason?.kind === 'ccg');
    expect(ccgs.length).toBe(CONFERENCES.filter((c) => c.playable && c.championshipGame.enabled).length);
    for (const g of ccgs) {
      expect(g.played).toBe(true);
      expect(g.neutralSite).toBeTruthy();
      expect(ps.conferenceChampions[g.postseason!.conference!]).toBe(winnerOf(g));
    }
  });

  it('selects a configurable playoff field with conference champions and unique seeds', () => {
    expect(ps.cfpSeeds.length).toBe(PLAYOFF_CONFIG.teamCount);
    expect(new Set(ps.cfpSeeds.map((s) => s.teamId)).size).toBe(PLAYOFF_CONFIG.teamCount);
    for (const champ of Object.values(ps.conferenceChampions)) expect(ps.cfpSeeds.some((s) => s.teamId === champ)).toBe(true);
    expect(ps.cfpSeeds.map((s) => s.seed)).toEqual(Array.from({ length: PLAYOFF_CONFIG.teamCount }, (_, i) => i + 1));
  });

  it('plays the bracket to a single champion; top seeds get byes', () => {
    const cfp = games.filter((g) => g.postseason?.kind === 'cfp');
    const expected = PLAYOFF_CONFIG.rounds.reduce((a, r) => a + r.games.length, 0);
    expect(cfp.length).toBe(expected);
    expect(cfp.every((g) => g.played)).toBe(true);
    const r1 = cfp.filter((g) => g.postseason!.round === 'R1');
    const byeTeams = ps.cfpSeeds.slice(0, PLAYOFF_CONFIG.byes).map((s) => s.teamId);
    for (const g of r1) expect(byeTeams.includes(g.homeId) || byeTeams.includes(g.awayId)).toBe(false);
    for (const g of r1) expect(g.neutralSite).toBeUndefined(); // campus sites
    const final = cfp.find((g) => g.postseason!.round === 'F')!;
    expect(ps.champion).toBe(winnerOf(final));
    // Nobody plays twice in a round.
    for (const r of PLAYOFF_CONFIG.rounds) {
      const ids = cfp.filter((g) => g.postseason!.round === r.id).flatMap((g) => [g.homeId, g.awayId]);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('bowls pair bowl-eligible teams outside the playoff', () => {
    const bowls = games.filter((g) => g.postseason?.kind === 'bowl');
    expect(bowls.length).toBeGreaterThan(5);
    const field = new Set(ps.cfpSeeds.map((s) => s.teamId));
    const seen = new Set<string>();
    for (const g of bowls) {
      for (const t of [g.homeId, g.awayId]) {
        expect(field.has(t)).toBe(false);
        expect(seen.has(t)).toBe(false);
        seen.add(t);
      }
    }
  });

  it('awards and history are recorded', () => {
    expect(ps.awards.find((a) => a.id === 'heisman')).toBeTruthy();
    expect(ps.awards.find((a) => a.id === 'coy')).toBeTruthy();
    expect(d.history.length).toBe(1);
    expect(d.history[0].champion).toBe(ps.champion);
    const champCoach = d.coaches[d.teams[ps.champion!].coachIds.HC];
    expect(champCoach.natTitles).toBe(1);
  });

  it('offseason graduates seniors, drafts, develops and signs classes, then starts a new season', () => {
    const seniors = Object.values(d.players).filter((p) => p.year === 4).map((p) => p.id);
    const off = startOffseason(d);
    for (const id of seniors) expect(d.players[id]).toBeUndefined();
    expect(off.draft.length).toBe(224);
    expect(off.draft[0].round).toBe(1);
    expect(d.history[0].draft.length).toBeGreaterThan(100);
    for (const t of UNIVERSE_TEAMS) {
      const n = d.teams[t.id].rosterIds.length;
      expect(n).toBeGreaterThanOrEqual(70);
      expect(n).toBeLessThanOrEqual(95);
    }
    const stars = off.classRankings.reduce((a, c) => a + c.five, 0);
    expect(stars).toBe(32);
    startNextSeason(d);
    expect(d.season).toBe(2027);
    expect(d.phase).toBe('regular');
    expect(d.week).toBe(1);
    expect(d.teams.michigan.record.w + d.teams.michigan.record.l).toBe(0);
    expect(d.schedule.filter((g) => g.season === 2027 && !g.postseason).length).toBeGreaterThan(300);
    expect(d.rankings.at(-1)!.week).toBe(0);
  });

  it('a second season plays through too', () => {
    playSeason(d);
    expect(d.history.length).toBe(2);
    expect(d.postseason!.champion).toBeTruthy();
  });
});

describe('player development', () => {
  it('produces breakouts and busts, never exceeding 99', () => {
    const d = createDynasty({ teamId: 'texas', coachFirstName: 'A', coachLastName: 'B', seed: 3 });
    const rng = new Rng(1);
    const deltas: number[] = [];
    for (const p of Object.values(d.players).slice(0, 3000)) {
      if (p.year >= 4) continue;
      deltas.push(developPlayer(rng, p, { coachDev: 70, facilities: 80 }));
      expect(p.overall).toBeLessThanOrEqual(99);
      expect(p.potential).toBeGreaterThanOrEqual(p.overall);
    }
    const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    expect(avg).toBeGreaterThan(0.5);
    expect(avg).toBeLessThan(6);
    expect(deltas.some((x) => x >= 7)).toBe(true);
    expect(deltas.some((x) => x < 0)).toBe(true);
  });
});

describe('multi-season stability', () => {
  it('ratings do not inflate over 4 seasons', () => {
    const d = createDynasty({ teamId: 'iowa', coachFirstName: 'A', coachLastName: 'B', seed: 11 });
    const avgOvr = () => UNIVERSE_TEAMS.reduce((a, t) => a + teamRatings(d.teams[t.id], d.players).overall, 0) / UNIVERSE_TEAMS.length;
    const start = avgOvr();
    for (let i = 0; i < 4; i++) {
      playSeason(d);
      startOffseason(d);
      startNextSeason(d);
    }
    expect(Math.abs(avgOvr() - start)).toBeLessThan(4);
    expect(d.history.length).toBe(4);
  }, 120000);
});

describe('save migration', () => {
  it('upgrades a Milestone 1 save that ended the regular season', async () => {
    const d = createDynasty({ teamId: 'alabama', coachFirstName: 'A', coachLastName: 'B', seed: 5 });
    while (d.phase === 'regular') completeWeek(d);
    // Recreate the v1 shape.
    const v1 = JSON.parse(JSON.stringify(d));
    v1.version = 1;
    v1.phase = 'regularComplete';
    v1.week = 15;
    v1.schedule = v1.schedule.filter((g: { postseason?: unknown }) => !g.postseason);
    delete v1.postseason;
    delete v1.history;
    delete v1.offseason;
    const m = parseDynasty(JSON.stringify(v1));
    expect(m.version).toBe(2);
    expect(m.phase).toBe('ccg');
    expect(m.history).toEqual([]);
    expect(postseasonGames(m).length).toBe(3);
    playSeason(m);
    expect(m.postseason?.champion).toBeTruthy();
    const sm = new SaveManager(new MemoryBackend());
    await sm.save(m, 's', 'x');
    expect((await sm.load('s')).postseason?.champion).toBe(m.postseason?.champion);
  });
});

describe('logos', () => {
  it('every program has an official logo URL', () => {
    for (const t of TEAMS) expect(logoUrl(t.id)).toMatch(/^https:\/\//);
  });
});
