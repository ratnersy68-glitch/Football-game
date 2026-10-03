/**
 * Schedule — 10-week high school schedules: full district round-robins, rivalry games
 * (rivalry week = week 10 when possible), non-district fill and out-of-county opponents
 * (17 LCPS teams is an odd number; Independence plays its Cedar Run district games vs. guests).
 */
import { LCPS_TEAMS, GUEST_TEAMS, isRivalry, regionOf, getTeam } from '../data/teams';
import { RNG } from '../game/rng';
import type { Weather } from '../game/types';
import type { GameRecord } from './types';

export const WEEKS = 10;
const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export function weatherForWeek(week: number, rng: RNG): Weather {
  // Late August → mid November in Northern Virginia
  if (week <= 3) return rng.weighted<Weather>(['clear', 'rain', 'wind'], [8, 1.2, 0.6]);
  if (week <= 7) return rng.weighted<Weather>(['clear', 'rain', 'wind', 'cold'], [6, 1.5, 1, 1]);
  if (week <= 10) return rng.weighted<Weather>(['clear', 'cold', 'rain', 'wind'], [3, 3.5, 1.5, 1]);
  return rng.weighted<Weather>(['cold', 'clear', 'rain', 'snow', 'wind'], [4, 2, 1.2, 0.8, 1]);
}

export function generateSchedule(year: number, rng: RNG): GameRecord[] {
  const teams = LCPS_TEAMS.map((t) => t.id);
  const district = (id: string) => getTeam(id).district;
  const required = new Set<string>();
  for (let i = 0; i < teams.length; i++) for (let j = i + 1; j < teams.length; j++) {
    const a = teams[i];
    const b = teams[j];
    if (district(a) === district(b)) required.add(pairKey(a, b));
    if (isRivalry(a, b)) required.add(pairKey(a, b));
  }
  const guestPool = GUEST_TEAMS.map((g) => g.id);
  const cedarRun = ['battlefield', 'patriot', 'gainesville', 'osbourn-park'];

  for (let attempt = 0; attempt < 4000; attempt++) {
    const played = new Set<string>();
    const games: GameRecord[] = [];
    const count: Record<string, number> = Object.fromEntries(teams.map((t) => [t, 0]));
    const homeCount: Record<string, number> = Object.fromEntries(teams.map((t) => [t, 0]));
    const guestGames: Record<string, number> = Object.fromEntries(teams.map((t) => [t, 0]));
    const usedGuests: Record<string, Set<string>> = Object.fromEntries(teams.map((t) => [t, new Set<string>()]));
    // Reserve a disjoint set of rivalry games for the final week ("Rivalry Week").
    const reserved = new Set<string>();
    const inReserve = new Set<string>();
    for (const k of rng.shuffle([...required])) {
      const [a, b] = k.split('|');
      if (!isRivalry(a, b) || inReserve.has(a) || inReserve.has(b)) continue;
      reserved.add(k);
      inReserve.add(a);
      inReserve.add(b);
    }
    let ok = true;
    for (let week = 1; week <= WEEKS && ok; week++) {
      const free = new Set(teams);
      // Rivalry week: try to place remaining rivalry pairs first.
      const order = rng.shuffle([...teams]).sort((a, b) => remainingRequired(b) - remainingRequired(a));
      function remainingRequired(t: string) {
        let n = 0;
        for (const k of required) if (!played.has(k) && k.split('|').includes(t)) n++;
        return n;
      }
      const weeksLeft = WEEKS - week + 1;
      const guestsThisWeek = new Set<string>();
      if (week === WEEKS) {
        // Rivalry week: the reserved rivalry games.
        for (const k of reserved) {
          if (played.has(k)) continue;
          const [a, b] = k.split('|');
          if (!free.has(a) || !free.has(b)) continue;
          free.delete(a);
          free.delete(b);
          played.add(k);
          const [home, away] = homeCount[a] <= homeCount[b] ? [a, b] : [b, a];
          homeCount[home]++;
          count[a]++;
          count[b]++;
          games.push(mkGame(year, week, home, away, rng));
        }
      }
      for (const t of order) {
        if (!free.has(t)) continue;
        // Candidate opponents
        const req: string[] = [];
        const other: string[] = [];
        for (const u of free) {
          if (u === t) continue;
          const k = pairKey(t, u);
          if (played.has(k)) continue;
          if (week < WEEKS && reserved.has(k)) continue;
          if (required.has(k)) req.push(u);
          else other.push(u);
        }
        let opp: string | null = null;
        if (req.length) {
          opp = rng.pick(req);
        } else if (other.length) {
          const sameRegion = other.filter((u) => regionOf(getTeam(u)) === regionOf(getTeam(t)));
          // Teams with required games still pending elsewhere shouldn't be stolen if they need it
          opp = rng.pick(sameRegion.length && rng.chance(0.6) ? sameRegion : other);
        }
        const maxGuest = t === 'independence' ? 4 : 1;
        if (t === 'independence' && guestGames[t] < 4 && (!opp || !required.has(pairKey(t, opp))) && rng.chance(0.55)) opp = null;
        if (opp && remainingRequired(t) > weeksLeft) { ok = false; break; }
        if (opp) {
          free.delete(t);
          free.delete(opp);
          played.add(pairKey(t, opp));
          const [home, away] = homeCount[t] <= homeCount[opp] ? (rng.chance(homeCount[t] < homeCount[opp] ? 0.85 : 0.5) ? [t, opp] : [opp, t]) : [opp, t];
          homeCount[home]++;
          count[t]++;
          count[opp]++;
          games.push(mkGame(year, week, home, away, rng));
        } else {
          if (guestGames[t] >= maxGuest) { ok = false; break; }
          const pool = (t === 'independence' ? cedarRun : guestPool.filter((g) => !cedarRun.includes(g))).filter((g) => !usedGuests[t].has(g) && !guestsThisWeek.has(g));
          const g = rng.pick(pool.length ? pool : guestPool.filter((x) => !guestsThisWeek.has(x)));
          guestsThisWeek.add(g);
          usedGuests[t].add(g);
          guestGames[t]++;
          free.delete(t);
          const home = rng.chance(0.5) ? t : g;
          if (home === t) homeCount[t]++;
          count[t]++;
          games.push(mkGame(year, week, home, home === t ? g : t, rng));
        }
      }
      // Odd number of LCPS teams: at most one should face a guest per week (Independence may add more)
    }
    if (!ok) continue;
    let missing = false;
    for (const k of required) if (!played.has(k)) { missing = true; break; }
    if (missing) continue;
    if (teams.some((t) => count[t] !== WEEKS)) continue;
    if (teams.some((t) => homeCount[t] < 4 || homeCount[t] > 6)) continue;
    return games;
  }
  // Fallback: simple round-robin style (should not happen)
  return fallbackSchedule(year, rng);
}

function mkGame(year: number, week: number, home: string, away: string, rng: RNG): GameRecord {
  const ht = getTeam(home);
  const at = getTeam(away);
  return {
    id: `${year}-w${week}-${home}-${away}`,
    week,
    home,
    away,
    district: ht.district === at.district && ht.district !== 'Non-LCPS',
    rivalry: isRivalry(home, away),
    played: false,
    weather: weatherForWeek(week, rng),
  };
}

function fallbackSchedule(year: number, rng: RNG): GameRecord[] {
  const teams = [...LCPS_TEAMS.map((t) => t.id), 'chantilly'];
  const games: GameRecord[] = [];
  const n = teams.length;
  for (let week = 1; week <= WEEKS; week++) {
    for (let i = 0; i < n / 2; i++) {
      const a = teams[i];
      const b = teams[n - 1 - i];
      games.push(mkGame(year, week, week % 2 ? a : b, week % 2 ? b : a, rng));
    }
    teams.splice(1, 0, teams.pop()!);
  }
  return games;
}
