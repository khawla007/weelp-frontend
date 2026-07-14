'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

import CheckoutResultState, { ResultActionButton, ResultActionLink } from '@/app/components/Pages/FRONT_END/checkout/CheckoutResultState';
import { useBookingData } from '@/hooks/api/public/checkout';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { formatCurrency } from '@/lib/utils';

const VALID_SESSION_ID = /^cs_[A-Za-z0-9_]+$/;

function statusContent(status) {
  if (status === 'pending' || status === 'processing') {
    return { title: 'Payment is still processing', description: 'Payment confirmation can take a moment. Keep this page open or check the status again.', tone: 'warning' };
  }
  if (status === 'cancelled' || status === 'canceled') {
    return { title: 'Payment was cancelled', description: 'Your booking has not been confirmed. You can safely return to checkout and try again.', tone: 'warning' };
  }
  if (status === 'refunded') {
    return { title: 'Payment was refunded', description: 'This payment is no longer active. Open your bookings for the latest order details.', tone: 'warning' };
  }
  if (status === 'expired') {
    return { title: 'Payment link expired', description: 'The payment window expired before confirmation. Your booking details have been retained.', tone: 'warning' };
  }
  return { title: 'Payment was not completed', description: 'We could not confirm a completed payment for this booking. Your booking details have been retained.', tone: 'danger' };
}

function errorContent(error) {
  const status = error?.response?.status;
  if (status === 401) {
    return { title: 'Sign in to view this payment', description: 'Your session may have expired. Sign in again, then reopen the confirmation from your bookings.' };
  }
  if (status === 404) {
    return { title: 'Payment confirmation not found', description: 'This confirmation is unavailable or does not belong to the signed-in account.' };
  }
  return { title: 'We could not check the payment', description: 'A temporary connection problem prevented verification. Try checking again.' };
}

function BookingDetails({ result }) {
  const { item_detail: item = {}, order = {} } = result?.data ?? {};
  const payment = order?.payment ?? {};
  const amount = Number.parseFloat(payment.amount);
  const price = Number.isFinite(amount) ? formatCurrency(amount, payment.currency || 'USD') : null;
  const rows = [
    ['Booking reference', order.id ? `#${order.id}` : null],
    ['Item', item.item_name],
    ['Amount paid', price],
    ['Travel date', order.travel_date],
    ['Preferred time', order.preferred_time],
    ['Adults', order.number_of_adults],
    ['Children', order.number_of_children],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');

  return (
    <dl className="grid min-w-0 gap-3 rounded-xl border bg-background p-4 sm:grid-cols-2 sm:p-5">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0 border-b pb-3 last:border-b-0 sm:border-b-0 sm:pb-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function PaymentSuccessClient({ sessionId }) {
  const validSessionId = typeof sessionId === 'string' && VALID_SESSION_ID.test(sessionId) ? sessionId : null;
  const { clearCart } = useMiniCartStore();
  const { data: session } = useSession();
  const { bookingData, loading, error, refresh } = useBookingData(validSessionId);
  const cleanedSessionId = useRef(null);
  const paymentStatus = bookingData?.data?.order?.payment?.payment_status?.toLowerCase();
  const isPaid = bookingData?.success === true && paymentStatus === 'paid';

  useEffect(() => {
    if (isPaid && cleanedSessionId.current !== validSessionId) {
      clearCart();
      cleanedSessionId.current = validSessionId;
    }
  }, [clearCart, isPaid, validSessionId]);

  const recoveryActions = (
    <>
      <ResultActionLink href="/checkout" emphasis="primary">
        Return to checkout
      </ResultActionLink>
      <ResultActionLink href="/booking">Review booking</ResultActionLink>
    </>
  );

  if (!validSessionId) {
    return (
      <CheckoutResultState
        title="Unable to verify this payment"
        description="This confirmation link is missing or invalid. No booking or payment state has been changed."
        tone="warning"
        actions={recoveryActions}
      />
    );
  }

  if (loading) {
    return <CheckoutResultState title="Checking your payment" description="Please wait while we securely verify the latest payment status." />;
  }

  if (error || !bookingData) {
    const content = errorContent(error);
    return (
      <CheckoutResultState
        {...content}
        tone="danger"
        actions={
          <>
            <ResultActionButton onClick={() => refresh?.()}>Try again</ResultActionButton>
            <ResultActionLink href="/booking">Review booking</ResultActionLink>
          </>
        }
      />
    );
  }

  if (!isPaid) {
    const content = statusContent(paymentStatus);
    const isPending = paymentStatus === 'pending' || paymentStatus === 'processing';
    return (
      <CheckoutResultState
        {...content}
        actions={
          <>
            {isPending ? <ResultActionButton onClick={() => refresh?.()}>Check payment status</ResultActionButton> : null}
            {recoveryActions}
          </>
        }
      />
    );
  }

  const dashboardUrl = session?.user?.role === 'admin' || session?.user?.role === 'super_admin' ? '/dashboard/admin' : '/dashboard/customer';
  return (
    <CheckoutResultState
      title="Booking confirmed"
      description="Your payment has been verified and the booking is now available in your account."
      tone="success"
      actions={
        <>
          <ResultActionLink href={dashboardUrl} emphasis="primary">
            View bookings
          </ResultActionLink>
          <ResultActionLink href="/">Back to home</ResultActionLink>
        </>
      }
    >
      <BookingDetails result={bookingData} />
    </CheckoutResultState>
  );
}
