import { render } from '@testing-library/react';

const BannerSection = jest.fn(() => <div data-testid="banner-section" />);
const getSinglePackage = jest.fn();
const getRandomSimilarPackages = jest.fn();

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => () => <div data-testid="single-product-tabs" />,
}));

jest.mock('@/app/components/Pages/FRONT_END/singleproduct/BannerSection', () => ({
  __esModule: true,
  default: (props) => BannerSection(props),
}));

jest.mock('@/lib/services/package', () => ({
  getSinglePackage: (...args) => getSinglePackage(...args),
  getRandomSimilarPackages: (...args) => getRandomSimilarPackages(...args),
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

describe('PackagePage wishlist banner props', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSinglePackage.mockResolvedValue({
      data: {
        id: 88,
        name: 'Dubai Family Package',
        media_gallery: [],
        review_summary: { total_reviews: 4, average_rating: 4 },
        locations: [{ city: 'Dubai' }],
        schedules: [{ day: 1 }, { day: 2 }],
        price: 450,
        currency: 'USD',
      },
    });
    getRandomSimilarPackages.mockResolvedValue([]);
  });

  it('passes package identity and the route city slug to BannerSection', async () => {
    const PackagePage = (await import('../page')).default;

    render(await PackagePage({ params: Promise.resolve({ city: 'dubai', package: 'dubai-family-package' }), searchParams: Promise.resolve({}) }));

    expect(BannerSection).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 88,
        itemType: 'package',
        slug: 'dubai-family-package',
        citySlug: 'dubai',
        cityName: 'Dubai',
      }),
    );
  });
});
