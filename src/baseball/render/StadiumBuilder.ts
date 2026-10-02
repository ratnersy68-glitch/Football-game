/**
 * StadiumBuilder: turns a Stadium definition into a 3D ballpark. Walls, warning track and
 * stands follow the park's real dimensions, so a short porch looks (and plays) short.
 * Field coordinates map to Three.js as (x, y, -z).
 */
import * as THREE from 'three';
import type { Conditions, Stadium, Team } from '../core/types';
import { wallDistance, wallHeight } from '../data/stadiums';

export const T = (x: number, y: number, z: number) => new THREE.Vector3(x, y, -z);

export interface BuiltStadium {
  group: THREE.Group;
  scoreboard: { canvas: HTMLCanvasElement; tex: THREE.CanvasTexture; pos: THREE.Vector3 };
  fireworksOrigin: THREE.Vector3;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  skyColor: THREE.Color;
}

const polar = (deg: number, r: number) => ({ x: Math.sin((deg * Math.PI) / 180) * r, z: Math.cos((deg * Math.PI) / 180) * r });

function stripeTexture(time: Conditions['time']): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d')!;
  const a = time === 'Night' ? '#2f7a33' : '#3d8f3a';
  const b = time === 'Night' ? '#286c2c' : '#357f33';
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? a : b;
    g.fillRect(i * 32, 0, 32, 256);
  }
  // subtle noise
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function dirtTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#b07a4a';
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1800; i++) {
    const v = Math.random();
    g.fillStyle = v > 0.5 ? `rgba(255,220,180,${Math.random() * 0.12})` : `rgba(60,30,10,${Math.random() * 0.12})`;
    g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(20, 20);
  return t;
}

function crowdTexture(seat: string, colors: string[]): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = seat;
  g.fillRect(0, 0, 512, 256);
  const palette = [...colors, '#f0f0f0', '#d8c3a0', '#3a3a3a', '#c94b4b', '#4b6fc9', '#e0c050', '#8a5a3a'];
  for (let row = 0; row < 16; row++) {
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.fillRect(0, row * 16 + 13, 512, 3);
    for (let i = 0; i < 40; i++) {
      if (Math.random() < 0.2) continue;
      g.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      const x = i * 12.8 + Math.random() * 3, y = row * 16 + Math.random() * 2;
      g.fillRect(x, y + 5, 9, 8);
      g.fillStyle = Math.random() < 0.5 ? '#e7c3a0' : '#8d5b3e';
      g.beginPath(); g.arc(x + 4.5, y + 3.5, 3.2, 0, Math.PI * 2); g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function textSprite(text: string, color = '#ffffff', size = 64): THREE.Sprite {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d')!;
  g.font = `bold ${size}px Oswald, Impact, sans-serif`;
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 128, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false }));
  s.scale.set(16, 8, 1);
  return s;
}

function flatShape(points: { x: number; z: number }[], y: number, material: THREE.Material): THREE.Mesh {
  const shape = new THREE.Shape();
  // Shape space (x, y) = (field x, field z); rotate to lie flat. After rotation.x = -PI/2, shape y -> -three z = field z.
  shape.moveTo(points[0].x, points[0].z);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i].x, points[i].z);
  const geo = new THREE.ShapeGeometry(shape, 1);
  const m = new THREE.Mesh(geo, material);
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  m.receiveShadow = true;
  return m;
}

function strip(a: { x: number; z: number }, b: { x: number; z: number }, w: number, y: number, material: THREE.Material): THREE.Mesh {
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.hypot(dx, dz);
  const geo = new THREE.PlaneGeometry(w, len);
  const m = new THREE.Mesh(geo, material);
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = -Math.atan2(dx, dz);
  m.position.set((a.x + b.x) / 2, y, -(a.z + b.z) / 2);
  return m;
}

export function buildStadium(st: Stadium, home: Team, cond: Conditions): BuiltStadium {
  const group = new THREE.Group();
  const night = cond.time === 'Night';
  const afternoon = cond.time === 'Afternoon';

  // ---------------- Lighting & sky
  const skyColor = new THREE.Color(night ? '#0b1530' : afternoon ? '#f2b38a' : cond.weather === 'Clear' ? '#7fb9f0' : '#9aa6b2');
  if (cond.weather !== 'Clear' && !night) skyColor.lerp(new THREE.Color('#8a949e'), 0.6);
  const hemi = new THREE.HemisphereLight(night ? '#9fb4ff' : '#ffffff', night ? '#203020' : '#4a6a3a', night ? 0.55 : 0.9);
  group.add(hemi);
  const sun = new THREE.DirectionalLight(night ? '#fff6e8' : afternoon ? '#ffd2a0' : '#fffaf0', night ? 2.0 : afternoon ? 2.2 : 2.6);
  sun.position.copy(afternoon ? T(-220, 160, 220) : night ? T(0, 400, 150) : T(-150, 380, -120));
  sun.target.position.copy(T(0, 0, 110));
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -220; sc.right = 220; sc.top = 220; sc.bottom = -220; sc.near = 10; sc.far = 900;
  sun.shadow.bias = -0.0008;
  group.add(sun, sun.target);
  // Fill light from the press box side so players facing the plate aren't silhouettes.
  const fill = new THREE.DirectionalLight(night ? '#e8eeff' : '#fff4e0', night ? 1.1 : 0.7);
  fill.position.copy(T(40, 220, -320));
  fill.target.position.copy(T(0, 0, 80));
  group.add(fill, fill.target);
  if (cond.weather === 'Cloudy') { sun.intensity *= 0.55; hemi.intensity *= 1.1; }
  if (cond.weather === 'Light Rain') { sun.intensity *= 0.45; hemi.intensity *= 1.0; }

  const skyGeo = new THREE.SphereGeometry(2500, 32, 16);
  const top = skyColor.clone().multiplyScalar(night ? 0.6 : 0.85);
  const horizon = night ? new THREE.Color('#25325a') : afternoon ? new THREE.Color('#ffd7a8') : skyColor.clone().lerp(new THREE.Color('#ffffff'), 0.45);
  const cols: number[] = [];
  const pos = skyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 2500;
    const c = horizon.clone().lerp(top, Math.max(0, y) ** 0.6);
    cols.push(c.r, c.g, c.b);
  }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  group.add(new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false })));

  // ---------------- Ground
  const grassTex = stripeTexture(cond.time);
  grassTex.repeat.set(36, 36);
  grassTex.rotation = Math.PI / 4;
  const grass = new THREE.Mesh(new THREE.CircleGeometry(900, 64), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95 }));
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  group.add(grass);

  const dirtMat = new THREE.MeshStandardMaterial({ map: dirtTexture(), roughness: 1 });
  // Infield dirt fan: arc of radius 95 from the mound between the foul lines.
  const fan: { x: number; z: number }[] = [{ x: 0, z: 0 }];
  for (let a = -45; a <= 45; a += 2) {
    const r = (a * Math.PI) / 180;
    const c = Math.cos(r);
    const t = 60.5 * c + Math.sqrt(60.5 * 60.5 * c * c - 60.5 * 60.5 + 95 * 95);
    fan.push({ x: Math.sin(r) * t, z: Math.cos(r) * t });
  }
  group.add(flatShape(fan, 0.03, dirtMat));
  // Infield grass square
  const grassInner = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95 });
  group.add(flatShape([{ x: 0, z: 9 }, { x: 55, z: 63.64 }, { x: 0, z: 118.3 }, { x: -55, z: 63.64 }], 0.05, grassInner));
  // Mound, home circle, base cutouts
  const circle = (x: number, z: number, r: number, y: number, m: THREE.Material) => {
    const c = new THREE.Mesh(new THREE.CircleGeometry(r, 32), m);
    c.rotation.x = -Math.PI / 2;
    c.position.copy(T(x, y, z));
    c.receiveShadow = true;
    group.add(c);
    return c;
  };
  circle(0, 0, 13, 0.07, dirtMat);
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(9, 9.5, 0.8, 32), dirtMat);
  mound.position.copy(T(0, 0.4, 60.5));
  mound.receiveShadow = true;
  group.add(mound);
  const white = new THREE.MeshStandardMaterial({ color: '#f4f4f4', roughness: 0.6 });
  const rubber = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 0.5), white);
  rubber.position.copy(T(0, 0.85, 60.5));
  group.add(rubber);
  for (const [x, z] of [[63.64, 63.64], [0, 127.28], [-63.64, 63.64]]) {
    circle(x, z, 7, 0.06, dirtMat);
    const bag = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.5), white);
    bag.position.copy(T(x, 0.18, z));
    bag.rotation.y = Math.PI / 4;
    bag.castShadow = true;
    group.add(bag);
  }
  // Home plate (pentagon)
  const hp = new THREE.Shape();
  hp.moveTo(-0.708, 1.417); hp.lineTo(0.708, 1.417); hp.lineTo(0.708, 0.708); hp.lineTo(0, 0); hp.lineTo(-0.708, 0.708); hp.lineTo(-0.708, 1.417);
  const plate = new THREE.Mesh(new THREE.ShapeGeometry(hp), white);
  plate.rotation.x = -Math.PI / 2;
  plate.position.y = 0.09;
  group.add(plate);
  // Chalk: foul lines, batter's boxes, catcher's box
  const chalk = new THREE.MeshBasicMaterial({ color: '#f2f2f2' });
  const lf = polar(-45, wallDistance(st, -45));
  const rf = polar(45, wallDistance(st, 45));
  group.add(strip({ x: 0, z: 0 }, lf, 0.35, 0.1, chalk));
  group.add(strip({ x: 0, z: 0 }, rf, 0.35, 0.1, chalk));
  for (const sx of [-1, 1]) {
    const x0 = sx * 1.2, x1 = sx * 5.2, z0 = -2.5, z1 = 3.5;
    group.add(strip({ x: x0, z: z0 }, { x: x0, z: z1 }, 0.25, 0.1, chalk));
    group.add(strip({ x: x1, z: z0 }, { x: x1, z: z1 }, 0.25, 0.1, chalk));
    group.add(strip({ x: x0, z: z0 }, { x: x1, z: z0 }, 0.25, 0.1, chalk));
    group.add(strip({ x: x0, z: z1 }, { x: x1, z: z1 }, 0.25, 0.1, chalk));
  }

  // ---------------- Warning track and outfield wall
  const wallMat = new THREE.MeshStandardMaterial({ color: st.wallColor, roughness: 0.85, side: THREE.DoubleSide });
  const padMat = new THREE.MeshStandardMaterial({ color: '#e8c33a', roughness: 0.6, side: THREE.DoubleSide });
  const trackPts: number[] = [];
  const trackIdx: number[] = [];
  const wallPos: number[] = [];
  const wallIdx: number[] = [];
  const topPos: number[] = [];
  const topIdx: number[] = [];
  let vi = 0;
  for (let a = -45; a <= 45; a += 1) {
    const W = wallDistance(st, a);
    const h = wallHeight(st, a);
    const o = polar(a, W);
    const i = polar(a, W - 15);
    trackPts.push(i.x, 0.08, -i.z, o.x, 0.08, -o.z);
    wallPos.push(o.x, 0, -o.z, o.x, h, -o.z);
    topPos.push(o.x, h, -o.z, o.x, h + 0.7, -o.z);
    if (a > -45) {
      const b = (vi - 1) * 2, c = vi * 2;
      trackIdx.push(b, b + 1, c, c, b + 1, c + 1);
      wallIdx.push(b, b + 1, c, c, b + 1, c + 1);
      topIdx.push(b, b + 1, c, c, b + 1, c + 1);
    }
    vi++;
  }
  const mk = (p: number[], idx: number[], m: THREE.Material) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, m);
    mesh.receiveShadow = true;
    return mesh;
  };
  group.add(mk(trackPts, trackIdx, new THREE.MeshStandardMaterial({ color: '#9a6a43', roughness: 1, side: THREE.DoubleSide })));
  group.add(mk(wallPos, wallIdx, wallMat));
  group.add(mk(topPos, topIdx, padMat));
  if (st.id === 'wrigley') {
    // Ivy
    const ivy: number[] = [];
    for (let a = -44; a <= 44; a += 1) { const o = polar(a, wallDistance(st, a) - 0.3); ivy.push(o.x, 0.5, -o.z, o.x, wallHeight(st, a) - 0.5, -o.z); }
    const idx: number[] = [];
    for (let i = 1; i < ivy.length / 6; i++) { const b = (i - 1) * 2, c = i * 2; idx.push(b, b + 1, c, c, b + 1, c + 1); }
    group.add(mk(ivy, idx, new THREE.MeshStandardMaterial({ color: '#2f6b2a', roughness: 1, side: THREE.DoubleSide })));
  }
  // Distance markers
  for (const [a, i] of [[-45, 0], [-22.5, 1], [0, 2], [22.5, 3], [45, 4]] as const) {
    const W = st.dims[i];
    const o = polar(a + (a === -45 ? 2.5 : a === 45 ? -2.5 : 0), W - 0.8);
    const s = textSprite(String(W), '#ffffff', 72);
    s.position.copy(T(o.x, Math.min(wallHeight(st, a), 8) * 0.55 + 1.5, o.z));
    s.scale.set(10, 5, 1);
    group.add(s);
  }
  // Foul poles
  const poleMat = new THREE.MeshStandardMaterial({ color: '#f2d21b', emissive: '#4a3d00', roughness: 0.4 });
  for (const a of [-45, 45]) {
    const o = polar(a, wallDistance(st, a));
    const h = Math.max(60, wallHeight(st, a) + 45);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, h, 10), poleMat);
    pole.position.copy(T(o.x, h / 2, o.z));
    group.add(pole);
  }

  // ---------------- Stands (a bowl that follows the wall and the foul territory)
  const crowd = crowdTexture(st.seatColor, [home.colors.primary, home.colors.secondary]);
  const standMat = new THREE.MeshStandardMaterial({ map: crowd, roughness: 0.9, side: THREE.DoubleSide });
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#16221a', roughness: 1, side: THREE.DoubleSide });
  const boundary = (phi: number) => {
    const p = Math.abs(phi);
    if (p <= 45) return { r: wallDistance(st, phi), h: wallHeight(st, phi) };
    const s = Math.sin((p * Math.PI) / 180), c = Math.cos((p * Math.PI) / 180);
    const den = s - c;
    const r = den > 0.01 ? (st.foulWidth * Math.SQRT2) / den : 9999;
    return { r: Math.max(st.backstop, Math.min(wallDistance(st, 45 * Math.sign(phi)), r)), h: 4 };
  };
  const tier = (depth: number, rise: number, lift: number, extra: number, phiFrom: number, phiTo: number, mat: THREE.Material, eye: boolean) => {
    const p: number[] = [], uv: number[] = [], idx: number[] = [];
    let n = 0;
    for (let phi = phiFrom; phi <= phiTo; phi += 2) {
      const b = boundary(phi);
      const r0 = b.r + 2 + extra, r1 = r0 + depth;
      const a = (phi * Math.PI) / 180;
      const y0 = b.h + 2 + lift, y1 = y0 + rise;
      p.push(Math.sin(a) * r0, y0, -Math.cos(a) * r0, Math.sin(a) * r1, y1, -Math.cos(a) * r1);
      uv.push(phi / 9, 0, phi / 9, depth / 55);
      if (n > 0) { const q = (n - 1) * 2, c = n * 2; idx.push(q, q + 1, c, c, q + 1, c + 1); }
      n++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, eye ? eyeMat : mat);
    group.add(m);
    // Front facade
    const f: number[] = [], fi: number[] = [];
    n = 0;
    for (let phi = phiFrom; phi <= phiTo; phi += 2) {
      const b = boundary(phi);
      const r0 = b.r + 2 + extra;
      const a = (phi * Math.PI) / 180;
      f.push(Math.sin(a) * r0, 0, -Math.cos(a) * r0, Math.sin(a) * r0, b.h + 2 + lift, -Math.cos(a) * r0);
      if (n > 0) { const q = (n - 1) * 2, c = n * 2; fi.push(q, q + 1, c, c, q + 1, c + 1); }
      n++;
    }
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(f, 3));
    fg.setIndex(fi);
    fg.computeVertexNormals();
    group.add(new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: '#2a2f38', roughness: 0.9, side: THREE.DoubleSide })));
  };
  // Batter's eye in dead center, bleachers elsewhere
  tier(70, 38, 0, 0, -46, -8, standMat, false);
  tier(70, 30, -2, 0, -8, 8, standMat, true);
  tier(70, 38, 0, 0, 8, 46, standMat, false);
  tier(95, 34, 0, 0, 46, 180, standMat, false);
  tier(95, 34, 0, 0, -180, -46, standMat, false);
  // Upper deck around the infield
  tier(60, 30, 42, 110, 50, 180, standMat, false);
  tier(60, 30, 42, 110, -180, -50, standMat, false);
  // Roof for domes
  if (st.roof === 'dome') {
    const roof = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 12, 0, Math.PI * 2, 0, Math.PI / 6), new THREE.MeshStandardMaterial({ color: '#d9dde3', side: THREE.BackSide, roughness: 1 }));
    roof.position.copy(T(0, -380, 160));
    group.add(roof);
  }

  // Dugouts
  for (const side of [-1, 1]) {
    const dir = { x: side * Math.SQRT1_2, z: Math.SQRT1_2 };
    const nrm = { x: side * Math.SQRT1_2, z: -Math.SQRT1_2 };
    const c = { x: dir.x * 55 + nrm.x * (st.foulWidth + 3), z: dir.z * 55 + nrm.z * (st.foulWidth + 3) };
    const dug = new THREE.Mesh(new THREE.BoxGeometry(48, 7, 9), new THREE.MeshStandardMaterial({ color: '#15181d', roughness: 1 }));
    dug.position.copy(T(c.x, 2.5, c.z));
    dug.rotation.y = Math.atan2(dir.z, dir.x);
    group.add(dug);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(50, 0.8, 10), new THREE.MeshStandardMaterial({ color: home.colors.primary, roughness: 0.6 }));
    roof.position.copy(T(c.x, 6.4, c.z));
    roof.rotation.y = dug.rotation.y;
    group.add(roof);
  }

  // ---------------- Scoreboard
  const sbAngle = -26;
  const sbR = wallDistance(st, sbAngle) + 75;
  const sbP = polar(sbAngle, sbR);
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 440;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(130, 56), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  const boardPos = T(sbP.x, 78, sbP.z);
  board.position.copy(boardPos);
  board.lookAt(T(0, 30, 0));
  group.add(board);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(136, 62, 3), new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.8 }));
  frame.position.copy(board.position);
  frame.quaternion.copy(board.quaternion);
  frame.translateZ(-2);
  group.add(frame);
  const post = new THREE.Mesh(new THREE.BoxGeometry(6, 60, 6), new THREE.MeshStandardMaterial({ color: '#222' }));
  post.position.copy(T(sbP.x, 25, sbP.z));
  group.add(post);

  // ---------------- Light towers
  const towerMat = new THREE.MeshStandardMaterial({ color: '#3a3f47', roughness: 0.7 });
  const lampMat = new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: night ? '#fff6d0' : '#555', emissiveIntensity: night ? 2.2 : 0.3 });
  for (const a of [-120, -70, -30, 30, 70, 120]) {
    const b = boundary(a);
    const p = polar(a, b.r + 120);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.2, 150, 8), towerMat);
    tower.position.copy(T(p.x, 75, p.z));
    group.add(tower);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(26, 12, 2), lampMat);
    lamp.position.copy(T(p.x, 155, p.z));
    lamp.lookAt(T(0, 0, 120));
    group.add(lamp);
  }

  return { group, scoreboard: { canvas, tex, pos: boardPos }, fireworksOrigin: T(sbP.x, 110, sbP.z), sun, hemi, skyColor };
}

export interface ScoreboardData {
  away: { abbr: string; line: number[]; r: number; h: number; e: number; color: string };
  home: { abbr: string; line: number[]; r: number; h: number; e: number; color: string };
  innings: number;
  inning: number;
  half: 'top' | 'bottom';
  balls: number; strikes: number; outs: number;
  batter: string; pitcher: string; mph: string;
  message: string;
}

export function drawScoreboard(sb: BuiltStadium['scoreboard'], d: ScoreboardData) {
  const g = sb.canvas.getContext('2d')!;
  const W = sb.canvas.width, H = sb.canvas.height;
  g.fillStyle = '#0a0d12';
  g.fillRect(0, 0, W, H);
  const cols = Math.max(9, d.innings, d.away.line.length, d.home.line.length);
  const x0 = 170, cw = Math.min(56, (W - x0 - 230) / cols);
  g.font = 'bold 34px Oswald, Impact, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#ffd34d';
  for (let i = 0; i < cols; i++) g.fillText(String(i + 1), x0 + cw * i + cw / 2, 40);
  ['R', 'H', 'E'].forEach((k, i) => g.fillText(k, W - 200 + i * 66 + 33, 40));
  const row = (t: ScoreboardData['away'], y: number, top: boolean) => {
    g.textAlign = 'left';
    g.fillStyle = t.color;
    g.fillRect(16, y - 30, 8, 60);
    g.fillStyle = '#fff';
    g.font = 'bold 46px Oswald, Impact, sans-serif';
    g.fillText(t.abbr, 34, y);
    g.textAlign = 'center';
    g.font = 'bold 40px Oswald, Impact, sans-serif';
    for (let i = 0; i < cols; i++) {
      const v = t.line[i];
      const live = (d.half === 'top') === top && d.inning === i + 1;
      g.fillStyle = live ? '#ffd34d' : '#e8e8e8';
      g.fillText(v === undefined ? (live ? '0' : '') : String(v), x0 + cw * i + cw / 2, y);
    }
    g.fillStyle = '#ffffff';
    [t.r, t.h, t.e].forEach((v, i) => g.fillText(String(v), W - 200 + i * 66 + 33, y));
  };
  row(d.away, 110, true);
  row(d.home, 180, false);
  g.strokeStyle = '#2a3140';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(10, 225); g.lineTo(W - 10, 225); g.stroke();
  g.textAlign = 'left';
  g.font = 'bold 36px Oswald, Impact, sans-serif';
  g.fillStyle = '#9fb3c8';
  g.fillText(`AT BAT`, 30, 270);
  g.fillText(`PITCHING`, 30, 320);
  g.fillStyle = '#fff';
  g.fillText(d.batter.toUpperCase(), 190, 270);
  g.fillText(d.pitcher.toUpperCase(), 190, 320);
  g.textAlign = 'right';
  g.fillStyle = '#ffd34d';
  g.fillText(`B ${d.balls}  S ${d.strikes}  O ${d.outs}`, W - 30, 270);
  g.fillStyle = '#7fe08a';
  g.fillText(d.mph, W - 30, 320);
  g.textAlign = 'center';
  g.font = 'bold 50px Oswald, Impact, sans-serif';
  g.fillStyle = '#ffffff';
  g.fillText(d.message, W / 2, 395);
  sb.tex.needsUpdate = true;
}
