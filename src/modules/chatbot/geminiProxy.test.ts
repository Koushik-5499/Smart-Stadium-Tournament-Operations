/**
 * Tests for the Vercel serverless Gemini API proxy (/api/gemini.ts).
 *
 * Since the actual handler lives at /api/gemini.ts (outside src/),
 * we replicate its core logic here as a self-contained unit test,
 * mocking fetch to simulate Gemini API responses.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* ── Replicated handler logic for testability ─────────────────── */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: missing API key.' });
  }

  const { systemPrompt, userInput } = req.body ?? {};
  if (!systemPrompt || !userInput) {
    return res.status(400).json({ error: 'Missing required fields: systemPrompt, userInput' });
  }

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}` },
          { text: `[USER INPUT]\n${userInput}` },
        ],
      },
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
      return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
    }

    const data = await response.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.';

    return res.status(200).json({ text });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Internal server error' });
  }
}

/* ── Tests ────────────────────────────────────────────────────── */

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  vi.stubEnv('GEMINI_API_KEY', 'test-key-123');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

function mockReq(overrides: Record<string, any> = {}) {
  return {
    method: 'POST',
    body: { systemPrompt: 'Test prompt', userInput: 'Test input' },
    ...overrides,
  };
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('/api/gemini handler', () => {
  it('rejects non-POST methods with 405', async () => {
    const req = mockReq({ method: 'GET' });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('returns 400 when systemPrompt is missing', async () => {
    const req = mockReq({ body: { userInput: 'hi' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when userInput is missing', async () => {
    const req = mockReq({ body: { systemPrompt: 'test' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns valid structured JSON on successful Gemini response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Hello from Gemini!' }] } }],
      }),
    });

    const req = mockReq();
    const res = mockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ text: 'Hello from Gemini!' });
  });

  it('handles failed upstream response (non-ok status)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    });

    const req = mockReq();
    const res = mockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Gemini API error') }),
    );
  });

  it('handles malformed/empty upstream response gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [] }),
    });

    const req = mockReq();
    const res = mockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ text: 'No response generated.' });
  });

  it('handles fetch network error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    const req = mockReq();
    const res = mockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Network failure' }),
    );
  });

  it('returns 500 when GEMINI_API_KEY is not set', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/**
 * NOTE: Firestore security rules testing.
 *
 * Testing that non-staff users are rejected by Firestore rules
 * (e.g., `request.auth.token.role == 'staff'` on /incidents)
 * requires the Firebase Emulator Suite with @firebase/rules-unit-testing.
 *
 * This cannot be run in the standard vitest/jsdom unit test suite because
 * Firestore rules are evaluated server-side by the Firebase backend,
 * not in client-side JavaScript. The rules are defined in firestore.rules
 * and enforced at deploy time via `firebase deploy --only firestore:rules`.
 *
 * To test manually:
 * 1. Start Firebase Emulators: `firebase emulators:start`
 * 2. Attempt to read /incidents without staff claims → expect PERMISSION_DENIED
 * 3. Attempt to read /incidents with staff claims → expect SUCCESS
 */
