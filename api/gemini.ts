import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function — Gemini API Proxy
 *
 * Accepts POST { systemPrompt, userInput } and proxies the request
 * to the Google Gemini API using the server-side GEMINI_API_KEY env var.
 * The API key never reaches the client bundle.
 *
 * Security: Server-side rate limiting (token bucket) prevents abuse.
 *
 * Route: POST /api/gemini
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

/* ── Server-side rate limiter (token bucket) ────────────────────── */
const RATE_LIMIT_MAX = 20;       // max burst
const RATE_LIMIT_REFILL = 2;     // tokens per second
let tokens = RATE_LIMIT_MAX;
let lastRefill = Date.now();

function tryConsumeToken(): boolean {
  const now = Date.now();
  const elapsed = (now - lastRefill) / 1000;
  tokens = Math.min(RATE_LIMIT_MAX, tokens + elapsed * RATE_LIMIT_REFILL);
  lastRefill = now;
  if (tokens >= 1) {
    tokens -= 1;
    return true;
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Server-side rate limiting
  if (!tryConsumeToken()) {
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in Vercel environment variables.');
    return res.status(500).json({ error: 'Server misconfiguration: missing API key.' });
  }

  const { systemPrompt, userInput } = req.body ?? {};
  if (!systemPrompt || !userInput) {
    return res.status(400).json({ error: 'Missing required fields: systemPrompt, userInput' });
  }

  // Security: strict input length validation to prevent massive payloads
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
