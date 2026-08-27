import { render } from '@testing-library/react';

import CheckoutResultState from '../CheckoutResultState';

test('checkout result state uses the shared outer radius', () => {
  const { container } = render(<CheckoutResultState title="Booking confirmed" description="Ready" />);
  expect(container.querySelector('[data-public-card="checkout-result"]')).toHaveClass('rounded-[24px]');
});
