import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import path from 'path';

const pushMock = jest.fn();
const srcPath = (...segments) => path.join(process.cwd(), 'src', ...segments);

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.doMock(srcPath('lib/services/global.js'), () => ({
  __esModule: true,
  getCitiesRegions: jest.fn(() => Promise.resolve({ data: [{ name: 'Dubai' }] })),
}));

jest.doMock(srcPath('lib/utils.js'), () => ({
  __esModule: true,
  log: jest.fn(),
}));

const BookingForm = require('../Form').default;

const renderWithSWR = (ui) => render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{ui}</SWRConfig>);

describe('BookingForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('places the search page submit button next to the filter bar and removes the guest dropdown submit', async () => {
    renderWithSWR(<BookingForm variant="searchPage" />);

    const searchButton = await screen.findByRole('button', { name: /search trips/i });
    expect(searchButton).toHaveTextContent('Search');
    expect(searchButton.closest('[data-testid="booking-filter-bar"]')).toBeInTheDocument();
    expect(searchButton).toHaveClass('bg-white', 'text-Bluewhale');
    expect(searchButton).not.toHaveClass('bg-[#18181b]');

    fireEvent.click(screen.getByText('1'));

    await waitFor(() => {
      expect(screen.getByText(/adults/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /^submit$/i })).not.toBeInTheDocument();
  });
});
