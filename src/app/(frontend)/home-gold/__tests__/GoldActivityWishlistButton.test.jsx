import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const addItem = jest.fn();
const removeItemByIdentity = jest.fn();
const openAuthModal = jest.fn();
const toast = jest.fn();
const useWishlistItems = jest.fn();

let sessionState = { data: { user: { id: 7, role: 'customer' } }, status: 'authenticated' };

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

import GoldActivityWishlistButton from '../GoldActivityWishlistButton';

const activity = {
  id: 42,
  type: 'activity',
  title: 'Desert Safari Adventure',
  slug: 'desert-safari-adventure',
  citySlug: 'dubai',
};

describe('GoldActivityWishlistButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 7, role: 'customer' } }, status: 'authenticated' };
    addItem.mockResolvedValue({ success: true });
    removeItemByIdentity.mockResolvedValue({ success: true });
    useWishlistItems.mockReturnValue({
      items: [],
      isLoading: false,
      addItem,
      removeItemByIdentity,
    });
  });

  it('renders an icon-only 44px control with its saved state exposed to assistive technology', () => {
    render(<GoldActivityWishlistButton item={activity} />);

    const button = screen.getByRole('button', { name: /save desert safari adventure to wishlist/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveClass('size-11', 'rounded-full');
    expect(button).not.toHaveTextContent(/save to wishlist/i);
    expect(button).not.toHaveTextContent(/saved to wishlist/i);
  });

  it('opens authentication for a guest and preserves the post-login save callback', async () => {
    sessionState = { data: null, status: 'unauthenticated' };
    render(<GoldActivityWishlistButton item={activity} />);

    fireEvent.click(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i }));

    expect(openAuthModal).toHaveBeenCalledWith({ onSuccess: expect.any(Function) });
    expect(addItem).not.toHaveBeenCalled();

    await act(async () => openAuthModal.mock.calls[0][0].onSuccess({ user: { id: 7, role: 'customer' } }));
    expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ item_type: 'activity', item_id: 42 }));
  });

  it('does not save after a guest authenticates with a non-customer role', async () => {
    sessionState = { data: null, status: 'unauthenticated' };
    render(<GoldActivityWishlistButton item={activity} />);
    fireEvent.click(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i }));

    await act(async () => openAuthModal.mock.calls[0][0].onSuccess({ user: { id: 7, role: 'admin' } }));

    expect(addItem).not.toHaveBeenCalled();
  });

  it('adds an activity for a customer and confirms the save', async () => {
    render(<GoldActivityWishlistButton item={activity} />);

    fireEvent.click(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i }));

    await waitFor(() => expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ item_type: 'activity', item_id: 42 })));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Saved to wishlist' }));
  });

  it('removes a saved activity for a customer and confirms the removal', async () => {
    useWishlistItems.mockReturnValue({
      items: [{ id: 9, item_type: 'activity', item_id: 42 }],
      isLoading: false,
      addItem,
      removeItemByIdentity,
    });
    render(<GoldActivityWishlistButton item={activity} />);

    const button = screen.getByRole('button', { name: /remove desert safari adventure from wishlist/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);

    await waitFor(() => expect(removeItemByIdentity).toHaveBeenCalledWith('activity', 42));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Removed from wishlist' }));
  });

  it('stays disabled while the session is loading', () => {
    sessionState = { data: null, status: 'loading' };
    render(<GoldActivityWishlistButton item={activity} />);

    expect(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i })).toBeDisabled();
    expect(useWishlistItems).toHaveBeenCalledWith({ enabled: false });
  });

  it('stays disabled while customer wishlist data is loading', () => {
    useWishlistItems.mockReturnValue({
      items: [],
      isLoading: true,
      addItem,
      removeItemByIdentity,
    });
    render(<GoldActivityWishlistButton item={activity} />);

    expect(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i })).toBeDisabled();
  });

  it.each(['admin', 'super_admin', 'creator'])('hides the control for an authenticated %s', (role) => {
    sessionState = { data: { user: { id: 7, role } }, status: 'authenticated' };
    render(<GoldActivityWishlistButton item={activity} />);

    expect(useWishlistItems).toHaveBeenCalledWith({ enabled: false });
    expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
  });

  it('reports the backend error when the wishlist API rejects the update', async () => {
    addItem.mockRejectedValue(Object.assign(new Error('Save failed'), { response: { data: { message: 'Wishlist is unavailable.' } } }));
    render(<GoldActivityWishlistButton item={activity} />);

    fireEvent.click(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Unable to update wishlist',
        description: 'Wishlist is unavailable.',
        variant: 'destructive',
      }),
    );
  });
});
