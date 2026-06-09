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

  // Fixed-height wrapper (matches OverviewSkeleton's h-[350px]) so the chart box
  // reserves its space even during recharts' initial zero-size measure frame.
  // Without it, ResponsiveContainer briefly collapses and shifts the layout.
  return (
    <div style={{ height: chartConfig.height }}>
      <ResponsiveContainer width="100%" height="100%" className={''}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke={chartConfig.axisColor} fontSize={chartConfig.axisFontSize} tickLine={false} axisLine={false} />
          <YAxis stroke={chartConfig.axisColor} fontSize={chartConfig.axisFontSize} tickLine={false} axisLine={false} tickFormatter={chartConfig.valueFormatter} />
          <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-weelp-sage-deep" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
