/**
 * Keyboard input → abstract game actions. Structured so gamepad / touch sources can feed the
 * same `InputState` later (each source just sets axes and pushes actions).
 */
import type { ControlInput } from '../PlaySim';

export type UiAction =
  | 'snap' | 'continue' | 'pause' | 'timeout' | 'switch' | 'prevPlayer'
  | 'num1' | 'num2' | 'num3' | 'num4' | 'num5' | 'kick' | 'hurry';

export class InputState {
  keys = new Set<string>();
  private pressed = new Set<string>();
  private lastTap: Record<string, number> = {};
  private doubleTap: -1 | 0 | 1 = 0;
  ui: UiAction[] = [];
  private attached = false;
  private onDown = (e: KeyboardEvent) => this.keyDown(e);
  private onUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private onBlur = () => this.keys.clear();

  attach() {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener('keydown', this.onDown);
    window.addEventListener('keyup', this.onUp);
    window.addEventListener('blur', this.onBlur);
  }
  detach() {
    this.attached = false;
    window.removeEventListener('keydown', this.onDown);
    window.removeEventListener('keyup', this.onUp);
    window.removeEventListener('blur', this.onBlur);
  }

  private keyDown(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) return;
    const c = e.code;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(c)) e.preventDefault();
    if (!e.repeat) {
      this.pressed.add(c);
      // Double-tap lateral = juke
      if (c === 'KeyW' || c === 'ArrowUp' || c === 'KeyS' || c === 'ArrowDown') {
        const now = performance.now();
        const k = c === 'KeyW' || c === 'ArrowUp' ? 'up' : 'down';
        if (now - (this.lastTap[k] ?? 0) < 230) this.doubleTap = k === 'up' ? -1 : 1;
        this.lastTap[k] = now;
      }
      switch (c) {
        case 'Space': this.ui.push('snap'); this.ui.push('kick'); break;
        case 'Enter': case 'NumpadEnter': this.ui.push('continue'); break;
        case 'Escape': case 'KeyP': this.ui.push('pause'); break;
        case 'KeyT': this.ui.push('timeout'); break;
        case 'Tab': case 'KeyC': this.ui.push(e.shiftKey ? 'prevPlayer' : 'switch'); break;
        case 'KeyH': this.ui.push('hurry'); break;
        case 'Digit1': case 'Numpad1': this.ui.push('num1'); break;
        case 'Digit2': case 'Numpad2': this.ui.push('num2'); break;
        case 'Digit3': case 'Numpad3': this.ui.push('num3'); break;
        case 'Digit4': case 'Numpad4': this.ui.push('num4'); break;
        case 'Digit5': case 'Numpad5': this.ui.push('num5'); break;
      }
    }
    this.keys.add(c);
  }

  private down(...codes: string[]) {
    return codes.some((c) => this.keys.has(c));
  }
  private was(...codes: string[]) {
    return codes.some((c) => this.pressed.has(c));
  }

  /** Builds the per-step control input and clears edge-triggered presses. */
  control(): ControlInput {
    const mx = (this.down('KeyD', 'ArrowRight') ? 1 : 0) - (this.down('KeyA', 'ArrowLeft') ? 1 : 0);
    const my = (this.down('KeyS', 'ArrowDown') ? 1 : 0) - (this.down('KeyW', 'ArrowUp') ? 1 : 0);
    let juke: -1 | 0 | 1 = 0;
    if (this.was('KeyQ')) juke = -1;
    else if (this.was('KeyE')) juke = 1;
    else if (this.doubleTap) juke = this.doubleTap;
    let throwTo: number | null = null;
    for (let n = 1; n <= 5; n++) if (this.was(`Digit${n}`, `Numpad${n}`)) throwTo = n;
    const ci: ControlInput = {
      mx, my,
      sprint: this.down('ShiftLeft', 'ShiftRight'),
      juke,
      spin: this.was('KeyF'),
      stiff: this.was('KeyR'),
      dive: this.was('Space'),
      throwTo,
      throwAway: this.was('KeyT'),
      switchPlayer: this.was('Tab', 'KeyC'),
      action: this.was('Space'),
      actionHeld: this.down('Space'),
      give: this.was('Digit1', 'Numpad1'),
    };
    this.pressed.clear();
    this.doubleTap = 0;
    return ci;
  }

  takeUi(): UiAction[] {
    const u = this.ui;
    this.ui = [];
    return u;
  }

  clearEdges() {
    this.pressed.clear();
    this.ui = [];
    this.doubleTap = 0;
  }
}
