import { HelpCircle, Settings, Star, Tag, Home, FileText, BarChart3 } from 'lucide-react';

// User Navigation
export const DashboardUserNav = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/assets/images/user.png',
  },
  userRoutes: [
    // Creator-only: Overview first
    { title: 'Overview', icon: Home, url: '/dashboard/customer/overview', creatorOnly: true },
    // Shared items
    { title: 'Bookings', icon: Tag, url: '/dashboard/customer' },
    { title: 'Reviews', icon: Star, url: '/dashboard/customer/reviews' },
    // Creator-only: My Posts after Reviews
    { title: 'My Posts', icon: FileText, url: '/dashboard/customer/posts', creatorOnly: true },
    { title: 'Help Center', icon: HelpCircle, url: '/dashboard/customer/help-center' },
    // Creator-only: Analytics after Help Center
    { title: 'Analytics', icon: BarChart3, url: '/dashboard/customer/analytics', creatorOnly: true },
    { title: 'Settings', icon: Settings, url: '/dashboard/customer/settings' },
  ],
};
