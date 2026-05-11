'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { mockBuddyRespond } from '@/lib/buddy/mockResponder';
import { realBuddyRespond } from '@/lib/buddy/realResponder';

const PRESETS = ['Weekend in Paris', '3 days in Tokyo', 'Iceland ring road'];

const EMPTY_PAYLOAD = {
  markers: [],
  route: null,
  fitBounds: false,
  intent: null,
};

function shouldUseMock() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('mock') === '1';
}

export default function useBuddyChat() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [lastPayload, setLastPayload] = useState(EMPTY_PAYLOAD);
  const idRef = useRef(0);
  const historyRef = useRef([]);

  const respond = useMemo(() => (shouldUseMock() ? mockBuddyRespond : realBuddyRespond), []);

  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  const sendMessage = useCallback(
    async (rawText) => {
      const text = rawText?.trim();
      if (!text) return;

      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
      setIsThinking(true);

      const respondPromise = respond(text, historyRef.current);
      const delay = new Promise((resolve) => setTimeout(resolve, 600));
      const [response] = await Promise.all([respondPromise, delay]);

      historyRef.current = [...historyRef.current, { role: 'user', text }, { role: 'buddy', text: response.reply }].slice(-20);

      setMessages((prev) => [...prev, { id: nextId(), role: 'buddy', text: response.reply }]);
      setLastPayload({
        markers: response.markers ?? [],
        route: response.route ?? null,
        fitBounds: Boolean(response.fit_bounds),
        intent: response.intent ?? null,
      });
      setIsThinking(false);
    },
    [respond],
  );

  return { messages, isThinking, sendMessage, presets: PRESETS, lastPayload };
}
