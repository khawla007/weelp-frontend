import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationDetailModal from '../NotificationDetailModal';

jest.mock('../../Navigation/NavigationLink', () => ({ __esModule: true, default: ({ href, children }) => <a href={href}>{children}</a> }));

describe('NotificationDetailModal — Phase 2', () => {
  test('renders snapshotted images from data.images', () => {
    const notif = { id: 1, type: 'custom', title: 'Pics', message: 'body', created_at: new Date().toISOString(), data: { images: ['https://cdn/a.jpg'] } };
    render(<NotificationDetailModal notif={notif} onClose={() => {}} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://cdn/a.jpg');
  });

  test('CTA uses action_url over derived link', () => {
    const notif = { id: 2, type: 'custom', title: 'T', message: 'b', created_at: new Date().toISOString(), action_url: '/dashboard/customer/settings/account', data: null };
    render(<NotificationDetailModal notif={notif} onClose={() => {}} />);
    expect(screen.getByText('View details').closest('a')).toHaveAttribute('href', '/dashboard/customer/settings/account');
  });

  test('renders Copy code button (not View details) when data.coupon_code present', async () => {
    const writeText = jest.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });
    const notif = { id: 3, type: 'custom', display_style: 'popup', title: 'Coupon', message: 'Save', created_at: new Date().toISOString(), action_url: '/x', data: { coupon_code: 'SUMMER50' } };
    render(<NotificationDetailModal notif={notif} onClose={() => {}} />);
    expect(screen.queryByText('View details')).not.toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /copy code/i });
    fireEvent.click(btn);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('SUMMER50'));
  });
});
