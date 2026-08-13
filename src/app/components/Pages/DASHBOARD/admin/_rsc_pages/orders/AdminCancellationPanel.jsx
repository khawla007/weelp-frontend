'use client';

import { useRef, useState } from 'react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { approveCancellationRequest, rejectCancellationRequest, retryCancellationRequest } from '@/lib/actions/orders';
import { formatCurrency } from '@/lib/utils';

const DECIMAL_PATTERN = /^\d+(?:\.\d{1,2})?$/;

function money(amount, currency) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 'Not provided';
  try {
    return formatCurrency(value, currency);
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

function remaining(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return 'Not provided';
  const hours = Math.max(0, Math.floor(value / 3600));
  return `${Math.floor(hours / 24)} days, ${hours % 24} hours`;
}

function Field({ label, children }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

function validateAmount(value, paidAmount, currency) {
  if (/^-\d/.test(value)) return 'Refund must be zero or greater.';
  if (!DECIMAL_PATTERN.test(value)) return 'Enter a valid refund amount with no more than two decimal places.';
  const amount = Number(value);
  if (amount < 0) return 'Refund must be zero or greater.';
  if (amount > paidAmount) return `Refund cannot exceed the paid amount of ${money(paidAmount, currency)}.`;
  return '';
}

export default function AdminCancellationPanel({ cancellation, requester, onResolved }) {
  const [finalRefund, setFinalRefund] = useState(() => String(cancellation.suggested_refund ?? ''));
  const [explanation, setExplanation] = useState('');
  const [amountError, setAmountError] = useState('');
  const [explanationError, setExplanationError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const actionLock = useRef(false);
  const { toast } = useToast();
  const paidAmount = Number(cancellation.paid_amount);
  const suggestedRefund = Number(cancellation.suggested_refund);
  const normalizedAmount = finalRefund.trim();
  const finalAmount = Number(normalizedAmount);
  const adjusted = Number.isFinite(finalAmount) && Number.isFinite(suggestedRefund) && finalAmount !== suggestedRefund;
  const finalDeduction = Number.isFinite(paidAmount) && Number.isFinite(finalAmount) ? Math.max(0, paidAmount - finalAmount) : 0;
  const pending = cancellation.status === 'pending';
  const processing = cancellation.status === 'refund_processing';
  const failed = cancellation.status === 'refund_failed';

  const finish = async (result) => {
    if (!result.success) {
      toast({ title: result.message || 'Cancellation action failed.', variant: 'destructive' });
      return;
    }
    toast({ title: result.message || 'Cancellation request updated.' });
    await Promise.resolve(onResolved?.(result.cancellation)).catch(() => undefined);
  };

  const run = async (action, operation) => {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusyAction(action);
    try {
      await finish(await operation());
    } catch {
      toast({ title: 'Cancellation action failed.', variant: 'destructive' });
    } finally {
      actionLock.current = false;
      setBusyAction('');
    }
  };

  const reviewApproval = () => {
    const nextAmountError = validateAmount(normalizedAmount, paidAmount, cancellation.currency);
    const nextExplanationError = adjusted && !explanation.trim() ? 'Explain why the final refund differs from the policy suggestion.' : '';
    setAmountError(nextAmountError);
    setExplanationError(nextExplanationError);
    if (!nextAmountError && !nextExplanationError) setConfirming(true);
  };

  const reject = () => {
    if (!explanation.trim()) {
      setExplanationError('Enter an explanation for the customer.');
      return;
    }
    setExplanationError('');
    void run('reject', () => rejectCancellationRequest(cancellation.id, explanation.trim()));
  };

  return (
    <section className="min-w-0 rounded-lg border border-amber-300/70 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20 sm:p-5" aria-labelledby="admin-cancellation-title">
      <div className="min-w-0">
        <h2 id="admin-cancellation-title" className="break-words text-base font-semibold text-foreground">
          Customer cancellation request
        </h2>
        <p className="mt-1 break-words text-sm capitalize text-muted-foreground">Status: {cancellation.status.replaceAll('_', ' ')}</p>
      </div>

      <dl className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Requester">{requester?.name || 'Not provided'}</Field>
        <Field label="Requester email">{requester?.email || 'Not provided'}</Field>
        <Field label="Requested">{date(cancellation.requested_at)}</Field>
        <Field label="Customer reason">{cancellation.reason || 'Not provided'}</Field>
        <Field label="Travel starts">{date(cancellation.travel_starts_at)}</Field>
        <Field label="Time remaining at request">{remaining(cancellation.seconds_remaining)}</Field>
        <Field label="Paid amount">{money(cancellation.paid_amount, cancellation.currency)}</Field>
        <Field label="Policy version">{cancellation.policy_version || 'Not provided'}</Field>
        <Field label="Policy band">{`${cancellation.deduction_percentage}% deduction`}</Field>
        <Field label="Suggested deduction">{money(cancellation.suggested_deduction, cancellation.currency)}</Field>
        <Field label="Suggested refund">{money(cancellation.suggested_refund, cancellation.currency)}</Field>
        {cancellation.final_refund !== null ? <Field label="Final refund">{money(cancellation.final_refund, cancellation.currency)}</Field> : null}
        {cancellation.final_deduction !== null ? <Field label="Final deduction">{money(cancellation.final_deduction, cancellation.currency)}</Field> : null}
        {cancellation.refund_outcome ? <Field label="Refund outcome">{cancellation.refund_outcome}</Field> : null}
        {cancellation.decision_explanation ? <Field label="Decision explanation">{cancellation.decision_explanation}</Field> : null}
        {cancellation.decided_at ? <Field label="Decision date">{date(cancellation.decided_at)}</Field> : null}
        {cancellation.refund_completed_at ? <Field label="Refund completed">{date(cancellation.refund_completed_at)}</Field> : null}
        {cancellation.failure_code ? <Field label="Failure code">{cancellation.failure_code}</Field> : null}
        {cancellation.failure_summary ? <Field label="Refund failure">{cancellation.failure_summary}</Field> : null}
      </dl>

      {pending ? (
        <div className="mt-5 space-y-4 border-t border-amber-300/60 pt-4 dark:border-amber-900">
          <div className="space-y-2">
            <Label htmlFor={`final-refund-${cancellation.id}`}>Final refund amount</Label>
            <Input
              id={`final-refund-${cancellation.id}`}
              inputMode="decimal"
              value={finalRefund}
              onChange={(event) => setFinalRefund(event.target.value)}
              disabled={Boolean(busyAction)}
              aria-invalid={Boolean(amountError)}
              aria-describedby={amountError ? `refund-error-${cancellation.id}` : undefined}
            />
            {amountError ? (
              <p id={`refund-error-${cancellation.id}`} className="text-sm text-destructive">
                {amountError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`decision-explanation-${cancellation.id}`}>Customer-facing explanation</Label>
            <Textarea
              id={`decision-explanation-${cancellation.id}`}
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              disabled={Boolean(busyAction)}
              maxLength={1000}
              aria-invalid={Boolean(explanationError)}
              aria-describedby={explanationError ? `explanation-error-${cancellation.id}` : undefined}
            />
            {explanationError ? (
              <p id={`explanation-error-${cancellation.id}`} className="text-sm text-destructive">
                {explanationError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={reviewApproval} disabled={Boolean(busyAction)}>
              Review approval
            </Button>
            {cancellation.can_reject ? (
              <Button type="button" variant="outline" onClick={reject} disabled={Boolean(busyAction)}>
                {busyAction === 'reject' ? 'Declining…' : 'Decline request'}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {failed || processing ? (
        <div className="mt-5 space-y-3 border-t border-amber-300/60 pt-4 dark:border-amber-900">
          <p className="break-words text-sm text-muted-foreground">
            {cancellation.can_retry ? 'The refund can now be retried safely.' : 'Refund processing is in progress. Decision actions are temporarily disabled.'}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {cancellation.can_retry ? (
              <Button type="button" onClick={() => void run('retry', () => retryCancellationRequest(cancellation.id))} disabled={Boolean(busyAction)}>
                {busyAction === 'retry' ? 'Retrying…' : 'Retry refund'}
              </Button>
            ) : null}
            {failed && cancellation.can_reject ? (
              <>
                <div className="w-full space-y-2">
                  <Label htmlFor={`decision-explanation-${cancellation.id}`}>Customer-facing explanation</Label>
                  <Textarea
                    id={`decision-explanation-${cancellation.id}`}
                    value={explanation}
                    onChange={(event) => setExplanation(event.target.value)}
                    disabled={Boolean(busyAction)}
                    maxLength={1000}
                    aria-invalid={Boolean(explanationError)}
                    aria-describedby={explanationError ? `explanation-error-${cancellation.id}` : undefined}
                  />
                  {explanationError ? (
                    <p id={`explanation-error-${cancellation.id}`} className="text-sm text-destructive">
                      {explanationError}
                    </p>
                  ) : null}
                </div>
                <Button type="button" variant="outline" onClick={reject} disabled={Boolean(busyAction)}>
                  {busyAction === 'reject' ? 'Declining…' : 'Decline request'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <AlertDialog open={confirming} onOpenChange={(open) => !actionLock.current && setConfirming(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve cancellation?</AlertDialogTitle>
            <AlertDialogDescription>
              Refund {money(finalAmount, cancellation.currency)} and deduct {money(finalDeduction, cancellation.currency)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(busyAction)}>Go back</AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(busyAction)}
              onClick={(event) => {
                event.preventDefault();
                void run('approve', () => approveCancellationRequest(cancellation.id, normalizedAmount, explanation.trim())).then(() => setConfirming(false));
              }}
            >
              {busyAction === 'approve' ? 'Approving…' : 'Approve cancellation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
