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

  useEffect(() => {
    // Only update when navigation key actually changes
    if (navigationKey !== lastKeyRef.current) {
      if (isNavigating) {
        NProgress.start();
      } else {
        NProgress.done();
      }
      lastKeyRef.current = navigationKey;
    }
  }, [isNavigating, navigationKey]);

  return null;
}
