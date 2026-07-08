import { render } from '@testing-library/react';

const BannerSection = jest.fn(() => <div data-testid="banner-section" />);
const getSingleActivity = jest.fn();
const getRandomSimilarActivities = jest.fn();

jest.mock('@/app/components/Pages/FRONT_END/singleproduct/BannerSection', () => ({
  __esModule: true,
  default: (props) => BannerSection(props),
}));

jest.mock('@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection', () => ({
  __esModule: true,
  default: () => <div data-testid="single-product-tabs" />,
}));

jest.mock('@/lib/services/activites', () => ({
  getSingleActivity: (...args) => getSingleActivity(...args),
  getRandomSimilarActivities: (...args) => getRandomSimilarActivities(...args),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('notFound');
  }),
  permanentRedirect: jest.fn((url) => {
    throw new Error(`permanentRedirect:${url}`);
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

describe('SingleActivityPage wishlist banner props', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSingleActivity.mockResolvedValue({
      data: {
        id: 42,
        name: 'Scuba Diving Tour',
        media_gallery: [],
        review_summary: { total_reviews: 3, average_rating: 4.5 },
        locations: [{ city_slug: 'dubai', city: 'Dubai', location_type: 'primary', location_label: 'Main Location' }],
        price: 120,
        currency: 'USD',
      },
    });
    getRandomSimilarActivities.mockResolvedValue([]);
  });

  it('passes activity identity and the route city slug to BannerSection', async () => {
    const SingleActivityPage = (await import('../page')).default;

    render(await SingleActivityPage({ params: Promise.resolve({ city: 'dubai', slug: 'scuba-diving-tour' }), searchParams: Promise.resolve({}) }));

    expect(BannerSection).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 42,
        itemType: 'activity',
        slug: 'scuba-diving-tour',
        citySlug: 'dubai',
        cityName: 'Dubai',
      })
    );
  });
});
