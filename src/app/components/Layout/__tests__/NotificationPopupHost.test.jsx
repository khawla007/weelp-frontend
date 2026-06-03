import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const markAsReadMock = jest.fn().mockResolvedValue({ success: true });
const dismissIdsMock = jest.fn();
const fetchPopupNotificationsMock = jest.fn();
const fetchPopupAnnouncementsMock = jest.fn();
let sessionData = null;

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: sessionData }) }));
jest.mock('swr', () => ({ useSWRConfig: () => ({ mutate: jest.fn() }) }));
jest.mock('../../../../lib/services/notifications', () => ({
  fetchPopupNotifications: (...a) => fetchPopupNotificationsMock(...a),
  markAsRead: (...a) => markAsReadMock(...a),
}));
jest.mock('../../../../lib/services/announcements', () => ({
  fetchPopupAnnouncements: (...a) => fetchPopupAnnouncementsMock(...a),
}));
jest.mock('../../../../lib/announcements/readState', () => ({
  getDismissedIds: () => [],
  dismissIds: (...a) => dismissIdsMock(...a),
}));
jest.mock('../../Navigation/NavigationLink', () => ({ __esModule: true, default: ({ href, children }) => <a href={href}>{children}</a> }));

import NotificationPopupHost from '../NotificationPopupHost';

const ann = { id: 5, type: 'offer', title: 'Site Coupon', message: 'Save', link: '/x', image_url: 'https://cdn/a.jpg', coupon_code: 'SAVE10', created_at: new Date().toISOString() };

describe('NotificationPopupHost', () => {
  beforeEach(() => {
    sessionData = null;
    markAsReadMock.mockClear();
    dismissIdsMock.mockClear();
    fetchPopupNotificationsMock.mockReset().mockResolvedValue([]);
    fetchPopupAnnouncementsMock.mockReset().mockResolvedValue([]);
  });

  test('guest sees a popup announcement and dismiss writes localStorage', async () => {
    fetchPopupAnnouncementsMock.mockResolvedValue([ann]);
    render(<NotificationPopupHost />);
    await waitFor(() => expect(screen.getByText('Site Coupon')).toBeInTheDocument());
    expect(fetchPopupNotificationsMock).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(dismissIdsMock).toHaveBeenCalledWith([5], [5]));
    expect(markAsReadMock).not.toHaveBeenCalled();
  });

  test('logged-in unions personal + announcement, dismiss of personal marks read', async () => {
    sessionData = { user: { id: 7 } };
    const personal = { id: 99, type: 'custom', display_style: 'popup', title: 'Personal Popup', message: 'b', action_url: '/y', created_at: new Date(Date.now() + 1000).toISOString(), data: {} };
    fetchPopupAnnouncementsMock.mockResolvedValue([ann]);
    fetchPopupNotificationsMock.mockResolvedValue([personal]);
    render(<NotificationPopupHost />);
    await waitFor(() => expect(screen.getByText('Personal Popup')).toBeInTheDocument());
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(markAsReadMock).toHaveBeenCalledWith(99));
    expect(dismissIdsMock).not.toHaveBeenCalled();
  });
});
