import { Rng } from '../core/rng';
import type { ArenaDef } from '../data';
import { APOTHEM, OCT_NORMALS, OCT_VERTS } from '../engine/Octagon';
import { project, type View } from './Camera';

interface Seat {
  x: number;
  z: number;
  y: number;
  col: string;
  phase: number;
}

const FENCE_H = 1.75;

/** Octagon canvas, fence, lighting and crowd. */
export class ArenaRenderer {
  private seats: Seat[] = [];
  private flashes: Array<{ x: number; z: number; y: number; t: number }> = [];

  constructor(private arena: ArenaDef) {
    const rng = new Rng(arena.id.length * 7919);
    const n = Math.round(2600 * arena.crowdDensity) + 60;
    const shirt = ['#2b2b31', '#3b3b44', '#1c1c22', '#50505a', '#6b1a1f', '#1f3a66', '#e6e6e6', '#34343c'];
    for (let i = 0; i < n; i++) {
      const tier = rng.next();
      const r = APOTHEM + 1.9 + tier * 6.5;
      const ang = rng.range(0, Math.PI * 2);
      const x = Math.cos(ang) * r * 1.3;
      const z = Math.sin(ang) * r * 0.85;
      if (z > 1.5) continue; // no seats between the camera and the cage
      const hue = arena.crowdHue;
      const col = rng.chance(0.12) ? `hsl(${hue},55%,${rng.range(30, 50)}%)` : rng.pick(shirt);
      this.seats.push({ x, z, y: 0.4 + tier * 3.2, col, phase: rng.range(0, 7) });
    }
    this.seats.sort((a, b) => a.z - b.z);
  }

  drawBackground(ctx: CanvasRenderingContext2D, v: View, time: number, excitement: number) {
    const { w, h } = v;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#040406');
    g.addColorStop(0.5, '#0b0b10');
    g.addColorStop(1, '#050507');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // light rig glow
    const c = project(v, 0, 0, 7);
    const rg = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, v.zoom * 9);
    rg.addColorStop(0, hexA(this.arena.lightColor, 0.16));
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
    // crowd
    const bounce = excitement * 0.12;
    for (const s of this.seats) {
      const pr = project(v, s.x, s.z, s.y + Math.max(0, Math.sin(time * (4 + excitement * 6) + s.phase)) * bounce);
      if (pr.x < -10 || pr.x > w + 10 || pr.y < -10 || pr.y > h + 10) continue;
      const sz = Math.max(1, pr.s * 0.026);
      ctx.fillStyle = s.col;
      ctx.fillRect(pr.x - sz, pr.y, sz * 2, sz * 2.2);
      ctx.fillStyle = '#0f0f12';
      ctx.fillRect(pr.x - sz * 0.6, pr.y - sz * 1.3, sz * 1.2, sz * 1.3);
    }
    // camera flashes on big moments
    if (excitement > 0.45 && Math.random() < excitement * 0.5 && this.seats.length) {
      const s = this.seats[Math.floor(Math.random() * this.seats.length)];
      this.flashes.push({ x: s.x, z: s.z, y: s.y + 0.4, t: 0.12 });
    }
    for (const f of this.flashes) {
      f.t -= 1 / 60;
      const pr = project(v, f.x, f.z, f.y);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, f.t * 7)})`;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    this.flashes = this.flashes.filter((f) => f.t > 0);
    // apron / floor around the octagon
    const apron = OCT_VERTS.map((q) => project(v, q.x * 1.28, q.z * 1.28, -0.05));
    ctx.fillStyle = '#121216';
    poly(ctx, apron);
    ctx.fill();
  }

  drawFloor(ctx: CanvasRenderingContext2D, v: View) {
    const verts = OCT_VERTS.map((q) => project(v, q.x, q.z, 0));
    const c = project(v, 0, 0, 0);
    const fg = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, v.zoom * 6);
    fg.addColorStop(0, lighten(this.arena.canvasColor, 0.06));
    fg.addColorStop(1, darken(this.arena.canvasColor, 0.18));
    ctx.fillStyle = fg;
    poly(ctx, verts);
    ctx.fill();
    // logo + text, laid flat on the mat
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, 0.46);
    ctx.fillStyle = this.arena.canvasLogoColor;
    ctx.font = `900 ${Math.round(v.zoom * 0.95)}px "Arial Black", Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OCTAGON', 0, 0);
    ctx.font = `700 ${Math.round(v.zoom * 0.28)}px Arial, sans-serif`;
    ctx.fillText(this.arena.bannerText, 0, v.zoom * 0.95);
    ctx.fillText('FIGHT NIGHT', 0, -v.zoom * 0.85);
    ctx.restore();
    // inner line
    const inner = OCT_VERTS.map((q) => project(v, q.x * 0.93, q.z * 0.93, 0));
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = Math.max(1, v.zoom * 0.03);
    poly(ctx, inner);
    ctx.stroke();
    // corner markers
    const red = project(v, -APOTHEM * 0.9, 0, 0);
    const blue = project(v, APOTHEM * 0.9, 0, 0);
    ctx.fillStyle = 'rgba(200,16,46,0.55)';
    ctx.beginPath();
    ctx.ellipse(red.x, red.y, v.zoom * 0.28, v.zoom * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(29,78,216,0.55)';
    ctx.beginPath();
    ctx.ellipse(blue.x, blue.y, v.zoom * 0.28, v.zoom * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /** back = panels on the far side (drawn before fighters); front = near side (after, translucent). */
  drawFence(ctx: CanvasRenderingContext2D, v: View, part: 'back' | 'front') {
    for (let i = 0; i < 8; i++) {
      const n = OCT_NORMALS[i];
      const isFront = n.z > 0.3;
      if ((part === 'front') !== isFront) continue;
      // the edge with normal i lies between vertices i-1 and i (vertex angles are offset by 22.5°)
      const a = OCT_VERTS[(i + 7) % 8];
      const b = OCT_VERTS[i];
      const a0 = project(v, a.x, a.z, 0);
      const b0 = project(v, b.x, b.z, 0);
      const a1 = project(v, a.x, a.z, FENCE_H);
      const b1 = project(v, b.x, b.z, FENCE_H);
      ctx.fillStyle = isFront ? 'rgba(20,20,24,0.10)' : 'rgba(20,20,24,0.35)';
      ctx.beginPath();
      ctx.moveTo(a0.x, a0.y);
      ctx.lineTo(b0.x, b0.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.lineTo(a1.x, a1.y);
      ctx.closePath();
      ctx.fill();
      // chain-link hint
      ctx.strokeStyle = isFront ? 'rgba(10,10,12,0.16)' : 'rgba(40,40,46,0.45)';
      ctx.lineWidth = 1;
      const steps = 14;
      ctx.beginPath();
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const bx = a0.x + (b0.x - a0.x) * t;
        const by = a0.y + (b0.y - a0.y) * t;
        const tx = a1.x + (b1.x - a1.x) * Math.min(1, t + 0.25);
        const ty = a1.y + (b1.y - a1.y) * Math.min(1, t + 0.25);
        ctx.moveTo(bx, by);
        ctx.lineTo(tx, ty);
      }
      ctx.stroke();
      // padding at the bottom and top rail
      ctx.strokeStyle = isFront ? 'rgba(10,10,12,0.5)' : '#0c0c0f';
      ctx.lineWidth = Math.max(2, v.zoom * 0.06);
      ctx.beginPath();
      ctx.moveTo(a1.x, a1.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.stroke();
      ctx.lineWidth = Math.max(3, v.zoom * 0.1);
      ctx.strokeStyle = isFront ? 'rgba(15,15,18,0.55)' : '#101014';
      ctx.beginPath();
      ctx.moveTo(a0.x, a0.y);
      ctx.lineTo(b0.x, b0.y);
      ctx.stroke();
      // posts
      for (const q of [a, b]) {
        const p0 = project(v, q.x, q.z, 0);
        const p1 = project(v, q.x, q.z, FENCE_H + 0.08);
        ctx.strokeStyle = isFront ? 'rgba(10,10,12,0.3)' : '#08080a';
        ctx.lineWidth = Math.max(2, v.zoom * (isFront ? 0.045 : 0.07));
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        // corner pad colours on the two "corners"
        ctx.fillStyle = q.x < -2 && Math.abs(q.z) < 2.5 ? '#c8102e' : q.x > 2 && Math.abs(q.z) < 2.5 ? '#1d4ed8' : '#18181c';
        ctx.fillRect(p1.x - v.zoom * 0.05, p1.y, v.zoom * 0.1, v.zoom * 0.35);
      }
    }
  }

  drawLights(ctx: CanvasRenderingContext2D, v: View) {
    const c = project(v, 0, 0, 0);
    const lg = ctx.createRadialGradient(c.x, c.y - v.zoom * 0.5, v.zoom * 0.5, c.x, c.y, v.zoom * 7.5);
    lg.addColorStop(0, 'rgba(255,255,255,0.05)');
    lg.addColorStop(0.6, 'rgba(0,0,0,0)');
    lg.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, v.w, v.h);
  }
}

function poly(ctx: CanvasRenderingContext2D, pts: Array<{ x: number; y: number }>) {
  ctx.beginPath();
  pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
  ctx.closePath();
}

function hexA(h: string, a: number) {
  const x = h.replace('#', '');
  return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}
function shade(h: string, f: number) {
  const x = h.replace('#', '');
  const c = [0, 2, 4].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(x.slice(i, i + 2), 16) * f))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
const lighten = (h: string, t: number) => shade(h, 1 + t);
const darken = (h: string, t: number) => shade(h, 1 - t);
