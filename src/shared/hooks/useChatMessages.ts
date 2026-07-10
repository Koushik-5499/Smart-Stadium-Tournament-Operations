import { useState, useCallback } from 'react';
import type { ChatMessage, SupportedLanguage } from '../types';

export function useChatMessages(initialMessage: ChatMessage) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetMessages = useCallback((msg: ChatMessage) => {
    setMessages([msg]);
  }, []);

  const handleSend = useCallback(async (
    processMessage: (text: string) => Promise<{ content: string; language?: SupportedLanguage }>
  ) => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processMessage(trimmed);
      
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        language: response.language,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    resetMessages,
  };
}
