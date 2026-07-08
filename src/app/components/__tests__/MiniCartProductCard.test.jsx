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
});
