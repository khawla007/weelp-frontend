import { HelpCircle, Settings, Star, Tag } from 'lucide-react';

// User Navigation
export const DashboardUserNav = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/assets/images/user.png',
  },
  userRoutes: [
    { title: 'Bookings', icon: Tag, url: '/dashboard/customer' },
    { title: 'Reviews', icon: Star, url: '/dashboard/customer/reviews' },
    {
      title: 'Help Center',
      icon: HelpCircle,
      url: '/dashboard/customer/help-center',
    },
    { title: 'Settings', icon: Settings, url: '/dashboard/customer/settings' },
  ],
};
