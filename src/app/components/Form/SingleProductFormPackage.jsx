'use client';

// This Form Is Used in Single Product Page
import React, { useEffect, useState } from 'react';
import { Calendar, Users, Minus, Plus, ChevronRight, CircleCheckBig, Clock5, CircleAlert, Map, MapPin } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useRouter } from 'next/navigation';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { log } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

// Zod Schema
const bookingSchema = z
  .object({
    dateRange: z
      .object({
        from: z.date().nullable().refine(Boolean, 'Start date is required'),
        to: z.date().nullable().refine(Boolean, 'End date is required'),
      })
      .refine((data) => data.from && data.to && data.from <= data.to, 'Please Select Date'),
    howMany: z.object({
      adults: z.number().min(1, 'At least 1 adult is required').max(10, 'Maximum 10 adults allowed'),
      children: z.number().min(0).max(10, 'Maximum 10 children allowed'),
      infants: z.number().min(0).max(5, 'Maximum 5 infants allowed'),
    }),
    package: z.union([z.literal('scuba-diving'), z.literal('without-scuba-diving')]).refine((val) => val !== undefined, {
      message: 'Please select a package',
    }),
    scubaDivingItem: z.string().optional(),
    withoutScubaDivingItem: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.scubaDivingItem && data.withoutScubaDivingItem) {
        return false; // Both cannot be filled at the same time
      }

      if (data.package === 'scuba-diving' && !data.scubaDivingItem) {
        return false; // If the selected package is "scuba-diving", scubaDivingItem must be filled
      }
      if (data.package === 'without-scuba-diving' && !data.withoutScubaDivingItem) {
        return false; // If the selected package is "without-scuba-diving", withoutScubaDivingItem must be filled
      }
      return true;
    },
    {
      message: 'Please select an item for the selected package',
      path: ['package'],
    },
  );

// Package Form Single Product
export default function SingleProductFormPackage({ productData }) {
  const [initform, setInitForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // date & howmany
  const [showHowMany, setShowHowMany] = useState(false); // date & howmany
  const [showResponse, setShowResponse] = useState(false);
  const { setMiniCartOpen, addItem, clearCart, cartItems } = useMiniCartStore();

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
      package: '',
      scubaDivingItem: '',
      withoutScubaDivingItem: '',
    },
  });

  const selectedPackage = watch('package'); // Track current package
  const scubaDivingItem = watch('scubaDivingItem'); // Track scuba diving item
  const withoutScubaDivingItem = watch('withoutScubaDivingItem'); // Track without scuba diving item

  useEffect(() => {
    setInitForm(true);
    if (selectedPackage === 'scuba-diving') {
      setValue('withoutScubaDivingItem', ''); // Clear withoutScubaDivingItem if package is 'scuba-diving'
    } else if (selectedPackage === 'without-scuba-diving') {
      setValue('scubaDivingItem', ''); // Clear scubaDivingItem if package is 'without-scuba-diving'
    }
  }, [selectedPackage, setValue]);

  const [howMany, setHowMany] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setMiniCartOpen(true);

    addItem({
      id: productData?.id,
      price: productData?.base_pricing?.variations[0]?.regular_price ?? 420,
      name: productData?.name,
      ...data,
      featured_image: 'https://picsum.photos/200/300',
      type: 'itinerary',
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

  // handleScuvadiving change
  const handlePackageSelection = (e) => {
    const value = e.target.value;
    setValue('package', value);
    setShowScuvadiving(value === 'scuba-diving');
  };

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
            <span className="hidden" id={productData?.id ?? ''} />
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

            {/* For Package */}
            <div className="w-full flex flex-col gap-4">
              {errors.package && <div className="text-red-500 text-sm">{'Please Select Package'}</div>}
              {errors.scubaDivingItem && <p className="text-red-500">{errors.scubaDivingItem.message}</p>}

              {errors.withoutScubaDivingItem && <p className="text-red-500">{errors.withoutScubaDivingItem.message}</p>}

              <h5 className="self-start text-[#5A5A5A]">Select Package</h5>
              {/* Scuba Diving Option */}
              <label htmlFor="scuba-diving" className="relative flex flex-col gap-4 bg-white py-4 rounded-xl text-Blueish font-semibold sm:text-lg cursor-pointer">
                {/* Radio Input for Scuba Diving */}
                <div className="flex items-center gap-4 px-6 ">
                  <input
                    type="radio"
                    name="package"
                    id="scuba-diving"
                    value="scuba-diving"
                    className="checked:accent-secondaryDark"
                    onClick={handlePackageSelection}
                    {...control.register('package')} // Register this field with react-hook-form
                  />
                  <span>Scuba Diving</span>
                </div>

                {/* Conditionally Rendered Section for Scuba Diving Package */}
                {showScuvadiving && (
                  <div className="flex flex-col gap-2">
                    {/* Controller for List Items */}
                    <Controller
                      control={control}
                      name="scubaDivingItem" // Corrected name
                      defaultValue={''}
                      render={({ field: { onChange, value } }) => (
                        <ul className="flex flex-row gap-4 py-6 px-6 border-t-2">
                          {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
                            <li
                              key={index}
                              onClick={() => onChange(item)} // Set the clicked item as the only value
                              className={`cursor-pointer border border-[#5A5A5A] text-[#5A5A5A] text-xs sm:text-base font-medium p-2 sm:py-2 sm:px-6 rounded-lg capitalize w-fit 
                            ${value === item ? 'border-secondaryDark text-secondaryDark border' : ''}`}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    />
                    <div className="px-6 flex flex-col border-t-2">
                      <div className="flex justify-between w-full py-4">
                        <label htmlFor="include" className=" capitalize text-lg text-Blueish flex gap-2">
                          <input type="checkbox" name="include" id="include" className="checked:accent-secondaryDark w-5" />
                          <span>include transfer</span>
                        </label>
                        <CircleAlert size={20} className="text-gray-400" />
                      </div>
                      <div className="flex justify-evenly items-center gap-2 py-2">
                        <button className="flex items-center gap-2 w-fit  py-3 px-6 border rounded border-[#cccccc] text-gray-500">
                          <MapPin size={18} />
                          <span className="text-xs">From</span>
                        </button>
                        <hr className="border border-dashed w-2/5" />
                        <button className="flex items-center gap-2 w-fit  py-3 px-6 border rounded border-[#cccccc] text-gray-500">
                          <MapPin size={18} />
                          <span className="text-xs">Melaka</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex px-6 gap-4 bg-secondaryLight2 py-2">
                      <div className="flex gap-2 font-normal items-center text-sm">
                        <CircleCheckBig size={18} className=" accent-secondaryDark text-secondaryDark" />
                        <span className="text-secondaryDark font-medium">Live Guide</span>
                      </div>
                      <div className="flex gap-2 font-normal items-center text-sm">
                        <Clock5 size={18} className="accent-secondaryDark text-secondaryDark" />
                        <span className="text-secondaryDark font-medium">Duration - 1.5hrs</span>
                      </div>
                    </div>
                    <div className="flex justify-between px-6 pt-3">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg text-Nileblue">
                          $ {productData?.base_pricing?.variations[0]?.regular_price}
                          {/** Show Price */}
                        </h3>
                        <span className="text-sm text-[#5A5A5A] underline">Detailed Breakdown</span>
                      </div>
                      <button
                        type="submit"
                        disabled={!isValid}
                        className="disabled:bg-gray-400 disabled:cursor-not-allowed w-fit p-4 px-10 text-base font-medium bg-secondaryDark text-white rounded-md shadow"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                )}

                {/* Chevron Icon with Rotation */}
                <ChevronRight className={`absolute top-0 right-0 mt-4 mr-4 ease-in-out duration-300 ${showScuvadiving ? 'rotate-90' : ''}`} />
              </label>

              {/* Without Scuba Diving Option */}
              <label htmlFor="without-scuba-diving" className="relative flex flex-col gap-4 bg-white py-4 rounded-xl text-Blueish font-semibold sm:text-lg cursor-pointer">
                <div className="flex items-center gap-4 px-6">
                  <input
                    type="radio"
                    name="package"
                    id="without-scuba-diving"
                    value="without-scuba-diving"
                    className="checked:accent-secondaryDark"
                    onClick={handlePackageSelection}
                    {...control.register('package')}
                  />
                  <span>Without Scuba Diving</span>
                </div>
                {showScuvadiving === false && (
                  <div className="flex flex-col gap-2 ">
                    <Controller
                      control={control}
                      name="without-scuba-diving-package-items"
                      defaultValue={''}
                      {...register('withoutScubaDivingItem')}
                      render={({ field: { onChange, value } }) => (
                        <ul className="flex flex-row gap-4 py-6 px-6 border-t-2">
                          {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
                            <li
                              key={index}
                              onClick={() => onChange(item)} // Set the clicked item as the only value
                              className={`cursor-pointer  border border-[#5A5A5A]  text-[#5A5A5A] text-xs sm:text-base font-medium p-2 sm:py-2 sm:px-6 rounded-lg capitalize w-fit 
                            ${value === item ? 'border-secondaryDark text-secondaryDark border' : ''}`}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    />
                    <div className="px-6 flex flex-col border-t-2">
                      <div className="flex justify-between w-full py-4">
                        <label htmlFor="include" className=" capitalize text-lg text-Blueish flex gap-2">
                          <input type="checkbox" name="include" id="include" className="checked:accent-secondaryDark w-5" />
                          <span>include transfer</span>
                        </label>
                        <CircleAlert size={20} className="text-gray-400" />
                      </div>
                      <div className="flex justify-evenly items-center gap-2 py-2">
                        <button className="flex items-center gap-2 w-fit  py-3 px-6 border rounded border-[#cccccc] text-gray-500">
                          <MapPin size={18} />
                          <span className="text-xs">From</span>
                        </button>
                        <hr className="border border-dashed w-2/5" />
                        <button className="flex items-center gap-2 w-fit  py-3 px-6 border rounded border-[#cccccc] text-gray-500">
                          <MapPin size={18} />
                          <span className="text-xs">Melaka</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex px-6 gap-4 bg-secondaryLight2 py-2">
                      <div className="flex gap-2 font-normal items-center text-sm">
                        <CircleCheckBig size={18} className=" accent-secondaryDark text-secondaryDark" />
                        <span className="text-secondaryDark font-medium">Live Guide</span>
                      </div>
                      <div className="flex gap-2 font-normal items-center text-sm">
                        <Clock5 size={18} className="accent-secondaryDark text-secondaryDark" />
                        <span className="text-secondaryDark font-medium">Duration - 1.5hrs</span>
                      </div>
                    </div>
                    <div className="flex justify-between px-6 pt-3">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg text-Nileblue">$6,790</h3>
                        <span className="text-sm text-[#5A5A5A] underline">Detailed Breakdown</span>
                      </div>
                      <button
                        type="submit"
                        disabled={!isValid}
                        className="disabled:bg-gray-400 disabled:cursor-not-allowed w-fit p-4 px-10 text-base font-medium bg-secondaryDark text-white rounded-md shadow"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                )}
                <ChevronRight className={`absolute top-0 right-0 mt-4 mr-4 ease-in-out duration-300 ${showScuvadiving === null ? 'rotate-0' : !showScuvadiving ? 'rotate-90' : 'rotate-0'}`} />
              </label>
            </div>
          </form>
        )}
      </div>
    );
  }
}
