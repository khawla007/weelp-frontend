import { render, screen } from '@testing-library/react';

import { CheckoutItems, CheckoutItemsSkeleton } from '../CheckoutCards';

let mockCartItems = [];

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({ cartItems: mockCartItems }),
}));

describe('CheckoutItems', () => {
  it('shows long booking content with the server-quoted order total', () => {
    mockCartItems = [
      {
        id: 7,
        type: 'activity',
        name: 'A very long desert safari title that must remain readable on a narrow phone viewport',
        price: 1,
        currency: 'USD',
        howMany: { adults: 3, children: 0 },
        dateRange: { from: new Date(2030, 4, 10) },
        addons: [{ addon_id: 4, addon_name: 'WiFi package with a long descriptive label', price: 0.01 }],
      },
    ];

    const { container } = render(<CheckoutItems quote={{ amount: 1416, currency: 'USD' }} />);

    expect(screen.getByText(/a very long desert safari title/i)).toBeInTheDocument();
    expect(screen.getByText(/wifi package with a long descriptive label/i)).toBeInTheDocument();
    expect(screen.getByText('Order total')).toBeInTheDocument();
    expect(screen.getByText('$1,416.00')).toBeInTheDocument();
    expect(screen.queryByText('$1.00')).not.toBeInTheDocument();
    expect(container.querySelector('[data-public-card="checkout-item"]')).toHaveClass('rounded-[24px]');
    expect(container.querySelector('[data-public-card="checkout-total"]')).toHaveClass('rounded-[24px]');
  });

  it('keeps transfer and loading cards horizontal/transactional with the shared radius', () => {
    mockCartItems = [{ id: 8, type: 'transfer', name: 'Airport transfer', price: 75, base_price: 75, currency: 'USD', howMany: { adults: 2 }, dateRange: {} }];
    const { container, rerender } = render(<CheckoutItems />);
    expect(container.querySelector('[data-public-card="checkout-transfer"]')).toHaveClass('rounded-[24px]', 'flex-col');

    rerender(<CheckoutItemsSkeleton />);
    expect(container.querySelector('[data-public-card="checkout-item-skeleton"]')).toHaveClass('rounded-[24px]');
  });
});
