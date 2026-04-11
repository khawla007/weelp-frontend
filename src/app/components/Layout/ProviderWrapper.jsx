'use client';

import { Suspense, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useIsClient } from '@/hooks/useIsClient';
import { Toaster } from '@/components/ui/toaster';
import AuthModalDialog from '@/app/components/Modals/AuthModalDialog';
import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetchers';

export default function AppProviders({ children, session }) {
  return (
    <SessionProvider session={session}>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        {children}
        <Toaster />
        <AuthModalDialog />
      </SWRConfig>
    </SessionProvider>
  );
}
