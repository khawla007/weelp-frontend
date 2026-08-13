import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import CustomerCancellationDialog from '../CustomerCancellationDialog';
import { createCancellationRequest, getCancellationQuote } from '@/lib/services/customer/cancellations';

jest.mock('@/lib/services/customer/cancellations', () => ({
  createCancellationRequest: jest.fn(),
  getCancellationQuote: jest.fn(),
}));

const quote = {
  requested_at: '2026-08-12T09:00:00-04:00',
  travel_starts_at: '2026-08-27T09:00:00-04:00',
  seconds_remaining: 1296000,
  paid_amount: '100.00',
  currency: 'USD',
  deduction_percentage: 25,
  suggested_deduction: '25.00',
  suggested_refund: '75.00',
};

describe('CustomerCancellationDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCancellationQuote.mockResolvedValue(quote);
    createCancellationRequest.mockResolvedValue({ id: 9, status: 'pending' });
  });

  it('loads and displays the policy quote only after the dialog opens', async () => {
    render(<CustomerCancellationDialog orderId={42} bookingName="Desert Safari" onSubmitted={jest.fn()} />);
    expect(getCancellationQuote).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));

    expect(await screen.findByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Desert Safari')).toBeInTheDocument();
    expect(screen.getByText('25% deduction')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
    expect(screen.getByText('Travel starts')).toBeInTheDocument();
    expect(screen.getByText(/Aug 27, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/estimate is not a guarantee/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', 'cancellation-estimate-notice');
    expect(getCancellationQuote).toHaveBeenCalledTimes(1);
    expect(getCancellationQuote).toHaveBeenCalledWith(42);
  });

  it('enforces a 10 to 1000 character trimmed reason', async () => {
    render(<CustomerCancellationDialog orderId={42} onSubmitted={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));
    await screen.findByText('$75.00');

    const reason = screen.getByLabelText(/reason for cancellation/i);
    const submit = screen.getByRole('button', { name: /submit request/i });
    fireEvent.change(reason, { target: { value: '    short    ' } });
    expect(submit).toBeDisabled();
    fireEvent.blur(reason);
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();

    fireEvent.change(reason, { target: { value: `  ${'x'.repeat(1001)}  ` } });
    expect(submit).toBeDisabled();
    expect(screen.getByText(/no more than 1000 characters/i)).toBeInTheDocument();
  });

  it('submits once, trims the reason, closes, and returns focus to its trigger', async () => {
    let resolveRequest;
    createCancellationRequest.mockReturnValue(new Promise((resolve) => (resolveRequest = resolve)));
    const onSubmitted = jest.fn().mockResolvedValue(undefined);
    render(<CustomerCancellationDialog orderId={42} onSubmitted={onSubmitted} />);
    const trigger = screen.getByRole('button', { name: /request cancellation/i });
    fireEvent.click(trigger);
    await screen.findByText('$75.00');
    fireEvent.change(screen.getByLabelText(/reason for cancellation/i), { target: { value: '  Our dates have changed.  ' } });

    const submit = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(submit).toBeDisabled();
    expect(createCancellationRequest).toHaveBeenCalledTimes(1);
    expect(createCancellationRequest).toHaveBeenCalledWith(42, 'Our dates have changed.');

    await act(async () => resolveRequest({ id: 9, status: 'pending' }));
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('closes before notifying its owner so an immediate panel replacement is safe', async () => {
    function IntegratedCancellation() {
      const [cancellation, setCancellation] = React.useState(null);
      return cancellation ? <div>Cancellation panel: {cancellation.status}</div> : <CustomerCancellationDialog orderId={42} onSubmitted={setCancellation} />;
    }

    render(<IntegratedCancellation />);
    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));
    await screen.findByText('$75.00');
    fireEvent.change(screen.getByLabelText(/reason for cancellation/i), { target: { value: 'Our dates have changed.' } });
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    expect(await screen.findByText('Cancellation panel: pending')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes with Escape and returns focus to its trigger', async () => {
    render(<CustomerCancellationDialog orderId={42} onSubmitted={jest.fn()} />);
    const trigger = screen.getByRole('button', { name: /request cancellation/i });
    fireEvent.click(trigger);
    await screen.findByText('$75.00');

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('keeps entered text and shows the safe error after submission fails', async () => {
    createCancellationRequest.mockRejectedValue(new Error('A cancellation request is already being reviewed.'));
    render(<CustomerCancellationDialog orderId={42} onSubmitted={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));
    await screen.findByText('$75.00');
    const reason = screen.getByLabelText(/reason for cancellation/i);
    fireEvent.change(reason, { target: { value: 'Our dates have changed.' } });
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('A cancellation request is already being reviewed.');
    expect(reason).toHaveValue('Our dates have changed.');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('refreshes state without closing or reporting success after a 409 conflict', async () => {
    const conflict = Object.assign(new Error('A cancellation request is already being reviewed.'), { status: 409 });
    const onStateChanged = jest.fn().mockResolvedValue(undefined);
    const onSubmitted = jest.fn();
    createCancellationRequest.mockRejectedValue(conflict);
    render(<CustomerCancellationDialog orderId={42} onSubmitted={onSubmitted} onStateChanged={onStateChanged} />);
    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));
    await screen.findByText('$75.00');
    const reason = screen.getByLabelText(/reason for cancellation/i);
    fireEvent.change(reason, { target: { value: 'Our dates have changed.' } });
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('A cancellation request is already being reviewed.');
    expect(onStateChanged).toHaveBeenCalledTimes(1);
    expect(onSubmitted).not.toHaveBeenCalled();
    expect(reason).toHaveValue('Our dates have changed.');
  });

  it('resets reason and validation after an ordinary close and reopen', async () => {
    render(<CustomerCancellationDialog orderId={42} onSubmitted={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));
    await screen.findByText('$75.00');
    const reason = screen.getByLabelText(/reason for cancellation/i);
    fireEvent.change(reason, { target: { value: 'short' } });
    fireEvent.blur(reason);
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));
    await screen.findByText('$75.00');
    expect(screen.getByLabelText(/reason for cancellation/i)).toHaveValue('');
    expect(screen.queryByText(/at least 10 characters/i)).not.toBeInTheDocument();
  });

  it('uses safe copy for an invalid policy percentage', async () => {
    getCancellationQuote.mockResolvedValue({ ...quote, deduction_percentage: Number.NaN });
    render(<CustomerCancellationDialog orderId={42} onSubmitted={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));
    expect(await screen.findByText('Policy unavailable')).toBeInTheDocument();
  });

  it('blocks submission when the quote cannot be loaded', async () => {
    getCancellationQuote.mockRejectedValue(new Error('We could not load the cancellation estimate. Please try again.'));
    render(<CustomerCancellationDialog orderId={42} onSubmitted={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /request cancellation/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not load the cancellation estimate. Please try again.');
    expect(screen.getByRole('button', { name: /submit request/i })).toBeDisabled();
  });
});
