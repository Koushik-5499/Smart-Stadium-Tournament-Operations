import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatAssistantPage from './ChatAssistantPage';

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

describe('ChatAssistantPage', () => {
  it('renders without crashing (smoke test)', () => {
    const { container } = render(
      <ChatAssistantPage language="en" />
    );
    expect(container).toBeDefined();
  });
});
