'use client';
import React from 'react';
import { Calendar, MessageCircleMore, Phone, Star, Truck, User } from 'lucide-react';
import { actualDate } from '@/lib/utils';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Country, State, City } from 'country-state-city';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useMiniCartStore from '@/lib/store/useMiniCartStore';

export const CheckoutUserDetailCard = ({ userImagesrc, userName, userEmail }) => {
  return (
    <div className="flex gap-4 p-4 items-center hover:bg-[#e9f3ee] cursor-pointer">
      <Image src={userImagesrc || '/assets/testimonial.png'} alt="userlogo" width={48} height={48} className="rounded-full" />
      <div className="flex flex-col">
        <h3 className="text-[#4D4D4D] font-bold text-sm capitalize">{userName ? userName : 'Maya'}</h3>
        <span className="text-[#4D4D4D] text-base leading-6">{userEmail || 'Email: test@test.com'}</span>
      </div>
    </div>
  );
};

// This Module Handle Checkout Items
export const CheckoutItems = () => {
  const { cartItems = [] } = useMiniCartStore();

  return (
    <div className="flex flex-col gap-4 justify-between">
      {cartItems && cartItems.length > 0 ? (
        cartItems.map((val, index) => {
          return <CheckoutItemCard key={index} itemName={val?.name} totalPassenger={val?.howMany} date={val?.dateRange} />;
        })
      ) : (
        <p>Sorry No items in cart</p>
      )}

      <CheckoutReview />
    </div>
  );
};

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
    <Card className="bg-inherit border-none p-4">
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

        {/* HandleSubmit */}
        <Button
          type="submit"
          variant="secondary"
          // className={`${!is disabled:cursor-not-allowed}`}
        >
          {isSubmitting ? 'Please Wait Redirecting to Checkout' : 'Proceed to Payment'}
        </Button>
      </fieldset>
    </Card>
  );
};

export const CheckoutItemCard = ({ itemName, totalPassenger, date }) => {
  const { adults = '', children = '' } = totalPassenger;
  const { from } = date;
  return (
    <div className="bg-white max-w-md flex flex-col rounded-xl p-6 gap-2">
      <h3 className="text-Blueish font-semibold text-lg">{itemName || 'Melaka Wonderland Water Theme Park'}</h3>

      <div className="flex items-center gap-2 text-[#5A5A5A] text-sm">
        <User size={20} />
        <span className="font-medium capitalize">{`${adults} adults , ${children && children + ' children '}`}</span>
      </div>

      <div className="flex items-center gap-2 text-[#5A5A5A] text-sm">
        <Calendar size={20} />
        {from && <span className="font-medium">{actualDate(from)}</span>}
      </div>
    </div>
  );
};

export const CheckoutReview = () => {
  return (
    <div className="mt-6">
      <div className="flex gap-2">
        <h3 className="text-Blueish text-xl font-semibold flex gap-[2px]">Excellent</h3>
        <div className="flex gap-[1px]">
          <Star className="bg-[#00B67A] text-white fill-white p-[4px] text-lg size-5" />
          <Star className="bg-[#00B67A] text-white fill-white p-[4px] text-lg size-5" />
          <Star className="bg-[#00B67A] text-white fill-white p-[4px] text-lg size-5" />
          <Star className="bg-[#00B67A] text-white fill-white p-[4px] text-lg size-5" />
          <Star className="bg-[#00B67A] text-white fill-white p-[4px] text-lg size-5" />
        </div>
        <span className="flex gap-1 font-semibold">
          <Star className="text-xl size-5 text-[#00B67A] fill-[#00B67A]" />
          Trustpilot
        </span>
      </div>
      <p className=" text-sm text-black">Based on 222,945 traveler reviews</p>
      <div className="mt-4">
        <h3 className="text-Blueish text-xl font-semibold flex gap-[2px]">Questions?</h3>
        <p className="text-sm text-black">
          Visit the Weelp Help Centre for any further <br /> questions.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <p className="flex items-center gap-2 text-xs text-black">
          <Phone size={16} className="fill-[#4D4D4D]" />
          <span>+1 (702) 648-5873</span>
        </p>
        <p className="flex items-center gap-2 text-xs text-black">
          <MessageCircleMore size={16} className="text-[#4D4D4D]" />
          <span>Chat now</span>
        </p>
      </div>
    </div>
  );
};
