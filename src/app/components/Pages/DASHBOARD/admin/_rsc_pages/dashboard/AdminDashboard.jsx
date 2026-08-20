'use client';

import { Download as DownloadIcon } from 'lucide-react';
import useSWR from 'swr';

import { DashboardMotionFrame } from '@/app/components/DashboardShared';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getBookingMix, getDashboardMetrics, getOverviewChart } from '@/lib/services/dashboard';

import { AttentionSummary } from './AttentionSummary';
import { BookingMix } from './BookingMix';
import { canExportDashboard, downloadDashboardCsv } from './dashboardExport';
import { MetricCards } from './metric-cards';
import { Overview } from './overview';
import { QuickActions } from './quick-actions';

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  errorRetryCount: 2,
  refreshInterval: 60000,
  keepPreviousData: true,
  dedupingInterval: 5000,
};

export function AdminDashboardPage() {
  const { toast } = useToast();
  const { data: metricsData, error: metricsError, isLoading: metricsLoading } = useSWR('/admin/dashboard/metrics', getDashboardMetrics, SWR_OPTIONS);
  const { data: chartData, error: chartError, isLoading: chartLoading } = useSWR('/admin/dashboard/overview-chart', getOverviewChart, SWR_OPTIONS);
  const { data: bookingMix, error: bookingMixError, isLoading: bookingMixLoading } = useSWR('/admin/dashboard/booking-mix', getBookingMix, SWR_OPTIONS);
  const hasError = metricsError || chartError || bookingMixError;
  const canDownload = canExportDashboard({
    metrics: metricsData,
    overview: chartData,
    metricsLoading,
    chartLoading,
    metricsError,
    chartError,
  });

  const handleDownload = () => {
    if (!canDownload) return;
    try {
      downloadDashboardCsv({ metrics: metricsData, overview: chartData });
    } catch {
      toast({ variant: 'destructive', title: 'Download failed', description: 'Please try again.' });
    }
  };

  return (
    <DashboardMotionFrame className="flex-1 space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Live business summary</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">Super Admin Dashboard</h1>
        </div>
        <Button className="w-fit bg-weelp-sage-deep" disabled={!canDownload} onClick={handleDownload}>
          <DownloadIcon aria-hidden="true" />
          Download
        </Button>
      </header>

      {hasError ? (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn&apos;t load some dashboard data. Showing placeholders where possible.
        </div>
      ) : null}

      <MetricCards loading={metricsLoading} data={metricsError ? null : metricsData} overviewData={chartError ? [] : chartData} />

      <div data-testid="dashboard-analytics" className="grid gap-3 min-[901px]:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.72fr)]">
        <section aria-labelledby="overview-title" className="min-w-0 rounded-[15px] border border-border bg-card p-[15px] text-card-foreground">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="overview-title" className="text-sm font-semibold text-foreground">
              Revenue &amp; bookings
            </h2>
            <span className="text-xs text-muted-foreground">12 months</span>
          </div>
          <Overview loading={chartLoading} data={chartError ? null : chartData} />
        </section>
        <BookingMix data={bookingMix} loading={bookingMixLoading} error={bookingMixError} />
      </div>

      <div data-testid="dashboard-lower" className="grid gap-3 min-[621px]:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
        <QuickActions />
        <AttentionSummary />
      </div>
    </DashboardMotionFrame>
  );
}
