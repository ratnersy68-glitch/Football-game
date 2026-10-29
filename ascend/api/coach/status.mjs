// Vercel serverless function: GET /api/coach/status — reports whether a key is configured
// (true/false only; the key itself is never returned).
import { handleStatus } from '../../server/coach-core.mjs';

export default function handler(req, res) {
  const r = handleStatus();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(r.status).json(r.body);
}
