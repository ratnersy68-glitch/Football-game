/**
 * PlayerController: turns raw keyboard / mouse / gamepad state into the engine's FrameInput.
 *
 *  Batting:   mouse (or arrows / left stick) moves the PCI; SPACE swing, SHIFT+SPACE power,
 *             CTRL+SPACE (or ALT+SPACE / right-click) contact. Left-click also swings.
 *  Pitching:  A/S/D/F/G/H pick a pitch, mouse aims, SPACE starts and stops the meter.
 *  Fielding:  WASD move (camera-relative), SHIFT sprint, SPACE dive / leap,
 *             hold 1/2/3/4 to charge a throw to that base, release inside the green zone.
 *  Running:   1/2/3 select the runner on that base (4 = batter-runner), Q advance, E retreat.
 */
import type { PitchCode } from '../core/types';
import { clamp } from '../core/math';
import type { FrameInput } from '../engine/GameEngine';
import { emptyInput } from '../engine/GameEngine';
import { ZONE_CENTER_Y } from '../engine/PitchEngine';
import { PITCH_KEYS } from '../data/pitchTypes';
import type { SwingType } from '../engine/BattingEngine';

export interface ControllerContext {
  userBatting: boolean;
  userPitching: boolean;
  repertoire: PitchCode[];
  cameraAxes: () => { fwd: { x: number; z: number }; right: { x: number; z: number } };
  planePoint: (clientX: number, clientY: number, fieldZ: number) => { x: number; y: number } | null;
  pciPlaneZ: number;
  aimPlaneZ: number;
  liveDefense: boolean;
  throwFill: number; // seconds for the throw meter to fill
}

export class PlayerController {
  keys = new Set<string>();
  private pressed = new Set<string>();
  private released = new Set<string>();
  private mouse = { x: 0, y: 0, moved: false, buttons: 0 };
  private clicks: number[] = [];
  pci = { x: 0, y: ZONE_CENTER_Y };
  aim = { x: 0, y: ZONE_CENTER_Y };
  throwHold: { base: number; t: number } | null = null;
  runnerSel: number | null = null;
  enabled = true;
  private gpPrev: boolean[] = [];

  constructor(target: HTMLElement) {
    window.addEventListener('keydown', (e) => {
      const k = keyName(e);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(k) && this.enabled) e.preventDefault();
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
    });
    window.addEventListener('keyup', (e) => {
      const k = keyName(e);
      this.keys.delete(k);
      this.released.add(k);
    });
    window.addEventListener('blur', () => { this.keys.clear(); this.throwHold = null; });
    target.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.moved = true; });
    target.addEventListener('mousedown', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.clicks.push(e.button); });
    target.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Was this key pressed this frame (edge)? */
  hit(k: string): boolean {
    return this.pressed.has(k);
  }

  endFrame() {
    this.pressed.clear();
    this.released.clear();
    this.clicks = [];
    this.mouse.moved = false;
  }

  build(dt: number, ctx: ControllerContext): FrameInput {
    const inp = emptyInput();
    const k = this.keys;
    const gp = this.readGamepad();

    // ---- PCI / aim
    if (this.mouse.moved) {
      const p = ctx.planePoint(this.mouse.x, this.mouse.y, ctx.userPitching ? ctx.aimPlaneZ : ctx.pciPlaneZ);
      if (p) {
        if (ctx.userPitching) this.aim = { x: clamp(p.x, -2.2, 2.2), y: clamp(p.y, 0.4, 4.8) };
        else this.pci = { x: clamp(p.x, -1.6, 1.6), y: clamp(p.y, 0.9, 4.3) };
      }
    }
    const kx = (k.has('ArrowRight') ? 1 : 0) - (k.has('ArrowLeft') ? 1 : 0) + gp.lx;
    const ky = (k.has('ArrowUp') ? 1 : 0) - (k.has('ArrowDown') ? 1 : 0) - gp.ly;
    if (kx || ky) {
      const tgt = ctx.userPitching ? this.aim : this.pci;
      tgt.x = clamp(tgt.x + kx * 3.2 * dt, -2.2, 2.2);
      tgt.y = clamp(tgt.y + ky * 3.2 * dt, 0.4, 4.8);
    }
    inp.pci = { ...this.pci };
    inp.aim = { ...this.aim };

    // ---- Swing
    const swingKey = this.hit('Space') || this.clicks.includes(0) || this.clicks.includes(2) || gp.a;
    if (swingKey) {
      let t: SwingType = 'normal';
      if (k.has('Shift') || this.clicks.includes(2) || gp.rt) t = 'power';
      if (k.has('Control') || k.has('Alt') || gp.lt) t = 'contact';
      inp.swing = t;
    }

    // ---- Pitching
    ctx.repertoire.forEach((code, i) => {
      if (this.hit('Key' + PITCH_KEYS[i])) inp.pitchSelect = code;
    });
    if (gp.pitchIdx >= 0 && gp.pitchIdx < ctx.repertoire.length) inp.pitchSelect = ctx.repertoire[gp.pitchIdx];
    inp.meterPress = this.hit('Space') || this.clicks.includes(0) || gp.a;

    // ---- Fielding
    if (ctx.liveDefense) {
      const ax = ctx.cameraAxes();
      const f = (k.has('KeyW') ? 1 : 0) - (k.has('KeyS') ? 1 : 0) - gp.ly;
      const r = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0) + gp.lx;
      let mx = ax.fwd.x * f + ax.right.x * r;
      let mz = ax.fwd.z * f + ax.right.z * r;
      const l = Math.hypot(mx, mz);
      if (l > 1) { mx /= l; mz /= l; }
      inp.defense.move = { x: mx, z: mz };
      inp.defense.sprint = k.has('Shift') || gp.rt;
      inp.defense.dive = this.hit('Space') || gp.a;
      // Throw meter: hold 1-4, release to throw.
      for (let b = 1; b <= 4; b++) {
        const key = 'Digit' + b;
        if (this.hit(key) && !this.throwHold) this.throwHold = { base: b, t: 0 };
      }
      if (gp.throwBase && !this.throwHold) this.throwHold = { base: gp.throwBase, t: 0 };
      if (this.throwHold) {
        this.throwHold.t += dt;
        const v = this.throwHold.t / ctx.throwFill;
        const held = k.has('Digit' + this.throwHold.base) || gp.throwHeld === this.throwHold.base;
        if (!held || v >= 1.2) {
          inp.defense.throwTo = this.throwHold.base;
          inp.defense.throwMeter = Math.min(1.2, v);
          this.throwHold = null;
        }
      }
    } else this.throwHold = null;

    // ---- Running
    if (ctx.userBatting) {
      for (let b = 1; b <= 4; b++) if (this.hit('Digit' + b)) this.runnerSel = b === 4 ? 0 : b;
      if (this.hit('Backquote') || this.hit('Digit0')) this.runnerSel = null;
      if (this.hit('KeyQ') || gp.rb) { inp.runnerCmd = { dir: 1, sel: this.runnerSel }; }
      if (this.hit('KeyE') || gp.lb) { inp.runnerCmd = { dir: -1, sel: this.runnerSel }; }
    }

    inp.skip = this.hit('Space') || this.hit('Enter') || gp.a;
    return inp;
  }

  private readGamepad() {
    const out = { lx: 0, ly: 0, a: false, rt: false, lt: false, rb: false, lb: false, pitchIdx: -1, throwBase: 0, throwHeld: 0 };
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && Array.from(pads).find((p) => p);
    if (!gp) return out;
    const dz = (v: number) => (Math.abs(v) < 0.18 ? 0 : v);
    out.lx = dz(gp.axes[0] ?? 0);
    out.ly = dz(gp.axes[1] ?? 0);
    const btn = (i: number) => !!gp.buttons[i]?.pressed;
    const edge = (i: number) => btn(i) && !this.gpPrev[i];
    out.a = edge(0);
    out.rt = btn(7);
    out.lt = btn(6);
    out.rb = edge(5);
    out.lb = edge(4);
    // Pitch select with face buttons X/Y/B and d-pad up/down.
    if (edge(2)) out.pitchIdx = 0; if (edge(3)) out.pitchIdx = 1; if (edge(1)) out.pitchIdx = 2; if (edge(12)) out.pitchIdx = 3; if (edge(13)) out.pitchIdx = 4;
    // Throws: Y=2B? Use the standard layout B=1B, Y=2B, X=3B, A=home is taken by dive; d-pad as bases.
    const map: [number, number][] = [[15, 1], [12, 2], [14, 3], [13, 4]];
    for (const [i, b] of map) { if (edge(i)) out.throwBase = b; if (btn(i)) out.throwHeld = b; }
    this.gpPrev = gp.buttons.map((b) => b.pressed);
    return out;
  }
}

function keyName(e: KeyboardEvent): string {
  if (e.key === 'Shift') return 'Shift';
  if (e.key === 'Control' || e.key === 'Meta') return 'Control';
  if (e.key === 'Alt') return 'Alt';
  if (e.key === 'Escape') return 'Escape';
  if (e.key === 'Enter') return 'Enter';
  return e.code;
}
