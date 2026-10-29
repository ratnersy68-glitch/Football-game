// ASCEND server: serves the app and the AI coach API. Zero dependencies.
//   GEMINI_API_KEY=... node ascend/server/server.mjs          (or put it in ascend/.env.local)
//   PORT (default 8787) · GEMINI_MODEL · ASCEND_ACCESS_CODE (optional shared code)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleChat, handleStatus, RateLimiter } from './coach-core.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MAX_BODY = 96 * 1024;

/** Minimal .env.local loader (KEY=VALUE lines). Real environment variables win. */
export function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    const v = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon',
};
// Only these top-level paths are public. Server code, tests and dotfiles (.env.local) never are.
const PUBLIC = /^\/(index\.html|sw\.js|manifest\.webmanifest|icon[\w-]*\.(svg|png)|(js|css|media)\/.+)$/;

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, { 'Content-Type': isJson ? 'application/json' : 'text/plain', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(isJson ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error('too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export function createServer({ env = process.env, fetchImpl = fetch, limiter = new RateLimiter(20, 60000) } = {}) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const p = decodeURIComponent(url.pathname);
    try {
      if (p === '/api/coach/status' && req.method === 'GET') {
        const r = handleStatus(env); return send(res, r.status, r.body, { 'Cache-Control': 'no-store' });
      }
      if (p === '/api/coach/chat') {
        if (req.method !== 'POST') return send(res, 405, { error: { code: 'method', message: 'Use POST.' } });
        const ip = req.socket.remoteAddress || 'local';
        const rl = limiter.check(ip);
        if (!rl.ok) return send(res, 429, { error: { code: 'rate_limited', message: 'Too many coach requests. Wait a moment.', retryAfter: rl.retryAfter } }, { 'Retry-After': String(rl.retryAfter) });
        let body;
        try { body = JSON.parse(await readBody(req)); } catch (e) { return send(res, e.status || 400, { error: { code: 'bad_request', message: e.status === 413 ? 'Request too large.' : 'Invalid JSON.' } }); }
        const r = await handleChat(body, { env, fetchImpl, accessCode: req.headers['x-ascend-access'] || '' });
        console.log(`[coach] ${new Date().toISOString()} ${body?.task || 'chat'} → ${r.status}${r.body.error ? ` ${r.body.error.code}` : ''}`);
        return send(res, r.status, r.body, { 'Cache-Control': 'no-store' });
      }
      if (p.startsWith('/api/')) return send(res, 404, { error: { code: 'not_found', message: 'Unknown API route.' } });
      // static files
      const rel = p === '/' ? '/index.html' : p;
      if (!PUBLIC.test(rel) || rel.includes('..')) return send(res, 404, 'Not found');
      const file = normalize(join(ROOT, rel));
      if (!file.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) return send(res, 404, 'Not found');
      const st = await stat(file).catch(() => null);
      if (!st?.isFile()) return send(res, 404, 'Not found');
      const data = await readFile(file);
      return send(res, 200, data, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': rel.startsWith('/media/') ? 'public, max-age=604800' : 'no-cache' });
    } catch {
      return send(res, 500, { error: { code: 'server_error', message: 'Unexpected server error.' } });
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  loadEnvFile(join(ROOT, '.env.local'));
  const port = Number(process.env.PORT) || 8787;
  createServer().listen(port, () => {
    const st = handleStatus().body;
    console.log(`ASCEND running at http://localhost:${port}/`);
    console.log(st.configured ? `AI coach: enabled (${st.model})` : 'AI coach: GEMINI_API_KEY not set — the Coach tab will show setup instructions.');
  });
}
