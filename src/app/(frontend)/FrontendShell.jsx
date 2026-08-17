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
  const isGoldHome = pathname === '/home-gold';

  useEffect(() => {
    document.body.classList.toggle('home-gold-theme', isGoldHome);

    return () => document.body.classList.remove('home-gold-theme');
  }, [isGoldHome]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className={`relative min-h-screen ${isGoldHome ? 'home-gold-theme' : ''}`} data-weelp-home-variant={isGoldHome ? 'gold' : undefined}>
      <Suspense fallback={null}>
        <NavigationEventsHandler />
      </Suspense>
      {header}
      <main className="relative min-h-[90vh] bg-background">{children}</main>
      {footer}
      <NavigationProgressBar />
    </div>
  );
}
