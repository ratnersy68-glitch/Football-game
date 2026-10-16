/** Lift stations, towers, cables and animated chairs / gondola cabins / T-bars. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Lift } from '../world/types';
import { carrierAt, carrierCount, type CablePath } from '../world/liftPath';

function chairGeometry(type: Lift['type']): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  if (type === 'gondola') {
    const cab = new THREE.BoxGeometry(2.2, 2.2, 2.4); cab.translate(0, -3.4, 0); parts.push(cab);
    const roof = new THREE.BoxGeometry(1.4, 0.3, 1.6); roof.translate(0, -2.15, 0); parts.push(roof);
    const rod = new THREE.BoxGeometry(0.12, 2.1, 0.12); rod.translate(0, -1.05, 0); parts.push(rod);
  } else if (type === 'surface') {
    const rod = new THREE.BoxGeometry(0.06, 2.0, 0.06); rod.translate(0, -1.0, 0); parts.push(rod);
    const bar = new THREE.BoxGeometry(1.0, 0.08, 0.08); bar.translate(0, -2.0, 0); parts.push(bar);
  } else {
    const rod = new THREE.BoxGeometry(0.08, 2.4, 0.08); rod.translate(0, -1.2, -0.25); parts.push(rod);
    const seat = new THREE.BoxGeometry(2.1, 0.12, 0.6); seat.translate(0, -2.55, 0.05); parts.push(seat);
    const back = new THREE.BoxGeometry(2.1, 0.7, 0.08); back.translate(0, -2.2, -0.28); parts.push(back);
    const bar = new THREE.BoxGeometry(2.0, 0.05, 0.05); bar.translate(0, -1.9, 0.45); parts.push(bar);
  }
  return mergeGeometries(parts.map((p) => p.toNonIndexed()), false)!;
}

export class LiftMeshes {
  readonly root = new THREE.Group();
  private carriers: { path: CablePath; mesh: THREE.InstancedMesh; count: number }[] = [];
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private one = new THREE.Vector3(1, 1, 1);
  private p = new THREE.Vector3();

  constructor(paths: CablePath[], shadows: boolean) {
    const towerM = new THREE.MeshLambertMaterial({ color: 0x6f7a86 });
    const stationM = new THREE.MeshLambertMaterial({ color: 0x8a9099 });
    const roofM = new THREE.MeshLambertMaterial({ color: 0x2f4d7a });
    const cableM = new THREE.LineBasicMaterial({ color: 0x222222 });
    const chairM = new THREE.MeshLambertMaterial({ color: 0x30343b });
    const gondM = new THREE.MeshLambertMaterial({ color: 0xc7302f });
    for (const c of paths) {
      const L = c.lift;
      // towers (skip stations)
      for (let i = 1; i < L.towers.length - 1; i++) {
        const t = L.towers[i];
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, t.h, 8), towerM);
        pole.position.set(t.x, t.y + t.h / 2, t.z);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(L.type === 'surface' ? 3 : 5.6, 0.35, 0.35), towerM);
        arm.position.set(t.x, t.y + t.h + 0.1, t.z);
        arm.rotation.y = Math.atan2(c.rx, c.rz) + Math.PI / 2;
        pole.castShadow = shadows;
        this.root.add(pole, arm);
      }
      // stations
      for (const [i, end] of [[0, L.bottom], [L.towers.length - 1, L.top]] as const) {
        const t = L.towers[i];
        const big = L.type === 'gondola';
        const g = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(big ? 12 : 7, t.h * 0.9, big ? 16 : 9), stationM);
        base.position.y = (t.h * 0.9) / 2;
        const roof = new THREE.Mesh(new THREE.BoxGeometry(big ? 14 : 8.5, 0.6, big ? 18 : 10.5), roofM);
        roof.position.y = t.h + 1.4;
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.18, 6, 20), towerM);
        wheel.rotation.x = Math.PI / 2; wheel.position.y = t.h;
        g.add(base, roof, wheel);
        g.position.set(end.x, end.y, end.z);
        g.rotation.y = Math.atan2(c.rx, c.rz);
        g.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = shadows; o.receiveShadow = shadows; } });
        if (L.type !== 'surface') this.root.add(g);
      }
      // cables
      for (const side of [1, -1] as const) {
        const pts: THREE.Vector3[] = [];
        const n = Math.max(8, Math.ceil(c.length / 15));
        for (let i = 0; i <= n; i++) {
          const a = carrierAt(c, side === 1 ? (c.length * i) / n : 2 * c.length - (c.length * i) / n);
          pts.push(new THREE.Vector3(a.x, a.y, a.z));
        }
        this.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cableM));
      }
      const count = carrierCount(c);
      const mesh = new THREE.InstancedMesh(chairGeometry(L.type), L.type === 'gondola' ? gondM : chairM, count);
      mesh.castShadow = shadows;
      mesh.frustumCulled = false;
      this.root.add(mesh);
      this.carriers.push({ path: c, mesh, count });
    }
  }

  /** phase: metres travelled by the haul rope for each lift. */
  update(phases: number[], cam: THREE.Vector3) {
    this.carriers.forEach((c, li) => {
      const L = c.path.lift;
      const near = Math.hypot(cam.x - (L.bottom.x + L.top.x) / 2, cam.z - (L.bottom.z + L.top.z) / 2) < c.path.length / 2 + 1800;
      c.mesh.visible = near;
      if (!near) return;
      const gap = (2 * c.path.length) / c.count;
      for (let i = 0; i < c.count; i++) {
        const a = carrierAt(c.path, phases[li] + i * gap);
        this.p.set(a.x, a.y, a.z);
        this.e.set(0, Math.atan2(a.dx, a.dz), 0);
        this.q.setFromEuler(this.e);
        this.m.compose(this.p, this.q, this.one);
        c.mesh.setMatrixAt(i, this.m);
      }
      c.mesh.instanceMatrix.needsUpdate = true;
    });
  }

  dispose() {
    this.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh || (o as THREE.Line).isLine) m.geometry.dispose(); });
  }
}
