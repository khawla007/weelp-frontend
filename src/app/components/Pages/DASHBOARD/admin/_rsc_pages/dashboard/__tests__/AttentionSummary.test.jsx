import React from 'react';
import { render, screen } from '@testing-library/react';

import { AttentionSummary } from '../AttentionSummary';

const mockUseAdminNavigationUnseen = jest.fn();

jest.mock('@/hooks/api/admin/navigationUnseen', () => ({
  useAdminNavigationUnseen: () => mockUseAdminNavigationUnseen(),
}));

describe('AttentionSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('links live unseen counts and cancellation attention to their admin pages', () => {
    mockUseAdminNavigationUnseen.mockReturnValue({
      counts: { orders: 3, reviews: 2 },
      attention: { cancellations: true },
      error: null,
      isLoading: false,
    });

    render(<AttentionSummary />);

    expect(screen.getByRole('region', { name: 'Needs attention' }).firstChild).toHaveClass('rounded-[15px]', 'border', 'border-border', 'bg-card', 'p-[15px]');
    expect(screen.getByText('View all →')).toBeInTheDocument();
    expect(screen.getByTestId('attention-signals')).toHaveClass('flex', 'flex-wrap');
    expect(screen.getByText('3 unseen orders').closest('a')).toHaveAttribute('href', '/dashboard/admin/orders');
    expect(screen.getByText('2 unseen reviews').closest('a')).toHaveAttribute('href', '/dashboard/admin/reviews');
    expect(screen.getByText('Cancellation request needs review').closest('a')).toHaveAttribute('href', '/dashboard/admin/orders');
  });

  it('shows one compact signal skeleton while loading', () => {
    mockUseAdminNavigationUnseen.mockReturnValue({ counts: { orders: 0, reviews: 0 }, attention: { cancellations: false }, error: null, isLoading: true });

    render(<AttentionSummary />);

    expect(screen.getByLabelText('Loading attention summary').children).toHaveLength(1);
    expect(screen.queryByText('0 unseen orders')).not.toBeInTheDocument();
    expect(screen.queryByText('0 unseen reviews')).not.toBeInTheDocument();
  });

  it('shows a stable error message instead of stale status', () => {
    mockUseAdminNavigationUnseen.mockReturnValue({ counts: { orders: 0, reviews: 0 }, attention: { cancellations: false }, error: new Error('offline'), isLoading: false });

    render(<AttentionSummary />);

    expect(screen.getByRole('alert')).toHaveTextContent('Attention status is temporarily unavailable.');
  });

  it('states when no cancellation requests need attention', () => {
    mockUseAdminNavigationUnseen.mockReturnValue({ counts: { orders: 0, reviews: 0 }, attention: { cancellations: false }, error: null, isLoading: false });

    render(<AttentionSummary />);

    expect(screen.getByText('No cancellation requests need attention')).toBeInTheDocument();
  });
});
