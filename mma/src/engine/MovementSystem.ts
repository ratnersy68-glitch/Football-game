import { clamp, damp, vdist, vlen, vnorm, vsub, wrapAngle } from '../core/math';
import type { FightEngine } from './FightEngine';
import { fatigueFactor, isRocked, worstLeg } from './FighterState';
import { constrainToCage } from './Octagon';
import { TUNING } from './tuning';
import type { Command, FighterState } from './types';

/**
 * Footwork, facing, spacing and cage collision. Movement speed depends on speed, stamina, leg damage,
 * being rocked and whether the guard is up. Nobody walks through the fence or through each other.
 */
export class MovementSystem {
  constructor(private e: FightEngine) {}

  maxSpeed(f: FighterState) {
    const a = f.data.attributes;
    let v = TUNING.baseMoveSpeed * (0.72 + a.speed * 0.0042);
    v *= 0.55 + 0.45 * fatigueFactor(f);
    v *= Math.max(0.45, 1 - worstLeg(f) * 0.0055);
    if (isRocked(f)) v *= 0.62;
    if (f.guard !== 'none') v *= 0.72;
    return v;
  }

  update(dt: number, cmds: [Command, Command]) {
    const e = this.e;
    if (e.mode === 'stand') this.updateStanding(dt, cmds);
    else if (e.mode === 'clinch') this.updateClinch(dt, cmds);
    else this.updateGround();
  }

  private updateStanding(dt: number, cmds: [Command, Command]) {
    const e = this.e;
    for (const f of e.f) {
      const o = e.f[f.side === 0 ? 1 : 0];
      const cmd = cmds[f.side];
      const toO = vnorm(vsub(o.pos, f.pos));
      let target = { x: 0, z: 0 };
      if (f.down) {
        f.vel.x *= 0.8;
        f.vel.z *= 0.8;
      } else {
        const act = f.action;
        let m = cmd.move;
        const ml = vlen(m);
        if (ml > 1) m = { x: m.x / ml, z: m.z / ml };
        let speed = this.maxSpeed(f);
        if (act?.kind === 'strike') speed *= 0.35;
        else if (act?.kind === 'stun') speed *= 0.2;
        else if (act?.kind === 'recover' || act?.kind === 'getup' || act?.kind === 'clinchEntry' || act?.kind === 'transition') speed *= 0.3;
        const back = m.x * toO.x + m.z * toO.z < -0.3;
        if (back) speed *= 0.86;
        target = { x: m.x * speed, z: m.z * speed };
        if (act?.kind === 'defense') {
          const lat = { x: -toO.z * act.dir, z: toO.x * act.dir };
          if (act.move === 'sidestep' && act.t < act.dur * 0.75) target = { x: lat.x * 3.6, z: lat.z * 3.6 };
          if (act.move === 'pull' && act.t < act.dur * 0.7) target = { x: -toO.x * 2.6, z: -toO.z * 2.6 };
          if (act.move === 'slip') target = { x: target.x * 0.5 + lat.x * 0.4, z: target.z * 0.5 + lat.z * 0.4 };
        }
        if (act?.kind === 'shot' && act.t < act.w) {
          const lunge = act.variant === 'single' ? 4.2 : 3.8;
          target = { x: toO.x * lunge, z: toO.z * lunge };
        }
      }
      const k = damp(f.action?.kind === 'defense' || f.action?.kind === 'shot' ? 22 : 11, dt);
      f.vel.x += (target.x - f.vel.x) * k;
      f.vel.z += (target.z - f.vel.z) * k;
      f.pos.x += f.vel.x * dt;
      f.pos.z += f.vel.z * dt;
      // Face the opponent (turn rate limited: side-steps can steal an angle)
      if (!f.down) {
        const want = Math.atan2(toO.z, toO.x);
        const diff = wrapAngle(want - f.facing);
        const rate = TUNING.turnRate * (isRocked(f) ? 0.45 : 1) * (0.75 + f.data.attributes.speed * 0.004);
        f.facing = wrapAngle(f.facing + clamp(diff, -rate * dt, rate * dt));
      }
      f.move = cmd.move;
    }
    this.separate();
    for (const f of e.f) constrainToCage(f.pos, TUNING.fighterRadius);
  }

  private separate() {
    const [a, b] = this.e.f;
    const d = vdist(a.pos, b.pos);
    const min = a.down || b.down ? 0.9 : TUNING.minSeparation;
    if (d < min) {
      const n = d > 1e-4 ? vnorm(vsub(b.pos, a.pos)) : { x: 1, z: 0 };
      const push = (min - d) / 2;
      a.pos.x -= n.x * push;
      a.pos.z -= n.z * push;
      b.pos.x += n.x * push;
      b.pos.z += n.z * push;
    }
  }

  private updateClinch(dt: number, cmds: [Command, Command]) {
    const e = this.e;
    const c = e.clinch!;
    const [a, b] = e.f;
    // The fighter with better control drives the pair.
    const driver = c.control >= 0 ? a : b;
    const m = cmds[driver.side].move;
    const strength = 0.55 * Math.min(1, Math.abs(c.control) + 0.3);
    const mid = { x: (a.pos.x + b.pos.x) / 2 + m.x * strength * dt, z: (a.pos.z + b.pos.z) / 2 + m.z * strength * dt };
    let axis = vnorm(vsub(b.pos, a.pos));
    if (vlen(axis) < 0.5) axis = { x: 1, z: 0 };
    const half = 0.28;
    a.pos = { x: mid.x - axis.x * half, z: mid.z - axis.z * half };
    b.pos = { x: mid.x + axis.x * half, z: mid.z + axis.z * half };
    const ta = constrainToCage(a.pos, TUNING.fighterRadius);
    const tb = constrainToCage(b.pos, TUNING.fighterRadius);
    if (ta || tb) {
      // keep the pair rigid after the fence pushes one of them
      if (ta) b.pos = { x: a.pos.x + axis.x * half * 2, z: a.pos.z + axis.z * half * 2 };
      else a.pos = { x: b.pos.x - axis.x * half * 2, z: b.pos.z - axis.z * half * 2 };
      constrainToCage(a.pos, TUNING.fighterRadius);
      constrainToCage(b.pos, TUNING.fighterRadius);
    }
    a.facing = Math.atan2(axis.z, axis.x);
    b.facing = Math.atan2(-axis.z, -axis.x);
    a.vel = { x: 0, z: 0 };
    b.vel = { x: 0, z: 0 };
  }

  private updateGround() {
    const e = this.e;
    const g = e.ground ?? e.sub?.resume;
    if (!g) return;
    const top = e.f[g.top];
    const bot = e.f[g.top === 0 ? 1 : 0];
    constrainToCage(bot.pos, 0.9);
    const dir = Math.cos(bot.facing) >= 0 ? 1 : -1;
    top.pos = { x: bot.pos.x + dir * 0.32, z: bot.pos.z };
    top.facing = dir > 0 ? Math.PI : 0;
    top.vel = { x: 0, z: 0 };
    bot.vel = { x: 0, z: 0 };
  }
}
