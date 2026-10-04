/**
 * AI — decision making for every non-human actor in a PlaySim.
 * Each actor gets a "desire" (direction × speed fraction); PlaySim turns it into motion.
 * `skill` (0..1 per side) comes from difficulty and controls reaction time, pursuit angles,
 * coverage discipline and quarterback decision quality.
 */
import type { RNG } from './rng';
import type { Actor } from './Actor';
import { isFree } from './Actor';
import type { PlaySim } from './PlaySim';
import { CENTER_Y, FIELD_W, clamp, dist, norm, type Vec } from './math';

export interface AiCtx {
  sim: PlaySim;
  rng: RNG;
  blockTimer: number;
  qbNextRead?: number;
  scramble?: boolean;
  nextMove?: number;
}

function seek(a: Actor, tx: number, ty: number, frac = 1, arrive = 1.2) {
  const dx = tx - a.x;
  const dy = ty - a.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.05) { a.desire = { x: 0, y: 0 }; return; }
  const f = d < arrive ? frac * Math.max(0.15, d / arrive) : frac;
  a.desire = { x: (dx / d) * f, y: (dy / d) * f };
}

/** Intercept point for a pursuer chasing a moving target; better skill = better angles. */
export function pursuitPoint(d: Actor, c: Actor, skill: number): Vec {
  const spd = d.maxSpd;
  // Earliest time the pursuer can meet the runner if the runner keeps going.
  let best: Vec | null = null;
  for (let t = 0.05; t <= 3; t += 0.08) {
    const px = c.x + c.vx * t;
    const py = c.y + c.vy * t;
    if (Math.hypot(px - d.x, py - d.y) <= spd * t * 1.02) { best = { x: px, y: py }; break; }
  }
  // No intercept (runner as fast or faster): take a deep cut-off angle to stay in front.
  if (!best) best = { x: c.x + c.vx * 2.6, y: c.y + c.vy * 2.6 };
  const k = 0.3 + skill * 0.7;
  const lead = { x: c.x + c.vx * 0.25, y: c.y + c.vy * 0.25 };
  return { x: lead.x + (best.x - lead.x) * k, y: lead.y + (best.y - lead.y) * k };
}

export function thinkActor(ctx: AiCtx, a: Actor) {
  const sim = ctx.sim;
  const s = sim.setup;
  if (a.down) {
    // Get back up after a while
    if (a.stunT <= 0 && sim.carrier !== a) { a.down = false; }
    a.desire = { x: 0, y: 0 };
    return;
  }
  if (a.engaged >= 0) { // defender wants to get to the ball; blocker wants to hold
    const tgt = sim.carrier ?? sim.actors[sim.qbIdx];
    if (tgt) a.desire = norm({ x: tgt.x - a.x, y: tgt.y - a.y });
    return;
  }
  if (a.diveT > 0) return;
  const c = sim.carrier;
  const skill = a.team === 'D' ? s.skill.D : s.skill.O;
  const ball = sim.ball;

  // Ball carried by the other team → pursue (after reaction)
  if (c && c.team !== a.team && a.role !== 'kicker') {
    const qbHolding = c.idx === sim.qbIdx && !sim.pastLos && s.kind === 'scrimmage' && !sim.handedOff && !sim.qbRun;
    if (!qbHolding || a.role === 'rush' || a.role === 'pursue') {
      if (a.reactT > 0 && a.role !== 'rush') { keepMomentum(a); return; }
      if (a.role === 'rush' && a.blitzDelay && sim.t < a.blitzDelay) { a.desire = { x: 0, y: 0 }; return; }
      if (qbHolding && a.role === 'rush') {
        // Rush lanes: stay in your lane until close
        const d = dist(a, c);
        const laneY = c.y + (a.rushLane ?? 0) * clamp((d - 2) / 6, 0, 1) * 0.7;
        seek(a, c.x, laneY, 1);
        return;
      }
      const deep = a.zoneDeep && !sim.pastLos && s.kind === 'scrimmage' && c.x < s.los + 1 && sim.t < 1.8;
      if (deep) { // deep defenders don't bite instantly
        seek(a, a.zoneSpot!.x - 3, c.y * 0.4 + a.zoneSpot!.y * 0.6, 0.6);
        return;
      }
      const p = pursuitPoint(a, c, skill);
      seek(a, p.x, p.y, 1.0, 0.3);
      return;
    }
  }

  switch (a.role) {
    case 'qb':
      return thinkQb(ctx, a);
    case 'route':
      return thinkRoute(ctx, a);
    case 'carry':
      return thinkCarry(ctx, a);
    case 'pblock':
      return thinkPassBlock(ctx, a);
    case 'rblock':
    case 'lead':
    case 'kblock':
      return thinkRunBlock(ctx, a);
    case 'rush': {
      if (a.blitzDelay && sim.t < a.blitzDelay) { a.desire = { x: 0, y: 0 }; return; }
      const qb = sim.actors[sim.qbIdx];
      if (s.kind === 'punt') {
        const p = sim.actors[sim.kickerIdx];
        seek(a, p.x, p.y, 1);
        return;
      }
      if (ball.state === 'air' && ball.kind === 'pass') {
        // Get back toward the catch point
        seek(a, ball.tx, ball.ty, 0.7);
        return;
      }
      if (qb) seek(a, qb.x, qb.y + (a.rushLane ?? 0) * 0.3, 1);
      return;
    }
    case 'man':
      return thinkMan(ctx, a);
    case 'zone':
      return thinkZone(ctx, a);
    case 'ballhawk': {
      if (a.reactT > 0) { keepMomentum(a); return; }
      if (ball.state === 'air') {
        const remain = Math.max(0, ball.dur - ball.t);
        const d = Math.hypot(ball.tx - a.x, ball.ty - a.y);
        if (d <= a.maxSpd * (remain + 0.35) + 1.2) { seek(a, ball.tx, ball.ty, 1, 0.4); return; }
        const tgt = sim.actors[ball.target];
        if (tgt) { const p = pursuitPoint(a, tgt, skill); seek(a, p.x, p.y, 1); return; }
      }
      a.desire = { x: 0, y: 0 };
      return;
    }
    case 'pursue': {
      if (a.reactT > 0) { keepMomentum(a); return; }
      if (c && c.team !== a.team) { const p = pursuitPoint(a, c, skill); seek(a, p.x, p.y, 1, 0.3); return; }
      if (ball.state === 'air') { seek(a, ball.tx, ball.ty, 0.9); return; }
      a.desire = { x: 0, y: 0 };
      return;
    }
    case 'cover': {
      // Kick coverage: run downfield in lanes, then converge
      if (ball.state === 'air' && (ball.kind === 'kick' || ball.kind === 'punt' || ball.kind === 'onside')) {
        const laneY = a.startY * 0.55 + ball.ty * 0.45;
        const tx = ball.kind === 'onside' ? ball.tx : Math.min(ball.tx - 4, a.x + 30);
        seek(a, tx, ball.kind === 'onside' ? ball.ty : laneY, 1);
        return;
      }
      if (ball.state === 'dead' && s.kind === 'kickoff') {
        // waiting for the kick: hold the line
        a.desire = { x: sim.t > 0.7 ? 0.6 : 0, y: 0 };
        return;
      }
      a.desire = { x: 0, y: 0 };
      return;
    }
    case 'returner': {
      if (ball.state === 'air') { seek(a, ball.tx, ball.ty, 1, 0.6); return; }
      a.desire = { x: 0, y: 0 };
      return;
    }
    case 'kicker': {
      if (s.kind === 'kickoff' && ball.state === 'dead') { seek(a, s.los - 0.3, CENTER_Y, 0.75, 0.2); return; }
      if (c && c.team !== a.team) {
        // Kicker is the last line of defense: approach cautiously
        const p = pursuitPoint(a, c, skill * 0.6);
        seek(a, p.x, p.y, 0.85);
        return;
      }
      a.desire = { x: 0, y: 0 };
      return;
    }
    case 'carrier':
      // CPU carriers get their desire in cpuCarrierMoves.
      return;
    case 'idle':
    default: {
      if (c && c.team === a.team && c !== a) {
        // Carry out fakes / drift and look to block
        seek(a, c.x - 3, c.y + (a.y > c.y ? 2 : -2), 0.5);
        return;
      }
      a.desire = { x: a.desire.x * 0.9, y: a.desire.y * 0.9 };
    }
  }
}

function keepMomentum(a: Actor) {
  const sp = Math.hypot(a.vx, a.vy);
  if (sp < 0.1) { a.desire = { x: 0, y: 0 }; return; }
  a.desire = { x: (a.vx / a.maxSpd) * 0.95, y: (a.vy / a.maxSpd) * 0.95 };
}

// ------------------------------------------------------------------ offense

function meshPoint(sim: PlaySim): Vec {
  const s = sim.setup;
  const play = s.offPlay!;
  const qb = sim.actors[sim.qbIdx];
  const aim = (play.aim ?? 0) * (s.flip ? -1 : 1);
  const side = Math.sign(aim) || 1;
  const baseX = Math.min(qb.startX, s.los - 3.2) + 0.3;
  return { x: baseX, y: s.ballY + side * 0.95 };
}

function thinkQb(ctx: AiCtx, a: Actor) {
  const sim = ctx.sim;
  const s = sim.setup;
  if (s.kind !== 'scrimmage') { a.desire = { x: 0, y: 0 }; return; }
  const play = s.offPlay!;
  const flip = s.flip ? -1 : 1;
  if (sim.ball.holder !== a.idx) {
    // Snap in the air or ball gone
    a.desire = { x: 0, y: 0 };
    return;
  }
  if (play.kind === 'run' && !sim.handedOff) {
    const m = meshPoint(sim);
    seek(a, m.x - 0.4, s.ballY + (m.y - s.ballY) * 0.2, 0.65, 0.4);
    return;
  }
  if (play.kind === 'option') {
    const m = meshPoint(sim);
    seek(a, m.x, s.ballY, 0.4, 0.4);
    return;
  }
  if (play.kind === 'sneak') {
    seek(a, s.los + 5, s.ballY, 1);
    return;
  }
  // Pass: dropback (with optional play-action fake and rollout)
  const drop = play.drop ?? 5;
  const dropX = s.los - Math.max(drop, a.startX < s.los - 3 ? s.los - a.startX + 1.5 : drop);
  if (play.playAction && sim.t < 0.6) {
    const m = meshPoint(sim);
    seek(a, m.x, m.y - 0.5, 0.6, 0.3);
    return;
  }
  const rollY = play.rollout ? s.ballY + play.rollout * flip : s.ballY;
  // Backed up: don't drop into your own end zone.
  const safeDropX = Math.max(dropX, Math.min(a.startX, 0.8));
  if (sim.t < sim.dropTime() + 0.2) {
    seek(a, safeDropX, rollY, play.rollout ? 0.9 : 0.75, 0.5);
    return;
  }
  // In the pocket: slide away from pressure (CPU only — the human moves himself)
  let push: Vec = { x: 0, y: 0 };
  for (const d of sim.actors) {
    if (d.team === a.team || !isFree(d)) continue;
    const dd = dist(d, a);
    if (dd < 4) {
      const n = norm({ x: a.x - d.x, y: a.y - d.y });
      push = { x: push.x + n.x * (4 - dd), y: push.y + n.y * (4 - dd) };
    }
  }
  const pl = Math.hypot(push.x, push.y);
  if (pl > 0.3) {
    const n = norm({ x: push.x * 0.5 + 0.4, y: push.y });
    a.desire = { x: n.x * 0.7, y: n.y * 0.7 };
  } else {
    seek(a, safeDropX + 1.2, rollY, 0.3, 1);
  }
}

function thinkRoute(ctx: AiCtx, a: Actor) {
  const sim = ctx.sim;
  const ball = sim.ball;
  // Ball in the air to me → go get it
  if (ball.state === 'air' && ball.kind === 'pass' && ball.target === a.idx) {
    seek(a, ball.tx, ball.ty, 1, 0.3);
    return;
  }
  // Ball thrown elsewhere: drift toward it
  if (ball.state === 'air' && ball.kind === 'pass') {
    seek(a, ball.tx, ball.ty, 0.6);
    return;
  }
  const r = a.route;
  if (!r || r.pts.length === 0) { a.role = 'pblock'; return; }
  if (r.i < r.pts.length) {
    const p = r.pts[r.i];
    if (Math.hypot(p.x - a.x, p.y - a.y) < 0.8) {
      r.i++;
      // Route break: man defenders on this receiver lose a step based on route running vs coverage
      for (const d of sim.actors) {
        if (d.team === a.team || d.role !== 'man' || d.manTarget !== a.idx) continue;
        const sep = 0.1 + (a.p.attrs.route - d.p.attrs.cov) / 260 + (1 - sim.setup.skill.D) * 0.12;
        d.reactT = Math.max(d.reactT, clamp(sep, 0.04, 0.42));
      }
    }
  }
  if (r.i < r.pts.length) {
    const p = r.pts[r.i];
    seek(a, p.x, p.y, 1, 0.2);
    return;
  }
  if (r.end === 'continue') {
    const last = r.pts[r.pts.length - 1];
    const prev = r.pts.length > 1 ? r.pts[r.pts.length - 2] : { x: a.startX, y: a.startY };
    const n = norm({ x: last.x - prev.x, y: last.y - prev.y });
    let dy = n.y;
    if ((a.y < 2 && dy < 0) || (a.y > FIELD_W - 2 && dy > 0)) dy = 0;
    const nn = norm({ x: n.x + (dy === 0 ? 0.6 : 0), y: dy });
    a.desire = { x: nn.x, y: nn.y };
    return;
  }
  // Sit: settle in the soft spot away from the nearest defender
  let near: Actor | null = null;
  let nd = 1e9;
  for (const d of sim.actors) {
    if (d.team === a.team) continue;
    const dd = dist(d, a);
    if (dd < nd) { nd = dd; near = d; }
  }
  if (near && nd < 3) {
    const n = norm({ x: a.x - near.x, y: a.y - near.y });
    a.desire = { x: n.x * 0.35, y: n.y * 0.35 };
  } else a.desire = { x: 0, y: 0 };
}

function thinkCarry(ctx: AiCtx, a: Actor) {
  const sim = ctx.sim;
  const s = sim.setup;
  const play = s.offPlay!;
  const flip = s.flip ? -1 : 1;
  const aim = (play.aim ?? 0) * flip;
  const m = meshPoint(sim);
  if (play.counter && sim.t < 0.35) {
    seek(a, a.startX + 0.6, s.ballY - Math.sign(aim || 1) * 2.5, 0.8);
    return;
  }
  if (play.toss) {
    seek(a, s.los - 3.5, s.ballY + aim, 1);
    return;
  }
  if (play.playAction) {
    seek(a, s.los - 0.5, m.y + Math.sign(aim || 1) * 1.5, 0.8);
    return;
  }
  if (sim.t < (play.draw ? 0.6 : 0.05)) { a.desire = { x: 0, y: 0 }; return; }
  // Toward mesh, then aim point
  if (a.x < m.x - 0.3 && !sim.handedOff) {
    seek(a, m.x + 0.4, m.y, 0.8, 0.1);
    return;
  }
  seek(a, s.los + 2, s.ballY + aim, 0.95);
}

function protectSpot(sim: PlaySim, a: Actor): Vec {
  const qb = sim.actors[sim.qbIdx];
  const s = sim.setup;
  const lateral = a.startY - s.ballY;
  const depth = a.slot === 'H' || a.slot === 'F' || a.slot === 'PP' ? 1.5 : 1.8;
  return { x: Math.min(qb.x + depth + 1.2, s.los), y: qb.y + lateral * 1.05 };
}

function thinkPassBlock(ctx: AiCtx, a: Actor) {
  const sim = ctx.sim;
  const s = sim.setup;
  const play = s.offPlay;
  // Screen: linemen release after a beat to lead block
  if (play?.screen && sim.t > 1.25 && s.kind === 'scrimmage' && ['LG', 'C', 'RG'].includes(a.slot)) {
    a.role = 'rblock';
    return;
  }
  if (a.blockTarget >= 0) {
    const t = sim.actors[a.blockTarget];
    if (t && !t.down && t.engaged < 0) {
      const prot = sim.carrier ?? sim.actors[sim.qbIdx] ?? a;
      const n = norm({ x: prot.x - t.x, y: prot.y - t.y });
      seek(a, t.x + n.x * 0.9, t.y + n.y * 0.9, 0.95, 0.3);
      return;
    }
  }
  const p = s.kind === 'punt' ? { x: s.los - 1.8, y: a.startY } : protectSpot(sim, a);
  seek(a, p.x, p.y, 0.7, 0.6);
}

function thinkRunBlock(ctx: AiCtx, a: Actor) {
  const sim = ctx.sim;
  const s = sim.setup;
  const c = sim.carrier;
  const fwd = a.team === 'O' ? 1 : -1;
  if (a.role === 'kblock' && (!c || c.team !== a.team)) {
    // Kick return before the catch: set up a wall in front of the returner
    const r = sim.actors.find((x) => x.slot === 'R1');
    const ball = sim.ball;
    const targetX = ball.state === 'air' ? Math.min(ball.tx - 12, a.startX) : a.x;
    if (s.kind === 'kickoff') { seek(a, targetX - 4 + (a.startX - 52) * 0.3, a.startY * 0.7 + CENTER_Y * 0.3, 0.7); return; }
    if (s.kind === 'punt' && r) { seek(a, Math.max(a.x, s.los + 8), a.startY, 0.5); return; }
    a.desire = { x: 0, y: 0 };
    return;
  }
  if (a.blockTarget >= 0) {
    const t = sim.actors[a.blockTarget];
    if (t && !t.down && (t.engaged < 0 || t.engaged === a.idx)) {
      const prot: Vec = c && c.team === a.team ? c : runAimPoint(sim);
      const n = norm({ x: prot.x - t.x, y: prot.y - t.y });
      seek(a, t.x + n.x * 0.85, t.y + n.y * 0.85, 1, 0.25);
      return;
    }
  }
  // No target: climb in front of the ball
  if (c && c.team === a.team) {
    seek(a, c.x + fwd * 4, c.y + (a.y - c.y) * 0.5, 0.8);
    return;
  }
  const aim = runAimPoint(sim);
  seek(a, a.x + fwd * 2, a.y + (aim.y - a.y) * 0.2, 0.7);
}

function runAimPoint(sim: PlaySim): Vec {
  const s = sim.setup;
  if (s.kind !== 'scrimmage') return { x: s.los, y: CENTER_Y };
  const aim = (s.offPlay?.aim ?? 0) * (s.flip ? -1 : 1);
  return { x: s.los + 1, y: s.ballY + aim };
}

// ------------------------------------------------------------------ defense

function thinkMan(ctx: AiCtx, a: Actor) {
  const sim = ctx.sim;
  const s = sim.setup;
  if (a.reactT > 0) { keepMomentum(a); return; }
  const t = a.manTarget != null ? sim.actors[a.manTarget] : undefined;
  if (!t) { a.role = 'zone'; a.zoneSpot = { x: s.los + 8, y: a.y }; return; }
  // Receiver became a blocker (run play) → read run and come up
  if (t.role !== 'route' && t.role !== 'carrier' && t.role !== 'carry') {
    const qbHasIt = sim.ball.holder === sim.qbIdx;
    if (!qbHasIt || sim.handedOff) { a.role = 'pursue'; a.reactT = 0.2 + (1 - s.skill.D) * 0.3; return; }
    seek(a, s.los + 4, t.y, 0.6);
    return;
  }
  const skill = s.skill.D;
  const deepThreat = t.x > s.los + 8 ? 1 : 0;
  const startCushion = Math.max(1, a.startX - t.startX);
  // Off-man: bail and keep the cushion, giving ground slower than the receiver closes.
  const cushion = Math.max(0.9 + deepThreat * 0.5 + skill * 0.4, startCushion - sim.t * (3.2 - skill * 1.2));
  const inside = t.y < CENTER_Y ? 0.6 : -0.6;
  const anticipate = 0.12 + skill * 0.2;
  const tx = t.x + t.vx * anticipate + cushion;
  const ty = t.y + t.vy * anticipate + inside;
  seek(a, tx, ty, 1, 0.5);
}

function thinkZone(ctx: AiCtx, a: Actor) {
  const sim = ctx.sim;
  const s = sim.setup;
  if (a.reactT > 0) { keepMomentum(a); return; }
  const spot = a.zoneSpot ?? { x: s.los + 7, y: a.y };
  // Run read: once handed off / QB across the LOS, come up
  if (sim.carrier && sim.carrier.team !== a.team && (sim.handedOff || sim.pastLos || sim.qbRun)) {
    a.role = 'pursue';
    a.reactT = a.zoneDeep ? 0.35 : 0.12;
    return;
  }
  const radius = a.zoneDeep ? 14 : 9;
  let threat: Actor | null = null;
  let score = -1e9;
  for (const r of sim.actors) {
    if (r.team === a.team || r.role !== 'route') continue;
    const d = dist(r, spot);
    if (d > radius) continue;
    const sc = a.zoneDeep ? r.x - d * 0.3 : -d;
    if (sc > score) { score = sc; threat = r; }
  }
  const skill = s.skill.D;
  if (threat) {
    if (a.zoneDeep) {
      const x = Math.max(spot.x - 2, threat.x + 2.5 + threat.vx * 0.3);
      const y = spot.y + (threat.y - spot.y) * (0.55 + skill * 0.25);
      seek(a, x, y, 0.95, 0.8);
    } else {
      const x = clamp(threat.x + threat.vx * 0.2, spot.x - 3, spot.x + 5);
      const y = spot.y + (threat.y + threat.vy * 0.2 - spot.y) * (0.5 + skill * 0.3);
      seek(a, x, y, 0.95, 0.6);
    }
    return;
  }
  seek(a, spot.x, spot.y, 0.85, 1);
}

// ------------------------------------------------------------------ blocking assignment

export function assignBlocks(ctx: AiCtx) {
  const sim = ctx.sim;
  const s = sim.setup;
  const c = sim.carrier;
  // Which team is blocking?
  let team: 'O' | 'D' = 'O';
  if (c) team = c.team;
  else if (s.kind !== 'scrimmage' && sim.ball.state === 'air') team = 'D';
  const passPro = s.kind === 'scrimmage' && s.offPlay?.kind === 'pass' && !sim.passThrown && !sim.pastLos && (!c || c.idx === sim.qbIdx);
  const blockers = sim.actors.filter((a) => a.team === team && a.engaged < 0 && !a.down && a !== c &&
    (a.role === 'pblock' || a.role === 'rblock' || a.role === 'lead' || a.role === 'kblock'));
  const threats = sim.actors.filter((a) => a.team !== team && !a.down && a.engaged < 0 && a.role !== 'kicker');
  if (!blockers.length || !threats.length) return;
  const protect: Vec = c ?? (s.kind === 'scrimmage' ? runAimPoint(sim) : { x: sim.ball.x, y: sim.ball.y });
  const qb = sim.actors[sim.qbIdx];
  const pairs: { b: Actor; t: Actor; cost: number }[] = [];
  for (const b of blockers) {
    for (const t of threats) {
      if (passPro) {
        if (t.role !== 'rush' && dist(t, qb) > 7) continue;
        const cost = Math.abs(b.y - t.y) * 1.1 + Math.abs(b.x - t.x) * 0.5 + dist(t, qb) * 0.3;
        if (cost > 9) continue;
        pairs.push({ b, t, cost });
      } else {
        const fwd = team === 'O' ? 1 : -1;
        // Only block threats in front of (or level with) the ball carrier
        if ((t.x - protect.x) * fwd < -2.5) continue;
        const db = dist(b, t);
        if (db > 12) continue;
        const cost = db + dist(t, protect) * 0.7 + (b.role === 'lead' ? -1.5 : 0);
        pairs.push({ b, t, cost });
      }
    }
  }
  pairs.sort((x, y) => x.cost - y.cost);
  const usedB = new Set<number>();
  const usedT = new Map<number, number>();
  for (const b of blockers) b.blockTarget = -1;
  for (const pr of pairs) {
    if (usedB.has(pr.b.idx)) continue;
    const n = usedT.get(pr.t.idx) ?? 0;
    if (n >= (passPro ? 2 : 1)) continue;
    usedB.add(pr.b.idx);
    usedT.set(pr.t.idx, n + 1);
    pr.b.blockTarget = pr.t.idx;
  }
}

// ------------------------------------------------------------------ CPU quarterback

export function cpuQbDecision(ctx: AiCtx, qb: Actor) {
  const sim = ctx.sim;
  const s = sim.setup;
  const play = s.offPlay;
  if (!play || play.kind !== 'pass' || sim.passThrown || sim.pastLos) return;
  if (sim.t < sim.dropTime()) return;
  if (ctx.qbNextRead != null && sim.t < ctx.qbNextRead) return;
  ctx.qbNextRead = sim.t + 0.1;
  const skill = s.skill.O;
  const speed = 16 + qb.p.attrs.arm * 0.1;
  const pressure = sim.pressureOn(qb);
  const sinceDrop = sim.t - sim.dropTime();
  let best: Actor | null = null;
  let bestScore = -1e9;
  let bestOpen = -1e9;
  const firstDownX = s.firstDownX ?? s.los + 10;
  const needYards = (s.down ?? 1) >= 3;
  for (const r of sim.actors) {
    if (r.team !== 'O' || r.role !== 'route') continue;
    // Progression: deeper reads become available a bit later
    const d0 = dist(qb, r);
    const ft = d0 / speed + 0.1;
    const P = sim.predict(r, ft);
    if (P.y < 1 || P.y > FIELD_W - 1) continue;
    let open = 99;
    for (const d of sim.actors) {
      if (d.team === 'O' || d.engaged >= 0 || d.down) continue;
      const reach = dist(d, P) - d.maxSpd * ft * (0.55 + skill * 0.3);
      // Perceived defender closeness (low skill misreads coverage)
      const noisy = reach + ctx.rng.normal(0, (1 - skill) * 1.6);
      if (noisy < open) open = noisy;
    }
    const gain = P.x - s.los;
    let sc = open * 1.0 + gain * (needYards ? 0.05 : 0.09);
    if (needYards && P.x >= firstDownX) sc += 1.5;
    if (P.x >= 100) sc += 1.5;
    if (r.route && r.route.end === 'sit' && r.route.i < r.route.pts.length) sc -= 0.8; // not at the stem yet
    if (sc > bestScore) { bestScore = sc; best = r; bestOpen = open; }
  }
  if (!best) return;
  const threshold = 2.6 - sinceDrop * 0.9 - pressure * 1.2;
  const needOpen = 0.2 + skill * 0.6;
  if (bestOpen > needOpen && bestScore > threshold) {
    sim.throwTo(qb, best);
    return;
  }
  // Under heavy pressure
  if (pressure > 0.6) {
    if (bestOpen > -0.3 + (1 - skill) * -1) { sim.throwTo(qb, best); return; }
    // Smart QBs throw it away instead of taking a sack, if out of the pocket
    if (skill > 0.5 && Math.abs(qb.y - s.ballY) > 4.5 && ctx.rng.chance(0.4)) { sim.throwAway(qb); return; }
  }
  // Scramble when everyone is covered and a lane exists
  if (sinceDrop > 2.2 && qb.p.attrs.mob > 55 && ctx.rng.chance(0.03 + qb.p.attrs.mob * 0.0006)) {
    ctx.scramble = true;
  }
  if (sinceDrop > 4.2) {
    if (bestOpen > -1.5) sim.throwTo(qb, best);
    else if (Math.abs(qb.y - s.ballY) > 4.5) sim.throwAway(qb);
    else ctx.scramble = true;
  }
  if (ctx.scramble) {
    // Run forward; once past the LOS the sim converts him to a runner
    const steer = steerCarrier(ctx, qb, 1, skill);
    qb.desire = steer;
  }
}

// ------------------------------------------------------------------ CPU ball carrier

function steerCarrier(ctx: AiCtx, c: Actor, fwd: number, skill: number): Vec {
  const sim = ctx.sim;
  const s = sim.setup;
  const opps = sim.actors.filter((a) => a.team !== c.team && !a.down && a.stunT <= 0.2);
  let best: Vec = { x: fwd, y: 0 };
  let bestS = -1e9;
  const spd = c.maxSpd;
  const N = 17;
  const sp = Math.hypot(c.vx, c.vy);
  const head = sp > 0.5 ? { x: c.vx / sp, y: c.vy / sp } : { x: fwd, y: 0 };
  // Designed runs: hit the called hole first.
  let aim: Vec | null = null;
  if (s.kind === 'scrimmage' && c.team === 'O' && s.offPlay && sim.handedOff && c.x < s.los + 2.5 && sim.t < 2.2) {
    const a = (s.offPlay.aim ?? 0) * (s.flip ? -1 : 1);
    aim = { x: s.los + 3, y: s.ballY + a };
  }
  for (let i = 0; i < N; i++) {
    const ang = (-85 + (170 * i) / (N - 1)) * (Math.PI / 180);
    const dir = { x: Math.cos(ang) * fwd, y: Math.sin(ang) };
    let score = dir.x * fwd * 5 + (dir.x * head.x + dir.y * head.y) * 0.9;
    if (aim) {
      const n = norm({ x: aim.x - c.x, y: aim.y - c.y });
      score += (dir.x * n.x + dir.y * n.y) * 3;
    }
    for (const t of [0.3, 0.65, 1.0]) {
      const px = c.x + dir.x * spd * t;
      const py = c.y + dir.y * spd * t;
      if (py < 0.8 || py > FIELD_W - 0.8) score -= 5 * t;
      for (const o of opps) {
        const blocked = o.engaged >= 0;
        const reach = Math.hypot(o.x - px, o.y - py) - o.maxSpd * t * (blocked ? 0.2 : 0.7);
        if (reach < 1.1) score -= ((1.1 - reach) * (blocked ? 0.5 : 1.8)) / (t + 0.35);
      }
    }
    // Low-skill runners "see" less
    score += ctx.rng.normal(0, (1 - skill) * 0.8);
    if (score > bestS) { bestS = score; best = dir; }
  }
  return best;
}

export function cpuCarrierMoves(ctx: AiCtx, c: Actor) {
  const sim = ctx.sim;
  const s = sim.setup;
  if (c.role !== 'carrier' && !(c.idx === sim.qbIdx && (sim.pastLos || ctx.scramble || s.offPlay?.kind === 'option' || s.offPlay?.kind === 'sneak'))) return;
  if (c.idx === sim.qbIdx && s.kind === 'scrimmage' && s.offPlay?.kind === 'option' && !sim.pastLos && sim.t < 0.85) return;
  const skill = c.team === 'D' ? s.skill.D : s.skill.O;
  const fwd = c.team === 'O' ? 1 : -1;
  // Returner in own end zone deciding
  const dir = steerCarrier(ctx, c, fwd, skill);
  c.desire = { x: dir.x, y: dir.y };
  // Moves
  const threat = sim.actors.find((d) => d.team !== c.team && isFree(d) && dist(d, c) < 1.9 && (d.x - c.x) * fwd > -0.5);
  // Moves are decided at most a few times per second, not every frame.
  if (threat && sim.t >= (ctx.nextMove ?? 0)) {
    ctx.nextMove = sim.t + 0.35;
    if (c.jukeCd <= 0 && ctx.rng.chance(0.12 + skill * 0.18)) sim.doJuke(c, threat.y > c.y ? -1 : 1);
    else if (c.spinCd <= 0 && ctx.rng.chance(0.04 + skill * 0.06)) sim.doSpin(c);
  }
  // Dive for the goal line / first down
  const firstDownX = s.firstDownX ?? 999;
  if (threat && c.diveT <= 0 && c.team === 'O' && s.kind === 'scrimmage') {
    const toGoal = 100 - c.x;
    const toFirst = firstDownX - c.x;
    if ((toGoal > 0 && toGoal < 2.2) || (toFirst > 0 && toFirst < 1.6)) sim.doDive(c, 1, 0);
  }
}
