import { chartConfig } from './constants/overview-chart.constants';

interface OverviewTooltipPayload {
  dataKey?: string;
  value?: number;
}

interface OverviewTooltipProps {
  active?: boolean;
  label?: string;
  payload?: OverviewTooltipPayload[];
}

export function OverviewTooltip({ active, label, payload }: OverviewTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const revenue = payload.find((entry) => entry.dataKey === 'total')?.value ?? 0;
  const bookings = payload.find((entry) => entry.dataKey === 'bookings')?.value ?? 0;

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      <p>Revenue: {chartConfig.revenueFormatter(revenue)}</p>
      <p>Bookings: {chartConfig.bookingsFormatter(bookings)}</p>
    </div>
  );
}
