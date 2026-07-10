/**
 * Gemini API client with caching, input sanitization, prompt-injection
 * guards, and rate limiting.
 *
 * All GenAI calls across the platform route through this module to
 * enforce security policies and reduce redundant API usage.
 *
 * In production (Vercel), requests are proxied through /api/gemini
 * so the Gemini API key never reaches the client bundle.
 *
 * @module shared/geminiClient
 */

import { getCachedResponse, setCachedResponse } from './cache';
import { sanitizeInput, truncateInput } from './validators';

/** Maximum input length sent to Gemini (characters). */
const MAX_INPUT_LENGTH = 2000;

/**
 * Simple token-bucket rate limiter for GenAI requests.
 * Allows a burst of requests then throttles.
 */
class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private lastRefill: number;

  constructor(maxTokens = 10, refillPerSecond = 2) {
    this.tokens = maxTokens;
    this.maxTokens = maxTokens;
    this.refillRate = refillPerSecond;
    this.lastRefill = Date.now();
  }

  /**
   * Checks if a request is allowed under the rate limit.
   * Consumes a token if available.
   *
   * @returns true if the request is allowed
   */
  tryConsume(): boolean {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

const rateLimiter = new RateLimiter(10, 2);

/**
 * Calls the Gemini API via the Vercel serverless proxy (/api/gemini).
 *
 * Security measures applied:
 * 1. System prompt is isolated from user input (separate "parts" on the server).
 * 2. User input is sanitized (XSS, injection patterns removed).
 * 3. Input length is capped at MAX_INPUT_LENGTH characters.
 * 4. Responses are cached by (systemPrompt + userInput) hash.
 * 5. Rate limiting prevents API abuse.
 * 6. The Gemini API key stays server-side — never shipped to the client.
 *
 * @param systemPrompt - The system-level instructions (not user-controllable)
 * @param userInput - The user-provided content to analyze
 * @param cacheKey - Optional cache key; if provided, results are cached
 * @returns The model's text response
 */
export async function callGemini(
  systemPrompt: string,
  userInput: string,
  cacheKey?: string,
): Promise<string> {
  // Check cache first
  if (cacheKey) {
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
  }

  // Rate limiting
  if (!rateLimiter.tryConsume()) {
    throw new Error('Rate limit exceeded. Please try again shortly.');
  }

  // Sanitize and truncate user input (prompt-injection guard)
  const cleanInput = truncateInput(sanitizeInput(userInput), MAX_INPUT_LENGTH);

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userInput: cleanInput }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Gemini proxy error (${response.status}): ${errorData.error}`);
  }

  const data = await response.json();
  const text: string = data?.text ?? 'No response generated.';

  // Validate output before returning (strip potential HTML/script injection)
  const safeOutput = sanitizeInput(text);

  // Cache the result
  if (cacheKey) {
    setCachedResponse(cacheKey, safeOutput);
  }

  return safeOutput;
}
