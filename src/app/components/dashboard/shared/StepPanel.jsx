'use client';
import { cn } from '@/lib/utils';

/**
 * StepPanel — wraps the swapping step content of a multi-step wizard and plays the
 * shared enter animation (see useStepTransition). React owns these steady classes so a
 * future className edit can't silently kill the animation; the hook only *replays* them.
 *
 * IMPORTANT: do NOT put a React `key` on this element. A `display:none`-toggled step may
 * live inside and must keep its local state across step changes — the hook replays the
 * animation via reflow, not by remounting.
 *
 * @param {React.RefObject} stepRef - the ref returned by useStepTransition
 */
export function StepPanel({ stepRef, className, children, ...props }) {
  return (
    <div ref={stepRef} className={cn('animate-in', 'fade-in-0', 'duration-200', 'motion-reduce:animate-none', className)} {...props}>
      {children}
    </div>
  );
}

export default StepPanel;
