import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import MiniCartProductCard from '../MiniCartProductCard';
import useMiniCartStore from '@/lib/store/useMiniCartStore';

const removeItem = jest.fn();
const toast = jest.fn();

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  __esModule: true,
  useToast: () => ({ toast }),
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('MiniCartProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMiniCartStore.mockReturnValue({ removeItem });
  });

  it('removes the cart item after confirming from the delete button', () => {
    render(
      <MiniCartProductCard
        productName="Dubai Desert Safari"
        howMany={{ adults: 2, children: 1 }}
        dateRange={{ from: '2026-07-20' }}
        itemId="cart-line-1"
        itemType="activity"
        productImage="/assets/fallback-image.png"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /remove dubai desert safari from cart/i }));
    fireEvent.click(screen.getByRole('button', { name: /remove item/i }));

    expect(removeItem).toHaveBeenCalledWith('cart-line-1');
    expect(toast).toHaveBeenCalledWith({
      title: 'Item removed from cart',
      duration: 1000,
    });
  });

  it('links activity cart items back to their public page for editing', () => {
    render(
      <MiniCartProductCard
        productName="Dubai Desert Safari"
        howMany={{ adults: 2, children: 1 }}
        dateRange={{ from: '2026-07-20' }}
        itemId="cart-line-1"
        itemType="activity"
        productImage="/assets/fallback-image.png"
        citySlug="dubai"
        itemSlug="desert-safari"
      />,
    );

    expect(screen.getByRole('link', { name: /edit dubai desert safari booking/i })).toHaveAttribute('href', '/cities/dubai/activities/desert-safari?editCartItem=cart-line-1');
  });

  it('hides the edit action for package cart items', () => {
    render(
      <MiniCartProductCard
        productName="Reference Package"
        howMany={{ adults: 2, children: 0 }}
        dateRange={{ from: '2026-07-20' }}
        itemId="package-1"
        itemType="package"
        productImage="/assets/fallback-image.png"
        citySlug="dubai"
        itemSlug="reference-package"
      />,
    );

    expect(screen.queryByRole('link', { name: /edit reference package booking/i })).not.toBeInTheDocument();
  });

  it('hides the edit action when public routing metadata is missing', () => {
    render(
      <MiniCartProductCard
        productName="Dubai Desert Safari"
        howMany={{ adults: 2, children: 1 }}
        dateRange={{ from: '2026-07-20' }}
        itemId="cart-line-1"
        itemType="activity"
        productImage="/assets/fallback-image.png"
      />,
    );

    expect(screen.queryByRole('link', { name: /edit dubai desert safari booking/i })).not.toBeInTheDocument();
  });
});
