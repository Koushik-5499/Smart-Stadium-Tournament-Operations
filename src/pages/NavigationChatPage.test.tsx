import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NavigationChatPage from './NavigationChatPage';

// Mock hook
vi.mock('../shared/hooks/useChatMessages', () => ({
  useChatMessages: () => ({
    messages: [],
    input: '',
    setInput: vi.fn(),
    isLoading: false,
    handleSend: vi.fn(),
    resetMessages: vi.fn()
  })
}));

describe('NavigationChatPage', () => {
  it('renders without crashing (smoke test)', () => {
    const { container } = render(
      <NavigationChatPage language="en" />
    );
    expect(container).toBeDefined();
  });
});
