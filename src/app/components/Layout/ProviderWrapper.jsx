'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useIsClient } from '@/hooks/useIsClient';
import { Toaster } from '@/components/ui/toaster';
import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetchers';
import { useNavigationEvents } from '@/hooks/useNavigationEvents';

function NavigationHandler() {
  useNavigationEvents();
  return null;
}

export default function AppProviders({ children, session }) {
  return (
    <SessionProvider session={session}>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: true,
          shouldRetryOnError: false,
        }}
      >
        <Suspense fallback={null}>
          <NavigationHandler />
        </Suspense>
        {children}
        <Toaster />
      </SWRConfig>
    </SessionProvider>
  );
}
