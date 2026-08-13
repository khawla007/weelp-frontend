import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const createMock = jest.fn().mockResolvedValue({ success: true, count: 3 });
const fetchNotificationsMock = jest.fn();
const markAsReadMock = jest.fn().mockResolvedValue({ success: true });
const pushMock = jest.fn();
let mockRole = 'admin';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 7, role: mockRole } } }) }));
jest.mock('../../../../../../../lib/services/notifications', () => ({
  fetchNotifications: (...args) => fetchNotificationsMock(...args),
  markAsRead: (...args) => markAsReadMock(...args),
  markUnread: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock('../../../../../../../lib/services/adminNotifications', () => ({
  createNotification: (...a) => createMock(...a),
  searchUsers: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../_rsc_pages/media/MediaLibrary', () => ({
  Medialibrary: () => null,
}));

jest.mock('../../../../../../../lib/store/useMediaStore', () => ({
  useMediaStore: () => ({ selectedMedia: [], resetMedia: jest.fn() }),
}));

import NotificationsAdmin from '../NotificationsAdmin';

describe('NotificationsAdmin', () => {
  const pageOne = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    type: 'custom',
    display_style: 'inline',
    title: index === 8 ? 'Cancellation requested for booking 42' : `Admin alert ${index + 1}`,
    message: index === 8 ? 'Booking 42 needs attention' : `Alert body ${index + 1}`,
    action_url: index === 8 ? '/dashboard/admin/orders?order=42' : null,
    created_at: new Date(2026, 7, 12, 12, index).toISOString(),
    read_at: null,
    data: index === 8 ? { cancellation_request_id: 91 } : {},
  }));

  beforeEach(() => {
    createMock.mockClear();
    fetchNotificationsMock.mockReset().mockImplementation((page) =>
      Promise.resolve({
        success: true,
        data: {
          data:
            page === 2
              ? [{ id: 10, type: 'custom', display_style: 'inline', title: 'Older admin alert', message: 'Older body', created_at: new Date(2026, 7, 11).toISOString(), read_at: null, data: {} }]
              : pageOne,
          current_page: page,
          last_page: 2,
        },
      }),
    );
    markAsReadMock.mockReset().mockResolvedValue({ success: true });
    pushMock.mockClear();
    mockRole = 'admin';
  });

  test.each(['admin', 'super_admin'])('opens the authenticated %s inbox by default and keeps the composer in an explicit tab', async (role) => {
    mockRole = role;
    render(<NotificationsAdmin />);

    const inboxTab = screen.getByRole('tab', { name: 'Inbox' });
    expect(inboxTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Send notification' })).toHaveAttribute('aria-selected', 'false');
    expect(await screen.findByText('Admin alert 1')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).not.toBeVisible();
  });

  test('shows alerts beyond the bell limit and loads older pages', async () => {
    render(<NotificationsAdmin />);

    expect(await screen.findByText('Cancellation requested for booking 42')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));

    expect(await screen.findByText('Older admin alert')).toBeInTheDocument();
    expect(fetchNotificationsMock).toHaveBeenNthCalledWith(2, 2);
  });

  test.each(['admin', 'super_admin'])('awaits read before opening the exact %s cancellation order', async (role) => {
    let finishRead;
    mockRole = role;
    markAsReadMock.mockImplementation(() => new Promise((resolve) => (finishRead = resolve)));
    render(<NotificationsAdmin />);

    fireEvent.click(await screen.findByRole('button', { name: /cancellation requested for booking 42/i }));
    expect(markAsReadMock).toHaveBeenCalledWith(9);
    expect(pushMock).not.toHaveBeenCalled();

    finishRead({ success: true });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard/admin/orders?order=42'));
    expect(pushMock).toHaveBeenCalledTimes(1);
  });

  test('provides keyboard-accessible tab semantics', async () => {
    render(<NotificationsAdmin />);
    const inboxTab = screen.getByRole('tab', { name: 'Inbox' });
    const sendTab = screen.getByRole('tab', { name: 'Send notification' });

    inboxTab.focus();
    fireEvent.keyDown(inboxTab, { key: 'ArrowRight' });

    await waitFor(() => expect(sendTab).toHaveAttribute('aria-selected', 'true'));
    expect(sendTab).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Send notification');
  });

  test('preserves loaded inbox pages and an unfinished composer draft across tab switches', async () => {
    render(<NotificationsAdmin />);

    expect(await screen.findByText('Admin alert 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('Older admin alert')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Send notification' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Unfinished draft' } });
    fireEvent.click(screen.getByRole('tab', { name: 'Inbox' }));

    expect(screen.getByText('Older admin alert')).toBeInTheDocument();
    expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('tab', { name: 'Send notification' }));
    expect(screen.getByLabelText(/title/i)).toHaveValue('Unfinished draft');
  });

  test('composes and submits a role-targeted notification (default inline)', async () => {
    render(<NotificationsAdmin />);
    fireEvent.click(screen.getByRole('tab', { name: 'Send notification' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Promo' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Body text' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Promo',
        message: 'Body text',
        target_type: 'role',
        target_role: 'customer',
        display_style: 'inline',
      }),
    );
  });

  test('selecting Popup sends display_style popup', async () => {
    render(<NotificationsAdmin />);
    fireEvent.click(screen.getByRole('tab', { name: 'Send notification' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Coupon' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Deal' } });
    fireEvent.click(screen.getByLabelText(/popup/i));
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ display_style: 'popup' }));
  });

  test('sends coupon_code when entered', async () => {
    render(<NotificationsAdmin />);
    fireEvent.click(screen.getByRole('tab', { name: 'Send notification' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Coupon' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Save' } });
    fireEvent.change(screen.getByLabelText(/coupon code/i), { target: { value: 'SUMMER50' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ coupon_code: 'SUMMER50' }));
  });
});
