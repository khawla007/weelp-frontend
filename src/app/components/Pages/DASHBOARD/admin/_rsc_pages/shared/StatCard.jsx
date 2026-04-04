import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Shared stat card component used across dashboard and orders pages.
 * Renders a metric with label, icon, value, and growth indicator.
 *
 * @param {object} props
 * @param {string} props.label - Card title text
 * @param {React.ReactNode} props.icon - Icon element or component
 * @param {string|number} props.value - Display value
 * @param {number} props.change - Growth percentage
 */
export const StatCard = ({ label, icon, value, change = 0 }) => {
  const isPositive = change >= 0;

  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:bg-accent hover:shadow-lg">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-[#09090B] text-sm font-medium">{label}</h3>
        {icon}
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className={`${isPositive ? 'text-green-500' : 'text-red-500'} text-[12px] flex flex-wrap gap-1 items-center`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {change > 0 ? '+' : ''}
          {change}% <span className="text-gray-400 font-medium">from last month</span>
        </p>
      </div>
    </Card>
  );
};
