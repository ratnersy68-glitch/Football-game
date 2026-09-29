/** Loads team logo images once for canvas drawing. Failed/blocked logos simply stay unavailable. */
import { logoUrl } from '../data';

const cache = new Map<string, HTMLImageElement | null>();
let enabled = true;

export function setLogosEnabled(on: boolean): void {
  enabled = on;
}
export function logosEnabled(): boolean {
  return enabled;
}

/** Returns a ready image or null (kicks off loading on first request). */
export function logoImage(teamId: string): HTMLImageElement | null {
  if (!enabled || typeof Image === 'undefined') return null;
  const url = logoUrl(teamId);
  if (!url) return null;
  if (cache.has(url)) {
    const img = cache.get(url)!;
    return img && img.complete && img.naturalWidth > 0 ? img : null;
  }
  const img = new Image();
  img.decoding = 'async';
  img.referrerPolicy = 'no-referrer';
  img.onerror = () => cache.set(url, null);
  img.src = url;
  cache.set(url, img);
  return null;
}

const failed = new Set<string>();
export function markLogoFailed(url: string): void {
  failed.add(url);
}
export function logoFailed(url: string): boolean {
  return failed.has(url);
}
