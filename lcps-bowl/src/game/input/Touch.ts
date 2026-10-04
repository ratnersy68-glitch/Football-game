/**
 * Retro Bowl-style touch / mouse controls (pointer events on the game canvas).
 *
 *  • Before the snap ......... TAP anywhere to snap (also continues after a play, fair catch on punts).
 *  • QB with the ball ........ DRAG BACK from anywhere to aim (slingshot: the ball goes the opposite way, farther the
 *                              longer you pull), RELEASE to throw. A forward swipe instead makes the QB scramble.
 *  • Ball carrier ............ runs forward on his own. Hold and drag up/down to steer, quick SWIPE UP/DOWN to juke,
 *                              quick SWIPE FORWARD to dive.
 *  • Field goal / extra point  DRAG BACK to set power, up/down to aim, RELEASE to kick.
 *
 * It only produces ControlInput / UI actions; the play simulation stays authoritative.
 */
import type { ControlInput } from '../PlaySim';
import type { GameSession } from '../GameSession';
import type { Renderer } from '../render/Renderer';
import type { UiAction } from './Input';
import { VIEW_W, VIEW_H } from '../render/Renderer';

type Mode = 'none' | 'aim' | 'scramble' | 'steer' | 'kick' | 'tap';
interface Ptr { id: number; x0: number; y0: number; x: number; y: number; t0: number }

export const THROW_GAIN = { x: 2.6, y: 1.1 }; // yards per canvas px of pull (x uses 12 px/yd, y 5 px/yd)

export class TouchControls {
  private el: HTMLElement | null = null;
  private ptr: Ptr | null = null;
  mode: Mode = 'none';
  /** Aim preview (sim coordinates) while dragging a pass. */
  aimTarget: { x: number; y: number } | null = null;
  /** Kick preview while dragging a field goal. */
  kickAim: { aim: number; power: number } | null = null;
  private steer = 0;
  private scrambleSim: unknown = null;
  private throwAt: { x: number; y: number } | null = null;
  private juke: -1 | 0 | 1 = 0;
  private dive = false;
  private ui: UiAction[] = [];
  private lastUp = 0;

  constructor(private get: () => { session: GameSession; renderer: Renderer }) {}

  private down = (e: PointerEvent) => {
    if (this.ptr) return;
    e.preventDefault();
    const p = this.toCanvas(e);
    this.ptr = { id: e.pointerId, x0: p.x, y0: p.y, x: p.x, y: p.y, t0: performance.now() };
    this.mode = 'none';
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  private move = (e: PointerEvent) => {
    const P = this.ptr;
    if (!P || e.pointerId !== P.id) return;
    e.preventDefault();
    const p = this.toCanvas(e);
    P.x = p.x;
    P.y = p.y;
    const dx = P.x - P.x0, dy = P.y - P.y0;
    const dist = Math.hypot(dx, dy);
    const ctx = this.context();
    if (this.mode === 'none' && dist > 9) {
      if (ctx === 'qb') this.mode = dx > 16 && dx > Math.abs(dy) * 1.2 ? 'scramble' : 'aim';
      else if (ctx === 'carrier') this.mode = 'steer';
      else if (ctx === 'kick') this.mode = 'kick';
    }
    if (this.mode === 'aim') {
      const { session } = this.get();
      const sim = session.sim!;
      const qb = sim.actors[sim.qbIdx];
      this.aimTarget = { x: Math.min(112, Math.max(qb.x + 1, qb.x - (dx / 12) * THROW_GAIN.x)), y: Math.max(-1, Math.min(54.3, qb.y - (dy / 5) * THROW_GAIN.y)) };
    } else if (this.mode === 'steer') {
      this.steer = Math.max(-1, Math.min(1, dy / 34));
    } else if (this.mode === 'kick') {
      this.kickAim = { aim: Math.max(-2, Math.min(2, -dy / 45)), power: Math.max(0, Math.min(1, -dx / 190)) };
    }
  };
  private up = (e: PointerEvent) => {
    const P = this.ptr;
    if (!P || e.pointerId !== P.id) return;
    e.preventDefault();
    const dx = P.x - P.x0, dy = P.y - P.y0;
    const dist = Math.hypot(dx, dy);
    const dt = performance.now() - P.t0;
    const quick = dt < 320 && dist > 22;
    const ctx = this.context();
    const { session } = this.get();
    if (this.mode === 'aim' && this.aimTarget && dist > 14) this.throwAt = this.aimTarget;
    else if (this.mode === 'scramble') this.scrambleSim = session.sim;
    else if (this.mode === 'kick' && this.kickAim && this.kickAim.power > 0.06) session.kickSwipe(this.kickAim.aim, this.kickAim.power);
    else if ((this.mode === 'steer' || ctx === 'carrier') && quick) {
      if (Math.abs(dy) > Math.abs(dx) * 1.1) this.juke = dy < 0 ? -1 : 1;
      else if (dx * this.forward() > 0) this.dive = true;
    } else if (dist < 12 && dt < 450) this.ui.push('snap');
    this.lastUp = performance.now();
    this.ptr = null;
    this.mode = 'none';
    this.aimTarget = null;
    this.kickAim = null;
    this.steer = 0;
  };

  /** Fallback for browsers that deliver a tap only as a click (no pointer sequence). */
  private click = () => {
    if (performance.now() - this.lastUp > 400 && !this.ptr) this.ui.push('snap');
  };

  attach(el: HTMLElement) {
    this.el = el;
    el.addEventListener('click', this.click);
    el.addEventListener('pointerdown', this.down);
    el.addEventListener('pointermove', this.move);
    el.addEventListener('pointerup', this.up);
    el.addEventListener('pointercancel', this.up);
  }
  detach() {
    const el = this.el;
    if (!el) return;
    el.removeEventListener('click', this.click);
    el.removeEventListener('pointerdown', this.down);
    el.removeEventListener('pointermove', this.move);
    el.removeEventListener('pointerup', this.up);
    el.removeEventListener('pointercancel', this.up);
    this.el = null;
  }

  private toCanvas(e: PointerEvent) {
    const r = (this.el as HTMLElement).getBoundingClientRect();
    return { x: ((e.clientX - r.left) * VIEW_W) / r.width, y: ((e.clientY - r.top) * VIEW_H) / r.height };
  }

  /** What a gesture means right now. */
  context(): 'qb' | 'carrier' | 'kick' | 'tap' {
    const { session } = this.get();
    if (session.phase === 'kick_meter') return 'kick';
    const sim = session.sim;
    if (!sim || session.phase !== 'live' || !sim.setup.userTeam) return 'tap';
    const b = sim.ball;
    const qbHolding = sim.setup.kind === 'scrimmage' && sim.setup.userTeam === 'O' && b.state === 'held' && b.holder === sim.qbIdx && !sim.passThrown && !sim.pastLos && !sim.handedOff && this.scrambleSim !== sim;
    if (qbHolding) return 'qb';
    const u = sim.user;
    if (u && sim.carrier === u) return 'carrier';
    return 'tap';
  }

  private forward(): 1 | -1 {
    const u = this.get().session.sim?.user;
    return u && u.team === 'D' ? -1 : 1;
  }

  /** Merge touch intent into this step's control input (keyboard input wins when it is active). */
  control(base: ControlInput): ControlInput {
    const ci = { ...base };
    const { session } = this.get();
    const sim = session.sim;
    if (this.throwAt) { ci.throwAt = this.throwAt; this.throwAt = null; }
    if (this.juke) { ci.juke = this.juke; this.juke = 0; }
    if (this.dive) { ci.dive = true; this.dive = false; }
    if (sim && session.phase === 'live' && sim.user && base.mx === 0 && base.my === 0) {
      const ctx = this.context();
      const scrambling = this.scrambleSim === sim && sim.carrier === sim.user;
      if (ctx === 'carrier' || scrambling) {
        // Retro-style auto-run toward the goal line; steer with a held vertical drag
        ci.mx = this.forward();
        ci.my = this.steer;
      }
    }
    return ci;
  }

  takeUi(): UiAction[] {
    const u = this.ui;
    this.ui = [];
    return u;
  }
}
