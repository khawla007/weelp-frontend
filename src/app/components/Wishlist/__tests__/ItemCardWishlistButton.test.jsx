import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const addItem = jest.fn();
const removeItemByIdentity = jest.fn();
const openAuthModal = jest.fn();
const toast = jest.fn();
const useWishlistItems = jest.fn();

let sessionState = { data: { user: { id: 7, role: 'customer' } }, status: 'authenticated' };

jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));
jest.mock('@/hooks/api/customer/wishlist', () => ({ useWishlistItems: (...args) => useWishlistItems(...args) }));
jest.mock('@/lib/store/useAuthModalStore', () => ({ __esModule: true, default: () => ({ openAuthModal }) }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));

import ItemCardWishlistButton from '../ItemCardWishlistButton';

const activity = {
  item_type: 'activity',
  item_id: 42,
  title: 'Desert Safari Adventure',
  slug: 'desert-safari-adventure',
  city_slug: 'dubai',
};

describe('ItemCardWishlistButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 7, role: 'customer' } }, status: 'authenticated' };
    addItem.mockResolvedValue({ success: true });
    removeItemByIdentity.mockResolvedValue({ success: true });
    useWishlistItems.mockReturnValue({ items: [], isLoading: false, addItem, removeItemByIdentity });
  });

  it('renders a 44px target around the 32px visible heart control', () => {
    render(<ItemCardWishlistButton item={activity} />);

    const button = screen.getByRole('button', { name: /save desert safari adventure to wishlist/i });
    expect(button).toHaveClass('size-11');
    expect(within(button).getByTestId('item-card-wishlist-visual')).toHaveClass('size-8');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders nothing for an invalid wishlist identity', () => {
    const { container } = render(<ItemCardWishlistButton item={{ title: 'Incomplete' }} />);

    expect(container).toBeEmptyDOMElement();
    expect(useWishlistItems).toHaveBeenCalledWith({ enabled: false });
  });

  it('opens authentication for a guest and resumes the save after login', async () => {
    sessionState = { data: null, status: 'unauthenticated' };
    render(<ItemCardWishlistButton item={activity} />);
    fireEvent.click(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i }));

    expect(openAuthModal).toHaveBeenCalledWith({ onSuccess: expect.any(Function) });
    await act(async () => openAuthModal.mock.calls[0][0].onSuccess({ user: { id: 7 } }));
    expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ item_type: 'activity', item_id: 42 }));
  });

  it('submits only one mutation while a save is pending', async () => {
    let resolveSave;
    addItem.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );
    render(<ItemCardWishlistButton item={activity} />);

    const button = screen.getByRole('button', { name: /save desert safari adventure to wishlist/i });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();

    await act(async () => resolveSave({ success: true }));
  });

  it('adds an item for an authenticated user and confirms the save', async () => {
    render(<ItemCardWishlistButton item={activity} />);
    fireEvent.click(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i }));

    await waitFor(() => expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ item_type: 'activity', item_id: 42 })));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Saved to wishlist' }));
  });

  it('removes a saved item and confirms the removal', async () => {
    useWishlistItems.mockReturnValue({ items: [{ id: 9, item_type: 'activity', item_id: 42 }], isLoading: false, addItem, removeItemByIdentity });
    render(<ItemCardWishlistButton item={activity} />);

    const button = screen.getByRole('button', { name: /remove desert safari adventure from wishlist/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);

    await waitFor(() => expect(removeItemByIdentity).toHaveBeenCalledWith('activity', 42));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Removed from wishlist' }));
  });

  it('stays disabled while the session is loading', () => {
    sessionState = { data: null, status: 'loading' };
    render(<ItemCardWishlistButton item={activity} />);

    expect(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i })).toBeDisabled();
    expect(useWishlistItems).toHaveBeenCalledWith({ enabled: false });
  });

  it('stays disabled while wishlist data is loading', () => {
    useWishlistItems.mockReturnValue({ items: [], isLoading: true, addItem, removeItemByIdentity });
    render(<ItemCardWishlistButton item={activity} />);

    expect(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i })).toBeDisabled();
  });

  it.each(['admin', 'super_admin', 'creator'])('shows the control for an authenticated %s', (role) => {
    sessionState = { data: { user: { id: 7, role } }, status: 'authenticated' };
    render(<ItemCardWishlistButton item={activity} />);

    expect(useWishlistItems).toHaveBeenCalledWith({ enabled: true });
    expect(screen.getByRole('button', { name: /wishlist/i })).toBeInTheDocument();
  });

  it('reports the backend error when the wishlist API rejects the update', async () => {
    addItem.mockRejectedValue(Object.assign(new Error('Save failed'), { response: { data: { message: 'Wishlist is unavailable.' } } }));
    render(<ItemCardWishlistButton item={activity} />);
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
