import {
  ChartColumnIncreasing,
  Map,
  Settings,
  Tag,
  Tags,
  Users,
  LayoutDashboard,
  Globe,
  MapPin,
  ArrowRightLeft,
  Box,
  Route,
  ShoppingCart,
  FileText,
  Gift,
  SignalHigh,
  Mail,
  Percent,
  BookImage,
  MessageSquare,
  Plus,
} from 'lucide-react';

export const DashboardAdminNav = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/assets/images/user.png',
  },
  adminRoutes: [
    { title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard/admin/' },
    { title: 'Activities', icon: Map, url: '/dashboard/admin/activities' },
    {
      title: 'Taxonomies',
      icon: Tags,
      url: '/dashboard/admin/taxonomies',
      children: [
        {
          title: 'Categories',
          icon: Tag,
          url: '/dashboard/admin/taxonomies/categories',
        },
        { title: 'Tags', icon: Tag, url: '/dashboard/admin/taxonomies/tags' },
        {
          title: 'Attributes',
          icon: Tag,
          url: '/dashboard/admin/taxonomies/attributes',
        },
      ],
    },
    {
      title: 'Destinations',
      icon: Globe,
      url: '/dashboard/admin/destinations',
      children: [
        {
          title: 'All Destination',
          icon: MapPin,
          url: '/dashboard/admin/destinations',
        },
        {
          title: 'Regions',
          icon: MapPin,
          url: '/dashboard/admin/destinations/regions',
        },
      ],
    },

    { title: 'Itineraries', icon: Route, url: '/dashboard/admin/itineraries' },
    {
      title: 'Transfers',
      icon: ArrowRightLeft,
      url: '/dashboard/admin/transfers',
      children: [
        {
          title: 'All Transfers',
          icon: ArrowRightLeft,
          url: '/dashboard/admin/transfers',
        },
        {
          title: 'Vendors',
          icon: Box,
          url: '/dashboard/admin/transfers/vendors',
        },
      ],
    },
    {
      title: 'Package Builder',
      icon: Box,
      url: '/dashboard/admin/package-builder',
    },
    { title: 'Orders', icon: ShoppingCart, url: '/dashboard/admin/orders' },
    { title: 'Reviews', icon: MessageSquare, url: '/dashboard/admin/reviews' },
    { title: 'Manage Add Ons', icon: Plus, url: '/dashboard/admin/addon' },
    { title: 'Pages', icon: FileText, url: '/dashboard/admin/pages', comingSoon: true },
    { title: 'Blogs', icon: FileText, url: '/dashboard/admin/blogs', comingSoon: true },
    {
      title: 'Marketing',
      icon: Gift,
      url: '/dashboard/admin/marketing/promo-codes',
      comingSoon: true,
      children: [
        {
          title: 'Promo Codes',
          icon: Tag,
          url: '/dashboard/admin/marketing/promo-codes',
        },
        {
          title: 'Analytics',
          icon: SignalHigh,
          url: '/dashboard/admin/marketing/analytics',
        },
        {
          title: 'Email',
          icon: Mail,
          url: '/dashboard/admin/marketing/emails',
        },
        {
          title: 'Affiliates',
          icon: Percent,
          url: '/dashboard/admin/marketing/affiliates',
        },
      ],
    },
    { title: 'Media', icon: BookImage, url: '/dashboard/admin/media' },

    {
      title: 'Reports',
      icon: ChartColumnIncreasing,
      url: '/dashboard/admin/reports',
      comingSoon: true,
    },
    { title: 'Users', icon: Users, url: '/dashboard/admin/users' },
    { title: 'Settings', icon: Settings, url: '/dashboard/admin/settings' },
  ],
};
