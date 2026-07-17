import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
const originalScrollTo = window.scrollTo;

describe('SingleProductReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getActivityReviews.mockResolvedValue({ success: true, data: [], summary: { average_rating: 0, total_reviews: 0, total_photos: 0 } });
    getActivityFeaturedReviews.mockResolvedValue({ success: true, data: [] });
    getItineraryFeaturedReviews.mockResolvedValue({ success: true, data: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    window.scrollTo = originalScrollTo;
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

    renderWithSWR(<SingleProductReview productType="itinerary" itinerarySlug="adventure-tour-in-dubai" productData={{ review_summary: { average_rating: 4.6, total_reviews: 12 } }} />);

    await waitFor(() => expect(getItineraryReviews).toHaveBeenCalledWith('adventure-tour-in-dubai', { sort: 'recent', per_page: 50 }));

    expect(getActivityReviews).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Reviews' })).toBeInTheDocument();
    const reviewControls = screen.getByRole('button', { name: 'All' }).parentElement.parentElement;
    expect(reviewControls).toHaveClass('flex-col', 'sm:flex-row', 'items-stretch', 'sm:items-center');
    expect(screen.getByRole('button', { name: /sort reviews by/i })).toHaveClass('w-full', 'sm:w-auto');
    expect(screen.getAllByText('Atul Sharma')).toHaveLength(2);
    expect(screen.getAllByAltText(/review/i)).toEqual(expect.arrayContaining([expect.objectContaining({ src: expect.stringContaining('/api/media/8') })]));
  });

  it('shows skeleton feedback when changing all review filters', async () => {
    getActivityReviews.mockResolvedValue({
      success: true,
      summary: { average_rating: 4.8, total_reviews: 2, total_photos: 1 },
      data: [
        {
          id: 1,
          rating: 5,
          review_text: 'Photo review from a traveler.',
          user: { id: 1, name: 'Photo Guest' },
          media_gallery: [{ id: 1, name: 'Photo', alt: 'Guest photo', url: '/api/media/photo' }],
          created_at: '2026-06-30',
        },
        {
          id: 2,
          rating: 4,
          review_text: 'Text only review from a traveler.',
          user: { id: 2, name: 'Text Guest' },
          media_gallery: [],
          created_at: '2026-06-29',
        },
      ],
    });

    renderWithSWR(<SingleProductReview productType="activity" activitySlug="desert-safari" productData={{ review_summary: { average_rating: 4.8, total_reviews: 2 } }} />);

    await waitFor(() => expect(screen.getAllByText('Photo Guest').length).toBeGreaterThan(0));

    jest.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: 'With Photos Only' }));

    expect(screen.getByRole('button', { name: 'With Photos Only' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status', { name: 'Loading reviews' })).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(screen.queryByText('Text Guest')).not.toBeInTheDocument();
    expect(screen.getAllByText('Photo Guest').length).toBeGreaterThan(0);
  });

  it('filters influencer reviews with loading feedback', async () => {
    getActivityReviews.mockResolvedValue({
      success: true,
      summary: { average_rating: 5, total_reviews: 2, total_photos: 0 },
      data: [
        {
          id: 3,
          rating: 5,
          review_text: 'Creator review with a clear point of view.',
          is_influencer: true,
          user: { id: 3, name: 'Creator Guest' },
          media_gallery: [],
          created_at: '2026-06-28',
        },
        {
          id: 4,
          rating: 4,
          review_text: 'Regular guest review.',
          user: { id: 4, name: 'Regular Guest' },
          media_gallery: [],
          created_at: '2026-06-27',
        },
      ],
    });

    renderWithSWR(<SingleProductReview productType="activity" activitySlug="desert-safari" productData={{ review_summary: { average_rating: 5, total_reviews: 2 } }} />);

    const influencersButton = await screen.findByRole('button', { name: 'Influencers' });

    expect(influencersButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Regular Guest')).toBeInTheDocument();

    jest.useFakeTimers();

    fireEvent.click(influencersButton);

    expect(influencersButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status', { name: 'Loading reviews' })).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(screen.getByText('Creator Guest')).toBeInTheDocument();
    expect(screen.queryByText('Regular Guest')).not.toBeInTheDocument();
  });

  it('scrolls bottom review navigation to the filter controls', async () => {
    const scrollTo = jest.fn();
    window.scrollTo = scrollTo;

    getActivityReviews.mockResolvedValue({
      success: true,
      summary: { average_rating: 4.8, total_reviews: 4, total_photos: 0 },
      data: [
        {
          id: 1,
          rating: 5,
          review_text: 'First review.',
          user: { id: 1, name: 'First Guest' },
          media_gallery: [],
          created_at: '2026-06-30',
        },
        {
          id: 2,
          rating: 5,
          review_text: 'Second review.',
          user: { id: 2, name: 'Second Guest' },
          media_gallery: [],
          created_at: '2026-06-29',
        },
        {
          id: 3,
          rating: 5,
          review_text: 'Third review.',
          user: { id: 3, name: 'Third Guest' },
          media_gallery: [],
          created_at: '2026-06-28',
        },
        {
          id: 4,
          rating: 5,
          review_text: 'Fourth review.',
          user: { id: 4, name: 'Fourth Guest' },
          media_gallery: [],
          created_at: '2026-06-27',
        },
      ],
    });

    renderWithSWR(<SingleProductReview productType="activity" activitySlug="desert-safari" productData={{ review_summary: { average_rating: 4.8, total_reviews: 4 } }} />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Next review page' })).toBeInTheDocument());

    const filterControls = screen.getByRole('button', { name: 'All' }).parentElement.parentElement;

    fireEvent.click(screen.getByRole('button', { name: 'Next review page' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(document.activeElement).toBe(filterControls);
    expect(screen.getByText('Fourth Guest')).toBeInTheDocument();
    expect(screen.queryByText('First Guest')).not.toBeInTheDocument();
  });
});
