/**
 * RulesEngine: applies pitch results and finished plays to the GameState — counts, walks,
 * strikeouts, outs, runs, hits/errors, box-score stats, half-innings, extra innings and
 * game-ending rules (including walk-offs).
 */
import type { Player } from '../core/types';
import { playerById } from '../managers/TeamManager';
import type { BaseOcc, GameState, TeamGameState } from './GameState';
import { battingTeam, currentBatter, currentPitcher, fieldingTeam } from './GameState';
import type { PlayOutcome } from './LivePlay';
import type { StatsManager } from './StatsManager';

export type PitchCall = 'ball' | 'called_strike' | 'swinging_strike' | 'foul' | 'hbp';
export type PAEvent = 'walk' | 'strikeout' | 'hbp' | null;

export interface RulesNotice { type: string; text: string; data?: Record<string, unknown> }

export class RulesEngine {
  s: GameState;
  stats: StatsManager;
  notices: RulesNotice[] = [];

  constructor(s: GameState, stats: StatsManager) {
    this.s = s;
    this.stats = stats;
    for (const side of ['away', 'home'] as const) {
      for (const e of s[side].lineup) stats.addBatter(side, e.player.id);
      stats.addPitcher(side, s[side].pitcher.id);
    }
  }

  notice(type: string, text: string, data?: Record<string, unknown>) {
    this.notices.push({ type, text, data });
    this.s.log.push(text);
  }

  /** Count a pitch thrown (before its result). */
  countPitch(isStrike: boolean) {
    const ft = fieldingTeam(this.s);
    const p = ft.pitcher;
    ft.pitchCounts.set(p.id, (ft.pitchCounts.get(p.id) ?? 0) + 1);
    const pl = this.stats.p(p.id);
    pl.pitches++;
    if (isStrike) pl.strikes++;
    // Bullpen warming progresses with each pitch.
    if (ft.warming) ft.warmup.set(ft.warming, Math.min(1, (ft.warmup.get(ft.warming) ?? 0) + 0.11));
  }

  /** Apply a non-contact pitch result. Returns the PA-ending event, if any. */
  applyPitch(call: PitchCall): PAEvent {
    const s = this.s;
    if (call === 'hbp') {
      this.endPAWalk(true);
      return 'hbp';
    }
    if (call === 'ball') {
      s.balls++;
      if (s.balls >= 4) { this.endPAWalk(false); return 'walk'; }
      return null;
    }
    if (call === 'foul') {
      if (s.strikes < 2) s.strikes++;
      return null;
    }
    s.strikes++;
    if (s.strikes >= 3) {
      this.strikeout(call === 'called_strike');
      return 'strikeout';
    }
    return null;
  }

  private strikeout(looking: boolean) {
    const s = this.s;
    const b = currentBatter(s);
    const p = currentPitcher(s);
    const bl = this.stats.b(b.id);
    bl.PA++; bl.AB++; bl.SO++;
    const pl = this.stats.p(p.id);
    pl.SO++; pl.BF++; pl.outs++;
    s.outs++;
    this.notice('strikeout', `${b.name} strikes out ${looking ? 'looking' : 'swinging'}`, { looking, risp: !!(s.bases[1] || s.bases[2]) });
    this.nextBatter();
  }

  private endPAWalk(hbp: boolean) {
    const s = this.s;
    const b = currentBatter(s);
    const p = currentPitcher(s);
    const bl = this.stats.b(b.id);
    bl.PA++;
    if (hbp) bl.HBP++; else bl.BB++;
    const pl = this.stats.p(p.id);
    pl.BF++;
    if (hbp) pl.HBP++; else pl.BB++;
    // Force advance.
    const occ: BaseOcc = { player: b, responsiblePitcherId: p.id, reachedOnError: false };
    let carry: BaseOcc | null = occ;
    const scored: BaseOcc[] = [];
    for (let i = 0; i < 3 && carry; i++) {
      const prev: BaseOcc | null = s.bases[i];
      s.bases[i] = carry;
      carry = prev;
    }
    if (carry) scored.push(carry);
    this.notice(hbp ? 'hbp' : 'walk', `${b.name} ${hbp ? 'is hit by a pitch' : 'walks'}`);
    for (const r of scored) this.scoreRun(r, b, true);
    this.nextBatter();
  }

  scoreRun(r: BaseOcc, batter: Player | null, rbi: boolean, unearned = false) {
    const s = this.s;
    const bt = battingTeam(s);
    const ft = fieldingTeam(s);
    bt.runs++;
    const idx = s.inning - 1;
    while (bt.linescore.length <= idx) bt.linescore.push(0);
    bt.linescore[idx]++;
    this.stats.b(r.player.id).R++;
    if (batter && rbi) this.stats.b(batter.id).RBI++;
    const resp = this.stats.p(r.responsiblePitcherId);
    resp.R++;
    if (!unearned && !r.reachedOnError) resp.ER++;
    ft.runsThisInningAllowed++;
    this.trackLead(r.responsiblePitcherId);
  }

  private trackLead(responsible: string) {
    const s = this.s;
    const leader = s.home.runs > s.away.runs ? 'home' : s.away.runs > s.home.runs ? 'away' : null;
    if (leader && leader !== s.lastLeader) {
      const loser = leader === 'home' ? 'away' : 'home';
      s.pitchOfRecord[leader] = s[leader].pitcher.id;
      s.loserOfRecord[loser] = responsible;
    }
    s.lastLeader = leader;
  }

  /** Apply a finished live play (ball in play, steal attempt, or wild pitch). */
  applyPlay(o: PlayOutcome, batterId: string | null) {
    const s = this.s;
    const bt = battingTeam(s);
    const ft = fieldingTeam(s);
    const pitcher = currentPitcher(s);
    const batter = batterId ? playerById(batterId) : null;
    const prevBases = s.bases.slice();
    const occById = new Map<string, BaseOcc>();
    for (const b of prevBases) if (b) occById.set(b.player.id, b);
    if (batter) occById.set(batter.id, { player: batter, responsiblePitcherId: pitcher.id, reachedOnError: o.batterResult === 'ROE' });

    // Outs
    s.outs += o.outs.length;
    this.stats.p(pitcher.id).outs += o.outs.length;
    ft.errors += o.errors.length;

    // Runs
    const rbiOk = o.errors.length === 0 && !o.doublePlay && o.batterResult !== 'ROE';
    for (const r of o.runs) {
      const occ = occById.get(r.runnerId);
      if (!occ) continue;
      this.scoreRun(occ, batter, !!batter && (rbiOk || o.homeRun || o.sacFly), r.unearned && !o.homeRun);
    }

    // Bases
    s.bases = o.bases.map((id) => (id ? occById.get(id) ?? null : null));

    // Steals
    for (const id of o.stolenBases) this.stats.b(id).SB++;
    for (const id of o.caughtStealing) this.stats.b(id).CS++;

    if (batter) {
      const bl = this.stats.b(batter.id);
      const pl = this.stats.p(pitcher.id);
      bl.PA++;
      pl.BF++;
      if (!o.sacFly) bl.AB++;
      else bl.SF++;
      const hit = ['1B', '2B', '3B', 'HR', 'GRD'].includes(o.batterResult);
      if (hit) {
        bl.H++; pl.H++; bt.hits++;
        if (o.batterResult === '2B' || o.batterResult === 'GRD') bl.D++;
        if (o.batterResult === '3B') bl.T++;
        if (o.batterResult === 'HR') { bl.HR++; pl.HR++; }
      }
      let text = o.description;
      if (o.sacFly) text = `${batter.name} hits a sacrifice fly`;
      if (o.triplePlay) text = 'TRIPLE PLAY!';
      this.notice('play', text, { result: o.batterResult, runs: o.runs.length, outs: o.outs.length });
      this.nextBatter();
    } else {
      for (const id of o.stolenBases) this.notice('steal', `${playerById(id).name} steals a base!`);
      for (const id of o.caughtStealing) this.notice('cs', `${playerById(id).name} is caught stealing`);
      if (o.runs.length && !o.stolenBases.length) this.notice('play', `Run scores on the wild pitch!`);
    }
  }

  nextBatter() {
    const bt = battingTeam(this.s);
    bt.battingIdx = (bt.battingIdx + 1) % 9;
    this.s.balls = 0;
    this.s.strikes = 0;
  }

  /** Bottom of the last (or extra) inning and the home team is ahead: walk-off. */
  isWalkoff(): boolean {
    const s = this.s;
    return s.half === 'bottom' && s.inning >= s.settings.innings && s.home.runs > s.away.runs;
  }

  /** Call after a PA/play resolves. Returns 'continue' | 'half' | 'final'. */
  checkProgress(): 'continue' | 'half' | 'final' {
    const s = this.s;
    if (this.isWalkoff()) { this.finish('home'); return 'final'; }
    if (s.outs < 3) return 'continue';
    return this.endHalf();
  }

  private endHalf(): 'half' | 'final' {
    const s = this.s;
    const bt = battingTeam(s);
    const idx = s.inning - 1;
    while (bt.linescore.length <= idx) bt.linescore.push(0);
    bt.lob += s.bases.filter(Boolean).length;
    const last = s.inning >= s.settings.innings;
    if (s.half === 'top') {
      if (last && s.home.runs > s.away.runs) { this.finish('home'); return 'final'; }
      s.half = 'bottom';
    } else {
      if (last && s.home.runs !== s.away.runs) { this.finish(s.home.runs > s.away.runs ? 'home' : 'away'); return 'final'; }
      s.half = 'top';
      s.inning++;
    }
    s.outs = 0; s.balls = 0; s.strikes = 0;
    s.bases = [null, null, null];
    fieldingTeam(s).runsThisInningAllowed = 0;
    // Extra innings: automatic runner on second.
    if (s.inning > s.settings.innings && s.settings.ghostRunner) {
      const t = battingTeam(s);
      const prev = t.lineup[(t.battingIdx + 8) % 9].player;
      s.bases[1] = { player: prev, responsiblePitcherId: fieldingTeam(s).pitcher.id, reachedOnError: true };
    }
    return 'half';
  }

  finish(winner: 'home' | 'away') {
    const s = this.s;
    s.over = true;
    s.winner = winner;
    const loser = winner === 'home' ? 'away' : 'home';
    const w = s.pitchOfRecord[winner];
    const l = s.loserOfRecord[loser];
    if (w) this.stats.p(w).dec = 'W';
    if (l) this.stats.p(l).dec = 'L';
    // Save: finishing pitcher of the winner, not the winner, lead of 3 or less.
    const fin = s[winner].pitcher;
    const margin = Math.abs(s.home.runs - s.away.runs);
    if (fin.id !== w && margin <= 3 && s[winner].pitchersUsed.length > 1) this.stats.p(fin.id).dec = 'S';
    this.notice('final', 'FINAL');
  }

  changePitcher(t: TeamGameState, p: Player) {
    if (t.pitcher.id === p.id) return;
    t.removed.add(t.pitcher.id);
    // A pitcher who was also in the lineup (two-way) keeps batting.
    t.pitcher = p;
    t.pitchersUsed.push(p);
    if (!t.pitchCounts.has(p.id)) t.pitchCounts.set(p.id, 0);
    if (t.warming === p.id) t.warming = null;
    this.stats.addPitcher(t.side, p.id);
  }
}
