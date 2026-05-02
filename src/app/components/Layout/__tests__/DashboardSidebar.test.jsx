import { render, screen, fireEvent } from '@testing-library/react';
import { Home, Tag, Star, BarChart3, Settings, ClipboardCheck } from 'lucide-react';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/customer/overview',
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import DashboardSidebar from '../DashboardSidebar';

const NAV = [
  { title: 'Overview', icon: Home, url: '/dashboard/customer/overview', creatorOnly: true },
  { title: 'Bookings', icon: Tag, url: '/dashboard/customer' },
  { title: 'Reviews', icon: Star, url: '/dashboard/customer/reviews' },
  { title: 'Application Status', icon: ClipboardCheck, url: '/dashboard/customer/application-status', nonCreatorOnly: true },
  { title: 'Analytics', icon: BarChart3, url: '/dashboard/customer/analytics', creatorOnly: true },
  { title: 'Settings', icon: Settings, url: '/dashboard/customer/settings' },
];

describe('DashboardSidebar', () => {
  beforeAll(() => {
    if (!window.matchMedia) {
      window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      });
    }
  });

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows creatorOnly items to creators and hides nonCreatorOnly', () => {
    render(<DashboardSidebar nav={NAV} user={{ name: 'Khawla', is_creator: true }} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.queryByText('Application Status')).not.toBeInTheDocument();
  });

  it('shows nonCreatorOnly to non-creators and hides creatorOnly', () => {
    render(<DashboardSidebar nav={NAV} user={{ name: 'Anshul', is_creator: false }} />);
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    expect(screen.getByText('Application Status')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
  });

  it('marks the active item by pathname.startsWith match', () => {
    render(<DashboardSidebar nav={NAV} user={{ name: 'Khawla', is_creator: true }} />);
    const overviewLink = screen.getByText('Overview').closest('a');
    expect(overviewLink).toHaveAttribute('data-active', 'true');
  });

  it('toggles collapsed state on collapse button click', () => {
    render(<DashboardSidebar nav={NAV} user={{ name: 'Khawla', is_creator: true }} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /collapse|expand/i }));
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
  });

  it('renders avatar fallback initials from name', () => {
    render(<DashboardSidebar nav={NAV} user={{ name: 'Khawla Doe', is_creator: true }} />);
    expect(screen.getByText('KD')).toBeInTheDocument();
  });
});
