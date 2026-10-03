/** Retro newspaper write-ups generated from real game statistics. */
import type { GameSession } from '../game/GameSession';
import { gameLeaders } from '../components/BoxScore';
import { clockText, other, type Side } from '../game/Rules';
import { isRivalry, rivalryName } from '../data/teams';
import { RNG } from '../game/rng';

export interface StoryContext {
  playoffRound?: string | null;
  championship?: boolean;
  winnerRecord?: string;
  loserRecord?: string;
  upset?: boolean;
  seniorNight?: boolean;
  snappedStreak?: number;
}

const num = (n: number) => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][n] ?? String(n);

export function buildStory(s: GameSession, ctx: StoryContext = {}): { headline: string; body: string[] } | null {
  const g = s.g;
  if (g.score.home === g.score.away) return null;
  const rng = new RNG(g.score.home * 97 + g.score.away * 13 + s.playCount);
  const w: Side = g.score.home > g.score.away ? 'home' : 'away';
  const l = other(w);
  const W = s.team(w).info;
  const L = s.team(l).info;
  const ws = g.score[w];
  const ls = g.score[l];
  const margin = ws - ls;
  const comeback = g.biggestLead[l] >= 10;
  const rival = isRivalry(W.id, L.id);
  const M = W.mascot.toUpperCase();
  const LM = L.mascot.toUpperCase();
  let headline: string;
  if (ctx.championship) headline = `${M} WIN THE LCPS BOWL!`;
  else if (g.ot) headline = rng.pick([`${M} OUTLAST ${LM} IN OVERTIME`, `${W.shortName.toUpperCase()} SURVIVES OT CLASSIC`]);
  else if (ctx.upset) headline = rng.pick([`STUNNER! ${M} UPSET ${LM}`, `${W.shortName.toUpperCase()} SHOCKS ${L.shortName.toUpperCase()}`]);
  else if (comeback) headline = rng.pick([`${M} RALLY PAST ${LM}`, `COMEBACK KIDS: ${W.shortName.toUpperCase()} STORMS BACK`]);
  else if (margin <= 3) headline = rng.pick([`${M} SURVIVE FRIDAY NIGHT THRILLER`, `${M} EDGE ${LM} IN NAIL-BITER`]);
  else if (ls === 0) headline = rng.pick([`${M} BLANK ${LM}`, `SHUTOUT! ${W.shortName.toUpperCase()} DEFENSE DOMINATES`]);
  else if (margin >= 28) headline = rng.pick([`${M} ROLL OVER ${LM}`, `${W.shortName.toUpperCase()} CRUISES IN ROUT`]);
  else if (rival) headline = `${M} CLAIM ${rivalryName(W.id, L.id).toUpperCase()}`;
  else headline = rng.pick([`${M} TOP ${LM}`, `${W.shortName.toUpperCase()} HANDLES ${L.shortName.toUpperCase()}`, `${M} TAKE DOWN ${LM}`]);
  if (ctx.playoffRound && !ctx.championship) headline = `${ctx.playoffRound.toUpperCase()}: ${headline}`;

  const body: string[] = [];
  const where = w === 'home' ? `at ${W.stadium.split(' (')[0]}` : `on the road at ${L.shortName}`;
  let lead = `${W.shortName} defeated ${L.shortName} ${ws}–${ls} ${where}`;
  const last = g.scoring[g.scoring.length - 1];
  const decisive = [...g.scoring].reverse().find((sp) => sp.team === w);
  if (g.ot) lead += ` in ${g.ot.period > 1 ? `${num(g.ot.period)} overtimes` : 'overtime'}.`;
  else if (decisive && decisive.q === 4 && decisive.clock < 120 && margin <= 8) lead += ` after a fourth-quarter ${decisive.points >= 6 ? 'touchdown' : decisive.points === 3 ? 'field goal' : 'score'} with ${clockText(decisive.clock)} remaining.`;
  else if (comeback) lead += `, erasing a ${g.biggestLead[l]}-point deficit.`;
  else lead += '.';
  body.push(lead);
  if (ctx.winnerRecord) body[0] += ` The ${W.mascot} improve to ${ctx.winnerRecord}.`;

  const { top } = gameLeaders(s);
  const qb = top(w, (x) => x.passYds);
  const rb = top(w, (x) => x.rushYds);
  const wr = top(w, (x) => x.recYds);
  const df = top(w, (x) => x.tackles + x.sacks * 2 + x.ints * 4);
  const lines: string[] = [];
  if (qb && qb.s.passYds >= 60) lines.push(`QB ${qb.p.first} ${qb.p.last} threw for ${qb.s.passYds} yards${qb.s.passTD ? ` and ${num(qb.s.passTD)} touchdown${qb.s.passTD > 1 ? 's' : ''}` : ''}.`);
  if (rb && rb.s.rushYds >= 40) lines.push(`${rb.p.pos === 'QB' ? 'QB' : 'RB'} ${rb.p.first} ${rb.p.last} ran for ${rb.s.rushYds} yards on ${rb.s.rushAtt} carries${rb.s.rushTD ? ` with ${num(rb.s.rushTD)} score${rb.s.rushTD > 1 ? 's' : ''}` : ''}.`);
  if (wr && wr.s.recYds >= 50) lines.push(`${wr.p.first} ${wr.p.last} caught ${num(wr.s.rec)} pass${wr.s.rec === 1 ? '' : 'es'} for ${wr.s.recYds} yards.`);
  if (df && (df.s.sacks >= 1 || df.s.ints >= 1 || df.s.tackles >= 6)) {
    const bits = [df.s.tackles >= 1 ? `${Math.round(df.s.tackles)} tackles` : '', df.s.sacks ? `${df.s.sacks} sack${df.s.sacks > 1 ? 's' : ''}` : '', df.s.ints ? `${num(df.s.ints)} interception${df.s.ints > 1 ? 's' : ''}` : ''].filter(Boolean);
    lines.push(`On defense, ${df.p.pos} ${df.p.first} ${df.p.last} led the way with ${bits.join(', ')}.`);
  }
  if (lines.length) body.push(lines.join(' '));
  const lq = top(l, (x) => x.passYds + x.rushYds + x.recYds);
  if (lq) {
    const y = lq.s.passYds + lq.s.rushYds + lq.s.recYds;
    if (y >= 80) body.push(`For ${L.shortName}, ${lq.p.first} ${lq.p.last} totaled ${y} yards in the loss.`);
  }
  if (ctx.snappedStreak && ctx.snappedStreak >= 3) body.push(`The loss snaps a ${ctx.snappedStreak}-game winning streak for ${L.shortName}.`);
  if (ctx.seniorNight) body.push(`It was Senior Night, and the seniors were honored before kickoff.`);
  void last;
  return { headline, body };
}
