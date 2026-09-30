/**
 * GameRenderer: reads PlaySim state every frame and draws it with Three.js. It never changes the simulation.
 * Field → scene mapping: scene.x = field x (downfield), scene.z = field y (across), scene.y = height.
 */
import * as THREE from 'three';
import type { PlaySim } from '../engine/sim';
import type { Athlete, AthleteSpec } from '../engine/types';
import { BUTTON_ORDER, FORMATIONS, routePreview, type Slot } from '../engine/playbook';
import { PlayerAvatar, controlRing, type PlayerLook } from './playerModel';
import { buildStadium, drawBoard, FIELD_W, type Stadium, type StadiumTeams } from './stadium';
import { SKIN_TONES, HAIR_COLORS, defaultGear, uniformFor, type CreatedPlayer, type Gear } from '../../career/player';

export type CameraMode = 'qb' | 'broadcast' | 'high';
export const CAMERA_NAMES: Record<CameraMode, string> = { qb: 'Behind the QB', broadcast: 'Broadcast', high: 'All-22' };

/** Receiver icon colors (keys 1..5), gamepad-style. */
export const ICON_COLORS: Record<Slot, string> = { X: '#2f80ff', H: '#e8453c', Y: '#f2c522', Z: '#35c46a', RB: '#b36bff' };

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Build a look for every athlete: the user's created player exactly, everyone else generated from the id. */
export function looksForMatch(specs: AthleteSpec[], cp: CreatedPlayer, homeTeam: string, awayTeam: string): Map<string, PlayerLook> {
  const out = new Map<string, PlayerLook>();
  const home = uniformFor(homeTeam, 'home');
  const away = uniformFor(awayTeam, 'away');
  for (const s of specs) {
    const u = s.side === 'off' ? home : away;
    if (s.user) {
      out.set(s.id, {
        uniform: u,
        gear: cp.gear,
        skin: cp.appearance.skinTone,
        hair: cp.appearance.hair,
        hairColor: cp.appearance.hairColor,
        facialHair: cp.appearance.facialHair,
        number: cp.jersey,
        name: cp.lastName || 'Player',
        heightIn: cp.heightIn,
        weight: cp.weight,
      });
      continue;
    }
    const h = hash(s.id);
    const pick = <T,>(arr: readonly T[], salt: number): T => arr[(h >>> salt) % arr.length];
    const big = s.role === 'OL' || s.role === 'DL';
    const skill = s.role === 'WR' || s.role === 'CB' || s.role === 'S' || s.role === 'RB';
    const gear: Gear = {
      ...defaultGear(),
      facemask: big ? pick(['robot', 'bullbar'] as const, 3) : skill ? pick(['open', 'standard', 'standard'] as const, 3) : pick(['standard', 'bullbar'] as const, 3),
      facemaskColor: pick(['team', 'white', 'black', 'team', 'gray'] as const, 5),
      visor: skill ? pick(['none', 'none', 'clear', 'dark', 'iridescent'] as const, 7) : pick(['none', 'none', 'none', 'clear'] as const, 7),
      mouthguard: pick(['none', 'white', 'black', 'team'] as const, 9),
      eyeBlack: pick(['none', 'stripe', 'sticker'] as const, 11),
      leftSleeve: pick(['none', 'none', 'white', 'black', 'team'] as const, 13),
      rightSleeve: pick(['none', 'none', 'white', 'black', 'team'] as const, 15),
      wristbands: pick(['none', 'white', 'black', 'team'] as const, 17),
      gloves: pick(['team', 'white', 'black', 'team2'] as const, 19),
      handWarmer: s.role === 'RB' ? pick(['none', 'team', 'black'] as const, 21) : 'none',
      towel: skill ? pick(['none', 'front', 'front', 'both'] as const, 23) : pick(['none', 'front'] as const, 23),
      backPlate: skill ? pick(['none', 'team', 'black'] as const, 25) : 'none',
      shoulderPads: big ? 'large' : skill ? pick(['small', 'normal'] as const, 27) : 'normal',
      socks: pick(['team', 'white', 'black', 'high_white'] as const, 29),
      cleats: pick(['black', 'white', 'team', 'black', 'white'] as const, 30),
    };
    out.set(s.id, {
      uniform: u,
      gear,
      skin: pick(SKIN_TONES, 1),
      hair: pick(['buzz', 'short', 'fade', 'dreads', 'curly', 'long'] as const, 4),
      hairColor: pick(HAIR_COLORS.slice(0, 5), 6),
      facialHair: pick(['none', 'none', 'stubble', 'goatee', 'beard'] as const, 8),
      number: s.number,
      name: s.name.split(' ').slice(-1)[0],
      heightIn: s.ratings.height,
      weight: s.ratings.weight,
    });
  }
  return out;
}

const iconTexCache = new Map<string, THREE.Texture>();
function iconTexture(label: string, color: string, ring: string): THREE.Texture {
  const key = `${label}${color}${ring}`;
  const hit = iconTexCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  g.beginPath();
  g.arc(32, 32, 28, 0, Math.PI * 2);
  g.fillStyle = ring;
  g.fill();
  g.beginPath();
  g.arc(32, 32, 22, 0, Math.PI * 2);
  g.fillStyle = color;
  g.fill();
  g.fillStyle = '#fff';
  g.font = 'bold 32px "Arial Black", Impact, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(label, 32, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  iconTexCache.set(key, t);
  return t;
}

export interface RenderOptions {
  readAssist: boolean;
  /** Receiver the user is charging a throw to (enlarges the icon). */
  charging?: string | null;
  showRoutes: boolean;
  firstDownX: number | null;
}

export class GameRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  cameraMode: CameraMode = 'qb';
  /** Camera distance/height multipliers adjustable by the player. */
  zoom = 1;
  height = 1;
  private stadium: Stadium;
  private avatars = new Map<string, PlayerAvatar>();
  private ball: THREE.Group;
  private ballShadow: THREE.Mesh;
  private ring: THREE.Mesh;
  private losLine: THREE.Mesh;
  private fdLine: THREE.Mesh;
  private routes = new THREE.Group();
  private routeKey = '';
  private icons = new Map<string, THREE.Sprite>();
  private camPos = new THREE.Vector3(10, 5, FIELD_W / 2);
  private camLook = new THREE.Vector3(30, 0, FIELD_W / 2);
  private ballSpin = 0;
  private boardKey = '';

  constructor(
    canvas: HTMLCanvasElement,
    specs: AthleteSpec[],
    looks: Map<string, PlayerLook>,
    teams: StadiumTeams,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.camera = new THREE.PerspectiveCamera(52, 16 / 9, 0.1, 2000);
    this.scene.fog = new THREE.Fog('#cfe4f7', 180, 700);
    this.stadium = buildStadium(teams, this.renderer);
    this.scene.add(this.stadium.group);

    for (const s of specs) {
      const av = new PlayerAvatar(looks.get(s.id)!);
      this.avatars.set(s.id, av);
      this.scene.add(av.root);
    }

    // Football: prolate spheroid with laces
    this.ball = new THREE.Group();
    const leather = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ color: '#7a3b17', roughness: 0.6, flatShading: true }));
    leather.scale.set(0.155, 0.095, 0.095);
    leather.castShadow = true;
    const laces = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.02), new THREE.MeshBasicMaterial({ color: '#f5f5f5' }));
    laces.position.y = 0.094;
    const stripeM = new THREE.MeshBasicMaterial({ color: '#f5f5f5' });
    for (const x of [-0.1, 0.1]) {
      const st = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.006, 4, 16).rotateY(Math.PI / 2), stripeM);
      st.position.x = x;
      this.ball.add(st);
    }
    this.ball.add(leather, laces);
    this.scene.add(this.ball);
    this.ballShadow = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.35, depthWrite: false }));
    this.ballShadow.position.y = 0.015;
    this.scene.add(this.ballShadow);

    this.ring = controlRing();
    this.scene.add(this.ring);

    const lineGeo = new THREE.BoxGeometry(0.22, 0.02, FIELD_W);
    this.losLine = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: '#2f80ff', transparent: true, opacity: 0.8, depthWrite: false }));
    this.fdLine = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: '#ffd400', transparent: true, opacity: 0.85, depthWrite: false }));
    this.losLine.position.set(0, 0.012, FIELD_W / 2);
    this.fdLine.position.set(0, 0.014, FIELD_W / 2);
    this.scene.add(this.losLine, this.fdLine, this.routes);

    for (const slot of BUTTON_ORDER) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTexture('1', ICON_COLORS[slot], '#111'), depthTest: false, transparent: true, sizeAttenuation: false }));
      sp.scale.set(0.04, 0.04, 1);
      sp.renderOrder = 10;
      this.icons.set(slot, sp);
      this.scene.add(sp);
    }
  }

  resize(w: number, h: number): void {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  cycleCamera(): CameraMode {
    const order: CameraMode[] = ['qb', 'broadcast', 'high'];
    this.cameraMode = order[(order.indexOf(this.cameraMode) + 1) % order.length];
    return this.cameraMode;
  }

  setBoard(lines: string[], color: string): void {
    const key = lines.join('|');
    if (key === this.boardKey) return;
    this.boardKey = key;
    drawBoard(this.stadium.board, lines, color);
  }

  private updateRoutes(sim: PlaySim, show: boolean) {
    const key = show && sim.phase === 'presnap' ? `${sim.play.id}${sim.los}${sim.spotY}` : '';
    if (key === this.routeKey) return;
    this.routeKey = key;
    for (const c of [...this.routes.children]) {
      this.routes.remove(c);
      (c as THREE.Mesh).geometry?.dispose();
    }
    if (!key) return;
    for (const r of routePreview(sim.play, sim.los, sim.spotY)) {
      const color = ICON_COLORS[r.slot];
      const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false });
      const pts = [r.start, ...r.pts];
      if (r.block) {
        // pass-pro "T"
        const t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 1.2), m);
        t.position.set(r.start.x + 1, 0.03, r.start.y);
        this.routes.add(t);
        continue;
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        let b = pts[i + 1];
        // Clamp long vertical stems for readability.
        if (i === pts.length - 2 && r.continues) b = { x: a.x + (b.x - a.x) * Math.min(1, 18 / Math.max(1, Math.hypot(b.x - a.x, b.y - a.y))), y: a.y + (b.y - a.y) * Math.min(1, 18 / Math.max(1, Math.hypot(b.x - a.x, b.y - a.y))) };
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const seg = new THREE.Mesh(new THREE.BoxGeometry(len, 0.02, 0.22), m);
        seg.position.set((a.x + b.x) / 2, 0.03, (a.y + b.y) / 2);
        seg.rotation.y = -Math.atan2(b.y - a.y, b.x - a.x);
        this.routes.add(seg);
        if (i === pts.length - 2) {
          const head = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1, 3).rotateZ(-Math.PI / 2).scale(1, 0.05, 1), m);
          head.position.set(b.x, 0.03, b.y);
          head.rotation.y = -Math.atan2(b.y - a.y, b.x - a.x);
          this.routes.add(head);
        }
      }
    }
  }

  render(sim: PlaySim, dt: number, opts: RenderOptions): void {
    const shotgun = FORMATIONS[sim.play.formation].shotgun;
    const carrier = sim.carrier();
    for (const a of sim.athletes) {
      const av = this.avatars.get(a.id)!;
      av.update(
        {
          x: a.x,
          y: a.y,
          facing: a.facing,
          vx: a.vx,
          vy: a.vy,
          pose: a.pose,
          poseT: a.poseT,
          moveKind: a.move?.kind,
          hasBall: !!a.ball,
          lineman: a.role === 'OL' || a.role === 'DL',
          shotgunQB: a.role === 'QB' && shotgun,
        },
        dt,
      );
    }

    // Ball
    const b = sim.ball;
    this.ballSpin += dt * 30;
    if (b.state === 'held' && carrier) {
      const av = this.avatars.get(carrier.id)!;
      this.ball.position.copy(av.handWorld);
      this.ball.position.y -= 0.04;
      this.ball.rotation.set(0, -carrier.facing, 0.35);
    } else if (b.state === 'air' || b.state === 'snap') {
      this.ball.position.set(b.x, Math.max(0.1, b.z), b.y);
      const sp = Math.hypot(b.vx, b.vy);
      this.ball.rotation.set(0, 0, 0);
      this.ball.rotation.order = 'YZX';
      this.ball.rotation.y = -Math.atan2(b.vy, b.vx);
      this.ball.rotation.z = Math.atan2(b.vz, sp || 1) * 0.8;
      this.ball.rotation.x = b.state === 'air' ? this.ballSpin : 0;
    } else {
      this.ball.position.set(b.x, 0.1, b.y);
      this.ball.rotation.set(0, 0, 0);
    }
    this.ballShadow.position.set(this.ball.position.x, 0.015, this.ball.position.z);
    this.ballShadow.visible = this.ball.position.y > 0.2;

    // Controlled-player ring
    const me = sim.controlled;
    this.ring.position.set(me.x, 0.02, me.y);

    // Lines
    this.losLine.position.x = sim.los;
    this.fdLine.visible = opts.firstDownX !== null && opts.firstDownX < 100;
    if (opts.firstDownX !== null) this.fdLine.position.x = opts.firstDownX;
    this.updateRoutes(sim, opts.showRoutes);

    // Receiver icons: shown while the QB can still throw.
    const canThrow = me.role === 'QB' && (sim.phase === 'presnap' || ((b.state === 'held' || b.state === 'snap') && me.x <= sim.los + 0.2));
    BUTTON_ORDER.forEach((slot, i) => {
      const sp = this.icons.get(slot)!;
      const r = sim.bySlot(slot);
      const eligible = r && (sim.phase === 'presnap' || r.task.kind === 'route' || r.task.kind === 'fake' || (r.task.kind === 'passpro' && r.task.releaseAt !== undefined));
      sp.visible = !!(canThrow && r && eligible);
      if (!sp.visible || !r) return;
      let ring = '#111';
      if (opts.readAssist && sim.phase === 'live') {
        const sep = sim.separation(slot);
        ring = sep > 3 ? '#3ddc84' : sep > 1.6 ? '#ffcc33' : '#ff4d4d';
      }
      (sp.material as THREE.SpriteMaterial).map = iconTexture(String(i + 1), ICON_COLORS[slot], ring);
      const big = opts.charging === slot ? 1.45 : 1;
      sp.scale.set(0.042 * big, 0.042 * big, 1);
      sp.position.set(r.x, 2.9 + (big > 1 ? 0.2 : 0), r.y);
    });

    this.updateCamera(sim, dt, carrier);
    // Shadow frustum follows the action.
    const sun = this.stadium.sun;
    sun.target.position.set(this.camLook.x, 0, this.camLook.z);
    sun.position.set(this.camLook.x + 30, 60, this.camLook.z - 25);
    this.renderer.render(this.scene, this.camera);
  }

  private updateCamera(sim: PlaySim, dt: number, carrier: Athlete | undefined) {
    const b = sim.ball;
    const me = sim.controlled;
    let focus: THREE.Vector3;
    if (b.state === 'air') focus = new THREE.Vector3(b.x, 0, b.y);
    else if (carrier) focus = new THREE.Vector3(carrier.x, 0, carrier.y);
    else focus = new THREE.Vector3(me.x, 0, me.y);
    const pos = new THREE.Vector3();
    const look = new THREE.Vector3();
    const z = this.zoom;
    const h = this.height;
    if (this.cameraMode === 'qb') {
      const qbPhase = me.role === 'QB' && b.state !== 'air';
      if (qbPhase) {
        // Behind the quarterback, looking downfield over his shoulder.
        pos.set(me.x - 8.5 * z, 4.6 * h * Math.sqrt(z), me.y * 0.8 + sim.spotY * 0.2);
        look.set(me.x + 16, 0.5, me.y * 0.6 + sim.spotY * 0.4);
      } else if (b.state === 'air') {
        const tx = b.landing?.x ?? b.x;
        const ty = b.landing?.y ?? b.y;
        pos.set(Math.min(b.x, tx) - 9 * z, 6 * h * Math.sqrt(z), (b.y + ty) / 2);
        look.set(tx + 2, 0.5, ty);
      } else {
        pos.set(focus.x - 9 * z, 4.8 * h * Math.sqrt(z), focus.z);
        look.set(focus.x + 9, 0.6, focus.z);
      }
    } else if (this.cameraMode === 'broadcast') {
      pos.set(focus.x - 2, 17 * h * z, FIELD_W + 26 * z);
      look.set(focus.x + 3, 0, focus.z * 0.5 + FIELD_W * 0.25);
    } else {
      pos.set(focus.x - 22 * z, 26 * h * z, FIELD_W / 2 * 0.3 + focus.z * 0.7);
      look.set(focus.x + 12, 0, FIELD_W / 2 * 0.3 + focus.z * 0.7);
    }
    const kPos = 1 - Math.exp(-dt * (b.state === 'air' ? 3 : 5));
    const kLook = 1 - Math.exp(-dt * (b.state === 'air' ? 4 : 7));
    this.camPos.lerp(pos, kPos);
    this.camLook.lerp(look, kLook);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  /** Snap the camera to its target (after a new play is set up). */
  resetCamera(sim: PlaySim): void {
    for (let i = 0; i < 60; i++) this.updateCamera(sim, 1 / 10, sim.carrier());
  }

  dispose(): void {
    // Player geometries/materials are shared module-wide (reused by the next game and the gear preview),
    // so only the GL context resources owned by this renderer are released.
    // (No forceContextLoss: React may remount on the same canvas and must get a live context back.)
    this.renderer.dispose();
  }
}
