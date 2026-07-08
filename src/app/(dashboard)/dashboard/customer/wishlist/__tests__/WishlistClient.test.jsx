import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockUseWishlistItems = jest.fn();
const mockGetWishlistItemHref = jest.fn();
const mockToast = jest.fn();

jest.mock('@/hooks/api/customer/wishlist', () => ({
  useWishlistItems: () => mockUseWishlistItems(),
}));

jest.mock('@/lib/wishlist/normalizeWishlistItem', () => ({
  getWishlistItemHref: (...args) => mockGetWishlistItemHref(...args),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/app/components/DashboardShared', () => ({
  DashboardMotionFrame: ({ children, className }) => <div className={className}>{children}</div>,
}));

jest.mock('@/app/components/Image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }) => <img alt={alt} src={src} {...props} />,
}));

import WishlistClient from '../WishlistClient';

function mockWishlistHook(overrides = {}) {
  const removeItem = jest.fn().mockResolvedValue({});

  mockUseWishlistItems.mockReturnValue({
    items: [],
    isLoading: false,
    error: null,
    removeItem,
    ...overrides,
  });

  return { removeItem };
}

describe('WishlistClient', () => {
  beforeEach(() => {
    mockUseWishlistItems.mockReset();
    mockGetWishlistItemHref.mockReset();
    mockToast.mockReset();
  });

  it('renders the empty state', () => {
    mockWishlistHook();

    render(<WishlistClient />);

    expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    expect(screen.getByText(/Save activities, packages, and itineraries/i)).toBeInTheDocument();
  });

  it('renders a wishlist item with a full item link', () => {
    const item = {
      id: 17,
      item_type: 'activity',
      title: 'Desert Safari',
      city_name: 'Dubai',
      image_url: '/assets/desert.jpg',
      price: '120',
      currency: 'AED',
    };
    mockWishlistHook({ items: [item] });
    mockGetWishlistItemHref.mockReturnValue('/cities/dubai/activities/desert-safari');

    render(<WishlistClient />);

    expect(screen.getByText('Desert Safari')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Dubai')).toBeInTheDocument();
    expect(screen.getByText('AED 120')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
  });

  it('removes an item and shows a success toast', async () => {
    const { removeItem } = mockWishlistHook({
      items: [{ id: 31, item_type: 'package', title: 'Paris Weekend' }],
    });
    mockGetWishlistItemHref.mockReturnValue('/cities/paris/packages/paris-weekend');

    render(<WishlistClient />);

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() => {
      expect(removeItem).toHaveBeenCalledWith(31);
    });
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Removed from wishlist',
      }),
    );
  });

  it('shows a failure toast when removal fails', async () => {
    const removeItem = jest.fn().mockRejectedValue(new Error('Network unavailable'));
    mockWishlistHook({
      items: [{ id: 42, item_type: 'itinerary', title: 'Kenya Safari' }],
      removeItem,
    });
    mockGetWishlistItemHref.mockReturnValue('/cities/nairobi/itineraries/kenya-safari');

    render(<WishlistClient />);

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() => {
      expect(removeItem).toHaveBeenCalledWith(42);
    });
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Could not remove item',
        description: 'Network unavailable',
        variant: 'destructive',
      }),
    );
  });
});
