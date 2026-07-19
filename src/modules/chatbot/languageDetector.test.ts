import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectLanguage } from './languageDetector';
import { callGemini } from '../../shared/geminiClient';

vi.mock('../../shared/geminiClient', () => ({
  callGemini: vi.fn(),
}));

describe('detectLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects language successfully (happy path)', async () => {
    vi.mocked(callGemini).mockResolvedValueOnce('es');
    const lang = await detectLanguage('Hola como estas');
    expect(lang).toBe('es');
  });

  it('defaults to en if language is unsupported (edge case)', async () => {
    vi.mocked(callGemini).mockResolvedValueOnce('xx');
    const lang = await detectLanguage('Some unsupported lang');
    expect(lang).toBe('en');
  });

  it('defaults to en on API failure (error case)', async () => {
    vi.mocked(callGemini).mockRejectedValueOnce(new Error('API Down'));
    const lang = await detectLanguage('Hello');
    expect(lang).toBe('en');
  });
});
