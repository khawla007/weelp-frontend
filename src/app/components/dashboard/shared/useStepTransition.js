'use client';
import { useEffect, useRef, useState } from 'react';

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
 * @param {number} currentStep - the form's current step (the hook watches this to replay)
 * @returns {{ stepRef: React.RefObject, direction: number, goWithDirection: (next:number, current:number, setCurrent:Function)=>void }}
 */
export function useStepTransition(currentStep) {
  const [direction, setDirection] = useState(1);
  const stepRef = useRef(null);
  const hasMounted = useRef(false);

  const goWithDirection = (next, current, setCurrent) => {
    setDirection(next >= current ? 1 : -1);
    setCurrent(next);
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const el = stepRef.current;
    if (!el) return;
    const slide = direction >= 0 ? STEP_SLIDE.forward : STEP_SLIDE.back;
    const enterClasses = ['animate-in', 'fade-in-0', 'duration-200', 'motion-reduce:animate-none', slide];
    el.classList.remove(...enterClasses, STEP_SLIDE.forward, STEP_SLIDE.back);
    void el.offsetWidth;
    el.classList.add(...enterClasses);
  }, [currentStep, direction]);

  return { stepRef, direction, goWithDirection };
}
