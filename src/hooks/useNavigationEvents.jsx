'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/lib/store/useNavigationStore';

export function useNavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setNavigating = useNavigationStore((state) => state.setNavigating);
  const navigationTimeoutRef = useRef(null);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    // Clear navigation state when pathname changes (navigation completed)
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      // Small delay to let page render
      setTimeout(() => setNavigating(false), 100);
    }
  }, [pathname, setNavigating]);

  useEffect(() => {
    // Intercept all link clicks
    const handleLinkClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Check if it's an internal link
      const isInternal = href.startsWith('/') || href.startsWith(window.location.origin);
      if (!isInternal) return;

      // Check if it's not just a hash or same page link
      const isSamePage = href === pathname || href === `${pathname}${window.location.search}` || href.startsWith('#');
      if (isSamePage) return;

      // Set navigation state before navigation happens
      isNavigatingRef.current = true;
      setNavigating(true);
      console.log('[Navigation] Link clicked, setting navigating to true:', href);

      // Fallback timeout in case pathname doesn't change
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      navigationTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
        setNavigating(false);
        navigationTimeoutRef.current = null;
        console.log('[Navigation] Timeout fallback, setting navigating to false');
      }, 3000);
    };

    // Add event listener to document
    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [pathname, searchParams, setNavigating]);
}
