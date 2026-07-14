'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import CheckoutResultState, { ResultActionButton, ResultActionLink } from '@/app/components/Pages/FRONT_END/checkout/CheckoutResultState';
import { useOrderThankyou } from '@/hooks/api/public/order/thankyou';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { formatCurrency } from '@/lib/utils';

const VALID_PAYMENT_INTENT = /^pi_[A-Za-z0-9_]+$/;

function paymentStateContent(status) {
  if (status === 'pending' || status === 'processing') {
    return { title: 'Payment is still processing', description: 'Stripe has not finished confirming this payment. Check again in a moment.', tone: 'warning' };
  }
  if (status === 'cancelled' || status === 'canceled') {
    return { title: 'Payment was cancelled', description: 'Your booking has not been confirmed and your saved booking details remain available.', tone: 'warning' };
  }
  if (status === 'refunded') {
    return { title: 'Payment was refunded', description: 'This payment is no longer active. Open your bookings for the current order details.', tone: 'warning' };
  }
  if (status === 'expired') {
    return { title: 'Payment link expired', description: 'The payment window expired before confirmation. Your saved booking details remain available.', tone: 'warning' };
  }
  return { title: 'Payment was not completed', description: 'We did not receive a completed payment for this booking. Your saved booking details have not been cleared.', tone: 'danger' };
}

function errorContent(error) {
  const status = error?.response?.status;
  if (status === 401) return { title: 'Sign in to view this payment', description: 'Your session may have expired. Sign in again and open the booking from your account.' };
  if (status === 404) return { title: 'Payment confirmation not found', description: 'This payment is unavailable or does not belong to the signed-in account.' };
  return { title: 'We could not check the payment', description: 'A temporary connection problem prevented verification. Your booking details have been retained.' };
}

function PaidOrderDetails({ order }) {
  const item = order?.item ?? {};
  const payment = order?.payment ?? {};
  const amount = Number.parseFloat(payment.amount);
  const currency = payment.currency || 'USD';
  const addons = Array.isArray(order?.addons) ? order.addons : [];
  const rows = [
    ['Booking reference', order?.id ? `#${order.id}` : null],
    ['Item', item.name],
    ['Amount paid', Number.isFinite(amount) ? formatCurrency(amount, currency) : null],
    ['Travel date', order?.travel_date],
    ['Preferred time', order?.preferred_time],
    ['Adults', order?.number_of_adults],
    ['Children', order?.number_of_children],
    [
      'Add-ons',
      addons
        .map((addon) => addon.addon_name)
        .filter(Boolean)
        .join(', '),
    ],
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

function ThankYouContent() {
  const searchParams = useSearchParams();
  const rawPaymentIntent = searchParams.get('payment_intent');
  const paymentIntent = rawPaymentIntent && VALID_PAYMENT_INTENT.test(rawPaymentIntent) ? rawPaymentIntent : null;
  const { clearCart } = useMiniCartStore();
  const { data: session } = useSession();
  const { orderData, isLoading, error, refresh } = useOrderThankyou(paymentIntent);
  const cleanedPaymentIntent = useRef(null);
  const order = orderData?.order;
  const paymentStatus = order?.payment?.payment_status?.toLowerCase();
  const isPaid = orderData?.success === true && paymentStatus === 'paid';

  useEffect(() => {
    if (!isPaid || cleanedPaymentIntent.current === paymentIntent) return;

    clearCart();
    sessionStorage.removeItem('clientSecret');
    sessionStorage.removeItem('paymentIntent');
    cleanedPaymentIntent.current = paymentIntent;
  }, [clearCart, isPaid, paymentIntent]);

  const recoveryActions = (
    <>
      <ResultActionLink href="/checkout" emphasis="primary">
        Return to checkout
      </ResultActionLink>
      <ResultActionLink href="/booking">Review booking</ResultActionLink>
    </>
  );

  if (!paymentIntent) {
    return (
      <CheckoutResultState
        title="Unable to verify this payment"
        description="This confirmation link is missing or invalid. No booking or payment state has been changed."
        tone="warning"
        actions={recoveryActions}
      />
    );
  }

  if (isLoading) {
    return <CheckoutResultState title="Checking your payment" description="Please wait while we securely verify the latest payment status." />;
  }

  if (error || !orderData) {
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
    const content = paymentStateContent(paymentStatus);
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
      <PaidOrderDetails order={order} />
    </CheckoutResultState>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<CheckoutResultState title="Checking your payment" description="Please wait while we securely verify the latest payment status." />}>
      <ThankYouContent />
    </Suspense>
  );
}
