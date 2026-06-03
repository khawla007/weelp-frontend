import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const markSeenMock = jest.fn().mockResolvedValue({ success: true });

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 7 } } }) }));
jest.mock('swr', () => ({
  __esModule: true,
  default: (key) => ({ data: Array.isArray(key) ? { count: 2 } : [], mutate: jest.fn() }),
}));
jest.mock('../../../../hooks/useIsClient', () => ({ __esModule: true, useIsClient: () => true }));
// Mocked via relative path: the @/ alias does not resolve in jest.mock's
// module lookup, but this resolves to the same file the component imports.
jest.mock('../../../../lib/services/notifications', () => ({
  fetchUnreadCount: jest.fn().mockResolvedValue({ success: true, count: 2 }),
  fetchNotifications: jest.fn().mockResolvedValue({ data: { data: [] } }),
  markAsRead: jest.fn().mockResolvedValue({ success: true }),
  markAllAsRead: jest.fn().mockResolvedValue({ success: true }),
  markSeen: (...args) => markSeenMock(...args),
}));
jest.mock('../../../../lib/services/announcements', () => ({ fetchAnnouncements: jest.fn().mockResolvedValue([]) }));

import NotificationBell from '../NotificationBell';

describe('NotificationBell (logged in) — seen on open', () => {
  beforeEach(() => markSeenMock.mockClear());

  test('calls markSeen when the dropdown opens', async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await waitFor(() => expect(markSeenMock).toHaveBeenCalledTimes(1));
  });
});
