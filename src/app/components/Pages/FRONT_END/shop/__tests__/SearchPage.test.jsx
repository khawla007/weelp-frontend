import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  GlobalCard: ({ productTitle }) => <article>{productTitle}</article>,
}));

jest.mock('@/app/components/DashboardShared/ListingCard/ListingCardSkeleton', () => ({
  ListingCardSkeleton: () => <div data-testid="listing-card-skeleton" />,
}));

const locations = [
  { id: 1, name: 'Dubai' },
  { id: 2, name: 'Abu Dhabi' },
  { id: 3, name: 'London' },
];

const categories = [
  { id: 1, name: 'Adventure' },
  { id: 2, name: 'Cruises' },
  { id: 3, name: 'Food Tours' },
];

describe('SearchPage filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSearchParams.mockReturnValue({
      get: jest.fn((key) => {
        const values = {
          location: 'Dubai',
          start_date: '2026-07-01',
          end_date: '2026-07-03',
          quantity: '2',
        };

        return values[key] ?? null;
      }),
    });

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

  it('centers the empty results message in the results area', async () => {
    const { SearchPage } = await import('../SearchPage');

    render(<SearchPage />);

    const emptyMessage = await screen.findByText('Sorry No Items');
    const emptyState = emptyMessage.closest('[data-testid="search-empty-results"]');

    expect(emptyState).toHaveClass('flex', 'min-h-[420px]', 'w-full', 'items-center', 'justify-center', 'text-center');
  });
});
