/**
 * Browser side of the rig: caches rasterized cells as canvases and draws them nearest-neighbor at integer scale.
 */
import { CELL, ORIGIN, ACTION, frameAt, type ActionId, type Build, type Dir } from './spec';
import { rasterize, type RigFrame, type RigOptions, type Side } from './raster';
import type { Look } from '../types';
import { logoDecal } from '../../game/render/assets';

const lookIds = new WeakMap<Look, number>();
let nextId = 1;
const lookId = (l: Look) => { let i = lookIds.get(l); if (!i) { i = nextId++; lookIds.set(l, i); } return i; };

interface Cached { cv: HTMLCanvasElement | OffscreenCanvas; frame: RigFrame }
const cache = new Map<string, Cached>();
const MAX = 4000;

function makeCanvas(): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(CELL, CELL);
  const c = document.createElement('canvas');
  c.width = CELL;
  c.height = CELL;
  return c;
}

export interface RigDrawOpts { handed?: Side; presnap?: boolean; number?: number; scale?: number; alpha?: number }

export function rigFrame(look: Look, build: Build, dir: Dir, action: ActionId, frame: number, o: RigDrawOpts = {}): Cached {
  const decal = look.teamId && look.helmet.logo !== undefined ? logoDecal(look.teamId, 2, 2) : null;
  const key = `${lookId(look)}|${build}|${dir}|${action}|${frame}|${o.handed ?? 'R'}|${o.presnap ? 1 : 0}|${o.number ?? look.number ?? ''}|${decal ? 1 : 0}`;
  let c = cache.get(key);
  if (!c) {
    const ro: RigOptions = { handed: o.handed, presnap: o.presnap, number: o.number ?? look.number, decal };
    const fr = rasterize(look, build, dir, action, frame, ro);
    const cv = makeCanvas();
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D;
    const img = ctx.createImageData(CELL, CELL);
    img.data.set(fr.px);
    ctx.putImageData(img, 0, 0);
    c = { cv, frame: fr };
    if (cache.size > MAX) cache.clear();
    cache.set(key, c);
  }
  return c;
}

/** Draw a rig frame with its origin (foot baseline) at (x, y). Returns the frame (anchors in cell space). */
export function drawRig(ctx: CanvasRenderingContext2D, x: number, y: number, look: Look, build: Build, dir: Dir, action: ActionId, frame: number, o: RigDrawOpts = {}): RigFrame {
  const s = Math.max(1, Math.round(o.scale ?? 1));
  const c = rigFrame(look, build, dir, action, frame, o);
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ctx.drawImage(c.cv as CanvasImageSource, Math.round(x - ORIGIN.x * s), Math.round(y - ORIGIN.y * s), CELL * s, CELL * s);
  if (o.alpha != null) ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = prev;
  return c.frame;
}

/** Cell-space anchor → screen space for a rig drawn at (x, y) with scale s. */
export const anchorToScreen = (p: { x: number; y: number }, x: number, y: number, s = 1) => ({ x: x + (p.x - ORIGIN.x) * s, y: y + (p.y - ORIGIN.y) * s });

/** Animate an action by elapsed seconds (previews). */
export function drawRigAt(ctx: CanvasRenderingContext2D, x: number, y: number, look: Look, build: Build, dir: Dir, action: ActionId, t: number, o: RigDrawOpts = {}) {
  const { frame } = frameAt(ACTION[action], t);
  return drawRig(ctx, x, y, look, build, dir, action, frame, o);
}
