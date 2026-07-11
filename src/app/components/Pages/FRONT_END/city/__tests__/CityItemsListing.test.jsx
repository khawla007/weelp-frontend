import { render, screen } from '@testing-library/react';

import CityItemsListing from '../CityItemsListing';

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

jest.mock('../CityListingControls', () => ({
  __esModule: true,
  default: ({ query }) => <div data-testid="listing-controls" data-query={new URLSearchParams(query).toString()} />,
  CityListingToolbar: () => <div data-testid="listing-sort-toolbar" />,
}));

jest.mock('@/app/components/ui/SectionHeader', () => ({
  __esModule: true,
  default: ({ title }) => <h1>{title}</h1>,
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className }) => <div className={className}>{children}</div>,
}));

jest.mock('@/app/components/ui/item-card', () => ({
  __esModule: true,
  default: ({ title, href }) => <a href={href}>{title}</a>,
}));

jest.mock('@/lib/mapProductToItemCard', () => ({
  mapProductToItemCard: (item, citySlug) => ({
    id: item.id,
    href: `/cities/${citySlug}/activities/${item.slug}`,
    title: item.name,
  }),
}));

jest.mock('@/lib/services/cities', () => ({
  getCityData: jest.fn(),
  getCityItemsByType: jest.fn(),
}));

const { getCityData, getCityItemsByType } = jest.requireMock('@/lib/services/cities');

describe('CityItemsListing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCityData.mockResolvedValue({ data: { name: 'Dubai' } });
    getCityItemsByType.mockResolvedValue({
      success: true,
      data: [{ id: 1, name: 'Dubai Desert Safari', slug: 'dubai-desert-safari', item_type: 'activity' }],
      last_page: 12,
      available_categories: [{ slug: 'sports', name: 'Sports' }],
      available_tags: [{ slug: 'family', name: 'Family' }],
    });
  });

  it('allows pagination controls to wrap on narrow listing screens', async () => {
    const ui = await CityItemsListing({
      citySlug: 'dubai',
      itemType: 'activities',
      searchParams: Promise.resolve({ page: '6' }),
    });

    render(ui);

    const pagination = screen.getByLabelText('Pagination');
    expect(screen.getByTestId('listing-heading')).toHaveClass('gap-4');
    expect(screen.getByTestId('listing-layout')).toHaveClass('lg:grid-cols-[224px_minmax(0,1fr)]');
    expect(screen.getByTestId('listing-sidebar')).toHaveClass('lg:col-start-1', 'lg:row-start-1');
    expect(screen.getByTestId('listing-results')).toHaveClass('lg:col-start-2', 'lg:row-start-1');
    expect(screen.getByTestId('listing-sidebar').compareDocumentPosition(screen.getByTestId('listing-results')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(pagination).toHaveClass('max-w-full', 'flex-wrap');
    expect(screen.getByTestId('mobile-page-status')).toHaveClass('sm:hidden');
    expect(screen.getByTestId('desktop-page-links')).toHaveClass('hidden', 'sm:contents');
    expect(getCityItemsByType).toHaveBeenCalledWith('dubai', 'activity', {
      page: 6,
      per_page: 10,
    });
    expect(screen.getByLabelText('Previous page')).toHaveAttribute('data-query', 'page=5');
    expect(screen.getByLabelText('Next page')).toHaveAttribute('data-query', 'page=7');
    expect(screen.getByLabelText('Previous page')).toHaveClass('size-11');
  });

  it('preserves active listing filters in pagination links', async () => {
    const ui = await CityItemsListing({
      citySlug: 'dubai',
      itemType: 'packages',
      searchParams: Promise.resolve({ page: '2', search: 'beach', tags: 'family', sort_by: 'price_desc' }),
    });

    render(ui);

    expect(getCityItemsByType).toHaveBeenCalledWith('dubai', 'package', {
      page: 2,
      per_page: 10,
      search: 'beach',
      tags: 'family',
      sort_by: 'price_desc',
    });
    expect(screen.getByLabelText('Next page')).toHaveAttribute('data-query', 'search=beach&tags=family&sort_by=price_desc&page=3');
  });

  it('preserves active filters when recovering from an empty page', async () => {
    getCityItemsByType.mockResolvedValueOnce({ success: true, data: [], current_page: 9, last_page: 2, available_categories: [], available_tags: [] });
    const ui = await CityItemsListing({
      citySlug: 'dubai',
      itemType: 'packages',
      searchParams: Promise.resolve({ page: '9', search: 'beach', tags: 'family' }),
    });

    render(ui);

    expect(screen.getByRole('link', { name: 'Back to first page' })).toHaveAttribute('data-query', 'search=beach&tags=family');
    expect(screen.getByRole('link', { name: 'Clear filters' })).toHaveAttribute('data-query', '');
  });

  it('does not render filter controls when the listing request fails', async () => {
    getCityItemsByType.mockResolvedValueOnce({ success: false, data: [] });
    const ui = await CityItemsListing({ citySlug: 'dubai', itemType: 'activities', searchParams: Promise.resolve({}) });

    render(ui);

    expect(screen.queryByTestId('listing-controls')).not.toBeInTheDocument();
    expect(screen.getByText('Something went wrong. Please try again later.')).toBeInTheDocument();
  });
});
