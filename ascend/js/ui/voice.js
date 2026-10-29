// Voice: speech-to-text via the browser's SpeechRecognition (Safari: webkitSpeechRecognition) and
// spoken replies via speechSynthesis using the device's installed voices. Gemini itself only
// returns text; these are the device's own speech services. Everything degrades to text chat.
import { VOICES } from '../data/coaches.js';

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
export const canListen = () => !!SR;
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

let rec = null;
export function listen({ onText, onEnd, onError }) {
  if (!SR) { onError?.('unsupported'); return null; }
  stopListening();
  rec = new SR();
  rec.lang = navigator.language || 'en-US';
  rec.interimResults = true;
  rec.continuous = false;
  let final = '';
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript; else interim += e.results[i][0].transcript;
    }
    onText?.((final + interim).trim(), false);
  };
  rec.onerror = (e) => onError?.(e.error || 'error');
  rec.onend = () => { rec = null; onEnd?.(final.trim()); };
  try { rec.start(); } catch { onError?.('busy'); }
  return rec;
}
export function stopListening() { try { rec?.stop(); } catch { /* ignore */ } }
export const isListening = () => !!rec;

export function systemVoices() {
  if (!canSpeak()) return [];
  return speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith((navigator.language || 'en').slice(0, 2).toLowerCase()));
}

const FEMALE = /(samantha|victoria|karen|moira|tessa|fiona|serena|zira|female|susan|allison|ava|joelle|nicky|kate|siri.*female)/i;
const MALE = /(daniel|alex|fred|tom|aaron|arthur|gordon|male|david|mark|oliver|rishi|reed|siri.*male)/i;

function pickVoice(coach, prefId) {
  const vs = systemVoices();
  if (prefId) { const v = vs.find((x) => x.voiceURI === prefId); if (v) return v; }
  const want = coach?.presentation === 'female' ? FEMALE : coach?.presentation === 'male' ? MALE : null;
  return (want && vs.find((v) => want.test(v.name))) || vs.find((v) => v.default) || vs[0] || null;
}

/** Strip markdown so it reads naturally. */
const plain = (t) => String(t).replace(/\*\*(.*?)\*\*/g, '$1').replace(/^\s*[-•]\s+/gm, '').replace(/[#*_`]/g, '');

export function speak(text, coach, { voiceURI, onStart, onEnd } = {}) {
  if (!canSpeak()) { onEnd?.(); return false; }
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(plain(text));
  const style = VOICES.find((v) => v.id === coach?.voice) || VOICES[2];
  u.rate = style.rate; u.pitch = style.pitch;
  const v = pickVoice(coach, voiceURI);
  if (v) { u.voice = v; u.lang = v.lang; }
  u.onstart = () => onStart?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  speechSynthesis.speak(u);
  return true;
}
export function stopSpeaking() { try { if (canSpeak()) speechSynthesis.cancel(); } catch { /* ignore */ } }
export const isSpeaking = () => canSpeak() && speechSynthesis.speaking;
