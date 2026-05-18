'use client';
/**  This Form Is Used in HomePage Banner  */
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Minus, Plus, LoaderCircle } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useRouter } from 'next/navigation';
import { log } from '@/lib/utils';
import { getCitiesRegions } from '@/lib/services/global';

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

export default function BookingForm({ variant = 'default', controlsSlot = null, isSearching = false, onSearchStart }) {
  const router = useRouter(); // for navigation
  const isModal = variant === 'modal';
  const isSearchPage = variant === 'searchPage';

  const [allLocations, setAllLocations] = useState([]);
  const [showLocation, setShowLocation] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHowMany, setShowHowMany] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(allLocations || []);
  const [inputValue, setInputValue] = useState(''); // input for filtering
  const [hasTyped, setHasTyped] = useState(false); // track if user typed

  const [howMany, setHowMany] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  // fetch locations
  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const response = await getCitiesRegions();
        setAllLocations(response); // Assuming API returns an array of cities && region
      } catch (error) {
        console.log('Error fetching cities:', error);
        setAllLocations([]);
      }
    };
    fetchAllLocations();
  }, []);

  // React Hook Form setup with Zod
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      type: '',
      whereTo: '',
      dateRange: { from: null, to: null },
      howMany: { adults: 1, children: 0, infants: 0 },
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    onSearchStart?.();

    // Convert dates to YYYY-MM-DD format
    const startDate = data?.dateRange?.from ? data.dateRange.from.toISOString().split('T')[0] : '';
    const endDate = data?.dateRange?.to ? data.dateRange.to.toISOString().split('T')[0] : '';

    const quantity = data?.howMany?.adults + data?.howMany?.children + data?.howMany?.infants;

    // Construct query string
    router.push(`/search?location=${String(data?.whereTo).toLowerCase()}&start_date=${startDate}&end_date=${endDate}&quantity=${quantity}`);

    // handleReponse
    setShowResponse(!showResponse);

    setShowCalendar(false);
    setShowLocation(false);
    setShowHowMany(false);
  };

  // watch where to
  const watchedWhereTo = useWatch({ control, name: 'whereTo' });
  const watchedFrom = useWatch({ control, name: 'dateRange' });
  const watchedhowMany = useWatch({ control, name: 'howMany' });

  const total = watchedhowMany?.adults + watchedhowMany?.children + watchedhowMany?.infants;

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

    // handleReponse
    setShowResponse(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
    setShowLocation(false);
    setShowHowMany(false);

    // handleReponse
    setShowResponse(false);
  };

  const toggleHowMany = () => {
    setShowHowMany(!showHowMany);
    setShowLocation(false);
    setShowCalendar(false);

    // handleReponse
    setShowResponse(false);
  };

  //all location
  const { data: locations = [] } = allLocations;

  // onchange handle
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHasTyped(true); // user has typed

    if (value.trim() === '') {
      setFilteredLocations(locations); // show full list if input empty
      setHasTyped(false); // no longer considered typed
    } else {
      const filtered = locations.filter((loc) => loc.name.toLowerCase().includes(value.toLowerCase()));
      setFilteredLocations(filtered);
    }
  };

  // handle Input Click
  const handleInputClick = () => {
    setShowLocation(true);
    if (!hasTyped) {
      // first time click → show all locations
      setFilteredLocations(locations);
    }
  };

  // display form based on data
  if (locations && locations.length > 0) {
    return (
      <div className={`p-4 sm:p-6 px-6 sm:px-0 mx-auto w-full relative bannerForm ${isSearchPage ? 'md:w-[700px]' : 'md:w-[560px]'} ${isModal ? 'pt-0' : ''}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-around items-center gap-4 w-full">
          <div data-testid="booking-filter-bar" className="relative flex border-y-[1px] shadow-sm border w-full bg-white rounded-l-xl rounded-r-xl">
            {controlsSlot}
            {/* Where To? */}
            <div className="flex flex-col items-center border-x border-l-0 w-full  justify-center">
              <div className="p-2 sm:py-2 sm:px-4">
                <label className="flex cursor-pointer justify-center items-center gap-2 text-Bluewhale text-[12px] sm:text-base" onClick={toggleLocation}>
                  <MapPin size={20} />
                  {/* <input onChange={handleInputChange} value={watchedWhereTo || ''} placeholder="Where to" type="text" /> */}
                  <input
                    type="text"
                    id="search-destination"
                    name="search-destination"
                    placeholder="Where to"
                    value={inputValue} // input only tracks user typing
                    onChange={handleInputChange} // filter locations
                    onClick={handleInputClick}
                    className="w-full bg-inherit focus-visible:outline-none rounded px-3 py-2 placeholder:text-inherit"
                  />
                  {/* <span>{watchedWhereTo || 'Where to'}</span> */}
                </label>
                {errors.whereTo && <p className="text-red-500 text-sm text-center">{errors.whereTo.message}</p>}
              </div>
            </div>

            {/* When? */}
            <div className="flex flex-col items-center border-x border-l-0 w-full  justify-center">
              <div className="p-2 sm:py-2 sm:px-4">
                <label className="flex cursor-pointer justify-center items-center gap-2 text-Bluewhale text-[12px] sm:text-base" onClick={toggleCalendar}>
                  <Calendar size={20} />
                  {watchedFrom?.from && watchedFrom?.to
                    ? `${new Date(watchedFrom.from).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })} `
                    : 'When?'}
                </label>
                {errors.dateRange && <p className="text-red-500 text-sm text-center">{errors.dateRange.message}</p>}
              </div>
            </div>

            {/* How Many? */}
            <div className="flex flex-col items-center border-x border-r-0 w-full  justify-center">
              <div className="p-2 sm:py-2 sm:px-4">
                <label className="flex cursor-pointer justify-center items-center gap-2 text-Bluewhale text-[12px] sm:text-base" onClick={toggleHowMany}>
                  <Users size={20} />
                  <span>{total ?? 'How Many?'}</span>
                </label>
                {errors.howMany && <p className="text-red-500 text-sm text-center">{errors.howMany?.adults?.message || ''}</p>}
              </div>
            </div>

            {isSearchPage && (
              <div className="flex shrink-0 items-stretch border-l border-[#e4e4e7]">
                <button
                  type="submit"
                  aria-label="Search trips"
                  className="flex min-w-[112px] items-center justify-center rounded-r-xl bg-white px-6 text-sm font-semibold text-Bluewhale transition-[background-color,color,box-shadow] duration-200 ease-[var(--weelp-ease-out)] hover:bg-[#f8faf9] hover:text-[#588f7a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                >
                  Search
                </button>
              </div>
            )}
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
                    <ul className="absolute bg-white rounded-xl w-[220px] max-h-48 overflow-y-auto border mt-1 z-50">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc, idx) => (
                          <li
                            key={idx}
                            onClick={() => {
                              setValue('whereTo', loc.name); // update form value
                              setInputValue(loc.name); // update input display
                              setShowLocation(false); // close dropdown
                            }}
                            className={`px-6 py-2 cursor-pointer hover:bg-gray-100 ${watchedWhereTo === loc.name ? 'bg-green-100' : ''}`}
                          >
                            {loc.name}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-gray-500 cursor-default">No locations found</li>
                      )}
                    </ul>
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
                      className="scale-90"
                      classNames={{ today: 'text-black' }}
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
                          className="w-8 h-8 rounded-full border border-[#b5d8cb] text-lg flex items-center justify-center text-[#588f7a] hover:bg-[#e9f5ed] hover:opacity-80 "
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!isModal && !isSearchPage && (
                    <button type="submit" className="w-full py-2 bg-[#588f7a] text-white rounded-md shadow">
                      Submit
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {isModal && (
            <button
              type="submit"
              aria-label="Search trips"
              disabled={isSearching}
              className="flex h-11 min-w-[160px] items-center justify-center rounded-full bg-[#588f7a] px-8 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-[background-color,box-shadow,transform] duration-200 ease-[var(--weelp-ease-out)] hover:bg-[#477665] hover:shadow-black/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait disabled:opacity-90 motion-reduce:transition-none"
            >
              {isSearching ? <LoaderCircle data-testid="search-submit-loader" className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : 'Search'}
            </button>
          )}
        </form>
      </div>
    );
  }
  return <></>;
}
