'use client';
import { useEffect, useRef } from 'react';

// Single source for the directional slide classes so forward/back can't drift apart.
export const STEP_SLIDE = { forward: 'slide-in-from-right-2', back: 'slide-in-from-left-2' };

/**
 * useStepTransition — direction-aware replay of a CSS enter animation on step change,
 * generalized from the §13 creator-itinerary-form pattern.
 *
 * The form keeps owning its `currentStep` state. Call `goWithDirection(next, current, setCurrent)`
 * instead of `setCurrentStep(next)` so the hook can record forward(+1)/back(-1) direction first.
 * Attach the returned `stepRef` to the element that wraps the swapping step content (see <StepPanel>).
 *
 * No React key is used to replay — a `display:none`-toggled step inside the wrapper must keep
 * its local state, so we restart the CSS animation imperatively (strip classes, force reflow,
 * re-add). First paint fades only; the directional slide is added on real step changes.
 *
 * Reduced motion is handled by the `motion-reduce:animate-none` class on the wrapper.
 *
 * Direction is kept in a ref, not state: it is only read by the replay effect, and keying
 * the effect on `currentStep` alone means clicking the already-active step tab (a no-op step
 * change) never replays the slide — even if the would-be direction differs from last time.
 *
 * @param {number} currentStep - the form's current step (the hook watches this to replay)
 * @param {{ scrollRef?: React.RefObject }} options - optional top target to reveal on step change
 * @returns {{ stepRef: React.RefObject, goWithDirection: (next:number, current:number, setCurrent:Function)=>void }}
 */
export function useStepTransition(currentStep, options = {}) {
  const stepRef = useRef(null);
  const hasMounted = useRef(false);
  const frameRef = useRef(null);
  const { scrollRef } = options;
  // +1 advancing, -1 going back. A ref (not state) so it can't independently trigger the
  // replay effect — only a real `currentStep` change replays.
  const directionRef = useRef(1);

  const goWithDirection = (next, current, setCurrent) => {
    directionRef.current = next >= current ? 1 : -1;
    setCurrent(next);
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const el = stepRef.current;
    if (!el) return;
    const slide = directionRef.current >= 0 ? STEP_SLIDE.forward : STEP_SLIDE.back;
    const enterClasses = ['animate-in', 'fade-in-0', 'duration-200', 'motion-reduce:animate-none', slide];
    el.classList.remove(...enterClasses, STEP_SLIDE.forward, STEP_SLIDE.back);
    void el.offsetWidth;
    el.classList.add(...enterClasses);

    if (scrollRef?.current) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(() => {
        scrollRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        frameRef.current = null;
      });
    }
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return { stepRef, goWithDirection };
}
