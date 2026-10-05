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

/**
 * Frame cache on a few large sprite sheets (fixed memory). iPhone Safari caps total canvas memory and returns a null
 * 2D context once the cap is hit, which would blank every player; thousands of tiny canvases risk exactly that.
 * Sheets are recycled oldest-first when full.
 */
const SHEET = 1024;
const PER_ROW = Math.floor(SHEET / CELL);
const PER_SHEET = PER_ROW * PER_ROW;
const MAX_SHEETS = 4;
interface Sheet { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; used: number; gen: number }
interface Cached { sheet: Sheet; gen: number; sx: number; sy: number; frame: RigFrame }
const sheets: Sheet[] = [];
let nextSheet = 0;
const cache = new Map<string, Cached>();
let scratch: ImageData | null = null;

function newSheet(): Sheet | null {
  const cv = document.createElement('canvas');
  cv.width = SHEET;
  cv.height = SHEET;
  const ctx = cv.getContext('2d');
  return ctx ? { cv, ctx, used: 0, gen: 0 } : null;
}

function allocCell(): { sheet: Sheet; sx: number; sy: number } | null {
  let sh = sheets[nextSheet];
  if (!sh) {
    const made = newSheet();
    if (!made) return null;
    sheets[nextSheet] = sh = made;
  }
  if (sh.used >= PER_SHEET) {
    nextSheet = (nextSheet + 1) % MAX_SHEETS;
    sh = sheets[nextSheet];
    if (!sh) {
      const made = newSheet();
      if (!made) return null;
      sheets[nextSheet] = sh = made;
    } else {
      // recycle the oldest sheet: its cached frames become stale (generation bump)
      sh.ctx.clearRect(0, 0, SHEET, SHEET);
      sh.used = 0;
      sh.gen++;
    }
  }
  const i = sh.used++;
  return { sheet: sh, sx: (i % PER_ROW) * CELL, sy: Math.floor(i / PER_ROW) * CELL };
}

export interface RigDrawOpts { handed?: Side; presnap?: boolean; number?: number; scale?: number; alpha?: number }

export function rigFrame(look: Look, build: Build, dir: Dir, action: ActionId, frame: number, o: RigDrawOpts = {}): Cached | null {
  let decal: string[][] | null = null;
  try { decal = look.teamId && look.helmet.logo !== undefined ? logoDecal(look.teamId, 2, 2) : null; } catch { decal = null; }
  const key = `${lookId(look)}|${build}|${dir}|${action}|${frame}|${o.handed ?? 'R'}|${o.presnap ? 1 : 0}|${o.number ?? look.number ?? ''}|${decal ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit && hit.gen === hit.sheet.gen) return hit;
  const ro: RigOptions = { handed: o.handed, presnap: o.presnap, number: o.number ?? look.number, decal };
  const fr = rasterize(look, build, dir, action, frame, ro);
  const cell = allocCell();
  if (!cell) return null;
  if (!scratch) scratch = cell.sheet.ctx.createImageData(CELL, CELL);
  scratch.data.set(fr.px);
  cell.sheet.ctx.putImageData(scratch, cell.sx, cell.sy);
  const c: Cached = { sheet: cell.sheet, gen: cell.sheet.gen, sx: cell.sx, sy: cell.sy, frame: fr };
  if (cache.size > MAX_SHEETS * PER_SHEET * 1.5) cache.clear();
  cache.set(key, c);
  return c;
}

/** Draw a rig frame with its origin (foot baseline) at (x, y). Returns the frame (anchors in cell space). */
export function drawRig(ctx: CanvasRenderingContext2D, x: number, y: number, look: Look, build: Build, dir: Dir, action: ActionId, frame: number, o: RigDrawOpts = {}): RigFrame {
  const s = Math.max(1, Math.round(o.scale ?? 1));
  const c = rigFrame(look, build, dir, action, frame, o);
  if (!c) return rasterize(look, build, dir, action, frame, { handed: o.handed, presnap: o.presnap, number: o.number ?? look.number });
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ctx.drawImage(c.sheet.cv, c.sx, c.sy, CELL, CELL, Math.round(x - ORIGIN.x * s), Math.round(y - ORIGIN.y * s), CELL * s, CELL * s);
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
