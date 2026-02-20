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
import { buttonVariants } from '@/components/ui/button';
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
export default function SingleProductForm({ productId, productData }) {
  const [initform, setInitForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // date & howmany
  const [showHowMany, setShowHowMany] = useState(false); // date & howmany
  const [showResponse, setShowResponse] = useState(false);
  const { setMiniCartOpen, addItem, clearCart, cartItems } = useMiniCartStore();
  const { toast } = useToast();

  const [showScuvadiving, setShowScuvadiving] = useState(null); // show scuvadiving content
  const router = useRouter(); // intialize router

  const isInCart = cartItems.some((item) => item.id === productData.id);

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

  useEffect(() => {
    setInitForm(true);
  }, []);

  const [howMany, setHowMany] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setMiniCartOpen(true);

    // add item to cart
    addItem({
      id: productData?.id,
      price: productData?.pricing?.regular_price,
      name: productData?.name,
      currency: productData?.pricing?.currency,
      ...data,
      featured_image: 'https://picsum.photos/200/300',
      type: productData?.item_type,
    });

    // display notificatin
    toast({
      title: 'Item Added to Card',
      // description: "Friday, February 10, 2023 at 5:57 PM",
    });
    // clearCart()

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

  // // handleScuvadiving change
  // const handlePackageSelection = (e) => {
  //   const value = e.target.value;
  //   setValue("package", value);
  //   setShowScuvadiving(value === "scuba-diving");
  // };

  if (initform) {
    return (
      <div className="p-4 sm:p-6 sm:px-0 w-full relative singleProducform">
        {/* if item is in cart */}
        {isInCart ? (
          <h2 className="text-lg font-medium flex gap-4 items-center">
            Item already in cart{' '}
            <span className={`${buttonVariants()} bg-secondaryDark cursor-pointer`} onClick={() => setMiniCartOpen(true)}>
              Show Cart
            </span>
          </h2>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-around items-center gap-4 w-full">
            <span className="hidden" id={productId} />
            {/* For Date & Total */}
            <div className=" w-full flex flex-col gap-4">
              <h5 className="self-start text-[#5A5A5A]">Select Date & Travelers</h5>
              <div className="flex border-y-[1px]  shadow-sm border w-full bg-white rounded-l-xl rounded-r-xl">
                {/* When? */}
                <div className="flex flex-col items-center border-x border-l-0 w-full justify-center">
                  <div className="p-2 sm:p-4">
                    <label className="flex cursor-pointer flex-wrap justify-center items-center gap-2 text-[#5A5A5A] text-[12px] sm:text-base" onClick={toggleCalendar}>
                      <Calendar size={20} />
                      <span>When?</span>
                    </label>
                    {errors.dateRange && <p className="text-red-500 text-sm text-center">{errors.dateRange.message}</p>}
                  </div>
                </div>

                {/* How Many? */}
                <div className="flex flex-col items-center border-x border-r-0 w-full  justify-center">
                  <div className="p-2 sm:p-4">
                    <label className="flex cursor-pointer flex-wrap justify-center items-center gap-2 text-[#5A5A5A] text-[12px] sm:text-base" onClick={toggleHowMany}>
                      <Users size={20} />

                      {howMany?.adults + howMany?.children}
                    </label>
                    {errors.howMany && <p className="text-red-500 text-sm text-center">{errors.howMany?.adults?.message || ''}</p>}
                  </div>
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
                          onSelect={(value) => field.onChange(value)}
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

            {/* For Submit */}
            <button type="submit" disabled={!isValid} className="disabled:bg-gray-400 disabled:cursor-not-allowed w-fit p-4 px-10 text-base font-medium bg-secondaryDark text-white rounded-md shadow">
              Select
            </button>
          </form>
        )}
      </div>
    );
  }
}
