import { ARCHETYPES, DEF_SCHEMES, OFF_SCHEMES, POSITIONS } from '../data';
import type { DefScheme, OffScheme, Player, Position } from '../models/types';
import { clamp } from '../core/util';

/** Weighted overall from position-specific attributes (weights live in data/positions.json). */
export function computeOverall(pos: Position, attrs: Record<string, number>): number {
  const w = POSITIONS[pos].weights;
  let total = 0;
  let wsum = 0;
  for (const k in w) {
    total += (attrs[k] ?? 50) * w[k];
    wsum += w[k];
  }
  return clamp(Math.round(total / wsum), 25, 99);
}

/** 0..1 fit of a player's archetype in the team's scheme (1 = ideal, 0.75 when the scheme is indifferent). */
export function schemeFit(player: Player, off: OffScheme, def: DefScheme): number {
  const side = POSITIONS[player.position].side;
  const table = side === 'offense' ? OFF_SCHEMES[off]?.fit : side === 'defense' ? DEF_SCHEMES[def]?.fit : undefined;
  const posFit = table?.[player.position];
  if (!posFit) return 0.8;
  return posFit[player.archetype] ?? 0.6;
}

export function archetypesFor(pos: Position) {
  return ARCHETYPES[pos];
}

export function starsLabel(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars));
}

export const YEAR_LABELS: Record<number, string> = { 1: 'FR', 2: 'SO', 3: 'JR', 4: 'SR' };

export function classLabel(p: Pick<Player, 'year' | 'redshirted'>): string {
  return (p.redshirted ? 'RS ' : '') + YEAR_LABELS[p.year];
}
