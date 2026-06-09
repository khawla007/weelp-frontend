import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { SWRConfig } from 'swr';

import FilterBar from '../FilterBar';
import { getCitiesRegions, homeSearch } from '../../../../../../lib/services/global';

jest.mock('../../../../../../lib/services/global', () => ({
  getCitiesRegions: jest.fn().mockResolvedValue([]),
  homeSearch: jest.fn().mockResolvedValue({ data: [] }),
}));

const renderWithSWR = (ui) => render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{ui}</SWRConfig>);

describe('FilterBar', () => {
  const locations = [
    { id: 1, name: 'Dubai', slug: 'dubai', type: 'city' },
    { id: 2, name: 'Paris', slug: 'paris', type: 'city' },
  ];

  const chooseLocation = async (namePattern) => {
    const input = screen.getByLabelText('Where to?');

    await waitFor(() => {
      fireEvent.click(input);
      expect(screen.getByRole('option', { name: namePattern })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('option', { name: namePattern }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getCitiesRegions.mockResolvedValue(locations);
    homeSearch.mockResolvedValue({ data: [] });
  });

  it('renders the old design filter fields (Where to, When, How Many)', async () => {
    renderWithSWR(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    expect(screen.getByPlaceholderText('Where to?')).toBeInTheDocument();
    expect(screen.getByText('When?')).toBeInTheDocument();
    expect(screen.getByText(/Guest/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^search$/i })).not.toBeInTheDocument();
  });

  it('keeps the filter fields stable across small and desktop layouts', async () => {
    const { container } = renderWithSWR(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    const fieldGroup = container.querySelector('form > div');
    expect(fieldGroup).toHaveClass('grid');
    expect(fieldGroup).toHaveClass('grid-cols-1');
    expect(fieldGroup.className).toContain('sm:grid-cols-[minmax(0,1fr)_minmax(210px,1fr)_minmax(0,1fr)]');
  });

  it('animates the location suggestions panel and staggers accessible result rows', async () => {
    renderWithSWR(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    fireEvent.click(screen.getByPlaceholderText('Where to?'));

    const panel = screen.getByTestId('filter-location-panel');
    expect(panel).toHaveAttribute('data-state', 'open');
    expect(within(panel).queryByText('Popular this week')).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: 'Dubai' })).not.toBeInTheDocument();
    expect(panel).toHaveClass('animate-in');
    expect(panel).toHaveClass('transition-[opacity,transform]');
    expect(panel).toHaveClass('motion-reduce:transition-none');

    const rows = within(panel).getAllByRole('option', { name: /city/i });
    expect(rows[0]).toHaveClass('animate-in');
    expect(rows[0]).toHaveClass('transition-[opacity,transform]');
    expect(rows[0]).toHaveClass('motion-reduce:transition-none');
    expect(rows[0]).toHaveStyle({ transitionDelay: '0ms' });
    expect(rows[1]).toHaveStyle({ transitionDelay: '35ms' });

    fireEvent.mouseDown(document.body);
    expect(screen.getByTestId('filter-location-panel')).toHaveAttribute('data-state', 'closed');
  });

  it('uses keyboard-accessible matching transform/opacity panel animation for calendar and guest selectors', async () => {
    renderWithSWR(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    const dateTrigger = screen.getByRole('button', { name: /choose dates/i });
    expect(dateTrigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(dateTrigger, { key: 'Enter' });
    const calendarPanel = screen.getByTestId('filter-calendar-panel');
    expect(dateTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(calendarPanel).toHaveAttribute('data-state', 'open');
    expect(calendarPanel).toHaveClass('transition-[opacity,transform]');
    expect(calendarPanel).toHaveClass('motion-reduce:transition-none');

    const guestTrigger = screen.getByRole('button', { name: /choose guests/i });
    expect(guestTrigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(guestTrigger, { key: 'Enter' });
    const guestsPanel = screen.getByTestId('filter-guests-panel');
    expect(guestTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(guestsPanel).toHaveAttribute('data-state', 'open');
    expect(guestsPanel).toHaveClass('transition-[opacity,transform]');
    expect(guestsPanel).toHaveClass('motion-reduce:transition-none');
  });

  it('shows a nonblank preview skeleton while loading and crossfades resolved preview rows', async () => {
    let resolveSearch;
    homeSearch.mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );

    renderWithSWR(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    fireEvent.click(screen.getByPlaceholderText('Where to?'));
    fireEvent.click(screen.getByRole('option', { name: /Dubai city/i }));

    expect(screen.getByRole('status', { name: /loading preview results/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('filter-preview-skeleton-row')).toHaveLength(3);

    await act(async () => {
      resolveSearch({
        data: [
          {
            id: 7,
            name: 'Desert Safari',
            slug: 'desert-safari',
            item_type: 'activity',
            city_slug: 'dubai',
            pricing: { regular_price: 120, currency: 'USD' },
          },
        ],
      });
    });

    expect(await screen.findByText('Desert Safari')).toBeInTheDocument();
    const results = screen.getByTestId('filter-preview-results');
    expect(results).toHaveAttribute('data-state', 'open');
    expect(results).toHaveClass('animate-in');
    expect(results).toHaveClass('transition-[opacity,transform]');
    expect(results).toHaveClass('motion-reduce:transition-none');
  });

  it('caps preview result rows at five', async () => {
    homeSearch.mockResolvedValue({
      data: Array.from({ length: 6 }, (_, index) => ({
        id: index + 1,
        name: `Dubai Result ${index + 1}`,
        slug: `dubai-result-${index + 1}`,
        item_type: 'activity',
        city_slug: 'dubai',
      })),
    });

    renderWithSWR(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    fireEvent.click(screen.getByPlaceholderText('Where to?'));
    fireEvent.click(screen.getByRole('option', { name: /Dubai city/i }));

    expect(await screen.findByText('Dubai Result 1')).toBeInTheDocument();
    expect(screen.getByText('Dubai Result 5')).toBeInTheDocument();
    expect(screen.queryByText('Dubai Result 6')).not.toBeInTheDocument();
  });

  it('keeps the newest preview response when searches resolve out of order', async () => {
    const searches = [];
    homeSearch.mockImplementation(
      () =>
        new Promise((resolve) => {
          searches.push(resolve);
        }),
    );

    renderWithSWR(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    await chooseLocation(/Dubai city/i);
    await chooseLocation(/Paris city/i);

    await act(async () => {
      searches[1]({
        data: [
          {
            id: 8,
            name: 'Paris Museum Walk',
            slug: 'paris-museum-walk',
            item_type: 'activity',
            city_slug: 'paris',
          },
        ],
      });
    });

    expect(await screen.findByText('Paris Museum Walk')).toBeInTheDocument();

    await act(async () => {
      searches[0]({
        data: [
          {
            id: 7,
            name: 'Old Dubai Safari',
            slug: 'old-dubai-safari',
            item_type: 'activity',
            city_slug: 'dubai',
          },
        ],
      });
    });

    expect(screen.getByText('Paris Museum Walk')).toBeInTheDocument();
    expect(screen.queryByText('Old Dubai Safari')).not.toBeInTheDocument();
  });

  it('transitions guest count changes immediately with reduced-motion fallback', async () => {
    renderWithSWR(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /choose guests/i }));
    fireEvent.click(screen.getByRole('button', { name: /increase children/i }));

    const guestTotal = screen.getByTestId('filter-guest-total');
    expect(guestTotal).toHaveTextContent('2 Guests');
    expect(within(guestTotal).getByText('2')).toHaveClass('animate-in');
    expect(guestTotal).toHaveClass('transition-[opacity,transform]');
    expect(guestTotal).toHaveClass('motion-reduce:transition-none');
  });

  it('refreshes preview results from filter changes without a search submit button', async () => {
    renderWithSWR(<FilterBar />);
    await waitFor(() => expect(getCitiesRegions).toHaveBeenCalled());

    fireEvent.click(screen.getByPlaceholderText('Where to?'));
    fireEvent.click(screen.getByRole('option', { name: /Dubai city/i }));

    await waitFor(() => expect(homeSearch).toHaveBeenLastCalledWith({ location: 'dubai', quantity: 1 }));

    fireEvent.click(screen.getByRole('button', { name: /choose dates/i }));
    const calendarPanel = screen.getByTestId('filter-calendar-panel');
    const availableDayButtons = Array.from(calendarPanel.querySelectorAll('button:not([disabled])')).filter((button) => /^\d+$/.test(button.textContent.trim()));
    expect(availableDayButtons.length).toBeGreaterThan(1);
    fireEvent.click(availableDayButtons[0]);
    fireEvent.click(availableDayButtons[1]);

    await waitFor(() =>
      expect(homeSearch).toHaveBeenLastCalledWith(
        expect.objectContaining({
          location: 'dubai',
          quantity: 1,
          start_date: expect.any(String),
          end_date: expect.any(String),
        }),
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: /choose guests/i }));
    fireEvent.click(screen.getByRole('button', { name: /increase children/i }));

    await waitFor(() => expect(homeSearch).toHaveBeenLastCalledWith(expect.objectContaining({ location: 'dubai', quantity: 2 })));
    expect(screen.queryByRole('button', { name: /^search$/i })).not.toBeInTheDocument();
  });
});
