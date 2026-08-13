const pushMock = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

jest.mock('../../Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children, onClick, onKeyDown }) => (
    <a href={`#${href}`} onClick={onClick} onKeyDown={onKeyDown}>
      {children}
    </a>
  ),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationRow from '../NotificationRow';

const baseNotif = { id: 1, type: 'new_booking', title: 'New Booking', message: 'You got a booking', created_at: new Date().toISOString(), read_at: null, data: {} };
const cancellationNotif = {
  ...baseNotif,
  id: 9,
  type: 'custom',
  display_style: 'inline',
  title: 'Cancellation requested',
  action_url: '/dashboard/customer?order=42',
  data: { cancellation_request_id: 12 },
};

describe('NotificationRow', () => {
  beforeEach(() => {
    pushMock.mockClear();
    jest.restoreAllMocks();
  });

  test('clicking the row body calls onOpen', () => {
    const onOpen = jest.fn();
    const onToggleRead = jest.fn();
    render(<NotificationRow notif={baseNotif} onOpen={onOpen} onToggleRead={onToggleRead} />);
    fireEvent.click(screen.getByText('New Booking'));
    expect(onOpen).toHaveBeenCalledWith(baseNotif);
    expect(onToggleRead).not.toHaveBeenCalled();
  });

  test('clicking the row body navigates to the same link as Visit', async () => {
    render(<NotificationRow notif={baseNotif} onOpen={jest.fn()} onToggleRead={jest.fn()} />);
    fireEvent.click(screen.getByText('New Booking'));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard/customer/earnings'));
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

  test('legacy internal navigation is immediate when its read request never settles', () => {
    const onOpen = jest.fn(() => new Promise(() => {}));
    render(<NotificationRow notif={baseNotif} onOpen={onOpen} onToggleRead={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /new booking/i }));

    expect(onOpen).toHaveBeenCalledWith(baseNotif);
    expect(pushMock).toHaveBeenCalledWith('/dashboard/customer/earnings');
    expect(pushMock).toHaveBeenCalledTimes(1);
  });

  test('legacy Visit keeps native navigation immediate while read remains pending', () => {
    const onOpen = jest.fn(() => new Promise(() => {}));
    render(<NotificationRow notif={baseNotif} onOpen={onOpen} onToggleRead={jest.fn()} />);
    const visit = screen.getByRole('link', { name: /visit/i });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });

    fireEvent(visit, click);

    expect(click.defaultPrevented).toBe(false);
    expect(onOpen).toHaveBeenCalledWith(baseNotif);
    expect(pushMock).not.toHaveBeenCalled();
  });

  test.each([
    ['click', (row) => fireEvent.click(row)],
    ['Enter', (row) => fireEvent.keyDown(row, { key: 'Enter' })],
    ['Space', (row) => fireEvent.keyDown(row, { key: ' ' })],
  ])('awaits read before navigating a cancellation on %s activation', async (_name, activateRow) => {
    const events = [];
    let finishRead;
    const onOpen = jest.fn(
      () =>
        new Promise((resolve) => {
          events.push('read-start');
          finishRead = () => {
            events.push('read-finish');
            resolve();
          };
        }),
    );
    pushMock.mockImplementation(() => events.push('navigate'));
    render(<NotificationRow notif={cancellationNotif} onOpen={onOpen} onToggleRead={jest.fn()} role="customer" />);

    activateRow(screen.getByRole('button', { name: /cancellation requested/i }));
    expect(events).toEqual(['read-start']);

    finishRead();
    await waitFor(() => expect(events).toEqual(['read-start', 'read-finish', 'navigate']));
    expect(pushMock).toHaveBeenCalledTimes(1);
  });

  test('navigates a cancellation exactly once when marking the row read rejects', async () => {
    render(<NotificationRow notif={cancellationNotif} onOpen={jest.fn().mockRejectedValue(new Error('read failed'))} onToggleRead={jest.fn()} role="customer" />);

    fireEvent.click(screen.getByRole('button', { name: /cancellation requested/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
  });

  test('Visit prevents native navigation, awaits read, and navigates exactly once', async () => {
    let finishRead;
    const onOpen = jest.fn(() => new Promise((resolve) => (finishRead = resolve)));
    render(<NotificationRow notif={cancellationNotif} onOpen={onOpen} onToggleRead={jest.fn()} role="customer" />);
    const visit = screen.getByRole('link', { name: /visit/i });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopPropagation = jest.spyOn(click, 'stopPropagation');

    fireEvent(visit, click);
    expect(click.defaultPrevented).toBe(true);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();

    finishRead();
    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
  });

  test('Visit still navigates exactly once when marking read rejects', async () => {
    render(<NotificationRow notif={cancellationNotif} onOpen={jest.fn().mockRejectedValue(new Error('read failed'))} onToggleRead={jest.fn()} role="customer" />);

    fireEvent.click(screen.getByRole('link', { name: /visit/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
  });

  test.each(['Enter', ' '])('Visit %p stops propagation and navigates exactly once', async (key) => {
    const onOpen = jest.fn().mockResolvedValue(undefined);
    render(<NotificationRow notif={cancellationNotif} onOpen={onOpen} onToggleRead={jest.fn()} role="customer" />);
    const visit = screen.getByRole('link', { name: /visit/i });
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    const stopPropagation = jest.spyOn(event, 'stopPropagation');

    fireEvent(visit, event);

    expect(event.defaultPrevented).toBe(true);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  test.each(['Enter', ' '])('read toggle %p changes read state without opening or navigating', async (key) => {
    const onOpen = jest.fn();
    const onToggleRead = jest.fn().mockResolvedValue(undefined);
    render(<NotificationRow notif={baseNotif} onOpen={onOpen} onToggleRead={onToggleRead} />);

    fireEvent.keyDown(screen.getByRole('button', { name: /mark as read/i }), { key });

    expect(onToggleRead).toHaveBeenCalledTimes(1);
    expect(onToggleRead).toHaveBeenCalledWith(baseNotif);
    expect(onOpen).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('legacy external navigation opens the final URL immediately while read remains pending', () => {
    const openWindow = jest.spyOn(window, 'open').mockReturnValue(null);
    const onOpen = jest.fn(() => new Promise(() => {}));
    const external = { ...baseNotif, display_style: 'inline', type: 'custom', action_url: 'https://weelp.com/trip' };
    render(<NotificationRow notif={external} onOpen={onOpen} onToggleRead={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /new booking/i }));

    expect(openWindow).toHaveBeenCalledWith('https://weelp.com/trip', '_blank', 'noopener,noreferrer');
    expect(openWindow).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(external);
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('contains legacy read and browser failures after attempting external navigation once', async () => {
    const openWindow = jest.spyOn(window, 'open').mockImplementation(() => {
      throw new Error('browser blocked');
    });
    const onOpen = jest.fn().mockRejectedValue(new Error('read failed'));
    const external = { ...baseNotif, display_style: 'inline', type: 'custom', action_url: 'https://weelp.com/trip' };
    render(<NotificationRow notif={external} onOpen={onOpen} onToggleRead={jest.fn()} />);

    expect(() => fireEvent.click(screen.getByRole('button', { name: /new booking/i }))).not.toThrow();
    await Promise.resolve();
    expect(openWindow).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('coalesces rapid cancellation activation into one read and one internal navigation', async () => {
    let finishRead;
    const onOpen = jest.fn(() => new Promise((resolve) => (finishRead = resolve)));
    render(<NotificationRow notif={cancellationNotif} onOpen={onOpen} onToggleRead={jest.fn()} role="customer" />);

    fireEvent.click(screen.getByRole('button', { name: /cancellation requested/i }));
    fireEvent.click(screen.getByRole('link', { name: /visit/i }));
    fireEvent.keyDown(screen.getByRole('button', { name: /cancellation requested/i }), { key: 'Enter' });

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();
    finishRead();
    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /cancellation requested/i }));
    expect(onOpen).toHaveBeenCalledTimes(2);
    finishRead();
    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(2));
  });
});
