'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import GlobeSparkles from '@/app/components/ui/GlobeSparkles';

const CANVAS_SIZE = 1000;
const ROTATION_SPEED = 0.0065;
const GLOBE_THETA = 0.25;
const FLIGHT_DURATION = 5800;
const SVG_CENTER = 50;
const GLOBE_SCALE = 1.1;
const MARKER_ELEVATION = 0.05;
const SURFACE_RADIUS = 0.8 + MARKER_ELEVATION;
const ROUTE_STEPS = 18;
const DEFAULT_STAGE_CLASS = 'pointer-events-none absolute inset-0 block overflow-hidden bg-white select-none';
const DEFAULT_SHELL_CLASS = 'pointer-events-none absolute bottom-[-86px] right-[-18px] z-[3] size-[507px] translate-x-[10%] translate-y-[20%] md:size-[611px] lg:size-[702px]';
const GLOBE_MARKERS = [
  { location: [25.2048, 55.2708], size: 0.035 },
  { location: [51.5072, -0.1276], size: 0.03 },
  { location: [1.3521, 103.8198], size: 0.025 },
  { location: [40.7128, -74.006], size: 0.035 },
  { location: [35.6762, 139.6503], size: 0.03 },
];
const FLIGHT_START = GLOBE_MARKERS[0].location;
const FLIGHT_END = GLOBE_MARKERS[3].location;

const prefersReducedMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const toRadians = (value) => (value * Math.PI) / 180;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const locationToVector = ([lat, lng]) => {
  const latRad = toRadians(lat);
  const lngRad = toRadians(lng) - Math.PI;
  const cosLat = Math.cos(latRad);

  return [-cosLat * Math.cos(lngRad), Math.sin(latRad), cosLat * Math.sin(lngRad)];
};

const slerpVector = (from, to, progress) => {
  const dot = clamp(from[0] * to[0] + from[1] * to[1] + from[2] * to[2], -1, 1);
  const omega = Math.acos(dot);

  if (omega < 0.0001) return from;

  const sinOmega = Math.sin(omega);
  const fromScale = Math.sin((1 - progress) * omega) / sinOmega;
  const toScale = Math.sin(progress * omega) / sinOmega;

  return [from[0] * fromScale + to[0] * toScale, from[1] * fromScale + to[1] * toScale, from[2] * fromScale + to[2] * toScale];
};

const projectVector = (vector, phi, theta = GLOBE_THETA) => {
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const elevated = vector.map((axis) => axis * SURFACE_RADIUS);
  const projectedX = cosPhi * elevated[0] + sinPhi * elevated[2];
  const projectedY = sinPhi * sinTheta * elevated[0] + cosTheta * elevated[1] - cosPhi * sinTheta * elevated[2];
  const depth = -sinPhi * cosTheta * elevated[0] + sinTheta * elevated[1] + cosPhi * cosTheta * elevated[2];

  return {
    x: SVG_CENTER + SVG_CENTER * projectedX * GLOBE_SCALE,
    y: SVG_CENTER - SVG_CENTER * projectedY * GLOBE_SCALE,
    visible: depth >= 0 || projectedX * projectedX + projectedY * projectedY >= 0.64,
  };
};

const updateFlightOverlay = ({ pathElement, planeElement, staticPlaneElement, phi, progress }) => {
  if (!pathElement || !planeElement || !staticPlaneElement) return;

  const start = locationToVector(FLIGHT_START);
  const end = locationToVector(FLIGHT_END);
  const route = Array.from({ length: ROUTE_STEPS + 1 }, (_, index) => projectVector(slerpVector(start, end, index / ROUTE_STEPS), phi));
  const pathData = route.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  const plane = projectVector(slerpVector(start, end, progress), phi);
  const planeNext = projectVector(slerpVector(start, end, Math.min(progress + 0.012, 1)), phi);
  const planeAngle = (Math.atan2(planeNext.y - plane.y, planeNext.x - plane.x) * 180) / Math.PI + 90;
  const planeVisibility = plane.visible ? 1 : 0.18;

  pathElement.setAttribute('d', pathData);
  pathElement.style.opacity = route.some((point) => point.visible) ? '1' : '0.18';
  planeElement.setAttribute('transform', `translate(${plane.x.toFixed(2)} ${plane.y.toFixed(2)}) rotate(${planeAngle.toFixed(2)})`);
  planeElement.style.opacity = String(planeVisibility);
  staticPlaneElement.setAttribute('transform', `translate(${plane.x.toFixed(2)} ${plane.y.toFixed(2)}) rotate(${planeAngle.toFixed(2)})`);
  staticPlaneElement.style.opacity = String(planeVisibility);
};

const AnimatedGlobe = ({ activationMediaQuery, stageClassName = '', shellClassName = '', showSparkles = true, showLeftSparkles = true, showVignette = true }) => {
  const canvasRef = useRef(null);
  const flightPathRef = useRef(null);
  const flightPlaneRef = useRef(null);
  const staticFlightPlaneRef = useRef(null);
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

    if (!isActive || !canvas) {
      return undefined;
    }

    let cancelled = false;
    let frame;
    let globe;
    let phi = 0;
    const reducedMotion = prefersReducedMotion();
    const flightElements = {
      pathElement: flightPathRef.current,
      planeElement: flightPlaneRef.current,
      staticPlaneElement: staticFlightPlaneRef.current,
    };

    if (reducedMotion) {
      updateFlightOverlay({ ...flightElements, phi, progress: 0.72 });
      return undefined;
    }

    import('cobe')
      .then(({ default: createGlobe }) => {
        if (cancelled) return;

        globe = createGlobe(canvas, {
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          phi,
          theta: GLOBE_THETA,
          dark: 0,
          diffuse: 1.35,
          mapSamples: 40000,
          mapBrightness: 2.4,
          mapBaseBrightness: 0.015,
          baseColor: [1, 1, 1],
          markerColor: [0.3333, 0.5569, 0.4824],
          glowColor: [1, 1, 1],
          scale: GLOBE_SCALE,
          offset: [0, 0],
          markerElevation: MARKER_ELEVATION,
          markers: GLOBE_MARKERS,
        });

        const rotate = () => {
          if (cancelled) return;

          globe?.update({
            phi,
            theta: GLOBE_THETA,
          });

          updateFlightOverlay({
            ...flightElements,
            phi,
            progress: (performance.now() % FLIGHT_DURATION) / FLIGHT_DURATION,
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
        <svg data-personalised-flight aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="personalised-flight">
          <path ref={flightPathRef} data-personalised-flight-path d="M 24 63 L 76 47" className="personalised-flight-path" />
          <g ref={staticFlightPlaneRef} data-personalised-flight-static-plane className="personalised-flight-plane-static">
            <svg viewBox="0 0 48 48" className="personalised-flight-plane personalised-flight-boeing" x="-3" y="-3" width="6" height="6">
              <path
                d="M24 4c2.2 0 4 1.8 4 4v11.2l15 8.2v4.5l-15-3.4v8.2l5.4 4v3.1L24 41.5l-9.4 2.3v-3.1l5.4-4v-8.2L5 31.9v-4.5l15-8.2V8c0-2.2 1.8-4 4-4Z"
                fill="#ffffff"
                stroke="#111111"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <path d="M24 8v29.5" stroke="#111111" strokeWidth="0.9" strokeLinecap="round" />
            </svg>
          </g>
          <g ref={flightPlaneRef} data-personalised-flight-motion className="personalised-flight-plane-motion">
            <svg data-personalised-flight-plane viewBox="0 0 48 48" className="personalised-flight-plane personalised-flight-boeing" x="-3" y="-3" width="6" height="6">
              <path
                d="M24 4c2.2 0 4 1.8 4 4v11.2l15 8.2v4.5l-15-3.4v8.2l5.4 4v3.1L24 41.5l-9.4 2.3v-3.1l5.4-4v-8.2L5 31.9v-4.5l15-8.2V8c0-2.2 1.8-4 4-4Z"
                fill="#ffffff"
                stroke="#111111"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <path d="M24 8v29.5" stroke="#111111" strokeWidth="0.9" strokeLinecap="round" />
            </svg>
          </g>
        </svg>
      </span>
      {showVignette ? <span className="personalised-globe-vignette" /> : null}
    </span>
  );
};

export default AnimatedGlobe;
