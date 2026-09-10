import { createHash } from 'node:crypto';
export class RequestError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export function readBody(req, maxBytes = 40000) {
  if (!String(req.headers?.['content-type'] || '').toLowerCase().startsWith('application/json')) throw new RequestError('Send JSON data.', 415);
  if (Number(req.headers?.['content-length']) > maxBytes) throw new RequestError('Request is too large.', 413);
  let body = req.body;
  if (typeof body === 'string') {
    if (Buffer.byteLength(body) > maxBytes) throw new RequestError('Request is too large.', 413);
    try { body = JSON.parse(body); } catch { throw new RequestError('Invalid JSON.'); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RequestError('Invalid request data.');
  if (Buffer.byteLength(JSON.stringify(body)) > maxBytes) throw new RequestError('Request is too large.', 413);
  return body;
}
export function stringField(value, name, { min = 0, max = 200 } = {}) {
  if (value === undefined && min === 0) return '';
  if (typeof value !== 'string') throw new RequestError(`${name} must be text.`);
  const text = value.trim();
  if (text.length < min || text.length > max) throw new RequestError(`${name} must be ${min}–${max} characters.`);
  return text;
}
export function allowRequest(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST'); res.status(405).json({ error: 'Method not allowed.' }); return false;
  }
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  const allowed = new Set(['https://reincarnatedai.com', 'https://www.reincarnatedai.com']);
  if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  if (!process.env.VERCEL && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host || '')) allowed.add(`http://${host}`);
  if ((origin && !allowed.has(origin)) || req.headers?.['sec-fetch-site'] === 'cross-site') {
    res.status(403).json({ error: 'Please use the form on this website.' }); return false;
  }
  return true;
}
// Bounded per-instance fallback. A separate shared/edge limit is needed for a global quota.
export function createLimiter({ limit = 8, windowMs = 600000, maxKeys = 5000, total = 200 } = {}) {
  const buckets = new Map();
  let globalStart = 0, globalCount = 0;
  return (req, res, now = Date.now()) => {
    for (const [key, entry] of buckets) if (now >= entry.reset) buckets.delete(key);
    if (now >= globalStart + windowMs) { globalStart = now; globalCount = 0; }
    const ip = (process.env.VERCEL ? req.headers?.['x-vercel-forwarded-for'] : req.socket?.remoteAddress) || 'unknown';
    const key = createHash('sha256').update(String(ip)).digest('hex');
    let entry = buckets.get(key);
    if (!entry) {
      if (buckets.size >= maxKeys) {
        res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
        res.status(429).json({ error: 'Too many requests. Please try again later.' }); return false;
      }
      entry = { count: 0, reset: now + windowMs }; buckets.set(key, entry);
    }
    if (entry.count >= limit || globalCount >= total) {
      const reset = globalCount >= total ? globalStart + windowMs : entry.reset;
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((reset - now) / 1000))));
      res.status(429).json({ error: 'Too many requests. Please try again in a few minutes.' }); return false;
    }
    entry.count++; globalCount++; return true;
  };
}
