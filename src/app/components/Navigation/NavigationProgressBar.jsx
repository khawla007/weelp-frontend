'use client';

import { useEffect, useRef } from 'react';
import NProgress from 'nprogress';
import { useNavigationStore } from '@/lib/store/useNavigationStore';

// Configure NProgress - no spinner, just the bar
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
});

export function NavigationProgressBar() {
  const isNavigating = useNavigationStore((state) => state.isNavigating);
  const navigationKey = useNavigationStore((state) => state.navigationKey);
  const lastKeyRef = useRef(navigationKey);
  const wasNavigatingRef = useRef(false);

  useEffect(() => {
    // Detect key changes (navigation start)
    const keyChanged = navigationKey !== lastKeyRef.current;

    // Detect navigation state transitions
    const justStarted = isNavigating && !wasNavigatingRef.current;
    const justEnded = !isNavigating && wasNavigatingRef.current;

    if (keyChanged || justStarted || justEnded) {
      if (isNavigating) {
        NProgress.start();
      } else {
        NProgress.done();
      }
      lastKeyRef.current = navigationKey;
    }
    wasNavigatingRef.current = isNavigating;
  }, [isNavigating, navigationKey]);

  return null;
}
