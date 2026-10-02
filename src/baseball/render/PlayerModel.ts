/**
 * PlayerModel: a stylized baseball player built from primitives, with procedural animations
 * (stance, swing, pitching delivery, running, throwing, diving, sliding, catcher's crouch).
 * Root origin is at the feet; the model faces +Z in local space.
 */
import * as THREE from 'three';
import type { AnimName } from '../engine/LivePlay';

export interface Uniform {
  jersey: string;
  pants: string;
  trim: string; // sleeves, socks, cap
  cap: string;
  number: string; // number color
  skin: string;
  helmet: boolean;
  catcherGear: boolean;
  umpire: boolean;
}

const geoCache = new Map<string, THREE.BufferGeometry>();
function box(w: number, h: number, d: number, topPivot = true): THREE.BufferGeometry {
  const k = `b${w},${h},${d},${topPivot}`;
  let g = geoCache.get(k);
  if (!g) {
    g = new THREE.BoxGeometry(w, h, d);
    if (topPivot) g.translate(0, -h / 2, 0);
    geoCache.set(k, g);
  }
  return g;
}
function capsule(r: number, len: number): THREE.BufferGeometry {
  const k = `c${r},${len}`;
  let g = geoCache.get(k);
  if (!g) {
    g = new THREE.CapsuleGeometry(r, len, 4, 10);
    g.translate(0, -(len / 2 + r), 0);
    geoCache.set(k, g);
  }
  return g;
}

const matCache = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: string, rough = 0.75, metal = 0): THREE.MeshStandardMaterial {
  const k = `${color}|${rough}|${metal}`;
  let m = matCache.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    matCache.set(k, m);
  }
  return m;
}

const numberTex = new Map<string, THREE.CanvasTexture>();
function numberTexture(n: number, color: string): THREE.CanvasTexture {
  const k = `${n}|${color}`;
  let t = numberTex.get(k);
  if (t) return t;
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, 128, 128);
  g.font = 'bold 84px Oswald, Impact, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = 6;
  g.strokeStyle = 'rgba(255,255,255,0.85)';
  g.strokeText(String(n), 64, 70);
  g.fillStyle = color;
  g.fillText(String(n), 64, 70);
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  numberTex.set(k, t);
  return t;
}

export class PlayerModel {
  root = new THREE.Group();
  body = new THREE.Group(); // pivots at hips for leaning/diving
  torso = new THREE.Group();
  head = new THREE.Group();
  lThigh = new THREE.Group(); lShin = new THREE.Group();
  rThigh = new THREE.Group(); rShin = new THREE.Group();
  lArm = new THREE.Group(); lFore = new THREE.Group();
  rArm = new THREE.Group(); rFore = new THREE.Group();
  bat: THREE.Mesh | null = null;
  glove: THREE.Mesh | null = null;
  ring: THREE.Mesh;
  shadow: THREE.Mesh;
  phase = 0;
  throwsLeft = false;
  private materials: THREE.Material[] = [];

  constructor(u: Uniform, jerseyNo: number, throwsLeft: boolean, withBat: boolean) {
    this.throwsLeft = throwsLeft;
    const jersey = mat(u.jersey);
    const pants = mat(u.pants);
    const trim = mat(u.trim);
    const skin = mat(u.skin, 0.6);
    const shoe = mat('#141414', 0.5);

    this.root.add(this.body);
    this.body.position.y = 3.05;
    // Legs
    const mkLeg = (thigh: THREE.Group, shin: THREE.Group, x: number) => {
      thigh.position.set(x, 0, 0);
      thigh.add(new THREE.Mesh(capsule(0.24, 1.15), pants));
      shin.position.y = -1.55;
      const sock = new THREE.Mesh(capsule(0.2, 1.05), u.umpire ? pants : trim);
      shin.add(sock);
      const foot = new THREE.Mesh(box(0.38, 0.28, 0.75, false), shoe);
      foot.position.set(0, -1.42, 0.16);
      shin.add(foot);
      thigh.add(shin);
      this.body.add(thigh);
    };
    mkLeg(this.lThigh, this.lShin, -0.3);
    mkLeg(this.rThigh, this.rShin, 0.3);
    // Torso
    this.body.add(this.torso);
    const chest = new THREE.Mesh(box(1.3, 1.95, 0.72, false), u.catcherGear ? mat('#2a2a30') : jersey);
    chest.position.y = 0.95;
    this.torso.add(chest);
    const belt = new THREE.Mesh(box(1.32, 0.22, 0.74, false), mat('#1b1b1b'));
    belt.position.y = 0.05;
    this.torso.add(belt);
    if (!u.umpire && !u.catcherGear) {
      const tex = numberTexture(jerseyNo, u.number);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      back.position.set(0, 1.15, -0.37);
      back.rotation.y = Math.PI;
      this.torso.add(back);
      const front = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      front.position.set(0.32, 1.35, 0.37);
      this.torso.add(front);
    }
    // Head
    this.head.position.y = 2.15;
    this.torso.add(this.head);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 10), skin);
    headMesh.position.y = 0.35;
    this.head.add(headMesh);
    const capColor = u.umpire ? mat('#151515') : u.helmet ? mat(u.cap, 0.25, 0.3) : mat(u.cap);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(u.helmet ? 0.47 : 0.43, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), capColor);
    cap.position.y = 0.42;
    this.head.add(cap);
    const brim = new THREE.Mesh(box(0.62, 0.06, 0.42, false), capColor);
    brim.position.set(0, 0.45, 0.42);
    this.head.add(brim);
    if (u.helmet) {
      const flap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), capColor);
      flap.position.set(0.38, 0.32, 0);
      this.head.add(flap);
    }
    if (u.catcherGear) {
      const mask = new THREE.Mesh(box(0.7, 0.75, 0.15, false), mat('#222222', 0.4, 0.4));
      mask.position.set(0, 0.32, 0.4);
      this.head.add(mask);
    }
    // Arms
    const mkArm = (arm: THREE.Group, fore: THREE.Group, x: number) => {
      arm.position.set(x, 1.8, 0);
      arm.add(new THREE.Mesh(capsule(0.18, 0.75), u.umpire ? jersey : trim));
      fore.position.y = -1.1;
      fore.add(new THREE.Mesh(capsule(0.15, 0.7), skin));
      arm.add(fore);
      this.torso.add(arm);
    };
    mkArm(this.lArm, this.lFore, -0.82);
    mkArm(this.rArm, this.rFore, 0.82);
    // Glove on the non-throwing hand
    if (!withBat && !u.umpire) {
      this.glove = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), mat('#6b3f1d', 0.8));
      this.glove.scale.set(1, 1.2, 0.6);
      this.glove.position.y = -1.2;
      (throwsLeft ? this.rFore : this.lFore).add(this.glove);
    }
    if (withBat) {
      const g = new THREE.CylinderGeometry(0.09, 0.04, 2.9, 10);
      g.translate(0, 1.45, 0);
      this.bat = new THREE.Mesh(g, mat('#c89a5b', 0.5));
      this.bat.position.y = -1.15;
      this.rFore.add(this.bat);
    }
    // Ground ring (control / selection) and blob shadow
    this.ring = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.4, 32), new THREE.MeshBasicMaterial({ color: '#3fa9ff', transparent: true, opacity: 0.85, depthWrite: false }));
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.06;
    this.ring.visible = false;
    this.root.add(this.ring);
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(1.3, 16), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.28, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.04;
    this.root.add(this.shadow);
    this.root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o !== this.ring && o !== this.shadow) o.castShadow = true;
    });
  }

  setOpacity(a: number) {
    this.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m === this.ring || m === this.shadow) return;
      const material = m.material as THREE.Material;
      if (this.materials.includes(material)) material.opacity = a;
      else if (a < 1) {
        const clone = material.clone();
        clone.transparent = true;
        clone.opacity = a;
        m.material = clone;
        this.materials.push(clone);
      }
    });
  }

  private reset() {
    for (const g of [this.body, this.torso, this.head, this.lThigh, this.lShin, this.rThigh, this.rShin, this.lArm, this.lFore, this.rArm, this.rFore]) g.rotation.set(0, 0, 0);
    this.body.position.set(0, 3.05, 0);
    this.root.position.y = 0;
    if (this.bat) this.bat.rotation.set(0, 0, 0);
  }

  /** Pose the model. `lefty` mirrors batting/throwing. */
  animate(anim: AnimName, t: number, speed: number, dt: number, lefty: boolean, clock: number) {
    this.reset();
    const mir = lefty ? -1 : 1;
    // throwing arm = right unless lefty
    const tArm = lefty ? this.lArm : this.rArm;
    const tFore = lefty ? this.lFore : this.rFore;
    const gArm = lefty ? this.rArm : this.lArm;
    const gFore = lefty ? this.rFore : this.lFore;
    switch (anim) {
      case 'run':
      case 'trot': {
        this.phase += (speed * dt) / 5.2 * Math.PI * 2 * (anim === 'trot' ? 0.75 : 1);
        const a = Math.min(1, speed / 18) * (anim === 'trot' ? 0.55 : 0.85);
        const s = Math.sin(this.phase);
        this.lThigh.rotation.x = s * a;
        this.rThigh.rotation.x = -s * a;
        this.lShin.rotation.x = -Math.max(0, -s) * a * 1.4 - 0.2;
        this.rShin.rotation.x = -Math.max(0, s) * a * 1.4 - 0.2;
        this.lArm.rotation.x = -s * a * 0.9;
        this.rArm.rotation.x = s * a * 0.9;
        this.lFore.rotation.x = -0.9;
        this.rFore.rotation.x = -0.9;
        this.body.rotation.x = 0.18 * a;
        this.body.position.y = 3.05 + Math.abs(Math.cos(this.phase)) * 0.18 * a;
        break;
      }
      case 'ready': {
        const breath = Math.sin(clock * 2) * 0.02;
        this.body.position.y = 2.75;
        this.body.rotation.x = 0.35;
        this.lThigh.rotation.x = -0.45; this.rThigh.rotation.x = -0.45;
        this.lShin.rotation.x = 0.55; this.rShin.rotation.x = 0.55;
        this.lThigh.rotation.z = -0.15; this.rThigh.rotation.z = 0.15;
        this.lArm.rotation.x = -0.7 + breath; this.rArm.rotation.x = -0.7 + breath;
        this.lFore.rotation.x = -0.6; this.rFore.rotation.x = -0.6;
        break;
      }
      case 'idle': {
        this.lArm.rotation.z = -0.08; this.rArm.rotation.z = 0.08;
        this.torso.rotation.y = Math.sin(clock * 0.7) * 0.05;
        break;
      }
      case 'crouch': {
        this.body.position.y = 1.55;
        this.body.rotation.x = 0.25;
        this.lThigh.rotation.x = -1.45; this.rThigh.rotation.x = -1.45;
        this.lThigh.rotation.z = -0.35; this.rThigh.rotation.z = 0.35;
        this.lShin.rotation.x = 1.9; this.rShin.rotation.x = 1.9;
        gArm.rotation.x = -1.2; gFore.rotation.x = -0.5;
        tArm.rotation.x = -0.3; tFore.rotation.x = -0.4;
        break;
      }
      case 'bat': {
        // Batting stance: knees bent, hands up by the back shoulder, small waggle.
        const w = Math.sin(clock * 3.2) * 0.06;
        this.body.position.y = 2.85;
        this.lThigh.rotation.x = -0.25; this.rThigh.rotation.x = -0.25;
        this.lShin.rotation.x = 0.35; this.rShin.rotation.x = 0.35;
        this.lThigh.rotation.z = -0.25; this.rThigh.rotation.z = 0.25;
        this.torso.rotation.y = -0.25 * mir;
        this.rArm.rotation.set(-1.6, 0, 0.5 * mir + w);
        this.lArm.rotation.set(-1.5, 0, 0.9 * mir);
        this.rFore.rotation.x = -1.2;
        this.lFore.rotation.x = -1.4;
        if (this.bat) this.bat.rotation.set(1.2, 0, -0.8 * mir + w);
        break;
      }
      case 'swing': {
        const k = Math.min(1, t);
        // Stride then rotate the hips/shoulders through the zone.
        const turn = -0.3 + k * 2.3;
        this.body.position.y = 2.8;
        this.torso.rotation.y = turn * mir;
        this.lThigh.rotation.x = -0.3; this.rThigh.rotation.x = -0.15 - k * 0.3;
        this.lShin.rotation.x = 0.3; this.rShin.rotation.x = 0.4 + k * 0.3;
        this.rArm.rotation.set(-1.5 + k * 0.2, 0, (0.5 - k * 1.2) * mir);
        this.lArm.rotation.set(-1.45 + k * 0.1, 0, (0.9 - k * 1.4) * mir);
        this.rFore.rotation.x = -1.2 + k * 0.9;
        this.lFore.rotation.x = -1.4 + k * 1.0;
        if (this.bat) this.bat.rotation.set(1.2 + k * 0.4, 0, (-0.8 - k * 2.4) * mir);
        break;
      }
      case 'pitch': {
        const k = Math.min(1, t);
        if (k < 0.45) {
          // Leg lift
          const u = k / 0.45;
          const lead = lefty ? this.rThigh : this.lThigh;
          const leadShin = lefty ? this.rShin : this.lShin;
          lead.rotation.x = -1.5 * u;
          leadShin.rotation.x = 1.3 * u;
          this.torso.rotation.y = -0.6 * u * mir;
          tArm.rotation.x = -0.9 * u; gArm.rotation.x = -0.9 * u;
          tFore.rotation.x = -1.0 * u; gFore.rotation.x = -1.0 * u;
        } else if (k < 0.78) {
          // Stride, arm cocks back
          const u = (k - 0.45) / 0.33;
          const lead = lefty ? this.rThigh : this.lThigh;
          const leadShin = lefty ? this.rShin : this.lShin;
          const back = lefty ? this.lThigh : this.rThigh;
          lead.rotation.x = -1.5 + u * 0.7;
          leadShin.rotation.x = 1.3 - u * 0.9;
          back.rotation.x = u * 0.5;
          this.body.position.y = 3.05 - u * 0.5;
          this.torso.rotation.y = (-0.6 + u * 0.2) * mir;
          tArm.rotation.set(0.6 * u, 0, 1.4 * u * mir);
          tFore.rotation.x = -1.6 * u;
          gArm.rotation.set(-1.4 * u, 0, -0.2 * mir);
        } else {
          // Release and follow-through
          const u = Math.min(1, (k - 0.78) / 0.22);
          const lead = lefty ? this.rThigh : this.lThigh;
          const back = lefty ? this.lThigh : this.rThigh;
          lead.rotation.x = -0.8 + u * 0.2;
          back.rotation.x = 0.5 + u * 0.5;
          (lefty ? this.lShin : this.rShin).rotation.x = u * 1.0;
          this.body.position.y = 2.55;
          this.body.rotation.x = 0.2 + u * 0.55;
          this.torso.rotation.y = (-0.4 + u * 1.3) * mir;
          tArm.rotation.set(0.6 - u * 3.0, 0, (1.4 - u * 1.2) * mir);
          tFore.rotation.x = -1.6 + u * 1.4;
          gArm.rotation.set(-1.4 + u * 1.0, 0, 0);
        }
        break;
      }
      case 'throw': {
        const k = Math.min(1, t);
        const u = k < 0.4 ? k / 0.4 : 1;
        const v = k < 0.4 ? 0 : (k - 0.4) / 0.6;
        this.torso.rotation.y = (-0.7 * u + 1.4 * v) * mir;
        tArm.rotation.set(0.8 * u - 3.0 * v, 0, 1.3 * mir * (1 - v));
        tFore.rotation.x = -1.4 * u + 1.2 * v;
        gArm.rotation.x = -1.2 * u + v;
        this.body.rotation.x = 0.35 * v;
        this.lThigh.rotation.x = -0.4 * u; this.rThigh.rotation.x = 0.3 * u;
        break;
      }
      case 'catch': {
        this.body.position.y = 2.85;
        gArm.rotation.set(-1.9, 0, -0.2 * mir);
        gFore.rotation.x = -0.3;
        tArm.rotation.x = -1.4;
        tFore.rotation.x = -0.8;
        break;
      }
      case 'dive': {
        const k = Math.min(1, t);
        this.body.rotation.x = 0.4 + k * 1.15;
        this.body.position.y = 3.05 - k * 2.2;
        this.root.position.y = Math.sin(k * Math.PI) * 0.8;
        gArm.rotation.x = -2.9; tArm.rotation.x = -2.6;
        this.lThigh.rotation.x = 0.3; this.rThigh.rotation.x = 0.5;
        break;
      }
      case 'down': {
        this.body.rotation.x = 1.5;
        this.body.position.y = 0.6;
        gArm.rotation.x = -2.9; tArm.rotation.x = -2.4;
        break;
      }
      case 'jump': {
        const k = Math.min(1, t);
        this.root.position.y = Math.sin(k * Math.PI) * 3.2;
        gArm.rotation.set(-3.0, 0, -0.2 * mir);
        tArm.rotation.x = -0.6;
        this.lThigh.rotation.x = -0.3; this.lShin.rotation.x = 0.6;
        break;
      }
      case 'slide': {
        this.body.rotation.x = -1.25;
        this.body.position.y = 0.9;
        this.lThigh.rotation.x = -1.3; this.rThigh.rotation.x = -1.0;
        this.rShin.rotation.x = 1.2;
        this.lArm.rotation.x = -2.6; this.rArm.rotation.x = -2.2;
        break;
      }
      case 'celebrate': {
        const j = Math.abs(Math.sin(clock * 6));
        this.root.position.y = j * 1.2;
        this.lArm.rotation.set(-2.8, 0, -0.3); this.rArm.rotation.set(-2.8, 0, 0.3);
        break;
      }
    }
  }
}
