import { render, screen, within } from '@testing-library/react';

import BookingCardSkeleton from '../BookingCardSkeleton';

describe('BookingCardSkeleton', () => {
  it('mirrors the booking card regions without adding a grid wrapper', () => {
    render(<BookingCardSkeleton />);

    const skeleton = screen.getByTestId('booking-card-skeleton');

    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveClass('w-full', 'min-w-0', 'gap-3', 'p-3', 'sm:p-4');
    const header = within(skeleton).getByTestId('booking-card-skeleton-header');
    const review = within(skeleton).getByTestId('booking-card-skeleton-review');
    const [title, date, city, bookingId] = header.children;
    const reviewLines = review.firstElementChild.firstElementChild;
    const [reviewTitle, reviewText] = reviewLines.children;

    expect(header).toHaveClass('flex', 'flex-col', 'sm:grid', 'sm:grid-cols-[minmax(0,1fr)_auto]');
    expect(title).toHaveClass('h-6', 'sm:h-7');
    [date, city, bookingId].forEach((line) => expect(line).toHaveClass('h-5', 'sm:h-6'));
    expect(reviewLines).toHaveClass('space-y-1');
    expect(reviewTitle).toHaveClass('h-5', 'sm:h-6');
    expect(reviewText).toHaveClass('h-4', 'sm:h-5');
    expect(within(skeleton).getByTestId('booking-card-skeleton-footer')).toHaveClass('h-10', 'sm:h-12');
  });
});
