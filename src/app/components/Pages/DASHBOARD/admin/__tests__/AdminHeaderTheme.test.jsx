import { act, fireEvent, render, screen } from '@testing-library/react';

import AdminHeader from '../header';
import { searchDashboard } from '@/lib/services/dashboard';

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ isMobile: false, toggleSidebar: jest.fn() }),
}));

jest.mock('@/lib/services/dashboard', () => ({
  searchDashboard: jest.fn(),
}));

jest.mock('../../UserMenu', () => ({
  __esModule: true,
  default: () => <div>User menu</div>,
}));

jest.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">Theme toggle</button>,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AdminHeader search theme surface', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('uses the semantic popover surface for populated search results', async () => {
    searchDashboard.mockResolvedValue([
      {
        id: 7,
        type: 'activity',
        title: 'Desert safari',
        subtitle: 'Dubai',
        url: '/dashboard/admin/activities/7',
      },
    ]);

    const { container } = render(<AdminHeader session={{ user: {} }} />);

    expect(container.querySelector('header')).toHaveClass('border-border', 'bg-background/95', 'backdrop-blur');

    fireEvent.change(screen.getByPlaceholderText('Search orders, users, activities...'), { target: { value: 'de' } });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });

    expect(await screen.findByText('Desert safari')).toBeInTheDocument();

    const dropdown = container.querySelector('.absolute.top-full');
    expect(dropdown).toHaveClass('bg-popover', 'text-popover-foreground', 'border-border');
    expect(dropdown).not.toHaveClass('dark:bg-foreground');
  });
});
