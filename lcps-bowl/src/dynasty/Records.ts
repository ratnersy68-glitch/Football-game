/** All-time record book (league-wide), persisted across dynasty seasons. */
import type { Dynasty, RecordBook, RecordEntry } from './types';
import type { PlayerData, StatLine } from '../game/types';
import { fullName } from '../game/players';

export const IND_CATS: { key: string; label: string; f: (s: StatLine) => number }[] = [
  { key: 'passYds', label: 'Passing Yards', f: (s) => s.passYds },
  { key: 'passTD', label: 'Passing TDs', f: (s) => s.passTD },
  { key: 'rushYds', label: 'Rushing Yards', f: (s) => s.rushYds },
  { key: 'recYds', label: 'Receiving Yards', f: (s) => s.recYds },
  { key: 'tds', label: 'Total Touchdowns', f: (s) => s.passTD + s.rushTD + s.recTD + s.retTD },
  { key: 'tackles', label: 'Tackles', f: (s) => Math.round(s.tackles) },
  { key: 'sacks', label: 'Sacks', f: (s) => s.sacks },
  { key: 'ints', label: 'Interceptions', f: (s) => s.ints },
  { key: 'fgLong', label: 'Longest Field Goal', f: (s) => s.fgLong },
];

export const TEAM_CATS: { key: string; label: string }[] = [
  { key: 'wins', label: 'Most Wins (Season)' },
  { key: 'streak', label: 'Longest Winning Streak' },
  { key: 'points', label: 'Highest Scoring Game' },
  { key: 'margin', label: 'Biggest Victory' },
  { key: 'titles', label: 'LCPS Bowl Championships' },
];

export function emptyRecordBook(): RecordBook {
  return { career: {}, season: {}, game: {}, team: {} };
}

const KEEP = 10;

export function addRecord(list: RecordEntry[] | undefined, e: RecordEntry, uniqueBy?: (x: RecordEntry) => string): RecordEntry[] {
  let l = list ? [...list] : [];
  if (e.value <= 0) return l;
  if (uniqueBy) {
    const k = uniqueBy(e);
    const ex = l.find((x) => uniqueBy(x) === k);
    if (ex) {
      if (ex.value >= e.value) return l;
      l = l.filter((x) => x !== ex);
    }
  }
  l.push(e);
  l.sort((a, b) => b.value - a.value);
  return l.slice(0, KEEP);
}

export function recordGameStats(d: Dynasty, team: string, p: PlayerData, s: StatLine, detail: string) {
  for (const c of IND_CATS) {
    const v = c.f(s);
    if (v > 0) d.records.game[c.key] = addRecord(d.records.game[c.key], { value: v, player: fullName(p), playerId: p.id, team, year: d.year, detail });
  }
}

export function recordSeasonStats(d: Dynasty, team: string, p: PlayerData) {
  for (const c of IND_CATS) {
    const v = c.f(p.season);
    if (v > 0) d.records.season[c.key] = addRecord(d.records.season[c.key], { value: v, player: fullName(p), playerId: p.id, team, year: d.year }, (x) => `${x.playerId}-${x.year}`);
    const cv = c.f(p.career);
    if (cv > 0) d.records.career[c.key] = addRecord(d.records.career[c.key], { value: cv, player: fullName(p), playerId: p.id, team, year: d.year }, (x) => x.playerId ?? x.player ?? '');
  }
}

export function recordTeamGame(d: Dynasty, team: string, us: number, them: number, opp: string) {
  d.records.team.points = addRecord(d.records.team.points, { value: us, team, year: d.year, detail: `vs ${opp} (${us}–${them})` });
  if (us > them) d.records.team.margin = addRecord(d.records.team.margin, { value: us - them, team, year: d.year, detail: `${us}–${them} vs ${opp}` });
}

export function recordTeamSeason(d: Dynasty, team: string, wins: number, bestStreak: number, titles: number) {
  d.records.team.wins = addRecord(d.records.team.wins, { value: wins, team, year: d.year }, (x) => `${x.team}-${x.year}`);
  d.records.team.streak = addRecord(d.records.team.streak, { value: bestStreak, team, year: d.year }, (x) => `${x.team}`);
  d.records.team.titles = addRecord(d.records.team.titles, { value: titles, team, year: d.year }, (x) => x.team);
}
