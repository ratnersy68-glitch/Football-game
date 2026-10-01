/**
 * FieldingEngine: who chases the ball, base coverage, fielder movement (AI and user),
 * diving / leaping, catch resolution, and throws (AI decisions and the user's throw meter).
 */
import type { FieldPos } from '../core/types';
import { G, MPH, clamp, sprayAngle, type V2 } from '../core/math';
import { wallDistance, wallHeight } from '../data/stadiums';
import { basePos, pathPos } from './Field';
import type { Fielder, LivePlay, Runner } from './LivePlay';
import * as BR from './BaseRunningEngine';

export interface DefenseInput {
  move: V2; // world-space direction, magnitude 0..1
  sprint: boolean;
  dive: boolean; // edge
  throwTo: number | null; // base 1..4 released this frame
  throwMeter: number; // meter value at release
}

const PRIORITY: Record<FieldPos, number> = { CF: 9, LF: 8, RF: 8, SS: 7, '2B': 6, '3B': 5, '1B': 4, P: 2, C: 1 };

export function throwSpeed(f: Fielder): number {
  return (58 + f.player.ratings.arm * 0.37) * MPH;
}

/** Effective throw time (s) from a fielder to a point, including release. */
export function throwTime(f: Fielder, to: V2): number {
  const d = Math.hypot(f.x - to.x, f.z - to.z);
  const outfield = Math.hypot(f.x, f.z) > 170;
  const release = outfield ? 0.5 : f.pos === 'C' ? 0.45 : 0.28;
  return release + d / (throwSpeed(f) * (1 - Math.min(0.18, d / 1800)));
}

// ------------------------------------------------------------------ intercepts

export interface Intercept { f: Fielder; t: number; tAbs: number; x: number; z: number; air: boolean }

export function interceptFor(play: LivePlay, f: Fielder): Intercept | null {
  const b = play.ball;
  const path = b.path;
  if (!path.length) return null;
  const elapsed = play.t - b.pathT0;
  let landed = b.touchedGround;
  const st = play.cfg.stadium;
  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    if (s.event === 'bounce' || s.rolling) landed = true;
    if (s.event === 'homerun' || s.event === 'outofplay') {
      // Leaping catch at the wall?
      if (s.event === 'homerun') {
        const ang = sprayAngle(s.x, s.z);
        const h = wallHeight(st, ang);
        if (s.y < h + 3.2 && !landed) {
          const tb = s.t - elapsed;
          const d = Math.max(0, Math.hypot(f.x - s.x, f.z - s.z) - 2.5);
          if (Math.max(0, f.react) + d / f.speed <= tb) return { f, t: tb, tAbs: play.t + tb, x: s.x, z: s.z, air: true };
        }
      }
      return null;
    }
    const tb = s.t - elapsed;
    if (tb < 0) continue;
    if (i % 2 === 1 && i !== path.length - 1) continue;
    const r = Math.hypot(s.x, s.z);
    const ang = sprayAngle(s.x, s.z);
    const nearWall = Math.abs(ang) <= 45 && r > wallDistance(st, ang) - 8;
    const maxH = nearWall ? 10.5 : 7.6;
    if (s.y > maxH) continue;
    if (f.pos === 'C' && r > 45) continue;
    const d = Math.max(0, Math.hypot(f.x - s.x, f.z - s.z) - 2.3);
    const tr = Math.max(0, f.react) + d / f.speed;
    if (tr <= tb) return { f, t: tb, tAbs: play.t + tb, x: s.x, z: s.z, air: !landed };
  }
  const last = path[path.length - 1];
  if (last.event === 'homerun' || last.event === 'outofplay') return null;
  if (f.pos === 'C' && Math.hypot(last.x, last.z) > 45) return null;
  const d = Math.hypot(f.x - last.x, f.z - last.z);
  const t = Math.max(Math.max(0, f.react) + d / f.speed, last.t - elapsed);
  return { f, t, tAbs: play.t + t, x: last.x, z: last.z, air: false };
}

export function computeChaser(play: LivePlay): Fielder | null {
  const res: Intercept[] = [];
  for (const f of play.fielders) {
    if (f.down > 0 || f.hasBall) continue;
    const it = interceptFor(play, f);
    if (it) res.push(it);
  }
  if (!res.length) { play.intercept = null; play.flyCatchable = false; return null; }
  const air = res.filter((r) => r.air);
  let best: Intercept;
  if (air.length) {
    air.sort((a, b) => PRIORITY[b.f.pos] - PRIORITY[a.f.pos] || a.t - b.t);
    best = air[0];
  } else {
    res.sort((a, b) => a.t - b.t);
    best = res[0];
  }
  play.intercept = best;
  play.flyCatchable = play.ball.battedInAir && air.length > 0;
  return best.f;
}

// ------------------------------------------------------------------ assignments

export function coverFielder(play: LivePlay, base: number): Fielder | null {
  const c = play.fielders.find((f) => f.task === 'cover' && f.coverBase === base);
  if (c) return c;
  const bp = basePos(base);
  let best: Fielder | null = null;
  let bd = Infinity;
  for (const f of play.fielders) {
    if (f.hasBall || f.task === 'chase' || f.down > 0) continue;
    const d = Math.hypot(f.x - bp.x, f.z - bp.z);
    if (d < bd) { bd = d; best = f; }
  }
  if (best) { best.task = 'cover'; best.coverBase = base; }
  return best;
}

export function assignCoverage(play: LivePlay) {
  const chaser = play.chaser;
  const pick = (...cands: FieldPos[]) => cands.find((p) => p !== chaser?.pos && !play.fielder(p).hasBall) ?? null;
  for (const f of play.fielders) {
    if (f === chaser) { f.task = 'chase'; continue; }
    if (f.hasBall) continue;
    f.task = 'backup';
    f.coverBase = -1;
  }
  const ballX = play.intercept?.x ?? play.ball.phys.p.x;
  const c1 = pick('1B', 'P', '2B');
  const c2 = ballX > 0 ? pick('SS', '2B') : pick('2B', 'SS');
  const c3 = pick('3B', 'SS', 'P');
  const ch = pick('C', 'P');
  const used = new Set<string>();
  const set = (pos: FieldPos | null, base: number) => {
    if (!pos || used.has(pos)) return;
    const f = play.fielder(pos);
    if (f.hasBall) return;
    used.add(pos);
    f.task = 'cover';
    f.coverBase = base;
  };
  set(c1, 1);
  set(c2, 2);
  set(c3, 3);
  set(ch, 4);
  if (!play.fielders.some((f) => f.coverBase === 3 && f.task === 'cover')) set(pick('SS', 'P'), 3);
}

export function initAssignments(play: LivePlay) {
  if (play.ball.mode === 'loose') {
    play.chaser = computeChaser(play);
    assignCoverage(play);
    if (play.cfg.userDefense) play.controlled = play.chaser;
  } else {
    // Steal: catcher has it.
    play.chaser = null;
    assignCoverage(play);
    const ss = play.fielder('SS');
    const sb = play.fielder('2B');
    // The shortstop covers second on a steal; the second baseman backs up.
    ss.task = 'cover'; ss.coverBase = 2;
    if (sb.coverBase === 2) { sb.task = 'cover'; sb.coverBase = 1; play.fielder('1B').task = 'backup'; play.fielder('1B').coverBase = -1; }
    if (play.cfg.userDefense) play.controlled = play.ball.holder;
  }
}

// ------------------------------------------------------------------ movement

function moveToward(f: Fielder, tx: number, tz: number, speed: number, dt: number) {
  const dx = tx - f.x, dz = tz - f.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.4) {
    f.vx *= 0.6; f.vz *= 0.6;
    if (Math.hypot(f.vx, f.vz) < 0.5) { f.vx = 0; f.vz = 0; }
  } else {
    const want = Math.min(speed, d * 4);
    const ux = dx / d, uz = dz / d;
    const acc = 34 * dt;
    f.vx += clamp(ux * want - f.vx, -acc, acc);
    f.vz += clamp(uz * want - f.vz, -acc, acc);
  }
  f.x += f.vx * dt;
  f.z += f.vz * dt;
}

function faceToward(f: Fielder, x: number, z: number) {
  const dx = x - f.x, dz = z - f.z;
  if (Math.hypot(dx, dz) > 0.5) f.facing = Math.atan2(dx, dz);
}

export function updateFielders(play: LivePlay, dt: number, input: DefenseInput | null) {
  const b = play.ball;
  if (b.mode === 'loose') {
    play.chaseCd -= dt;
    if (play.chaseCd <= 0) {
      const prev = play.chaser;
      play.chaser = computeChaser(play);
      if (play.chaser !== prev) {
        assignCoverage(play);
        if (play.cfg.userDefense && play.chaser && (!play.controlled || !play.controlled.hasBall)) play.controlled = play.chaser;
      }
      play.chaseCd = 0.25;
    }
  }
  for (const f of play.fielders) {
    f.catchCd = Math.max(0, f.catchCd - dt);
    f.throwAnim = Math.max(0, f.throwAnim - dt);
    f.catchAnim = Math.max(0, f.catchAnim - dt);
    f.react -= dt;
    if (f.hasBall) f.holdTime += dt;
    if (f.down > 0) { f.down -= dt; f.vx = 0; f.vz = 0; continue; }
    if (f.dive > 0) {
      f.dive -= dt;
      f.x += f.diveDir.x * 17 * dt;
      f.z += f.diveDir.z * 17 * dt;
      if (f.dive <= 0) f.down = f.hasBall ? 0.35 : 0.8;
      continue;
    }
    if (f.jump > 0) { f.jump -= dt; f.vx *= 0.9; f.vz *= 0.9; f.x += f.vx * dt; f.z += f.vz * dt; continue; }

    const isUser = play.cfg.userDefense && play.controlled === f && !play.homeRun && !play.foul;
    if (isUser && input) {
      const m = input.move;
      const mag = Math.hypot(m.x, m.z);
      if (mag > 0.15) play.userMoved = true;
      if (play.userMoved || !play.cfg.fieldingAssist || f.hasBall) {
        const sp = f.speed * (input.sprint ? 1 : 0.84);
        if (mag > 0.15) {
          const tx = f.x + (m.x / mag) * 10, tz = f.z + (m.z / mag) * 10;
          moveToward(f, tx, tz, sp * Math.min(1, mag), dt);
          f.facing = Math.atan2(m.x, m.z);
        } else {
          moveToward(f, f.x, f.z, 0, dt);
          faceToward(f, b.phys.p.x, b.phys.p.z);
        }
      } else aiMove(play, f, dt);
      if (input.dive && !f.hasBall) startDiveOrJump(play, f, mag > 0.15 ? { x: m.x / mag, z: m.z / mag } : null);
      if (input.throwTo && f.hasBall) {
        const { effort, err } = throwFromMeter(play, f, input.throwMeter);
        makeThrow(play, f, input.throwTo, effort, err);
      }
      continue;
    }
    aiMove(play, f, dt);
  }
}

function startDiveOrJump(play: LivePlay, f: Fielder, dir: V2 | null) {
  const st = play.cfg.stadium;
  const ang = sprayAngle(f.x, f.z);
  const r = Math.hypot(f.x, f.z);
  if (Math.abs(ang) <= 45 && r > wallDistance(st, ang) - 9) {
    f.jump = 0.6;
    play.emit('jump');
    return;
  }
  let d = dir;
  if (!d) {
    const dx = play.ball.phys.p.x - f.x, dz = play.ball.phys.p.z - f.z;
    const l = Math.hypot(dx, dz) || 1;
    d = { x: dx / l, z: dz / l };
  }
  f.dive = 0.42;
  f.diveDir = d;
  f.facing = Math.atan2(d.x, d.z);
  play.emit('dive');
}

function aiMove(play: LivePlay, f: Fielder, dt: number) {
  const b = play.ball;
  if (f.react > 0 && !f.hasBall && f.task === 'chase') { faceToward(f, b.phys.p.x, b.phys.p.z); return; }
  if (f.hasBall) {
    holderThink(play, f, dt);
    return;
  }
  if (play.homeRun || play.foul || b.mode === 'dead') {
    moveToward(f, f.x, f.z, 0, dt);
    return;
  }
  let tx = f.x, tz = f.z;
  let speed = f.speed;
  if (f === play.chaser && b.mode === 'loose' && play.intercept) {
    const it = play.intercept;
    const remain = Math.max(0, it.tAbs - play.t);
    const errScale = Math.min(1, remain / 3);
    tx = it.x + f.routeErr.x * errScale;
    tz = it.z + f.routeErr.z * errScale;
    const bd = Math.hypot(b.phys.p.x - f.x, b.phys.p.z - f.z);
    if (!b.battedInAir && bd < 14) { tx = b.phys.p.x; tz = b.phys.p.z; }
    // Leap at the wall for a ball about to clear it.
    if (b.battedInAir && bd < 9 && b.phys.p.y > 7.4 && b.phys.p.y < 13) {
      const ang = sprayAngle(f.x, f.z);
      if (Math.abs(ang) <= 45 && Math.hypot(f.x, f.z) > wallDistance(play.cfg.stadium, ang) - 9) {
        f.jump = 0.6;
        play.emit('jump');
      }
    }
    // Dive for a ball just out of reach.
    const infielder = !['LF', 'CF', 'RF'].includes(f.pos);
    if ((b.battedInAir || infielder) && bd < 9 && bd > 3 && b.phys.p.y < 3.5 && remain < 0.35 && play.cfg.rng.chance(0.08 + f.fld / 400)) {
      const l = bd || 1;
      if (!play.cfg.userDefense || play.controlled !== f) startDiveOrJump(play, f, { x: (b.phys.p.x - f.x) / l, z: (b.phys.p.z - f.z) / l });
    }
    faceToward(f, b.phys.p.x, b.phys.p.z);
  } else if (f.task === 'cover' && f.coverBase >= 1) {
    const bp = basePos(f.coverBase);
    tx = bp.x; tz = bp.z;
    // Shade toward an incoming throw.
    if (b.mode === 'thrown' && b.throwBase === f.coverBase) {
      const dx = b.throwTarget.x - bp.x, dz = b.throwTarget.z - bp.z;
      if (Math.hypot(dx, dz) < 9) { tx = b.throwTarget.x; tz = b.throwTarget.z; }
    }
    faceToward(f, b.phys.p.x, b.phys.p.z);
  } else if (f.task === 'backup') {
    const it = play.intercept;
    const outfielder = f.pos === 'LF' || f.pos === 'CF' || f.pos === 'RF';
    if (it && outfielder && b.mode === 'loose') {
      tx = f.home.x + (it.x - f.home.x) * 0.45;
      tz = f.home.z + (it.z - f.home.z) * 0.45;
      speed *= 0.8;
    } else if (f.pos === 'P') {
      tx = 0; tz = 50; speed *= 0.6;
    } else { tx = f.x; tz = f.z; }
    faceToward(f, b.phys.p.x, b.phys.p.z);
  } else if (f.task === 'tag' && f.target) {
    tx = f.target.x; tz = f.target.z;
  }
  moveToward(f, tx, tz, speed, dt);
}

// ------------------------------------------------------------------ catching

function segPoint(ax: number, az: number, bx: number, bz: number, px: number, pz: number) {
  const dx = bx - ax, dz = bz - az;
  const l2 = dx * dx + dz * dz;
  const t = l2 > 1e-9 ? clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1) : 1;
  return { t, x: ax + dx * t, z: az + dz * t };
}

export function checkCatches(play: LivePlay) {
  const b = play.ball;
  if (b.mode !== 'loose' && b.mode !== 'thrown') return;
  const a = b.prev, c = b.phys.p;
  const speed = Math.hypot(b.phys.v.x, b.phys.v.y, b.phys.v.z);
  let bestF: Fielder | null = null;
  let bestD = Infinity;
  let bestY = 0;
  for (const f of play.fielders) {
    if (f.catchCd > 0 || f.down > 0) continue;
    if (b.mode === 'thrown' && f === b.thrower) continue;
    if (b.mode === 'thrown' && Math.hypot(f.x - b.throwTarget.x, f.z - b.throwTarget.z) > 14) continue;
    const q = segPoint(a.x, a.z, c.x, c.z, f.x, f.z);
    const y = a.y + (c.y - a.y) * q.t;
    const d = Math.hypot(q.x - f.x, q.z - f.z);
    const reach = f.dive > 0 ? 6.5 : f.jump > 0 ? 3.2 : 2.5;
    const maxY = f.dive > 0 ? 3.8 : f.jump > 0 ? 11 : 7.8;
    // Attempt at the point of closest approach (or when it's right in the glove).
    const closest = q.t < 1 || d <= reach * 0.45;
    if (closest && d <= reach && y <= maxY && y >= -0.5 && d < bestD) {
      bestD = d; bestF = f; bestY = y;
    }
  }
  if (!bestF) return;
  const f = bestF;
  const reach = f.dive > 0 ? 6.5 : f.jump > 0 ? 3.2 : 2.5;
  const stretch = bestD / reach;
  const skill = (f.fld - 70) / 500;
  let p: number;
  if (b.mode === 'thrown') {
    p = 0.997 + skill * 0.3 - Math.max(0, stretch - 0.5) * 0.12;
    if (bestY < 1.2) p = 0.55 + f.fld * 0.004; // scoop
    if (bestY > 7) p -= 0.25;
  } else if (b.battedInAir) {
    p = 0.994 + skill - stretch * stretch * 0.12 - (Math.max(0, speed - 120) / 260) * stretch;
    if (f.dive > 0) p -= 0.22;
    if (f.jump > 0) p -= 0.3;
  } else {
    p = 0.988 + skill - stretch * stretch * 0.07 - Math.max(0, speed - 85) / 500;
    if (f.dive > 0) p -= 0.18;
  }
  p = clamp(p, 0.2, 0.997);
  f.catchCd = 0.35;
  if (play.cfg.rng.chance(p)) catchBall(play, f);
  else if (stretch > 0.75 && b.mode !== 'thrown') {
    // Just out of reach: the ball goes by untouched.
    f.catchCd = 1;
    play.emit('miss', { pos: f.pos });
  } else misplay(play, f, p);
}

function catchBall(play: LivePlay, f: Fielder) {
  const b = play.ball;
  const wasAir = b.battedInAir;
  const wasThrown = b.mode === 'thrown';
  if (b.fair === 'pending' && !wasAir) {
    play.decideFair();
    if (play.foul) return;
  }
  b.mode = 'held';
  b.holder = f;
  b.touchedByFielder = true;
  f.hasBall = true;
  f.holdTime = 0;
  f.catchAnim = 0.35;
  f.thinkCd = 0;
  if (!play.firstTouch) play.firstTouch = f;
  if (wasThrown && b.thrower) {
    const prev = play.assists.get(b.thrower.player.id) ?? [];
    play.assists.set(f.player.id, [...prev, b.thrower.player.id]);
  }
  play.chaser = null;
  play.emit(wasThrown ? 'catchThrow' : 'catch', { pos: f.pos, air: wasAir });
  if (wasAir) {
    b.battedInAir = false;
    if (b.fair === 'pending') b.fair = 'fair';
    play.caughtFly = true;
    const br = play.batterRunner();
    if (br) {
      const la = play.cfg.launchAngle ?? 30;
      play.recordOut(br, la > 50 ? 'pop' : la < 22 ? 'line' : 'fly', 0, f);
    }
    if (f.dive > 0) play.notable.add('diving');
    if (f.jump > 0) play.notable.add('robbed');
    for (const r of play.activeRunners()) {
      if (!r.isBatter && r.p > r.startBase * 90 + 0.5) {
        r.mustRetag = true;
      }
      r.thinkCd = 0;
    }
  } else {
    for (const r of play.activeRunners()) r.thinkCd = 0;
  }
  if (play.cfg.userDefense) play.controlled = f;
  for (const g of play.fielders) if (g.task === 'chase' && g !== f) g.task = 'backup';
  assignCoverage(play);
}

function misplay(play: LivePlay, f: Fielder, p: number) {
  const b = play.ball;
  const rng = play.cfg.rng;
  if (b.fair === 'pending' && !b.battedInAir) {
    play.decideFair();
    if (play.foul) return;
  }
  if (!play.firstTouch) play.firstTouch = f;
  b.touchedByFielder = true;
  const wasThrown = b.mode === 'thrown';
  const thrower = b.thrower;
  if (wasThrown) { b.mode = 'loose'; b.phys.rolling = false; b.phys.stopped = false; }
  // Ball kicks away.
  const sp = Math.hypot(b.phys.v.x, b.phys.v.z);
  const ang = rng.range(0, Math.PI * 2);
  const out = Math.min(25, sp * 0.25 + 4);
  b.phys.v = { x: Math.sin(ang) * out + b.phys.v.x * 0.15, y: Math.abs(b.phys.v.y) * 0.2 + 2, z: Math.cos(ang) * out + b.phys.v.z * 0.15 };
  b.phys.rolling = false;
  b.phys.stopped = false;
  play.emit('bobble', { pos: f.pos });
  if (p >= 0.9) {
    // Charge the error: bad throw -> thrower, otherwise the fielder.
    const charged = wasThrown && thrower && p < 0.9 ? thrower : f;
    play.errors.push(charged.player.id);
    play.emit('error', { pos: charged.pos });
    const br = play.batterRunner();
    if (br && !br.out) {
      if (br.lastTouched < 1) play.errorBeforeBatterSafe = true;
      else if (play.batterReachedBeforeError < 0) play.batterReachedBeforeError = br.lastTouched;
    }
  }
  play.repath();
  play.chaser = computeChaser(play);
  assignCoverage(play);
  for (const r of play.activeRunners()) r.thinkCd = 0;
}

// ------------------------------------------------------------------ throwing

export function makeThrow(play: LivePlay, f: Fielder, base: number, effort: number, err: { x: number; y: number; z: number }) {
  const b = play.ball;
  if (!f.hasBall) return;
  const recv = coverFielder(play, base);
  const bp = basePos(base);
  // Aim at the covering fielder if he's close to the bag, otherwise at the bag.
  let tx = bp.x, tz = bp.z;
  if (recv && Math.hypot(recv.x - bp.x, recv.z - bp.z) < 6) { tx = recv.x; tz = recv.z; }
  const start = play.handPos(f);
  start.y = 6;
  const aim = { x: tx + err.x, y: 4.4 + err.y, z: tz + err.z };
  const speed = throwSpeed(f) * effort * (1 - Math.min(0.18, Math.hypot(aim.x - start.x, aim.z - start.z) / 1800));
  const d = Math.hypot(aim.x - start.x, aim.z - start.z);
  const T = Math.max(0.12, d / speed);
  b.phys.p = start;
  b.phys.v = { x: (aim.x - start.x) / T, y: (aim.y - start.y + 0.5 * G * T * T) / T, z: (aim.z - start.z) / T };
  b.phys.backspin = 0; b.phys.sidespin = 0; b.phys.rolling = false; b.phys.stopped = false;
  b.prev = { ...start };
  b.mode = 'thrown';
  b.holder = null;
  b.thrower = f;
  b.throwBase = base;
  b.throwTarget = { x: aim.x, z: aim.z };
  f.hasBall = false;
  f.throwAnim = 0.4;
  f.facing = Math.atan2(aim.x - f.x, aim.z - f.z);
  f.task = 'backup';
  play.lastThrower = f;
  play.emit('throw', { base, pos: f.pos, mph: speed / MPH });
  if (play.cfg.userDefense && recv) play.controlled = recv;
  for (const r of play.activeRunners()) r.thinkCd = 0;
}

/** Convert a throw-meter release into effort + aim error. */
export function throwMeterZone(f: Fielder): { start: number; end: number } {
  const w = 0.09 + (f.fld / 100) * 0.07 + (f.player.ratings.arm / 100) * 0.04;
  return { start: 0.8 - w / 2, end: 0.8 + w / 2 };
}

export function throwFromMeter(play: LivePlay, f: Fielder, m: number) {
  const z = throwMeterZone(f);
  const rng = play.cfg.rng;
  let effort = 1;
  const err = { x: rng.gauss(0.35), y: rng.gauss(0.25), z: rng.gauss(0.35) };
  if (m < z.start) {
    effort = 0.55 + 0.45 * (m / z.start);
    err.y -= (z.start - m) * 8; // short-hop / in the dirt
    err.x += rng.gauss((z.start - m) * 5);
    err.z += rng.gauss((z.start - m) * 5);
  } else if (m > z.end) {
    effort = 1.06;
    const over = m - z.end;
    err.y += over * 26; // sails high
    err.x += rng.gauss(over * 22);
    err.z += rng.gauss(over * 22);
  }
  play.emit('throwGrade', { grade: m < z.start ? 'WEAK' : m > z.end ? 'OFFLINE' : 'ACCURATE' });
  return { effort, err };
}

function aiThrowError(play: LivePlay, f: Fielder, d: number) {
  const rng = play.cfg.rng;
  const sd = (0.2 + ((100 - f.fld) / 100) * 1.1) * Math.max(0.5, d / 110);
  const err = { x: rng.gauss(sd), y: rng.gauss(sd * 0.6), z: rng.gauss(sd) };
  const wildChance = ((100 - f.fld) / 100) * 0.03 + (d > 200 ? 0.01 : 0);
  if (rng.chance(wildChance)) {
    if (rng.chance(0.5)) err.y += rng.range(5, 9);
    else err.x += rng.pick([-1, 1]) * rng.range(6, 12);
  }
  return err;
}

interface ThrowOption { r: Runner; base: number; margin: number; self: boolean; forced: boolean }

/** AI fielder holding the ball: run it in, throw for an out, start a rundown, or hold. */
function holderThink(play: LivePlay, f: Fielder, dt: number) {
  f.thinkCd -= dt;
  if (play.cfg.userDefense && play.controlled === f) return;
  const outfield = f.pos === 'LF' || f.pos === 'CF' || f.pos === 'RF';
  const transfer = f.pos === 'C' ? 0.62 : (outfield ? 0.85 : 0.6) + (100 - f.fld) * 0.004;
  if (f.holdTime < transfer) { f.vx *= 0.8; f.vz *= 0.8; return; }
  if (play.totalOuts() >= 3) return;
  if (f.thinkCd > 0) {
    if (f.target) moveToward(f, f.target.x, f.target.z, f.speed, dt);
    return;
  }
  f.thinkCd = 0.12;
  f.target = null;
  const opts: ThrowOption[] = [];
  for (const r of play.activeRunners()) {
    if (r.trot) continue;
    const fwd = r.goal > r.p + 0.1;
    const back = r.goal < r.p - 0.1;
    if (BR.onBase(r) && !fwd && !r.mustRetag) continue;
    let base: number;
    let forced = false;
    if (r.mustRetag) { base = r.startBase; forced = true; }
    else if (back) base = Math.round(r.goal / 90);
    else { base = Math.ceil((r.p + 0.01) / 90); forced = play.isForced(r) && base === r.startBase + 1 && r.lastTouched < base; }
    if (base < 0 || base > 4) continue;
    const remain = Math.abs(base * 90 - r.p);
    const rv = Math.max(r.v, r.top * 0.7);
    const runnerT = remain / rv + Math.max(0, r.delay);
    const bp = basePos(base);
    const selfT = Math.hypot(f.x - bp.x, f.z - bp.z) / f.speed;
    const recv = coverFielder(play, base);
    let throwT = Infinity;
    if (recv && recv !== f) {
      const recvT = Math.hypot(recv.x - bp.x, recv.z - bp.z) / recv.speed;
      throwT = Math.max(throwTime(f, bp), recvT) + (forced ? 0.05 : 0.3);
    }
    const self = selfT + (forced ? 0 : 0.15) < throwT;
    const t = self ? selfT + (forced ? 0 : 0.15) : throwT;
    opts.push({ r, base, margin: runnerT - t, self, forced });
  }
  const steal = !play.cfg.batter && f.pos === 'C';
  const need = steal ? -0.35 : 0.04;
  const feasible = opts.filter((o) => o.margin > need);
  if (feasible.length) {
    feasible.sort((a, b) => (b.margin + b.base * 0.18 + (b.forced ? 0.15 : 0)) - (a.margin + a.base * 0.18 + (a.forced ? 0.15 : 0)));
    const o = feasible[0];
    if (o.self) {
      const bp = basePos(o.base);
      f.target = { x: bp.x, z: bp.z };
      if (!o.forced && !o.r.mustRetag) {
        const rp = pathPos(o.r.p);
        f.target = { x: rp.x, z: rp.z };
      }
      moveToward(f, f.target.x, f.target.z, f.speed, dt);
    } else {
      const bp = basePos(o.base);
      makeThrow(play, f, o.base, 1, aiThrowError(play, f, Math.hypot(f.x - bp.x, f.z - bp.z)));
    }
    return;
  }
  // Rundown: chase a stranded runner.
  const stranded = play.activeRunners().find((r) => !BR.onBase(r) && !r.trot && Math.abs(r.goal - r.p) < 0.5);
  if (stranded) {
    const rp = pathPos(stranded.p);
    const d = Math.hypot(rp.x - f.x, rp.z - f.z);
    if (d < 40) {
      f.target = { x: rp.x, z: rp.z };
      moveToward(f, rp.x, rp.z, f.speed, dt);
      return;
    }
    // Throw ahead of the runner.
    const ahead = Math.ceil((stranded.p + 0.01) / 90);
    const target = stranded.goal > stranded.p ? ahead : Math.floor(stranded.p / 90);
    const bp = basePos(target);
    if (Math.hypot(f.x - bp.x, f.z - bp.z) > 30) {
      makeThrow(play, f, Math.max(1, target), 0.9, aiThrowError(play, f, Math.hypot(f.x - bp.x, f.z - bp.z)));
      return;
    }
  }
  // Outfielders get the ball back to the infield.
  const r = Math.hypot(f.x, f.z);
  if (r > 165) {
    // No play anywhere: hit the cutoff / the base ahead of the trailing runner.
    const adv = play.activeRunners().filter((x) => !x.trot && x.goal > x.p + 0.1);
    let base = 2;
    if (adv.length) base = Math.min(...adv.map((x) => Math.min(4, Math.max(2, Math.round(x.goal / 90)))));
    const bp = basePos(base);
    makeThrow(play, f, base, 0.95, aiThrowError(play, f, Math.hypot(f.x - bp.x, f.z - bp.z)));
    return;
  }
  moveToward(f, f.x, f.z, 0, dt);
}
