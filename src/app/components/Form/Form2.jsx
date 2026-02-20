'use client';

// This Form Is Used in ContinentPage Banner
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { MapPin, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Zod schema for form validation
const bookingSchema = z.object({
  whereTo: z.string().min(1, 'Location is required'),
  dateRange: z
    .object({
      from: z.date().nullable().refine(Boolean, 'Start date is required'),
      to: z.date().nullable().refine(Boolean, 'End date is required'),
    })
    .refine((data) => data.from && data.to && data.from <= data.to, 'Start date must be before end date'),
});

export default function BookingForm2() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      whereTo: '',
      dateRange: { from: null, to: null },
    },
  });

  const onSubmit = (data) => {
    // Convert dates to YYYY-MM-DD format
    const startDate = data?.dateRange?.from ? data.dateRange.from.toISOString().split('T')[0] : '';
    const endDate = data?.dateRange?.to ? data.dateRange.to.toISOString().split('T')[0] : '';

    // Construct query string
    router.push(`/search?location=${String(data?.whereTo).toLowerCase()}&start_date=${startDate}&end_date=${endDate}`);

    setActiveSection(''); // Close all sections after submission
  };

  const toggleSection = (section) => {
    setActiveSection((prev) => (prev === section ? '' : section));
  };

  return (
    <div className="w-full sm:w-[520px] rounded-2xl relative shadow-sm bannerForm ">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Main Input Fields */}
        <div className="flex border rounded-2xl bg-white overflow-hidden ">
          {/* Where To */}
          <div className="flex-1 border-r cursor-pointer p-2 px-4 text-nowrap sm:p-4 " onClick={() => toggleSection('whereTo')}>
            <label className="flex items-center gap-2 text-[#5A5A5A] text-sm sm:text-base h-full">
              <MapPin size={20} />
              <span>Where to?</span>
            </label>
            {errors.whereTo && <p className="text-red-500 text-xs">{errors?.whereTo?.message}</p>}
          </div>

          {/* When */}
          <div className="flex-1 cursor-pointer p-2 px-4 sm:p-4" onClick={() => toggleSection('when')}>
            <label className="flex items-center gap-2 text-[#5A5A5A] text-base ">
              <Calendar size={20} />
              <span>When?</span>
            </label>
            {errors.dateRange && <p className="text-red-500 text-sm ">{errors?.dateRange?.message}</p>}
          </div>
        </div>

        {/* Expanded Sections */}
        <div className="flex rounded-lg absolute z-[30] pointer-events-auto top-3/4  translate-y-8 w-fit scale-90 sm:scale-[unset]">
          {activeSection === 'whereTo' && (
            <div
              onMouseLeave={(e) => {
                (e.stopPropagation(), setActiveSection(''));
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
          {activeSection === 'when' && (
            <div
              onMouseLeave={(e) => {
                (e.stopPropagation(), setActiveSection(''));
              }}
              className="flex w-full justify-start sm:justify-start flex-col -translate-x-8 sm:-translate-x-0  bg-gray-50 p-4 rounded-lg"
            >
              <Controller
                name="dateRange"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DayPicker
                    mode="range"
                    disabled={{
                      before: new Date(),
                    }}
                    selected={value}
                    onSelect={onChange}
                    className="p-4"
                  />
                )}
              />
              {/* Submit Button */}
              <button type="submit" className="w-fit py-2 px-8 bg-secondaryDark text-white rounded-md shadow">
                Submit
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Geo Location */}
      <span className={`absolute z-10  left-[5%] -bottom-[90%] sm:-bottom-[190%] text-base  font-medium text-grayDark ${activeSection ? 'invisible' : 'visible'}`}>54.5260° N, 15.2551° E</span>
    </div>
  );
}
