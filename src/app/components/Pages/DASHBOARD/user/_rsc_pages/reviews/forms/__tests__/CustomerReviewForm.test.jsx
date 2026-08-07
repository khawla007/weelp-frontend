import { readFileSync } from 'node:fs';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CustomerReviewForm from '../CustomerReviewForm';
import { createReviewByCustomer } from '@/lib/actions/customer/reviews';

const toast = jest.fn();

jest.mock('@/lib/actions/customer/reviews', () => ({
  createReviewByCustomer: jest.fn(),
  editReviewByCustomer: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

jest.mock('../../../../../admin/_rsc_pages/media/SmartDropZone', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../../../admin/_rsc_pages/media/SmartGallery', () => ({
  __esModule: true,
  default: () => null,
}));

const booking = {
  id: 42,
  item_id: 7,
  item: { item_type: 'activity', name: 'Desert Safari' },
  review: null,
};

describe('CustomerReviewForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits the booking identity and notifies callers after a successful create', async () => {
    const onClose = jest.fn();
    const onSaved = jest.fn();
    createReviewByCustomer.mockResolvedValue({ success: true, message: 'Review created' });

    render(<CustomerReviewForm reviewData={booking} onClose={onClose} onSaved={onSaved} />);

    expect(screen.getByRole('radiogroup', { name: /select rating/i })).toHaveAttribute('aria-describedby');
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    const fourStarRating = screen.getByRole('radio', { name: '4 stars' });
    expect(fourStarRating).toHaveAttribute('type', 'radio');
    fourStarRating.focus();
    expect(fourStarRating).toHaveFocus();
    fireEvent.click(fourStarRating);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Great trip' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(createReviewByCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 42,
          item_id: 7,
          item_type: 'activity',
          rating: 4,
          review_text: 'Great trip',
        }),
      ),
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it('does not notify callers when review creation fails', async () => {
    const onClose = jest.fn();
    const onSaved = jest.fn();
    createReviewByCustomer.mockResolvedValue({
      success: false,
      message: 'Cannot create review',
      errors: { review_text: ['Review text is too short'] },
    });

    render(<CustomerReviewForm reviewData={booking} onClose={onClose} onSaved={onSaved} />);

    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Great trip' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(createReviewByCustomer).toHaveBeenCalledTimes(1));
    expect(toast).toHaveBeenCalledWith({ title: 'Cannot create review', variant: 'destructive' });
    expect(screen.getByText('Review text is too short')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps a successful save successful when cache refresh fails', async () => {
    const onClose = jest.fn();
    const onSaved = jest.fn().mockRejectedValue(new Error('Refresh failed'));
    createReviewByCustomer.mockResolvedValue({ success: true, message: 'Review created' });

    render(<CustomerReviewForm reviewData={booking} onClose={onClose} onSaved={onSaved} />);

    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Great trip' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledWith(false));
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith({ title: 'Review created', variant: 'default' });
    expect(toast).not.toHaveBeenCalledWith({ title: 'Something went wrong', variant: 'destructive' });
  });

  it('does not use the retired list mutation path', () => {
    const source = readFileSync('src/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm.jsx', 'utf8');

    expect(source).not.toContain('useSWRConfig');
    expect(source).not.toContain("mutate('/api/customer/orders')");
  });
});
