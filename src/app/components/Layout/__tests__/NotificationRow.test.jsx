jest.mock('../../Navigation/NavigationLink', () => ({ __esModule: true, default: ({ href, children }) => <a href={href}>{children}</a> }));

import { render, screen, fireEvent } from '@testing-library/react';
import NotificationRow from '../NotificationRow';

const baseNotif = { id: 1, type: 'new_booking', title: 'New Booking', message: 'You got a booking', created_at: new Date().toISOString(), read_at: null, data: {} };

describe('NotificationRow', () => {
  test('clicking the row body calls onOpen', () => {
    const onOpen = jest.fn();
    const onToggleRead = jest.fn();
    render(<NotificationRow notif={baseNotif} onOpen={onOpen} onToggleRead={onToggleRead} />);
    fireEvent.click(screen.getByText('New Booking'));
    expect(onOpen).toHaveBeenCalledWith(baseNotif);
    expect(onToggleRead).not.toHaveBeenCalled();
  });

  test('clicking the envelope toggle calls onToggleRead but NOT onOpen', () => {
    const onOpen = jest.fn();
    const onToggleRead = jest.fn();
    render(<NotificationRow notif={baseNotif} onOpen={onOpen} onToggleRead={onToggleRead} />);
    fireEvent.click(screen.getByRole('button', { name: /mark as read/i }));
    expect(onToggleRead).toHaveBeenCalledWith(baseNotif);
    expect(onOpen).not.toHaveBeenCalled();
  });

  test('read notification shows "mark as unread" affordance', () => {
    const read = { ...baseNotif, read_at: new Date().toISOString() };
    render(<NotificationRow notif={read} onOpen={jest.fn()} onToggleRead={jest.fn()} />);
    expect(screen.getByRole('button', { name: /mark as unread/i })).toBeInTheDocument();
  });

  test('inline style with a derivable link shows a Visit button', () => {
    const inline = { ...baseNotif, display_style: 'inline', type: 'new_booking', data: {} };
    render(<NotificationRow notif={inline} onOpen={jest.fn()} onToggleRead={jest.fn()} />);
    expect(screen.getByRole('link', { name: /visit/i })).toBeInTheDocument();
  });

  test('popup style does not show a Visit button', () => {
    const popup = { ...baseNotif, display_style: 'popup', type: 'custom', action_url: '/x', data: {} };
    render(<NotificationRow notif={popup} onOpen={jest.fn()} onToggleRead={jest.fn()} />);
    expect(screen.queryByRole('link', { name: /visit/i })).not.toBeInTheDocument();
  });
});
