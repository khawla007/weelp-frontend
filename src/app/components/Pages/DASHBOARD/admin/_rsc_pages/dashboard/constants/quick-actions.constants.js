import { Users, Settings, PlusCircle } from 'lucide-react';

/**
 * Quick action card data for dashboard
 * Icons are stored as component references, not JSX elements
 */
export const quickActionsData = [
  {
    title: 'Manage Users',
    url: '/dashboard/admin/users',
    icon: Users,
  },
  {
    title: 'System Settings',
    url: '/dashboard/admin/settings',
    icon: Settings,
  },
  {
    title: 'Add New Activity',
    url: '/dashboard/admin/activities',
    icon: PlusCircle,
  },
];

/**
 * Type: QuickAction
 * @typedef {Object} QuickAction
 * @property {string} title
 * @property {string} url
 * @property {React.ComponentType<{size?: number, className?: string}>} icon
 */
