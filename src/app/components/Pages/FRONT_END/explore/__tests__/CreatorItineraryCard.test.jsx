import { render, screen } from '@testing-library/react';

import CreatorItineraryCard from '../CreatorItineraryCard';

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

jest.mock('@/app/components/MediaImage', () => ({
  __esModule: true,
  default: ({ alt }) => <span>{alt}</span>,
}));

jest.mock('@/lib/actions/creatorItineraries', () => ({
  toggleItineraryLike: jest.fn(),
  recordItineraryView: jest.fn(() => Promise.resolve({ success: true, views_count: 1 })),
}));

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
});
