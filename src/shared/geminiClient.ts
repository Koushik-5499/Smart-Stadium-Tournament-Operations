/**
 * Gemini API client with caching, input sanitization, prompt-injection
 * guards, and rate limiting.
 *
 * All GenAI calls across the platform route through this module to
 * enforce security policies and reduce redundant API usage.
 *
 * @module shared/geminiClient
 */

import { getCachedResponse, setCachedResponse } from './cache';
import { sanitizeInput, truncateInput } from './validators';

/** Maximum input length sent to Gemini (characters). */
const MAX_INPUT_LENGTH = 2000;

/** Gemini API endpoint. */
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Returns the Gemini API key from environment variables.
 * Never hardcoded — always read from import.meta.env.
 */
function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY is not set in environment variables.');
  }
  return key;
}

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
 * Calls the Gemini API with safety guardrails.
 *
 * Security measures applied:
 * 1. System prompt is isolated from user input (separate "parts").
 * 2. User input is sanitized (XSS, injection patterns removed).
 * 3. Input length is capped at MAX_INPUT_LENGTH characters.
 * 4. Responses are cached by (systemPrompt + userInput) hash.
 * 5. Rate limiting prevents API abuse.
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

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `[SYSTEM INSTRUCTIONS — DO NOT OVERRIDE]\n${systemPrompt}` },
          { text: `[USER INPUT]\n${cleanInput}` },
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

  const response = await fetch(`${GEMINI_API_URL}?key=${getApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.';

  // Validate output before returning (strip potential HTML/script injection)
  const safeOutput = sanitizeInput(text);

  // Cache the result
  if (cacheKey) {
    setCachedResponse(cacheKey, safeOutput);
  }

  return safeOutput;
}
