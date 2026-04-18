'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Overview } from './overview';
import { Button } from '@/components/ui/button';
import { QuickActions } from './quick-actions';
import { MetricCards } from './metric-cards';
import { RecentSales } from './recent-sales';
import useSWR from 'swr';
import { getDashboardMetrics, getOverviewChart, getRecentSales } from '@/lib/services/dashboard';

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  errorRetryCount: 2,
  refreshInterval: 60000,
  keepPreviousData: true,
  dedupingInterval: 5000,
};

export function AdminDashboardPage() {
  const { data: metricsData, error: metricsError, isLoading: metricsLoading } = useSWR('/admin/dashboard/metrics', getDashboardMetrics, SWR_OPTIONS);

  const { data: chartData, error: chartError, isLoading: chartLoading } = useSWR('/admin/dashboard/overview-chart', getOverviewChart, SWR_OPTIONS);

  const { data: salesResponse, error: salesError, isLoading: salesLoading } = useSWR('/admin/dashboard/recent-sales', getRecentSales, SWR_OPTIONS);

  const salesData = salesResponse?.data ?? [];
  const monthlyTotal = salesResponse?.monthly_total ?? 0;

  const hasError = metricsError || chartError || salesError;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight">Super Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button className="bg-secondaryDark">Download</Button>
        </div>
      </div>

      {hasError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Couldn&apos;t load some dashboard data. Showing placeholders where possible.</div>}

      <MetricCards loading={metricsLoading} data={metricsError ? null : metricsData} />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Quick Actions</h3>
        <QuickActions loading={false} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview loading={chartLoading} data={chartError ? null : chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Monthly sales: ${monthlyTotal.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales loading={salesLoading} data={salesData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
