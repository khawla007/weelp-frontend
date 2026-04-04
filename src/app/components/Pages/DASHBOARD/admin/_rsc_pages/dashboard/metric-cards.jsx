import { metricCardsData } from './constants/metric-cards.constants';
import { MetricCardsSkeleton } from './DashboardSkeleton';
import { StatCard } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/StatCard';

export const MetricCards = ({ loading = false, data = null }) => {
  if (loading) {
    return <MetricCardsSkeleton />;
  }

  // Use API data if available (and has content), otherwise use static data
  // Merge API data with static icons since API doesn't return React components
  const cards = data && data.length > 0 ? data.map((item, i) => ({ ...item, icon: metricCardsData[i]?.icon })) : metricCardsData;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((item, index) => {
        const IconComponent = item.icon || metricCardsData[index]?.icon;
        const formattedValue = index === 0 ? `$${item.total.toLocaleString()}` : item.total.toLocaleString();

        return (
          <StatCard
            key={index}
            label={item.title}
            icon={<IconComponent size={14} className="text-[#09090B] text-sm font-medium" />}
            value={formattedValue}
            change={item.change}
          />
        );
      })}
    </div>
  );
};
