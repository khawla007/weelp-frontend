import React from 'react';
import { render, screen } from '@testing-library/react';

import Header from '../header';

jest.mock('../NavigationMenu', () => {
  const DesktopMenuMock = ({ stickyHeader }) => <div data-testid="desktop-menu" data-sticky={stickyHeader ? 'true' : 'false'} />;
  DesktopMenuMock.displayName = 'DesktopMenuMock';
  return DesktopMenuMock;
});

jest.mock('../MobileMenu', () => {
  const MobileMenuMock = ({ stickyHeader }) => <div data-testid="mobile-menu" data-sticky={stickyHeader ? 'true' : 'false'} />;
  MobileMenuMock.displayName = 'MobileMenuMock';
  return MobileMenuMock;
});

describe('Header', () => {
  it('hides the full desktop top strip including its border when sticky', () => {
    render(<Header />);

    expect(screen.getByTestId('desktop-menu').parentElement).toHaveClass('lg:top-[-47px]');
  });
});
