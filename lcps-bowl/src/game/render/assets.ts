/**
 * Central team-logo registry used by every screen (React <TeamLogo>) and the canvas renderer.
 * The 17 LCPS schools use the supplied official school-site logos (src/assets/registry.ts), copied locally.
 * There is no invented fallback: a logo that fails to load shows an obvious MISSING LOGO label and is
 * recorded in missingAssets + console.error. Out-of-county filler opponents have no supplied logo at all.
 */
import { logoAsset } from '../../assets/registry';

type Entry = { img: HTMLImageElement; ok: boolean | null; listeners: (() => void)[] };
const cache = new Map<string, Entry>();
export const missingAssets: string[] = [];

export const logoPath = (id: string) => logoAsset(id)?.path ?? null;

export function teamImage(id: string, kind: 'logo' | 'helmet' = 'logo'): HTMLImageElement | null {
  if (typeof Image === 'undefined' || kind !== 'logo') return null;
  const path = logoPath(id);
  if (!path) return null;
  let e = cache.get(id);
  if (!e) {
    const img = new Image();
    e = { img, ok: null, listeners: [] };
    cache.set(id, e);
    const entry = e;
    img.onload = () => { entry.ok = img.naturalWidth > 0; entry.listeners.forEach((f) => f()); };
    img.onerror = () => {
      entry.ok = false;
      missingAssets.push(path);
      console.error(`[assets] MISSING team logo for ${id}: ${path}`);
      entry.listeners.forEach((f) => f());
    };
    img.src = path;
  }
  return e.ok ? e.img : null;
}

export function onTeamImage(id: string, _kind: 'logo' | 'helmet', cb: () => void): () => void {
  teamImage(id);
  const e = cache.get(id);
  if (!e || e.ok !== null) { cb(); return () => {}; }
  e.listeners.push(cb);
  return () => { e.listeners = e.listeners.filter((f) => f !== cb); };
}

/** true = loaded, false = failed (missing), null = still loading or no supplied logo for this team. */
export function teamImageStatus(id: string): boolean | null {
  teamImage(id);
  return cache.get(id)?.ok ?? null;
}

/** Fit a logo inside a box without changing its aspect ratio. */
export function fitRect(img: { naturalWidth: number; naturalHeight: number }, x: number, y: number, w: number, h: number) {
  const k = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * k;
  const dh = img.naturalHeight * k;
  return { x: x + (w - dw) / 2, y: y + (h - dh) / 2, w: dw, h: dh };
}

/**
 * Tiny in-game helmet mark: a faithful downsample of the full official logo (aspect kept, nothing cropped or invented).
 * Returns rows of hex colors ('' = transparent). It is a simplified school mark, not a verified helmet decal.
 */
const decalCache = new Map<string, string[][] | null>();
export function logoDecal(id: string, w: number, h: number): string[][] | null {
  const key = `${id}|${w}x${h}`;
  if (decalCache.has(key)) return decalCache.get(key)!;
  const img = teamImage(id);
  if (!img || typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  try {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const r = fitRect(img, 0, 0, w, h);
  ctx.drawImage(img, r.x, r.y, r.w, r.h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const rows: string[][] = [];
  for (let y = 0; y < h; y++) {
    const row: string[] = [];
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      row.push(data[i + 3] < 110 ? '' : `#${((1 << 24) | (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]).toString(16).slice(1)}`);
    }
    rows.push(row);
  }
  decalCache.set(key, rows);
  return rows;
  } catch {
    // e.g. a tainted canvas: draw helmets without the mark rather than failing
    decalCache.set(key, null);
    return null;
  }
}
