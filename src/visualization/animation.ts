/**
 * Animation data model. A PlayAnimation is a pure description of motion derived from a PlayEvent:
 * every actor has a time-keyed path in world coordinates. World x: 0 = left goal line, 100 = right goal line
 * (end zones extend to -10 / 110). World y: 0 = far sideline, 53.33 = near sideline. z = height in yards.
 */
import type { Side } from '../models/types';

export interface Keyframe {
  t: number;
  x: number;
  y: number;
  z?: number;
}

export interface Actor {
  id: string;
  side: Side;
  number: number;
  role: string;
  path: Keyframe[];
  /** Down on the ground from this time (tackled / diving). */
  downAt?: number;
  highlight?: boolean;
}

export interface Marker {
  t: number;
  kind: 'snap' | 'throw' | 'catch' | 'handoff' | 'kick' | 'tackle' | 'touchdown' | 'flag' | 'whistle' | 'incomplete' | 'interception' | 'fumble';
}

export interface PlayAnimation {
  duration: number;
  actors: Actor[];
  ball: Keyframe[];
  markers: Marker[];
  /** World x of the line of scrimmage and first-down marker for broadcast lines (undefined = hide). */
  losX?: number;
  firstDownX?: number;
  /** Suggested camera zoom-out for long plays (1 = normal). */
  wide?: boolean;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Position along a keyframe path at time t (linear between keys, clamped at ends). */
export function sample(path: Keyframe[], t: number): { x: number; y: number; z: number } {
  if (path.length === 0) return { x: 50, y: 26.67, z: 0 };
  if (t <= path[0].t) return { x: path[0].x, y: path[0].y, z: path[0].z ?? 0 };
  for (let i = 1; i < path.length; i++) {
    const b = path[i];
    if (t <= b.t) {
      const a = path[i - 1];
      const span = b.t - a.t;
      const k = span <= 0 ? 1 : (t - a.t) / span;
      return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z ?? 0, b.z ?? 0, k) };
    }
  }
  const last = path[path.length - 1];
  return { x: last.x, y: last.y, z: last.z ?? 0 };
}
