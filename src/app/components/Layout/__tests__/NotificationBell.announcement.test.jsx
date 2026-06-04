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
jest.mock('../../../../lib/announcements/readState', () => ({
  getDismissedIds: () => [],
  dismissIds: jest.fn(),
  getReadAnnouncementIds: () => [],
  markAnnouncementRead: jest.fn(),
  markAnnouncementUnread: jest.fn(),
}));

import NotificationBell from '../NotificationBell';

describe('NotificationBell — announcement rows', () => {
  test('clicking "View detail" on a popup announcement opens the modal with its coupon', async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await screen.findByText('Site-wide Coupon');
    const buttons = screen.getAllByRole('button', { name: /view detail/i });
    fireEvent.click(buttons[0]);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByText(/Copy code: WELCOME20/)).toBeInTheDocument());
  });

  test('an inline announcement with a link renders a Visit link and no View detail', async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    const summerRow = (await screen.findByText('Summer Sale')).closest('[role="button"]');
    expect(within(summerRow).getByRole('link', { name: /visit/i })).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
    expect(within(summerRow).queryByRole('button', { name: /view detail/i })).not.toBeInTheDocument();
  });

  test('every announcement row has an envelope toggle (read/unread)', async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await screen.findByText('Site-wide Coupon');
    const toggles = screen.getAllByRole('button', { name: /mark as (read|unread)/i });
    expect(toggles.length).toBeGreaterThanOrEqual(2);
  });
});
