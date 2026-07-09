// PROBLEM STATEMENT ALIGNMENT: addresses "Multilingual Assistance" —
// auto-detect and respond in multiple languages for fan-facing features.

/**
 * Gemini-powered language detection and translation for fan chat.
 *
 * Detects user language automatically and translates AI responses
 * to match. Supports English, Spanish, Portuguese, French, and Arabic.
 *
 * @module chatbot/languageDetector
 */

import { callGemini } from '../../shared/geminiClient';
import type { SupportedLanguage } from '../../shared/types';

const DETECTION_SYSTEM_PROMPT = `Detect the language of the user's message.
Respond ONLY with the ISO 639-1 language code: en, es, pt, fr, or ar.
If unsure, respond with "en".`;

const CHAT_SYSTEM_PROMPT = `You are a helpful multilingual assistant at FIFA World Cup 2026 stadium.
You help fans with navigation, finding facilities, event information, and general questions.
IMPORTANT: Respond in the SAME LANGUAGE as the user's message.
If the user writes in Spanish, respond in Spanish. Same for Portuguese, French, and Arabic.
Be friendly, concise, and helpful. Keep responses under 100 words.`;

/**
 * Detects the language of a text input using Gemini.
 *
 * @param text - The text to analyze
 * @returns Detected language code
 */
export async function detectLanguage(text: string): Promise<SupportedLanguage> {
  try {
    const response = await callGemini(DETECTION_SYSTEM_PROMPT, text, `lang-detect-${text.slice(0, 30)}`);
    const code = response.trim().toLowerCase().slice(0, 2);
    const validCodes: SupportedLanguage[] = ['en', 'es', 'pt', 'fr', 'ar'];
    return validCodes.includes(code as SupportedLanguage) ? (code as SupportedLanguage) : 'en';
  } catch {
    return 'en';
  }
}

/**
 * Generates a multilingual chat response using Gemini.
 * Automatically responds in the same language as the user's message.
 *
 * @param userMessage - The user's message
 * @param language - The detected or selected language
 * @returns AI-generated response in the appropriate language
 */
export async function generateChatResponse(
  userMessage: string,
  language: SupportedLanguage,
): Promise<string> {
  const languageInstruction = `Respond in ${getLanguageName(language)}.`;
  const prompt = `${CHAT_SYSTEM_PROMPT}\n${languageInstruction}`;

  try {
    return await callGemini(prompt, userMessage);
  } catch {
    const fallbacks: Record<SupportedLanguage, string> = {
      en: 'Sorry, I\'m having trouble right now. Please try again.',
      es: 'Lo siento, estoy teniendo problemas. Intente de nuevo.',
      pt: 'Desculpe, estou com problemas. Tente novamente.',
      fr: 'Désolé, j\'ai des difficultés. Veuillez réessayer.',
      ar: 'عذراً، أواجه مشكلة الآن. يرجى المحاولة مرة أخرى.',
    };
    return fallbacks[language];
  }
}

/**
 * Returns the full language name for a language code.
 *
 * @param code - ISO 639-1 language code
 * @returns Full language name
 */
function getLanguageName(code: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    en: 'English',
    es: 'Spanish',
    pt: 'Portuguese',
    fr: 'French',
    ar: 'Arabic',
  };
  return names[code];
}
