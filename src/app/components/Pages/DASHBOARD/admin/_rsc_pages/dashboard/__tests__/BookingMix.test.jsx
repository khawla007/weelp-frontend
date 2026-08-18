import { render, screen } from '@testing-library/react';

import { BookingMix } from '../BookingMix';

const mix = {
  total: 10,
  categories: [
    { key: 'activities', label: 'Activities', count: 5 },
    { key: 'packages', label: 'Packages', count: 3 },
    { key: 'trips', label: 'Trips', count: 2 },
  ],
  leaders: [
    { type: 'activity', id: 7, name: 'Dubai Safari', bookings: 4, change: 100 },
    { type: 'package', id: 3, name: 'Paris Escape', bookings: 3, change: -25 },
  ],
};

describe('BookingMix', () => {
  it('renders the ordered live mix and at most two leaders in the reference geometry', () => {
    render(<BookingMix data={mix} />);

    const region = screen.getByRole('region', { name: 'Booking mix' });
    expect(region.firstChild).toHaveClass('rounded-[15px]', 'border', 'border-border', 'bg-card', 'p-[15px]');
    expect(screen.getByTestId('booking-mix-donut')).toHaveClass('size-[112px]');
    expect(screen.getByTestId('booking-mix-donut').getAttribute('style')).toContain('conic-gradient');
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getAllByTestId('booking-mix-legend').map((item) => item.textContent)).toEqual(['Activities 5', 'Packages 3', 'Trips 2']);
    expect(screen.getByText('Dubai Safari')).toBeInTheDocument();
    expect(screen.getAllByTestId('booking-mix-leader')[0]).toHaveClass('grid-cols-[27px_minmax(0,1fr)_auto]');
    expect(screen.getAllByTestId('booking-mix-leader-dot')[0]).toHaveClass('size-[27px]', 'rounded-full');
    expect(screen.getByText('+100%')).toHaveClass('text-success');
    expect(screen.getByText('-25%')).toHaveClass('text-destructive');
  });

  it('keeps the donut geometry and three-category legend when empty', () => {
    render(<BookingMix data={{ total: 0, categories: [], leaders: [] }} />);

    expect(screen.getByTestId('booking-mix-donut')).toHaveClass('size-[112px]');
    expect(screen.getByText('No supported bookings this month.')).toBeInTheDocument();
    expect(screen.getAllByTestId('booking-mix-legend')).toHaveLength(3);
  });

  it('renders stable loading and error states', () => {
    const { rerender } = render(<BookingMix loading />);
    expect(screen.getByLabelText('Loading booking mix')).toBeInTheDocument();

    rerender(<BookingMix error={new Error('offline')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Booking mix is temporarily unavailable.');
  });
});
