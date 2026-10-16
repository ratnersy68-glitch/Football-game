/**
 * Chunked LOD terrain. 256 m chunks are rebuilt at 2/4/8/16/32 m vertex spacing depending
 * on camera distance (with skirts hiding cracks). Vertex colours come from the same
 * surface classification physics uses; a patched MeshStandardMaterial adds groomed
 * corduroy, snow grain variation and view-dependent sparkle, and makes ice glossy.
 */
import * as THREE from 'three';
import type { Terrain } from '../world/terrain';
import { clamp, smoothstep } from '../core/math';

const CHUNK = 256;
const STEPS = [2, 4, 8, 16, 32];

/** Sparkle strength — follows sunlight so glints vanish at night / in fog. */
export const snowGlint = { value: 1 };

export function makeSnowMaterial(): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uGlint = snowGlint;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute float aGroom; attribute float aStripe; attribute float aIce;
        varying float vGroom; varying float vStripe; varying float vIce; varying vec3 vWPos;`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        vGroom = aGroom; vStripe = aStripe; vIce = aIce;
        vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying float vGroom; varying float vStripe; varying float vIce; varying vec3 vWPos;
        uniform float uGlint;
        float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
        float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float camDist = length(vWPos - cameraPosition);
        float n1 = vnoise(vWPos.xz * 0.18) * 0.6 + vnoise(vWPos.xz * 0.9) * 0.4;
        diffuseColor.rgb *= 0.955 + 0.07 * n1;
        float stripe = abs(fract(vStripe / 0.34) - 0.5) * 2.0;
        float cord = smoothstep(0.55, 0.95, stripe) * vGroom * (1.0 - smoothstep(25.0, 90.0, camDist));
        diffuseColor.rgb *= 1.0 - cord * 0.085;
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.93, 0.97, 1.03), vGroom * 0.35);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.28, vIce);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          vec3 vd = normalize(cameraPosition - vWPos);
          vec2 gp = vWPos.xz * 14.0;
          vec2 cell = floor(gp);
          float r = h21(cell);
          float dotMask = 1.0 - smoothstep(0.05, 0.16, length(fract(gp) - 0.5));
          vec3 fdir = normalize(vec3(h21(cell + 7.1) - 0.5, 1.2, h21(cell + 3.7) - 0.5));
          float glint = step(0.9, r) * dotMask * pow(max(dot(reflect(-vd, fdir), normalize(vec3(0.3, 0.8, -0.5))), 0.0), 40.0);
          totalEmissiveRadiance += vec3(glint) * 2.2 * uGlint * (1.0 - smoothstep(8.0, 40.0, length(cameraPosition - vWPos))) * (1.0 - vIce);
        }`);
  };
  return m;
}

interface Chunk {
  cx: number; cz: number;
  x0: number; z0: number;
  mesh: THREE.Mesh | null;
  lod: number;
  want: number;
  queued: boolean;
}

export class TerrainRenderer {
  readonly group = new THREE.Group();
  readonly material: THREE.MeshStandardMaterial;
  private chunks: Chunk[] = [];
  private queue: Chunk[] = [];
  private lodBias: number;
  private rockColor: THREE.Color;
  private snowTint: THREE.Color;
  private lakeMeshes: THREE.Mesh[] = [];
  builtVerts = 0;

  constructor(private terrain: Terrain, lodBias: number, rock: string, snowTint: string, private shadows: boolean) {
    this.material = makeSnowMaterial();
    this.lodBias = lodBias;
    this.rockColor = new THREE.Color(rock);
    this.snowTint = new THREE.Color(snowTint);
    const nx = Math.ceil((terrain.maxX - terrain.x0) / CHUNK);
    const nz = Math.ceil((terrain.maxZ - terrain.z0) / CHUNK);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      this.chunks.push({ cx: i, cz: j, x0: terrain.x0 + i * CHUNK, z0: terrain.z0 + j * CHUNK, mesh: null, lod: -1, want: 4, queued: false });
    }
    // frozen lakes
    for (const l of terrain.lakes) {
      const g = new THREE.CircleGeometry(l.r + 2, 48);
      g.rotateX(-Math.PI / 2);
      const m = new THREE.MeshStandardMaterial({ color: 0xbcd6ea, roughness: 0.12, metalness: 0.05 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(l.x, l.y + 0.12, l.z);
      mesh.receiveShadow = shadows;
      this.lakeMeshes.push(mesh);
      this.group.add(mesh);
    }
  }

  private lodFor(c: Chunk, cam: THREE.Vector3): number {
    const dx = Math.max(c.x0 - cam.x, 0, cam.x - (c.x0 + CHUNK));
    const dz = Math.max(c.z0 - cam.z, 0, cam.z - (c.z0 + CHUNK));
    const d = Math.hypot(dx, dz) + Math.max(0, cam.y - this.terrain.gridHeight(cam.x, cam.z) - 60) * 0.5;
    const t = [170, 420, 950, 1900];
    let lod = 4;
    for (let i = 0; i < t.length; i++) if (d < t[i]) { lod = i; break; }
    return clamp(Math.round(lod + this.lodBias), 0, 4);
  }

  /** Build everything near `cam` synchronously (used at load). */
  warm(cam: THREE.Vector3) {
    for (const c of this.chunks) {
      c.want = this.lodFor(c, cam);
      this.build(c, Math.max(c.want, c.want <= 1 ? c.want : 3));
    }
  }

  update(cam: THREE.Vector3, budgetMs = 5) {
    for (const c of this.chunks) {
      const w = this.lodFor(c, cam);
      c.want = w;
      if (w !== c.lod && !c.queued) { c.queued = true; this.queue.push(c); }
    }
    if (!this.queue.length) return;
    // closest / most-needed first
    this.queue.sort((a, b) => a.want - b.want);
    const t0 = performance.now();
    while (this.queue.length && performance.now() - t0 < budgetMs) {
      const c = this.queue.shift()!;
      c.queued = false;
      if (c.want !== c.lod) this.build(c, c.want);
    }
  }

  private build(c: Chunk, lod: number) {
    const T = this.terrain;
    const step = STEPS[lod];
    const n = CHUNK / step;
    const vn = n + 1;
    const total = vn * vn + 4 * vn;
    const pos = new Float32Array(total * 3);
    const nor = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const groom = new Float32Array(total);
    const stripe = new Float32Array(total);
    const ice = new Float32Array(total);
    const col3 = new THREE.Color();
    const glacier = new THREE.Color('#bcdcf2');
    const iceC = new THREE.Color('#bcd2e2');
    const groomC = new THREE.Color('#eef3fa');
    const powderC = this.snowTint.clone();
    const slushC = new THREE.Color('#e4e2da');
    const eps = Math.max(0.8, step * 0.5);
    let k = 0;
    const fill = (x: number, z: number, yOff: number) => {
      const y = T.baseHeight(x, z);
      const hl = T.baseHeight(x - eps, z), hr = T.baseHeight(x + eps, z), hd = T.baseHeight(x, z - eps), hu = T.baseHeight(x, z + eps);
      let nx = hl - hr, ny = 2 * eps, nz = hd - hu;
      const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
      pos[k * 3] = x; pos[k * 3 + 1] = y + yOff; pos[k * 3 + 2] = z;
      nor[k * 3] = nx; nor[k * 3 + 1] = ny; nor[k * 3 + 2] = nz;
      const surf = T.surfaceAt(x, z);
      const slope = Math.sqrt(1 - ny * ny) / Math.max(0.05, ny);
      const tr = T.trailAt(x, z);
      const tw = tr.id >= 0 ? tr.w : 0;
      const trail = tr.id >= 0 ? T.trails[tr.id] : null;
      const groomed = trail && (trail.groomed || trail.kind !== 'trail') ? tw : 0;
      col3.copy(powderC);
      if (surf === 'ice') col3.copy(iceC);
      else if (surf === 'slush') col3.copy(slushC);
      else if (groomed > 0.05) col3.lerp(groomC, groomed);
      if (y > T.glacierLine && tw < 0.5) col3.lerp(glacier, smoothstep(T.glacierLine, T.glacierLine + 40, y) * 0.75);
      const rock = smoothstep(0.85, 1.25, slope) * (1 - tw);
      if (rock > 0) col3.lerp(this.rockColor, rock);
      // subtle shading so steep faces read darker/bluer
      col3.multiplyScalar(1 - Math.min(0.12, slope * 0.06));
      col[k * 3] = col3.r; col[k * 3 + 1] = col3.g; col[k * 3 + 2] = col3.b;
      groom[k] = groomed;
      ice[k] = surf === 'ice' ? 1 : 0;
      // stripes follow the broad fall line (24 m gradient) so they don't zig-zag
      const bgx = T.gridHeight(x + 24, z) - T.gridHeight(x - 24, z), bgz = T.gridHeight(x, z + 24) - T.gridHeight(x, z - 24);
      const th = Math.atan2(-bgx, -bgz);
      stripe[k] = x * Math.cos(th) - z * Math.sin(th);
      k++;
    };
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) fill(c.x0 + i * step, c.z0 + j * step, 0);
    // skirts: four edges
    const skirtStart = k;
    const drop = -Math.max(6, step * 1.5);
    for (let i = 0; i <= n; i++) fill(c.x0 + i * step, c.z0, drop);
    for (let i = 0; i <= n; i++) fill(c.x0 + i * step, c.z0 + CHUNK, drop);
    for (let j = 0; j <= n; j++) fill(c.x0, c.z0 + j * step, drop);
    for (let j = 0; j <= n; j++) fill(c.x0 + CHUNK, c.z0 + j * step, drop);
    const idx: number[] = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const a = j * vn + i, b = a + 1, cc = a + vn, d = cc + 1;
      idx.push(a, cc, b, b, cc, d);
    }
    const edge = (gridIdx: (t: number) => number, skirtBase: number, flip: boolean) => {
      for (let t = 0; t < n; t++) {
        const a = gridIdx(t), b = gridIdx(t + 1), sa = skirtBase + t, sb = skirtBase + t + 1;
        if (flip) idx.push(a, b, sa, b, sb, sa); else idx.push(a, sa, b, b, sa, sb);
      }
    };
    edge((t) => t, skirtStart, true);
    edge((t) => n * vn + t, skirtStart + vn, false);
    edge((t) => t * vn, skirtStart + 2 * vn, false);
    edge((t) => t * vn + n, skirtStart + 3 * vn, true);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aGroom', new THREE.BufferAttribute(groom, 1));
    g.setAttribute('aStripe', new THREE.BufferAttribute(stripe, 1));
    g.setAttribute('aIce', new THREE.BufferAttribute(ice, 1));
    g.setIndex(vn * vn > 65000 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    if (c.mesh) {
      c.mesh.geometry.dispose();
      c.mesh.geometry = g;
    } else {
      c.mesh = new THREE.Mesh(g, this.material);
      c.mesh.receiveShadow = this.shadows;
      c.mesh.matrixAutoUpdate = false;
      this.group.add(c.mesh);
    }
    this.builtVerts += total;
    c.lod = lod;
  }

  dispose() {
    for (const c of this.chunks) c.mesh?.geometry.dispose();
    for (const l of this.lakeMeshes) { l.geometry.dispose(); (l.material as THREE.Material).dispose(); }
    this.material.dispose();
  }
}
