import React from 'react';
import { render, screen } from '@testing-library/react';

import DesktopMenu from '../NavigationMenu';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div data-testid="dynamic-component" />;
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
  it('renders the shared modern header content from the homepage design', () => {
    render(<DesktopMenu stickyHeader={false} />);

    expect(screen.getByText(/get exclusive offer on the app/i)).toBeInTheDocument();
    expect(screen.getByText(/^usd$/i)).toBeInTheDocument();
    expect(screen.getByText('Weelp.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore creators/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tours & experiences/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^transfers$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^trips$/i })).toBeInTheDocument();
  });
});
