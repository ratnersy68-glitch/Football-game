// Procedural white-marble texture (turbulence-warped veins), generated once and cached.
const CACHE_KEY = 'ascend:marble:v3';

function makeNoise(seed) {
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = seed;
  for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const fade = (t) => t * t * (3 - 2 * t);
  const val = (x, y) => perm[(x & 255) + perm[y & 255]] / 255;
  return (x, y) => {
    const xi = Math.floor(x); const yi = Math.floor(y);
    const xf = x - xi; const yf = y - yi;
    const a = val(xi, yi); const b = val(xi + 1, yi); const c = val(xi, yi + 1); const d = val(xi + 1, yi + 1);
    const u = fade(xf); const v = fade(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

function render(size, dark) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(size, size);
  const n = makeNoise(dark ? 91 : 7);
  const turb = (x, y) => { let t = 0; let f = 1; let a = 1; for (let o = 0; o < 5; o++) { t += a * n(x * f, y * f); f *= 2; a *= 0.5; } return t; };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 4; const ny = y / size * 4;
      const t = turb(nx, ny);
      const v1 = Math.abs(Math.sin((nx * 1.2 + ny * 2.1 + t * 3.2) * 1.6));
      const v2 = Math.abs(Math.sin((nx * 2.6 - ny * 0.8 + t * 4.4) * 2.3));
      const vein = Math.pow(1 - v1, 9) * 0.9 + Math.pow(1 - v2, 14) * 0.5;
      const cloud = (n(nx * 6, ny * 6) - 0.5) * 0.05;
      const i = (y * size + x) * 4;
      if (dark) {
        const base = 12 + cloud * 120;
        const l = base + vein * 55;
        img.data[i] = l * 0.92; img.data[i + 1] = l * 0.98; img.data[i + 2] = l * 1.08;
      } else {
        const base = 246 + cloud * 160;
        const l = base - vein * 34;
        img.data[i] = l - vein * 6; img.data[i + 1] = l - vein * 3; img.data[i + 2] = l;
      }
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL('image/jpeg', 0.82);
}

export function applyMarble() {
  const root = document.documentElement;
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { cached = null; }
  const set = (c) => {
    root.style.setProperty('--marble-img', `url(${c.light})`);
    root.style.setProperty('--marble-dark-img', `url(${c.dark})`);
  };
  if (cached?.light) { set(cached); return; }
  const go = () => {
    try {
      const c = { light: render(384, false), dark: render(384, true) };
      set(c);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* storage full: regenerate next time */ }
    } catch { /* canvas unavailable */ }
  };
  (window.requestIdleCallback || ((f) => setTimeout(f, 60)))(go);
}
