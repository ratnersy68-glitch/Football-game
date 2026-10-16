/**
 * TouchControls: on-screen controls for phones/tablets. Buttons drive the same virtual key
 * state as the keyboard (so the engine sees identical input), a joystick drives fielders,
 * and dragging anywhere on the field moves the PCI / pitch target relatively.
 */
import type { PlayerController } from './PlayerController';

export type TouchMode = 'none' | 'wait' | 'bat' | 'pitch' | 'field' | 'run' | 'replay';

export const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export class TouchControls {
  el: HTMLElement;
  private groups = new Map<string, HTMLElement>();
  private mode: TouchMode = 'none';
  private stickId: number | null = null;
  private stickOrigin = { x: 0, y: 0 };
  private knob: HTMLElement;
  private dragId: number | null = null;
  private dragLast = { x: 0, y: 0 };
  onPause: () => void = () => {};
  onReplayDrag: (dx: number, dy: number) => void = () => {};
  onReplayPinch: (f: number) => void = () => {};
  onAnyTouch: () => void = () => {};

  constructor(root: HTMLElement, canvas: HTMLElement, private ctrl: PlayerController) {
    this.el = document.createElement('div');
    this.el.className = 'touch';
    this.el.innerHTML = `
      <div class="tc-top"><button class="tbtn sm" data-k="Escape">❚❚</button><button class="tbtn sm" data-g="replaybtn" data-k="KeyR">R</button></div>
      <div class="tc-group" data-g="bat">
        <button class="tbtn big" data-k="Space">SWING</button>
        <button class="tbtn mid power" data-combo="Shift+Space">POWER</button>
        <button class="tbtn mid contact" data-combo="Control+Space">CONTACT</button>
        <div class="tc-hint">Drag anywhere to move the PCI</div>
      </div>
      <div class="tc-group" data-g="steal"><button class="tbtn mid" data-k="KeyQ">STEAL</button></div>
      <div class="tc-group" data-g="pitch">
        <button class="tbtn big" data-k="Space">PITCH</button>
        <div class="tc-hint">Tap a pitch · drag to aim · PITCH starts the meter, tap again on the gold line</div>
      </div>
      <div class="tc-group" data-g="field">
        <div class="tc-stick"><div class="tc-knob"></div></div>
        <div class="tc-throws">
          <button class="tbtn mid" data-k="Digit2">2B</button>
          <div><button class="tbtn mid" data-k="Digit3">3B</button><button class="tbtn mid" data-k="Digit1">1B</button></div>
          <button class="tbtn mid" data-k="Digit4">HOME</button>
        </div>
        <div class="tc-actions"><button class="tbtn mid" data-k="Shift">SPRINT</button><button class="tbtn mid" data-k="Space">DIVE</button></div>
      </div>
      <div class="tc-group" data-g="run">
        <div class="tc-sel"><button class="tbtn sm" data-k="Digit0">ALL</button><button class="tbtn sm" data-k="Digit1">1st</button><button class="tbtn sm" data-k="Digit2">2nd</button><button class="tbtn sm" data-k="Digit3">3rd</button><button class="tbtn sm" data-k="Digit4">BR</button></div>
        <div class="tc-actions"><button class="tbtn mid" data-k="KeyE">◀ BACK</button><button class="tbtn mid" data-k="KeyQ">GO ▶</button></div>
      </div>
      <div class="tc-group" data-g="wait"><button class="tbtn big" data-k="Space">▶</button></div>
      <div class="tc-group" data-g="replay">
        <div class="tc-actions"><button class="tbtn mid" data-k="Space">❚❚/▶</button><button class="tbtn mid" data-k="KeyZ">SLOW</button><button class="tbtn mid" data-k="ArrowLeft">◀◀</button><button class="tbtn mid" data-k="ArrowRight">▶▶</button><button class="tbtn mid" data-k="KeyR">EXIT</button></div>
        <div class="tc-hint">Drag to rotate · pinch to zoom</div>
      </div>
      <div class="tc-rotate">↻ Turn your phone sideways for the best view</div>`;
    root.appendChild(this.el);
    this.el.querySelectorAll<HTMLElement>('[data-g]').forEach((g) => this.groups.set(g.dataset.g!, g));
    this.knob = this.el.querySelector('.tc-knob')!;

    // Buttons → virtual keys (press on touchstart, release on touchend).
    this.el.querySelectorAll<HTMLElement>('button').forEach((b) => {
      const keys = b.dataset.combo ? b.dataset.combo.split('+') : [b.dataset.k!];
      const down = (e: Event) => {
        e.preventDefault();
        this.onAnyTouch();
        b.classList.add('on');
        if (keys[0] === 'Escape') { this.onPause(); return; }
        // Modifiers first so the swing type is read correctly on the same frame.
        for (const k of keys) this.ctrl.virtualDown(k);
      };
      const up = (e: Event) => {
        e.preventDefault();
        b.classList.remove('on');
        for (const k of keys) this.ctrl.virtualUp(k);
      };
      b.addEventListener('touchstart', down, { passive: false });
      b.addEventListener('touchend', up, { passive: false });
      b.addEventListener('touchcancel', up, { passive: false });
      b.addEventListener('mousedown', down);
      b.addEventListener('mouseup', up);
      b.addEventListener('mouseleave', (e) => { if (b.classList.contains('on')) up(e); });
    });

    // Joystick
    const stick = this.el.querySelector<HTMLElement>('.tc-stick')!;
    stick.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      this.stickId = t.identifier;
      const r = stick.getBoundingClientRect();
      this.stickOrigin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      this.moveStick(t.clientX, t.clientY);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === this.stickId) this.moveStick(t.clientX, t.clientY);
        if (t.identifier === this.dragId) {
          if (this.mode === 'replay') this.onReplayDrag(t.clientX - this.dragLast.x, t.clientY - this.dragLast.y);
          else this.ctrl.touchDrag(this.dragLast.x, this.dragLast.y, t.clientX, t.clientY);
          this.dragLast = { x: t.clientX, y: t.clientY };
        }
      }
      if (this.mode === 'replay' && e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (this.pinch) this.onReplayPinch(this.pinch / d);
        this.pinch = d;
      }
    }, { passive: true });
    const end = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === this.stickId) { this.stickId = null; this.ctrl.stick = { x: 0, y: 0 }; this.knob.style.transform = ''; }
        if (t.identifier === this.dragId) this.dragId = null;
      }
      if (e.touches.length < 2) this.pinch = 0;
    };
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);

    // Dragging on the field itself (no mouse emulation → no accidental swings).
    canvas.style.touchAction = 'none';
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.onAnyTouch();
      const t = e.changedTouches[0];
      if (this.dragId === null) { this.dragId = t.identifier; this.dragLast = { x: t.clientX, y: t.clientY }; }
    }, { passive: false });
  }

  private pinch = 0;

  private moveStick(x: number, y: number) {
    const R = 46;
    let dx = x - this.stickOrigin.x, dy = y - this.stickOrigin.y;
    const l = Math.hypot(dx, dy);
    if (l > R) { dx *= R / l; dy *= R / l; }
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    this.ctrl.stick = { x: dx / R, y: dy / R };
  }

  setMode(mode: TouchMode, extras: { steal?: boolean; replay?: boolean } = {}) {
    if (mode !== this.mode) {
      this.mode = mode;
      this.ctrl.stick = { x: 0, y: 0 };
      this.knob.style.transform = '';
    }
    const show = (g: string, v: boolean) => { const el = this.groups.get(g); if (el) el.style.display = v ? '' : 'none'; };
    show('bat', mode === 'bat');
    show('steal', mode === 'bat' && !!extras.steal);
    show('pitch', mode === 'pitch');
    show('field', mode === 'field');
    show('run', mode === 'run');
    show('wait', mode === 'wait');
    show('replay', mode === 'replay');
    show('replaybtn', !!extras.replay);
    this.el.style.display = mode === 'none' ? 'none' : '';
  }
}
