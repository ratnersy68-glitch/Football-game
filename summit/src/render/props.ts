/** Lodges, cabins, village chalets, trail signs, map boards, snow guns and lamp posts. */
import * as THREE from 'three';
import type { Resort } from '../world/resortBuilder';
import type { Building, Difficulty } from '../world/types';
import { DIFFICULTY_INFO } from '../world/types';

const snowMat = new THREE.MeshLambertMaterial({ color: 0xf6f9ff });

function chalet(w: number, d: number, h: number, wall: string, roof: string, night: boolean): THREE.Group {
  const g = new THREE.Group();
  const wallM = new THREE.MeshLambertMaterial({ color: wall });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallM);
  body.position.y = h / 2;
  g.add(body);
  // gable roof (prism) with snow layer
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-w / 2 - 0.8, 0); roofShape.lineTo(0, h * 0.55); roofShape.lineTo(w / 2 + 0.8, 0); roofShape.lineTo(-w / 2 - 0.8, 0);
  const roofG = new THREE.ExtrudeGeometry(roofShape, { depth: d + 1.6, bevelEnabled: false });
  roofG.translate(0, h, -d / 2 - 0.8);
  g.add(new THREE.Mesh(roofG, new THREE.MeshLambertMaterial({ color: roof })));
  const snowG = new THREE.ExtrudeGeometry((() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 - 0.9, 0.1); s.lineTo(0, h * 0.55 + 0.35); s.lineTo(w / 2 + 0.9, 0.1); s.lineTo(w / 2 + 0.6, -0.05); s.lineTo(0, h * 0.55 + 0.1); s.lineTo(-w / 2 - 0.6, -0.05);
    return s;
  })(), { depth: d + 1.8, bevelEnabled: false });
  snowG.translate(0, h, -d / 2 - 0.9);
  g.add(new THREE.Mesh(snowG, snowMat));
  // windows
  const winM = new THREE.MeshStandardMaterial({ color: 0x2b3a4a, emissive: night ? 0xffc070 : 0x000000, emissiveIntensity: night ? 1.4 : 0, roughness: 0.3 });
  const nw = Math.max(1, Math.floor(w / 3));
  for (let i = 0; i < nw; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), winM);
    win.position.set(-w / 2 + (i + 0.5) * (w / nw), h * 0.55, d / 2 + 0.02);
    g.add(win);
    const back = win.clone(); back.position.z = -d / 2 - 0.02; back.rotation.y = Math.PI; g.add(back);
  }
  const chim = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 0.8), new THREE.MeshLambertMaterial({ color: 0x6b5d55 }));
  chim.position.set(w * 0.25, h + h * 0.45, 0);
  g.add(chim);
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

function signTexture(name: string, d: Difficulty): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 96;
  const x = c.getContext('2d')!;
  x.fillStyle = '#f7f3e8'; x.fillRect(0, 0, 256, 96);
  x.strokeStyle = '#3b2a1c'; x.lineWidth = 6; x.strokeRect(3, 3, 250, 90);
  const info = DIFFICULTY_INFO[d];
  drawDifficulty(x, d, 40, 48, 26);
  x.fillStyle = '#1d1d1d';
  x.font = 'bold 22px sans-serif';
  x.textBaseline = 'middle';
  const words = name.split(' ');
  if (name.length > 15 && words.length > 1) {
    x.fillText(words.slice(0, Math.ceil(words.length / 2)).join(' '), 78, 34);
    x.fillText(words.slice(Math.ceil(words.length / 2)).join(' '), 78, 62);
  } else x.fillText(name, 78, 48);
  x.font = '12px sans-serif'; x.fillStyle = '#555'; x.fillText(info.label.toUpperCase(), 78, 84);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Draws the official trail symbol (circle/square/diamonds) centered at x,y. */
export function drawDifficulty(x: CanvasRenderingContext2D, d: Difficulty, cx: number, cy: number, r: number) {
  const info = DIFFICULTY_INFO[d];
  x.save();
  x.fillStyle = info.color;
  if (d === 'bunny' || d === 'green') {
    x.beginPath(); x.arc(cx, cy, r * 0.8, 0, Math.PI * 2); x.fill();
    if (d === 'bunny') { x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cy, r * 0.4, 0, Math.PI * 2); x.fill(); }
  } else if (d === 'blue') {
    x.fillRect(cx - r * 0.75, cy - r * 0.75, r * 1.5, r * 1.5);
  } else {
    const n = d === 'black' ? 1 : d === 'double' ? 2 : 3;
    const s = n === 1 ? r : r * 0.62;
    for (let i = 0; i < n; i++) {
      const ox = cx + (i - (n - 1) / 2) * s * 1.35;
      x.beginPath(); x.moveTo(ox, cy - s); x.lineTo(ox + s * 0.7, cy); x.lineTo(ox, cy + s); x.lineTo(ox - s * 0.7, cy); x.closePath(); x.fill();
    }
  }
  x.restore();
}

export class Props {
  readonly root = new THREE.Group();
  private textures: THREE.Texture[] = [];
  lamps: THREE.InstancedMesh | null = null;

  constructor(resort: Resort, night: boolean, mapTexture: THREE.Texture | null) {
    const T = resort.terrain;
    const place = (o: THREE.Object3D, b: Building, yOff = 0) => {
      o.position.set(b.x, T.gridHeight(b.x, b.z) + yOff, b.z);
      o.rotation.y = b.rot;
      o.scale.setScalar(b.scale);
      this.root.add(o);
    };
    const walls = ['#7a4e2d', '#8b5a35', '#a0703f', '#6e4a33', '#c9b79a'];
    const roofs = ['#4a2b20', '#3d3d45', '#6b2222', '#2f3b2f'];
    let k = 0;
    const gunGeo = new THREE.CylinderGeometry(0.6, 0.45, 1.0, 10);
    const gunMat = new THREE.MeshLambertMaterial({ color: 0x2a2f38 });
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x7c8590 });
    for (const b of resort.buildings) {
      k++;
      if (b.kind === 'lodge') {
        const g = chalet(30, 18, 9, '#6e4a33', '#3d2a20', night);
        const wing = chalet(14, 12, 6, '#7a4e2d', '#3d2a20', night);
        wing.position.set(20, 0, 2);
        g.add(wing);
        // deck + flagpole
        const deck = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0x5b4636 }));
        deck.position.set(0, 0.6, 13); g.add(deck);
        place(g, b, -0.5);
      } else if (b.kind === 'cabin' || b.kind === 'village' || b.kind === 'hut') {
        const big = b.kind === 'village';
        const g = chalet(big ? 11 : 7, big ? 9 : 6, big ? 6.5 : 3.6, walls[k % walls.length], roofs[k % roofs.length], night);
        place(g, b, -0.4);
      } else if (b.kind === 'sign' && b.difficulty) {
        const g = new THREE.Group();
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), new THREE.MeshLambertMaterial({ color: 0x5b4636 }));
        post.position.y = 1.2; g.add(post);
        const tex = signTexture(b.label ?? '', b.difficulty);
        this.textures.push(tex);
        const board = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.72), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
        board.position.y = 2.1; g.add(board);
        place(g, b);
        g.rotation.y = b.rot + Math.PI; // face uphill riders
      } else if (b.kind === 'mapboard') {
        const g = new THREE.Group();
        const legs = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 0.15), new THREE.MeshLambertMaterial({ color: 0x4a3a2c }));
        legs.position.y = 1.1; g.add(legs);
        const board = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), mapTexture ? new THREE.MeshBasicMaterial({ map: mapTexture }) : new THREE.MeshLambertMaterial({ color: 0xffffff }));
        board.position.set(0, 2.4, 0.09); g.add(board);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.25, 0.9), snowMat);
        roof.position.set(0, 3.6, 0.1); g.add(roof);
        place(g, b);
        g.rotation.y = Math.PI;
      } else if (b.kind === 'snowgun') {
        const g = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4, 5), poleMat);
        pole.position.y = 2; g.add(pole);
        const gun = new THREE.Mesh(gunGeo, gunMat);
        gun.rotation.x = Math.PI / 2.4; gun.position.set(0, 4, 0.3); g.add(gun);
        place(g, b);
      }
    }
    // night lamp posts along groomed trails
    if (night) {
      const pts: THREE.Vector3[] = [];
      for (const tr of resort.trails) {
        if (!(tr.groomed && (tr.difficulty === 'green' || tr.difficulty === 'blue')) && tr.kind === 'trail') continue;
        for (let i = 6; i < tr.pts.length; i += 9) {
          const p = tr.pts[i], q = tr.pts[Math.min(tr.pts.length - 1, i + 1)];
          const l = Math.hypot(q.x - p.x, q.z - p.z) || 1;
          const side = (i / 9) % 2 < 1 ? 1 : -1;
          const x = p.x + (-(q.z - p.z) / l) * (tr.width / 2 + 2) * side, z = p.z + ((q.x - p.x) / l) * (tr.width / 2 + 2) * side;
          pts.push(new THREE.Vector3(x, T.gridHeight(x, z), z));
        }
      }
      const lampG = new THREE.CylinderGeometry(0.07, 0.09, 7, 5);
      lampG.translate(0, 3.5, 0);
      const headG = new THREE.SphereGeometry(0.45, 8, 6);
      headG.translate(0, 7.1, 0);
      const poles = new THREE.InstancedMesh(lampG, poleMat, pts.length);
      const heads = new THREE.InstancedMesh(headG, new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), pts.length);
      const m = new THREE.Matrix4();
      pts.forEach((p, i) => { m.makeTranslation(p.x, p.y, p.z); poles.setMatrixAt(i, m); heads.setMatrixAt(i, m); });
      poles.computeBoundingSphere(); heads.computeBoundingSphere();
      this.root.add(poles, heads);
      this.lamps = heads;
    }
  }

  dispose() {
    this.textures.forEach((t) => t.dispose());
    this.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); });
  }
}
