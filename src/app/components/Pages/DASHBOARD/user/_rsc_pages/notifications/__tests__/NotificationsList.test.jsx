import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';

const markAsReadMock = jest.fn().mockResolvedValue({ success: true });
const fetchNotificationsMock = jest.fn();
const pushMock = jest.fn();
let mockRole = 'customer';
let mockNotifications = [{ id: 21, type: 'new_booking', display_style: 'popup', title: 'List Item 21', message: 'full body text', created_at: new Date().toISOString(), read_at: null, data: {} }];

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 7, role: mockRole } } }) }));
jest.mock('../../../../../../../../lib/services/notifications', () => ({
  fetchNotifications: (...args) => fetchNotificationsMock(...args),
  markAsRead: (...a) => markAsReadMock(...a),
  markUnread: jest.fn().mockResolvedValue({ success: true }),
}));

import NotificationsList from '../NotificationsList';

describe('NotificationsList', () => {
  beforeEach(() => {
    markAsReadMock.mockReset().mockResolvedValue({ success: true });
    fetchNotificationsMock.mockReset().mockImplementation(() =>
      Promise.resolve({
        success: true,
        data: { data: mockNotifications, current_page: 1, last_page: 1 },
      }),
    );
    pushMock.mockClear();
    mockRole = 'customer';
    mockNotifications = [{ id: 21, type: 'new_booking', display_style: 'popup', title: 'List Item 21', message: 'full body text', created_at: new Date().toISOString(), read_at: null, data: {} }];
  });

  test('renders rows and opens detail modal on click', async () => {
    render(<NotificationsList />);
    const row = await screen.findByText('List Item 21');
    fireEvent.click(row);
    const { within } = require('@testing-library/react');
    await waitFor(() => expect(within(screen.getByRole('dialog')).getByText('full body text')).toBeInTheDocument());
    expect(markAsReadMock).toHaveBeenCalledWith(21);
  });

  test.each([
    ['customer', '/dashboard/customer?order=42'],
    ['admin', '/dashboard/admin/orders?order=42'],
  ])('awaits read before navigating a %s cancellation row', async (role, actionUrl) => {
    let finishRead;
    mockRole = role;
    markAsReadMock.mockImplementation(() => new Promise((resolve) => (finishRead = resolve)));
    mockNotifications = [
      {
        id: 22,
        type: 'custom',
        display_style: 'inline',
        title: 'Cancellation requested',
        message: 'Booking 42',
        action_url: actionUrl,
        created_at: new Date().toISOString(),
        read_at: null,
        data: { cancellation_request_id: 22 },
      },
    ];
    render(<NotificationsList />);

    fireEvent.click(await screen.findByRole('button', { name: /cancellation requested/i }));
    expect(markAsReadMock).toHaveBeenCalledWith(22);
    expect(pushMock).not.toHaveBeenCalled();

    finishRead({ success: true });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(actionUrl));
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /mark as unread/i })).toBeInTheDocument();
  });

  test('keeps a failed cancellation read request unread and still navigates once', async () => {
    markAsReadMock.mockResolvedValue({ success: false });
    mockNotifications = [
      {
        id: 22,
        type: 'custom',
        display_style: 'inline',
        title: 'Cancellation requested',
        message: 'Booking 42',
        action_url: '/dashboard/customer?order=42',
        created_at: new Date().toISOString(),
        read_at: null,
        data: { cancellation_request_id: 22 },
      },
    ];
    render(<NotificationsList />);

    fireEvent.click(await screen.findByRole('button', { name: /cancellation requested/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard/customer?order=42'));
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /mark as read/i })).toBeInTheDocument();
  });

  test('shows a loading state while the first page is pending', () => {
    fetchNotificationsMock.mockImplementation(() => new Promise(() => {}));

    render(<NotificationsList />);

    expect(screen.getByText('Loading notifications…')).toBeInTheDocument();
  });

  test('shows an empty state for a successful empty inbox', async () => {
    mockNotifications = [];

    render(<NotificationsList />);

    expect(await screen.findByText('No notifications yet')).toBeInTheDocument();
  });

  test('shows a safe error state when the inbox cannot be loaded', async () => {
    fetchNotificationsMock.mockResolvedValue({ success: false, data: [] });

    render(<NotificationsList />);

    expect(await screen.findByText('Notifications could not be loaded. Please try again.')).toBeInTheDocument();
  });

  test('shows the same safe error state when loading rejects', async () => {
    fetchNotificationsMock.mockRejectedValue(new Error('network unavailable'));

    render(<NotificationsList />);

    expect(await screen.findByText('Notifications could not be loaded. Please try again.')).toBeInTheDocument();
  });

  test('keeps the current page and offers a retry when loading more fails', async () => {
    fetchNotificationsMock
      .mockResolvedValueOnce({
        success: true,
        data: { data: mockNotifications, current_page: 1, last_page: 2 },
      })
      .mockResolvedValueOnce({ success: false, data: [] })
      .mockResolvedValueOnce({
        success: true,
        data: {
          data: [{ id: 23, type: 'custom', display_style: 'inline', title: 'Retried older alert', message: 'Older body', created_at: new Date().toISOString(), read_at: null, data: {} }],
          current_page: 2,
          last_page: 2,
        },
      });
    render(<NotificationsList />);

    fireEvent.click(await screen.findByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('More notifications could not be loaded. Please try again.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('Retried older alert')).toBeInTheDocument();
    expect(fetchNotificationsMock).toHaveBeenNthCalledWith(2, 2);
    expect(fetchNotificationsMock).toHaveBeenNthCalledWith(3, 2);
  });

  test.each(['admin', 'super_admin'])('lets %s retry the first page once without duplicate requests', async (role) => {
    let finishRetry;
    mockRole = role;
    fetchNotificationsMock.mockResolvedValueOnce({ success: false, data: [] }).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRetry = resolve;
        }),
    );
    render(<NotificationsList />);

    const retry = await screen.findByRole('button', { name: 'Retry' });
    fireEvent.click(retry);
    fireEvent.click(retry);

    expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: 'Loading…' })).toBeDisabled();

    await act(async () => {
      finishRetry({
        success: true,
        data: {
          data: [{ id: 24, type: 'custom', display_style: 'inline', title: `${role} recovered alert`, message: 'Recovered body', created_at: new Date().toISOString(), read_at: null, data: {} }],
          current_page: 1,
          last_page: 1,
        },
      });
    });

    expect(await screen.findByText(`${role} recovered alert`)).toBeInTheDocument();
    expect(fetchNotificationsMock).toHaveBeenNthCalledWith(1, 1);
    expect(fetchNotificationsMock).toHaveBeenNthCalledWith(2, 1);
  });
});
