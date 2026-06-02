import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { quickActionsData } from './constants/quick-actions.constants';
import { chartConfig } from './constants/overview-chart.constants';

/**
 * Skeleton loader for Metric Cards
 * Mirrors the exact DOM of StatCard (padding via inner divs, no extra Card padding)
 * so the skeleton occupies the same height and swapping in data causes no layout shift.
 */
export function MetricCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <div className="p-6 pt-0">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-40 mt-1" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for Quick Actions
 * Mirrors the real QuickActions card DOM (CardHeader/CardContent own the padding,
 * no extra Card padding) so each placeholder matches a real card's height.
 */
export function QuickActionsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* One placeholder per real action so the skeleton row count matches the
          loaded layout exactly — prevents the grid shrinking (and shifting the
          chart row up) when data arrives. */}
      {quickActionsData.map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center justify-between w-full gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </CardHeader>
          <CardContent>
            {/* h-10 wrapper mirrors the real "Get Started" Button box (h-10) so the
                card height matches and the skeleton->data swap causes no layout shift */}
            <div className="h-10 flex items-center">
              <Skeleton className="h-5 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for Overview Chart
 * Displays placeholder chart while loading
 */
export function OverviewSkeleton() {
  // Predefined heights for variety (avoid Math.random in render)
  const heights = [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 55];

  return (
    <div className="w-full flex items-end justify-between gap-2 px-4" style={{ height: chartConfig.height }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <Skeleton
            className="w-full rounded-t-sm"
            style={{
              height: `${heights[i % heights.length]}%`,
              minHeight: '60px',
            }}
          />
          <Skeleton className="h-3 w-6" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for Recent Sales
 * Displays 5 placeholder sales items while loading
 */
export function RecentSalesSkeleton() {
  return (
    <div className="space-y-8 w-full max-w-full grid grid-cols-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-wrap items-center gap-4 sm:gap-0">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="ml-4 space-y-1 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-16 sm:ml-auto" />
        </div>
      ))}
    </div>
  );
}

/**
 * Complete Dashboard Page Skeleton
 * Combines all dashboard skeleton loaders
 */
export function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-8 w-48 md:h-10 md:w-64" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Metric Cards Skeleton */}
      <MetricCardsSkeleton />

      {/* Quick Actions Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <QuickActionsSkeleton />
      </div>

      {/* Overview and Recent Sales Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewSkeleton />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <RecentSalesSkeleton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
