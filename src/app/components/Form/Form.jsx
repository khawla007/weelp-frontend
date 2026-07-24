'use client';
/**  This Form Is Used in HomePage Banner  */
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Minus, Plus, LoaderCircle } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WeelpCalendar } from '@/components/calendar';
import { useRouter } from 'next/navigation';
import { log } from '@/lib/utils';
import { useCitiesRegions } from '@/hooks/useCitiesRegions';

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

  const { data: allLocations, loading: locationsLoading } = useCitiesRegions();
  const [showLocation, setShowLocation] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHowMany, setShowHowMany] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [inputValue, setInputValue] = useState(''); // input for filtering
  const [hasTyped, setHasTyped] = useState(false); // track if user typed

  const [howMany, setHowMany] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  // Mirror the hook's source list into the filtered state when it arrives,
  // unless the user has already started typing a filter.
  useEffect(() => {
    if (!hasTyped) {
      setFilteredLocations(allLocations); // eslint-disable-line react-hooks/set-state-in-effect -- syncing external fetch result into a derived list the consumer also mutates from input handlers
    }
  }, [allLocations, hasTyped]);

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
      const minimum = type === 'adults' ? 1 : 0;
      const updated = { ...prev, [type]: Math.max(prev[type] - 1, minimum) };
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

  // onchange handle
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHasTyped(true);

    if (value.trim() === '') {
      setFilteredLocations(allLocations);
      setHasTyped(false);
    } else {
      const lower = value.toLowerCase();
      const filtered = allLocations.filter((loc) => loc.name.toLowerCase().includes(lower));
      setFilteredLocations(filtered);
    }
  };

  // handle Input Click
  const handleInputClick = () => {
    setShowLocation(true);
    if (!hasTyped) {
      setFilteredLocations(allLocations);
    }
  };

  return (
    <div className={`p-4 sm:p-6 px-6 sm:px-0 mx-auto w-full relative bannerForm ${isSearchPage ? 'md:w-[700px]' : 'md:w-[560px]'} ${isModal ? 'pt-0' : ''}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-around items-center gap-4 w-full">
        <div data-testid="booking-filter-bar" className="relative flex flex-col gap-2 sm:flex-row sm:gap-0 sm:-space-x-px w-full">
          {controlsSlot}

          {/* Where To? */}
          <div className="flex-1 relative min-w-0">
            <div
              onClick={toggleLocation}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-r-none"
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              <MapPin size={20} className="flex-shrink-0" style={{ color: 'rgb(var(--copy-rgb))' }} />
              <input
                type="text"
                id="search-destination"
                name="search-destination"
                placeholder="Where to"
                value={inputValue}
                onChange={handleInputChange}
                onClick={handleInputClick}
                className="w-full bg-transparent border-0 text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
                style={{ color: 'rgb(var(--copy-rgb))', fontFamily: 'inherit' }}
                autoComplete="off"
              />
            </div>
            {errors.whereTo && <p className="text-red-500 text-xs mt-1 px-1">{errors.whereTo.message}</p>}

            {showLocation && (
              <Controller
                name="whereTo"
                control={control}
                defaultValue=""
                render={() => (
                  <ul
                    onMouseLeave={() => setShowLocation(false)}
                    className="absolute top-full left-0 mt-1 bg-background rounded-lg shadow-lg border border-border max-h-52 overflow-y-auto z-[110] min-w-full w-max"
                  >
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setValue('whereTo', loc.name);
                            setInputValue(loc.name);
                            setShowLocation(false);
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-muted text-sm whitespace-nowrap ${watchedWhereTo === loc.name ? 'bg-green-100' : ''}`}
                        >
                          {loc.name}
                        </li>
                      ))
                    ) : locationsLoading ? null : (
                      <li className="px-4 py-2 text-muted-foreground text-sm cursor-default">No locations found</li>
                    )}
                  </ul>
                )}
              />
            )}
          </div>

          {/* When? */}
          <div className="flex-1 relative min-w-0">
            <div
              onClick={toggleCalendar}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-none"
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              <Calendar size={20} className="flex-shrink-0" style={{ color: 'rgb(var(--copy-rgb))' }} />
              <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'rgb(var(--copy-rgb))' }}>
                {watchedFrom?.from && watchedFrom?.to
                  ? `${new Date(watchedFrom.from).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${new Date(watchedFrom.to).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`
                  : 'When?'}
              </span>
            </div>
            {errors.dateRange && <p className="text-red-500 text-xs mt-1 px-1">{errors.dateRange.message}</p>}

            {showCalendar && (
              <div onMouseLeave={() => setShowCalendar(false)} className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-background rounded-2xl shadow-lg border border-border p-2 z-[110]">
                <Controller
                  name="dateRange"
                  control={control}
                  render={({ field }) => <WeelpCalendar mode="range" months={2} selected={field.value} disablePast onSelect={(value) => field.onChange(value)} showClear />}
                />
              </div>
            )}
          </div>

          {/* How Many? */}
          <div className="flex-1 relative min-w-0">
            <div
              onClick={toggleHowMany}
              className={`flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer ${isSearchPage ? 'sm:rounded-none' : 'sm:rounded-l-none'}`}
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              <Users size={20} className="flex-shrink-0" style={{ color: 'rgb(var(--copy-rgb))' }} />
              <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'rgb(var(--copy-rgb))' }}>
                {total != null && total > 0 ? `${total} ${total === 1 ? 'Guest' : 'Guests'}` : 'How Many?'}
              </span>
            </div>
            {errors.howMany && <p className="text-red-500 text-xs mt-1 px-1">{errors.howMany?.adults?.message || ''}</p>}

            {showHowMany && (
              <div onMouseLeave={() => setShowHowMany(false)} className="absolute top-full right-0 mt-1 bg-background rounded-lg shadow-lg border border-border p-4 z-[110] w-64">
                {['adults', 'children', 'infants'].map((type) => (
                  <div key={type} className="flex justify-between items-center mb-3 last:mb-0 gap-6">
                    <div>
                      <h3 className="font-semibold capitalize text-sm">{type}</h3>
                      <span className="text-xs text-muted-foreground">{type === 'adults' ? '13+ years' : type === 'children' ? '2-12 years' : 'Under 2'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Decrease ${type}`}
                        onClick={() => handleDecrement(type)}
                        disabled={howMany[type] <= (type === 'adults' ? 1 : 0)}
                        className="size-11 rounded-full border flex items-center justify-center text-copy bg-graycolor hover:bg-weelp-sage-wash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-semibold">{howMany[type]}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${type}`}
                        onClick={() => handleIncrement(type)}
                        className="size-11 rounded-full border border-weelp-sage-tint flex items-center justify-center text-weelp-sage-text hover:bg-weelp-sage-wash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {!isModal && !isSearchPage && (
                  <button type="submit" className="w-full py-2 bg-weelp-sage-deep text-white rounded-md shadow mt-2">
                    Submit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Search button (search page only) */}
          {isSearchPage && (
            <button
              type="submit"
              aria-label="Search trips"
              className="flex shrink-0 min-w-[112px] items-center justify-center rounded-xl border border-border bg-background px-6 py-[18px] text-sm font-semibold text-Bluewhale shadow-[0_3px_9px_rgba(0,0,0,0.04)] transition-[background-color,color,box-shadow] duration-200 ease-[var(--weelp-ease-out)] hover:bg-weelp-sage-wash hover:text-weelp-sage-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:rounded-l-none motion-reduce:transition-none"
            >
              Search
            </button>
          )}
        </div>

        {isModal && (
          <button
            type="submit"
            aria-label="Search trips"
            disabled={isSearching}
            className="flex h-11 min-w-[160px] items-center justify-center rounded-full bg-weelp-sage-deep px-8 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-[background-color,box-shadow,transform] duration-200 ease-[var(--weelp-ease-out)] hover:bg-weelp-sage-hover hover:shadow-black/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait disabled:opacity-90 motion-reduce:transition-none"
          >
            {isSearching ? <LoaderCircle data-testid="search-submit-loader" className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : 'Search'}
          </button>
        )}
      </form>
    </div>
  );
}
