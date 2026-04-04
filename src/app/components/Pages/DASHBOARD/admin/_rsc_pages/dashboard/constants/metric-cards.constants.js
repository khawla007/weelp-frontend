import { DollarSign, Box, UserPlus, Clock } from 'lucide-react';

/**
 * Get current month name for metric card titles
 */
const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

/**
 * Metric card data for dashboard
 * Icons are stored as component references, not JSX elements
 * Titles include current month name (auto-updates each month)
 */
export const metricCardsData = [
  {
    title: `${currentMonth} Revenue`,
    icon: DollarSign,
    total: 0,
    change: 0,
  },
  {
    title: `${currentMonth} Bookings`,
    icon: Box,
    total: 0,
    change: 0,
  },
  {
    title: `${currentMonth} New Users`,
    icon: UserPlus,
    total: 0,
    change: 0,
  },
  {
    title: `${currentMonth} Orders In Process`,
    icon: Clock,
    total: 0,
    change: 0,
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
