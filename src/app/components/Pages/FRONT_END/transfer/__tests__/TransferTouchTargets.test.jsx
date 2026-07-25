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

    const searchGrid = screen.getByRole('button', { name: 'Pickup Location' }).closest('[data-transfer-search-grid]');

    expect(searchGrid).toHaveClass('grid', 'grid-cols-2', 'sm:flex');
    expect(screen.getByTestId('transfer-pickup-field')).toHaveClass('col-span-2', 'sm:col-span-1');
    expect(screen.getByTestId('transfer-destination-field')).toHaveClass('col-span-2', 'sm:col-span-1');
    expect(screen.getByRole('button', { name: 'Swap pickup and destination' })).toHaveClass('h-11', 'w-11', 'lg:h-[27px]', 'lg:w-[27px]');
    expect(screen.getByRole('button', { name: 'Swap pickup and destination' })).toHaveClass('top-[58px]', 'sm:left-1/4', 'sm:top-1/2');
    expect(screen.getByRole('button', { name: 'Swap pickup and destination' })).not.toHaveClass('sm:h-[27px]', 'sm:w-[27px]');

    fireEvent.click(screen.getByRole('button', { name: 'How Many?' }));

    expect(screen.getByTestId('transfer-passenger-popover')).toHaveClass('w-[calc(100vw-2rem)]', 'max-w-[280px]');
    expect(screen.getByRole('button', { name: 'Increase Adults' })).toHaveClass('h-11', 'w-11', 'lg:h-8', 'lg:w-8');
    expect(screen.getByRole('button', { name: 'Decrease Adults' })).toHaveClass('h-11', 'w-11', 'lg:h-8', 'lg:w-8');
  });

  it('keeps the date and time controls within a 320px viewport', () => {
    render(<TransferSearchForm />);

    fireEvent.click(screen.getByRole('button', { name: 'When?' }));

    expect(screen.getByTestId('transfer-date-popover')).toHaveClass(
      'w-[calc(100vw-2rem)]',
      'max-w-sm',
      'max-h-[var(--radix-popover-content-available-height)]',
      'overflow-y-auto',
      'p-0',
      'sm:w-auto',
      'sm:p-2',
    );
    expect(screen.getByTestId('transfer-time-controls')).toHaveClass('min-w-0', 'flex-1');
    expect(screen.getByTestId('transfer-time-hour')).toHaveClass('w-[58px]', 'sm:w-16');
    expect(screen.getByTestId('transfer-time-minute')).toHaveClass('w-[58px]', 'sm:w-16');
    expect(screen.getByTestId('transfer-time-period')).toHaveClass('w-[58px]', 'sm:w-16');
    expect(screen.getByRole('button', { name: 'Done' })).toHaveClass('shrink-0', 'px-2', 'sm:px-3');
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

  it('stacks result media and actions while constraining long labels', () => {
    const longRoute = 'Dubai International Airport Terminal Three → An Exceptionally Long Resort Destination';
    const longVehicle = 'extra_long_luxury_vehicle_description';

    render(
      <TransferResultCard
        transfer={{
          id: 2,
          name: longRoute,
          vehicle_type: longVehicle,
          route_price: 1234567,
          luggage_per_bag_rate: 10,
          waiting_per_minute_rate: 0.5,
        }}
      />,
    );

    expect(screen.getByTestId('transfer-result-media-row')).toHaveClass('flex-col-reverse', 'sm:flex-row');
    expect(screen.getByRole('img', { name: longRoute })).toHaveClass('h-36', 'w-full', 'sm:h-40');
    expect(screen.getByText(longRoute)).toHaveClass('truncate');
    expect(screen.getByText(longVehicle)).toHaveClass('truncate');
    expect(screen.getByTestId('transfer-result-price')).toHaveClass('min-w-0');
    expect(screen.getByTestId('transfer-result-footer')).toHaveClass('flex-col', 'items-stretch', 'sm:flex-row', 'sm:items-center');
    expect(screen.getByRole('button', { name: 'Select' })).toHaveClass('w-full', 'sm:w-auto');
  });
});
