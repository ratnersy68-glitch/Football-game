/**
 * Development — XP, level-ups and attribute upgrades during the season; offseason growth,
 * graduation and incoming freshmen ("Program Development" instead of college recruiting).
 */
import type { AttrKey, Grade, PlayerData, Position, StatLine } from '../game/types';
import { emptyStats } from '../game/types';
import { RNG } from '../game/rng';
import { POS_KEY_ATTRS, ROSTER_TEMPLATE, generatePlayer, overall, ovr, fullName } from '../game/players';
import type { Program, UpgradeKey } from './types';

export const xpForLevel = (level: number) => 120 + level * 45;

export function gameXp(s: StatLine, starter: boolean): number {
  let xp = starter ? 35 : 12;
  xp += s.passYds / 12 + s.passTD * 15 - s.passInt * 6;
  xp += s.rushYds / 6 + s.rushTD * 15;
  xp += s.recYds / 6 + s.recTD * 15 + s.rec * 2;
  xp += s.tackles * 4 + s.sacks * 15 + s.ints * 20 + s.ff * 12 + s.pd * 6;
  xp += s.fgm * 8 + s.xpm * 2 + s.retTD * 15;
  return Math.max(0, Math.round(xp));
}

/** Adds XP; returns number of new level-ups. */
export function addXp(p: PlayerData, xp: number): number {
  p.xp += xp;
  let ups = 0;
  while (p.xp >= xpForLevel(p.level)) {
    p.xp -= xpForLevel(p.level);
    p.level++;
    p.pendingUpgrades++;
    ups++;
  }
  return ups;
}

/** Spend one upgrade point on an attribute. Potential caps growth: past it, upgrades are smaller. */
export function spendUpgrade(p: PlayerData, attr: AttrKey): boolean {
  if (p.pendingUpgrades <= 0) return false;
  const cur = p.attrs[attr];
  if (cur >= 99) return false;
  const atCap = ovr(p) >= p.potential;
  p.attrs[attr] = Math.min(99, cur + (atCap ? 1 : 3));
  p.pendingUpgrades--;
  return true;
}

export function autoSpend(p: PlayerData, rng: RNG) {
  const keys = POS_KEY_ATTRS[p.pos];
  let guard = 20;
  while (p.pendingUpgrades > 0 && guard-- > 0) {
    // Raise the weakest key attribute most of the time.
    const sorted = [...keys].sort((a, b) => p.attrs[a] - p.attrs[b]);
    const k = rng.chance(0.65) ? sorted[0] : rng.pick(keys);
    if (!spendUpgrade(p, k)) break;
  }
}

const fac = (prog: Program, k: UpgradeKey) => prog.facilities[k] ?? 0;

/** Weekly practice XP for the whole roster. */
export function practiceXp(prog: Program, rng: RNG, userTeam: boolean): number {
  let ups = 0;
  for (const p of prog.roster) {
    if (p.injury && p.injury.weeks > 0) continue;
    const base = 18 + fac(prog, 'practice') * 6 + fac(prog, 'coaching') * 3;
    const pot = (p.potential - ovr(p)) / 20;
    ups += addXp(p, Math.round(base * (0.8 + Math.max(0, pot) * 0.6) * rng.range(0.8, 1.2)));
    if (!userTeam) autoSpend(p, rng);
  }
  return ups;
}

/** Offseason growth for returning players. */
export function offseasonGrowth(prog: Program, rng: RNG): { p: PlayerData; from: number; to: number }[] {
  const out: { p: PlayerData; from: number; to: number }[] = [];
  for (const p of prog.roster) {
    const from = ovr(p);
    const gap = Math.max(0, p.potential - from);
    const youth = p.grade <= 10 ? 1.25 : p.grade === 11 ? 1.0 : 0.8;
    let growth = gap * 0.18 * youth + rng.normal(1.5, 1.5) + fac(prog, 'coaching') * 0.25;
    if (rng.chance(0.06 + fac(prog, 'youth') * 0.005)) growth += rng.range(3, 6); // breakout
    if (rng.chance(0.05)) growth -= rng.range(1, 3); // plateau
    growth = Math.max(0, growth);
    const keys = POS_KEY_ATTRS[p.pos];
    for (const k of keys) p.attrs[k] = Math.min(99, Math.round(p.attrs[k] + growth * rng.range(0.7, 1.3)));
    // Weight room: strength & speed
    const wr = fac(prog, 'weightRoom');
    p.attrs.str = Math.min(99, p.attrs.str + Math.round(wr * 0.6 + rng.range(0, 2)));
    p.attrs.spd = Math.min(99, p.attrs.spd + Math.round(wr * 0.3 + rng.range(0, 1)));
    // Film room: awareness
    p.attrs.awr = Math.min(99, p.attrs.awr + Math.round(fac(prog, 'film') * 0.6 + rng.range(0, 2)));
    p.attrs.sta = Math.min(99, p.attrs.sta + rng.int(0, 2));
    // Kids grow
    if (p.grade <= 10) { p.height += rng.chance(0.5) ? 1 : 0; p.weight += rng.int(4, 14); }
    else p.weight += rng.int(0, 8);
    out.push({ p, from, to: ovr(p) });
  }
  return out;
}

/** Freshman talent baseline from the program's pipeline. */
export function pipelineTalent(prog: Program, baseRating: number): number {
  const recent = prog.history.slice(-3);
  const winPct = recent.length ? recent.reduce((a, s) => a + s.wins / Math.max(1, s.wins + s.losses), 0) / recent.length : 0.5;
  return baseRating + (prog.prestige - 3) * 0.8 + (fac(prog, 'youth') - 2) * 0.7 + (fac(prog, 'community') - 2) * 0.3 + (winPct - 0.5) * 3 + Math.min(5, prog.championships.length) * 0.2;
}

export function generateFreshmanClass(prog: Program, baseRating: number, rng: RNG): PlayerData[] {
  const talent = pipelineTalent(prog, baseRating);
  const used = new Set(prog.roster.map((p) => p.number));
  const counts: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0, OL: 0, DL: 0, LB: 0, CB: 0, S: 0, K: 0 };
  for (const p of prog.roster) counts[p.pos]++;
  const out: PlayerData[] = [];
  const participation = 1 + Math.round(fac(prog, 'community') * 0.4 + prog.prestige * 0.3);
  for (const pos of Object.keys(ROSTER_TEMPLATE) as Position[]) {
    let need = ROSTER_TEMPLATE[pos] - counts[pos];
    if (pos !== 'K' && rng.chance(0.25 + participation * 0.05)) need++;
    if (pos === 'K' && counts.K === 0) need = Math.max(need, 1);
    for (let i = 0; i < need; i++) {
      // Some schools get a varsity-ready sophomore move-up instead of a freshman
      const grade: Grade = rng.chance(0.25) ? 10 : 9;
      out.push(generatePlayer({ pos, grade, talent: talent + (grade === 10 ? 2 : 0), rng, usedNumbers: used, potentialBoost: fac(prog, 'youth') * 0.6 - 1 }));
    }
  }
  return out;
}

/** Graduation + grade advancement. Returns graduates. */
export function graduate(prog: Program): PlayerData[] {
  const grads = prog.roster.filter((p) => p.grade >= 12);
  prog.roster = prog.roster.filter((p) => p.grade < 12);
  for (const p of prog.roster) p.grade = (p.grade + 1) as Grade;
  return grads;
}

/** Archive season stats into history and reset. */
export function closeSeasonStats(prog: Program, year: number) {
  for (const p of prog.roster) {
    p.history = p.history ?? [];
    p.history.push({ year, grade: p.grade, ovr: ovr(p), stats: p.season });
    if (p.history.length > 4) p.history.shift();
    p.season = emptyStats();
    p.morale = Math.max(40, Math.min(100, p.morale));
  }
}

export interface TeamRatings { off: number; def: number; st: number; ovr: number }

export function teamRatings(roster: PlayerData[]): TeamRatings {
  const by = (pos: Position, n: number) => roster.filter((p) => p.pos === pos && !(p.injury && p.injury.weeks > 0)).map(ovr).sort((a, b) => b - a).slice(0, n);
  const avg = (xs: number[], n: number) => (xs.length ? xs.reduce((a, b) => a + b, 0) / Math.max(n, 1) : 40) * (xs.length < n ? xs.length / n : 1) + (xs.length < n ? 40 * (1 - xs.length / n) : 0);
  const off = avg(by('QB', 1), 1) * 0.28 + avg(by('RB', 1), 1) * 0.14 + avg(by('WR', 3), 3) * 0.2 + avg(by('TE', 1), 1) * 0.08 + avg(by('OL', 5), 5) * 0.3;
  const def = avg(by('DL', 4), 4) * 0.3 + avg(by('LB', 3), 3) * 0.25 + avg(by('CB', 2), 2) * 0.25 + avg(by('S', 2), 2) * 0.2;
  const st = avg(by('K', 1), 1);
  return { off: Math.round(off), def: Math.round(def), st: Math.round(st), ovr: Math.round(off * 0.46 + def * 0.46 + st * 0.08) };
}

export const describeGrowth = (p: PlayerData, from: number) => `${fullName(p)} (${p.pos}) ${from} → ${ovr(p)}`;
export { overall };
