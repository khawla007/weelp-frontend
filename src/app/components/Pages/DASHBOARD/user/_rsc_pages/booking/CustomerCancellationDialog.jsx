'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { createCancellationRequest, getCancellationQuote } from '@/lib/services/customer/cancellations';

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 1000;

function money(amount, currency) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return 'Unavailable';
  try {
    return formatCurrency(numericAmount, currency);
  } catch {
    return 'Unavailable';
  }
}

function timeRemaining(seconds) {
  if (!Number.isFinite(Number(seconds))) return 'Unavailable';
  const totalHours = Math.max(0, Math.floor(Number(seconds) / 3600));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return days > 0 ? `${days} days${hours ? `, ${hours} hours` : ''}` : `${hours} hours`;
}

function travelStarts(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unavailable';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
}

function policyBand(value) {
  const percentage = Number(value);
  return Number.isFinite(percentage) && percentage >= 0 && percentage <= 100 ? `${percentage}% deduction` : 'Policy unavailable';
}

function quoteRows(quote, bookingName) {
  return [
    ['Booking', bookingName],
    ['Paid amount', money(quote.paid_amount, quote.currency)],
    ['Policy band', policyBand(quote.deduction_percentage)],
    ['Estimated deduction', money(quote.suggested_deduction, quote.currency)],
    ['Estimated refund', money(quote.suggested_refund, quote.currency)],
    ['Travel starts', travelStarts(quote.travel_starts_at)],
    ['Time remaining', timeRemaining(quote.seconds_remaining)],
  ];
}

export default function CustomerCancellationDialog({ orderId, bookingName, onSubmitted, onStateChanged, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [reason, setReason] = useState('');
  const [reasonTouched, setReasonTouched] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const trimmedReason = reason.trim();
  const reasonTooShort = trimmedReason.length < MIN_REASON_LENGTH;
  const reasonTooLong = trimmedReason.length > MAX_REASON_LENGTH;
  const displayBookingName = typeof bookingName === 'string' && bookingName.trim() ? bookingName.trim() : `Booking #${orderId}`;

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    getCancellationQuote(orderId)
      .then((nextQuote) => {
        if (active) setQuote(nextQuote);
      })
      .catch((error) => {
        if (active) setQuoteError(error.message);
      });

    return () => {
      active = false;
    };
  }, [open, orderId]);

  const handleOpenChange = (nextOpen) => {
    if (submittingRef.current && !nextOpen) return;
    setOpen(nextOpen);
    if (nextOpen) {
      setQuote(null);
      setQuoteError('');
      setSubmitError('');
      setReasonTouched(false);
    } else {
      setReason('');
      setReasonTouched(false);
      setSubmitError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setReasonTouched(true);
    if (!quote || reasonTooShort || reasonTooLong || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError('');
    let cancellation;
    try {
      cancellation = await createCancellationRequest(orderId, trimmedReason);
    } catch (error) {
      setSubmitError(error.message);
      submittingRef.current = false;
      setSubmitting(false);
      if (error.status === 409) {
        await Promise.resolve();
        await Promise.resolve(onStateChanged?.()).catch(() => undefined);
      }
      return;
    }

    submittingRef.current = false;
    setSubmitting(false);
    setOpen(false);
    setReason('');
    setReasonTouched(false);
    setSubmitError('');
    await Promise.resolve();
    await Promise.resolve(onSubmitted?.(cancellation)).catch(() => undefined);
  };

  const reasonError = reasonTooLong
    ? `Reason must be no more than ${MAX_REASON_LENGTH} characters.`
    : reasonTouched && reasonTooShort
      ? `Reason must be at least ${MIN_REASON_LENGTH} characters.`
      : '';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className={triggerClassName}>
          Request cancellation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby="cancellation-estimate-notice">
        <DialogHeader>
          <DialogTitle>Request cancellation</DialogTitle>
          <DialogDescription>Review the estimate and tell us why you need to cancel.</DialogDescription>
        </DialogHeader>

        {!quote && !quoteError ? <p className="text-sm text-muted-foreground">Loading cancellation estimate…</p> : null}
        {quoteError ? (
          <p role="alert" className="break-words text-sm text-destructive">
            {quoteError}
          </p>
        ) : null}
        {quote ? (
          <dl className="grid min-w-0 grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2">
            {quoteRows(quote, displayBookingName).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="break-words text-sm font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">Reason for cancellation</Label>
            <Textarea
              id="cancellation-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              onBlur={() => setReasonTouched(true)}
              disabled={submitting}
              aria-invalid={Boolean(reasonError)}
              aria-describedby={reasonError ? 'cancellation-reason-error cancellation-estimate-notice' : 'cancellation-estimate-notice'}
              placeholder="Describe why your plans changed"
              className="min-h-28"
            />
            <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
              <p id="cancellation-reason-error" className="break-words text-destructive">
                {reasonError}
              </p>
              <span className="shrink-0">
                {trimmedReason.length}/{MAX_REASON_LENGTH}
              </span>
            </div>
          </div>

          <p id="cancellation-estimate-notice" className="break-words text-sm text-muted-foreground">
            This estimate is not a guarantee. An administrator will review your request and choose the final refund amount.
          </p>

          {submitError ? (
            <p role="alert" className="break-words text-sm text-destructive">
              {submitError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={!quote || reasonTooShort || reasonTooLong || submitting}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
