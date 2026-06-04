import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

const popupAnnouncement = {
  id: 99,
  type: 'offer',
  display_style: 'popup',
  title: 'Site-wide Coupon',
  message: 'Welcome offer',
  link: null,
  image_url: '/img.jpg',
  coupon_code: 'WELCOME20',
  created_at: new Date().toISOString(),
};
const inlineLinkAnnouncement = {
  id: 98,
  type: 'offer',
  display_style: 'inline',
  title: 'Summer Sale',
  message: 'Up to 30% off',
  link: '/cities/dubai/activities/desert-safari',
  image_url: null,
  coupon_code: null,
  created_at: new Date(Date.now() - 1000).toISOString(),
};

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('swr', () => ({
  __esModule: true,
  default: (key) => ({
    data: key === 'announcements-public' ? [popupAnnouncement, inlineLinkAnnouncement] : Array.isArray(key) ? { count: 0 } : [],
    mutate: jest.fn(),
  }),
}));
jest.mock('../../../../hooks/useIsClient', () => ({ __esModule: true, useIsClient: () => true }));
jest.mock('../../../../lib/services/notifications', () => ({
  fetchUnreadCount: jest.fn().mockResolvedValue({ success: true, count: 0 }),
  fetchNotifications: jest.fn().mockResolvedValue({ data: { data: [] } }),
  markAsRead: jest.fn().mockResolvedValue({ success: true }),
  markAllAsRead: jest.fn().mockResolvedValue({ success: true }),
  markUnread: jest.fn().mockResolvedValue({ success: true }),
  markSeen: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock('../../../../lib/services/announcements', () => ({ fetchAnnouncements: jest.fn().mockResolvedValue([]) }));
jest.mock('../../../../lib/announcements/readState', () => ({ getDismissedIds: () => [], dismissIds: jest.fn() }));

import NotificationBell from '../NotificationBell';

describe('NotificationBell — announcement modal', () => {
  test('clicking a popup announcement opens the modal with its coupon', async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    const row = await screen.findByText('Site-wide Coupon');
    fireEvent.click(row);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByText(/Copy code: WELCOME20/)).toBeInTheDocument());
  });

  test('an inline announcement with a link does not open the modal', async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    const row = await screen.findByText('Summer Sale');
    fireEvent.click(row);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
