/**
 * Layered gear sprite. A ~10×22 px player built from layers so any combination of equipment
 * renders the same in menus (scaled up) and in gameplay:
 *   back arm → legs (socks, leg sleeves, tape/spats, cleats) → pants (+towel, hand warmer)
 *   → torso/jersey (pads silhouette, numbers, undershirt collar, neck roll) → front arm
 *   (sleeve, band, brace, wristband, glove) → helmet shell → stripe/logo/finish → visor → mouthguard → facemask.
 * Facing: 1 = right, -1 = left. Feet at (x, y).
 */
import type { ArmLook, Look } from './types';
import type { Pose } from '../game/render/sprites';
import { shade } from '../game/render/sprites';

/** Helmet silhouettes, 8×6, front of the face at the right. S shell, D panel, L logo, E eye, F face, . empty */
export const HELMETS: Record<string, string[]> = {
  classic: ['..SSSS..', '.SSSSSS.', 'SSSSSES.', 'SSLSSFF.', 'SSSSSFF.', '.SSSS...'],
  classic2: ['..SSSS..', '.SSSSSS.', 'SSSSSES.', 'SSLSSFF.', 'SSSSSFF.', 'SSSSS...'],
  retro: ['........', '..SSSS..', '.SSSSES.', '.SLSSFF.', '.SSSSFF.', '..SS....'],
  oldschool: ['..SSS...', '.SSSSS..', '.SSSSES.', '.SSLSFF.', '..SSSFF.', '..S.....'],
  speed: ['...SSSS.', '..SSSSSS', '.SSSSES.', 'SDLSSFF.', 'SSSSSFF.', '.SSSSSS.'],
  flex: ['..SDDS..', '.SSDDSS.', 'SSSSSES.', 'SSLSDFF.', 'SSSSSFF.', 'SS.SSS..'],
  facet: ['.SSSSSS.', 'SSSSSSSS', 'SDSSSES.', 'SSLSDFF.', 'DSSSSFF.', '.SD.SS..'],
  minimal: ['..SSSS..', '.SSSSSS.', 'SSSSSES.', 'SSSSSFF.', 'SSSSSFF.', '.SSSSS..'],
  aggressive: ['.DSDSD..', 'SSSSSSSS', 'SSSSSES.', 'SDLSSFF.', 'SSSSSFFS', 'SSSSSSS.'],
};

/**
 * Signature details drawn on top of / outside the base grid so every model reads differently on the field.
 * [col, row, key]: S shell, D shade, H highlight, V vent (dark). Cols/rows may sit outside 0..7 / 0..5.
 */
export const HELMET_DETAILS: Record<string, [number, number, 'S' | 'D' | 'H' | 'V'][]> = {
  classic: [],
  classic2: [[1, 1, 'H']],
  retro: [[2, 2, 'V']],
  oldschool: [[3, -1, 'S'], [2, 1, 'H']],
  // swept-back flare behind the neck, crown ridge, two vents and the extended jaw bumper
  speed: [[-1, 4, 'D'], [-1, 5, 'D'], [-2, 5, 'D'], [3, 0, 'H'], [4, 0, 'H'], [5, 0, 'H'], [2, 2, 'V'], [4, 1, 'V'], [6, 5, 'D'], [7, 5, 'D']],
  // raised flex panel cut into the crown with a dark seam around it
  flex: [[2, -1, 'H'], [3, -1, 'H'], [4, -1, 'H'], [5, -1, 'S'], [1, 0, 'V'], [6, 0, 'V'], [1, 2, 'V'], [2, 2, 'V']],
  // flat top with light/dark facets on the side panels
  facet: [[0, -1, 'D'], [1, -1, 'S'], [2, -1, 'S'], [3, -1, 'S'], [4, -1, 'S'], [5, -1, 'D'], [1, 1, 'H'], [2, 1, 'H'], [1, 3, 'H'], [3, 4, 'D'], [4, 4, 'D']],
  // one smooth, wide gloss streak and nothing else
  minimal: [[2, 1, 'H'], [3, 1, 'H'], [4, 1, 'H'], [1, 2, 'H'], [-1, 2, 'S'], [-1, 3, 'S']],
  // fins along the crown, big jaw, wide back
  aggressive: [[0, -1, 'D'], [2, -1, 'D'], [4, -1, 'D'], [-1, 1, 'S'], [-1, 2, 'S'], [-1, 3, 'D'], [1, 1, 'V'], [3, 1, 'V'], [8, 5, 'D'], [7, 5, 'D']],
};

/** Facemask bar pixels (col,row) in the helmet grid. */
export const MASKS: Record<string, [number, number][]> = {
  kicker: [[7, 3]],
  oldschool: [[6, 4], [7, 4]],
  qb: [[7, 2], [7, 3], [6, 3]],
  skill: [[7, 2], [7, 3], [7, 4], [6, 3]],
  rb: [[7, 2], [7, 3], [7, 4], [6, 3], [6, 5]],
  lb: [[7, 2], [7, 3], [7, 4], [7, 5], [6, 3], [6, 5]],
  dl: [[7, 2], [7, 3], [7, 4], [7, 5], [6, 2], [6, 3], [6, 4], [6, 5]],
  cage: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [6, 3], [6, 5], [5, 5]],
  bigcage: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [8, 3], [8, 4], [6, 1], [6, 3], [6, 5], [5, 5]],
  aggressive: [[7, 2], [8, 3], [7, 4], [8, 5], [6, 5], [6, 3], [7, 1]],
};

const pat = (c: string[], i: number) => c[((i % c.length) + c.length) % c.length];

export function drawGearedPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, L: Look, facing: 1 | -1, pose: Pose, frame: number, scale = 1, opts: { presnap?: boolean } = {}) {
  const s = scale;
  const px = (dx: number, dy: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    const sx = facing === 1 ? dx : -dx - w;
    ctx.fillRect(Math.round(x + sx * s), Math.round(y + dy * s), Math.ceil(w * s), Math.ceil(h * s));
  };
  // ---------------------------------------------------------------- lying / diving
  if (pose === 'down' || pose === 'dive') {
    const yy = pose === 'down' ? -5 : -7;
    px(-10, yy + 2, 2, 2, pat(L.cleats.colors, 0));
    px(-8, yy + 2, 2, 2, L.spats ? pat(L.spats.colors, 0) : pat(L.socks, 0));
    px(-6, yy + 1, 3, 3, L.pants);
    px(-3, yy, 5, 4, L.jersey);
    px(-3, yy + 3, 5, 1, L.jerseyShade);
    px(-1, yy + 1, 2, 2, L.numbers);
    const glove = L.arms.R.glove ?? L.arms.L.glove;
    if (pose === 'dive') { px(2, yy + 1, 3, 1, L.arms.R.sleeve ? pat(L.arms.R.sleeve.colors, 0) : L.skin); px(5, yy + 1, 1, 1, glove ? pat(glove, 0) : L.skin); }
    px(2, yy - 1, 4, 4, L.helmet.shell);
    px(2, yy - 1, 4, 1, L.helmet.hi);
    if (L.helmet.stripe) px(3, yy - 1, 1, 4, L.helmet.stripe);
    px(5, yy, 1, 2, L.visor ? pat(L.visor, 0) : L.skin);
    px(6, yy, 1, 3, L.mask.color);
    return;
  }
  const crouch = pose === 'stance' || pose === 'block' ? 2 : 0;
  const run = pose === 'run';
  const phase = run ? Math.floor(frame) % 4 : 0;
  const W = L.torso;
  const left = -Math.ceil(W / 2);
  const right = left + W - 1;
  const swing = run ? [1, 0, -1, 0][phase] : 0;

  // ---------------------------------------------------------------- arms (shared)
  const drawArm = (a: ArmLook, ax: number, back: boolean, raise: boolean, forward: boolean) => {
    const dark = (c: string) => (back ? shade(c, -0.12) : c);
    const sleeve = a.sleeve;
    const skin = dark(L.skin);
    const sl = (i: number) => (sleeve ? dark(pat(sleeve.colors, i)) : skin);
    const glove = a.glove ? dark(pat(a.glove, 0)) : skin;
    const glove2 = a.glove ? dark(pat(a.glove, 1)) : skin;
    const top = -15 + crouch;
    if (forward) {
      // Arms extended forward (blocking / stance)
      px(ax, top + 1, 2, 1, dark(L.jersey));
      for (let i = 0; i < 3; i++) px(right + 1 + i, top + 2, 1, 2, i === 0 ? (L.undershirt && !sleeve ? dark(pat(L.undershirt, 0)) : sl(i)) : sleeve && (sleeve.len === 'full' || i < 2) ? sl(i) : skin);
      if (a.band) px(right + 1, top + 2, 1, 2, dark(pat(a.band, 0)));
      if (a.wrist) px(right + 3, top + 2, 1, 2, dark(pat(a.wrist, 0)));
      px(right + 4, top + 2, 1, 2, glove);
      return;
    }
    if (raise) {
      px(ax, top - 3, 2, 1, glove);
      px(ax, top - 2, 2, 1, a.wrist ? dark(pat(a.wrist, 0)) : sleeve?.len === 'full' ? sl(0) : skin);
      px(ax, top - 1, 2, 1, sleeve?.len === 'full' ? sl(1) : skin);
      px(ax, top, 2, 1, a.band ? dark(pat(a.band, 0)) : sleeve ? sl(2) : skin);
      px(ax, top + 1, 2, 1, dark(L.jersey));
      return;
    }
    const o = back ? -swing : swing;
    // Jersey sleeve cap (shoulder pad)
    px(ax, top + 0, 2, 1, dark(L.jersey));
    // Upper arm (2 rows)
    for (let r = 0; r < 2; r++) {
      let c = L.undershirt && !sleeve ? dark(pat(L.undershirt, 0)) : sl(r);
      if (!sleeve && !L.undershirt) c = skin;
      if (r === 1 && a.band) c = dark(pat(a.band, 0));
      px(ax, top + 1 + r + o * 0, 2, 1, c);
    }
    // Elbow / forearm (2 rows)
    for (let r = 0; r < 2; r++) {
      let c = sleeve && (sleeve.len === 'full' || sleeve.padded) ? sl(r + 2) : skin;
      if (a.brace && r === 0) c = dark(a.brace);
      if (a.wristCoach && r === 1) c = dark('#f4f4f4');
      if (a.wrist && r === 1) c = dark(pat(a.wrist, 0));
      px(ax + (o > 0 ? 1 : o < 0 ? -1 : 0) * (r > 0 ? 1 : 0), top + 3 + r, 2, 1, c);
      if (sleeve?.padded && r === 0) px(ax + (ax < 0 ? -1 : 2), top + 3, 1, 1, sl(1));
    }
    // Hand
    const hx = ax + (o > 0 ? 1 : o < 0 ? -1 : 0);
    px(hx, top + 5, 1, 1, glove);
    px(hx + 1, top + 5, 1, 1, glove2);
  };
  const backArmX = left - 2;
  const frontArmX = right + 1;
  // Which of the player's arms faces the camera depends on facing; keep L/R consistent visually.
  const frontArm = facing === 1 ? L.arms.R : L.arms.L;
  const backArm = facing === 1 ? L.arms.L : L.arms.R;
  const forward = pose === 'block' || pose === 'stance';
  const throwing = pose === 'throw';
  const celebrate = pose === 'celebrate';

  // Back plate & back towel (behind everything)
  if (L.backPlate) px(left - 1, -10 + crouch, 1, 2, L.backPlate);
  if (L.towel && L.towel.pos === 'back') { px(left - 1, -9, 1, 3, pat(L.towel.colors, 0)); px(left - 1, -7, 1, 1, pat(L.towel.colors, 1)); }
  drawArm(backArm, backArmX, true, celebrate, false);

  // ---------------------------------------------------------------- legs
  const legA = [0, 1, 0, -1][phase];
  const legB = -legA;
  const lift = (o: number) => (run && o !== 0 ? (o > 0 ? -1 : 0) : 0);
  const drawLeg = (lx: number, lo: number, back: boolean) => {
    const dark = (c: string) => (back ? shade(c, -0.1) : c);
    const yl = lift(lo);
    // thigh (pants) drawn with hips; shin/sock rows -4,-3, ankle -2, cleat -1
    const sock = (r: number) => dark(pat(L.socks, r));
    const shin = (r: number) => (L.legsleeve ? dark(pat(L.legsleeve, r)) : sock(r));
    let r4 = shin(0);
    let r3 = shin(1);
    let r2 = sock(0);
    const sp = L.spats;
    if (sp) {
      const c = (i: number) => dark(pat(sp.colors, i));
      if (sp.level >= 1) r2 = c(0);
      if (sp.level >= 2) r3 = c(1);
      if (sp.level === 3) r4 = c(0);
    }
    const x0 = lx + lo;
    px(x0, -5 + yl, 2, 1, dark(L.pantsShade));
    px(x0, -4 + yl, 2, 1, r4);
    px(x0, -3 + yl, 2, 1, r3);
    px(x0, -2 + yl, 2, 1, r2);
    // Cleat
    const cc = L.cleats.colors.map(dark);
    const st = L.cleats.style;
    const toeX = x0 + 2;
    if (st === 'high') px(x0, -2 + yl, 2, 1, cc[0]);
    px(x0, -1 + yl, 2, 1, cc[0]);
    px(toeX, -1 + yl, 1, 1, st === 'low' || st === 'speed' ? pat(cc, 1) : cc[0]);
    if (st === 'modern' || st === 'mid' || st === 'speed') px(x0 + 1, -1 + yl, 1, 1, pat(cc, 1));
    if (st === 'retro') px(x0, -1 + yl, 1, 1, '#2a2a2a');
    if (sp && sp.level >= 4) { px(x0, -1 + yl, 2, 1, dark(pat(sp.colors, 0))); px(toeX, -1 + yl, 1, 1, cc[0]); }
  };
  drawLeg(-2, legA, true);
  drawLeg(0, legB, false);

  // ---------------------------------------------------------------- hips / pants
  const hy = -9 + crouch;
  px(left + 1, hy, W - 2, 4, L.pants);
  px(left + 1, hy + 3, W - 2, 1, L.pantsShade);
  px(left + 1, hy, W - 2, 1, shade(L.pants, -0.08)); // belt line
  if (L.handwarmer) px(right - 1, hy, 2, 2, pat(L.handwarmer, 0));
  if (L.towel && L.towel.pos !== 'back') {
    const tx = L.towel.pos === 'front' ? 0 : L.towel.pos === 'left' ? left : right - 1;
    px(tx, hy, 2, 2, pat(L.towel.colors, 0));
    px(tx, hy + 2, 1, 2, pat(L.towel.colors, 1));
  }

  // ---------------------------------------------------------------- torso (pads define the silhouette)
  const ty = -15 + crouch;
  px(left, ty, W, 2, L.jersey); // shoulder pads under the jersey
  px(left, ty, W, 1, shade(L.jersey, 0.08));
  px(left + 1, ty + 2, W - 2, 4, L.jersey);
  px(left + 1, ty + 5, W - 2, 1, L.jerseyShade);
  px(-1, ty + 2, 2, 2, L.numbers);
  // Neck / undershirt collar / neck roll
  if (L.neckRoll) px(left + 1, ty - 1, W - 2, 1, L.neckRoll);
  else px(-1, ty - 1, 2, 1, L.undershirt ? pat(L.undershirt, 0) : shade(L.skin, -0.1));

  // ---------------------------------------------------------------- front arm
  if (throwing) drawArm(frontArm, frontArmX, false, true, false);
  else drawArm(frontArm, frontArmX, false, celebrate, forward);

  // ---------------------------------------------------------------- helmet
  const grid = HELMETS[L.helmet.model] ?? HELMETS.classic;
  const hx0 = -4;
  const hy0 = ty - 7;
  let eyeCol = 5;
  let eyeRow = 2;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = grid[r][c];
      if (ch === '.') continue;
      let col = L.helmet.shell;
      if (ch === 'D') col = L.helmet.shade;
      else if (ch === 'L') col = L.helmet.logo ?? L.helmet.shell;
      else if (ch === 'F') col = L.skin;
      else if (ch === 'E') { eyeCol = c; eyeRow = r; col = shade(L.skin, -0.35); }
      else if (r >= grid.length - 2 && ch === 'S' && c < 3) col = L.helmet.shade;
      if (ch === 'S' && L.helmet.finish === 'chrome') col = r <= 1 ? L.helmet.hi : r >= 4 ? L.helmet.shade : L.helmet.shell;
      if (ch === 'S' && L.helmet.finish === 'metallic' && (r + c) % 3 === 0) col = L.helmet.hi;
      px(hx0 + c, hy0 + r, 1, 1, col);
    }
  }
  for (const [c, r, k] of HELMET_DETAILS[L.helmet.model] ?? []) {
    const col = k === 'H' ? L.helmet.hi : k === 'D' ? L.helmet.shade : k === 'V' ? '#15151c' : L.helmet.shell;
    px(hx0 + c, hy0 + r, 1, 1, col);
  }
  // Stripe across the crown
  if (L.helmet.stripe) {
    for (let r = 0; r < 3; r++) {
      const c = grid[r].indexOf('S') >= 0 ? Math.max(grid[r].indexOf('S'), 2) + (r === 0 ? 1 : 1) : 3;
      if (grid[r][c] === 'S' || grid[r][c] === 'D') px(hx0 + c, hy0 + r, 1, 1, L.helmet.stripe);
    }
  }
  // Gloss / pearl highlight
  if (L.helmet.finish !== 'matte' && L.helmet.finish !== 'chrome') {
    const r = grid[0].includes('S') ? 0 : 1;
    const c = grid[r].lastIndexOf('S');
    if (c > 0) px(hx0 + c - 1, hy0 + r, 1, 1, L.helmet.hi);
  }
  // Eye black
  if (L.eyeBlack) px(hx0 + eyeCol, hy0 + eyeRow + 1, 1, 1, '#111');
  // Visor across the eye opening (+ glint)
  if (L.visor) {
    px(hx0 + eyeCol, hy0 + eyeRow, 2, 1, pat(L.visor, 0));
    if (L.visor.length > 1) px(hx0 + eyeCol + 1, hy0 + eyeRow, 1, 1, pat(L.visor, 1));
    if (s >= 3) px(hx0 + eyeCol + 1, hy0 + eyeRow, 0.4, 0.4, 'rgba(255,255,255,0.8)');
  }
  // Mouthguard
  if (L.mouthguard) {
    const hang = L.mouthguard.hang && (opts.presnap || pose === 'stand' || pose === 'celebrate');
    if (hang) px(hx0 + 7, hy0 + 6, 1, 1, L.mouthguard.color);
    else if (L.mouthguard.style === 'lip') px(hx0 + 5, hy0 + 4, 2, 1, L.mouthguard.color);
    else px(hx0 + 6, hy0 + 4, 1, 1, L.mouthguard.color);
  }
  // Facemask
  for (const [c, r] of MASKS[L.mask.style] ?? MASKS.skill) px(hx0 + c, hy0 + r, 1, 1, L.mask.color);
}
