import { fireEvent, render, screen } from '@testing-library/react';

import BookingCard from '../BookingCard';

jest.mock('../BookingReviewDialog', () => ({
  __esModule: true,
  default: ({ onSaved }) => (
    <button type="button" onClick={onSaved}>
      Add Review
    </button>
  ),
}));

describe('BookingCard theme surface', () => {
  it('uses the semantic card surface in both themes', () => {
    const { container } = render(
      <BookingCard
        bookingItem={{
          id: 42,
          travel_date: '2026-07-24',
          item: { name: 'Forest escape', city: 'Dubai' },
        }}
      />,
    );

    expect(container.firstElementChild).toHaveClass('bg-card', 'text-card-foreground');
    expect(container.firstElementChild).not.toHaveClass('dark:bg-foreground');
    expect(container.querySelector('img[src*="Review.png"]')).toHaveAttribute('alt', '');
  });

  it('selects the booking when View Booking is pressed', () => {
    const onViewBooking = jest.fn();

    render(<BookingCard bookingItem={{ id: 42, item: { name: 'Forest escape' } }} onViewBooking={onViewBooking} />);

    const viewButton = screen.getByRole('button', { name: /view booking/i });
    expect(viewButton).toBeEnabled();
    expect(screen.queryByRole('link', { name: /view booking/i })).not.toBeInTheDocument();

    fireEvent.click(viewButton);

    expect(onViewBooking).toHaveBeenCalledWith(42);
  });

  it('disables View Booking when the callback or booking ID is missing', () => {
    const { rerender } = render(<BookingCard bookingItem={{ id: 42, item: { name: 'Forest escape' } }} />);

    expect(screen.getByRole('button', { name: /view booking/i })).toBeDisabled();

    rerender(<BookingCard bookingItem={{ item: { name: 'Forest escape' } }} onViewBooking={jest.fn()} />);

    expect(screen.getByRole('button', { name: /view booking/i })).toBeDisabled();
  });

  it('forwards review saves to the list refresh callback', () => {
    const onReviewSaved = jest.fn();

    render(<BookingCard bookingItem={{ id: 42, item: { name: 'Forest escape' } }} onReviewSaved={onReviewSaved} />);

    fireEvent.click(screen.getByRole('button', { name: /add review/i }));

    expect(onReviewSaved).toHaveBeenCalledTimes(1);
  });
});
