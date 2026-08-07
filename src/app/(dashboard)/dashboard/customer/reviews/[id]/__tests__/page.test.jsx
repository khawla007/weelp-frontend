import { render, screen } from '@testing-library/react';

import ReviewPage from '../page';
import { getSingleReviewByCustomer } from '@/lib/services/customer/reviews';
import { notFound } from 'next/navigation';

jest.mock('@/lib/services/customer/reviews', () => ({
  getSingleReviewByCustomer: jest.fn(),
}));

jest.mock('@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm', () => ({
  CustomerEditReviewForm: ({ reviewData }) => <div data-testid="customer-edit-review-form">{reviewData.review_text}</div>,
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

describe('customer review edit page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('awaits the dynamic route ID before loading the review', async () => {
    getSingleReviewByCustomer.mockResolvedValue({
      success: true,
      status: 200,
      data: { review: { id: 27, rating: 5, review_text: 'Excellent trip' } },
    });

    const ui = await ReviewPage({ params: Promise.resolve({ id: '27' }) });
    render(ui);

    expect(getSingleReviewByCustomer).toHaveBeenCalledWith('27');
    expect(screen.getByTestId('customer-edit-review-form')).toHaveTextContent('Excellent trip');
  });

  it('uses the existing not-found path when the review does not exist', async () => {
    getSingleReviewByCustomer.mockResolvedValue({ success: false, status: 404 });

    await ReviewPage({ params: Promise.resolve({ id: '404' }) });

    expect(getSingleReviewByCustomer).toHaveBeenCalledWith('404');
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
