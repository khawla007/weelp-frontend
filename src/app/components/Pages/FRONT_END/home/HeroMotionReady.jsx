'use client';

import { useEffect, useRef } from 'react';

const MOTION_SETTLE_DELAY_MS = 150;
const MOTION_FALLBACK_DEADLINE_MS = 5000;
const MOTION_FALLBACK_ANIMATION = 'weelpHomeHeroMotionFallback';

const HeroMotionReady = () => {
  const controllerRef = useRef(null);

  useEffect(() => {
    const hero = controllerRef.current?.closest('[data-home-hero]');
    if (!hero) return undefined;

    let cancelled = false;
    let fallbackTimer;
    let settleTimer;
    let firstFrame;
    let secondFrame;

    const startMotion = () => {
      Promise.resolve(document.fonts?.ready).then(() => {
        if (cancelled || hero.getAttribute('data-home-hero-motion') !== 'pending') return;

        settleTimer = window.setTimeout(() => {
          firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(() => {
              if (!cancelled && hero.getAttribute('data-home-hero-motion') === 'pending') {
                window.clearTimeout(fallbackTimer);
                hero.removeEventListener('animationend', applyFallback);
                hero.setAttribute('data-home-hero-motion', 'ready');
              }
            });
          });
        }, MOTION_SETTLE_DELAY_MS);
      });
    };

    function applyFallback(event) {
      if (event?.animationName && event.animationName !== MOTION_FALLBACK_ANIMATION) return;
      if (!cancelled && hero.getAttribute('data-home-hero-motion') === 'pending') hero.setAttribute('data-home-hero-motion', 'fallback');
    }

    const fallbackAlreadyFinished = hero.getAnimations?.({ subtree: true }).some((animation) => animation.animationName === MOTION_FALLBACK_ANIMATION && animation.playState === 'finished');
    hero.addEventListener('animationend', applyFallback);
    if (fallbackAlreadyFinished) applyFallback();
    else fallbackTimer = window.setTimeout(applyFallback, MOTION_FALLBACK_DEADLINE_MS);

    if (document.readyState === 'complete') startMotion();
    else window.addEventListener('load', startMotion, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', startMotion);
      hero.removeEventListener('animationend', applyFallback);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      if (settleTimer) window.clearTimeout(settleTimer);
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return <span ref={controllerRef} data-home-hero-motion-controller aria-hidden="true" hidden />;
};

export default HeroMotionReady;
