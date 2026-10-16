/**
 * Game orchestrator: owns the renderer, the loaded resort and every runtime system, runs
 * the fixed-order frame loop and publishes HUD state to the React layer.
 */
import * as THREE from 'three';
import { RESORTS } from '../data/resorts';
import { buildResortAsync, trailPoint, type Resort } from '../world/resortBuilder';
import { Environment, QUALITY, timeOfDay, type Quality, type WeatherKind } from '../render/sceneSetup';
import { TerrainRenderer } from '../render/terrainRenderer';
import { Vegetation } from '../render/trees';
import { Props } from '../render/props';
import { LiftMeshes } from '../render/liftMeshes';
import { featureMesh, railMesh, courseMeshes } from '../render/featureMeshes';
import { Character, type Pose } from '../render/character';
import { Snowfall, Spray, Tracks } from '../render/effects';
import { renderMapCanvas, type MapView } from '../render/mapRender';
import { Skier, type PhysicsWorld, type SkierInput, NO_INPUT } from '../physics/skier';
import { RailSystem } from '../physics/rails';
import { TrickSystem, type FeedItem, type TrickResult } from '../physics/tricks';
import { Input } from './input';
import { CameraRig, CAM_LABEL } from './camera';
import { AudioEngine } from './audio';
import { LiftSystem } from './lifts';
import { Recorder, sample, emptyFrame, duration, type Recording } from './replay';
import { makeWeather, weatherLabel, WeatherCycle, type WeatherState } from './weather';
import { RaceSession, type RaceResult } from '../race/race';
import { gearStats, lookFor, type Look } from '../data/equipment';
import type { Profile } from '../state/save';
import { getRun, putRun } from '../state/save';
import { encode, decode } from './replay';
import { DIFFICULTY_INFO, type Difficulty, type Trail } from '../world/types';
import { SURFACE_PHYS } from '../world/terrain';
import type { FreestyleMode, ChallengeType, Medal } from '../data/career';
import { Rng } from '../core/rng';
import { formatTime } from '../core/math';

export type GameMode =
  | { kind: 'freeride' }
  | { kind: 'race'; course: number; level: number; title?: string; eventId?: string; tournament?: { id: string; index: number } }
  | { kind: 'park'; park: number; mode: FreestyleMode; time: number; targets: [number, number, number]; title: string; eventId?: string }
  | { kind: 'challenge'; type: ChallengeType; targets: [number, number, number]; title: string; eventId: string; trailId?: number; difficulty?: Difficulty; nth?: number };

export interface GameConfig {
  resortIndex: number;
  mode: GameMode;
  profile: Profile;
  quality: Quality;
  weather: WeatherKind;
  hour: number;
  dynamicWeather: boolean;
  startTrail?: number;
}

export interface HudState {
  speed: number; altitude: number; trail: string; difficulty: string | null; diffColor: string; surface: string; state: string;
  score: number; comboPot: number; comboMult: number; feed: FeedItem[];
  objective: string; timer: string | null; timerWarn: boolean; prompt: string | null; camera: string; fps: number; weather: string;
  conditions: string; riding: string | null; px: number; pz: number; heading: number; racers: { x: number; z: number; you: boolean; name: string }[];
  race: { pos: number; of: number; gate: number; gates: number; missed: number; split: string | null; countdown: number | null; standings: { name: string; country: string; gap: string; you: boolean }[] } | null;
  crashed: boolean; toast: string | null; runTimer: string | null; topSpeed: number;
}

export interface GameResult {
  title: string;
  kind: GameMode['kind'];
  medal: Medal | null;
  value: number;
  valueLabel: string;
  lines: string[];
  race?: RaceResult[];
  eventId?: string;
  tournament?: { id: string; index: number };
  coins: number;
  xp: number;
  record?: boolean;
  recordKey?: string;
  level?: number;
  trickBest?: TrickResult | null;
  bestCombo?: number;
  trickTotal?: number;
}

export interface GameCallbacks {
  onHud(h: HudState): void;
  onEnd(r: GameResult): void;
  onPause(p: boolean): void;
  onMap(open: boolean): void;
  onScoreboard(open: boolean): void;
  onReplay(open: boolean): void;
  onStats(s: { distance: number; topSpeed: number; maxAir: number; tricks: number; crashes: number; trailsDone: number[]; ridden: number[]; achievements: string[]; bestTrick: TrickResult | null; bestCombo: number }): void;
}

const tmpV = new THREE.Vector3();

export function poseOf(s: Skier, time: number, liftType: string | null): Pose {
  return {
    board: s.board, crouch: s.crouch, compression: s.compression, tuck: s.tuckAmt, brake: s.brakeAmt, lean: s.lean, slip: s.slip,
    air: s.state === 'air', grab: s.grab, grabAmt: s.grabAmt, spinning: Math.abs(s.spinVel) > 1,
    crashed: s.state === 'crashed', recovering: s.state === 'recover' ? 1 : 0,
    lift: s.state === 'lift' ? (liftType === 'gondola' ? 'gondola' : liftType === 'surface' ? 'surface' : 'chair') : 'none',
    grind: s.state === 'grind', speed: s.speed, time, turn: s.lean, hold: s.state === 'hold',
  };
}

function aiLook(seed: number, bib: number): Look {
  const r = new Rng(seed);
  const pick = (a: string[]) => r.pick(a);
  return {
    appearance: { skin: pick(['#f6d7c3', '#ecc1a0', '#d9a07a', '#b97a52', '#8d5a3b']), hair: '#2a1d14', hairStyle: 'short', face: 'clean', build: r.range(0.3, 0.7), height: r.range(0.9, 1.1) },
    ski: pick(['#d8282a', '#1f4fd0', '#f2c12e', '#eeeeee', '#151515']), skiAccent: '#fff', board: '#333', boardAccent: '#fff',
    helmet: pick(['#d8282a', '#1f4fd0', '#f2f2f2', '#151515', '#c9a227']), lens: pick(['#3a7ff0', '#f0a020', '#e85d8a']), frame: '#111',
    jacket: pick(['#14365f', '#c8322b', '#2a8a4a', '#6a2a8a', '#f2f2f2', '#ff7a1a']), jacketAccent: '#ffffff',
    pants: pick(['#14365f', '#c8322b', '#151515', '#2a2f38']), gloves: '#111', boots: pick(['#d8282a', '#f2f2f2', '#151515']), pack: null, poles: '#9aa3ad', bib,
  };
}

export class Game {
  env!: Environment;
  resort!: Resort;
  world!: PhysicsWorld;
  player = new Skier();
  character!: Character;
  input: Input;
  cam!: CameraRig;
  audio: AudioEngine;
  lifts!: LiftSystem;
  tricks = new TrickSystem();
  recorder = new Recorder(30, 150);
  private terrainR!: TerrainRenderer;
  private veg!: Vegetation;
  private props!: Props;
  private liftMeshes!: LiftMeshes;
  private snow!: Snowfall;
  private spray!: Spray;
  private tracks!: Tracks;
  private dynamicGroup = new THREE.Group();
  race: RaceSession | null = null;
  private racerChars: Character[] = [];
  private ghost: { rec: Recording; char: Character } | null = null;
  weather!: WeatherState;
  private cycle!: WeatherCycle;
  mapCanvas: HTMLCanvasElement | null = null;
  mapView: MapView | null = null;
  paused = false;
  ended = false;
  private raf = 0;
  private last = 0;
  private time = 0;
  private hudT = 0;
  private fpsT = 0;
  private frames = 0;
  private fps = 60;
  private toast: { text: string; t: number } | null = null;
  // mode state
  private modeT = 0;
  private modeTimer: number | null = null;
  private runTrail: { id: number; t0: number; best: number; off: number } | null = null;
  private runCheckT = 0;
  trailsDone = new Set<number>();
  ridden = new Set<number>();
  private sessionTop = 0;
  private sessionMaxAir = 0;
  private sessionDistance0 = 0;
  private sessionCrashes = 0;
  private achievements = new Set<string>();
  private challengeValue = 0;
  challengeTimes: Record<number, number> = {};
  private lastSplit: string | null = null;
  private splitT = 0;
  // replay
  replay: { rec: Recording; t: number; speed: number; playing: boolean; cam: 'follow' | 'orbit' | 'tripod' | 'side'; tripod: THREE.Vector3 | null } | null = null;
  private replayChar: Character | null = null;
  disposed = false;

  constructor(private canvas: HTMLCanvasElement, readonly config: GameConfig, private cb: GameCallbacks) {
    this.input = new Input(config.profile.settings.bindings);
    this.input.sensitivity = config.profile.settings.sensitivity;
    this.audio = new AudioEngine();
    const st = config.profile.settings;
    this.audio.setVolumes(st.master, st.sfx, st.amb);
  }

  async load(progress: (stage: string, f: number) => void) {
    const def = RESORTS[this.config.resortIndex];
    progress('Preparing renderer', 0);
    this.env = new Environment(this.canvas, this.config.quality);
    this.resize();
    const resort = await buildResortAsync(def, (s, f) => progress(s, f * 0.75));
    if (this.disposed) return;
    this.resort = resort;
    this.world = { terrain: resort.terrain, obstacles: resort.obstacles, rails: new RailSystem(resort.rails), wind: { x: 0, z: 0 } };
    this.weather = makeWeather(this.config.weather, this.config.hour, Date.now() % 100000);
    this.cycle = new WeatherCycle(Date.now() % 1000, this.config.dynamicWeather);
    resort.terrain.conditions = this.weather.conditions;
    this.world.wind = this.weather.wind;
    await tick();
    progress('Building the snowpack', 0.78);
    const q = QUALITY[this.config.quality];
    this.terrainR = new TerrainRenderer(resort.terrain, q.lodBias, def.theme.rock, def.theme.snowTint, q.shadows);
    this.env.scene.add(this.terrainR.group);
    progress('Planting forests', 0.84);
    await tick();
    this.veg = new Vegetation(resort.trees, resort.treeCount, resort.rocks, resort.rockCount, def.theme.foliage, def.theme.rock, q.shadows);
    this.env.scene.add(this.veg.root);
    progress('Drawing the trail map', 0.88);
    await tick();
    const map = renderMapCanvas(resort, 1400, 1400, false);
    this.mapCanvas = map.canvas;
    this.mapView = map.view;
    const boardTex = new THREE.CanvasTexture(renderMapCanvas(resort, 512, 352, false).canvas);
    boardTex.colorSpace = THREE.SRGBColorSpace;
    const night = this.config.hour < 7 || this.config.hour > 18.5 || this.config.dynamicWeather;
    this.props = new Props(resort, night, boardTex);
    this.env.scene.add(this.props.root);
    progress('Stringing the lifts', 0.92);
    this.lifts = new LiftSystem(resort.lifts);
    this.lifts.lifts.forEach((_, i) => { this.lifts.phases[i] = (i * 37) % 100; });
    this.liftMeshes = new LiftMeshes(this.lifts.paths, q.shadows);
    this.env.scene.add(this.liftMeshes.root);
    // park features, rails, race courses
    const featMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    for (const f of resort.terrain.features.list) {
      const m = featureMesh(resort.terrain, f, featMat);
      if (m) this.env.scene.add(m);
    }
    for (const r of resort.rails) this.env.scene.add(railMesh(r));
    for (const c of resort.courses) this.env.scene.add(courseMeshes(resort.terrain, c));
    this.env.buildBackdrop(def.seed, 0, new THREE.Color(def.theme.snowTint), new THREE.Color(def.theme.rock));
    // effects
    this.snow = new Snowfall(Math.floor(7000 * q.particles));
    this.spray = new Spray();
    this.tracks = new Tracks();
    this.env.scene.add(this.snow.points, this.spray.points, this.tracks.mesh, this.dynamicGroup);
    this.applyWeather();
    // player
    const prof = this.config.profile;
    this.player.board = prof.board;
    this.player.gear = gearStats(prof.equipped, prof.board);
    this.character = new Character(lookFor(prof.appearance, prof.equipped));
    this.env.scene.add(this.character.root);
    this.cam = new CameraRig(this.env.camera);
    this.cam.distanceScale = prof.settings.cameraDistance;
    this.cam.shakeEnabled = prof.settings.cameraShake;
    this.cam.fovBase = prof.settings.fov;
    this.ridden = new Set(prof.ridden[def.id] ?? []);
    this.trailsDone = new Set(prof.trailsDone[def.id] ?? []);
    this.achievements = new Set(prof.achievements);
    this.tricks.onTrick = (r) => this.onTrick(r);
    this.tricks.onBank = (score, list) => {
      if (list.length > 1) this.audio.combo();
      this.recorder.event(`Combo ${score.toLocaleString()}`, score);
      if (score >= 10000) this.unlock('combo-10k');
    };
    progress('Setting the start', 0.96);
    await this.setupMode();
    this.terrainR.warm(this.player.pos);
    this.sessionDistance0 = 0;
    // compile shaders during the loading screen instead of stalling the first frames
    progress('Compiling shaders', 0.98);
    await tick();
    try { this.env.renderer.compile(this.env.scene, this.env.camera); } catch { /* optional */ }
    progress('Ready', 1);
    (window as unknown as { __summit: Game }).__summit = this;
  }

  // ---------------------------------------------------------------- modes
  private async setupMode() {
    const m = this.config.mode;
    const R = this.resort;
    if (m.kind === 'race') {
      const course = R.courses[m.course];
      const prof = this.config.profile;
      const seed = m.tournament ? hash(m.tournament.id) : m.course * 7 + 3;
      this.race = new RaceSession(course, R.trails[course.trailId], this.world, {
        level: m.level, playerName: prof.name, playerGear: gearStats(prof.equipped, prof.board), board: prof.board, seed,
      });
      this.player = this.race.player.skier;
      this.race.racers.forEach((r) => {
        if (r.isPlayer) return;
        const c = new Character(aiLook(seed * 13 + r.id, r.bib));
        this.racerChars[r.id] = c;
        this.env.scene.add(c.root);
      });
      this.character.setBib(this.race.player.bib);
      const key = `ghost:${R.def.id}:${m.course}:${prof.board}`;
      const g = await getRun<Parameters<typeof decode>[0]>(key);
      if (g) {
        const char = new Character(lookFor(prof.appearance, prof.equipped));
        char.setGhost(true);
        this.ghost = { rec: decode(g), char };
        this.env.scene.add(char.root);
      }
      this.cam.mode = 'race';
    } else if (m.kind === 'park') {
      const park = R.parks[m.park];
      const tr = R.trails[park.trailId];
      const p = trailPoint(tr, 2);
      this.player.place(this.world, p.x, p.z, Math.atan2(p.dx, p.dz), 3);
      this.modeTimer = m.time;
    } else if (m.kind === 'challenge') {
      if (m.type === 'trailTime' && m.trailId === undefined) {
        const list = R.trails.filter((t) => t.kind === 'trail' && t.difficulty === (m.difficulty ?? 'blue'));
        const tr = list[Math.min(list.length - 1, m.nth ?? 0)] ?? R.trails.find((t) => t.kind === 'trail')!;
        m.trailId = tr.id;
        // medal times from the trail's length and difficulty (average speeds in m/s)
        const v = { bunny: 7, green: 11, blue: 14, black: 13, double: 11, triple: 9 }[tr.difficulty];
        const gold = tr.length / v;
        m.targets = [Math.round(gold * 1.5), Math.round(gold * 1.22), Math.round(gold)];
        m.title = `Time Trial: ${tr.name}`;
      }
      if (m.type === 'trailTime' && m.trailId !== undefined) {
        const tr = R.trails[m.trailId];
        const p = trailPoint(tr, 4);
        this.player.place(this.world, p.x, p.z, Math.atan2(p.dx, p.dz), 0);
        this.player.state = 'hold';
        this.modeT = -3.5;
      } else this.spawnDefault();
    } else {
      if (this.config.startTrail !== undefined) this.skiTrail(this.config.startTrail, true);
      else this.spawnDefault();
    }
  }

  private spawnDefault() {
    const R = this.resort;
    const pick = R.trails.find((t) => t.kind === 'trail' && t.difficulty === 'blue') ?? R.trails.find((t) => t.kind === 'trail')!;
    this.skiTrail(pick.id, true);
  }

  /** Teleport to the top of a trail (trail map "Ski this trail"). */
  skiTrail(id: number, silent = false) {
    if (this.race) return;
    const tr = this.resort.trails[id];
    const p = trailPoint(tr, Math.min(28, tr.length * 0.08));
    this.lifts.ride = null;
    this.player.place(this.world, p.x, p.z, Math.atan2(p.dx, p.dz), 0);
    this.cam?.snap();
    this.tracks?.reset();
    this.runTrail = { id, t0: this.time, best: 0, off: 0 };
    if (!silent) this.showToast(`${tr.name} — ${DIFFICULTY_INFO[tr.difficulty].label}`);
  }

  travelToLift(i: number) {
    if (this.race) return;
    this.lifts.travelTo(i, this.player, this.world);
    this.cam.snap();
    this.tracks.reset();
    this.showToast(`Top of ${this.resort.lifts[i].name}`);
  }

  travelToBase() {
    if (this.race) return;
    const l = this.resort.lifts[0];
    this.player.place(this.world, l.bottom.x + 6, l.bottom.z - 18, Math.PI, 0);
    this.cam.snap();
  }

  resetToTrail() {
    const s = this.player;
    if (this.race) {
      const r = this.race.player;
      if (r.finish !== null || !r.started) return;
      const g = this.race.gates[Math.max(0, r.next - 1)];
      const tr = this.race.trail;
      const p = trailPoint(tr, Math.max(4, (r.next > 0 ? g.s : 0) - 4));
      s.place(this.world, p.x, p.z, Math.atan2(p.dx, p.dz), 4);
      r.px = p.x; r.pz = p.z;
      this.cam.snap();
      return;
    }
    if (s.state === 'lift') return;
    let best: { t: Trail; i: number; d: number } | null = null;
    for (const t of this.resort.trails) {
      for (let i = 0; i < t.pts.length; i += 2) {
        const d = Math.hypot(t.pts[i].x - s.pos.x, t.pts[i].z - s.pos.z);
        if (!best || d < best.d) best = { t, i, d };
      }
    }
    if (!best) return;
    const back = Math.max(0, best.i - 3);
    const p = best.t.pts[back], q = best.t.pts[Math.min(best.t.pts.length - 1, back + 1)];
    s.place(this.world, p.x, p.z, Math.atan2(q.x - p.x, q.z - p.z), 0);
    this.tricks.bust();
    this.cam.snap();
    this.tracks.reset();
  }

  // ---------------------------------------------------------------- loop
  start() {
    this.last = performance.now();
    const loop = (now: number) => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      this.frame(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  setPaused(p: boolean) {
    if (this.ended && !p) return;
    this.paused = p;
    this.cb.onPause(p);
    if (p) this.audio.update({ speed: 0, grounded: false, surface: 'groomed', slip: 0, grinding: false, carving: false, wind: 0, liftNear: 0, crowd: 0, paused: true });
  }

  private handleActions() {
    const a = this.input.consume();
    if (this.replay) {
      if (a.has('pause') || a.has('replay')) this.closeReplay();
      if (a.has('camera')) this.cycleReplayCam();
      return;
    }
    if (a.has('pause')) { this.setPaused(!this.paused); return; }
    if (this.paused) return;
    if (a.has('map') && !this.race) { this.setPaused(true); this.cb.onMap(true); return; }
    if (a.has('scoreboard')) this.cb.onScoreboard(true);
    if (a.has('camera')) this.showToast(`Camera: ${CAM_LABEL[this.cam.next()]}`);
    if (a.has('reset')) this.resetToTrail();
    if (a.has('replay')) this.openReplay(20);
    if (a.has('interact') && !this.race) {
      if (this.lifts.riding) { this.lifts.skip(this.player, this.world); this.onUnload(); }
      else {
        const i = this.lifts.nearStation(this.player.pos.x, this.player.pos.z);
        if (i >= 0 && this.player.state === 'ride' && this.player.speed < 7) {
          this.lifts.board(i, this.player);
          this.showToast(`Boarding ${this.resort.lifts[i].name} — F to skip, hold W to speed up`);
        }
      }
    }
  }

  private frame(dt: number) {
    this.frames++;
    this.fpsT += dt;
    if (this.fpsT > 0.5) { this.fps = Math.round(this.frames / this.fpsT); this.frames = 0; this.fpsT = 0; }
    this.handleActions();
    if (this.replay) { this.updateReplay(dt); this.renderFrame(dt, true); return; }
    if (this.paused) { this.renderFrame(0, true); return; }
    this.time += dt;
    const inp = this.input.read(dt);
    this.simulate(dt, inp);
    this.renderFrame(dt, false);
  }

  private simulate(dt: number, inp: SkierInput) {
    const s = this.player;
    const m = this.config.mode;
    // ---- player / race
    if (this.race) {
      this.race.update(dt, inp);
      for (const b of this.race.beeps) { this.audio.beep(b === 0); if (b === 0) this.showToast('GO!'); }
      for (const e of this.race.events) {
        if (!e.racer.isPlayer) { if (e.type === 'finish') this.audio.cheer(0.4); continue; }
        if (e.type === 'gate') this.audio.gate(true);
        if (e.type === 'miss') { this.audio.gate(false); this.showToast(`Missed gate +${this.race.penalty}s`); }
        if (e.type === 'split') this.recordSplit(e.t);
        if (e.type === 'finish') { this.audio.horn(); this.recorder.event('Finish'); setTimeout(() => this.finishRace(), 1800); }
      }
    } else if (this.lifts.riding) {
      this.lifts.fast = inp.tuck;
      if (this.lifts.step(dt, s, this.world)) this.onUnload();
    } else if (m.kind === 'challenge' && this.modeT < 0) {
      this.modeT += dt;
      const sec = Math.ceil(-this.modeT);
      if (Math.ceil(-(this.modeT - dt)) !== sec) this.audio.beep(sec <= 0);
      if (this.modeT >= 0) { s.state = 'ride'; this.runTrail = { id: m.trailId!, t0: this.time, best: 0, off: 0 }; this.showToast('GO!'); }
      s.step(dt, NO_INPUT, this.world);
    } else {
      s.step(dt, inp, this.world);
    }
    this.lifts.update(dt);
    // ---- events
    for (const e of s.events) {
      switch (e.type) {
        case 'jump': this.audio.jump(); this.spray.emit(s.pos.x, s.pos.y, s.pos.z, 0, 1.5, 0, 12, 2.5); break;
        case 'land': {
          if ((e.air?.air ?? 0) > 0.25) {
            this.audio.land(e.v ?? 0);
            this.cam.bump(Math.min(0.8, (e.v ?? 0) * 0.05));
            this.spray.emit(s.pos.x, s.pos.y, s.pos.z, s.vel.x * 0.3, 2, s.vel.z * 0.3, 30 + Math.floor((e.v ?? 0) * 3), 4, 0.5);
            if (e.air) this.sessionMaxAir = Math.max(this.sessionMaxAir, e.air.air);
            if ((e.air?.air ?? 0) >= 4) this.unlock('big-air');
          }
          if (e.air && e.landing) {
            const r = this.tricks.landAir(e.air, e.landing);
            if (r && e.landing !== 'crash') this.recorder.event(r.name, r.score);
            if (this.config.mode.kind === 'challenge' && this.config.mode.type === 'air') this.challengeValue = Math.max(this.challengeValue, e.air.air);
          }
          break;
        }
        case 'crash':
          this.audio.crash(); this.cam.bump(1); this.tricks.bust(); this.sessionCrashes++;
          this.recorder.event(`Crash: ${e.reason}`);
          this.spray.emit(s.pos.x, s.pos.y, s.pos.z, s.vel.x * 0.3, 2.5, s.vel.z * 0.3, 60, 5, 0.6);
          if (!this.race) this.showToast(`${e.reason} — R to reset`);
          break;
        case 'collide': if ((e.v ?? 0) > 1) this.audio.thud(); break;
        case 'grindStart': this.audio.grindStart(); break;
        case 'grindEnd':
          if (e.grind) {
            const r = this.tricks.landGrind(e.grind.name, e.grind.seconds, e.grind.quality, e.grind.bonus);
            if (r) this.recorder.event(r.name, r.score);
            if (e.grind.seconds >= 2) this.unlock('grind');
          }
          if (e.reason === 'bail') this.tricks.bust('Bailed off the rail');
          break;
      }
    }
    s.events.length = 0;
    if (!this.race) this.tricks.tick(dt, s.grounded);
    // ---- session stats + objectives
    const kmh = s.speed * 3.6;
    if (s.state !== 'lift' && s.state !== 'crashed') this.sessionTop = Math.max(this.sessionTop, s.speed);
    if (kmh >= 100) this.unlock('speed-100');
    if (kmh >= 130) this.unlock('speed-130');
    this.trackRuns(dt);
    this.updateMode(dt);
    // ---- weather
    const w = this.cycle.update(dt, this.weather);
    if (w) { this.weather = w; this.resort.terrain.conditions = w.conditions; this.world.wind = w.wind; this.applyWeather(); }
    this.recorder.record(dt, s);
  }

  private renderFrame(dt: number, frozen: boolean) {
    const s = this.replay ? null : this.player;
    const env = this.env;
    // ---- characters
    if (s && !this.replay) {
      this.character.root.position.copy(s.pos).y += 0.04;
      this.character.root.quaternion.copy(s.bodyQ);
      this.character.root.visible = !(s.state === 'lift' && this.lifts.liftType === 'gondola') && this.cam.mode !== 'first';
      if (!frozen) this.character.update(poseOf(s, this.time, this.lifts.liftType), dt);
    }
    if (this.race) {
      for (const r of this.race.racers) {
        const c = this.racerChars[r.id];
        if (!c) continue;
        c.root.position.copy(r.skier.pos);
        c.root.quaternion.copy(r.skier.bodyQ);
        if (!frozen) c.update(poseOf(r.skier, this.time, null), dt);
      }
      if (this.ghost && !this.replay) {
        const [t0, t1] = duration(this.ghost.rec);
        const t = this.race.clock + t0;
        const vis = this.race.clock >= 0 && t <= t1;
        this.ghost.char.root.visible = vis;
        if (vis) {
          const f = sample(this.ghost.rec, t, emptyFrame());
          this.ghost.char.root.position.copy(f.pos);
          this.ghost.char.root.quaternion.copy(f.q);
          this.ghost.char.update({ ...poseOf(this.player, this.time, null), crouch: f.crouch, compression: f.compression, tuck: f.tuck, lean: f.lean, brake: f.brake, air: f.state === 'air', grab: f.grab, grabAmt: f.grabAmt, crashed: f.state === 'crashed', speed: f.speed }, dt);
        }
      }
    }
    // ---- effects
    if (s && !frozen) {
      this.emitSnow(s, dt);
      this.spray.update(dt);
    }
    // ---- camera
    if (!this.replay && s) {
      const head = this.cam.mode === 'first' ? this.character.headWorld(tmpV) : null;
      const liftDir = s.state === 'lift' ? new THREE.Vector3(s.vel.x, 0, s.vel.z) : undefined;
      if (!frozen) this.cam.update(dt, s, this.resort.terrain, head, liftDir);
    }
    const camPos = env.camera.position;
    this.snow.update(dt, camPos, this.world.wind ?? { x: 0, z: 0 }, tmpV.set(0, 0, 0));
    this.terrainR.update(camPos, frozen ? 2 : 5);
    const q = QUALITY[this.config.quality];
    this.veg.update(camPos, q.treeNear, q.treeFar);
    this.liftMeshes.update(this.lifts.phases, camPos);
    const focus = this.replay ? this.replayChar!.root.position : this.player.pos;
    env.follow(focus, this.time);
    // ---- audio
    if (!frozen && s) {
      const near = this.resort.lifts.reduce((m, l) => Math.max(m, 1 - Math.min(1, Math.min(Math.hypot(s.pos.x - l.bottom.x, s.pos.z - l.bottom.z), Math.hypot(s.pos.x - l.top.x, s.pos.z - l.top.z)) / 60)), 0);
      const crowd = this.race ? Math.max(0, 1 - Math.hypot(s.pos.x - this.race.course.finish.x, s.pos.z - this.race.course.finish.z) / 150) : 0;
      this.audio.update({ speed: s.state === 'lift' ? 2 : s.speed, grounded: s.state === 'ride', surface: s.surface, slip: s.slip, grinding: s.state === 'grind', carving: Math.abs(s.lean) > 0.3, wind: Math.hypot(this.world.wind?.x ?? 0, this.world.wind?.z ?? 0), liftNear: s.state === 'lift' ? 0.6 : near, crowd, paused: false });
    }
    env.renderer.render(env.scene, env.camera);
    // ---- hud
    this.hudT += dt;
    if (this.hudT > 0.08 || frozen) { this.hudT = 0; if (!this.replay) this.cb.onHud(this.hud()); }
  }

  private emitSnow(s: Skier, dt: number) {
    if (s.state !== 'ride') { if (s.state !== 'grind') this.tracks.reset(); return; }
    const sp = s.speed;
    const right = tmpV.set(-Math.cos(s.yaw), 0, Math.sin(s.yaw));
    const powder = s.surface === 'powder';
    const intensity = (s.slip * 3 + Math.abs(s.lean) * 0.8 + s.brakeAmt) * Math.min(1, sp / 12) + (powder ? sp / 20 : 0);
    if (sp > 4 && Math.random() < intensity * dt * 30) {
      const side = s.lean > 0 ? -1 : 1;
      this.spray.emit(s.pos.x + right.x * 0.3 * side, s.pos.y + 0.05, s.pos.z + right.z * 0.3 * side, -s.vel.x * 0.15 + right.x * side * 2, 1 + sp * 0.04, -s.vel.z * 0.15 + right.z * side * 2, powder ? 4 : 2, 1.6, powder ? 0.55 : 0.32);
    }
    if (sp > 1) {
      const depth = powder ? 0.6 + this.resort.terrain.conditions.powder * 0.4 : s.surface === 'slush' ? 0.4 : 0;
      if (s.board === 'snowboard') this.tracks.add(this.resort.terrain, [s.pos.clone()], powder ? 0.5 : 0.3, depth);
      else this.tracks.add(this.resort.terrain, [s.pos.clone().addScaledVector(right, 0.13), s.pos.clone().addScaledVector(right, -0.13)], powder ? 0.24 : 0.1, depth);
    }
  }

  private applyWeather() {
    const w = this.weather;
    this.env.applyAtmosphere(timeOfDay(w.hour, w.kind));
    this.snow.setIntensity(w.snowfall * 7000 * QUALITY[this.config.quality].particles);
  }

  // ---------------------------------------------------------------- runs, lifts, objectives
  private onUnload() {
    const i = this.lifts.lifts.findIndex((l) => Math.hypot(l.top.x - this.player.pos.x, l.top.z - this.player.pos.z) < 40);
    if (i >= 0) {
      this.ridden.add(i);
      if (this.ridden.size === this.resort.lifts.length) this.unlock('all-lifts');
      this.showToast(`Top of ${this.resort.lifts[i].name}`);
    }
    this.cam.snap();
    this.tracks.reset();
  }

  private trackRuns(dt: number) {
    this.runCheckT += dt;
    if (this.runCheckT < 0.4) return;
    this.runCheckT = 0;
    const s = this.player;
    if (s.state === 'lift') { this.runTrail = null; return; }
    const R = this.resort;
    if (this.runTrail) {
      const tr = R.trails[this.runTrail.id];
      let bi = this.runTrail.best, bd = Infinity;
      for (let i = Math.max(0, bi - 10); i < Math.min(tr.pts.length, bi + 40); i++) {
        const d = Math.hypot(tr.pts[i].x - s.pos.x, tr.pts[i].z - s.pos.z);
        if (d < bd) { bd = d; bi = i; }
      }
      if (bd < tr.width / 2 + 25) { this.runTrail.best = Math.max(this.runTrail.best, bi); this.runTrail.off = 0; }
      else this.runTrail.off += 0.4;
      if (this.runTrail.off > 8) this.runTrail = null;
      else if (this.runTrail.best >= tr.pts.length * 0.93) {
        const t = this.time - this.runTrail.t0;
        this.completeTrail(tr, t);
        this.runTrail = null;
      }
    } else if (s.speed < 25) {
      // detect starting down a trail from its top
      for (const tr of R.trails) {
        if (tr.kind !== 'trail') continue;
        const n = Math.max(2, Math.floor(tr.pts.length * 0.08));
        for (let i = 0; i < n; i++) {
          if (Math.hypot(tr.pts[i].x - s.pos.x, tr.pts[i].z - s.pos.z) < tr.width / 2 + 6) { this.runTrail = { id: tr.id, t0: this.time, best: i, off: 0 }; return; }
        }
      }
    }
  }

  private completeTrail(tr: Trail, t: number) {
    const first = !this.trailsDone.has(tr.id);
    this.trailsDone.add(tr.id);
    this.unlock('first-run');
    if (tr.difficulty === 'triple') this.unlock('triple-black');
    this.challengeTimes[tr.id] = Math.min(this.challengeTimes[tr.id] ?? Infinity, t);
    this.showToast(`${tr.name} complete — ${formatTime(t)}${first ? ' (new trail!)' : ''}`);
    this.audio.coins();
    const m = this.config.mode;
    if (m.kind === 'challenge' && m.type === 'trailTime' && m.trailId === tr.id) this.endChallenge(t);
  }

  private onTrick(r: TrickResult) {
    this.audio.trick(Math.min(3, Math.floor(r.score / 1200)));
    if (r.kind === 'air') {
      if (/\b(3|5|7|9|10|12|14|16|18)[0-9]0\b/.test(r.name) || r.spin >= 360) this.unlock('first-360');
      if (r.spin >= 1080) this.unlock('first-1080');
      if (/Backflip/.test(r.name)) this.unlock('backflip');
      if (/Cork/.test(r.name)) this.unlock('cork');
      if (/Triple Cork/.test(r.name)) this.unlock('triple-cork');
    }
  }

  private unlock(id: string) {
    if (this.achievements.has(id)) return;
    this.achievements.add(id);
    this.showToast('🏅 Achievement unlocked!');
  }

  private updateMode(dt: number) {
    const m = this.config.mode;
    if (m.kind === 'park' && this.modeTimer !== null && !this.ended) {
      this.modeTimer -= dt;
      // the park session only counts tricks inside the park corridor
      if (this.modeTimer <= 0) this.endPark();
    }
    if (m.kind === 'challenge' && !this.ended) {
      if (m.type === 'topSpeed') this.challengeValue = Math.max(this.challengeValue, this.sessionTop * 3.6);
      if (m.type === 'trails') this.challengeValue = this.trailsDone.size;
      if (m.type === 'lifts') this.challengeValue = this.ridden.size;
      if (m.type !== 'trailTime' && this.challengeValue >= m.targets[2]) this.endChallenge(this.challengeValue);
    }
  }

  private recordSplit(t: number) {
    const key = `split:${this.resort.def.id}:${(this.config.mode as { course: number }).course}`;
    void key;
    this.lastSplit = `Split ${formatTime(t)}`;
    this.splitT = 3;
  }

  // ---------------------------------------------------------------- endings
  private medalFor(v: number, t: [number, number, number], lowerIsBetter = false): Medal | null {
    if (lowerIsBetter) return v <= t[2] ? 'gold' : v <= t[1] ? 'silver' : v <= t[0] ? 'bronze' : null;
    return v >= t[2] ? 'gold' : v >= t[1] ? 'silver' : v >= t[0] ? 'bronze' : null;
  }

  private async finishRace() {
    if (!this.race || this.ended) return;
    const race = this.race;
    race.simulateRest(240);
    const res = race.results();
    const me = res.find((r) => r.isPlayer)!;
    const m = this.config.mode as Extract<GameMode, { kind: 'race' }>;
    const medal: Medal | null = me.dnf ? null : me.rank === 1 ? 'gold' : me.rank === 2 ? 'silver' : me.rank === 3 ? 'bronze' : null;
    const prof = this.config.profile;
    const key = `${this.resort.def.id}:${m.course}:${prof.board}`;
    const prev = prof.records[key]?.time;
    const record = me.time !== null && (prev === undefined || me.time < prev);
    if (record && me.time !== null) {
      const rec = this.recorder.snapshot(this.player.board, this.recorder.t - (me.raw ?? 0) - 0.5);
      void putRun(`ghost:${key}`, encode(rec));
    }
    const coins = (medal === 'gold' ? 900 : medal === 'silver' ? 600 : medal === 'bronze' ? 400 : 150) * (1 + this.resort.def.index * 0.4);
    this.ended = true;
    this.cb.onEnd({
      title: m.title ?? race.course.name, kind: 'race', medal, value: me.time ?? 0, valueLabel: me.time !== null ? formatTime(me.time) : 'DNF',
      lines: [
        me.dnf ? 'Did not finish' : `Finished ${ordinal(me.rank)} of ${res.length}`,
        `Missed gates: ${me.missed}${me.missed ? ` (+${me.missed * race.penalty}s)` : ''}`,
        race.course.discipline === 'freestyle' ? `Trick score: ${me.trickScore.toLocaleString()} (−${(me.trickScore / 1000).toFixed(1)}s)` : '',
        record ? '🏁 New personal record — ghost saved' : prev !== undefined ? `Personal best: ${formatTime(prev)}` : '',
      ].filter(Boolean),
      race: res, eventId: m.eventId, tournament: m.tournament, coins: Math.round(coins), xp: Math.round(coins * 1.4), record, recordKey: key, level: m.level,
    });
  }

  forfeitRace() {
    if (!this.race || this.ended) return;
    this.race.forfeit();
    void this.finishRace();
  }

  private endPark() {
    const m = this.config.mode as Extract<GameMode, { kind: 'park' }>;
    this.tricks.bank();
    const results = this.tricks.results;
    let value = 0;
    if (m.mode === 'best') value = this.tricks.best?.score ?? 0;
    else if (m.mode === 'combo') value = this.tricks.bestCombo;
    else if (m.mode === 'grind') value = results.filter((r) => r.kind === 'grind').reduce((a, r) => a + r.score, 0);
    else value = this.tricks.total;
    const medal = this.medalFor(value, m.targets);
    this.ended = true;
    this.cb.onEnd({
      title: m.title, kind: 'park', medal, value, valueLabel: `${Math.round(value).toLocaleString()} pts`,
      lines: [`Targets: ${m.targets.map((t) => t.toLocaleString()).join(' / ')}`, `Tricks landed: ${results.length}`, this.tricks.best ? `Best trick: ${this.tricks.best.name} (${this.tricks.best.score.toLocaleString()})` : 'No tricks landed'],
      eventId: m.eventId, coins: Math.round(value / 25 + (medal ? 300 : 50)), xp: Math.round(value / 15 + (medal ? 400 : 80)), trickBest: this.tricks.best, bestCombo: this.tricks.bestCombo, trickTotal: this.tricks.total,
    });
  }

  endChallenge(value: number) {
    if (this.ended) return;
    const m = this.config.mode as Extract<GameMode, { kind: 'challenge' }>;
    const lower = m.type === 'trailTime';
    const medal = this.medalFor(value, m.targets, lower);
    this.ended = true;
    const label = m.type === 'trailTime' ? formatTime(value) : m.type === 'topSpeed' ? `${Math.round(value)} km/h` : m.type === 'air' ? `${value.toFixed(2)} s` : `${value}`;
    const fmt = (v: number) => (m.type === 'trailTime' ? formatTime(v) : m.type === 'topSpeed' ? `${v} km/h` : m.type === 'air' ? `${v}s` : `${v}`);
    this.cb.onEnd({
      title: m.title, kind: 'challenge', medal, value, valueLabel: label,
      lines: [`Bronze ${fmt(m.targets[0])} · Silver ${fmt(m.targets[1])} · Gold ${fmt(m.targets[2])}`],
      eventId: m.eventId, coins: medal ? 300 : 60, xp: medal ? 450 : 80,
    });
  }

  /** "End & score" from the pause menu for open challenges / park sessions. */
  endEarly() {
    const m = this.config.mode;
    if (m.kind === 'park') this.endPark();
    else if (m.kind === 'challenge') this.endChallenge(m.type === 'trailTime' ? Infinity : this.challengeValue);
    else if (m.kind === 'race') this.forfeitRace();
  }

  /** Free-ride session summary (coins for distance + tricks) when quitting. */
  sessionSummary() {
    this.tricks.bank();
    return {
      distance: this.player.distance - this.sessionDistance0,
      topSpeed: this.sessionTop, maxAir: this.sessionMaxAir, tricks: this.tricks.results.length, crashes: this.sessionCrashes,
      trailsDone: [...this.trailsDone], ridden: [...this.ridden], achievements: [...this.achievements],
      bestTrick: this.tricks.best, bestCombo: this.tricks.bestCombo, trickTotal: this.tricks.total,
    };
  }

  // ---------------------------------------------------------------- replay
  openReplay(seconds = 20, rec?: Recording) {
    const r = rec ?? this.recorder.snapshot(this.player.board, this.recorder.t - seconds);
    if (!r.count) return;
    if (!this.replayChar) {
      this.replayChar = new Character(lookFor(this.config.profile.appearance, this.config.profile.equipped));
      this.env.scene.add(this.replayChar.root);
    }
    this.character.root.visible = false;
    this.replay = { rec: r, t: duration(r)[0], speed: 1, playing: true, cam: 'follow', tripod: null };
    this.cb.onReplay(true);
  }

  closeReplay() {
    if (!this.replay) return;
    this.replay = null;
    if (this.replayChar) this.replayChar.root.visible = false;
    this.character.root.visible = true;
    this.cam.snap();
    this.cb.onReplay(false);
  }

  cycleReplayCam() {
    if (!this.replay) return;
    const order: ('follow' | 'orbit' | 'tripod' | 'side')[] = ['follow', 'tripod', 'side', 'orbit'];
    this.replay.cam = order[(order.indexOf(this.replay.cam) + 1) % order.length];
    this.replay.tripod = null;
  }

  private replayCamPos = new THREE.Vector3();
  private updateReplay(dt: number) {
    const R = this.replay!;
    const [t0, t1] = duration(R.rec);
    if (R.playing) R.t += dt * R.speed;
    if (R.t > t1) { R.t = t1; R.playing = false; }
    const f = sample(R.rec, R.t, emptyFrame());
    const c = this.replayChar!;
    c.root.visible = true;
    c.root.position.copy(f.pos);
    c.root.quaternion.copy(f.q);
    c.update({ board: R.rec.board, crouch: f.crouch, compression: f.compression, tuck: f.tuck, brake: f.brake, lean: f.lean, slip: 0, air: f.state === 'air', grab: f.grab, grabAmt: f.grabAmt, spinning: false, crashed: f.state === 'crashed', recovering: 0, lift: f.state === 'lift' ? 'chair' : 'none', grind: f.state === 'grind', speed: f.speed, time: R.t, turn: f.lean, hold: false }, Math.max(dt * R.speed, 0.001));
    const T = this.resort.terrain;
    const cam = this.env.camera;
    const ahead = sample(R.rec, Math.min(t1, R.t + 0.4), emptyFrame());
    const dir = ahead.pos.clone().sub(f.pos).setY(0);
    if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
    dir.normalize();
    let want = new THREE.Vector3();
    let fov = 55;
    switch (R.cam) {
      case 'follow': want.copy(f.pos).addScaledVector(dir, -7).add(new THREE.Vector3(0, 3, 0)); break;
      case 'side': want.copy(f.pos).add(new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(10)).add(new THREE.Vector3(0, 2, 0)); fov = 45; break;
      case 'orbit': { const a = R.t * 0.5; want.copy(f.pos).add(new THREE.Vector3(Math.cos(a) * 9, 3.5, Math.sin(a) * 9)); break; }
      case 'tripod': {
        // cinematic fixed camera placed ahead of the rider, re-placed when they get far
        if (!R.tripod || R.tripod.distanceTo(f.pos) > 45) {
          const fut = sample(R.rec, Math.min(t1, R.t + 1.6), emptyFrame());
          R.tripod = fut.pos.clone().add(new THREE.Vector3(-dir.z * 12, 0, dir.x * 12));
          R.tripod.y = T.height(R.tripod.x, R.tripod.z) + 1.6;
        }
        want = R.tripod.clone();
        fov = 40;
        break;
      }
    }
    want.y = Math.max(want.y, T.height(want.x, want.z) + 1.2);
    if (R.cam === 'tripod') this.replayCamPos.copy(want);
    else this.replayCamPos.lerp(want, this.replayCamPos.lengthSq() === 0 ? 1 : Math.min(1, dt * 6 + 0.02));
    cam.position.copy(this.replayCamPos);
    cam.lookAt(f.pos.x, f.pos.y + 1, f.pos.z);
    cam.fov = fov;
    cam.updateProjectionMatrix();
    void t0;
  }

  replayInfo() {
    if (!this.replay) return null;
    const [t0, t1] = duration(this.replay.rec);
    const events = this.replay.rec.events;
    const recent = events.filter((e) => e.t <= this.replay!.t && e.t > this.replay!.t - 2.5).map((e) => e.text);
    return { t: this.replay.t - t0, len: t1 - t0, playing: this.replay.playing, speed: this.replay.speed, cam: this.replay.cam, recent };
  }
  replaySeek(f: number) { if (this.replay) { const [t0, t1] = duration(this.replay.rec); this.replay.t = t0 + (t1 - t0) * f; this.replay.tripod = null; } }
  replayToggle() { if (this.replay) { const [, t1] = duration(this.replay.rec); if (this.replay.t >= t1) this.replay.t = duration(this.replay.rec)[0]; this.replay.playing = !this.replay.playing; } }
  replaySpeed(s: number) { if (this.replay) this.replay.speed = s; }
  replayRestart() { if (this.replay) { this.replay.t = duration(this.replay.rec)[0]; this.replay.playing = true; } }
  async replaySave(title: string) {
    if (!this.replay) return;
    const rec = { ...this.replay.rec, meta: { resortId: this.resort.def.id, title, date: Date.now(), score: this.tricks.total } };
    await putRun(`replay:${Date.now()}`, encode(rec));
  }

  // ---------------------------------------------------------------- hud
  showToast(text: string) { this.toast = { text, t: this.time }; }

  hud(): HudState {
    const s = this.player;
    const T = this.resort.terrain;
    const tr = T.trailAt(s.pos.x, s.pos.z);
    const trail = tr.id >= 0 && tr.w > 0.4 ? this.resort.trails[tr.id] : null;
    const m = this.config.mode;
    let objective = 'Free ride — explore the mountain';
    let timer: string | null = null;
    let warn = false;
    if (m.kind === 'park') {
      objective = `${m.title}: ${m.mode === 'best' ? 'best single trick' : m.mode === 'combo' ? 'best combo' : m.mode === 'grind' ? 'rail score' : 'total score'} — gold ${m.targets[2].toLocaleString()}`;
      timer = formatTime(Math.max(0, this.modeTimer ?? 0));
      warn = (this.modeTimer ?? 0) < 15;
    } else if (m.kind === 'challenge') {
      const v = m.type === 'topSpeed' ? `${Math.round(this.challengeValue)} km/h` : m.type === 'air' ? `${this.challengeValue.toFixed(2)} s` : m.type === 'trailTime' ? '' : `${this.challengeValue}`;
      objective = `${m.title}${v ? ` — ${v} / gold ${m.type === 'topSpeed' ? m.targets[2] + ' km/h' : m.targets[2]}` : ''}`;
      if (m.type === 'trailTime') timer = this.modeT < 0 ? `${Math.ceil(-this.modeT)}` : this.runTrail ? formatTime(this.time - this.runTrail.t0) : '--';
    } else if (m.kind === 'race' && this.race) {
      objective = `${this.race.course.name}`;
      const r = this.race.player;
      timer = r.finish !== null ? formatTime(this.race.totalTime(r) ?? r.finish) : formatTime(Math.max(0, this.race.clock - r.startAt));
    } else {
      const near = this.lifts.nearStation(s.pos.x, s.pos.z);
      if (this.lifts.riding) objective = `Riding ${this.resort.lifts[this.lifts.ride!.lift].name}`;
      else if (near >= 0) objective = `${this.resort.lifts[near].name} — press F to ride`;
    }
    let prompt: string | null = null;
    if (!this.race && !this.lifts.riding && s.state === 'ride') {
      const near = this.lifts.nearStation(s.pos.x, s.pos.z);
      if (near >= 0) prompt = `F — Ride ${this.resort.lifts[near].name}`;
    }
    if (this.lifts.riding) prompt = 'F — Skip ride · Hold W — Fast forward';
    if (s.state === 'crashed' || s.state === 'recover') prompt = 'R — Reset to trail';
    let raceHud: HudState['race'] = null;
    const racers: HudState['racers'] = [];
    if (this.race) {
      const st = this.race.standings();
      const me = this.race.player;
      const leader = st[0];
      raceHud = {
        pos: st.indexOf(me) + 1, of: st.length, gate: Math.min(me.next, this.race.course.gates.length), gates: this.race.course.gates.length, missed: me.missed,
        split: this.splitT > 0 ? this.lastSplit : null,
        countdown: this.race.clock < 0 ? Math.ceil(-this.race.clock) : null,
        standings: st.slice(0, 8).map((r) => ({
          name: r.name, country: r.country, you: r.isPlayer,
          gap: r.finish !== null ? formatTime(this.race!.totalTime(r) ?? r.finish) : r === leader ? `Gate ${r.next}` : `−${Math.max(0, leader.next - r.next)} gates`,
        })),
      };
      for (const r of this.race.racers) racers.push({ x: r.skier.pos.x, z: r.skier.pos.z, you: r.isPlayer, name: r.name });
      this.splitT -= 0.08;
    }
    const toast = this.toast && this.time - this.toast.t < 3 ? this.toast.text : null;
    return {
      speed: s.speed, altitude: Math.round(this.resort.def.baseAlt + s.pos.y), trail: trail ? trail.name : s.state === 'lift' ? '' : 'Off-piste',
      difficulty: trail ? (trail.kind === 'trail' ? DIFFICULTY_INFO[trail.difficulty].short : trail.kind === 'race' ? 'Racecourse' : 'Terrain Park') : null,
      diffColor: trail ? (trail.kind === 'trail' ? trail.difficulty : trail.kind) : '',
      surface: SURFACE_PHYS[s.surface].label, state: s.state,
      score: Math.round(this.race ? this.race.player.tricks.total : this.tricks.total), comboPot: this.race ? this.race.player.tricks.comboPot : this.tricks.comboPot,
      comboMult: this.race ? this.race.player.tricks.comboMult : this.tricks.comboMult, feed: (this.race ? this.race.player.tricks : this.tricks).feed.filter((f) => this.time - f.t < 4.5 || this.race),
      objective, timer, timerWarn: warn, prompt, camera: CAM_LABEL[this.cam.mode], fps: this.fps, weather: weatherLabel(this.weather), conditions: this.weather.conditions.label,
      riding: this.lifts.riding ? this.resort.lifts[this.lifts.ride!.lift].name : null,
      px: s.pos.x, pz: s.pos.z, heading: Math.atan2(s.vel.x, s.vel.z), racers, race: raceHud, crashed: s.state === 'crashed', toast,
      runTimer: this.runTrail && m.kind === 'freeride' ? `${this.resort.trails[this.runTrail.id].name} ${formatTime(this.time - this.runTrail.t0)}` : null,
      topSpeed: this.sessionTop,
    };
  }

  // ---------------------------------------------------------------- misc
  resize() {
    if (!this.env) return;
    const r = this.canvas.parentElement?.getBoundingClientRect() ?? { width: window.innerWidth, height: window.innerHeight };
    this.env.resize(Math.max(1, Math.floor(r.width)), Math.max(1, Math.floor(r.height)));
  }

  setWeather(kind: WeatherKind, hour: number) {
    this.weather = makeWeather(kind, hour, Math.floor(Math.random() * 1e6));
    this.resort.terrain.conditions = this.weather.conditions;
    this.world.wind = this.weather.wind;
    this.applyWeather();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.input.dispose();
    this.audio.dispose();
    if (!this.env) return;
    this.terrainR?.dispose();
    this.veg?.dispose();
    this.props?.dispose();
    this.liftMeshes?.dispose();
    this.env.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
    this.env.dispose();
    const w = window as unknown as { __summit?: Game };
    if (w.__summit === this) delete w.__summit;
  }
}

function tick() { return new Promise((r) => setTimeout(r, 0)); }
function hash(s: string) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 100000; }
function ordinal(n: number) { return `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`; }
