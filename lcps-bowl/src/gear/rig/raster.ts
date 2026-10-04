/**
 * Rasterizes one animation frame of the layered character rig into a 48×48 RGBA cell (origin 24,42).
 * Pure: no DOM. The same code feeds gameplay, previews and the atlas exporter (scripts/exportAtlases.ts).
 *
 * Depth: far arm → far leg → near leg → pads/jersey torso → near arm → helmet group (shell, mark, visor, mask).
 * Gear follows its joint every frame: sleeves/bands on arm segments, gloves at the wrist, socks/spats/cleats at the ankle,
 * towel and hand warmer at the waistband, back plate at the lower back. Left/right items stay on the anatomical side.
 */
import { CELL, ORIGIN, type ActionId, type Build, type Dir } from './spec';
import { POSES, type Pair, type Pose } from './pose';
import { HELMET_ART, HELMET_NECK_COL, PAD_PROFILE, type HelmetView } from './helmets';
import type { ArmLook, Look } from '../types';

type V = { x: number; y: number };
export type Side = 'L' | 'R';
export interface Anchors {
  head: V; neck: V; shoulderL: V; shoulderR: V; elbowL: V; elbowR: V; wristL: V; wristR: V;
  hipL: V; hipR: V; ankleL: V; ankleR: V; waist: V; ball: V | null;
}
export interface RigFrame { px: Uint8ClampedArray; anchors: Anchors; view: HelmetView; facing: 1 | -1 }

// ---------------------------------------------------------------- skeleton (same height for every build)
const LEN = { thigh: 5, shin: 5, foot: 2, torso: 8, upper: 4, fore: 4 };
export const BODY: Record<Build, { side: number; waistSide: number; front: number; waistFront: number; upperW: number; foreW: number; thighW: number; thighSide: number; shinW: number; hip: number; footL: number }> = {
  // front = torso width; shoulders incl. arms = front + 2*upperW → 15 / 17 / 22 px (techpack 13–15 / 16–18 / 20–22).
  // side = chest-to-back depth in profile; kept slim so players don't read as wide from the side.
  skill: { side: 5, waistSide: 4, front: 9, waistFront: 8, upperW: 3, foreW: 2, thighW: 3, thighSide: 3, shinW: 3, hip: 2, footL: 4 },
  hybrid: { side: 6, waistSide: 5, front: 11, waistFront: 9, upperW: 3, foreW: 3, thighW: 4, thighSide: 3, shinW: 3, hip: 2.5, footL: 4 },
  lineman: { side: 8, waistSide: 7, front: 14, waistFront: 12, upperW: 4, foreW: 3, thighW: 5, thighSide: 4, shinW: 3, hip: 3.5, footL: 5 },
};

const rad = (d: number) => (d * Math.PI) / 180;
const vec = (a: number, l: number): V => ({ x: Math.sin(rad(a)) * l, y: Math.cos(rad(a)) * l });
const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y });
const lerp = (a: V, b: V, t: number): V => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

// ---------------------------------------------------------------- colors
const rgbCache = new Map<string, [number, number, number]>();
function rgb(hex: string): [number, number, number] {
  let c = rgbCache.get(hex);
  if (!c) {
    const h = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
    const n = parseInt(h.slice(1, 7), 16);
    c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, c);
  }
  return c;
}
export function shadeHex(hex: string, k: number): string {
  const [r, g, b] = rgb(hex);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return `#${((1 << 24) | (f(r) << 16) | (f(g) << 8) | f(b)).toString(16).slice(1)}`;
}
const pat = (c: string[], i: number) => c[((i % c.length) + c.length) % c.length];

class Buf {
  px = new Uint8ClampedArray(CELL * CELL * 4);
  set(x: number, y: number, hex: string) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= CELL || y >= CELL || !hex) return;
    const [r, g, b] = rgb(hex);
    const i = (y * CELL + x) * 4;
    this.px[i] = r; this.px[i + 1] = g; this.px[i + 2] = b; this.px[i + 3] = 255;
  }
  rect(x: number, y: number, w: number, h: number, hex: string) {
    const x0 = Math.round(x), y0 = Math.round(y);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x0 + i, y0 + j, hex);
  }
  /** Thick segment with a square brush; color(t) picks the color along the segment (0 at a, 1 at b). */
  seg(a: V, b: V, w: number, color: (t: number) => string | null) {
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.ceil(d * 2));
    for (let s = 0; s <= n; s++) {
      const t = s / n;
      const c = color(t);
      if (!c) continue;
      const p = lerp(a, b, t);
      this.rect(Math.round(p.x - w / 2 + 0.01), Math.round(p.y - w / 2 + 0.01), w, w, c);
    }
  }
  poly(pts: V[], color: (x: number, y: number) => string) {
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs));
    const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const cx = x + 0.5, cy = y + 0.5;
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const a = pts[i], b = pts[j];
        if (a.y > cy !== b.y > cy && cx < ((b.x - a.x) * (cy - a.y)) / (b.y - a.y) + a.x) inside = !inside;
      }
      if (inside) this.set(x, y, color(x, y));
    }
  }
}

// ---------------------------------------------------------------- tiny digit font (numbers are never mirrored)
const DIGITS = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001010010', '111101111101111', '111101111001111'];
function drawNumber(buf: Buf, n: number, cx: number, top: number, color: string) {
  const s = String(Math.max(0, Math.min(99, n)));
  const w = s.length * 4 - 1;
  let x = Math.round(cx - w / 2);
  for (const ch of s) {
    const g = DIGITS[Number(ch)];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r * 3 + c] === '1') buf.set(x + c, top + r, color);
    x += 4;
  }
}

// ---------------------------------------------------------------- frame rasterization
export interface RigOptions { handed?: Side; presnap?: boolean; hasBall?: boolean; number?: number; decal?: string[][] | null; /** Export a single layer (atlas exporter); default = full composite. */ layer?: 'all' | 'body' | 'helmet' | 'pads' }

const nearSideOf = (view: Dir): Side => (view === 'left' ? 'L' : 'R');

export function rasterize(look: Look, build: Build, baseDir: Dir, action: ActionId, frameIndex: number, opt: RigOptions = {}): RigFrame {
  const poses = POSES[action];
  const pose: Pose = poses[((frameIndex % poses.length) + poses.length) % poses.length];
  // View for this frame (spin frames override the base direction)
  let dir: Dir = baseDir;
  if (pose.view === 'away') dir = 'away';
  else if (pose.view === 'toward') dir = 'toward';
  else if (pose.view === 'sideOpp') dir = baseDir === 'left' ? 'right' : baseDir === 'right' ? 'left' : baseDir;
  const B = BODY[build];
  const handed: Side = opt.handed ?? 'R';
  const other = (s: Side): Side => (s === 'R' ? 'L' : 'R');
  const baseNear = nearSideOf(baseDir);
  const near = nearSideOf(dir);
  // Which anatomical arm/leg does each pose slot drive?
  const armSides: [Side, Side] = pose.armMode === 'anat' ? [handed, other(handed)] : pose.armMode === 'carry' ? [baseNear, other(baseNear)] : [near, other(near)];
  const legSides: [Side, Side] = pose.legMode === 'anat' ? [handed, other(handed)] : [near, other(near)];
  const armAng: Record<Side, Pair> = { [armSides[0]]: pose.arms[0], [armSides[1]]: pose.arms[1] } as Record<Side, Pair>;
  const legAng: Record<Side, Pair> = { [legSides[0]]: pose.legs[0], [legSides[1]]: pose.legs[1] } as Record<Side, Pair>;
  const side = dir === 'left' || dir === 'right';
  const facing: 1 | -1 = dir === 'left' ? -1 : 1;
  const view: HelmetView = side ? 'side' : dir === 'toward' ? 'front' : 'back';
  const buf = new Buf();

  // ---------- skeleton in body space (x forward / lateral, y down, ground at 0)
  const drop = (p: Pair) => Math.cos(rad(p[0])) * LEN.thigh + Math.cos(rad(p[1])) * LEN.shin;
  const hipH = Math.max(drop(legAng.L), drop(legAng.R), 2) + LEN.foot;
  const hip: V = { x: side ? pose.shift ?? 0 : 0, y: -hipH - (pose.lift ?? 0) };
  const leanEff = side ? pose.lean : 0;
  const torsoLen = side ? LEN.torso : Math.max(4, LEN.torso * Math.cos(rad(Math.min(80, Math.abs(pose.lean)))) + (Math.abs(pose.lean) > 50 ? 1 : 0));
  const up: V = { x: Math.sin(rad(leanEff)), y: -Math.cos(rad(leanEff)) };
  const fwd: V = { x: -up.y, y: up.x }; // perpendicular, pointing forward
  const shoulder = add(hip, { x: up.x * torsoLen, y: up.y * torsoLen - (pose.chest ?? 0) });
  // lateral offsets for front/back views (screen x). Anatomical right appears on screen left when facing the camera.
  const latSign = (s: Side) => (dir === 'toward' ? (s === 'R' ? -1 : 1) : (s === 'R' ? 1 : -1));
  const pads = PAD_PROFILE[look.pads ?? 'standard'] ?? PAD_PROFILE.standard;

  const legJ = (s: Side) => {
    const [t, sh] = legAng[s];
    if (side) {
      const knee = add(hip, vec(t, LEN.thigh));
      return { hip: hip, knee, ankle: add(knee, vec(sh, LEN.shin)) };
    }
    const lx = latSign(s) * (B.hip + Math.max(-1, (pose.spread ?? 0) * 0.5));
    const h = { x: hip.x + latSign(s) * B.hip * 0.6, y: hip.y };
    const knee = { x: lx, y: hip.y + Math.cos(rad(t)) * LEN.thigh };
    return { hip: h, knee, ankle: { x: lx, y: knee.y + Math.cos(rad(sh)) * LEN.shin } };
  };
  const armJ = (s: Side) => {
    const [u, f] = armAng[s];
    let sj: V, elbow: V, wrist: V;
    if (side) {
      sj = add(shoulder, { x: up.x * -1 + fwd.x * 0.5, y: -up.y * -1 + 0 });
      sj = { x: shoulder.x - up.x * 1, y: shoulder.y - up.y * 1 };
      elbow = add(sj, vec(u, LEN.upper));
      wrist = add(elbow, vec(f, LEN.fore));
    } else {
      const lat = latSign(s);
      sj = { x: lat * (B.front / 2 + B.upperW / 2 - 0.5 + pads.cap * 0.5), y: shoulder.y + 1 };
      const fl = (pose.flare ?? 0) * 0.5;
      elbow = { x: sj.x + lat * (Math.abs(Math.sin(rad(u))) * LEN.upper * 0.35 + fl), y: sj.y + Math.cos(rad(u)) * LEN.upper };
      wrist = { x: elbow.x + lat * (Math.abs(Math.sin(rad(f))) * LEN.fore * 0.3 + fl), y: elbow.y + Math.cos(rad(f)) * LEN.fore };
    }
    return { sj, elbow, wrist };
  };
  let legs = { L: legJ('L'), R: legJ('R') };
  let arms = { L: armJ('L'), R: armJ('R') };
  // Three-point stance / snap: the down hand reaches the turf
  if (pose.reachGround !== undefined) {
    const s = armSides[pose.reachGround];
    arms[s] = { ...arms[s], wrist: { x: arms[s].wrist.x, y: -1.5 } };
    if (arms[s].elbow.y > -2) arms[s].elbow = lerp(arms[s].sj, arms[s].wrist, 0.5);
  }
  // Torso polygon (pads widen/round the shoulders under the jersey)
  const half = (side ? B.side : B.front) / 2;
  const halfW = (side ? B.waistSide : B.waistFront) / 2 + pads.plate * 0.5;
  const capHalf = half + (side ? Math.min(1, pads.cap * 0.5) : pads.cap);
  const rise = pads.rise;
  let torso: V[];
  if (side) {
    const sb = add(shoulder, { x: -fwd.x * capHalf, y: -fwd.y * capHalf });
    const sf = add(shoulder, { x: fwd.x * capHalf, y: fwd.y * capHalf });
    const capDown = { x: -up.x * pads.capRows, y: -up.y * pads.capRows };
    const top = (k: number) => add(shoulder, { x: fwd.x * k + up.x * rise, y: fwd.y * k + up.y * rise });
    torso = [
      add(hip, { x: -fwd.x * halfW, y: -fwd.y * halfW }),
      add(sb, capDown),
      pads.round ? top(-(capHalf - 1)) : top(-capHalf),
      pads.round ? top(capHalf - 1) : top(capHalf),
      add(sf, capDown),
      add(hip, { x: fwd.x * halfW, y: fwd.y * halfW }),
    ];
  } else {
    torso = [
      { x: -halfW, y: hip.y },
      { x: -capHalf, y: shoulder.y + pads.capRows },
      { x: -(capHalf - (pads.round ? 1 : 0)), y: shoulder.y - rise },
      { x: capHalf - (pads.round ? 1 : 0), y: shoulder.y - rise },
      { x: capHalf, y: shoulder.y + pads.capRows },
      { x: halfW, y: hip.y },
    ];
  }
  const pelvis: V[] = side
    ? [add(hip, { x: -fwd.x * halfW, y: -fwd.y * halfW }), add(hip, { x: fwd.x * halfW, y: fwd.y * halfW }), add(hip, { x: fwd.x * (halfW - 1), y: 2.2 }), add(hip, { x: -fwd.x * (halfW - 1), y: 2.2 })]
    : [{ x: -halfW, y: hip.y - 0.5 }, { x: halfW, y: hip.y - 0.5 }, { x: halfW - 0.5, y: hip.y + 2.2 }, { x: -halfW + 0.5, y: hip.y + 2.2 }];
  const headBase: V = side ? add(shoulder, { x: up.x * 0.6 + fwd.x * 0.6, y: up.y * 0.6 }) : { x: 0, y: shoulder.y };

  // ---------- whole-body rotation (dive / tackled / prone) and grounding
  const rotDeg = pose.rot ?? 0;
  const R = (p: V): V => {
    if (!rotDeg) return p;
    const a = rad(rotDeg) * (side ? 1 : 0.6);
    const dx = p.x - hip.x, dy = p.y - hip.y;
    return { x: hip.x + dx * Math.cos(a) - dy * Math.sin(a), y: hip.y + dx * Math.sin(a) + dy * Math.cos(a) };
  };
  const mapLimb = <T extends Record<string, V>>(o: T): T => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, R(v)])) as T;
  legs = { L: mapLimb(legs.L), R: mapLimb(legs.R) };
  arms = { L: mapLimb(arms.L), R: mapLimb(arms.R) };
  torso = torso.map(R);
  let pelvisR = pelvis.map(R);
  let headR = R(headBase);
  let dy = 0;
  if (pose.ground || rotDeg) {
    const pts = [...torso, ...pelvisR, legs.L.ankle, legs.R.ankle, legs.L.knee, legs.R.knee, arms.L.wrist, arms.R.wrist, arms.L.elbow, arms.R.elbow];
    const maxY = Math.max(...pts.map((p) => p.y + 1), headR.y + 1);
    if (pose.ground) dy = -maxY - (pose.lift ?? 0) + (Math.abs(rotDeg) > 60 ? 0.6 : 0);
  }
  const lying = Math.abs(rotDeg) > 60;
  // ---------- to cell coordinates
  const fx = side ? facing : 1;
  const C = (p: V): V => ({ x: ORIGIN.x + p.x * fx, y: ORIGIN.y + p.y + dy });
  const CL = <T extends Record<string, V>>(o: T): T => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, C(v)])) as T;
  const lg = { L: CL(legs.L), R: CL(legs.R) };
  const am = { L: CL(arms.L), R: CL(arms.R) };
  const torsoC = torso.map(C);
  pelvisR = pelvisR.map(C);
  headR = C(headR);

  // ---------- painters
  const jersey = look.jersey, jShade = look.jerseyShade;
  const drawLeg = (s: Side, far: boolean) => {
    const j = lg[s];
    const pants = far ? look.pantsShade : look.pants;
    const sockC = (i: number) => (far ? shadeHex(pat(look.socks, i), -0.15) : pat(look.socks, i));
    buf.seg(j.hip, j.knee, side ? B.thighSide : B.thighW, () => pants);
    // shin: pants over the knee, then leg sleeve or socks
    buf.seg(j.knee, j.ankle, B.shinW, (t) => (t < 0.2 ? pants : look.legsleeve && t < 0.8 ? pat(look.legsleeve, Math.floor(t * 4)) : sockC(Math.floor(t * 5))));
    // spats / tape at the ankle
    const footDir = side ? fx : 1;
    const fl = side ? B.footL : B.shinW + 1;
    const ax = Math.round(side ? j.ankle.x - (footDir > 0 ? 1 : fl - 2) : j.ankle.x - fl / 2 + 0.5);
    const ay = Math.round(j.ankle.y);
    const cleat = look.cleats.colors;
    const cc = (i: number) => (far ? shadeHex(pat(cleat, i), -0.15) : pat(cleat, i));
    if (lying && side) {
      buf.rect(Math.round(j.ankle.x - 1), Math.round(j.ankle.y - 1), 2, 3, cc(0));
      return;
    }
    if (look.cleats.style === 'high' || look.cleats.style === 'mid') buf.rect(Math.round(j.ankle.x - B.shinW / 2 + 0.01), ay - 1, B.shinW, 1, cc(0));
    for (let i = 0; i < fl; i++) {
      buf.set(ax + i, ay, cc(i));
      buf.set(ax + i, ay + 1, shadeHex(cc(i + 1), -0.35));
    }
    if (look.spats) {
      const sc = (i: number) => (far ? shadeHex(pat(look.spats!.colors, i), -0.12) : pat(look.spats!.colors, i));
      const lv = look.spats.level;
      buf.rect(Math.round(j.ankle.x - B.shinW / 2 + 0.01), ay - Math.min(2, lv), B.shinW, Math.min(2, lv), sc(0));
      if (lv >= 3) for (let i = 0; i < fl - 1; i++) buf.set(ax + (side && footDir < 0 ? i + 1 : i), ay, sc(i));
    }
  };
  const drawArm = (s: Side, far: boolean) => {
    const j = am[s];
    const g: ArmLook = look.arms[s];
    const skin = far ? shadeHex(look.skin, -0.14) : look.skin;
    const jc = far ? jShade : jersey;
    const sl = g.sleeve;
    const slc = (t: number) => (sl ? (far ? shadeHex(pat(sl.colors, Math.floor(t * 4)), -0.12) : pat(sl.colors, Math.floor(t * 4))) : null);
    const uw = B.upperW + (sl?.padded ? 0 : 0);
    buf.seg(j.sj, j.elbow, uw, (t) => {
      if (t < 0.42) return jc; // jersey sleeve over the pads
      if (g.band && t > 0.66 && t < 0.86) return pat(g.band, 0);
      if (sl && sl.len === 'full') return slc(t);
      return skin;
    });
    buf.seg(j.elbow, j.wrist, B.foreW + (sl?.padded ? 1 : 0), (t) => {
      if (g.brace && t < 0.25) return g.brace;
      if (g.wristCoach && t > 0.45) return far ? '#c9d1dc' : '#eef3fa';
      if (g.wrist && t > 0.72) return pat(g.wrist, 0);
      if (sl) return slc(t);
      return skin;
    });
    const hand = g.glove ? (far ? shadeHex(pat(g.glove, 0), -0.12) : pat(g.glove, 0)) : skin;
    const hs = build === 'lineman' ? 3 : 2;
    const hp = side ? add(j.wrist, { x: 0, y: 0 }) : j.wrist;
    buf.rect(Math.round(hp.x - hs / 2 + 0.01), Math.round(hp.y - 0.5), hs, 2, hand);
    if (g.glove && g.glove.length > 1) buf.set(Math.round(hp.x), Math.round(hp.y) + 1, pat(g.glove, 1));
  };
  const drawTorso = () => {
    const top = Math.min(...torsoC.map((p) => p.y));
    buf.poly(torsoC, (x, y) => {
      // back edge / far side shading for depth, pad seam line
      if (side) {
        const backX = facing > 0 ? Math.min(...torsoC.map((p) => p.x)) : Math.max(...torsoC.map((p) => p.x));
        if (Math.abs(x + 0.5 - backX) < 1.2 && !lying) return jShade;
      }
      if (pads.seam && Math.round(y) === Math.round(top) + pads.capRows && !lying) return jShade;
      return jersey;
    });
    buf.poly(pelvisR, () => look.pants);
    // belt line
    if (!lying) {
      const bx0 = Math.min(...pelvisR.map((p) => p.x)), bx1 = Math.max(...pelvisR.map((p) => p.x));
      const by = Math.round(Math.min(...pelvisR.map((p) => p.y)));
      for (let x = Math.round(bx0); x < Math.round(bx1); x++) buf.set(x, by, look.pantsShade);
    }
    // Numbers (front and back views), never mirrored
    if (!side && !lying && opt.number != null) drawNumber(buf, opt.number, ORIGIN.x, Math.round(top) + 2, look.numbers);
    // Side view: small sleeve number stripe
    if (side && !lying) buf.set(Math.round(am[near].sj.x), Math.round(am[near].sj.y) + 1, look.numbers);
    // Neck roll / undershirt collar
    const nk = C(add(headBase, { x: 0, y: 0 }));
    if (look.neckRoll && !lying) buf.rect(Math.round(nk.x - (side ? 2 : 3)), Math.round(nk.y), side ? 4 : 6, 1, look.neckRoll);
    else if (look.undershirt && !lying) buf.rect(Math.round(nk.x - 1), Math.round(nk.y), 2, 1, pat(look.undershirt, 0));
    // Waistband items
    const waistY = Math.round(Math.min(...pelvisR.map((p) => p.y))) + 1;
    const frontX = side ? Math.round(ORIGIN.x + (hip.x + fwd.x * (halfW - 0.5)) * fx) : ORIGIN.x;
    const backX = side ? Math.round(ORIGIN.x + (hip.x - fwd.x * (halfW - 0.5)) * fx) : ORIGIN.x;
    if (look.handwarmer && dir !== 'away' && !lying) buf.rect(side ? frontX - (fx > 0 ? 1 : 0) : ORIGIN.x - 2, waistY - 1, side ? 2 : 4, 2, pat(look.handwarmer, 0));
    if (look.towel && !lying) {
      const tp = look.towel.pos;
      const tc = (i: number) => pat(look.towel!.colors, i);
      let tx: number | null = null;
      if (side) {
        if (tp === 'front') tx = frontX;
        else if (tp === 'back') tx = backX;
        else if ((tp === 'right' ? 'R' : 'L') === near) tx = Math.round(ORIGIN.x + hip.x * fx);
      } else {
        if (tp === 'front' && dir === 'toward') tx = ORIGIN.x - 1;
        else if (tp === 'back' && dir === 'away') tx = ORIGIN.x;
        else if (tp === 'left' || tp === 'right') tx = Math.round(ORIGIN.x + latSign(tp === 'right' ? 'R' : 'L') * (halfW - 1));
      }
      if (tx != null) for (let k = 0; k < 4; k++) buf.set(tx, waistY + k, tc(k));
    }
    if (look.backPlate && !lying && (dir === 'away' || side)) {
      if (side) buf.rect(backX - (fx > 0 ? 1 : 0), waistY - 2, 2, 2, look.backPlate);
      else buf.rect(ORIGIN.x - 2, waistY - 1, 4, 2, look.backPlate);
    }
  };
  const drawHelmet = () => {
    const art = HELMET_ART[look.helmet.model] ?? HELMET_ART.standard;
    const grid = art[view];
    const w = grid[0].length;
    const hgt = grid.length;
    // anchor: side → neck column; front/back → centered
    const anchorCol = view === 'side' ? HELMET_NECK_COL : w / 2;
    const bx = Math.round(headR.x - (view === 'side' && facing < 0 ? w - 1 - anchorCol : anchorCol));
    const by = Math.round(headR.y - hgt + 1 + (lying ? 2 : 0));
    const h = look.helmet;
    const heavyMask = ['lb', 'dl', 'cage', 'bigcage', 'aggressive'].includes(look.mask.style);
    // school mark: downsampled official logo, placed over the L cells
    const lcells: [number, number][] = [];
    for (let r = 0; r < hgt; r++) for (let c = 0; c < w; c++) if (grid[r][c] === 'L') lcells.push([r, c]);
    const lr0 = Math.min(...lcells.map((x) => x[0]), 99), lc0 = Math.min(...lcells.map((x) => x[1]), 99), lcMax = Math.max(...lcells.map((x) => x[1]), 0);
    for (let r = 0; r < hgt; r++) for (let c = 0; c < w; c++) {
      let ch = grid[r][c];
      if (ch === '.') continue;
      if (heavyMask && ch === 'F' && r >= hgt - 3) ch = 'M';
      let col: string | null = h.shell;
      switch (ch) {
        case 'S': col = h.finish === 'chrome' ? (r <= 1 ? h.hi : r >= hgt - 3 ? h.shade : h.shell) : h.finish === 'metallic' && (r + c) % 3 === 0 ? h.hi : h.shell; break;
        case 'D': col = h.shade; break;
        case 'H': col = h.finish === 'matte' ? h.shell : h.hi; break;
        case 'K': col = '#16161c'; break;
        case 'J': col = h.shade; break;
        case 'F': col = look.skin; break;
        case 'E': col = look.visor ? pat(look.visor, c) : shadeHex(look.skin, -0.45); break;
        case 'M': col = look.mask.color; break;
        case 'C': col = '#f2f2f2'; break;
        case 'B': col = c % 2 === 0 ? '#2a2d33' : '#c9ced6'; break;
        case 'L': {
          // Downsampled official school logo. Mirrored helmets still show the mark unmirrored (readable).
          const d = h.logo === undefined ? null : opt.decal;
          const idx = view === 'side' && facing < 0 ? lcMax - c : c - lc0;
          col = (d && d[r - lr0]?.[idx]) || h.shell;
          break;
        }
      }
      const x = view === 'side' && facing < 0 ? bx + (w - 1 - c) : bx + c;
      if (col) buf.set(x, by + r, col);
    }
    // stripe
    if (h.stripe) {
      if (view === 'side') {
        for (let c = 1; c < w - 3; c++) if ('SH'.includes(grid[0][c]) || 'SH'.includes(grid[1][c])) {
          const r = 'SH'.includes(grid[0][c]) ? 0 : 1;
          if (c >= 2 && c <= 6) buf.set(view === 'side' && facing < 0 ? bx + (w - 1 - c) : bx + c, by + r, h.stripe);
        }
      } else {
        for (let r = 0; r < 3; r++) for (const c of [3, 4]) if ('SHK'.includes(grid[r][c])) buf.set(bx + c, by + r, h.stripe);
      }
    }
    // visor glint
    if (look.visor && view !== 'back') {
      for (let r = 0; r < hgt; r++) for (let c = 0; c < w; c++) if (grid[r][c] === 'E' && look.visor.length > 1) { buf.set(view === 'side' && facing < 0 ? bx + (w - 1 - c) : bx + c, by + r, look.visor[1]); r = hgt; break; }
    }
    // eye black
    if (look.eyeBlack && view !== 'back') {
      for (let r = 0; r < hgt; r++) for (let c = 0; c < w; c++) if (grid[r][c] === 'F' && grid[r - 1]?.[c] === 'E') buf.set(view === 'side' && facing < 0 ? bx + (w - 1 - c) : bx + c, by + r, '#111111');
    }
    // mouthguard (hangs from the mask pre-snap when strapped)
    if (look.mouthguard && view !== 'back') {
      const hang = look.mouthguard.hang && (opt.presnap || action === 'idle' || action === 'celebrate');
      const mx = view === 'side' ? (facing > 0 ? bx + w - 2 : bx + 1) : bx + w / 2;
      buf.set(mx, by + hgt - (hang ? 0 : 2), look.mouthguard.color);
    }
    return { x: bx + w / 2, y: by + hgt / 2 };
  };

  // ---------- paint in depth order
  const farS: Side = side ? (near === 'R' ? 'L' : 'R') : 'L';
  const nearS: Side = side ? near : 'R';
  const layer = opt.layer ?? 'all';
  if (layer === 'pads') {
    // shoulder-pad silhouette layer (sits under the jersey; jersey color shows its shape)
    buf.poly(torsoC, () => jersey);
  } else if (layer !== 'helmet') {
    if (side) {
      drawArm(farS, true);
      drawLeg(farS, true);
      drawLeg(nearS, false);
      drawTorso();
      drawArm(nearS, false);
    } else {
      drawLeg('L', false);
      drawLeg('R', false);
      if (dir === 'away') { drawArm('L', false); drawArm('R', false); drawTorso(); }
      else { drawTorso(); drawArm('L', false); drawArm('R', false); }
    }
  }
  const head = layer === 'all' || layer === 'helmet' ? drawHelmet() : { x: headR.x, y: headR.y - 4 };

  // ---------- anchors + football grip
  const mid = (a: V, b: V) => lerp(a, b, 0.5);
  let ball: V | null = null;
  const bf = (p: V, k = 1) => ({ x: p.x + (side ? fx * k : 0), y: p.y });
  switch (pose.ball) {
    case 'tuck': ball = bf(am[armSides[0]].wrist, 0); break;
    case 'hands': ball = bf(mid(am.L.wrist, am.R.wrist), 1); break;
    case 'handsFront': ball = bf(mid(am.L.wrist, am.R.wrist), 2); break;
    case 'handsHigh': ball = { x: mid(am.L.wrist, am.R.wrist).x, y: Math.min(am.L.wrist.y, am.R.wrist.y) - 1 }; break;
    case 'handA': ball = bf(am[armSides[0]].wrist, 0.5); break;
    case 'ground': ball = { x: ORIGIN.x + (side ? fx * 4 : 0), y: ORIGIN.y - 1 + dy }; break;
    default: ball = null;
  }
  const anchors: Anchors = {
    head, neck: headR, shoulderL: am.L.sj, shoulderR: am.R.sj, elbowL: am.L.elbow, elbowR: am.R.elbow, wristL: am.L.wrist, wristR: am.R.wrist,
    hipL: lg.L.hip, hipR: lg.R.hip, ankleL: lg.L.ankle, ankleR: lg.R.ankle, waist: C(hip), ball,
  };
  return { px: buf.px, anchors, view, facing };
}
