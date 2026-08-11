import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import MobileMenu, { MobileTopStrip } from '../MobileMenu';

const mockUseSession = jest.fn();
let mockPathname = '/';
const mockMiniCartState = {
  isMiniCartOpen: false,
  setMiniCartOpen: jest.fn(),
  cartItems: [],
};

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: () => mockUseSession(),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('../../Modals/ModalForm', () => ({
  __esModule: true,
  default: ({ showForm }) => (showForm ? <div role="dialog" aria-label="Search trips" /> : null),
}));

jest.mock('@/lib/store/useMiniCartStore', () => {
  return {
    __esModule: true,
    default: (selector) => selector(mockMiniCartState),
  };
});

jest.mock('@/hooks/api/public/menu/megaMenu', () => ({
  __esModule: true,
  useMegaMenu: () => ({ regions: [], trending: [], isLoading: false, error: null }),
}));

jest.mock('@/lib/config/brand', () => ({
  __esModule: true,
  getLogoUrl: () => '/logo.svg',
}));

jest.mock('@/components/ui/theme-toggle', () => ({
  __esModule: true,
  ThemeToggle: () => <button type="button">Theme</button>,
}));

const getTopStrip = () => screen.getByText('Get Exclusive offer on the App').closest('.grid')?.parentElement;

describe('MobileMenu', () => {
  beforeEach(() => {
    mockPathname = '/';
    mockUseSession.mockReturnValue({ data: null });
    mockMiniCartState.cartItems = [];
  });

  it('keeps the mobile cart count white for dark-mode contrast', () => {
    mockMiniCartState.cartItems = [{ id: 1 }];

    render(<MobileMenu stickyHeader variant="solid" showTopStrip={false} />);

    const cartButton = screen.getByRole('button', { name: 'Open cart, 1 item' });
    expect(cartButton.querySelector('.animate-badge-pulse')).toHaveClass('text-white', 'dark:bg-weelp-sage-deep', 'dark:hover:bg-weelp-sage-deep');
  });

  it('shows the mobile top strip before the header becomes sticky', () => {
    render(<MobileMenu stickyHeader={false} />);

    const topStrip = getTopStrip();
    expect(topStrip).not.toHaveAttribute('aria-hidden', 'true');
    expect(topStrip).toHaveClass('border-b', 'max-h-24');
    expect(topStrip).not.toHaveClass('pointer-events-none');
  });

  it('hides the mobile top strip after the header becomes sticky', () => {
    render(<MobileMenu stickyHeader />);

    const topStrip = getTopStrip();
    expect(topStrip).toHaveAttribute('aria-hidden', 'true');
    expect(topStrip).toHaveClass('border-b-0', 'max-h-0', 'pointer-events-none');
  });

  it('does not switch solid mobile pages to fixed positioning on scroll', () => {
    const { container } = render(<MobileMenu stickyHeader variant="solid" />);

    const mobileMenu = container.querySelector('[data-weelp-mobile-menu]');

    expect(mobileMenu).not.toHaveClass('fixed', 'top-0', 'left-0', 'right-0');
  });

  it('can render only the sticky mobile main bar for solid page headers', () => {
    render(<MobileMenu stickyHeader variant="solid" showTopStrip={false} />);

    expect(screen.queryByText('Get Exclusive offer on the App')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open main navigation' })).toBeInTheDocument();
  });

  it('keeps the over-hero mobile menu fixed after scroll', () => {
    const { container } = render(<MobileMenu stickyHeader variant="over-hero" />);

    const mobileMenu = container.querySelector('[data-weelp-mobile-menu]');

    expect(mobileMenu).toHaveClass('fixed', 'top-0', 'left-0', 'right-0');
  });

  it('uses a transparent top strip over the home hero before scroll', () => {
    render(<MobileMenu stickyHeader={false} variant="over-hero" />);

    const topStrip = getTopStrip();
    expect(topStrip).toHaveClass('border-transparent', 'bg-transparent');
    expect(topStrip).not.toHaveClass('bg-surface-tint');
  });

  it('uses 8px vertical padding for the mobile top strip at every viewport', () => {
    render(<MobileMenu stickyHeader={false} variant="over-hero" />);

    const topStripGrid = screen.getByText('Get Exclusive offer on the App').closest('.grid');
    const offerPill = screen.getByText('Get Exclusive offer on the App').closest('.inline-flex');

    expect(topStripGrid).toHaveClass('px-3', 'py-2', 'sm:px-4');
    expect(offerPill).toHaveClass('py-1', 'sm:py-1.5');
    expect(topStripGrid).not.toHaveClass('py-2.5', 'sm:h-[46px]', 'sm:py-0');
  });

  it('uses content-driven height for the solid mobile and tablet top strip', () => {
    render(<MobileTopStrip topStripVisible topStripOverHero={false} collapsible={false} />);

    const topStrip = getTopStrip();
    const topStripGrid = screen.getByText('Get Exclusive offer on the App').closest('.grid');

    expect(topStrip).not.toHaveClass('h-[46px]', 'sm:h-[55px]');
    expect(topStripGrid).toHaveClass('py-2');
    expect(topStripGrid).not.toHaveClass('sm:h-[46px]', 'sm:py-0');
  });

  it('gives both mobile brand links a minimum 44px touch target', () => {
    render(<MobileMenu stickyHeader={false} />);

    expect(screen.getByRole('link', { name: /weelp weelp\./i })).toHaveClass('min-h-11');

    fireEvent.click(screen.getByRole('button', { name: 'Open main navigation' }));

    expect(screen.getByRole('link', { name: /weelp weelp\./i })).toHaveClass('min-h-11');
  });

  it('opens the booking search modal and closes the navigation sheet from the mobile search action', async () => {
    render(<MobileMenu stickyHeader={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open main navigation' }));
    const searchAction = screen.getByRole('button', { name: 'Search trips' });

    expect(searchAction).not.toHaveAttribute('href');
    fireEvent.click(searchAction);

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Main navigation' })).not.toBeInTheDocument());
    expect(screen.getByRole('dialog', { name: 'Search trips' })).toBeInTheDocument();
  });

  it('closes the navigation sheet when the route changes', async () => {
    mockPathname = '/explore-creators';
    const { rerender } = render(<MobileMenu stickyHeader variant="solid" />);

    fireEvent.click(screen.getByRole('button', { name: 'Open main navigation' }));
    expect(screen.getByRole('heading', { name: 'Main navigation' })).toBeInTheDocument();

    mockPathname = '/tours-experiences';
    rerender(<MobileMenu stickyHeader variant="solid" />);

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Main navigation' })).not.toBeInTheDocument());
  });

  it('closes the navigation sheet immediately when the current-route link is clicked', async () => {
    mockPathname = '/tours-experiences';
    render(<MobileMenu stickyHeader variant="solid" />);

    fireEvent.click(screen.getByRole('button', { name: 'Open main navigation' }));
    const currentRouteLink = screen.getByRole('link', { name: 'Tours & Experiences' });
    currentRouteLink.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(currentRouteLink);

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Main navigation' })).not.toBeInTheDocument());
  });

  it('opens the account dropdown instead of navigating when an authenticated user taps their initials', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Atul Sharma',
          role: 'customer',
          is_creator: true,
        },
      },
    });

    render(<MobileMenu stickyHeader={false} />);

    const accountTrigger = screen.getByRole('button', { name: 'Open account menu' });
    expect(accountTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Open account' })).not.toBeInTheDocument();

    fireEvent.click(accountTrigger);

    expect(accountTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Customer & Creator')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard/customer/overview');
  });
});
