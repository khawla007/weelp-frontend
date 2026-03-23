import React from 'react';
import { render, screen } from '@testing-library/react';

import PaymentSuccessPage from '../page';

jest.mock('../PaymentSuccessClient', () => ({
  __esModule: true,
  default: function PaymentSuccessClientMock({ sessionId }) {
    return <div data-testid="payment-success-client" data-session-id={sessionId ?? ''} />;
  },
}));

describe('checkout success page', () => {
  it('passes the session id from search params into the client component', async () => {
    const page = await PaymentSuccessPage({
      searchParams: Promise.resolve({ session_id: 'sess_123' }),
    });

    render(page);

    expect(screen.getByTestId('payment-success-client')).toHaveAttribute('data-session-id', 'sess_123');
  });
});
