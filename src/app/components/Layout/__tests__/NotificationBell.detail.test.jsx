import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

const markAsReadMock = jest.fn().mockResolvedValue({ success: true });

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 7 } } }) }));
jest.mock('swr', () => ({ __esModule: true, default: (key) => ({ data: Array.isArray(key) ? { count: 1 } : [], mutate: jest.fn() }) }));
jest.mock('../../../../hooks/useIsClient', () => ({ __esModule: true, useIsClient: () => true }));
jest.mock('../../../../lib/services/notifications', () => ({
  fetchUnreadCount: jest.fn().mockResolvedValue({ success: true, count: 1 }),
  fetchNotifications: jest
    .fn()
    .mockResolvedValue({
      data: { data: [{ id: 11, type: 'new_booking', display_style: 'popup', title: 'Booking 11', message: 'long message body here', created_at: new Date().toISOString(), read_at: null, data: {} }] },
    }),
  markAsRead: (...a) => markAsReadMock(...a),
  markAllAsRead: jest.fn().mockResolvedValue({ success: true }),
  markUnread: jest.fn().mockResolvedValue({ success: true }),
  markSeen: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock('../../../../lib/services/announcements', () => ({ fetchAnnouncements: jest.fn().mockResolvedValue([]) }));

import NotificationBell from '../NotificationBell';

describe('NotificationBell — detail modal', () => {
  beforeEach(() => markAsReadMock.mockClear());

  test('clicking a personal notification opens the modal and marks it read', async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    const row = await screen.findByText('Booking 11');
    fireEvent.click(row);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByText('long message body here')).toBeInTheDocument());
    expect(markAsReadMock).toHaveBeenCalledWith(11);
  });
});
