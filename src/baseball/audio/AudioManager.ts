/**
 * AudioManager: named sound hooks. Each sound first tries a real file from
 * /baseball/audio/<name>.(mp3|ogg|wav) (see public/baseball/audio/README.md); if none exists
 * it falls back to a synthesized placeholder so the game is never silent.
 */
export type SoundName =
  | 'batCrack' | 'batCrackBig' | 'glove' | 'crowdAmbience' | 'crowdCheer' | 'crowdGroan' | 'crowdRoar'
  | 'strikeCall' | 'ballCall' | 'outCall' | 'safeCall' | 'slide' | 'swing' | 'pitch' | 'organ';

const ALL: SoundName[] = ['batCrack', 'batCrackBig', 'glove', 'crowdAmbience', 'crowdCheer', 'crowdGroan', 'crowdRoar', 'strikeCall', 'ballCall', 'outCall', 'safeCall', 'slide', 'swing', 'pitch', 'organ'];

export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private crowdGain: GainNode | null = null;
  private buffers = new Map<SoundName, AudioBuffer | null>();
  private ambience: AudioBufferSourceNode | null = null;
  private noise: AudioBuffer | null = null;
  volume = 0.8;
  crowdVolume = 0.5;
  voice = true;
  private base = './baseball/audio/';

  /** Must be called from a user gesture. */
  unlock() {
    if (this.ctx) { void this.ctx.resume(); return; }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    this.crowdGain = this.ctx.createGain();
    this.crowdGain.gain.value = this.crowdVolume;
    this.crowdGain.connect(this.master);
    const len = this.ctx.sampleRate * 2;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    for (const n of ALL) void this.tryLoad(n);
  }

  private async tryLoad(name: SoundName) {
    if (!this.ctx) return;
    for (const ext of ['mp3', 'ogg', 'wav']) {
      try {
        const r = await fetch(`${this.base}${name}.${ext}`);
        if (!r.ok || !(r.headers.get('content-type') ?? '').match(/audio|octet/)) continue;
        const buf = await this.ctx.decodeAudioData(await r.arrayBuffer());
        this.buffers.set(name, buf);
        if (name === 'crowdAmbience' && this.ambience) this.startAmbience();
        return;
      } catch {
        /* fall through to the synthesized placeholder */
      }
    }
    this.buffers.set(name, null);
  }

  setVolume(v: number, crowd: number) {
    this.volume = v;
    this.crowdVolume = crowd;
    if (this.master) this.master.gain.value = v;
    if (this.crowdGain) this.crowdGain.gain.value = crowd;
  }

  startAmbience() {
    if (!this.ctx || !this.crowdGain) return;
    if (this.ambience) { try { this.ambience.stop(); } catch { /* already stopped */ } }
    const src = this.ctx.createBufferSource();
    const file = this.buffers.get('crowdAmbience');
    src.buffer = file ?? this.noise;
    src.loop = true;
    let node: AudioNode = src;
    if (!file) {
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 900;
      bp.Q.value = 0.4;
      const g = this.ctx.createGain();
      g.gain.value = 0.12;
      src.connect(bp); bp.connect(g);
      node = g;
    }
    node.connect(this.crowdGain);
    src.start();
    this.ambience = src;
  }

  stopAmbience() {
    if (this.ambience) { try { this.ambience.stop(); } catch { /* noop */ } this.ambience = null; }
  }

  play(name: SoundName, intensity = 1) {
    if (!this.ctx || !this.master) return;
    const file = this.buffers.get(name);
    const crowd = name.startsWith('crowd') || name === 'organ';
    const out = crowd ? this.crowdGain! : this.master;
    if (file) {
      const s = this.ctx.createBufferSource();
      s.buffer = file;
      const g = this.ctx.createGain();
      g.gain.value = Math.min(1.5, intensity);
      s.connect(g); g.connect(out);
      s.start();
      return;
    }
    this.synth(name, intensity, out);
    if (this.voice && (name === 'strikeCall' || name === 'outCall' || name === 'safeCall' || name === 'ballCall')) this.say(name);
  }

  private say(name: SoundName) {
    if (!('speechSynthesis' in window)) return;
    const text = { strikeCall: 'Strike!', outCall: "He's out!", safeCall: 'Safe!', ballCall: 'Ball.' }[name as 'strikeCall'];
    if (!text) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.15;
      u.pitch = 0.7;
      u.volume = Math.min(1, this.volume);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch { /* speech not available */ }
  }

  private noiseBurst(out: AudioNode, dur: number, freq: number, type: BiquadFilterType, gain: number, attack = 0.002, q = 1) {
    const c = this.ctx!;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    const t = c.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(out);
    s.start(t, Math.random());
    s.stop(t + dur + 0.05);
    return { f, g, t };
  }

  private tone(out: AudioNode, freq: number, dur: number, gain: number, type: OscillatorType = 'sine', slide = 0) {
    const c = this.ctx!;
    const o = c.createOscillator();
    o.type = type;
    const t = c.currentTime;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private synth(name: SoundName, k: number, out: AudioNode) {
    switch (name) {
      case 'batCrack':
        this.noiseBurst(out, 0.12, 2400, 'bandpass', 0.9 * k, 0.001, 1.5);
        this.tone(out, 950, 0.08, 0.4 * k, 'triangle', -400);
        break;
      case 'batCrackBig':
        this.noiseBurst(out, 0.22, 1800, 'bandpass', 1.3 * k, 0.001, 1.2);
        this.tone(out, 700, 0.15, 0.7 * k, 'square', -350);
        this.noiseBurst(out, 0.4, 400, 'lowpass', 0.5 * k, 0.001);
        break;
      case 'glove':
        this.noiseBurst(out, 0.07, 700, 'lowpass', 0.9 * k, 0.001);
        this.tone(out, 180, 0.08, 0.5 * k, 'sine', -80);
        break;
      case 'slide':
        this.noiseBurst(out, 0.5, 1200, 'bandpass', 0.35 * k, 0.05, 0.6);
        break;
      case 'swing':
        { const b = this.noiseBurst(out, 0.22, 600, 'bandpass', 0.25 * k, 0.08, 2); b.f.frequency.exponentialRampToValueAtTime(2500, b.t + 0.2); }
        break;
      case 'pitch':
        { const b = this.noiseBurst(out, 0.3, 500, 'bandpass', 0.12 * k, 0.1, 3); b.f.frequency.exponentialRampToValueAtTime(1800, b.t + 0.28); }
        break;
      case 'strikeCall':
      case 'outCall':
        this.tone(out, 220, 0.25, 0.25, 'sawtooth', -60);
        break;
      case 'safeCall':
        this.tone(out, 300, 0.2, 0.2, 'sawtooth', 80);
        break;
      case 'ballCall':
        break;
      case 'crowdCheer':
        { const b = this.noiseBurst(out, 2.2 * k, 1100, 'bandpass', 0.55 * k, 0.25, 0.5); void b; }
        break;
      case 'crowdGroan':
        { const b = this.noiseBurst(out, 1.4, 350, 'lowpass', 0.5 * k, 0.15); b.f.frequency.exponentialRampToValueAtTime(180, b.t + 1.2); }
        break;
      case 'crowdRoar':
        { const b = this.noiseBurst(out, 5.5, 1000, 'bandpass', 1.0, 0.6, 0.4); void b; this.noiseBurst(out, 4, 2400, 'bandpass', 0.35, 0.8, 0.8); }
        break;
      case 'organ':
        [392, 523, 659, 784].forEach((f, i) => setTimeout(() => this.ctx && this.tone(out, f, 0.35, 0.18, 'square'), i * 160));
        break;
      default:
        break;
    }
  }
}
