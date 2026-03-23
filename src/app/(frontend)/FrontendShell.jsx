'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store/uiStore';
import { NavigationProgressBar } from '@/app/components/Navigation/NavigationProgressBar';

export function FrontendShell({ header, footer, children }) {
  const pathname = usePathname();
  const { stickyHeader } = useUIStore();

  const shellStyle = {
    '--weelp-header-height-mobile': stickyHeader ? '68px' : '118px',
    '--weelp-header-height-desktop': stickyHeader ? '84px' : '142px',
  };

  // Scroll to top on route change (replaces old layout behavior)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div style={shellStyle}>
      {header}
      <main className={`bg-mainBackground ${stickyHeader ? 'pt-[var(--weelp-header-height-mobile)] lg:pt-[var(--weelp-header-height-desktop)]' : ''} min-h-[90vh] relative`}>
        <NavigationProgressBar />
        {children}
      </main>
      {footer}
    </div>
  );
}
