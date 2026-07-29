import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

jest.mock('axios');

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('react-range-slider-input', () => ({
  __esModule: true,
  default: ({ value }) => <div data-testid="price-range">{value.join('-')}</div>,
}));

jest.mock('@/app/components/SingleProductCard', () => ({
  GlobalCard: ({ productTitle, stretch }) => (
    <article data-testid="global-card" data-stretch={stretch ? 'true' : 'false'}>
      {productTitle}
    </article>
  ),
}));

jest.mock('@/app/components/DashboardShared/ListingCard/ListingCardSkeleton', () => ({
  ListingCardSkeleton: () => <div data-testid="listing-card-skeleton" />,
}));

const locations = [
  { id: 1, name: 'Dubai', slug: 'dubai' },
  { id: 2, name: 'Abu Dhabi', slug: 'abu-dhabi' },
  { id: 3, name: 'London', slug: 'london' },
  { id: 4, name: 'New York', slug: 'new-york' },
];

const categories = [
  { id: 1, name: 'Adventure' },
  { id: 2, name: 'Cruises' },
  { id: 3, name: 'Food Tours' },
];

describe('SearchPage filters', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useSearchParams.mockReturnValue(new URLSearchParams('location=dubai&start_date=2026-07-01&end_date=2026-07-03&quantity=2'));

    axios.get.mockImplementation((url) => {
      if (url === '/api/public/regions-cities') {
        return Promise.resolve({ data: { data: locations } });
      }

      if (url === '/api/public/taxonomies/categories') {
        return Promise.resolve({ data: { data: categories } });
      }

      if (url.startsWith('/api/public/search')) {
        return Promise.resolve({ status: 200, data: { data: [] } });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
  });

  it('filters category and location options from sidebar search inputs', async () => {
    const { SearchPage } = await import('../SearchPage');

    render(<SearchPage />);

    await screen.findByLabelText('Search categories');
    await screen.findByLabelText('Search locations');

    fireEvent.change(screen.getByLabelText('Search categories'), { target: { value: 'cru' } });

    const categoryList = screen.getByTestId('category-filter-options');
    expect(within(categoryList).getByText('Cruises')).toBeInTheDocument();
    expect(within(categoryList).queryByText('Adventure')).not.toBeInTheDocument();
    expect(within(categoryList).queryByText('Food Tours')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search locations'), { target: { value: 'abu' } });

    const locationList = screen.getByTestId('location-filter-options');
    expect(within(locationList).getByText('Abu Dhabi')).toBeInTheDocument();
    expect(within(locationList).queryByText('Dubai')).not.toBeInTheDocument();
    expect(within(locationList).queryByText('London')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/public/search?'));
    });
  });

  it('toggles the single mobile filter panel with accessible native button behavior', async () => {
    const { SearchPage } = await import('../SearchPage');

    render(<SearchPage />);
    await screen.findByRole('checkbox', { name: 'Adventure' });

    const filtersButton = screen.getByRole('button', { name: 'Filters' });
    const filters = screen.getByTestId('search-filters');

    expect(filtersButton).toHaveAttribute('type', 'button');
    expect(filtersButton).toHaveAttribute('aria-controls', 'search-results-filters');
    expect(filtersButton).toHaveAttribute('aria-expanded', 'false');
    expect(filtersButton).toHaveClass('h-11', 'md:hidden');
    expect(filters).toHaveAttribute('id', 'search-results-filters');
    expect(filters).toHaveClass('hidden');
    expect(screen.getAllByTestId('search-filters')).toHaveLength(1);

    filtersButton.focus();
    expect(filtersButton).toHaveFocus();
    fireEvent.click(filtersButton, { detail: 0 });

    expect(filtersButton).toHaveAttribute('aria-expanded', 'true');
    expect(filtersButton).toHaveFocus();
    expect(filters).toHaveClass('block');
    expect(filters).not.toHaveClass('hidden');

    fireEvent.click(filtersButton);

    expect(filtersButton).toHaveAttribute('aria-expanded', 'false');
    expect(filters).toHaveClass('hidden');
  });

  it('uses the responsive toolbar, sidebar, and results layout class contracts', async () => {
    const { SearchPage } = await import('../SearchPage');

    render(<SearchPage />);
    await screen.findByRole('checkbox', { name: 'Adventure' });

    const toolbar = screen.getByTestId('search-results-toolbar');
    const layout = screen.getByTestId('search-results-layout');
    const resultsSection = layout.closest('section');
    const filters = screen.getByTestId('search-filters');
    const results = screen.getByTestId('search-results');
    const filtersButton = within(toolbar).getByRole('button', { name: 'Filters' });
    const sortTrigger = within(filters).getByRole('combobox', { name: 'Sort results' });
    const categoryHeading = within(filters).getByRole('heading', { name: 'Category' });

    expect(toolbar).toHaveClass('container-page', 'flex', 'items-center', 'gap-3', 'py-4', 'sm:py-6', 'md:hidden');
    expect(filtersButton).toHaveClass('h-11', 'flex-1', 'justify-center', 'gap-2', 'md:hidden');
    expect(filtersButton).toHaveClass('border', 'bg-background', 'hover:bg-accent', 'hover:text-accent-foreground');
    expect(within(toolbar).queryByRole('combobox', { name: 'Sort results' })).not.toBeInTheDocument();
    expect(sortTrigger).toHaveClass('h-11', 'w-full');
    expect(sortTrigger.compareDocumentPosition(categoryHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(layout).toHaveClass('container-page', 'flex', 'flex-col', 'gap-6', 'pb-10', 'md:flex-row', 'md:items-start', 'md:gap-4', 'lg:gap-8');
    expect(resultsSection).toHaveClass('mt-10', 'md:mt-16', 'lg:mt-24');
    expect(filters).toHaveClass(
      'w-full',
      'rounded-lg',
      'border',
      'border-border',
      'bg-background',
      'p-4',
      'shadow-none',
      'md:block',
      'md:max-w-xs',
      'md:flex-none',
      'md:shadow-md',
      'dark:md:shadow-none',
      'hidden',
    );
    expect(results).toHaveClass('flex', 'min-w-0', 'w-full', 'flex-1', 'items-center', 'justify-center');
  });

  it('preserves filter, sort, and result state after closing and reopening mobile filters', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/public/regions-cities') return Promise.resolve({ data: { data: locations } });
      if (url === '/api/public/taxonomies/categories') return Promise.resolve({ data: { data: categories } });
      if (url.startsWith('/api/public/search')) return Promise.resolve({ status: 200, data: { data: [{ id: 1, name: 'Dubai Walk' }] } });
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
    const { SearchPage } = await import('../SearchPage');

    render(<SearchPage />);

    expect(await screen.findByText('Dubai Walk')).toBeInTheDocument();
    const resultGrid = screen.getByTestId('global-card').parentElement;
    expect(resultGrid).toHaveClass('grid', 'w-full', 'grid-cols-1', 'items-stretch', 'gap-6', 'sm:grid-cols-2', 'xl:grid-cols-3');
    expect(screen.getByTestId('global-card')).toHaveAttribute('data-stretch', 'true');

    const filtersButton = screen.getByRole('button', { name: 'Filters' });
    fireEvent.click(filtersButton);
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Adventure' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search locations' }), { target: { value: 'dub' } });

    const sortTrigger = screen.getByRole('combobox', { name: 'Sort results' });
    fireEvent.keyDown(sortTrigger, { key: 'ArrowDown' });
    fireEvent.click(await screen.findByRole('option', { name: 'Price Low to High' }));

    fireEvent.click(filtersButton);
    fireEvent.click(filtersButton);

    expect(screen.getByRole('checkbox', { name: 'Adventure' })).toBeChecked();
    expect(screen.getByRole('searchbox', { name: 'Search locations' })).toHaveValue('dub');
    expect(sortTrigger).toHaveTextContent('Price Low to High');
    expect(screen.getByText('Dubai Walk')).toBeInTheDocument();
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('sort_by=price_asc'));
    });
  });

  it('centers the empty results message in the results area', async () => {
    const { SearchPage } = await import('../SearchPage');

    render(<SearchPage />);

    const emptyMessage = await screen.findByText('Sorry No Items');
    const emptyState = emptyMessage.closest('[data-testid="search-empty-results"]');

    expect(emptyState).toHaveClass('flex', 'min-h-[420px]', 'w-full', 'items-center', 'justify-center', 'text-center');
  });

  it('matches a canonical location slug and sends that slug to the search API', async () => {
    useSearchParams.mockReturnValue(new URLSearchParams('location=new-york&start_date=2026-08-10&end_date=2026-08-14&quantity=3'));
    const { SearchPage } = await import('../SearchPage');

    render(<SearchPage />);

    await screen.findByRole('radio', { name: 'Dubai' });
    const locationList = screen.getByTestId('location-filter-options');
    expect(within(locationList).getByRole('radio', { name: 'New York' })).toBeChecked();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('location=new-york'));
    });
  });

  it('does not silently select or search the first location for an unknown slug', async () => {
    useSearchParams.mockReturnValue(new URLSearchParams('location=unknown-place&start_date=2026-08-10&end_date=2026-08-14&quantity=3'));
    const { SearchPage } = await import('../SearchPage');

    render(<SearchPage />);

    await screen.findByRole('radio', { name: 'Dubai' });
    const locationList = screen.getByTestId('location-filter-options');
    expect(
      within(locationList)
        .getAllByRole('radio')
        .every((radio) => !radio.checked),
    ).toBe(true);

    await waitFor(() => {
      expect(axios.get.mock.calls.some(([url]) => url.startsWith('/api/public/search?'))).toBe(false);
    });
  });

  it('clears prior results when the mounted URL changes to an unknown location', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/public/regions-cities') return Promise.resolve({ data: { data: locations } });
      if (url === '/api/public/taxonomies/categories') return Promise.resolve({ data: { data: categories } });
      if (url.startsWith('/api/public/search')) return Promise.resolve({ status: 200, data: { data: [{ id: 1, name: 'Dubai Walk' }] } });
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
    const { SearchPage } = await import('../SearchPage');
    const { rerender } = render(<SearchPage />);
    expect(await screen.findByText('Dubai Walk')).toBeInTheDocument();

    useSearchParams.mockReturnValue(new URLSearchParams('location=unknown-place&start_date=2026-08-10&end_date=2026-08-14&quantity=3'));
    rerender(<SearchPage />);

    await waitFor(() => expect(screen.queryByText('Dubai Walk')).not.toBeInTheDocument());
    const locationList = screen.getByTestId('location-filter-options');
    expect(
      within(locationList)
        .getAllByRole('radio')
        .every((radio) => !radio.checked),
    ).toBe(true);
  });

  it('ignores an older product response after the mounted URL changes', async () => {
    let resolveDubai;
    let resolveLondon;
    axios.get.mockImplementation((url) => {
      if (url === '/api/public/regions-cities') return Promise.resolve({ data: { data: locations } });
      if (url === '/api/public/taxonomies/categories') return Promise.resolve({ data: { data: categories } });
      if (url.includes('location=dubai')) {
        return new Promise((resolve) => {
          resolveDubai = resolve;
        });
      }
      if (url.includes('location=london')) {
        return new Promise((resolve) => {
          resolveLondon = resolve;
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
    const { SearchPage } = await import('../SearchPage');
    const { rerender } = render(<SearchPage />);
    await waitFor(() => expect(resolveDubai).toBeDefined(), { timeout: 1500 });

    useSearchParams.mockReturnValue(new URLSearchParams('location=london&start_date=2026-08-10&end_date=2026-08-14&quantity=3'));
    rerender(<SearchPage />);
    await waitFor(() => expect(resolveLondon).toBeDefined(), { timeout: 1500 });

    await act(async () => {
      resolveLondon({ status: 200, data: { data: [{ id: 2, name: 'London Walk' }] } });
    });
    expect(await screen.findByText('London Walk')).toBeInTheDocument();

    await act(async () => {
      resolveDubai({ status: 200, data: { data: [{ id: 1, name: 'Stale Dubai Walk' }] } });
    });
    expect(screen.queryByText('Stale Dubai Walk')).not.toBeInTheDocument();
    expect(screen.getByText('London Walk')).toBeInTheDocument();
  });
});
