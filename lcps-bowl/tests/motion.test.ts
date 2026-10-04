import { describe, it, expect } from 'vitest';
import { GameSession } from '../src/game/GameSession';
import { getTeam } from '../src/data/teams';
import { generateRoster } from '../src/game/players';
import { RNG } from '../src/game/rng';
import { AnimDirector } from '../src/game/render/anim';
import { ACTIONS, ACTION, BUILDS, DIRS, CELL, ORIGIN, frameAt } from '../src/gear/rig/spec';
import { POSES } from '../src/gear/rig/pose';
import { rasterize } from '../src/gear/rig/raster';
import { demoLook } from '../src/gear/rig/demo';

describe('animation schedule (techpack)', () => {
  it('every action has the specified frame count, fps, loop mode and poses for each frame', () => {
    const want: Record<string, [number, number]> = {
      idle: [2, 3], stanceSkill: [2, 3], threePoint: [2, 3], walk: [4, 6], run: [6, 10], runBall: [6, 10], sprint: [6, 12], dropback: [4, 8],
      throw: [6, 12], handoff: [4, 10], receiveHandoff: [4, 10], catchLow: [4, 12], catchHigh: [6, 10], juke: [4, 12], spin: [6, 12],
      stiffArm: [4, 10], block: [4, 8], shed: [4, 10], shuffle: [4, 8], backpedal: [4, 8], tackle: [6, 12], tackled: [6, 12], dive: [6, 12],
      sack: [6, 12], interception: [6, 10], snap: [4, 10], kick: [6, 12], punt: [6, 10], kneel: [4, 8], getUp: [6, 8], celebrate: [6, 8],
    };
    expect(ACTIONS).toHaveLength(31);
    for (const a of ACTIONS) {
      expect([a.frames, a.fps], a.id).toEqual(want[a.id]);
      expect(POSES[a.id], a.id).toHaveLength(a.frames);
      expect(a.keys, a.id).toHaveLength(a.frames);
    }
    expect(ACTION.throw.events.release).toBe(4);
    expect(ACTION.snap.events.detach).toBe(2);
    expect(ACTION.kick.events.launch).toBe(3);
    expect(ACTION.punt.events).toEqual({ release: 2, strike: 4 });
    expect(ACTION.block.loop).toEqual([2, 3]);
    expect(frameAt(ACTION.block, 10).frame).toBeGreaterThanOrEqual(2);
  });

  it('rasterizes every action × frame × build × direction inside the 48×48 cell with the ball anchor where the pose holds it', () => {
    const look = demoLook('speedflex', 'battle');
    for (const b of BUILDS) for (const d of DIRS) for (const a of ACTIONS) for (let f = 0; f < a.frames; f++) {
      const fr = rasterize(look, b, d, a.id, f, { number: 7 });
      let n = 0, minX = CELL, maxX = 0, maxY = 0;
      for (let i = 0; i < CELL * CELL; i++) if (fr.px[i * 4 + 3]) { n++; const x = i % CELL, y = Math.floor(i / CELL); minX = Math.min(minX, x); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
      expect(n, `${b} ${d} ${a.id} ${f}`).toBeGreaterThan(60);
      expect(minX, `${b} ${d} ${a.id} ${f}`).toBeGreaterThan(0);
      expect(maxX, `${b} ${d} ${a.id} ${f}`).toBeLessThan(CELL - 1);
      expect(maxY, `${b} ${d} ${a.id} ${f} feet stay on the baseline`).toBeLessThanOrEqual(ORIGIN.y + 1);
      const wantsBall = POSES[a.id][f].ball !== 'none';
      expect(!!fr.anchors.ball, `${a.id} ${f}`).toBe(wantsBall);
    }
  });

  it('builds share one pixel grid and helmet size; only bodies widen (front view shoulder widths per techpack)', () => {
    const width = (b: (typeof BUILDS)[number]) => {
      const fr = rasterize(demoLook(), b, 'toward', 'idle', 0);
      const row = ORIGIN.y - 18; // shoulder line
      let lo = CELL, hi = 0;
      for (let x = 0; x < CELL; x++) if (fr.px[(row * CELL + x) * 4 + 3]) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
      return hi - lo + 1;
    };
    const [s, h, l] = [width('skill'), width('hybrid'), width('lineman')];
    expect(s).toBeGreaterThanOrEqual(13); expect(s).toBeLessThanOrEqual(16);
    expect(h).toBeGreaterThanOrEqual(16); expect(h).toBeLessThanOrEqual(19);
    expect(l).toBeGreaterThanOrEqual(20); expect(l).toBeLessThanOrEqual(23);
  });

  it('left arm gear stays on the anatomical left arm when the player turns', () => {
    const look = demoLook('standard', 'standard', { arms: { L: { sleeve: { colors: ['#00ff00'], len: 'full', padded: false } }, R: {} } });
    const green = (d: (typeof DIRS)[number]) => {
      const fr = rasterize(look, 'hybrid', d, 'idle', 0);
      const xs: number[] = [];
      for (let i = 0; i < CELL * CELL; i++) if (fr.px[i * 4] === 0 && fr.px[i * 4 + 1] === 255 && fr.px[i * 4 + 2] === 0) xs.push(i % CELL);
      return { n: xs.length, wristL: fr.anchors.wristL, xs };
    };
    // facing the camera, the player's left is screen right; facing away, screen left
    const t = green('toward'), a = green('away');
    expect(t.n).toBeGreaterThan(0); expect(a.n).toBeGreaterThan(0);
    expect(Math.min(...t.xs)).toBeGreaterThan(ORIGIN.x);
    expect(Math.max(...a.xs)).toBeLessThan(ORIGIN.x);
    // in profile the sleeve is visible on the near side when facing left (left arm near) and still present (far) facing right
    expect(green('left').n).toBeGreaterThan(green('right').n - 1);
  });
});

describe('gameplay animation director', () => {
  const team = (id: string) => ({ info: getTeam(id), roster: generateRoster(getTeam(id).offenseRating, getTeam(id).defenseRating, getTeam(id).specialTeamsRating, new RNG(id.length)) });

  it('follows authoritative engine events through full games and never sticks in a one-shot', () => {
    for (const seed of [3]) {
      const s = new GameSession({ home: team('riverside'), away: team('heritage'), userSide: null, difficulty: 'VARSITY', quarterLen: 90, weather: 'clear', timeOfDay: 'night', seed });
      // interactive timing (post-play pause etc.) so get-up sequences can play out
      if (s.phase === 'intro') s.nextPhase();
      const dir = new AnimDirector();
      const dt = 1 / 30;
      const seen = new Set<string>();
      let checked = 0;
      let lastSim: unknown = null;
      let evIdx = 0;
      const oneShotSince = new Map<number, { action: string; t: number }>();
      let clock = 0;
      for (let step = 0; step < 300000 && !s.isOver; step++) {
        s.update(dt);
        clock += dt;
        if (s.phase === 'playcall' || s.phase === 'pat_choice' || s.phase === 'kick_meter') s.nextPhase();
        const sim = s.sim;
        if (!sim) continue;
        dir.update(s, dt);
        if (sim !== lastSim) { lastSim = sim; evIdx = 0; oneShotSince.clear(); }
        for (; evIdx < sim.events.length; evIdx++) {
          const e = sim.events[evIdx];
          const act = (i: number) => dir.pick(sim.actors[i]).action;
          if (e.t === 'throw') { expect(act(e.qb)).toBe('throw'); expect(dir.pick(sim.actors[e.qb]).frame).toBeGreaterThanOrEqual(4); checked++; }
          if (e.t === 'catch') { expect(['catchLow', 'catchHigh', 'runBall']).toContain(act(e.by)); checked++; }
          if (e.t === 'int') { expect(['interception', 'runBall']).toContain(act(e.by)); checked++; }
          if (e.t === 'tackle') { expect(act(e.by)).toBe('tackle'); expect(act(e.carrier)).toBe('tackled'); checked++; }
          if (e.t === 'sack') { expect(act(e.by)).toBe('tackle'); expect(act(e.qb)).toBe('sack'); checked++; }
          if (e.t === 'handoff') { expect(['receiveHandoff', 'runBall']).toContain(act(e.to)); checked++; }
          if (e.t === 'kick') { expect(['kick', 'punt']).toContain(act(e.by)); checked++; }
        }
        for (const a of sim.actors) {
          const p = dir.pick(a);
          seen.add(p.action);
          const spec = ACTION[p.action];
          // one-shots that are not grounded holds must finish within their own length (+ slack)
          if (spec.loop === false && spec.next !== 'hold') {
            const o = oneShotSince.get(a.idx);
            if (!o || o.action !== p.action) oneShotSince.set(a.idx, { action: p.action, t: clock });
            else if (p.action !== 'throw' && p.action !== 'snap' && p.action !== 'runBall') expect(clock - o.t, `${p.action} stuck`).toBeLessThan(spec.frames / spec.fps + 3);
          } else oneShotSince.delete(a.idx);
        }
      }
      expect(s.isOver).toBe(true);
      expect(checked).toBeGreaterThan(20);
      for (const want of ['stanceSkill', 'threePoint', 'run', 'runBall', 'block', 'tackle', 'tackled', 'throw', 'catchLow', 'getUp', 'kick', 'snap']) expect(seen.has(want), want).toBe(true);
    }
  }, 120000);
});
