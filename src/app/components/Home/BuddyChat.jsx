'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Send, Sparkles } from 'lucide-react';

const TYPE_INTERVAL_MS = 50;

const hasMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

const subscribeReducedMotion = (callback) => {
  if (!hasMatchMedia()) return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
};

const getReducedMotion = () => (hasMatchMedia() ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false);
const getReducedMotionServer = () => false;

const useReducedMotion = () => useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionServer);

const TypewriterText = ({ text, onDone, onTick, reducedMotion }) => {
  const [shown, setShown] = useState(() => (reducedMotion ? text : ''));
  const doneRef = useRef(onDone);
  const tickRef = useRef(onTick);

  useEffect(() => {
    doneRef.current = onDone;
    tickRef.current = onTick;
  });

  useEffect(() => {
    if (reducedMotion) {
      doneRef.current?.();
      return undefined;
    }

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      tickRef.current?.();
      if (i >= text.length) {
        clearInterval(interval);
        doneRef.current?.();
      }
    }, TYPE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [text, reducedMotion]);

  return <span aria-hidden="true">{shown}</span>;
};

const BuddyChat = ({ messages, isThinking, sendMessage, presets }) => {
  const [draft, setDraft] = useState('');
  const [completedIds, setCompletedIds] = useState(() => new Set());
  const reducedMotion = useReducedMotion();
  const listRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const node = listRef.current;
    if (!node) return;
    if (typeof node.scrollTo === 'function') {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    } else {
      node.scrollTop = node.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  const handleTypewriterDone = useCallback((id) => {
    setCompletedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

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
        <span aria-hidden="true" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-weelp-sage-deep text-white">
          <Sparkles className="h-4 w-4" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-semibold text-[#18181b]">Buddy — AI Travel Guide</span>
          <span className="text-[12px] font-medium text-emerald-600">Online</span>
        </div>
      </header>

      <div ref={listRef} role="log" aria-live="polite" aria-busy={isThinking} aria-label="Conversation with Buddy" className="flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 py-4">
        {isEmpty ? (
          <div className="flex h-full flex-col items-start justify-end gap-3">
            <p className="text-[13px] font-medium text-[#52525b]">Try a quick prompt:</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="rounded-full border border-[#eaeaea] bg-white px-3 py-1.5 text-[12px] font-medium text-[#18181b] transition-colors hover:border-weelp-sage-deep hover:bg-weelp-sage-deep/5 hover:text-[#4d8069] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const isAnimating = !isUser && !completedIds.has(message.id);
              return (
                <li key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span
                    className={
                      isUser
                        ? 'max-w-[80%] whitespace-pre-line rounded-2xl rounded-br-sm bg-weelp-sage-deep px-3 py-2 text-[13px] font-medium text-white'
                        : 'max-w-[80%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-[13px] font-medium text-[#18181b]'
                    }
                  >
                    {isUser ? (
                      message.text
                    ) : isAnimating ? (
                      <>
                        <TypewriterText text={message.text} reducedMotion={reducedMotion} onTick={scrollToBottom} onDone={() => handleTypewriterDone(message.id)} />
                        <span className="sr-only">{message.text}</span>
                      </>
                    ) : (
                      message.text
                    )}
                  </span>
                </li>
              );
            })}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-[#eaeaea] px-3 py-3 sm:flex-row sm:items-end">
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
          className="max-h-24 min-h-[40px] w-full flex-1 resize-none rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[13px] font-medium text-[#18181b] placeholder:text-[#a1a1aa] focus:border-weelp-sage-deep focus:outline-none focus:ring-2 focus:ring-weelp-sage-deep/30"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!draft.trim() || isThinking}
          className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-lg bg-weelp-sage-deep text-white transition-colors hover:bg-[#4d8069] disabled:cursor-not-allowed disabled:bg-weelp-sage-deep/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 sm:w-10"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default BuddyChat;
