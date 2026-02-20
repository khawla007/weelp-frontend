'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CheckoutFields, CheckoutUserDetailCard, CheckoutItems } from '@/app/components/Pages/FRONT_END/checkout/CheckoutCards';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { getStripe } from '@/lib/stripe/stripe';
import axios from 'axios';
import { useUserProfile } from '@/hooks/api/customer/profile';
import { useForm, FormProvider } from 'react-hook-form';
import { editUserProfileAction } from '@/lib/actions/userActions';
import { useToast } from '@/hooks/use-toast';

// intialization checkout
const initiateCheckout = async (bookingData) => {
  try {
    const stripe = await getStripe();

    const response = await axios.post('/api/public/checkout', bookingData); // used proxy api

    const { id: sessionId } = response.data;

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.log('Stripe checkout error', error);
    }
  } catch (err) {
    console.log('Checkout failed', err);
  }
};

const StripeContainer = () => {
  const { data: session } = useSession(); // session retrieve
  const { cartItems = [] } = useMiniCartStore(); // store items
  const { user } = useUserProfile(); // client side fetch user
  const { toast } = useToast(); // intialize toast

  const profile = user?.profile ?? {}; // access profile safely
  const { country = '', state = '', city = '', post_code = '', phone = '', address_line_1 = '' } = profile; // access profile data safely

  // intialize form
  const methods = useForm({
    defaultValues: {
      country: country || '',
      state: state || '',
      city: city || '',
      post_code: post_code || '',
      phone: phone || '',
      address_line_1: address_line_1 || '',
    },
  });

  // populate data
  useEffect(() => {
    if (user?.profile) {
      methods.reset({ country, state, city, post_code, phone, address_line_1 });
    }
  }, [user?.profile]);

  // destructure methods and property
  const { handleSubmit } = methods;

  const firstItem = cartItems.at(0) || {}; //
  const { price = '', id = '', type = '' } = firstItem;

  // convert to correct format
  const amount = parseFloat(price); // price
  const userId = parseFloat(session?.user?.id || 0); // userId

  // handle checkout functionality
  const handleCheckout = async (data) => {
    // Prepare booking data
    const bookingData = {
      order_type: type,
      orderable_id: id,
      travel_date: '2025-07-10',
      preferred_time: '15:00:00',
      number_of_adults: 2,
      number_of_children: 1,
      special_requirements: 'Need vegetarian meals',
      user_id: userId,
      amount: amount,
      currency: 'inr',
      is_custom_amount: false,
      custom_amount: 0,
      customer_email: session?.user?.email || '',
      emergency_contact: {
        name: 'John Doe',
        phone: '+911234567890',
        relationship: 'Brother',
      },
    };

    try {
      await editUserProfileAction(data); // send data to backend
      await initiateCheckout(bookingData); // initiate checkout

      // toast({ title: "Please Wait Redirecting to Checkout", variant: "default" }); // checkout redirection
    } catch (err) {
      console.log('Checkout flow failed:', err);
      toast({
        title: err || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className="flex flex-col-reverse xl:flex-row">
      <div className="w-full p-6 pt-10 pb-24 xl:w-3/5 max-w-3xl mx:auto xl:ml-auto xl:mr-28 space-y-4">
        <div className="flex flex-col border rounded-xl">
          <h2 className="font-semibold text-lg text-Blueish p-4 border-b">Contact Details</h2>

          {/* Session And Profile Component */}
          {session?.user ? (
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(handleCheckout)}>
                {/* User Detail Card */}
                <CheckoutUserDetailCard userEmail={session?.user?.email} userName={session?.user?.name} />

                {/* Checkout Fields */}
                <CheckoutFields />
              </form>
            </FormProvider>
          ) : (
            <div className="p-4 text-gray-500">No user logged in</div>
          )}
          {/* Address  */}
        </div>
      </div>

      <div className="w-full p-6 pt-10 pb-24 xl:w-2/5 xl:ps-20 bg-[#f2f3f5]">
        <CheckoutItems />
      </div>
    </section>
  );
};

export default StripeContainer;
