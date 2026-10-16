/**
 * Low-poly skier / snowboarder. Joint positions are solved procedurally every frame
 * (two-bone IK for legs and arms) from the physics state, then limb segments are placed
 * between joints. Equipment colours come from the shop loadout, so purchases are visible.
 */
import * as THREE from 'three';
import type { Look } from '../data/equipment';
import { clamp, lerp } from '../core/math';

export interface Pose {
  board: 'ski' | 'snowboard';
  crouch: number; compression: number; tuck: number; brake: number; lean: number; slip: number;
  air: boolean; grab: number; grabAmt: number; spinning: boolean;
  crashed: boolean; recovering: number;
  lift: 'none' | 'chair' | 'gondola' | 'surface';
  grind: boolean;
  speed: number; time: number; turn: number; hold: boolean;
}

export const IDLE_POSE: Pose = {
  board: 'ski', crouch: 0.2, compression: 0, tuck: 0, brake: 0, lean: 0, slip: 0, air: false, grab: 0, grabAmt: 0, spinning: false,
  crashed: false, recovering: 0, lift: 'none', grind: false, speed: 0, time: 0, turn: 0, hold: false,
};

const V = () => new THREE.Vector3();
const Y = new THREE.Vector3(0, 1, 0);

function ik(a: THREE.Vector3, t: THREE.Vector3, l1: number, l2: number, pole: THREE.Vector3, out: THREE.Vector3) {
  const dir = V().subVectors(t, a);
  let d = dir.length();
  d = clamp(d, 0.02, l1 + l2 - 0.002);
  dir.normalize();
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const bend = pole.clone().addScaledVector(dir, -pole.dot(dir));
  if (bend.lengthSq() < 1e-6) bend.set(0, 0, 1);
  bend.normalize();
  out.copy(a).addScaledVector(dir, x).addScaledVector(bend, h);
  // clamp target to reach
  t.copy(a).addScaledVector(dir, Math.min(d, l1 + l2 - 0.002));
  return out;
}

interface Seg { mesh: THREE.Mesh; a: string; b: string; len: number }

function skiGeometry(len: number, w: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, 0.025, len, 1, 1, 12);
  const p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const z = p.getZ(i);
    const t = z / (len / 2);
    if (t > 0.72) p.setY(i, p.getY(i) + Math.pow((t - 0.72) / 0.28, 2) * 0.09);
    if (t < -0.85) p.setY(i, p.getY(i) + Math.pow((-t - 0.85) / 0.15, 2) * 0.04);
    const taper = 1 - Math.max(0, Math.abs(t) - 0.85) * 1.2;
    p.setX(i, p.getX(i) * taper);
  }
  g.computeVertexNormals();
  return g;
}

export class Character {
  readonly root = new THREE.Group();
  private body = new THREE.Group();
  private segs: Seg[] = [];
  private j: Record<string, THREE.Vector3> = {};
  private mats: THREE.Material[] = [];
  private head!: THREE.Group;
  private skiL!: THREE.Mesh;
  private skiR!: THREE.Mesh;
  private board!: THREE.Mesh;
  private poleL!: THREE.Mesh;
  private poleR!: THREE.Mesh;
  private bootL!: THREE.Mesh;
  private bootR!: THREE.Mesh;
  private handL!: THREE.Mesh;
  private handR!: THREE.Mesh;
  private pelvis!: THREE.Mesh;
  private pack: THREE.Mesh | null = null;
  private bib: THREE.Mesh | null = null;
  private H = 1;
  private flail = 0;
  private plantL = 0;
  private plantR = 0;
  private lastTurn = 0;
  look: Look;

  constructor(look: Look) {
    this.look = look;
    this.root.add(this.body);
    this.build(look);
  }

  private mat(color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...opts });
    this.mats.push(m);
    return m;
  }

  private build(look: Look) {
    const a = look.appearance;
    this.H = 0.92 + 0.16 * (a.height ?? 1) * 0.5;
    const bw = 0.85 + 0.3 * (a.build ?? 0.5);
    const jacket = this.mat(look.jacket);
    const accent = this.mat(look.jacketAccent);
    const pants = this.mat(look.pants);
    const skin = this.mat(a.skin, { roughness: 0.9 });
    const gloves = this.mat(look.gloves);
    const boots = this.mat(look.boots, { roughness: 0.4 });
    const helmet = this.mat(look.helmet, { roughness: 0.35 });
    const lens = this.mat(look.lens, { roughness: 0.1, metalness: 0.6, emissive: new THREE.Color(look.lens).multiplyScalar(0.15) });
    const frame = this.mat(look.frame);
    const hair = this.mat(a.hair, { roughness: 1 });
    const cap = (r: number, l: number, m: THREE.Material) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 3, 8), m);
      mesh.castShadow = true;
      this.body.add(mesh);
      return mesh;
    };
    const seg = (a: string, b: string, r: number, m: THREE.Material) => {
      const mesh = cap(r, 1, m);
      this.segs.push({ mesh, a, b, len: 1 });
    };
    // torso is a tapered capsule with an accent band
    seg('pelvis', 'chest', 0.15 * bw, jacket);
    seg('chest', 'neck', 0.065, skin);
    seg('shoulderL', 'elbowL', 0.062 * bw, jacket);
    seg('elbowL', 'handL', 0.054 * bw, accent);
    seg('shoulderR', 'elbowR', 0.062 * bw, jacket);
    seg('elbowR', 'handR', 0.054 * bw, accent);
    seg('hipL', 'kneeL', 0.085 * bw, pants);
    seg('kneeL', 'ankleL', 0.068 * bw, pants);
    seg('hipR', 'kneeR', 0.085 * bw, pants);
    seg('kneeR', 'ankleR', 0.068 * bw, pants);
    seg('shoulderL', 'shoulderR', 0.075 * bw, jacket);
    this.pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.32 * bw, 0.2, 0.22), pants);
    this.pelvis.castShadow = true;
    this.body.add(this.pelvis);
    // head
    this.head = new THREE.Group();
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), skin);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.128, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), helmet);
    shell.position.y = 0.02;
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.06, 0.06), frame);
    band.position.set(0, 0.03, 0.095);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.05, 0.02), lens);
    glass.position.set(0, 0.03, 0.128);
    this.head.add(skull, shell, band, glass);
    if (a.hairStyle === 'long' || a.hairStyle === 'ponytail') {
      const h = new THREE.Mesh(new THREE.CapsuleGeometry(a.hairStyle === 'long' ? 0.07 : 0.035, a.hairStyle === 'long' ? 0.12 : 0.14, 2, 6), hair);
      h.position.set(0, -0.08, -0.1);
      h.rotation.x = 0.4;
      this.head.add(h);
    }
    if (a.face === 'beard' || a.face === 'stubble') {
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.13, a.face === 'beard' ? 0.07 : 0.03, 0.05), hair);
      beard.position.set(0, -0.07, 0.075);
      this.head.add(beard);
    }
    this.head.traverse((o) => { o.castShadow = true; });
    this.body.add(this.head);
    this.handL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), gloves);
    this.handR = this.handL.clone();
    this.body.add(this.handL, this.handR);
    const bootG = new THREE.BoxGeometry(0.13, 0.17, 0.3);
    this.bootL = new THREE.Mesh(bootG, boots);
    this.bootR = new THREE.Mesh(bootG, boots);
    this.bootL.castShadow = this.bootR.castShadow = true;
    this.body.add(this.bootL, this.bootR);
    // skis / board
    const skiM = this.mat(look.ski, { roughness: 0.3 });
    this.skiL = new THREE.Mesh(skiGeometry(1.72, 0.085), skiM);
    this.skiR = new THREE.Mesh(skiGeometry(1.72, 0.085), skiM);
    this.skiL.castShadow = this.skiR.castShadow = true;
    const boardM = this.mat(look.board, { roughness: 0.3 });
    this.board = new THREE.Mesh(skiGeometry(1.55, 0.28), boardM);
    this.board.castShadow = true;
    this.body.add(this.skiL, this.skiR, this.board);
    const poleM = this.mat(look.poles, { metalness: 0.6, roughness: 0.3 });
    const poleG = new THREE.CylinderGeometry(0.011, 0.011, 1, 5);
    poleG.translate(0, -0.5, 0);
    const basket = new THREE.CylinderGeometry(0.045, 0.045, 0.01, 8);
    basket.translate(0, -0.9, 0);
    this.poleL = new THREE.Mesh(poleG, poleM);
    this.poleL.add(new THREE.Mesh(basket, frame));
    this.poleR = this.poleL.clone();
    this.body.add(this.poleL, this.poleR);
    if (look.pack) {
      this.pack = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 0.14), this.mat(look.pack));
      this.pack.castShadow = true;
      this.body.add(this.pack);
    }
    if (look.bib !== undefined) this.setBib(look.bib);
    for (const k of ['pelvis', 'chest', 'neck', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'basketL', 'basketR']) this.j[k] = V();
  }

  setBib(n: number) {
    if (this.bib) { this.body.remove(this.bib); }
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const x = c.getContext('2d')!;
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#c8322b'; x.fillRect(0, 0, 128, 18);
    x.fillStyle = '#111'; x.font = 'bold 72px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(String(n), 64, 72);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this.bib = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshBasicMaterial({ map: t }));
    this.body.add(this.bib);
  }

  setLook(look: Look) {
    this.dispose(false);
    this.body.clear();
    this.segs = [];
    this.mats = [];
    this.pack = null; this.bib = null;
    this.look = look;
    this.build(look);
  }

  setGhost(on: boolean) {
    for (const m of this.mats) { m.transparent = on; m.opacity = on ? 0.38 : 1; m.depthWrite = !on; }
    this.root.traverse((o) => { o.castShadow = !on && (o as THREE.Mesh).isMesh; });
  }

  /** World position of the head (first-person camera). */
  headWorld(out: THREE.Vector3) {
    return this.head.getWorldPosition(out);
  }

  update(p: Pose, dt: number) {
    const H = this.H;
    const J = this.j;
    const ski = p.board === 'ski';
    this.skiL.visible = this.skiR.visible = this.poleL.visible = this.poleR.visible = ski;
    this.board.visible = !ski;
    const c = clamp(p.crouch * 0.55 + p.compression * 0.6 + p.tuck * 0.75 + (p.air ? 0.15 : 0), 0, 1);
    const pull = p.air ? 0.18 + p.grabAmt * 0.22 : 0;
    // ---- turn detection for pole plants
    if (ski && !p.air && p.speed > 4 && Math.sign(p.turn) !== Math.sign(this.lastTurn) && Math.abs(p.turn) > 0.25) {
      if (p.turn > 0) this.plantR = 1; else this.plantL = 1;
      this.lastTurn = p.turn;
    }
    this.plantL = Math.max(0, this.plantL - dt * 2.2);
    this.plantR = Math.max(0, this.plantR - dt * 2.2);
    this.flail = p.crashed ? this.flail + dt * 9 : 0;

    if (p.lift === 'chair') {
      J.pelvis.set(0, 0.05, -0.05);
      J.hipL.set(0.11, 0, 0); J.hipR.set(-0.11, 0, 0);
      J.kneeL.set(0.12, 0.02, 0.43 * H); J.kneeR.set(-0.12, 0.02, 0.43 * H);
      J.ankleL.set(0.12, -0.38 * H, 0.52 * H); J.ankleR.set(-0.12, -0.38 * H, 0.52 * H);
      J.chest.set(0, 0.55 * H, -0.1);
    } else {
      // stance frame (for snowboard rotated 90° afterwards)
      const width = ski ? 0.12 + p.brake * 0.09 : 0.27;
      J.ankleL.set(width, 0.11 + pull, ski ? -p.brake * 0.05 : 0);
      J.ankleR.set(-width, 0.11 + pull, ski ? -p.brake * 0.05 : 0);
      if (p.crashed) {
        J.ankleL.set(0.25 + Math.sin(this.flail) * 0.1, 0.15, Math.cos(this.flail * 0.7) * 0.2);
        J.ankleR.set(-0.25, 0.15 + Math.sin(this.flail * 1.3) * 0.12, -0.1);
      }
      const hipH = (0.94 - 0.36 * c) * H + pull * 0.6;
      const back = -0.05 - 0.17 * c;
      J.pelvis.set(-p.lean * 0.06, hipH, back);
      J.hipL.set(0.105 + J.pelvis.x, hipH - 0.05, back);
      J.hipR.set(-0.105 + J.pelvis.x, hipH - 0.05, back);
      const lean = 0.18 + 0.9 * p.tuck + 0.32 * c + (p.lift === 'surface' ? -0.1 : 0);
      J.chest.set(J.pelvis.x * 0.5 + p.lean * 0.04, hipH + Math.cos(lean) * 0.5 * H, back + Math.sin(lean) * 0.5 * H);
      if (p.crashed) J.chest.x += Math.sin(this.flail * 0.8) * 0.12;
    }
    const lean = Math.atan2(J.chest.z - J.pelvis.z, J.chest.y - J.pelvis.y);
    J.neck.set(J.chest.x, J.chest.y + Math.cos(lean) * 0.1, J.chest.z + Math.sin(lean) * 0.1);
    J.head.set(J.neck.x, J.neck.y + 0.13, J.neck.z + 0.05 + p.tuck * 0.03);
    J.shoulderL.set(J.chest.x + 0.19, J.chest.y - 0.04, J.chest.z - 0.02);
    J.shoulderR.set(J.chest.x - 0.19, J.chest.y - 0.04, J.chest.z - 0.02);
    // ---- legs IK (knees bend forward)
    const thigh = 0.45 * H, shin = 0.45 * H;
    if (p.lift !== 'chair') {
      const pole = new THREE.Vector3(0, 0, 1);
      ik(J.hipL, J.ankleL, thigh, shin, pole, J.kneeL);
      ik(J.hipR, J.ankleR, thigh, shin, pole, J.kneeR);
    }
    // ---- hands
    const handTarget = (side: 1 | -1, out: THREE.Vector3) => {
      const sh = side === 1 ? J.shoulderL : J.shoulderR;
      if (p.lift === 'chair') return out.set(side * 0.15, 0.25 * H, 0.2);
      if (p.lift === 'surface' && side === -1) return out.copy(sh).add(new THREE.Vector3(0.05, 0.45, 0.1));
      if (p.crashed) return out.copy(sh).add(new THREE.Vector3(side * (0.35 + Math.sin(this.flail + side) * 0.2), 0.15 + Math.cos(this.flail * 1.2) * 0.25, Math.sin(this.flail * 0.9) * 0.3));
      if (p.air || p.grind) {
        const base = out.copy(sh).add(new THREE.Vector3(side * 0.42, -0.05, 0.12));
        if (p.grabAmt > 0.02 && p.grab > 0) {
          const g = grabTarget(p.grab, side, J);
          if (g) base.lerp(g, p.grabAmt);
        }
        return base;
      }
      if (p.tuck > 0.5) return out.set(side * 0.09, J.chest.y - 0.02, J.chest.z + 0.36);
      const plant = side === 1 ? this.plantL : this.plantR;
      return out.copy(sh).add(new THREE.Vector3(side * 0.13, -0.36 + plant * 0.06, 0.3 + plant * 0.15));
    };
    handTarget(1, J.handL);
    handTarget(-1, J.handR);
    const ua = 0.29 * H, fa = 0.27 * H;
    ik(J.shoulderL, J.handL, ua, fa, new THREE.Vector3(0.6, -0.2, -0.8), J.elbowL);
    ik(J.shoulderR, J.handR, ua, fa, new THREE.Vector3(-0.6, -0.2, -0.8), J.elbowR);

    // ---- rotate stance frame for snowboard (rider faces the left side of travel)
    if (!ski && p.lift !== 'chair') {
      const q = new THREE.Quaternion().setFromAxisAngle(Y, Math.PI / 2);
      for (const k of Object.keys(J)) J[k].applyQuaternion(q);
    }

    // ---- place segments
    for (const s of this.segs) {
      const a = J[s.a], b = J[s.b];
      const d = V().subVectors(b, a);
      const len = d.length();
      s.mesh.position.copy(a).addScaledVector(d, 0.5);
      if (len > 1e-4) s.mesh.quaternion.setFromUnitVectors(Y, d.multiplyScalar(1 / len));
      const r = (s.mesh.geometry as THREE.CapsuleGeometry).parameters.radius;
      s.mesh.scale.set(1, Math.max(0.05, len - r * 0.6) / 1, 1);
    }
    this.pelvis.position.copy(J.pelvis).y -= 0.03;
    this.pelvis.quaternion.copy(this.body.quaternion.identity());
    if (!ski) this.pelvis.rotation.y = Math.PI / 2;
    // head looks along travel
    this.head.position.copy(J.head);
    this.head.rotation.set(-Math.max(0, lean - 0.3) * 0.8, ski ? 0 : -Math.PI / 2 + 0.9, 0);
    this.handL.position.copy(J.handL);
    this.handR.position.copy(J.handR);
    if (this.pack) {
      const fwd = V().subVectors(J.chest, J.pelvis).normalize();
      this.pack.position.copy(J.pelvis).lerp(J.chest, 0.6).add(new THREE.Vector3(0, 0, -0.16).applyAxisAngle(Y, ski ? 0 : Math.PI / 2));
      this.pack.quaternion.setFromUnitVectors(Y, fwd);
    }
    if (this.bib) {
      this.bib.position.copy(J.pelvis).lerp(J.chest, 0.62).add(new THREE.Vector3(0, 0, 0.16).applyAxisAngle(Y, ski ? 0 : Math.PI / 2));
      this.bib.rotation.set(-lean, ski ? 0 : Math.PI / 2, 0);
    }
    // boots + skis under the ankles
    const placeFoot = (boot: THREE.Mesh, ankle: THREE.Vector3, yaw: number) => {
      boot.position.set(ankle.x, ankle.y - 0.02, ankle.z + 0.02);
      boot.rotation.set(0, yaw, 0);
    };
    if (ski) {
      const plow = p.brake * 0.22;
      placeFoot(this.bootL, J.ankleL, -plow);
      placeFoot(this.bootR, J.ankleR, plow);
      if (p.lift === 'chair') {
        this.skiL.position.set(J.ankleL.x, J.ankleL.y - 0.1, J.ankleL.z + 0.3);
        this.skiR.position.set(J.ankleR.x, J.ankleR.y - 0.1, J.ankleR.z + 0.3);
        this.skiL.rotation.set(0.25, 0, 0); this.skiR.rotation.set(0.25, 0, 0);
      } else {
        this.skiL.position.set(J.ankleL.x, J.ankleL.y - 0.1, J.ankleL.z + 0.1);
        this.skiR.position.set(J.ankleR.x, J.ankleR.y - 0.1, J.ankleR.z + 0.1);
        const japan = p.grab === 4 || p.grab === 6 ? p.grabAmt : 0;
        this.skiL.rotation.set(-japan * 0.5, -plow, japan * 0.3);
        this.skiR.rotation.set(-japan * 0.5, plow, -japan * 0.3);
      }
      // poles: from hands toward baskets
      const basket = (side: 1 | -1, out: THREE.Vector3) => {
        const h = side === 1 ? J.handL : J.handR;
        const plant = side === 1 ? this.plantL : this.plantR;
        if (p.tuck > 0.5) return out.copy(h).add(new THREE.Vector3(side * 0.08, -0.15, -0.95));
        if (p.air || p.crashed) return out.copy(h).add(new THREE.Vector3(side * 0.3, -0.75, -0.55));
        if (p.lift === 'chair') return out.copy(h).add(new THREE.Vector3(0, -0.9, 0.35));
        return out.copy(h).add(new THREE.Vector3(side * 0.06, -1.0, lerp(-0.42, 0.35, plant)));
      };
      basket(1, J.basketL); basket(-1, J.basketR);
      for (const [pole, h, b] of [[this.poleL, J.handL, J.basketL], [this.poleR, J.handR, J.basketR]] as const) {
        pole.position.copy(h);
        const d = V().subVectors(b, h).normalize();
        pole.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d);
        pole.scale.set(1, 1.12, 1);
      }
    } else {
      placeFoot(this.bootL, J.ankleL, Math.PI / 2 - 0.2);
      placeFoot(this.bootR, J.ankleR, Math.PI / 2 + 0.2);
      const mid = V().addVectors(J.ankleL, J.ankleR).multiplyScalar(0.5);
      this.board.position.set(mid.x, mid.y - 0.1, mid.z);
      this.board.rotation.set(0, 0, 0);
    }
    // whole-body angulation into the turn (skis go on edge with it)
    this.body.rotation.set(0, 0, p.air || p.crashed || p.lift !== 'none' ? 0 : -p.lean * (ski ? 0.55 : 0.6));
  }

  dispose(full = true) {
    this.body.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); });
    for (const m of this.mats) m.dispose();
    if (full) this.root.clear();
  }
}

function grabTarget(grab: number, side: 1 | -1, J: Record<string, THREE.Vector3>): THREE.Vector3 | null {
  // returns a hand target for `side` (1 = left hand) or null if that hand stays out
  const L = J.ankleL, R = J.ankleR;
  const v = (a: THREE.Vector3, x: number, y: number, z: number) => a.clone().add(new THREE.Vector3(x, y, z));
  switch (grab) {
    case 1: return side === 1 ? v(L, 0.08, 0.05, 0.15) : null; // Safety
    case 2: return side === 1 ? v(R, 0.02, 0.06, 0.32) : null; // Mute
    case 3: return side === -1 ? v(R, -0.05, 0.06, -0.55) : null; // Tail
    case 4: return side === 1 ? v(R, 0.04, 0.12, 0.25) : null; // Japan
    case 5: return side === -1 ? v(R, 0, 0.08, 0.75) : null; // Nose
    case 6: return side === 1 ? v(L, 0.05, 0.08, -0.35) : null; // Method
    case 7: return side === -1 ? v(L, -0.04, 0.06, -0.15) : null; // Stalefish
    case 8: return side === 1 ? v(L, 0, 0.08, 0.5) : v(R, 0, 0.08, 0.5); // Truck Driver
  }
  return null;
}
