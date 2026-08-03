import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const addWishlistItem = jest.fn();
const normalizeWishlistPayload = jest.fn((item) => ({
  item_type: item.type,
  item_id: item.id,
  title: item.title,
  slug: item.slug,
  city_slug: item.citySlug,
  city_name: item.cityName,
  image_url: null,
  price: item.price,
  currency: item.currency,
  snapshot: item,
}));
const openAuthModal = jest.fn();
const toast = jest.fn();
let sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };

jest.mock('@/app/components/BreadCrumb', () => ({
  __esModule: true,
  default: ({ className = '' }) => <nav className={className}>Breadcrumb</nav>,
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, href, className = '' }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('@/app/components/sliders/GallerySlider', () => ({
  __esModule: true,
  default: () => <div data-testid="gallery-slider" />,
}));

jest.mock('next-auth/react', () => ({
  useSession: () => sessionState,
}));

jest.mock('@/lib/store/useAuthModalStore', () => ({
  __esModule: true,
  default: () => ({ openAuthModal }),
}));

jest.mock('@/lib/wishlist/normalizeWishlistItem', () => ({
  normalizeWishlistPayload: (...args) => normalizeWishlistPayload(...args),
}));

jest.mock('@/lib/services/customer/wishlist', () => ({
  addWishlistItem: (...args) => addWishlistItem(...args),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

import BannerSection from '../BannerSection';

describe('BannerSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };
    normalizeWishlistPayload.mockImplementation((item) => ({
      item_type: item.type,
      item_id: item.id,
      title: item.title,
      slug: item.slug,
      city_slug: item.citySlug,
      city_name: item.cityName,
      image_url: null,
      price: item.price,
      currency: item.currency,
      snapshot: item,
    }));
    addWishlistItem.mockResolvedValue({ data: { id: 12 } });
  });

  it('paints the top single-product area with the theme background token', () => {
    const { container } = render(<BannerSection activityName="Scuba Diving Tour" />);

    const section = container.querySelector('section');
    const inner = section?.firstElementChild;

    expect(section).toHaveClass('bg-background');
    expect(inner).toHaveClass('bg-background');
  });

  it('matches the City page mobile hero top spacing', () => {
    const { container } = render(<BannerSection activityName="Scuba Diving Tour" />);

    const headerStack = container.querySelector('section .max-w-pen > div');

    expect(headerStack).toHaveClass('pt-6', 'md:pt-[70px]');
    expect(headerStack).not.toHaveClass('pt-[70px]');
  });

  it('gives the desktop wishlist action comfortable horizontal padding and touch height', () => {
    render(<BannerSection activityName="Scuba Diving Tour" />);

    const wishlistButton = screen.getByRole('button', { name: /save to wishlist/i });

    expect(wishlistButton).toHaveClass('px-4', 'min-h-11', 'rounded-lg');
    expect(wishlistButton).not.toHaveClass('px-1', 'rounded-sm');
  });

  it('saves the normalized wishlist payload for an authenticated user', async () => {
    render(<BannerSection activityName="Scuba Diving Tour" itemId={42} itemType="activity" slug="scuba-diving-tour" citySlug="dubai" cityName="Dubai" price={120} currency="USD" />);

    fireEvent.click(screen.getByRole('button', { name: /save to wishlist/i }));

    await waitFor(() => {
      expect(addWishlistItem).toHaveBeenCalledWith({
        item_type: 'activity',
        item_id: 42,
        title: 'Scuba Diving Tour',
        slug: 'scuba-diving-tour',
        city_slug: 'dubai',
        city_name: 'Dubai',
        image_url: null,
        price: 120,
        currency: 'USD',
        snapshot: {
          id: 42,
          type: 'activity',
          title: 'Scuba Diving Tour',
          slug: 'scuba-diving-tour',
          citySlug: 'dubai',
          cityName: 'Dubai',
          price: 120,
          currency: 'USD',
        },
      });
    });

    expect(normalizeWishlistPayload).toHaveBeenCalledWith({
      id: 42,
      type: 'activity',
      title: 'Scuba Diving Tour',
      slug: 'scuba-diving-tour',
      citySlug: 'dubai',
      cityName: 'Dubai',
      price: 120,
      currency: 'USD',
    });
    expect(toast).toHaveBeenCalledWith({
      title: 'Saved to wishlist',
      description: 'Scuba Diving Tour has been added to your wishlist.',
    });
  });

  it('opens the auth modal with an onSuccess callback for unauthenticated users', () => {
    sessionState = { data: null, status: 'unauthenticated' };

    render(<BannerSection activityName="Scuba Diving Tour" itemId={42} itemType="activity" slug="scuba-diving-tour" citySlug="dubai" cityName="Dubai" />);

    fireEvent.click(screen.getByRole('button', { name: /save to wishlist/i }));

    expect(openAuthModal).toHaveBeenCalledWith({
      onSuccess: expect.any(Function),
    });
    expect(addWishlistItem).not.toHaveBeenCalled();
  });

  it('shows a destructive toast and skips the API when identity is missing', () => {
    normalizeWishlistPayload.mockReturnValue(null);

    render(<BannerSection activityName="Scuba Diving Tour" itemType="activity" slug="scuba-diving-tour" citySlug="dubai" cityName="Dubai" />);

    fireEvent.click(screen.getByRole('button', { name: /save to wishlist/i }));

    expect(addWishlistItem).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      title: 'Unable to save wishlist item',
      description: 'This item is missing required wishlist details.',
      variant: 'destructive',
    });
  });
});
