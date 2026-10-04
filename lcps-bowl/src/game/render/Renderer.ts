/**
 * Renderer — draws the stadium, field, players and effects for a GameSession onto a low-res canvas
 * (scaled up with nearest-neighbor for the 16-bit look). Pure presentation: reads state, never mutates it.
 */
import type { GameSession } from '../GameSession';
import type { TeamInfo, Weather, TimeOfDay } from '../types';
import { FIELD_W, CENTER_Y } from '../math';
import { drawShadow, drawBall, drawCheerleader, drawRef, shade, skinFor, type Kit, type Pose } from './sprites';
import { teamImage, teamImageStatus, fitRect, logoPath } from './assets';
import { RNG } from '../rng';
import { drawGearedPlayer } from '../../gear/sprite';
import { drawRig, anchorToScreen } from '../../gear/rig/draw';
import { AnimDirector } from './anim';
import { resolveLook, genericLook } from '../../gear/look';
import { other, type Side } from '../Rules';

export const VIEW_W = 640;
export const VIEW_H = 400;
export const PX = 12; // px per yard (x)
export const PY = 5; // px per yard (y, foreshortened)
export const ZPX = 6; // px per yard of height
export const FIELD_TOP = 80;
export const FIELD_BOTTOM = FIELD_TOP + FIELD_W * PY;

export interface Atmosphere {
  timeOfDay: TimeOfDay;
  weather: Weather;
  crowd: number; // 0..1 attendance
  rivalry: boolean;
  playoff: boolean;
  championship: boolean;
}

const FONT = '"Press Start 2P", "Courier New", monospace';

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
}
export const contrastText = (bg: string) => (luminance(bg) > 150 ? '#111111' : '#ffffff');

export function kitFor(t: TeamInfo, home: boolean): Omit<Kit, 'skin'> {
  const u = home ? t.uniforms.home : t.uniforms.away;
  return { jersey: u.jersey, numbers: u.numbers, pants: u.pants, helmet: t.helmetStyle.shell, stripe: t.helmetStyle.stripe, mask: t.helmetStyle.facemask };
}

interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }

export class Renderer {
  camX = 50;
  private crowdA: HTMLCanvasElement | null = null;
  private crowdB: HTMLCanvasElement | null = null;
  private crowdKey = '';
  private refs = [{ x: 30, y: 26 }, { x: 35, y: 26 }, { x: 30, y: -1 }, { x: 30, y: FIELD_W + 1 }];
  private drops: { x: number; y: number; s: number }[] = [];
  private confetti: Particle[] = [];
  private fireworks: Particle[] = [];
  excitement = 0;
  private lastPhase = '';
  private time = 0;
  /** Visual-only animation state machine (reads PlaySim + its events). */
  readonly anim = new AnimDirector();
  /** Last drawn anchors per actor (tests / debugging). */
  readonly lastAnchors = new Map<number, import('../../gear/rig/raster').Anchors>();
  private frameDt = 1 / 60;

  constructor(private atmo: Atmosphere) {
    for (let i = 0; i < 160; i++) this.drops.push({ x: Math.random() * VIEW_W, y: Math.random() * VIEW_H, s: 0.6 + Math.random() * 0.8 });
  }

  setAtmosphere(a: Atmosphere) { this.atmo = a; }

  sx(x: number) { return (x - this.camX) * PX + VIEW_W / 2; }
  sy(y: number) { return FIELD_TOP + y * PY; }

  celebrate(color: string, big = false) {
    this.excitement = 1;
    const n = big ? 160 : 70;
    for (let i = 0; i < n; i++) {
      this.confetti.push({ x: Math.random() * VIEW_W, y: -Math.random() * 60, vx: (Math.random() - 0.5) * 30, vy: 30 + Math.random() * 50, life: 4 + Math.random() * 2, color: Math.random() < 0.5 ? color : Math.random() < 0.5 ? '#ffffff' : '#ffd84a' });
    }
  }

  launchFireworks() {
    for (let k = 0; k < 4; k++) {
      const cx = 80 + Math.random() * (VIEW_W - 160);
      const cy = 20 + Math.random() * 50;
      const col = ['#ff4d4d', '#ffd84a', '#5ad1ff', '#ffffff', '#7dff7a'][k % 5];
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const sp = 40 + Math.random() * 40;
        this.fireworks.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.2 + Math.random() * 0.6, color: col });
      }
    }
  }

  // ------------------------------------------------------------------ crowd

  private buildCrowd(home: TeamInfo, away: TeamInfo) {
    const key = `${home.id}|${away.id}|${this.atmo.crowd.toFixed(2)}|${this.atmo.timeOfDay}`;
    if (key === this.crowdKey || typeof document === 'undefined') return;
    this.crowdKey = key;
    const w = 150 * PX;
    const h = 62;
    const mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const a = mk();
    const b = mk();
    const ca = a.getContext('2d')!;
    const cb = b.getContext('2d')!;
    const rng = new RNG(home.id.length * 977 + away.id.length);
    const night = this.atmo.timeOfDay === 'night';
    const plank = night ? '#4b4f5c' : '#8d929e';
    const bg = night ? '#23263a' : '#5f6577';
    for (const c of [ca, cb]) {
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);
    }
    const rows = 8;
    const rowH = 7;
    const homeCols = [home.colors.primary, home.colors.secondary, '#ffffff', home.colors.primary, home.uniforms.home.jersey];
    const awayCols = [away.colors.primary, away.colors.secondary, '#ffffff'];
    const randomCols = ['#2b2b2b', '#6d6d6d', '#a33', '#336', '#b8a07a', '#e6e6e6'];
    for (let r = 0; r < rows; r++) {
      const y0 = 2 + r * rowH;
      for (const c of [ca, cb]) {
        c.fillStyle = plank;
        c.fillRect(0, y0 + rowH - 1, w, 1);
      }
      for (let x = 2 + (r % 2) * 2; x < w - 4; x += 4) {
        const worldX = x / PX - 20;
        const awaySection = worldX > 88;
        const student = worldX > 40 && worldX < 60;
        if (rng.next() > this.atmo.crowd * (student ? 1.2 : 1) * (awaySection ? 0.8 : 1)) continue;
        // Aisles
        if (Math.floor(worldX) % 22 === 0) continue;
        const shirt = student ? (rng.chance(0.7) ? home.colors.secondary : '#ffffff') : awaySection ? rng.pick(awayCols) : rng.chance(0.75) ? rng.pick(homeCols) : rng.pick(randomCols);
        const skin = rng.pick(['#f1c7a5', '#e0ac85', '#c68863', '#9a6646', '#73482f']);
        const hat = rng.chance(0.15) ? shirt : null;
        // A: sitting
        ca.fillStyle = shirt;
        ca.fillRect(x, y0 + 3, 3, 3);
        ca.fillStyle = skin;
        ca.fillRect(x, y0 + 1, 2, 2);
        if (hat) { ca.fillStyle = hat; ca.fillRect(x, y0 + 1, 2, 1); }
        // B: standing / arms up
        cb.fillStyle = shirt;
        cb.fillRect(x, y0 + 2, 3, 3);
        cb.fillStyle = skin;
        cb.fillRect(x, y0, 2, 2);
        cb.fillRect(x - 1, y0 - 1, 1, 2);
        cb.fillRect(x + 3, y0 - 1, 1, 2);
        if (hat) { cb.fillStyle = hat; cb.fillRect(x, y0, 2, 1); }
      }
    }
    // Band section (gold instrument glints) near the away end of the home side
    for (const c of [ca, cb]) {
      for (let x = Math.round((8 + 20) * PX); x < (18 + 20) * PX; x += 4) {
        for (let r = 1; r < 4; r++) {
          c.fillStyle = home.colors.primary;
          c.fillRect(x, 2 + r * rowH + 3, 3, 3);
          c.fillStyle = '#ffffff';
          c.fillRect(x, 2 + r * rowH + 1, 2, 2);
          c.fillStyle = '#e9c547';
          c.fillRect(x + (c === cb ? 2 : 1), 2 + r * rowH + 3, 2, 1);
        }
      }
    }
    this.crowdA = a;
    this.crowdB = b;
  }

  // ------------------------------------------------------------------ main draw

  draw(ctx: CanvasRenderingContext2D, s: GameSession, dt: number) {
    this.time += dt;
    this.frameDt = dt;
    const home = s.cfg.home.info;
    const away = s.cfg.away.info;
    this.buildCrowd(home, away);
    this.excitement = Math.max(0, this.excitement - dt * 0.25);
    if (s.phase !== this.lastPhase) {
      this.lastPhase = s.phase;
    }
    this.updateCamera(s, dt);
    ctx.imageSmoothingEnabled = false;
    this.drawSky(ctx);
    this.drawStands(ctx, home);
    this.drawField(ctx, s, home);
    this.drawSidelineNear(ctx, home);
    this.drawMarkers(ctx, s);
    this.drawGoalposts(ctx, -10);
    this.drawRefs(ctx, s, dt);
    this.drawActors(ctx, s);
    this.drawGoalposts(ctx, 110, true);
    this.drawKickAnim(ctx, s);
    this.drawWeather(ctx, dt);
    this.drawLighting(ctx);
    this.drawParticles(ctx, dt);
    this.drawSimMessage(ctx, s);
  }

  private updateCamera(s: GameSession, dt: number) {
    let target = this.camX;
    const sim = s.sim;
    const g = s.g;
    if (s.phase === 'kick_anim' && s.kickAnim) {
      target = 100;
    } else if (s.phase === 'kick_meter') {
      target = 96;
    } else if (sim) {
      if (!sim.snapped) target = sim.setup.kind === 'kickoff' ? sim.setup.los + 28 : sim.setup.los + 7;
      else {
        const b = sim.ball;
        const c = sim.carrier;
        if (c) target = c.x + c.vx * 0.4 + (c.team === 'O' ? 6 : -6);
        else target = b.x + (b.state === 'air' ? (b.tx - b.x) * 0.3 : 0);
      }
    } else {
      target = g.phase === 'kickoff' ? 70 : g.ballOn + 7;
    }
    const half = VIEW_W / 2 / PX;
    target = Math.max(-16 + half, Math.min(116 - half, target));
    const k = 1 - Math.exp(-dt * (sim && sim.snapped ? 5 : 3));
    this.camX += (target - this.camX) * k;
  }

  private drawSky(ctx: CanvasRenderingContext2D) {
    const t = this.atmo.timeOfDay;
    const grad = ctx.createLinearGradient(0, 0, 0, 30);
    if (t === 'night') { grad.addColorStop(0, '#05060f'); grad.addColorStop(1, '#141a33'); }
    else if (t === 'dusk') { grad.addColorStop(0, '#2b1f4d'); grad.addColorStop(1, '#d9774a'); }
    else { grad.addColorStop(0, '#5aa6e8'); grad.addColorStop(1, '#a9d6f5'); }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_W, 30);
    if (t === 'night') {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 30; i++) {
        const x = (i * 97 + Math.floor(this.camX * 2)) % VIEW_W;
        if ((i * 13) % 7 < 2) ctx.fillRect(x, (i * 31) % 18, 1, 1);
      }
    }
  }

  private drawStands(ctx: CanvasRenderingContext2D, home: TeamInfo) {
    const topY = 12;
    // Light towers (behind stands)
    for (const wx of [-12, 22, 78, 112]) {
      const x = Math.round(this.sx(wx));
      if (x < -40 || x > VIEW_W + 40) continue;
      ctx.fillStyle = '#5b5f6b';
      ctx.fillRect(x - 1, 2, 3, 30);
      ctx.fillStyle = '#3b3e47';
      ctx.fillRect(x - 9, 0, 19, 7);
      const on = this.atmo.timeOfDay !== 'day';
      ctx.fillStyle = on ? '#fffbe0' : '#c9cbd1';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) ctx.fillRect(x - 8 + i * 5, 1 + j * 3, 3, 2);
      if (on) {
        const g = ctx.createRadialGradient(x, 4, 1, x, 4, 40);
        g.addColorStop(0, 'rgba(255,250,210,0.55)');
        g.addColorStop(1, 'rgba(255,250,210,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 40, -36, 80, 80);
      }
    }
    // Crowd
    if (this.crowdA && this.crowdB) {
      const ox = Math.round(this.sx(-20));
      ctx.drawImage(this.crowdA, ox, topY);
      // Excited columns stand up
      const strip = 12;
      const thr = 0.93 - this.excitement * 0.8 - (this.atmo.rivalry || this.atmo.playoff ? 0.1 : 0);
      for (let sxp = 0; sxp < VIEW_W; sxp += strip) {
        const worldCol = Math.floor((sxp - ox) / strip);
        const n = Math.sin(worldCol * 12.9898 + Math.floor(this.time * (2 + this.excitement * 6)) * 78.233);
        if ((n + 1) / 2 > thr) ctx.drawImage(this.crowdB, sxp - ox, 0, strip, 62, sxp, topY, strip, 62);
      }
    }
    // Wall with school banner
    const wallY = FIELD_TOP - 10;
    ctx.fillStyle = home.colors.primary;
    ctx.fillRect(0, wallY, VIEW_W, 7);
    ctx.fillStyle = shade(home.colors.primary, -0.2);
    ctx.fillRect(0, wallY + 6, VIEW_W, 1);
    ctx.font = `6px ${FONT}`;
    ctx.fillStyle = contrastText(home.colors.primary);
    ctx.textBaseline = 'top';
    const label = this.atmo.championship ? '★ LCPS BOWL CHAMPIONSHIP ★' : this.atmo.playoff ? '★ LCPS PLAYOFFS ★' : `HOME OF THE ${home.mascot.toUpperCase()}`;
    const span = 260;
    const off = ((this.sx(0) % span) + span) % span;
    for (let x = off - span; x < VIEW_W; x += span) ctx.fillText(label, Math.round(x), wallY + 1);
    // Far sideline strip
    ctx.fillStyle = this.atmo.timeOfDay === 'night' ? '#2d5f2d' : '#3f7f3c';
    ctx.fillRect(0, wallY + 7, VIEW_W, FIELD_TOP - wallY - 7);
  }

  private drawField(ctx: CanvasRenderingContext2D, s: GameSession, home: TeamInfo) {
    const night = this.atmo.timeOfDay === 'night';
    const g1 = night ? '#2f7d33' : '#3c9440';
    const g2 = night ? '#2a7330' : '#358a3a';
    const top = FIELD_TOP;
    const bottom = FIELD_BOTTOM;
    // Grass stripes per 5 yards across the whole visible range
    const x0 = Math.floor(this.camX - VIEW_W / 2 / PX) - 1;
    const x1 = Math.ceil(this.camX + VIEW_W / 2 / PX) + 1;
    for (let yd = Math.floor(x0 / 5) * 5; yd <= x1; yd += 5) {
      ctx.fillStyle = Math.floor(yd / 5) % 2 === 0 ? g1 : g2;
      ctx.fillRect(Math.floor(this.sx(yd)), top, Math.ceil(5 * PX) + 1, bottom - top);
    }
    // Snow coverage
    if (this.atmo.weather === 'snow') {
      ctx.fillStyle = 'rgba(240,245,255,0.28)';
      ctx.fillRect(0, top, VIEW_W, bottom - top);
    }
    // End zones (home colors, both ends)
    for (const [ez0, ez1] of [[-10, 0], [100, 110]] as const) {
      const a = this.sx(ez0);
      const b = this.sx(ez1);
      if (b < 0 || a > VIEW_W) continue;
      ctx.fillStyle = home.colors.primary;
      ctx.fillRect(Math.round(a), top, Math.round(b - a), bottom - top);
      // diagonal stripes
      ctx.fillStyle = shade(home.colors.primary, -0.08);
      for (let i = -30; i < 60; i += 4) {
        const yy = top + i * PY;
        if (yy > bottom) break;
      }
      ctx.save();
      ctx.translate(Math.round((a + b) / 2), Math.round((top + bottom) / 2));
      ctx.rotate(ez0 < 0 ? -Math.PI / 2 : Math.PI / 2);
      ctx.font = `16px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const txt = (ez0 < 0 ? home.shortName : home.mascot).toUpperCase();
      ctx.fillStyle = shade(home.colors.primary, -0.25);
      ctx.fillText(txt, 1, 2);
      ctx.fillStyle = luminance(home.colors.secondary) > 60 && Math.abs(luminance(home.colors.secondary) - luminance(home.colors.primary)) > 50 ? home.colors.secondary : '#ffffff';
      ctx.fillText(txt, 0, 0);
      ctx.restore();
    }
    // Lines
    ctx.fillStyle = '#f4f4f0';
    // sidelines & end lines
    ctx.fillRect(Math.round(this.sx(-10)), top - 1, Math.round(120 * PX), 2);
    ctx.fillRect(Math.round(this.sx(-10)), bottom - 1, Math.round(120 * PX), 2);
    ctx.fillRect(Math.round(this.sx(-10)) - 1, top, 2, bottom - top);
    ctx.fillRect(Math.round(this.sx(110)) - 1, top, 2, bottom - top);
    for (let yd = 0; yd <= 100; yd += 5) {
      const x = Math.round(this.sx(yd));
      if (x < -5 || x > VIEW_W + 5) continue;
      ctx.fillRect(x - (yd === 0 || yd === 100 ? 1 : 0), top, yd === 0 || yd === 100 ? 3 : 1, bottom - top);
    }
    // Hash marks (every yard)
    for (let yd = 1; yd < 100; yd++) {
      if (yd % 5 === 0) continue;
      const x = Math.round(this.sx(yd));
      if (x < 0 || x > VIEW_W) continue;
      for (const hy of [0.7, 17.78, FIELD_W - 17.78, FIELD_W - 0.7]) ctx.fillRect(x, Math.round(this.sy(hy)) - 1, 1, 2);
    }
    // Yard numbers
    ctx.font = `10px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let yd = 10; yd <= 90; yd += 10) {
      const x = this.sx(yd);
      if (x < -20 || x > VIEW_W + 20) continue;
      const n = yd <= 50 ? yd : 100 - yd;
      ctx.fillStyle = 'rgba(244,244,240,0.9)';
      ctx.fillText(String(n), Math.round(x), Math.round(this.sy(FIELD_W - 9)));
      ctx.fillText(String(n), Math.round(x), Math.round(this.sy(9)));
      // direction arrows
      if (yd !== 50) {
        const dir = yd < 50 ? -1 : 1;
        const ax = Math.round(x + dir * 15);
        for (const ay of [this.sy(9), this.sy(FIELD_W - 9)]) {
          ctx.fillRect(ax, Math.round(ay) - 1, 1, 3);
          ctx.fillRect(ax + dir, Math.round(ay), 1, 1);
        }
      }
    }
    // Midfield logo
    const mx = this.sx(50);
    if (mx > -40 && mx < VIEW_W + 40) {
      const img = teamImage(home.id);
      const cy = this.sy(CENTER_Y);
      if (img) {
        // Full supplied logo, aspect ratio preserved (wide lockups stay wide), native colors
        const r = fitRect(img, mx - 30, cy - 16, 60, 32);
        ctx.globalAlpha = 0.85;
        ctx.drawImage(img, Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h));
        ctx.globalAlpha = 1;
      } else if (logoPath(home.id) && teamImageStatus(home.id) === false) {
        ctx.fillStyle = '#ff4d4d';
        ctx.font = `8px ${FONT}`;
        ctx.fillText('MISSING LOGO', Math.round(mx), Math.round(cy));
      }
    }
    ctx.textAlign = 'left';
    void s;
  }

  private drawSidelineNear(ctx: CanvasRenderingContext2D, home: TeamInfo) {
    // Running track
    const y0 = FIELD_BOTTOM + 3;
    ctx.fillStyle = this.atmo.timeOfDay === 'night' ? '#2d5f2d' : '#3f7f3c';
    ctx.fillRect(0, FIELD_BOTTOM + 1, VIEW_W, 3);
    ctx.fillStyle = '#9c4a32';
    ctx.fillRect(0, y0 + 14, VIEW_W, VIEW_H - y0 - 14);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 4; i++) ctx.fillRect(0, y0 + 20 + i * 9, VIEW_W, 1);
    // Bench area grass
    ctx.fillStyle = this.atmo.timeOfDay === 'night' ? '#2b5a2b' : '#3b7a39';
    ctx.fillRect(0, y0, VIEW_W, 14);
    // Team bench: players standing
    for (let wx = 32; wx <= 68; wx += 1.6) {
      const x = this.sx(wx);
      if (x < -10 || x > VIEW_W + 10) continue;
      const bob = Math.sin(this.time * 3 + wx) > 0.95 - this.excitement * 0.6 ? 'celebrate' : 'stand';
      const look = genericLook(home, true, `bench-${home.id}-${Math.round(wx * 10)}`);
      drawGearedPlayer(ctx, x, y0 + 13 + (Math.round(wx * 10) % 3), look, wx < 50 ? 1 : -1, bob as Pose, 0, 1);
    }
    // Coach
    const cxp = this.sx(50);
    if (cxp > -10 && cxp < VIEW_W + 10) {
      ctx.fillStyle = '#c8b48a';
      ctx.fillRect(Math.round(cxp) - 2, y0 + 8, 4, 5);
      ctx.fillStyle = home.colors.primary;
      ctx.fillRect(Math.round(cxp) - 3, y0 + 2, 6, 6);
      ctx.fillStyle = '#e0ac85';
      ctx.fillRect(Math.round(cxp) - 1, y0 - 1, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(cxp) + 2, y0 + 3, 2, 3); // play sheet
    }
    // Cheerleaders near each end zone
    for (const base of [6, 94]) {
      for (let i = 0; i < 5; i++) {
        const x = this.sx(base + i * 1.4 - 3);
        if (x < -10 || x > VIEW_W + 10) continue;
        drawCheerleader(ctx, Math.round(x), y0 + 30 + (i % 2) * 6, home.colors.primary, home.colors.secondary, skinFor('ch' + i + base), this.time * (2 + this.excitement * 5) + i);
      }
    }
  }

  private drawMarkers(ctx: CanvasRenderingContext2D, s: GameSession) {
    const g = s.g;
    const sim = s.sim;
    if (g.phase === 'kickoff' || !sim || sim.setup.kind !== 'scrimmage') return;
    const los = sim.setup.los;
    const fd = los + g.toGo;
    const top = FIELD_TOP;
    const bottom = FIELD_BOTTOM;
    // LOS (blue) and line to gain (yellow), only before/while the play is live
    ctx.fillStyle = 'rgba(70,140,255,0.85)';
    ctx.fillRect(Math.round(this.sx(los)), top, 2, bottom - top);
    if (fd < 100 && g.phase !== 'pat') {
      ctx.fillStyle = 'rgba(255,220,40,0.9)';
      ctx.fillRect(Math.round(this.sx(fd)), top, 2, bottom - top);
    }
    // Chain crew on far sideline
    const cy = top - 3;
    const a = this.sx(los);
    const b = this.sx(Math.min(fd, 100));
    ctx.fillStyle = '#ff7b1c';
    ctx.fillRect(Math.round(a), cy - 9, 2, 10);
    if (fd < 100 && g.phase !== 'pat') {
      ctx.fillRect(Math.round(b), cy - 9, 2, 10);
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(Math.round(a), cy - 2, Math.round(b - a), 1);
    }
    // Down marker
    ctx.fillStyle = '#ff7b1c';
    ctx.fillRect(Math.round(a) - 3, cy - 13, 8, 6);
    ctx.fillStyle = '#111';
    ctx.font = `5px ${FONT}`;
    ctx.textBaseline = 'top';
    ctx.fillText(String(g.down), Math.round(a) - 1, cy - 12);
    // Chain gang people
    for (const x of [a, b]) {
      ctx.fillStyle = '#111';
      ctx.fillRect(Math.round(x) + 3, cy - 6, 3, 5);
      ctx.fillStyle = '#e0ac85';
      ctx.fillRect(Math.round(x) + 3, cy - 9, 3, 3);
    }
  }

  private drawGoalposts(ctx: CanvasRenderingContext2D, wx: number, front = false) {
    const x = Math.round(this.sx(wx));
    if (x < -30 || x > VIEW_W + 30) return;
    const baseY = Math.round(this.sy(CENTER_Y));
    const bar = 3.33 * ZPX;
    const half = 3.89 * PY;
    ctx.fillStyle = '#e9d22a';
    if (!front) {
      ctx.fillRect(x - 1, baseY - Math.round(bar), 2, Math.round(bar));
    } else {
      ctx.fillRect(x - 1, baseY - Math.round(bar), 2, Math.round(bar));
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x + 1, baseY - 1, 6, 2);
      ctx.fillStyle = '#e9d22a';
    }
    ctx.fillRect(x - 1, baseY - Math.round(bar) - Math.round(half), 2, Math.round(half * 2));
    // uprights (go "up" = toward screen top, drawn slanted for perspective)
    const up = 6.67 * ZPX;
    ctx.fillRect(x - 1, baseY - Math.round(bar) - Math.round(half) - Math.round(up), 2, Math.round(up));
    ctx.fillRect(x - 1, baseY - Math.round(bar) + Math.round(half) - Math.round(up), 2, Math.round(up));
    ctx.fillStyle = '#c9b31d';
    ctx.fillRect(x + 1, baseY - Math.round(bar) - Math.round(half) - Math.round(up), 1, Math.round(up));
    // padding
    ctx.fillStyle = s_pad;
    ctx.fillRect(x - 2, baseY - 8, 4, 8);
  }

  private drawRefs(ctx: CanvasRenderingContext2D, s: GameSession, dt: number) {
    const sim = s.sim;
    const los = sim ? sim.setup.los : s.g.ballOn;
    const ball = sim ? { x: sim.ball.x, y: sim.ball.y } : { x: los, y: CENTER_Y };
    const live = sim?.snapped && !sim.done;
    const targets = sim && sim.setup.kind === 'scrimmage'
      ? [{ x: los - 13, y: CENTER_Y + 4 }, { x: los + 6, y: CENTER_Y - 2 }, { x: los, y: -1.2 }, { x: los, y: FIELD_W + 1.2 }]
      : [{ x: los + 30, y: CENTER_Y }, { x: los + 10, y: 10 }, { x: los + 45, y: -1.2 }, { x: los + 45, y: FIELD_W + 1.2 }];
    if (live) {
      targets[0] = { x: ball.x - 10, y: ball.y * 0.6 + CENTER_Y * 0.4 };
      targets[2] = { x: ball.x, y: -1.2 };
      targets[3] = { x: ball.x, y: FIELD_W + 1.2 };
    }
    this.refs.forEach((r, i) => {
      const t = targets[i];
      const k = 1 - Math.exp(-dt * (live ? 1.8 : 3));
      const ox = r.x;
      r.x += (t.x - r.x) * k;
      r.y += (t.y - r.y) * k;
      const sx = this.sx(r.x);
      if (sx < -10 || sx > VIEW_W + 10) return;
      if (i !== 2) drawShadow(ctx, sx, this.sy(r.y), 7, 0.25);
      drawRef(ctx, Math.round(sx), Math.round(this.sy(r.y)), this.time * 8, Math.abs(r.x - ox) > 0.01);
    });
  }

  private drawActors(ctx: CanvasRenderingContext2D, s: GameSession) {
    const sim = s.sim;
    if (!sim) return;
    const oSide: Side = sim.setup.kind === 'kickoff' ? other(s.g.possession) : s.g.possession;
    const sideOf: Record<'O' | 'D', Side> = { O: oSide, D: other(oSide) };
    const order = [...sim.actors].sort((a, b) => a.y - b.y);
    const userTeam = sim.setup.userTeam;
    const user = sim.user;
    // Pre-snap route preview for the human's offense
    if (!sim.snapped && userTeam === 'O' && sim.setup.kind === 'scrimmage') {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      for (const a of sim.actors) {
        if (a.team !== 'O' || !a.route || a.role !== 'route') continue;
        let px0 = a.x;
        let py0 = a.y;
        for (const p of a.route.pts) {
          const steps = Math.max(1, Math.floor(Math.hypot(p.x - px0, p.y - py0) * 1.2));
          for (let i = 0; i < steps; i += 2) {
            const fx = px0 + ((p.x - px0) * i) / steps;
            const fy = py0 + ((p.y - py0) * i) / steps;
            ctx.fillRect(Math.round(this.sx(fx)), Math.round(this.sy(fy)), 1, 1);
          }
          px0 = p.x;
          py0 = p.y;
        }
      }
      // Run aim arrow
      const play = sim.setup.offPlay;
      if (play && (play.kind === 'run' || play.kind === 'option')) {
        const aim = (play.aim ?? 0) * (sim.setup.flip ? -1 : 1);
        ctx.fillStyle = 'rgba(255,230,80,0.6)';
        const tx = this.sx(sim.setup.los + 3);
        const ty = this.sy(sim.setup.ballY + aim);
        ctx.fillRect(Math.round(tx) - 2, Math.round(ty) - 1, 5, 3);
      }
    }
    // Pre-snap coverage preview for the human's defense
    if (!sim.snapped && userTeam === 'D' && sim.setup.kind === 'scrimmage') {
      for (const a of sim.actors) {
        if (a.team !== 'D') continue;
        const ax = this.sx(a.x);
        const ay = this.sy(a.y);
        if (a.role === 'zone' && a.zoneSpot) {
          ctx.strokeStyle = a.zoneDeep ? 'rgba(90,209,255,0.45)' : 'rgba(255,216,74,0.45)';
          ctx.beginPath();
          ctx.ellipse(this.sx(a.zoneSpot.x), this.sy(a.zoneSpot.y), a.zoneDeep ? 34 : 26, a.zoneDeep ? 14 : 10, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(this.sx(a.zoneSpot.x), this.sy(a.zoneSpot.y));
          ctx.stroke();
        } else if (a.role === 'man' && a.manTarget != null) {
          const t = sim.actors[a.manTarget];
          ctx.fillStyle = 'rgba(255,120,120,0.6)';
          const steps = 8;
          for (let i = 0; i <= steps; i += 1) {
            ctx.fillRect(Math.round(ax + ((this.sx(t.x) - ax) * i) / steps), Math.round(ay + ((this.sy(t.y) - ay) * i) / steps), 1, 1);
          }
        } else if (a.role === 'rush' && a.pos !== 'DL') {
          ctx.fillStyle = 'rgba(255,90,90,0.8)';
          ctx.fillRect(Math.round(ax) - 4, Math.round(ay) - 1, 3, 2);
        }
      }
    }
    // Shadows first
    for (const a of order) drawShadow(ctx, this.sx(a.x), this.sy(a.y), a.pos === 'OL' || a.pos === 'DL' ? 9 : 7);
    // User marker under feet
    if (user && userTeam) {
      ctx.strokeStyle = '#ffe44a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(Math.round(this.sx(user.x)), Math.round(this.sy(user.y)), 6, 2.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // One football entity: attached to its holder's grip anchor while possessed, drawn on its own in flight.
    this.anim.update(s, this.frameDt);
    const b = sim.ball;
    const holder = b.state === 'held' && b.holder >= 0 ? b.holder : -1;
    for (const a of order) {
      const x = this.sx(a.x);
      if (x < -30 || x > VIEW_W + 30) continue;
      const y = this.sy(a.y);
      const side = sideOf[a.team];
      const tg = s.team(side);
      const look = resolveLook(a.p, tg.info, side === 'home', tg.theme ?? 'none');
      const pk = this.anim.pick(a);
      const fr = drawRig(ctx, Math.round(x), Math.round(y), look, pk.build, pk.dir, pk.action, pk.frame, { presnap: !sim.snapped, number: a.p.number });
      this.lastAnchors.set(a.idx, fr.anchors);
      if (a.idx === holder) {
        const g = fr.anchors.ball ?? { x: fr.anchors.waist.x + (pk.dir === 'left' ? -3 : 3), y: fr.anchors.waist.y - 2 };
        const p = anchorToScreen(g, Math.round(x), Math.round(y));
        drawBall(ctx, p.x, p.y, 0);
      }
    }
    // Ball in flight (pass, pitch, snap, kick), loose ball, or spotted before the snap
    if (b.state === 'air' || b.state === 'loose' || (b.state === 'dead' && sim.setup.kind !== 'scrimmage' && !sim.snapped)) {
      const bx = this.sx(b.x);
      const by = this.sy(b.y);
      drawShadow(ctx, bx, by, 4, 0.4);
      drawBall(ctx, bx, by - b.z * ZPX, b.state === 'loose' ? 0 : this.time * 14);
      // Landing marker for kicks
      if (b.state === 'air' && (b.kind === 'kick' || b.kind === 'punt')) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(this.sx(b.tx), this.sy(b.ty), 5, 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (!sim.snapped && sim.setup.kind === 'scrimmage') {
      drawBall(ctx, this.sx(sim.setup.los - 0.2), this.sy(sim.setup.ballY) - 1, 0);
    }
    // Receiver icons (human offense, pass play, before the throw)
    const play = sim.setup.offPlay;
    if (userTeam === 'O' && play && (play.kind === 'pass' || play.kind === 'option') && !sim.passThrown && !sim.pastLos && !sim.done && (play.kind === 'pass' || !sim.handedOff)) {
      for (const a of sim.actors) {
        if (a.number == null || a.team !== 'O') continue;
        if (play.kind === 'option' && sim.t > 0.85) continue;
        let near = 99;
        for (const d of sim.actors) if (d.team === 'D') near = Math.min(near, Math.hypot(d.x - a.x, d.y - a.y));
        const col = near > 3.2 ? '#38d86b' : near > 1.6 ? '#f2c94c' : '#eb5757';
        const x = Math.round(this.sx(a.x));
        const y = Math.round(this.sy(a.y)) - 41;
        ctx.fillStyle = '#111';
        ctx.fillRect(x - 5, y - 5, 11, 11);
        ctx.fillStyle = col;
        ctx.fillRect(x - 4, y - 4, 9, 9);
        ctx.fillStyle = '#111';
        ctx.font = `7px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(a.number), x + 1, y + 1);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#111';
        ctx.fillRect(x, y + 6, 1, 3);
      }
    }
    // Arrow over user
    if (user && userTeam) {
      const x = Math.round(this.sx(user.x));
      const y = Math.round(this.sy(user.y)) - 36;
      ctx.fillStyle = '#ffe44a';
      ctx.fillRect(x - 2, y, 5, 1);
      ctx.fillRect(x - 1, y + 1, 3, 1);
      ctx.fillRect(x, y + 2, 1, 1);
      // Stamina bar for the human ball carrier
      if (sim.carrier === user) {
        ctx.fillStyle = '#111';
        ctx.fillRect(x - 6, y - 4, 13, 3);
        ctx.fillStyle = user.stamina > 0.3 ? '#4cd964' : '#ff9500';
        ctx.fillRect(x - 5, y - 3, Math.round(11 * user.stamina), 1);
      }
    }
  }

  private drawKickAnim(ctx: CanvasRenderingContext2D, s: GameSession) {
    const ka = s.kickAnim;
    if (s.phase === 'kick_meter' || (s.phase === 'kick_anim' && ka)) {
      const dist = ka ? ka.distance : s.kick?.distance ?? 20;
      const spotX = 110 - dist; // hold spot (posts at 110)
      const kickSide = s.g.possession;
      const kt = s.team(kickSide).info;
      const kl = (seed: string) => genericLook(kt, kickSide === 'home', `${kt.id}-${seed}`, seed === 'k' ? 'K' : 'OL');
      // Line + holder + kicker
      const hx = this.sx(spotX);
      const hy = this.sy(CENTER_Y);
      drawShadow(ctx, hx, hy, 8);
      // Holder kneels; kicker runs the kick action so the strike frame lines up with the ball launch (t = 0.15 s)
      drawRig(ctx, Math.round(hx - 2), Math.round(hy), kl('h'), 'skill', 'right', 'kneel', 3);
      const kt0 = ka ? ka.t - 0.15 + 3 / 12 : 0;
      const kf = ka ? Math.max(0, Math.min(5, Math.floor(kt0 * 12))) : 1;
      drawRig(ctx, Math.round(this.sx(spotX - (ka && ka.t > 0.15 ? 0.5 : 2))), Math.round(hy + 4), kl('k'), 'skill', 'right', 'kick', kf);
      for (let i = -3; i <= 3; i++) {
        drawRig(ctx, Math.round(this.sx(spotX + 7)), Math.round(this.sy(CENTER_Y + i * 1.3)), kl('ol' + i), 'lineman', 'right', 'block', 3);
      }
      if (ka) {
        const f = Math.min(1, ka.t / ka.dur);
        const endX = 110 + 4;
        const x = spotX + (endX - spotX) * f;
        const lat = ka.lateral * 3.89 * f * (1 + (1 - f) * 0);
        const peak = ka.short ? 3.0 * (dist / 40) : 6 + dist * 0.08;
        const z = 4 * peak * f * (1 - f) + (f * 0.6);
        const bx = this.sx(x);
        const by = this.sy(CENTER_Y + lat);
        drawShadow(ctx, bx, by, 4, 0.35);
        drawBall(ctx, bx, by - z * ZPX, this.time * 12);
      }
    }
  }

  private drawWeather(ctx: CanvasRenderingContext2D, dt: number) {
    const w = this.atmo.weather;
    if (w === 'rain') {
      ctx.fillStyle = 'rgba(180,200,255,0.55)';
      for (const d of this.drops) {
        d.y += 300 * dt * d.s;
        d.x -= 60 * dt * d.s;
        if (d.y > VIEW_H) { d.y = -5; d.x = Math.random() * (VIEW_W + 60); }
        ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 4);
      }
      ctx.fillStyle = 'rgba(20,30,60,0.12)';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    } else if (w === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (const d of this.drops) {
        d.y += 30 * dt * d.s;
        d.x += Math.sin(this.time * 2 + d.s * 10) * 10 * dt;
        if (d.y > VIEW_H) { d.y = -5; d.x = Math.random() * VIEW_W; }
        ctx.fillRect(Math.round(d.x), Math.round(d.y), d.s > 1.1 ? 2 : 1, d.s > 1.1 ? 2 : 1);
      }
    } else if (w === 'wind') {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let i = 0; i < 20; i++) {
        const d = this.drops[i];
        d.x += 220 * dt * d.s;
        if (d.x > VIEW_W) { d.x = -30; d.y = Math.random() * VIEW_H; }
        ctx.fillRect(Math.round(d.x), Math.round(d.y), 14, 1);
      }
    } else if (w === 'cold') {
      ctx.fillStyle = 'rgba(200,220,255,0.05)';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  private drawLighting(ctx: CanvasRenderingContext2D) {
    if (this.atmo.timeOfDay === 'night') {
      const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H * 0.55, 80, VIEW_W / 2, VIEW_H * 0.55, VIEW_W * 0.75);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,20,0.35)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    } else if (this.atmo.timeOfDay === 'dusk') {
      ctx.fillStyle = 'rgba(255,120,60,0.07)';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D, dt: number) {
    for (const p of this.confetti) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx += Math.sin(this.time * 5 + p.y) * 4 * dt;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
    this.confetti = this.confetti.filter((p) => p.life > 0 && p.y < VIEW_H + 5);
    for (const p of this.fireworks) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 30 * dt;
      p.vx *= 0.98;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
    ctx.globalAlpha = 1;
    this.fireworks = this.fireworks.filter((p) => p.life > 0);
  }

  private drawSimMessage(ctx: CanvasRenderingContext2D, s: GameSession) {
    const sim = s.sim;
    if (!sim || sim.messageT <= 0 || !sim.message) return;
    const carrier = sim.carrier ?? sim.user;
    const x = carrier ? this.sx(carrier.x) : VIEW_W / 2;
    const y = carrier ? this.sy(carrier.y) - 46 : 120;
    ctx.font = `8px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(sim.message, Math.round(x) + 1, Math.round(y) + 1);
    ctx.fillStyle = '#ffe44a';
    ctx.fillText(sim.message, Math.round(x), Math.round(y));
    ctx.textAlign = 'left';
  }
}

const s_pad = '#2f3a8c';
void shade;
