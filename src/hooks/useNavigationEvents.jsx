'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/lib/store/useNavigationStore';

export function useNavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setNavigating, checkAndClearNavigation } = useNavigationStore();

  // Clear navigation state when pathname or searchParams change (navigation completed)
  useEffect(() => {
    checkAndClearNavigation();
  }, [pathname, searchParams, checkAndClearNavigation]);

  useEffect(() => {
    // Intercept all link clicks to trigger progress bar.
    // Uses 'click' instead of 'mousedown' so it works inside Swiper and other
    // libraries that consume mousedown for drag/swipe gestures.
    const handleLinkClick = (e) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      const isInternal = href.startsWith('/') || href.startsWith(window.location.origin);
      if (!isInternal) return;

      const isSamePage = href === pathname || href === `${pathname}${window.location.search}` || href.startsWith('#');
      if (isSamePage) return;

      setNavigating(true);
    };

    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [setNavigating]);
}
