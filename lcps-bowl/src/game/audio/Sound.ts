/**
 * Sound — WebAudio. If real audio files exist in public/assets/audio/<name>.mp3 they are used;
 * otherwise a small synthesized retro sound plays (so the game always has feedback).
 */
export type SoundName =
  | 'whistle' | 'hike' | 'tackle' | 'bighit' | 'catch' | 'kick' | 'touchdown' | 'cheer' | 'groan'
  | 'horn' | 'chains' | 'menu' | 'select' | 'drum';

export interface Volumes { master: number; sfx: number; crowd: number; music: number; }

class SoundSystem {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer | null>();
  vol: Volumes = { master: 0.7, sfx: 0.8, crowd: 0.6, music: 0.5 };
  private crowdNode: { src: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode } | null = null;
  private drumTimer: number | null = null;
  private crowdLevel = 0.3;

  private ac(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      this.ctx = new C();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  setVolumes(v: Partial<Volumes>) {
    this.vol = { ...this.vol, ...v };
    this.updateCrowd();
  }

  private async load(name: string): Promise<AudioBuffer | null> {
    if (this.buffers.has(name)) return this.buffers.get(name)!;
    this.buffers.set(name, null);
    const ac = this.ac();
    if (!ac) return null;
    try {
      const res = await fetch(`assets/audio/${name}.mp3`);
      if (!res.ok || !(res.headers.get('content-type') ?? '').includes('audio')) return null;
      const buf = await ac.decodeAudioData(await res.arrayBuffer());
      this.buffers.set(name, buf);
      return buf;
    } catch {
      return null;
    }
  }

  play(name: SoundName) {
    const ac = this.ac();
    if (!ac) return;
    const v = this.vol.master * this.vol.sfx;
    if (v <= 0) return;
    const buf = this.buffers.get(name);
    if (buf) {
      const src = ac.createBufferSource();
      src.buffer = buf;
      const g = ac.createGain();
      g.gain.value = v;
      src.connect(g).connect(ac.destination);
      src.start();
      return;
    }
    if (!this.buffers.has(name)) void this.load(name);
    this.synth(name, v);
    if (name === 'touchdown' || name === 'cheer') this.swell(1.0, 3);
    if (name === 'groan') this.swell(0.15, 1.5);
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, slide = 0, delay = 0) {
    const ac = this.ctx!;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol: number, freq = 800, delay = 0) {
    const ac = this.ctx!;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(ac.destination);
    src.start(ac.currentTime + delay);
  }

  private synth(name: SoundName, v: number) {
    switch (name) {
      case 'whistle':
        this.tone(2600, 0.25, 'square', 0.05 * v);
        this.tone(2750, 0.25, 'sine', 0.06 * v);
        break;
      case 'hike':
        this.tone(180, 0.12, 'square', 0.08 * v, -40);
        this.tone(180, 0.12, 'square', 0.08 * v, -40, 0.22);
        break;
      case 'tackle':
        this.noise(0.12, 0.35 * v, 500);
        break;
      case 'bighit':
        this.noise(0.25, 0.6 * v, 700);
        this.tone(90, 0.2, 'sine', 0.3 * v, -40);
        break;
      case 'catch':
        this.tone(880, 0.06, 'square', 0.05 * v);
        this.tone(1320, 0.08, 'square', 0.05 * v, 0, 0.05);
        break;
      case 'kick':
        this.noise(0.08, 0.5 * v, 1500);
        this.tone(140, 0.1, 'sine', 0.3 * v, -60);
        break;
      case 'touchdown':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'square', 0.06 * v, 0, i * 0.12));
        break;
      case 'horn':
        this.tone(220, 0.9, 'sawtooth', 0.05 * v);
        this.tone(277, 0.9, 'sawtooth', 0.04 * v);
        break;
      case 'chains':
        this.tone(1200, 0.04, 'square', 0.03 * v);
        break;
      case 'menu':
        this.tone(660, 0.05, 'square', 0.04 * v);
        break;
      case 'select':
        this.tone(660, 0.05, 'square', 0.05 * v);
        this.tone(990, 0.08, 'square', 0.05 * v, 0, 0.05);
        break;
      case 'drum':
        this.noise(0.06, 0.3 * v, 300);
        break;
      case 'cheer':
      case 'groan':
        break;
    }
  }

  /** Ambient crowd: filtered noise loop whose level swells on big plays. */
  startCrowd(level = 0.3) {
    const ac = this.ac();
    if (!ac || this.crowdNode) return;
    const len = ac.sampleRate * 2;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = last * 0.97 + (Math.random() * 2 - 1) * 0.03; d[i] = last * 6; }
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.6;
    const gain = ac.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
    this.crowdNode = { src, gain, filter };
    this.crowdLevel = level;
    this.updateCrowd();
    // Band drum cadence
    if (this.drumTimer == null) {
      let beat = 0;
      this.drumTimer = window.setInterval(() => {
        if (this.vol.music * this.vol.master <= 0.01) return;
        beat++;
        const pattern = [1, 0, 1, 1, 0, 1, 0, 0];
        if (pattern[beat % 8] && this.ctx) this.noise(0.05, 0.12 * this.vol.music * this.vol.master, 250);
      }, 210);
    }
  }

  private updateCrowd() {
    if (!this.crowdNode || !this.ctx) return;
    this.crowdNode.gain.gain.setTargetAtTime(this.crowdLevel * this.vol.crowd * this.vol.master * 0.5, this.ctx.currentTime, 0.4);
  }

  swell(level: number, seconds: number) {
    if (!this.crowdNode || !this.ctx) return;
    const base = this.crowdLevel;
    const g = this.crowdNode.gain.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(level * this.vol.crowd * this.vol.master * 0.5, t, 0.15);
    g.setTargetAtTime(base * this.vol.crowd * this.vol.master * 0.5, t + seconds, 0.8);
  }

  stopCrowd() {
    if (this.crowdNode) {
      try { this.crowdNode.src.stop(); } catch { /* already stopped */ }
      this.crowdNode = null;
    }
    if (this.drumTimer != null) { window.clearInterval(this.drumTimer); this.drumTimer = null; }
  }
}

export const Sound = new SoundSystem();
