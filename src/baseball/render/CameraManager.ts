/** CameraManager: broadcast-style cameras with smooth transitions and camera shake. */
import * as THREE from 'three';
import { T } from './StadiumBuilder';

export type CamMode = 'menu' | 'batting' | 'pitching' | 'field' | 'overview' | 'hr' | 'replay';

export interface CamContext {
  ball: { x: number; y: number; z: number; visible: boolean };
  focus: { x: number; z: number } | null; // controlled fielder / play focus
  batterLefty: boolean;
}

export class CameraManager {
  cam: THREE.PerspectiveCamera;
  mode: CamMode = 'menu';
  pos = new THREE.Vector3(0, 80, 150);
  look = new THREE.Vector3(0, 0, -150);
  private tPos = new THREE.Vector3();
  private tLook = new THREE.Vector3();
  private fov = 45;
  private tFov = 45;
  private shakeAmt = 0;
  private clock = 0;
  private snap = true;
  replay = { yaw: 0.6, pitch: 0.45, dist: 120, target: new THREE.Vector3() };

  constructor(aspect: number) {
    this.cam = new THREE.PerspectiveCamera(45, aspect, 0.3, 6000);
  }

  setMode(m: CamMode, snap = false) {
    if (m !== this.mode) {
      // Broadcast-style hard cut from the plate cameras to the field camera.
      if (m === 'field' && (this.mode === 'batting' || this.mode === 'pitching')) snap = true;
      if ((m === 'batting' || m === 'pitching') && this.mode !== 'menu') snap = true;
      this.mode = m;
      if (snap) this.snap = true;
    }
  }

  shake(a: number) {
    this.shakeAmt = Math.max(this.shakeAmt, a);
  }

  update(dt: number, ctx: CamContext) {
    this.clock += dt;
    let rate = 3.2;
    switch (this.mode) {
      case 'menu': {
        const a = this.clock * 0.06;
        this.tPos.copy(T(Math.sin(a) * 260, 110, 150 + Math.cos(a) * 260));
        this.tLook.copy(T(0, 0, 150));
        this.tFov = 50;
        rate = 1.5;
        break;
      }
      case 'batting':
        this.tPos.copy(T(0, 6.3, -19.5));
        this.tLook.copy(T(0, 2.9, 25));
        this.tFov = 30;
        rate = 5;
        break;
      case 'pitching':
        this.tPos.copy(T(4.2, 8.4, 83));
        this.tLook.copy(T(0, 2.9, 0));
        this.tFov = 16;
        rate = 5;
        break;
      case 'overview':
        this.tPos.copy(T(0, 70, -95));
        this.tLook.copy(T(0, 0, 140));
        this.tFov = 50;
        rate = 2;
        break;
      case 'field': {
        const b = ctx.ball;
        const f = ctx.focus ?? { x: b.x, z: b.z };
        // Blend between the ball and the player we're controlling.
        const fx = ctx.focus && b.visible ? f.x * 0.5 + b.x * 0.5 : f.x;
        const fz = ctx.focus && b.visible ? f.z * 0.5 + b.z * 0.5 : f.z;
        const r = Math.hypot(fx, fz);
        const lift = b.visible ? Math.min(45, b.y * 0.3) : 0;
        this.tPos.copy(T(fx * 0.25, 50 + r * 0.14 + lift, -58 + fz * 0.38));
        this.tLook.copy(T(fx * 0.92, Math.min(25, b.visible ? b.y * 0.3 : 0), fz * 0.95 + 8));
        this.tFov = 46;
        rate = 3;
        break;
      }
      case 'hr': {
        const b = ctx.ball;
        const r = Math.hypot(b.x, b.z) || 1;
        const ux = b.x / r, uz = b.z / r;
        this.tPos.copy(T(b.x - ux * 70 + uz * 25, Math.max(20, b.y + 12), b.z - uz * 70 - ux * 25));
        this.tLook.copy(T(b.x, b.y, b.z));
        this.tFov = 42;
        rate = 4;
        break;
      }
      case 'replay': {
        const R = this.replay;
        const tgt = R.target;
        this.tLook.copy(tgt);
        this.tPos.set(tgt.x + Math.sin(R.yaw) * Math.cos(R.pitch) * R.dist, tgt.y + Math.sin(R.pitch) * R.dist, tgt.z + Math.cos(R.yaw) * Math.cos(R.pitch) * R.dist);
        this.tFov = 45;
        rate = 6;
        break;
      }
    }
    const k = this.snap ? 1 : 1 - Math.exp(-rate * dt);
    this.snap = false;
    this.pos.lerp(this.tPos, k);
    this.look.lerp(this.tLook, k);
    this.fov += (this.tFov - this.fov) * k;
    this.cam.position.copy(this.pos);
    if (this.shakeAmt > 0.001) {
      const s = this.shakeAmt;
      this.cam.position.x += (Math.random() - 0.5) * s;
      this.cam.position.y += (Math.random() - 0.5) * s;
      this.shakeAmt *= Math.exp(-6 * dt);
    }
    this.cam.lookAt(this.look);
    if (Math.abs(this.cam.fov - this.fov) > 0.01) {
      this.cam.fov = this.fov;
      this.cam.updateProjectionMatrix();
    }
  }

  /** Horizontal camera axes in FIELD coordinates (for camera-relative WASD). */
  groundAxes(): { fwd: { x: number; z: number }; right: { x: number; z: number } } {
    const d = new THREE.Vector3();
    this.cam.getWorldDirection(d);
    const fx = d.x, fz = -d.z;
    const l = Math.hypot(fx, fz) || 1;
    const fwd = { x: fx / l, z: fz / l };
    return { fwd, right: { x: fwd.z, z: -fwd.x } };
  }
}
