// Server / Gemini integration tests. Run: node --test ascend/tests
// Set GEMINI_LIVE=1 (and GEMINI_API_KEY) to also run a real request against Google.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleChat, handleStatus, buildSystemPrompt, validateRequest, redact, RateLimiter } from '../server/coach-core.mjs';
import { createServer } from '../server/server.mjs';
import { PRESETS } from '../js/data/coaches.js';

const FAKE_KEY = 'AIzaSyTEST_not_a_real_key_000000000000';
const env = { GEMINI_API_KEY: FAKE_KEY };
const chatBody = (over = {}) => ({ task: 'chat', messages: [{ role: 'user', text: 'What should I bench today?' }], coach: { preset: 'drill', name: 'Marcus' }, context: 'Unit: lbs\nBarbell Bench Press last session: 135 lbs × 8, 8, 8', ...over });

function mockFetch(responder) {
  const calls = [];
  const fn = async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); return responder(url, init); };
  fn.calls = calls;
  return fn;
}
const jsonRes = (status, obj, headers = {}) => ({ ok: status < 400, status, statusText: '', headers: { get: (k) => headers[k.toLowerCase()] ?? null }, json: async () => obj });

test('valid key: request is shaped for Gemini and the reply is returned', async () => {
  const f = mockFetch(() => jsonRes(200, { candidates: [{ content: { parts: [{ text: 'Last time: 135 × 8. Add one rep.' }] }, finishReason: 'STOP' }] }));
  const r = await handleChat(chatBody(), { env, fetchImpl: f });
  assert.equal(r.status, 200);
  assert.equal(r.body.text, 'Last time: 135 × 8. Add one rep.');
  const c = f.calls[0];
  assert.match(c.url, /\/v1beta\/models\/gemini-flash-latest:generateContent$/);
  assert.equal(c.init.headers['x-goog-api-key'], FAKE_KEY, 'key sent in header');
  assert.ok(!c.url.includes(FAKE_KEY), 'key not in URL');
  assert.equal(c.body.contents.at(-1).role, 'user');
  assert.match(c.body.systemInstruction.parts[0].text, /Drill Sergeant/);
  assert.match(c.body.systemInstruction.parts[0].text, /135 lbs × 8/, 'workout context included');
  assert.ok(!JSON.stringify(r.body).includes(FAKE_KEY), 'key never returned');
});

test('multi-turn history is passed through in order', async () => {
  const f = mockFetch(() => jsonRes(200, { candidates: [{ content: { parts: [{ text: 'ok' }] } }] }));
  await handleChat(chatBody({ messages: [{ role: 'user', text: 'a' }, { role: 'model', text: 'b' }, { role: 'user', text: 'c' }] }), { env, fetchImpl: f });
  assert.deepEqual(f.calls[0].body.contents.map((m) => m.role + m.parts[0].text), ['usera', 'modelb', 'userc']);
});

test('turns are merged to alternate and start with the user', () => {
  const v = validateRequest({ messages: [{ role: 'model', text: 'hi' }, { role: 'model', text: 'nudge' }, { role: 'user', text: 'a' }, { role: 'user', text: 'b' }] }).value;
  assert.deepEqual(v.messages.map((m) => m.role), ['user', 'model', 'user']);
  assert.equal(v.messages[2].text, 'a\n\nb');
});

test('missing key gives a setup error, not a fake answer', async () => {
  const r = await handleChat(chatBody(), { env: {}, fetchImpl: () => { throw new Error('should not be called'); } });
  assert.equal(r.status, 503);
  assert.equal(r.body.error.code, 'missing_key');
  assert.equal(handleStatus({}).body.configured, false);
  assert.equal(handleStatus(env).body.configured, true);
  assert.ok(!JSON.stringify(handleStatus(env).body).includes(FAKE_KEY));
});

test('upstream failures map to useful codes and never leak the key', async () => {
  const cases = [
    [jsonRes(400, { error: { message: `API key not valid. Please pass a valid API key. key=${FAKE_KEY}`, details: [{ reason: 'API_KEY_INVALID' }] } }), 'invalid_key', 401],
    [jsonRes(429, { error: { message: 'Resource exhausted' } }, { 'retry-after': '7' }), 'rate_limited', 429],
    [jsonRes(503, { error: { message: 'overloaded' } }), 'upstream_unavailable', 502],
    [jsonRes(403, { error: { message: 'denied' } }), 'forbidden', 403],
    [jsonRes(200, { promptFeedback: { blockReason: 'SAFETY' } }), 'blocked', 422],
    [jsonRes(200, { candidates: [{ content: { parts: [] }, finishReason: 'SAFETY' }] }), 'blocked', 422],
  ];
  for (const [res, code, status] of cases) {
    const r = await handleChat(chatBody(), { env, fetchImpl: async () => res });
    assert.equal(r.body.error.code, code);
    assert.equal(r.status, status);
    assert.ok(!JSON.stringify(r.body).includes(FAKE_KEY), `${code} leaks key`);
  }
  const net = await handleChat(chatBody(), { env, fetchImpl: async () => { throw new TypeError('fetch failed'); } });
  assert.equal(net.body.error.code, 'network');
  assert.equal(redact(`x ${FAKE_KEY} y`, FAKE_KEY), 'x [redacted] y');
});

test('validation rejects malformed requests and caps sizes', () => {
  assert.equal(validateRequest(null).ok, false);
  assert.equal(validateRequest({ messages: [{ role: 'model', text: 'hi' }] }).ok, false);
  const v = validateRequest({ messages: Array.from({ length: 60 }, (_, i) => ({ role: i % 2 ? 'model' : 'user', text: 'x'.repeat(5000) })).concat([{ role: 'user', text: 'q' }]), context: 'y'.repeat(50000), coach: { preset: 'nope', name: '<script>', sliders: { strictness: 99 } } }).value;
  assert.ok(v.messages.length <= 25 && v.messages.every((m) => m.text.length <= 2000));
  assert.ok(v.context.length <= 14000);
  assert.equal(v.coach.preset, 'pro');
  assert.equal(v.coach.name, 'script');
  assert.equal(v.coach.sliders.strictness, 10);
});

test('each personality gets a distinct system prompt; safety and youth rules always present', () => {
  const prompts = PRESETS.map((p) => buildSystemPrompt(validateRequest({ ...chatBody(), coach: { preset: p.id, name: 'X', description: 'calm but funny', sliders: { humor: 9 } } }).value));
  assert.equal(new Set(prompts).size, PRESETS.length);
  for (const pr of prompts) { assert.match(pr, /Never encourage training through pain/); assert.match(pr, /Never invent workouts/); assert.match(pr, /Never promise/); }
  assert.match(prompts[0], /drill instructor/);
  assert.match(prompts.at(-1), /calm but funny/);
  assert.match(prompts.at(-1), /Humor 9\/10/);
  const youth = buildSystemPrompt(validateRequest({ ...chatBody(), youth: true }).value);
  assert.match(youth, /UNDER 18/);
  assert.match(youth, /Do not prescribe one-rep-max/);
});

test('access code is enforced when configured', async () => {
  const f = mockFetch(() => jsonRes(200, { candidates: [{ content: { parts: [{ text: 'ok' }] } }] }));
  const e2 = { ...env, ASCEND_ACCESS_CODE: 'lift' };
  assert.equal((await handleChat(chatBody(), { env: e2, fetchImpl: f })).status, 401);
  assert.equal((await handleChat(chatBody(), { env: e2, fetchImpl: f, accessCode: 'lift' })).status, 200);
});

test('rate limiter', () => {
  const rl = new RateLimiter(2, 1000);
  assert.ok(rl.check('a', 0).ok); assert.ok(rl.check('a', 1).ok); assert.equal(rl.check('a', 2).ok, false); assert.ok(rl.check('a', 2000).ok);
});

test('HTTP server: API routes, no secret files served, body limits', async () => {
  const f = mockFetch(() => jsonRes(200, { candidates: [{ content: { parts: [{ text: 'hello' }] } }] }));
  const srv = createServer({ env, fetchImpl: f });
  await new Promise((r) => srv.listen(0, r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try {
    assert.equal((await (await fetch(`${base}/api/coach/status`)).json()).configured, true);
    const ok = await fetch(`${base}/api/coach/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(chatBody()) });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).text, 'hello');
    for (const p of ['/.env.local', '/.env.example', '/server/coach-core.mjs', '/tests/server.test.js', '/%2e%2e/package.json', '/api/coach/chat.mjs']) {
      assert.equal((await fetch(base + p)).status, 404, p);
    }
    assert.equal((await fetch(`${base}/`)).status, 200);
    assert.equal((await fetch(`${base}/js/main.js`)).status, 200);
    const big = await fetch(`${base}/api/coach/chat`, { method: 'POST', body: 'x'.repeat(200000) }).catch(() => ({ status: 413 }));
    assert.equal(big.status, 413);
  } finally { srv.close(); }
});

test('no API keys or key-shaped strings in any client-side file', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const files = [...walk(join(root, 'js')), join(root, 'index.html'), join(root, 'sw.js')];
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    assert.ok(!/AIza[0-9A-Za-z_-]{20,}/.test(t), `key-like string in ${f}`);
    // the variable name may appear in setup instructions, but never process.env access
    assert.ok(!/process\.env/.test(t), `env access in client file ${f}`);
  }
});

test('live Gemini: a fake key is rejected by Google and reported as invalid_key', { skip: process.env.GEMINI_LIVE !== '1' }, async () => {
  const r = await handleChat(chatBody(), { env: { GEMINI_API_KEY: process.env.GEMINI_API_KEY || FAKE_KEY } });
  if (process.env.GEMINI_API_KEY) { assert.equal(r.status, 200, JSON.stringify(r.body)); assert.ok(r.body.text.length > 0); }
  else { assert.equal(r.body.error.code, 'invalid_key', JSON.stringify(r.body)); }
});

