// PROBLEM STATEMENT ALIGNMENT: addresses "Smart Indoor Navigation" —
// chatbot giving natural-language turn-by-turn directions.

/**
 * Navigation Chat page.
 *
 * Chatbot interface for indoor navigation with AI intent parsing,
 * pathfinding, and turn-by-turn directions.
 */

import { t } from '../shared/i18n';
import type { SupportedLanguage } from '../shared/types';
import { useChatMessages } from '../shared/hooks/useChatMessages';
import ChatInterface from '../shared/components/ChatInterface';
import { useNavigationChat } from '../modules/navigation/useNavigationChat';

interface Props {
  language: SupportedLanguage;
}

export default function NavigationChatPage({ language }: Props) {
  const { messages, input, setInput, isLoading, handleSend } = useChatMessages({
    id: '1', role: 'assistant', content: t('chat.welcome', language), timestamp: Date.now()
  });
  const { handleNavigationRequest } = useNavigationChat();

  const onSend = () => {
    handleSend(handleNavigationRequest);
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('nav.navigation', language)}</h1>
        <p className="page-subtitle">Ask for directions to gates, seats, restrooms, food courts, or medical stations</p>
      </header>

      <ChatInterface
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={onSend}
        placeholder={t('chat.placeholder', language)}
        sendLabel={t('chat.send', language)}
        ariaLabel="Navigation chat"
        inputAriaLabel="Ask for directions to gates, seats, restrooms, food courts, or medical stations"
        sendAriaLabel="Send navigation request"
        messageRole="status"
      />
    </div>
  );
}
