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

  it.each([
    ['pending', 'Pending', ['border-warning/40', 'bg-warning/15', 'text-foreground']],
    ['processing', 'Processing', ['border-info/40', 'bg-info/15', 'text-foreground']],
    ['completed', 'Completed', ['border-success/40', 'bg-success/15', 'text-foreground']],
    ['cancelled', 'Cancelled', ['border-destructive/40', 'bg-destructive/10', 'text-foreground']],
    ['refunded', 'Refunded', ['border-violet-300', 'bg-violet-100', 'text-foreground', 'dark:border-violet-700', 'dark:bg-violet-950/50']],
  ])('shows the %s order status as a readable badge', (status, label, expectedClasses) => {
    render(<BookingCard bookingItem={{ id: 42, status, item: { name: 'Forest escape' } }} />);

    const badge = screen.getByText(label);
    expect(badge).toHaveClass(...expectedClasses);
  });

  it.each([
    ['awaiting_supplier', 'Awaiting Supplier'],
    ['constructor', 'Constructor'],
  ])('formats the unknown %s order status and uses the neutral badge treatment', (status, label) => {
    render(<BookingCard bookingItem={{ id: 42, status, item: { name: 'Forest escape' } }} />);

    expect(screen.getByText(label)).toHaveClass('border-border', 'bg-muted', 'text-muted-foreground');
  });

  it('omits the status badge when the order status is missing or blank', () => {
    const { rerender } = render(<BookingCard bookingItem={{ id: 42, item: { name: 'Forest escape' } }} />);

    expect(screen.queryByTestId('booking-status-badge')).not.toBeInTheDocument();

    rerender(<BookingCard bookingItem={{ id: 42, status: '   ', item: { name: 'Forest escape' } }} />);

    expect(screen.queryByTestId('booking-status-badge')).not.toBeInTheDocument();
  });
});
