/** Lift operation: haul-rope phases, boarding, riding, skipping and unloading. */
import type { Lift } from '../world/types';
import { cablePath, carrierAt, type CablePath } from '../world/liftPath';
import type { Skier, PhysicsWorld } from '../physics/skier';

export interface Ride { lift: number; d: number; carrier: number }

export class LiftSystem {
  readonly paths: CablePath[];
  readonly phases: number[];
  ride: Ride | null = null;
  fast = false;

  constructor(readonly lifts: Lift[]) {
    this.paths = lifts.map(cablePath);
    this.phases = lifts.map(() => 0);
  }

  update(dt: number) {
    this.lifts.forEach((l, i) => {
      const mul = this.ride && this.ride.lift === i && this.fast ? 8 : 1;
      this.phases[i] = (this.phases[i] + l.speed * dt * mul) % (2 * this.paths[i].length);
    });
  }

  /** Nearest boarding station within range of xz. */
  nearStation(x: number, z: number, range = 22): number {
    let best = -1, bd = range;
    this.lifts.forEach((l, i) => {
      const d = Math.hypot(x - l.bottom.x, z - l.bottom.z);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  board(i: number, s: Skier) {
    // re-time the haul rope so carrier 0 is in the loading position (the rider sits on it)
    this.phases[i] = 0;
    this.ride = { lift: i, d: 0, carrier: 0 };
    s.state = 'lift';
    s.vel.set(0, 0, 0);
    this.fast = false;
  }

  /** Advance the rider; returns true when unloaded at the top. */
  step(dt: number, s: Skier, world: PhysicsWorld): boolean {
    if (!this.ride) return false;
    const L = this.lifts[this.ride.lift];
    const c = this.paths[this.ride.lift];
    void dt;
    this.ride.d = this.phases[this.ride.lift];
    if (this.ride.d >= c.length - 4) {
      this.unload(s, world);
      return true;
    }
    const p = carrierAt(c, this.ride.d);
    if (L.type === 'surface') {
      s.pos.set(p.x, world.terrain.height(p.x, p.z), p.z);
    } else {
      s.pos.set(p.x, p.y - c.hang + (L.type === 'gondola' ? -0.6 : 0.15), p.z);
    }
    s.yaw = Math.atan2(p.dx, p.dz);
    s.vel.set(p.dx * L.speed, p.dy * L.speed, p.dz * L.speed);
    s.normal.set(0, 1, 0);
    s.groundQuat(s.bodyQ, s.normal);
    return false;
  }

  skip(s: Skier, world: PhysicsWorld) {
    if (this.ride) this.unload(s, world);
  }

  unload(s: Skier, world: PhysicsWorld) {
    if (!this.ride) return;
    const L = this.lifts[this.ride.lift];
    const T = world.terrain;
    // step off forward-downhill of the top station
    const fall = { x: 0, y: 0, z: 0 };
    T.normal(L.top.x, L.top.z + 12, fall);
    let fx = fall.x, fz = fall.z;
    const fl = Math.hypot(fx, fz) || 1;
    fx /= fl; fz /= fl;
    const x = L.top.x + fx * 14, z = L.top.z + fz * 14;
    s.place(world, x, z, Math.atan2(fx, fz), 2);
    this.ride = null;
    this.fast = false;
  }

  /** Teleport to a lift's top station (fast travel). */
  travelTo(i: number, s: Skier, world: PhysicsWorld) {
    this.ride = { lift: i, d: 0, carrier: 0 };
    this.unload(s, world);
  }

  get riding() { return this.ride !== null; }
  get liftType(): Lift['type'] | null { return this.ride ? this.lifts[this.ride.lift].type : null; }
}
