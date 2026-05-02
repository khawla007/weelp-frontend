import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockGetEarnings = jest.fn();
jest.mock('../../../../../../lib/actions/creatorItineraries', () => ({
  getCreatorEarnings: (...args) => mockGetEarnings(...args),
}));

jest.mock('../../../../../components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

import EarningsClient from '../EarningsClient';

const initial = {
  summary: { lifetime: 1000, current_period: 200, pending: 50 },
  rows: [],
  pagination: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
};

describe('EarningsClient', () => {
  beforeEach(() => {
    mockGetEarnings.mockReset();
    mockGetEarnings.mockResolvedValue({ success: true, data: initial });
  });

  it('renders summary cards from initial data', () => {
    render(<EarningsClient initial={initial} />);
    expect(screen.getByText('Lifetime')).toBeInTheDocument();
    expect(screen.getByText('1,000.00')).toBeInTheDocument();
    // 'Pending' appears as both summary label and status filter — assert at least one
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getByText('50.00')).toBeInTheDocument();
  });

  it('refetches on status filter change', async () => {
    render(<EarningsClient initial={initial} />);
    fireEvent.click(screen.getByRole('button', { name: /^paid$/i }));
    await waitFor(() => {
      expect(mockGetEarnings).toHaveBeenCalledWith(expect.objectContaining({ status: 'paid' }));
    });
  });

  it('shows empty-state copy when rows are empty', () => {
    render(<EarningsClient initial={initial} />);
    expect(screen.getByText(/No earnings/i)).toBeInTheDocument();
  });
});
