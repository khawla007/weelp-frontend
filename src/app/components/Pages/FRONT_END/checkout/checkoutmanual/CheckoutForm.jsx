'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUserProfile } from '@/hooks/api/customer/profile';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { buildCheckoutSelection } from '@/lib/checkout/selection';
import { checkoutSchema } from '@/lib/validation/checkoutSchema';
import axios from 'axios';
import { AlertTriangle, Loader2 } from 'lucide-react';

const CheckoutForm = ({ paymentIntentId = '' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUserProfile(); // client side fetch user
  const { cartItems = [], clearCart } = useMiniCartStore(); // store items
  const { toast } = useToast(); // intialize toast

  const { name = '' } = user ?? {}; // destructure user detail
  const { country = '', state = '', city = '', post_code = '', address_line_1 = '', phone = '' } = user?.profile ?? {}; // destructure safely profile data

  // intialize form
  const methods = useForm({
    resolver: zodResolver(checkoutSchema),
    shouldFocusError: true,
    defaultValues: {
      country: country || '',
      state: state || '',
      city: city || '',
      post_code: post_code || '',
      phone: phone || '',
      address_line_1: address_line_1 || '',
      emergency_contact_name: name || '',
      emergency_contact_phone: phone || '',
      emergency_contact_relationship: 'Self',
      special_requirements: '',
    },
  });

  const [submitError, setSubmitError] = useState(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  const item = cartItems.at(0) || {}; // retrieve item

  // handlesubmit
  const handleFormSubmit = async (profileData) => {
    setSubmitError(null);
    try {
      // Check if Stripe is ready
      if (!stripe || !elements) {
        const msg = 'Payment system is not ready. Please try again later.';
        setSubmitError(msg);
        toast({ title: msg });
        return;
      }

      const paymentElementResult = await elements.submit();
      if (paymentElementResult?.error) {
        const msg = paymentElementResult.error.message || 'Please review your payment details.';
        setSubmitError(msg);
        toast({ title: msg, variant: 'destructive' });
        return;
      }

      // Create or update user profile
      const profileResponse = await axios.post('/api/payments/edit-profile', profileData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.data?.success) {
        const msg = 'Failed to update profile. Please try again.';
        setSubmitError(msg);
        toast({ title: msg, variant: 'destructive' });
        return;
      }

      // Read affiliate creator reference from localStorage
      const affiliateRef = localStorage.getItem('affiliate_ref');

      // Prepare order data
      const orderData = {
        ...buildCheckoutSelection(item),
        special_requirements: profileData.special_requirements || '',
        payment_intent_id: paymentIntentId,
        emergency_contact: {
          name: profileData.emergency_contact_name || name || '',
          phone: profileData.emergency_contact_phone || profileData.phone || '',
          relationship: profileData.emergency_contact_relationship || 'Self',
        },
        ...(affiliateRef ? { creator_id: parseInt(affiliateRef) } : {}),
      };

      // Create order
      const orderResponse = await axios.post('/api/payments/create-order', orderData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Check response
      if (!orderResponse.data?.success) {
        const errMsg = orderResponse.data?.error || 'Failed to create order. Please try again.';
        setSubmitError(errMsg);
        toast({ title: errMsg, variant: 'destructive' });
        // Stale cart item — clear so user can re-add fresh selection
        if (orderResponse.data?.code === 'ORDERABLE_NOT_FOUND') {
          clearCart?.();
        }
        return;
      }

      // Clear affiliate reference after successful order creation
      if (affiliateRef) {
        localStorage.removeItem('affiliate_ref');
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
        const msg = result?.error?.message || 'Payment failed. Please try again.';
        setSubmitError(msg);
        toast({ title: msg, variant: 'destructive' });
      } else {
        setPaymentSucceeded(true);
        toast({ title: 'Processing your payment...' });
      }
    } catch {
      const msg = 'An unexpected error occurred. Please try again.';
      setSubmitError(msg);
      toast({ title: msg, variant: 'destructive' });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleFormSubmit)}
        className={`flex flex-col gap-4 p-4 transition-opacity duration-[220ms] ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${
          paymentSucceeded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
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

        {/* Inline submit error */}
        {submitError && (
          <div
            role="alert"
            className="rounded-md border border-weelp-discount bg-background p-4 flex items-start gap-2 text-sm text-foreground transition-[opacity,border-color] duration-[220ms] ease-[var(--weelp-ease-out)] motion-reduce:transition-none animate-fade-in"
          >
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Handle Submit */}
        <Button type="submit" disabled={!stripe || methods.formState.isSubmitting} className="min-h-11 flex items-center justify-center gap-2">
          {methods.formState.isSubmitting && <Loader2 size={16} className="animate-spin motion-reduce:hidden" aria-hidden="true" />}
          {methods.formState.isSubmitting ? 'Processing payment…' : 'Proceed'}
        </Button>
      </form>
    </FormProvider>
  );
};
export default CheckoutForm;

const CheckoutFieldError = ({ field, error }) =>
  error ? (
    <span id={`${field}-error`} role="alert" className="px-2 text-sm text-red-600">
      {error.message}
    </span>
  ) : null;

// Billing Details Fields
export const CheckoutFields = () => {
  const {
    control,
    setValue,
    formState: { errors, isSubmitting },
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
    import('country-state-city').then(({ Country }) => {
      const allCountries = Country.getAllCountries();
      setCountries(allCountries);
    });
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
      import('country-state-city').then(({ State }) => {
        const statesList = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(statesList);

        // Only reset state if form already has a value
        if (watchState) {
          const stillValid = statesList.some((s) => s.name === watchState);
          if (!stillValid) {
            setValue('state', '');
          }
        }
      });
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
      import('country-state-city').then(({ City }) => {
        const cityList = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
        setCities(cityList);
      });
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
                <SelectTrigger className="min-h-11" id="country" aria-invalid={Boolean(errors.country)} aria-describedby={errors.country ? 'country-error' : undefined}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem className="min-h-11" key={country.isoCode} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Error Message */}
          <CheckoutFieldError field="country" error={errors.country} />
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
                <SelectTrigger className="min-h-11" id="state" aria-invalid={Boolean(errors.state)} aria-describedby={errors.state ? 'state-error' : undefined}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem className="min-h-11" key={state.isoCode} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Error Message */}
          <CheckoutFieldError field="state" error={errors.state} />
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
                <SelectTrigger className="min-h-11" id="city" aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'city-error' : undefined}>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem className="min-h-11" key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Error Message */}
          <CheckoutFieldError field="city" error={errors.city} />
        </Label>

        {/* PostCode Field */}
        <Label htmlFor="post_code" className="w-full flex flex-col gap-2">
          Postcode
          <Controller
            name="post_code"
            control={control}
            rules={{ required: 'Postcode Field Required' }}
            render={({ field }) => (
              <Input
                {...field}
                id="post_code"
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                placeholder="Enter Postcode"
                aria-invalid={Boolean(errors.post_code)}
                aria-describedby={errors.post_code ? 'post_code-error' : undefined}
                className={`min-h-11 ${errors.post_code ? 'border-red-500' : ''}`}
              />
            )}
          />
          {/* Error Message */}
          <CheckoutFieldError field="post_code" error={errors.post_code} />
        </Label>

        {/* Phone Field */}
        <Label htmlFor="phone" className="w-full flex flex-col gap-2 ">
          Phone Number
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Phone Field Required' }}
            render={({ field }) => (
              <Input
                {...field}
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Enter Phone Number"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={`min-h-11 ${errors.phone ? 'border-red-500' : ''}`}
              />
            )}
          />
          {/* Error Message */}
          <CheckoutFieldError field="phone" error={errors.phone} />
        </Label>

        {/* Address Field */}
        <Label htmlFor="address_line_1" className="w-full flex flex-col gap-2 sm:col-span-2">
          Address
          <Controller
            name="address_line_1"
            control={control}
            rules={{ required: 'Address Field Required' }}
            render={({ field }) => (
              <Textarea
                {...field}
                id="address_line_1"
                autoComplete="street-address"
                placeholder="Please Enter Your Address"
                aria-invalid={Boolean(errors.address_line_1)}
                aria-describedby={errors.address_line_1 ? 'address_line_1-error' : undefined}
                className={`min-h-20 resize-none ${errors.address_line_1 ? 'border-red-500' : ''}`}
              />
            )}
          />
          {/* Error Message */}
          <CheckoutFieldError field="address_line_1" error={errors.address_line_1} />
        </Label>
      </fieldset>

      <h2 className="text-2xl font-semibold">Emergency Contact</h2>
      <fieldset className={`grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 ${isSubmitting ? 'cursor-not-allowed' : ''}`} disabled={isSubmitting}>
        {/* Emergency Contact Name */}
        <Label htmlFor="emergency_contact_name" className="w-full flex flex-col gap-2">
          Contact Name
          <Controller
            name="emergency_contact_name"
            control={control}
            rules={{ required: 'Emergency contact name required' }}
            render={({ field }) => (
              <Input
                {...field}
                id="emergency_contact_name"
                autoComplete="name"
                placeholder="Full Name"
                aria-invalid={Boolean(errors.emergency_contact_name)}
                aria-describedby={errors.emergency_contact_name ? 'emergency_contact_name-error' : undefined}
                className={`min-h-11 ${errors.emergency_contact_name ? 'border-red-500' : ''}`}
              />
            )}
          />
          <CheckoutFieldError field="emergency_contact_name" error={errors.emergency_contact_name} />
        </Label>

        {/* Emergency Contact Phone */}
        <Label htmlFor="emergency_contact_phone" className="w-full flex flex-col gap-2">
          Contact Phone
          <Controller
            name="emergency_contact_phone"
            control={control}
            rules={{ required: 'Emergency contact phone required' }}
            render={({ field }) => (
              <Input
                {...field}
                id="emergency_contact_phone"
                type="tel"
                inputMode="tel"
                placeholder="Phone Number"
                aria-invalid={Boolean(errors.emergency_contact_phone)}
                aria-describedby={errors.emergency_contact_phone ? 'emergency_contact_phone-error' : undefined}
                className={`min-h-11 ${errors.emergency_contact_phone ? 'border-red-500' : ''}`}
              />
            )}
          />
          <CheckoutFieldError field="emergency_contact_phone" error={errors.emergency_contact_phone} />
        </Label>

        {/* Emergency Contact Relationship */}
        <Label htmlFor="emergency_contact_relationship" className="w-full flex flex-col gap-2">
          Relationship
          <Controller
            name="emergency_contact_relationship"
            control={control}
            rules={{ required: 'Relationship required' }}
            render={({ field }) => (
              <Select id="emergency_contact_relationship" value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="min-h-11"
                  id="emergency_contact_relationship"
                  aria-invalid={Boolean(errors.emergency_contact_relationship)}
                  aria-describedby={errors.emergency_contact_relationship ? 'emergency_contact_relationship-error' : undefined}
                >
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {['Self', 'Spouse', 'Parent', 'Sibling', 'Friend', 'Other'].map((rel) => (
                    <SelectItem className="min-h-11" key={rel} value={rel}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <CheckoutFieldError field="emergency_contact_relationship" error={errors.emergency_contact_relationship} />
        </Label>

        {/* Special Requirements */}
        <Label htmlFor="special_requirements" className="w-full flex flex-col gap-2 sm:col-span-3">
          Special Requirements (Optional)
          <Controller
            name="special_requirements"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="special_requirements"
                placeholder="Any dietary needs, accessibility requirements, etc."
                aria-invalid={Boolean(errors.special_requirements)}
                aria-describedby={errors.special_requirements ? 'special_requirements-error' : undefined}
                className="min-h-20 resize-none"
              />
            )}
          />
          <CheckoutFieldError field="special_requirements" error={errors.special_requirements} />
        </Label>
      </fieldset>
    </Card>
  );
};
