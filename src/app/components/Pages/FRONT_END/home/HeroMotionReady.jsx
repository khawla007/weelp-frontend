'use client';

import { useEffect, useRef } from 'react';

const HeroMotionReady = () => {
  const controllerRef = useRef(null);

  useEffect(() => {
    const hero = controllerRef.current?.closest('[data-home-hero]');
    if (!hero) return undefined;

    let firstFrame = null;
    let secondFrame = null;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        hero.setAttribute('data-home-hero-motion', 'ready');
      });
    });

    return () => {
      if (firstFrame !== null) window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== null) window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return <span ref={controllerRef} data-home-hero-motion-controller aria-hidden="true" hidden />;
};

export default HeroMotionReady;
