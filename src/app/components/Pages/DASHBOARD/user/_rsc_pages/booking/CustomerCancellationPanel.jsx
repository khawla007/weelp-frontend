import { formatCurrency } from '@/lib/utils';

function money(amount, currency) {
  if (amount === null || amount === undefined) return 'Not provided';
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return 'Not provided';
  try {
    return formatCurrency(numericAmount, currency);
  } catch {
    return 'Not provided';
  }
}

function date(value) {
  if (!value) return 'Not provided';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not provided';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
}

function policyBand(value) {
  const percentage = Number(value);
  return Number.isFinite(percentage) && percentage >= 0 && percentage <= 100 ? `${percentage}% deduction` : 'Policy unavailable';
}

function statusCopy(cancellation) {
  switch (cancellation.status) {
    case 'pending':
      return ['Cancellation requested', 'Awaiting admin review'];
    case 'refund_processing':
      return ['Cancellation requested', 'Your refund is being processed. The booking remains unchanged until processing finishes.'];
    case 'refund_failed':
      return cancellation.can_reject
        ? ['Refund needs attention', 'The refund could not be completed. An administrator can retry or decline the request.']
        : ['Refund status is being checked', 'The refund result is being checked. An administrator must retry or reconcile it before making another decision.'];
    case 'rejected':
      return ['Request declined', 'Your booking remains active.'];
    case 'approved':
      if (cancellation.refund_outcome === 'full') return ['Cancellation approved', 'Full refund approved'];
      if (cancellation.refund_outcome === 'partial') return ['Cancellation approved', 'Partial refund approved'];
      return ['Cancellation approved', 'Approved with no refund'];
    default:
      return ['Cancellation update', 'Contact support if you need help with this request.'];
  }
}

function Field({ label, children }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default function CustomerCancellationPanel({ cancellation }) {
  const [title, message] = statusCopy(cancellation);
  const resolved = cancellation.status === 'approved' || cancellation.status === 'rejected';

  return (
    <section className="min-w-0 rounded-md border border-weelp-sage-deep/30 bg-weelp-sage-wash p-4 sm:p-5" aria-labelledby="customer-cancellation-title">
      <div className="min-w-0">
        <h2 id="customer-cancellation-title" className="break-words text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1 break-words text-sm text-muted-foreground">{message}</p>
      </div>

      <dl className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Requested">{date(cancellation.requested_at)}</Field>
        <Field label="Reason">{cancellation.reason || 'Not provided'}</Field>
        <Field label="Paid amount">{money(cancellation.paid_amount, cancellation.currency)}</Field>
        <Field label="Policy estimate">{money(cancellation.suggested_refund, cancellation.currency)}</Field>
        <Field label="Estimated deduction">{money(cancellation.suggested_deduction, cancellation.currency)}</Field>
        <Field label="Policy band">{policyBand(cancellation.deduction_percentage)}</Field>
        {resolved ? <Field label="Decision date">{date(cancellation.decided_at)}</Field> : null}
        {cancellation.status === 'approved' ? <Field label="Final refund">{money(cancellation.final_refund, cancellation.currency)}</Field> : null}
        {cancellation.status === 'approved' ? <Field label="Final deduction">{money(cancellation.final_deduction, cancellation.currency)}</Field> : null}
        {resolved ? <Field label="Decision explanation">{cancellation.decision_explanation || 'Not provided'}</Field> : null}
      </dl>
    </section>
  );
}
