/** Camera rig: follow / close freestyle / cinematic / first person / race, with terrain avoidance. */
import * as THREE from 'three';
import { clamp, damp, lerp } from '../core/math';
import type { Terrain } from '../world/terrain';
import type { Skier } from '../physics/skier';

export type CamMode = 'follow' | 'close' | 'cinematic' | 'first' | 'race';
export const CAM_MODES: CamMode[] = ['follow', 'close', 'cinematic', 'first', 'race'];
export const CAM_LABEL: Record<CamMode, string> = { follow: 'Follow', close: 'Freestyle close', cinematic: 'Cinematic', first: 'First person', race: 'Race' };

export class CameraRig {
  mode: CamMode = 'follow';
  private dir = new THREE.Vector3(0, 0, 1);
  private pos = new THREE.Vector3();
  private look = new THREE.Vector3();
  private shake = 0;
  private init = false;
  distanceScale = 1;
  shakeEnabled = true;
  fovBase = 62;
  private side = 1;

  constructor(private cam: THREE.PerspectiveCamera) {}

  snap() { this.init = false; }
  bump(amount: number) { this.shake = Math.min(1.2, this.shake + amount); }

  update(dt: number, s: Skier, T: Terrain, headWorld: THREE.Vector3 | null, liftDir?: THREE.Vector3) {
    const target = s.pos;
    const sp = s.speed;
    // travel direction: smoothed horizontal velocity, frozen-ish in the air
    const hv = new THREE.Vector3(s.vel.x, 0, s.vel.z);
    if (liftDir) hv.copy(liftDir).setY(0);
    else if (hv.lengthSq() < 1) hv.set(Math.sin(s.yaw), 0, Math.cos(s.yaw));
    hv.normalize();
    const rate = s.state === 'air' ? 1.2 : s.state === 'crashed' ? 0.8 : this.mode === 'close' ? 5 : 3.2;
    if (!this.init) this.dir.copy(hv);
    this.dir.lerp(hv, damp(rate, dt)).normalize();

    let dist = 6.2 + Math.min(4, sp * 0.07), height = 2.3 + Math.min(1.5, sp * 0.03), ahead = 2.5;
    let fov = this.fovBase + clamp((sp - 8) * 0.55, 0, 22);
    const desired = new THREE.Vector3();
    const lookAt = new THREE.Vector3(target.x, target.y + 1.0, target.z);
    switch (this.mode) {
      case 'close': dist = 4 + sp * 0.04; height = 1.7; ahead = 1.2; break;
      case 'race': dist = 4.6 + sp * 0.05; height = 1.35; ahead = 4; fov += 6; break;
      case 'first': break;
      case 'cinematic': break;
    }
    dist *= this.distanceScale;
    if (s.state === 'air') {
      // landing anticipation: pull back and look toward where we'll come down
      height += 1.2; dist += 1.5;
      lookAt.y -= Math.min(2.5, Math.max(0, -s.vel.y) * 0.15);
    }
    if (s.state === 'lift') { dist = 9; height = 3.5; }
    if (this.mode === 'first' && headWorld && s.state !== 'crashed') {
      desired.copy(headWorld).addScaledVector(this.dir, 0.15).y += 0.05;
      lookAt.copy(desired).addScaledVector(this.dir, 10);
      lookAt.y += -0.5 - (s.state === 'ride' ? Math.max(0, -s.vel.y) * 0.08 : 0);
      this.pos.copy(desired);
      fov = 80 + clamp(sp * 0.3, 0, 15);
    } else if (this.mode === 'cinematic') {
      // broadcast-style side tracking shot
      const right = new THREE.Vector3(-this.dir.z, 0, this.dir.x).multiplyScalar(this.side);
      desired.copy(target).addScaledVector(right, 11).addScaledVector(this.dir, 7);
      desired.y = Math.max(target.y + 3, T.height(desired.x, desired.z) + 2.5);
      if (!this.init) this.pos.copy(desired);
      this.pos.lerp(desired, damp(1.6, dt));
      fov = 48;
    } else {
      desired.copy(target).addScaledVector(this.dir, -dist);
      desired.y = target.y + height;
      lookAt.addScaledVector(this.dir, ahead);
      if (!this.init) this.pos.copy(desired);
      const k = damp(this.mode === 'close' ? 7 : 5, dt);
      this.pos.x = lerp(this.pos.x, desired.x, k);
      this.pos.z = lerp(this.pos.z, desired.z, k);
      this.pos.y = lerp(this.pos.y, desired.y, damp(s.state === 'air' ? 2.5 : 4, dt));
    }
    if (this.mode !== 'first') {
      // terrain avoidance: stay above snow and keep line of sight
      const minY = T.height(this.pos.x, this.pos.z) + 1.0;
      if (this.pos.y < minY) this.pos.y = minY;
      for (let i = 1; i <= 6; i++) {
        const f = i / 7;
        const x = lerp(lookAt.x, this.pos.x, f), z = lerp(lookAt.z, this.pos.z, f);
        const y = lerp(lookAt.y, this.pos.y, f);
        const h = T.height(x, z) + 0.6;
        if (h > y) this.pos.y += (h - y) / Math.max(0.2, f);
      }
    }
    if (!this.init) { this.look.copy(lookAt); this.init = true; }
    this.look.lerp(lookAt, damp(this.mode === 'first' ? 20 : 9, dt));
    // speed / impact shake
    const speedShake = this.shakeEnabled ? clamp((sp - 22) / 30, 0, 1) * 0.05 + this.shake * 0.25 : 0;
    this.shake = Math.max(0, this.shake - dt * 2.5);
    this.cam.position.copy(this.pos);
    if (speedShake > 0) this.cam.position.add(new THREE.Vector3((Math.random() - 0.5) * speedShake, (Math.random() - 0.5) * speedShake, (Math.random() - 0.5) * speedShake));
    this.cam.lookAt(this.look);
    this.cam.fov = lerp(this.cam.fov, fov, damp(3, dt));
    this.cam.updateProjectionMatrix();
  }

  next() {
    const i = CAM_MODES.indexOf(this.mode);
    this.mode = CAM_MODES[(i + 1) % CAM_MODES.length];
    if (this.mode === 'cinematic') this.side = -this.side;
    this.init = false;
    return this.mode;
  }
}
