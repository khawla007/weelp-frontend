import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

const markAsReadMock = jest.fn().mockResolvedValue({ success: true });
const pushMock = jest.fn();
let mockRole = 'customer';
let mockNotifications = [
  { id: 11, type: 'new_booking', display_style: 'popup', title: 'Booking 11', message: 'long message body here', created_at: new Date().toISOString(), read_at: null, data: {} },
];

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 7, role: mockRole } } }) }));
jest.mock('swr', () => ({ __esModule: true, default: (key) => ({ data: Array.isArray(key) ? { count: 1 } : [], mutate: jest.fn() }) }));
jest.mock('../../../../hooks/useIsClient', () => ({ __esModule: true, useIsClient: () => true }));
jest.mock('../../../../lib/services/notifications', () => ({
  fetchUnreadCount: jest.fn().mockResolvedValue({ success: true, count: 1 }),
  fetchNotifications: jest.fn().mockImplementation(() => Promise.resolve({ data: { data: mockNotifications } })),
  markAsRead: (...a) => markAsReadMock(...a),
  markAllAsRead: jest.fn().mockResolvedValue({ success: true }),
  markUnread: jest.fn().mockResolvedValue({ success: true }),
  markSeen: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock('../../../../lib/services/announcements', () => ({ fetchAnnouncements: jest.fn().mockResolvedValue([]) }));

import NotificationBell from '../NotificationBell';

describe('NotificationBell — detail modal', () => {
  beforeEach(() => {
    markAsReadMock.mockReset().mockResolvedValue({ success: true });
    pushMock.mockClear();
    mockRole = 'customer';
    mockNotifications = [
      { id: 11, type: 'new_booking', display_style: 'popup', title: 'Booking 11', message: 'long message body here', created_at: new Date().toISOString(), read_at: null, data: {} },
    ];
  });

  test('clicking a personal notification opens the modal and marks it read', async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    const row = await screen.findByText('Booking 11');
    fireEvent.click(row);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByText('long message body here')).toBeInTheDocument());
    expect(markAsReadMock).toHaveBeenCalledWith(11);
  });

  test.each([
    ['customer', '/dashboard/customer/notifications'],
    ['admin', '/dashboard/admin/notifications'],
    ['super_admin', '/dashboard/admin/notifications'],
  ])('uses the %s notification index for View All', async (role, href) => {
    mockRole = role;
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

    expect(await screen.findByRole('link', { name: /view all/i })).toHaveAttribute('href', href);
  });

  test('an unread cancellation waits for mark-as-read before navigating', async () => {
    let finishRead;
    markAsReadMock.mockImplementation(() => new Promise((resolve) => (finishRead = resolve)));
    mockNotifications = [
      {
        id: 12,
        type: 'custom',
        display_style: 'inline',
        title: 'Cancellation requested',
        message: 'Booking 42',
        action_url: '/dashboard/customer?order=42',
        created_at: new Date().toISOString(),
        read_at: null,
        data: { cancellation_request_id: 12 },
      },
    ];
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    fireEvent.click(await screen.findByRole('button', { name: /cancellation requested/i }));

    expect(markAsReadMock).toHaveBeenCalledWith(12);
    expect(pushMock).not.toHaveBeenCalled();
    finishRead({ success: true });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard/customer?order=42'));
    expect(screen.getByRole('button', { name: /mark as unread/i })).toBeInTheDocument();
  });

  test('keeps a cancellation unread when mark-as-read resolves with failure and still navigates once', async () => {
    markAsReadMock.mockResolvedValue({ success: false });
    mockNotifications = [
      {
        id: 12,
        type: 'custom',
        display_style: 'inline',
        title: 'Cancellation requested',
        message: 'Booking 42',
        action_url: '/dashboard/customer?order=42',
        created_at: new Date().toISOString(),
        read_at: null,
        data: { cancellation_request_id: 12 },
      },
    ];
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    fireEvent.click(await screen.findByRole('button', { name: /cancellation requested/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard/customer?order=42'));
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /mark as read/i })).toBeInTheDocument();
  });
});
