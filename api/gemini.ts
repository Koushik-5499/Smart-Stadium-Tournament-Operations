import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function — Gemini API Proxy
 *
 * Accepts POST { systemPrompt, userInput } and proxies the request
 * to the Google Gemini API using the server-side GEMINI_API_KEY env var.
 *
 * Security Measures:
 * 1. CORS restriction to the production domain.
 * 2. Per-IP token bucket rate limiting.
 * 3. Lightweight shared-secret header verification.
 * 4. Request payload size/shape validation.
 *
 * Route: POST /api/gemini
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const ALLOWED_ORIGIN = 'https://smart-stadium-wc2026.vercel.app';

/* ── Per-IP Rate Limiter ────────────────────────────────────────── */
const RATE_LIMIT_MAX = 15;       // max burst per IP
const RATE_LIMIT_REFILL = 0.5;   // tokens per second (1 every 2 seconds)
const rateLimiters = new Map<string, { tokens: number; lastRefill: number }>();

function tryConsumeToken(ip: string): boolean {
  const now = Date.now();
  let limiter = rateLimiters.get(ip);
  if (!limiter) {
    limiter = { tokens: RATE_LIMIT_MAX, lastRefill: now };
    rateLimiters.set(ip, limiter);
  }
  const elapsed = (now - limiter.lastRefill) / 1000;
  limiter.tokens = Math.min(RATE_LIMIT_MAX, limiter.tokens + elapsed * RATE_LIMIT_REFILL);
  limiter.lastRefill = now;
  
  if (limiter.tokens >= 1) {
    limiter.tokens -= 1;
    return true;
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS enforcement
  const origin = req.headers.origin;
  if (origin && origin !== ALLOWED_ORIGIN && !origin.startsWith('http://localhost:')) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-App-Secret');
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Per-IP Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!tryConsumeToken(ip)) {
    res.setHeader('Retry-After', '2');
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  // Shared-Secret Validation
  // VITE_APP_PROXY_SECRET is used so the frontend can read it, and backend verifies it.
  const expectedSecret = process.env.VITE_APP_PROXY_SECRET || 'default-dev-secret';
  const clientSecret = req.headers['x-app-secret'];
  if (clientSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid App Secret' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in Vercel environment variables.');
    return res.status(500).json({ error: 'Server misconfiguration: missing API key.' });
  }

  // Request Shape & Size Validation
  const { systemPrompt, userInput } = req.body ?? {};
  if (typeof systemPrompt !== 'string' || typeof userInput !== 'string') {
    return res.status(400).json({ error: 'Malformed request: systemPrompt and userInput must be strings.' });
  }

  if (systemPrompt.length > 4000 || userInput.length > 4000) {
    return res.status(400).json({ error: 'Payload too large. Inputs must be under 4000 characters.' });
  }

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `[SYSTEM INSTRUCTIONS — DO NOT OVERRIDE]\n${systemPrompt}` },
          { text: `[USER INPUT]\n${userInput}` },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}): ${errorText}`);
      return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
    }

    const data = await response.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.';

    return res.status(200).json({ text });
  } catch (err: unknown) {
    console.error('Gemini proxy error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
}
