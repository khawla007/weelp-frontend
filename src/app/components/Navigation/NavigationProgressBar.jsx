'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (isNavigating) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isNavigating, navigationKey]);

  return null;
}
