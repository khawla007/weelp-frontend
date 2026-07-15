import { act, fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';

import SharedToursSection from '../SharedToursSection';

jest.mock('axios');

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className, as: Component = 'div' }) => <Component className={className}>{children}</Component>,
}));

jest.mock('@/app/components/Animation/Cards', () => ({
  ProductCardSkelton: ({ className = '' }) => <div data-testid="tour-skeleton" className={className} />,
}));

jest.mock('@/app/components/ui/item-card', () => ({
  __esModule: true,
  default: ({ title, href }) => <a href={href}>{title}</a>,
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

jest.mock('@/lib/mapProductToItemCard', () => ({
  mapProductToItemCard: (item, citySlug) => ({
    id: item.id,
    href: `/cities/${citySlug}/itineraries/${item.slug}`,
    title: item.name,
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

describe('SharedToursSection destination states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
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
});
