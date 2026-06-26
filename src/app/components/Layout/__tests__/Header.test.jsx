import React from 'react';
import { act, render, screen } from '@testing-library/react';

import Header from '../header';

const usePathnameMock = jest.fn();

jest.mock('next/navigation', () => ({
  __esModule: true,
  usePathname: () => usePathnameMock(),
}));

jest.mock('../NavigationMenu', () => {
  const DesktopMenuMock = ({ stickyHeader, variant }) => <div data-testid="desktop-menu" data-sticky={stickyHeader ? 'true' : 'false'} data-variant={variant} />;
  DesktopMenuMock.displayName = 'DesktopMenuMock';
  const DesktopTopStripMock = ({ topStripVisible, collapsible }) => (
    <div data-testid="desktop-top-strip" data-visible={topStripVisible ? 'true' : 'false'} data-collapsible={collapsible ? 'true' : 'false'} />
  );
  DesktopTopStripMock.displayName = 'DesktopTopStripMock';
  const DesktopMainBarMock = ({ stickyHeader, mainBarTransparent }) => (
    <div data-testid="desktop-main-bar" data-sticky={stickyHeader ? 'true' : 'false'} data-transparent={mainBarTransparent ? 'true' : 'false'} />
  );
  DesktopMainBarMock.displayName = 'DesktopMainBarMock';
  return {
    __esModule: true,
    default: DesktopMenuMock,
    DesktopTopStrip: DesktopTopStripMock,
    DesktopMainBar: DesktopMainBarMock,
  };
});

jest.mock('../MobileMenu', () => {
  const MobileMenuMock = ({ stickyHeader, variant }) => <div data-testid="mobile-menu" data-sticky={stickyHeader ? 'true' : 'false'} data-variant={variant} />;
  MobileMenuMock.displayName = 'MobileMenuMock';
  return MobileMenuMock;
});

const setScroll = (y) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y, writable: true });
};

const flushRaf = async () => {
  await act(async () => {
    window.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

beforeAll(() => {
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
});

beforeEach(() => {
  usePathnameMock.mockReset();
  setScroll(0);
});

describe('Header', () => {
  it('uses over-hero variant on the home route', () => {
    usePathnameMock.mockReturnValue('/');
    render(<Header />);
    expect(screen.getByRole('banner')).toHaveAttribute('data-weelp-header-variant', 'over-hero');
    expect(screen.getByTestId('desktop-menu')).toHaveAttribute('data-variant', 'over-hero');
  });

  it('uses solid variant on non-home routes with split layout (strip out of sticky scope)', () => {
    usePathnameMock.mockReturnValue('/cities/dubai');
    render(<Header />);
    expect(screen.getByRole('banner')).toHaveAttribute('data-weelp-header-variant', 'solid');
    // Solid renders DesktopTopStrip + DesktopMainBar separately (not the combined DesktopMenu) so
    // the sticky element has a constant height — preventing the scroll-anchor oscillation bug.
    expect(screen.queryByTestId('desktop-menu')).not.toBeInTheDocument();
    expect(screen.getByTestId('desktop-top-strip')).toHaveAttribute('data-collapsible', 'false');
    expect(screen.getByTestId('desktop-main-bar')).toHaveAttribute('data-sticky', 'false');
  });

  it('defaults to solid when pathname is null', () => {
    usePathnameMock.mockReturnValue(null);
    render(<Header />);
    expect(screen.getByRole('banner')).toHaveAttribute('data-weelp-header-variant', 'solid');
    expect(screen.getByTestId('desktop-main-bar')).toBeInTheDocument();
  });

  it('applies the 80px threshold on the home route', async () => {
    usePathnameMock.mockReturnValue('/');
    setScroll(70);
    render(<Header />);
    expect(screen.getByRole('banner')).toHaveClass('lg:top-[14px]');
    expect(screen.getByTestId('desktop-menu')).toHaveAttribute('data-sticky', 'false');

    setScroll(120);
    await flushRaf();
    expect(screen.getByRole('banner')).toHaveClass('lg:top-0');
    expect(screen.getByTestId('desktop-menu')).toHaveAttribute('data-sticky', 'true');
  });

  it('applies the 80px threshold on non-home routes', async () => {
    usePathnameMock.mockReturnValue('/cities/dubai');
    setScroll(70);
    render(<Header />);
    expect(screen.getByTestId('desktop-main-bar')).toHaveAttribute('data-sticky', 'false');

    setScroll(120);
    await flushRaf();
    expect(screen.getByTestId('desktop-main-bar')).toHaveAttribute('data-sticky', 'true');
  });
});
