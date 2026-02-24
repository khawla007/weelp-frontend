'use client';

import { useNavigationStore } from '@/lib/store/useNavigationStore';
import { useIsClient } from '@/hooks/useIsClient';
import { useEffect, useState, useRef } from 'react';
import UniversalLoader from '@/app/components/Loading/UniversalLoader';

const MIN_DISPLAY_TIME = 3000; // 3 seconds minimum

export default function NavigationLoader() {
  const isClient = useIsClient();
  const isNavigating = useNavigationStore((state) => state.isNavigating);
  const [showLoader, setShowLoader] = useState(false);
  const navigationStartTime = useRef(null);
  const minDelayTimerRef = useRef(null);
  const wasNavigatingRef = useRef(false);

  useEffect(() => {
    console.log('[NavigationLoader] isNavigating:', isNavigating, 'showLoader:', showLoader, 'isClient:', isClient);

    // Track when navigation state changes from false to true (started)
    const navigationJustStarted = isNavigating && !wasNavigatingRef.current;
    wasNavigatingRef.current = isNavigating;

    if (navigationJustStarted) {
      // Navigation started - show loader immediately and record start time
      navigationStartTime.current = Date.now();
      setShowLoader(true);

      // Clear any existing hide timer
      if (minDelayTimerRef.current) {
        clearTimeout(minDelayTimerRef.current);
        minDelayTimerRef.current = null;
      }
    } else if (!isNavigating && navigationStartTime.current !== null) {
      // Navigation ended - check if minimum time has elapsed
      const elapsedTime = Date.now() - navigationStartTime.current;
      const remainingTime = MIN_DISPLAY_TIME - elapsedTime;

      if (remainingTime > 0) {
        // Wait for remaining time before hiding loader
        console.log(`[NavigationLoader] Waiting ${remainingTime}ms before hiding`);
        minDelayTimerRef.current = setTimeout(() => {
          setShowLoader(false);
          navigationStartTime.current = null;
          minDelayTimerRef.current = null;
        }, remainingTime);
      } else {
        // Minimum time already elapsed, hide immediately
        setShowLoader(false);
        navigationStartTime.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (minDelayTimerRef.current) {
        clearTimeout(minDelayTimerRef.current);
      }
    };
  }, [isNavigating, isClient]);

  if (!isClient || !showLoader) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <UniversalLoader />
    </div>
  );
}
