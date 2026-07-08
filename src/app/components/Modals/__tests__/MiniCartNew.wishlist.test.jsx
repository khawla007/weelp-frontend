import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import MiniCartNew from '../MiniCartNew';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { addWishlistItem } from '@/lib/services/customer/wishlist';
import { normalizeWishlistPayload } from '@/lib/wishlist/normalizeWishlistItem';
import { useSession } from 'next-auth/react';

const mockToast = jest.fn();
const mockPush = jest.fn();
const mockSetMiniCartOpen = jest.fn();
const mockClearCart = jest.fn();
const mockOpenAuthModal = jest.fn();

const cartItems = [
  {
    id: 101,
    type: 'activity',
    name: 'Dubai Desert Safari',
    slug: 'dubai-desert-safari',
    city_slug: 'dubai',
    price: 120,
    currency: 'USD',
    howMany: { adults: 2, children: 0 },
    dateRange: { from: '2026-07-20' },
  },
  {
    id: 202,
    type: 'itinerary',
    name: 'Paris Weekend',
    slug: 'paris-weekend',
    city_slug: 'paris',
    price: 800,
    currency: 'USD',
    howMany: { adults: 1, children: 0 },
    dateRange: { from: '2026-08-12' },
  },
];

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/store/useAuthModalStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/services/customer/wishlist', () => ({
  addWishlistItem: jest.fn(),
}));

jest.mock('@/lib/wishlist/normalizeWishlistItem', () => ({
  normalizeWishlistPayload: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ open, children }) => (open ? <div>{children}</div> : null),
  SheetClose: ({ children }) => <>{children}</>,
  SheetContent: ({ children }) => <div>{children}</div>,
  SheetDescription: ({ children }) => <p>{children}</p>,
  SheetHeader: ({ children }) => <div>{children}</div>,
  SheetTitle: ({ children }) => <h2>{children}</h2>,
}));

jest.mock('../../MiniCartProductCard', () => ({
  __esModule: true,
  default: ({ productName }) => <div>{productName}</div>,
}));

jest.mock('../../MiniCartReviewCard', () => ({
  MinicartReviewcontent: () => null,
}));

function mockCartStore(overrides = {}) {
  useMiniCartStore.mockReturnValue({
    cartItems,
    totalPrice: 920,
    isMiniCartOpen: true,
    setMiniCartOpen: mockSetMiniCartOpen,
    clearCart: mockClearCart,
    ...overrides,
  });
}

describe('MiniCartNew wishlist save cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartStore();
    useAuthModalStore.mockReturnValue({ openAuthModal: mockOpenAuthModal });
    useSession.mockReturnValue({ status: 'authenticated', data: { user: { id: 7 } } });
    normalizeWishlistPayload.mockImplementation((item) => ({
      item_type: item.type,
      item_id: item.id,
      title: item.name,
      slug: item.slug,
      city_slug: item.city_slug,
      snapshot: item,
    }));
    addWishlistItem.mockResolvedValue({ success: true });
  });

  it('saves every cart item, clears the cart, closes the mini cart, and shows a success toast when authenticated', async () => {
    render(<MiniCartNew />);

    fireEvent.click(screen.getByRole('button', { name: /save cart to wishlist/i }));

    await waitFor(() => {
      expect(addWishlistItem).toHaveBeenCalledTimes(2);
    });

    expect(addWishlistItem).toHaveBeenNthCalledWith(1, expect.objectContaining({ item_type: 'activity', item_id: 101 }));
    expect(addWishlistItem).toHaveBeenNthCalledWith(2, expect.objectContaining({ item_type: 'itinerary', item_id: 202 }));
    expect(mockClearCart).toHaveBeenCalledTimes(1);
    expect(mockSetMiniCartOpen).toHaveBeenCalledWith(false);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Cart saved to wishlist',
      description: 'Every item in your cart was moved to your wishlist.',
    });
  });

  it('opens the auth modal with a resumable save callback when unauthenticated and does not clear immediately', () => {
    useSession.mockReturnValue({ status: 'unauthenticated', data: null });

    render(<MiniCartNew />);

    fireEvent.click(screen.getByRole('button', { name: /save cart to wishlist/i }));

    expect(mockOpenAuthModal).toHaveBeenCalledWith({
      onSuccess: expect.any(Function),
    });
    expect(mockClearCart).not.toHaveBeenCalled();
    expect(addWishlistItem).not.toHaveBeenCalled();
  });

  it('keeps the cart and shows a destructive toast when any API save fails', async () => {
    addWishlistItem.mockRejectedValueOnce(new Error('save failed'));

    render(<MiniCartNew />);

    fireEvent.click(screen.getByRole('button', { name: /save cart to wishlist/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Could not save cart',
        description: 'Your cart was not changed. Please try saving it again.',
        variant: 'destructive',
      });
    });

    expect(mockClearCart).not.toHaveBeenCalled();
    expect(mockSetMiniCartOpen).not.toHaveBeenCalledWith(false);
  });
});
