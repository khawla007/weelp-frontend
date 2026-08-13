import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import CustomerBookingDetail from '../CustomerBookingDetail';
import { useCustomerOrder } from '@/hooks/api/customer/orders';

const toast = jest.fn();

jest.mock('@/hooks/api/customer/orders', () => ({
  useCustomerOrder: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

jest.mock('../CustomerCancellationDialog', () => ({
  __esModule: true,
  default: ({ bookingName, onStateChanged, onSubmitted, triggerClassName }) => (
    <div>
      <span>Cancellation booking: {bookingName}</span>
      <button type="button" className={triggerClassName} onClick={onSubmitted}>
        Request cancellation
      </button>
      <button type="button" onClick={onStateChanged}>
        Refresh cancellation state
      </button>
    </div>
  ),
}));

jest.mock('../CustomerCancellationPanel', () => ({
  __esModule: true,
  default: ({ cancellation }) => <div>Cancellation panel: {cancellation.status}</div>,
}));

jest.mock('@/app/components/BookingReviewDialog', () => ({
  __esModule: true,
  default: ({ onSaved }) => (
    <button type="button" onClick={onSaved}>
      Add Review
    </button>
  ),
}));

const completeOrder = {
  id: 42,
  status: 'confirmed',
  travel_date: '2026-08-20',
  preferred_time: '09:30',
  number_of_adults: 2,
  number_of_children: 1,
  special_requirements: 'Vegetarian meal',
  item: {
    name: 'Desert Safari',
    city: 'Dubai',
    region: 'United Arab Emirates',
    media: [{ id: 7, name: 'Safari cover', alt_text: 'Dunes at sunset', url: 'https://example.test/safari.jpg' }],
  },
  payment: {
    amount: 125,
    currency: 'USD',
    payment_status: 'paid',
    payment_method: 'card',
  },
  user: {
    name: 'Customer Name',
    email: 'customer@example.test',
    phone: '+971500000000',
  },
  emergency_contact: {
    contact_name: 'Emergency Name',
    contact_phone: '+971511111111',
    relationship: 'Sibling',
  },
  review: null,
};

describe('CustomerBookingDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offers cancellation only for an eligible booking without a request', () => {
    useCustomerOrder.mockReturnValue({ order: { ...completeOrder, cancellation_eligible: true, cancellation: null }, isLoading: false, error: undefined, mutate: jest.fn() });
    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);
    expect(screen.getByRole('button', { name: /request cancellation/i })).toBeInTheDocument();
    expect(screen.getByText('Cancellation booking: Desert Safari')).toBeInTheDocument();
    const actions = screen.getByTestId('booking-header-actions');
    const cancellationAction = screen.getByRole('button', { name: /request cancellation/i });
    const status = screen.getByText('confirmed');
    expect(actions).toHaveClass('flex-wrap');
    expect(actions).toHaveClass('sm:flex-nowrap');
    expect(actions).toContainElement(cancellationAction);
    expect(actions).toContainElement(status);
    expect(cancellationAction.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(cancellationAction).toHaveClass('weelp-booking-status-action', 'h-[34px]', 'rounded-full', 'border-border', 'bg-transparent', 'text-sm', 'font-semibold', 'text-foreground');
    expect(status).toHaveClass('rounded-full', 'border-border', 'px-3', 'py-1.5', 'text-sm', 'font-semibold', 'text-foreground');
    expect(status).not.toHaveClass('bg-weelp-sage-wash', 'text-weelp-sage-text', 'border-weelp-sage-deep/40');
  });

  it('explains why an explicitly ineligible booking has no cancellation action', () => {
    useCustomerOrder.mockReturnValue({
      order: {
        ...completeOrder,
        cancellation_eligible: false,
        cancellation: null,
        cancellation_ineligibility_reason: 'Travel has already started.',
      },
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });
    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    expect(screen.getByText('Travel has already started.')).toBeInTheDocument();
    expect(screen.getByText(/contact support/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /request cancellation/i })).not.toBeInTheDocument();
  });

  it('shows an existing cancellation instead of another request action', () => {
    useCustomerOrder.mockReturnValue({
      order: { ...completeOrder, cancellation_eligible: false, cancellation: { id: 9, status: 'pending' } },
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });
    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);
    expect(screen.getByText('Cancellation panel: pending')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /request cancellation/i })).not.toBeInTheDocument();
  });

  it('refreshes detail and list in parallel and still reports success when both refreshes fail', async () => {
    const mutate = jest.fn().mockRejectedValue(new Error('detail refresh failed'));
    const onCancellationChanged = jest.fn().mockRejectedValue(new Error('list refresh failed'));
    useCustomerOrder.mockReturnValue({ order: { ...completeOrder, cancellation_eligible: true, cancellation: null }, isLoading: false, error: undefined, mutate });
    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} onCancellationChanged={onCancellationChanged} />);

    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(onCancellationChanged).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith({ title: 'Cancellation request submitted' });
  });

  it('refreshes detail and list after a state conflict without a success toast', async () => {
    const mutate = jest.fn().mockResolvedValue(undefined);
    const onCancellationChanged = jest.fn().mockResolvedValue(undefined);
    useCustomerOrder.mockReturnValue({ order: { ...completeOrder, cancellation_eligible: true, cancellation: null }, isLoading: false, error: undefined, mutate });
    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} onCancellationChanged={onCancellationChanged} />);

    fireEvent.click(screen.getByRole('button', { name: /refresh cancellation state/i }));

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(onCancellationChanged).toHaveBeenCalledTimes(1);
    expect(toast).not.toHaveBeenCalledWith({ title: 'Cancellation request submitted' });
  });

  it('renders every approved booking detail field', () => {
    useCustomerOrder.mockReturnValue({ order: completeOrder, isLoading: false, error: undefined, mutate: jest.fn() });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    expect(screen.getByRole('button', { name: /back to bookings/i })).toBeEnabled();
    expect(screen.getByRole('heading', { name: 'Desert Safari' })).toBeInTheDocument();
    expect(screen.getByText('Booking ID: 42')).toBeInTheDocument();
    expect(screen.getByText('confirmed')).toBeInTheDocument();
    const imageUrl = new URL(screen.getByRole('img', { name: 'Dunes at sunset' }).getAttribute('src'), 'http://localhost');
    expect(imageUrl.searchParams.get('url')).toBe('/api/media/7');
    expect(screen.getByText('Dubai')).toBeInTheDocument();
    expect(screen.getByText('United Arab Emirates')).toBeInTheDocument();
    expect(screen.getByText('Aug 20, 2026')).toBeInTheDocument();
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByText('2 adults')).toBeInTheDocument();
    expect(screen.getByText('1 child')).toBeInTheDocument();
    expect(screen.getByText('$125.00')).toBeInTheDocument();
    expect(screen.getByText('paid')).toBeInTheDocument();
    expect(screen.getByText('card')).toBeInTheDocument();
    expect(screen.getByText('Customer Name')).toBeInTheDocument();
    expect(screen.getByText('customer@example.test')).toBeInTheDocument();
    expect(screen.getByText('+971500000000')).toBeInTheDocument();
    expect(screen.getByText('Emergency Name')).toBeInTheDocument();
    expect(screen.getByText('+971511111111')).toBeInTheDocument();
    expect(screen.getByText('Sibling')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian meal')).toBeInTheDocument();
    ['Travel details', 'Payment', 'Traveler', 'Emergency contact', 'Special requirements', 'Review'].forEach((heading) => {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Payment' }).closest('section')).toHaveClass('lg:border-t-0');
    expect(screen.getByText('confirmed')).toHaveClass('px-3', 'py-1.5', 'text-sm', 'font-semibold');
  });

  it('aligns Travel details and Review in a shared desktop grid row without changing source order', () => {
    useCustomerOrder.mockReturnValue({ order: completeOrder, isLoading: false, error: undefined, mutate: jest.fn() });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    const grid = screen.getByTestId('booking-detail-grid');
    const media = screen.getByTestId('booking-detail-media');
    const travel = screen.getByTestId('booking-detail-travel');
    const primary = screen.getByTestId('booking-detail-primary');
    const review = screen.getByTestId('booking-detail-review');

    expect(Array.from(grid.children)).toEqual([media, travel, primary, review]);
    expect(media).toHaveClass('lg:col-start-1', 'lg:row-start-1');
    expect(primary).toHaveClass('lg:col-start-2', 'lg:row-start-1');
    expect(travel).toHaveClass('lg:col-start-1', 'lg:row-start-2');
    expect(review).toHaveClass('lg:col-start-2', 'lg:row-start-2');
    expect(
      within(grid)
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Travel details', 'Special requirements', 'Payment', 'Traveler', 'Emergency contact', 'Review']);
    expect(within(travel).getByRole('heading', { name: 'Travel details' })).toBeInTheDocument();
    expect(within(review).getByRole('heading', { name: 'Review' })).toBeInTheDocument();
  });

  it('renders a stable loading state with Back available', () => {
    const onBack = jest.fn();
    useCustomerOrder.mockReturnValue({ order: null, isLoading: true, error: undefined, mutate: jest.fn() });

    render(<CustomerBookingDetail orderId={42} onBack={onBack} />);

    expect(screen.getByTestId('booking-detail-skeleton')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /back to bookings/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders an error state and retries through SWR mutate', () => {
    const mutate = jest.fn();
    useCustomerOrder.mockReturnValue({ order: null, isLoading: false, error: new Error('Not found'), mutate });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    expect(screen.getByRole('button', { name: /back to bookings/i })).toBeEnabled();
    expect(screen.getByText(/could not load this booking/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('uses the fallback image and displays missing optional values consistently', () => {
    useCustomerOrder.mockReturnValue({
      order: {
        ...completeOrder,
        preferred_time: null,
        special_requirements: null,
        item: { ...completeOrder.item, media: [] },
        emergency_contact: null,
      },
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    expect(screen.getByRole('img', { name: 'Desert Safari booking' })).toHaveAttribute('src', expect.stringContaining('Review.png'));
    expect(screen.getAllByText('Not provided').length).toBeGreaterThanOrEqual(3);
  });

  it('refreshes both detail and list data after a review is saved', () => {
    const mutate = jest.fn();
    const onReviewSaved = jest.fn();
    useCustomerOrder.mockReturnValue({ order: completeOrder, isLoading: false, error: undefined, mutate });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} onReviewSaved={onReviewSaved} />);

    fireEvent.click(screen.getByRole('button', { name: /add review/i }));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(onReviewSaved).toHaveBeenCalledTimes(1);
  });

  it('shows the saved review text with wrapping alongside its rating', () => {
    const reviewText = `A memorable trip.\n${'Excellent'.repeat(24)}`;
    useCustomerOrder.mockReturnValue({
      order: { ...completeOrder, review: { rating: 5, review_text: reviewText } },
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    const reviewSection = screen.getByRole('heading', { name: 'Review' }).closest('section');
    const reviewParagraph = reviewSection.querySelector('p.whitespace-pre-wrap');
    expect(within(reviewSection).getByText('5 out of 5 stars')).toBeInTheDocument();
    expect(reviewParagraph).toHaveTextContent('A memorable trip.');
    expect(reviewParagraph.textContent).toBe(reviewText);
    expect(reviewParagraph).toHaveClass('whitespace-pre-wrap', 'break-words');
  });

  it('shows the established fallback for a review with blank text', () => {
    useCustomerOrder.mockReturnValue({
      order: { ...completeOrder, review: { rating: 4, review_text: '   ' } },
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    const reviewSection = screen.getByRole('heading', { name: 'Review' }).closest('section');
    expect(within(reviewSection).getByText('4 out of 5 stars')).toBeInTheDocument();
    expect(within(reviewSection).getByText('Not provided')).toBeInTheDocument();
  });

  it('rejects untrusted image URLs when no proxy media ID is available', () => {
    useCustomerOrder.mockReturnValue({
      order: {
        ...completeOrder,
        item: {
          ...completeOrder.item,
          media: [{ name: 'Unsafe cover', alt_text: 'Unsafe cover', url: 'https://untrusted.example/cover.jpg' }],
        },
      },
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    expect(screen.getByRole('img', { name: 'Desert Safari booking' })).toHaveAttribute('src', expect.stringContaining('Review.png'));
  });

  it('shows missing values for invalid currency and impossible dates', () => {
    useCustomerOrder.mockReturnValue({
      order: {
        ...completeOrder,
        travel_date: '2026-02-30',
        payment: { ...completeOrder.payment, currency: 'NOT_A_CURRENCY' },
      },
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    expect(screen.queryByText('Mar 2, 2026')).not.toBeInTheDocument();
    expect(screen.queryByText(/NOT_A_CURRENCY/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Not provided').length).toBeGreaterThanOrEqual(2);
  });

  it('falls back safely when currency formatting throws', () => {
    const numberFormat = jest.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
      throw new RangeError('Unsupported currency');
    });
    useCustomerOrder.mockReturnValue({ order: completeOrder, isLoading: false, error: undefined, mutate: jest.fn() });

    try {
      render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);
      expect(screen.getAllByText('Not provided').length).toBeGreaterThanOrEqual(1);
    } finally {
      numberFormat.mockRestore();
    }
  });

  it('does not offer reviews for an archived booking item', () => {
    useCustomerOrder.mockReturnValue({
      order: {
        ...completeOrder,
        item: { ...completeOrder.item, has_live_item: false },
      },
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });

    render(<CustomerBookingDetail orderId={42} onBack={jest.fn()} />);

    expect(screen.getByText('Reviews are unavailable for archived bookings.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add review/i })).not.toBeInTheDocument();
  });
});
