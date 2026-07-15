import { render, screen } from '@testing-library/react';

import SpecialPage from '../page';
import { getFeaturedItineraries } from '@/lib/services/itineraries';

jest.mock('@/lib/services/itineraries', () => ({
  getFeaturedItineraries: jest.fn(),
}));

jest.mock('@/lib/mapProductToItemCard', () => ({
  mapProductToItemCard: (item, citySlug) => ({
    id: item.id,
    href: `/cities/${citySlug || item.city_slug}/itineraries/${item.slug}`,
    title: item.name,
  }),
}));

jest.mock('@/app/components/Pages/FRONT_END/special/BannerSection', () => ({
  __esModule: true,
  default: () => <section data-testid="special-banner" />,
}));

jest.mock('@/app/components/ui/ProductSliderSection', () => ({
  __esModule: true,
  default: ({ items, title }) => (
    <section data-testid="special-slider" data-title={title}>
      {items.map((item) => (
        <a key={item.id} href={item.href}>
          {item.title}
        </a>
      ))}
    </section>
  ),
}));

jest.mock('@/app/components/Pages/FRONT_END/shared/SharedFilterSection', () => ({
  __esModule: true,
  default: ({ scope, slug }) => <section data-testid="special-filter" data-scope={scope} data-slug={slug} />,
}));

jest.mock('@/app/components/ui/SectionFallback', () => ({
  __esModule: true,
  default: ({ eyebrow, message, variant }) => (
    <section data-testid="section-fallback" data-eyebrow={eyebrow} data-variant={variant}>
      {message}
    </section>
  ),
}));

jest.mock('@/app/components/BreakSection', () => ({
  __esModule: true,
  default: ({ className }) => <hr data-testid="break-section" className={className} />,
}));

describe('SpecialPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders API-backed featured itineraries and the shared city listing', async () => {
    getFeaturedItineraries.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 10,
          name: 'Dubai food crawl',
          slug: 'dubai-food-crawl',
          city_slug: 'dubai',
        },
      ],
    });

    render(await SpecialPage());

    expect(getFeaturedItineraries).toHaveBeenCalledWith('dubai');
    expect(screen.getByTestId('special-slider')).toHaveAttribute('data-title', "You can't miss");
    expect(screen.getByRole('link', { name: 'Dubai food crawl' })).toHaveAttribute('href', '/cities/dubai/itineraries/dubai-food-crawl');
    expect(screen.getByTestId('special-filter')).toHaveAttribute('data-scope', 'city');
    expect(screen.getByTestId('special-filter')).toHaveAttribute('data-slug', 'dubai');
  });

  it('renders an error fallback when featured itinerary loading fails', async () => {
    getFeaturedItineraries.mockResolvedValueOnce({
      success: false,
      data: [],
      message: 'Controlled featured itinerary failure',
    });

    render(await SpecialPage());

    expect(screen.getByTestId('section-fallback')).toHaveAttribute('data-eyebrow', "You can't miss");
    expect(screen.getByTestId('section-fallback')).toHaveAttribute('data-variant', 'error');
    expect(screen.getByText(/couldn't load these special picks/i)).toBeInTheDocument();
  });
});
