// Vercel serverless function: POST /api/coach/chat. Set GEMINI_API_KEY in the project's
// Environment Variables (never in code). Shares all logic with the local Node server.
import { handleChat, RateLimiter } from '../../server/coach-core.mjs';

const limiter = new RateLimiter(20, 60000); // per warm instance

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: { code: 'method', message: 'Use POST.' } });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const rl = limiter.check(ip);
  if (!rl.ok) return res.status(429).json({ error: { code: 'rate_limited', message: 'Too many coach requests. Wait a moment.', retryAfter: rl.retryAfter } });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  const r = await handleChat(body, { accessCode: req.headers['x-ascend-access'] || '' });
  return res.status(r.status).json(r.body);
}
