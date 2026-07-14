import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import CheckoutForm from '../CheckoutForm';
import axios from 'axios';

const mockElementsSubmit = jest.fn();
const mockConfirmPayment = jest.fn();
const mockToast = jest.fn();
let mockUser;

jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => ({ confirmPayment: mockConfirmPayment }),
  useElements: () => ({ submit: mockElementsSubmit }),
  PaymentElement: () => <div aria-label="Stripe payment fields" />,
}));

jest.mock('axios', () => ({ post: jest.fn() }));

jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mockToast }) }));

jest.mock('@/hooks/api/customer/profile', () => ({
  useUserProfile: () => ({
    user: mockUser,
  }),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({
    cartItems: [
      {
        id: 7,
        type: 'activity',
        currency: 'USD',
        dateRange: { from: new Date(2030, 4, 10) },
        howMany: { adults: 3, children: 0 },
        addons: [{ addon_id: 4, addon_name: 'WiFi', price: 5 }],
      },
    ],
    clearCart: jest.fn(),
  }),
}));

describe('CheckoutForm payment boundary', () => {
  beforeEach(() => {
    mockElementsSubmit.mockReset();
    mockConfirmPayment.mockReset();
    mockToast.mockReset();
    axios.post.mockReset();
    mockUser = {
      name: 'Test Customer',
      profile: {
        country: 'United Arab Emirates',
        state: 'Dubai',
        city: 'Dubai',
        post_code: '00001',
        phone: '+971 50 123 4567',
        address_line_1: '15 Example Street',
      },
    };
  });

  it('validates Stripe fields before profile or order side effects', async () => {
    mockElementsSubmit.mockResolvedValue({ error: { message: 'Your card details are incomplete.' } });

    render(<CheckoutForm paymentIntentId="redacted-intent" />);
    fireEvent.click(screen.getByRole('button', { name: 'Proceed' }));

    await waitFor(() => expect(mockElementsSubmit).toHaveBeenCalledTimes(1));
    expect(axios.post).not.toHaveBeenCalled();
    expect(mockConfirmPayment).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Your card details are incomplete.');
  });

  it('locks repeated submission while Stripe validation is pending', async () => {
    mockElementsSubmit.mockReturnValue(new Promise(() => {}));

    render(<CheckoutForm paymentIntentId="redacted-intent" />);
    const submit = screen.getByRole('button', { name: 'Proceed' });

    fireEvent.click(submit);
    fireEvent.click(submit);

    await waitFor(() => expect(mockElementsSubmit).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: /processing payment/i })).toBeDisabled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('associates custom-field validation messages before reaching Stripe', async () => {
    mockUser = { name: '', profile: {} };

    render(<CheckoutForm paymentIntentId="redacted-intent" />);
    fireEvent.click(screen.getByRole('button', { name: 'Proceed' }));

    const phone = await screen.findByPlaceholderText('Enter Phone Number');
    await waitFor(() => expect(phone).toHaveAttribute('aria-invalid', 'true'));
    expect(phone).toHaveAttribute('aria-describedby', 'phone-error');
    expect(document.getElementById('phone-error')).toHaveAttribute('role', 'alert');
    expect(mockElementsSubmit).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('provides mobile-sized form controls and payment action', async () => {
    render(<CheckoutForm paymentIntentId="redacted-intent" />);
    await act(async () => {
      await import('country-state-city');
    });

    expect(screen.getByPlaceholderText('Enter Postcode')).toHaveClass('min-h-11');
    expect(screen.getByPlaceholderText('Enter Phone Number')).toHaveClass('min-h-11');
    expect(screen.getByPlaceholderText('Please Enter Your Address')).toHaveClass('min-h-20');
    expect(screen.getAllByRole('combobox')[0]).toHaveClass('min-h-11');
    expect(screen.getByRole('button', { name: 'Proceed' })).toHaveClass('min-h-11');
  });
});
