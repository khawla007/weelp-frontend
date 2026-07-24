import { render } from '@testing-library/react';

import BookingCard from '../BookingCard';

jest.mock('next/dynamic', () => () => () => null);

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
  });
});
