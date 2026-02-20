import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { metricCardsData } from './constants/metric-cards.constants';
import { MetricCardsSkeleton } from './DashboardSkeleton';

export const MetricCards = ({ loading = false, data = null }) => {
  if (loading) {
    return <MetricCardsSkeleton />;
  }

  // Use API data if available (and has content), otherwise use static data
  const cards = (data && data.length > 0) ? data : metricCardsData;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((item, index) => {
        const IconComponent = item.icon;

        return (
          <Card key={index} className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader className="flex flex-col justify-between pb-2 flex-wrap">
              <CardTitle className="text-xs font-medium flex items-center justify-between w-full gap-2 capitalize">
                {item.title}
                <IconComponent size={18} className="text-gray-500" />
              </CardTitle>
              <div className="text-2xl mt-4 block font-bold">
                {index === 0 && '$'}
                {item.total.toLocaleString()}
              </div>
            </CardHeader>
            <CardContent>
              <p className={`${item.change >= 0 ? 'text-green-500' : 'text-red-500'} text-[12px] flex flex-wrap gap-1 items-center`}>
                {item.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {item.change > 0 ? '+' : ''}{item.change}% <span className="text-gray-400 font-medium">from last month</span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
