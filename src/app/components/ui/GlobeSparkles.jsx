'use client';

import { useEffect, useState } from 'react';

const isJsdom = () => typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('jsdom');
const prefersReducedMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PARTICLE_OPTIONS = {
  fullScreen: {
    enable: false,
  },
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  detectRetina: true,
  particles: {
    color: {
      value: ['#558e7b', '#6fa996', '#8fc2b2'],
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'out',
      },
      random: true,
      speed: { min: 0.08, max: 0.35 },
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 520,
      },
      value: 44,
    },
    opacity: {
      animation: {
        enable: true,
        speed: 0.7,
        sync: false,
      },
      value: { min: 0.28, max: 0.9 },
    },
    shape: {
      type: 'circle',
    },
    size: {
      animation: {
        enable: true,
        speed: 1.2,
        sync: false,
      },
      value: { min: 0.6, max: 2.4 },
    },
  },
};

const GlobeSparkles = ({ className = '' }) => {
  const [ParticlesComponent, setParticlesComponent] = useState(null);

  useEffect(() => {
    if (isJsdom() || prefersReducedMotion()) return undefined;

    let cancelled = false;

    Promise.all([import('@tsparticles/react'), import('@tsparticles/slim')])
      .then(async ([particlesModule, slimModule]) => {
        if (cancelled) return;

        await particlesModule.initParticlesEngine(async (engine) => {
          await slimModule.loadSlim(engine);
        });

        if (!cancelled) {
          setParticlesComponent(() => particlesModule.default);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setParticlesComponent(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span data-personalised-sparkles className={`pointer-events-none ${className}`}>
      <span className="weelp-sparkles-fallback" />
      {ParticlesComponent ? <ParticlesComponent id="personalised-globe-sparkles" className="absolute inset-0" options={PARTICLE_OPTIONS} /> : null}
    </span>
  );
};

export default GlobeSparkles;
