'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';

const CheckoutMainManual = dynamic(() => import('@/app/components/Pages/FRONT_END/checkout/checkoutmanual/CheckoutMain'), { ssr: false });

const CheckoutPage = () => {
  const { data: session, status } = useSession();
  const { cartItems = [] } = useMiniCartStore();
  const { openAuthModal } = useAuthModalStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      openAuthModal({ redirectTo: '/checkout' });
    }
  }, [status, openAuthModal]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center py-16 gap-4">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#568f7c]" />
        <p className="text-[#5a5a5a]">Please log in to continue to checkout.</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="h-[80vh] flex items-center justify-center py-16">
        <p className="flex flex-col gap-4 text-center">
          Your cart is empty.{' '}
          <Link href="/" className={buttonVariants({ variant: 'secondary' }) + ' bg-secondaryDark'}>
            Back to Home
          </Link>
        </p>
      </div>
    );
  }

  return <CheckoutMainManual />;
};

export default CheckoutPage;
