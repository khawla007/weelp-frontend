import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const markAsReadMock = jest.fn().mockResolvedValue({ success: true });

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 7 } } }) }));
jest.mock('../../../../lib/services/notifications', () => ({
  fetchPopupNotifications: jest.fn().mockResolvedValue([{ id: 99, type: 'custom', display_style: 'popup', title: 'Coupon', message: 'Body', created_at: new Date().toISOString(), action_url: '/x', data: { images: [] } }]),
  markAsRead: (...a) => markAsReadMock(...a),
}));
jest.mock('../../Navigation/NavigationLink', () => ({ __esModule: true, default: ({ href, children }) => <a href={href}>{children}</a> }));

import NotificationPopupHost from '../NotificationPopupHost';

describe('NotificationPopupHost', () => {
  beforeEach(() => markAsReadMock.mockClear());

  test('auto-opens the latest popup and marks it read on close', async () => {
    render(<NotificationPopupHost />);
    await waitFor(() => expect(screen.getByText('Coupon')).toBeInTheDocument());
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(markAsReadMock).toHaveBeenCalledWith(99));
  });
});
