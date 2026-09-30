import { DEFAULT_KEYS, DEFAULT_PAD, type KeyBindings, type Logical, type PadBindings } from './Bindings';

const STORAGE_KEY = 'octagon.bindings.v1';

/**
 * Keyboard + gamepad input with rebindable logical actions. Call `poll()` once per frame; then
 * `held(x)` / `pressed(x)` (edge-triggered since the previous poll).
 */
export class InputManager {
  keys: KeyBindings;
  pad: PadBindings;
  private down = new Set<string>();
  private pressedCodes = new Set<string>();
  private padHeld = new Set<number>();
  private padPrevHeld = new Set<number>();
  private curHeld = new Set<Logical>();
  private curPressed = new Set<Logical>();
  stick = { x: 0, y: 0 };
  rstick = { x: 0, y: 0 };
  private rstickPrev = { x: 0, y: 0 };
  padConnected = false;
  private capture: ((code: string) => void) | null = null;
  private padCapture: ((btn: number) => void) | null = null;
  /** Direction pressed this frame (for the submission scramble). */
  dirPressed: 'up' | 'down' | 'left' | 'right' | null = null;
  rightStickFlick: 'left' | 'right' | 'up' | 'down' | null = null;
  private anyKey = false;

  constructor() {
    this.keys = structuredClone(DEFAULT_KEYS);
    this.pad = structuredClone(DEFAULT_PAD);
    this.load();
    window.addEventListener('keydown', (ev) => {
      if (this.capture) {
        ev.preventDefault();
        const cb = this.capture;
        this.capture = null;
        cb(ev.code);
        return;
      }
      const tag = (ev.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (this.isBound(ev.code)) ev.preventDefault();
      if (!this.down.has(ev.code)) this.pressedCodes.add(ev.code);
      this.down.add(ev.code);
    });
    window.addEventListener('keyup', (ev) => this.down.delete(ev.code));
    window.addEventListener('blur', () => this.down.clear());
  }

  private isBound(code: string) {
    for (const k of Object.values(this.keys)) if (k.includes(code)) return true;
    return false;
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const j = JSON.parse(raw);
      if (j.keys) this.keys = { ...structuredClone(DEFAULT_KEYS), ...j.keys };
      if (j.pad) this.pad = { ...structuredClone(DEFAULT_PAD), ...j.pad };
    } catch {
      /* storage unavailable: defaults */
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ keys: this.keys, pad: this.pad }));
    } catch {
      /* ignore */
    }
  }

  resetDefaults() {
    this.keys = structuredClone(DEFAULT_KEYS);
    this.pad = structuredClone(DEFAULT_PAD);
    this.save();
  }

  captureKey(cb: (code: string) => void) {
    this.capture = cb;
  }
  capturePad(cb: (btn: number) => void) {
    this.padCapture = cb;
  }
  cancelCapture() {
    this.capture = null;
    this.padCapture = null;
  }

  poll() {
    this.curPressed.clear();
    this.curHeld.clear();
    this.dirPressed = null;
    this.rightStickFlick = null;
    // gamepad
    this.padPrevHeld = this.padHeld;
    this.padHeld = new Set();
    this.stick = { x: 0, y: 0 };
    this.rstick = { x: 0, y: 0 };
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = Array.from(pads ?? []).find((p) => p && p.connected);
    this.padConnected = !!gp;
    if (gp) {
      gp.buttons.forEach((b, i) => {
        if (b.pressed || b.value > 0.5) this.padHeld.add(i);
      });
      const dz = (v: number) => (Math.abs(v) < 0.2 ? 0 : v);
      this.stick = { x: dz(gp.axes[0] ?? 0), y: dz(gp.axes[1] ?? 0) };
      this.rstick = { x: dz(gp.axes[2] ?? 0), y: dz(gp.axes[3] ?? 0) };
      if (this.padCapture) {
        for (const i of this.padHeld) {
          if (!this.padPrevHeld.has(i)) {
            const cb = this.padCapture;
            this.padCapture = null;
            cb(i);
            break;
          }
        }
      }
      const t = 0.65;
      const p = this.rstickPrev;
      if (this.rstick.x < -t && p.x >= -t) this.rightStickFlick = 'left';
      else if (this.rstick.x > t && p.x <= t) this.rightStickFlick = 'right';
      else if (this.rstick.y > t && p.y <= t) this.rightStickFlick = 'down';
      else if (this.rstick.y < -t && p.y >= -t) this.rightStickFlick = 'up';
      this.rstickPrev = { ...this.rstick };
      // D-pad also drives the scramble
      if (this.padHeld.has(12) && !this.padPrevHeld.has(12)) this.dirPressed = 'up';
      if (this.padHeld.has(13) && !this.padPrevHeld.has(13)) this.dirPressed = 'down';
      if (this.padHeld.has(14) && !this.padPrevHeld.has(14)) this.dirPressed = 'left';
      if (this.padHeld.has(15) && !this.padPrevHeld.has(15)) this.dirPressed = 'right';
    }
    for (const [logical, codes] of Object.entries(this.keys) as [Logical, string[]][]) {
      for (const c of codes) {
        if (this.down.has(c)) this.curHeld.add(logical);
        if (this.pressedCodes.has(c)) this.curPressed.add(logical);
      }
    }
    for (const [logical, btns] of Object.entries(this.pad) as [Logical, number[]][]) {
      for (const b of btns ?? []) {
        if (this.padHeld.has(b)) this.curHeld.add(logical);
        if (this.padHeld.has(b) && !this.padPrevHeld.has(b)) this.curPressed.add(logical);
      }
    }
    for (const d of ['up', 'down', 'left', 'right'] as const) if (this.curPressed.has(d)) this.dirPressed = d;
    this.anyKey = this.pressedCodes.size > 0 || [...this.padHeld].some((b) => !this.padPrevHeld.has(b));
    this.pressedCodes.clear();
  }

  held(l: Logical) {
    return this.curHeld.has(l);
  }
  pressed(l: Logical) {
    return this.curPressed.has(l);
  }
  /** Any "confirm" style input (for skipping presentation screens). */
  anyPressed() {
    return this.anyKey || this.curPressed.size > 0;
  }

  /** Movement vector in screen space (x right, y down), length <= 1. */
  moveVector() {
    let x = this.stick.x;
    let y = this.stick.y;
    if (this.held('left')) x -= 1;
    if (this.held('right')) x += 1;
    if (this.held('up')) y -= 1;
    if (this.held('down')) y += 1;
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    return { x, y };
  }
}
