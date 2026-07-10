/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ChatInterface from './ChatInterface';

window.HTMLElement.prototype.scrollIntoView = function() {};

describe('ChatInterface', () => {
  it('renders messages correctly', () => {
    const { getByText } = render(
      <ChatInterface
        messages={[{ id: '1', role: 'assistant', content: 'hello world', timestamp: 123 }]}
        input=""
        isLoading={false}
        onInputChange={() => {}}
        onSend={() => {}}
        placeholder="Type here..."
        sendLabel="Send"
        ariaLabel="Chat"
      />
    );
    expect(getByText('hello world')).toBeDefined();
  });
});
