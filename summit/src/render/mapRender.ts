/** 2D resort trail map: shaded relief + trails by difficulty + lifts + parks + racecourses. */
import type { Resort } from '../world/resortBuilder';
import { DIFFICULTY_INFO } from '../world/types';
import { drawDifficulty } from './props';

export interface MapView { x0: number; z0: number; scale: number; w: number; h: number }

export function mapView(resort: Resort, w: number, h: number, pad = 0.04): MapView {
  const T = resort.terrain;
  const minX = -T.halfW - 60, maxX = T.halfW + 60, minZ = -60, maxZ = T.length + 20;
  const scale = Math.min(w / (maxX - minX), h / (maxZ - minZ)) * (1 - pad * 2);
  const cw = (maxX - minX) * scale, ch = (maxZ - minZ) * scale;
  return { x0: minX - (w - cw) / 2 / scale, z0: minZ - (h - ch) / 2 / scale, scale, w, h };
}

export const toMap = (v: MapView, x: number, z: number) => ({ x: (x - v.x0) * v.scale, y: (z - v.z0) * v.scale });
export const fromMap = (v: MapView, px: number, py: number) => ({ x: px / v.scale + v.x0, z: py / v.scale + v.z0 });

/** Shaded relief background (cached per size). */
export function drawRelief(ctx: CanvasRenderingContext2D, resort: Resort, v: MapView) {
  const T = resort.terrain;
  const step = Math.max(2, Math.floor(Math.min(v.w, v.h) / 260));
  const img = ctx.createImageData(v.w, v.h);
  const d = img.data;
  const maxH = resort.def.vertical * 1.25;
  for (let py = 0; py < v.h; py += step) {
    for (let px = 0; px < v.w; px += step) {
      const p = fromMap(v, px + step / 2, py + step / 2);
      if (!T.inGrid(p.x, p.z)) continue;
      const h = T.gridHeight(p.x, p.z);
      const hx = T.gridHeight(p.x + 8, p.z) - h, hz = T.gridHeight(p.x, p.z + 8) - h;
      const shade = Math.max(0, Math.min(1, 0.75 + (-hx * 0.7 + hz * 0.45) * 0.05));
      const alt = Math.max(0, Math.min(1, h / maxH));
      const slope = Math.hypot(hx, hz) / 8;
      let r = 236 - alt * 20, g = 242 - alt * 14, b = 250;
      if (slope > 0.9) { const k = Math.min(1, (slope - 0.9) * 2); r = r * (1 - k) + 128 * k; g = g * (1 - k) + 124 * k; b = b * (1 - k) + 122 * k; }
      r *= shade; g *= shade; b *= shade;
      for (let yy = 0; yy < step && py + yy < v.h; yy++) for (let xx = 0; xx < step && px + xx < v.w; xx++) {
        const k = ((py + yy) * v.w + px + xx) * 4;
        d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  // forest stipple
  ctx.fillStyle = 'rgba(46,90,58,0.55)';
  const tr = resort.trees;
  const every = Math.max(1, Math.floor(resort.treeCount / 9000));
  for (let i = 0; i < resort.treeCount; i += every) {
    const p = toMap(v, tr[i * 5], tr[i * 5 + 2]);
    ctx.fillRect(p.x, p.y, Math.max(1, v.scale * 6), Math.max(1, v.scale * 6));
  }
  for (const l of T.lakes) {
    const p = toMap(v, l.x, l.z);
    ctx.fillStyle = '#9cc4e4';
    ctx.beginPath(); ctx.arc(p.x, p.y, l.r * v.scale, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawTrails(ctx: CanvasRenderingContext2D, resort: Resort, v: MapView, opts: { highlight?: number; labels?: boolean; thick?: number } = {}) {
  const th = opts.thick ?? 1;
  for (const t of resort.trails) {
    const info = DIFFICULTY_INFO[t.difficulty];
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const isHi = opts.highlight === t.id;
    let color = info.color;
    let width = Math.max(1.5, t.width * v.scale * 0.45) * th;
    if (t.kind === 'park' || t.kind === 'pipe') { color = '#ff7a1a'; width = Math.max(3, t.width * v.scale * 0.5) * th; }
    if (t.kind === 'race') { color = '#d8282a'; }
    ctx.beginPath();
    t.pts.forEach((p, i) => { const q = toMap(v, p.x, p.z); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
    if (isHi) { ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = width + 6; ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = width + 2; ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = width;
    if (t.kind === 'race') ctx.setLineDash([6 * th, 4 * th]);
    if (t.difficulty === 'double' || t.difficulty === 'triple') ctx.setLineDash(t.difficulty === 'triple' ? [2 * th, 3 * th] : [8 * th, 3 * th]);
    if (t.kind !== 'trail' && t.kind !== 'race') ctx.setLineDash([]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // lifts
  for (const l of resort.lifts) {
    const a = toMap(v, l.bottom.x, l.bottom.z), b = toMap(v, l.top.x, l.top.z);
    ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 2 * th;
    ctx.setLineDash(l.type === 'surface' ? [3, 3] : []);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#1b1b1b';
    for (const p of [a, b]) { ctx.beginPath(); ctx.arc(p.x, p.y, 3 * th, 0, Math.PI * 2); ctx.fill(); }
  }
  if (opts.labels) {
    ctx.font = `${Math.round(11 * th)}px sans-serif`;
    ctx.textBaseline = 'middle';
    for (const t of resort.trails) {
      const mid = t.pts[Math.floor(t.pts.length * 0.35)];
      const q = toMap(v, mid.x, mid.z);
      const label = t.kind === 'trail' ? t.name : t.name;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      const w = ctx.measureText(label).width;
      ctx.fillRect(q.x + 8, q.y - 7 * th, w + 4, 14 * th);
      ctx.fillStyle = '#111';
      ctx.fillText(label, q.x + 10, q.y);
      if (t.kind === 'trail') drawDifficulty(ctx, t.difficulty, q.x, q.y, 5 * th);
    }
    for (const l of resort.lifts) {
      const m = toMap(v, (l.bottom.x + l.top.x) / 2, (l.bottom.z + l.top.z) / 2);
      ctx.fillStyle = '#1b1b1b';
      ctx.font = `bold ${Math.round(10 * th)}px sans-serif`;
      ctx.fillText(`🚡 ${l.name}`, m.x + 6, m.y);
    }
  }
}

/** A complete static map image (for map boards, menus and the minimap background). */
export function renderMapCanvas(resort: Resort, w: number, h: number, labels = false): { canvas: HTMLCanvasElement; view: MapView } {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#dfe9f3';
  ctx.fillRect(0, 0, w, h);
  const v = mapView(resort, w, h);
  drawRelief(ctx, resort, v);
  drawTrails(ctx, resort, v, { labels, thick: Math.max(0.7, Math.min(2, w / 900)) });
  return { canvas: c, view: v };
}
