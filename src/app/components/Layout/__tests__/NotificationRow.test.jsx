const pushMock = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

jest.mock('../../Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children, onClick }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import NotificationRow from '../NotificationRow';

const baseNotif = { id: 1, type: 'new_booking', title: 'New Booking', message: 'You got a booking', created_at: new Date().toISOString(), read_at: null, data: {} };

describe('NotificationRow', () => {
  beforeEach(() => pushMock.mockClear());

  test('clicking the row body calls onOpen', () => {
    const onOpen = jest.fn();
    const onToggleRead = jest.fn();
    render(<NotificationRow notif={baseNotif} onOpen={onOpen} onToggleRead={onToggleRead} />);
    fireEvent.click(screen.getByText('New Booking'));
    expect(onOpen).toHaveBeenCalledWith(baseNotif);
    expect(onToggleRead).not.toHaveBeenCalled();
  });

  test('clicking the row body navigates to the same link as Visit', () => {
    render(<NotificationRow notif={baseNotif} onOpen={jest.fn()} onToggleRead={jest.fn()} />);
    fireEvent.click(screen.getByText('New Booking'));
    expect(pushMock).toHaveBeenCalledWith('/dashboard/customer/earnings');
  });

  test('clicking the envelope toggle calls onToggleRead but NOT onOpen or navigate', () => {
    const onOpen = jest.fn();
    const onToggleRead = jest.fn();
    render(<NotificationRow notif={baseNotif} onOpen={onOpen} onToggleRead={onToggleRead} />);
    fireEvent.click(screen.getByRole('button', { name: /mark as read/i }));
    expect(onToggleRead).toHaveBeenCalledWith(baseNotif);
    expect(onOpen).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('read notification shows "mark as unread" affordance + open envelope', () => {
    const read = { ...baseNotif, read_at: new Date().toISOString() };
    render(<NotificationRow notif={read} onOpen={jest.fn()} onToggleRead={jest.fn()} />);
    expect(screen.getByRole('button', { name: /mark as unread/i })).toBeInTheDocument();
  });

  test('inline style with a derivable link shows a Visit button', () => {
    const inline = { ...baseNotif, display_style: 'inline', type: 'new_booking', data: {} };
    render(<NotificationRow notif={inline} onOpen={jest.fn()} onToggleRead={jest.fn()} />);
    expect(screen.getByRole('link', { name: /visit/i })).toBeInTheDocument();
  });

  test('popup style: no Visit button, row click opens (onOpen) without navigating', () => {
    const onOpen = jest.fn();
    const popup = { ...baseNotif, display_style: 'popup', type: 'custom', action_url: '/x', data: {} };
    render(<NotificationRow notif={popup} onOpen={onOpen} onToggleRead={jest.fn()} />);
    expect(screen.queryByRole('link', { name: /visit/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('New Booking'));
    expect(onOpen).toHaveBeenCalledWith(popup);
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('clicking the inline Visit link marks the row read (calls onOpen)', () => {
    const onOpen = jest.fn();
    const inline = { ...baseNotif, display_style: 'inline', type: 'new_booking', data: {} };
    render(<NotificationRow notif={inline} onOpen={onOpen} onToggleRead={jest.fn()} />);
    fireEvent.click(screen.getByRole('link', { name: /visit/i }));
    expect(onOpen).toHaveBeenCalledWith(inline);
  });
});
