/**
 * Input: keyboard + mouse and standard gamepads, mapped to abstract game actions. The play screen asks
 * for a `Frame` each tick; nothing downstream knows which device produced it, so remapping and new
 * devices only touch this file.
 *
 * Throwing: hold a receiver button (1–5 / gamepad face buttons) to charge; release to throw. A quick
 * tap throws a soft touch pass, holding longer builds to a bullet. Hold Q (or LB) while releasing for a lob.
 */
import type { MoveKind } from './engine/types';
import { BUTTON_ORDER, type Slot } from './engine/playbook';

export const CHARGE_TIME = 0.75; // seconds of holding for a full-power bullet

export interface Frame {
  move: { x: number; y: number };
  sprint: boolean;
  snap: boolean;
  /** Throw released this frame. */
  throwTo?: { slot: Slot; power: number; lob: boolean };
  /** Receiver currently being charged and its power 0..1 (for the meter). */
  charging: { slot: Slot; power: number } | null;
  moveKind?: MoveKind;
  throwAway: boolean;
  cameraCycle: boolean;
  pause: boolean;
  zoom: number; // wheel delta this frame (+ out)
  heightDelta: number;
  toggleRoutes: boolean;
  lobHeld: boolean;
}

const KEY_SLOT: Record<string, Slot> = { Digit1: BUTTON_ORDER[0], Digit2: BUTTON_ORDER[1], Digit3: BUTTON_ORDER[2], Digit4: BUTTON_ORDER[3], Digit5: BUTTON_ORDER[4] };
// Gamepad (standard mapping): A=0 B=1 X=2 Y=3 LB=4 RB=5 LT=6 RT=7 Back=8 Start=9 LS=10 RS=11 D-pad 12-15
const PAD_SLOT: Record<number, Slot> = { 0: BUTTON_ORDER[0], 1: BUTTON_ORDER[1], 2: BUTTON_ORDER[2], 3: BUTTON_ORDER[3], 5: BUTTON_ORDER[4] };

export class InputManager {
  private down = new Set<string>();
  private pressed = new Set<string>();
  private released = new Set<string>();
  private chargeStart = new Map<string, number>();
  private wheel = 0;
  private padPrev: boolean[] = [];
  /** Set by the play screen: before the snap the A button snaps instead of charging a throw. */
  presnap = true;
  private target: Window;
  gamepadConnected = false;

  constructor(target: Window = window) {
    this.target = target;
    target.addEventListener('keydown', this.onDown);
    target.addEventListener('keyup', this.onUp);
    target.addEventListener('wheel', this.onWheel, { passive: true });
    target.addEventListener('blur', this.onBlur);
  }

  dispose(): void {
    this.target.removeEventListener('keydown', this.onDown);
    this.target.removeEventListener('keyup', this.onUp);
    this.target.removeEventListener('wheel', this.onWheel);
    this.target.removeEventListener('blur', this.onBlur);
  }

  private onDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;
    const k = e.code;
    if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) e.preventDefault();
    if (!this.down.has(k)) {
      this.pressed.add(k);
      if (KEY_SLOT[k]) this.chargeStart.set(k, performance.now());
    }
    this.down.add(k);
  };
  private onUp = (e: KeyboardEvent) => {
    this.down.delete(e.code);
    this.released.add(e.code);
  };
  private onWheel = (e: WheelEvent) => {
    this.wheel += Math.sign(e.deltaY);
  };
  private onBlur = () => {
    this.down.clear();
    this.chargeStart.clear();
  };

  /** Press a key programmatically (on-screen buttons and automated tests use this). */
  tap(code: string, holdMs = 0): void {
    this.pressed.add(code);
    this.down.add(code);
    if (KEY_SLOT[code]) this.chargeStart.set(code, performance.now() - holdMs);
    this.released.add(code);
    this.down.delete(code);
  }

  poll(): Frame {
    const now = performance.now();
    const f: Frame = {
      move: { x: 0, y: 0 },
      sprint: false,
      snap: false,
      charging: null,
      throwAway: false,
      cameraCycle: false,
      pause: false,
      zoom: this.wheel,
      heightDelta: 0,
      toggleRoutes: false,
      lobHeld: false,
    };
    this.wheel = 0;
    const d = this.down;
    const p = this.pressed;
    // Movement: W = downfield (+x), D = right (+y from the offense's view).
    if (d.has('KeyW') || d.has('ArrowUp')) f.move.x += 1;
    if (d.has('KeyS') || d.has('ArrowDown')) f.move.x -= 1;
    if (d.has('KeyD') || d.has('ArrowRight')) f.move.y += 1;
    if (d.has('KeyA') || d.has('ArrowLeft')) f.move.y -= 1;
    f.sprint = d.has('ShiftLeft') || d.has('ShiftRight');
    f.lobHeld = d.has('KeyQ');
    if (p.has('Space')) f.snap = true;
    if (p.has('KeyT')) f.throwAway = true;
    if (p.has('Tab')) f.cameraCycle = true;
    if (p.has('Escape') || p.has('KeyP')) f.pause = true;
    if (p.has('KeyV')) f.toggleRoutes = true;
    if (d.has('BracketRight')) f.heightDelta += 1;
    if (d.has('BracketLeft')) f.heightDelta -= 1;
    if (d.has('Equal') || d.has('NumpadAdd')) f.zoom -= 0.15;
    if (d.has('Minus') || d.has('NumpadSubtract')) f.zoom += 0.15;
    // Ball-carrier moves
    if (p.has('KeyJ')) f.moveKind = 'juke_left';
    if (p.has('KeyL')) f.moveKind = 'juke_right';
    if (p.has('KeyK')) f.moveKind = 'spin';
    if (p.has('KeyI')) f.moveKind = 'stiff_arm';
    if (p.has('KeyH')) f.moveKind = 'hurdle';
    if (p.has('KeyF')) f.moveKind = 'dive';
    if (p.has('KeyG')) f.moveKind = 'slide';
    // Throwing: charge while held, release to throw.
    for (const [code, slot] of Object.entries(KEY_SLOT)) {
      const start = this.chargeStart.get(code);
      if (start === undefined) continue;
      const power = Math.min(1, (now - start) / 1000 / CHARGE_TIME);
      if (this.released.has(code)) {
        f.throwTo = { slot, power, lob: f.lobHeld };
        this.chargeStart.delete(code);
      } else if (d.has(code)) f.charging = { slot, power };
    }

    this.pollPad(f, now);
    this.pressed.clear();
    this.released.clear();
    return f;
  }

  private padCharge = new Map<number, number>();
  private stickWasOut = false;
  private pollPad(f: Frame, now: number) {
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = Array.from(pads ?? []).find((g) => g && g.connected);
    this.gamepadConnected = !!gp;
    if (!gp) return;
    const btn = (i: number) => !!gp.buttons[i]?.pressed;
    const pressed = (i: number) => btn(i) && !this.padPrev[i];
    const released = (i: number) => !btn(i) && this.padPrev[i];
    const dz = (v: number) => (Math.abs(v) < 0.18 ? 0 : v);
    const lx = dz(gp.axes[0] ?? 0);
    const ly = dz(gp.axes[1] ?? 0);
    if (lx || ly) {
      f.move.x = -ly;
      f.move.y = lx;
    }
    if (btn(12)) f.move.x = 1;
    if (btn(13)) f.move.x = -1;
    if (btn(14)) f.move.y = -1;
    if (btn(15)) f.move.y = 1;
    if (btn(7)) f.sprint = true;
    const lob = btn(4);
    f.lobHeld = f.lobHeld || lob;
    if (pressed(9)) f.pause = true;
    if (pressed(8)) f.cameraCycle = true;
    // Right stick flicks = juke left/right; stick click = hurdle/dive.
    const rx = gp.axes[2] ?? 0;
    const ry = gp.axes[3] ?? 0;
    const stickOut = Math.abs(rx) > 0.8 || Math.abs(ry) > 0.8;
    const flick = stickOut && !this.stickWasOut;
    this.stickWasOut = stickOut;
    if (flick) {
      if (Math.abs(rx) > Math.abs(ry)) f.moveKind = rx < 0 ? 'juke_left' : 'juke_right';
      else f.moveKind = ry < 0 ? 'stiff_arm' : 'spin';
    }
    if (pressed(11)) f.moveKind = 'hurdle';
    if (pressed(6)) f.moveKind = 'dive';
    if (pressed(10)) f.moveKind = 'slide';
    // Face buttons: A snaps before the play; once live they are the receiver buttons.
    if (this.presnap && pressed(0)) f.snap = true;
    for (const [iStr, slot] of Object.entries(PAD_SLOT)) {
      const i = Number(iStr);
      if (pressed(i) && !this.presnap) this.padCharge.set(i, now);
      const start = this.padCharge.get(i);
      if (start === undefined) continue;
      const power = Math.min(1, (now - start) / 1000 / CHARGE_TIME);
      if (released(i)) {
        f.throwTo = { slot, power, lob };
        this.padCharge.delete(i);
      } else if (btn(i)) f.charging = { slot, power };
    }
    this.padPrev = gp.buttons.map((b) => b.pressed);
  }
}
