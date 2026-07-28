import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { SWRConfig } from 'swr';

import { CompactActivityItinerarySearch, HomeActivityItinerarySearch, ModalActivityItinerarySearch, ResultsActivityItinerarySearch } from '../ActivityItinerarySearch';
import { useCitiesRegions } from '@/hooks/useCitiesRegions';
import { homeSearch } from '@/lib/services/global';

const pushMock = jest.fn();
const setNavigatingMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('@/hooks/useCitiesRegions', () => ({
  useCitiesRegions: jest.fn(),
}));

jest.mock('@/lib/services/global', () => ({
  homeSearch: jest.fn(),
}));

jest.mock('@/lib/store/useNavigationStore', () => ({
  useNavigationStore: () => ({ setNavigating: setNavigatingMock }),
}));

const locations = [
  { id: 1, name: 'Dubai', slug: 'dubai', type: 'city' },
  { id: 2, name: 'Paris', slug: 'paris', type: 'city' },
];

const TestWrapper = ({ children }) => <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>;
const renderSearch = (ui) => render(ui, { wrapper: TestWrapper });

async function chooseLocation(namePattern = /Dubai city/i) {
  fireEvent.click(screen.getByRole('combobox', { name: /where to/i }));
  const option = await screen.findByRole('option', { name: namePattern });
  fireEvent.click(option);
}

describe('ActivityItinerarySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCitiesRegions.mockReturnValue({ data: locations, loading: false });
    homeSearch.mockResolvedValue({ data: [] });
  });

  it.each([
    ['home', <HomeActivityItinerarySearch key="home" />],
    ['compact', <CompactActivityItinerarySearch key="compact" />],
    ['results', <ResultsActivityItinerarySearch key="results" />],
    ['modal', <ModalActivityItinerarySearch key="modal" />],
  ])('%s exposes only Where, When, Guests, and a search action', async (_name, panel) => {
    renderSearch(panel);

    expect(await screen.findByRole('combobox', { name: /where to/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /choose dates/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /choose guests/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search trips/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/from/i)).not.toBeInTheDocument();
  });

  it.each([
    ['compact', <CompactActivityItinerarySearch key="compact-spacing" />],
    ['results', <ResultsActivityItinerarySearch key="results-spacing" />],
  ])('%s separates the desktop Search action from the Guests field', (_name, panel) => {
    renderSearch(panel);

    expect(screen.getByRole('button', { name: /search trips/i }).parentElement).toHaveClass('sm:pl-2');
  });

  it.each([
    ['home', <HomeActivityItinerarySearch key="home-focus" />],
    ['compact', <CompactActivityItinerarySearch key="compact-focus" />],
    ['results', <ResultsActivityItinerarySearch key="results-focus" />],
  ])('%s focuses the location input when the field padding is clicked', (_name, panel) => {
    renderSearch(panel);

    const whereInput = screen.getByRole('combobox', { name: /where to/i });
    fireEvent.click(whereInput.closest('.cursor-pointer'));

    expect(whereInput).toHaveFocus();
  });

  it.each([
    ['compact', <CompactActivityItinerarySearch key="compact-radius" />],
    ['results', <ResultsActivityItinerarySearch key="results-radius" />],
  ])('%s keeps all four Search button corners rounded on desktop', (_name, panel) => {
    renderSearch(panel);

    const whereInput = screen.getByRole('combobox', { name: /where to/i });
    const searchButton = screen.getByRole('button', { name: /search trips/i });
    expect(whereInput.closest('.cursor-pointer')).toHaveClass('bg-card', 'dark:bg-[var(--weelp-home-surface)]');
    expect(searchButton).toHaveClass('rounded-xl');
    expect(searchButton).toHaveClass('border-weelp-sage-deep', 'bg-weelp-sage-deep', 'text-white', 'hover:bg-weelp-sage-deep/85');
    expect(searchButton).toHaveClass('dark:border-border', 'dark:bg-[var(--weelp-home-page)]', 'dark:hover:bg-[var(--weelp-home-page)]', 'dark:hover:opacity-90');
    expect(searchButton).not.toHaveClass('sm:rounded-l-none');
  });

  it('preserves the Home Search action spacing and radius', () => {
    renderSearch(<HomeActivityItinerarySearch />);

    const whereInput = screen.getByRole('combobox', { name: /where to/i });
    const searchButton = screen.getByRole('button', { name: /search trips/i });
    expect(whereInput.closest('.cursor-pointer')).toHaveClass('sm:rounded-l-[28px]', 'sm:rounded-r-none');
    expect(whereInput.closest('.cursor-pointer')).toHaveClass('bg-card', 'dark:bg-[var(--weelp-home-surface)]');
    expect(searchButton.parentElement).toHaveClass('sm:pr-5');
    expect(searchButton.parentElement).toHaveClass('bg-card', 'dark:bg-[var(--weelp-home-surface)]', 'sm:pl-2');
    expect(searchButton).toHaveClass('rounded-2xl');
    expect(searchButton).toHaveClass('border-weelp-sage-deep', 'bg-weelp-sage-deep', 'text-white', 'hover:bg-weelp-sage-deep/85');
    expect(searchButton).toHaveClass('dark:border-border', 'dark:bg-[var(--weelp-home-page)]', 'dark:hover:bg-[var(--weelp-home-page)]', 'dark:hover:opacity-90');
  });

  it('preserves the Modal Search action spacing and radius', () => {
    renderSearch(<ModalActivityItinerarySearch />);

    const searchButton = screen.getByRole('button', { name: /search trips/i });
    expect(searchButton.parentElement).not.toHaveClass('sm:pl-2');
    expect(searchButton).toHaveClass('mx-auto', 'mt-4', 'rounded-full');
    expect(searchButton).toHaveClass('border', 'border-weelp-sage-deep', 'bg-weelp-sage-deep', 'dark:border-border', 'dark:bg-[var(--weelp-home-page)]');
    expect(searchButton).not.toHaveClass('rounded-xl');
  });

  it('hydrates location, dates, and guest quantity from the results query', async () => {
    renderSearch(<ResultsActivityItinerarySearch initialQuery="location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3" />);

    expect(await screen.findByRole('combobox', { name: /where to/i })).toHaveValue('Dubai');
    expect(screen.getByRole('button', { name: /choose dates/i })).toHaveTextContent(/10 Aug.*14 Aug 2026/);
    expect(screen.getByTestId('discovery-guest-total')).toHaveTextContent('3 Guests');
  });

  it('clears an unknown URL location instead of submitting a hidden slug', async () => {
    renderSearch(<ResultsActivityItinerarySearch initialQuery="location=unknown-place&quantity=2" />);

    await waitFor(() => expect(useCitiesRegions).toHaveBeenCalled());
    expect(screen.getByRole('combobox', { name: /where to/i })).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: /search trips/i }));

    expect(setNavigatingMock).toHaveBeenCalledWith(true);
    expect(pushMock).toHaveBeenCalledWith('/search?quantity=2');
  });

  it('synchronizes when the mounted results query changes', async () => {
    const { rerender } = renderSearch(<ResultsActivityItinerarySearch initialQuery="location=dubai&quantity=2" />);
    expect(await screen.findByRole('combobox', { name: /where to/i })).toHaveValue('Dubai');

    rerender(<ResultsActivityItinerarySearch initialQuery="location=paris&quantity=4" />);

    expect(await screen.findByRole('combobox', { name: /where to/i })).toHaveValue('Paris');
    expect(screen.getByTestId('discovery-guest-total')).toHaveTextContent('4 Guests');
  });

  it('does not let late location hydration overwrite a user edit', () => {
    useCitiesRegions.mockReturnValue({ data: [], loading: true });
    const { rerender } = renderSearch(<ResultsActivityItinerarySearch initialQuery="location=dubai&quantity=1" />);

    fireEvent.change(screen.getByRole('combobox', { name: /where to/i }), {
      target: { value: 'Par' },
    });
    useCitiesRegions.mockReturnValue({ data: locations, loading: false });
    rerender(<ResultsActivityItinerarySearch initialQuery="location=dubai&quantity=1" />);

    expect(screen.getByRole('combobox', { name: /where to/i })).toHaveValue('Par');
  });

  it('submits the exact canonical values currently shown in the panel and starts the navigation loader first', async () => {
    renderSearch(<ResultsActivityItinerarySearch initialQuery="location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=2" />);

    expect(await screen.findByRole('combobox', { name: /where to/i })).toHaveValue('Dubai');
    fireEvent.click(screen.getByRole('button', { name: /search trips/i }));

    expect(setNavigatingMock).toHaveBeenCalledWith(true);
    expect(pushMock).toHaveBeenCalledWith('/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=2');
    expect(setNavigatingMock.mock.invocationCallOrder[0]).toBeLessThan(pushMock.mock.invocationCallOrder[0]);
  });

  it('opens accessible calendar and guest popovers with 44px guest controls', async () => {
    renderSearch(<CompactActivityItinerarySearch />);

    fireEvent.click(screen.getByRole('button', { name: /choose dates/i }));
    expect(await screen.findByRole('dialog', { name: /date selector/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /choose guests/i }));
    const guestPanel = await screen.findByRole('dialog', { name: /guest selector/i });
    expect(screen.getByRole('button', { name: /increase children/i })).toHaveClass('size-11');

    fireEvent.keyDown(guestPanel, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /guest selector/i })).not.toBeInTheDocument());
  });

  it('filters locations and requests activity and itinerary previews by slug', async () => {
    renderSearch(<CompactActivityItinerarySearch />);

    const input = screen.getByRole('combobox', { name: /where to/i });
    fireEvent.change(input, { target: { value: 'Du' } });
    expect(await screen.findByRole('option', { name: /Dubai city/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Paris city/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: /Dubai city/i }));

    await waitFor(() => expect(homeSearch).toHaveBeenCalledWith({ location: 'dubai', quantity: 1 }));
  });

  it('serializes preview dates as local calendar dates', async () => {
    renderSearch(<ResultsActivityItinerarySearch initialQuery="location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=1" />);
    expect(await screen.findByRole('combobox', { name: /where to/i })).toHaveValue('Dubai');

    fireEvent.click(screen.getByRole('button', { name: /choose guests/i }));
    fireEvent.click(screen.getByRole('button', { name: /increase children/i }));

    await waitFor(() =>
      expect(homeSearch).toHaveBeenCalledWith({
        location: 'dubai',
        start_date: '2026-08-10',
        end_date: '2026-08-14',
        quantity: 2,
      }),
    );
  });

  it('supports keyboard selection in the location combobox', async () => {
    renderSearch(<CompactActivityItinerarySearch />);
    const input = screen.getByRole('combobox', { name: /where to/i });

    fireEvent.change(input, { target: { value: 'Pa' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toHaveValue('Paris');
    await waitFor(() => expect(homeSearch).toHaveBeenCalledWith({ location: 'paris', quantity: 1 }));
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('gives each mounted location combobox an instance-scoped controls id', () => {
    renderSearch(
      <>
        <CompactActivityItinerarySearch />
        <ModalActivityItinerarySearch />
      </>,
    );

    const controlsIds = screen.getAllByRole('combobox', { name: /where to/i }).map((input) => input.getAttribute('aria-controls'));
    expect(new Set(controlsIds).size).toBe(2);
  });

  it('shows a loading skeleton, caps previews at five, and uses canonical detail links', async () => {
    let resolveSearch;
    homeSearch.mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );
    renderSearch(<CompactActivityItinerarySearch />);

    await chooseLocation();
    expect(screen.getByRole('status', { name: /loading preview results/i })).toBeInTheDocument();

    await act(async () => {
      resolveSearch({
        data: Array.from({ length: 6 }, (_, index) => ({
          id: index + 1,
          name: `Dubai Result ${index + 1}`,
          slug: `dubai-result-${index + 1}`,
          item_type: 'activity',
          city_slug: 'dubai',
        })),
      });
    });

    expect(await screen.findByText('Dubai Result 1')).toBeInTheDocument();
    expect(screen.getByText('Dubai Result 5')).toBeInTheDocument();
    expect(screen.queryByText('Dubai Result 6')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dubai Result 1/i })).toHaveAttribute('href', '/cities/dubai/activities/dubai-result-1');
  });

  it('keeps the newest preview response when requests resolve out of order', async () => {
    const searches = [];
    homeSearch.mockImplementation(
      () =>
        new Promise((resolve) => {
          searches.push(resolve);
        }),
    );
    renderSearch(<CompactActivityItinerarySearch />);

    await chooseLocation(/Dubai city/i);
    await chooseLocation(/Paris city/i);

    await act(async () => {
      searches[1]({
        data: [{ id: 2, name: 'Paris Walk', slug: 'paris-walk', item_type: 'activity', city_slug: 'paris' }],
      });
    });
    expect(await screen.findByText('Paris Walk')).toBeInTheDocument();

    await act(async () => {
      searches[0]({
        data: [{ id: 1, name: 'Old Dubai Result', slug: 'old-dubai', item_type: 'activity', city_slug: 'dubai' }],
      });
    });
    expect(screen.queryByText('Old Dubai Result')).not.toBeInTheDocument();
  });

  it('discards an in-flight preview after the destination is edited', async () => {
    let resolveSearch;
    homeSearch.mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );
    renderSearch(<CompactActivityItinerarySearch />);

    await chooseLocation();
    fireEvent.change(screen.getByRole('combobox', { name: /where to/i }), { target: { value: 'Pa' } });

    await act(async () => {
      resolveSearch({
        data: [{ id: 1, name: 'Stale Dubai Result', slug: 'stale-dubai', item_type: 'activity', city_slug: 'dubai' }],
      });
    });

    expect(screen.queryByText('Stale Dubai Result')).not.toBeInTheDocument();
  });

  it('keeps selected values when a preview request fails', async () => {
    let rejectSearch;
    homeSearch.mockReturnValue(
      new Promise((_, reject) => {
        rejectSearch = reject;
      }),
    );
    renderSearch(<CompactActivityItinerarySearch />);

    await chooseLocation();

    await act(async () => {
      rejectSearch(new Error('offline'));
    });
    expect(screen.getByRole('combobox', { name: /where to/i })).toHaveValue('Dubai');
    expect(await screen.findByText(/nothing matches/i)).toBeInTheDocument();
  });

  it('updates guest totals with reduced-motion animation classes', async () => {
    renderSearch(<CompactActivityItinerarySearch />);

    fireEvent.click(screen.getByRole('button', { name: /choose guests/i }));
    fireEvent.click(screen.getByRole('button', { name: /increase children/i }));

    const total = screen.getByTestId('discovery-guest-total');
    expect(total).toHaveTextContent('2 Guests');
    expect(total).toHaveClass('transition-[opacity,transform]', 'motion-reduce:transition-none');
    expect(within(total).getByText('2')).toHaveClass('animate-in');
  });
});
