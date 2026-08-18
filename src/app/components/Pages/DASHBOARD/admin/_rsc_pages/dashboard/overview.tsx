'use client';

import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartConfig, overviewChartData } from './constants/overview-chart.constants';
import { OverviewSkeleton } from './DashboardSkeleton';
import { OverviewTooltip } from './OverviewTooltip';

export interface ChartDataPoint {
  name: string;
  total: number;
  bookings: number;
}

export interface OverviewDataPoint {
  name: string;
  total?: number | string | null;
  bookings?: number | string | null;
}

export interface OverviewProps {
  loading?: boolean;
  data?: OverviewDataPoint[] | null;
}

function toFiniteNumber(value: number | string | null | undefined) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function Overview({ loading = false, data }: OverviewProps) {
  if (loading) {
    return <OverviewSkeleton />;
  }

  const sourceData = data?.length ? data : overviewChartData;
  const chartData: ChartDataPoint[] = sourceData.map(({ name, total, bookings }) => ({
    name,
    total: toFiniteNumber(total),
    bookings: toFiniteNumber(bookings),
  }));
  const isEmpty = chartData.every(({ total, bookings }) => total === 0 && bookings === 0);
  const pointerIndexes = [3, 7, 11].filter((index) => chartData[index]);

  return (
    <div>
      <div role="img" aria-label="Monthly revenue and bookings chart">
        <div className="relative h-[205px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="overviewRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.revenueColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartConfig.revenueColor} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={chartConfig.gridColor} />
              <XAxis dataKey="name" hide height={0} />
              <YAxis yAxisId="revenue" hide width={0} domain={[0, 'auto']} />
              <YAxis yAxisId="bookings" hide width={0} domain={[0, 'auto']} allowDecimals={false} />
              <Tooltip content={<OverviewTooltip />} />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="total"
                name="Revenue"
                stroke={chartConfig.revenueColor}
                strokeWidth={3}
                fill="url(#overviewRevenueGradient)"
                activeDot={{ fill: chartConfig.pointerColor, stroke: chartConfig.pointerColor }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="bookings"
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke={chartConfig.bookingsColor}
                strokeWidth={2.5}
                strokeDasharray="7 6"
                dot={false}
                activeDot={{ fill: chartConfig.pointerColor, stroke: chartConfig.pointerColor }}
                connectNulls={false}
                isAnimationActive={false}
              />
              {pointerIndexes.map((index) => (
                <ReferenceDot
                  key={chartData[index].name}
                  yAxisId="revenue"
                  x={chartData[index].name}
                  y={chartData[index].total}
                  r={4}
                  fill={chartConfig.pointerColor}
                  stroke={chartConfig.pointerColor}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
          {isEmpty ? (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">No revenue or booking data for this year yet.</p>
          ) : null}
        </div>
      </div>

      <table className="sr-only" aria-label="Monthly revenue and bookings data">
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Revenue</th>
            <th scope="col">Bookings</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map(({ name, total, bookings }) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{chartConfig.revenueFormatter(total)}</td>
              <td>{chartConfig.bookingsFormatter(bookings)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
