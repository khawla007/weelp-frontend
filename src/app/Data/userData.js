import { HelpCircle, Settings, Star, Tag, Home, FileText, BarChart3 } from 'lucide-react';

// User Navigation
export const DashboardUserNav = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/assets/images/user.png',
  },
  userRoutes: [
    // Existing customer items
    { title: 'Bookings', icon: Tag, url: '/dashboard/customer' },
    { title: 'Reviews', icon: Star, url: '/dashboard/customer/reviews' },
    {
      title: 'Help Center',
      icon: HelpCircle,
      url: '/dashboard/customer/help-center',
    },
    { title: 'Settings', icon: Settings, url: '/dashboard/customer/settings' },
    // NEW: Creator-only items
    { title: 'Overview', icon: Home, url: '/dashboard/overview', creatorOnly: true },
    { title: 'My Posts', icon: FileText, url: '/dashboard/customer/posts', creatorOnly: true },
    { title: 'Analytics', icon: BarChart3, url: '/dashboard/customer/analytics', creatorOnly: true },
  ],
};
