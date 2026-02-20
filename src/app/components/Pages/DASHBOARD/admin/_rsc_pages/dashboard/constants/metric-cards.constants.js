import { DollarSign, Box, Activity, Users } from 'lucide-react';

/**
 * Metric card data for dashboard
 * Icons are stored as component references, not JSX elements
 */
export const metricCardsData = [
  {
    title: 'total revenue',
    icon: DollarSign,
    total: 45321,
    change: 20,
  },
  {
    title: 'total bookings',
    icon: Box,
    total: 2350,
    change: 180,
  },
  {
    title: 'active tours',
    icon: Activity,
    total: 45321,
    change: 19,
  },
  {
    title: 'active users',
    icon: Users,
    total: 573,
    change: 10,
  },
];

/**
 * Type: MetricCard
 * @typedef {Object} MetricCard
 * @property {string} title
 * @property {React.ComponentType<{size?: number, className?: string}>} icon
 * @property {number} total
 * @property {number} change
 */
