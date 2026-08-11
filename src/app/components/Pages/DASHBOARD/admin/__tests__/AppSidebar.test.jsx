import { render, screen } from '@testing-library/react';
import { getLogoUrl } from '@/lib/config/brand';
import { AppSidebar } from '../app-sidebar';

const mockNavMain = jest.fn(() => <nav aria-label="Admin navigation" />);

jest.mock('../nav-main', () => ({
  NavMain: (props) => mockNavMain(props),
}));

jest.mock('@/hooks/api/admin/navigationUnseen', () => ({
  useAdminNavigationUnseen: () => ({ counts: { orders: 4, reviews: 2 } }),
}));

jest.mock('@/constants/navigations/AdminNavigation', () => ({
  DashboardAdminNav: { adminRoutes: [] },
}));

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }) => <aside>{children}</aside>,
  SidebarContent: ({ children }) => <div>{children}</div>,
  SidebarHeader: ({ children }) => <header>{children}</header>,
  SidebarRail: () => <button type="button">Sidebar rail</button>,
  useSidebar: () => ({
    state: 'expanded',
    open: true,
    toggleSidebar: jest.fn(),
    isMobile: false,
  }),
}));

describe('AppSidebar', () => {
  beforeEach(() => {
    mockNavMain.mockClear();
  });

  it('uses the same theme-readable brand treatment as the public frontend', () => {
    render(<AppSidebar session={null} />);

    const logo = screen.getByRole('img', { name: 'Weelp' });

    expect(logo).toHaveAttribute('src', getLogoUrl());
    expect(logo.closest('a')).toHaveAttribute('href', '/');
    expect(logo.closest('a')).toHaveAttribute('target', '_blank');
    expect(logo.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('Weelp.')).toHaveClass('text-foreground');
  });

  it('passes unseen navigation counts to the main navigation', () => {
    render(<AppSidebar session={null} />);

    expect(mockNavMain).toHaveBeenCalledWith({
      items: [],
      counts: { orders: 4, reviews: 2 },
    });
  });
});
