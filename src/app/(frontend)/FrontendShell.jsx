'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigationEvents } from '@/hooks/useNavigationEvents';
import { NavigationProgressBar } from '@/app/components/Navigation/NavigationProgressBar';

export function FrontendShell({ header, footer, children }) {
  const pathname = usePathname();

  // Initialize navigation event tracking for progress bar
  useNavigationEvents();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <>
      {header}
      <main className="bg-mainBackground min-h-[90vh] relative">{children}</main>
      {footer}
      <NavigationProgressBar />
    </>
  );
}
