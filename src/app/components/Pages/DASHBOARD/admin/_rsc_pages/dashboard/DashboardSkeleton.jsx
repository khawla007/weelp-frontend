import { Skeleton } from '@/components/ui/skeleton';

import { quickActionsData } from './constants/quick-actions.constants';

export function MetricCardsSkeleton() {
  return (
    <div data-testid="dashboard-kpis" className="grid grid-cols-2 gap-[11px] lg:grid-cols-4">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="h-[109px] min-h-[100px] rounded-[15px] border border-border bg-card p-[15px]">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-4" />
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton data-testid="metric-skeleton-sparkline" className="h-[26px] w-[58px] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div data-testid="quick-actions-skeleton-grid" className="grid grid-cols-3 gap-[8px]">
      {quickActionsData.map((action) => (
        <Skeleton key={action.url} data-testid="quick-action-skeleton" className="min-h-[76px] rounded-[11px]" />
      ))}
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="flex h-[205px] items-end gap-2" aria-label="Loading overview chart">
      {[38, 52, 45, 66, 58, 74, 62, 81, 70, 88, 77, 92].map((height, index) => (
        <Skeleton key={index} className="flex-1 rounded-t-sm" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

export function RecentSalesSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4, 5].map((index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-5 p-8 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-48 md:h-10 md:w-64" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <MetricCardsSkeleton />

      <div data-testid="dashboard-analytics-skeleton" className="grid gap-3 min-[901px]:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.72fr)]">
        <div className="rounded-[15px] border border-border bg-card p-[15px]">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-16" />
          </div>
          <OverviewSkeleton />
        </div>
        <div className="rounded-[15px] border border-border bg-card p-[15px]">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton data-testid="booking-mix-skeleton" className="mx-auto size-[112px] rounded-full" />
          <Skeleton className="mx-auto mt-3 h-3 w-44" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      </div>

      <div data-testid="dashboard-lower-skeleton" className="grid gap-3 min-[621px]:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
        <div className="rounded-[15px] border border-border bg-card p-[15px]">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <QuickActionsSkeleton />
        </div>
        <div className="rounded-[15px] border border-border bg-card p-[15px]">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    </div>
  );
}
