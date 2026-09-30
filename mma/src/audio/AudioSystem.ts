import type { CrowdCue } from '../presentation/CrowdSystem';

/**
 * Tiny synthesized sound set (no audio assets): crowd bed, cheers/roars/boos, punch and kick
 * impacts, blocks, the round horn and the ten-second clapper.
 */
export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private crowdGain: GainNode | null = null;
  private crowdFilter: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;
  enabled = true;
  volume = 0.7;

  /** Must be called from a user gesture. */
  init() {
    if (this.ctx || typeof AudioContext === 'undefined') return;
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.enabled ? this.volume : 0;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      let b = 0;
      for (let i = 0; i < len; i++) {
        b = 0.97 * b + 0.03 * (Math.random() * 2 - 1);
        d[i] = b * 6 + (Math.random() * 2 - 1) * 0.15;
      }
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      this.crowdFilter = this.ctx.createBiquadFilter();
      this.crowdFilter.type = 'bandpass';
      this.crowdFilter.frequency.value = 600;
      this.crowdFilter.Q.value = 0.6;
      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.value = 0;
      src.connect(this.crowdFilter).connect(this.crowdGain).connect(this.master);
      src.start();
    } catch {
      this.ctx = null;
    }
  }

  setEnabled(on: boolean, volume: number) {
    this.enabled = on;
    this.volume = volume;
    if (this.master) this.master.gain.value = on ? volume : 0;
  }

  resume() {
    this.ctx?.resume().catch(() => {});
  }

  /** Crowd bed level follows excitement. */
  crowd(excitement: number, active: boolean) {
    if (!this.ctx || !this.crowdGain || !this.crowdFilter) return;
    const t = this.ctx.currentTime;
    const target = active ? 0.05 + excitement * 0.22 : 0.03;
    this.crowdGain.gain.setTargetAtTime(target, t, 0.3);
    this.crowdFilter.frequency.setTargetAtTime(450 + excitement * 900, t, 0.4);
  }

  private burst(freq: number, dur: number, gain: number, type: BiquadFilterType = 'lowpass', q = 1, delay = 0) {
    if (!this.ctx || !this.noise || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + Math.min(0.02, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  private tone(freq: number, dur: number, gain: number, type: OscillatorType = 'sine', delay = 0) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  hit(kind: 'punch' | 'kick' | 'knee' | 'elbow', dmg: number) {
    const g = Math.min(0.9, 0.25 + dmg / 14);
    if (kind === 'kick') {
      this.burst(260, 0.14, g, 'lowpass', 1.5);
      this.tone(70, 0.12, g * 0.5);
    } else {
      this.burst(900, 0.07, g * 0.8, 'bandpass', 1.2);
      this.tone(95, 0.09, g * 0.45);
    }
  }
  block() {
    this.burst(1500, 0.05, 0.25, 'bandpass', 2);
  }
  whoosh() {
    this.burst(2200, 0.12, 0.08, 'highpass', 0.8);
  }
  thud() {
    this.burst(140, 0.35, 0.8, 'lowpass', 1);
    this.tone(55, 0.3, 0.5);
  }
  horn() {
    this.tone(233, 1.1, 0.25, 'sawtooth');
    this.tone(311, 1.1, 0.18, 'sawtooth');
  }
  clapper() {
    for (let i = 0; i < 3; i++) this.burst(3000, 0.03, 0.5, 'bandpass', 3, i * 0.12);
  }
  cue(c: CrowdCue) {
    switch (c) {
      case 'cheer': this.burst(900, 1.2, 0.18, 'bandpass', 0.5); break;
      case 'roar': this.burst(700, 2.2, 0.35, 'bandpass', 0.4); break;
      case 'ooh': this.burst(420, 0.9, 0.22, 'bandpass', 3); break;
      case 'gasp': this.burst(1200, 0.7, 0.18, 'bandpass', 1.5); break;
      case 'boo': this.burst(260, 1.6, 0.16, 'bandpass', 4); break;
    }
  }
}

export const audio = new AudioSystem();
