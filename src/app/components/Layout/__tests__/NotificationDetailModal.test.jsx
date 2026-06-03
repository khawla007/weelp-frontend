import { render, screen } from '@testing-library/react';
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
});
