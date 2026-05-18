import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import DesktopMenu from '../NavigationMenu';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

jest.mock('next/link', () => {
  const LinkMock = ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = 'LinkMock';
  return LinkMock;
});

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => (
    <div data-testid="dynamic-component">
      <button type="button">Featured destination</button>
    </div>
  );
  DynamicComponent.displayName = 'DynamicComponent';
  return DynamicComponent;
});

jest.mock(
  '../../Modals/ModalForm',
  () =>
    function ModalFormMock() {
      return null;
    },
);

jest.mock(
  '../../Modals/MiniCartNew',
  () =>
    function MiniCartNewMock() {
      return null;
    },
);

jest.mock(
  '../../Modals/SubmenuAccount',
  () =>
    function SubmenuAccountMock() {
      return null;
    },
);

jest.mock('../../../../lib/store/useMiniCartStore', () => () => ({
  isMiniCartOpen: false,
  setMiniCartOpen: jest.fn(),
  cartItems: [],
}));

describe('DesktopMenu', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders the shared modern header content from the homepage design', () => {
    render(<DesktopMenu stickyHeader={false} />);

    expect(screen.getByText(/get exclusive offer on the app/i)).toBeInTheDocument();
    expect(screen.getByText(/^usd$/i)).toBeInTheDocument();
    expect(screen.getByText('Weelp.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore destinations/i })).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.getByRole('button', { name: /explore destinations/i })).toHaveAttribute('aria-controls', 'desktop-mega-menu-panel');
    expect(screen.getByRole('link', { name: /explore creators/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tours & experiences/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^transfers$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^trips$/i })).toBeInTheDocument();
  });

  it('keeps the desktop mega menu mounted in a closing state before unmounting', () => {
    render(<DesktopMenu stickyHeader={false} />);

    const destinationsTrigger = screen.getByRole('button', { name: /explore destinations/i });
    const destinationsItem = destinationsTrigger.closest('li');

    fireEvent.mouseEnter(destinationsItem);
    act(() => {
      jest.advanceTimersByTime(120);
    });

    expect(destinationsTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('desktop-mega-menu-panel')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('desktop-mega-menu-panel')).not.toHaveAttribute('aria-hidden');
    expect(screen.getByTestId('desktop-mega-menu-panel')).not.toHaveAttribute('inert');

    fireEvent.mouseLeave(destinationsItem);
    act(() => {
      jest.advanceTimersByTime(149);
    });

    expect(screen.getByTestId('desktop-mega-menu-panel')).toHaveAttribute('data-state', 'open');

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(destinationsTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('desktop-mega-menu-panel')).toHaveAttribute('data-state', 'closing');

    act(() => {
      jest.advanceTimersByTime(180);
    });

    expect(screen.queryByTestId('desktop-mega-menu-panel')).not.toBeInTheDocument();
  });

  it('keeps the desktop mega menu open while focus moves from trigger into the panel', () => {
    render(<DesktopMenu stickyHeader={false} />);

    const destinationsTrigger = screen.getByRole('button', { name: /explore destinations/i });

    fireEvent.focus(destinationsTrigger);
    act(() => {
      jest.advanceTimersByTime(120);
    });

    const panel = screen.getByTestId('desktop-mega-menu-panel');
    const panelButton = screen.getByRole('button', { name: /featured destination/i });

    fireEvent.blur(destinationsTrigger, { relatedTarget: panelButton });
    fireEvent.focus(panelButton, { relatedTarget: destinationsTrigger });
    act(() => {
      jest.advanceTimersByTime(151);
    });

    expect(destinationsTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toHaveAttribute('data-state', 'open');

    fireEvent.blur(panelButton, { relatedTarget: document.body });
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(destinationsTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('desktop-mega-menu-panel')).toHaveAttribute('data-state', 'closing');
  });

  it('does not restart the enter state when a pending focus timer fires after click-open', () => {
    render(<DesktopMenu stickyHeader={false} />);

    const destinationsTrigger = screen.getByRole('button', { name: /explore destinations/i });

    fireEvent.focus(destinationsTrigger);
    fireEvent.click(destinationsTrigger);
    act(() => {
      jest.advanceTimersByTime(20);
    });

    expect(screen.getByTestId('desktop-mega-menu-panel')).toHaveAttribute('data-state', 'open');

    act(() => {
      jest.advanceTimersByTime(80);
    });

    expect(screen.getByTestId('desktop-mega-menu-panel')).toHaveAttribute('data-state', 'open');
  });

  it('keeps the closing panel inert while trigger re-entry cancels the pending exit timer', () => {
    render(<DesktopMenu stickyHeader={false} />);

    const destinationsTrigger = screen.getByRole('button', { name: /explore destinations/i });
    const destinationsItem = destinationsTrigger.closest('li');

    fireEvent.mouseEnter(destinationsItem);
    act(() => {
      jest.advanceTimersByTime(120);
    });

    fireEvent.mouseLeave(destinationsItem);
    act(() => {
      jest.advanceTimersByTime(150);
    });

    const panel = screen.getByTestId('desktop-mega-menu-panel');
    expect(panel).toHaveAttribute('data-state', 'closing');
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(panel).toHaveAttribute('inert');
    expect(panel.className).toContain('pointer-events-none');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    fireEvent.mouseEnter(destinationsItem);
    act(() => {
      jest.advanceTimersByTime(80);
    });

    expect(screen.getByTestId('desktop-mega-menu-panel')).toBeInTheDocument();
  });

  it('uses stable sticky header motion classes without transition-all', () => {
    const { container, rerender } = render(<DesktopMenu stickyHeader={false} />);

    const headerBar = () => screen.getByTestId('desktop-header-bar');
    const headerSlot = () => screen.getByTestId('desktop-header-slot');

    expect(headerSlot()).toHaveClass('h-[66px]');
    expect(headerBar()).toHaveClass('h-[66px]');
    expect(headerBar().className).toContain('transition-[background-color,border-color,box-shadow,backdrop-filter]');
    expect(headerBar().className).not.toMatch(/transition-all|transition:\s*all/);

    rerender(<DesktopMenu stickyHeader />);

    expect(headerSlot()).toHaveClass('h-[66px]');
    expect(headerBar()).toHaveClass('h-[66px]');
    expect(headerBar()).not.toHaveClass('fixed');
    expect(headerBar()).toHaveAttribute('data-weelp-sticky-header', 'true');
    expect(headerBar()).toHaveAttribute('data-weelp-sticky-settled', 'false');
    act(() => {
      jest.advanceTimersByTime(80);
    });
    expect(headerBar()).toHaveAttribute('data-weelp-sticky-settled', 'true');
    expect(headerBar().className).toContain('backdrop-blur');
    expect(headerBar().className).toContain('shadow-');
    expect(headerBar().className).not.toMatch(/transition-\[[^\]]*(opacity|transform)/);
    expect(container.innerHTML).not.toMatch(/transition-all|transition:\s*all/);
  });
});
