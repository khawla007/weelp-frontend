import React from 'react';
import { render, screen } from '@testing-library/react';

import MobileMenu from '../MobileMenu';

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: () => ({ data: null }),
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
  it('shows the mobile top strip before the header becomes sticky', () => {
    render(<MobileMenu stickyHeader={false} />);

    const topStrip = getTopStrip();
    expect(topStrip).not.toHaveAttribute('aria-hidden', 'true');
    expect(topStrip).toHaveClass('border-b', 'opacity-100', 'max-h-24');
  });

  it('hides the mobile top strip after the header becomes sticky', () => {
    render(<MobileMenu stickyHeader />);

    const topStrip = getTopStrip();
    expect(topStrip).toHaveAttribute('aria-hidden', 'true');
    expect(topStrip).toHaveClass('border-b-0', 'opacity-0', 'max-h-0', 'pointer-events-none');
  });

  it('uses a transparent top strip over the home hero before scroll', () => {
    render(<MobileMenu stickyHeader={false} variant="over-hero" />);

    const topStrip = getTopStrip();
    expect(topStrip).toHaveClass('border-transparent', 'bg-transparent');
    expect(topStrip).not.toHaveClass('bg-surface-tint');
  });
});
