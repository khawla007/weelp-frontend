import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import PaymentSuccessClient from '../PaymentSuccessClient';

const mockClearCart = jest.fn();
const mockRefresh = jest.fn();
const mockUseBookingData = jest.fn();

jest.mock('@/hooks/api/public/checkout', () => ({
  useBookingData: (...args) => mockUseBookingData(...args),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({ clearCart: mockClearCart }),
}));

jest.mock(
  '@/app/components/Navigation/NavigationLink',
  () =>
    function NavigationLinkMock({ href, children, ...props }) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
);

const paidResult = {
  success: true,
  data: {
    item_detail: { item_name: 'A very long Dubai desert safari booking title that wraps safely' },
    order: {
      id: 842,
      travel_date: '2027-01-20',
      preferred_time: '09:30',
      number_of_adults: 3,
      number_of_children: 0,
      payment: { amount: '1416.00', currency: 'USD', payment_status: 'paid', payment_method: 'card' },
    },
  },
};

describe('PaymentSuccessClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBookingData.mockReturnValue({ bookingData: undefined, loading: false, error: undefined, refresh: mockRefresh });
  });

  it('renders a safe missing-state without clearing the cart', () => {
    render(<PaymentSuccessClient sessionId={null} />);

    expect(screen.getByRole('heading', { name: /unable to verify this payment/i })).toBeInTheDocument();
    expect(mockClearCart).not.toHaveBeenCalled();
  });

  it('rejects a malformed identifier before requesting result data', () => {
    render(<PaymentSuccessClient sessionId="not-a-checkout-session" />);
    expect(mockUseBookingData).toHaveBeenCalledWith(null);
    expect(screen.getByText(/missing or invalid/i)).toBeInTheDocument();
  });

  it('renders loading, session-expired, not-found, and network states safely', () => {
    mockUseBookingData.mockReturnValueOnce({ loading: true, refresh: mockRefresh });
    const { rerender } = render(<PaymentSuccessClient sessionId="cs_test_safe_fixture" />);
    expect(screen.getByRole('heading', { name: /checking your payment/i })).toBeInTheDocument();

    mockUseBookingData.mockReturnValueOnce({ loading: false, error: { response: { status: 401 } }, refresh: mockRefresh });
    rerender(<PaymentSuccessClient sessionId="cs_test_safe_fixture" />);
    expect(screen.getByRole('heading', { name: /sign in to view this payment/i })).toBeInTheDocument();

    mockUseBookingData.mockReturnValueOnce({ loading: false, error: { response: { status: 404 } }, refresh: mockRefresh });
    rerender(<PaymentSuccessClient sessionId="cs_test_safe_fixture" />);
    expect(screen.getByRole('heading', { name: /payment confirmation not found/i })).toBeInTheDocument();

    mockUseBookingData.mockReturnValueOnce({ loading: false, error: new Error('network'), refresh: mockRefresh });
    rerender(<PaymentSuccessClient sessionId="cs_test_safe_fixture" />);
    expect(screen.getByRole('heading', { name: /could not check the payment/i })).toBeInTheDocument();
    expect(mockClearCart).not.toHaveBeenCalled();
  });

  it('keeps cart state and offers refresh while payment is pending', () => {
    mockUseBookingData.mockReturnValue({
      bookingData: { success: true, data: { order: { payment: { payment_status: 'pending' } } } },
      loading: false,
      error: undefined,
      refresh: mockRefresh,
    });

    render(<PaymentSuccessClient sessionId="cs_test_safe_fixture" />);
    fireEvent.click(screen.getByRole('button', { name: /check payment status/i }));

    expect(screen.getByRole('heading', { name: /payment is still processing/i })).toBeInTheDocument();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(mockClearCart).not.toHaveBeenCalled();
  });

  it('clears the cart once only after authenticated paid data is rendered', () => {
    mockUseBookingData.mockReturnValue({ bookingData: paidResult, loading: false, error: undefined, refresh: mockRefresh });
    const { rerender } = render(<PaymentSuccessClient sessionId="cs_test_safe_fixture" />);

    expect(screen.getByRole('heading', { name: /booking confirmed/i })).toBeInTheDocument();
    expect(screen.getByText('$1,416.00')).toBeInTheDocument();
    expect(screen.getByText('#842')).toBeInTheDocument();
    expect(mockClearCart).toHaveBeenCalledTimes(1);

    rerender(<PaymentSuccessClient sessionId="cs_test_safe_fixture" />);
    expect(mockClearCart).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['failed', /payment was not completed/i],
    ['cancelled', /payment was cancelled/i],
    ['refunded', /payment was refunded/i],
    ['expired', /payment link expired/i],
  ])('does not render success or clear the cart for %s', (status, heading) => {
    mockUseBookingData.mockReturnValue({
      bookingData: { success: true, data: { order: { payment: { payment_status: status } } } },
      loading: false,
      error: undefined,
      refresh: mockRefresh,
    });

    render(<PaymentSuccessClient sessionId="cs_test_safe_fixture" />);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(mockClearCart).not.toHaveBeenCalled();
  });
});
