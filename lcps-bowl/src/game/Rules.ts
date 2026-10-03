/**
 * Rules — game state and football rules (NFHS-flavored), independent of rendering and of the play sim.
 * All functions mutate the GameState passed in and return a list of notable events for presentation.
 */
import type { PlayOutcome } from './PlaySim';
import { type StatLine, emptyStats } from './types';

export type Side = 'home' | 'away';
export const other = (s: Side): Side => (s === 'home' ? 'away' : 'home');

export interface TeamTotals {
  firstDowns: number;
  plays: number;
  totalYds: number;
  passYds: number;
  rushYds: number;
  turnovers: number;
  thirdAtt: number;
  thirdConv: number;
  penalties: number;
  top: number; // time of possession (s)
  sacks: number;
}
export const emptyTotals = (): TeamTotals => ({
  firstDowns: 0, plays: 0, totalYds: 0, passYds: 0, rushYds: 0, turnovers: 0, thirdAtt: 0, thirdConv: 0, penalties: 0, top: 0, sacks: 0,
});

export interface ScoringPlay {
  q: number;
  clock: number;
  team: Side;
  points: number;
  desc: string;
  homeScore: number;
  awayScore: number;
}

export interface LogEntry {
  q: number;
  clock: number;
  team: Side;
  down: number;
  toGo: number;
  ballOn: number;
  desc: string;
}

export type Phase = 'kickoff' | 'scrimmage' | 'pat' | 'final';

export interface GameState {
  home: string;
  away: string;
  score: Record<Side, number>;
  qScores: Record<Side, number[]>;
  quarter: number; // 1-4, 5+ = OT periods
  clock: number; // seconds left in quarter
  quarterLen: number;
  possession: Side;
  ballOn: number; // yards from possessing team's own goal line
  ballY: number;
  down: number;
  toGo: number;
  timeouts: Record<Side, number>;
  phase: Phase;
  kickFrom: number; // free-kick spot (kicking team's frame)
  openingReceiver: Side;
  ot: { period: number; first: Side; poss: number } | null;
  pendingRunoff: number;
  clockRunning: boolean;
  mercy: boolean;
  drive: { team: Side; start: number; plays: number; yards: number; startClock: number; startQ: number };
  stats: Record<string, StatLine>;
  totals: Record<Side, TeamTotals>;
  scoring: ScoringPlay[];
  log: LogEntry[];
  /** Index into scoring list of the last lead change (for stories). */
  leadChanges: number;
  biggestLead: Record<Side, number>;
  lastPlay?: string;
  gameOver: boolean;
  /** true until the first play after a kickoff/turnover for presentation */
  newDrive: boolean;
}

export const RUNOFF = 22; // seconds between snaps when the clock keeps running
export const HURRY_RUNOFF = 9;

export function newGameState(home: string, away: string, quarterLen: number, openingReceiver: Side): GameState {
  return {
    home, away,
    score: { home: 0, away: 0 },
    qScores: { home: [0, 0, 0, 0], away: [0, 0, 0, 0] },
    quarter: 1,
    clock: quarterLen,
    quarterLen,
    possession: openingReceiver,
    ballOn: 35,
    ballY: 53.333 / 2,
    down: 1,
    toGo: 10,
    timeouts: { home: 3, away: 3 },
    phase: 'kickoff',
    kickFrom: 40,
    openingReceiver,
    ot: null,
    pendingRunoff: 0,
    clockRunning: false,
    mercy: false,
    drive: { team: openingReceiver, start: 0, plays: 0, yards: 0, startClock: quarterLen, startQ: 1 },
    stats: {},
    totals: { home: emptyTotals(), away: emptyTotals() },
    scoring: [],
    log: [],
    leadChanges: 0,
    biggestLead: { home: 0, away: 0 },
    gameOver: false,
    newDrive: true,
  };
}

export const kickingTeam = (g: GameState): Side => other(g.possession);

export function stat(g: GameState, id: string | undefined): StatLine | null {
  if (!id) return null;
  if (!g.stats[id]) g.stats[id] = emptyStats();
  return g.stats[id];
}

export function yardLineText(ballOn: number, offense: string, defense: string): string {
  const b = Math.round(ballOn);
  if (b === 50) return '50';
  return b < 50 ? `${offense} ${b}` : `${defense} ${100 - b}`;
}

export function downText(g: GameState): string {
  const ord = ['1ST', '2ND', '3RD', '4TH'][g.down - 1] ?? `${g.down}TH`;
  const goal = g.ballOn + g.toGo >= 100;
  return `${ord} & ${goal ? 'GOAL' : Math.max(1, Math.round(g.toGo))}`;
}

export function clockText(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export interface RuleEvent {
  type: 'first_down' | 'touchdown' | 'safety' | 'turnover' | 'turnover_downs' | 'field_goal' | 'fg_miss' | 'xp' | 'xp_miss'
    | 'two_pt' | 'two_pt_fail' | 'touchback' | 'end_quarter' | 'halftime' | 'end_regulation' | 'overtime' | 'final'
    | 'punt' | 'kick_return_td' | 'sack' | 'interception' | 'fumble' | 'big_play' | 'incomplete' | 'onside' | 'mercy';
  team?: Side;
  text: string;
}

function addPoints(g: GameState, team: Side, pts: number, desc: string) {
  const prevLeader = g.score.home === g.score.away ? null : g.score.home > g.score.away ? 'home' : 'away';
  g.score[team] += pts;
  const qi = Math.min(g.quarter, 5) - 1;
  while (g.qScores[team].length <= qi) { g.qScores.home.push(0); g.qScores.away.push(0); }
  g.qScores[team][qi] += pts;
  const leader = g.score.home === g.score.away ? null : g.score.home > g.score.away ? 'home' : 'away';
  if (leader && leader !== prevLeader && prevLeader) g.leadChanges++;
  for (const s of ['home', 'away'] as Side[]) g.biggestLead[s] = Math.max(g.biggestLead[s], g.score[s] - g.score[other(s)]);
  g.scoring.push({ q: g.quarter, clock: g.clock, team, points: pts, desc, homeScore: g.score.home, awayScore: g.score.away });
  if (g.quarter >= 3 && Math.abs(g.score.home - g.score.away) >= 35) g.mercy = true;
}

function setFirstDown(g: GameState) {
  g.down = 1;
  g.toGo = Math.min(10, 100 - g.ballOn);
}

function changePossession(g: GameState, newTeam: Side, ballOn: number) {
  g.possession = newTeam;
  g.ballOn = ballOn;
  setFirstDown(g);
  g.drive = { team: newTeam, start: ballOn, plays: 0, yards: 0, startClock: g.clock, startQ: g.quarter };
  g.newDrive = true;
}

/** Hash-mark rule: if the play ended outside the hashes, spot the ball on the near hash. */
function spotY(y: number): number {
  const hashTop = 17.78;
  const hashBot = 53.333 - 17.78;
  return Math.min(hashBot, Math.max(hashTop, y));
}

/** Applies a scrimmage play outcome. Returns events for presentation. */
export function applyScrimmage(g: GameState, o: PlayOutcome, ids: { off: Side }): RuleEvent[] {
  const ev: RuleEvent[] = [];
  const off = ids.off;
  const def = other(off);
  const tot = g.totals[off];
  const startBall = g.ballOn;
  g.drive.plays++;
  tot.plays++;
  // Third-down tracking
  const wasThird = g.down === 3;
  if (wasThird) tot.thirdAtt++;
  creditStats(g, o, off);

  // Overtime: turnovers end the possession immediately (no returns).
  if (g.ot && o.team === 'D') {
    tot.turnovers++;
    ev.push({ type: 'turnover', team: def, text: o.interceptor ? 'INTERCEPTION' : 'FUMBLE — TURNOVER' });
    endOtPossession(g, ev);
    return ev;
  }

  if (o.type === 'td') {
    const scorer: Side = o.scoringTeam === 'O' ? off : def;
    if (scorer === off) {
      const gained = 100 - startBall;
      tot.totalYds += gained;
      if (o.completion) tot.passYds += gained; else tot.rushYds += gained;
    } else tot.turnovers++;
    addPoints(g, scorer, 6, o.desc);
    ev.push({ type: 'touchdown', team: scorer, text: 'TOUCHDOWN!' });
    g.possession = scorer;
    g.phase = 'pat';
    g.ballOn = 97;
    g.ballY = 53.333 / 2;
    g.clockRunning = false;
    g.pendingRunoff = 0;
    return ev;
  }
  if (o.type === 'safety') {
    const scorer: Side = o.scoringTeam === 'O' ? off : def;
    addPoints(g, scorer, 2, 'Safety');
    ev.push({ type: 'safety', team: scorer, text: 'SAFETY!' });
    // Team that gave up the safety free-kicks from its 20
    g.possession = scorer; // receiving team
    g.phase = 'kickoff';
    g.kickFrom = 20;
    g.clockRunning = false;
    g.pendingRunoff = 0;
    return ev;
  }
  if (o.type === 'kneel' || o.type === 'spike') {
    g.ballOn = Math.max(1, o.spotX);
    g.down++;
    g.toGo += o.type === 'kneel' ? 1 : 0;
    g.clockRunning = o.type === 'kneel';
    g.pendingRunoff = o.type === 'kneel' ? 40 : 0;
    if (g.down > 4) {
      ev.push({ type: 'turnover_downs', team: def, text: 'TURNOVER ON DOWNS' });
      changePossession(g, def, 100 - g.ballOn);
    }
    return ev;
  }
  if (o.team === 'D') {
    // Turnover (interception / fumble lost) — ball dead at the spot in defense's frame
    tot.turnovers++;
    const spot = o.type === 'touchback' ? 20 : 100 - o.spotX;
    ev.push({ type: 'turnover', team: def, text: o.interceptor ? 'INTERCEPTED!' : 'FUMBLE! TURNOVER!' });
    g.ballY = spotY(o.spotY);
    changePossession(g, def, clampBall(spot));
    g.clockRunning = false;
    g.pendingRunoff = 0;
    return ev;
  }
  // Normal play: offense keeps the ball
  const newBall = o.type === 'incomplete' ? startBall : o.spotX;
  const gained = newBall - startBall;
  tot.totalYds += gained;
  if (o.completion) tot.passYds += gained;
  else if (o.sack) { tot.passYds += gained; g.totals[def].sacks++; }
  else if (o.type !== 'incomplete') tot.rushYds += gained;
  g.drive.yards += gained;
  g.ballOn = clampBall(newBall);
  if (o.type !== 'incomplete') g.ballY = spotY(o.spotY);
  g.clockRunning = !o.clockStops || g.mercy;
  if (o.type === 'grounding') g.clockRunning = false;
  if (gained >= g.toGo && o.type !== 'grounding') {
    setFirstDown(g);
    tot.firstDowns++;
    if (wasThird) tot.thirdConv++;
    ev.push({ type: 'first_down', team: off, text: 'FIRST DOWN!' });
  } else {
    g.down++;
    g.toGo -= gained;
    if (g.down > 4) {
      ev.push({ type: 'turnover_downs', team: def, text: 'TURNOVER ON DOWNS' });
      if (g.ot) { endOtPossession(g, ev); return ev; }
      changePossession(g, def, clampBall(100 - g.ballOn));
      g.clockRunning = false;
    }
  }
  if (o.sack) ev.push({ type: 'sack', team: def, text: 'SACK!' });
  if (o.type === 'incomplete') ev.push({ type: 'incomplete', team: off, text: 'INCOMPLETE' });
  if (gained >= 20 && o.type !== 'incomplete') ev.push({ type: 'big_play', team: off, text: `${Math.round(gained)}-YARD GAIN!` });
  return ev;
}

const clampBall = (b: number) => Math.max(1, Math.min(99, b));

/** Kickoff / punt outcomes (sim frame: kicking team = 'O'). */
export function applyKick(g: GameState, o: PlayOutcome, kicking: Side): RuleEvent[] {
  const ev: RuleEvent[] = [];
  const recv = other(kicking);
  creditStats(g, o, kicking);
  if (o.kind === 'punt') g.totals[kicking].plays++;
  if (o.type === 'td') {
    const scorer = o.scoringTeam === 'O' ? kicking : recv;
    addPoints(g, scorer, 6, o.desc);
    ev.push({ type: o.scoringTeam === 'D' ? 'kick_return_td' : 'touchdown', team: scorer, text: 'TOUCHDOWN!' });
    g.possession = scorer;
    g.phase = 'pat';
    g.ballOn = 97;
    g.ballY = 53.333 / 2;
    g.clockRunning = false;
    return ev;
  }
  if (o.type === 'safety') {
    const scorer = o.scoringTeam === 'O' ? kicking : recv;
    addPoints(g, scorer, 2, 'Safety');
    ev.push({ type: 'safety', team: scorer, text: 'SAFETY!' });
    g.possession = scorer;
    g.phase = 'kickoff';
    g.kickFrom = 20;
    return ev;
  }
  g.phase = 'scrimmage';
  g.clockRunning = false;
  g.pendingRunoff = 0;
  if (o.team === 'O') {
    // Kicking team recovered (onside / muff)
    ev.push({ type: 'onside', team: kicking, text: 'KICKING TEAM RECOVERS!' });
    g.ballY = spotY(o.spotY);
    changePossession(g, kicking, clampBall(o.spotX));
    return ev;
  }
  let ballOn: number;
  if (o.type === 'touchback') {
    ballOn = 20;
    ev.push({ type: 'touchback', team: recv, text: 'TOUCHBACK' });
    g.ballY = 53.333 / 2;
  } else {
    ballOn = 100 - o.spotX;
    g.ballY = spotY(o.spotY);
  }
  if (o.kind === 'punt') ev.push({ type: 'punt', team: kicking, text: 'PUNT' });
  changePossession(g, recv, clampBall(ballOn));
  return ev;
}

/** Field goal attempt result. */
export function applyFieldGoal(g: GameState, made: boolean, distance: number, kickerId?: string): RuleEvent[] {
  const ev: RuleEvent[] = [];
  const off = g.possession;
  const k = stat(g, kickerId);
  if (k) { k.fga++; if (made) { k.fgm++; k.fgLong = Math.max(k.fgLong, distance); } }
  g.totals[off].plays++;
  if (made) {
    addPoints(g, off, 3, `${distance}-yard field goal`);
    ev.push({ type: 'field_goal', team: off, text: 'FIELD GOAL IS GOOD!' });
    if (g.ot) { endOtPossession(g, ev); return ev; }
    g.possession = other(off); // receiving team
    g.phase = 'kickoff';
    g.kickFrom = 40;
  } else {
    ev.push({ type: 'fg_miss', team: off, text: 'NO GOOD!' });
    if (g.ot) { endOtPossession(g, ev); return ev; }
    // NFHS: a missed field goal is generally a touchback → ball at the 20 (or spot of kick if better).
    const spot = Math.max(20, 100 - g.ballOn);
    changePossession(g, other(off), spot);
    g.phase = 'scrimmage';
  }
  g.clockRunning = false;
  g.pendingRunoff = 0;
  return ev;
}

/** Try after touchdown. */
export function applyPat(g: GameState, kind: 'kick' | 'two', good: boolean, kickerId?: string, defensiveScore = false): RuleEvent[] {
  const ev: RuleEvent[] = [];
  const off = g.possession;
  const k = kind === 'kick' ? stat(g, kickerId) : null;
  if (k) { k.xpa++; if (good) k.xpm++; }
  if (defensiveScore) {
    addPoints(g, other(off), 2, 'Defensive two-point return');
    ev.push({ type: 'two_pt', team: other(off), text: 'DEFENSIVE 2-POINT RETURN!' });
  } else if (good) {
    addPoints(g, off, kind === 'kick' ? 1 : 2, kind === 'kick' ? 'Extra point' : 'Two-point conversion');
    ev.push({ type: kind === 'kick' ? 'xp' : 'two_pt', team: off, text: kind === 'kick' ? 'EXTRA POINT GOOD' : 'TWO-POINT CONVERSION!' });
  } else {
    ev.push({ type: kind === 'kick' ? 'xp_miss' : 'two_pt_fail', team: off, text: kind === 'kick' ? 'EXTRA POINT NO GOOD' : 'CONVERSION FAILS' });
  }
  if (g.ot) { endOtPossession(g, ev); return ev; }
  g.possession = other(off);
  g.phase = 'kickoff';
  g.kickFrom = 40;
  g.clockRunning = false;
  g.pendingRunoff = 0;
  return ev;
}

// ---------------------------------------------------------------- clock / periods

/** Consumes game clock. Returns true if the quarter just expired. */
export function runClock(g: GameState, seconds: number): boolean {
  if (g.ot || g.phase === 'final') return false;
  g.totals[g.possession].top += Math.min(seconds, g.clock);
  g.clock = Math.max(0, g.clock - seconds);
  return g.clock <= 0;
}

/**
 * Called after a play (and after any PAT) when the clock has hit 0.
 * Handles quarter transitions, halftime, end of regulation and overtime.
 */
export function advancePeriod(g: GameState): RuleEvent[] {
  const ev: RuleEvent[] = [];
  if (g.ot) return ev;
  if (g.quarter === 1 || g.quarter === 3) {
    g.quarter++;
    g.clock = g.quarterLen;
    g.pendingRunoff = 0;
    ev.push({ type: 'end_quarter', text: `END OF ${g.quarter === 2 ? '1ST' : '3RD'} QUARTER` });
  } else if (g.quarter === 2) {
    g.quarter = 3;
    g.clock = g.quarterLen;
    g.timeouts = { home: 3, away: 3 };
    g.possession = other(g.openingReceiver);
    g.phase = 'kickoff';
    g.kickFrom = 40;
    g.clockRunning = false;
    g.pendingRunoff = 0;
    ev.push({ type: 'halftime', text: 'HALFTIME' });
  } else if (g.quarter === 4) {
    if (g.score.home !== g.score.away) {
      g.phase = 'final';
      g.gameOver = true;
      ev.push({ type: 'final', text: 'FINAL' });
    } else {
      startOvertime(g, ev);
    }
  }
  return ev;
}

/** NFHS-style overtime ("Kansas plan"): each team gets a series from the opponent's 10. */
function startOvertime(g: GameState, ev: RuleEvent[], first?: Side) {
  const period = g.ot ? g.ot.period + 1 : 1;
  const firstTeam = first ?? (g.ot ? other(g.ot.first) : (Math.random() < 0.5 ? 'home' : 'away'));
  g.ot = { period, first: firstTeam, poss: 0 };
  g.quarter = 4 + period;
  g.clock = 0;
  g.timeouts = { home: 1, away: 1 };
  startOtPossession(g, firstTeam);
  ev.push({ type: 'overtime', text: period === 1 ? 'OVERTIME!' : `OVERTIME ${period}` });
}

function startOtPossession(g: GameState, team: Side) {
  g.possession = team;
  g.ballOn = 90;
  g.ballY = 53.333 / 2;
  g.down = 1;
  g.toGo = 10;
  g.phase = 'scrimmage';
  g.drive = { team, start: 90, plays: 0, yards: 0, startClock: 0, startQ: g.quarter };
  g.newDrive = true;
}

function endOtPossession(g: GameState, ev: RuleEvent[]) {
  if (!g.ot) return;
  g.ot.poss++;
  if (g.ot.poss === 1) {
    startOtPossession(g, other(g.ot.first));
    return;
  }
  // Both teams had a possession
  if (g.score.home !== g.score.away) {
    g.phase = 'final';
    g.gameOver = true;
    ev.push({ type: 'final', text: 'FINAL (OT)' });
  } else {
    startOvertime(g, ev);
  }
}

// ---------------------------------------------------------------- stats

function creditStats(g: GameState, o: PlayOutcome, offense: Side) {
  void offense;
  const s = (id?: string) => stat(g, id);
  if (o.kind === 'scrimmage') {
    if (o.passAttempt && o.passer) {
      const q = s(o.passer)!;
      q.passAtt++;
      if (o.completion) {
        q.passCmp++;
        q.passYds += o.passYds;
        if (o.type === 'td' && o.scoringTeam === 'O') q.passTD++;
      }
      if (o.interceptor) q.passInt++;
    }
    if (o.sack && o.passer == null && o.carrierAtEnd) {
      const q = s(o.carrierAtEnd);
      if (q) q.sacked++;
    }
    if (o.completion && o.receiver) {
      const r = s(o.receiver)!;
      r.rec++;
      r.recYds += o.passYds;
      r.longRec = Math.max(r.longRec, o.passYds);
      if (o.type === 'td' && o.scoringTeam === 'O') r.recTD++;
    }
    if (!o.completion && o.rusher && !o.sack && !o.passAttempt) {
      const r = s(o.rusher)!;
      r.rushAtt++;
      r.rushYds += o.rushYds;
      r.longRush = Math.max(r.longRush, o.rushYds);
      if (o.type === 'td' && o.scoringTeam === 'O') r.rushTD++;
    }
    if (o.interceptor) {
      const d = s(o.interceptor)!;
      d.ints++;
      if (o.type === 'td' && o.scoringTeam === 'D') d.retTD++;
    }
    if (o.pd) s(o.pd)!.pd++;
  } else {
    if (o.kind === 'punt' && o.kicker && o.type !== 'recovered') {
      const k = s(o.kicker)!;
      k.punts++;
      k.puntYds += Math.round(o.kickYds);
    }
    if (o.returner && o.returnYds) {
      const r = s(o.returner)!;
      r.retYds += o.returnYds;
      if (o.type === 'td' && o.scoringTeam === 'D') r.retTD++;
    }
  }
  if (o.tackler) s(o.tackler)!.tackles++;
  if (o.assist) s(o.assist)!.tackles += 0.5;
  if (o.sacker) { const d = s(o.sacker)!; d.sacks++; d.tackles++; }
  if (o.fumbleForcer && o.fumbleLost) s(o.fumbleForcer)!.ff++;
  if (o.fumbleLost) s(o.fumbleLost)!.fumLost++;
}
