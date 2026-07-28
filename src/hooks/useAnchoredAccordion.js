'use client';

import { useEffect, useRef, useState } from 'react';

const FAQ_ANCHOR_DURATION_MS = 350;

export const createAccordionItemKeys = (items, getBaseKey) => {
  const occurrences = new Map();

  return items.map((item) => {
    const baseKey = String(getBaseKey(item));
    const occurrence = occurrences.get(baseKey) ?? 0;
    occurrences.set(baseKey, occurrence + 1);
    return `${baseKey}:${occurrence}`;
  });
};

export const useAnchoredAccordion = (itemKeys, initialOpenIndex = null) => {
  const signature = JSON.stringify(itemKeys);
  const initialOpenKey = itemKeys[initialOpenIndex] ?? null;
  const [accordionState, setAccordionState] = useState(() => ({
    signature,
    openKey: initialOpenKey,
  }));
  const anchorFrameRef = useRef(null);
  let openKey = accordionState.openKey;

  if (accordionState.signature !== signature) {
    openKey = accordionState.openKey === null || itemKeys.includes(accordionState.openKey) ? accordionState.openKey : initialOpenKey;
    setAccordionState({ signature, openKey });
  }

  const openIndex = itemKeys.indexOf(openKey);

  useEffect(
    () => () => {
      if (anchorFrameRef.current !== null) {
        window.cancelAnimationFrame(anchorFrameRef.current);
        anchorFrameRef.current = null;
      }
    },
    [signature],
  );

  const handleToggle = (index, trigger) => {
    if (anchorFrameRef.current !== null) {
      window.cancelAnimationFrame(anchorFrameRef.current);
      anchorFrameRef.current = null;
    }

    const itemKey = itemKeys[index];
    const shouldAnchorTrigger = openIndex >= 0 && index > openIndex;
    const anchorTop = shouldAnchorTrigger ? trigger.getBoundingClientRect().top : null;
    const startedAt = performance.now();
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    setAccordionState((currentState) => ({
      signature,
      openKey: currentState.signature === signature && currentState.openKey === itemKey ? null : itemKey,
    }));

    if (!shouldAnchorTrigger) {
      return;
    }

    const keepTriggerAnchored = () => {
      if (!trigger.isConnected) {
        anchorFrameRef.current = null;
        return;
      }

      const topDelta = trigger.getBoundingClientRect().top - anchorTop;

      if (Math.abs(topDelta) > 0.5) {
        window.scrollBy({ top: topDelta, left: 0, behavior: 'instant' });
      }

      if (!prefersReducedMotion && performance.now() - startedAt < FAQ_ANCHOR_DURATION_MS) {
        anchorFrameRef.current = window.requestAnimationFrame(keepTriggerAnchored);
      } else {
        anchorFrameRef.current = null;
      }
    };

    anchorFrameRef.current = window.requestAnimationFrame(keepTriggerAnchored);
  };

  return [openIndex, handleToggle];
};
