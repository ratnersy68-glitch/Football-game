/** Snowfall, snow spray and ski tracks — all pooled, single draw call each. */
import * as THREE from 'three';
import type { Terrain } from '../world/terrain';

function dotTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c);
  return t;
}

export class Snowfall {
  readonly points: THREE.Points;
  private pos: Float32Array;
  private vel: Float32Array;
  private max: number;
  count = 0;
  private box = { w: 70, h: 40 };

  constructor(max: number) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max);
    for (let i = 0; i < max; i++) {
      this.pos[i * 3] = (Math.random() - 0.5) * this.box.w;
      this.pos[i * 3 + 1] = Math.random() * this.box.h;
      this.pos[i * 3 + 2] = (Math.random() - 0.5) * this.box.w;
      this.vel[i] = 0.8 + Math.random() * 1.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    const m = new THREE.PointsMaterial({ size: 0.22, map: dotTexture(), transparent: true, depthWrite: false, opacity: 0.9, color: 0xffffff });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
    g.setDrawRange(0, 0);
  }

  setIntensity(n: number) {
    this.count = Math.min(this.max, Math.floor(n));
    this.points.geometry.setDrawRange(0, this.count);
    this.points.visible = this.count > 0;
  }

  update(dt: number, cam: THREE.Vector3, wind: { x: number; z: number }, camVel: THREE.Vector3) {
    if (!this.count) return;
    const { w, h } = this.box;
    const p = this.pos;
    const t = performance.now() * 0.001;
    for (let i = 0; i < this.count; i++) {
      const k = i * 3;
      p[k] += (wind.x + Math.sin(t + i) * 0.4 - camVel.x * 0.0) * dt;
      p[k + 1] -= this.vel[i] * dt * 1.6;
      p[k + 2] += (wind.z + Math.cos(t * 0.7 + i) * 0.4) * dt;
      // wrap relative to camera
      let rx = p[k] - cam.x, ry = p[k + 1] - (cam.y - h * 0.4), rz = p[k + 2] - cam.z;
      if (rx > w / 2) rx -= w; else if (rx < -w / 2) rx += w;
      if (rz > w / 2) rz -= w; else if (rz < -w / 2) rz += w;
      if (ry < 0) ry += h; else if (ry > h) ry -= h;
      p[k] = cam.x + rx; p[k + 1] = cam.y - h * 0.4 + ry; p[k + 2] = cam.z + rz;
    }
    (this.points.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
  }
}

export class Spray {
  readonly points: THREE.Points;
  private max = 600;
  private pos = new Float32Array(this.max * 3);
  private vel = new Float32Array(this.max * 3);
  private life = new Float32Array(this.max);
  private size = new Float32Array(this.max);
  private alpha = new Float32Array(this.max);
  private next = 0;

  constructor() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uMap: { value: dotTexture() }, uScale: { value: 400 } },
      vertexShader: `attribute float aSize; attribute float aAlpha; varying float vA;
        uniform float uScale;
        void main(){ vA = aAlpha; vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D uMap; varying float vA; void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vec3(0.97,0.98,1.0), t.a * vA); if (gl_FragColor.a < 0.01) discard; }`,
    });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
  }

  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, n: number, spread: number, size = 0.35) {
    for (let i = 0; i < n; i++) {
      const k = this.next;
      this.next = (this.next + 1) % this.max;
      this.pos[k * 3] = x + (Math.random() - 0.5) * 0.4;
      this.pos[k * 3 + 1] = y + Math.random() * 0.15;
      this.pos[k * 3 + 2] = z + (Math.random() - 0.5) * 0.4;
      this.vel[k * 3] = vx + (Math.random() - 0.5) * spread;
      this.vel[k * 3 + 1] = vy + Math.random() * spread * 0.8;
      this.vel[k * 3 + 2] = vz + (Math.random() - 0.5) * spread;
      this.life[k] = 0.5 + Math.random() * 0.6;
      this.size[k] = size * (0.6 + Math.random() * 0.8);
    }
  }

  update(dt: number) {
    for (let k = 0; k < this.max; k++) {
      if (this.life[k] <= 0) { this.alpha[k] = 0; continue; }
      this.life[k] -= dt;
      this.vel[k * 3 + 1] -= 6 * dt;
      const drag = 1 - Math.min(0.9, 2.2 * dt);
      this.vel[k * 3] *= drag; this.vel[k * 3 + 2] *= drag;
      this.pos[k * 3] += this.vel[k * 3] * dt;
      this.pos[k * 3 + 1] += this.vel[k * 3 + 1] * dt;
      this.pos[k * 3 + 2] += this.vel[k * 3 + 2] * dt;
      this.alpha[k] = Math.min(1, this.life[k] * 1.6) * 0.85;
      this.size[k] *= 1 + dt * 1.2;
    }
    const g = this.points.geometry;
    (g.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (g.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true;
    (g.getAttribute('aAlpha') as THREE.BufferAttribute).needsUpdate = true;
  }
}

/** Ribbon tracks left by skis / board in the snow. */
export class Tracks {
  readonly mesh: THREE.Mesh;
  private max = 1400;
  private pos: Float32Array;
  private col: Float32Array;
  private n = 0;
  private last: THREE.Vector3[] = [];

  constructor() {
    this.pos = new Float32Array(this.max * 6 * 3);
    this.col = new Float32Array(this.max * 6 * 4);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 4));
    g.setDrawRange(0, 0);
    const m = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
  }

  reset() { this.last = []; }

  /**
   * Adds a segment for each runner (ski) given centre points; width in metres;
   * depth 0..1 darkens (powder trenches).
   */
  add(T: Terrain, points: THREE.Vector3[], width: number, depth: number) {
    if (this.last.length !== points.length) { this.last = points.map((p) => p.clone()); return; }
    for (let r = 0; r < points.length; r++) {
      const a = this.last[r], b = points[r];
      const dx = b.x - a.x, dz = b.z - a.z;
      const l = Math.hypot(dx, dz);
      if (l < 0.6) return;
      if (l > 6) { this.last[r].copy(b); continue; }
      const nx = (-dz / l) * width * 0.5, nz = (dx / l) * width * 0.5;
      const ya = T.height(a.x, a.z) + 0.03, yb = T.height(b.x, b.z) + 0.03;
      const quad = [
        [a.x + nx, ya, a.z + nz], [a.x - nx, ya, a.z - nz], [b.x + nx, yb, b.z + nz],
        [a.x - nx, ya, a.z - nz], [b.x - nx, yb, b.z - nz], [b.x + nx, yb, b.z + nz],
      ];
      if (this.n >= this.max) {
        // drop the oldest segment
        this.pos.copyWithin(0, 18, this.max * 18);
        this.col.copyWithin(0, 24, this.max * 24);
        this.n = this.max - 1;
      }
      const base = this.n * 18;
      quad.forEach((v, i) => { this.pos[base + i * 3] = v[0]; this.pos[base + i * 3 + 1] = v[1]; this.pos[base + i * 3 + 2] = v[2]; });
      const cb = this.n * 24;
      const shade = 0.72 - depth * 0.12;
      for (let i = 0; i < 6; i++) { this.col[cb + i * 4] = shade; this.col[cb + i * 4 + 1] = shade + 0.06; this.col[cb + i * 4 + 2] = shade + 0.14; this.col[cb + i * 4 + 3] = 0.32 + depth * 0.3; }
      this.n++;
    }
    for (let r = 0; r < points.length; r++) this.last[r].copy(points[r]);
    const g = this.mesh.geometry;
    g.setDrawRange(0, this.n * 6);
    (g.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (g.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true;
  }
}
