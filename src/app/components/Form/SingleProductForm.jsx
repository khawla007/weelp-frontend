'use client';

// This Form Is Used in Single Product Page
import React, { useEffect, useState } from 'react';
import { Calendar, Users, Minus, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useRouter } from 'next/navigation';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { log } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Zod Schema
const bookingSchema = z.object({
  dateRange: z
    .object({
      from: z.date().refine(Boolean, 'Start date is required'),
      to: z.date().refine(Boolean, 'End date is required'),
    })
    .refine((data) => data.from && data.to && data.from <= data.to, 'Please Select Date'),
  howMany: z.object({
    adults: z.number().min(1, 'At least 1 adult is required').max(10, 'Maximum 10 adults allowed'),
    children: z.number().min(0).max(10, 'Maximum 10 children allowed'),
    infants: z.number().min(0).max(5, 'Maximum 5 infants allowed'),
  }),
});

// activity
export default function SingleProductForm({ productId, productData, selectedAddons = [], formId }) {
  const [initform] = useState(() => true);
  const [showCalendar, setShowCalendar] = useState(false); // date & howmany
  const [showHowMany, setShowHowMany] = useState(false); // date & howmany
  const [showResponse, setShowResponse] = useState(false);
  const { setMiniCartOpen, addItem, clearCart } = useMiniCartStore();
  const { toast } = useToast();

  const router = useRouter(); // intialize router

  // React Hook Form setup with Zod
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dateRange: { from: null, to: null },
      howMany: { adults: 1, children: 0, infants: 0 },
    },
  });

  const [selectedDates, setSelectedDates] = useState({ from: null, to: null });

  const [howMany, setHowMany] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setMiniCartOpen(true);

    // compute combined price with add-ons
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.addon_sale_price ?? a.addon_price), 0);

    // add item to cart
    addItem({
      id: productData?.id,
      price: Number(productData?.pricing?.regular_price ?? 0) + addonsTotal,
      name: productData?.name,
      currency: productData?.pricing?.currency || 'usd',
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
    });

    setMiniCartOpen(true);
    setShowResponse(!showResponse);
    setShowCalendar(false);
    setShowHowMany(false);
  };

  // Increment/Decrement Handlers
  const handleIncrement = (type) => {
    setHowMany((prev) => {
      const updated = { ...prev, [type]: prev[type] + 1 };
      setValue(`howMany.${type}`, updated[type]); // Update React Hook Form value
      return updated;
    });
  };

  const handleDecrement = (type) => {
    setHowMany((prev) => {
      const updated = { ...prev, [type]: Math.max(prev[type] - 1, 0) };
      setValue(`howMany.${type}`, updated[type]); // Update React Hook Form value
      return updated;
    });
  };

  // Toggle Calendar
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
    setShowHowMany(false);

    // handleReponse
    setShowResponse(false);
  };

  // Toggle How Many
  const toggleHowMany = () => {
    setShowHowMany(!showHowMany);
    setShowCalendar(false);

    // handleReponse
    setShowResponse(false);
  };

  if (initform) {
    return (
      <div className="p-4 sm:p-6 sm:px-0 w-full relative singleProducform">
        {/* Form with Inputs */}
        <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-around items-center gap-4 w-full">
          <span className="hidden" id={productId} />
          {/* For Date & Travelers */}
          <div className="w-full flex flex-col gap-4">
            <h5 className="self-start text-[#5A5A5A]">Select Date & Travelers</h5>
            <div className="flex gap-3 w-full">
              {/* Travelers Card */}
              <div className="flex-1 bg-white rounded-xl border border-[#ccc]/50 shadow-[0_3px_9px_rgba(0,0,0,0.04)] py-[18px] px-[24px] cursor-pointer" onClick={toggleHowMany}>
                <div className="flex items-center gap-3 text-[#5A5A5A]">
                  <Users size={20} />
                  <span className="text-base">{howMany?.adults + howMany?.children} Travelers</span>
                </div>
                {errors.howMany && <p className="text-red-500 text-sm mt-1">{errors.howMany?.adults?.message || ''}</p>}
              </div>

              {/* Date Card */}
              <div className="flex-1 bg-white rounded-xl border border-[#ccc]/50 shadow-[0_3px_9px_rgba(0,0,0,0.04)] py-[18px] px-[24px] cursor-pointer" onClick={toggleCalendar}>
                <div className="flex items-center gap-3 text-[#5A5A5A]">
                  <Calendar size={20} />
                  <span className="text-base">
                    {selectedDates?.from && selectedDates?.to
                      ? `${selectedDates.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${selectedDates.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'When?'}
                  </span>
                </div>
                {errors.dateRange && <p className="text-red-500 text-sm mt-1">{errors.dateRange.message}</p>}
              </div>
            </div>

            {/* Toggle Fields */}
            <div className="flex rounded-lg absolute z-50 pointer-events-auto  top-[30%] w-full scale-90 sm:scale-[unset]">
              {showCalendar && (
                <div
                  onMouseLeave={(e) => {
                    setShowCalendar(!showCalendar);
                  }}
                  className="flex justify-center mx-auto bg-white w-fit rounded-2xl p-2"
                >
                  <Controller
                    name="dateRange"
                    control={control}
                    render={({ field }) => (
                      <DayPicker
                        mode="range"
                        selected={field.value}
                        disabled={{
                          before: new Date(),
                        }}
                        onSelect={(value) => {
                          field.onChange(value);
                          setSelectedDates(value ?? { from: null, to: null });
                          if (value?.from && value?.to && value.from.getTime() !== value.to.getTime()) {
                            setShowCalendar(false);
                          }
                        }}
                        className="scale-90"
                        classNames={{ today: 'text-black' }}
                      />
                    )}
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
                          <span className="font-semibold">{howMany[type]}</span>
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
