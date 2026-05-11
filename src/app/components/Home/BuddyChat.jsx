'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

const BuddyChat = ({ messages, isThinking, sendMessage, presets }) => {
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    if (typeof node.scrollTo === 'function') {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    } else {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft.trim() || isThinking) return;
    sendMessage(draft);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handlePreset = (preset) => {
    if (isThinking) return;
    sendMessage(preset);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-[#eaeaea] px-4 py-3">
        <span aria-hidden="true" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#588f7a] text-white">
          <Sparkles className="h-4 w-4" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-semibold text-[#18181b]">Buddy — AI Travel Guide</span>
          <span className="text-[12px] font-medium text-emerald-600">Online</span>
        </div>
      </header>

      <div ref={listRef} role="log" aria-live="polite" aria-label="Conversation with Buddy" className="flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 py-4">
        {isEmpty ? (
          <div className="flex h-full flex-col items-start justify-end gap-3">
            <p className="text-[13px] font-medium text-[#52525b]">Try a quick prompt:</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="rounded-full border border-[#eaeaea] bg-white px-3 py-1.5 text-[12px] font-medium text-[#18181b] transition-colors hover:border-[#588f7a] hover:bg-[#588f7a]/5 hover:text-[#4d8069] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((message) => (
              <li key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span
                  className={
                    message.role === 'user'
                      ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-[#588f7a] px-3 py-2 text-[13px] font-medium text-white'
                      : 'max-w-[80%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-[13px] font-medium text-[#18181b]'
                  }
                >
                  {message.text}
                </span>
              </li>
            ))}
            {isThinking && (
              <li className="flex justify-start" aria-label="Buddy is thinking">
                <span className="inline-flex items-center gap-1 rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2.5 text-[#52525b]">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52525b] [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52525b] [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52525b]" />
                </span>
              </li>
            )}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-[#eaeaea] px-3 py-3">
        <label htmlFor="buddy-chat-input" className="sr-only">
          Message Buddy
        </label>
        <textarea
          id="buddy-chat-input"
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Buddy: weekend in Paris…"
          className="max-h-24 min-h-[40px] flex-1 resize-none rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[13px] font-medium text-[#18181b] placeholder:text-[#a1a1aa] focus:border-[#588f7a] focus:outline-none focus:ring-2 focus:ring-[#588f7a]/30"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!draft.trim() || isThinking}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#588f7a] text-white transition-colors hover:bg-[#4d8069] disabled:cursor-not-allowed disabled:bg-[#588f7a]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default BuddyChat;
