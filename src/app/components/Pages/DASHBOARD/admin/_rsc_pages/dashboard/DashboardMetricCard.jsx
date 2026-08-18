'use client';

import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

const SPARKLINE_COLORS = {
  success: 'hsl(var(--success))',
  info: 'hsl(var(--info))',
  violet: '#aa8cff',
  warning: 'hsl(var(--warning))',
};

function finiteNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function fallbackHistory(current, change) {
  const denominator = 1 + change / 100;
  const previous = Number.isFinite(denominator) && denominator > 0 ? current / denominator : current;
  return [{ value: previous }, { value: current }];
}

function sparklineHistory(history, historyKey, current, change) {
  const source = Array.isArray(history) ? history : [];
  const complete = source.length >= 12 && source.every((point) => Number.isFinite(Number(point?.[historyKey])));
  return complete ? source : fallbackHistory(current, change);
}

function MetricSparkline({ history, historyKey, accent }) {
  return (
    <div className="h-[26px] w-[58px] shrink-0" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <Line type="monotone" dataKey={historyKey} stroke={SPARKLINE_COLORS[accent]} strokeWidth={2.25} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DashboardMetricCard({ label, icon, value, numericValue = 0, change = 0, history = [], historyKey = 'value', accent = 'success' }) {
  const safeCurrent = finiteNumber(numericValue);
  const safeChange = finiteNumber(change);
  const direction = safeChange > 0 ? 'up' : safeChange < 0 ? 'down' : 'flat';
  const directionConfig = {
    up: { label: 'Increase', className: 'text-success', Icon: TrendingUp },
    down: { label: 'Decrease', className: 'text-destructive', Icon: TrendingDown },
    flat: { label: 'No change', className: 'text-warning', Icon: Minus },
  }[direction];
  const TrendIcon = directionConfig.Icon;
  const completeHistory = sparklineHistory(history, historyKey, safeCurrent, safeChange);
  const renderedHistoryKey = completeHistory === history ? historyKey : 'value';

  return (
    <div data-testid="metric-card" className="relative h-[109px] min-h-[100px] rounded-[15px] border border-border bg-card p-[15px] text-card-foreground shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
        {icon}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-2xl font-bold leading-none tracking-tight">{value}</div>
          <span className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${directionConfig.className}`}>
            <TrendIcon size={14} aria-hidden="true" />
            <span className="sr-only">{directionConfig.label}</span>
            {safeChange > 0 ? '+' : ''}
            {safeChange}%
          </span>
        </div>
        <MetricSparkline history={completeHistory} historyKey={renderedHistoryKey} accent={accent} />
      </div>
    </div>
  );
}
