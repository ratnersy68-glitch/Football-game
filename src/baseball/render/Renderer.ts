/**
 * Renderer: draws a Snapshot (players, ball, indicators) inside the built stadium, plus
 * game-feel effects: ball trails, landing indicator, PCI, strike zone, rain, fireworks.
 */
import * as THREE from 'three';
import type { GameSettings, Team } from '../core/types';
import { STADIUM_BY_ID } from '../data/stadiums';
import { TEAM_BY_ID } from '../managers/TeamManager';
import type { Actor, Snapshot } from '../engine/GameEngine';
import { CONTACT_Z, PLATE_Z } from '../engine/PitchEngine';
import { CameraManager, type CamMode } from './CameraManager';
import { PlayerModel, type Uniform } from './PlayerModel';
import { buildStadium, drawScoreboard, T, type BuiltStadium, type ScoreboardData } from './StadiumBuilder';

export interface ViewState {
  mode: CamMode;
  pci: { x: number; y: number; r: number; color: string } | null;
  zone: boolean;
  target: { x: number; y: number; color: string } | null;
  focus: { x: number; z: number } | null;
  dimCatcher: boolean;
}

const SKINS = ['#f1c9a5', '#e0ac85', '#c68b62', '#a8704a', '#8a5636', '#6b4027', '#f5d3b8'];
const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

export class Renderer {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camMgr: CameraManager;
  stadium: BuiltStadium | null = null;
  private stadiumGroup: THREE.Group | null = null;
  private models = new Map<string, PlayerModel>();
  private teams: { home: Team; away: Team } | null = null;
  private ball: THREE.Mesh;
  private ballShadow: THREE.Mesh;
  private trail: THREE.InstancedMesh;
  private trailPts: THREE.Vector3[] = [];
  private landing: THREE.Group;
  private pci: THREE.Group;
  private zone: THREE.Group;
  private target: THREE.Group;
  private rain: THREE.Points | null = null;
  private fw: { pts: THREE.Points; vel: Float32Array; life: number }[] = [];
  private lastBoard = '';
  private clock = 0;
  private dummy = new THREE.Object3D();
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.camMgr = new CameraManager(1);
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.121, 16, 12), new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#444444', roughness: 0.4 }));
    this.ball.castShadow = true;
    this.scene.add(this.ball);
    this.ballShadow = new THREE.Mesh(new THREE.CircleGeometry(0.35, 16), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.4, depthWrite: false }));
    this.ballShadow.rotation.x = -Math.PI / 2;
    this.scene.add(this.ballShadow);
    this.trail = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false }), 40);
    this.trail.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(40 * 3), 3);
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);

    // Landing indicator
    this.landing = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 48), new THREE.MeshBasicMaterial({ color: '#ffe14d', transparent: true, opacity: 0.9, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: '#ffe14d', transparent: true, opacity: 0.9, depthWrite: false }));
    dot.rotation.x = -Math.PI / 2;
    this.landing.add(ring, dot);
    this.landing.position.y = 0.15;
    this.scene.add(this.landing);

    // PCI
    this.pci = new THREE.Group();
    const pmat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, depthTest: false, depthWrite: false });
    const pRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), pmat);
    const pIn = new THREE.Mesh(new THREE.RingGeometry(0.0, 0.16, 24), pmat);
    const bars = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 2.6), pmat);
    const bars2 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.06), pmat);
    this.pci.add(pRing, pIn, bars, bars2);
    this.pci.traverse((o) => (o.renderOrder = 20));
    this.scene.add(this.pci);

    // Strike zone
    this.zone = new THREE.Group();
    const zm = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthTest: false });
    const zx = 0.708, zb = 1.55, zt = 3.45;
    const pts: number[] = [];
    const seg = (a: number[], b: number[]) => pts.push(...a, ...b);
    seg([-zx, zb, 0], [zx, zb, 0]); seg([zx, zb, 0], [zx, zt, 0]); seg([zx, zt, 0], [-zx, zt, 0]); seg([-zx, zt, 0], [-zx, zb, 0]);
    const zg = new THREE.BufferGeometry();
    zg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const zl = new THREE.LineSegments(zg, zm);
    zl.renderOrder = 19;
    const inner: number[] = [];
    for (let i = 1; i < 3; i++) {
      const x = -zx + (2 * zx * i) / 3, y = zb + ((zt - zb) * i) / 3;
      inner.push(x, zb, 0, x, zt, 0, -zx, y, 0, zx, y, 0);
    }
    const ig = new THREE.BufferGeometry();
    ig.setAttribute('position', new THREE.Float32BufferAttribute(inner, 3));
    const il = new THREE.LineSegments(ig, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.18, depthTest: false }));
    il.renderOrder = 19;
    this.zone.add(zl, il);
    this.zone.position.z = -PLATE_Z;
    this.scene.add(this.zone);

    // Pitch target marker
    this.target = new THREE.Group();
    const tm = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.95, depthTest: false, depthWrite: false });
    this.target.add(new THREE.Mesh(new THREE.RingGeometry(0.17, 0.22, 32), tm));
    this.target.add(new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.55), tm));
    this.target.add(new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.03), tm));
    this.target.traverse((o) => (o.renderOrder = 21));
    this.target.position.z = -PLATE_Z;
    this.scene.add(this.target);
  }

  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    this.camMgr.cam.aspect = w / h;
    this.camMgr.cam.updateProjectionMatrix();
  }

  /** Build the park + uniforms for a game (or for the menu backdrop). */
  loadGame(settings: Pick<GameSettings, 'stadiumId' | 'conditions'> & { homeId: string; awayId: string }) {
    if (this.stadiumGroup) {
      this.scene.remove(this.stadiumGroup);
      this.stadiumGroup.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
    }
    for (const m of this.models.values()) this.scene.remove(m.root);
    this.models.clear();
    const st = STADIUM_BY_ID[settings.stadiumId];
    const home = TEAM_BY_ID[settings.homeId];
    this.teams = { home, away: TEAM_BY_ID[settings.awayId] };
    this.stadium = buildStadium(st, home, settings.conditions);
    this.stadiumGroup = this.stadium.group;
    this.scene.add(this.stadiumGroup);
    const sky = this.stadium.skyColor;
    this.scene.fog = new THREE.Fog(sky.clone().lerp(new THREE.Color('#ffffff'), 0.2), 700, 2400);
    this.renderer.toneMappingExposure = settings.conditions.time === 'Night' ? 1.1 : 1.0;
    // Rain
    if (this.rain) { this.scene.remove(this.rain); this.rain = null; }
    if (settings.conditions.weather === 'Light Rain') {
      const n = 4000;
      const p = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 200; p[i * 3 + 1] = Math.random() * 120; p[i * 3 + 2] = (Math.random() - 0.5) * 200; }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      this.rain = new THREE.Points(g, new THREE.PointsMaterial({ color: '#cfe3ff', size: 0.35, transparent: true, opacity: 0.55, depthWrite: false }));
      this.rain.frustumCulled = false;
      this.scene.add(this.rain);
    }
    this.lastBoard = '';
  }

  private uniformFor(a: Actor): Uniform {
    if (a.side === 'ump') return { jersey: '#1c2533', pants: '#5d636b', trim: '#1c2533', cap: '#111', number: '#fff', skin: SKINS[hash(a.id) % SKINS.length], helmet: false, catcherGear: false, umpire: true };
    const t = this.teams![a.side];
    const home = a.side === 'home';
    const prim = t.colors.primary;
    const light = (c: string) => { const col = new THREE.Color(c); return col.r + col.g + col.b > 2.2; };
    const trim = light(prim) ? t.colors.secondary : prim;
    return {
      jersey: home ? '#f4f3ee' : '#a9afb7',
      pants: home ? '#efeee8' : '#a3a9b1',
      trim,
      cap: trim,
      number: trim,
      skin: SKINS[hash(a.id) % SKINS.length],
      helmet: a.kind === 'batter' || a.kind === 'runner',
      catcherGear: a.pos === 'C',
      umpire: false,
    };
  }

  private modelFor(a: Actor): PlayerModel {
    const key = `${a.id}:${a.kind}:${a.side}:${a.pos === 'C' ? 'C' : ''}`;
    let m = this.models.get(key);
    if (!m) {
      m = new PlayerModel(this.uniformFor(a), a.number, a.throws === 'L', a.kind === 'batter');
      this.models.set(key, m);
      this.scene.add(m.root);
    }
    return m;
  }

  shake(a: number) {
    this.camMgr.shake(a);
  }

  fireworks(colors: string[]) {
    if (!this.stadium) return;
    const o = this.stadium.fireworksOrigin;
    for (let b = 0; b < 4; b++) {
      const n = 140;
      const pos = new Float32Array(n * 3);
      const vel = new Float32Array(n * 3);
      const c = new THREE.Vector3(o.x + (Math.random() - 0.5) * 120, o.y + Math.random() * 40, o.z + (Math.random() - 0.5) * 60);
      for (let i = 0; i < n; i++) {
        pos.set([c.x, c.y, c.z], i * 3);
        const v = new THREE.Vector3().randomDirection().multiplyScalar(25 + Math.random() * 15);
        vel.set([v.x, v.y, v.z], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: colors[b % colors.length], size: 3, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending }));
      pts.frustumCulled = false;
      this.scene.add(pts);
      this.fw.push({ pts, vel, life: 2.2 + b * 0.3 });
    }
  }

  updateScoreboard(d: ScoreboardData) {
    if (!this.stadium) return;
    const k = JSON.stringify(d);
    if (k === this.lastBoard) return;
    this.lastBoard = k;
    drawScoreboard(this.stadium.scoreboard, d);
  }

  /** Mouse position -> point on the vertical plane at field z (for PCI / pitch aiming). */
  planePoint(clientX: number, clientY: number, fieldZ: number): { x: number; y: number } | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camMgr.cam);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), fieldZ);
    const hit = new THREE.Vector3();
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    return { x: hit.x, y: hit.y };
  }

  frame(snap: Snapshot | null, view: ViewState, dt: number) {
    this.clock += dt;
    if (snap) this.drawSnapshot(snap, view, dt);
    else {
      for (const m of this.models.values()) m.root.visible = false;
      this.ball.visible = false; this.ballShadow.visible = false; this.trail.count = 0; this.landing.visible = false;
    }
    // PCI / zone / target
    if (view.pci) {
      this.pci.visible = true;
      this.pci.position.set(view.pci.x, view.pci.y, -CONTACT_Z);
      this.pci.scale.setScalar(view.pci.r);
      this.pci.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial; if (m?.color) m.color.set(view.pci!.color); });
    } else this.pci.visible = false;
    this.zone.visible = view.zone;
    if (view.target) {
      this.target.visible = true;
      this.target.position.set(view.target.x, view.target.y, -PLATE_Z);
      this.target.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial; if (m?.color) m.color.set(view.target!.color); });
    } else this.target.visible = false;

    // Effects
    if (this.rain) {
      const p = this.rain.geometry.attributes.position as THREE.BufferAttribute;
      const c = this.camMgr.cam.position;
      for (let i = 0; i < p.count; i++) {
        let y = p.getY(i) - 70 * dt;
        if (y < 0) y += 120;
        p.setY(i, y);
      }
      p.needsUpdate = true;
      this.rain.position.set(c.x, 0, c.z);
    }
    for (const f of this.fw) {
      f.life -= dt;
      const p = f.pts.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        f.vel[i * 3 + 1] -= 18 * dt;
        p.setXYZ(i, p.getX(i) + f.vel[i * 3] * dt, p.getY(i) + f.vel[i * 3 + 1] * dt, p.getZ(i) + f.vel[i * 3 + 2] * dt);
      }
      p.needsUpdate = true;
      (f.pts.material as THREE.PointsMaterial).opacity = Math.max(0, Math.min(1, f.life));
      if (f.life <= 0) { this.scene.remove(f.pts); f.pts.geometry.dispose(); }
    }
    this.fw = this.fw.filter((f) => f.life > 0);

    this.camMgr.update(dt, {
      ball: snap ? snap.ball : { x: 0, y: 0, z: 0, visible: false },
      focus: view.focus,
      batterLefty: false,
    });
    this.renderer.render(this.scene, this.camMgr.cam);
  }

  private drawSnapshot(snap: Snapshot, view: ViewState, dt: number) {
    const seen = new Set<PlayerModel>();
    for (const a of snap.actors) {
      if (a.kind === 'umpire' && view.mode === 'batting') continue;
      const m = this.modelFor(a);
      seen.add(m);
      m.root.visible = true;
      m.root.position.set(a.x, a.y, -a.z);
      m.root.rotation.y = Math.PI - a.facing;
      const lefty = a.kind === 'batter' ? a.bats === 'L' : a.throws === 'L';
      m.animate(a.anim, a.animT, a.speed, dt, lefty, this.clock + (hash(a.id) % 100) / 10);
      m.ring.visible = a.controlled || !!a.selected;
      if (m.ring.visible) {
        (m.ring.material as THREE.MeshBasicMaterial).color.set(a.controlled ? '#3fa9ff' : '#ffd34d');
        m.ring.scale.setScalar(1 + Math.sin(this.clock * 6) * 0.08);
      }
      m.setOpacity(view.dimCatcher && a.pos === 'C' ? 0.35 : 1);
    }
    for (const m of this.models.values()) if (!seen.has(m)) m.root.visible = false;

    // Ball
    const b = snap.ball;
    this.ball.visible = b.visible;
    this.ballShadow.visible = b.visible && b.y < 200;
    if (b.visible) {
      this.ball.position.copy(T(b.x, b.y, b.z));
      const big = view.mode === 'batting' || view.mode === 'pitching' ? 1.25 : 2.4;
      this.ball.scale.setScalar(big);
      (this.ball.material as THREE.MeshStandardMaterial).emissive.set(view.mode === 'batting' ? '#777' : '#555');
      this.ballShadow.position.copy(T(b.x, 0.12, b.z));
      this.ballShadow.scale.setScalar(Math.max(0.6, 1.6 - b.y / 60) * (big / 1.3));
      (this.ballShadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.12, 0.45 - b.y / 150);
    }
    // Trail
    if (b.visible && b.trail) {
      this.trailPts.unshift(this.ball.position.clone());
      if (this.trailPts.length > 40) this.trailPts.pop();
    } else if (this.trailPts.length) this.trailPts.splice(Math.max(0, this.trailPts.length - 3));
    const col = new THREE.Color(b.color);
    const n = this.trailPts.length;
    for (let i = 0; i < n; i++) {
      const s = (1 - i / n) * this.ball.scale.x * 0.95;
      this.dummy.position.copy(this.trailPts[i]);
      this.dummy.scale.setScalar(s);
      this.dummy.updateMatrix();
      this.trail.setMatrixAt(i, this.dummy.matrix);
      this.trail.setColorAt(i, col.clone().multiplyScalar(1 - i / n * 0.6));
    }
    this.trail.count = n;
    this.trail.instanceMatrix.needsUpdate = true;
    if (this.trail.instanceColor) this.trail.instanceColor.needsUpdate = true;

    // Landing indicator
    if (snap.landing) {
      this.landing.visible = true;
      this.landing.position.set(snap.landing.x, 0.15, -snap.landing.z);
      const r = snap.landing.r;
      (this.landing.children[0] as THREE.Mesh).scale.setScalar(r);
    } else this.landing.visible = false;
  }
}
