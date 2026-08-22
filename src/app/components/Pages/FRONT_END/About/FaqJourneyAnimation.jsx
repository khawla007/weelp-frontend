'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AboutPage.module.css';

export const DESKTOP_ROAD_PATH = 'M112 488C326 370 456 488 671 399C873 316 998 422 1185 377C1257 342 1310 355 1360 395';
export const COMPACT_ROAD_PATH = 'M585 474C680 426 737 456 802 420C846 396 879 393 900 395';

const JourneyCar = () => (
  <g transform="translate(-18 -11)">
    <path className={styles.faqJourneyCarBody} d="M3 8h7l6-7h14l7 7h4c4 0 7 3 7 7v5H0v-5c0-4 1-7 3-7Z" />
    <path className={styles.faqJourneyCarWindow} d="M14 8 19 3h9l5 5Z" />
    <circle className={styles.faqJourneyCarWheel} cx="11" cy="21" r="5" />
    <circle className={styles.faqJourneyCarWheel} cx="38" cy="21" r="5" />
  </g>
);

const JourneyComposition = ({ variant, path, pinX }) => {
  const isDesktop = variant === 'desktop';
  const maskId = `faq-journey-road-mask-${variant}`;

  return (
    <g className={isDesktop ? styles.faqJourneyCompositionDesktop : styles.faqJourneyCompositionCompact}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="560">
          <path data-testid="about-faq-journey-road-reveal" className={styles.faqJourneyRoadReveal} pathLength="1" d={path} />
        </mask>
      </defs>
      <g data-testid="about-faq-journey-road" mask={`url(#${maskId})`}>
        <path className={styles.faqJourneyRoadEdge} d={path} />
        <path className={styles.faqJourneyRoadSurface} d={path} />
        <path className={styles.faqJourneyRoadDivider} pathLength="1" d={path} />
      </g>
      <g data-testid={`about-faq-journey-pin-${variant}`} data-journey-element="pin" transform={`translate(${pinX} 273)`}>
        <g className={styles.faqJourneyPinPulse}>
          <path className={styles.faqJourneyPin} d="M0 0c-24 0-43 19-43 43 0 35 43 79 43 79s43-44 43-79C43 19 24 0 0 0Z" />
          <circle className={styles.faqJourneyPinCenter} cx="0" cy="42" r="14" />
        </g>
      </g>
      <g
        data-variant={variant}
        data-testid={`about-faq-journey-car-${variant === 'desktop' ? 'desktop' : 'compact'}`}
        data-journey-element="car"
        className={styles.faqJourneyCar}
        style={{ '--faq-journey-car-path': `path("${path}")` }}
      >
        <JourneyCar />
      </g>
    </g>
  );
};

const FaqJourneyAnimation = () => {
  const sceneRef = useRef(null);
  const [motionState, setMotionState] = useState('static');

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || typeof IntersectionObserver === 'undefined') return undefined;

    let active = true;
    let observer;

    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!active) return;
          setMotionState(entry?.isIntersecting ? 'running' : 'paused');
        },
        {
          rootMargin: '160px 0px',
          threshold: 0.05,
        },
      );
      observer.observe(scene);
    } catch {
      observer?.disconnect();
      return undefined;
    }

    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={sceneRef} data-testid="about-faq-background-image" data-motion={motionState} className={`${styles.faqImage} ${styles.faqJourney}`} aria-hidden="true">
      <svg data-testid="about-faq-journey-svg" className={styles.faqJourneySvg} viewBox="0 0 1600 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <rect className={styles.faqJourneySky} width="1600" height="560" />
        <circle className={styles.faqJourneySun} cx="1340" cy="105" r="58" />
        <g className={styles.faqJourneyCloud}>
          <ellipse cx="760" cy="118" rx="78" ry="25" />
          <circle cx="720" cy="103" r="31" />
          <circle cx="780" cy="94" r="40" />
        </g>
        <path className={styles.faqJourneyMountainBack} d="M0 402 190 208 350 330 600 128 830 332 1075 184 1320 340 1600 176 1600 560 0 560Z" />
        <path className={styles.faqJourneyMountainMid} d="M0 454 250 304 470 408 750 246 1010 410 1250 278 1600 438 1600 560 0 560Z" />
        <path className={styles.faqJourneyGround} d="M0 432C250 378 420 486 665 420c232-62 386 59 565 5 135-41 248-27 370 15v120H0Z" />
        <JourneyComposition variant="desktop" path={DESKTOP_ROAD_PATH} pinX={1360} />
        <JourneyComposition variant="compact" path={COMPACT_ROAD_PATH} pinX={900} />
      </svg>
    </div>
  );
};

export default FaqJourneyAnimation;
