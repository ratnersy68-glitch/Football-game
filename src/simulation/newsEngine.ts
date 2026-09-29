/**
 * College football news feed generated from actual simulation events (results, upsets, big games,
 * rivalry outcomes, injuries, ranking changes).
 */
import { RIVALRIES, TEAM_BY_ID } from '../data';
import type { Dynasty, Game, NewsItem, RankingWeek } from '../models/types';

function school(id: string): string {
  return TEAM_BY_ID[id]?.school ?? id;
}

function ranked(id: string, rank?: number): string {
  return rank ? `#${rank} ${school(id)}` : school(id);
}

function verb(margin: number, ot: number): string {
  if (ot) return ot > 1 ? `outlasts` : 'edges';
  if (margin <= 3) return 'survives';
  if (margin <= 8) return 'holds off';
  if (margin >= 28) return 'routs';
  if (margin >= 17) return 'rolls past';
  return 'beats';
}

export function gameNews(d: Dynasty, g: Game, nextId: () => string): NewsItem[] {
  const out: NewsItem[] = [];
  const r = g.result!;
  const homeWon = r.homeScore > r.awayScore;
  const w = homeWon ? g.homeId : g.awayId;
  const l = homeWon ? g.awayId : g.homeId;
  const wr = homeWon ? g.homeRank : g.awayRank;
  const lr = homeWon ? g.awayRank : g.homeRank;
  const ws = Math.max(r.homeScore, r.awayScore);
  const ls = Math.min(r.homeScore, r.awayScore);
  const otTxt = r.overtimePeriods ? ` in ${r.overtimePeriods > 1 ? r.overtimePeriods : ''}OT` : '';
  const involvesUser = g.homeId === d.userTeamId || g.awayId === d.userTeamId;
  const base = { season: d.season, week: g.week, teamIds: [g.homeId, g.awayId] };
  const rivalry = g.rivalryId ? RIVALRIES.find((x) => x.id === g.rivalryId) : undefined;

  const upset = !!lr && (!wr || wr - lr >= 8);
  if (upset) {
    out.push({
      ...base,
      id: nextId(),
      type: 'upset',
      headline: `UPSET: ${wr ? ranked(w, wr) : `Unranked ${school(w)}`} stuns ${ranked(l, lr)}, ${ws}-${ls}${otTxt}`,
      importance: 90 - (lr ?? 25),
    });
  } else if (rivalry) {
    out.push({
      ...base,
      id: nextId(),
      type: 'rivalry',
      headline: `${ranked(w, wr)} wins ${rivalry.name}, ${ws}-${ls}${otTxt}`,
      importance: 40 + rivalry.intensity / 3 + (involvesUser ? 30 : 0),
    });
  } else if (wr || lr || involvesUser) {
    out.push({
      ...base,
      id: nextId(),
      type: 'result',
      headline: `${ranked(w, wr)} ${verb(ws - ls, r.overtimePeriods)} ${ranked(l, lr)}, ${ws}-${ls}${otTxt}`,
      importance: (involvesUser ? 60 : 20) + (wr && wr <= 10 ? 15 : 0) + (lr && lr <= 10 ? 15 : 0),
    });
  } else if (r.overtimePeriods >= 2) {
    out.push({ ...base, id: nextId(), type: 'result', headline: `${school(w)} outlasts ${school(l)} in ${r.overtimePeriods}OT thriller, ${ws}-${ls}`, importance: 35 });
  }

  // Standout individual performances.
  for (const line of r.playerLines) {
    const p = d.players[line.playerId];
    if (!p) continue;
    const name = `${p.firstName} ${p.lastName}`;
    const team = school(line.teamId);
    let headline: string | undefined;
    if ((line.passYds ?? 0) >= 400 || (line.passTD ?? 0) >= 5) headline = `${team} QB ${name} throws for ${line.passYds} yards and ${line.passTD} TD`;
    else if ((line.rushYds ?? 0) >= 180) headline = `${team} RB ${name} runs wild for ${line.rushYds} yards`;
    else if ((line.recYds ?? 0) >= 170) headline = `${team}'s ${name} torches defense for ${line.recYds} receiving yards`;
    else if ((line.sacks ?? 0) >= 3) headline = `${team}'s ${name} wreaks havoc with ${line.sacks} sacks`;
    else if ((line.defInt ?? 0) >= 2) headline = `${team}'s ${name} picks off ${line.defInt} passes`;
    if (headline) out.push({ ...base, id: nextId(), type: 'performance', headline, teamIds: [line.teamId], importance: 30 + (line.teamId === d.userTeamId ? 25 : 0) });
  }

  // Significant injuries to starters.
  for (const inj of r.injuries) {
    const p = d.players[inj.playerId];
    if (!p) continue;
    const starter = d.teams[inj.teamId]?.depthChart[p.position]?.indexOf(p.id) === 0;
    if (!starter && inj.teamId !== d.userTeamId) continue;
    if (inj.weeks < 2 && inj.teamId !== d.userTeamId) continue;
    const duration = inj.weeks >= 10 ? 'for the season' : `for ${inj.weeks} week${inj.weeks === 1 ? '' : 's'}`;
    out.push({
      ...base,
      id: nextId(),
      type: 'injury',
      headline: `${school(inj.teamId)} loses ${starter ? 'starting ' : ''}${p.position} ${p.firstName} ${p.lastName} ${duration} (${inj.type.toLowerCase()})`,
      teamIds: [inj.teamId],
      importance: (inj.teamId === d.userTeamId ? 55 : 25) + Math.min(inj.weeks, 12),
    });
  }
  return out;
}

export function rankingNews(d: Dynasty, poll: RankingWeek, prev: RankingWeek | undefined, nextId: () => string): NewsItem[] {
  const out: NewsItem[] = [];
  const top = poll.poll[0];
  if (!top) return out;
  const prevTop = prev?.poll[0];
  if (prev && prevTop && prevTop.teamId !== top.teamId) {
    out.push({
      id: nextId(),
      season: d.season,
      week: poll.week,
      type: 'ranking',
      headline: `${school(top.teamId)} (${top.w}-${top.l}) takes over #1 in the Top 25`,
      teamIds: [top.teamId],
      importance: 70,
    });
  }
  for (const e of poll.poll) {
    if (e.previousRank && e.previousRank - e.rank >= 7) {
      out.push({ id: nextId(), season: d.season, week: poll.week, type: 'ranking', headline: `${school(e.teamId)} jumps to #${e.rank}`, teamIds: [e.teamId], importance: 30 });
    }
    if (e.teamId === d.userTeamId && !e.previousRank && prev) {
      out.push({ id: nextId(), season: d.season, week: poll.week, type: 'ranking', headline: `${school(e.teamId)} enters the Top 25 at #${e.rank}`, teamIds: [e.teamId], importance: 60 });
    }
  }
  return out;
}
