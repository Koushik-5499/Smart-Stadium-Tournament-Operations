import { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

interface Props {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  onInputChange: (val: string) => void;
  onSend: () => void;
  placeholder: string;
  sendLabel: string;
  ariaLabel: string;
  inputAriaLabel?: string;
  sendAriaLabel?: string;
  messageRole?: string;
}

export default function ChatInterface({
  messages,
  input,
  isLoading,
  onInputChange,
  onSend,
  placeholder,
  sendLabel,
  ariaLabel,
  inputAriaLabel,
  sendAriaLabel,
  messageRole,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="chat-container" role="log" aria-label={ariaLabel}>
      <div className="chat-messages" aria-live="polite">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role}`}
            role={msg.role === 'assistant' ? (messageRole || 'status') : undefined}
          >
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
        <label htmlFor="chat-interface-input" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          {placeholder}
        </label>
        <input
          id="chat-interface-input"
          type="text"
          className="form-input"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder={placeholder}
          disabled={isLoading}
          aria-label={inputAriaLabel || placeholder}
        />
        <button
          className="btn btn-primary"
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          aria-label={sendAriaLabel || sendLabel}
        >
          {sendLabel}
        </button>
      </div>
    </div>
  );
}
