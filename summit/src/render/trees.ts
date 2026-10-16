/** Instanced, distance-grouped pine forests and rock outcrops with two LODs. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const GROUP = 384;

function colorize(g: THREE.BufferGeometry, fn: (y: number, ny: number) => THREE.Color) {
  const p = g.getAttribute('position'), n = g.getAttribute('normal');
  const c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const col = fn(p.getY(i), n.getY(i));
    c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return g;
}

/** Low-poly snowy pine: trunk + stacked cones; snow on upward faces. Height ≈ 10 m at scale 1. */
export function pineGeometry(variant: number, detailed: boolean, foliage: THREE.Color): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunkC = new THREE.Color('#4a3424');
  const snow = new THREE.Color('#f4f8ff');
  const dark = foliage.clone().multiplyScalar(0.75);
  const seg = detailed ? 7 : 5;
  const trunk = new THREE.CylinderGeometry(0.18, 0.28, 2.2, 5, 1);
  trunk.translate(0, 1.1, 0);
  parts.push(colorize(trunk.toNonIndexed(), () => trunkC));
  const tiers = detailed ? (variant === 1 ? 4 : 3) : 1;
  const tall = variant === 1 ? 1.25 : 1;
  const snowAmt = variant === 2 ? 0.75 : 0.35;
  for (let t = 0; t < tiers; t++) {
    const f = t / Math.max(1, tiers);
    const r = detailed ? (2.4 - f * 1.6) * (variant === 1 ? 0.8 : 1) : 2.1;
    const h = detailed ? (3.6 - f * 0.7) * tall : 8.5 * tall;
    const cone = new THREE.ConeGeometry(r, h, seg, 1, false);
    const y = detailed ? 1.6 + t * 2.3 * tall + h / 2 : 1.4 + h / 2;
    cone.translate(0, y, 0);
    const ng = cone.toNonIndexed();
    ng.computeVertexNormals();
    parts.push(colorize(ng, (yy, ny) => {
      const rel = (yy - (y - h / 2)) / h;
      const s = rel > 0.86 ? 0.8 : rel > 0.55 && ny > 0.45 ? snowAmt * 0.6 : 0.05;
      return foliage.clone().lerp(dark, 0.4 * (1 - rel)).lerp(snow, s);
    }));
  }
  const g = mergeGeometries(parts.map((p) => { p.deleteAttribute('uv'); return p; }), false)!;
  g.computeVertexNormals();
  return g;
}

interface Group { cx: number; cz: number; near: THREE.InstancedMesh[]; far: THREE.InstancedMesh[]; rocks: THREE.InstancedMesh | null }

export class Vegetation {
  readonly root = new THREE.Group();
  private groups: Group[] = [];
  private geos: THREE.BufferGeometry[] = [];
  private mat: THREE.MeshLambertMaterial;
  private rockMat: THREE.MeshStandardMaterial;

  constructor(trees: Float32Array, count: number, rocks: Float32Array, rockCount: number, foliage: string, rockColor: string, shadows: boolean) {
    const fol = new THREE.Color(foliage);
    this.mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.rockMat = new THREE.MeshStandardMaterial({ color: rockColor, roughness: 0.95, flatShading: true });
    const nearG = [0, 1, 2].map((v) => pineGeometry(v, true, fol));
    const farG = [0, 1, 2].map((v) => pineGeometry(v, false, fol));
    const rockG = new THREE.DodecahedronGeometry(1, 0);
    rockG.scale(1.2, 0.8, 1);
    // snow cap on rocks via vertex color
    colorize(rockG, (y) => (y > 0.45 ? new THREE.Color('#eef3fa') : new THREE.Color('#ffffff')));
    this.rockMat.vertexColors = true;
    this.geos.push(...nearG, ...farG, rockG);

    const buckets = new Map<string, { trees: number[][]; rocks: number[] }>();
    const key = (x: number, z: number) => `${Math.floor(x / GROUP)},${Math.floor(z / GROUP)}`;
    const get = (k: string) => {
      let b = buckets.get(k);
      if (!b) { b = { trees: [[], [], []], rocks: [] }; buckets.set(k, b); }
      return b;
    };
    for (let i = 0; i < count; i++) {
      const x = trees[i * 5], z = trees[i * 5 + 2];
      get(key(x, z)).trees[trees[i * 5 + 4] | 0].push(i);
    }
    for (let i = 0; i < rockCount; i++) get(key(rocks[i * 5], rocks[i * 5 + 2])).rocks.push(i);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    const tint = new THREE.Color();
    for (const [k, b] of buckets) {
      const [cx, cz] = k.split(',').map(Number);
      const g: Group = { cx, cz, near: [], far: [], rocks: null };
      for (let v = 0; v < 3; v++) {
        const ids = b.trees[v];
        if (!ids.length) continue;
        const near = new THREE.InstancedMesh(nearG[v], this.mat, ids.length);
        const far = new THREE.InstancedMesh(farG[v], this.mat, ids.length);
        ids.forEach((id, j) => {
          const sc = trees[id * 5 + 3];
          p.set(trees[id * 5], trees[id * 5 + 1], trees[id * 5 + 2]);
          q.setFromAxisAngle(up, (id * 2.399) % (Math.PI * 2));
          s.set(sc * (0.9 + ((id * 7) % 5) * 0.05), sc, sc * (0.9 + ((id * 3) % 5) * 0.05));
          m.compose(p, q, s);
          near.setMatrixAt(j, m); far.setMatrixAt(j, m);
          tint.setRGB(1, 1, 1).multiplyScalar(0.88 + ((id * 13) % 10) * 0.025);
          near.setColorAt(j, tint); far.setColorAt(j, tint);
        });
        near.castShadow = shadows; near.receiveShadow = false;
        near.computeBoundingSphere(); far.computeBoundingSphere();
        near.visible = false; far.visible = false;
        g.near.push(near); g.far.push(far);
        this.root.add(near, far);
      }
      if (b.rocks.length) {
        const r = new THREE.InstancedMesh(rockG, this.rockMat, b.rocks.length);
        b.rocks.forEach((id, j) => {
          const sc = rocks[id * 5 + 3];
          p.set(rocks[id * 5], rocks[id * 5 + 1], rocks[id * 5 + 2]);
          q.setFromEuler(new THREE.Euler((id % 7) * 0.3, rocks[id * 5 + 4], (id % 5) * 0.2));
          s.set(sc, sc * (0.7 + (id % 4) * 0.12), sc * 1.1);
          m.compose(p, q, s);
          r.setMatrixAt(j, m);
        });
        r.castShadow = shadows;
        r.receiveShadow = shadows;
        r.computeBoundingSphere();
        g.rocks = r;
        this.root.add(r);
      }
      this.groups.push(g);
    }
  }

  update(cam: THREE.Vector3, nearDist: number, farDist: number) {
    for (const g of this.groups) {
      const x0 = g.cx * GROUP, z0 = g.cz * GROUP;
      const dx = Math.max(x0 - cam.x, 0, cam.x - (x0 + GROUP));
      const dz = Math.max(z0 - cam.z, 0, cam.z - (z0 + GROUP));
      const d = Math.hypot(dx, dz);
      const near = d < nearDist;
      const far = !near && d < farDist;
      for (const m of g.near) m.visible = near;
      for (const m of g.far) m.visible = far;
      if (g.rocks) g.rocks.visible = d < farDist * 0.8;
    }
  }

  dispose() {
    for (const g of this.geos) g.dispose();
    this.mat.dispose(); this.rockMat.dispose();
    for (const g of this.groups) { [...g.near, ...g.far].forEach((m) => m.dispose()); g.rocks?.dispose(); }
  }
}
