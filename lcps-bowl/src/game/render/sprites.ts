/** Procedural 16-bit style sprites drawn with fillRect (no image assets required). */

export interface Kit {
  jersey: string;
  numbers: string;
  pants: string;
  helmet: string;
  stripe: string;
  mask: string;
  skin: string;
}

export const SKIN_TONES = ['#f1c7a5', '#e0ac85', '#c68863', '#9a6646', '#73482f', '#5a3824'];

export function skinFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return SKIN_TONES[h % SKIN_TONES.length];
}

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r + amt * 255)));
  g = Math.max(0, Math.min(255, Math.round(g + amt * 255)));
  b = Math.max(0, Math.min(255, Math.round(b + amt * 255)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export type Pose = 'stand' | 'run' | 'stance' | 'dive' | 'down' | 'throw' | 'block' | 'celebrate';

/**
 * Draws a ~8x14 px football player with feet at (x, y).
 * facing: 1 = right, -1 = left. frame: animation phase (float).
 */
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kit: Kit,
  facing: 1 | -1,
  pose: Pose,
  frame: number,
  scale = 1,
) {
  const px = (dx: number, dy: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    const sx = facing === 1 ? dx : -dx - w;
    ctx.fillRect(Math.round(x + sx * scale), Math.round(y + dy * scale), Math.ceil(w * scale), Math.ceil(h * scale));
  };
  const dark = shade(kit.jersey, -0.18);
  const pantsDark = shade(kit.pants, -0.2);
  if (pose === 'down' || pose === 'dive') {
    // Horizontal body
    const yy = pose === 'down' ? -4 : -6;
    px(-7, yy + 1, 4, 3, kit.pants);
    px(-9, yy + 1, 2, 2, '#202020');
    px(-3, yy, 5, 4, kit.jersey);
    px(-3, yy + 3, 5, 1, dark);
    px(2, yy - 1, 4, 4, kit.helmet);
    px(4, yy, 1, 2, kit.mask);
    px(3, yy - 1, 1, 4, kit.stripe);
    if (pose === 'dive') px(6, yy + 1, 2, 1, kit.skin);
    return;
  }
  const crouch = pose === 'stance' || pose === 'block' ? 2 : 0;
  // Legs
  const phase = pose === 'run' ? Math.floor(frame) % 4 : 0;
  const legA = [0, 1, 0, -1][phase];
  const legB = -legA;
  const legY = -4;
  px(-2 + legA, legY, 2, 3, kit.pants === '#FFFFFF' ? '#f0f0f0' : pantsDark);
  px(0 + legB, legY, 2, 3, kit.pants === '#FFFFFF' ? '#f0f0f0' : pantsDark);
  px(-2 + legA, legY + 2, 2, 1, '#e8e8e8'); // socks
  px(0 + legB, legY + 2, 2, 1, '#e8e8e8');
  px(-2 + legA + (phase === 1 ? 1 : 0), -1, 2, 1, '#151515'); // shoes
  px(0 + legB + (phase === 3 ? 1 : 0), -1, 2, 1, '#151515');
  // Pants
  px(-2, -7 + crouch, 4, 3, kit.pants);
  px(-2, -5 + crouch, 4, 1, pantsDark);
  // Torso / jersey
  const ty = -12 + crouch;
  px(-3, ty, 6, 5, kit.jersey);
  px(-3, ty + 4, 6, 1, dark);
  px(-1, ty + 1, 2, 2, kit.numbers); // number blob
  // Arms
  if (pose === 'throw') {
    px(2, ty - 2, 2, 3, kit.jersey);
    px(3, ty - 3, 1, 1, kit.skin);
  } else if (pose === 'celebrate') {
    px(-4, ty - 3, 1, 3, kit.skin);
    px(3, ty - 3, 1, 3, kit.skin);
  } else if (pose === 'block' || pose === 'stance') {
    px(3, ty + 1, 2, 2, kit.jersey);
    px(5, ty + 2, 1, 1, kit.skin);
  } else {
    const swing = pose === 'run' ? [1, 0, -1, 0][phase] : 0;
    px(-4, ty + 1 + swing, 1, 3, kit.skin);
    px(3, ty + 1 - swing, 1, 3, kit.skin);
  }
  // Helmet
  const hy = ty - 4;
  px(-2, hy, 5, 4, kit.helmet);
  px(-2, hy, 5, 1, shade(kit.helmet, 0.15));
  px(0, hy, 1, 4, kit.stripe);
  px(3, hy + 1, 1, 3, kit.mask);
  px(2, hy + 2, 1, 1, kit.skin);
}

export function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w = 8, alpha = 0.35) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(Math.round(x), Math.round(y), w / 2, w / 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, spin: number) {
  ctx.fillStyle = '#6b3a17';
  const horiz = Math.floor(spin) % 2 === 0;
  if (horiz) {
    ctx.fillRect(Math.round(x) - 2, Math.round(y) - 1, 4, 2);
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 1);
  } else {
    ctx.fillRect(Math.round(x) - 1, Math.round(y) - 2, 3, 3);
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 1);
  }
}

/** Cheerleader with pom-poms. */
export function drawCheerleader(ctx: CanvasRenderingContext2D, x: number, y: number, top: string, skirt: string, skin: string, frame: number) {
  const up = Math.floor(frame) % 2 === 0;
  ctx.fillStyle = skin;
  ctx.fillRect(x - 1, y - 12, 3, 3); // head
  ctx.fillStyle = '#4a2e1a';
  ctx.fillRect(x - 1, y - 13, 3, 1); // hair
  ctx.fillStyle = top;
  ctx.fillRect(x - 2, y - 9, 4, 4);
  ctx.fillStyle = skirt;
  ctx.fillRect(x - 2, y - 5, 4, 2);
  ctx.fillStyle = skin;
  ctx.fillRect(x - 1, y - 3, 1, 3);
  ctx.fillRect(x + 1, y - 3, 1, 3);
  ctx.fillStyle = skirt;
  if (up) {
    ctx.fillRect(x - 4, y - 14, 2, 2);
    ctx.fillRect(x + 3, y - 14, 2, 2);
  } else {
    ctx.fillRect(x - 4, y - 8, 2, 2);
    ctx.fillRect(x + 3, y - 8, 2, 2);
  }
}

/** Referee in stripes. */
export function drawRef(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, moving: boolean) {
  const phase = moving ? Math.floor(frame) % 2 : 0;
  ctx.fillStyle = '#111';
  ctx.fillRect(x - 2 + phase, y - 4, 2, 3);
  ctx.fillRect(x - phase, y - 4, 2, 3);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? '#111' : '#f4f4f4';
    ctx.fillRect(x - 3 + i, y - 10, 1, 6);
  }
  ctx.fillStyle = '#e0ac85';
  ctx.fillRect(x - 1, y - 13, 3, 3);
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(x - 2, y - 14, 5, 1);
}
