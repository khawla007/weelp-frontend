import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const addItem = jest.fn();
const removeItemByIdentity = jest.fn();
const openAuthModal = jest.fn();
const toast = jest.fn();
const useWishlistItems = jest.fn();

let initialItems = [];
let sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };

jest.mock('next-auth/react', () => ({
  useSession: () => sessionState,
}));

jest.mock('@/hooks/api/customer/wishlist', () => ({
  useWishlistItems: (...args) => useWishlistItems(...args),
}));

jest.mock('@/lib/store/useAuthModalStore', () => ({
  __esModule: true,
  default: () => ({ openAuthModal }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

import WishlistButton from '../WishlistButton';

const item = {
  id: 42,
  type: 'activity',
  title: 'Desert Safari',
  slug: 'desert-safari',
  citySlug: 'dubai',
};

describe('WishlistButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initialItems = [];
    sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };
    addItem.mockResolvedValue({ success: true, data: { id: 9, item_type: 'activity', item_id: 42 } });
    removeItemByIdentity.mockResolvedValue({ success: true });
    useWishlistItems.mockImplementation(() => {
      const [items, setItems] = React.useState(initialItems);

      return {
        items,
        isLoading: false,
        addItem: async (payload) => {
          const response = await addItem(payload);
          setItems((current) => [{ id: response?.data?.id ?? 9, ...payload }, ...current]);
          return response;
        },
        removeItemByIdentity: async (itemType, itemId) => {
          const response = await removeItemByIdentity(itemType, itemId);
          setItems((current) => current.filter((saved) => !(String(saved.item_type) === String(itemType) && String(saved.item_id) === String(itemId))));
          return response;
        },
      };
    });
  });

  it('uses the outlined light-mode button treatment', () => {
    render(<WishlistButton item={item} />);

    expect(screen.getByRole('button', { name: /save desert safari to wishlist/i })).toHaveClass('border', 'border-border', 'bg-background');
  });

  it('renders an existing wishlist item with a red filled heart', () => {
    initialItems = [{ id: 9, item_type: 'activity', item_id: 42, title: 'Desert Safari' }];

    render(<WishlistButton item={item} />);

    expect(screen.getByRole('button', { name: /remove desert safari from wishlist/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('wishlist-heart')).toHaveClass('fill-destructive', 'text-destructive');
  });

  it('immediately renders a red heart after an authenticated save', async () => {
    render(<WishlistButton item={item} />);

    fireEvent.click(screen.getByRole('button', { name: /save desert safari to wishlist/i }));

    await waitFor(() => expect(screen.getByRole('button', { name: /remove desert safari from wishlist/i })).toHaveAttribute('aria-pressed', 'true'));
    expect(screen.getByTestId('wishlist-heart')).toHaveClass('fill-destructive', 'text-destructive');
    expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ item_type: 'activity', item_id: 42 }));
  });

  it('returns the heart to neutral after removing a saved item', async () => {
    initialItems = [{ id: 9, item_type: 'activity', item_id: 42, title: 'Desert Safari' }];
    render(<WishlistButton item={item} />);

    fireEvent.click(screen.getByRole('button', { name: /remove desert safari from wishlist/i }));

    await waitFor(() => expect(screen.getByRole('button', { name: /save desert safari to wishlist/i })).toHaveAttribute('aria-pressed', 'false'));
    expect(screen.getByTestId('wishlist-heart')).not.toHaveClass('fill-destructive');
    expect(removeItemByIdentity).toHaveBeenCalledWith('activity', 42);
  });

  it('opens authentication for a guest without calling the wishlist API', () => {
    sessionState = { data: null, status: 'unauthenticated' };
    render(<WishlistButton item={item} />);

    fireEvent.click(screen.getByRole('button', { name: /save desert safari to wishlist/i }));

    expect(openAuthModal).toHaveBeenCalledWith({ onSuccess: expect.any(Function) });
    expect(addItem).not.toHaveBeenCalled();
  });

  it('uses the same save path after successful authentication', async () => {
    sessionState = { data: null, status: 'unauthenticated' };
    render(<WishlistButton item={item} />);
    fireEvent.click(screen.getByRole('button', { name: /save desert safari to wishlist/i }));
    const onSuccess = openAuthModal.mock.calls[0][0].onSuccess;

    await act(async () => onSuccess());

    expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ item_type: 'activity', item_id: 42 }));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Saved to wishlist' }));
  });

  it('contains a rejected post-login save and shows the backend error', async () => {
    sessionState = { data: null, status: 'unauthenticated' };
    const saveError = Object.assign(new Error('Save failed'), { response: { data: { message: 'Wishlist is unavailable.' } } });
    addItem.mockRejectedValue(saveError);
    render(<WishlistButton item={item} />);
    fireEvent.click(screen.getByRole('button', { name: /save desert safari to wishlist/i }));
    const onSuccess = openAuthModal.mock.calls[0][0].onSuccess;

    await act(async () => {
      await expect(onSuccess()).resolves.toBeUndefined();
    });

    expect(toast).toHaveBeenCalledWith({ title: 'Unable to update wishlist', description: 'Wishlist is unavailable.', variant: 'destructive' });
  });

  it('renders a visible saved label on the single-item page', () => {
    initialItems = [{ id: 9, item_type: 'activity', item_id: 42, title: 'Desert Safari' }];

    render(<WishlistButton item={item} />);

    expect(screen.getByText('Saved to Wishlist')).toBeVisible();
  });
});
