/** Keyboard (remappable) + gamepad input mapped to skier controls and UI actions. */
import type { SkierInput } from '../physics/skier';
import { emptyTouch } from './touch';

export type Action =
  | 'tuck' | 'brake' | 'left' | 'right' | 'jump' | 'carve'
  | 'spinLeft' | 'spinRight' | 'flipFront' | 'flipBack' | 'tiltLeft' | 'tiltRight'
  | 'grab1' | 'grab2' | 'grab3' | 'grab4' | 'reset' | 'camera' | 'map' | 'scoreboard' | 'pause' | 'interact' | 'replay';

export const DEFAULT_BINDINGS: Record<Action, string[]> = {
  tuck: ['KeyW'], brake: ['KeyS'], left: ['KeyA'], right: ['KeyD'], jump: ['Space'], carve: ['ShiftLeft', 'ShiftRight'],
  spinLeft: ['KeyQ'], spinRight: ['KeyE'], flipFront: ['ArrowUp'], flipBack: ['ArrowDown'], tiltLeft: ['ArrowLeft'], tiltRight: ['ArrowRight'],
  grab1: ['Digit1'], grab2: ['Digit2'], grab3: ['Digit3'], grab4: ['Digit4'],
  reset: ['KeyR'], camera: ['KeyC'], map: ['KeyM'], scoreboard: ['Tab'], pause: ['Escape', 'KeyP'], interact: ['KeyF'], replay: ['KeyV'],
};

export const ACTION_LABEL: Record<Action, string> = {
  tuck: 'Tuck / push', brake: 'Brake / snowplow', left: 'Turn left', right: 'Turn right', jump: 'Jump / pop (hold to load)', carve: 'Carve / edge',
  spinLeft: 'Spin left (air)', spinRight: 'Spin right (air)', flipFront: 'Frontflip', flipBack: 'Backflip', tiltLeft: 'Cork tilt left', tiltRight: 'Cork tilt right',
  grab1: 'Grab 1 (Safety / +Shift Nose)', grab2: 'Grab 2 (Mute / +Shift Method)', grab3: 'Grab 3 (Tail / +Shift Stalefish)', grab4: 'Grab 4 (Japan / +Shift Truck Driver)',
  reset: 'Reset to trail', camera: 'Change camera', map: 'Trail map', scoreboard: 'Objectives / scoreboard', pause: 'Pause', interact: 'Board lift / skip ride', replay: 'Instant replay',
};

export function keyLabel(code: string): string {
  return code.replace(/^Key/, '').replace(/^Digit/, '').replace('ShiftLeft', 'L-Shift').replace('ShiftRight', 'R-Shift').replace('Arrow', '↑').replace('↑Up', '↑').replace('↑Down', '↓').replace('↑Left', '←').replace('↑Right', '→');
}

export class Input {
  private down = new Set<string>();
  private pressed = new Set<Action>();
  bindings: Record<Action, string[]>;
  sensitivity = 1;
  private steer = 0;
  private padPrev: boolean[] = [];
  enabled = true;
  /** On-screen touch controls write here. */
  readonly touch = emptyTouch();
  private onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
    if (!this.down.has(e.code)) for (const a of this.actionsFor(e.code)) this.pressed.add(a);
    this.down.add(e.code);
    if (this.enabled && (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow'))) e.preventDefault();
  };
  private onKeyUp = (e: KeyboardEvent) => { this.down.delete(e.code); };
  private onBlur = () => { this.down.clear(); };

  constructor(bindings?: Partial<Record<Action, string[]>>) {
    this.bindings = { ...DEFAULT_BINDINGS, ...(bindings ?? {}) };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }

  private actionsFor(code: string): Action[] {
    return (Object.keys(this.bindings) as Action[]).filter((a) => this.bindings[a].includes(code));
  }

  held(a: Action): boolean {
    for (const k of this.bindings[a]) if (this.down.has(k)) return true;
    return false;
  }

  /** Trigger an edge action from an on-screen button. */
  tap(a: Action) { this.pressed.add(a); }

  /** Edge-triggered actions since the last call. */
  consume(): Set<Action> {
    this.pollPadButtons();
    const p = new Set(this.pressed);
    this.pressed.clear();
    return p;
  }

  private pad(): Gamepad | null {
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.connected) return p;
    return null;
  }

  private pollPadButtons() {
    const p = this.pad();
    if (!p) return;
    const map: [number, Action][] = [[9, 'pause'], [8, 'map'], [3, 'camera'], [12, 'interact'], [13, 'reset'], [14, 'scoreboard']];
    for (const [i, a] of map) {
      const now = !!p.buttons[i]?.pressed;
      if (now && !this.padPrev[i]) this.pressed.add(a);
      this.padPrev[i] = now;
    }
  }

  read(dt: number): SkierInput {
    const p = this.pad();
    const ax = (i: number) => (p && Math.abs(p.axes[i] ?? 0) > 0.18 ? p.axes[i] : 0);
    const btn = (i: number) => !!p?.buttons[i]?.pressed;
    const btnV = (i: number) => p?.buttons[i]?.value ?? 0;
    const kb = (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0);
    // keyboard steering ramps so taps make small corrections
    this.steer += (kb - this.steer) * Math.min(1, dt * (kb === 0 ? 14 : 7 * this.sensitivity));
    const t = this.touch;
    const steer = Math.max(-1, Math.min(1, ax(0) !== 0 ? ax(0) * this.sensitivity : t.steer !== 0 ? t.steer * this.sensitivity : this.steer));
    const shift = this.held('carve') || t.carve;
    let grab = 0;
    for (let i = 1; i <= 4; i++) if (this.held(`grab${i}` as Action)) grab = shift ? i + 4 : i;
    if (btn(2)) grab = 2;
    if (btn(3) && !grab) grab = 3;
    if (t.grab && !grab) grab = t.grab;
    return {
      steer,
      tuck: this.held('tuck') || t.tuck || btnV(7) > 0.4,
      brake: this.held('brake') || t.brake || btn(1),
      carve: shift || btnV(6) > 0.4,
      jump: this.held('jump') || t.jump || btn(0),
      spin: Math.max(-1, Math.min(1, (this.held('spinRight') ? 1 : 0) - (this.held('spinLeft') ? 1 : 0) + (ax(2) > 0.5 ? 1 : ax(2) < -0.5 ? -1 : 0) + t.spin)),
      flip: Math.max(-1, Math.min(1, (this.held('flipFront') ? 1 : 0) - (this.held('flipBack') ? 1 : 0) + (ax(3) < -0.5 ? 1 : ax(3) > 0.5 ? -1 : 0) + t.flip)),
      tilt: Math.max(-1, Math.min(1, (this.held('tiltRight') ? 1 : 0) - (this.held('tiltLeft') ? 1 : 0) + (btn(5) ? 1 : 0) - (btn(4) ? 1 : 0) + t.tilt)),
      grab,
    };
  }
}
