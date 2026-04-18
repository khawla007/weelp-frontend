import {
  ChartColumnIncreasing,
  Map,
  Settings,
  Tag,
  Tags,
  FolderTree,
  Settings2,
  Users,
  UserCheck,
  FileCheck,
  LayoutDashboard,
  Globe,
  MapPin,
  ArrowRightLeft,
  Box,
  Route,
  Grid3x3,
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

/**
 * @typedef {Object} NavItem
 * @property {string} title
 * @property {React.ComponentType} icon
 * @property {string} url
 * @property {NavItem[]} [children]
 * @property {boolean} [comingSoon]
 */

/**
 * @typedef {Object} NavSection
 * @property {string} section - Uppercase heading.
 * @property {NavItem[]} items
 */

/** @type {NavSection[]} */
const adminRoutes = [
  {
    section: 'OVERVIEW',
    items: [{ title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard/admin' }],
  },
  {
    section: 'COMMUNITY',
    items: [
      { title: 'Users', icon: Users, url: '/dashboard/admin/users' },
      {
        title: 'Creators',
        icon: UserCheck,
        url: '/dashboard/admin/creator-applications',
        children: [
          { title: 'Applications', icon: FileCheck, url: '/dashboard/admin/creator-applications' },
          { title: 'Itineraries', icon: Route, url: '/dashboard/admin/creator-itineraries' },
        ],
      },
    ],
  },
  {
    section: 'BOOKINGS',
    items: [
      { title: 'Orders', icon: ShoppingCart, url: '/dashboard/admin/orders' },
      { title: 'Reviews', icon: MessageSquare, url: '/dashboard/admin/reviews' },
    ],
  },
  {
    section: 'CATALOG',
    items: [
      { title: 'Activities', icon: Map, url: '/dashboard/admin/activities' },
      { title: 'Itineraries', icon: Route, url: '/dashboard/admin/itineraries' },
      {
        title: 'Transfers',
        icon: ArrowRightLeft,
        url: '/dashboard/admin/transfers',
        children: [
          { title: 'All Transfers', icon: ArrowRightLeft, url: '/dashboard/admin/transfers' },
          { title: 'Zones', icon: Grid3x3, url: '/dashboard/admin/transfers/zones' },
          { title: 'Routes', icon: Route, url: '/dashboard/admin/transfers/routes' },
          { title: 'Vendors', icon: Box, url: '/dashboard/admin/transfers/vendors', comingSoon: true },
        ],
      },
      { title: 'Manage Add Ons', icon: Plus, url: '/dashboard/admin/addon' },
      {
        title: 'Taxonomies',
        icon: Tags,
        url: '/dashboard/admin/taxonomies',
        children: [
          { title: 'Categories', icon: FolderTree, url: '/dashboard/admin/taxonomies/categories' },
          { title: 'Tags', icon: Tag, url: '/dashboard/admin/taxonomies/tags' },
          { title: 'Attributes', icon: Settings2, url: '/dashboard/admin/taxonomies/attributes' },
        ],
      },
    ],
  },
  {
    section: 'DESTINATIONS',
    items: [
      {
        title: 'Destinations',
        icon: Globe,
        url: '/dashboard/admin/destinations',
        children: [
          { title: 'All Destination', icon: MapPin, url: '/dashboard/admin/destinations' },
          { title: 'Regions', icon: MapPin, url: '/dashboard/admin/destinations/regions' },
        ],
      },
    ],
  },
  {
    section: 'EDITORIAL',
    items: [
      { title: 'Blogs', icon: FileText, url: '/dashboard/admin/blogs' },
      { title: 'Media', icon: BookImage, url: '/dashboard/admin/media' },
    ],
  },
  {
    section: 'SYSTEM',
    items: [{ title: 'Settings', icon: Settings, url: '/dashboard/admin/settings' }],
  },
  {
    section: 'COMING SOON',
    items: [
      { title: 'Pages', icon: FileText, url: '/dashboard/admin/pages', comingSoon: true },
      {
        title: 'Marketing',
        icon: Gift,
        url: '/dashboard/admin/marketing/promo-codes',
        comingSoon: true,
        children: [
          { title: 'Promo Codes', icon: Tag, url: '/dashboard/admin/marketing/promo-codes' },
          { title: 'Analytics', icon: SignalHigh, url: '/dashboard/admin/marketing/analytics' },
          { title: 'Email', icon: Mail, url: '/dashboard/admin/marketing/emails' },
          { title: 'Affiliates', icon: Percent, url: '/dashboard/admin/marketing/affiliates' },
        ],
      },
      { title: 'Reports', icon: ChartColumnIncreasing, url: '/dashboard/admin/reports', comingSoon: true },
      { title: 'Package Builder', icon: Box, url: '/dashboard/admin/package-builder', comingSoon: true },
    ],
  },
];

export const DashboardAdminNav = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/assets/images/user.png',
  },
  adminRoutes,
};
