import { clamp, vdist, vnorm, vsub } from '../core/math';
import type { GroundPosition } from '../data';
import type { FightEngine } from './FightEngine';
import { durationMult, fatigueFactor, isRocked, staminaFrac, worstLeg } from './FighterState';
import { cageDistance, constrainToCage } from './Octagon';
import { TUNING } from './tuning';
import type { FighterState, GroundState, Side, TakedownVariant } from './types';

type Next = { to: GroundPosition; base: number; kind: 'pass' | 'back' } | null;

/** Top-player advancement map. `alt` = Shift+R. */
function topNext(pos: GroundPosition, alt: boolean): Next {
  switch (pos) {
    case 'fullGuard': return { to: 'halfGuard', base: 0.5, kind: 'pass' };
    case 'halfGuard': return { to: 'sideControl', base: 0.45, kind: 'pass' };
    case 'sideControl': return alt ? { to: 'backControl', base: 0.22, kind: 'back' } : { to: 'mount', base: 0.36, kind: 'pass' };
    case 'mount': return { to: 'backControl', base: 0.42, kind: 'back' };
    case 'turtle': return { to: 'backControl', base: 0.55, kind: 'back' };
    case 'backControl': return alt ? { to: 'mount', base: 0.5, kind: 'pass' } : null;
  }
}

/**
 * Clinch, takedowns, knockdown follow-ups and the ground game (positions, transitions, sweeps,
 * get-ups, referee stand-ups).
 */
export class GrapplingSystem {
  constructor(private e: FightEngine) {}

  private opp(f: FighterState) {
    return this.e.f[f.side === 0 ? 1 : 0];
  }

  private idle(f: FighterState) {
    return !f.down && (!f.action || f.action.kind === 'defense' || (f.action.kind === 'strike' && f.action.resolved && f.action.t > f.action.w + f.action.a + f.action.r * 0.4));
  }

  // ------------------------------------------------------------------ clinch
  attemptClinch(f: FighterState): boolean {
    const e = this.e;
    const o = this.opp(f);
    if (e.mode !== 'stand' || !this.idle(f) || o.down) return false;
    if (vdist(f.pos, o.pos) > 1.3) return false;
    f.action = { kind: 'clinchEntry', t: 0, w: 0.24 * durationMult(f) };
    e.stamina.spend(f, 2);
    return true;
  }

  private resolveClinchEntry(f: FighterState) {
    const e = this.e;
    const o = this.opp(f);
    const A = f.data.attributes;
    const D = o.data.attributes;
    if (vdist(f.pos, o.pos) > 1.45 || o.down) {
      e.emit({ type: 'clinchAttempt', side: f.side, success: false });
      return;
    }
    let p = 0.5 + ((A.clinch + A.wrestling) / 2 - (D.clinch + D.wrestling) / 2) * 0.008;
    if (o.action?.kind === 'strike') p += 0.2;
    if (isRocked(o)) p += 0.25;
    if (o.action?.kind === 'defense' && (o.action.move === 'pull' || o.action.move === 'sidestep')) p -= 0.3;
    p += (staminaFrac(f) - staminaFrac(o)) * 0.2;
    if (e.rng.chance(clamp(p, 0.1, 0.92))) {
      this.enterClinch(f.side, 0.25);
      e.emit({ type: 'clinchAttempt', side: f.side, success: true });
    } else {
      f.action = { kind: 'recover', t: 0, dur: 0.35, label: 'clinch-fail' };
      e.emit({ type: 'clinchAttempt', side: f.side, success: false });
    }
  }

  enterClinch(initiator: Side, control: number) {
    const e = this.e;
    e.mode = 'clinch';
    e.clinch = { control: initiator === 0 ? control : -control, pinned: -1, t: 0, lastAction: e.roundTime };
    for (const f of e.f) {
      f.action = null;
      f.buffered = null;
      f.comboSeq = [];
    }
    this.updatePin();
  }

  breakClinch(side: Side | -1, reason: 'break' | 'ref' | 'strike') {
    const e = this.e;
    if (e.mode !== 'clinch') return;
    e.mode = 'stand';
    e.clinch = null;
    const [a, b] = e.f;
    const n = vnorm(vsub(b.pos, a.pos));
    a.pos.x -= n.x * 0.45;
    a.pos.z -= n.z * 0.45;
    b.pos.x += n.x * 0.45;
    b.pos.z += n.z * 0.45;
    constrainToCage(a.pos, TUNING.fighterRadius);
    constrainToCage(b.pos, TUNING.fighterRadius);
    for (const f of e.f) if (f.action?.kind !== 'stun') f.action = null;
    e.emit({ type: 'clinchBroken', side, reason });
  }

  private updatePin() {
    const e = this.e;
    const c = e.clinch;
    if (!c) return;
    const prev = c.pinned;
    c.pinned = -1;
    for (const f of e.f) {
      const ctrl = c.control * (f.side === 0 ? 1 : -1);
      if (cageDistance(f.pos) < TUNING.fighterRadius + 0.12 && ctrl < 0.1) c.pinned = f.side;
    }
    if (c.pinned !== -1 && c.pinned !== prev) e.emit({ type: 'cagePin', side: (c.pinned === 0 ? 1 : 0) as Side });
  }

  /** R in the clinch: fight for underhooks / pin to the fence / reverse. */
  clinchPosition(f: FighterState) {
    const e = this.e;
    const c = e.clinch;
    if (!c || !this.idle(f)) return false;
    const o = this.opp(f);
    const A = f.data.attributes;
    const D = o.data.attributes;
    e.stamina.spend(f, 3.2);
    f.action = { kind: 'recover', t: 0, dur: 0.45, label: 'clinch-work' };
    const p = 0.45 + ((A.clinch * 0.6 + A.wrestling * 0.4) - (D.clinch * 0.6 + D.wrestling * 0.4)) * 0.01 + (staminaFrac(f) - staminaFrac(o)) * 0.3 - (o.guard === 'low' ? 0.12 : 0);
    const sign = f.side === 0 ? 1 : -1;
    if (e.rng.chance(clamp(p, 0.08, 0.9))) {
      c.control = clamp(c.control + sign * 0.55, -1, 1);
      // drive toward the nearest fence behind the opponent
      const dir = vnorm(vsub(o.pos, f.pos));
      o.pos.x += dir.x * 0.6;
      o.pos.z += dir.z * 0.6;
      f.pos.x += dir.x * 0.6;
      f.pos.z += dir.z * 0.6;
    } else {
      c.control = clamp(c.control - sign * 0.15, -1, 1);
    }
    c.lastAction = e.roundTime;
    e.movement.update(0, [e.lastCmds[0], e.lastCmds[1]]);
    this.updatePin();
    return true;
  }

  attemptBreak(f: FighterState) {
    const e = this.e;
    const c = e.clinch;
    if (!c || !this.idle(f)) return false;
    const o = this.opp(f);
    const ctrl = c.control * (f.side === 0 ? 1 : -1);
    const p = 0.42 + (f.data.attributes.clinch - o.data.attributes.clinch) * 0.007 + ctrl * 0.25 + (staminaFrac(f) - staminaFrac(o)) * 0.25 - (c.pinned === f.side ? 0.12 : 0);
    e.stamina.spend(f, 2.5);
    if (e.rng.chance(clamp(p, 0.12, 0.92))) this.breakClinch(f.side, 'break');
    else f.action = { kind: 'recover', t: 0, dur: 0.4, label: 'break-fail' };
    return true;
  }

  // --------------------------------------------------------------- takedowns
  attemptTakedown(f: FighterState, variant: 'double' | 'single' | 'trip'): boolean {
    const e = this.e;
    const o = this.opp(f);
    if (o.down) return this.pounce(f);
    if (e.mode === 'clinch') {
      if (!this.idle(f)) return false;
      const v: TakedownVariant = e.clinch?.pinned === o.side ? 'cage' : 'trip';
      f.action = { kind: 'shot', variant: v, t: 0, w: 0.3 * durationMult(f), timed: false, caughtKick: false };
      e.stamina.spend(f, 5);
      e.emit({ type: 'takedownAttempt', side: f.side, variant: v });
      return true;
    }
    if (e.mode !== 'stand') return false;
    const dist = vdist(f.pos, o.pos);
    const maxD = variant === 'single' ? 2.35 : 2.1;
    if (dist > maxD || !this.idle(f)) return false;
    const oa = o.action;
    const caughtKick = oa?.kind === 'strike' && !oa.feint && oa.t > oa.w * 0.6 && oa.t < oa.w + oa.a + oa.r * 0.6 && ['leadBodyKick', 'rearBodyKick', 'rearLegKick', 'leadLegKick', 'leadHeadKick', 'rearHeadKick', 'frontKick', 'spinningBackKick'].includes(oa.id) && dist < 1.8;
    const timed = oa?.kind === 'strike' && !oa.feint;
    const v: TakedownVariant = caughtKick ? 'single' : cageDistance(o.pos) < 0.95 ? 'cage' : variant === 'trip' ? 'double' : variant;
    f.action = { kind: 'shot', variant: v, t: 0, w: (caughtKick ? 0.12 : v === 'single' ? 0.3 : 0.34) * durationMult(f), timed, caughtKick };
    e.stamina.spend(f, 5);
    if (caughtKick) e.emit({ type: 'kickCaught', side: f.side });
    e.emit({ type: 'takedownAttempt', side: f.side, variant: v });
    return true;
  }

  private resolveShot(f: FighterState) {
    const e = this.e;
    if (f.action?.kind !== 'shot') return;
    const act = f.action;
    const o = this.opp(f);
    const A = f.data.attributes;
    const D = o.data.attributes;
    const inClinch = e.mode === 'clinch';
    const dist = vdist(f.pos, o.pos);
    f.action = null;
    if (!inClinch && dist > 1.15) {
      e.stamina.spend(f, 4);
      f.action = { kind: 'recover', t: 0, dur: 0.55, label: 'whiffed-shot' };
      f.anim = 'shotMiss';
      f.animT = 0;
      e.emit({ type: 'takedownDefended', side: o.side, how: 'stuffed' });
      return;
    }
    const off = A.takedowns * 0.6 + A.wrestling * 0.4 + (inClinch ? A.clinch * 0.3 - 20 : 0);
    const def = D.takedownDefense * 0.8 + D.wrestling * 0.2 + (inClinch ? D.clinch * 0.3 - 20 : 0);
    let p = 0.4 + (off - def) * 0.009;
    p += (staminaFrac(f) - staminaFrac(o)) * 0.3;
    p += Math.log(f.data.weightLbs / o.data.weightLbs) * 0.8;
    if (act.timed) p += 0.17;
    if (act.caughtKick) p += 0.4;
    if (act.variant === 'cage') p += 0.1;
    if (inClinch && e.clinch) p += e.clinch.control * (f.side === 0 ? 1 : -1) * 0.15;
    if (isRocked(o)) p += 0.25;
    p += worstLeg(o) * 0.0018;
    p *= 0.75 + 0.25 * fatigueFactor(f);
    const sprawled = o.guard === 'low' && !o.down;
    if (sprawled && !act.caughtKick) p -= 0.24 + D.takedownDefense * 0.004;
    p = clamp(p, 0.03, 0.95);
    if (e.rng.chance(p)) {
      let pos: GroundPosition = 'fullGuard';
      const edge = (A.wrestling - D.groundControl) * 0.01;
      if (act.variant === 'single') pos = e.rng.chance(0.55 + edge) ? 'halfGuard' : 'fullGuard';
      else if (act.variant === 'trip') pos = e.rng.chance(0.3 + edge) ? 'sideControl' : 'halfGuard';
      else pos = e.rng.chance(0.35 + edge) ? 'halfGuard' : 'fullGuard';
      if (e.mode === 'clinch') e.clinch = null;
      e.stamina.spend(o, 7);
      this.startGround(f.side, pos, o.pos);
      e.emit({ type: 'takedown', side: f.side, variant: act.variant, pos });
    } else {
      e.stamina.spend(f, 7);
      e.stamina.spend(o, 3);
      o.anim = sprawled ? 'sprawl' : 'stuff';
      o.animT = 0;
      e.emit({ type: 'takedownDefended', side: o.side, how: sprawled ? 'sprawl' : 'stuffed' });
      if (e.mode === 'clinch') {
        f.action = { kind: 'recover', t: 0, dur: 0.4, label: 'td-fail' };
        return;
      }
      // A stuffed shot against the fence often ends in a clinch; a good sprawl gives up the neck.
      if (cageDistance(o.pos) < 1.1 && e.rng.chance(0.55)) {
        this.enterClinch(f.side, -0.2);
        return;
      }
      f.action = { kind: 'recover', t: 0, dur: 0.6, label: 'td-fail' };
      if (sprawled) o.subScramble = e.time + 1.1; // front-headlock guillotine window
    }
  }

  /** Follow a knocked-down opponent to the mat. */
  pounce(f: FighterState): boolean {
    const e = this.e;
    const o = this.opp(f);
    if (e.mode !== 'stand' || !o.down || f.down) return false;
    if (vdist(f.pos, o.pos) > 2.2) return false;
    const heavy = o.down.heavy;
    o.down = null;
    this.startGround(f.side, heavy ? (e.rng.chance(0.5) ? 'mount' : 'sideControl') : 'halfGuard', o.pos);
    e.emit({ type: 'pounce', side: f.side });
    return true;
  }

  startGround(top: Side, pos: GroundPosition, at: { x: number; z: number }) {
    const e = this.e;
    const bot = e.f[top === 0 ? 1 : 0];
    const tf = e.f[top];
    e.mode = 'ground';
    e.clinch = null;
    e.ground = { top, pos, t: 0, lastAction: e.roundTime };
    bot.pos = { x: at.x, z: at.z };
    constrainToCage(bot.pos, 0.9);
    bot.facing = tf.pos.x > bot.pos.x ? 0 : Math.PI;
    for (const f of e.f) {
      f.action = null;
      f.buffered = null;
      f.comboSeq = [];
      f.down = null;
    }
    e.movement.update(0, [e.lastCmds[0], e.lastCmds[1]]);
  }

  standUp(reason: 'getup' | 'ref' | 'disengage', side: Side | -1) {
    const e = this.e;
    e.mode = 'stand';
    e.ground = null;
    e.clinch = null;
    const [a, b] = e.f;
    const mid = { x: (a.pos.x + b.pos.x) / 2, z: (a.pos.z + b.pos.z) / 2 };
    const sep = reason === 'ref' ? 1.6 : 1.3;
    let axis = vnorm(vsub(b.pos, a.pos));
    if (Math.hypot(axis.x, axis.z) < 0.5) axis = { x: 1, z: 0 };
    if (reason === 'ref') {
      // referee restarts in the centre
      mid.x *= 0.3;
      mid.z *= 0.3;
    }
    a.pos = { x: mid.x - axis.x * sep / 2, z: mid.z - axis.z * sep / 2 };
    b.pos = { x: mid.x + axis.x * sep / 2, z: mid.z + axis.z * sep / 2 };
    constrainToCage(a.pos, TUNING.fighterRadius);
    constrainToCage(b.pos, TUNING.fighterRadius);
    a.facing = Math.atan2(axis.z, axis.x);
    b.facing = Math.atan2(-axis.z, -axis.x);
    for (const f of e.f) {
      f.action = { kind: 'getup', t: 0, w: 0.35 };
      f.down = null;
    }
    e.emit({ type: 'standup', reason, side });
  }

  // ------------------------------------------------------------ ground game
  attemptTransition(f: FighterState, alt: boolean): boolean {
    const e = this.e;
    if (e.mode === 'clinch') return this.clinchPosition(f);
    if (e.mode !== 'ground' || !e.ground || !this.idle(f)) return false;
    const g = e.ground;
    const top = g.top === f.side;
    if (top && !topNext(g.pos, alt)) return false;
    f.action = { kind: 'transition', alt, t: 0, w: (top ? 0.75 : 0.7) * durationMult(f), defended: false };
    e.stamina.spend(f, top ? 3.5 : 4.5);
    g.lastAction = e.roundTime;
    return true;
  }

  private resolveTransition(f: FighterState) {
    const e = this.e;
    const g = e.ground;
    const act = f.action;
    if (!g || act?.kind !== 'transition') return;
    f.action = null;
    const o = this.opp(f);
    const A = f.data.attributes;
    const D = o.data.attributes;
    const top = g.top === f.side;
    const defending = o.guard === 'low' || o.guard === 'high';
    const stam = (staminaFrac(f) - staminaFrac(o)) * 0.3;
    if (top) {
      const nx = topNext(g.pos, act.alt);
      if (!nx) return;
      let p = nx.base + (A.groundControl * 0.7 + A.wrestling * 0.3 - D.groundControl * 0.5 - D.submissionDefense * 0.2 - D.wrestling * 0.3) * 0.006 + stam;
      if (isRocked(o)) p += 0.25;
      if (defending) p *= o.guard === 'low' ? 0.35 : 0.7;
      if (e.rng.chance(clamp(p, 0.03, 0.92))) {
        const from = g.pos;
        g.pos = nx.to;
        g.t = 0;
        e.emit({ type: 'positionChange', side: f.side, from, to: nx.to, kind: nx.kind });
      } else {
        e.emit({ type: 'transitionDefended', side: o.side });
        f.action = { kind: 'recover', t: 0, dur: 0.35, label: 'pass-fail' };
      }
      return;
    }
    // bottom: sweeps, escapes, guard recovery
    const off = A.groundControl * 0.5 + A.wrestling * 0.3 + A.submissions * 0.2;
    const def = D.groundControl * 0.7 + D.wrestling * 0.3;
    const edge = (off - def) * 0.006 + stam;
    const baseMap: Record<GroundPosition, { base: number; to: GroundPosition; reverse: boolean }> = {
      fullGuard: { base: 0.2, to: 'fullGuard', reverse: true },
      halfGuard: { base: 0.42, to: 'fullGuard', reverse: false },
      sideControl: { base: 0.34, to: 'halfGuard', reverse: false },
      mount: { base: 0.22, to: 'halfGuard', reverse: false },
      backControl: { base: 0.18, to: 'fullGuard', reverse: true },
      turtle: { base: 0.42, to: 'fullGuard', reverse: false },
    };
    const m = baseMap[g.pos];
    let p = m.base + edge;
    if (o.guard !== 'none') p *= 0.45;
    if (isRocked(f)) p *= 0.5;
    if (e.rng.chance(clamp(p, m.base * 0.3, 0.85))) {
      const from = g.pos;
      if (m.reverse) {
        g.top = f.side;
        g.pos = e.rng.chance(0.25 + (A.groundControl - D.groundControl) * 0.01) ? 'mount' : 'fullGuard';
        e.emit({ type: 'positionChange', side: f.side, from, to: g.pos, kind: 'sweep' });
        e.movement.update(0, [e.lastCmds[0], e.lastCmds[1]]);
      } else {
        g.pos = m.to;
        e.emit({ type: 'positionChange', side: f.side, from, to: g.pos, kind: 'escape' });
      }
      g.t = 0;
    } else {
      e.emit({ type: 'transitionDefended', side: o.side });
      f.action = { kind: 'recover', t: 0, dur: 0.4, label: 'escape-fail' };
    }
  }

  /** X: bottom works back to the feet; top disengages; downed fighter hurries up; clinch breaks. */
  attemptGetUp(f: FighterState): boolean {
    const e = this.e;
    if (f.down) {
      f.down.t += 0.12 * (0.6 + f.data.attributes.recovery * 0.006);
      return true;
    }
    if (e.mode === 'clinch') return this.attemptBreak(f);
    if (e.mode !== 'ground' || !e.ground || !this.idle(f)) return false;
    const g = e.ground;
    if (g.top === f.side) {
      this.standUp('disengage', f.side);
      return true;
    }
    f.action = { kind: 'getup', t: 0, w: 0.85 * durationMult(f) };
    e.stamina.spend(f, 5);
    g.lastAction = e.roundTime;
    return true;
  }

  private resolveGetUp(f: FighterState) {
    const e = this.e;
    const g = e.ground;
    f.action = null;
    if (!g) return;
    const o = this.opp(f);
    const A = f.data.attributes;
    const D = o.data.attributes;
    const base: Record<GroundPosition, number> = { fullGuard: 0.34, halfGuard: 0.22, turtle: 0.32, backControl: 0.1, sideControl: 0.06, mount: 0.02 };
    let p = base[g.pos] + (A.wrestling * 0.6 + A.takedownDefense * 0.4 - D.groundControl) * 0.006 + (staminaFrac(f) - staminaFrac(o)) * 0.3;
    if (cageDistance(f.pos) < 1.3) p += 0.14; // wall-walk
    if (o.guard !== 'none') p *= 0.5;
    if (isRocked(f)) p *= 0.4;
    if (e.rng.chance(clamp(p, base[g.pos] * 0.3, 0.8))) this.standUp('getup', f.side);
    else {
      f.action = { kind: 'recover', t: 0, dur: 0.45, label: 'getup-fail' };
      e.emit({ type: 'transitionDefended', side: o.side });
    }
  }

  // --------------------------------------------------------------- update
  update(dt: number) {
    const e = this.e;
    for (const f of e.f) {
      if (f.animT < 5) f.animT += dt;
      // knockdown timers
      if (f.down) {
        f.down.t += dt;
        if (f.down.t >= f.down.dur && e.mode === 'stand') {
          f.down = null;
          f.action = { kind: 'getup', t: 0, w: 0.45 };
          e.emit({ type: 'recoveredFromKnockdown', side: f.side });
        }
        continue;
      }
      const act = f.action;
      if (!act) continue;
      if (act.kind === 'clinchEntry') {
        act.t += dt;
        if (act.t >= act.w) {
          f.action = null;
          this.resolveClinchEntry(f);
        }
      } else if (act.kind === 'shot') {
        act.t += dt;
        if (act.t >= act.w) this.resolveShot(f);
      } else if (act.kind === 'transition') {
        act.t += dt;
        if (act.t >= act.w) this.resolveTransition(f);
      } else if (act.kind === 'getup') {
        act.t += dt;
        if (act.t >= act.w) {
          if (e.mode === 'ground' && e.ground && e.ground.top !== f.side) this.resolveGetUp(f);
          else f.action = null;
        }
      }
    }

    const clockDt = dt * e.cfg.clockSpeed;
    if (e.mode === 'clinch' && e.clinch) {
      const c = e.clinch;
      c.t += dt;
      // control drifts toward the better clinch fighter
      const [a, b] = e.f;
      const edge = ((a.data.attributes.clinch + a.data.attributes.wrestling) - (b.data.attributes.clinch + b.data.attributes.wrestling)) / 200;
      c.control = clamp(c.control + edge * 0.08 * dt, -1, 1);
      this.updatePin();
      if ((e.roundTime - c.lastAction) * e.cfg.clockSpeed > TUNING.clinchStallSeconds) {
        e.emit({ type: 'stall', mode: 'clinch' });
        this.breakClinch(-1, 'ref');
      }
    }
    if (e.mode === 'ground' && e.ground) {
      const g = e.ground;
      g.t += dt;
      e.stats.addControl(g.top, clockDt);
      if ((e.roundTime - g.lastAction) * e.cfg.clockSpeed > TUNING.groundStallSeconds) {
        e.emit({ type: 'stall', mode: 'ground' });
        this.standUp('ref', -1);
      }
    }
    if (e.mode === 'clinch' && e.clinch) {
      if (e.clinch.control > 0.35) e.stats.addControl(0, clockDt * 0.6);
      else if (e.clinch.control < -0.35) e.stats.addControl(1, clockDt * 0.6);
    }
  }
}

export type { GroundState };
