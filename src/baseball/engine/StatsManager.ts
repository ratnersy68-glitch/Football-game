/** StatsManager: box-score lines for every player in the game, plus season-style card stats. */
import type { Player } from '../core/types';

export interface BatLine { PA: number; AB: number; R: number; H: number; D: number; T: number; HR: number; RBI: number; BB: number; SO: number; HBP: number; SF: number; SB: number; CS: number; LOB: number }
export interface PitchLine { outs: number; H: number; R: number; ER: number; BB: number; SO: number; HR: number; HBP: number; pitches: number; strikes: number; BF: number; dec: '' | 'W' | 'L' | 'S' }

const emptyBat = (): BatLine => ({ PA: 0, AB: 0, R: 0, H: 0, D: 0, T: 0, HR: 0, RBI: 0, BB: 0, SO: 0, HBP: 0, SF: 0, SB: 0, CS: 0, LOB: 0 });
const emptyPitch = (): PitchLine => ({ outs: 0, H: 0, R: 0, ER: 0, BB: 0, SO: 0, HR: 0, HBP: 0, pitches: 0, strikes: 0, BF: 0, dec: '' });

export class StatsManager {
  bat = new Map<string, BatLine>();
  pitch = new Map<string, PitchLine>();
  /** Order players appeared (for the box score). */
  batOrder: { home: string[]; away: string[] } = { home: [], away: [] };
  pitchOrder: { home: string[]; away: string[] } = { home: [], away: [] };

  b(id: string): BatLine {
    let l = this.bat.get(id);
    if (!l) { l = emptyBat(); this.bat.set(id, l); }
    return l;
  }
  p(id: string): PitchLine {
    let l = this.pitch.get(id);
    if (!l) { l = emptyPitch(); this.pitch.set(id, l); }
    return l;
  }
  addBatter(side: 'home' | 'away', id: string) {
    if (!this.batOrder[side].includes(id)) this.batOrder[side].push(id);
    this.b(id);
  }
  addPitcher(side: 'home' | 'away', id: string) {
    if (!this.pitchOrder[side].includes(id)) this.pitchOrder[side].push(id);
    this.p(id);
  }
}

export function ipString(outs: number): string {
  return `${Math.floor(outs / 3)}.${outs % 3}`;
}

export function avgString(h: number, ab: number): string {
  if (ab === 0) return '.000';
  const v = h / ab;
  return v >= 1 ? '1.000' : v.toFixed(3).replace(/^0/, '');
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/** Season-style numbers for broadcast cards, derived from ratings (deterministic per player). */
export function seasonBatting(p: Player) {
  const r = p.ratings;
  const con = (r.contactR * 2 + r.contactL) / 3;
  const pow = (r.powerR * 2 + r.powerL) / 3;
  const j = hash(p.id) - 0.5;
  const avg = Math.max(0.18, Math.min(0.335, 0.168 + con * 0.0014 + j * 0.02));
  const hr = Math.max(0, Math.round((pow - 38) * 0.72 + j * 6));
  const rbi = Math.round(hr * 2.1 + con * 0.45 + j * 10);
  return { avg: avg.toFixed(3).replace(/^0/, ''), hr, rbi };
}

export function seasonPitching(p: Player) {
  const pr = p.pitcher!;
  const j = hash(p.id) - 0.5;
  const score = (pr.control + pr.break + (pr.velocity - 86) * 3) / 3; // ~60-85
  const era = Math.max(1.9, Math.min(5.8, 7.4 - score * 0.06 + j * 0.6));
  const whip = Math.max(0.85, Math.min(1.6, 1.85 - score * 0.0095 + j * 0.08));
  const starter = pr.role === 'SP';
  const ip = starter ? 120 + pr.stamina * 0.7 : 55 + pr.stamina * 0.3;
  const so = Math.round(ip * (0.6 + pr.break / 120 + (pr.velocity - 90) * 0.03));
  const w = starter ? Math.round(ip / 16 + (5 - era) * 1.6 + j * 2) : Math.round(2 + j * 4 + 2);
  const l = starter ? Math.max(2, Math.round(ip / 20 + (era - 3) * 1.5 - j * 2)) : Math.max(0, Math.round(3 - j * 3));
  return { era: era.toFixed(2), whip: whip.toFixed(2), so, w: Math.max(0, w), l };
}
