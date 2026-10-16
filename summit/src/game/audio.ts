/**
 * Procedural WebAudio sound: continuous layers (wind, ski scrape, powder hiss, rail grind,
 * lift motor, crowd) driven by speed/surface/state, plus synthesized one-shots.
 * No audio files — everything is generated.
 */
import type { Surface } from '../world/types';

export class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfx!: GainNode;
  private amb!: GainNode;
  private noise!: AudioBuffer;
  private layers: Record<string, { gain: GainNode; filter: BiquadFilterNode }> = {};
  volume = 0.8;
  sfxVolume = 1;
  ambVolume = 0.8;
  private crowdLevel = 0;

  /** Must be called from a user gesture. */
  start() {
    if (this.ctx) { void this.ctx.resume(); return; }
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AC) return;
    this.ctx = new AC();
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = this.volume; this.master.connect(c.destination);
    this.sfx = c.createGain(); this.sfx.gain.value = this.sfxVolume; this.sfx.connect(this.master);
    this.amb = c.createGain(); this.amb.gain.value = this.ambVolume; this.amb.connect(this.master);
    this.noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = this.noise.getChannelData(0);
    let b = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * w; d[i] = w * 0.6 + b * 2.2; }
    this.layer('wind', 'lowpass', 400, 0.7, this.amb);
    this.layer('scrape', 'bandpass', 2200, 1.2, this.sfx);
    this.layer('powder', 'lowpass', 900, 0.5, this.sfx);
    this.layer('grind', 'bandpass', 3200, 14, this.sfx);
    this.layer('crowd', 'bandpass', 1100, 0.8, this.amb);
    this.layer('motor', 'lowpass', 180, 2, this.amb);
  }

  private layer(name: string, type: BiquadFilterType, f: number, q: number, out: GainNode) {
    const c = this.ctx!;
    const src = c.createBufferSource();
    src.buffer = this.noise; src.loop = true;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const filter = c.createBiquadFilter(); filter.type = type; filter.frequency.value = f; filter.Q.value = q;
    const gain = c.createGain(); gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(out);
    src.start(0, Math.random() * 1.5);
    this.layers[name] = { gain, filter };
  }

  setVolumes(master: number, sfx: number, amb: number) {
    this.volume = master; this.sfxVolume = sfx; this.ambVolume = amb;
    if (!this.ctx) return;
    this.master.gain.value = master; this.sfx.gain.value = sfx; this.amb.gain.value = amb;
  }

  private set(name: string, gain: number, freq?: number, t = 0.08) {
    const l = this.layers[name];
    if (!l || !this.ctx) return;
    const now = this.ctx.currentTime;
    l.gain.gain.setTargetAtTime(gain, now, t);
    if (freq !== undefined) l.filter.frequency.setTargetAtTime(freq, now, t);
  }

  /** Continuous layers each frame. */
  update(o: { speed: number; grounded: boolean; surface: Surface; slip: number; grinding: boolean; carving: boolean; wind: number; liftNear: number; crowd: number; paused: boolean }) {
    if (!this.ctx) return;
    if (o.paused) {
      for (const k of Object.keys(this.layers)) this.set(k, 0, undefined, 0.05);
      return;
    }
    const sp = o.speed;
    this.set('wind', Math.min(0.5, 0.03 + o.wind * 0.04 + sp * 0.011), 250 + sp * 28);
    const snowy = o.grounded && !o.grinding;
    const hard = o.surface === 'ice' ? 1.6 : o.surface === 'hardpack' ? 1.2 : o.surface === 'powder' ? 0.25 : 1;
    const scrape = snowy ? Math.min(0.45, (sp * 0.012 + o.slip * 0.5) * hard * (o.carving ? 0.75 : 1)) : 0;
    this.set('scrape', scrape, o.surface === 'ice' ? 3600 : 1500 + sp * 40 + o.slip * 800);
    this.set('powder', snowy && (o.surface === 'powder' || o.surface === 'slush') ? Math.min(0.5, 0.06 + sp * 0.02) : 0, 600 + sp * 30);
    this.set('grind', o.grinding ? 0.22 + Math.min(0.2, sp * 0.02) : 0, 2600 + sp * 60);
    this.crowdLevel += (o.crowd - this.crowdLevel) * 0.05;
    this.set('crowd', this.crowdLevel * 0.25 * (0.7 + 0.3 * Math.sin(this.ctx.currentTime * 3.3)));
    this.set('motor', o.liftNear * 0.3);
  }

  private env(g: GainNode, peak: number, a: number, d: number) {
    const now = this.ctx!.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + a);
    g.gain.exponentialRampToValueAtTime(0.0001, now + a + d);
  }

  private burst(freq: number, q: number, peak: number, dur: number, type: BiquadFilterType = 'lowpass') {
    if (!this.ctx) return;
    const c = this.ctx;
    const src = c.createBufferSource(); src.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain();
    src.connect(f).connect(g).connect(this.sfx);
    this.env(g, peak, 0.005, dur);
    src.start(0, Math.random()); src.stop(c.currentTime + dur + 0.1);
  }

  private tone(freq: number, dur: number, peak: number, type: OscillatorType = 'sine', slideTo?: number, delay = 0) {
    if (!this.ctx) return;
    const c = this.ctx;
    const o = c.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = c.createGain(); g.gain.value = 0;
    o.connect(g).connect(this.sfx);
    const t0 = c.currentTime + delay;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  jump() { this.tone(160, 0.18, 0.25, 'sine', 70); this.burst(1200, 0.7, 0.25, 0.12); }
  land(impact: number) { this.burst(500 + impact * 30, 0.6, Math.min(0.9, 0.15 + impact * 0.06), 0.25 + impact * 0.02); this.tone(90, 0.15, Math.min(0.5, impact * 0.04), 'sine', 50); }
  crash() { this.burst(700, 0.5, 0.9, 0.7); this.tone(70, 0.4, 0.5, 'sine', 35); }
  thud() { this.tone(110, 0.12, 0.35, 'triangle', 60); }
  grindStart() { this.tone(2400, 0.08, 0.15, 'square', 1900); }
  trick(level: number) {
    const notes = [523, 659, 784, 1047, 1319];
    for (let i = 0; i < Math.min(5, 2 + level); i++) this.tone(notes[i], 0.22, 0.12, 'triangle', undefined, i * 0.06);
  }
  combo() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.3, 0.13, 'sine', undefined, i * 0.07)); }
  bust() { this.tone(300, 0.35, 0.18, 'sawtooth', 120); }
  beep(final: boolean) { this.tone(final ? 1320 : 880, final ? 0.6 : 0.18, 0.3, 'sine'); }
  horn() { this.tone(220, 1.1, 0.25, 'sawtooth'); this.tone(330, 1.1, 0.18, 'sawtooth'); this.cheer(1); }
  gate(ok: boolean) { this.tone(ok ? 1200 : 240, ok ? 0.06 : 0.3, ok ? 0.06 : 0.2, ok ? 'sine' : 'square'); }
  click() { this.tone(1800, 0.03, 0.06, 'square'); }
  coins() { [1568, 2093].forEach((f, i) => this.tone(f, 0.12, 0.1, 'triangle', undefined, i * 0.07)); }
  cheer(amount: number) {
    if (!this.ctx) return;
    for (let i = 0; i < 6; i++) setTimeout(() => this.burst(900 + Math.random() * 900, 1.5, 0.12 * amount, 0.6, 'bandpass'), i * 120);
  }
  chairClack() { this.burst(2500, 3, 0.06, 0.05, 'bandpass'); }

  suspend() { void this.ctx?.suspend(); }
  resume() { void this.ctx?.resume(); }
  dispose() { void this.ctx?.close(); this.ctx = null; }
}
