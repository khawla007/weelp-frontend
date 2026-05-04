import { HelpCircle, Settings, Star, Tag, Home, Route, BarChart3, DollarSign, ClipboardCheck, Wallet } from 'lucide-react';

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
    // My Itineraries (replaces My Posts)
    { title: 'My Itineraries', icon: Route, url: '/dashboard/customer/my-itineraries' },
    { title: 'Earnings', icon: DollarSign, url: '/dashboard/customer/earnings', creatorOnly: true },
    { title: 'Payouts', icon: Wallet, url: '/dashboard/customer/payouts', creatorOnly: true },
    { title: 'Application Status', icon: ClipboardCheck, url: '/dashboard/customer/application-status', nonCreatorOnly: true },
    { title: 'Help Center', icon: HelpCircle, url: '/dashboard/customer/help-center' },
    // Creator-only: Analytics after Help Center
    { title: 'Analytics', icon: BarChart3, url: '/dashboard/customer/analytics', creatorOnly: true },
    { title: 'Settings', icon: Settings, url: '/dashboard/customer/settings' },
  ],
};
