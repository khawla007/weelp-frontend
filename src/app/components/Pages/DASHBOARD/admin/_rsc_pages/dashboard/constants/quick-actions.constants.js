import { PlusCircle, Settings, Users } from 'lucide-react';

/**
 * Quick action card data for dashboard
 * Icons are stored as component references, not JSX elements
 */
export const quickActionsData = [
  {
    title: 'Add Activity',
    url: '/dashboard/admin/activities',
    icon: PlusCircle,
  },
  {
    title: 'Manage Users',
    url: '/dashboard/admin/users',
    icon: Users,
  },
  {
    title: 'Settings',
    url: '/dashboard/admin/settings',
    icon: Settings,
  },
];

/**
 * Type: QuickAction
 * @typedef {Object} QuickAction
 * @property {string} title
 * @property {string} url
 * @property {React.ComponentType<{size?: number, className?: string}>} icon
 */
