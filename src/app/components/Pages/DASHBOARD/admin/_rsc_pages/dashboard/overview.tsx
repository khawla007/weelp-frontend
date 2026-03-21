'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { chartConfig, overviewChartData } from './constants/overview-chart.constants';
import { OverviewSkeleton } from './DashboardSkeleton';

/**
 * Chart data point interface
 */
export interface ChartDataPoint {
  name: string;
  total: number;
}

/**
 * Overview chart component props
 */
export interface OverviewProps {
  /** Show loading skeleton instead of chart */
  loading?: boolean;
  /** Chart data array (optional, falls back to constants) */
  data?: ChartDataPoint[] | null;
}

/**
 * Overview Chart Component
 * Displays a bar chart showing monthly data
 */
export const Overview: React.FC<OverviewProps> = ({ loading = false, data }) => {
  if (loading) {
    return <OverviewSkeleton />;
  }

  // Use API data if available (and has content), otherwise use static data
  const chartData = data && data.length > 0 ? data : overviewChartData;

  return (
    <ResponsiveContainer width="100%" height={chartConfig.height} className={''}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" stroke={chartConfig.axisColor} fontSize={chartConfig.axisFontSize} tickLine={false} axisLine={false} />
        <YAxis stroke={chartConfig.axisColor} fontSize={chartConfig.axisFontSize} tickLine={false} axisLine={false} tickFormatter={chartConfig.valueFormatter} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-secondaryDark" />
      </BarChart>
    </ResponsiveContainer>
  );
};
