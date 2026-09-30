/**
 * Playbook data for the playable game: formations, route trees, offensive pass concepts and defensive calls.
 * Route points are (downfield, outside) offsets in yards from the receiver's alignment; "outside" is toward
 * the receiver's own sideline, so every route mirrors automatically by side.
 */

export type Slot = 'X' | 'Z' | 'H' | 'Y' | 'RB';
export const SLOTS: Slot[] = ['X', 'Z', 'H', 'Y', 'RB'];
/** Receiver button order shown to the player (1..5). */
export const BUTTON_ORDER: Slot[] = ['X', 'H', 'Y', 'Z', 'RB'];

export interface RouteDef {
  name: string;
  points: [number, number][];
  /** Keep running straight after the last point (vertical routes) instead of settling. */
  continues?: boolean;
  /** Sit down in the zone at the end of the route. */
  settle?: boolean;
}

export const ROUTES: Record<string, RouteDef> = {
  go: { name: 'Go', points: [[6, 0.5], [45, 1.5]], continues: true },
  seam: { name: 'Seam', points: [[45, 0]], continues: true },
  slant: { name: 'Slant', points: [[2, 0], [8, -6], [16, -14]], continues: true },
  quick_out: { name: 'Quick Out', points: [[5, 0], [5.5, 7]], continues: true },
  out: { name: 'Out', points: [[10, 0], [10.5, 9]], continues: true },
  hitch: { name: 'Hitch', points: [[6, 0], [5, -0.5]], settle: true },
  curl: { name: 'Curl', points: [[12, 0], [10.5, -1.5]], settle: true },
  comeback: { name: 'Comeback', points: [[15, 0], [12.5, 3]], settle: true },
  dig: { name: 'Dig', points: [[12, 0], [12.5, -14], [13, -26]], continues: true },
  in: { name: 'In', points: [[6, 0], [6.5, -12], [7, -24]], continues: true },
  drag: { name: 'Drag', points: [[2, -2], [3, -16], [3.5, -32]], continues: true },
  post: { name: 'Post', points: [[12, 0], [34, -12]], continues: true },
  corner: { name: 'Corner', points: [[11, 0], [26, 11]], continues: true },
  flat: { name: 'Flat', points: [[1.5, 3], [3, 10], [4, 16]], continues: true },
  wheel: { name: 'Wheel', points: [[1, 5], [4, 9], [30, 10]], continues: true },
  checkdown: { name: 'Checkdown', points: [[2, 2], [4, 3]], settle: true },
  swing: { name: 'Swing', points: [[-1, 4], [1, 9], [3, 12]], continues: true },
  block: { name: 'Pass Pro', points: [] },
  block_release: { name: 'Block & Release', points: [[3, 2], [5, 4]], settle: true },
};

export interface FormationDef {
  name: string;
  shotgun: boolean;
  /** Absolute lateral landmarks for wide receivers; `dy` for the rest is relative to the ball. */
  align: Record<Slot, { dx: number; dy?: number; y?: number; side: -1 | 1 }>;
}

// side: -1 = left (toward y=0), +1 = right (toward y=53.33)
export const FORMATIONS: Record<string, FormationDef> = {
  gun_doubles: {
    name: 'Shotgun Doubles',
    shotgun: true,
    align: {
      X: { dx: -0.6, y: 7, side: -1 },
      Z: { dx: -0.6, y: 46.3, side: 1 },
      H: { dx: -1.2, dy: -8, side: -1 },
      Y: { dx: -1.1, dy: 4.2, side: 1 },
      RB: { dx: -5, dy: 1.6, side: 1 },
    },
  },
  gun_trips: {
    name: 'Shotgun Trips Right',
    shotgun: true,
    align: {
      X: { dx: -0.6, y: 7, side: -1 },
      Z: { dx: -0.6, y: 46.3, side: 1 },
      H: { dx: -1.2, dy: 11, side: 1 },
      Y: { dx: -1.2, dy: 6, side: 1 },
      RB: { dx: -5, dy: -1.6, side: -1 },
    },
  },
  singleback: {
    name: 'Singleback',
    shotgun: false,
    align: {
      X: { dx: -0.6, y: 8, side: -1 },
      Z: { dx: -0.6, y: 45.3, side: 1 },
      H: { dx: -1.2, dy: -9, side: -1 },
      Y: { dx: -1.1, dy: 4.2, side: 1 },
      RB: { dx: -7, dy: 0, side: 1 },
    },
  },
};

export interface PlayDef {
  id: string;
  name: string;
  formation: string;
  routes: Record<Slot, string>;
  playAction?: boolean;
  /** Rough intent for the coach's play caller. */
  depth: 'quick' | 'medium' | 'deep';
}

export const PLAYS: PlayDef[] = [
  { id: 'mesh', name: 'Mesh', formation: 'gun_doubles', depth: 'quick', routes: { X: 'drag', Z: 'drag', H: 'corner', Y: 'dig', RB: 'flat' } },
  { id: 'slants', name: 'Slants', formation: 'gun_doubles', depth: 'quick', routes: { X: 'slant', Z: 'slant', H: 'flat', Y: 'quick_out', RB: 'block_release' } },
  { id: 'smash', name: 'Smash', formation: 'gun_doubles', depth: 'medium', routes: { X: 'hitch', Z: 'hitch', H: 'corner', Y: 'corner', RB: 'checkdown' } },
  { id: 'four_verts', name: 'Four Verticals', formation: 'gun_doubles', depth: 'deep', routes: { X: 'go', Z: 'go', H: 'seam', Y: 'seam', RB: 'checkdown' } },
  { id: 'dagger', name: 'Dagger', formation: 'gun_trips', depth: 'medium', routes: { X: 'dig', Z: 'go', H: 'seam', Y: 'out', RB: 'block_release' } },
  { id: 'levels', name: 'Levels', formation: 'gun_trips', depth: 'medium', routes: { X: 'go', Z: 'dig', H: 'in', Y: 'flat', RB: 'block' } },
  { id: 'curls', name: 'Curl-Flat', formation: 'gun_trips', depth: 'quick', routes: { X: 'curl', Z: 'curl', H: 'flat', Y: 'curl', RB: 'swing' } },
  { id: 'pa_cross', name: 'PA Cross', formation: 'singleback', depth: 'medium', playAction: true, routes: { X: 'post', Z: 'dig', H: 'drag', Y: 'corner', RB: 'flat' } },
  { id: 'pa_shot', name: 'PA Post-Wheel', formation: 'singleback', depth: 'deep', playAction: true, routes: { X: 'comeback', Z: 'post', H: 'wheel', Y: 'seam', RB: 'block' } },
  { id: 'flood', name: 'Flood', formation: 'gun_trips', depth: 'medium', routes: { X: 'post', Z: 'go', H: 'out', Y: 'flat', RB: 'checkdown' } },
];

export type DefCall = 'cover1' | 'cover2' | 'cover3' | 'cover0';
export const DEF_CALL_NAMES: Record<DefCall, string> = {
  cover1: 'Cover 1 Man',
  cover2: 'Cover 2',
  cover3: 'Cover 3',
  cover0: 'Cover 0 Blitz',
};

const FIELD_W = 53.33;

/**
 * Route art for a play from a given spot: each receiver's alignment and route waypoints (field yards).
 * Used by the 3D pre-snap overlay and the play-call diagrams; mirrors what `PlaySim.snap()` assigns.
 */
export function routePreview(play: PlayDef, los: number, spotY: number): { slot: Slot; start: { x: number; y: number }; pts: { x: number; y: number }[]; block: boolean; continues: boolean }[] {
  const f = FORMATIONS[play.formation];
  return SLOTS.map((slot) => {
    const al = f.align[slot];
    const y0 = Math.max(2, Math.min(FIELD_W - 2, al.y !== undefined ? al.y : spotY + (al.dy ?? 0)));
    const start = { x: los + al.dx, y: y0 };
    const r = ROUTES[play.routes[slot]] ?? ROUTES.checkdown;
    const pts = r.points.map(([dx, dout]) => ({ x: start.x + dx, y: Math.max(1, Math.min(FIELD_W - 1, y0 + dout * al.side)) }));
    return { slot, start, pts, block: r.points.length === 0, continues: !!r.continues };
  });
}
