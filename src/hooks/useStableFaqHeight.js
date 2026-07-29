'use client';

import { useLayoutEffect, useRef } from 'react';

const getElementHeight = (element) => element?.getBoundingClientRect().height ?? 0;

export const useStableFaqHeight = ({ enabled, contentSignature }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    if (!enabled) {
      container.style.minHeight = '';
      return undefined;
    }

    let resizeFrame = null;
    let active = true;

    const measure = () => {
      const panels = Array.from(container.querySelectorAll('[data-faq-panel="true"]'));
      const answerHeights = panels.map((panel) => panel.querySelector('[data-faq-answer-content="true"]')?.scrollHeight ?? 0);
      const previousMinHeight = container.style.minHeight;

      container.style.minHeight = '0px';

      const naturalHeight = getElementHeight(container);
      const renderedAnswerHeight = panels.reduce((total, panel) => total + getElementHeight(panel), 0);
      const tallestAnswerHeight = Math.max(0, ...answerHeights);
      const stableHeight = Math.ceil(Math.max(0, naturalHeight - renderedAnswerHeight + tallestAnswerHeight));

      container.style.minHeight = stableHeight > 0 ? `${stableHeight}px` : previousMinHeight;
    };

    const scheduleMeasure = () => {
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        measure();
      });
    };

    measure();
    window.addEventListener('resize', scheduleMeasure);
    document.fonts?.ready.then(() => {
      if (active) {
        scheduleMeasure();
      }
    });

    return () => {
      active = false;
      window.removeEventListener('resize', scheduleMeasure);

      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }

      container.style.minHeight = '';
    };
  }, [contentSignature, enabled]);

  return containerRef;
};
