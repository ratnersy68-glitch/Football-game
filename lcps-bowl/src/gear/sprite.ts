/**
 * Compatibility entry point used by menus, previews, the locker room, bench and kick cut-ins.
 * Everything renders through the layered character rig (src/gear/rig): there is one player sprite system.
 */
import type { Pose } from '../game/render/sprites';
import type { Look } from './types';
import { ACTION, frameAt, type ActionId, type Build } from './rig/spec';
import { drawRig } from './rig/draw';
import { HELMET_ART } from './rig/helmets';

export { HELMET_ART };

const POSE_ACTION: Record<Pose, ActionId> = {
  stand: 'idle', run: 'run', throw: 'throw', block: 'block', stance: 'threePoint', down: 'tackled', dive: 'dive', celebrate: 'celebrate',
};

/**
 * Draw a player with feet at (x, y). `frame` is the legacy animation clock (seconds × 8).
 * Scale must be an integer (nearest-neighbor); non-integers are rounded.
 */
export function drawGearedPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, look: Look, facing: 1 | -1, pose: Pose, frame: number, scale = 1, opts: { presnap?: boolean; number?: number; build?: Build; action?: ActionId } = {}) {
  const action = opts.action ?? POSE_ACTION[pose] ?? 'idle';
  const spec = ACTION[action];
  const f = pose === 'down' ? spec.frames - 1 : frameAt(spec, frame / 8).frame;
  return drawRig(ctx, x, y, look, opts.build ?? look.build ?? 'hybrid', facing === 1 ? 'right' : 'left', action, f, { scale, presnap: opts.presnap, number: opts.number });
}
