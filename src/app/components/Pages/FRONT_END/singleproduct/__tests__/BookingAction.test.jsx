import { fireEvent, render, screen } from '@testing-library/react';

import BookingAction from '../BookingAction';

describe('BookingAction', () => {
  it('submits the shared booking form and shows the supplied total', () => {
    render(<BookingAction formId="booking-form-41" primaryPrice="$475.00" />);

    expect(screen.getByText('$475.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select' })).toHaveAttribute('form', 'booking-form-41');
    expect(screen.getByRole('button', { name: 'Select' })).toHaveAttribute('type', 'submit');
  });

  it('renders update and show-cart states without duplicating state logic', () => {
    const onShowCart = jest.fn();
    const { rerender } = render(<BookingAction formId="booking-form-41" primaryPrice="$475.00" isEditing />);
    expect(screen.getByRole('button', { name: 'Update booking' })).toBeInTheDocument();

    rerender(<BookingAction formId="booking-form-41" primaryPrice="$475.00" isInCart onShowCart={onShowCart} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Cart' }));
    expect(onShowCart).toHaveBeenCalledTimes(1);
  });

  it('supports the compact mobile presentation', () => {
    render(<BookingAction formId="booking-form-41" primaryPrice="$475.00" secondaryPrice="Total" variant="mobile" />);
    expect(screen.getByTestId('booking-action')).toHaveClass('rounded-none', 'sm:rounded-xl');
  });

  it('wraps long prices and translated actions instead of clipping them', () => {
    render(<BookingAction formId="booking-form-41" primaryPrice="USD 123,456,789.00" secondaryPrice="Total for your selected experience" isEditing />);
    expect(screen.getByText('USD 123,456,789.00')).toHaveClass('break-words');
    expect(screen.getByTestId('booking-action')).toHaveClass('flex-col', 'min-[360px]:flex-row');
    expect(screen.getByRole('button', { name: 'Update booking' })).toHaveClass('w-full', 'min-[360px]:w-auto');
  });
});
