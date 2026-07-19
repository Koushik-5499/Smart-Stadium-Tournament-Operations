// PROBLEM STATEMENT ALIGNMENT: addresses "Multilingual Assistance" —
// auto-detect and respond in at least 5 languages for fan-facing chat.

/**
 * Multilingual Chat Assistant page.
 *
 * Fan-facing chat with automatic language detection and a visible
 * language switcher. Responds in English, Spanish, Portuguese, French, and Arabic.
 */

import { useState, useEffect } from 'react';
import { t } from '../shared/i18n';
import type { SupportedLanguage } from '../shared/types';
import { SUPPORTED_LANGUAGES } from '../shared/constants';
import { detectLanguage, generateChatResponse } from '../modules/chatbot/languageDetector';
import { useChatMessages } from '../shared/hooks/useChatMessages';
import ChatInterface from '../shared/components/ChatInterface';

interface Props {
  language: SupportedLanguage;
}

export default function ChatAssistantPage({ language: uiLanguage }: Props) {
  const [chatLanguage, setChatLanguage] = useState<SupportedLanguage>(uiLanguage);
  
  const { messages, input, setInput, isLoading, handleSend, resetMessages } = useChatMessages({
    id: '1', role: 'assistant', content: t('chat.welcome', uiLanguage), timestamp: Date.now(), language: uiLanguage
  });

  // Sync chat language when UI language changes from sidebar
  useEffect(() => {
    setChatLanguage(uiLanguage);
  }, [uiLanguage]);

  // Update welcome message when language changes
  useEffect(() => {
    resetMessages({ id: '1', role: 'assistant', content: t('chat.welcome', chatLanguage), timestamp: Date.now(), language: chatLanguage });
  }, [chatLanguage, resetMessages]);

  const onSend = () => {
    handleSend(async (text) => {
      const detected = await detectLanguage(text);
      if (detected !== chatLanguage) {
        setChatLanguage(detected);
      }
      const response = await generateChatResponse(text, detected);
      return { content: response, language: detected };
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('nav.chat', uiLanguage)}</h1>
        <p className="page-subtitle">{t('chat.subtitle', uiLanguage)}</p>
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

      <ChatInterface
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={onSend}
        placeholder={t('chat.placeholder', chatLanguage)}
        sendLabel={t('chat.send', chatLanguage)}
        ariaLabel="Multilingual chat assistant"
        inputAriaLabel="Type a message to the multilingual chat assistant"
        sendAriaLabel="Send message to assistant"
        messageRole="status"
      />
    </div>
  );
}
