import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CreatorItineraryCard from '../CreatorItineraryCard';
import { recordItineraryView, toggleItineraryLike } from '@/lib/actions/creatorItineraries';

const openAuthModal = jest.fn();

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children, onClick }) => (
    <a
      href={href}
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
