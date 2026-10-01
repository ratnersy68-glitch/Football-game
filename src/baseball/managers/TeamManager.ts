/**
 * TeamManager: builds the 30 Team objects (with expanded rosters), computes team attributes,
 * and produces default lineups / starting pitchers.
 */
import type { LineupSlot, Player, Team, TeamAttributes, TeamSetup } from '../core/types';
import { TEAM_META } from '../data/teams';
import { buildRoster } from './RosterManager';

export const TEAMS: Team[] = TEAM_META.map((m) => ({
  id: m.id,
  city: m.city,
  name: m.name,
  league: m.league,
  division: m.division,
  colors: m.colors,
  stadiumId: m.stadiumId,
  roster: buildRoster(m.id, m.roster),
}));

export const TEAM_BY_ID: Record<string, Team> = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

const PLAYER_INDEX = new Map<string, Player>();
for (const t of TEAMS) for (const p of t.roster) PLAYER_INDEX.set(p.id, p);

export function playerById(id: string): Player {
  const p = PLAYER_INDEX.get(id);
  if (!p) throw new Error(`Unknown player ${id}`);
  return p;
}

export const teamName = (t: Team) => `${t.city} ${t.name}`;

export function hitters(team: Team): Player[] {
  return team.roster.filter((p) => p.pos !== 'P');
}
export function pitchers(team: Team): Player[] {
  return team.roster.filter((p) => !!p.pitcher);
}
export function starters(team: Team): Player[] {
  return pitchers(team).filter((p) => p.pitcher!.role === 'SP');
}
export function relievers(team: Team): Player[] {
  return pitchers(team).filter((p) => p.pitcher!.role !== 'SP');
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function teamAttributes(team: Team): TeamAttributes {
  const lineup = defaultLineup(team).map((s) => playerById(s.playerId));
  const contact = avg(lineup.map((p) => (p.ratings.contactR + p.ratings.contactL) / 2));
  const power = avg(lineup.map((p) => (p.ratings.powerR + p.ratings.powerL) / 2));
  const speed = avg(lineup.map((p) => p.ratings.speed));
  const defense = avg(lineup.filter((_, i) => defaultLineup(team)[i].pos !== 'DH').map((p) => (p.ratings.fielding * 2 + p.ratings.arm) / 3));
  const pitchScore = (p: Player) => {
    const r = p.pitcher!;
    return (r.control + r.break + (r.velocity - 80) * 3.2) / 3;
  };
  const starting = avg(starters(team).map(pitchScore));
  const bullpen = avg(relievers(team).map(pitchScore));
  const norm = (v: number, lo: number, hi: number) => Math.round(Math.max(40, Math.min(99, 40 + ((v - lo) / (hi - lo)) * 59)));
  const out = {
    contact: norm(contact, 55, 76),
    power: norm(power, 50, 76),
    speed: norm(speed, 42, 70),
    defense: norm(defense, 58, 80),
    starting: norm(starting, 60, 80),
    bullpen: norm(bullpen, 62, 80),
    overall: 0,
  };
  out.overall = Math.round((out.contact + out.power + out.speed * 0.5 + out.defense * 0.8 + out.starting * 1.2 + out.bullpen * 0.6) / 5.1);
  return out;
}

/** The first nine hitter rows in the data are the default batting order. */
export function defaultLineup(team: Team): LineupSlot[] {
  return hitters(team).slice(0, 9).map((p) => ({ playerId: p.id, pos: p.pos }));
}

export function defaultSetup(team: Team, rotationIndex = 0): TeamSetup {
  const sps = starters(team);
  return {
    teamId: team.id,
    lineup: defaultLineup(team),
    startingPitcherId: sps[rotationIndex % sps.length].id,
  };
}
