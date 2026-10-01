/** Field geometry: bases, base paths, default defensive alignment. */
import type { FieldPos, Stadium } from '../core/types';
import type { V2 } from '../core/math';
import { wallDistance } from '../data/stadiums';

const D = 90 / Math.SQRT2; // 63.64
export const BASES: V2[] = [
  { x: 0, z: 0 }, // home
  { x: D, z: D }, // 1B
  { x: 0, z: 2 * D }, // 2B
  { x: -D, z: D }, // 3B
  { x: 0, z: 0 }, // home again (path end)
];
export const MOUND: V2 = { x: 0, z: 60.5 };
export const BASE_NAMES = ['HOME', '1ST', '2ND', '3RD', 'HOME'];

/** Position along the base path. p = 0 at home, 90 at 1B, 180 at 2B, 270 at 3B, 360 home. */
export function pathPos(p: number): V2 {
  const q = Math.max(0, Math.min(360, p));
  const seg = Math.min(3, Math.floor(q / 90));
  const t = (q - seg * 90) / 90;
  const a = BASES[seg], b = BASES[seg + 1];
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
}

export function basePos(b: number): V2 {
  return BASES[Math.max(0, Math.min(4, b))];
}

const polar = (deg: number, r: number): V2 => ({ x: Math.sin((deg * Math.PI) / 180) * r, z: Math.cos((deg * Math.PI) / 180) * r });

/** Standard alignment, outfielders scaled to the park. */
export function defaultPositions(st: Stadium): Record<FieldPos, V2> {
  const of = (deg: number) => polar(deg, Math.min(wallDistance(st, deg) * 0.79, 335));
  return {
    P: { x: 0, z: 58 },
    C: { x: 0, z: -3.2 },
    '1B': polar(38, 110),
    '2B': polar(14, 148),
    SS: polar(-13, 148),
    '3B': polar(-35, 110),
    LF: of(-27),
    CF: of(0),
    RF: of(27),
  };
}

export const FIELD_POSITIONS: FieldPos[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
export const POS_NUMBER: Record<FieldPos, number> = { P: 1, C: 2, '1B': 3, '2B': 4, '3B': 5, SS: 6, LF: 7, CF: 8, RF: 9 };
