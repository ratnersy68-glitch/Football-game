import { NAMES, OFF_SCHEMES, DEF_SCHEMES } from '../data';
import { Rng } from '../core/rng';
import { clamp } from '../core/util';
import type { Coach, CoachRole, DefScheme, OffScheme, TeamInfo } from '../models/types';
import type { IdGen } from './rosterGenerator';

function rating(rng: Rng, base: number, sd = 7): number {
  return clamp(Math.round(rng.normal(base, sd)), 25, 99);
}

export function generateCoach(rng: Rng, nextId: IdGen, team: TeamInfo, role: CoachRole): Coach {
  const base = 45 + team.prestige * 0.35 + (role === 'HC' ? 4 : 0);
  const offScheme: OffScheme = role === 'DC' ? rng.pick(Object.keys(OFF_SCHEMES) as OffScheme[]) : team.offense;
  const defScheme: DefScheme = role === 'OC' ? rng.pick(Object.keys(DEF_SCHEMES) as DefScheme[]) : team.defense;
  const ratings = {
    recruiting: rating(rng, base),
    development: rating(rng, base),
    offense: rating(rng, base + (role === 'OC' ? 6 : role === 'DC' ? -8 : 0)),
    defense: rating(rng, base + (role === 'DC' ? 6 : role === 'OC' ? -8 : 0)),
    gameManagement: rating(rng, base),
    motivation: rating(rng, base),
    scouting: rating(rng, base - 2),
  };
  const age = role === 'HC' ? rng.int(38, 66) : rng.int(32, 62);
  const salary = Math.round((role === 'HC' ? 1.5 + team.prestige * 0.09 : 0.4 + team.prestige * 0.02) * rng.float(0.85, 1.15) * 10) / 10;
  return {
    id: nextId('c'),
    teamId: team.id,
    firstName: rng.pick(NAMES.first),
    lastName: rng.pick(NAMES.last),
    role,
    age,
    ratings,
    offScheme,
    defScheme,
    pipelineStates: team.recruitingStates.slice(0, 2),
    salary,
    contractYears: rng.int(1, 6),
    reputation: clamp(Math.round(base + rng.normal(0, 8)), 20, 99),
    isUser: false,
    careerWins: role === 'HC' ? rng.int(0, Math.max(1, (age - 36) * 7)) : 0,
    careerLosses: role === 'HC' ? rng.int(0, Math.max(1, (age - 36) * 5)) : 0,
  };
}
