import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ActivitySearchModalPublic from '../ActivitySearchModalPublic';
import TransferSearchModalPublic from '../TransferSearchModalPublic';
import { getActivitiesByCity } from '@/lib/actions/creatorItineraries';

jest.mock('@/lib/actions/creatorItineraries', () => ({
  getActivitiesByCity: jest.fn(),
  getPlacesByCity: jest.fn(),
  getTransfersByCity: jest.fn(),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children, closeClassName }) => (
    <div>
      {children}
      <button type="button" aria-label="Close" className={closeClassName} />
    </div>
  ),
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: () => null,
}));

describe.each([
  ['activity', ActivitySearchModalPublic],
  ['transfer', TransferSearchModalPublic],
])('%s itinerary search modal', (_name, Modal) => {
  it('uses the same plain red close control as itinerary remove actions', () => {
    render(<Modal open cityIds={[]} onSelect={jest.fn()} onOpenChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: /close/i })).toHaveClass('weelp-plain-action', 'border-0', 'bg-transparent', 'text-red-400', 'shadow-none', 'hover:text-red-600');
  });
});

it('keeps canonical activity pricing when an activity is added', async () => {
  getActivitiesByCity.mockResolvedValue({
    success: true,
    data: [{ id: 7, name: 'Museum', pricing: { unit_price: 42, price_type: 'per_person', currency: 'USD' } }],
  });
  const onSelect = jest.fn();

  render(<ActivitySearchModalPublic open cityIds={[1]} onSelect={onSelect} onOpenChange={jest.fn()} />);
  await waitFor(() => expect(screen.getByText('Museum')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Museum'));

  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ activity_id: 7, pricing: { unit_price: 42, price_type: 'per_person', currency: 'USD' } }));
});
