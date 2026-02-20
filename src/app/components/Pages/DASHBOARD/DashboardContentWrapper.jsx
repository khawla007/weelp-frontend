'use client';

import { DashboardErrorBoundary } from './admin/_rsc_pages/dashboard/DashboardErrorBoundary';

/**
 * Client wrapper for dashboard content with error boundary
 * Wraps children in error boundary to catch and display errors gracefully
 */
export function DashboardContentWrapper({ children }) {
  return (
    <DashboardErrorBoundary>
      {children}
    </DashboardErrorBoundary>
  );
}
