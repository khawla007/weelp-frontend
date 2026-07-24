'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { buttonVariants } from '@/components/ui/button';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { LoaderCircle, ShoppingCart } from 'lucide-react';

const CheckoutMainManual = dynamic(() => import('@/app/components/Pages/FRONT_END/checkout/checkoutmanual/CheckoutMain'), { ssr: false });

const CheckoutPage = () => {
  const { status } = useSession();
  const { cartItems = [], setMiniCartOpen } = useMiniCartStore();
  const { openAuthModal } = useAuthModalStore();
  const hasOpenedModal = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated' && !hasOpenedModal.current) {
      hasOpenedModal.current = true;
      // Get the referrer (page user came from)
      const referrerUrl = document.referrer;
      openAuthModal({ redirectTo: '/checkout', referrer: referrerUrl || '/' });
    }
  }, [status, openAuthModal]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center py-16 gap-4">
        <LoaderCircle className="h-8 w-8 animate-spin text-weelp-sage-text" />
        <p className="text-copy">Please log in to continue to checkout.</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="h-[80vh] flex items-center justify-center py-16">
        <p className="flex flex-col gap-4 text-center">
          Your cart is empty.{' '}
          <NavigationLink href="/" className={buttonVariants({ variant: 'secondary' }) + ' min-h-11 bg-weelp-sage-deep'}>
            Back to Home
          </NavigationLink>
        </p>
      </div>
    );
  }

  if (cartItems.length > 1) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6">
        <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-2xl border border-border bg-background p-6 text-center shadow-sm sm:p-8">
          <ShoppingCart className="size-8 text-weelp-sage-text" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Checkout one booking at a time</h1>
          <p className="text-sm leading-6 text-copy sm:text-base">Your cart has {cartItems.length} bookings. Review the cart and keep one booking before continuing to payment.</p>
          <button type="button" onClick={() => setMiniCartOpen(true)} className={buttonVariants({ variant: 'default' }) + ' min-h-11 w-full sm:w-auto'}>
            Review cart
          </button>
        </div>
      </section>
    );
  }

  return <CheckoutMainManual />;
};

export default CheckoutPage;
