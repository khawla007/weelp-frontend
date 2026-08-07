import { fireEvent, render, screen } from '@testing-library/react';

import BookingReviewDialog from '../BookingReviewDialog';

jest.mock('next/dynamic', () => () => {
  const CustomerReviewForm = require('@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm').default;
  return CustomerReviewForm;
});

jest.mock('@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm', () => ({
  __esModule: true,
  default: ({ reviewData, onClose, onSaved }) => (
    <div>
      <span>{reviewData.item.name}</span>
      <button
        type="button"
        onClick={() => {
          onSaved();
          onClose(false);
        }}
      >
        Save review
      </button>
    </div>
  ),
}));

describe('BookingReviewDialog', () => {
  it('passes the complete booking and notifies the caller after a successful save', () => {
    const onSaved = jest.fn();

    render(<BookingReviewDialog booking={{ id: 42, item: { name: 'Forest escape' } }} onSaved={onSaved} />);

    fireEvent.click(screen.getByRole('button', { name: /add review/i }));
    expect(screen.getByText('Forest escape')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /save review/i }));

    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /save review/i })).not.toBeInTheDocument();
  });

  it('uses the edit icon trigger when the booking already has a review', () => {
    render(<BookingReviewDialog booking={{ id: 42, review: { id: 8, rating: 4 }, item: { name: 'Forest escape' } }} />);

    expect(screen.getByRole('button', { name: /edit review/i })).toBeEnabled();
  });

  it('keeps the form scrollable within the mobile viewport', () => {
    render(<BookingReviewDialog booking={{ id: 42, item: { name: 'Forest escape' } }} />);

    fireEvent.click(screen.getByRole('button', { name: /add review/i }));

    expect(screen.getByRole('dialog')).toHaveClass('max-h-[calc(100dvh-2rem)]', 'overflow-y-auto');
  });
});
