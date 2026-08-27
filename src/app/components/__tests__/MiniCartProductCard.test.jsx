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
    const { container } = render(
      <MiniCartProductCard
        productName="Dubai Desert Safari"
        howMany={{ adults: 2, children: 1 }}
        dateRange={{ from: '2026-07-20' }}
        itemId="cart-line-1"
        itemType="activity"
        productImage="/assets/fallback-image.png"
      />,
    );

    expect(container.querySelector('[data-public-card="mini-cart-item"]')).toHaveClass('rounded-[24px]');

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

  it('shows a short selected date from a freshly added cart item', () => {
    render(
      <MiniCartProductCard
        productName="Dubai Desert Safari"
        howMany={{ adults: 2, children: 1 }}
        dateRange={{ from: new Date('2026-08-20T00:00:00') }}
        itemId="cart-line-1"
        itemType="activity"
        productImage="/assets/fallback-image.png"
      />,
    );

    expect(screen.getByText('Aug 20')).toBeInTheDocument();
  });

  it('shows a short selected date range when start and end differ', () => {
    render(
      <MiniCartProductCard
        productName="Luxury Safari"
        howMany={{ adults: 2, children: 1 }}
        dateRange={{ from: '2026-08-20T00:00:00.000Z', to: '2026-08-24T00:00:00.000Z' }}
        itemId="itinerary-1"
        itemType="itinerary"
        productImage="/assets/fallback-image.png"
      />,
    );

    expect(screen.getByText('Aug 20 - Aug 24')).toBeInTheDocument();
  });

  it('centers metadata icons with their text rows', () => {
    render(
      <MiniCartProductCard
        productName="Dubai Desert Safari"
        howMany={{ adults: 2, children: 1 }}
        dateRange={{ from: '2026-08-20T00:00:00.000Z', to: '2026-08-24T00:00:00.000Z' }}
        itemId="cart-line-1"
        itemType="activity"
        productImage="/assets/fallback-image.png"
        addons={[{ addon_id: 1, addon_name: 'WiFi Access', price: 5 }]}
      />,
    );

    expect(screen.getByText(/2 adults/i).closest('span')).toHaveClass('items-center');
    expect(screen.getByText('Aug 20 - Aug 24').closest('span')).toHaveClass('items-center');
    expect(screen.getAllByText((_, element) => element?.tagName === 'SPAN' && element.textContent === '+ WiFi Access')[0]).toHaveClass('items-center');
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
