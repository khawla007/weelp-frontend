import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useToast } from '@/hooks/use-toast';
import { approveCancellationRequest, rejectCancellationRequest, retryCancellationRequest } from '@/lib/actions/orders';

import AdminCancellationPanel from '../AdminCancellationPanel';

jest.mock('@/hooks/use-toast', () => ({ useToast: jest.fn() }));
jest.mock('@/lib/actions/orders', () => ({
  approveCancellationRequest: jest.fn(),
  rejectCancellationRequest: jest.fn(),
  retryCancellationRequest: jest.fn(),
}));

const cancellation = (overrides = {}) => ({
  id: 9,
  status: 'pending',
  reason: 'Our family travel dates changed and we cannot attend.',
  requested_at: '2026-08-12T07:00:00.000Z',
  policy_version: 'general-v1',
  travel_starts_at: '2026-08-20T09:30:00.000Z',
  seconds_remaining: 692_000,
  currency: 'USD',
  deduction_percentage: 50,
  paid_amount: '200.00',
  suggested_deduction: '100.00',
  suggested_refund: '100.00',
  final_refund: null,
  final_deduction: null,
  decision_explanation: null,
  decided_at: null,
  refund_completed_at: null,
  refund_outcome: null,
  can_retry: false,
  can_reject: true,
  failure_code: null,
  failure_summary: null,
  ...overrides,
});

const deferred = () => {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe('AdminCancellationPanel', () => {
  let toast;

  beforeEach(() => {
    jest.clearAllMocks();
    toast = jest.fn();
    useToast.mockReturnValue({ toast });
  });

  it('shows the full safe request context and defaults the final refund to the suggestion', () => {
    render(<AdminCancellationPanel cancellation={cancellation()} requester={{ name: 'Customer Name', email: 'customer@example.test' }} />);

    ['Customer Name', 'customer@example.test', 'Our family travel dates changed and we cannot attend.', 'general-v1', '50% deduction', '$200.00', '8 days, 0 hours'].forEach((text) =>
      expect(screen.getByText(text)).toBeInTheDocument(),
    );
    expect(screen.getAllByText('$100.00')).toHaveLength(2);
    expect(screen.getByLabelText('Final refund amount')).toHaveValue('100.00');
    expect(screen.queryByText(/stripe/i)).not.toBeInTheDocument();
  });

  it.each([
    ['-1', 'Refund must be zero or greater.'],
    ['200.01', 'Refund cannot exceed the paid amount of $200.00.'],
    ['not-money', 'Enter a valid refund amount with no more than two decimal places.'],
  ])('rejects invalid final refund %s before opening confirmation', (amount, message) => {
    render(<AdminCancellationPanel cancellation={cancellation()} />);
    fireEvent.change(screen.getByLabelText('Final refund amount'), { target: { value: amount } });
    fireEvent.click(screen.getByRole('button', { name: 'Review approval' }));

    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(approveCancellationRequest).not.toHaveBeenCalled();
  });

  it('requires an explanation when the amount differs from the suggestion', () => {
    render(<AdminCancellationPanel cancellation={cancellation()} />);
    fireEvent.change(screen.getByLabelText('Final refund amount'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review approval' }));

    expect(screen.getByText('Explain why the final refund differs from the policy suggestion.')).toBeInTheDocument();
  });

  it.each(['0', '200.00'])('accepts boundary refund %s when an adjusted explanation is supplied', async (amount) => {
    approveCancellationRequest.mockResolvedValue({ success: true, message: 'Approved.', cancellation: cancellation({ status: 'approved' }) });
    render(<AdminCancellationPanel cancellation={cancellation()} />);
    fireEvent.change(screen.getByLabelText('Final refund amount'), { target: { value: amount } });
    fireEvent.change(screen.getByLabelText('Customer-facing explanation'), { target: { value: 'Reviewed against the supplier terms.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review approval' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Approve cancellation' }));

    await waitFor(() => expect(approveCancellationRequest).toHaveBeenCalledWith(9, amount, 'Reviewed against the supplier terms.'));
  });

  it('requires a customer-facing explanation before rejection', () => {
    render(<AdminCancellationPanel cancellation={cancellation()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Decline request' }));

    expect(screen.getByText('Enter an explanation for the customer.')).toBeInTheDocument();
    expect(rejectCancellationRequest).not.toHaveBeenCalled();
  });

  it('confirms the final refund and deduction before approving', async () => {
    approveCancellationRequest.mockResolvedValue({ success: true, message: 'Approved.', cancellation: cancellation({ status: 'approved' }) });
    const onResolved = jest.fn();
    render(<AdminCancellationPanel cancellation={cancellation()} onResolved={onResolved} />);

    fireEvent.click(screen.getByRole('button', { name: 'Review approval' }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Refund $100.00 and deduct $100.00.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Approve cancellation' }));

    await waitFor(() => expect(approveCancellationRequest).toHaveBeenCalledWith(9, '100.00', ''));
    expect(onResolved).toHaveBeenCalledWith(expect.objectContaining({ status: 'approved' }));
    expect(toast).toHaveBeenCalledWith({ title: 'Approved.' });
  });

  it('uses a synchronous lock to prevent duplicate approval actions', async () => {
    const request = deferred();
    approveCancellationRequest.mockReturnValue(request.promise);
    render(<AdminCancellationPanel cancellation={cancellation()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Review approval' }));
    const approve = await screen.findByRole('button', { name: 'Approve cancellation' });
    fireEvent.click(approve);
    fireEvent.click(approve);
    expect(approveCancellationRequest).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Approving…' })).toBeDisabled();

    await act(async () => request.resolve({ success: false, message: 'Provider unavailable.' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Review approval' })).toBeEnabled());
    expect(screen.getByLabelText('Final refund amount')).toHaveValue('100.00');
  });

  it('rejects successfully, sends the trimmed explanation, and refreshes through the callback', async () => {
    rejectCancellationRequest.mockResolvedValue({ success: true, message: 'Declined.', cancellation: cancellation({ status: 'rejected' }) });
    const onResolved = jest.fn();
    render(<AdminCancellationPanel cancellation={cancellation()} onResolved={onResolved} />);
    fireEvent.change(screen.getByLabelText('Customer-facing explanation'), { target: { value: '  Supplier terms do not allow this refund.  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Decline request' }));

    await waitFor(() => expect(rejectCancellationRequest).toHaveBeenCalledWith(9, 'Supplier terms do not allow this refund.'));
    expect(onResolved).toHaveBeenCalledWith(expect.objectContaining({ status: 'rejected' }));
  });

  it.each([
    ['definitive failure', { failure_code: 'card_declined', failure_summary: 'The provider declined the refund.', can_retry: true, can_reject: true }, true],
    ['indeterminate failure', { failure_code: 'provider_timeout', failure_summary: 'The refund result is uncertain.', can_retry: true, can_reject: false }, false],
  ])('renders retry controls and correct rejection availability for %s', async (_label, overrides, canReject) => {
    retryCancellationRequest.mockResolvedValue({ success: true, message: 'Retried.', cancellation: cancellation({ status: 'approved' }) });
    const onResolved = jest.fn();
    render(<AdminCancellationPanel cancellation={cancellation({ status: 'refund_failed', final_refund: '100.00', ...overrides })} onResolved={onResolved} />);

    expect(screen.getByText(overrides.failure_summary)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry refund' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Decline request' }) !== null).toBe(canReject);
    fireEvent.click(screen.getByRole('button', { name: 'Retry refund' }));
    await waitFor(() => expect(retryCancellationRequest).toHaveBeenCalledWith(9));
    expect(onResolved).toHaveBeenCalled();
  });

  it.each([
    ['recent processing', false, false],
    ['stale processing', true, true],
  ])('honors server retry capability for %s', (_label, canRetry, hasButton) => {
    render(<AdminCancellationPanel cancellation={cancellation({ status: 'refund_processing', final_refund: '100.00', can_retry: canRetry, can_reject: false })} />);
    expect(screen.queryByRole('button', { name: 'Retry refund' }) !== null).toBe(hasButton);
    expect(screen.getByText(canRetry ? 'The refund can now be retried safely.' : 'Refund processing is in progress. Decision actions are temporarily disabled.')).toBeInTheDocument();
  });

  it('shows a destructive toast and preserves the pending controls after an action failure', async () => {
    approveCancellationRequest.mockResolvedValue({ success: false, message: 'The request changed. Refresh and try again.' });
    const onResolved = jest.fn();
    render(<AdminCancellationPanel cancellation={cancellation()} onResolved={onResolved} />);

    fireEvent.click(screen.getByRole('button', { name: 'Review approval' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Approve cancellation' }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith({ title: 'The request changed. Refresh and try again.', variant: 'destructive' }));
    expect(onResolved).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Review approval' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Decline request' })).toBeEnabled();
  });
});
