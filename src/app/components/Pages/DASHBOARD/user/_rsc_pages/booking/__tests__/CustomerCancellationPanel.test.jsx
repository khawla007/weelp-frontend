import { render, screen, within } from '@testing-library/react';

import CustomerCancellationPanel from '../CustomerCancellationPanel';

const baseCancellation = {
  status: 'pending',
  reason: 'Our dates no longer work.',
  requested_at: '2026-08-12T13:00:00Z',
  currency: 'USD',
  paid_amount: '100.00',
  deduction_percentage: 25,
  suggested_deduction: '25.00',
  suggested_refund: '75.00',
  final_refund: null,
  final_deduction: null,
  decision_explanation: null,
  decided_at: null,
  refund_outcome: null,
  can_retry: false,
  can_reject: false,
};

function renderPanel(overrides = {}) {
  return render(<CustomerCancellationPanel cancellation={{ ...baseCancellation, ...overrides }} />);
}

describe('CustomerCancellationPanel', () => {
  it('shows the pending request snapshot with wrapping', () => {
    const longReason = `Travel plans changed. ${'unbroken'.repeat(30)}`;
    renderPanel({ reason: longReason });

    expect(screen.getByRole('heading', { name: /cancellation requested/i })).toBeInTheDocument();
    expect(screen.getByText(/awaiting admin review/i)).toBeInTheDocument();
    expect(screen.getByText(longReason)).toHaveClass('whitespace-pre-wrap', 'break-words');
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });

  it('shows refund processing without implying success', () => {
    renderPanel({ status: 'refund_processing' });
    expect(screen.getByText(/refund is being processed/i)).toBeInTheDocument();
    expect(screen.queryByText(/refund approved/i)).not.toBeInTheDocument();
  });

  it('uses safe copy for an invalid policy percentage', () => {
    renderPanel({ deduction_percentage: Number.NaN });
    expect(screen.getByText('Policy unavailable')).toBeInTheDocument();
  });

  it.each([
    [true, /refund could not be completed.*administrator can retry or decline/i],
    [false, /refund result is being checked.*administrator must retry or reconcile/i],
  ])('distinguishes definitive and indeterminate refund failures', (canReject, message) => {
    renderPanel({ status: 'refund_failed', refund_outcome: 'failed', can_retry: true, can_reject: canReject });
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('shows a declined request and the customer-facing explanation', () => {
    renderPanel({ status: 'rejected', decision_explanation: 'The booking is outside the refundable window.', decided_at: '2026-08-13T13:00:00Z' });
    expect(screen.getByText(/request declined/i)).toBeInTheDocument();
    expect(screen.getByText('The booking is outside the refundable window.')).toBeInTheDocument();
  });

  it.each([
    ['no_refund', '0.00', '100.00', /approved with no refund/i],
    ['partial', '70.00', '30.00', /partial refund approved/i],
    ['full', '100.00', '0.00', /full refund approved/i],
  ])('shows approved %s outcomes accurately', (refundOutcome, finalRefund, finalDeduction, message) => {
    renderPanel({
      status: 'approved',
      refund_outcome: refundOutcome,
      final_refund: finalRefund,
      final_deduction: finalDeduction,
      decision_explanation: 'Reviewed against the cancellation policy.',
      decided_at: '2026-08-13T13:00:00Z',
    });
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(within(screen.getByText('Final refund').closest('div')).getByText(`$${finalRefund}`)).toBeInTheDocument();
    expect(within(screen.getByText('Final deduction').closest('div')).getByText(`$${finalDeduction}`)).toBeInTheDocument();
  });
});
