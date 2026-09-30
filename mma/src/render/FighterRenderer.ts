import { STRIKES } from '../data';
import type { FighterSnap, RenderSnap } from '../presentation/Snapshot';
import { project, type View } from './Camera';
import { applyOverride, cloneSkel, GROUND, ik, JOINTS, LYING, lerpSkel, p, SUB_POSES, type P2, type Skeleton } from './Pose';

export interface FighterStyle {
  trunks: string;
  trunksDark: string;
  glove: string;
  skin: string;
  skinShade: string;
  name: string;
}

interface Frame {
  x: number;
  z: number;
  /** +1 = local +x points to screen right. */
  dir: number;
  cos: number;
  sin: number;
  k: number;
  lift: number;
  spin: number;
}

const ease = (t: number) => t * t * (3 - 2 * t);

function strikeExt(a: { t: number; w: number; a: number; r: number; feint: boolean }): number {
  if (a.t < a.w) {
    const q = a.t / a.w;
    if (a.feint) return q < 0.6 ? 0.25 * Math.sin((q / 0.6) * Math.PI) : 0;
    return q < 0.65 ? -0.12 * (q / 0.65) : -0.12 + 1.12 * Math.pow((q - 0.65) / 0.35, 2);
  }
  if (a.t < a.w + a.a) return 1;
  return 1 - ease(Math.min(1, (a.t - a.w - a.a) / Math.max(0.01, a.r)));
}

/**
 * Procedural fighter animation. Standing poses are built every frame from the fighter's action
 * (wind-up / impact / recovery), guard, damage state and distance; ground and submission poses come
 * from authored keyframes. The displayed skeleton eases toward the target so transitions blend.
 */
export class FighterRenderer {
  private cur: [Skeleton | null, Skeleton | null] = [null, null];
  private family: [string, string] = ['', ''];
  private blend: [number, number] = [1, 1];
  private prev: [Skeleton | null, Skeleton | null] = [null, null];

  reset() {
    this.cur = [null, null];
    this.prev = [null, null];
  }

  pose(snap: RenderSnap, side: 0 | 1, time: number, dt: number): { skel: Skeleton; frame: Frame } {
    const me = snap.f[side];
    const op = snap.f[side === 0 ? 1 : 0];
    const k = (me.heightIn * 0.0254) / 1.8;
    let target: Skeleton;
    let frame: Frame;
    let fam = 'stand';
    const koVictim = snap.ko === side;
    if ((snap.mode === 'ground' || snap.mode === 'sub') && (snap.ground || snap.sub)) {
      const res = this.groundPose(snap, side, time);
      target = res.skel;
      frame = res.frame;
      fam = 'ground';
    } else if (me.down || koVictim) {
      const dir = Math.sign(op.x - me.x) || 1;
      target = cloneSkel(LYING);
      if (me.down && !me.down.heavy && me.down.t > me.down.dur * 0.6) {
        // pushing back up
        target = lerpSkel(LYING, this.standing(me, op, snap, time), (me.down.t / me.down.dur - 0.6) / 0.4 * 0.6);
      }
      frame = { x: me.x, z: me.z, dir, cos: dir, sin: 0, k, lift: 0, spin: 0 };
      fam = 'down';
    } else {
      target = this.standing(me, op, snap, time);
      const c = Math.cos(me.facing);
      const dir = c >= 0 ? 1 : -1;
      frame = { x: me.x, z: me.z, dir, cos: c, sin: Math.sin(me.facing), k, lift: 0, spin: 0 };
      const act = me.action;
      if (act?.kind === 'strike') {
        const s = STRIKES[act.id];
        if (s.arc === 'spin') {
          const total = act.w + act.a;
          frame.spin = Math.min(1, act.t / total) * Math.PI * 2;
        }
        if (s.id === 'flyingKnee' || s.id === 'supermanPunch') frame.lift = Math.max(0, strikeExt(act)) * (s.id === 'flyingKnee' ? 0.35 : 0.2);
      }
      fam = snap.mode === 'clinch' ? 'clinch' : 'stand';
    }
    // blending between pose families
    if (!this.cur[side]) this.cur[side] = cloneSkel(target);
    if (fam !== this.family[side]) {
      this.prev[side] = cloneSkel(this.cur[side]!);
      this.blend[side] = 0;
      this.family[side] = fam;
    }
    const rate = fam === 'stand' ? 38 : 14;
    const kk = 1 - Math.exp(-rate * dt);
    const cur = this.cur[side]!;
    for (const j of JOINTS) {
      cur[j].x += (target[j].x - cur[j].x) * kk;
      cur[j].y += (target[j].y - cur[j].y) * kk;
    }
    return { skel: cur, frame };
  }

  private standing(me: FighterSnap, op: FighterSnap, snap: RenderSnap, time: number): Skeleton {
    const k = (me.heightIn * 0.0254) / 1.8;
    const dist = Math.hypot(op.x - me.x, op.z - me.z) / k;
    let hipX = 0;
    let hipY = 0.95;
    let lean = 0.12;
    let lFoot = p(0.27, 0);
    let rFoot = p(-0.25, 0);
    const speed = Math.hypot(me.vx, me.vz);
    if (speed > 0.3) {
      hipY += Math.sin(time * 10 + me.side) * 0.014;
      lFoot = p(0.27 + Math.sin(time * 10) * 0.05, Math.max(0, Math.sin(time * 10)) * 0.04);
      rFoot = p(-0.25 - Math.sin(time * 10) * 0.05, Math.max(0, -Math.sin(time * 10)) * 0.04);
    } else {
      hipY += Math.sin(time * 3 + me.side * 2) * 0.008;
    }
    const clinch = snap.mode === 'clinch';
    let headDX = 0;
    let handsDrop = 0;
    if (me.rocked) {
      lean += Math.sin(time * 4.5 + me.side) * 0.12;
      handsDrop = 0.12;
    }
    if (me.hitFlash > 0) {
      if (me.hitTarget === 'head') {
        lean -= 0.32 * me.hitFlash;
        headDX -= 0.05 * me.hitFlash;
      } else if (me.hitTarget === 'body') {
        lean += 0.3 * me.hitFlash;
        hipY -= 0.05 * me.hitFlash;
      } else if (me.hitTarget === 'leg') {
        lFoot = p(lFoot.x - 0.08 * me.hitFlash, lFoot.y + 0.08 * me.hitFlash);
      }
    }
    // guard hands (in k-units, relative to the neck later)
    let lHandRel = p(0.2, 0.06 - handsDrop);
    let rHandRel = p(0.1, 0.02 - handsDrop);
    let lBend = -1;
    let rBend = -1;
    if (me.guard === 'high') {
      lHandRel = p(0.15, 0.16);
      rHandRel = p(0.1, 0.12);
    } else if (me.guard === 'low') {
      lHandRel = p(0.16, -0.18);
      rHandRel = p(0.1, -0.22);
      if (snap.mode === 'stand') lFoot = p(0.2, 0.32);
    }
    const act = me.action;
    if (act?.kind === 'defense') {
      const env = Math.sin(Math.PI * Math.min(1, act.t / act.dur));
      if (act.move === 'slip') {
        lean += 0.28 * env;
        hipY -= 0.07 * env;
        headDX += 0.05 * env;
      } else if (act.move === 'duck') {
        hipY -= 0.28 * env;
        lean += 0.55 * env;
      } else if (act.move === 'pull') {
        lean -= 0.38 * env;
        hipX -= 0.08 * env;
      } else {
        hipY -= 0.04 * env;
      }
    } else if (act?.kind === 'stun') {
      lean -= 0.12;
    } else if (act?.kind === 'shot') {
      const e = Math.min(1, act.t / act.w);
      hipY = 0.95 - 0.42 * e;
      lean = 0.12 + 1.0 * e;
      lFoot = p(0.27 + 0.45 * e, 0);
      rFoot = p(-0.25 - 0.2 * e, 0);
      lHandRel = p(0.45 * e + 0.2, -0.3 * e);
      rHandRel = p(0.4 * e + 0.1, -0.34 * e);
    } else if (act?.kind === 'recover' && (act.label === 'td-fail' || act.label === 'whiffed-shot')) {
      hipY = 0.72;
      lean = 0.7;
    } else if (act?.kind === 'clinchEntry') {
      lHandRel = p(0.4, -0.05);
      rHandRel = p(0.35, -0.08);
      lean += 0.2;
    } else if (act?.kind === 'getup') {
      const e = Math.min(1, act.t / act.w);
      hipY = 0.55 + 0.4 * e;
      lean = 0.6 - 0.48 * e;
    }
    if ((me.anim === 'sprawl' || me.anim === 'stuff') && me.animT < 0.6) {
      const e = 1 - me.animT / 0.6;
      hipY -= 0.4 * e;
      lean += 0.8 * e;
      lFoot = p(lFoot.x - 0.6 * e, 0);
      rFoot = p(rFoot.x - 0.5 * e, 0);
    }
    if (clinch) {
      lean = 0.32 + (snap.clinch && snap.clinch.pinned === me.side ? -0.15 : 0);
      lHandRel = p(0.36, 0.08);
      rHandRel = p(0.3, 0.02);
    }

    // strike overrides
    let lFootT: P2 | null = null;
    let rFootT: P2 | null = null;
    let lKneeBend = 1;
    let rKneeBend = 1;
    let kneeStrike: 'l' | 'r' | null = null;
    if (act?.kind === 'strike') {
      const s = STRIKES[act.id];
      const e = strikeExt(act);
      const neckY = hipY + Math.cos(lean) * 0.52;
      const headY = neckY + 0.14;
      const armMax = 0.58;
      const reachX = Math.max(0.35, Math.min(armMax + 0.05, dist - 0.12));
      const lead = s.limb === 'leadHand' || s.limb === 'leadLeg';
      if (s.kind === 'punch' || s.kind === 'elbow') {
        let T = p(reachX, s.target === 'head' ? 0.08 : -0.35);
        let bend = -1;
        if (clinch) T = s.kind === 'elbow' ? p(0.3, 0.18) : p(0.3, s.target === 'body' ? -0.3 : 0.02);
        switch (s.arc) {
          case 'hook':
            T = p(Math.min(0.45, reachX * 0.8), s.target === 'head' ? 0.06 : -0.35);
            bend = 1;
            lean += 0.08 * e;
            break;
          case 'upper':
            T = p(Math.min(0.4, reachX * 0.7), 0.05 + 0.25 * e - 0.25);
            bend = -1;
            hipY -= 0.05 * Math.max(0, 1 - e);
            break;
          case 'overhand':
            T = p(reachX * 0.95, 0.14 - 0.1 * e);
            bend = 1;
            lean += 0.25 * e;
            break;
          case 'spin':
            T = p(reachX, 0.06);
            break;
          case 'elbow':
            T = p(0.32, 0.16);
            bend = 1;
            break;
        }
        if (s.target === 'body') {
          lean += 0.2 * Math.max(0, e);
          hipY -= 0.08 * Math.max(0, e);
        }
        if (s.id === 'supermanPunch') lean += 0.25 * e;
        const rest = lead ? lHandRel : rHandRel;
        const ee = Math.max(-0.2, e);
        const hand = p(rest.x + (T.x - rest.x) * ee, rest.y + (T.y - rest.y) * ee);
        if (lead) {
          lHandRel = hand;
          lBend = bend;
        } else {
          rHandRel = hand;
          rBend = bend;
        }
        void headY;
      } else if (s.kind === 'kick' || s.kind === 'knee') {
        const legMax = 0.95;
        const reach = Math.max(0.5, Math.min(legMax + 0.25, dist - 0.1));
        let T: P2;
        if (s.kind === 'knee') {
          T = p(0.12, 0.72);
          kneeStrike = lead ? 'l' : 'r';
          lean -= 0.12 * e;
        } else if (s.target === 'leg') {
          T = p(reach * 0.95, s.id === 'calfKick' ? 0.28 : 0.42);
          lean -= 0.12 * e;
        } else if (s.target === 'body') {
          T = p(reach * 0.92, s.id === 'frontKick' ? 0.95 : 1.02);
          lean -= 0.3 * e;
        } else {
          T = p(reach * 0.85, 1.5);
          lean -= 0.45 * e;
        }
        if (s.id === 'spinningBackKick') T = p(reach * 0.95, 1.0);
        hipX += 0.08 * Math.max(0, e);
        const rest = lead ? lFoot : rFoot;
        const ee = Math.max(0, e);
        const foot = p(rest.x + (T.x - rest.x) * ee, rest.y + (T.y - rest.y) * ee);
        if (lead) lFootT = foot;
        else rFootT = foot;
        if (s.id === 'frontKick') {
          if (lead) lKneeBend = 1;
          else rKneeBend = 1;
        }
        // guard stays up, rear arm swings down for balance on big kicks
        if (s.target === 'head' || s.target === 'body') rHandRel = p(-0.1, -0.3 * ee);
      }
    }

    // ---- assemble skeleton (k-units, then scale)
    const hip = p(hipX, hipY);
    const neck = p(hip.x + Math.sin(lean) * 0.52, hip.y + Math.cos(lean) * 0.52);
    const head = p(neck.x + Math.sin(lean * 0.7) * 0.14 + headDX, neck.y + Math.cos(lean * 0.7) * 0.14);
    const lSh = p(neck.x + 0.03, neck.y - 0.04);
    const rSh = p(neck.x - 0.03, neck.y - 0.05);
    const lHandT = p(neck.x + lHandRel.x, neck.y + lHandRel.y);
    const rHandT = p(neck.x + rHandRel.x, neck.y + rHandRel.y);
    const la = ik(lSh, lHandT, 0.3, 0.3, lBend);
    const ra = ik(rSh, rHandT, 0.3, 0.3, rBend);
    const lf = lFootT ?? lFoot;
    const rf = rFootT ?? rFoot;
    const ll = ik(hip, lf, 0.48, 0.48, lKneeBend);
    const rl = ik(hip, rf, 0.48, 0.48, rKneeBend);
    if (kneeStrike) {
      const e = act && act.kind === 'strike' ? Math.max(0, strikeExt(act)) : 0;
      const knee = p(hip.x + 0.3 + 0.12 * e, hip.y + 0.05 + 0.25 * e);
      const foot = p(knee.x - 0.2, knee.y - 0.4);
      if (kneeStrike === 'l') {
        ll.mid = knee;
        ll.end = foot;
      } else {
        rl.mid = knee;
        rl.end = foot;
      }
    }
    const sk: Skeleton = {
      head, neck, hip,
      lElbow: la.mid, lHand: la.end, rElbow: ra.mid, rHand: ra.end,
      lKnee: ll.mid, lFoot: ll.end, rKnee: rl.mid, rFoot: rl.end,
    };
    return sk;
  }

  private groundPose(snap: RenderSnap, side: 0 | 1, time: number): { skel: Skeleton; frame: Frame } {
    const sub = snap.sub;
    const top = snap.ground?.top ?? sub?.resumeTop ?? 0;
    const bottomSide = top === 0 ? 1 : 0;
    const me = snap.f[side];
    const bot = snap.f[bottomSide];
    const topF = snap.f[top];
    const dir = Math.sign(topF.x - bot.x) || (Math.cos(bot.facing) >= 0 ? 1 : -1);
    const k = (me.heightIn * 0.0254) / 1.8;
    let posKey = snap.ground?.pos ?? sub?.resumePos ?? 'fullGuard';
    let bottomSk: Skeleton;
    let topSk: Skeleton;
    if (sub && SUB_POSES[sub.subId]) {
      const attTop = sub.attacker === top;
      const sp = SUB_POSES[sub.subId](attTop);
      posKey = sp.base as typeof posKey;
      const g = GROUND[posKey];
      bottomSk = applyOverride(g.bottom, sp.bottom);
      topSk = applyOverride(g.top, sp.top);
      // squeeze wobble scaled by tightness
      const w = Math.sin(time * 14) * 0.015 * (sub.progress / 100);
      const att = attTop ? topSk : bottomSk;
      att.lHand.y += w;
      att.rHand.y -= w;
    } else {
      const g = GROUND[posKey];
      bottomSk = cloneSkel(g.bottom);
      topSk = cloneSkel(g.top);
    }
    // ground strikes and covering
    const act = me.action;
    const isTop = side === top;
    const sk = isTop ? topSk : bottomSk;
    const other = isTop ? bottomSk : topSk;
    if (act?.kind === 'strike') {
      const e = Math.max(0, strikeExt(act));
      const tgt = other.head;
      const hand = STRIKES[act.id].limb === 'leadHand' ? 'lHand' : 'rHand';
      const elbow = hand === 'lHand' ? 'lElbow' : 'rElbow';
      const rest = sk[hand];
      sk[hand] = p(rest.x + (tgt.x - rest.x) * e, rest.y + (tgt.y + 0.05 - rest.y) * e);
      sk[elbow] = p((sk[elbow].x + sk[hand].x) / 2, Math.max(sk[elbow].y, sk[hand].y + 0.25 * e));
    }
    if (me.guard === 'high' && !isTop) {
      sk.lHand = p(sk.head.x + 0.12, sk.head.y + 0.12);
      sk.rHand = p(sk.head.x + 0.08, sk.head.y + 0.16);
    }
    if (act?.kind === 'transition' || act?.kind === 'getup') {
      const w = Math.sin(time * 18) * 0.03;
      sk.hip.y += w;
      sk.neck.y -= w;
    }
    if (me.hitFlash > 0 && me.hitTarget === 'head') sk.head.x -= 0.05 * me.hitFlash;
    const frame: Frame = { x: bot.x, z: bot.z, dir, cos: dir, sin: 0, k, lift: 0, spin: 0 };
    return { skel: sk, frame };
  }

  /** Whether the top fighter should be drawn before the bottom fighter. */
  static topFirst(snap: RenderSnap) {
    const pos = snap.ground?.pos ?? snap.sub?.resumePos;
    if (snap.sub?.subId === 'rnc') return true;
    return !!(pos && GROUND[pos]?.topFirst);
  }

  draw(ctx: CanvasRenderingContext2D, v: View, me: FighterSnap, skel: Skeleton, fr: Frame, st: FighterStyle, highlight = false) {
    const spinC = Math.cos(fr.spin);
    const dirScale = fr.dir * Math.max(0.42, Math.abs(fr.cos)) * (fr.spin ? spinC : 1);
    const toScreen = (q: P2) => {
      const lx = q.x * fr.k;
      const wx = fr.x + lx * dirScale;
      const wz = fr.z + lx * fr.sin * 0.35;
      return project(v, wx, wz, q.y * fr.k + fr.lift);
    };
    const J = {} as Record<keyof Skeleton, { x: number; y: number; s: number }>;
    for (const j of JOINTS) J[j] = toScreen(skel[j]);
    const sc = J.hip.s * fr.k;

    // shadow
    const g = project(v, fr.x + (skel.hip.x * fr.k * dirScale), fr.z, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(g.x, g.y, 0.45 * sc, 0.12 * sc, 0, 0, Math.PI * 2);
    ctx.fill();

    const line = (a: { x: number; y: number }, b: { x: number; y: number }, w: number, col: string) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = Math.max(1.5, w * sc);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };
    const limb = (a: { x: number; y: number }, m: { x: number; y: number }, b: { x: number; y: number }, w1: number, w2: number, col: string) => {
      line(a, m, w1, col);
      line(m, b, w2, col);
    };
    const legCol = (dmg: number, base: string) => (dmg > 25 ? mix(base, '#b02a2a', Math.min(0.55, (dmg - 25) / 120)) : base);
    const leadLegDmg = me.stance === 'orthodox' ? me.legL : me.legR;
    const rearLegDmg = me.stance === 'orthodox' ? me.legR : me.legL;

    // rear limbs (behind torso)
    limb(J.hip, J.rKnee, J.rFoot, 0.12, 0.1, legCol(rearLegDmg, st.skinShade));
    limb(J.neck, J.rElbow, J.rHand, 0.085, 0.075, st.skinShade);
    glove(ctx, J.rHand, sc, st, true);

    // torso
    const bodyCol = me.body > 30 ? mix(st.skin, '#b8574a', Math.min(0.4, (me.body - 30) / 150)) : st.skin;
    line(J.neck, J.hip, 0.22, bodyCol);
    // trunks
    const hipDir = { x: J.hip.x - J.neck.x, y: J.hip.y - J.neck.y };
    const hl = Math.hypot(hipDir.x, hipDir.y) || 1;
    const trunksTop = { x: J.hip.x - (hipDir.x / hl) * 0.1 * sc, y: J.hip.y - (hipDir.y / hl) * 0.1 * sc };
    const trunksBot = { x: J.hip.x + ((J.lKnee.x + J.rKnee.x) / 2 - J.hip.x) * 0.45, y: J.hip.y + ((J.lKnee.y + J.rKnee.y) / 2 - J.hip.y) * 0.45 };
    line(trunksTop, trunksBot, 0.25, st.trunks);
    line(trunksTop, { x: trunksTop.x + (trunksBot.x - trunksTop.x) * 0.2, y: trunksTop.y + (trunksBot.y - trunksTop.y) * 0.2 }, 0.26, st.trunksDark);

    // head
    const hr = 0.115 * sc;
    const swell = Math.min(1, me.swelling / 20);
    ctx.fillStyle = me.hitFlash > 0.3 && me.hitTarget === 'head' ? mix(st.skin, '#ffffff', 0.35) : mix(st.skin, '#d9837a', swell * 0.5);
    ctx.beginPath();
    ctx.arc(J.head.x, J.head.y, hr, 0, Math.PI * 2);
    ctx.fill();
    // hair / back of head
    ctx.fillStyle = '#231a15';
    ctx.beginPath();
    const back = -Math.sign(dirScale) || -1;
    ctx.arc(J.head.x + back * hr * 0.25, J.head.y - hr * 0.2, hr * 0.85, Math.PI, Math.PI * 2);
    ctx.fill();
    if (me.cut > 8) {
      ctx.fillStyle = '#b3001b';
      const cx = J.head.x - back * hr * 0.35;
      ctx.fillRect(cx - hr * 0.3, J.head.y - hr * 0.35, hr * 0.5, Math.max(1.5, hr * 0.14));
      if (me.cut > 40) ctx.fillRect(cx - hr * 0.1, J.head.y - hr * 0.3, Math.max(1.5, hr * 0.12), hr * (0.4 + me.cut / 120));
    }
    // neck
    line(J.neck, { x: (J.neck.x + J.head.x) / 2, y: (J.neck.y + J.head.y) / 2 }, 0.1, st.skin);

    // lead limbs (in front)
    limb(J.hip, J.lKnee, J.lFoot, 0.125, 0.105, legCol(leadLegDmg, st.skin));
    limb(J.neck, J.lElbow, J.lHand, 0.09, 0.08, st.skin);
    glove(ctx, J.lHand, sc, st, false);

    if (highlight) {
      ctx.fillStyle = st.trunks;
      ctx.beginPath();
      const t = project(v, fr.x, fr.z, 2.15 * fr.k);
      ctx.moveTo(t.x, t.y + 8);
      ctx.lineTo(t.x - 6, t.y);
      ctx.lineTo(t.x + 6, t.y);
      ctx.fill();
    }
  }
}

function glove(ctx: CanvasRenderingContext2D, at: { x: number; y: number }, sc: number, st: FighterStyle, rear: boolean) {
  ctx.fillStyle = rear ? '#0d0d0d' : st.glove;
  ctx.beginPath();
  ctx.arc(at.x, at.y, 0.062 * sc, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = st.trunks;
  ctx.fillRect(at.x - 0.05 * sc, at.y + 0.03 * sc, 0.1 * sc, Math.max(1, 0.02 * sc));
}

export function mix(a: string, b: string, t: number): string {
  const pa = hex(a);
  const pb = hex(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function hex(h: string): [number, number, number] {
  if (h.startsWith('rgb')) {
    const m = h.match(/\d+/g)!.map(Number);
    return [m[0], m[1], m[2]];
  }
  const x = h.replace('#', '');
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
}
