import { render, screen, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';

import { SingleProductReview } from '../SingleProductReview';
import { getActivityReviews, getActivityFeaturedReviews, getItineraryReviews, getItineraryFeaturedReviews } from '@/lib/services/reviews';

jest.mock('@/lib/services/reviews', () => ({
  getActivityReviews: jest.fn(),
  getActivityFeaturedReviews: jest.fn(),
  getItineraryReviews: jest.fn(),
  getItineraryFeaturedReviews: jest.fn(),
}));

jest.mock('swiper/react', () => ({
  Swiper: ({ children, className }) => <div className={`swiper ${className || ''}`}>{children}</div>,
  SwiperSlide: ({ children, className, style }) => (
    <div className={`swiper-slide ${className || ''}`} style={style}>
      {children}
    </div>
  ),
}));

jest.mock('swiper/modules', () => ({
  Navigation: {},
}));

const renderWithSWR = (ui) => render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{ui}</SWRConfig>);

describe('SingleProductReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getActivityReviews.mockResolvedValue({ success: true, data: [], summary: { average_rating: 0, total_reviews: 0, total_photos: 0 } });
    getActivityFeaturedReviews.mockResolvedValue({ success: true, data: [] });
    getItineraryFeaturedReviews.mockResolvedValue({ success: true, data: [] });
  });

  it('fetches itinerary reviews and renders review media images', async () => {
    getItineraryReviews.mockResolvedValue({
      success: true,
      summary: { average_rating: 4.6, total_reviews: 12, total_photos: 1 },
      data: [
        {
          id: 8,
          rating: 5,
          review_text: 'The itinerary balanced activities and breaks well.',
          is_featured: false,
          user: { id: 4, name: 'Atul Sharma' },
          media_gallery: [{ id: 8, name: 'Review photo', alt: 'Guest itinerary photo', url: '/api/media/8' }],
          created_at: '2026-06-29',
        },
      ],
    });

    renderWithSWR(
      <SingleProductReview
        productType="itinerary"
        itinerarySlug="adventure-tour-in-dubai"
        productData={{ review_summary: { average_rating: 4.6, total_reviews: 12 } }}
      />,
    );

    await waitFor(() => expect(getItineraryReviews).toHaveBeenCalledWith('adventure-tour-in-dubai', { sort: 'recent', per_page: 50 }));

    expect(getActivityReviews).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Reviews' })).toBeInTheDocument();
    expect(screen.getAllByText('Atul Sharma')).toHaveLength(2);
    expect(screen.getAllByAltText(/review/i)).toEqual(expect.arrayContaining([expect.objectContaining({ src: expect.stringContaining('/api/media/8') })]));
  });
});
