'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Search } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useRouter } from 'next/navigation';
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

export default function FilterBar() {
  const router = useRouter();
  const [allLocations, setAllLocations] = useState([]);
  const [showLocation, setShowLocation] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHowMany, setShowHowMany] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [hasTyped, setHasTyped] = useState(false);

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
        setAllLocations(response || []);
        setFilteredLocations(response || []);
      } catch (error) {
        console.log('Error fetching cities:', error);
        setAllLocations([]);
        setFilteredLocations([]);
      }
    };
    fetchAllLocations();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      whereTo: '',
      dateRange: { from: null, to: null },
      howMany: { adults: 1, children: 0, infants: 0 },
    },
  });

  const watchedWhereTo = useWatch({ control, name: 'whereTo' });
  const watchedFrom = useWatch({ control, name: 'dateRange' });
  const watchedhowMany = useWatch({ control, name: 'howMany' });

  const total = watchedhowMany?.adults + watchedhowMany?.children + watchedhowMany?.infants;

  const handleIncrement = (type) => {
    setHowMany((prev) => {
      const updated = { ...prev, [type]: prev[type] + 1 };
      setValue(`howMany.${type}`, updated[type]);
      return updated;
    });
  };

  const handleDecrement = (type) => {
    setHowMany((prev) => {
      const min = type === 'adults' ? 1 : 0;
      const updated = { ...prev, [type]: Math.max(prev[type] - 1, min) };
      setValue(`howMany.${type}`, updated[type]);
      return updated;
    });
  };

  const onSubmit = async (data) => {
    const startDate = data?.dateRange?.from ? data.dateRange.from.toISOString().split('T')[0] : '';
    const endDate = data?.dateRange?.to ? data.dateRange.to.toISOString().split('T')[0] : '';
    const quantity = data?.howMany?.adults + data?.howMany?.children + data?.howMany?.infants;

    router.push(`/search?location=${String(data?.whereTo).toLowerCase()}&start_date=${startDate}&end_date=${endDate}&quantity=${quantity}`);

    setShowCalendar(false);
    setShowLocation(false);
    setShowHowMany(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHasTyped(true);

    if (value.trim() === '') {
      setFilteredLocations(allLocations);
      setHasTyped(false);
    } else {
      const filtered = allLocations.filter((loc) => loc.name.toLowerCase().includes(value.toLowerCase()));
      setFilteredLocations(filtered);
    }
  };

  const handleInputClick = () => {
    setShowLocation(true);
    if (!hasTyped) {
      setFilteredLocations(allLocations);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Horizontal Input Row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {/* Where To */}
          <div className="flex-1 relative">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:border-gray-400 transition-colors">
              <MapPin size={18} className="text-gray-500 flex-shrink-0" />
              <input type="text" placeholder="Where to?" value={inputValue} onChange={handleInputChange} onClick={handleInputClick} className="w-full bg-transparent focus:outline-none text-sm" />
            </div>

            {/* Location Dropdown */}
            {showLocation && filteredLocations.length > 0 && (
              <div onMouseLeave={() => setShowLocation(false)} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-48 overflow-y-auto z-50">
                {filteredLocations.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setValue('whereTo', loc.name);
                      setInputValue(loc.name);
                      setShowLocation(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {loc.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* When */}
          <div className="flex-1 relative">
            <div
              onClick={() => {
                setShowCalendar(!showCalendar);
                setShowLocation(false);
                setShowHowMany(false);
              }}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
            >
              <Calendar size={18} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                {watchedFrom?.from && watchedFrom?.to
                  ? `${new Date(watchedFrom.from).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                    })} - ${new Date(watchedFrom.to).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                    })}`
                  : 'When?'}
              </span>
            </div>

            {/* Calendar Dropdown */}
            {showCalendar && (
              <div onMouseLeave={() => setShowCalendar(false)} className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-2 z-50">
                <Controller
                  name="dateRange"
                  control={control}
                  render={({ field }) => (
                    <DayPicker mode="range" selected={field.value} disabled={{ before: new Date() }} onSelect={(value) => field.onChange(value)} className="scale-90 origin-top-right" />
                  )}
                />
              </div>
            )}
          </div>

          {/* How Many */}
          <div className="flex-1 relative">
            <div
              onClick={() => {
                setShowHowMany(!showHowMany);
                setShowLocation(false);
                setShowCalendar(false);
              }}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
            >
              <Users size={18} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                {total || 1} {total === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>

            {/* Guests Dropdown */}
            {showHowMany && (
              <div onMouseLeave={() => setShowHowMany(false)} className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-4 z-50 w-64">
                {['adults', 'children', 'infants'].map((type) => (
                  <div key={type} className="flex justify-between items-center mb-3">
                    <div>
                      <span className="font-medium capitalize text-sm">{type}</span>
                      <span className="text-xs text-gray-500 block">{type === 'adults' ? '13+ years' : type === 'children' ? '2-12 years' : 'Under 2'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleDecrement(type)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100">
                        -
                      </button>
                      <span className="w-6 text-center">{howMany[type]}</span>
                      <button type="button" onClick={() => handleIncrement(type)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100">
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button type="submit" className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <Search size={18} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Error Messages */}
        {(errors.whereTo || errors.dateRange || errors.howMany) && (
          <div className="text-red-500 text-xs">{errors.whereTo?.message || errors.dateRange?.message || 'Please fill all required fields'}</div>
        )}
      </form>
    </div>
  );
}
