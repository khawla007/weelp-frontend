import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import MobileMenu from '../MobileMenu';

const mockUseSession = jest.fn();

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: () => mockUseSession(),
}));

jest.mock('@/lib/store/useMiniCartStore', () => {
  const state = {
    isMiniCartOpen: false,
    setMiniCartOpen: jest.fn(),
    cartItems: [],
  };
  return {
    __esModule: true,
    default: (selector) => selector(state),
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
    mockUseSession.mockReturnValue({ data: null });
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

  it('keeps over-hero top strip spacing aligned with solid mobile pages', () => {
    render(<MobileMenu stickyHeader={false} variant="over-hero" />);

    const topStripGrid = screen.getByText('Get Exclusive offer on the App').closest('.grid');
    const offerPill = screen.getByText('Get Exclusive offer on the App').closest('.inline-flex');

    expect(topStripGrid).toHaveClass('px-3', 'py-2.5', 'sm:px-4', 'sm:py-3');
    expect(offerPill).toHaveClass('py-1', 'sm:py-1.5');
    expect(topStripGrid).not.toHaveClass('pt-[18px]', 'pb-1.5');
  });

  it('gives both mobile brand links a minimum 44px touch target', () => {
    render(<MobileMenu stickyHeader={false} />);

    expect(screen.getByRole('link', { name: /weelp weelp\./i })).toHaveClass('min-h-11');

    fireEvent.click(screen.getByRole('button', { name: 'Open main navigation' }));

    expect(screen.getByRole('link', { name: /weelp weelp\./i })).toHaveClass('min-h-11');
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
