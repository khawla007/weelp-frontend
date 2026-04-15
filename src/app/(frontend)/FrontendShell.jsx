'use client';

import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigationEvents } from '@/hooks/useNavigationEvents';
import { NavigationProgressBar } from '@/app/components/Navigation/NavigationProgressBar';

function NavigationEventsHandler() {
  useNavigationEvents();
  return null;
}

export function FrontendShell({ header, footer, children }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <>
      <Suspense fallback={null}>
        <NavigationEventsHandler />
      </Suspense>
      {header}
      <main className="bg-mainBackground min-h-[90vh] relative">{children}</main>
      {footer}
      <NavigationProgressBar />
    </>
  );
}
