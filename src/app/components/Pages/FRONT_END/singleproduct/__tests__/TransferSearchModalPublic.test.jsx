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

jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }) => (
    <select value={value} onChange={(event) => onValueChange(event.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }) => children,
  SelectItem: ({ value, children }) => <option value={value}>{children}</option>,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

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
    fireEvent.change(screen.getByLabelText(/pickup time/i), { target: { value: '09:30' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm transfer/i }));

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          transfer_id: 12,
          pickup_location: 'Dubai International Airport',
          dropoff_location: 'Dubai Mall',
          start_time: '09:30',
        }),
      ),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
