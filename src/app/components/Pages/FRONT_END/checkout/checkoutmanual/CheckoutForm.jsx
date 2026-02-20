'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUserProfile } from '@/hooks/api/customer/profile';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Country, State, City } from 'country-state-city';
import { useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { Button } from '@/components/ui/button';
import { useForm, FormProvider } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { editUserProfileAction } from '@/lib/actions/userActions'; // actions not working
import { checkoutCreateOrder } from '@/lib/actions/checkout'; // actions not working
import axios from 'axios';

const CheckoutForm = ({ clientSecret = '', paymentIntentId = '' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUserProfile(); // client side fetch user
  const { cartItems = [] } = useMiniCartStore(); // store items
  const { toast } = useToast(); // intialize toast

  const { name, id: user_id = '', email: customer_email = '' } = user; // destructure user detail
  const { country = '', state = '', city = '', post_code = '', address_line_1 = '', phone = '' } = user?.profile ?? {}; // destructure safely profile data

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

  const item = cartItems.at(0) || {}; // retrieve item

  // prepare item data
  const {
    price = 0,
    currency = '',
    howMany: { adults = 1, children = 0 },
    dateRange = {},
    type = '',
    id: orderable_id = 0,
  } = item;

  const { from = '', to = '' } = dateRange; // extract dates

  // handlesubmit
  const handleFormSubmit = async (profileData) => {
    try {
      // Check if Stripe is ready
      if (!stripe || !elements) {
        toast({
          title: 'Payment system is not ready. Please try again later.',
        });
        return;
      }

      // Create or update user profile
      const profileResponse = await axios.post('/api/payments/edit-profile', profileData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.data?.success) {
        toast({
          title: 'Failed to update profile. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Prepare order data
      const orderData = {
        order_type: type,
        orderable_id: orderable_id,
        travel_date: '2025-07-10',
        preferred_time: '15:00:00',
        number_of_adults: adults,
        number_of_children: children,
        special_requirements: 'Need vegetarian meals',
        user_id: user_id,
        amount: parseInt(price),
        currency: String(currency).toLowerCase(),
        is_custom_amount: false,
        custom_amount: 0,
        customer_email: customer_email || '',
        payment_intent_id: paymentIntentId,
        emergency_contact: {
          name: 'John Doe',
          phone: '+911234567890',
          relationship: 'Brother',
        },
      };

      // Create order
      const orderResponse = await axios.post('/api/payments/create-order', orderData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Check response
      if (!orderResponse.data?.success) {
        toast({
          title: 'Failed to create order. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // // Confirm payment
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/thankyou`,
        },
      });

      // Error If then display
      if (result.error) {
        toast({
          title: result?.error?.message || 'Payment failed. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Processing your payment...' });
      }
    } catch (error) {
      console.log('Unexpected error during checkout:', error);
      toast({
        title: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 p-4">
        {/* Custom Checkout Fields  */}
        <CheckoutFields />

        {/* Payment Elements */}
        <PaymentElement
          options={{
            paymentMethodOrder: ['card'], // Only show card payment method
            wallets: {
              applePay: 'never',
              googlePay: 'never',
            },
            terms: {
              card: 'always',
              applePay: 'never',
              auBecsDebit: 'never',
              bancontact: 'never',
              cashapp: 'never',
              googlePay: 'never',
              ideal: 'never',
              sepaDebit: 'never',
              sofort: 'never',
              usBankAccount: 'never',
            },
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          }}
        />

        {/* Handle Submit */}
        <Button type="submit" disabled={!stripe}>
          Proceed To Checkout
        </Button>
      </form>
    </FormProvider>
  );
};
export default CheckoutForm;

// Billing Details Fields
export const CheckoutFields = () => {
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useFormContext();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const watchCountry = useWatch({ control, name: 'country' });
  const watchState = useWatch({ control, name: 'state' });

  // Load all countries on mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  // Onchange Selected Country
  useEffect(() => {
    if (countries.length && watchCountry) {
      const foundCountry = countries.find((c) => c.name === watchCountry);

      // set first country
      if (foundCountry?.isoCode !== selectedCountry?.isoCode) {
        setSelectedCountry(foundCountry);
      }
    }
  }, [countries, watchCountry]);

  // Load states when selectedCountry changes (and load new state list based on country change e.g User Select India then (india state list should be))
  useEffect(() => {
    if (selectedCountry) {
      const statesList = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(statesList);

      // Only reset state if form already has a value
      if (watchState) {
        const stillValid = statesList.some((s) => s.name === watchState);
        if (!stillValid) {
          setValue('state', '');
        }
      }
    }
  }, [selectedCountry]);

  // Mount on change Update selectedState based on watched value
  useEffect(() => {
    if (states.length && watchState) {
      const foundState = states.find((s) => s.name === watchState);

      if (foundState?.name !== selectedState?.name) {
        setSelectedState(foundState);
      }
    }
  }, [states, watchState]);

  // Load cities when selectedState changes
  useEffect(() => {
    if (selectedCountry?.isoCode && selectedState?.isoCode) {
      const cityList = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
      setCities(cityList);
    } else {
      setCities([]); // Clear cities if state or country isn't selected
    }
  }, [selectedCountry, selectedState]);

  return (
    <Card className="bg-inherit border-none">
      <h2 className="text-2xl font-semibold">Billing Details</h2>
      <fieldset className={`grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 ${isSubmitting ? 'cursor-not-allowed' : ''}`} disabled={isSubmitting}>
        {/* Country Field */}
        <Label htmlFor="country" className="w-full flex flex-col gap-2 ">
          Country
          <Controller
            name="country"
            control={control}
            rules={{ required: 'Country Field Required' }}
            render={({ field }) => (
              <Select
                id="country"
                value={field.value}
                onValueChange={(name) => {
                  field.onChange(name); // set country name in form
                  const country = countries.find((c) => c.name === name);
                  setSelectedCountry(country); // store full object
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.isoCode} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Error Message */}
          {errors?.country?.message && <span className="text-red-400 px-2">{errors?.country?.message}</span>}
        </Label>

        {/* State Field */}
        <Label htmlFor="state" className="w-full flex flex-col gap-2">
          State
          <Controller
            name="state"
            control={control}
            rules={{ required: 'State Field Required' }}
            render={({ field }) => (
              <Select
                id="state"
                value={field.value}
                onValueChange={(name) => {
                  field.onChange(name); // set country name in form
                  const state = states.find((c) => c.name === name);
                  setSelectedState(state); // store full object
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.isoCode} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Error Message */}
          {errors?.state?.message && <span className="text-red-400 px-2">{errors?.state?.message}</span>}
        </Label>

        {/* City Field */}
        <Label htmlFor="city" className="w-full flex flex-col gap-2 sm:col-span-2">
          City
          <Controller
            name="city"
            control={control}
            rules={{ required: 'City Field Required' }}
            render={({ field }) => (
              <Select id="city" value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Error Message */}
          {errors?.city?.message && <span className="text-red-400 px-2">{errors?.city?.message}</span>}
        </Label>

        {/* PostCode Field */}
        <Label htmlFor="post_code" className="w-full flex flex-col gap-2">
          Postcode
          <Controller
            name="post_code"
            control={control}
            rules={{ required: 'Postcode Field Required' }}
            render={({ field }) => <Input {...field} type="number" min="0" placeholder="Enter Postcode" className={errors?.post_code?.message ? 'border-red-400' : ''} />}
          />
          {/* Error Message */}
          {errors?.post_code?.message && <span className="text-red-400 px-2">{errors?.post_code?.message}</span>}
        </Label>

        {/* Phone Field */}
        <Label htmlFor="phone" className="w-full flex flex-col gap-2 ">
          Phone Number
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Phone Field Required' }}
            render={({ field }) => <Input {...field} type="number" min="0" placeholder="Enter Phone Number" className={errors?.phone?.message ? 'border-red-400' : ''} />}
          />
          {/* Error Message */}
          {errors?.phone?.message && <span className="text-red-400 px-2">{errors?.phone?.message}</span>}
        </Label>

        {/* PostCode Field */}
        <Label htmlFor="address_line_1" className="w-full flex flex-col gap-2 sm:col-span-2">
          Address
          <Controller
            name="address_line_1"
            control={control}
            rules={{ required: 'Address Field Required' }}
            render={({ field }) => <Textarea {...field} min="0" placeholder="Please Enter Your Address" className={` resize-none ${errors?.address_line_1?.message && 'border-red-400'} `} />}
          />
          {/* Error Message */}
          {errors?.address_line_1?.message && <span className="text-red-400 px-2">{errors?.address_line_1?.message}</span>}
        </Label>
      </fieldset>
    </Card>
  );
};
