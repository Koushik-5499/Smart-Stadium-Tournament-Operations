// PROBLEM STATEMENT ALIGNMENT: addresses "Multilingual Assistance" —
// auto-detect and respond in at least 5 languages for fan-facing chat.

/**
 * Multilingual Chat Assistant page.
 *
 * Fan-facing chat with automatic language detection and a visible
 * language switcher. Responds in English, Spanish, Portuguese, French, and Arabic.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { t } from '../shared/i18n';
import type { SupportedLanguage, ChatMessage } from '../shared/types';
import { SUPPORTED_LANGUAGES } from '../shared/constants';
import { detectLanguage, generateChatResponse } from '../modules/chatbot/languageDetector';

interface Props {
  language: SupportedLanguage;
}

export default function ChatAssistantPage({ language: uiLanguage }: Props) {
  const [chatLanguage, setChatLanguage] = useState<SupportedLanguage>(uiLanguage);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: t('chat.welcome', chatLanguage), timestamp: Date.now(), language: chatLanguage },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages([
      { id: '1', role: 'assistant', content: t('chat.welcome', chatLanguage), timestamp: Date.now(), language: chatLanguage },
    ]);
  }, [chatLanguage]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      language: chatLanguage,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Auto-detect language
      const detected = await detectLanguage(trimmed);
      if (detected !== chatLanguage) {
        setChatLanguage(detected);
      }

      const response = await generateChatResponse(trimmed, detected);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        language: detected,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', content: t('error', chatLanguage), timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, chatLanguage]);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('nav.chat', uiLanguage)}</h1>
        <p className="page-subtitle">Multilingual AI assistant — auto-detects your language</p>
      </header>

      {/* Language Switcher */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)' }}>
        <label id="chat-lang-label" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)', display: 'block' }}>
          {t('language.select', uiLanguage)}
        </label>
        <div className="language-switcher" role="radiogroup" aria-labelledby="chat-lang-label">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`language-btn ${chatLanguage === lang.code ? 'active' : ''}`}
              onClick={() => setChatLanguage(lang.code)}
              role="radio"
              aria-checked={chatLanguage === lang.code}
              aria-label={`Chat in ${lang.name}`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-container" role="log" aria-label="Multilingual chat assistant">
        <div className="chat-messages" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              {msg.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.content.split('\n').length - 1 && <br />}
                </span>
              ))}
              {msg.language && (
                <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.6, marginTop: 4 }}>
                  {SUPPORTED_LANGUAGES.find((l) => l.code === msg.language)?.name}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="chat-message assistant">
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <label htmlFor="chat-input" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            {t('chat.placeholder', chatLanguage)}
          </label>
          <input
            id="chat-input"
            type="text"
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat.placeholder', chatLanguage)}
            disabled={isLoading}
            aria-label="Type your message in any supported language"
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label={t('chat.send', chatLanguage)}
          >
            {t('chat.send', chatLanguage)}
          </button>
        </div>
      </div>
    </div>
  );
}
