import { render, screen } from '@testing-library/react';

import CitiesPage from '../page';
import { getAllCities } from '@/lib/services/cities';

jest.mock('@/lib/services/cities', () => ({
  getAllCities: jest.fn(),
}));

jest.mock('@/app/components/BreadCrumb', () => ({
  __esModule: true,
  default: () => <nav>Breadcrumb</nav>,
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={typeof href === 'string' ? href : href.pathname} data-query={typeof href === 'object' ? new URLSearchParams(href.query).toString() : ''} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/app/components/CityCard', () => ({
  __esModule: true,
  default: ({ city, className = '' }) => (
    <a href={`/cities/${city.slug}`} data-card-class={className}>
      {city.name}
    </a>
  ),
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className }) => <section className={className}>{children}</section>,
}));

jest.mock('@/app/components/Pages/FRONT_END/cities/CitiesListingControls', () => ({
  __esModule: true,
  default: ({ countries, seasons }) => (
    <div data-testid="cities-controls" data-countries={countries.map((country) => country.slug).join(',')} data-seasons={seasons.map((season) => season.slug).join(',')} />
  ),
  CitiesListingToolbar: () => <div data-testid="cities-toolbar" />,
}));

describe('CitiesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllCities.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'Abu Dhabi', slug: 'abu-dhabi', activities_count: 5 },
        { id: 2, name: 'Dubai', slug: 'dubai', activities_count: 8 },
      ],
      current_page: 2,
      last_page: 3,
      per_page: 6,
      total: 22,
      available_countries: [{ id: 1, name: 'United Arab Emirates', slug: 'united-arab-emirates' }],
      available_seasons: [{ name: 'Winter', slug: 'winter' }],
    });
  });

  it('forwards filters to the cities service and preserves them in pagination links', async () => {
    render(
      await CitiesPage({
        searchParams: Promise.resolve({
          page: '2',
          search: 'abu',
          country: 'united-arab-emirates',
          season: 'winter',
          sort_by: 'activities_desc',
        }),
      }),
    );

    expect(getAllCities).toHaveBeenCalledWith(2, 6, {
      search: 'abu',
      country: 'united-arab-emirates',
      season: 'winter',
      sort_by: 'activities_desc',
    });
    expect(screen.getByRole('heading', { name: 'All Cities' })).toBeInTheDocument();
    expect(screen.getByTestId('cities-heading-stack')).toHaveClass('pt-6', 'md:pt-[70px]');
    expect(screen.getByTestId('cities-heading-stack')).not.toHaveClass('pt-[70px]');
    expect(screen.getByText('22 cities')).toBeInTheDocument();
    expect(screen.getByTestId('cities-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('cities-listing-layout')).toHaveClass('lg:grid-cols-[minmax(280px,1fr)_minmax(0,3fr)]');
    expect(screen.getByTestId('cities-listing-sidebar')).toHaveClass('lg:col-start-1', 'lg:row-start-1');
    expect(screen.getByTestId('cities-listing-results')).toHaveClass('lg:col-start-2', 'lg:row-start-1');
    expect(screen.getByTestId('cities-controls')).toHaveAttribute('data-countries', 'united-arab-emirates');
    expect(screen.getByTestId('cities-controls')).toHaveAttribute('data-seasons', 'winter');
    expect(screen.getByText('Abu Dhabi').closest('section')).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-2', 'xl:grid-cols-3');
    expect(screen.getByText('Abu Dhabi').closest('section')).not.toHaveClass('2xl:grid-cols-4');
    expect(screen.getByText('Abu Dhabi')).toHaveAttribute('data-card-class', '');
    expect(screen.getByLabelText('Previous page')).toHaveAttribute('data-query', 'search=abu&country=united-arab-emirates&season=winter&sort_by=activities_desc&page=1');
    expect(screen.getByLabelText('Next page')).toHaveAttribute('data-query', 'search=abu&country=united-arab-emirates&season=winter&sort_by=activities_desc&page=3');
  });
});
