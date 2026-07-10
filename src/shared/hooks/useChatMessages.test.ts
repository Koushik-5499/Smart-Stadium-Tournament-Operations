/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatMessages } from './useChatMessages';

describe('useChatMessages', () => {
  it('manages chat messages and input', () => {
    const { result } = renderHook(() => useChatMessages({ id: '1', role: 'assistant', content: 'hello', timestamp: 123 }));
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('hello');
    
    act(() => result.current.setInput('test input'));
    expect(result.current.input).toBe('test input');
  });

  it('resets messages correctly', () => {
    const { result } = renderHook(() => useChatMessages({ id: '1', role: 'assistant', content: 'hello', timestamp: 123 }));
    
    act(() => {
      result.current.resetMessages({ id: '2', role: 'assistant', content: 'hola', timestamp: 123 });
    });
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('hola');
  });
});
