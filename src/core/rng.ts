/**
 * Seeded, serializable pseudo-random number generator (mulberry32).
 * Every simulation system takes an Rng so results are reproducible from a seed.
 */
export class Rng {
  private s: number;

  constructor(seed: number | string) {
    this.s = (typeof seed === 'string' ? hashString(seed) : seed) >>> 0;
    if (this.s === 0) this.s = 0x9e3779b9;
  }

  /** Current internal state (store it to resume the exact sequence later). */
  get state(): number {
    return this.s;
  }

  static fromState(state: number): Rng {
    const r = new Rng(1);
    r.s = state >>> 0;
    return r;
  }

  /** Uniform float in [0, 1). */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  float(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Rng.pick on empty array');
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** Pick a key from a { key: weight } map. */
  weightedKey<K extends string>(weights: Partial<Record<K, number>>): K {
    let total = 0;
    for (const k in weights) total += Math.max(0, weights[k] ?? 0);
    if (total <= 0) {
      const keys = Object.keys(weights) as K[];
      return this.pick(keys);
    }
    let r = this.next() * total;
    let last: K | undefined;
    for (const k in weights) {
      const w = Math.max(0, weights[k] ?? 0);
      if (w <= 0) continue;
      last = k;
      r -= w;
      if (r < 0) return k;
    }
    return last as K;
  }

  /** Pick an item using a weight function. */
  weighted<T>(items: readonly T[], weight: (item: T) => number): T {
    let total = 0;
    for (const it of items) total += Math.max(0, weight(it));
    if (total <= 0) return this.pick(items);
    let r = this.next() * total;
    for (const it of items) {
      r -= Math.max(0, weight(it));
      if (r < 0) return it;
    }
    return items[items.length - 1];
  }

  /** Normally distributed value (Box-Muller). */
  normal(mean = 0, sd = 1): number {
    let u = 0;
    while (u === 0) u = this.next();
    const v = this.next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /** Exponentially distributed value with the given mean. */
  exp(mean: number): number {
    let u = 0;
    while (u === 0) u = this.next();
    return -Math.log(u) * mean;
  }

  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Derive an independent child generator from this one's state and a label. */
  fork(label: string | number): Rng {
    return new Rng((hashString(String(label)) ^ Math.imul(this.s, 2654435761)) >>> 0);
  }
}

export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return h >>> 0;
}

export function seedFrom(...parts: (string | number)[]): number {
  return hashString(parts.join('|'));
}
