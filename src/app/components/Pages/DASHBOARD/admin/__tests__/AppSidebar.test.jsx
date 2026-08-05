import { render, screen } from '@testing-library/react';
import { getLogoUrl } from '@/lib/config/brand';
import { AppSidebar } from '../app-sidebar';

jest.mock('../nav-main', () => ({
  NavMain: () => <nav aria-label="Admin navigation" />,
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
  it('uses the same theme-readable brand treatment as the public frontend', () => {
    render(<AppSidebar session={null} />);

    expect(screen.getByRole('img', { name: 'Weelp' })).toHaveAttribute('src', getLogoUrl());
    expect(screen.getByText('Weelp.')).toHaveClass('text-foreground');
  });
});
