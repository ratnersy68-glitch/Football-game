/**
 * Rankings: an Elo power rating updated after every game, and an AP-style poll that blends Elo with
 * record, strength of schedule, quality wins and bad losses, plus week-to-week inertia.
 * Tunables in data/rankingConfig.json.
 */
import { CONFERENCE_BY_ID, RANKING_CONFIG, TEAM_BY_ID } from '../data';
import { clamp } from '../core/util';
import type { Dynasty, Game, Player, RankingEntry, RankingWeek, TeamState } from '../models/types';
import { teamRatings } from './teamRatings';

const cfg = RANKING_CONFIG;

export function initialElo(team: TeamState, players: Record<string, Player>): number {
  const r = teamRatings(team, players).overall;
  const prestige = TEAM_BY_ID[team.id]?.prestige ?? 50;
  return cfg.elo.base + (r - 78) * cfg.elo.rosterScale + (prestige - 70) * cfg.elo.prestigeScale;
}

export function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

/** Update both teams' Elo after a played game (margin-of-victory adjusted, capped). */
export function updateElo(home: TeamState, away: TeamState, game: Game): void {
  const r = game.result!;
  const hfa = game.neutralSite ? 0 : cfg.elo.homeAdvantage;
  const exp = expectedScore(home.elo + hfa, away.elo);
  const homeWon = r.homeScore > r.awayScore ? 1 : 0;
  const mov = Math.min(Math.abs(r.homeScore - r.awayScore), cfg.elo.movCap);
  const winnerDiff = homeWon ? home.elo + hfa - away.elo : away.elo - home.elo - hfa;
  const mult = Math.log(mov + 1) * (2.2 / (winnerDiff * 0.001 + 2.2));
  const delta = cfg.elo.k * mult * (homeWon - exp);
  home.elo += delta;
  away.elo -= delta;
}

export function isRankable(teamId: string): boolean {
  const t = TEAM_BY_ID[teamId];
  return !!t && !!CONFERENCE_BY_ID[t.conference]?.ranked;
}

/** Compute the poll after `week` games have been played. */
export function computePoll(d: Dynasty, week: number): RankingWeek {
  const prev = d.rankings[d.rankings.length - 1];
  const prevRank = new Map<string, number>(prev?.poll.map((e) => [e.teamId, e.rank]) ?? []);
  const played = d.schedule.filter((g) => g.played && g.season === d.season);
  const scores: { teamId: string; score: number }[] = [];
  for (const team of Object.values(d.teams)) {
    if (!isRankable(team.id)) continue;
    const games = played.filter((g) => g.homeId === team.id || g.awayId === team.id);
    let score = team.elo;
    let qualityWins = 0;
    let badLosses = 0;
    let oppElo = 0;
    for (const g of games) {
      const oppId = g.homeId === team.id ? g.awayId : g.homeId;
      const opp = d.teams[oppId];
      oppElo += opp?.elo ?? cfg.elo.base;
      const won = (g.homeId === team.id ? g.result!.homeScore > g.result!.awayScore : g.result!.awayScore > g.result!.homeScore);
      const oppRank = prevRank.get(oppId) ?? 0;
      if (won && oppRank > 0 && oppRank <= cfg.poll.rankedCutoff) qualityWins += 1 + (26 - oppRank) / 25;
      if (!won && (opp?.elo ?? 1500) < 1450) badLosses++;
    }
    const sos = games.length ? oppElo / games.length - cfg.elo.base : 0;
    score += cfg.poll.winBonus * team.record.w - cfg.poll.lossPenalty * team.record.l;
    score += cfg.poll.sosWeight * sos + cfg.poll.qualityWinBonus * qualityWins - cfg.poll.badLossPenalty * badLosses;
    if (team.pollScore && week > 0) score = (1 - cfg.poll.inertia) * score + cfg.poll.inertia * team.pollScore;
    team.pollScore = score;
    scores.push({ teamId: team.id, score });
  }
  scores.sort((a, b) => b.score - a.score);
  const poll: RankingEntry[] = scores.slice(0, cfg.pollSize).map((s, i) => ({
    teamId: s.teamId,
    rank: i + 1,
    score: Math.round(s.score),
    previousRank: prevRank.get(s.teamId) ?? 0,
    w: d.teams[s.teamId].record.w,
    l: d.teams[s.teamId].record.l,
  }));
  return { season: d.season, week, poll };
}

export function currentRank(d: Dynasty, teamId: string): number {
  const last = d.rankings[d.rankings.length - 1];
  return last?.poll.find((e) => e.teamId === teamId)?.rank ?? 0;
}

/** Win probability estimate for previews (Elo-based). */
export function winProbability(d: Dynasty, homeId: string, awayId: string, neutral: boolean): number {
  const h = d.teams[homeId]?.elo ?? 1500;
  const a = d.teams[awayId]?.elo ?? 1500;
  return clamp(expectedScore(h + (neutral ? 0 : cfg.elo.homeAdvantage), a), 0.01, 0.99);
}
