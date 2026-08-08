import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockSetMiniCartOpen = jest.fn();
let mockCartItems = [];
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({
    cartItems: mockCartItems,
    setMiniCartOpen: mockSetMiniCartOpen,
  }),
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({ data: undefined }),
}));

jest.mock('../SingleProductReview', () => ({
  SingleProductReview: () => null,
}));

import ProductSidebar from '../ProductSidebar';

describe('ProductSidebar cart editing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockCartItems = [];
  });

  it('restores the cart line selection when editing an activity booking', async () => {
    mockSearchParams = new URLSearchParams('editCartItem=42');
    mockCartItems = [
      {
        id: 42,
        type: 'activity',
        howMany: { adults: 2, children: 1, infants: 0 },
        dateRange: { from: '2026-07-20', to: '2026-07-20' },
        addons: [{ addon_id: 7, addon_name: 'Photography Package' }],
      },
    ];

    render(
      <ProductSidebar
        productId={42}
        productType="activity"
        productData={{
          id: 42,
          name: 'Dubai Desert Safari With BBQ',
          slug: 'dubai-desert-safari-with-bbq',
          pricing: { regular_price: 475, currency: 'USD' },
          addons: [
            { addon_id: 7, addon_name: 'Photography Package', addon_sale_price: 30, addon_price: 40 },
            { addon_id: 8, addon_name: 'Adventure Kit', addon_sale_price: 30, addon_price: 35 },
          ],
        }}
        citySlug="dubai"
        itemSlug="dubai-desert-safari-with-bbq"
      />,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: /3 travelers/i })).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /jul 20 - jul 20/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add-ons.*1 selected/i }));
    expect(screen.getByRole('checkbox', { name: /photography package/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: /adventure kit/i })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('button', { name: /update booking/i })).toBeInTheDocument();
    expect(screen.queryByText(/item moved to cart/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Help Center' }));
    expect(screen.getByRole('dialog', { name: 'Experience help' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));

    expect(screen.queryByRole('dialog', { name: 'Experience help' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3 travelers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /jul 20 - jul 20/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /photography package/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: /adventure kit/i })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('button', { name: /update booking/i })).toBeInTheDocument();
  });
});
