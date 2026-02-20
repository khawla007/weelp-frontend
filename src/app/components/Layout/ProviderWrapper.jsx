'use client';

import { SessionProvider } from 'next-auth/react';
import { useIsClient } from '@/hooks/useIsClient';
import { Toaster } from '@/components/ui/toaster';
import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetchers';
import UniversalLoader from '@/app/components/Loading/UniversalLoader';
import { useNavigationEvents } from '@/hooks/useNavigationEvents';
import NavigationLoader from '@/app/components/Navigation/NavigationLoader';

export default function AppProviders({ children, session }) {
  const isClient = useIsClient();

  // Mount global navigation events hook to intercept all link clicks
  useNavigationEvents();

  if (!isClient) {
    return <UniversalLoader />;
  }

  return (
    <SessionProvider session={session}>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: true,
          shouldRetryOnError: false,
        }}
      >
        {children}
        <Toaster />
      </SWRConfig>
      <NavigationLoader />
    </SessionProvider>
  );
}
