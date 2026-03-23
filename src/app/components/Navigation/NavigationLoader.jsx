'use client';

import { useNavigationStore } from '@/lib/store/useNavigationStore';
import { PageLoader } from '@/app/components/Loading/PageLoader';

export function NavigationLoader() {
  const isNavigating = useNavigationStore((state) => state.isNavigating);

  if (!isNavigating) return null;

  return (
    <div className="absolute inset-0 z-50 bg-mainBackground flex items-center justify-center">
      <PageLoader message="Loading..." />
    </div>
  );
}
