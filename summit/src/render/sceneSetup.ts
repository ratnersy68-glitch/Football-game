/** Renderer, sky dome, sun/hemisphere lighting, fog and distant backdrop mountains. */
import * as THREE from 'three';
import { Noise2D } from '../core/noise';
import { clamp, lerp } from '../core/math';

export type Quality = 'low' | 'medium' | 'high' | 'ultra';

export interface QualityProfile {
  pixelRatio: number;
  shadows: boolean;
  shadowSize: number;
  antialias: boolean;
  lodBias: number;
  treeNear: number;
  treeFar: number;
  drawDist: number;
  particles: number;
}

export const QUALITY: Record<Quality, QualityProfile> = {
  low: { pixelRatio: 0.75, shadows: false, shadowSize: 512, antialias: false, lodBias: 1, treeNear: 120, treeFar: 900, drawDist: 2600, particles: 0.35 },
  medium: { pixelRatio: 1, shadows: true, shadowSize: 1024, antialias: false, lodBias: 0.5, treeNear: 220, treeFar: 1500, drawDist: 3800, particles: 0.65 },
  high: { pixelRatio: 1, shadows: true, shadowSize: 2048, antialias: true, lodBias: 0, treeNear: 320, treeFar: 2200, drawDist: 5200, particles: 1 },
  ultra: { pixelRatio: 1.5, shadows: true, shadowSize: 4096, antialias: true, lodBias: -0.5, treeNear: 450, treeFar: 3000, drawDist: 7000, particles: 1.3 },
};

export interface Atmosphere {
  zenith: THREE.Color;
  horizon: THREE.Color;
  fog: THREE.Color;
  sunColor: THREE.Color;
  sunIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  fogDensity: number;
  sunDir: THREE.Vector3;
  stars: number;
  exposure: number;
}

export class Environment {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly sky: THREE.Mesh;
  private skyMat: THREE.ShaderMaterial;
  backdrop: THREE.Mesh | null = null;
  q: QualityProfile;
  atmo: Atmosphere;

  constructor(canvas: HTMLCanvasElement, quality: Quality) {
    this.q = QUALITY[quality];
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.q.antialias, powerPreference: 'high-performance', stencil: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * this.q.pixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = this.q.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.3, this.q.drawDist * 1.8);

    this.hemi = new THREE.HemisphereLight(0xcfe6ff, 0x8a8f99, 0.9);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 2.6);
    this.sun.castShadow = this.q.shadows;
    this.sun.shadow.mapSize.set(this.q.shadowSize, this.q.shadowSize);
    const sc = this.sun.shadow.camera;
    sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 1; sc.far = 600;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.6;
    this.scene.add(this.sun, this.sun.target);

    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        uZenith: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() },
        uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunColor: { value: new THREE.Color() },
        uStars: { value: 0 }, uTime: { value: 0 },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }`,
      fragmentShader: `
        uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uSunDir; uniform vec3 uSunColor; uniform float uStars; uniform float uTime;
        varying vec3 vDir;
        float hash(vec3 p){ p = fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
        void main(){
          vec3 d = normalize(vDir);
          float h = clamp(d.y, -0.2, 1.0);
          vec3 col = mix(uHorizon, uZenith, pow(max(h,0.0), 0.55));
          col = mix(col, uHorizon*0.92, smoothstep(0.0, -0.2, h));
          float sd = max(dot(d, normalize(uSunDir)), 0.0);
          col += uSunColor * (pow(sd, 900.0)*6.0 + pow(sd, 18.0)*0.35 + pow(sd, 3.0)*0.08);
          if (uStars > 0.0 && d.y > 0.0) {
            vec3 g = floor(d*420.0);
            float s = hash(g);
            col += vec3(step(0.9975, s) * uStars * (0.6 + 0.4*sin(uTime*2.0 + s*50.0)));
          }
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), this.skyMat);
    this.sky.scale.setScalar(this.q.drawDist * 1.6);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);
    this.scene.fog = new THREE.FogExp2(0xd8e6f2, 0.00022);
    this.atmo = timeOfDay(11, 'clear');
    this.applyAtmosphere(this.atmo);
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  applyAtmosphere(a: Atmosphere) {
    this.atmo = a;
    const u = this.skyMat.uniforms;
    (u.uZenith.value as THREE.Color).copy(a.zenith);
    (u.uHorizon.value as THREE.Color).copy(a.horizon);
    (u.uSunDir.value as THREE.Vector3).copy(a.sunDir);
    (u.uSunColor.value as THREE.Color).copy(a.sunColor).multiplyScalar(Math.min(1, a.sunIntensity / 2.5));
    u.uStars.value = a.stars;
    const fog = this.scene.fog as THREE.FogExp2;
    fog.color.copy(a.fog);
    fog.density = a.fogDensity;
    this.sun.color.copy(a.sunColor);
    this.sun.intensity = a.sunIntensity;
    this.hemi.color.copy(a.hemiSky);
    this.hemi.groundColor.copy(a.hemiGround);
    this.hemi.intensity = a.hemiIntensity;
    this.renderer.toneMappingExposure = a.exposure;
  }

  /** Keep the sky centred and the shadow frustum around the focus point. */
  follow(focus: THREE.Vector3, time: number) {
    this.sky.position.copy(this.camera.position);
    this.skyMat.uniforms.uTime.value = time;
    const d = this.atmo.sunDir;
    this.sun.position.set(focus.x + d.x * 250, focus.y + d.y * 250, focus.z + d.z * 250);
    this.sun.target.position.copy(focus);
    // texel snapping keeps shadows from shimmering
    const sc = this.sun.shadow.camera;
    const texel = (sc.right - sc.left) / this.sun.shadow.mapSize.x;
    this.sun.position.x = Math.round(this.sun.position.x / texel) * texel;
    this.sun.position.z = Math.round(this.sun.position.z / texel) * texel;
    if (this.backdrop) this.backdrop.position.set(this.camera.position.x * 0.9, 0, this.camera.position.z * 0.9);
  }

  /** Ring of distant low-poly peaks so the horizon never looks empty. */
  buildBackdrop(seed: string, baseY: number, tint: THREE.Color, rock: THREE.Color) {
    if (this.backdrop) { this.scene.remove(this.backdrop); this.backdrop.geometry.dispose(); }
    const noise = new Noise2D(seed + ':backdrop');
    const segs = 160, rings = 6;
    const R0 = this.q.drawDist * 0.85, R1 = this.q.drawDist * 1.35;
    const pos: number[] = [], col: number[] = [], idx: number[] = [];
    const c = new THREE.Color();
    for (let r = 0; r <= rings; r++) {
      const fr = r / rings;
      const rad = lerp(R0, R1, fr);
      for (let s = 0; s <= segs; s++) {
        const a = (s / segs) * Math.PI * 2;
        const ridge = noise.ridged(Math.cos(a) * 3 + 10, Math.sin(a) * 3 + 10, 4);
        const bump = Math.sin(fr * Math.PI);
        const h = (bump * (500 + ridge * 2200) + noise.noise(a * 9, fr * 5) * 180) * (r === 0 ? 0.0 : 1) + (r === rings ? -200 : 0);
        pos.push(Math.cos(a) * rad, baseY - 300 + h, Math.sin(a) * rad);
        const snow = clamp((h - 500) / 900, 0, 1);
        c.copy(rock).lerp(tint, 0.35 + 0.65 * snow);
        col.push(c.r, c.g, c.b);
      }
    }
    for (let r = 0; r < rings; r++) for (let s = 0; s < segs; s++) {
      const a = r * (segs + 1) + s, b = a + segs + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    this.backdrop = new THREE.Mesh(g, m);
    this.backdrop.frustumCulled = false;
    this.scene.add(this.backdrop);
  }

  dispose() {
    this.renderer.dispose();
  }
}

export type WeatherKind = 'clear' | 'light-snow' | 'heavy-snow' | 'overcast' | 'fog' | 'wind';
export const WEATHER_LABEL: Record<WeatherKind, string> = {
  clear: 'Clear skies', 'light-snow': 'Light snowfall', 'heavy-snow': 'Heavy snowfall', overcast: 'Overcast', fog: 'Fog', wind: 'Windy',
};

/** Builds the atmosphere for an hour (0–24) and a weather type. */
export function timeOfDay(hour: number, weather: WeatherKind): Atmosphere {
  const sunAlt = Math.sin(((hour - 6) / 12) * Math.PI); // 0 at 6/18, 1 at noon
  const az = ((hour - 12) / 12) * Math.PI;
  const sunDir = new THREE.Vector3(Math.sin(az) * 0.8, Math.max(-0.3, sunAlt) * 0.9 + 0.05, -0.6 + Math.cos(az) * 0.2).normalize();
  const day = clamp(sunAlt * 2.2, 0, 1);
  const golden = clamp(1 - Math.abs(sunAlt - 0.12) * 4, 0, 1) * (sunAlt > -0.1 ? 1 : 0);
  const night = clamp(-sunAlt * 3 + 0.2, 0, 1);
  const zenith = new THREE.Color('#2f6fc4').lerp(new THREE.Color('#0b1430'), night);
  const horizon = new THREE.Color('#bcd9f2').lerp(new THREE.Color('#f2b27a'), golden * 0.85).lerp(new THREE.Color('#1a2440'), night);
  const sunColor = new THREE.Color('#fff6ea').lerp(new THREE.Color('#ffb06a'), golden).lerp(new THREE.Color('#5a6a9a'), night);
  let sunI = lerp(0.15, 2.7, day) * (1 - night * 0.9);
  let hemiI = lerp(0.35, 1.0, day);
  const hemiSky = new THREE.Color('#cfe6ff').lerp(new THREE.Color('#ffd9b8'), golden * 0.6).lerp(new THREE.Color('#3a4a7a'), night);
  const hemiGround = new THREE.Color('#9aa3b0').lerp(new THREE.Color('#2a3044'), night);
  const fog = horizon.clone().lerp(new THREE.Color('#e4edf6'), 0.35 * day);
  let fogDensity = 0.00016;
  let exposure = lerp(0.9, 1.0, day) + night * 0.25;
  if (weather === 'overcast' || weather === 'light-snow' || weather === 'heavy-snow' || weather === 'fog') {
    const k = weather === 'overcast' ? 0.6 : weather === 'light-snow' ? 0.7 : weather === 'heavy-snow' ? 0.9 : 0.85;
    const grey = new THREE.Color('#c4ccd6').lerp(new THREE.Color('#1c2232'), night);
    zenith.lerp(grey.clone().multiplyScalar(0.85), k);
    horizon.lerp(grey, k);
    fog.lerp(grey, k);
    sunI *= 1 - k * 0.8;
    hemiI *= 1 + k * 0.25;
    exposure += 0.05 * k;
  }
  if (weather === 'light-snow') fogDensity = 0.0006;
  if (weather === 'heavy-snow') fogDensity = 0.0018;
  if (weather === 'fog') fogDensity = 0.0035;
  if (weather === 'overcast') fogDensity = 0.0004;
  if (weather === 'wind') fogDensity = 0.00028;
  if (night > 0.5) hemiI = Math.max(hemiI, 0.55);
  return { zenith, horizon, fog, sunColor, sunIntensity: sunI, hemiSky, hemiGround, hemiIntensity: hemiI, fogDensity, sunDir, stars: night * (weather === 'clear' || weather === 'wind' ? 1 : 0.1), exposure };
}
