import type { FightEngine } from '../engine/FightEngine';
import type { Action, FightMode, Guard, Side } from '../engine/types';
import type { GroundPosition } from '../data';

/** Everything the renderer needs about one fighter at one instant. Also the replay frame format. */
export interface FighterSnap {
  side: Side;
  heightIn: number;
  x: number;
  z: number;
  vx: number;
  vz: number;
  facing: number;
  stance: 'orthodox' | 'southpaw';
  action: Action | null;
  guard: Guard;
  down: { t: number; dur: number; heavy: boolean } | null;
  rocked: boolean;
  hitFlash: number;
  hitTarget: 'head' | 'body' | 'leg' | null;
  anim: string;
  animT: number;
  head: number;
  body: number;
  legL: number;
  legR: number;
  cut: number;
  swelling: number;
  stamina: number;
}

export interface RenderSnap {
  t: number;
  mode: FightMode;
  ground: { top: Side; pos: GroundPosition } | null;
  clinch: { pinned: -1 | Side; control: number } | null;
  sub: { attacker: Side; subId: string; progress: number; from: 'ground' | 'stand'; resumePos: GroundPosition | null; resumeTop: Side | null } | null;
  f: [FighterSnap, FighterSnap];
  ko: Side | -1;
}

export function snapshot(e: FightEngine): RenderSnap {
  const fs = e.f.map((f) => ({
    side: f.side, heightIn: f.data.heightIn, x: f.pos.x, z: f.pos.z, vx: f.vel.x, vz: f.vel.z, facing: f.facing, stance: f.stance,
    action: f.action ? { ...f.action } : null, guard: f.guard, down: f.down ? { ...f.down } : null, rocked: f.rockedT > 0,
    hitFlash: f.hitFlash, hitTarget: f.hitTarget, anim: f.anim, animT: f.animT, head: f.head, body: f.body, legL: f.legL, legR: f.legR,
    cut: f.cut, swelling: f.swelling, stamina: f.stamina,
  })) as [FighterSnap, FighterSnap];
  let ko: Side | -1 = -1;
  if (e.result && (e.result.method === 'KO' || e.result.method === 'TKO') && e.result.winner !== null && !e.result.detail.startsWith('Doctor') && !e.result.detail.startsWith('Corner')) {
    ko = e.result.winner === 0 ? 1 : 0;
  }
  return {
    t: e.time,
    mode: e.mode,
    ground: e.ground ? { top: e.ground.top, pos: e.ground.pos } : null,
    clinch: e.clinch ? { pinned: e.clinch.pinned, control: e.clinch.control } : null,
    sub: e.sub ? { attacker: e.sub.attacker, subId: e.sub.subId, progress: e.sub.progress, from: e.sub.from, resumePos: e.sub.resume?.pos ?? null, resumeTop: e.sub.resume?.top ?? null } : null,
    f: fs,
    ko,
  };
}
