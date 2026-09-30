import type { ArenaDef, FighterData } from '../data';
import type { RenderSnap } from '../presentation/Snapshot';
import { ArenaRenderer } from './ArenaRenderer';
import { CameraController, project } from './Camera';
import { FighterRenderer, type FighterStyle } from './FighterRenderer';

export const CORNER_STYLES: [FighterStyle, FighterStyle] = [
  { trunks: '#c8102e', trunksDark: '#7d0a1d', glove: '#141414', skin: '#c99a78', skinShade: '#a47a5c', name: 'red' },
  { trunks: '#1d4ed8', trunksDark: '#122f86', glove: '#141414', skin: '#c99a78', skinShade: '#a47a5c', name: 'blue' },
];

/** Draws one broadcast frame: arena, crowd, fence, both fighters, depth-sorted. */
export class Renderer {
  readonly camera = new CameraController();
  readonly arena: ArenaRenderer;
  readonly fighters = new FighterRenderer();
  private ctx: CanvasRenderingContext2D;
  playerSide: 0 | 1 | -1 = 0;

  constructor(private canvas: HTMLCanvasElement, arena: ArenaDef, readonly data: [FighterData, FighterData]) {
    this.arena = new ArenaRenderer(arena);
    this.ctx = canvas.getContext('2d')!;
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
    }
    return { w, h, dpr };
  }

  render(snap: RenderSnap, dt: number, time: number, excitement: number, updateCamera = true) {
    const { w, h, dpr } = this.resize();
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (updateCamera) this.camera.update(snap, dt, w, h);
    const v = this.camera.view;
    this.arena.drawBackground(ctx, v, time, excitement);
    this.arena.drawFloor(ctx, v);
    this.arena.drawFence(ctx, v, 'back');

    const poses = [0, 1].map((s) => this.fighters.pose(snap, s as 0 | 1, time, dt));
    let order: Array<0 | 1>;
    if (snap.mode === 'ground' || snap.mode === 'sub') {
      const top = snap.ground?.top ?? snap.sub?.resumeTop ?? 0;
      const bottom = top === 0 ? 1 : 0;
      order = FighterRenderer.topFirst(snap) ? [top, bottom] : [bottom, top];
    } else {
      order = snap.f[0].z <= snap.f[1].z ? [0, 1] : [1, 0];
      if (Math.abs(snap.f[0].z - snap.f[1].z) < 0.05 && snap.f[0].down) order = [0, 1];
    }
    for (const s of order) {
      const { skel, frame } = poses[s];
      this.fighters.draw(ctx, v, snap.f[s], skel, frame, CORNER_STYLES[s], s === this.playerSide && snap.mode === 'stand');
    }
    this.arena.drawFence(ctx, v, 'front');
    this.arena.drawLights(ctx, v);
  }

  /** Screen position above a fighter's head (for floating labels). */
  labelPos(snap: RenderSnap, side: 0 | 1) {
    const f = snap.f[side];
    return project(this.camera.view, f.x, f.z, (f.heightIn * 0.0254) + 0.35);
  }
}
