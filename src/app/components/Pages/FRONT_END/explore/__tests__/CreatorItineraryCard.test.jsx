import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CreatorItineraryCard from '../CreatorItineraryCard';
import { recordItineraryView, toggleItineraryLike } from '@/lib/actions/creatorItineraries';

const openAuthModal = jest.fn();
const mockItemCard = jest.fn(({ title, href, variant, attributes = [], cornerAction }) => (
  <article data-testid="shared-item-card" data-variant={variant}>
    {href ? (
      <a href={href} onClick={(event) => event.preventDefault()}>
        {title}
      </a>
    ) : (
      <h3>{title}</h3>
    )}
    {attributes.map((attribute) => (
      <span key={attribute.slug}>{attribute.attribute_value}</span>
    ))}
    {cornerAction}
  </article>
));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children, onClick, className }) => (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

jest.mock('@/app/components/MediaImage', () => ({
  __esModule: true,
  default: ({ alt }) => <span>{alt}</span>,
}));

jest.mock('@/app/components/ui/item-card', () => ({
  __esModule: true,
  default: (props) => mockItemCard(props),
}));

jest.mock('@/lib/actions/creatorItineraries', () => ({
  toggleItineraryLike: jest.fn(),
  recordItineraryView: jest.fn(),
}));

jest.mock('@/lib/store/useAuthModalStore', () => ({
  __esModule: true,
  default: () => ({ openAuthModal }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CreatorItineraryCard', () => {
  it('delegates the visual body to the full shared card with an independent like action', () => {
    render(
      <CreatorItineraryCard
        isLoggedIn={false}
        itinerary={{
          id: 12,
          name: 'A long creator itinerary title for mobile travelers',
          slug: 'long-creator-route',
          views_count: 21,
          likes_count: 4,
          locations: [{ city: { name: 'Dubai', slug: 'dubai' } }],
          creator: { name: 'Nora Field Notes' },
        }}
      />,
    );

    const likeButton = screen.getByRole('button', {
      name: 'Like A long creator itinerary title for mobile travelers. 4 likes',
    });

    expect(mockItemCard.mock.calls.at(-1)[0]).toEqual(
      expect.objectContaining({
        variant: 'full',
        href: '/cities/dubai/itineraries/long-creator-route',
        title: 'A long creator itinerary title for mobile travelers',
        itemType: 'itinerary',
        wishlistItem: null,
        cornerAction: expect.anything(),
      }),
    );
    expect(likeButton).toHaveClass('weelp-creator-like-button', 'size-11', 'rounded-full');
  });

  it('uses city slug from the API for public itinerary links', () => {
    render(
      <CreatorItineraryCard
        isLoggedIn={false}
        itinerary={{
          id: 1,
          name: 'Creator Nice Coast',
          slug: 'creator-nice-coast',
          locations: [{ city: { name: 'Nice Côte d Azur', slug: 'nice' } }],
          creator: { name: 'Nora Field Notes' },
        }}
      />,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/cities/nice/itineraries/creator-nice-coast');
  });

  it('renders stored view count without recording an index-page impression', () => {
    render(
      <CreatorItineraryCard
        isLoggedIn={false}
        itinerary={{
          id: 7,
          name: 'Creator Seen Route',
          slug: 'creator-seen-route',
          views_count: 10,
          likes_count: 1,
          locations: [{ city: { name: 'Dubai', slug: 'dubai' } }],
          creator: { name: 'Nora Field Notes' },
        }}
      />,
    );

    expect(screen.getByText('10')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link'));

    expect(recordItineraryView).not.toHaveBeenCalled();
  });

  it('updates the like count from the API response for logged-in users', async () => {
    toggleItineraryLike.mockResolvedValue({ success: true, liked: true, likes_count: 3 });

    render(
      <CreatorItineraryCard
        isLoggedIn
        itinerary={{
          id: 8,
          name: 'Creator Like Route',
          slug: 'creator-like-route',
          views_count: 1,
          likes_count: 2,
          is_liked: false,
          locations: [{ city: { name: 'Dubai', slug: 'dubai' } }],
          creator: { name: 'Nora Field Notes' },
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Like Creator Like Route. 2 likes' }));

    expect(toggleItineraryLike).toHaveBeenCalledWith(8);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Unlike Creator Like Route. 3 likes' })).toBeInTheDocument());
  });

  it('opens auth modal instead of silently ignoring guest likes', () => {
    render(
      <CreatorItineraryCard
        isLoggedIn={false}
        itinerary={{
          id: 10,
          name: 'Creator Guest Like Route',
          slug: 'creator-guest-like-route',
          views_count: 1,
          likes_count: 2,
          is_liked: false,
          locations: [{ city: { name: 'Dubai', slug: 'dubai' } }],
          creator: { name: 'Nora Field Notes' },
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Like Creator Guest Like Route. 2 likes' }));

    expect(openAuthModal).toHaveBeenCalledTimes(1);
    expect(toggleItineraryLike).not.toHaveBeenCalled();
  });
});
