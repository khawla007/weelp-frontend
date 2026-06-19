'use client';

import { Suspense } from 'react';
import { FontWrapper } from './theme-wrapper';
import AppProviders from '@/app/components/Layout/ProviderWrapper';
import { useNavigationEvents } from '@/hooks/useNavigationEvents';
import { NavigationProgressBar } from '@/app/components/Navigation/NavigationProgressBar';

function DashboardNavigationHandler() {
  useNavigationEvents();
  return null;
}

export default function DashboardLayout({ children }) {
  return (
    <FontWrapper>
      <AppProviders>
        <Suspense fallback={null}>
          <DashboardNavigationHandler />
        </Suspense>
        <NavigationProgressBar />
        {children}
      </AppProviders>
    </FontWrapper>
  );
}
