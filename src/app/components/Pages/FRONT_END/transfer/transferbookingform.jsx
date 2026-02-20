'use client';

/**  This Form Is Used in HomePage Banner  */
import React, { useState } from 'react';
import { MapPin, Calendar, Users, Minus, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { buttonVariants } from '@/components/ui/button';
import { TransfertCard } from '@/app/components/TransfertCard';

// Zod Schema
const bookingSchema = z.object({
  whereTo: z.string().min(1, 'Location is required'),
  dateRange: z
    .object({
      from: z.date().nullable().refine(Boolean, 'Start date is required'),
      to: z.date().nullable().refine(Boolean, 'End date is required'),
    })
    .refine((data) => data.from && data.to && data.from <= data.to, 'Start date must be before end date'),
  howMany: z.object({
    adults: z.number().min(1, 'At least 1 adult is required').max(10, 'Maximum 10 adults allowed'),
    children: z.number().min(0).max(10, 'Maximum 10 children allowed'),
    infants: z.number().min(0).max(5, 'Maximum 5 infants allowed'),
  }),
});

export default function TransferForm() {
  const [formData, setFormData] = useState([]);
  const [showLocation, setShowLocation] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHowMany, setShowHowMany] = useState(false);
  const [response, setResponse] = useState(false);

  const [howMany, setHowMany] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  // React Hook Form setup with Zod
  const { register, control, handleSubmit, setValue, formState } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      whereTo: '',
      dateRange: { from: null, to: null },
      howMany: { adults: 1, children: 0, infants: 0 },
    },
  });

  const { errors } = formState;

  // Handle form submission
  const onSubmit = async (data) => {
    console.log('Form Data Submitted:', data);
    setFormData(data);

    setShowCalendar(false);
    setShowLocation(false);
    setShowHowMany(false);
    setResponse(true);
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

  // Toggle Handlers
  const toggleLocation = () => {
    setShowLocation(!showLocation);
    setShowCalendar(false);
    setShowHowMany(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
    setShowLocation(false);
    setShowHowMany(false);
  };

  const toggleHowMany = () => {
    setShowHowMany(!showHowMany);
    setShowLocation(false);
    setShowCalendar(false);
  };

  return (
    <div className="p-4 sm:p-6 px-6 sm:px-0  mx-auto md:w-[560px] w-full relative bannerForm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-around items-center gap-8 w-full">
        <div className="flex border-y-[1px]  shadow-sm border w-full bg-white rounded-l-xl rounded-r-xl">
          {/* Where To? */}
          <div className="flex flex-col items-center border-x border-l-0 w-full  justify-center">
            <div className="p-2 sm:p-4">
              <label className="flex cursor-pointer justify-center items-center gap-2 text-Bluewhale text-[12px] sm:text-base" onClick={toggleLocation}>
                <MapPin size={20} />
                <span>{formData?.whereTo || 'Where to'}</span>
              </label>
              {errors.whereTo && <p className="text-red-500 text-sm text-center">{errors.whereTo.message}</p>}
            </div>
          </div>

          {/* When? */}
          <div className="flex flex-col items-center border-x border-l-0 w-full  justify-center">
            <div className="p-2 sm:p-4">
              <label className="flex cursor-pointer justify-center items-center gap-2 text-Bluewhale text-[12px] sm:text-base" onClick={toggleCalendar}>
                <Calendar size={20} />
                <span>When?</span>
              </label>
              {errors.dateRange && <p className="text-red-500 text-sm text-center">{errors.dateRange.message}</p>}
            </div>
          </div>

          {/* How Many? */}
          <div className="flex flex-col items-center border-x border-r-0 w-full  justify-center">
            <div className="p-2 sm:p-4">
              <label className="flex cursor-pointer justify-center items-center gap-2 text-Bluewhale text-[12px] sm:text-base" onClick={toggleHowMany}>
                <Users size={20} />
                <span>How Many?</span>
              </label>
              {errors.howMany && <p className="text-red-500 text-sm text-center">{errors.howMany?.adults?.message || ''}</p>}
            </div>
          </div>
        </div>

        {/* Toggle Fields */}
        <div className="flex rounded-lg absolute z-50 pointer-events-auto top-3/4 translate-y-4 w-full scale-90 sm:scale-[unset]">
          {showLocation && (
            <div
              onMouseLeave={(e) => {
                (e.stopPropagation(), setShowLocation(!showLocation));
              }}
              className="flex w-full justify-center sm:justify-start"
            >
              {/* Controller for handling form state */}
              <Controller
                name="whereTo"
                control={control}
                defaultValue="" // Default value for the select
                render={({ field }) => (
                  <div className="locationController">
                    <ul className="bg-white rounded-xl  w-[220px] overflow-hidden">
                      <li
                        onClick={() => field.onChange('')}
                        className={`px-8 py-3 text-base font-medium hover:text-secondaryDark text-secondaryDark  cursor-pointer hover:bg-[#f2f7f5] ${field.value === '' ? 'bg-[#e9f5ed]' : 'bg-[#f2f7f5]'}`}
                      >
                        Suggested
                      </li>
                      <li
                        onClick={() => field.onChange('London')}
                        className={`px-8 py-3 text-base font-medium hover:text-secondaryDark text-[#5a5a5a]  cursor-pointer hover:bg-[#f2f7f5] ${field.value === 'London' ? 'bg-[#e9f5ed]' : ''}`}
                      >
                        London
                      </li>
                      <li
                        onClick={() => field.onChange('New York')}
                        className={`px-8 py-3 text-base font-medium hover:text-secondaryDark text-[#5a5a5a]  cursor-pointer hover:bg-[#f2f7f5] ${field.value === 'New York' ? 'bg-[#e9f5ed]' : ''}`}
                      >
                        New York
                      </li>
                      <li
                        onClick={() => field.onChange('China')}
                        className={`px-8 py-3 text-base font-medium hover:text-secondaryDark text-[#5a5a5a]  cursor-pointer hover:bg-[#f2f7f5] ${field.value === 'China' ? 'bg-[#e9f5ed]' : ''}`}
                      >
                        China
                      </li>
                      <li
                        onClick={() => field.onChange('Europe')}
                        className={`px-8 py-3 text-base font-medium hover:text-secondaryDark text-[#5a5a5a]  cursor-pointer hover:bg-[#f2f7f5] ${field.value === 'Europe' ? 'bg-[#e9f5ed]' : ''}`}
                      >
                        Europe
                      </li>
                      <li
                        onClick={() => field.onChange('India')}
                        className={`px-8 py-3 text-base font-medium hover:text-secondaryDark text-[#5a5a5a]  cursor-pointer hover:bg-[#f2f7f5] ${field.value === 'India' ? 'bg-[#e9f5ed]' : ''}`}
                      >
                        India
                      </li>
                    </ul>
                  </div>
                )}
              />
            </div>
          )}

          {showCalendar && (
            <div
              onMouseLeave={(e) => {
                (e.stopPropagation(), setShowCalendar(!showCalendar));
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
                    className=" scale-90"
                  />
                )}
              />
            </div>
          )}

          {showHowMany && (
            <div
              onMouseLeave={(e) => {
                (e.stopPropagation(), setShowHowMany(!showHowMany));
              }}
              className="text-nowrap flex flex-col gap-4  w-full items-center sm:items-end"
            >
              <div className="bg-white w-fit p-4 px-6 rounded-lg flex flex-col gap-4 border">
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

        {/* submit action */}
        <div className="flex flex-col items-center justify-center ">
          {!showCalendar &&
            !showHowMany &&
            !showLocation &&
            (response ? (
              <TransfertCard />
            ) : (
              <div className="w-full flex items-center">
                <button type="submit" className={`${buttonVariants()} bg-secondaryDark px-16 py-6 `}>
                  Book Your Ride
                </button>
              </div>
            ))}

          {/* {showResponse && formData && Object.keys(formData).length > 0 ? (
              <div className="text-nowrap flex flex-col gap-4  w-full items-center border shadow-lg rounded-xl">
                <pre>{JSON.stringify(formData, null, 2)}</pre>
              </div>
            ) : null} */}
        </div>
      </form>
    </div>
  );
}
