/**
 * Per-player animation state machine for gameplay. Purely visual: it READS the play simulation
 * (positions, velocities, roles, ball state) and its authoritative events (snap, handoff, throw, catch, int,
 * tackle, sack, kick, shed, juke, stiff arm, dive, spin) and chooses rig actions. It never changes the game:
 * a release, catch, turnover or score only shows when PlaySim has already confirmed it.
 */
import type { GameSession } from '../GameSession';
import type { PlaySim } from '../PlaySim';
import type { Actor } from '../Actor';
import { ACTION, frameAt, timeOfFrame, buildFor, type ActionId, type Build, type Dir } from '../../gear/rig/spec';

interface State {
  action: ActionId;
  t: number;
  oneShot: boolean;
  fixed?: number; // fixed frame (static hold poses)
  dir: Dir;
  lastSide: 'right' | 'left';
  prevDive: boolean;
  prevSpin: boolean;
  downT: number;
  /** Finished getting up this play: ignore the engine's down flag until the next snap. */
  up: boolean;
}
export interface AnimPick { action: ActionId; frame: number; dir: Dir; build: Build }

const ONE_SHOT_PRIORITY: Partial<Record<ActionId, number>> = { tackled: 5, sack: 5, tackle: 4, dive: 4, getUp: 3, catchHigh: 3, catchLow: 3, interception: 3, throw: 3, handoff: 3, receiveHandoff: 3, kick: 3, punt: 3, snap: 3, kneel: 3, spin: 2, juke: 2, stiffArm: 2, shed: 2 };

export class AnimDirector {
  private sim: PlaySim | null = null;
  private evIdx = 0;
  private wasSnapped = false;
  private st = new Map<number, State>();

  private state(a: Actor): State {
    let s = this.st.get(a.idx);
    if (!s) {
      const side = a.facing >= 0 ? 'right' : 'left';
      s = { action: 'idle', t: Math.random(), oneShot: false, dir: side, lastSide: side, prevDive: false, prevSpin: false, downT: 0, up: false };
      this.st.set(a.idx, s);
    }
    return s;
  }

  /** Start a one-shot at a given frame (event frames line up with the confirmed gameplay moment). */
  private play(a: Actor, action: ActionId, atFrame = 0, force = false) {
    const s = this.state(a);
    if (!force && s.oneShot && (ONE_SHOT_PRIORITY[s.action] ?? 0) > (ONE_SHOT_PRIORITY[action] ?? 0)) return;
    s.action = action;
    s.t = timeOfFrame(ACTION[action], atFrame);
    s.oneShot = true;
    s.fixed = undefined;
  }

  update(sess: GameSession, dt: number) {
    const sim = sess.sim;
    if (!sim) return;
    if (sim !== this.sim) {
      this.sim = sim;
      this.evIdx = 0;
      this.wasSnapped = false;
      this.st.clear();
    }
    // Snap: the center performs the snap on the frame the engine snaps (detach at frame 2)
    if (sim.snapped && !this.wasSnapped) {
      this.wasSnapped = true;
      if (sim.setup.kind === 'scrimmage' || sim.setup.kind === 'punt') {
        const c = sim.actors.find((x) => x.team === 'O' && x.slot === 'C');
        if (c) this.play(c, 'snap', 2);
      }
      if (sim.outcome?.type === 'kneel') this.play(sim.actors[sim.qbIdx], 'kneel', 0, true);
    }
    // Authoritative engine events
    for (; this.evIdx < sim.events.length; this.evIdx++) {
      const e = sim.events[this.evIdx];
      const A = (i: number) => sim.actors[i];
      switch (e.t) {
        case 'throw': this.play(A(e.qb), 'throw', ACTION.throw.events.release, true); break;
        case 'handoff': {
          const qb = A(sim.qbIdx);
          if (qb && qb.idx !== e.to) this.play(qb, 'handoff', ACTION.handoff.events.transfer, true);
          this.play(A(e.to), 'receiveHandoff', ACTION.receiveHandoff.events.accept, true);
          break;
        }
        case 'catch': {
          const high = sim.ball.z > 2.2;
          this.play(A(e.by), high ? 'catchHigh' : 'catchLow', high ? ACTION.catchHigh.events.contact : ACTION.catchLow.events.secure, true);
          break;
        }
        case 'fieldedKick': this.play(A(e.by), 'catchLow', ACTION.catchLow.events.secure, true); break;
        case 'int': this.play(A(e.by), 'interception', ACTION.interception.events.contact, true); break;
        case 'tackle':
          this.play(A(e.by), 'tackle', ACTION.tackle.events.contact, true);
          this.play(A(e.carrier), 'tackled', ACTION.tackled.events.impact, true);
          if (e.assist != null && e.assist >= 0) this.play(A(e.assist), 'tackle', ACTION.tackle.events.contact);
          break;
        case 'sack':
          this.play(A(e.by), 'tackle', ACTION.tackle.events.contact, true);
          this.play(A(e.qb), 'sack', ACTION.sack.events.contact, true);
          break;
        case 'fumble': this.play(A(e.carrier), 'tackled', ACTION.tackled.events.impact, true); break;
        case 'kick': this.play(A(e.by), sim.setup.kind === 'punt' ? 'punt' : 'kick', sim.setup.kind === 'punt' ? ACTION.punt.events.strike : ACTION.kick.events.launch, true); break;
        case 'shed': this.play(A(e.by), 'shed', 0); break;
        case 'juke': this.play(A(e.by), 'juke', 0); break;
        case 'stiff': this.play(A(e.by), 'stiffArm', 0); break;
        default: break;
      }
    }
    for (const a of sim.actors) {
      const s = this.state(a);
      // Edge-triggered moves the engine exposes as timers
      const diving = a.diveT > 0;
      if (diving && !s.prevDive) this.play(a, 'dive', 1, true);
      s.prevDive = diving;
      const spinning = a.spinT > 0;
      if (spinning && !s.prevSpin) this.play(a, 'spin', 0);
      s.prevSpin = spinning;
      this.direction(a, s, sim);
      const rate = s.oneShot ? 1 : this.rate(a);
      s.t += dt * rate;
      if (s.oneShot) {
        const spec = ACTION[s.action];
        const { done } = frameAt(spec, s.t);
        if (done) {
          if (spec.next === 'hold') {
            // grounded: stay down until the engine lets the player up, then get up
            if (!a.down && sim.done === false) { s.oneShot = false; }
            else if (sess.phase === 'post' || sim.done) {
              s.downT += dt;
              if (s.downT > 0.5) { s.action = 'getUp'; s.t = 0; s.downT = 0; s.up = true; }
            }
          } else {
            s.oneShot = false;
          }
        }
      }
      if (!s.oneShot) this.continuous(a, s, sim, sess);
    }
  }

  private rate(a: Actor) {
    const sp = Math.hypot(a.vx, a.vy);
    return Math.max(0.55, Math.min(1.5, sp / 6));
  }

  private direction(a: Actor, s: State, sim: PlaySim) {
    const sp = Math.hypot(a.vx, a.vy);
    if (!sim.snapped) { s.dir = a.team === 'O' ? 'right' : 'left'; s.lastSide = s.dir; return; }
    if (s.oneShot && ['tackle', 'tackled', 'sack', 'dive', 'getUp', 'throw', 'kick', 'punt', 'snap', 'kneel', 'spin'].includes(s.action)) return;
    let side: 'right' | 'left' = a.facing >= 0 ? 'right' : 'left';
    if (sp > 0.8 && Math.abs(a.vx) > 0.3) side = a.vx > 0 ? 'right' : 'left';
    // Backpedalers and QBs in a dropback keep facing the play
    if (this.backward(a, sim)) side = (a.team === 'O') === (sim.setup.kind === 'scrimmage') ? 'right' : 'left';
    s.lastSide = side;
    s.dir = sp > 1.2 && Math.abs(a.vy) > 1.8 * Math.abs(a.vx) && !this.backward(a, sim) && !(s.action === 'shuffle') ? (a.vy > 0 ? 'toward' : 'away') : side;
  }

  /** Moving away from the line while still reading it (DB backpedal, QB dropback). */
  private backward(a: Actor, sim: PlaySim) {
    if (sim.setup.kind !== 'scrimmage' || sim.passThrown || sim.pastLos) return false;
    const toLine = a.team === 'O' ? 1 : -1;
    const holding = sim.ball.state === 'held' && sim.ball.holder === a.idx && a.idx === sim.qbIdx;
    const dbRead = a.team === 'D' && (a.role === 'man' || a.role === 'zone') && sim.t < 1.6;
    return (holding || dbRead) && a.vx * toLine < -0.6;
  }

  private continuous(a: Actor, s: State, sim: PlaySim, sess: GameSession) {
    const sp = Math.hypot(a.vx, a.vy);
    const pos = a.pos;
    const hasBall = sim.ball.state === 'held' && sim.ball.holder === a.idx;
    let next: ActionId = 'idle';
    let fixed: number | undefined;
    if (a.down && !s.up) { next = 'tackled'; fixed = ACTION.tackled.frames - 1; }
    else if (!sim.snapped) {
      if (sim.setup.kind === 'kickoff') next = a.role === 'kicker' ? 'idle' : 'stanceSkill';
      else if (pos === 'OL' || pos === 'DL' || (a.team === 'O' && a.slot === 'TE')) {
        if (a.team === 'O' && a.slot === 'C') { next = 'snap'; fixed = 0; } else next = 'threePoint';
      } else if (a.role === 'kicker' || a.pos === 'K') next = 'idle';
      else next = 'stanceSkill';
    } else if (sim.done && sim.outcome?.scoringTeam === a.team && sim.outcome.type === 'td') next = 'celebrate';
    else if (sim.done || sess.phase === 'post') next = sp > 0.3 ? 'walk' : 'idle';
    else if (a.engaged >= 0) next = 'block';
    else if (hasBall && a.idx === sim.qbIdx && !sim.pastLos && sim.setup.kind === 'scrimmage' && !sim.handedOff) {
      if (this.backward(a, sim)) next = 'dropback';
      else if (sp > 2.2) next = 'runBall';
      else { next = 'throw'; fixed = 0; } // set: two hands on the ball, ready to throw
    } else if (hasBall) {
      if (sp < 0.4) { next = 'runBall'; fixed = 1; } else next = 'runBall';
    } else if (this.backward(a, sim)) next = 'backpedal';
    else if (a.team === 'D' && (a.role === 'man' || a.role === 'zone') && sp > 0.4 && sp < 4 && Math.abs(a.vy) > Math.abs(a.vx) * 1.4 && !sim.passThrown) next = 'shuffle';
    else if (a.role === 'pblock' || a.role === 'rblock' || a.role === 'lead' || a.role === 'kblock') next = sp > 1.6 ? 'run' : 'block';
    else if (sp > a.maxSpd * 0.92) next = 'sprint';
    else if (sp > 1.6) next = 'run';
    else if (sp > 0.25) next = 'walk';
    if (next !== s.action || fixed !== s.fixed) {
      // keep cycle phase when switching between locomotion loops
      const loco = ['run', 'runBall', 'sprint', 'walk'];
      if (!(loco.includes(next) && loco.includes(s.action))) s.t = 0;
      s.action = next;
      s.fixed = fixed;
    }
  }

  pick(a: Actor): AnimPick {
    const s = this.state(a);
    const spec = ACTION[s.action];
    const frame = s.fixed ?? frameAt(spec, s.t).frame;
    return { action: s.action, frame, dir: s.dir, build: buildFor(a.pos) };
  }
}
