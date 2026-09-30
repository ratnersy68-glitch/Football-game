/**
 * Ohio Stadium-style environment: painted field (yard lines, hashes, numbers, end zones, midfield logo),
 * a double-decked horseshoe bowl open at the south end with low south stands, a stone "rotunda" facade,
 * crowd, light towers, press box and a video board. Scene axes: x = field x (downfield), z = field y
 * (across), y = up. Units: yards. The goal lines are at x = 0 and x = 100.
 */
import * as THREE from 'three';

export const FIELD_W = 53.33;
const PX = 20; // texture pixels per yard
const MX = 20; // texture margin beyond the back lines (x)
const MZ = 14; // texture margin beyond the sidelines (z)

export interface StadiumTeams {
  homeName: string; // e.g. OHIO STATE
  homeNick: string; // BUCKEYES
  homeColor: string;
  homeColor2: string;
  awayName: string;
  awayColor: string;
}

function fieldTexture(t: StadiumTeams, maxAniso: number): THREE.Texture {
  const W = (120 + MX * 2) * PX;
  const H = (FIELD_W + MZ * 2) * PX;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const fx = (x: number) => (x + 10 + MX) * PX; // field x (-10..110) → px
  const fz = (z: number) => (z + MZ) * PX;
  // Surround
  g.fillStyle = '#2f6b2a';
  g.fillRect(0, 0, W, H);
  // Mowed stripes every 5 yards
  for (let x = -10; x < 110; x += 5) {
    g.fillStyle = Math.floor((x + 10) / 5) % 2 === 0 ? '#3b8a34' : '#347d2e';
    g.fillRect(fx(x), fz(0), 5 * PX, FIELD_W * PX);
  }
  // End zones
  for (const [x0, label] of [
    [-10, t.homeName],
    [100, t.homeNick],
  ] as const) {
    g.fillStyle = t.homeColor;
    g.fillRect(fx(x0), fz(0), 10 * PX, FIELD_W * PX);
    // diagonal hatch accents
    g.save();
    g.beginPath();
    g.rect(fx(x0), fz(0), 10 * PX, FIELD_W * PX);
    g.clip();
    g.strokeStyle = 'rgba(0,0,0,.12)';
    g.lineWidth = 6;
    for (let k = -60; k < 80; k += 3) {
      g.beginPath();
      g.moveTo(fx(x0), fz(k));
      g.lineTo(fx(x0 + 10), fz(k + 10));
      g.stroke();
    }
    g.restore();
    g.save();
    g.translate(fx(x0 + 5), fz(FIELD_W / 2));
    g.rotate(x0 < 0 ? Math.PI / 2 : -Math.PI / 2);
    g.font = `bold ${6.2 * PX}px "Arial Black", Impact, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineWidth = 0.5 * PX;
    g.strokeStyle = '#ffffff';
    g.fillStyle = t.homeColor2;
    g.strokeText(label, 0, 0);
    g.fillText(label, 0, 0);
    g.restore();
  }
  // Boundary (white border)
  g.strokeStyle = '#ffffff';
  g.lineWidth = 0.35 * PX;
  g.strokeRect(fx(-10), fz(0), 120 * PX, FIELD_W * PX);
  // Yard lines
  g.fillStyle = '#ffffff';
  for (let x = 0; x <= 100; x += 5) g.fillRect(fx(x) - 0.1 * PX, fz(0), 0.2 * PX, FIELD_W * PX);
  // Hash marks (college: 20 yards from each sideline) and sideline ticks
  for (let x = 1; x < 100; x++) {
    if (x % 5 === 0) continue;
    for (const z of [0.6, 20, FIELD_W - 20, FIELD_W - 0.6]) g.fillRect(fx(x) - 0.06 * PX, fz(z) - 0.35 * PX, 0.12 * PX, 0.7 * PX);
  }
  // Numbers
  g.font = `bold ${2 * PX}px "Arial Black", Impact, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let x = 10; x <= 90; x += 10) {
    const n = String(x <= 50 ? x : 100 - x);
    for (const [z, rot] of [
      [9, Math.PI / 2],
      [FIELD_W - 9, -Math.PI / 2],
    ] as const) {
      g.save();
      g.translate(fx(x), fz(z));
      g.rotate(rot);
      g.fillStyle = '#ffffff';
      g.fillText(n.split('').join(' '), 0, 0);
      // direction arrow toward the nearer goal
      if (x !== 50) {
        const dir = x < 50 ? -1 : 1;
        const ax = rot > 0 ? -dir : dir;
        g.beginPath();
        g.moveTo(ax * 1.75 * PX, -0.2 * PX);
        g.lineTo(ax * 1.35 * PX, -0.55 * PX);
        g.lineTo(ax * 1.35 * PX, 0.15 * PX);
        g.fill();
      }
      g.restore();
    }
  }
  // Midfield logo: block "O"
  g.save();
  g.translate(fx(50), fz(FIELD_W / 2));
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.ellipse(0, 0, 5.6 * PX, 4.2 * PX, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = t.homeColor;
  g.beginPath();
  g.ellipse(0, 0, 5.1 * PX, 3.7 * PX, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.ellipse(0, 0, 3.4 * PX, 2.1 * PX, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#3b8a34';
  g.beginPath();
  g.ellipse(0, 0, 2.9 * PX, 1.6 * PX, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  // Team names painted in the sideline margins
  g.save();
  g.font = `bold ${2.4 * PX}px "Arial Black", Impact, sans-serif`;
  g.fillStyle = 'rgba(255,255,255,.85)';
  g.textAlign = 'center';
  g.fillText(`${t.homeName}  ·  ${t.homeNick}`, fx(50), fz(-5));
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

const CROWD = ['#bb0000', '#bb0000', '#bb0000', '#c9c9c9', '#8a8f96', '#ffffff', '#1d1d1d', '#9e0000', '#d9a384', '#6a4a35', '#bb0000', '#e8e8e8'];

/** Build a stepped seating deck swept along a path of (x, z) points with outward normals. */
function deck(path: THREE.Vector2[], rows: number, off0: number, h0: number, tread: number, rise: number, rng: () => number, awayPct: number, awayColor: string): THREE.Mesh {
  // Profile: riser then tread for each row.
  const prof: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    const o = off0 + r * tread;
    const h = h0 + r * rise;
    prof.push([o, h], [o, h + rise], [o + tread, h + rise]);
  }
  const n = path.length;
  const normals = path.map((_p, i) => {
    const a = path[Math.max(0, i - 1)];
    const b = path[Math.min(n - 1, i + 1)];
    const tx = b.x - a.x;
    const tz = b.y - a.y;
    const l = Math.hypot(tx, tz) || 1;
    // outward normal (away from the field) for the path direction used by horseshoePath
    return new THREE.Vector2(-tz / l, tx / l);
  });
  const pos: number[] = [];
  const col: number[] = [];
  const cc = new THREE.Color();
  const put = (i: number, j: number) => {
    const p = path[i];
    const nn = normals[i];
    pos.push(p.x + nn.x * prof[j][0], prof[j][1], p.y + nn.y * prof[j][0]);
  };
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < prof.length - 1; j++) {
      put(i, j);
      put(i + 1, j);
      put(i + 1, j + 1);
      put(i, j);
      put(i + 1, j + 1);
      put(i, j + 1);
      const riser = j % 3 === 0;
      // Treads carry the crowd; risers are concrete with fans' legs.
      if (riser) cc.set(rng() < 0.5 ? '#6d6d6d' : CROWD[Math.floor(rng() * CROWD.length)]).multiplyScalar(0.7);
      else if (rng() < awayPct) cc.set(awayColor);
      else cc.set(CROWD[Math.floor(rng() * CROWD.length)]);
      cc.multiplyScalar(0.8 + rng() * 0.3);
      for (let v = 0; v < 6; v++) col.push(cc.r, cc.g, cc.b);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  m.receiveShadow = true;
  return m;
}

/** Horseshoe path: west sideline south→north, around the closed north end, east sideline north→south. */
function horseshoePath(inset: number): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const zN = -8 - inset; // near (z<0) sideline stands edge
  const zF = FIELD_W + 8 + inset;
  const cx = 112;
  const rz = (zF - zN) / 2;
  const rx = 16 + inset * 0.6;
  const cz = (zN + zF) / 2;
  // Counter-clockwise when viewed from above (+y) in (x, z) with z pointing "down" on the map:
  // run along the far sideline toward the closed end, around, then back along the near sideline.
  for (let x = -14; x <= cx; x += 1.5) pts.push(new THREE.Vector2(x, zF));
  for (let a = 1; a < 40; a++) {
    const t = Math.PI / 2 - (a / 40) * Math.PI;
    pts.push(new THREE.Vector2(cx + Math.cos(t) * rx, cz + Math.sin(t) * rz));
  }
  for (let x = cx; x >= -14; x -= 1.5) pts.push(new THREE.Vector2(x, zN));
  return pts;
}

function facadeTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#b9a78a';
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#8f7e63';
  for (let y = 0; y < 128; y += 8) g.fillRect(0, y, 256, 1);
  g.fillStyle = '#2a2622';
  for (let x = 12; x < 256; x += 42) {
    g.beginPath();
    g.moveTo(x, 118);
    g.lineTo(x, 52);
    g.arc(x + 14, 52, 14, Math.PI, 0);
    g.lineTo(x + 28, 118);
    g.fill();
  }
  g.fillStyle = '#d8c9ad';
  g.fillRect(0, 0, 256, 10);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

export function videoBoardTexture(lines: string[], color: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 192;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  drawBoard(t, lines, color);
  return t;
}

export function drawBoard(t: THREE.CanvasTexture, lines: string[], color: string): void {
  const c = t.image as HTMLCanvasElement;
  const g = c.getContext('2d')!;
  g.fillStyle = '#05070a';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, 34);
  g.fillStyle = '#fff';
  g.font = 'bold 26px "Arial Black", Impact, sans-serif';
  g.textAlign = 'center';
  g.fillText(lines[0] ?? '', c.width / 2, 27);
  g.font = 'bold 44px "Arial Black", Impact, sans-serif';
  lines.slice(1).forEach((l, i) => g.fillText(l, c.width / 2, 86 + i * 52));
  t.needsUpdate = true;
}

export interface Stadium {
  group: THREE.Group;
  board: THREE.CanvasTexture;
  sun: THREE.DirectionalLight;
}

export function buildStadium(teams: StadiumTeams, renderer: THREE.WebGLRenderer): Stadium {
  const group = new THREE.Group();
  let seed = 7;
  const rng = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // Sky dome
  const skyGeo = new THREE.SphereGeometry(900, 24, 12);
  const skyCol: number[] = [];
  const top = new THREE.Color('#3f7fd0');
  const hor = new THREE.Color('#cfe4f7');
  const p = skyGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const h = Math.max(0, p.getY(i) / 900);
    const c = hor.clone().lerp(top, Math.pow(h, 0.55));
    skyCol.push(c.r, c.g, c.b);
  }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(skyCol, 3));
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.position.set(50, 0, FIELD_W / 2);
  group.add(sky);

  // Outer ground (parking lots / campus)
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#4f6b3c' }));
  outer.position.set(50, -0.05, FIELD_W / 2);
  outer.receiveShadow = true;
  group.add(outer);

  // Field
  const fieldW = 120 + MX * 2;
  const fieldH = FIELD_W + MZ * 2;
  const field = new THREE.Mesh(
    new THREE.PlaneGeometry(fieldW, fieldH).rotateX(-Math.PI / 2),
    new THREE.MeshLambertMaterial({ map: fieldTexture(teams, renderer.capabilities.getMaxAnisotropy()) }),
  );
  field.position.set(50, 0, FIELD_W / 2);
  field.receiveShadow = true;
  group.add(field);

  // Goal posts
  const postM = new THREE.MeshLambertMaterial({ color: '#f2d21b' });
  for (const gx of [-10, 110]) {
    const gp = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.3, 8), postM);
    base.position.set(gx + (gx < 0 ? -0.7 : 0.7), 1.65, FIELD_W / 2);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.14), postM);
    arm.position.set(gx + (gx < 0 ? -0.35 : 0.35), 3.3, FIELD_W / 2);
    const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.17, 8).rotateX(Math.PI / 2), postM);
    cross.position.set(gx, 3.33, FIELD_W / 2);
    gp.add(base, arm, cross);
    for (const dz of [-3.08, 3.08]) {
      const up = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 10, 8), postM);
      up.position.set(gx, 3.33 + 5, FIELD_W / 2 + dz);
      gp.add(up);
    }
    gp.traverse((o) => (o.castShadow = true));
    group.add(gp);
  }

  // Sideline walls
  const wallM = new THREE.MeshLambertMaterial({ color: '#2a2a2a' });
  for (const z of [-7.5, FIELD_W + 7.5]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(130, 1.3, 0.4), wallM);
    w.position.set(50, 0.65, z);
    group.add(w);
  }

  // Bowl: lower deck + upper deck swept around the horseshoe.
  const lower = deck(horseshoePath(0), 38, 0.5, 1.3, 0.95, 0.42, rng, 0.02, '#00274C');
  group.add(lower);
  const upper = deck(horseshoePath(0), 26, 34, 21, 1.0, 0.6, rng, 0.04, '#00274C');
  group.add(upper);
  // Upper deck fascia (scarlet band)
  const fasciaPath = horseshoePath(0);
  const fascia = new THREE.Mesh(
    ribbon(fasciaPath, 33.6, 19.8, 21.4),
    new THREE.MeshLambertMaterial({ color: teams.homeColor, side: THREE.DoubleSide }),
  );
  group.add(fascia);
  // Outer wall with arches (the rotunda look) around the whole horseshoe
  const fac = facadeTexture();
  fac.repeat.set(40, 1);
  const outerWall = new THREE.Mesh(ribbon(fasciaPath, 60.5, 0, 38), new THREE.MeshLambertMaterial({ map: fac, side: THREE.DoubleSide }));
  group.add(outerWall);

  // South stands (open end) — low bleachers
  const south: THREE.Vector2[] = [];
  for (let z = -4; z <= FIELD_W + 4; z += 1.5) south.push(new THREE.Vector2(-22, z));
  group.add(deck(south, 14, 0, 0.8, 0.95, 0.4, rng, 0.35, '#00274C'));

  // Video board above the south stands
  const board = videoBoardTexture([`${teams.homeName} vs ${teams.awayName}`, 'WELCOME TO', 'THE SHOE'], teams.homeColor);
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(36, 13.5), new THREE.MeshBasicMaterial({ map: board }));
  boardMesh.position.set(-40, 22, FIELD_W / 2);
  boardMesh.rotation.y = Math.PI / 2;
  const boardBack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 15.5, 38), new THREE.MeshLambertMaterial({ color: '#1a1a1a' }));
  boardBack.position.set(-40.7, 22, FIELD_W / 2);
  const boardLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 16, 2), new THREE.MeshLambertMaterial({ color: '#333' }));
  boardLeg.position.set(-40.7, 7, FIELD_W / 2);
  group.add(boardMesh, boardBack, boardLeg);

  // Press box on the far (east) side above the upper deck
  const press = new THREE.Mesh(new THREE.BoxGeometry(70, 6, 5), new THREE.MeshLambertMaterial({ color: '#d5d5d5' }));
  press.position.set(50, 40, FIELD_W + 8 + 62);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(68, 2.5), new THREE.MeshBasicMaterial({ color: '#223044' }));
  glass.position.set(50, 40.5, FIELD_W + 8 + 59.4);
  glass.rotation.y = Math.PI;
  group.add(press, glass);

  // Light towers
  const towerM = new THREE.MeshLambertMaterial({ color: '#8d9299' });
  const lampM = new THREE.MeshBasicMaterial({ color: '#fffbe6' });
  for (const [x, z] of [
    [8, -75],
    [92, -75],
    [8, FIELD_W + 75],
    [92, FIELD_W + 75],
  ]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 60, 8), towerM);
    pole.position.set(x, 30, z);
    const head = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 1), towerM);
    head.position.set(x, 62, z + (z < 0 ? 0.6 : -0.6));
    const lamps = new THREE.Mesh(new THREE.PlaneGeometry(11, 5), lampM);
    lamps.position.set(x, 62, z + (z < 0 ? 1.15 : -1.15));
    if (z > 0) lamps.rotation.y = Math.PI;
    group.add(pole, head, lamps);
  }

  // Lighting: bright early-afternoon sun + sky fill.
  const hemi = new THREE.HemisphereLight('#dfefff', '#3a5a2a', 1.25);
  group.add(hemi);
  const sun = new THREE.DirectionalLight('#fff4de', 2.3);
  sun.position.set(30, 60, -25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -30;
  sc.right = 30;
  sc.top = 30;
  sc.bottom = -30;
  sc.near = 1;
  sc.far = 160;
  sun.shadow.bias = -0.0005;
  group.add(sun, sun.target);

  return { group, board, sun };
}

/** Vertical ribbon (wall) along a path at a fixed outward offset between two heights. */
function ribbon(path: THREE.Vector2[], off: number, y0: number, y1: number): THREE.BufferGeometry {
  const n = path.length;
  const pos: number[] = [];
  const uv: number[] = [];
  let acc = 0;
  const pts = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)];
    const b = path[Math.min(n - 1, i + 1)];
    const tx = b.x - a.x;
    const tz = b.y - a.y;
    const l = Math.hypot(tx, tz) || 1;
    return new THREE.Vector2(p.x + (-tz / l) * off, p.y + (tx / l) * off);
  });
  const us = pts.map((p, i) => (i === 0 ? 0 : (acc += p.distanceTo(pts[i - 1]))));
  const total = acc || 1;
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const ua = us[i] / total;
    const ub = us[i + 1] / total;
    pos.push(a.x, y0, a.y, b.x, y0, b.y, b.x, y1, b.y, a.x, y0, a.y, b.x, y1, b.y, a.x, y1, a.y);
    uv.push(ua, 0, ub, 0, ub, 1, ua, 0, ub, 1, ua, 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
