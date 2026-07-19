import { describe, it, expect, vi } from 'vitest';
import { useNavigationChat } from './useNavigationChat';
import { callGemini } from '../../shared/geminiClient';

vi.mock('../../shared/geminiClient', () => ({
  callGemini: vi.fn().mockResolvedValue('Mock Gemini Response')
}));

describe('useNavigationChat', () => {
  it('handles general question via Gemini', async () => {
    const { handleNavigationRequest } = useNavigationChat();
    const result = await handleNavigationRequest('How do I get to my seat?');
    expect(result).toHaveProperty('content');
    expect(callGemini).toHaveBeenCalled();
  });

  it('handles navigation intent to a known gate', async () => {
    const { handleNavigationRequest } = useNavigationChat();
    const result = await handleNavigationRequest('Take me to gate A');
    expect(result.content).toContain('Directions');
  });

  it('handles facility search intent', async () => {
    const { handleNavigationRequest } = useNavigationChat();
    const result = await handleNavigationRequest('Where is the nearest restroom?');
    expect(result.content).toBeDefined();
  });
});
