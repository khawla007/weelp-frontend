import { fireEvent, render, screen } from '@testing-library/react';

import { CustomerBookingsList } from '../CustomerBookingsList';
import { useAllOrdersCustomer } from '@/hooks/api/customer/orders';

const mutateOrders = jest.fn();
let mockSearchParams;
const mockNavigationListeners = new Set();
const mockReplace = jest.fn((href) => {
  mockSearchParams = new URLSearchParams(href.split('?')[1] ?? '');
  mockNavigationListeners.forEach((listener) => listener());
});

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/customer',
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => {
    const React = jest.requireActual('react');
    React.useSyncExternalStore(
      (listener) => {
        mockNavigationListeners.add(listener);
        return () => mockNavigationListeners.delete(listener);
      },
      () => mockSearchParams,
      () => mockSearchParams,
    );
    return mockSearchParams;
  },
}));

jest.mock('next/dynamic', () => {
  const components = [
    ({ children }) => <div>{children}</div>,
    ({ children }) => <button type="button">{children}</button>,
    ({ children }) => <div>{children}</div>,
    ({ children }) => <div>{children}</div>,
    ({ children }) => <div>{children}</div>,
    ({ children }) => <span>{children}</span>,
  ];
  let componentIndex = 0;
  return () => components[componentIndex++];
});

jest.mock('@/hooks/api/customer/orders', () => ({
  CUSTOMER_ORDERS_PER_PAGE: 6,
  useAllOrdersCustomer: jest.fn(),
}));

jest.mock('@/app/components/BookingCard', () => ({
  __esModule: true,
  default: ({ bookingItem, onReviewSaved, onViewBooking }) => (
    <article>
      <span>{bookingItem.item.name}</span>
      <button type="button" onClick={() => onViewBooking(bookingItem.id)}>
        View Booking {bookingItem.id}
      </button>
      <button type="button" onClick={onReviewSaved}>
        Save review {bookingItem.id}
      </button>
    </article>
  ),
}));

jest.mock('../CustomerBookingDetail', () => ({
  __esModule: true,
  default: ({ orderId, onBack, onReviewSaved, onCancellationChanged }) => (
    <section>
      <span>Detail booking {orderId}</span>
      <button type="button" onClick={onReviewSaved}>
        Save detail review
      </button>
      <button type="button" onClick={onBack}>
        Back to bookings
      </button>
      <button type="button" onClick={onCancellationChanged}>
        Submit cancellation
      </button>
    </section>
  ),
}));

const orders = [
  { id: 41, status: 'pending', item: { name: 'City walk', item_type: 'activity' } },
  { id: 42, status: 'completed', item: { name: 'Forest escape', item_type: 'activity' } },
];

describe('CustomerBookingsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollTo = jest.fn();
    mockSearchParams = new URLSearchParams();
    useAllOrdersCustomer.mockReturnValue({
      orders: { orders, pagination: { total: 2, per_page: 6, current_page: 1, last_page: 1 } },
      isLoading: false,
      isValidating: false,
      error: undefined,
      mutate: mutateOrders,
    });
  });

  it('restores the same filtered list after viewing an inline booking detail', () => {
    render(<CustomerBookingsList />);

    fireEvent.click(screen.getByRole('radio', { name: 'Completed' }));
    expect(screen.getByText('Forest escape')).toBeInTheDocument();
    expect(screen.queryByText('City walk')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View Booking 42' }));
    expect(screen.getByText('Detail booking 42')).toBeInTheDocument();
    expect(screen.queryByText('Forest escape')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back to bookings/i }));
    expect(screen.getByText('Forest escape')).toBeInTheDocument();
    expect(screen.queryByText('City walk')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Completed' }).closest('label')).toHaveClass('bg-background');
  });

  it('opens an exact booking from the query and follows valid URL changes without a replace loop', () => {
    mockSearchParams = new URLSearchParams('order=13');
    const { rerender } = render(<CustomerBookingsList />);

    expect(screen.getByText('Detail booking 13')).toBeInTheDocument();

    mockSearchParams = new URLSearchParams('order=14');
    rerender(<CustomerBookingsList />);

    expect(screen.getByText('Detail booking 14')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it.each(['order=invalid', 'order=-1', 'order=13&order=14'])('ignores an invalid booking query: %s', (query) => {
    mockSearchParams = new URLSearchParams(query);

    render(<CustomerBookingsList />);

    expect(screen.getByText('Your Bookings')).toBeInTheDocument();
    expect(screen.queryByText(/Detail booking/)).not.toBeInTheDocument();
  });

  it('preserves unrelated query parameters when selecting and returning from a booking', () => {
    mockSearchParams = new URLSearchParams('page=2&status=completed');
    render(<CustomerBookingsList />);

    fireEvent.click(screen.getByRole('button', { name: 'View Booking 41' }));
    expect(mockReplace).toHaveBeenLastCalledWith('/dashboard/customer?page=2&status=completed&order=41', { scroll: false });

    fireEvent.click(screen.getByRole('button', { name: /back to bookings/i }));
    expect(mockReplace).toHaveBeenLastCalledWith('/dashboard/customer?page=2&status=completed', { scroll: false });
  });

  it('returns to bookings when an externally removed query follows a UI selection', () => {
    const { rerender } = render(<CustomerBookingsList />);

    fireEvent.click(screen.getByRole('button', { name: 'View Booking 41' }));
    expect(screen.getByText('Detail booking 41')).toBeInTheDocument();

    mockSearchParams = new URLSearchParams('status=completed');
    rerender(<CustomerBookingsList />);

    expect(screen.getByText('Your Bookings')).toBeInTheDocument();
    expect(screen.queryByText('Detail booking 41')).not.toBeInTheDocument();
  });

  it('announces a pending booking navigation without rendering stale detail', () => {
    mockReplace.mockImplementationOnce(() => {});
    const { rerender } = render(<CustomerBookingsList />);

    fireEvent.click(screen.getByRole('button', { name: 'View Booking 41' }));

    expect(screen.getByRole('status')).toHaveTextContent('Opening booking 41…');
    expect(screen.getByText('Your Bookings')).toBeInTheDocument();
    expect(screen.queryByText('Detail booking 41')).not.toBeInTheDocument();

    mockSearchParams = new URLSearchParams('order=41');
    rerender(<CustomerBookingsList />);

    expect(screen.getByText('Detail booking 41')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('expires pending booking feedback when navigation is removed, invalid, or superseded', () => {
    mockReplace.mockImplementationOnce(() => {});
    const { rerender } = render(<CustomerBookingsList />);
    fireEvent.click(screen.getByRole('button', { name: 'View Booking 41' }));
    expect(screen.getByRole('status')).toHaveTextContent('Opening booking 41…');

    mockSearchParams = new URLSearchParams('order=invalid');
    rerender(<CustomerBookingsList />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Your Bookings')).toBeInTheDocument();

    mockSearchParams = new URLSearchParams();
    rerender(<CustomerBookingsList />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    mockSearchParams = new URLSearchParams('order=99');
    rerender(<CustomerBookingsList />);
    expect(screen.getByText('Detail booking 99')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not resurrect a booking after valid, invalid, duplicate, then absent order queries', () => {
    mockSearchParams = new URLSearchParams('order=13');
    const { rerender } = render(<CustomerBookingsList />);
    expect(screen.getByText('Detail booking 13')).toBeInTheDocument();

    for (const query of ['order=invalid', 'order=13&order=14', 'status=completed']) {
      mockSearchParams = new URLSearchParams(query);
      rerender(<CustomerBookingsList />);
      expect(screen.getByText('Your Bookings')).toBeInTheDocument();
    }
  });

  it('refreshes the list when a card review is saved', () => {
    render(<CustomerBookingsList />);

    fireEvent.click(screen.getByRole('button', { name: 'Save review 41' }));

    expect(mutateOrders).toHaveBeenCalledTimes(1);
  });

  it('refreshes the list when a review is saved from inline detail', () => {
    render(<CustomerBookingsList />);

    fireEvent.click(screen.getByRole('button', { name: 'View Booking 41' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save detail review' }));

    expect(mutateOrders).toHaveBeenCalledTimes(1);
  });

  it('refreshes the list when a cancellation is submitted from inline detail', () => {
    render(<CustomerBookingsList />);

    fireEvent.click(screen.getByRole('button', { name: 'View Booking 41' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit cancellation' }));

    expect(mutateOrders).toHaveBeenCalledTimes(1);
  });

  it('shows the request error without presenting it as an empty booking list', () => {
    useAllOrdersCustomer.mockReturnValue({
      orders: null,
      isLoading: false,
      isValidating: false,
      error: new Error('Unauthorized'),
      mutate: mutateOrders,
    });

    render(<CustomerBookingsList />);

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.queryByText('No bookings found')).not.toBeInTheDocument();
  });

  it('renders one booking-card skeleton per order slot in the booking grid', () => {
    useAllOrdersCustomer.mockReturnValue({
      orders: { orders: [], pagination: { total: 0, per_page: 6, current_page: 1, last_page: 1 } },
      isLoading: true,
      isValidating: false,
      error: undefined,
      mutate: mutateOrders,
    });

    render(<CustomerBookingsList />);

    const bookingGrid = screen.getByTestId('booking-card-grid');
    const skeletons = screen.getAllByTestId('booking-card-skeleton');

    expect(skeletons).toHaveLength(6);
    skeletons.forEach((skeleton) => expect(skeleton.parentElement).toBe(bookingGrid));
  });

  it('restores page 2 and its active filter after returning from booking detail', () => {
    const pageTwoOrders = [{ id: 52, status: 'completed', item: { name: 'Mountain retreat', item_type: 'package' } }];
    useAllOrdersCustomer.mockImplementation((page) => ({
      orders: {
        orders: page === 2 ? pageTwoOrders : orders,
        pagination: { total: 7, per_page: 6, current_page: page, last_page: 2 },
      },
      isLoading: false,
      isValidating: false,
      error: undefined,
      mutate: mutateOrders,
    }));

    render(<CustomerBookingsList />);

    fireEvent.click(screen.getByRole('radio', { name: 'Completed' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(screen.getByText('Mountain retreat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(useAllOrdersCustomer).toHaveBeenLastCalledWith(2);

    fireEvent.click(screen.getByRole('button', { name: 'View Booking 52' }));
    expect(screen.getByText('Detail booking 52')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back to bookings/i }));

    expect(screen.getByText('Mountain retreat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('radio', { name: 'Completed' }).closest('label')).toHaveClass('bg-background');
    expect(useAllOrdersCustomer).toHaveBeenLastCalledWith(2);
  });
});
