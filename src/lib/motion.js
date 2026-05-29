// Shared motion helpers.

/** True when the user has requested reduced motion. Safe to call on the server. */
export const prefersReducedMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
