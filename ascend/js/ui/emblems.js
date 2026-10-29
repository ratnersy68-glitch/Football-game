// Procedural rank insignias: faceted metal, marble and crystal built from SVG polygons.
// Each rank has its own silhouette; complexity and luminosity increase with the tier.
import { RANKS } from '../engine/rank.js';

let gid = 0;

function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) {
  const A = hex2rgb(a); const B = hex2rgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
}
const pts = (arr) => arr.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const C = 100;

function regular(n, r, rot = -Math.PI / 2, cx = C, cy = C) {
  return Array.from({ length: n }, (_, i) => [cx + r * Math.cos(rot + (i * 2 * Math.PI) / n), cy + r * Math.sin(rot + (i * 2 * Math.PI) / n)]);
}
function scale(poly, s, cx = C, cy = C) { return poly.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s]); }

/** Facets: triangles from the centre to each edge, shaded by a light from the upper left. */
function facets(poly, c1, c2, { cx = C, cy = C, light = -2.3, contrast = 1 } = {}) {
  let out = '';
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]; const b = poly[(i + 1) % poly.length];
    const mx = (a[0] + b[0]) / 2 - cx; const my = (a[1] + b[1]) / 2 - cy;
    const ang = Math.atan2(my, mx);
    const t = Math.max(0, Math.min(1, 0.5 + 0.5 * Math.cos(ang - light) * contrast));
    out += `<polygon points="${pts([[cx, cy], a, b])}" fill="${mix(c1, c2, t)}"/>`;
  }
  return out;
}

const shield = (w = 70, top = 28, mid = 112, tip = 178) => [
  [C - w, top + 10], [C - w * 0.5, top], [C, top - 8], [C + w * 0.5, top], [C + w, top + 10],
  [C + w * 0.95, mid], [C + w * 0.55, mid + 40], [C, tip], [C - w * 0.55, mid + 40], [C - w * 0.95, mid],
];

function chevrons(n, color, { y = 108, w = 30, gap = 18, stroke = 7, glow } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const yy = y - i * gap + ((n - 1) * gap) / 2;
    s += `<polyline points="${pts([[C - w, yy + w * 0.55], [C, yy - w * 0.25], [C + w, yy + w * 0.55]])}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linejoin="miter" stroke-linecap="square"${glow ? ` filter="url(#${glow})"` : ''}/>`;
  }
  return s;
}

function crystal(cx, cy, w, h, light, dark) {
  const p = [[cx, cy - h], [cx + w, cy - h * 0.25], [cx + w * 0.6, cy + h], [cx - w * 0.6, cy + h], [cx - w, cy - h * 0.25]];
  return facets(p, dark, light, { cx, cy: cy - h * 0.05 }) + `<polygon points="${pts(p)}" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1"/>`;
}

function marblePattern(id, base = '#F4F5F7', vein = '#B9C0C8') {
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="200" height="200">
    <rect width="200" height="200" fill="${base}"/>
    <path d="M-10 60 C 40 40, 70 90, 120 70 S 190 40, 220 80" stroke="${vein}" stroke-width="1.6" fill="none" opacity=".7"/>
    <path d="M-10 130 C 30 120, 60 150, 110 140 S 170 110, 220 150" stroke="${vein}" stroke-width="1" fill="none" opacity=".55"/>
    <path d="M40 -10 C 60 40, 30 80, 70 120 S 90 180, 80 220" stroke="${vein}" stroke-width=".8" fill="none" opacity=".5"/>
    <path d="M150 -10 C 140 50, 170 90, 140 140" stroke="${vein}" stroke-width="1.2" fill="none" opacity=".45"/>
  </pattern>`;
}

/** Returns an SVG string for rank index `idx` (0 = Unranked … 9 = Ascendant). */
export function emblemSVG(idx, { size, title } = {}) {
  const r = RANKS[idx] || RANKS[0];
  const id = `e${++gid}`;
  const ice = '#78CFFF'; const iceSoft = '#B9E8FF';
  const glowF = `${id}g`;
  let defs = `<filter id="${glowF}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <radialGradient id="${id}core" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="${iceSoft}"/><stop offset="1" stop-color="${ice}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>`;
  let body = '';
  const rim = (poly, color = 'rgba(255,255,255,.55)', w = 1.2) => `<polygon points="${pts(poly)}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
  const sheen = (poly) => `<polygon points="${pts(poly)}" fill="url(#${id}sheen)"/>`;

  switch (r.id) {
    case 'unranked': {
      body = `<circle cx="100" cy="100" r="78" fill="none" stroke="#C9CED4" stroke-width="2" stroke-dasharray="3 7"/>
        <circle cx="100" cy="100" r="62" fill="none" stroke="#DADEE3" stroke-width="1.2"/>
        ${chevrons(1, '#AEB6BF', { stroke: 6, w: 26, y: 104 })}`;
      break;
    }
    case 'iron': {
      const o = regular(6, 80); const i = scale(o, 0.74);
      body = facets(o, '#1E2227', '#9AA3AC') + facets(i, '#3B424A', '#C4CBD2', { light: 0.9 }) + rim(o, 'rgba(255,255,255,.35)') + rim(i, 'rgba(0,0,0,.35)')
        + chevrons(1, '#E9EDF1', { stroke: 8, w: 28, y: 106 });
      break;
    }
    case 'bronze': {
      const o = shield(70); const i = scale(o, 0.78, C, 102);
      body = facets(o, '#4A2A15', '#E8B07E') + facets(i, '#7A4A2A', '#F2C9A2', { cy: 102, light: 0.9 }) + rim(o, 'rgba(255,236,214,.6)') + sheen(i)
        + chevrons(1, '#FFF3E6', { stroke: 8, y: 98 }) + `<rect x="74" y="128" width="52" height="6" fill="#FFF3E6" opacity=".9"/>`;
      break;
    }
    case 'silver': {
      const o = shield(74); const i = scale(o, 0.78, C, 102);
      const notchL = [[C - 74, 70], [C - 90, 84], [C - 72, 98]]; const notchR = notchL.map(([x, y]) => [2 * C - x, y]);
      body = `<polygon points="${pts(notchL)}" fill="#AEB8C2"/><polygon points="${pts(notchR)}" fill="#DCE3EA"/>`
        + facets(o, '#59636E', '#FFFFFF') + facets(i, '#8C97A3', '#F7F9FB', { cy: 102, light: 0.9 }) + rim(o, 'rgba(255,255,255,.9)') + sheen(i)
        + chevrons(2, '#3A434D', { stroke: 7, y: 104 });
      break;
    }
    case 'gold': {
      const o = shield(66, 34); const i = scale(o, 0.78, C, 104);
      const wingL = [[C - 60, 60], [C - 98, 46], [C - 86, 74], [C - 104, 84], [C - 84, 100], [C - 96, 118], [C - 62, 112]];
      const wingR = wingL.map(([x, y]) => [2 * C - x, y]);
      const crown = [[C - 16, 30], [C, 8], [C + 16, 30]];
      body = facets(wingL, '#7A5A12', '#F7E2A0', { cx: C - 80, cy: 84 }) + facets(wingR, '#7A5A12', '#F7E2A0', { cx: C + 80, cy: 84 })
        + `<polygon points="${pts(crown)}" fill="#F5DB8B"/>`
        + facets(o, '#6B4E0E', '#FFF0B8') + facets(i, '#A9821F', '#FFF4C9', { cy: 104, light: 0.9 }) + rim(o, 'rgba(255,248,220,.9)') + sheen(i)
        + chevrons(2, '#FFFDF4', { stroke: 7, y: 108 });
      break;
    }
    case 'platinum': {
      const o = regular(8, 80, -Math.PI / 2 + Math.PI / 8); const i = scale(o, 0.7);
      const spikes = [0, 1, 2, 3].map((k) => { const a = -Math.PI / 2 + (k * Math.PI) / 2; return `<polygon points="${pts([[C + 96 * Math.cos(a), C + 96 * Math.sin(a)], [C + 72 * Math.cos(a - 0.16), C + 72 * Math.sin(a - 0.16)], [C + 72 * Math.cos(a + 0.16), C + 72 * Math.sin(a + 0.16)]])}" fill="#D9EEF5"/>`; }).join('');
      body = spikes + facets(o, '#3E5762', '#F3FBFD') + facets(i, '#6E8E9B', '#FFFFFF', { light: 0.9 }) + rim(o, 'rgba(255,255,255,.9)')
        + `<circle cx="100" cy="100" r="34" fill="url(#${id}core)" opacity=".95"/>` + crystal(C, 102, 18, 30, '#FFFFFF', '#78CFFF');
      break;
    }
    case 'diamond': {
      const o = [[C, 8], [C + 70, 80], [C, 192], [C - 70, 80]];
      const crown = [[C - 70, 80], [C - 40, 44], [C, 8], [C + 40, 44], [C + 70, 80]];
      const side = (s) => crystal(C + s * 82, 112, 14, 26, '#E9F8FF', '#3D9AD6');
      body = side(-1) + side(1) + facets(o, '#1D5F93', '#E6F7FF', { cy: 92 }) + `<polygon points="${pts(crown)}" fill="rgba(255,255,255,.18)"/>`
        + `<polyline points="${pts([[C - 70, 80], [C + 70, 80]])}" stroke="rgba(255,255,255,.7)" stroke-width="1.2"/>`
        + `<polyline points="${pts([[C - 40, 44], [C - 22, 80], [C, 192], [C + 22, 80], [C + 40, 44]])}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1"/>`
        + rim(o, 'rgba(255,255,255,.95)', 1.5) + `<circle cx="100" cy="92" r="28" fill="url(#${id}core)"/>` + chevrons(1, '#FFFFFF', { stroke: 6, w: 20, y: 98, glow: glowF });
      break;
    }
    case 'elite': {
      const star = []; for (let k = 0; k < 16; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 8; const rr = k % 2 ? 46 : (k % 4 === 0 ? 92 : 70); star.push([C + rr * Math.cos(a), C + rr * Math.sin(a)]); }
      const sh = scale(shield(44, 52, 108, 160), 1, C, 100);
      body = facets(star, '#0B0D10', '#5E6A76') + `<polygon points="${pts(star)}" fill="none" stroke="${ice}" stroke-width="1.6" filter="url(#${glowF})"/>`
        + facets(sh, '#14181D', '#4C5763', { cy: 104 }) + rim(sh, ice, 1.4)
        + chevrons(2, ice, { stroke: 6, w: 22, gap: 15, y: 106, glow: glowF });
      break;
    }
    case 'titan': {
      defs += marblePattern(`${id}m`, '#E9ECEF', '#9AA3AD');
      const o = shield(78, 40, 110, 186); const i = scale(o, 0.66, C, 112);
      const crown = [[C - 64, 46], [C - 50, 10], [C - 30, 36], [C, 0], [C + 30, 36], [C + 50, 10], [C + 64, 46]];
      body = facets(crown, '#0A0C0F', '#7D8893', { cy: 34 }) + rim(crown, 'rgba(185,232,255,.7)')
        + facets(o, '#050607', '#4A535C', { cy: 108 }) + rim(o, '#B9C3CC', 2)
        + `<polygon points="${pts(i)}" fill="url(#${id}m)"/>` + rim(i, '#20252B', 2.5)
        + chevrons(3, '#090B0E', { stroke: 6, w: 22, gap: 13, y: 116 }) + `<polygon points="${pts(i)}" fill="url(#${id}sheen)" opacity=".7"/>`;
      break;
    }
    case 'ascendant': {
      defs += marblePattern(`${id}m`, '#FBFCFD', '#C3CBD3');
      let rays = '';
      for (let k = 0; k < 12; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 6; const l = k % 2 ? 84 : 98;
        rays += `<polygon points="${pts([[C + l * Math.cos(a), C + l * Math.sin(a)], [C + 54 * Math.cos(a - 0.12), C + 54 * Math.sin(a - 0.12)], [C + 54 * Math.cos(a + 0.12), C + 54 * Math.sin(a + 0.12)]])}" fill="${k % 2 ? iceSoft : '#FFFFFF'}" stroke="rgba(120,207,255,.6)" stroke-width=".8"/>`;
      }
      const ringO = regular(24, 62); const tall = [[C, 30], [C + 26, 92], [C, 168], [C - 26, 92]];
      body = `<circle cx="100" cy="100" r="96" fill="url(#${id}core)" opacity=".55"/>` + rays
        + `<polygon points="${pts(ringO)}" fill="url(#${id}m)" stroke="#78CFFF" stroke-width="1.5"/>`
        + `<circle cx="100" cy="100" r="50" fill="none" stroke="rgba(120,207,255,.55)" stroke-width="1"/>`
        + facets(tall, '#4FB6F0', '#FFFFFF', { cy: 92 }) + rim(tall, '#FFFFFF', 1.4)
        + `<polygon points="${pts(tall)}" fill="none" stroke="${ice}" stroke-width="2" filter="url(#${glowF})" opacity=".8"/>`;
      break;
    }
    default: break;
  }
  const s = size ? ` width="${size}" height="${size}"` : '';
  return `<svg class="emblem" viewBox="-6 -6 212 212"${s} role="img" aria-label="${title || r.name + ' emblem'}"><defs>${defs}</defs>${body}</svg>`;
}

export function emblem(idx, { cls = '', glow = false, float = false, size } = {}) {
  const r = RANKS[idx] || RANKS[0];
  return `<div class="emblem-wrap ${glow ? 'glow' : ''} ${float ? 'float' : ''} ${cls}" style="--glowc:${r.glow}">${emblemSVG(idx, { size })}</div>`;
}

/** Small medal for achievements. */
export function medalSVG(got) {
  const id = `m${++gid}`;
  const o = regular(6, 44, -Math.PI / 2, 50, 50);
  return `<svg class="medal" viewBox="0 0 100 100"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${got ? '#E6F7FF' : '#E7E9EC'}"/><stop offset="1" stop-color="${got ? '#78CFFF' : '#C9CED4'}"/></linearGradient></defs>
    <polygon points="${pts(o)}" fill="url(#${id})"/><polygon points="${pts(regular(6, 30, -Math.PI / 2, 50, 50))}" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>
    <polyline points="34,58 50,40 66,58" fill="none" stroke="${got ? '#090B0E' : '#9AA3AD'}" stroke-width="7"/></svg>`;
}
