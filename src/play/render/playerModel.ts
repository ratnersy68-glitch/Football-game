/**
 * Low-poly, PS2/PS3-style football player built from primitives. Every gear option in
 * src/career/data/gear.json maps to something visible here (facemask style/color, visor, mouthguard,
 * eye black, per-arm sleeves, wristbands/play card, gloves, hand warmer, towel, back plate, shoulder pad
 * size, socks, cleats). The rig is a small joint hierarchy animated procedurally by `PlayerAvatar.update`.
 *
 * Model space: +X is the direction the player faces, +Y is up, +Z is the player's right. Units are yards.
 */
import * as THREE from 'three';
import type { Appearance, Gear, UniformColors } from '../../career/player';
import { gearColor } from '../../career/player';

const IN = 1 / 36; // inches → yards

export interface PlayerLook {
  uniform: UniformColors;
  gear: Gear;
  skin: string;
  hair: Appearance['hair'];
  hairColor: string;
  facialHair: Appearance['facialHair'];
  number: number;
  name: string;
  heightIn: number;
  weight: number;
}

// ───────────── shared resources ─────────────

const geo = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 12, 9),
  sphereHi: new THREE.SphereGeometry(1, 16, 12),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 8).translate(0, -0.5, 0), // hangs down from its origin
  cylTaper: new THREE.CylinderGeometry(1, 0.8, 1, 8).translate(0, -0.5, 0),
  bar: new THREE.CylinderGeometry(1, 1, 1, 5).rotateX(Math.PI / 2), // along Z
  barV: new THREE.CylinderGeometry(1, 1, 1, 5), // along Y
  plane: new THREE.PlaneGeometry(1, 1),
  disc: new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2),
  // Helmet: crown (top ~70°) and a lower band that leaves a ~110° face opening toward +X.
  helmetCrown: new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, 1.2),
  helmetBand: new THREE.SphereGeometry(1, 16, 8, Math.PI + 0.95, Math.PI * 2 - 1.9, 1.2, 1.25),
  // Meridian stripe from the front brow (theta≈1.1) over the top to the back of the shell.
  stripe: meridian(0.085),
  stripeWide: meridian(0.15),
};

function meridian(w: number): THREE.BufferGeometry {
  const front = new THREE.SphereGeometry(1, 2, 10, Math.PI - w, 2 * w, 0, 1.15);
  const back = new THREE.SphereGeometry(1, 2, 14, -w, 2 * w, 0, 1.9);
  const pos: number[] = [];
  for (const g of [front, back]) {
    const ng = g.toNonIndexed();
    pos.push(...(ng.attributes.position.array as Float32Array));
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.computeVertexNormals();
  return out;
}

const matCache = new Map<string, THREE.Material>();
function mat(color: string, opts: { metal?: number; rough?: number; opacity?: number; side?: THREE.Side } = {}): THREE.Material {
  const key = `${color}|${opts.metal ?? 0}|${opts.rough ?? 0.85}|${opts.opacity ?? 1}|${opts.side ?? 0}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      metalness: opts.metal ?? 0,
      roughness: opts.rough ?? 0.85,
      flatShading: true,
      transparent: (opts.opacity ?? 1) < 1,
      opacity: opts.opacity ?? 1,
      side: opts.side ?? THREE.FrontSide,
    });
    matCache.set(key, m);
  }
  return m;
}

const texCache = new Map<string, THREE.Texture>();
/** Jersey panel texture (front or back) with the number, plus the name bar on the back. */
function jerseyTexture(u: UniformColors, num: number, back: boolean, name: string): THREE.Texture {
  const key = `${u.jersey}${u.number}${u.numberOutline}${u.trim}${num}${back}${name}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 160;
  const g = c.getContext('2d')!;
  g.fillStyle = u.jersey;
  g.fillRect(0, 0, 128, 160);
  // Collar
  g.fillStyle = u.trim;
  if (!back) {
    g.beginPath();
    g.moveTo(40, 0);
    g.lineTo(64, 26);
    g.lineTo(88, 0);
    g.lineTo(80, 0);
    g.lineTo(64, 16);
    g.lineTo(48, 0);
    g.fill();
  } else g.fillRect(34, 0, 60, 6);
  const text = String(num);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (back && name) {
    g.font = 'bold 15px Arial Narrow, Arial, sans-serif';
    g.fillStyle = u.number;
    g.fillText(name.toUpperCase().slice(0, 12), 64, 26);
  }
  g.font = `bold ${back ? 84 : 76}px "Arial Black", Impact, sans-serif`;
  g.lineWidth = 8;
  g.strokeStyle = u.numberOutline;
  const y = back ? 92 : 88;
  g.strokeText(text, 64, y);
  g.fillStyle = u.number;
  g.fillText(text, 64, y);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

function playCardTexture(): THREE.Texture {
  const hit = texCache.get('playcard');
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 32;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f2f2f2';
  g.fillRect(0, 0, 64, 32);
  g.fillStyle = '#222';
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) g.fillRect(4 + k * 20, 4 + r * 7, 14, 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set('playcard', t);
  return t;
}

function mesh(g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], sx: number, sy: number, sz: number, x = 0, y = 0, z = 0): THREE.Mesh {
  const o = new THREE.Mesh(g, m);
  o.scale.set(sx, sy, sz);
  o.position.set(x, y, z);
  o.castShadow = true;
  return o;
}

// ───────────── rig ─────────────

interface Limb {
  upper: THREE.Group;
  lower: THREE.Group;
  end: THREE.Object3D;
}

export interface Rig {
  root: THREE.Group;
  body: THREE.Group; // everything above the ground; lowered/pitched for poses
  pelvis: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  towels: THREE.Object3D[];
  hipHeight: number;
}

function colorOrSkin(token: string, u: UniformColors, skin: string): string {
  return token === 'none' ? skin : gearColor(token, u);
}

/** Build the player mesh hierarchy. */
export function buildPlayer(look: PlayerLook): Rig {
  const u = look.uniform;
  const gear = look.gear;
  const k = look.heightIn / 80; // the rig is modeled at 6'8" to the top of the helmet
  const wf = THREE.MathUtils.clamp(1.0 + (look.weight - 200) / 380, 0.92, 1.55); // girth
  const pad = gear.shoulderPads === 'large' ? 1.12 : gear.shoulderPads === 'small' ? 0.9 : 1;
  const skinM = mat(look.skin);
  const jerseyM = mat(u.jersey);
  const pantsM = mat(u.pants, { rough: 0.6 });
  const trimM = mat(u.trim);

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  body.scale.setScalar(k);

  const hipH = 38 * IN;
  const pelvis = new THREE.Group();
  pelvis.position.y = hipH;
  body.add(pelvis);
  pelvis.add(mesh(geo.box, pantsM, 9 * IN * wf, 9 * IN, 14 * IN * wf, 0, 2 * IN, 0));
  // Belt
  pelvis.add(mesh(geo.box, mat('#1a1a1a'), 9.4 * IN * wf, 1.2 * IN, 14.4 * IN * wf, 0, 6 * IN, 0));

  // Torso (jersey with number panels on front (+X) and back (-X)).
  const torso = new THREE.Group();
  torso.position.y = 6 * IN;
  pelvis.add(torso);
  const front = new THREE.MeshStandardMaterial({ map: jerseyTexture(u, look.number, false, ''), roughness: 0.8, flatShading: true });
  const backM = new THREE.MeshStandardMaterial({ map: jerseyTexture(u, look.number, true, look.name), roughness: 0.8, flatShading: true });
  // Box face order: +x, -x, +y, -y, +z, -z
  const chest = mesh(geo.box, [front, backM, jerseyM, jerseyM, jerseyM, jerseyM], 11 * IN * wf, 19 * IN, 17 * IN * wf, 0, 9.5 * IN, 0);
  torso.add(chest);
  // Shoulder pads (under the jersey → jersey colored, with trim stripes on the caps).
  torso.add(mesh(geo.box, jerseyM, 14 * IN * wf, 6 * IN, 25 * IN * pad * wf, 0, 18.5 * IN, 0));
  torso.add(mesh(geo.box, trimM, 14.2 * IN * wf, 1 * IN, 25.2 * IN * pad * wf, 0, 16.8 * IN, 0));
  // Back plate
  if (gear.backPlate !== 'none') torso.add(mesh(geo.box, mat(gearColor(gear.backPlate, u)), 1.4 * IN, 4 * IN, 9 * IN, -6.2 * IN * wf, 3 * IN, 0));
  // Hand warmer on the belly
  if (gear.handWarmer !== 'none') torso.add(mesh(geo.box, mat(gearColor(gear.handWarmer, u)), 4 * IN, 5 * IN, 11 * IN, 6.5 * IN * wf, 1.5 * IN, 0));

  // Towels hang from the waistband.
  const towels: THREE.Object3D[] = [];
  const towelM = mat('#f7f7f7', { side: THREE.DoubleSide });
  const addTowel = (x: number, z: number, ry: number) => {
    const piv = new THREE.Group();
    piv.position.set(x, 5.5 * IN, z);
    piv.rotation.y = ry;
    const t = mesh(geo.plane, towelM, 5 * IN, 11 * IN, 1, 0, -5.5 * IN, 0);
    piv.add(t);
    pelvis.add(piv);
    towels.push(piv);
  };
  if (gear.towel === 'front') addTowel(4.9 * IN * wf, 3 * IN, Math.PI / 2);
  if (gear.towel === 'back') addTowel(-4.9 * IN * wf, -3 * IN, Math.PI / 2);
  if (gear.towel === 'both') {
    addTowel(1 * IN, 7.3 * IN * wf, 0);
    addTowel(1 * IN, -7.3 * IN * wf, 0);
  }

  // Neck + head
  torso.add(mesh(geo.cyl, skinM, 3 * IN * wf, 4.5 * IN, 3 * IN * wf, 0, 26.5 * IN, 0));
  const head = new THREE.Group();
  head.position.y = 26.5 * IN;
  torso.add(head);
  buildHead(head, look);

  // Arms
  const armL = buildArm(look, -1, pad, wf);
  const armR = buildArm(look, 1, pad, wf);
  torso.add(armL.upper, armR.upper);

  // Legs
  const legL = buildLeg(look, -1, wf);
  const legR = buildLeg(look, 1, wf);
  pelvis.add(legL.upper, legR.upper);

  return { root, body, pelvis, torso, head, armL, armR, legL, legR, towels, hipHeight: hipH * k };
}

function buildHead(head: THREE.Group, look: PlayerLook) {
  const u = look.uniform;
  const gear = look.gear;
  const skinM = mat(look.skin);
  const R = 6.3 * IN;
  const hc = new THREE.Group();
  hc.position.y = 4.5 * IN;
  head.add(hc);
  // Face (skin) peeking out of the helmet opening
  hc.add(mesh(geo.sphere, skinM, 4.3 * IN, 4.8 * IN, 4 * IN, 2.4 * IN, -1 * IN, 0));
  // Helmet shell (glossy)
  // Shell = full crown + a lower band with the face opening cut out of the front (+X).
  const shellM = mat(u.helmet, { metal: u.helmet === '#C0C4C8' ? 0.55 : 0.15, rough: 0.28, side: THREE.DoubleSide });
  hc.add(mesh(geo.helmetCrown, shellM, R * 1.06, R, R * 0.96, -0.4 * IN, 0.4 * IN, 0));
  hc.add(mesh(geo.helmetBand, shellM, R * 1.06, R, R * 0.96, -0.4 * IN, 0.4 * IN, 0));
  // Center stripe (with white edges for scarlet stripes)
  // Center stripe following the shell from the brow over the crown to the back (white-edged for scarlet stripes)
  const stripe = (g: THREE.BufferGeometry, color: string, sc: number) =>
    hc.add(mesh(g, mat(color, { rough: 0.35, side: THREE.DoubleSide }), R * 1.06 * sc, R * sc, R * 0.96 * sc, -0.4 * IN, 0.4 * IN, 0));
  if (u.helmetStripe.toUpperCase() === '#BB0000') stripe(geo.stripeWide, '#FFFFFF', 1.012);
  stripe(geo.stripe, u.helmetStripe, 1.02);
  // Ear holes / side decals
  const decalM = mat(u.helmetStripe);
  hc.add(mesh(geo.sphere, decalM, 1.2 * IN, 1.2 * IN, 0.3 * IN, -0.5 * IN, -0.3 * IN, R * 0.95));
  hc.add(mesh(geo.sphere, decalM, 1.2 * IN, 1.2 * IN, 0.3 * IN, -0.5 * IN, -0.3 * IN, -R * 0.95));

  // Eye black
  if (gear.eyeBlack !== 'none') {
    const eb = mat('#0a0a0a');
    for (const z of [-1.4, 1.4]) {
      if (gear.eyeBlack === 'stripe') hc.add(mesh(geo.box, eb, 0.3 * IN, 0.6 * IN, 1.6 * IN, 6.45 * IN, -1.6 * IN, z * IN));
      else hc.add(mesh(geo.box, eb, 0.3 * IN, 1.1 * IN, 1.4 * IN, 6.45 * IN, -1.7 * IN, z * IN));
    }
  }
  // Facial hair
  if (look.facialHair !== 'none') {
    const hm = mat(look.hairColor);
    if (look.facialHair === 'beard' || look.facialHair === 'stubble')
      hc.add(mesh(geo.box, look.facialHair === 'stubble' ? mat(shade(look.skin, 0.72)) : hm, 1.2 * IN, 2.6 * IN, 5.6 * IN, 5.9 * IN, -4.6 * IN, 0));
    if (look.facialHair === 'goatee') hc.add(mesh(geo.box, hm, 1.2 * IN, 2 * IN, 2.2 * IN, 6.1 * IN, -5 * IN, 0));
    if (look.facialHair === 'mustache' || look.facialHair === 'goatee') hc.add(mesh(geo.box, hm, 0.8 * IN, 0.6 * IN, 3 * IN, 6.4 * IN, -3.1 * IN, 0));
  }
  // Hair out the back of the helmet
  if (look.hair === 'dreads' || look.hair === 'long' || look.hair === 'mullet') {
    const hm = mat(look.hairColor);
    if (look.hair === 'dreads') {
      for (let i = -2; i <= 2; i++) {
        const d = mesh(geo.cyl, hm, 0.55 * IN, 9 * IN, 0.55 * IN, -5.6 * IN, -3.5 * IN, i * 1.4 * IN);
        d.rotation.z = -0.25;
        hc.add(d);
      }
    } else hc.add(mesh(geo.box, hm, 1.4 * IN, look.hair === 'long' ? 8 * IN : 4.5 * IN, 7 * IN, -5.7 * IN, look.hair === 'long' ? -7 * IN : -5.2 * IN, 0));
  }

  // Facemask
  const fmM = mat(gearColor(gear.facemaskColor, u), { metal: gear.facemaskColor === 'chrome' ? 0.9 : 0.2, rough: 0.35 });
  const fx = 7.0 * IN;
  const hBars: number[] =
    gear.facemask === 'open' ? [-1.3, -4.3] : gear.facemask === 'standard' ? [-1.3, -3.3, -5.3] : gear.facemask === 'bullbar' ? [-1.3, -3, -4.7, -6.2] : [-1.2, -2.8, -4.4, -6];
  const vBars: number[] = gear.facemask === 'open' ? [] : gear.facemask === 'standard' ? [0] : gear.facemask === 'bullbar' ? [-1.3, 1.3] : [-2, 0, 2];
  for (const y of hBars) hc.add(mesh(geo.bar, fmM, 0.32 * IN, 0.32 * IN, 9.2 * IN, fx - Math.abs(y + 3) * 0.12 * IN, y * IN, 0));
  const top = hBars[0];
  const bot = hBars[hBars.length - 1];
  for (const z of vBars) hc.add(mesh(geo.barV, fmM, 0.3 * IN, (top - bot) * IN, 0.3 * IN, fx + 0.1 * IN, ((top + bot) / 2) * IN, z * IN));
  // Side struts connecting the cage to the shell
  for (const z of [-4.5, 4.5]) {
    const s = mesh(geo.bar, fmM, 0.3 * IN, 0.3 * IN, 3.2 * IN, fx - 1.4 * IN, ((top + bot) / 2) * IN, z * IN);
    s.rotation.y = Math.PI / 2;
    hc.add(s);
  }
  if (gear.facemask === 'open' || gear.facemask === 'standard') {
    // center "U" support under the chin
    hc.add(mesh(geo.bar, fmM, 0.3 * IN, 0.3 * IN, 4 * IN, fx - 0.6 * IN, (bot - 1.2) * IN, 0));
  }
  // Mouthguard hanging from the cage
  if (gear.mouthguard !== 'none') {
    const mg = mesh(geo.box, mat(gearColor(gear.mouthguard, u)), 0.9 * IN, 2.2 * IN, 1.6 * IN, fx + 0.3 * IN, (bot - 1.4) * IN, 0.8 * IN);
    hc.add(mg);
  }
  // Visor
  if (gear.visor !== 'none') {
    const vm =
      gear.visor === 'clear'
        ? mat('#bfe3ff', { opacity: 0.28, rough: 0.05, side: THREE.DoubleSide })
        : gear.visor === 'dark'
          ? mat('#0b0b0f', { opacity: 0.9, rough: 0.05, metal: 0.4, side: THREE.DoubleSide })
          : mat('#6a3cff', { opacity: 0.85, rough: 0.05, metal: 0.95, side: THREE.DoubleSide });
    hc.add(mesh(geo.box, vm, 0.25 * IN, 2.6 * IN, 8.4 * IN, 6.6 * IN, 0.3 * IN, 0));
    if (gear.visor === 'iridescent') hc.add(mesh(geo.box, mat('#ff7a2e', { opacity: 0.55, metal: 1, rough: 0.05 }), 0.26 * IN, 0.8 * IN, 8.3 * IN, 6.62 * IN, -0.5 * IN, 0));
  }
}

function buildArm(look: PlayerLook, side: -1 | 1, pad: number, wf: number): Limb {
  const u = look.uniform;
  const gear = look.gear;
  const sleeve = side === -1 ? gear.leftSleeve : gear.rightSleeve;
  const upperM = sleeve === 'none' ? mat(look.skin) : mat(gearColor(sleeve, u));
  const lowerM = sleeve === 'none' || sleeve === 'short_white' ? mat(look.skin) : mat(gearColor(sleeve, u));
  const upper = new THREE.Group();
  upper.position.set(0, 17 * IN, side * 12.2 * IN * pad * wf);
  // Jersey sleeve cap + arm
  upper.add(mesh(geo.cyl, mat(u.jersey), 3.9 * IN * wf, 4.5 * IN, 3.9 * IN * wf));
  upper.add(mesh(geo.box, mat(u.trim), 7.6 * IN * wf, 0.8 * IN, 7.6 * IN * wf, 0, -4.4 * IN, 0));
  upper.add(mesh(geo.cylTaper, upperM, 2.9 * IN * wf, 12 * IN, 2.9 * IN * wf));
  const lower = new THREE.Group();
  lower.position.y = -12 * IN;
  upper.add(lower);
  lower.add(mesh(geo.cylTaper, lowerM, 2.5 * IN * wf, 10.5 * IN, 2.5 * IN * wf));
  // Wristband / play card (the play card goes on the left wrist; other bands on both)
  if (gear.wristbands === 'playcard') {
    if (side === -1) {
      const card = new THREE.MeshStandardMaterial({ map: playCardTexture(), flatShading: true });
      lower.add(mesh(geo.box, [card, card, mat('#f2f2f2'), mat('#f2f2f2'), card, card], 4.4 * IN, 3.8 * IN, 4.4 * IN, 0, -8.2 * IN, 0));
    }
  } else if (gear.wristbands !== 'none') {
    lower.add(mesh(geo.cyl, mat(gearColor(gear.wristbands, u)), 2.7 * IN * wf, 2.2 * IN, 2.7 * IN * wf, 0, -8 * IN, 0));
  }
  const hand = new THREE.Group();
  hand.position.y = -11 * IN;
  lower.add(hand);
  hand.add(mesh(geo.box, mat(colorOrSkin(gear.gloves, u, look.skin)), 2 * IN, 4 * IN, 3.2 * IN, 0, -1.6 * IN, 0));
  return { upper, lower, end: hand };
}

function buildLeg(look: PlayerLook, side: -1 | 1, wf: number): Limb {
  const u = look.uniform;
  const gear = look.gear;
  const pantsM = mat(u.pants, { rough: 0.6 });
  const upper = new THREE.Group();
  upper.position.set(0, 0, side * 4.8 * IN * wf);
  upper.add(mesh(geo.cylTaper, pantsM, 4.3 * IN * wf, 18.5 * IN, 4.3 * IN * wf));
  // Pants stripe down the outside of the thigh
  upper.add(mesh(geo.box, mat(u.trim), 1.2 * IN, 17 * IN, 0.6 * IN, 0, -9 * IN, side * 4.1 * IN * wf));
  const lower = new THREE.Group();
  lower.position.y = -18 * IN;
  upper.add(lower);
  const sockToken = gear.socks;
  const sockColor = sockToken === 'team' ? u.socks : gearColor(sockToken, u);
  const high = sockToken === 'high_white';
  // Pants end just below the knee unless the socks are pulled high
  if (!high) lower.add(mesh(geo.cyl, pantsM, 3.5 * IN * wf, 3.5 * IN, 3.5 * IN * wf));
  lower.add(mesh(geo.cylTaper, mat(sockColor), 3.1 * IN * wf, high ? 16 * IN : 12.5 * IN, 3.1 * IN * wf, 0, high ? 0 : -3.5 * IN, 0));
  const foot = new THREE.Group();
  foot.position.y = -16.5 * IN;
  lower.add(foot);
  const cleat = gear.cleats === 'red_white' ? '#C8102E' : gearColor(gear.cleats, u);
  foot.add(mesh(geo.box, mat(cleat, { rough: 0.45 }), 10 * IN, 3.4 * IN, 4 * IN, 2.6 * IN, -1.7 * IN, 0));
  if (gear.cleats === 'red_white') foot.add(mesh(geo.box, mat('#F4F4F4'), 10.2 * IN, 1 * IN, 4.1 * IN, 2.6 * IN, -3 * IN, 0));
  return { upper, lower, end: foot };
}

function shade(hex: string, f: number): string {
  const c = new THREE.Color(hex);
  c.multiplyScalar(f);
  return `#${c.getHexString()}`;
}

// ───────────── animation ─────────────

export interface AvatarState {
  x: number;
  y: number;
  facing: number;
  vx: number;
  vy: number;
  pose: string;
  poseT: number;
  moveKind?: string;
  hasBall: boolean;
  lineman: boolean;
  shotgunQB?: boolean;
}

/** One animated player in the scene. */
export class PlayerAvatar {
  rig: Rig;
  private phase = Math.random() * 6;
  private heading = 0;
  private lastPose = '';
  private throwT = 0;
  readonly handWorld = new THREE.Vector3();

  constructor(public look: PlayerLook) {
    this.rig = buildPlayer(look);
  }

  get root(): THREE.Group {
    return this.rig.root;
  }

  /** Field (x downfield, y across) → scene (x, z). Heading smooths toward the facing angle. */
  update(s: AvatarState, dt: number): void {
    const r = this.rig;
    r.root.position.set(s.x, 0, s.y);
    const spd = Math.hypot(s.vx, s.vy);
    // Smooth turn
    let d = s.facing - this.heading;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.heading += d * Math.min(1, dt * 14);
    let yaw = this.heading;
    if (s.pose !== this.lastPose) {
      if (s.pose === 'throw') this.throwT = 0;
      this.lastPose = s.pose;
    }
    this.throwT += dt;

    // Reset joints
    r.body.position.set(0, 0, 0);
    r.body.rotation.set(0, 0, 0);
    r.pelvis.rotation.set(0, 0, 0);
    r.torso.rotation.set(0, 0, 0);
    r.head.rotation.set(0, 0, 0);
    for (const l of [r.armL, r.armR, r.legL, r.legR]) {
      l.upper.rotation.set(0, 0, 0);
      l.lower.rotation.set(0, 0, 0);
    }

    // Run cycle
    this.phase += dt * (1.2 + spd * 1.35);
    const amp = Math.min(1, spd / 6.5) * 0.95;
    const sp = Math.sin(this.phase);
    const cp = Math.cos(this.phase);
    r.legL.upper.rotation.z = sp * amp;
    r.legR.upper.rotation.z = -sp * amp;
    r.legL.lower.rotation.z = -Math.max(0, -cp) * amp * 1.5 - 0.08;
    r.legR.lower.rotation.z = -Math.max(0, cp) * amp * 1.5 - 0.08;
    r.armL.upper.rotation.z = -sp * amp * 0.9;
    r.armR.upper.rotation.z = sp * amp * 0.9;
    r.armL.lower.rotation.z = 0.25 + amp * 1.1;
    r.armR.lower.rotation.z = 0.25 + amp * 1.1;
    r.armL.upper.rotation.x = -0.12;
    r.armR.upper.rotation.x = 0.12;
    r.body.position.y = Math.abs(sp) * 0.045 * amp;
    r.torso.rotation.z = -spd * 0.025;

    const k = r.body.scale.x;
    const crouch = (hipDrop: number, lean: number, knee: number) => {
      r.body.position.y -= hipDrop;
      r.torso.rotation.z = -lean;
      r.legL.upper.rotation.z = knee;
      r.legR.upper.rotation.z = knee;
      r.legL.lower.rotation.z = -knee * 1.6;
      r.legR.lower.rotation.z = -knee * 1.6;
    };

    // Transient poses fall back to the run cycle once their animation has played out.
    let pose = s.pose;
    if ((pose === 'catch' && s.poseT > 0.45) || ((pose === 'juke' || pose === 'spin' || pose === 'stiff') && s.poseT > 0.6) || (pose === 'throw' && this.throwT > 0.9)) pose = 'run';
    switch (pose) {
      case 'stance':
        if (s.lineman) {
          crouch(0.3 * k, 1.05, 1.1);
          r.armR.upper.rotation.z = 1.25; // hand down
          r.armR.lower.rotation.z = 0.1;
          r.armL.upper.rotation.z = 0.5;
          r.armL.lower.rotation.z = 1;
        } else if (s.shotgunQB) {
          crouch(0.06 * k, 0.3, 0.3);
          r.armL.upper.rotation.z = 0.9;
          r.armR.upper.rotation.z = 0.9;
          r.armL.lower.rotation.z = 1.1;
          r.armR.lower.rotation.z = 1.1;
        } else {
          crouch(0.12 * k, 0.45, 0.55);
          r.armL.upper.rotation.z = 0.35;
          r.armR.upper.rotation.z = 0.35;
          r.armL.lower.rotation.z = 0.9;
          r.armR.lower.rotation.z = 0.9;
        }
        break;
      case 'throw': {
        const t = this.throwT;
        // Wind up (arm up and back), then whip through.
        const wind = Math.min(1, t / 0.12);
        const rel = Math.max(0, Math.min(1, (t - 0.12) / 0.16));
        r.armR.upper.rotation.z = 3.5 * wind - 2.4 * rel;
        r.armR.upper.rotation.x = 0.35;
        r.armR.lower.rotation.z = 1.4 * wind - 1.2 * rel;
        r.armL.upper.rotation.z = 1.4 - rel * 0.6;
        r.armL.lower.rotation.z = 0.6;
        r.torso.rotation.y = 0.55 * wind - 1.0 * rel;
        r.torso.rotation.z = -0.1 - 0.35 * rel;
        break;
      }
      case 'catch':
        r.armL.upper.rotation.z = 2.3;
        r.armR.upper.rotation.z = 2.3;
        r.armL.lower.rotation.z = 0.35;
        r.armR.lower.rotation.z = 0.35;
        break;
      case 'block':
        crouch(0.12 * k, 0.55, 0.55);
        r.armL.upper.rotation.z = 1.5;
        r.armR.upper.rotation.z = 1.5;
        r.armL.lower.rotation.z = 0.35;
        r.armR.lower.rotation.z = 0.35;
        break;
      case 'tackle':
      case 'dive': {
        const t = Math.min(1, s.poseT / 0.35);
        r.body.rotation.z = -1.35 * t;
        r.body.position.y = 0.55 * (1 - t) + 0.2 * t;
        r.armL.upper.rotation.z = 2.9;
        r.armR.upper.rotation.z = 2.9;
        r.legL.upper.rotation.z = -0.3;
        r.legR.upper.rotation.z = -0.2;
        break;
      }
      case 'down': {
        const t = Math.min(1, s.poseT / 0.4);
        r.body.rotation.z = -1.5 * t;
        r.body.position.y = 0.22 * t;
        r.armL.upper.rotation.z = 2.4;
        r.armR.upper.rotation.z = 1.9;
        break;
      }
      case 'celebrate': {
        r.armL.upper.rotation.z = 3.0;
        r.armR.upper.rotation.z = 3.0;
        r.armL.upper.rotation.x = -0.4;
        r.armR.upper.rotation.x = 0.4;
        r.body.position.y = Math.abs(Math.sin(s.poseT * 7)) * 0.25;
        break;
      }
      case 'juke':
        r.body.rotation.x = s.moveKind === 'juke_left' ? 0.35 : -0.35;
        break;
      case 'spin':
        yaw += Math.min(1, s.poseT / 0.5) * Math.PI * 2;
        break;
      case 'stiff':
        r.armL.upper.rotation.z = 1.6;
        r.armL.lower.rotation.z = 0;
        break;
    }
    // Ball carrier tucks the ball in the right arm.
    if (s.hasBall && pose !== 'throw' && pose !== 'down' && pose !== 'celebrate' && pose !== 'stance') {
      r.armR.upper.rotation.z = 0.35;
      r.armR.upper.rotation.x = -0.25;
      r.armR.lower.rotation.z = 1.9;
    }
    // Towel sway
    for (const t of r.towels) t.rotation.z = -Math.min(0.9, spd * 0.07) + Math.sin(this.phase * 2) * 0.08 * amp;

    r.root.rotation.y = -yaw;
    r.root.updateMatrixWorld(true);
    r.armR.end.getWorldPosition(this.handWorld);
  }
}

/** Glowing ring under the user-controlled player. */
export function controlRing(color = '#ffcc33'): THREE.Mesh {
  const g = new THREE.RingGeometry(0.62, 0.8, 32).rotateX(-Math.PI / 2);
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false });
  const o = new THREE.Mesh(g, m);
  o.position.y = 0.02;
  return o;
}

export const sharedGeometry = geo;
