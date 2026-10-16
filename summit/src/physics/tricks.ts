/**
 * Trick tracking, naming and scoring. The physics layer feeds real rotation integrals
 * (spin/flip angles, geometric inversions, cork tilt, grab time); this module turns a
 * landed air into a named, scored trick and manages the combo chain.
 */

export const GRABS = ['', 'Safety', 'Mute', 'Tail', 'Japan', 'Nose', 'Method', 'Stalefish', 'Truck Driver'] as const;

export interface AirData {
  spinAccum: number;
  flipAccum: number;
  inversions: number;
  offAxisTime: number;
  grabTimes: number[];
  air: number;
  height: number;
  switchTakeoff: boolean;
  bigAir: boolean;
}

export type Landing = 'clean' | 'sketchy' | 'crash';

export interface TrickResult {
  name: string;
  score: number;
  spin: number;
  inversions: number;
  grab: string | null;
  air: number;
  height: number;
  landing: Landing;
  kind: 'air' | 'grind';
}

export interface FeedItem { id: number; text: string; sub?: string; score: number; t: number; kind: 'trick' | 'combo' | 'bust' | 'info' }

export function newAirData(switchTakeoff = false): AirData {
  return { spinAccum: 0, flipAccum: 0, inversions: 0, offAxisTime: 0, grabTimes: new Array(GRABS.length).fill(0), air: 0, height: 0, switchTakeoff, bigAir: false };
}

/** Names and scores an air. Returns null for trivial hops. */
export function classifyAir(a: AirData): { name: string; base: number; spin: number; grab: string | null } | null {
  const spinAbs = Math.abs(a.spinAccum);
  let spinDeg = Math.round(spinAbs / Math.PI) * 180;
  if (spinAbs < Math.PI * 0.72) spinDeg = 0;
  const inv = a.inversions;
  const flipDir = Math.sign(a.flipAccum);
  const flips = Math.round(Math.abs(a.flipAccum) / (Math.PI * 2));
  const offAxis = a.offAxisTime > 0.15;
  let gi = 0, gt = 0;
  for (let i = 1; i < a.grabTimes.length; i++) if (a.grabTimes[i] > gt) { gt = a.grabTimes[i]; gi = i; }
  const grab = gt >= 0.2 ? GRABS[gi] : null;
  const prefix = inv <= 1 ? '' : inv === 2 ? 'Double ' : inv === 3 ? 'Triple ' : 'Quad ';
  let name = '';
  if (inv === 0) {
    if (spinDeg >= 180) name = `${spinDeg}`;
  } else if (spinDeg <= 180) {
    name = `${prefix}${flipDir >= 0 ? 'Frontflip' : 'Backflip'}`;
  } else if (offAxis) {
    name = flipDir > 0 && Math.abs(a.flipAccum) > Math.PI * 0.6 ? `${prefix}Bio ${spinDeg}` : `${prefix}Cork ${spinDeg}`;
  } else {
    name = `${prefix}${flipDir >= 0 ? 'Misty' : 'Rodeo'} ${spinDeg}`;
  }
  if (a.switchTakeoff && spinDeg >= 180) name = `Switch ${name}`;
  if (grab) name = name ? `${name} ${grab}` : `${grab} Grab`;
  if (!name) {
    if (a.air > 0.9 || a.height > 2.5) name = a.height > 6 ? 'Huge Air' : 'Straight Air';
    else return null;
  }
  const base =
    (spinDeg / 180) * 140 +
    inv * 450 +
    flips * 60 +
    (offAxis && inv > 0 ? 160 * inv : 0) +
    Math.min(2, gt) * 450 * (gt >= 0.2 ? 1 : 0) +
    Math.max(0, a.air - 0.45) * 130 +
    Math.min(30, a.height) * 22 +
    (a.switchTakeoff && spinDeg >= 180 ? 120 : 0);
  return { name, base: Math.round(base), spin: spinDeg, grab };
}

export class TrickSystem {
  total = 0;
  comboPot = 0;
  comboMult = 0;
  comboTimer = 0;
  comboTricks: string[] = [];
  history: string[] = [];
  feed: FeedItem[] = [];
  best: TrickResult | null = null;
  results: TrickResult[] = [];
  bestCombo = 0;
  private nextId = 1;
  time = 0;
  /** Callback when combos bank (for objectives / stats). */
  onBank?: (score: number, tricks: string[]) => void;
  onTrick?: (r: TrickResult) => void;

  reset() {
    this.total = 0; this.comboPot = 0; this.comboMult = 0; this.comboTimer = 0; this.comboTricks = [];
    this.history = []; this.feed = []; this.best = null; this.results = []; this.bestCombo = 0;
  }

  private repeatFactor(name: string): number {
    let n = 0;
    for (const h of this.history.slice(-10)) if (h === name) n++;
    return Math.pow(0.7, n);
  }

  push(text: string, score: number, kind: FeedItem['kind'], sub?: string) {
    this.feed.push({ id: this.nextId++, text, sub, score, t: this.time, kind });
    if (this.feed.length > 8) this.feed.shift();
  }

  landAir(a: AirData, landing: Landing): TrickResult | null {
    const c = classifyAir(a);
    if (!c) return null;
    if (landing === 'crash') {
      this.bust(c.name);
      return { name: c.name, score: 0, spin: c.spin, inversions: a.inversions, grab: c.grab, air: a.air, height: a.height, landing, kind: 'air' };
    }
    const rep = this.repeatFactor(c.name);
    const score = Math.round(c.base * (landing === 'clean' ? 1 : 0.5) * rep);
    this.history.push(c.name);
    const r: TrickResult = { name: c.name, score, spin: c.spin, inversions: a.inversions, grab: c.grab, air: a.air, height: a.height, landing, kind: 'air' };
    this.addToCombo(r, rep < 1 ? `repeat ×${rep.toFixed(2)}` : landing === 'sketchy' ? 'sketchy landing' : 'clean landing');
    return r;
  }

  landGrind(name: string, seconds: number, quality: number, bonus: number): TrickResult | null {
    if (seconds < 0.25) return null;
    const rep = this.repeatFactor(name);
    const score = Math.round((seconds * 380 + bonus) * (0.6 + 0.4 * quality) * rep);
    this.history.push(name);
    const r: TrickResult = { name, score, spin: 0, inversions: 0, grab: null, air: 0, height: 0, landing: 'clean', kind: 'grind' };
    this.addToCombo(r, `${seconds.toFixed(1)}s grind`);
    return r;
  }

  private addToCombo(r: TrickResult, sub: string) {
    this.comboPot += r.score;
    this.comboMult = Math.min(10, this.comboMult + 1);
    this.comboTimer = 2.6;
    this.comboTricks.push(r.name);
    this.results.push(r);
    if (!this.best || r.score > this.best.score) this.best = r;
    this.push(r.name, r.score, 'trick', sub);
    this.onTrick?.(r);
  }

  /** Crash: the unbanked combo is lost. */
  bust(name?: string) {
    if (this.comboPot > 0 || name) this.push(name ? `Bailed: ${name}` : 'Combo lost', 0, 'bust');
    this.comboPot = 0; this.comboMult = 0; this.comboTimer = 0; this.comboTricks = [];
  }

  /** Called every frame; banks the combo after the rider has been on the snow long enough. */
  tick(dt: number, grounded: boolean) {
    this.time += dt;
    if (this.comboPot <= 0) return;
    if (grounded) this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.bank();
  }

  bank() {
    if (this.comboPot <= 0) return;
    const banked = this.comboPot * Math.max(1, this.comboMult);
    this.total += banked;
    this.bestCombo = Math.max(this.bestCombo, banked);
    if (this.comboMult > 1) this.push(`${this.comboMult}x Combo`, banked, 'combo', this.comboTricks.slice(-3).join(' + '));
    this.onBank?.(banked, this.comboTricks.slice());
    this.comboPot = 0; this.comboMult = 0; this.comboTricks = [];
  }
}
