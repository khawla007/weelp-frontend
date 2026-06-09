'use client';

import { useEffect, useRef, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/stripe';
import CheckoutForm from './CheckoutForm';
import { useSession } from 'next-auth/react';
import { CheckoutItems, CheckoutUserDetailCard, CheckoutUserDetailCardSkeleton, CheckoutItemsSkeleton } from '../CheckoutCards';
import { AlertTriangle } from 'lucide-react';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { useUserProfile } from '@/hooks/api/customer/profile';
import { useNavigationStore } from '@/lib/store/useNavigationStore';
import { createPaymentIntent } from '@/lib/actions/checkout'; // action for intent
import axios from 'axios';
const stripePromise = getStripe(); // import stripe promise

export default function CheckoutMainManual() {
  const { data: session } = useSession(); // session retrieve
  const { cartItems = [] } = useMiniCartStore(); // store items
  const { user, isLoading: isUserLoading } = useUserProfile(); // client side fetch user
  const item = cartItems.at(0) || {}; // item destructure
  const { price, currency = 'usd' } = item;

  const amount = Number(price) || 0; // preserve decimals; Stripe rounding happens server-side
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntent, setPayMentIntent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initRef = useRef(false); // prevent double-mount PI creation

  const name = user?.name;
  const email = user?.email;

  // initialize paymnet
  const initializePaymentIntent = async () => {
    // try {
    //   // console.log('wrogin')
    //   const res = await createPaymentIntent({
    //     amount,
    //     currency: String(currency).toLowerCase(),
    //     email: session?.user?.email || '',
    //   });

    //   // console.log(res)
    //   if (res?.success && res?.clientSecret) {
    //     setClientSecret(res?.clientSecret);
    //     setPayMentIntent(res?.paymentIntent);

    //     sessionStorage.setItem('clientSecret', res?.clientSecret); // create session
    //     sessionStorage.setItem('paymentIntent', res?.paymentIntent); // create session
    //   } else {
    //     setError('Client secret not received');
    //   }
    // } catch (err) {
    //   setError(err.message || 'Something went wrong');
    // } finally {
    //   setLoading(false);
    // }

    // client secret
    try {
      // POST request to your test API route
      const res = await axios.post('/api/payments/create-intent', {
        amount, // from cart item
        currency: String(currency || 'usd').toLowerCase(),
        email: email,
        name: name,
      });

      const data = await res?.data;

      if (data?.success && data?.clientSecret) {
        setClientSecret(data.clientSecret);
        setPayMentIntent(data.paymentIntent);

        // store in session storage
        sessionStorage.setItem('clientSecret', data.clientSecret);
        sessionStorage.setItem('paymentIntent', data.paymentIntent);
      } else {
        setError(data?.error || 'Client secret not received');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
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
        <div className="w-full p-6 pt-10 pb-24 xl:w-2/5 xl:ps-20 bg-[#f4f4f5]">
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
          className="max-w-md w-full rounded-xl border border-[#ff725e] bg-[#ffffff] p-6 flex flex-col gap-3 transition-[opacity,border-color] duration-[220ms] ease-[var(--weelp-ease-out)] motion-reduce:transition-none animate-fade-in"
        >
          <div className="flex items-center gap-2 text-[#ff725e]">
            <AlertTriangle size={20} aria-hidden="true" />
            <h2 className="font-semibold text-base">Checkout couldn&apos;t load</h2>
          </div>
          <p className="text-sm text-[#18181b]">{error}</p>
          <button
            type="button"
            onClick={() => location.reload()}
            className="self-start px-4 py-2 bg-weelp-sage-deep hover:bg-[#4d8069] text-white text-sm font-medium rounded-md transition-colors duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  //  is the key point: Only render <Elements> once clientSecret is available
  if (!clientSecret) {
    return <div className="text-center text-zinc-600">Something went wrong. Please refresh.</div>;
  }

  return (
    <section className="flex flex-col-reverse xl:flex-row animate-fade-in">
      <div className="w-full p-6 pt-10 pb-24 xl:w-3/5 max-w-3xl mx:auto xl:ml-auto xl:mr-28 space-y-4">
        <div className="flex flex-col border rounded-xl">
          <h2 className="font-semibold text-lg text-Blueish p-4 border-b">Contact Details</h2>

          {/* User Detail Card */}
          <CheckoutUserDetailCard userEmail={session?.user?.email} userName={session?.user?.name} />

          {/* Checkout Fields */}
          <Elements stripe={stripePromise} options={{ clientSecret: clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} paymentIntentId={paymentIntent} />
          </Elements>
        </div>
      </div>

      <div className="w-full p-6 pt-10 pb-24 xl:w-2/5 xl:ps-20 bg-[#f4f4f5]">
        <CheckoutItems />
      </div>
    </section>
  );
}
