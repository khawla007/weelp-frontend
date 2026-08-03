import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Header from '../header';

const usePathnameMock = jest.fn();
let mockMiniCartState;

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
  const MobileMenuMock = ({ stickyHeader, variant, showTopStrip = true }) => (
    <div data-testid="mobile-menu" data-sticky={stickyHeader ? 'true' : 'false'} data-variant={variant} data-show-top-strip={showTopStrip ? 'true' : 'false'} />
  );
  MobileMenuMock.displayName = 'MobileMenuMock';
  const MobileTopStripMock = ({ topStripVisible, collapsible }) => (
    <div data-testid="mobile-top-strip" data-visible={topStripVisible ? 'true' : 'false'} data-collapsible={collapsible ? 'true' : 'false'} />
  );
  MobileTopStripMock.displayName = 'MobileTopStripMock';
  return {
    __esModule: true,
    default: MobileMenuMock,
    MobileTopStrip: MobileTopStripMock,
  };
});

jest.mock('../../Modals/MiniCartNew', () => {
  const { Sheet, SheetContent, SheetDescription, SheetTitle } = jest.requireActual('@/components/ui/sheet');
  const MiniCartNewMock = () => (
    <Sheet open={mockMiniCartState.isMiniCartOpen}>
      <SheetContent data-testid="mini-cart">
        <SheetTitle>Mini cart</SheetTitle>
        <SheetDescription>Current booking</SheetDescription>
      </SheetContent>
    </Sheet>
  );
  MiniCartNewMock.displayName = 'MiniCartNewMock';
  return MiniCartNewMock;
});

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: (selector) => selector(mockMiniCartState),
}));

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
  mockMiniCartState = {
    isMiniCartOpen: false,
  };
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
    expect(screen.getByRole('banner')).toHaveClass('sticky', 'top-0', 'z-[99999]');
    // Solid renders DesktopTopStrip + DesktopMainBar separately (not the combined DesktopMenu) so
    // the sticky element owns the scroll behavior across mobile, tablet, and desktop.
    expect(screen.queryByTestId('desktop-menu')).not.toBeInTheDocument();
    expect(screen.getByTestId('desktop-top-strip')).toHaveAttribute('data-collapsible', 'false');
    expect(screen.getByTestId('mobile-top-strip')).toHaveAttribute('data-collapsible', 'false');
    expect(screen.getByTestId('mobile-menu')).toHaveAttribute('data-show-top-strip', 'false');
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
    expect(screen.getByRole('banner')).toHaveClass('top-0');
    expect(screen.getByRole('banner')).not.toHaveClass('lg:top-[14px]');
    expect(screen.getByTestId('desktop-menu')).toHaveAttribute('data-sticky', 'false');

    setScroll(120);
    await flushRaf();
    expect(screen.getByRole('banner')).toHaveClass('top-0');
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

  it('mounts one shared mini cart sheet when the cart store is open', async () => {
    usePathnameMock.mockReturnValue('/cities/dubai');
    mockMiniCartState.isMiniCartOpen = true;

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-cart')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('mini-cart')).toHaveLength(1);
  });

  it('keeps the mini cart sheet mounted in its closed state so its exit animation can finish', async () => {
    usePathnameMock.mockReturnValue('/cities/dubai');
    mockMiniCartState.isMiniCartOpen = true;
    const originalGetComputedStyle = window.getComputedStyle.bind(window);
    const computedStyleSpy = jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const style = originalGetComputedStyle(element);

      return new Proxy(style, {
        get(target, property) {
          if (property === 'animationName' && element.getAttribute('data-state') === 'closed') return 'mini-cart-slide-out';

          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    });

    const { rerender } = render(<Header />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-cart')).toBeInTheDocument();
    });

    mockMiniCartState.isMiniCartOpen = false;
    rerender(<Header />);

    const closingSheet = screen.getByTestId('mini-cart');
    expect(closingSheet).toHaveAttribute('data-state', 'closed');

    const animationEnd = new Event('animationend', { bubbles: true });
    Object.defineProperty(animationEnd, 'animationName', { value: 'mini-cart-slide-out' });
    fireEvent(closingSheet, animationEnd);
    await waitFor(() => {
      expect(screen.queryByTestId('mini-cart')).not.toBeInTheDocument();
    });

    computedStyleSpy.mockRestore();
  });
});
