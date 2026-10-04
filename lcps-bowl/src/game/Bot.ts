/**
 * Bot — drives a GameSession through the same interface a human uses (play calls + per-frame
 * ControlInput). Used by tests and the balance audit to make sure interactive games always
 * finish and that a human-controlled team can actually move the ball.
 */
import type { GameSession } from './GameSession';
import { NO_INPUT, type ControlInput } from './PlaySim';
import { OFFENSE_PLAYS } from './Plays';
import { RNG } from './rng';
import { dist } from './math';
import { fgDistance, fgProbability } from './Coach';

export interface BotStats {
  passes: number;
  throws: number;
  runs: number;
}

export class HumanBot {
  rng: RNG;
  stats: BotStats = { passes: 0, throws: 0, runs: 0 };
  private thrown = false;
  constructor(seed = 1, public skill = 0.7) {
    this.rng = new RNG(seed);
  }

  /** Handles all "menu" decisions; returns true if it acted. */
  decide(s: GameSession): boolean {
    const g = s.g;
    const us = s.userSide!;
    if (s.phase === 'intro') { s.nextPhase(); return true; }
    if (s.phase === 'playcall') {
      if (g.phase === 'kickoff') { s.userKickoff(false); return true; }
      if (g.possession === us) {
        let id: string;
        if (g.phase === 'pat') id = this.rng.pick(['slants', 'goal_dive', 'stick']);
        else if (g.down === 4) {
          const fd = fgDistance(g.ballOn);
          if (fgProbability(fd, s.depth[us], s.cfg.weather) > 0.45) id = 'fg';
          else if (g.toGo <= 2 && g.ballOn > 50) id = 'inside_zone';
          else id = 'punt';
        } else {
          const runP = g.toGo <= 3 ? 0.6 : g.down === 3 ? 0.2 : 0.45;
          const pool = this.rng.chance(runP) ? ['inside_zone', 'sweep', 'counter', 'qb_read', 'stretch'] : ['slants', 'mesh', 'stick', 'curl', 'flood', 'dig', 'four_verts', 'pa_boot', 'smash', 'quick_out'];
          id = this.rng.pick(pool);
        }
        this.thrown = false;
        const p = OFFENSE_PLAYS.find((x) => x.id === id)!;
        if (p.kind === 'pass') this.stats.passes++; else this.stats.runs++;
        s.userCallOffense(id);
      } else {
        s.userCallDefense({ formation: g.toGo >= 8 ? 'Nickel' : '4-3', coverage: this.rng.pick(['Cover 3', 'Cover 2', 'Man', 'Cover 4', 'Blitz']) });
      }
      return true;
    }
    if (s.phase === 'pat_choice') { s.userPat('kick'); return true; }
    if (s.phase === 'presnap' && s.sim && (s.sim.setup.userTeam === 'O' || s.sim.setup.kind === 'kickoff')) { s.snap(); return true; }
    if (s.phase === 'kick_meter' && s.kick) {
      const k = s.kick;
      if (k.stage === 'aim' && Math.abs(k.aim) < 0.12 + (1 - this.skill) * 0.3) { s.kickPress(); return true; }
      if (k.stage === 'power' && k.power > 0.82 - (1 - this.skill) * 0.3) { s.kickPress(); return true; }
    }
    if (s.phase === 'post' || s.phase === 'break') { s.skip(); return true; }
    return false;
  }

  /** Per-frame control for the controlled player. */
  control(s: GameSession): ControlInput {
    const sim = s.sim;
    if (!sim || !sim.snapped || sim.done) return NO_INPUT;
    const u = sim.user;
    if (!u) return NO_INPUT;
    const ci: ControlInput = { ...NO_INPUT };
    const c = sim.carrier;
    const play = sim.setup.offPlay;
    // Quarterback with the ball on a pass play: read and throw
    if (sim.setup.userTeam === 'O' && play?.kind === 'pass' && c === u && u.idx === sim.qbIdx && !sim.pastLos && !sim.passThrown) {
      if (sim.t < sim.dropTime()) return ci;
      let best = -1;
      let bestOpen = -99;
      for (const a of sim.actors) {
        if (a.team !== 'O' || a.number == null || a.role !== 'route') continue;
        let near = 99;
        for (const d of sim.actors) if (d.team === 'D') near = Math.min(near, dist(d, a));
        const val = near + (a.x - sim.setup.los) * 0.05;
        if (val > bestOpen) { bestOpen = val; best = a.number; }
      }
      const pressure = sim.pressureOn(u);
      if ((bestOpen > 3.0 - sim.t * 0.4 * this.skill) || pressure > 0.55 || sim.t > 3.6) {
        if (best > 0) { ci.throwTo = best; this.stats.throws++; }
        else ci.throwAway = true;
      }
      return ci;
    }
    // Ball carrier: run downfield, avoid nearest defender, sprint, occasional juke
    if (c === u) {
      const fwd = u.team === 'O' ? 1 : -1;
      let my = 0;
      let nearest = 99;
      let ny = 0;
      for (const d of sim.actors) {
        if (d.team === u.team || d.down || d.engaged >= 0) continue;
        const dd = dist(d, u);
        if ((d.x - u.x) * fwd > -1 && dd < nearest) { nearest = dd; ny = d.y - u.y; }
      }
      if (nearest < 4) my = ny > 0 ? -0.8 : 0.8;
      if (u.y < 3) my = 0.6;
      if (u.y > 50) my = -0.6;
      ci.mx = fwd;
      ci.my = my;
      ci.sprint = u.stamina > 0.2;
      if (nearest < 1.8 && this.rng.chance(0.08 * this.skill)) ci.juke = ny > 0 ? -1 : 1;
      return ci;
    }
    // Defense / chasing: go to the ball
    const target = c ?? (sim.ball.state === 'air' ? { x: sim.ball.tx, y: sim.ball.ty } : { x: sim.ball.x, y: sim.ball.y });
    if (c && c.team === u.team) return ci; // our ball, but not us (blockers are AI)
    const dx = target.x - u.x;
    const dy = target.y - u.y;
    const l = Math.hypot(dx, dy) || 1;
    ci.mx = dx / l;
    ci.my = dy / l;
    ci.sprint = true;
    if (c && l < 2.2 && this.rng.chance(0.15)) ci.dive = true;
    if (!c && l > 8 && this.rng.chance(0.02)) ci.switchPlayer = true;
    return ci;
  }

  /** Plays a full interactive game; returns the session when final (or after maxSteps). */
  play(s: GameSession, maxSteps = 500000): GameSession {
    const dt = 1 / 60;
    let steps = 0;
    while (!s.isOver && steps < maxSteps) {
      this.decide(s);
      s.update(dt, this.control(s));
      steps++;
    }
    void this.thrown;
    return s;
  }
}
