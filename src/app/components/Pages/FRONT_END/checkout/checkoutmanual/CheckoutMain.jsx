'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useTheme } from 'next-themes';
import { getStripe } from '@/lib/stripe/stripe';
import CheckoutForm from './CheckoutForm';
import { useSession } from 'next-auth/react';
import { CheckoutItems, CheckoutUserDetailCard, CheckoutUserDetailCardSkeleton, CheckoutItemsSkeleton } from '../CheckoutCards';
import { AlertTriangle } from 'lucide-react';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { useUserProfile } from '@/hooks/api/customer/profile';
import { useNavigationStore } from '@/lib/store/useNavigationStore';
import { buildCheckoutSelection } from '@/lib/checkout/selection';
import axios from 'axios';
const stripePromise = getStripe(); // import stripe promise

export default function CheckoutMainManual() {
  const { data: session } = useSession(); // session retrieve
  const { resolvedTheme } = useTheme();
  const { cartItems = [] } = useMiniCartStore(); // store items
  const { user, isLoading: isUserLoading } = useUserProfile(); // client side fetch user
  const item = cartItems.at(0) || {}; // item destructure
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntent, setPaymentIntent] = useState('');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initRef = useRef(false); // prevent double-mount PI creation

  // initialize paymnet
  const initializePaymentIntent = async () => {
    try {
      const selection = buildCheckoutSelection(item);
      const res = await axios.post('/api/payments/create-intent', selection);

      const data = await res?.data;

      if (data?.success && data?.clientSecret && data?.paymentIntent && data?.quote) {
        setClientSecret(data.clientSecret);
        setPaymentIntent(data.paymentIntent);
        setQuote(data.quote);
      } else {
        setError(data?.error || 'Checkout could not be prepared. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Checkout could not be prepared. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // on mount create fresh payment intent (guarded against React StrictMode double-mount)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Always clear stale cached secrets to avoid expired token issues
    sessionStorage.removeItem('clientSecret');
    sessionStorage.removeItem('paymentIntent');
    initializePaymentIntent();
  }, []);

  // Drive top progress bar while checkout is preparing (payment intent + user profile)
  const isPreparing = loading || isUserLoading || !user;
  const setNavigating = useNavigationStore((s) => s.setNavigating);
  useEffect(() => {
    setNavigating(isPreparing);
    return () => setNavigating(false);
  }, [isPreparing, setNavigating]);

  const stripeOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: resolvedTheme === 'dark' ? 'night' : 'stripe',
        variables: {
          colorPrimary: '#588f7a',
          borderRadius: '8px',
        },
      },
    }),
    [clientSecret, resolvedTheme],
  );

  if (isPreparing) {
    return (
      <section className="flex flex-col-reverse xl:flex-row" aria-busy="true">
        <div className="w-full p-6 pt-10 pb-24 xl:w-3/5 max-w-3xl mx:auto xl:ml-auto xl:mr-28 space-y-4">
          <div className="flex flex-col border rounded-xl">
            <div className="font-semibold text-lg text-Blueish p-4 border-b">
              <div className="weelp-shimmer h-5 w-40 rounded" aria-hidden="true" />
            </div>
            <CheckoutUserDetailCardSkeleton />
            <div className="p-4 flex flex-col gap-4" aria-hidden="true">
              <div className="weelp-shimmer h-6 w-44 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="weelp-shimmer h-10 rounded" />
                <div className="weelp-shimmer h-10 rounded" />
                <div className="weelp-shimmer h-10 rounded sm:col-span-2" />
                <div className="weelp-shimmer h-10 rounded" />
                <div className="weelp-shimmer h-10 rounded" />
                <div className="weelp-shimmer h-24 rounded sm:col-span-2" />
              </div>
              <div className="weelp-shimmer h-32 rounded mt-2" />
              <div className="weelp-shimmer h-11 rounded mt-2" />
            </div>
          </div>
        </div>
        <div className="w-full p-6 pt-10 pb-24 xl:w-2/5 xl:ps-20 bg-muted">
          <CheckoutItemsSkeleton />
        </div>
      </section>
    );
  }

  //  Show error
  if (error) {
    return (
      <section className="flex items-center justify-center min-h-[60vh] px-6">
        <div
          role="alert"
          className="max-w-md w-full rounded-xl border border-weelp-discount bg-background p-6 flex flex-col gap-3 transition-[opacity,border-color] duration-[220ms] ease-[var(--weelp-ease-out)] motion-reduce:transition-none animate-fade-in"
        >
          <div className="flex items-center gap-2 text-weelp-discount">
            <AlertTriangle size={20} aria-hidden="true" />
            <h2 className="font-semibold text-base">Checkout couldn&apos;t load</h2>
          </div>
          <p className="text-sm text-foreground">{error}</p>
          <button
            type="button"
            onClick={() => location.reload()}
            className="self-start px-4 py-2 bg-weelp-sage-deep hover:bg-weelp-sage-hover text-white text-sm font-medium rounded-md transition-colors duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  //  is the key point: Only render <Elements> once clientSecret is available
  if (!clientSecret) {
    return <div className="text-center text-copy">Something went wrong. Please refresh.</div>;
  }

  return (
    <section className="flex flex-col-reverse xl:flex-row animate-fade-in">
      <div className="w-full p-6 pt-10 pb-24 xl:w-3/5 max-w-3xl mx:auto xl:ml-auto xl:mr-28 space-y-4">
        <div className="flex flex-col border rounded-xl">
          <h2 className="font-semibold text-lg text-Blueish p-4 border-b">Contact Details</h2>

          {/* User Detail Card */}
          <CheckoutUserDetailCard userEmail={session?.user?.email} userName={session?.user?.name} />

          {/* Checkout Fields */}
          <Elements key={`${clientSecret}-${resolvedTheme}`} stripe={stripePromise} options={stripeOptions}>
            <CheckoutForm paymentIntentId={paymentIntent} />
          </Elements>
        </div>
      </div>

      <div className="w-full p-6 pt-10 pb-24 xl:w-2/5 xl:ps-20 bg-muted">
        <CheckoutItems quote={quote} />
      </div>
    </section>
  );
}
