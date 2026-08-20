'use client';

import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

// SSR-safe layout effect (avoids the React warning when rendered on the server).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Reveal-on-scroll wrapper for BELOW-fold content. On the client, sections below
 * the fold hide then fade up when scrolled into view. Reduced-motion users stay
 * fully visible.
 *
 * Default: renders children visible on the server (no-JS safe) and only hides
 * after hydration. Use `initialHidden` for genuinely below-fold sections to
 * render them hidden in the server markup instead — this closes the pre-hydration
 * window where the section would otherwise sit visible-but-static and skip its
 * scroll reveal if the user scrolls in before the JS hydrates.
 *
 * Do NOT use this for above-fold heroes — gating their entrance behind hydration
 * replays the animation late and makes already-visible content blink. Heroes use
 * the CSS-only `.weelp-hero-rise` class instead (see globals.css).
 *
 * @param {object} props
 * @param {string|React.ElementType} [props.as='div'] - element/tag for the reveal root
 * @param {boolean} [props.initialHidden=false] - render 'pending' (hidden) in SSR markup; for below-fold sections
 * @param {number} [props.delay=0] - stagger delay in ms (-> --weelp-motion-delay)
 * @param {number} [props.y=12] - fade-up offset in px (-> --weelp-fade-up-y)
 * @param {number} [props.duration] - animation duration in ms (-> --weelp-motion-duration)
 * @param {boolean} [props.once=true] - disconnect observer after first reveal
 * @param {'lift'|'left'|'right'} [props.variant] - reveal direction. 'lift' opts
 *   into the 40px / 900ms vertical keyframe; 'left' and 'right' use the same
 *   timing with a 40px horizontal entrance.
 * @param {number} [props.stagger] - if set (ms), the root becomes a stagger container:
 *   each direct child is cloned with an inline --weelp-reveal-index, and the CSS
 *   `[data-reveal-cards][data-reveal='shown'] > *` rule fires them in sequence
 *   once the container is in view
 */
const Reveal = ({ as: Tag = 'div', initialHidden = false, delay = 0, y = 12, duration, once = true, variant, stagger, className, style, children, ...rest }) => {
  const ref = useRef(null);
  // null = not yet evaluated (SSR / first paint -> visible). 'pending' | 'shown' after mount.
  // initialHidden seeds 'pending' so the server markup is hidden from first paint.
  const [state, setState] = useState(initialHidden ? 'pending' : null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setState('shown');
      return;
    }

    const rect = el.getBoundingClientRect();
    // Reveal immediately if any part is at/above the viewport bottom — covers
    // above-fold heroes AND scroll-restoration / anchor jumps that land the user
    // mid-page (sections above the viewport must not stay hidden). Only strictly
    // below-fold elements wait for the observer.
    if (rect.top < (window.innerHeight || 0)) {
      setState('shown');
      return;
    }

    setState('pending');
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          // Reveal on intersect, or if a fast scroll carried it above the viewport
          // before the observer sampled the in-view frame.
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            setState('shown');
            if (once) obs.disconnect();
          } else if (!once) {
            setState('pending');
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const mergedStyle = {
    ...style,
    '--weelp-motion-delay': `${delay}ms`,
    '--weelp-fade-up-y': `${y}px`,
    ...(duration ? { '--weelp-motion-duration': `${duration}ms` } : {}),
    ...(stagger ? { '--weelp-reveal-stagger': `${stagger}ms` } : {}),
  };

  const staggered = stagger
    ? Children.map(children, (child, i) =>
        isValidElement(child)
          ? cloneElement(child, {
              style: { ...(child.props.style || {}), '--weelp-reveal-index': i },
            })
          : child,
      )
    : children;

  return (
    // {...rest} first so internal ref / data-reveal attrs always win over any caller-passed props.
    <Tag {...rest} ref={ref} className={className} style={mergedStyle} data-reveal={state === null ? undefined : state} data-reveal-variant={variant} data-reveal-cards={stagger ? '' : undefined}>
      {staggered}
    </Tag>
  );
};

export default Reveal;
