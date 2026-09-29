/**
 * Canvas field renderer: stylized stadium, broadcast (perspective sideline) and all-22 (overhead) cameras,
 * simple players (shadow + body + helmet + number), ball with height, and TV-style LOS / first-down lines.
 * Reads PlayAnimation state only — it never decides anything about the play.
 */
import { Rng } from '../core/rng';
import type { TeamInfo } from '../models/types';
import { sample, type PlayAnimation } from './animation';

export type CameraMode = 'broadcast' | 'overhead';
const W = 53.33;

interface Proj {
  sx: number;
  sy: number;
  k: number; // pixels per yard at this depth
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function shade(hex: string, f: number): string {
  const [r, g, b] = hexToRgb(hex);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}

export interface Uniform {
  jersey: string;
  number: string;
  helmet: string;
  pants: string;
}

export function uniformsFor(home: TeamInfo, away: TeamInfo): { home: Uniform; away: Uniform } {
  const homeU: Uniform = {
    jersey: home.primaryColor,
    number: luminance(home.primaryColor) > 0.6 ? '#111' : '#fff',
    helmet: home.secondaryColor,
    pants: luminance(home.secondaryColor) > 0.85 ? '#e8e8e8' : home.secondaryColor,
  };
  // Road team wears white with team-color numbers & helmets.
  const awayU: Uniform = {
    jersey: '#f4f4f4',
    number: luminance(away.primaryColor) > 0.75 ? '#222' : away.primaryColor,
    helmet: away.primaryColor,
    pants: '#dcdcdc',
  };
  return { home: homeU, away: awayU };
}

export class FieldRenderer {
  private ctx: CanvasRenderingContext2D;
  private crowd: { x: number; y: number; z: number; c: string }[] = [];
  camX = 50;
  mode: CameraMode = 'broadcast';
  private zoom = 1;
  private uniforms: { home: Uniform; away: Uniform };

  constructor(
    private canvas: HTMLCanvasElement,
    private home: TeamInfo,
    away: TeamInfo,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.ctx = ctx;
    this.uniforms = uniformsFor(home, away);
    const rng = new Rng(home.id.length * 7919 + away.id.length);
    const colors = [home.primaryColor, home.primaryColor, home.secondaryColor, '#d9d9d9', '#555', away.primaryColor];
    // Stands behind the far sideline: rows rising away from the field.
    for (let row = 0; row < 26; row++) {
      for (let x = -28; x <= 128; x += 0.9) {
        if (rng.chance(0.18)) continue;
        this.crowd.push({ x: x + rng.float(-0.3, 0.3), y: -6 - row * 1.4, z: 1.5 + row * 1.25, c: rng.pick(colors) });
      }
    }
  }

  private dims() {
    const c = this.canvas;
    return { w: c.width, h: c.height };
  }

  project(x: number, y: number, z = 0): Proj {
    const { w, h } = this.dims();
    if (this.mode === 'overhead') {
      const s = Math.min(h / 52, w / 78) * this.zoom;
      const cx = this.camX;
      return { sx: w / 2 + (x - cx) * s, sy: h / 2 + (y - W / 2) * s - z * s * 0.5, k: s };
    }
    const back = 46;
    const camH = 30;
    const d = W + back - y;
    const fh = 72 * h; // f * camH
    const f = fh / camH;
    const horizon = 0.97 * h - fh / back;
    const fx = f * this.zoom;
    return { sx: w / 2 + (fx * (x - this.camX)) / d, sy: horizon + (f * (camH - z)) / d, k: (f / d) * (0.6 + 0.4 * this.zoom) };
  }

  setCamera(targetX: number, wide: boolean, dt: number): void {
    const targetZoom = this.mode === 'overhead' ? 1 : wide ? 0.72 : 1;
    const a = Math.min(1, dt * 3);
    this.zoom += (targetZoom - this.zoom) * Math.min(1, dt * 1.6);
    const clampX = this.mode === 'overhead' ? [26, 74] : [8, 92];
    const tx = Math.max(clampX[0], Math.min(clampX[1], targetX));
    this.camX += (tx - this.camX) * a;
  }

  snapCamera(x: number): void {
    this.camX = this.mode === 'overhead' ? Math.max(26, Math.min(74, x)) : Math.max(8, Math.min(92, x));
  }

  private quad(pts: [number, number][], fill: string): void {
    const ctx = this.ctx;
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      const p = this.project(x, y);
      if (i === 0) ctx.moveTo(p.sx, p.sy);
      else ctx.lineTo(p.sx, p.sy);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  private line(x1: number, y1: number, x2: number, y2: number, color: string, width: number, z = 0): void {
    const a = this.project(x1, y1, z);
    const b = this.project(x2, y2, z);
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.6, width * (a.k + b.k) * 0.5);
    ctx.stroke();
  }

  private text(str: string, x: number, y: number, size: number, color: string, flatten = 0.55, rotate = 0): void {
    const p = this.project(x, y);
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.sx, p.sy);
    if (this.mode === 'broadcast') ctx.scale(1, flatten);
    if (rotate) ctx.rotate(rotate);
    ctx.fillStyle = color;
    ctx.font = `700 ${Math.max(4, size * p.k)}px Oswald, Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, 0, 0);
    ctx.restore();
  }

  drawField(): void {
    const ctx = this.ctx;
    const { w, h } = this.dims();
    // Sky / stadium backdrop.
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#05070d');
    g.addColorStop(0.5, '#0d1320');
    g.addColorStop(1, '#101a10');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    if (this.mode === 'broadcast') {
      // Stands structure.
      this.quad([[-40, -4], [140, -4], [140, -46], [-40, -46]], '#151a24');
      for (const c of this.crowd) {
        const p = this.project(c.x, c.y, c.z);
        if (p.sx < -4 || p.sx > w + 4 || p.sy < -4) continue;
        ctx.fillStyle = c.c;
        const s = Math.max(1, p.k * 0.55);
        ctx.fillRect(p.sx - s / 2, p.sy - s, s, s * 1.3);
      }
      // Wall below the stands.
      const wl = this.project(-40, -4, 1.4);
      const wr = this.project(140, -4, 1.4);
      const bl = this.project(-40, -4, 0);
      ctx.fillStyle = shade(this.home.primaryColor, -0.35);
      ctx.fillRect(Math.min(wl.sx, bl.sx), wl.sy, wr.sx - wl.sx, bl.sy - wl.sy + 1);
    }

    // Apron + field.
    this.quad([[-16, -4], [116, -4], [116, W + 6], [-16, W + 6]], '#2d5a27');
    for (let x = -10; x < 110; x += 5) {
      const stripe = Math.floor((x + 10) / 5) % 2 === 0 ? '#3b7a33' : '#357030';
      this.quad([[x, 0], [x + 5, 0], [x + 5, W], [x, W]], stripe);
    }
    // Both end zones are painted by the home program: school name on one end, nickname on the other.
    this.quad([[-10, 0], [0, 0], [0, W], [-10, W]], this.home.primaryColor);
    this.quad([[100, 0], [110, 0], [110, W], [100, W]], this.home.primaryColor);
    const lettersL = this.home.school.toUpperCase();
    const lettersR = this.home.nickname.toUpperCase();
    const ezText = (letters: string, x: number, color: string) => {
      const n = letters.length;
      const span = Math.min(44, n * 3.4);
      const size = Math.min(4.2, (span / n) * 1.05);
      for (let i = 0; i < n; i++) {
        const y = W / 2 - span / 2 + (i + 0.5) * (span / n);
        // In the broadcast camera, depth squeezes letters vertically: flatten them to match their spacing.
        this.text(letters[i], x, y, this.mode === 'broadcast' ? size * 0.9 : size, color, this.mode === 'broadcast' ? 0.42 : 1);
      }
    };
    ezText(lettersL, -5, luminance(this.home.primaryColor) > 0.6 ? '#111' : '#fff');
    ezText(lettersR, 105, luminance(this.home.primaryColor) > 0.6 ? '#111' : '#fff');

    // Lines.
    const white = 'rgba(255,255,255,0.92)';
    this.line(-10, 0, 110, 0, white, 0.25);
    this.line(-10, W, 110, W, white, 0.25);
    this.line(-10, 0, -10, W, white, 0.25);
    this.line(110, 0, 110, W, white, 0.25);
    for (let x = 0; x <= 100; x += 5) this.line(x, 0, x, W, white, x % 50 === 0 || x === 0 || x === 100 ? 0.28 : 0.16);
    for (let x = 1; x < 100; x++) {
      if (x % 5 === 0) continue;
      this.line(x, 0.3, x, 1.0, white, 0.1);
      this.line(x, W - 1.0, x, W - 0.3, white, 0.1);
      this.line(x, 20, x, 20.7, white, 0.1);
      this.line(x, W - 20.7, x, W - 20, white, 0.1);
    }
    for (let x = 10; x <= 90; x += 10) {
      const n = x <= 50 ? x : 100 - x;
      this.text(String(n), x, W - 9, 2.2, 'rgba(255,255,255,0.9)');
      this.text(String(n), x, 9, 2.2, 'rgba(255,255,255,0.9)', 0.55, Math.PI);
    }
    // Midfield logo.
    const mc = this.project(50, W / 2);
    ctx.save();
    ctx.translate(mc.sx, mc.sy);
    ctx.scale(1, this.mode === 'broadcast' ? 0.42 : 1);
    ctx.beginPath();
    ctx.arc(0, 0, 5.2 * mc.k, 0, Math.PI * 2);
    ctx.fillStyle = this.home.primaryColor;
    ctx.fill();
    ctx.lineWidth = 0.5 * mc.k;
    ctx.strokeStyle = this.home.secondaryColor;
    ctx.stroke();
    ctx.fillStyle = luminance(this.home.primaryColor) > 0.6 ? '#111' : '#fff';
    ctx.font = `700 ${3.3 * mc.k}px Oswald, Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.home.abbreviation, 0, 0.2 * mc.k);
    ctx.restore();
    // Goal posts.
    for (const gx of [-10, 110]) {
      this.line(gx, W / 2, gx, W / 2, '#ffd23f', 0.3);
      const base = this.project(gx, W / 2, 0);
      const cross = this.project(gx, W / 2, 3.33);
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = Math.max(1, 0.25 * base.k);
      ctx.beginPath();
      ctx.moveTo(base.sx, base.sy);
      ctx.lineTo(cross.sx, cross.sy);
      ctx.stroke();
      this.line(gx, W / 2 - 3.08, gx, W / 2 + 3.08, '#ffd23f', 0.22, 3.33);
      for (const uy of [W / 2 - 3.08, W / 2 + 3.08]) {
        const a = this.project(gx, uy, 3.33);
        const b = this.project(gx, uy, 11);
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }
    }
  }

  drawBroadcastLines(anim: PlayAnimation | null, t: number, snapT: number): void {
    if (!anim || anim.losX === undefined) return;
    const fade = t < snapT + 1.5 ? 1 : Math.max(0, 1 - (t - snapT - 1.5));
    if (fade <= 0) return;
    this.line(anim.losX, 0, anim.losX, W, `rgba(60,140,255,${0.85 * fade})`, 0.28);
    if (anim.firstDownX !== undefined && anim.firstDownX > -1 && anim.firstDownX < 101) this.line(anim.firstDownX, 0, anim.firstDownX, W, `rgba(255,220,40,${0.9 * fade})`, 0.3);
  }

  drawActors(anim: PlayAnimation, t: number, carrierId?: string): void {
    const ctx = this.ctx;
    const items = anim.actors.map((a) => ({ a, p: sample(a.path, t) }));
    items.sort((i, j) => i.p.y - j.p.y);
    const ball = sample(anim.ball, t);
    const ballP = this.project(ball.x, ball.y, ball.z);
    let ballDrawn = false;
    const drawBall = () => {
      const sh = this.project(ball.x, ball.y, 0);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(sh.sx, sh.sy, 0.35 * sh.k, 0.15 * sh.k, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7a3e14';
      ctx.strokeStyle = '#f1e2c8';
      ctx.lineWidth = Math.max(0.5, 0.05 * ballP.k);
      ctx.beginPath();
      ctx.ellipse(ballP.sx, ballP.sy, Math.max(2.2, 0.33 * ballP.k), Math.max(1.4, 0.2 * ballP.k), -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ballDrawn = true;
    };
    for (const { a, p } of items) {
      if (!ballDrawn && ball.z > 0.3 && ball.y < p.y) drawBall();
      const u = this.uniforms[a.side];
      const down = a.downAt !== undefined && t >= a.downAt;
      const pp = this.project(p.x, p.y, 0);
      const k = pp.k;
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.33)';
      ctx.beginPath();
      ctx.ellipse(pp.sx + 0.15 * k, pp.sy, 0.75 * k, 0.28 * k, 0, 0, Math.PI * 2);
      ctx.fill();
      if (a.id === carrierId) {
        ctx.strokeStyle = 'rgba(255,230,120,0.9)';
        ctx.lineWidth = Math.max(1, 0.12 * k);
        ctx.beginPath();
        ctx.ellipse(pp.sx, pp.sy, 1.0 * k, 0.4 * k, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      const bodyH = down ? 0.55 : 1.55;
      const top = this.project(p.x, p.y, bodyH);
      const bw = (down ? 1.2 : 0.8) * k;
      const bh = pp.sy - top.sy;
      // pants/legs
      ctx.fillStyle = u.pants;
      ctx.fillRect(pp.sx - bw * 0.42, pp.sy - bh * 0.42, bw * 0.84, bh * 0.42);
      // jersey
      ctx.fillStyle = u.jersey;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = Math.max(0.5, 0.06 * k);
      const jx = pp.sx - bw / 2;
      const jy = top.sy;
      const jh = bh * 0.62;
      ctx.beginPath();
      ctx.roundRect(jx, jy, bw, jh, Math.max(1, 0.18 * k));
      ctx.fill();
      ctx.stroke();
      // number
      if (k > 7) {
        ctx.fillStyle = u.number;
        ctx.font = `700 ${Math.max(6, 0.5 * k)}px Oswald, Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(a.number), pp.sx, jy + jh * 0.52);
      }
      // helmet
      const hp = this.project(p.x, p.y, bodyH + 0.3);
      ctx.fillStyle = u.helmet;
      ctx.beginPath();
      ctx.arc(hp.sx, hp.sy, Math.max(1.5, 0.3 * k), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.stroke();
    }
    if (!ballDrawn) drawBall();
  }

  render(anim: PlayAnimation | null, t: number, snapT: number, carrierId?: string): void {
    this.drawField();
    this.drawBroadcastLines(anim, t, snapT);
    if (anim) this.drawActors(anim, t, carrierId);
  }
}
