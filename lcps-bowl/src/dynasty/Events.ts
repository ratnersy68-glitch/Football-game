/** Believable high-school dynamic events that happen during a dynasty week. */
import type { Dynasty, PendingEvent, Program } from './types';
import { RNG } from '../game/rng';
import { ovr, fullName, POS_KEY_ATTRS } from '../game/players';
import { getTeam } from '../data/teams';
import type { PlayerData } from '../game/types';
import { addXp } from './Development';

const INJURIES: [string, number, number][] = [
  ['sprained ankle', 1, 2], ['hamstring strain', 1, 3], ['concussion protocol', 1, 2], ['knee sprain', 2, 4],
  ['shoulder injury', 2, 4], ['broken wrist', 3, 6], ['high ankle sprain', 2, 5], ['torn ACL', 12, 20],
];

export function injurePlayer(prog: Program, p: PlayerData, rng: RNG): string {
  const med = prog.facilities.medicine ?? 0;
  const pick = rng.weighted(INJURIES, INJURIES.map(([, lo]) => (lo >= 12 ? 0.25 : lo >= 3 ? 1 : 3)));
  let weeks = rng.int(pick[1], pick[2]);
  weeks = Math.max(1, Math.round(weeks * (1 - med * 0.08)));
  p.injury = { type: pick[0], weeks };
  return `${pick[0]} (${weeks} wk${weeks > 1 ? 's' : ''})`;
}

/** In-game injury rolls after a game, for both teams. */
export function postGameInjuries(prog: Program, playedIds: Set<string>, rng: RNG): string[] {
  const out: string[] = [];
  const med = prog.facilities.medicine ?? 0;
  for (const p of prog.roster) {
    if (!playedIds.has(p.id) || (p.injury && p.injury.weeks > 0)) continue;
    if (rng.chance(0.012 * (1 - med * 0.1))) out.push(`${fullName(p)} (${p.pos}) — ${injurePlayer(prog, p, rng)}`);
  }
  return out;
}

export function healWeek(prog: Program): string[] {
  const back: string[] = [];
  for (const p of prog.roster) {
    if (p.injury && p.injury.weeks > 0) {
      p.injury.weeks--;
      if (p.injury.weeks <= 0) { back.push(`${fullName(p)} (${p.pos})`); p.injury = undefined; }
    }
  }
  return back;
}

/** Rolls 0-2 events for the user's program before the next game. */
export function rollWeeklyEvents(d: Dynasty, rng: RNG): PendingEvent[] {
  const prog = d.programs[d.userTeam];
  const out: PendingEvent[] = [];
  const team = getTeam(d.userTeam);
  const starters = (pos: string) => prog.roster.filter((p) => p.pos === pos && !(p.injury && p.injury.weeks > 0)).sort((a, b) => ovr(b) - ovr(a));
  const id = () => `${d.year}-${d.week}-${rng.int(0, 1e6)}`;
  if (rng.chance(0.12)) {
    const pos = rng.pick(['RB', 'WR', 'LB', 'QB', 'CB', 'OL', 'DL']);
    const p = starters(pos)[0];
    if (p) out.push({ id: id(), kind: 'injury', text: `INJURY: Star ${p.pos} ${fullName(p)} hurt in practice — ${injurePlayer(prog, p, rng)}.` });
  }
  if (rng.chance(0.08)) {
    const fr = prog.roster.filter((p) => p.grade <= 10).sort((a, b) => b.potential - a.potential)[0];
    if (fr) {
      for (const k of POS_KEY_ATTRS[fr.pos]) fr.attrs[k] = Math.min(99, fr.attrs[k] + rng.int(3, 6));
      out.push({ id: id(), kind: 'breakout', text: `BREAKOUT: ${fr.grade === 9 ? 'Freshman' : 'Sophomore'} ${fr.pos} ${fullName(fr)} is turning heads in practice (now ${ovr(fr)} OVR).` });
    }
  }
  const qbs = starters('QB');
  if (qbs.length >= 2 && ovr(qbs[0]) - ovr(qbs[1]) <= 3 && rng.chance(0.15)) {
    addXp(qbs[1], 80);
    out.push({ id: id(), kind: 'qb', text: `QB COMPETITION: ${fullName(qbs[1])} is pushing ${fullName(qbs[0])} for the starting job. Check your depth chart.` });
  }
  if (rng.chance(0.1)) {
    const p = rng.pick(prog.roster.filter((x) => !(x.injury && x.injury.weeks > 0)));
    if (p) { const ups = addXp(p, 140); out.push({ id: id(), kind: 'improve', text: `PLAYER IMPROVEMENT: ${fullName(p)} (${p.pos}) had a great week of practice${ups ? ' and leveled up' : ''}.` }); }
  }
  if (rng.chance(0.03) && (prog.facilities.coaching ?? 0) > 0) {
    prog.facilities.coaching--;
    out.push({ id: id(), kind: 'coach', text: `STAFF CHANGE: An assistant coach left for a college job. Coaching Staff drops to level ${prog.facilities.coaching}.` });
  }
  if (rng.chance(0.05)) {
    const pts = rng.int(4, 10);
    prog.points += pts;
    out.push({ id: id(), kind: 'facility', text: `BOOSTER CLUB: The ${team.mascot} boosters raised money for the program (+${pts} Program Points).` });
  }
  const injuredSenior = prog.roster.find((p) => p.grade === 12 && p.injury && p.injury.weeks > 0 && p.injury.weeks <= 2);
  if (injuredSenior && rng.chance(0.3)) {
    injuredSenior.injury = undefined;
    out.push({ id: id(), kind: 'return', text: `GOOD NEWS: Senior ${injuredSenior.pos} ${fullName(injuredSenior)} has been cleared to return early!` });
  }
  return out;
}
