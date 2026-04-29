'use client';

// This Form Is Used in Single Product Page
import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Users, Minus, Plus } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useRouter } from 'next/navigation';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { log } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { calculateActivityPrice } from '@/lib/pricing/calculateActivityPrice';

// activity
export default function SingleProductForm({ productId, productData, selectedAddons = [], formId, defaultDateRange = null, onDateChange = null, scheduleCount = 0 }) {
  const [initform] = useState(() => true);
  const [showCalendar, setShowCalendar] = useState(false); // date & howmany
  const [showHowMany, setShowHowMany] = useState(false); // date & howmany
  const [showResponse, setShowResponse] = useState(false);
  const { setMiniCartOpen, addItem, clearCart } = useMiniCartStore();
  const { toast } = useToast();

  const router = useRouter(); // intialize router

  // Get form from parent ProductSidebar via FormProvider
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isValid },
  } = useFormContext();

  const [selectedDates, setSelectedDates] = useState(defaultDateRange ?? { from: null, to: null });
  const previousRangeRef = useRef(null);
  const isSingleDateMode = scheduleCount > 0;

  // For itinerary/package: compute end date from start date + schedule days
  const computeEndDate = (startDate) => {
    const end = new Date(startDate);
    end.setDate(end.getDate() + Math.max(0, scheduleCount - 1));
    return end;
  };

  // RHF is the single source of truth for howMany — read via watch().
  // Previously this was a parallel useState, which caused a cross-component
  // update during render when setValue fired inside the setHowMany updater.
  const howMany = watch('howMany') ?? { adults: 1, children: 0, infants: 0 };

  // Handle validation errors — toast limit is 1, so show only the first error
  const onError = (formErrors) => {
    if (formErrors.dateRange) {
      toast({
        title: 'Please select a date',
        variant: 'destructive',
      });
    } else if (formErrors.howMany) {
      toast({
        title: 'Please select at least one adult',
        variant: 'destructive',
      });
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setMiniCartOpen(true);

    // compute combined price with add-ons
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.addon_sale_price ?? a.addon_price), 0);

    // For activities: use calculateActivityPrice utility; for itinerary/package: use schedule_total_price
    let price;
    let currency;
    let basePrice;

    if (productData?.item_type === 'activity') {
      const pricing = calculateActivityPrice({
        activity: productData,
        dateRange: data.dateRange,
        people: data.howMany,
        selectedAddons,
      });
      price = pricing.final;
      basePrice = pricing.subtotal;
      currency = pricing.currency;
    } else {
      // For itinerary/package: use schedule_total_price
      basePrice = Number(productData?.schedule_total_price ?? 0);
      price = basePrice + addonsTotal;
      currency = productData?.schedule_total_currency || 'usd';
    }

    // add item to cart
    addItem({
      id: productData?.id,
      base_price: basePrice,
      price: price,
      name: productData?.name,
      currency: currency,
      ...data,
      featured_image: 'https://picsum.photos/200/300',
      type: productData?.item_type,
      addons: selectedAddons.map((a) => ({
        addon_id: a.addon_id,
        addon_name: a.addon_name,
        price: a.addon_sale_price ?? a.addon_price,
      })),
    });

    // display notification
    toast({
      title: 'Item Added to Cart',
      duration: 1000,
    });

    setMiniCartOpen(true);
    setShowResponse(!showResponse);
    setShowCalendar(false);
    setShowHowMany(false);
  };

  // Increment/Decrement Handlers — RHF is source of truth, no local state.
  // Itineraries cap adults+children at productData.max_guests (smallest
  // transfer capacity); infants are excluded from the cap.
  const handleIncrement = (type) => {
    const current = Number(howMany?.[type] ?? 0);
    const maxGuests = Number(productData?.max_guests) || null;
    if (maxGuests !== null && type !== 'infants') {
      const adults = Number(howMany?.adults ?? 0);
      const children = Number(howMany?.children ?? 0);
      const totalGuests = adults + children;
      if (totalGuests >= maxGuests) {
        return;
      }
    }
    setValue(`howMany.${type}`, current + 1);
  };

  const handleDecrement = (type) => {
    const current = Number(howMany?.[type] ?? 0);
    setValue(`howMany.${type}`, Math.max(current - 1, 0));
  };

  // Toggle Calendar
  const toggleCalendar = () => {
    const opening = !showCalendar;
    setShowCalendar(opening);
    setShowHowMany(false);
    setShowResponse(false);
    clearErrors('dateRange');

    // Save current range and reset so user starts a fresh selection
    if (opening) {
      previousRangeRef.current = selectedDates;
      const cleared = { from: null, to: null };
      setValue('dateRange', cleared);
      setSelectedDates(cleared);
    }
  };

  // Toggle How Many
  const toggleHowMany = () => {
    setShowHowMany(!showHowMany);
    setShowCalendar(false);
    clearErrors('howMany');

    // handleReponse
    setShowResponse(false);
  };

  if (initform) {
    return (
      <div className="p-4 sm:p-6 sm:px-0 w-full relative singleProducform">
        {/* Form with Inputs */}
        <form id={formId} onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col justify-around items-center gap-4 w-full">
          <span className="hidden" id={productId} />
          {/* For Date & Travelers */}
          <div className="w-full flex flex-col gap-4">
            <h5 className="self-start text-[#5A5A5A]">Select Date & Travelers</h5>
            <div className="flex gap-3 w-full">
              {/* Travelers Card */}
              <div
                className={`flex-1 bg-white rounded-xl border shadow-[0_3px_9px_rgba(0,0,0,0.04)] py-[18px] px-[24px] cursor-pointer ${errors.howMany ? 'border-red-500' : 'border-[#ccc]/50'}`}
                onClick={toggleHowMany}
              >
                <div className="flex items-center gap-3 text-[#5A5A5A]">
                  <Users size={20} />
                  <span className="text-base">{howMany?.adults + howMany?.children} Travelers</span>
                </div>
              </div>

              {/* Date Card */}
              <div
                className={`flex-1 bg-white rounded-xl border shadow-[0_3px_9px_rgba(0,0,0,0.04)] py-[18px] px-[24px] cursor-pointer ${errors.dateRange ? 'border-red-500' : 'border-[#ccc]/50'}`}
                onClick={toggleCalendar}
              >
                <div className="flex items-center gap-3 text-[#5A5A5A]">
                  <Calendar size={20} />
                  <span className="text-base">
                    {selectedDates?.from && selectedDates?.to
                      ? `${selectedDates.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${selectedDates.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'When?'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Fields */}
            <div className="flex rounded-lg absolute z-50 pointer-events-auto  top-[30%] w-full scale-90 sm:scale-[unset]">
              {showCalendar && (
                <div
                  onMouseLeave={() => {
                    // If user leaves without completing a range, restore the previous one
                    const current = watch('dateRange');
                    if ((!current?.from || !current?.to) && previousRangeRef.current?.from) {
                      setValue('dateRange', previousRangeRef.current);
                      setSelectedDates(previousRangeRef.current);
                    }
                    setShowCalendar(false);
                  }}
                  className="flex justify-center mx-auto bg-white w-fit rounded-2xl p-2"
                >
                  <Controller
                    name="dateRange"
                    control={control}
                    render={({ field }) =>
                      isSingleDateMode ? (
                        <DayPicker
                          mode="single"
                          selected={field.value?.from}
                          disabled={{ before: new Date() }}
                          onSelect={(day) => {
                            if (day) {
                              const range = { from: day, to: computeEndDate(day) };
                              field.onChange(range);
                              setSelectedDates(range);
                              if (onDateChange) onDateChange(range);
                              setShowCalendar(false);
                            }
                          }}
                          className="scale-90"
                          classNames={{ today: 'text-black' }}
                        />
                      ) : (
                        <DayPicker
                          mode="range"
                          selected={field.value}
                          disabled={{ before: new Date() }}
                          onSelect={(value) => {
                            field.onChange(value);
                            setSelectedDates(value ?? { from: null, to: null });
                            if (onDateChange && value?.from) {
                              onDateChange(value);
                            }
                            if (value?.from && value?.to && value.from.getTime() !== value.to.getTime()) {
                              setShowCalendar(false);
                            }
                          }}
                          className="scale-90"
                          classNames={{ today: 'text-black' }}
                        />
                      )
                    }
                  />
                </div>
              )}

              {showHowMany && (
                <div className="text-nowrap flex flex-col gap-4  w-full items-center ">
                  <div
                    onMouseLeave={(e) => {
                      setShowHowMany(!showHowMany);
                    }}
                    className="bg-white w-fit p-4 px-6 rounded-lg flex flex-col gap-4 border"
                  >
                    {['adults', 'children', 'infants'].map((type, index) => (
                      <div key={index} className="flex justify-between items-center w-full gap-6">
                        <div>
                          <h3 className="font-semibold capitalize">{type}</h3>
                          <span className="text-sm">{type == 'adults' ? 'Above 13 or above' : type == 'children' ? 'Age 2-12' : type == 'infants' ? 'Under 2' : null}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleDecrement(type)}
                            className="w-8 h-8 rounded-full border text-lg flex items-center justify-center text-gray-700 bg-graycolor hover:bg-[#e9f5ed] hover:opacity-80"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-semibold">{howMany?.[type] ?? 0}</span>
                          <button
                            type="button"
                            onClick={() => handleIncrement(type)}
                            className="w-8 h-8 rounded-full border border-secondarylight text-lg flex items-center justify-center text-secondaryDark hover:bg-[#e9f5ed] hover:opacity-80 "
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }
}
