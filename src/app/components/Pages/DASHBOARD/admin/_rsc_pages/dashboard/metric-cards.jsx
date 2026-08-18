import { metricCardsData } from './constants/metric-cards.constants';
import { MetricCardsSkeleton } from './DashboardSkeleton';
import { DashboardMetricCard } from './DashboardMetricCard';

export const MetricCards = ({ loading = false, data = null, overviewData = [] }) => {
  if (loading) {
    return <MetricCardsSkeleton />;
  }

  // Use API data if available (and has content), otherwise use static data
  // Merge API data with static icons since API doesn't return React components
  const cards = data && data.length > 0 ? data.map((item, i) => ({ ...item, icon: metricCardsData[i]?.icon })) : metricCardsData;
  const history = Array.isArray(overviewData) ? overviewData : [];

  return (
    <div data-testid="dashboard-kpis" className="grid grid-cols-2 gap-[11px] lg:grid-cols-4">
      {cards.map((item, index) => {
        const IconComponent = item.icon || metricCardsData[index]?.icon;
        const formattedValue = index === 0 ? `$${item.total.toLocaleString()}` : item.total.toLocaleString();

        const historyProps = [{ history, historyKey: 'total', accent: 'success' }, { history, historyKey: 'bookings', accent: 'info' }, { accent: 'violet' }, { accent: 'warning' }][index] ?? {
          accent: 'success',
        };

        return (
          <DashboardMetricCard
            key={index}
            label={item.title}
            icon={<IconComponent size={16} className="text-muted-foreground" aria-hidden="true" />}
            value={formattedValue}
            numericValue={item.total}
            change={item.change}
            {...historyProps}
          />
        );
      })}
    </div>
  );
};
