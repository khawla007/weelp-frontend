import React from 'react';
import { render, screen } from '@testing-library/react';

import PaymentCancelledPage from '../page';

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

describe('checkout cancellation page', () => {
  it('explains that no payment was completed and offers safe next actions', () => {
    render(<PaymentCancelledPage />);

    expect(screen.getByRole('heading', { name: /payment was cancelled/i })).toBeInTheDocument();
    expect(screen.getByText(/your booking has not been confirmed/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to checkout/i })).toHaveAttribute('href', '/checkout');
    expect(screen.getByRole('link', { name: /review booking/i })).toHaveAttribute('href', '/booking');
  });
});
