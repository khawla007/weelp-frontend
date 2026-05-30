import { render, screen } from '@testing-library/react';
import { AccountLinks } from '../AccountLinks';

const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

const ROUTES = [
  { title: 'Profile', url: '/dashboard/customer/settings/profile' },
  { title: 'Appearance', url: '/dashboard/customer/settings/appearance' },
  { title: 'Account', url: '/dashboard/customer/settings/account' },
];

describe('AccountLinks', () => {
  it('marks the route matching the current pathname as current', () => {
    mockPathname.mockReturnValue('/dashboard/customer/settings/appearance');
    render(<AccountLinks AccountRoutes={ROUTES} />);
    expect(screen.getByText('Appearance').closest('a')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Profile').closest('a')).not.toHaveAttribute('aria-current');
  });

  it('renders all routes as links (keyboard-reachable)', () => {
    mockPathname.mockReturnValue('/dashboard/customer/settings/profile');
    render(<AccountLinks AccountRoutes={ROUTES} />);
    ROUTES.forEach((r) => {
      expect(screen.getByText(r.title).closest('a')).toHaveAttribute('href', r.url);
    });
  });

  it('marks no route current when pathname matches none', () => {
    mockPathname.mockReturnValue('/dashboard/customer/somewhere-else');
    render(<AccountLinks AccountRoutes={ROUTES} />);
    ROUTES.forEach((r) => {
      expect(screen.getByText(r.title).closest('a')).not.toHaveAttribute('aria-current');
    });
  });
});
