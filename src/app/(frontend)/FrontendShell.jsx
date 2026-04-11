'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function FrontendShell({ header, footer, children }) {
  const pathname = usePathname();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <>
      {header}
      <main className="bg-mainBackground min-h-[90vh] relative">{children}</main>
      {footer}
    </>
  );
}
