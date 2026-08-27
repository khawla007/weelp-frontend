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

const mockSetHelpful = jest.fn();
const mockUseReviewHelpfulVotes = jest.fn((reviews) => ({
  stateFor: (review) => ({
    count: review.helpfulCount,
    isMarked: false,
    isPending: false,
    isStatusReady: true,
  }),
  setHelpful: mockSetHelpful,
}));

jest.mock('@/hooks/api/public/useReviewHelpfulVotes', () => ({
  useReviewHelpfulVotes: (...args) => mockUseReviewHelpfulVotes(...args),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 7 } }, status: 'authenticated' }),
}));

let mockSwiperProps;

jest.mock('swiper/react', () => ({
  Swiper: ({ children, className, ...props }) => {
    mockSwiperProps.push(props);
    return <div className={`swiper ${className || ''}`}>{children}</div>;
  },
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
    mockSwiperProps = [];
    getActivityReviews.mockResolvedValue({ success: true, data: [], summary: { average_rating: 0, total_reviews: 0, total_photos: 0 } });
    getActivityFeaturedReviews.mockResolvedValue({ success: true, data: [] });
    getItineraryFeaturedReviews.mockResolvedValue({ success: true, data: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    window.scrollTo = originalScrollTo;
  });

  it('does not render nonexistent static review images when the API has no review media', async () => {
    getActivityFeaturedReviews.mockResolvedValue({
      success: true,
      data: [{ id: 90, rating: 5, review_text: 'Featured review', user: { name: 'Featured Guest' }, media_gallery: [], created_at: '2026-06-30' }],
    });
    const { container } = renderWithSWR(<SingleProductReview productType="activity" activitySlug="desert-safari" productData={{ review_summary: { average_rating: 0, total_reviews: 0 } }} />);

    await waitFor(() => expect(container.querySelector('[data-public-card="review-summary"]')).toBeInTheDocument());

    expect(document.querySelectorAll('img[src^="/images/reviews/"]')).toHaveLength(0);
    expect(screen.getByRole('img', { name: '0 out of 5 stars' })).toBeInTheDocument();
    expect(container.querySelector('[data-public-card="review-summary"]')).toHaveClass('rounded-[24px]');
    expect(container.querySelector('[data-public-card="review-empty"]')).toHaveClass('rounded-[24px]');
  });

  it('fetches itinerary reviews and renders review media images', async () => {
    getItineraryReviews.mockResolvedValue({
      success: true,
      summary: { average_rating: 4.6, total_reviews: 12, total_photos: 1 },
      data: [
        {
          id: 8,
          helpful_count: 4,
          rating: 5,
          review_text: 'The itinerary balanced activities and breaks well.',
          is_featured: false,
          user: { id: 4, name: 'Atul Sharma' },
          media_gallery: [{ id: 8, name: 'Review photo', alt: 'Guest itinerary photo', url: '/api/media/8' }],
          created_at: '2026-06-29',
        },
      ],
    });

    const { container } = renderWithSWR(
      <SingleProductReview productType="itinerary" itinerarySlug="adventure-tour-in-dubai" productData={{ review_summary: { average_rating: 4.6, total_reviews: 12 } }} />,
    );

    await waitFor(() => expect(getItineraryReviews).toHaveBeenCalledWith('adventure-tour-in-dubai', { sort: 'recent', per_page: 50 }));

    expect(getActivityReviews).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Reviews' })).toBeInTheDocument();
    const reviewControls = screen.getByRole('button', { name: 'All' }).parentElement.parentElement;
    expect(reviewControls).toHaveClass('flex-col', 'sm:flex-row', 'items-stretch', 'sm:items-center');
    expect(screen.getByRole('button', { name: /sort reviews by/i })).toHaveClass('w-full', 'sm:w-auto');
    expect(screen.getAllByText('Atul Sharma')).toHaveLength(2);
    expect(screen.getAllByAltText(/review/i)).toEqual(expect.arrayContaining([expect.objectContaining({ src: expect.stringContaining('/api/media/8') })]));
    expect(mockUseReviewHelpfulVotes).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining({ id: 8, helpfulCount: 4 })]));
    expect(screen.getAllByText('Helpful · 4')).toHaveLength(1);
    for (const card of container.querySelectorAll('[data-public-card="review-entry"]')) expect(card).toHaveClass('rounded-[24px]');
  });

  it('preserves activity review vote fields and renders the persisted helpful count', async () => {
    getActivityReviews.mockResolvedValue({
      success: true,
      summary: { average_rating: 4.9, total_reviews: 1, total_photos: 0 },
      data: [
        {
          id: 18,
          helpful_count: 4,
          rating: 5,
          review_text: 'The guide made the activity easy to follow.',
          user: { id: 5, name: 'Activity Guest' },
          media_gallery: [],
          created_at: '2026-06-30',
        },
      ],
    });

    renderWithSWR(<SingleProductReview productType="activity" activitySlug="desert-safari" productData={{ review_summary: { average_rating: 4.9, total_reviews: 1 } }} />);

    await waitFor(() => expect(screen.getByText('Helpful · 4')).toBeInTheDocument());

    const reviewCard = screen.getByText('The guide made the activity easy to follow.').parentElement;

    expect(reviewCard.parentElement).not.toHaveClass('min-h-[600px]');
    expect(mockUseReviewHelpfulVotes).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining({ id: 18, helpfulCount: 4 })]));
    fireEvent.click(screen.getByRole('button', { name: 'Mark review as helpful' }));
    expect(mockSetHelpful).toHaveBeenCalledWith(18, true);
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

    const { container } = renderWithSWR(<SingleProductReview productType="activity" activitySlug="desert-safari" productData={{ review_summary: { average_rating: 4.8, total_reviews: 2 } }} />);

    await waitFor(() => expect(screen.getAllByText('Photo Guest').length).toBeGreaterThan(0));

    jest.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: 'With Photos Only' }));

    expect(screen.getByRole('button', { name: 'With Photos Only' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status', { name: 'Loading reviews' })).toBeInTheDocument();
    for (const card of container.querySelectorAll('[data-public-card="review-skeleton"]')) expect(card).toHaveClass('rounded-[24px]');

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
    const previousButton = screen.getByRole('button', { name: 'Previous review page' });
    const nextButton = screen.getByRole('button', { name: 'Next review page' });

    expect(previousButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(previousButton);

    expect(scrollTo).not.toHaveBeenCalled();
    expect(screen.getByText('First Guest')).toBeInTheDocument();

    fireEvent.click(nextButton);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(document.activeElement).toBe(filterControls);
    expect(screen.getByText('Fourth Guest')).toBeInTheDocument();
    expect(screen.queryByText('First Guest')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous review page' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next review page' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next review page' }));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Fourth Guest')).toBeInTheDocument();
    expect(screen.queryByText('First Guest')).not.toBeInTheDocument();
  });

  it('keeps single product review sliders from looping', async () => {
    getActivityReviews.mockResolvedValue({
      success: true,
      summary: { average_rating: 4.8, total_reviews: 4, total_photos: 5 },
      data: [
        {
          id: 1,
          rating: 5,
          review_text: 'First photo review.',
          user: { id: 1, name: 'First Guest' },
          media_gallery: [
            { id: 1, name: 'Photo 1', alt: 'Photo 1', url: '/api/media/1' },
            { id: 2, name: 'Photo 2', alt: 'Photo 2', url: '/api/media/2' },
          ],
          created_at: '2026-06-30',
        },
        {
          id: 2,
          rating: 5,
          review_text: 'Second photo review.',
          user: { id: 2, name: 'Second Guest' },
          media_gallery: [{ id: 3, name: 'Photo 3', alt: 'Photo 3', url: '/api/media/3' }],
          created_at: '2026-06-29',
        },
        {
          id: 3,
          rating: 5,
          review_text: 'Third photo review.',
          user: { id: 3, name: 'Third Guest' },
          media_gallery: [{ id: 4, name: 'Photo 4', alt: 'Photo 4', url: '/api/media/4' }],
          created_at: '2026-06-28',
        },
        {
          id: 4,
          rating: 5,
          review_text: 'Fourth photo review.',
          user: { id: 4, name: 'Fourth Guest' },
          media_gallery: [{ id: 5, name: 'Photo 5', alt: 'Photo 5', url: '/api/media/5' }],
          created_at: '2026-06-27',
        },
      ],
    });

    renderWithSWR(<SingleProductReview productType="activity" activitySlug="desert-safari" productData={{ review_summary: { average_rating: 4.8, total_reviews: 4 } }} />);

    await waitFor(() => expect(screen.getAllByText('First photo review.').length).toBeGreaterThan(0));

    expect(mockSwiperProps.length).toBeGreaterThanOrEqual(3);
    expect(mockSwiperProps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ navigation: expect.objectContaining({ prevEl: '.photo-prev' }), loop: false, rewind: false, watchOverflow: true }),
        expect.objectContaining({ navigation: expect.objectContaining({ prevEl: '.featured-prev' }), loop: false, rewind: false, watchOverflow: true }),
        expect.objectContaining({ navigation: expect.objectContaining({ prevEl: '.review-img-prev-0' }), loop: false, rewind: false, watchOverflow: true }),
      ]),
    );
    expect(mockSwiperProps.every((props) => props.loop !== true)).toBe(true);
  });
});
