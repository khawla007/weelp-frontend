import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Skeleton loader for Metric Cards
 * Displays 4 placeholder cards while data is loading
 */
export function MetricCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mt-4" />
            <Skeleton className="h-3 w-40 mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for Quick Actions
 * Displays 6 placeholder action cards while loading
 */
export function QuickActionsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-24" />
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
  return (
    <div className="w-full h-[350px] flex items-end justify-between gap-2 px-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <Skeleton 
            className="w-full rounded-t-sm" 
            style={{ 
              height: `${Math.floor(Math.random() * 60 + 40)}%`,
              minHeight: '60px'
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
    <div className="space-y-6 w-full max-w-full">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="ml-4 space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-4 w-16" />
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
