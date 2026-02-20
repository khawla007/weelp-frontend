'use client';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

// Lazy load client-only components
const LoginForm = dynamic(() => import('@/app/components/Form/LoginForm').then((mod) => mod.LoginForm), { ssr: false });
const CheckoutMainManual = dynamic(() => import('@/app/components/Pages/FRONT_END/checkout/checkoutmanual/CheckoutMain'), { ssr: false }); // manual checkout
// const StripeContainer = dynamic(() => import("@/app/components/Pages/FRONT_END/checkout/StripeContainter"), { ssr: false }); // hosted checkout

const CheckoutPage = () => {
  const { data: session } = useSession();
  const { cartItems = [] } = useMiniCartStore();

  if (!session?.user) {
    return (
      <div className="h-[80vh] flex items-center justify-center py-16">
        <LoginForm customUrl="/checkout" />
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

  // return <p>Checkout Page </p>
  return <CheckoutMainManual />;
};

export default CheckoutPage;
