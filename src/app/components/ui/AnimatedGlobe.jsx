'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import GlobeSparkles from '@/app/components/ui/GlobeSparkles';

const CANVAS_SIZE = 1000;
const ROTATION_SPEED = 0.0065;
const DEFAULT_STAGE_CLASS = 'pointer-events-none absolute inset-0 block overflow-hidden bg-white select-none';
const DEFAULT_SHELL_CLASS = 'pointer-events-none absolute bottom-[-86px] right-[-18px] z-[3] size-[507px] translate-x-[10%] translate-y-[20%] md:size-[611px] lg:size-[702px]';

const prefersReducedMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const AnimatedGlobe = ({ activationMediaQuery, stageClassName = '', shellClassName = '', showSparkles = true, showLeftSparkles = true, showVignette = true }) => {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(!activationMediaQuery);

  useEffect(() => {
    if (!activationMediaQuery) {
      setIsActive(true);
      return undefined;
    }

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setIsActive(false);
      return undefined;
    }

    const mediaQueryList = window.matchMedia(activationMediaQuery);
    const updateActiveState = () => setIsActive(mediaQueryList.matches);

    updateActiveState();
    mediaQueryList.addEventListener?.('change', updateActiveState);
    mediaQueryList.addListener?.(updateActiveState);

    return () => {
      mediaQueryList.removeEventListener?.('change', updateActiveState);
      mediaQueryList.removeListener?.(updateActiveState);
    };
  }, [activationMediaQuery]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!isActive || !canvas || prefersReducedMotion()) {
      return undefined;
    }

    let cancelled = false;
    let frame;
    let globe;
    let phi = 0;

    import('cobe')
      .then(({ default: createGlobe }) => {
        if (cancelled) return;

        globe = createGlobe(canvas, {
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          phi,
          theta: 0.25,
          dark: 0,
          diffuse: 1.35,
          mapSamples: 40000,
          mapBrightness: 2.4,
          mapBaseBrightness: 0.015,
          baseColor: [1, 1, 1],
          markerColor: [0.3333, 0.5569, 0.4824],
          glowColor: [1, 1, 1],
          scale: 1.1,
          offset: [0, 0],
          markers: [
            { location: [25.2048, 55.2708], size: 0.035 },
            { location: [51.5072, -0.1276], size: 0.03 },
            { location: [1.3521, 103.8198], size: 0.025 },
            { location: [40.7128, -74.006], size: 0.035 },
            { location: [35.6762, 139.6503], size: 0.03 },
          ],
        });

        const rotate = () => {
          if (cancelled) return;

          globe?.update({
            phi,
            theta: 0.25,
          });

          phi += ROTATION_SPEED;
          frame = window.requestAnimationFrame(rotate);
        };

        rotate();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      globe?.destroy();
    };
  }, [isActive]);

  return (
    <span data-animated-globe data-animated-globe-activation-query={activationMediaQuery} data-personalised-globe-stage aria-hidden="true" className={cn(DEFAULT_STAGE_CLASS, stageClassName)}>
      {showSparkles && isActive ? <GlobeSparkles className="absolute inset-0 z-[1]" /> : null}
      {showLeftSparkles ? <span data-personalised-left-sparkles className="personalised-left-sparkles" /> : null}
      <span data-personalised-cobe-shell className={cn(DEFAULT_SHELL_CLASS, shellClassName)}>
        <canvas data-personalised-cobe-globe ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="personalised-cobe-globe size-full" />
        <span className="pointer-events-none absolute inset-[7.5%] rounded-full border border-black/10" />
      </span>
      {showVignette ? <span className="personalised-globe-vignette" /> : null}
    </span>
  );
};

export default AnimatedGlobe;
