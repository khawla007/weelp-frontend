'use client';

import { ThemeWrapper } from './theme-wrapper';
import AppProviders from '@/app/components/Layout/ProviderWrapper';
import { useNavigationEvents } from '@/hooks/useNavigationEvents';
import { NavigationProgressBar } from '@/app/components/Navigation/NavigationProgressBar';

function DashboardNavigationHandler() {
  useNavigationEvents();
  return null;
}

export default function DashboardLayout({ children }) {
  return (
    <ThemeWrapper>
      <AppProviders>
        <DashboardNavigationHandler />
        <NavigationProgressBar />
        {children}
      </AppProviders>
    </ThemeWrapper>
  );
}
