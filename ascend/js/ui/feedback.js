// Haptics (navigator.vibrate where supported) and synthesized sound effects (Web Audio, no files).
import { store } from '../store.js';

export function haptic(kind = 'tap') {
  if (!store.state.prefs?.haptics || typeof navigator === 'undefined' || !navigator.vibrate) return;
  const p = { tap: 8, set: [12, 30, 18], success: [20, 40, 30, 40, 60], rank: [30, 60, 30, 60, 120, 80, 200], warn: [40, 60, 40] }[kind] || 10;
  try { navigator.vibrate(p); } catch { /* ignore */ }
}

let ctx = null;
function ac() {
  if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, t0, dur, { type = 'sine', gain = 0.08, glide } = {}) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(); const g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, a.currentTime + t0);
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, a.currentTime + t0 + dur);
  g.gain.setValueAtTime(0.0001, a.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + 0.05);
}

function noise(t0, dur, gain = 0.05, from = 400, to = 4000) {
  const a = ac(); if (!a) return;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(); src.buffer = buf;
  const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, a.currentTime + t0); f.frequency.exponentialRampToValueAtTime(to, a.currentTime + t0 + dur);
  const g = a.createGain(); g.gain.setValueAtTime(0.0001, a.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + t0 + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
  src.connect(f).connect(g).connect(a.destination); src.start(a.currentTime + t0);
}

export function sound(kind) {
  if (!store.state.prefs?.sound) return;
  try {
    switch (kind) {
      case 'set': tone(880, 0, 0.12, { gain: 0.04 }); tone(1320, 0.05, 0.16, { gain: 0.03 }); break;
      case 'rest': tone(660, 0, 0.18, { gain: 0.06 }); tone(990, 0.2, 0.3, { gain: 0.06 }); break;
      case 'whoosh': noise(0, 1.1, 0.05, 300, 5000); break;
      case 'assemble': for (let i = 0; i < 6; i++) tone(500 + i * 120, i * 0.12, 0.12, { type: 'triangle', gain: 0.025 }); break;
      case 'lock': tone(110, 0, 0.5, { type: 'sine', gain: 0.18, glide: 55 }); noise(0, 0.25, 0.06, 2000, 300); break;
      case 'reveal': [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 1.6 - i * 0.2, { type: 'sine', gain: 0.05 })); break;
      case 'pr': tone(784, 0, 0.15, { gain: 0.05 }); tone(1175, 0.12, 0.35, { gain: 0.05 }); break;
      default: break;
    }
  } catch { /* audio blocked */ }
}
