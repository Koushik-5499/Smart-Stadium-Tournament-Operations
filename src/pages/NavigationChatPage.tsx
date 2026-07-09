// PROBLEM STATEMENT ALIGNMENT: addresses "Smart Indoor Navigation" —
// chatbot giving natural-language turn-by-turn directions.

/**
 * Navigation Chat page.
 *
 * Chatbot interface for indoor navigation with AI intent parsing,
 * pathfinding, and turn-by-turn directions.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { t } from '../shared/i18n';
import type { SupportedLanguage, ChatMessage } from '../shared/types';
import { parseNavigationIntent } from '../modules/navigation/intentParser';
import { findRoute, resolveLocation, getAllLocations } from '../modules/navigation/stadiumMap';
import { callGemini } from '../shared/geminiClient';

interface Props {
  language: SupportedLanguage;
}

export default function NavigationChatPage({ language }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: t('chat.welcome', language), timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
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
      const intent = await parseNavigationIntent(trimmed);
      let responseText = '';

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
          trimmed,
        );
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
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

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('nav.navigation', language)}</h1>
        <p className="page-subtitle">Ask for directions to gates, seats, restrooms, food courts, or medical stations</p>
      </header>

      <div className="chat-container" role="log" aria-label="Navigation chat">
        <div className="chat-messages" aria-live="polite">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.role}`}
              role={msg.role === 'assistant' ? 'status' : undefined}
            >
              {msg.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.content.split('\n').length - 1 && <br />}
                </span>
              ))}
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
          <label htmlFor="nav-chat-input" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            {t('chat.placeholder', language)}
          </label>
          <input
            id="nav-chat-input"
            type="text"
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat.placeholder', language)}
            disabled={isLoading}
            aria-label="Type your navigation question"
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label={t('chat.send', language)}
          >
            {t('chat.send', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
