/**
 * Verlet ragdoll used for crashes: 15 joint particles linked by bone-length and bracing
 * constraints, colliding with the snow surface with friction.
 */
import { Vector3 } from 'three';
import type { Terrain } from '../world/terrain';

export const RAGDOLL_JOINTS = ['pelvis', 'chest', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR'] as const;
export type RagJoint = (typeof RAGDOLL_JOINTS)[number];

const LINKS: [RagJoint, RagJoint][] = [
  ['pelvis', 'chest'], ['chest', 'head'], ['chest', 'shoulderL'], ['chest', 'shoulderR'], ['shoulderL', 'shoulderR'],
  ['shoulderL', 'elbowL'], ['elbowL', 'handL'], ['shoulderR', 'elbowR'], ['elbowR', 'handR'],
  ['pelvis', 'hipL'], ['pelvis', 'hipR'], ['hipL', 'hipR'], ['hipL', 'kneeL'], ['kneeL', 'ankleL'], ['hipR', 'kneeR'], ['kneeR', 'ankleR'],
  // braces keep the torso and head roughly rigid
  ['shoulderL', 'hipL'], ['shoulderR', 'hipR'], ['shoulderL', 'hipR'], ['shoulderR', 'hipL'], ['shoulderL', 'head'], ['shoulderR', 'head'], ['pelvis', 'head'],
];

export class Ragdoll {
  readonly p: Record<RagJoint, Vector3>;
  private prev: Record<RagJoint, Vector3>;
  private rest: number[];
  private links: [number, number][];
  private arr: Vector3[];
  private prevArr: Vector3[];

  constructor(joints: Record<string, Vector3>, vel: Vector3, spin: Vector3, dt = 1 / 60) {
    this.p = {} as Record<RagJoint, Vector3>;
    this.prev = {} as Record<RagJoint, Vector3>;
    const centre = joints.pelvis.clone();
    for (const j of RAGDOLL_JOINTS) {
      const x = joints[j].clone();
      this.p[j] = x;
      // initial velocity = body velocity + rotation about the pelvis
      const r = x.clone().sub(centre);
      const v = vel.clone().add(spin.clone().cross(r));
      this.prev[j] = x.clone().addScaledVector(v, -dt);
    }
    this.arr = RAGDOLL_JOINTS.map((j) => this.p[j]);
    this.prevArr = RAGDOLL_JOINTS.map((j) => this.prev[j]);
    this.links = LINKS.map(([a, b]) => [RAGDOLL_JOINTS.indexOf(a), RAGDOLL_JOINTS.indexOf(b)]);
    this.rest = this.links.map(([a, b]) => this.arr[a].distanceTo(this.arr[b]));
  }

  step(dt: number, T: Terrain) {
    const sub = 3;
    const h = dt / sub;
    const g = -9.81 * h * h;
    for (let s = 0; s < sub; s++) {
      for (let i = 0; i < this.arr.length; i++) {
        const x = this.arr[i], pr = this.prevArr[i];
        const vx = (x.x - pr.x) * 0.995, vy = (x.y - pr.y) * 0.995, vz = (x.z - pr.z) * 0.995;
        pr.copy(x);
        x.x += vx; x.y += vy + g; x.z += vz;
      }
      for (let it = 0; it < 6; it++) {
        for (let k = 0; k < this.links.length; k++) {
          const [a, b] = this.links[k];
          const pa = this.arr[a], pb = this.arr[b];
          const dx = pb.x - pa.x, dy = pb.y - pa.y, dz = pb.z - pa.z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
          const diff = (d - this.rest[k]) / d * 0.5;
          pa.x += dx * diff; pa.y += dy * diff; pa.z += dz * diff;
          pb.x -= dx * diff; pb.y -= dy * diff; pb.z -= dz * diff;
        }
        // snow contact with friction
        for (let i = 0; i < this.arr.length; i++) {
          const x = this.arr[i];
          const r = i === 2 ? 0.12 : 0.07;
          const ground = T.height(x.x, x.z) + r;
          if (x.y < ground) {
            x.y = ground;
            const pr = this.prevArr[i];
            pr.x += (x.x - pr.x) * 0.18;
            pr.z += (x.z - pr.z) * 0.18;
            if (pr.y < x.y - 0.02) pr.y = x.y - (x.y - pr.y) * 0.2;
          }
        }
      }
    }
  }

  /** Approximate speed of the body (m/s) from the pelvis. */
  speed(dt: number): number {
    return this.p.pelvis.distanceTo(this.prev.pelvis) / (dt / 3);
  }

  velocity(dt: number, out: Vector3): Vector3 {
    return out.copy(this.p.pelvis).sub(this.prev.pelvis).multiplyScalar(3 / dt);
  }
}
