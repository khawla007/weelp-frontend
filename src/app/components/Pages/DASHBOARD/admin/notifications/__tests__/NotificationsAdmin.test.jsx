import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const createMock = jest.fn().mockResolvedValue({ success: true, count: 3 });
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
  beforeEach(() => createMock.mockClear());

  test('composes and submits a role-targeted notification (default inline)', async () => {
    render(<NotificationsAdmin />);
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
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Coupon' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Deal' } });
    fireEvent.click(screen.getByLabelText(/popup/i));
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ display_style: 'popup' }));
  });
});
