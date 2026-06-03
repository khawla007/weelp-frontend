import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const markAsReadMock = jest.fn().mockResolvedValue({ success: true });

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../../../../../../lib/services/notifications', () => ({
  fetchNotifications: jest.fn().mockResolvedValue({
    data: {
      data: [{ id: 21, type: 'new_booking', display_style: 'popup', title: 'List Item 21', message: 'full body text', created_at: new Date().toISOString(), read_at: null, data: {} }],
      current_page: 1,
      last_page: 1,
    },
  }),
  markAsRead: (...a) => markAsReadMock(...a),
  markUnread: jest.fn().mockResolvedValue({ success: true }),
}));

import NotificationsList from '../NotificationsList';

describe('NotificationsList', () => {
  beforeEach(() => markAsReadMock.mockClear());

  test('renders rows and opens detail modal on click', async () => {
    render(<NotificationsList />);
    const row = await screen.findByText('List Item 21');
    fireEvent.click(row);
    const { within } = require('@testing-library/react');
    await waitFor(() => expect(within(screen.getByRole('dialog')).getByText('full body text')).toBeInTheDocument());
    expect(markAsReadMock).toHaveBeenCalledWith(21);
  });
});
