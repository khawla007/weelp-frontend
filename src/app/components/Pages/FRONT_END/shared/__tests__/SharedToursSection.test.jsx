import { act, fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';

import SharedToursSection from '../SharedToursSection';

jest.mock('axios');

const mockItemCard = jest.fn(({ title, href }) => <a href={href}>{title}</a>);

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className, as: Component = 'div' }) => <Component className={className}>{children}</Component>,
}));

jest.mock('@/app/components/Animation/Cards', () => ({
  ProductCardSkelton: ({ className = '' }) => <div data-testid="tour-skeleton" className={className} />,
}));

jest.mock('@/app/components/ui/item-card', () => ({
  __esModule: true,
  default: (props) => mockItemCard(props),
}));

jest.mock('@/app/components/ui/Pagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalPages, onPageChange }) => (
    <nav aria-label="Pagination">
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button type="button" onClick={() => onPageChange(2)}>
        2
      </button>
    </nav>
  ),
}));

jest.mock('../ToursMapView', () => ({
  __esModule: true,
  default: ({ cards, markers, cityName }) => (
    <section data-testid="tours-map-view" data-card-count={cards.length} data-marker-count={markers.length} aria-label={`${cityName} tours map`}>
      {cards.map((card) => (
        <span key={card.id}>{card.title}</span>
      ))}
    </section>
  ),
}));

jest.mock('@/lib/mapProductToItemCard', () => ({
  mapProductToItemCard: (item, citySlug) => ({
    id: item.id,
    href: `/cities/${citySlug}/itineraries/${item.slug}`,
    title: item.name,
    price: item.schedule_total_price ? `$${item.schedule_total_price}` : '',
    hasValidIdentity: true,
    hasRealTitle: true,
    hasRealImage: true,
    priceValue: 130,
    priceCurrency: 'USD',
    attributes: [{ slug: 'duration', name: 'Duration', attribute_value: '2 Hours' }],
    wishlistItem: { item_type: 'itinerary', item_id: item.id },
  }),
}));

const itineraryResponse = {
  data: {
    success: true,
    data: [{ id: 1, name: 'Dubai two-day itinerary', slug: 'dubai-two-day-itinerary', city_slug: 'dubai' }],
    all_tags: [{ id: 1, name: 'Family', is_featured: true }],
    last_page: 1,
    total: 1,
  },
};

const paginatedItineraryResponse = (count, lastPage = 1) => ({
  data: {
    success: true,
    data: Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: `Dubai itinerary ${index + 1}`,
      slug: `dubai-itinerary-${index + 1}`,
      city_slug: 'dubai',
    })),
    all_tags: [],
    last_page: lastPage,
    total: count * lastPage,
  },
});

describe('SharedToursSection destination states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const flushFetch = async () => {
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  it('shows loading skeletons before the first destination tour response settles', async () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    render(<SharedToursSection scope="city" slug="dubai" title="Dubai" />);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getAllByTestId('tour-skeleton')).toHaveLength(6);
  });

  it('uses four columns, ten items per page, and API-driven pagination for city tours', async () => {
    axios.get.mockResolvedValue(paginatedItineraryResponse(10, 3));
    render(<SharedToursSection scope="city" slug="dubai" title="Dubai" />);
    await flushFetch();

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('page=1&per_page=10'));
    expect(screen.getByRole('link', { name: 'Dubai itinerary 1' }).parentElement).toHaveClass('xl:grid-cols-4');
    expect(screen.getByRole('link', { name: 'Dubai itinerary 1' }).parentElement).not.toHaveClass('xl:grid-cols-5');
    expect(mockItemCard).toHaveBeenCalledWith(
      expect.objectContaining({
        hasValidIdentity: true,
        hasRealTitle: true,
        hasRealImage: true,
        priceValue: 130,
        priceCurrency: 'USD',
        attributes: [{ slug: 'duration', name: 'Duration', attribute_value: '2 Hours' }],
        wishlistItem: expect.objectContaining({ item_type: 'itinerary', item_id: expect.any(Number) }),
      }),
    );
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    await flushFetch();

    expect(axios.get).toHaveBeenLastCalledWith(expect.stringContaining('page=2&per_page=10'));
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('keeps the sort menu inside the mobile viewport while preserving desktop alignment', async () => {
    axios.get.mockResolvedValue(itineraryResponse);
    render(<SharedToursSection scope="city" slug="dubai" title="Dubai" />);
    await flushFetch();

    fireEvent.click(screen.getByRole('button', { name: 'Sort' }));

    const sortMenu = screen.getByRole('button', { name: 'Newest First' }).parentElement;
    expect(sortMenu).toHaveClass('left-0', 'md:left-auto', 'md:right-0');
    expect(sortMenu).not.toHaveClass('right-0');
  });

  it('separates API failures from empty tours and retries the destination tour request', async () => {
    axios.get.mockRejectedValueOnce(new Error('controlled tours failure'));
    render(<SharedToursSection scope="city" slug="dubai" title="Dubai" />);
    await flushFetch();

    expect(screen.getByText('We could not load destination tours.')).toBeInTheDocument();
    expect(screen.queryByText('No itineraries found for the selected tags')).not.toBeInTheDocument();
    expect(screen.getByTestId('destination-tours-error')).toHaveClass('min-h-[220px]');

    axios.get.mockResolvedValueOnce(itineraryResponse);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await flushFetch();

    expect(screen.getByText('Dubai two-day itinerary')).toBeInTheDocument();
  });

  it('keeps the unavailable state for successful empty destination tour responses', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [],
        all_tags: [{ id: 1, name: 'Family', is_featured: true }],
        last_page: 1,
        total: 0,
      },
    });
    render(<SharedToursSection scope="city" slug="dubai" title="Dubai" />);
    await flushFetch();

    expect(screen.getByText('No itineraries found for the selected tags')).toBeInTheDocument();
    expect(screen.queryByText('We could not load destination tours.')).not.toBeInTheDocument();
  });

  it('toggles destination tours between list and map views', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          { id: 1, name: 'Dubai two-day itinerary', slug: 'dubai-two-day-itinerary', city_slug: 'dubai' },
          { id: 2, name: 'Dubai desert plan', slug: 'dubai-desert-plan', city_slug: 'dubai' },
        ],
        all_tags: [],
        last_page: 1,
        total: 2,
      },
    });

    render(<SharedToursSection scope="city" slug="dubai" title="Dubai" cityCoordinates={{ latitude: '25.2048', longitude: '55.2708' }} />);
    await flushFetch();

    expect(screen.getByRole('link', { name: 'Dubai two-day itinerary' })).toBeInTheDocument();
    expect(screen.queryByTestId('tours-map-view')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View on Map' }));

    const mapView = screen.getByTestId('tours-map-view');
    expect(mapView).toHaveAttribute('data-card-count', '2');
    expect(mapView).toHaveAttribute('data-marker-count', '2');
    expect(screen.getByRole('button', { name: 'View as List' })).toBeInTheDocument();
    expect(screen.getByText('Dubai desert plan')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View as List' }));

    expect(screen.queryByTestId('tours-map-view')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dubai desert plan' })).toBeInTheDocument();
  });

  it('does not offer map mode when fetched tours have no usable coordinates', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 3, name: 'Middle East highlights', slug: 'middle-east-highlights', city_slug: 'dubai' }],
        all_tags: [],
        last_page: 1,
        total: 1,
      },
    });

    render(<SharedToursSection scope="region" slug="middle-east" title="Middle East" />);
    await flushFetch();

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('page=1&per_page=8'));
    expect(screen.getByRole('link', { name: 'Middle East highlights' }).parentElement).toHaveClass('xl:grid-cols-4');
    expect(screen.getByRole('link', { name: 'Middle East highlights' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View on Map' })).not.toBeInTheDocument();
  });
});
