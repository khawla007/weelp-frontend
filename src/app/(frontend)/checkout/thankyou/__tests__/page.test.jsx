import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import ThankYouPage from '../page';

const mockClearCart = jest.fn();
const mockUseOrderThankyou = jest.fn();
let paymentIntent = null;

jest.mock('next/navigation', () => ({ useSearchParams: () => ({ get: () => paymentIntent }) }));
jest.mock('@/hooks/api/public/order/thankyou', () => ({
  useOrderThankyou: (...args) => mockUseOrderThankyou(...args),
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

describe('checkout thank-you page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.setItem('clientSecret', 'redacted-fixture');
    sessionStorage.setItem('paymentIntent', 'redacted-fixture');
    paymentIntent = null;
    mockUseOrderThankyou.mockReturnValue({ orderData: undefined, isLoading: false, error: undefined, refresh: jest.fn() });
  });

  it('fails safely on direct access and retains checkout state', () => {
    render(<ThankYouPage />);

    expect(screen.getByRole('heading', { name: /unable to verify this payment/i })).toBeInTheDocument();
    expect(mockClearCart).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('paymentIntent')).toBe('redacted-fixture');
  });

  it('rejects a malformed identifier before requesting result data', () => {
    paymentIntent = 'not-a-payment-intent';
    render(<ThankYouPage />);
    expect(mockUseOrderThankyou).toHaveBeenCalledWith(null);
    expect(screen.getByText(/missing or invalid/i)).toBeInTheDocument();
  });

  it('renders loading and authenticated error states without cleanup', () => {
    paymentIntent = 'pi_safe_fixture';
    mockUseOrderThankyou.mockReturnValueOnce({ isLoading: true, refresh: jest.fn() });
    const { rerender } = render(<ThankYouPage />);
    expect(screen.getByRole('heading', { name: /checking your payment/i })).toBeInTheDocument();

    mockUseOrderThankyou.mockReturnValueOnce({ isLoading: false, error: { response: { status: 401 } }, refresh: jest.fn() });
    rerender(<ThankYouPage />);
    expect(screen.getByRole('heading', { name: /sign in to view this payment/i })).toBeInTheDocument();

    mockUseOrderThankyou.mockReturnValueOnce({ isLoading: false, error: { response: { status: 404 } }, refresh: jest.fn() });
    rerender(<ThankYouPage />);
    expect(screen.getByRole('heading', { name: /payment confirmation not found/i })).toBeInTheDocument();
    expect(mockClearCart).not.toHaveBeenCalled();
  });

  it.each([
    ['failed', /payment was not completed/i],
    ['cancelled', /payment was cancelled/i],
    ['refunded', /payment was refunded/i],
    ['expired', /payment link expired/i],
  ])('retains checkout state for %s results', (status, heading) => {
    paymentIntent = 'pi_safe_fixture';
    mockUseOrderThankyou.mockReturnValue({
      orderData: { success: true, order: { payment: { payment_status: status } } },
      isLoading: false,
      refresh: jest.fn(),
    });
    render(<ThankYouPage />);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(mockClearCart).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('paymentIntent')).toBe('redacted-fixture');
  });

  it('does not clear checkout state for a pending payment', () => {
    paymentIntent = 'pi_safe_fixture';
    mockUseOrderThankyou.mockReturnValue({
      orderData: { success: true, order: { payment: { payment_status: 'pending' } } },
      isLoading: false,
      error: undefined,
      refresh: jest.fn(),
    });

    render(<ThankYouPage />);
    expect(screen.getByRole('heading', { name: /payment is still processing/i })).toBeInTheDocument();
    expect(mockClearCart).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('clientSecret')).toBe('redacted-fixture');
  });

  it('cleans up persisted checkout state only after a paid result', async () => {
    paymentIntent = 'pi_safe_fixture';
    mockUseOrderThankyou.mockReturnValue({
      orderData: {
        success: true,
        order: {
          id: 843,
          item: { name: 'Dubai desert safari' },
          payment: { payment_status: 'paid', amount: '1416', currency: 'USD', payment_method: 'card' },
        },
      },
      isLoading: false,
      error: undefined,
      refresh: jest.fn(),
    });

    render(<ThankYouPage />);
    expect(screen.getByRole('heading', { name: /booking confirmed/i })).toBeInTheDocument();
    expect(screen.getByText('#843')).toBeInTheDocument();
    await waitFor(() => expect(mockClearCart).toHaveBeenCalledTimes(1));
    expect(sessionStorage.getItem('clientSecret')).toBeNull();
    expect(sessionStorage.getItem('paymentIntent')).toBeNull();
  });
});
