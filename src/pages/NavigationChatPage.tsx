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
import { parseNavigationIntent } from '../modules/navigation/intentParser';
import { findRoute, resolveLocation, getAllLocations } from '../modules/navigation/stadiumMap';
import { callGemini } from '../shared/geminiClient';
import { useChatMessages } from '../shared/hooks/useChatMessages';
import ChatInterface from '../shared/components/ChatInterface';

interface Props {
  language: SupportedLanguage;
}

export default function NavigationChatPage({ language }: Props) {
  const { messages, input, setInput, isLoading, handleSend } = useChatMessages({
    id: '1', role: 'assistant', content: t('chat.welcome', language), timestamp: Date.now()
  });

  const onSend = () => {
    handleSend(async (text) => {
      const intent = await parseNavigationIntent(text);
      let responseText: string;

      if (intent.type === 'navigation' && intent.to) {
        const fromId = intent.from ?? 'lobby-main';
        const toId = resolveLocation(intent.to) ?? intent.to;
        const route = findRoute(fromId, toId);

        if (route) {
          const totalDist = route.reduce((s, step) => s + step.distance, 0);
          const steps = route
            .map((step, i) => `${i + 1}. ${step.instruction}${step.landmark ? ` (${step.landmark})` : ''}`)
            .join('\n');
          responseText = `🗺️ **Directions** (${totalDist}m total):\n\n${steps}`;
        } else {
          responseText = `I couldn't find a route to "${intent.to}". Please try a different location.`;
        }
      } else if (intent.type === 'facility-search') {
        const locationId = intent.to ? resolveLocation(intent.to) : null;
        if (locationId) {
          const route = findRoute('lobby-main', locationId);
          if (route) {
            const steps = route.map((s, i) => `${i + 1}. ${s.instruction}`).join('\n');
            responseText = `📍 Here are directions:\n\n${steps}`;
          } else {
            responseText = `I found the location but couldn't generate a route. Try asking for a specific destination.`;
          }
        } else {
          responseText = 'I can help you find: gates, restrooms, food courts, medical stations, and specific sections. What are you looking for?';
        }
      } else {
        // General question — use Gemini
        responseText = await callGemini(
          'You are a helpful stadium assistant at FIFA World Cup 2026. Answer questions concisely. Available locations: ' +
            getAllLocations().map((l) => l.name).join(', '),
          text,
        );
      }

      return { content: responseText };
    });
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
