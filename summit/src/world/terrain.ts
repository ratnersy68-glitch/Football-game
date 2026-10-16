/**
 * Terrain: shaped heightfield (bicubic sampled) + analytic micro detail, moguls and park
 * features. Pure math so the same surface drives physics, AI, rendering and tests.
 */
import { Noise2D } from '../core/noise';
import { FeatureSet } from './features';
import type { Lake, Surface, Trail } from './types';

export interface SnowConditions {
  /** 0..1 depth of fresh snow (powder drag + deeper tracks). */
  powder: number;
  /** 0..1 icy-ness (more ice patches on steeps, lower grip). */
  ice: number;
  /** Slush below this fraction of vertical (0 = none). */
  slushLine: number;
  label: string;
}

export const DEFAULT_CONDITIONS: SnowConditions = { powder: 0.5, ice: 0.3, slushLine: 0, label: 'Packed Powder' };

export const SURFACE_PHYS: Record<Surface, { mu: number; grip: number; drag: number; label: string }> = {
  groomed: { mu: 0.045, grip: 1.0, drag: 0.0, label: 'Groomed corduroy' },
  hardpack: { mu: 0.04, grip: 0.85, drag: 0.0, label: 'Hardpack' },
  ice: { mu: 0.022, grip: 0.42, drag: 0.0, label: 'Ice' },
  powder: { mu: 0.06, grip: 0.8, drag: 0.32, label: 'Powder' },
  slush: { mu: 0.12, grip: 0.9, drag: 0.12, label: 'Slush' },
  moguls: { mu: 0.05, grip: 0.9, drag: 0.02, label: 'Moguls' },
  rock: { mu: 0.35, grip: 0.55, drag: 0.1, label: 'Rock' },
};

export class Terrain {
  readonly nx: number;
  readonly nz: number;
  readonly cell: number;
  readonly x0: number;
  readonly z0: number;
  readonly H: Float32Array;
  readonly trailId: Int16Array;
  readonly trailW: Float32Array;
  trails: Trail[] = [];
  lakes: Lake[] = [];
  readonly features = new FeatureSet();
  conditions: SnowConditions = { ...DEFAULT_CONDITIONS };
  baseAlt = 0;
  vertical = 1;
  /** World-space bounds of the skiable resort (x in [-halfW, halfW], z in [0, length]). */
  halfW = 1000;
  length = 2000;
  glacierLine = Infinity;
  private detail: Noise2D;

  constructor(nx: number, nz: number, cell: number, x0: number, z0: number, seed: string) {
    this.nx = nx; this.nz = nz; this.cell = cell; this.x0 = x0; this.z0 = z0;
    this.H = new Float32Array(nx * nz);
    this.trailId = new Int16Array(nx * nz).fill(-1);
    this.trailW = new Float32Array(nx * nz);
    this.detail = new Noise2D(seed + ':detail');
  }

  get maxX() { return this.x0 + (this.nx - 1) * this.cell; }
  get maxZ() { return this.z0 + (this.nz - 1) * this.cell; }

  idx(i: number, j: number) { return j * this.nx + i; }

  private h(i: number, j: number): number {
    i = i < 0 ? 0 : i >= this.nx ? this.nx - 1 : i;
    j = j < 0 ? 0 : j >= this.nz ? this.nz - 1 : j;
    return this.H[j * this.nx + i];
  }

  /** Bicubic (Catmull-Rom) sampled grid height — C1 continuous so normals are smooth. */
  gridHeight(x: number, z: number): number {
    const fx = (x - this.x0) / this.cell, fz = (z - this.z0) / this.cell;
    const i = Math.floor(fx), j = Math.floor(fz);
    const tx = fx - i, tz = fz - j;
    const rows = [0, 0, 0, 0];
    for (let k = -1; k <= 2; k++) {
      const p0 = this.h(i - 1, j + k), p1 = this.h(i, j + k), p2 = this.h(i + 1, j + k), p3 = this.h(i + 2, j + k);
      rows[k + 1] = cr(p0, p1, p2, p3, tx);
    }
    return cr(rows[0], rows[1], rows[2], rows[3], tz);
  }

  /** Bilinear trail weight (0..1) and nearest trail id at xz. */
  trailAt(x: number, z: number): { id: number; w: number } {
    const fx = (x - this.x0) / this.cell, fz = (z - this.z0) / this.cell;
    const i = Math.floor(fx), j = Math.floor(fz);
    if (i < 0 || j < 0 || i >= this.nx - 1 || j >= this.nz - 1) return { id: -1, w: 0 };
    const tx = fx - i, tz = fz - j;
    const k = j * this.nx + i;
    const W = this.trailW;
    const w = (W[k] * (1 - tx) + W[k + 1] * tx) * (1 - tz) + (W[k + this.nx] * (1 - tx) + W[k + this.nx + 1] * tx) * tz;
    const ni = Math.round(fx), nj = Math.round(fz);
    return { id: this.trailId[nj * this.nx + ni], w };
  }

  /** Micro relief + moguls (no features). */
  detailHeight(x: number, z: number): number {
    const t = this.trailAt(x, z);
    const n = this.detail.noise(x / 7, z / 7);
    let h = n * (0.16 * (1 - t.w) + 0.03 * t.w);
    if (t.id >= 0 && t.w > 0.02) {
      const tr = this.trails[t.id];
      if (tr && tr.moguls) h += this.mogul(x, z) * smoothW(t.w);
    }
    return h;
  }

  mogul(x: number, z: number): number {
    const c = 0.866, s = 0.5;
    const warp = this.detail.noise(x / 23 + 50, z / 23) * 0.9;
    const u = (x * c + z * s) / 7.2 + warp;
    const v = (-x * s + z * c) / 6.4 - warp * 0.5;
    const b = Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI * 2);
    return 0.62 * b;
  }

  /** Rideable snow surface height without features (terrain mesh). */
  baseHeight(x: number, z: number): number {
    return this.gridHeight(x, z) + this.detailHeight(x, z);
  }

  /** Full collision surface height. */
  height(x: number, z: number): number {
    return this.gridHeight(x, z) + this.detailHeight(x, z) + this.features.height(x, z);
  }

  /** Surface normal via central differences (writes into out = [x,y,z]). */
  normal(x: number, z: number, out: { x: number; y: number; z: number }, eps = 0.45) {
    const hl = this.height(x - eps, z), hr = this.height(x + eps, z);
    const hd = this.height(x, z - eps), hu = this.height(x, z + eps);
    let nx = hl - hr, ny = 2 * eps, nz = hd - hu;
    const l = Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx /= l; ny /= l; nz /= l;
    out.x = nx; out.y = ny; out.z = nz;
    return out;
  }

  /** Smoothed slope (gradient magnitude) from the grid only. */
  gridSlope(x: number, z: number, eps = 3): number {
    const dx = (this.gridHeight(x + eps, z) - this.gridHeight(x - eps, z)) / (2 * eps);
    const dz = (this.gridHeight(x, z + eps) - this.gridHeight(x, z - eps)) / (2 * eps);
    return Math.sqrt(dx * dx + dz * dz);
  }

  lakeAt(x: number, z: number): Lake | null {
    for (const l of this.lakes) if ((x - l.x) ** 2 + (z - l.z) ** 2 < l.r * l.r) return l;
    return null;
  }

  surfaceAt(x: number, z: number): Surface {
    if (this.features.height(x, z) > 0.05) return 'hardpack';
    if (this.lakes.length && this.lakeAt(x, z)) return 'ice';
    const c = this.conditions;
    const alt = this.gridHeight(x, z);
    const slushy = c.slushLine > 0 && alt < this.baseAlt + c.slushLine * this.vertical;
    const t = this.trailAt(x, z);
    if (t.id >= 0 && t.w > 0.45) {
      const tr = this.trails[t.id];
      if (tr.moguls) return 'moguls';
      if (tr.groomed) {
        if (slushy) return 'slush';
        const iceAmt = Math.min(0.9, tr.icy * 0.7 + c.ice * 0.4);
        if (iceAmt > 0.05 && this.detail.noise(x / 31 + 200, z / 31) > 1 - iceAmt * 1.1) return 'ice';
        return 'groomed';
      }
      if (alt > this.glacierLine) return 'hardpack';
      return c.powder > 0.25 ? 'powder' : 'hardpack';
    }
    const s = this.gridSlope(x, z);
    if (s > 1.25) return 'rock';
    if (slushy) return 'slush';
    if (alt > this.glacierLine) return 'hardpack';
    return c.powder > 0.15 || s < 0.9 ? 'powder' : 'hardpack';
  }

  inGrid(x: number, z: number): boolean {
    return x > this.x0 + this.cell * 2 && x < this.maxX - this.cell * 2 && z > this.z0 + this.cell * 2 && z < this.maxZ - this.cell * 2;
  }
}

function smoothW(w: number) {
  const t = Math.min(1, Math.max(0, (w - 0.15) / 0.6));
  return t * t * (3 - 2 * t);
}

function cr(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
