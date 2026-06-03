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
});
