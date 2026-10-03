import type { PlayerData, Position } from './types';
import { ovr } from './players';

/** Ordered depth chart per position for one team for one game (injured players removed). */
export type DepthChart = Record<Position, PlayerData[]>;

export function buildDepthChart(roster: PlayerData[], order?: Partial<Record<Position, string[]>>): DepthChart {
  const d = { QB: [], RB: [], WR: [], TE: [], OL: [], DL: [], LB: [], CB: [], S: [], K: [] } as DepthChart;
  const healthy = roster.filter((p) => !p.injury || p.injury.weeks <= 0);
  for (const p of healthy) d[p.pos].push(p);
  for (const pos of Object.keys(d) as Position[]) {
    const custom = order?.[pos];
    if (custom && custom.length) {
      const rank = new Map(custom.map((id, i) => [id, i]));
      d[pos].sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999) || ovr(b) - ovr(a));
    } else {
      d[pos].sort((a, b) => ovr(b) - ovr(a));
    }
  }
  return d;
}

/** Fallback chains so a lineup can always be filled (high school kids play both ways). */
const FALLBACK: Record<Position, Position[]> = {
  QB: ['QB', 'RB', 'WR'],
  RB: ['RB', 'WR', 'CB', 'S'],
  WR: ['WR', 'CB', 'RB', 'TE', 'S'],
  TE: ['TE', 'OL', 'WR', 'DL', 'LB'],
  OL: ['OL', 'DL', 'TE'],
  DL: ['DL', 'OL', 'LB'],
  LB: ['LB', 'S', 'DL', 'RB'],
  CB: ['CB', 'S', 'WR', 'RB'],
  S: ['S', 'CB', 'LB', 'WR'],
  K: ['K', 'QB', 'WR'],
};

export class LineupPicker {
  private used = new Set<string>();
  constructor(private depth: DepthChart) {}
  take(pos: Position): PlayerData {
    for (const fp of FALLBACK[pos]) {
      for (const p of this.depth[fp]) {
        if (!this.used.has(p.id)) {
          this.used.add(p.id);
          return p;
        }
      }
    }
    // Absolute fallback: anyone not used, else reuse the first player.
    for (const list of Object.values(this.depth)) for (const p of list) if (!this.used.has(p.id)) { this.used.add(p.id); return p; }
    return Object.values(this.depth).flat()[0];
  }
  /** Take the fastest unused players among the given positions. */
  takeFastest(positions: Position[]): PlayerData {
    let best: PlayerData | null = null;
    for (const pos of positions) for (const p of this.depth[pos]) {
      if (this.used.has(p.id)) continue;
      if (!best || p.attrs.spd > best.attrs.spd) best = p;
    }
    if (best) { this.used.add(best.id); return best; }
    return this.take(positions[0]);
  }
}
