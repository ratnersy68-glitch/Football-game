/**
 * Optional real team artwork. If public/assets/teams/<id>/logo.png exists it is used everywhere;
 * otherwise callers fall back to an initials badge in school colors (never a fake logo).
 */
type Entry = { img: HTMLImageElement; ok: boolean | null; listeners: (() => void)[] };
const cache = new Map<string, Entry>();

export function teamImage(id: string, kind: 'logo' | 'helmet' = 'logo'): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  const key = `${id}/${kind}`;
  let e = cache.get(key);
  if (!e) {
    const img = new Image();
    e = { img, ok: null, listeners: [] };
    cache.set(key, e);
    const entry = e;
    img.onload = () => { entry.ok = img.naturalWidth > 0; entry.listeners.forEach((f) => f()); };
    img.onerror = () => { entry.ok = false; entry.listeners.forEach((f) => f()); };
    img.src = `assets/teams/${id}/${kind}.png`;
  }
  return e.ok ? e.img : null;
}

export function onTeamImage(id: string, kind: 'logo' | 'helmet', cb: () => void): () => void {
  teamImage(id, kind);
  const e = cache.get(`${id}/${kind}`)!;
  if (e.ok !== null) { cb(); return () => {}; }
  e.listeners.push(cb);
  return () => { e.listeners = e.listeners.filter((f) => f !== cb); };
}

export function teamImageStatus(id: string, kind: 'logo' | 'helmet' = 'logo'): boolean | null {
  teamImage(id, kind);
  return cache.get(`${id}/${kind}`)!.ok;
}

export function initials(name: string, abbr?: string): string {
  if (abbr && abbr.length <= 3) return abbr;
  return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}
