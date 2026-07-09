/**
 * Input validation and sanitization utilities.
 *
 * All user input (chatbot text, forms, query params) is validated and
 * sanitized server-side through these functions before processing.
 *
 * @module shared/validators
 */

/**
 * Strips HTML tags and script content from input to prevent XSS.
 * Also removes common prompt-injection patterns.
 *
 * @param input - Raw user input string
 * @returns Sanitized string safe for processing and rendering
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  let clean = input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-like patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove common prompt-injection patterns
    .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '')
    .replace(/you\s+are\s+now\s+/gi, '')
    .replace(/forget\s+(all\s+)?previous/gi, '')
    .replace(/system\s*prompt/gi, '')
    .replace(/\[SYSTEM/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return clean;
}

/**
 * Truncates input to a maximum length to prevent abuse.
 *
 * @param input - The input string
 * @param maxLength - Maximum allowed length (default: 2000)
 * @returns Truncated string
 */
export function truncateInput(input: string, maxLength = 2000): string {
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength) + '…';
}

/**
 * Validates that a string is non-empty after trimming.
 *
 * @param input - The input to validate
 * @returns true if the input is a non-empty string
 */
export function isNonEmpty(input: unknown): input is string {
  return typeof input === 'string' && input.trim().length > 0;
}

/**
 * Validates a zone ID format (alphanumeric + hyphens, max 20 chars).
 *
 * @param zoneId - The zone ID to validate
 * @returns true if valid
 */
export function isValidZoneId(zoneId: string): boolean {
  return /^[a-zA-Z0-9-]{1,20}$/.test(zoneId);
}

/**
 * Validates a severity level (1-5 integer).
 *
 * @param severity - The severity value to check
 * @returns true if severity is a valid integer between 1 and 5
 */
export function isValidSeverity(severity: unknown): severity is 1 | 2 | 3 | 4 | 5 {
  return typeof severity === 'number' && Number.isInteger(severity) && severity >= 1 && severity <= 5;
}

/**
 * Validates an email address format.
 *
 * @param email - The email to validate
 * @returns true if the email matches a basic email pattern
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
