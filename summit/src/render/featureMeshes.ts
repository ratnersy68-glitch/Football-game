/** Meshes for park features (sampled from their physics height functions), rails and race gates. */
import * as THREE from 'three';
import type { Terrain } from '../world/terrain';
import type { Feature } from '../world/features';
import type { RaceCourse, RailDef } from '../world/types';

export function featureMesh(T: Terrain, f: Feature, mat: THREE.Material): THREE.Mesh | null {
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const c = new THREE.Color();
  const lipC = new THREE.Color('#3f7fd8');
  const sideC = new THREE.Color('#e3ecf7');
  const topC = new THREE.Color('#f7faff');
  let nu: number, nv: number, sample: (i: number, j: number) => { x: number; z: number; h: number; u: number };
  if (f.kind === 'berm') {
    const du = 1, dv = 0.6;
    nu = Math.ceil(f.len / du); nv = Math.ceil(((f.halfW + 7) * 2) / dv);
    // berms are sampled on a world-aligned grid over their bounds
    const w = f.maxX - f.minX, d = f.maxZ - f.minZ;
    nu = Math.ceil(w / 1.0); nv = Math.ceil(d / 1.0);
    sample = (i, j) => { const x = f.minX + i, z = f.minZ + j; return { x, z, h: f.heightAt(x, z), u: 0 }; };
  } else {
    const du = f.kind === 'halfpipe' ? 0.8 : 0.45, dv = f.kind === 'halfpipe' ? 0.5 : 0.4;
    nu = Math.ceil((f.len + 2) / du); nv = Math.ceil((f.halfW * 2 + 2) / dv);
    const rx = -f.dz, rz = f.dx;
    sample = (i, j) => {
      const u = -1 + i * du, v = -f.halfW - 1 + j * dv;
      const x = f.x + f.dx * u + rx * v, z = f.z + f.dz * u + rz * v;
      return { x, z, h: f.local ? f.local(u, v) : f.heightAt(x, z), u };
    };
  }
  const hs: number[] = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const s = sample(i, j);
    const y = T.baseHeight(s.x, s.z) + s.h + 0.04;
    pos.push(s.x, y, s.z);
    hs.push(s.h);
    const nearLip = f.lipU !== undefined && Math.abs(s.u - f.lipU) < 0.35 && s.h > 0.3;
    c.copy(s.h > 0.6 ? topC : sideC);
    if (nearLip) c.copy(lipC);
    col.push(c.r, c.g, c.b);
  }
  const row = nu + 1;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = j * row + i, b = a + 1, cc = a + row, d = cc + 1;
    if (Math.max(hs[a], hs[b], hs[cc], hs[d]) < 0.03) continue;
    idx.push(a, b, cc, b, d, cc);
  }
  if (!idx.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // the winding depends on the frame orientation; make normals point up
  const n = g.getAttribute('normal');
  let up = 0;
  for (let i = 0; i < n.count; i += 7) up += n.getY(i);
  if (up < 0) {
    const ia = g.getIndex()!.array as Uint32Array | Uint16Array;
    for (let i = 0; i < ia.length; i += 3) { const t = ia[i + 1]; ia[i + 1] = ia[i + 2]; ia[i + 2] = t; }
    g.computeVertexNormals();
  }
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  m.castShadow = true;
  return m;
}

export function railMesh(r: RailDef): THREE.Group {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: r.kind === 'rail' || r.kind === 'downrail' ? 0xd8c040 : 0xb8bec8, metalness: 0.7, roughness: 0.3 });
  const plastic = new THREE.MeshStandardMaterial({ color: r.id % 2 ? 0xd23a3a : 0x1f1f24, roughness: 0.5 });
  const post = new THREE.MeshLambertMaterial({ color: 0x3a3a40 });
  const pts = r.pts.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = a.distanceTo(b);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    let seg: THREE.Mesh;
    if (r.kind === 'box') {
      seg = new THREE.Mesh(new THREE.BoxGeometry(r.halfWidth * 1.6, 0.35, len + 0.02), plastic);
      seg.position.copy(mid).y -= 0.175;
    } else if (r.kind === 'tube') {
      seg = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, len, 14), plastic);
      seg.position.copy(mid).y -= 0.42;
    } else {
      seg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len + 0.04, 8), metal);
      seg.position.copy(mid);
    }
    if (r.kind === 'box') seg.lookAt(b.clone().setY(b.y - 0.175));
    else { seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); }
    seg.castShadow = true;
    g.add(seg);
  }
  // support posts every ~3 m
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = a.distanceTo(b);
    for (let s = (3 - acc) % 3; s < len; s += 3) {
      const p = a.clone().lerp(b, s / len);
      const h = 1.6;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 5), post);
      leg.position.set(p.x, p.y - h / 2 - (r.kind === 'tube' ? 0.4 : 0.05), p.z);
      g.add(leg);
    }
    acc = (acc + len) % 3;
  }
  return g;
}

/** Gate poles + flags, start house, finish arch and a small crowd. */
export function courseMeshes(T: Terrain, c: RaceCourse): THREE.Group {
  const g = new THREE.Group();
  const red = new THREE.MeshLambertMaterial({ color: 0xd8282a });
  const blue = new THREE.MeshLambertMaterial({ color: 0x1f4fd0 });
  const poleG = new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6);
  poleG.translate(0, 0.95, 0);
  const flagG = new THREE.PlaneGeometry(0.75, 0.65);
  const panelSide = c.discipline === 'slalom' ? 0 : 1;
  // instanced poles and flags: two draw calls per colour regardless of gate count
  const poles: Record<'red' | 'blue', THREE.Matrix4[]> = { red: [], blue: [] };
  const flags: Record<'red' | 'blue', THREE.Matrix4[]> = { red: [], blue: [] };
  const tall = c.discipline === 'ski-cross' || c.discipline === 'freestyle';
  for (const gate of c.gates) {
    const rx = -gate.dz, rz = gate.dx;
    for (const s of [-1, 1]) {
      const x = gate.x + rx * (gate.width / 2) * s, z = gate.z + rz * (gate.width / 2) * s;
      poles[gate.color].push(new THREE.Matrix4().compose(new THREE.Vector3(x, T.height(x, z), z), new THREE.Quaternion(), new THREE.Vector3(tall ? 2 : 1, tall ? 1.4 : 1, tall ? 2 : 1)));
    }
    if (panelSide && !tall) {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.atan2(gate.dx, gate.dz) + Math.PI / 2, 0));
      flags[gate.color].push(new THREE.Matrix4().compose(new THREE.Vector3(gate.x, T.height(gate.x, gate.z) + 1.2, gate.z), q, new THREE.Vector3((gate.width / 0.75) * 0.9, 1, 1)));
    }
  }
  for (const col of ['red', 'blue'] as const) {
    const m = col === 'red' ? red : blue;
    if (poles[col].length) {
      const im = new THREE.InstancedMesh(poleG, m, poles[col].length);
      poles[col].forEach((mm, i) => im.setMatrixAt(i, mm));
      im.computeBoundingSphere();
      g.add(im);
    }
    if (flags[col].length) {
      const fm = new THREE.MeshLambertMaterial({ color: col === 'red' ? 0xe23a3a : 0x2a5be0, side: THREE.DoubleSide });
      const im = new THREE.InstancedMesh(flagG, fm, flags[col].length);
      flags[col].forEach((mm, i) => im.setMatrixAt(i, mm));
      im.computeBoundingSphere();
      g.add(im);
    }
  }
  // finish arch
  const fin = c.finish;
  const rx = -fin.dz, rz = fin.dx;
  const archM = new THREE.MeshLambertMaterial({ color: 0x14365f });
  for (const s of [-1, 1]) {
    const x = fin.x + rx * (fin.width / 2) * s, z = fin.z + rz * (fin.width / 2) * s;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6, 0.8), archM);
    leg.position.set(x, T.height(x, z) + 3, z);
    g.add(leg);
  }
  const banner = new THREE.Mesh(new THREE.BoxGeometry(fin.width + 1, 1.3, 0.4), new THREE.MeshLambertMaterial({ color: 0xffffff, map: textTexture('FINISH', '#14365f') }));
  banner.position.set(fin.x, T.height(fin.x, fin.z) + 6.2, fin.z);
  banner.rotation.y = Math.atan2(fin.dx, fin.dz);
  g.add(banner);
  // finish line
  const line = new THREE.Mesh(new THREE.PlaneGeometry(fin.width, 0.4), new THREE.MeshBasicMaterial({ color: 0xd8282a }));
  line.rotation.x = -Math.PI / 2;
  line.rotation.z = -Math.atan2(fin.dx, fin.dz);
  line.position.set(fin.x, T.height(fin.x, fin.z) + 0.06, fin.z);
  g.add(line);
  // crowd behind the fences near the finish
  const crowdG = new THREE.CapsuleGeometry(0.25, 0.9, 2, 6);
  const crowdN = 90;
  const crowd = new THREE.InstancedMesh(crowdG, new THREE.MeshLambertMaterial(), crowdN);
  const mm = new THREE.Matrix4();
  const col = new THREE.Color();
  for (let i = 0; i < crowdN; i++) {
    const s = i % 2 ? 1 : -1;
    const along = -6 - (i % 15) * 1.6;
    const off = fin.width / 2 + 4 + Math.floor(i / 30) * 1.2;
    const x = fin.x + fin.dx * along + rx * off * s, z = fin.z + fin.dz * along + rz * off * s;
    mm.makeTranslation(x, T.height(x, z) + 0.7, z);
    crowd.setMatrixAt(i, mm);
    crowd.setColorAt(i, col.setHSL((i * 0.137) % 1, 0.65, 0.5));
  }
  crowd.computeBoundingSphere();
  g.add(crowd);
  // start: hut beside the line plus an open START arch the camera can see through
  const st = c.start;
  const srx = -st.dz, srz = st.dx;
  const hutX = st.x + srx * 9, hutZ = st.z + srz * 9;
  const house = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), new THREE.MeshLambertMaterial({ color: 0x14365f }));
  house.position.set(hutX, T.height(hutX, hutZ) + 1.5, hutZ);
  house.rotation.y = Math.atan2(st.dx, st.dz);
  g.add(house);
  const sw = 6;
  for (const sgn of [-1, 1]) {
    const x = st.x + st.dx * 1.5 + srx * (sw / 2) * sgn, z = st.z + st.dz * 1.5 + srz * (sw / 2) * sgn;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.4, 0.3), archM);
    post.position.set(x, T.height(x, z) + 1.7, z);
    g.add(post);
  }
  const sb = new THREE.Mesh(new THREE.BoxGeometry(sw + 0.6, 0.7, 0.2), new THREE.MeshLambertMaterial({ map: textTexture('START', '#14365f') }));
  sb.position.set(st.x + st.dx * 1.5, T.height(st.x, st.z) + 3.6, st.z + st.dz * 1.5);
  sb.rotation.y = Math.atan2(st.dx, st.dz);
  g.add(sb);
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return g;
}

export function textTexture(text: string, bg: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const x = c.getContext('2d')!;
  x.fillStyle = bg; x.fillRect(0, 0, 512, 96);
  x.fillStyle = '#fff'; x.font = 'bold 64px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 256, 50);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
