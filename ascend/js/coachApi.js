// Client for the ASCEND coach API (served by ascend/server or the Vercel functions).
// The browser never sees the Gemini key: it only talks to /api/coach/* on the same origin.
import { store } from './store.js';

const API = 'api/coach/';
const TIMEOUT = 45000;

export const ERROR_TEXT = {
  missing_key: 'The AI coach isn’t configured on this server yet (no GEMINI_API_KEY).',
  invalid_key: 'The server’s Gemini API key was rejected by Google. The key needs to be replaced.',
  forbidden: 'The server’s Gemini key isn’t allowed to use this model.',
  rate_limited: 'The coach is getting too many requests. Try again in a moment.',
  upstream_unavailable: 'Gemini is temporarily unavailable. Try again shortly.',
  timeout: 'The coach took too long to answer. Try again.',
  network: 'Couldn’t reach the coach. Check your connection and try again.',
  offline: 'You’re offline. Your workout logging still works; the coach needs a connection.',
  no_server: 'This copy of ASCEND is running without its server, so the AI coach can’t be reached.',
  access_denied: 'This server needs an access code. Add it in Coach settings.',
  blocked: 'Gemini declined to answer that. Try rephrasing.',
  empty: 'The coach returned an empty answer. Try again.',
  model_not_found: 'The configured Gemini model wasn’t found on the server.',
  bad_request: 'That message couldn’t be sent.',
};

export class CoachApiError extends Error {
  constructor(code, message, retryAfter) { super(message || ERROR_TEXT[code] || 'Something went wrong.'); this.code = code; this.retryAfter = retryAfter; }
}

/** { reachable, configured, model, accessCodeRequired } */
export async function coachStatus() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { reachable: false, offline: true };
  try {
    const r = await fetch(`${API}status`, { cache: 'no-store' });
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return { reachable: false };
    return { reachable: true, ...(await r.json()) };
  } catch { return { reachable: false }; }
}

export async function coachRequest(payload) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new CoachApiError('offline');
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT);
  let r;
  try {
    r = await fetch(`${API}chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Ascend-Access': store.state.aiCoach?.prefs?.accessCode || '' },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });
  } catch (e) {
    throw new CoachApiError(e.name === 'AbortError' ? 'timeout' : 'network');
  } finally { clearTimeout(t); }
  const isJson = (r.headers.get('content-type') || '').includes('json');
  if (!isJson) throw new CoachApiError('no_server');
  const data = await r.json().catch(() => null);
  if (!r.ok || !data?.text) {
    const code = data?.error?.code || (r.status === 404 ? 'no_server' : 'network');
    throw new CoachApiError(code, ERROR_TEXT[code] || data?.error?.message, data?.error?.retryAfter);
  }
  return data;
}
