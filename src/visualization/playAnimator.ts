/**
 * PlayAnimator: converts a simulated PlayEvent into a PlayAnimation.
 *
 * SIMULATION RESULT → PLAY EVENT → ANIMATION. Nothing here affects the outcome: the animator only
 * choreographs players so that the ball ends exactly where the engine said it did. Visual randomness
 * uses its own seeded generator derived from the event, so replays look identical.
 */
import { FORMATIONS } from '../data';
import { Rng, seedFrom } from '../core/rng';
import { clamp } from '../core/util';
import type { Player, Side } from '../models/types';
import type { PlayEvent } from '../simulation/game/types';
import { sample, type Actor, type Keyframe, type Marker, type PlayAnimation } from './animation';

const PRE = 1.1; // seconds of pre-snap alignment
const W = 53.33;
const other = (s: Side): Side => (s === 'home' ? 'away' : 'home');

type BallSeg =
  | { kind: 'hold'; t0: number; id: string }
  | { kind: 'flight'; t0: number; t1: number; from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number }; peak: number }
  | { kind: 'ground'; t0: number; x: number; y: number };

class Builder {
  actors = new Map<string, Actor>();
  markers: Marker[] = [];
  ballPlan: BallSeg[] = [];
  rng: Rng;
  losX: number;
  constructor(
    public ev: PlayEvent,
    public players: Record<string, Player>,
    public dir: 1 | -1,
    ballOn: number,
  ) {
    this.rng = new Rng(seedFrom('anim', ev.index, ev.clockBefore, ev.spotY));
    this.losX = dir === 1 ? ballOn : 100 - ballOn;
  }
  /** World x from offense-relative yards (+ = toward the offense's goal). */
  X(u: number): number {
    return this.losX + this.dir * u;
  }
  /** Offense-relative u from world x. */
  U(x: number): number {
    return (x - this.losX) * this.dir;
  }
  add(id: string | undefined, side: Side, role: string, u: number, y: number): Actor | undefined {
    if (!id || this.actors.has(id)) return this.actors.get(id ?? '');
    const p = this.players[id];
    const a: Actor = { id, side, role, number: p?.jersey ?? 0, path: [{ t: 0, x: this.X(u), y: clamp(y, 0.8, W - 0.8) }] };
    this.actors.set(id, a);
    return a;
  }
  /** Append a keyframe in offense-relative coordinates. */
  to(id: string | undefined, t: number, u: number, y: number, z = 0): void {
    const a = id ? this.actors.get(id) : undefined;
    if (!a) return;
    a.path.push({ t, x: this.X(u), y: clamp(y, 0.5, W - 0.5), z });
  }
  toW(id: string | undefined, t: number, x: number, y: number): void {
    const a = id ? this.actors.get(id) : undefined;
    if (!a) return;
    a.path.push({ t, x: clamp(x, -11, 111), y: clamp(y, 0.5, W - 0.5) });
  }
  pos(id: string | undefined, t: number) {
    const a = id ? this.actors.get(id) : undefined;
    if (!a) return { x: this.losX, y: W / 2, z: 0 };
    return sample(a.path, t);
  }
  /** Keep an actor still until t (adds a hold keyframe at its current last position). */
  hold(id: string | undefined, t: number): void {
    const a = id ? this.actors.get(id) : undefined;
    if (!a) return;
    const last = a.path[a.path.length - 1];
    if (t > last.t) a.path.push({ ...last, t });
  }
  holdAll(t: number): void {
    for (const id of this.actors.keys()) this.hold(id, t);
  }
  /** Move toward a world target, covering fraction k of the way, arriving at t. */
  pursue(id: string, t: number, tx: number, ty: number, k: number): void {
    const a = this.actors.get(id);
    if (!a) return;
    const last = a.path[a.path.length - 1];
    this.toW(id, t, last.x + (tx - last.x) * k, last.y + (ty - last.y) * k);
  }
  build(duration: number): PlayAnimation {
    const ball = this.ballPath(duration);
    return { duration, actors: [...this.actors.values()], ball, markers: this.markers.sort((a, b) => a.t - b.t) };
  }
  private ballPath(duration: number): Keyframe[] {
    const out: Keyframe[] = [];
    const segs = [...this.ballPlan].sort((a, b) => a.t0 - b.t0);
    for (let t = 0; t <= duration + 1e-6; t += 0.04) {
      let seg: BallSeg | undefined;
      for (const s of segs) if (s.t0 <= t) seg = s;
      if (!seg) seg = segs[0];
      if (!seg) break;
      if (seg.kind === 'hold') {
        const p = this.pos(seg.id, t);
        out.push({ t, x: p.x + this.dir * 0.25, y: p.y + 0.2, z: 1.1 });
      } else if (seg.kind === 'flight') {
        const k = clamp((t - seg.t0) / (seg.t1 - seg.t0), 0, 1);
        const x = seg.from.x + (seg.to.x - seg.from.x) * k;
        const y = seg.from.y + (seg.to.y - seg.from.y) * k;
        const z = seg.from.z + (seg.to.z - seg.from.z) * k + 4 * seg.peak * k * (1 - k);
        out.push({ t, x, y, z });
      } else {
        out.push({ t, x: seg.x, y: seg.y, z: 0.15 });
      }
    }
    return out;
  }
  holdBall(t0: number, id: string | undefined): void {
    if (id) this.ballPlan.push({ kind: 'hold', t0, id });
  }
  flight(t0: number, t1: number, from: { x: number; y: number; z?: number }, to: { x: number; y: number; z?: number }, peak: number): void {
    this.ballPlan.push({ kind: 'flight', t0, t1, from: { x: from.x, y: from.y, z: from.z ?? 1.8 }, to: { x: to.x, y: to.y, z: to.z ?? 1.2 }, peak });
  }
  ground(t0: number, x: number, y: number): void {
    this.ballPlan.push({ kind: 'ground', t0, x, y });
  }
  actorsCover(a: Aligned): [string, string][] {
    return [...a.coverFor.entries()].filter(([r, d]) => this.actors.has(r) && this.actors.has(d));
  }
  mark(t: number, kind: Marker['kind']): void {
    this.markers.push({ t, kind });
  }
  down(id: string | undefined, t: number): void {
    const a = id ? this.actors.get(id) : undefined;
    if (a) a.downAt = t;
  }
}

interface Aligned {
  qb?: string;
  rbs: string[];
  wrs: { id: string; y: number; u: number }[];
  tes: { id: string; y: number }[];
  ol: string[];
  dl: string[];
  lb: string[];
  cb: string[];
  s: string[];
  coverFor: Map<string, string>; // receiver -> defender
}

function alignScrimmage(b: Builder, ev: PlayEvent): Aligned {
  const off = ev.offense;
  const def = other(off);
  const spot = ev.spotY;
  const o = ev.offLineup!;
  const d = ev.defLineup!;
  const f = FORMATIONS[ev.formation ?? 'shotgun_doubles'] ?? FORMATIONS.shotgun_doubles;
  const shotgun = f.shotgun && ev.kind !== 'kneel';
  const olY = [-2.6, -1.3, 0, 1.3, 2.6];
  o.OL.forEach((id, i) => b.add(id, off, 'OL', -0.8, spot + olY[i]));
  const qb = o.QB[0];
  b.add(qb, off, 'QB', shotgun ? (f.pistol ? -4 : -5) : -1.3, spot);
  const rbs = o.RB;
  if (ev.formation === 'i_form' || ev.formation === 'goal_line') {
    b.add(rbs[1], off, 'FB', -4.3, spot);
    b.add(rbs[0], off, 'RB', -7.2, spot);
  } else if (shotgun && !f.pistol) b.add(rbs[0], off, 'RB', -5, spot + 1.9);
  else b.add(rbs[0], off, 'RB', -7, spot);
  if (ev.formation === 'goal_line' && rbs[1] === undefined && rbs[0]) {
    /* single back already placed */
  }
  const tes = o.TE.map((id, i) => ({ id, y: spot + (i === 0 ? 4.1 : -4.1) }));
  tes.forEach((t) => b.add(t.id, off, 'TE', -1, t.y));
  const trips = ev.formation === 'shotgun_trips';
  const wrSlots = [
    { y: 5.5, u: -0.6 },
    { y: W - 5.5, u: -0.6 },
    { y: trips ? spot + 12 : spot - 10, u: -1.4 },
    { y: trips ? spot + 16 : spot + 10, u: -1.4 },
  ];
  const wrs = o.WR.map((id, i) => ({ id, ...(wrSlots[i] ?? { y: spot + (i % 2 ? 14 : -14), u: -1.5 }) }));
  wrs.forEach((w) => b.add(w.id, off, 'WR', w.u, w.y));

  const man = ev.defense?.coverage === 'man';
  const dlOffsets = d.DL.length >= 4 ? [-3.6, -1.2, 1.2, 3.6] : [-2.6, 0, 2.6];
  d.DL.forEach((id, i) => b.add(id, def, 'DL', 0.9, spot + (dlOffsets[i] ?? (i - 2) * 2)));
  const lbOffsets = d.LB.length === 1 ? [0] : d.LB.length === 2 ? [-2.8, 2.8] : d.LB.length === 3 ? [-4.2, 0, 4.2] : [-6, -2, 2, 6];
  d.LB.forEach((id, i) => b.add(id, def, 'LB', 4.8, spot + (lbOffsets[i] ?? 0)));
  const coverFor = new Map<string, string>();
  const receivers = [...wrs.map((w) => ({ id: w.id, y: w.y })), ...tes.map((t) => ({ id: t.id, y: t.y })), ...rbs.map((id) => ({ id, y: spot }))];
  const cbs = [...d.CB];
  const ss = [...d.S];
  const lbs = [...d.LB];
  for (const r of receivers) {
    const p = b.players[r.id];
    let who: string | undefined;
    if (p?.position === 'WR') who = cbs.shift() ?? ss.shift() ?? lbs.shift();
    else if (p?.position === 'TE') who = ss.shift() ?? lbs.shift() ?? cbs.shift();
    else who = lbs.shift() ?? ss.shift() ?? cbs.shift();
    if (who) coverFor.set(r.id, who);
  }
  d.CB.forEach((id, i) => {
    const target = [...coverFor.entries()].find(([, dd]) => dd === id)?.[0];
    const ty = target ? (receivers.find((r) => r.id === target)?.y ?? spot) : spot + (i % 2 ? 12 : -12);
    b.add(id, def, 'CB', man ? 1.8 : 6.5, ty + (ty < spot ? 0.8 : -0.8));
  });
  d.S.forEach((id, i) => b.add(id, def, 'S', ev.defense?.blitz && i === 0 ? 7 : 12.5, ev.defense?.blitz && d.S.length > 1 && i === 0 ? spot + 5 : spot + (i === 0 ? -8.5 : 8.5)));
  return { qb, rbs, wrs, tes, ol: o.OL, dl: d.DL, lb: d.LB, cb: d.CB, s: d.S, coverFor };
}

function yardsToEnd(ev: PlayEvent): number {
  const td = ev.score?.type === 'TD' && ev.score.team === ev.offense;
  return ev.yards + (td ? 2 : 0);
}

function animateRun(b: Builder, ev: PlayEvent, a: Aligned): number {
  const S = PRE;
  const spot = ev.spotY;
  const carrier = ev.rusher ?? a.rbs[0] ?? a.qb;
  const isQB = carrier === a.qb;
  const outside = ev.concept === 'outside_zone' || ev.concept === 'toss' || ev.concept === 'read_option' || ev.concept === 'triple_option';
  const endU = yardsToEnd(ev);
  const endY = ev.kind === 'kneel' ? spot : ev.spotYAfter;
  const gapSide = endY >= spot ? 1 : -1;
  const holeY = spot + gapSide * (outside ? 7 : 2);
  const f = FORMATIONS[ev.formation ?? ''];
  b.mark(S, 'snap');
  b.holdAll(S);
  b.holdBall(0, a.ol[2]);
  b.holdBall(S + 0.15, a.qb);

  // QB
  if (!isQB) {
    const mesh = f?.shotgun ? { u: -4.6, y: spot + gapSide * 0.9 } : { u: -3.2, y: spot + gapSide * 0.6 };
    b.to(a.qb, S + 0.55, mesh.u, mesh.y);
    b.to(a.qb, S + 1.3, mesh.u - 1.5, spot - gapSide * 2);
    b.to(carrier, S + 0.6, mesh.u + 0.2, mesh.y + gapSide * 0.4);
    b.holdBall(S + 0.6, carrier);
    b.mark(S + 0.6, 'handoff');
  }
  const start = b.pos(carrier, S + (isQB ? 0.3 : 0.6));
  const startU = b.U(start.x);
  const holeT = S + (isQB ? 0.3 : 0.6) + Math.hypot(0.5 - startU, holeY - start.y) / 6.2;
  b.to(carrier, holeT, Math.min(0.5, endU), endU < 0.5 ? endY : holeY);
  const runDist = Math.hypot(endU - 0.5, endY - holeY);
  const endT = holeT + Math.max(0.35, runDist / 7.4);
  b.to(carrier, endT, endU, endY);
  const endX = b.X(endU);

  // Line play
  const push = endU >= 3 ? 1.6 : endU >= 0 ? 0.8 : -0.8;
  a.ol.forEach((id, i) => {
    b.to(id, S + 0.7, -0.4 + push * 0.6, spot + [-2.6, -1.3, 0, 1.3, 2.6][i] + gapSide * 0.6);
    b.to(id, S + 1.6, -0.4 + push, spot + [-2.6, -1.3, 0, 1.3, 2.6][i] + gapSide * 1.1);
  });
  a.tes.forEach((t) => b.to(t.id, S + 1.2, 1.2, t.y + gapSide * 0.8));
  a.wrs.forEach((w) => b.to(w.id, S + 1.6, 4 + b.rng.float(0, 3), w.y + (w.y < spot ? 1.5 : -1.5)));
  a.rbs.forEach((id) => {
    if (id !== carrier) b.to(id, S + 0.9, 0.2, spot + gapSide * 1.8);
  });

  // Defense
  const defenders = [...a.dl, ...a.lb, ...a.cb, ...a.s];
  for (const id of defenders) {
    const p = b.pos(id, S);
    const role = b.actors.get(id)?.role;
    if (role === 'DL') b.to(id, S + 0.6, 0.2, p.y + b.rng.normal(0, 0.4));
    if (role === 'CB' || role === 'S') b.to(id, S + 0.8, b.U(p.x) - 0.5, p.y);
    if (id === ev.tackler) {
      b.toW(id, endT, endX + b.dir * 0.9, endY + b.rng.float(-0.6, 0.6));
      b.down(id, endT + 0.15);
    } else b.pursue(id, endT + 0.3, endX, endY, role === 'DL' ? 0.35 : b.rng.float(0.45, 0.8));
  }
  b.down(carrier, endT + 0.1);
  b.mark(endT, ev.score?.type === 'TD' ? 'touchdown' : ev.turnover === 'fumble' ? 'fumble' : 'tackle');
  if (ev.turnover === 'fumble') {
    b.ground(endT + 0.1, endX + b.dir * 0.8, endY + 1);
    if (ev.defender) b.toW(ev.defender, endT + 0.8, endX + b.dir * 0.8, endY + 1);
    b.holdBall(endT + 0.8, ev.defender);
  }
  if (ev.kind === 'kneel') {
    b.down(carrier, S + 0.5);
    return S + 1.4;
  }
  return endT + 1.0;
}

function routeTarget(air: number, startY: number, spot: number, rng: Rng, position?: string): { breakU: number; breakY: number; catchY: number } {
  const toward = startY < spot ? -1 : 1; // toward this receiver's sideline
  const inward = -toward;
  let breakU = Math.max(1, air - 2);
  let breakY = startY;
  let catchY = startY;
  if (position === 'RB') {
    catchY = spot + rng.pick([-1, 1]) * rng.float(5, 10);
    breakU = Math.max(-1, Math.min(air, 1));
    breakY = (spot + catchY) / 2;
  } else if (air <= 0) {
    catchY = startY + inward * 1.2;
    breakU = air;
  } else if (air <= 5) {
    const slant = rng.chance(0.6);
    breakU = 1.2;
    catchY = slant ? startY + inward * (3 + air * 0.8) : startY + toward * 3;
  } else if (air <= 12) {
    const r = rng.next();
    catchY = r < 0.35 ? startY + toward * 5 : r < 0.7 ? startY + inward * 8 : startY + inward * 1.5;
  } else if (air <= 19) {
    const r = rng.next();
    catchY = r < 0.4 ? startY + inward * 11 : r < 0.75 ? startY + toward * 6 : startY + inward * 3;
  } else {
    const r = rng.next();
    breakU = Math.max(8, air - 8);
    catchY = r < 0.5 ? startY + toward * 1.5 : r < 0.8 ? startY + inward * 9 : startY + toward * 6;
  }
  return { breakU, breakY, catchY: clamp(catchY, 1.5, W - 1.5) };
}

function animatePass(b: Builder, ev: PlayEvent, a: Aligned): number {
  const S = PRE;
  const spot = ev.spotY;
  const f = FORMATIONS[ev.formation ?? ''];
  const shotgun = f?.shotgun;
  const dropU = shotgun ? -6.3 : -7;
  const dropT = S + (shotgun ? 0.7 : 1.1);
  b.mark(S, 'snap');
  b.holdAll(S);
  b.holdBall(0, a.ol[2]);
  b.holdBall(S + 0.2, a.qb);
  const playAction = ev.concept?.startsWith('pa_');
  if (playAction && a.rbs[0]) {
    b.to(a.qb, S + 0.6, -3.5, spot + 0.8);
    b.to(a.rbs[0], S + 0.7, -3.2, spot + 1.4);
  }
  b.to(a.qb, dropT + (playAction ? 0.4 : 0), dropU, spot);

  // Pass protection & rush.
  a.ol.forEach((id, i) => b.to(id, S + 0.8, -2, spot + [-2.9, -1.4, 0, 1.4, 2.9][i]));
  a.tes.forEach((t) => {
    if (t.id !== ev.target && b.rng.chance(0.4)) b.to(t.id, S + 0.8, -1.6, t.y);
  });
  const blitzers = ev.defense?.blitz ? a.lb.slice(0, 1) : [];
  for (const id of [...a.dl, ...blitzers]) {
    const p = b.pos(id, S);
    b.to(id, S + 0.9, -1.2, p.y + (p.y < spot ? -0.5 : 0.5));
    b.to(id, S + 2.4, -2.3, p.y * 0.7 + spot * 0.3);
  }

  if (ev.kind === 'sack') {
    const sackT = S + 2.3 + b.rng.float(0, 0.8);
    const endU = ev.yards;
    b.to(a.qb, sackT - 0.6, dropU + b.rng.float(-0.5, 0.8), spot + b.rng.float(-1.5, 1.5));
    b.to(a.qb, sackT, endU, spot + b.rng.float(-1, 1));
    b.to(ev.tackler, sackT - 0.9, endU + 1.5, spot + b.rng.float(-2, 2));
    b.to(ev.tackler, sackT, endU + 0.4, spot);
    b.down(a.qb, sackT + 0.05);
    b.down(ev.tackler, sackT + 0.1);
    a.wrs.forEach((w) => b.to(w.id, sackT, b.rng.float(8, 16), w.y + b.rng.float(-4, 4)));
    a.cb.forEach((id) => b.pursue(id, sackT, b.X(10), b.pos(id, S).y, 0.5));
    b.mark(sackT, ev.turnover === 'fumble' ? 'fumble' : 'tackle');
    if (ev.turnover === 'fumble') b.ground(sackT + 0.1, b.X(endU - 0.5), spot + 1);
    return sackT + 1.1;
  }

  if (ev.kind === 'scramble') {
    const breakT = S + 1.9;
    const endU = yardsToEnd(ev);
    const endY = ev.spotYAfter;
    b.to(a.qb, breakT, dropU + 1, spot + (endY > spot ? 2 : -2));
    const endT = breakT + Math.hypot(endU - dropU, endY - spot) / 7;
    b.to(a.qb, endT, endU, endY);
    a.wrs.forEach((w) => b.to(w.id, breakT + 0.5, b.rng.float(8, 18), w.y));
    for (const id of [...a.lb, ...a.cb, ...a.s]) {
      if (id === ev.tackler) b.toW(id, endT, b.X(endU) + b.dir * 0.8, endY);
      else b.pursue(id, endT + 0.3, b.X(endU), endY, b.rng.float(0.4, 0.75));
    }
    b.down(a.qb, endT + 0.1);
    b.mark(endT, ev.score ? 'touchdown' : 'tackle');
    return endT + 1.0;
  }

  // Routes.
  const air = ev.throwaway ? 12 : (ev.airYards ?? 8);
  const target = ev.throwaway ? undefined : ev.target;
  const quick = ev.concept === 'quick_slants' || ev.concept === 'wr_screen' || ev.concept === 'rpo_bubble' || ev.concept === 'rpo_glance';
  const throwBase = S + (quick ? 0.9 : ev.concept === 'rb_screen' ? 1.6 : 1.7 + b.rng.float(0, 0.8));
  let catchT = throwBase + 0.6;
  let catchX = b.X(air);
  let catchY = spot;
  const allRecv = [...a.wrs.map((w) => w.id), ...a.tes.map((t) => t.id), ...a.rbs];
  for (const id of allRecv) {
    const st = b.pos(id, S);
    const u0 = b.U(st.x);
    const pos = b.players[id]?.position;
    if (id === target) {
      const r = routeTarget(air, st.y, spot, b.rng, pos);
      const qbPos = { x: b.X(dropU), y: spot };
      const dist = Math.hypot(b.X(air) - qbPos.x, r.catchY - qbPos.y);
      const flightT = clamp(dist / 21, 0.3, 2.2);
      const routeLen = Math.abs(r.breakU - u0) + Math.hypot(air - r.breakU, r.catchY - r.breakY);
      catchT = Math.max(S + routeLen / 7.6, throwBase + flightT);
      const throwT = catchT - flightT;
      const breakT = S + (catchT - S) * (Math.abs(r.breakU - u0) / Math.max(0.1, routeLen));
      b.to(id, Math.max(S + 0.2, breakT), r.breakU, r.breakY);
      b.to(id, catchT, air, r.catchY);
      catchX = b.X(air);
      catchY = r.catchY;
      b.to(a.qb, throwT, dropU, spot);
      b.mark(throwT, 'throw');
      b.flight(throwT, catchT, { x: qbPos.x + b.dir * 0.3, y: spot, z: 2 }, { x: catchX, y: catchY, z: 1.3 }, clamp(dist / 9, 0.6, 9));
    } else {
      const depth = pos === 'RB' ? b.rng.float(1, 5) : b.rng.float(5, 17);
      const r = routeTarget(depth, st.y, spot, b.rng, pos);
      const tEnd = S + 0.5 + (Math.abs(depth - u0) + Math.abs(r.catchY - st.y)) / 7;
      b.to(id, S + (tEnd - S) * 0.6, r.breakU, r.breakY);
      b.to(id, tEnd, depth, r.catchY);
    }
  }
  if (ev.throwaway) {
    const throwT = S + 2.2;
    const tx = b.X(10);
    const ty = spot < W / 2 ? -2 : W + 2;
    b.to(a.qb, throwT, dropU, spot + (ty < 0 ? -3 : 3));
    b.flight(throwT, throwT + 0.9, b.pos(a.qb, throwT), { x: tx, y: ty, z: 0.2 }, 3);
    b.ground(throwT + 0.9, tx, ty < 0 ? 0.3 : W - 0.3);
    b.mark(throwT + 0.9, 'incomplete');
    return throwT + 1.8;
  }

  // Coverage.
  for (const [recv, defId] of b.actorsCover(a)) {
    const lag = 0.25;
    const rp = b.actors.get(recv)!;
    for (const k of rp.path) {
      if (k.t <= S) continue;
      const deeper = b.dir * 1.3;
      b.toW(defId, k.t + lag, k.x + deeper, k.y + (k.y < spot ? 0.9 : -0.9));
    }
  }
  for (const id of a.s) if (![...a.coverFor.values()].includes(id)) b.to(id, S + 2, 16 + b.rng.float(0, 4), b.pos(id, S).y);
  for (const id of a.lb) if (![...a.coverFor.values()].includes(id) && !blitzers.includes(id)) b.to(id, S + 1.4, 8, b.pos(id, S).y);

  const covDef = ev.defender;
  if (ev.turnover === 'interception') {
    const picker = ev.defender;
    b.toW(picker!, catchT, catchX + b.dir * 0.4, catchY);
    b.holdBall(catchT, picker);
    b.mark(catchT, 'interception');
    const retU = air - (ev.returnYards ?? 0) - (ev.score ? 2 : 0);
    const endY = clamp(catchY + b.rng.normal(0, 6), 2, W - 2);
    const endT = catchT + Math.max(0.5, (ev.returnYards ?? 0) / 7.5);
    b.to(picker, endT, retU, endY);
    const offense = [...allRecv, a.qb!, ...a.ol];
    for (const id of offense) b.pursue(id, endT + 0.3, b.X(retU), endY, b.rng.float(0.3, 0.7));
    b.down(picker, endT + 0.1);
    return endT + 1.0;
  }
  if (!ev.complete) {
    // Incompletion: ball arrives, gets broken up / dropped.
    if (covDef && target) b.toW(covDef, catchT, catchX + b.dir * 0.3, catchY + 0.4);
    b.ground(catchT + 0.25, catchX + b.dir * 1.5, catchY + b.rng.float(-1.5, 1.5));
    b.mark(catchT, 'incomplete');
    if (target) {
      const t = b.actors.get(target)!.path.at(-1)!;
      b.toW(target, catchT + 0.6, t.x + b.dir * 1.5, t.y);
    }
    if (ev.penalty) b.mark(catchT + 0.3, 'flag');
    return catchT + 1.2;
  }
  // Completion + YAC.
  b.holdBall(catchT, target);
  b.mark(catchT, 'catch');
  const endU = yardsToEnd(ev);
  const endY = ev.spotYAfter;
  const endT = catchT + Math.max(0.35, Math.hypot(endU - air, endY - catchY) / 7.6);
  b.to(target, endT, endU, endY);
  const endX = b.X(endU);
  for (const id of [...a.dl, ...a.lb, ...a.cb, ...a.s]) {
    if (id === ev.tackler) {
      b.toW(id, endT, endX + b.dir * 0.8, endY + b.rng.float(-0.6, 0.6));
      b.down(id, endT + 0.15);
    } else b.pursue(id, endT + 0.3, endX, endY, b.rng.float(0.3, 0.7));
  }
  if (!ev.score) b.down(target, endT + 0.1);
  b.mark(endT, ev.score?.type === 'TD' ? 'touchdown' : 'tackle');
  return endT + 1.1;
}

function kickoffLike(b: Builder, ev: PlayEvent): number {
  const kick = ev.offense;
  const rec = other(kick);
  const ku = ev.kickUnit ?? [];
  const ru = ev.returnUnit ?? [];
  // Kicking team spread on its line; kicker behind.
  b.add(ku[0], kick, 'K', -7, W / 2);
  ku.slice(1).forEach((id, i) => b.add(id, kick, 'KC', -1, 4 + (i * (W - 8)) / Math.max(1, ku.length - 2)));
  const onside = ev.kind === 'onside_kick';
  const dist = ev.kickDistance ?? 60;
  const landU = dist;
  const landY = clamp(W / 2 + b.rng.normal(0, 7), 6, W - 6);
  b.add(ru[0], rec, 'KR', onside ? 12 : Math.max(landU, 55), landY);
  ru.slice(1).forEach((id, i) => {
    const front = i < 5;
    b.add(id, rec, 'KRU', onside ? 11 : front ? 12 : 26, front ? 8 + i * 9.3 : 12 + (i - 5) * 10);
  });
  const S = PRE;
  b.to(ku[0], S + 1.0, -0.3, W / 2);
  b.mark(S + 1.0, 'kick');
  const kickT = S + 1.0;
  b.ground(0, b.X(0), W / 2);
  const flightT = onside ? 1.0 : clamp(dist / 17, 2.4, 4.3);
  const landX = b.X(onside ? (ev.kickDistance ?? 10) : landU);
  b.flight(kickT, kickT + flightT, { x: b.X(0), y: W / 2, z: 0.3 }, { x: landX, y: landY, z: onside ? 0.2 : 1.2 }, onside ? 1 : clamp(dist / 3.5, 8, 20));
  // coverage runs
  ku.slice(1).forEach((id) => {
    const p = b.pos(id, S);
    b.to(id, kickT + flightT, Math.min(landU - 12, 40) + b.rng.float(-4, 4), p.y * 0.6 + landY * 0.4);
  });
  const catchT = kickT + flightT;
  b.to(ru[0], catchT, onside ? 11 : landU, landY);
  ru.slice(1).forEach((id) => {
    const p = b.pos(id, S);
    b.to(id, catchT, b.U(p.x) + (onside ? 0 : 3), p.y);
  });
  if (onside) {
    const winner = ev.kickResult === 'recovered' ? ku[1] : ru[1];
    b.toW(winner, catchT, landX, landY);
    b.holdBall(catchT, winner);
    b.down(winner, catchT + 0.2);
    b.mark(catchT, 'fumble');
    return catchT + 1.5;
  }
  const res = ev.kickResult;
  if (res === 'touchback' || res === 'out_of_bounds') {
    if (res === 'touchback') b.ground(catchT, landX, landY);
    b.mark(catchT, 'whistle');
    return catchT + 1.2;
  }
  b.holdBall(catchT, ru[0]);
  if (res === 'fair_catch') {
    b.mark(catchT, 'whistle');
    return catchT + 1.2;
  }
  // Return: end at ballOnAfter in receiving frame (or end zone for TD).
  const recDir = (-b.dir) as 1 | -1;
  const endX = ev.score ? (recDir === 1 ? 104 : -4) : recDir === 1 ? ev.ballOnAfter : 100 - ev.ballOnAfter;
  const endY = clamp(landY + b.rng.normal(0, 8), 3, W - 3);
  const retLen = Math.abs(endX - landX);
  const endT = catchT + Math.max(0.8, retLen / 7.6);
  b.toW(ru[0], endT, endX, endY);
  for (const id of ku.slice(1)) {
    if (id === ev.tackler) {
      b.toW(id, endT, endX - recDir * 0.8, endY);
      b.down(id, endT + 0.1);
    } else b.pursue(id, endT + 0.3, endX, endY, b.rng.float(0.4, 0.8));
  }
  for (const id of ru.slice(1)) b.pursue(id, endT, endX + recDir * 3, endY, 0.4);
  if (!ev.score) b.down(ru[0], endT + 0.1);
  b.mark(endT, ev.score ? 'touchdown' : 'tackle');
  return endT + 1.1;
}

function punt(b: Builder, ev: PlayEvent): number {
  const kick = ev.offense;
  const rec = other(kick);
  const ku = ev.kickUnit ?? [];
  const ru = ev.returnUnit ?? [];
  const spot = ev.spotY;
  const S = PRE;
  b.add(ku[0], kick, 'P', -14, spot);
  ku.slice(1).forEach((id, i) => {
    if (i < 7) b.add(id, kick, 'PC', -0.8, spot + (i - 3) * 1.4);
    else b.add(id, kick, 'G', -0.6, i % 2 ? 4 : W - 4);
  });
  const dist = ev.kickDistance ?? 40;
  const toGoal = 100 - ev.ballOn;
  const landU = Math.min(dist, toGoal + 3);
  const landY = clamp(spot + b.rng.normal(0, 6), 5, W - 5);
  b.add(ru[0], rec, 'PR', Math.min(landU, toGoal + 2), landY);
  ru.slice(1).forEach((id, i) => b.add(id, rec, 'PRU', i < 6 ? 1 : 12, i < 6 ? spot + (i - 2.5) * 2 : spot + (i - 7) * 8));
  b.holdAll(S);
  b.mark(S, 'snap');
  b.holdBall(0, ku[1] ?? ku[0]);
  b.flight(S, S + 0.55, b.pos(ku[1] ?? ku[0], S), { x: b.X(-13.5), y: spot, z: 1.2 }, 0.5);
  b.holdBall(S + 0.55, ku[0]);
  const kickT = S + 1.4;
  b.mark(kickT, 'kick');
  if (ev.kickResult === 'blocked') {
    b.ground(kickT + 0.2, b.X(-9), spot + 1);
    b.to(ru[1], kickT, -12, spot);
    return kickT + 1.8;
  }
  const hang = clamp(dist / 11, 3.3, 4.6);
  const landX = b.X(landU);
  b.flight(kickT, kickT + hang, { x: b.X(-13), y: spot, z: 1.2 }, { x: landX, y: landY, z: ev.kickResult === 'touchback' || ev.kickResult === 'downed' ? 0.2 : 1.3 }, clamp(dist / 2.6, 10, 18));
  ku.slice(1).forEach((id) => {
    const p = b.pos(id, S);
    b.to(id, kickT + hang, landU - b.rng.float(3, 9), p.y * 0.4 + landY * 0.6);
  });
  ru.slice(1).forEach((id) => {
    const p = b.pos(id, S);
    b.to(id, kickT + hang, Math.min(landU - 12, b.U(p.x) + 14), p.y);
  });
  const catchT = kickT + hang;
  const res = ev.kickResult;
  if (res === 'touchback' || res === 'downed' || res === 'out_of_bounds') {
    const restX = res === 'touchback' ? landX + b.dir * 4 : res === 'out_of_bounds' ? landX : landX;
    b.ground(catchT, restX, res === 'out_of_bounds' ? (landY < W / 2 ? 0.4 : W - 0.4) : landY);
    b.mark(catchT, 'whistle');
    return catchT + 1.2;
  }
  b.holdBall(catchT, ru[0]);
  if (res === 'fair_catch') {
    b.mark(catchT, 'whistle');
    return catchT + 1.1;
  }
  if (res === 'muffed') {
    b.ground(catchT + 0.2, landX, landY + 1);
    b.toW(ku[1], catchT + 0.8, landX, landY + 1);
    b.holdBall(catchT + 0.8, ku[1]);
    b.mark(catchT + 0.2, 'fumble');
    return catchT + 1.8;
  }
  const recDir = (-b.dir) as 1 | -1;
  const endX = ev.score ? (recDir === 1 ? 104 : -4) : recDir === 1 ? ev.ballOnAfter : 100 - ev.ballOnAfter;
  const endY = clamp(landY + b.rng.normal(0, 7), 3, W - 3);
  const endT = catchT + Math.max(0.6, Math.abs(endX - landX) / 7.5);
  b.toW(ru[0], endT, endX, endY);
  for (const id of ku.slice(1)) {
    if (id === ev.tackler) {
      b.toW(id, endT, endX - recDir * 0.8, endY);
      b.down(id, endT + 0.1);
    } else b.pursue(id, endT + 0.3, endX, endY, b.rng.float(0.4, 0.8));
  }
  if (!ev.score) b.down(ru[0], endT + 0.1);
  b.mark(endT, ev.score ? 'touchdown' : 'tackle');
  return endT + 1.1;
}

function kickAtGoal(b: Builder, ev: PlayEvent): number {
  const off = ev.offense;
  const def = other(off);
  const ku = ev.kickUnit ?? [];
  const ru = ev.returnUnit ?? [];
  const spot = ev.kind === 'extra_point' ? W / 2 : ev.spotY;
  const S = PRE;
  b.add(ku[0], off, 'K', -9.5, spot - 2);
  b.add(ku[1], off, 'H', -7, spot);
  ku.slice(2).forEach((id, i) => b.add(id, off, 'OL', -0.8, spot + (i - (ku.length - 3) / 2) * 1.3));
  ru.forEach((id, i) => b.add(id, def, 'D', i < 7 ? 1 : 6, spot + (i < 7 ? (i - 3) * 1.4 : (i - 8.5) * 5)));
  b.holdAll(S);
  b.mark(S, 'snap');
  b.holdBall(0, ku[2] ?? ku[0]);
  b.flight(S, S + 0.4, b.pos(ku[2] ?? ku[0], S), { x: b.X(-7), y: spot, z: 0.3 }, 0.3);
  const kickT = S + 1.15;
  b.ground(S + 0.4, b.X(-7), spot);
  b.to(ku[0], kickT, -7.2, spot - 0.4);
  b.mark(kickT, 'kick');
  ru.slice(0, 7).forEach((id) => {
    const p = b.pos(id, S);
    b.to(id, kickT, -1, p.y);
  });
  if (ev.kickResult === 'blocked') {
    b.flight(kickT, kickT + 0.4, { x: b.X(-7), y: spot, z: 0.3 }, { x: b.X(-3), y: spot + 2, z: 0.2 }, 1.5);
    b.ground(kickT + 0.4, b.X(-4), spot + 3);
    return kickT + 1.6;
  }
  const toGoal = 100 - ev.ballOn;
  const postsU = toGoal + 10;
  const good = ev.kickResult === 'good';
  const missY = W / 2 + (b.rng.chance(0.5) ? 1 : -1) * b.rng.float(3.6, 6);
  const ty = good ? W / 2 + b.rng.float(-2, 2) : missY;
  const ft = clamp((ev.kickDistance ?? 30) / 26, 0.9, 2.1);
  b.flight(kickT, kickT + ft, { x: b.X(-7), y: spot, z: 0.3 }, { x: b.X(postsU + 1), y: ty, z: good ? 6 : 4.5 }, 7);
  b.ground(kickT + ft + 0.6, b.X(postsU + 3), ty);
  b.mark(kickT + ft, good ? 'touchdown' : 'incomplete');
  return kickT + ft + 1.0;
}

function preSnapFlag(b: Builder, ev: PlayEvent, a: Aligned): number {
  const S = 1.3;
  b.holdBall(0, a.ol[2]);
  if (ev.penalty?.on === ev.offense) {
    const who = a.ol[b.rng.int(0, Math.max(0, a.ol.length - 1))];
    const p = b.pos(who, 0);
    b.to(who, 0.9, b.U(p.x) + 0.8, p.y);
  } else {
    const who = a.dl[b.rng.int(0, Math.max(0, a.dl.length - 1))];
    const p = b.pos(who, 0);
    b.to(who, 0.9, b.U(p.x) - 1.2, p.y);
  }
  b.mark(1.0, 'flag');
  b.holdAll(S + 0.8);
  return S + 1.0;
}

function twoPoint(b: Builder, ev: PlayEvent, a: Aligned): number {
  if (ev.passer) {
    const e = { ...ev, kind: 'pass' as const, airYards: 3 + 2, yards: ev.complete ? 3 : 0 };
    return animatePass(b, e, a);
  }
  return animateRun(b, { ...ev, kind: 'run', yards: ev.yards }, a);
}

/** Build the animation for a play; returns null for events with nothing to show (period breaks). */
export function buildAnimation(ev: PlayEvent, players: Record<string, Player>): PlayAnimation | null {
  if (ev.kind === 'period_end') return null;
  const b = new Builder(ev, players, ev.direction, ev.ballOn);
  let duration = 3;
  let wide = false;
  switch (ev.kind) {
    case 'kickoff':
    case 'free_kick':
    case 'onside_kick':
      duration = kickoffLike(b, ev);
      wide = true;
      break;
    case 'punt':
      duration = punt(b, ev);
      wide = true;
      break;
    case 'field_goal':
    case 'extra_point':
      duration = kickAtGoal(b, ev);
      wide = true;
      break;
    default: {
      if (!ev.offLineup || !ev.defLineup) return null;
      const a = alignScrimmage(b, ev);
      if (ev.kind === 'penalty') duration = preSnapFlag(b, ev, a);
      else if (ev.kind === 'two_point') duration = twoPoint(b, ev, a);
      else if (ev.kind === 'run' || ev.kind === 'kneel') duration = animateRun(b, ev, a);
      else duration = animatePass(b, ev, a);
      if (ev.penalty && ev.kind !== 'penalty') b.mark(Math.max(PRE + 0.8, duration - 1.2), 'flag');
    }
  }
  const anim = b.build(duration);
  anim.wide = wide || Math.abs(ev.yards) >= 25;
  const scrimmage = !['kickoff', 'free_kick', 'onside_kick', 'extra_point', 'two_point'].includes(ev.kind);
  if (scrimmage) {
    anim.losX = b.losX;
    if (ev.down >= 1 && ev.distance > 0 && ev.ballOn + ev.distance < 100) anim.firstDownX = b.X(ev.distance);
  }
  return anim;
}

export const SNAP_TIME = PRE;
