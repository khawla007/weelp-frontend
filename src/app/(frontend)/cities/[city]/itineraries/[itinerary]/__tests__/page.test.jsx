import { render } from '@testing-library/react';

const BannerSection = jest.fn(() => <div data-testid="banner-section" />);
const SingleProductTabSection = jest.fn(() => <div data-testid="single-product-tabs" />);
const CreatorItineraryViewRecorder = jest.fn(() => <div data-testid="creator-view-recorder" />);
const getSingleItinerary = jest.fn();
const getRandomSimilarItineraries = jest.fn();
const auth = jest.fn();

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => (props) => SingleProductTabSection(props),
}));

jest.mock('@/app/components/Pages/FRONT_END/singleproduct/BannerSection', () => ({
  __esModule: true,
  default: (props) => BannerSection(props),
}));

jest.mock('@/app/components/Pages/FRONT_END/explore/CreatorItineraryViewRecorder', () => ({
  __esModule: true,
  default: (props) => CreatorItineraryViewRecorder(props),
}));

jest.mock('@/lib/services/itineraries', () => ({
  getSingleItinerary: (...args) => getSingleItinerary(...args),
  getRandomSimilarItineraries: (...args) => getRandomSimilarItineraries(...args),
}));

jest.mock('@/lib/auth/auth', () => ({
  auth: (...args) => auth(...args),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('notFound');
  }),
}));

jest.mock('@/app/components/AffiliateTracker', () => ({
  __esModule: true,
  default: () => <div data-testid="affiliate-tracker" />,
}));

jest.mock('@/app/components/SEO/SeoBodyScripts', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/app/components/SEO/SeoFooterScripts', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/app/components/SEO/SeoHeadScripts', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/app/components/SEO/SeoStructuredData', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/lib/seo/dynamicSchema', () => ({
  withGeneratedSchema: () => ({}),
}));

describe('IterenaryPage wishlist banner props', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue(null);
    getSingleItinerary.mockResolvedValue({
      success: true,
      data: {
        id: 77,
        name: 'Dubai Family Itinerary',
        media_gallery: [],
        review_summary: { total_reviews: 2, average_rating: 5 },
        locations: [{ city: 'Dubai' }],
        schedules: [{ day: 1 }, { day: 2 }],
        price: 300,
        currency: 'USD',
        is_creator_itinerary: true,
      },
    });
    getRandomSimilarItineraries.mockResolvedValue([]);
  });

  it('passes itinerary identity and the route city slug to BannerSection', async () => {
    const IterenaryPage = (await import('../page')).default;

    render(await IterenaryPage({ params: Promise.resolve({ city: 'dubai', itinerary: 'dubai-family-itinerary' }), searchParams: Promise.resolve({}) }));

    expect(BannerSection).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 77,
        itemType: 'itinerary',
        slug: 'dubai-family-itinerary',
        citySlug: 'dubai',
        cityName: 'Dubai',
      }),
    );
    expect(SingleProductTabSection).toHaveBeenCalledWith(
      expect.objectContaining({
        itinerarySlug: 'dubai-family-itinerary',
        citySlug: 'dubai',
      }),
    );
  });

  it('records creator itinerary views from the detail page only', async () => {
    const IterenaryPage = (await import('../page')).default;

    render(await IterenaryPage({ params: Promise.resolve({ city: 'dubai', itinerary: 'dubai-family-itinerary' }), searchParams: Promise.resolve({}) }));

    expect(CreatorItineraryViewRecorder).toHaveBeenCalledWith(
      expect.objectContaining({
        itineraryId: 77,
        enabled: true,
      }),
    );
  });
});
