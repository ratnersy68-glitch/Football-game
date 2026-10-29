// A stand-in for Google's generateContent endpoint, for browser tests without a real key.
// It records requests and answers by quoting the persona and data it was given, so tests can
// prove the right context reached "Gemini". Control: POST /__control {mode:'ok'|'429'|'500'|'invalid'}
import http from 'node:http';

export function startMockGemini(port = 0) {
  const state = { mode: 'ok', requests: [] };
  const srv = http.createServer(async (req, res) => {
    let body = '';
    for await (const c of req) body += c;
    if (req.url === '/__control') { Object.assign(state, JSON.parse(body || '{}')); res.end('ok'); return; }
    if (req.url === '/__last') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(state.requests.at(-1) || null)); return; }
    const parsed = JSON.parse(body || '{}');
    state.requests.push({ url: req.url, key: req.headers['x-goog-api-key'], body: parsed });
    const send = (status, obj) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
    if (state.mode === '429') return send(429, { error: { code: 429, message: 'Resource has been exhausted', status: 'RESOURCE_EXHAUSTED' } });
    if (state.mode === '500') return send(503, { error: { code: 503, message: 'The model is overloaded.' } });
    if (state.mode === 'invalid') return send(400, { error: { code: 400, message: 'API key not valid. Please pass a valid API key.', details: [{ reason: 'API_KEY_INVALID' }] } });
    const sys = parsed.systemInstruction?.parts?.[0]?.text || '';
    const persona = (sys.match(/The Drill Sergeant|The Hype Coach|The Professional|The Gym Bro|The Mentor|Custom coach/) || ['?'])[0];
    const name = (sys.match(/You are ([^,]+), the personal AI/) || [])[1];
    const lastUser = parsed.contents?.at(-1)?.parts?.[0]?.text || '';
    const exBlock = sys.split('\n## ')[1] || '';
    const sets = (exBlock.match(/\d+(?:\.\d+)?×\d+(?:@[\d.]+)?/g) || []).slice(0, 3).join(', ');
    const text = sys.includes('TASK: Summarise')
      ? 'Summary: the user asked about bench progression.'
      : sys.includes('TASK: Write a short personalised first greeting')
        ? `I'm ${name}, your ${persona.replace('The ', '')}. Let's work on your Barbell Bench Press.`
        : `[${persona}] You asked: "${lastUser.slice(0, 60)}". From your log: ${sets || 'no sets found'}. Watch the Barbell Bench Press demonstration for form.`;
    send(200, { candidates: [{ content: { role: 'model', parts: [{ text }] }, finishReason: 'STOP' }] });
  });
  return new Promise((resolve) => srv.listen(port, '127.0.0.1', () => resolve({ srv, state, port: srv.address().port })));
}

if (process.argv[1]?.endsWith('mock-gemini.mjs')) {
  startMockGemini(Number(process.env.PORT) || 8790).then(({ port }) => console.log(`mock Gemini on ${port}`));
}
