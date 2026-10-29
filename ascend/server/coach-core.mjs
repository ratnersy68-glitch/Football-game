// Server-side core of the ASCEND AI coach. Runs only on the server (Node), never in the browser.
// - Validates and caps everything the app sends
// - Builds the Gemini system instruction (personality, safety rules, the user's data)
// - Calls the Gemini REST API with the key from the server environment
// - Maps failures to stable error codes the app can explain
// The API key is only ever placed in the outgoing request header. It is never logged and never
// returned to the client.
import { presetById, sliderStyle, PRESETS, AVATARS, VOICES, PRESENTATIONS } from '../js/data/coaches.js';

export const DEFAULT_MODEL = 'gemini-flash-latest';
export const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const LIMITS = { messages: 24, messageChars: 2000, context: 14000, memories: 30, memoryChars: 300, summary: 2500, description: 400, name: 24 };
const TIMEOUT_MS = 30000;

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v, lo, hi, d) => (Number.isFinite(Number(v)) ? Math.min(hi, Math.max(lo, Math.round(Number(v)))) : d);

export function readConfig(env = process.env) {
  return {
    apiKey: (env.GEMINI_API_KEY || '').trim(),
    model: (env.GEMINI_MODEL || DEFAULT_MODEL).trim(),
    base: (env.GEMINI_API_BASE || DEFAULT_BASE).replace(/\/$/, ''),
    accessCode: (env.ASCEND_ACCESS_CODE || '').trim(),
  };
}

/** Validate and normalise a client request. Returns { ok, value } or { ok: false, error }. */
export function validateRequest(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Request body must be JSON.' };
  const task = ['chat', 'greeting', 'summarize'].includes(body.task) ? body.task : 'chat';
  const raw = Array.isArray(body.messages) ? body.messages.slice(-LIMITS.messages) : [];
  const messages = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({ role: m.role, text: str(m.text, LIMITS.messageChars) }));
  // Gemini expects alternating turns that start with the user: merge repeats, anchor the start.
  for (let i = messages.length - 1; i > 0; i--) {
    if (messages[i].role === messages[i - 1].role) { messages[i - 1].text = `${messages[i - 1].text}\n\n${messages[i].text}`.slice(0, LIMITS.messageChars * 2); messages.splice(i, 1); }
  }
  if (messages[0]?.role === 'model') messages.unshift({ role: 'user', text: '(Conversation start.)' });
  if (task === 'chat' && (!messages.length || messages[messages.length - 1].role !== 'user')) {
    return { ok: false, error: 'The conversation must end with a user message.' };
  }
  const c = body.coach || {};
  const preset = PRESETS.some((p) => p.id === c.preset) ? c.preset : 'pro';
  const sl = c.sliders || {};
  const coach = {
    preset,
    name: str(c.name, LIMITS.name).replace(/[^\p{L}\p{N} .'-]/gu, '').trim() || 'Coach',
    presentation: PRESENTATIONS.some((p) => p.id === c.presentation) ? c.presentation : 'any',
    voice: VOICES.some((v) => v.id === c.voice) ? c.voice : 'professional',
    avatar: AVATARS.some((a) => a.id === c.avatar) ? c.avatar : 'emblem',
    description: str(c.description, LIMITS.description),
    sliders: Object.fromEntries(['strictness', 'energy', 'humor', 'motivation', 'technical'].map((k) => [k, num(sl[k], 1, 10, 5)])),
  };
  const memories = (Array.isArray(body.memories) ? body.memories : []).slice(0, LIMITS.memories).map((m) => str(m, LIMITS.memoryChars)).filter(Boolean);
  return {
    ok: true,
    value: {
      task, messages, coach, memories,
      context: str(body.context, LIMITS.context),
      summary: str(body.summary, LIMITS.summary),
      youth: body.youth === true,
    },
  };
}

const SAFETY = `Safety rules (these override the personality, always):
- Never encourage training through pain, injury, dizziness or illness. If the user reports pain (other than normal muscle soreness), tell them to stop that movement and see a qualified professional (doctor or physiotherapist).
- Never humiliate, insult or shame the user, even in a strict persona. Be tough on effort, never on the person.
- You give fitness education and general training guidance, not medical diagnoses, injury treatment or prescription-level nutrition advice.
- Never encourage extreme dieting, dehydration, skipping rest days or excessive training volume.
- Never promise that a goal will be reached by a specific date. Give ranges and explain what affects them.
- Recommend small, conservative weight increases (about 2.5–5%, or the smallest plate jump) and only when the data supports it.`;

const YOUTH = `The user is UNDER 18. Additionally:
- Prioritise technique, gradual progression, rest and recovery.
- Do not prescribe one-rep-max testing or near-maximal singles; use rep ranges of 6 or more at RPE 8 or below.
- Do not give weight-loss, cutting or calorie-restriction advice; suggest talking with a parent, doctor or registered dietitian.
- Recommend qualified adult supervision for heavy barbell lifts.`;

const DATA_RULES = `How to use the data:
- The "ASCEND DATA" section below is the user's real saved training data. It is the ONLY source of facts about their training.
- Only cite numbers (weights, reps, sets, dates, PRs, ranks, percentages) that appear in that data. Never invent workouts, measurements or records. If something isn't in the data, say you don't have it and suggest logging it.
- Weights are in the unit stated in the data. Use that unit.
- "Coach memory" lists the only things you remember long-term. Never claim to remember anything else from past conversations.
- The ASCEND rules-based targets are a useful reference; you may agree with them or explain why you'd adjust.
- If the user asks how to perform an exercise and the data says a demonstration is available, mention they can tap "Watch demonstration".`;

export function buildSystemPrompt(v) {
  const p = presetById(v.coach.preset);
  const persona = v.coach.preset === 'custom'
    ? `Custom coach. The user described their ideal coach as: "${v.coach.description || 'no description given'}".\nTune your style to these settings:\n${sliderStyle(v.coach.sliders)}`
    : `${p.name} (intensity ${p.intensity}/10). ${p.style}\nStyle settings:\n${sliderStyle(v.coach.sliders)}\nExample of your voice: "${p.example}"`;
  const pres = { male: 'You present as male.', female: 'You present as female.', neutral: 'You present as gender-neutral.', any: '' }[v.coach.presentation];
  const task = v.task === 'greeting'
    ? 'TASK: Write a short personalised first greeting (2–4 sentences) introducing yourself by name, referencing one or two real facts from the data (goal, rank, today\'s plan), and inviting a question. No lists.'
    : v.task === 'summarize'
      ? 'TASK: Summarise the conversation so far into compact notes for your own future reference: the user\'s questions, your key recommendations and any decisions or preferences they stated. Max 150 words, plain sentences, no greeting, stay neutral (ignore persona style).'
      : 'TASK: Reply to the user\'s latest message as their coach. Be specific and actionable, grounded in their data. Keep replies concise for a phone screen (usually under 150 words); use short paragraphs or a few "- " bullets when helpful. Use **bold** sparingly. No headings.';
  return [
    `You are ${v.coach.name}, the personal AI strength coach inside ASCEND, a private gym-tracking app. You are powered by Google Gemini. ${pres}`,
    `PERSONALITY\n${persona}`,
    SAFETY,
    v.youth ? YOUTH : '',
    DATA_RULES,
    v.summary ? `EARLIER CONVERSATION SUMMARY (older messages, condensed)\n${v.summary}` : '',
    `COACH MEMORY (user-approved long-term notes)\n${v.memories.length ? v.memories.map((m) => `- ${m}`).join('\n') : '- (none saved)'}`,
    `ASCEND DATA\n${v.context || '(no data provided)'}`,
    task,
  ].filter(Boolean).join('\n\n');
}

export class CoachError extends Error {
  constructor(code, status, message, extra = {}) { super(message); this.code = code; this.status = status; Object.assign(this, extra); }
}

/** Remove anything that looks like the API key from text that might reach logs or clients. */
export function redact(text, apiKey) {
  let t = String(text || '');
  if (apiKey) t = t.split(apiKey).join('[redacted]');
  return t.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[redacted]');
}

/** Call Gemini generateContent. Returns the reply text or throws CoachError. */
export async function callGemini(cfg, { system, contents, temperature = 0.8, maxOutputTokens = 800 }, fetchImpl = fetch) {
  if (!cfg.apiKey) throw new CoachError('missing_key', 503, 'GEMINI_API_KEY is not set on the server.');
  const url = `${cfg.base}/${encodeURIComponent(cfg.model)}:generateContent`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': cfg.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: contents.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: { temperature, maxOutputTokens },
      }),
      signal: ac.signal,
    });
  } catch (e) {
    throw e?.name === 'AbortError'
      ? new CoachError('timeout', 504, 'Gemini took too long to respond.')
      : new CoachError('network', 502, 'Could not reach the Gemini API from the server.');
  } finally { clearTimeout(timer); }

  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) {
    const msg = redact(data?.error?.message || res.statusText, cfg.apiKey);
    const reason = JSON.stringify(data?.error?.details || '') + msg;
    if (res.status === 429) {
      const retry = Number(res.headers.get?.('retry-after')) || null;
      throw new CoachError('rate_limited', 429, 'Gemini rate limit reached. Try again in a moment.', { retryAfter: retry });
    }
    if (/API_KEY_INVALID|API key not valid|API key expired/i.test(reason)) throw new CoachError('invalid_key', 401, 'The server\'s GEMINI_API_KEY was rejected by Google.');
    if (res.status === 403) throw new CoachError('forbidden', 403, 'The API key isn\'t allowed to use Gemini (check the key\'s API restrictions).');
    if (res.status === 404) throw new CoachError('model_not_found', 502, `Model "${cfg.model}" was not found.`);
    if (res.status >= 500) throw new CoachError('upstream_unavailable', 502, 'Gemini is temporarily unavailable.');
    throw new CoachError('upstream_error', 502, `Gemini returned an error: ${msg}`.slice(0, 300));
  }
  if (data?.promptFeedback?.blockReason) throw new CoachError('blocked', 422, 'Gemini declined to answer that message.');
  const cand = data?.candidates?.[0];
  const text = (cand?.content?.parts || []).map((p) => p.text || '').join('').trim();
  if (!text) {
    if (cand?.finishReason === 'SAFETY') throw new CoachError('blocked', 422, 'Gemini declined to answer that message.');
    throw new CoachError('empty', 502, 'Gemini returned an empty response.');
  }
  return { text, finishReason: cand?.finishReason || null };
}

/** Simple fixed-window limiter per client key (IP). */
export class RateLimiter {
  constructor(limit = 20, windowMs = 60000) { this.limit = limit; this.windowMs = windowMs; this.hits = new Map(); }
  check(key, now = Date.now()) {
    const h = this.hits.get(key);
    if (!h || now - h.start > this.windowMs) { this.hits.set(key, { start: now, n: 1 }); return { ok: true }; }
    h.n++;
    if (this.hits.size > 5000) this.hits.clear();
    return h.n <= this.limit ? { ok: true } : { ok: false, retryAfter: Math.ceil((h.start + this.windowMs - now) / 1000) };
  }
}

/** Route handlers shared by the Node server and serverless functions. Return { status, body }. */
export function handleStatus(env = process.env) {
  const cfg = readConfig(env);
  return { status: 200, body: { configured: !!cfg.apiKey, model: cfg.model, accessCodeRequired: !!cfg.accessCode } };
}

export async function handleChat(body, { env = process.env, fetchImpl = fetch, accessCode = '' } = {}) {
  const cfg = readConfig(env);
  if (cfg.accessCode && accessCode !== cfg.accessCode) {
    return { status: 401, body: { error: { code: 'access_denied', message: 'This ASCEND server requires an access code. Add it in Coach settings.' } } };
  }
  const v = validateRequest(body);
  if (!v.ok) return { status: 400, body: { error: { code: 'bad_request', message: v.error } } };
  const val = v.value;
  try {
    let contents = val.messages;
    if (val.task === 'greeting') contents = [{ role: 'user', text: 'Introduce yourself and greet me.' }];
    if (val.task === 'summarize') contents = [{ role: 'user', text: `Conversation to summarise:\n${val.messages.map((m) => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.text}`).join('\n')}` }];
    const r = await callGemini(cfg, {
      system: buildSystemPrompt(val), contents,
      temperature: val.task === 'summarize' ? 0.2 : 0.8,
      maxOutputTokens: val.task === 'summarize' ? 400 : 800,
    }, fetchImpl);
    return { status: 200, body: { text: r.text, model: cfg.model } };
  } catch (e) {
    if (e instanceof CoachError) return { status: e.status, body: { error: { code: e.code, message: e.message, retryAfter: e.retryAfter ?? undefined } } };
    return { status: 500, body: { error: { code: 'server_error', message: 'Unexpected server error.' } } };
  }
}
