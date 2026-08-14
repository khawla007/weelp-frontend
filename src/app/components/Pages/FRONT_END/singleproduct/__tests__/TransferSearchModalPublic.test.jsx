import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getPlacesByCity, getTransfersByCity } from '@/lib/actions/creatorItineraries';

import TransferSearchModalPublic from '../TransferSearchModalPublic';

jest.mock('@/lib/actions/creatorItineraries', () => ({
  getPlacesByCity: jest.fn(),
  getTransfersByCity: jest.fn(),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/select', () => {
  const React = require('react');
  const SelectTrigger = () => null;
  const SelectContent = () => null;
  const SelectValue = () => null;
  const SelectItem = () => null;

  const Select = ({ value, onValueChange, children }) => {
    const parts = React.Children.toArray(children);
    const trigger = parts.find((child) => child.type === SelectTrigger);
    const content = parts.find((child) => child.type === SelectContent);
    const items = React.Children.toArray(content?.props.children);
    const { children: _triggerChildren, ...triggerProps } = trigger?.props || {};

    return (
      <select {...triggerProps} value={value} onChange={(event) => onValueChange(event.target.value)}>
        <option value="">Select</option>
        {items.map((item) => (
          <option key={item.props.value} value={item.props.value}>
            {item.props.children}
          </option>
        ))}
      </select>
    );
  };

  return { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
});

describe('TransferSearchModalPublic', () => {
  it('submits the selected pickup, drop-off, and pickup time', async () => {
    getTransfersByCity.mockResolvedValue({
      success: true,
      data: [{ id: 12, name: 'Private Car', vehicle_type: 'Sedan' }],
    });
    getPlacesByCity.mockResolvedValue({
      success: true,
      data: [
        { id: 21, name: 'Dubai International Airport' },
        { id: 22, name: 'Dubai Mall' },
      ],
    });

    const onSelect = jest.fn();
    const onOpenChange = jest.fn();

    render(<TransferSearchModalPublic open cityIds={[37]} onSelect={onSelect} onOpenChange={onOpenChange} />);

    fireEvent.click(await screen.findByText('Private Car'));

    const [pickupSelect, dropoffSelect] = screen.getAllByRole('combobox');
    fireEvent.change(pickupSelect, { target: { value: 'Dubai International Airport' } });
    fireEvent.change(dropoffSelect, { target: { value: 'Dubai Mall' } });
    const confirmButton = screen.getByRole('button', { name: /confirm transfer/i });
    expect(confirmButton).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Pickup hour'), { target: { value: '09' } });
    fireEvent.change(screen.getByLabelText('Pickup minute'), { target: { value: '30' } });
    expect(confirmButton).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Pickup period'), { target: { value: 'PM' } });
    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          transfer_id: 12,
          pickup_location: 'Dubai International Airport',
          dropoff_location: 'Dubai Mall',
          start_time: '21:30',
        }),
      ),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
