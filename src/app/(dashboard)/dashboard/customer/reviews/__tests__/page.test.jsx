import { render, screen } from '@testing-library/react';

import ReviewsPage from '../page';
import useAllReviewsCustomer from '@/hooks/api/customer/reviews';

jest.mock('@/hooks/api/customer/reviews', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/CustomerReviewList', () => ({
  CustomerReviewList: () => <div data-testid="customer-review-list" />,
}));

describe('ReviewsPage', () => {
  it('renders one review-card skeleton per review slot while loading', () => {
    useAllReviewsCustomer.mockReturnValue({
      data: { reviews: [], pagination: { total: 0, per_page: 6, current_page: 1, last_page: 1 } },
      isLoading: true,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<ReviewsPage />);

    expect(screen.getAllByTestId('review-card-skeleton')).toHaveLength(6);
    expect(screen.queryByTestId('customer-review-list')).not.toBeInTheDocument();
  });
});
