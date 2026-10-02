/**
 * Entry point: wires GameEngine (logic) ↔ Renderer (Three.js) ↔ PlayerController (input)
 * ↔ Hud/Modals/MenuScreens (DOM UI) ↔ AudioManager ↔ ReplaySystem.
 */
import './ui/styles.css';
import type { Conditions, GameSettings, UserPrefs } from './core/types';
import { DEFAULT_PREFS } from './core/types';
import { TEAMS } from './managers/TeamManager';
import { GameEngine, type EngineEvent } from './engine/GameEngine';
import { battingTeam, currentBatter, currentPitcher, fieldingTeam } from './engine/GameState';
import { pciRadius } from './engine/BattingEngine';
import { CONTACT_Z, PLATE_Z, pitchPos, timeAtZ } from './engine/PitchEngine';
import { emptyInput } from './engine/GameEngine';
import { ReplaySystem } from './engine/ReplaySystem';
import { Renderer, type ViewState } from './render/Renderer';
import { T } from './render/StadiumBuilder';
import type { CamMode } from './render/CameraManager';
import { PlayerController } from './input/PlayerController';
import { AudioManager } from './audio/AudioManager';
import { Hud } from './ui/Hud';
import { Modals } from './ui/Modals';
import { MenuScreens } from './ui/MenuScreens';

const PREFS_KEY = 'diamond26.prefs';

function loadPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return { ...DEFAULT_PREFS };
}

function savePrefs(p: UserPrefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}

class App {
  root = document.getElementById('game-root')!;
  ui = document.getElementById('ui')!;
  renderer: Renderer;
  ctrl: PlayerController;
  audio = new AudioManager();
  modals: Modals;
  menu: MenuScreens;
  hud: Hud | null = null;
  engine: GameEngine | null = null;
  settings: GameSettings | null = null;
  prefs = loadPrefs();
  replay = new ReplaySystem();
  mode: 'menu' | 'game' = 'menu';
  paused = false;
  hrCam = 0;
  replayPrompt = false;
  finalShown = false;
  private last = performance.now();
  private drag: { x: number; y: number } | null = null;
  private notableThisPitch: string[] = [];
  private finalEl: HTMLElement | null = null;

  constructor() {
    this.renderer = new Renderer(document.getElementById('canvas-wrap')!);
    this.ctrl = new PlayerController(this.renderer.renderer.domElement);
    this.modals = new Modals(this.ui);
    this.menu = new MenuScreens(this.ui, {
      onStart: (s) => this.startGame(s),
      onPreview: (st, cond, h, a) => this.preview(st, cond, h, a),
      openControls: () => this.modals.controls(),
      openSettings: () => this.openSettings(),
      click: () => this.audio.unlock(),
    });
    this.audio.setVolume(this.prefs.volume, this.prefs.crowdVolume);
    const canvas = this.renderer.renderer.domElement;
    canvas.addEventListener('mousedown', (e) => { if (this.replay.active) this.drag = { x: e.clientX, y: e.clientY }; this.audio.unlock(); });
    window.addEventListener('mouseup', () => (this.drag = null));
    window.addEventListener('mousemove', (e) => {
      if (!this.drag || !this.replay.active) return;
      const r = this.renderer.camMgr.replay;
      r.yaw -= (e.clientX - this.drag.x) * 0.006;
      r.pitch = Math.max(0.05, Math.min(1.45, r.pitch + (e.clientY - this.drag.y) * 0.005));
      this.drag = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('wheel', (e) => {
      if (!this.replay.active) return;
      const r = this.renderer.camMgr.replay;
      r.dist = Math.max(12, Math.min(420, r.dist * (e.deltaY > 0 ? 1.1 : 0.9)));
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('keydown', () => this.audio.unlock(), { once: true });

    // Menu backdrop: a random home park under the lights.
    const t = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    this.preview(t.stadiumId, { time: 'Night', weather: 'Clear', temperature: 72, windMph: 0, windDir: 0 }, t.id, TEAMS[(TEAMS.indexOf(t) + 7) % 30].id);
    this.renderer.camMgr.setMode('menu', true);
    this.menu.showHome();
    requestAnimationFrame((n) => this.loop(n));
  }

  preview(stadiumId: string, cond: Conditions, homeId: string, awayId: string) {
    this.renderer.loadGame({ stadiumId, conditions: cond, homeId, awayId });
  }

  openSettings(back?: () => void) {
    this.modals.settings(this.prefs, (p) => {
      this.prefs = p;
      savePrefs(p);
      this.audio.setVolume(p.volume, p.crowdVolume);
      if (this.engine) this.engine.prefs = p;
    }, back);
  }

  // ---------------------------------------------------------------- game lifecycle

  startGame(s: GameSettings) {
    this.audio.unlock();
    this.settings = s;
    this.menu.hide();
    this.closeFinal();
    this.renderer.loadGame({ stadiumId: s.stadiumId, conditions: s.conditions, homeId: s.home.teamId, awayId: s.away.teamId });
    this.engine = new GameEngine(s, this.prefs);
    this.hud?.destroy();
    this.hud = new Hud(this.ui);
    this.mode = 'game';
    this.paused = false;
    this.finalShown = false;
    this.replay = new ReplaySystem();
    this.replayPrompt = false;
    this.renderer.camMgr.setMode('overview', true);
    this.audio.startAmbience();
    this.audio.play('organ');
    const a = this.engine.state.away.team, h = this.engine.state.home.team;
    this.hud.banner('PLAY BALL!', `${a.city} ${a.name} at ${h.city} ${h.name}`, 'gold', 2.4);
    this.handleEvents(this.engine.drainEvents());
  }

  quitToMenu() {
    this.modals.close();
    this.closeFinal();
    this.engine = null;
    this.hud?.destroy();
    this.hud = null;
    this.mode = 'menu';
    this.paused = false;
    this.replay.close();
    this.audio.stopAmbience();
    this.renderer.camMgr.setMode('menu');
    this.menu.showHome();
  }

  openPause() {
    if (!this.engine) return;
    this.paused = true;
    const e = this.engine;
    const side = e.settings.userSide === 'none' ? 'home' : e.settings.userSide;
    const back = () => this.openPause();
    this.modals.pause({
      resume: () => { this.paused = false; },
      lineup: () => this.modals.lineup(e, side, back),
      bullpen: () => this.modals.bullpen(e, side, back),
      stats: () => this.modals.boxScore(e, back),
      controls: () => this.modals.controls(back),
      settings: () => this.openSettings(back),
      simhalf: () => { this.modals.onClose = null; this.modals.close(); this.paused = false; e.simulateHalfInning(); },
      simend: () => { this.modals.onClose = null; this.modals.close(); this.paused = false; e.simulateToEnd(); },
      restart: () => { this.modals.onClose = null; this.modals.close(); if (this.settings) this.startGame(this.settings); },
      quit: () => { this.modals.onClose = null; this.quitToMenu(); },
    }, true);
  }

  closeFinal() {
    this.finalEl?.remove();
    this.finalEl = null;
  }

  showFinal(title: string, sub: string) {
    const e = this.engine!;
    const s = e.state;
    const st = (t: typeof s.home) => `background:${t.team.colors.primary}`;
    const el = document.createElement('div');
    el.className = 'final';
    el.innerHTML = `<div style="font-family:var(--display);font-size:72px;color:var(--accent)">${title}</div>
      <div class="score"><span class="tm" style="${st(s.away)}">${s.away.team.id}</span>${s.away.runs} – ${s.home.runs}<span class="tm" style="${st(s.home)}">${s.home.team.id}</span></div>
      <div style="margin-bottom:22px;color:var(--muted)">${sub}</div>
      <div style="display:flex;gap:12px"><button class="btn" data-a="box">Box Score</button><button class="btn" data-a="again">Play Again</button><button class="btn primary" data-a="menu">Main Menu</button></div>`;
    this.ui.appendChild(el);
    this.finalEl = el;
    el.querySelector('[data-a=box]')!.addEventListener('click', () => this.modals.boxScore(e));
    el.querySelector('[data-a=again]')!.addEventListener('click', () => this.settings && this.startGame(this.settings));
    el.querySelector('[data-a=menu]')!.addEventListener('click', () => this.quitToMenu());
  }

  // ---------------------------------------------------------------- events

  handleEvents(evs: EngineEvent[]) {
    const e = this.engine!;
    const hud = this.hud!;
    const userBat = e.userSideBatting();
    const userField = e.userSidePitching();
    for (const ev of evs) {
      switch (ev.type) {
        case 'batterUp': hud.batterCard(e, currentBatter(e.state)); break;
        case 'pitchingChange': {
          hud.banner('PITCHING CHANGE', `${ev.text} ${ev.sub}`, '', 1.8);
          hud.pitcherCard(e, currentPitcher(e.state));
          break;
        }
        case 'windup': this.replayPrompt = false; break;
        case 'pitchRelease': this.audio.play('pitch', 0.6); break;
        case 'swing': this.audio.play('swing', 0.7); break;
        case 'meterResult': hud.feedback(ev.text ?? '', 'PITCH METER', false); break;
        case 'contactResult': {
          const d = ev.data as { ev: number; la: number; quality: number; contact: boolean };
          if (userBat || !userField) hud.feedback(ev.text!, ev.sub!, d.contact, d.ev, d.la);
          if (d.contact) {
            this.audio.play(d.quality > 0.7 ? 'batCrackBig' : 'batCrack', 0.6 + d.quality * 0.6);
            if (this.prefs.cameraShake && d.ev > 98) this.renderer.shake(Math.min(1.6, (d.ev - 95) / 10));
          }
          break;
        }
        case 'call': {
          const c = (ev.data as { call: string }).call;
          if (c !== 'foul') this.audio.play('glove', 0.8);
          if (c === 'called_strike') this.audio.play('strikeCall');
          if (c === 'hbp') hud.toast('HIT BY PITCH');
          break;
        }
        case 'strikeout': {
          const risp = (ev.data as { risp?: boolean })?.risp;
          hud.banner('STRIKEOUT', risp ? 'Huge K with runners in scoring position!' : `${ev.text} gets him`, userBat ? 'red' : 'gold', 1.8);
          this.audio.play(fieldingTeam(e.state).side === 'home' ? 'crowdCheer' : 'crowdGroan', risp ? 1.3 : 0.8);
          this.notableThisPitch.push('strikeout');
          break;
        }
        case 'walk': hud.toast('BALL FOUR', `${currentBatter(e.state).name} draws a walk`); break;
        case 'contact': break;
        case 'play:catch': case 'play:catchThrow': this.audio.play('glove'); break;
        case 'play:out': this.audio.play('outCall', 0.8); break;
        case 'play:slide': this.audio.play('slide'); break;
        case 'play:error': hud.toast('E — ERROR', `${(ev.data as { pos: string }).pos} can't handle it`); this.audio.play('crowdGroan', 0.6); break;
        case 'play:jump': break;
        case 'homerun': {
          const d = ev.data as { name: string; ev: number; la: number; dist: number };
          hud.homeRun(d.name, d.ev, d.la, d.dist);
          this.audio.play('crowdRoar');
          this.hrCam = 3.4;
          if (this.prefs.cameraShake) this.renderer.shake(1.4);
          const bt = battingTeam(e.state);
          if (bt.side === 'home') this.renderer.fireworks([bt.team.colors.primary, bt.team.colors.secondary, '#ffffff', '#ffd34d']);
          break;
        }
        case 'banner': {
          const kind = (ev.data as { kind?: string })?.kind;
          if (ev.text) hud.banner(ev.text, ev.sub ?? '', kind === 'big' ? 'gold' : '', kind === 'small' ? 1.4 : 2.0);
          else if (ev.sub) hud.toast(ev.sub);
          if (kind === 'hit') this.audio.play(battingTeam(e.state).side === 'home' ? 'crowdCheer' : 'crowdGroan', 0.8);
          if (kind === 'big') this.audio.play('crowdCheer', 1.2);
          break;
        }
        case 'runsScored': hud.toast(ev.text ?? ''); this.audio.play(battingTeam(e.state).side === 'home' ? 'crowdCheer' : 'crowdGroan', 1); break;
        case 'halfEnd': hud.banner(ev.text ?? '', ev.sub ?? '', '', 2.4); this.audio.play('organ'); break;
        case 'toast': hud.toast(ev.text ?? '', ev.sub ?? ''); break;
        case 'wildpitch': hud.toast(ev.text ?? 'WILD PITCH', 'The ball gets away!'); break;
        case 'final': {
          hud.banner(ev.text ?? 'FINAL', ev.sub ?? '', 'gold', 3);
          this.audio.play('crowdRoar', 0.8);
          setTimeout(() => { if (this.engine === e && !this.finalShown) { this.finalShown = true; this.showFinal(ev.text ?? 'FINAL', ev.sub ?? ''); } }, 2600);
          break;
        }
      }
    }
  }

  // ---------------------------------------------------------------- loop

  private viewFor(e: GameEngine): ViewState {
    const phase = e.phase;
    const atBat = ['atbat_intro', 'prepitch', 'windup', 'pitch', 'postpitch'].includes(phase);
    let mode: CamMode = 'overview';
    if (atBat) mode = e.userSidePitching() ? 'pitching' : 'batting';
    else if (phase === 'live' || phase === 'postplay') mode = this.hrCam > 0 ? 'hr' : 'field';
    const userBat = e.userSideBatting();
    let pci: ViewState['pci'] = null;
    if (userBat && atBat) {
      const b = currentBatter(e.state);
      const type = this.ctrl.keys.has('Shift') ? 'power' : this.ctrl.keys.has('Control') || this.ctrl.keys.has('Alt') ? 'contact' : 'normal';
      const r = pciRadius(b, type, e.swingMods());
      const p = e.swing ? e.swing.pci : this.ctrl.pci;
      pci = { x: p.x, y: p.y, r, color: type === 'power' ? '#ff7a59' : type === 'contact' ? '#7fd8ff' : '#ffffff' };
    }
    let target: ViewState['target'] = null;
    if (e.userSidePitching() && (phase === 'prepitch' || phase === 'windup')) {
      const up = e.userPitch;
      if (up.stage !== 'select' || true) target = { x: up.target.x, y: up.target.y, color: up.stage === 'locked' ? '#ffd34d' : '#ffffff' };
    }
    let focus: ViewState['focus'] = null;
    if (e.play && e.play.controlled && e.play.cfg.userDefense) focus = { x: e.play.controlled.x, z: e.play.controlled.z };
    return { mode, pci, zone: this.prefs.showStrikeZone && (mode === 'batting' || mode === 'pitching'), target, focus, dimCatcher: mode === 'batting' };
  }

  private updateScoreboard(e: GameEngine) {
    const s = e.state;
    const t = (side: 'home' | 'away') => ({ abbr: s[side].team.id, line: s[side].linescore, r: s[side].runs, h: s[side].hits, e: s[side].errors, color: s[side].team.colors.primary });
    let message = '';
    if (e.phase === 'final') message = 'FINAL';
    else if (e.lastOutcome?.homeRun && (e.phase === 'postplay' || e.phase === 'live')) message = 'HOME RUN!';
    else message = `${s.away.team.name.toUpperCase()} AT ${s.home.team.name.toUpperCase()}`;
    this.renderer.updateScoreboard({
      away: t('away'), home: t('home'), innings: s.settings.innings, inning: s.inning, half: s.half,
      balls: s.balls, strikes: s.strikes, outs: s.outs, batter: currentBatter(s).name, pitcher: currentPitcher(s).name,
      mph: e.flight ? `${Math.round(e.flight.mph)} MPH` : '', message,
    });
  }

  private loop(now: number) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const c = this.ctrl;
    if (this.mode === 'game' && this.engine && this.hud) {
      const e = this.engine;
      if (c.hit('Escape')) {
        if (this.replay.active) { this.replay.close(); this.hud.hideGameplayRegions(false); }
        else if (this.modals.open) this.modals.close();
        else if (!this.finalShown) this.openPause();
      }
      if (this.replay.active) {
        this.runReplay(dt);
      } else {
        if (!this.paused && !this.modals.open) {
          const replayable = !['live', 'pitch', 'windup'].includes(e.phase);
          if (c.hit('KeyR') && replayable && this.replay.open()) {
            this.hud.hideGameplayRegions(true);
            this.renderer.camMgr.replay.yaw = 0.7;
            this.renderer.camMgr.replay.pitch = 0.35;
            this.renderer.camMgr.replay.dist = 110;
          } else {
            const pr = currentPitcher(e.state).pitcher!;
            const f = e.play?.controlled;
            const input = c.build(dt, {
              userBatting: e.userSideBatting(),
              userPitching: e.userSidePitching() && e.phase !== 'live',
              repertoire: pr.pitches,
              cameraAxes: () => this.renderer.camMgr.groundAxes(),
              planePoint: (x, y, z) => this.renderer.planePoint(x, y, z),
              pciPlaneZ: CONTACT_Z,
              aimPlaneZ: PLATE_Z,
              liveDefense: e.phase === 'live' && e.userSidePitching(),
              throwFill: f ? 0.8 + (100 - f.player.ratings.arm) / 300 : 1,
            });
            const before = e.phase;
            e.update(dt, input);
            this.trackReplay(e, before, dt);
            this.handleEvents(e.drainEvents());
          }
        }
        if (this.hrCam > 0) this.hrCam -= dt;
        this.hud.update(e, {
          throwHold: c.throwHold,
          throwFill: e.play?.controlled ? 0.8 + (100 - e.play.controlled.player.ratings.arm) / 300 : 1,
          swingPreview: c.keys.has('Shift') ? 'power' : c.keys.has('Control') || c.keys.has('Alt') ? 'contact' : 'normal',
          runnerSel: c.runnerSel,
          replayAvailable: this.replayPrompt && !['live', 'pitch', 'windup'].includes(e.phase),
        });
        this.hud.tick(dt);
        this.updateScoreboard(e);
        const view = this.viewFor(e);
        this.renderer.camMgr.setMode(view.mode, e.phase === 'atbat_intro' && e.phaseT < 0.05);
        this.renderer.frame(e.snapshot(), view, dt);
      }
    } else {
      this.renderer.camMgr.setMode('menu');
      this.renderer.frame(null, { mode: 'menu', pci: null, zone: false, target: null, focus: null, dimCatcher: false }, dt);
      if (c.hit('Escape') && this.modals.open) this.modals.close();
    }
    c.endFrame();
    requestAnimationFrame((n) => this.loop(n));
  }

  private trackReplay(e: GameEngine, before: string, dt: number) {
    const now = e.phase;
    if (now === 'windup' && before !== 'windup') {
      this.replay.start();
      this.notableThisPitch = [];
    }
    if (this.replay.recording) this.replay.push(dt, e.snapshot());
    const done = (before === 'postplay' || before === 'postpitch') && now !== before;
    if (done && this.replay.recording) {
      const notable = before === 'postplay' ? [...e.lastPlayNotable] : [];
      notable.push(...this.notableThisPitch);
      this.replay.commit(notable);
      this.replayPrompt = notable.length > 0;
    }
  }

  private runReplay(dt: number) {
    const c = this.ctrl;
    const R = this.replay;
    const cam = this.renderer.camMgr.replay;
    if (c.hit('KeyR')) { R.close(); this.hud!.hideGameplayRegions(false); return; }
    if (c.hit('Space')) R.paused = !R.paused;
    if (c.hit('KeyZ')) R.speed = R.speed === 1 ? 0.25 : 1;
    if (c.keys.has('ArrowLeft')) R.scrub(-dt * 1.5);
    if (c.keys.has('ArrowRight')) R.scrub(dt * 1.5);
    if (c.keys.has('KeyA')) cam.yaw += dt * 1.2;
    if (c.keys.has('KeyD')) cam.yaw -= dt * 1.2;
    if (c.keys.has('KeyW')) cam.dist = Math.max(12, cam.dist * (1 - dt));
    if (c.keys.has('KeyS')) cam.dist = Math.min(420, cam.dist * (1 + dt));
    R.step(dt);
    const snap = R.frame();
    if (snap) {
      const b = snap.ball;
      const tgt = b.visible ? T(b.x, Math.min(b.y, 60), b.z) : T(0, 3, 60);
      cam.target.lerp(tgt, 1 - Math.exp(-4 * dt));
    }
    this.hud!.replayUi(R.t, R.duration, R.paused, R.speed);
    this.renderer.camMgr.setMode('replay');
    this.renderer.frame(snap, { mode: 'replay', pci: null, zone: false, target: null, focus: null, dimCatcher: false }, R.paused ? 0 : dt * R.speed);
  }
}

const app = new App();
// Test / debugging hook.
(window as unknown as { __bb: unknown }).__bb = { app, pitchPos, timeAtZ, CONTACT_Z, emptyInput };
