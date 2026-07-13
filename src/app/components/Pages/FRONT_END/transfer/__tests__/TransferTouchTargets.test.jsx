import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import TransferResultCard from '../TransferResultCard';
import TransferSearchForm from '../TransferSearchForm';

jest.mock('../LocationComboboxPublic', () => ({
  __esModule: true,
  default: ({ placeholder }) => <button type="button">{placeholder}</button>,
}));

describe('transfer mobile touch targets', () => {
  it('gives the swap and passenger quantity controls 44px mobile targets', () => {
    render(<TransferSearchForm />);

    expect(screen.getByRole('button', { name: 'Swap pickup and destination' })).toHaveClass('h-11', 'w-11', 'lg:h-[27px]', 'lg:w-[27px]');
    expect(screen.getByRole('button', { name: 'Swap pickup and destination' })).not.toHaveClass('sm:h-[27px]', 'sm:w-[27px]');

    fireEvent.click(screen.getByRole('button', { name: 'How Many?' }));

    expect(screen.getByRole('button', { name: 'Increase Adults' })).toHaveClass('h-11', 'w-11', 'lg:h-8', 'lg:w-8');
    expect(screen.getByRole('button', { name: 'Decrease Adults' })).toHaveClass('h-11', 'w-11', 'lg:h-8', 'lg:w-8');
  });

  it('gives transfer extras 44px mobile quantity targets', () => {
    render(
      <TransferResultCard
        transfer={{
          id: 1,
          name: 'Airport transfer',
          route_price: 110,
          luggage_per_bag_rate: 10,
          waiting_per_minute_rate: 0.5,
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Increase Extra luggage' })).toHaveClass('h-11', 'w-11', 'lg:h-7', 'lg:w-7');
    expect(screen.getByRole('button', { name: 'Decrease Waiting time' })).toHaveClass('h-11', 'w-11', 'lg:h-7', 'lg:w-7');

    const luggageRow = screen.getByText('Extra luggage').parentElement?.parentElement;
    expect(luggageRow).toHaveClass('flex-col', 'gap-3', 'sm:flex-row', 'sm:items-center', 'sm:justify-between');
    expect(screen.getByRole('button', { name: 'Increase Extra luggage' }).parentElement?.parentElement).toHaveClass('flex-wrap', 'justify-between', 'sm:flex-nowrap');
  });
});
