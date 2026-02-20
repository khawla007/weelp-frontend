'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Overview } from './overview';
import { Button } from '@/components/ui/button';
import { QuickActions } from './quick-actions';
import { MetricCards } from './metric-cards';
import { RecentSales } from './recent-sales';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { getDashboardMetrics, getOverviewChart, getRecentSales } from '@/lib/services/dashboard';

/**
 * Admin Dashboard Page
 * Uses SWR for data fetching with loading and error states
 */
export function AdminDashboardPage() {
  // Fetch dashboard metrics with SWR
  const { 
    data: metricsData, 
    error: metricsError, 
    isValidating: metricsLoading 
  } = useSWR('/admin/dashboard/metrics', () => getDashboardMetrics(), {
    revalidateOnFocus: true,
    refreshInterval: 60000, // Refresh every minute
  });

  // Fetch overview chart data with SWR
  const {
    data: chartData,
    error: chartError,
    isValidating: chartLoading
  } = useSWR('/admin/dashboard/overview-chart', () => getOverviewChart(), {
    revalidateOnFocus: true,
    refreshInterval: 60000,
  });

  // Fetch recent sales with SWR
  const {
    data: salesData,
    error: salesError,
    isValidating: salesLoading
  } = useSWR('/admin/dashboard/recent-sales', () => getRecentSales(), {
    revalidateOnFocus: true,
    refreshInterval: 60000,
  });

  // Aggregate loading states
  const loading = metricsLoading || chartLoading || salesLoading;

  // Aggregate errors
  const hasError = metricsError || chartError || salesError;

  // Get recent sales count for description
  const salesCount = salesData?.length || 0;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight">Super Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button className="bg-secondaryDark">Download</Button>
        </div>
      </div>

      {/* Role-specific metrics */}
      <MetricCards loading={loading} data={metricsData} />

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Quick Actions</h3>
        <QuickActions loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview loading={chartLoading} data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made {salesCount} sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales loading={salesLoading} data={salesData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
