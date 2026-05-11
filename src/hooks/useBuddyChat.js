'use client';

import { useCallback, useRef, useState } from 'react';
import { mockBuddyRespond } from '@/lib/buddy/mockResponder';

const PRESETS = ['Weekend in Paris', '3 days in Tokyo', 'Romantic Rome'];

export default function useBuddyChat() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const idRef = useRef(0);

  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  const sendMessage = useCallback(async (rawText) => {
    const text = rawText?.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
    setIsThinking(true);

    const respondPromise = mockBuddyRespond(text);
    const delay = new Promise((resolve) => setTimeout(resolve, 600));
    const [response] = await Promise.all([respondPromise, delay]);

    setMessages((prev) => [...prev, { id: nextId(), role: 'buddy', text: response.reply }]);
    setIsThinking(false);
  }, []);

  return { messages, isThinking, sendMessage, presets: PRESETS };
}
