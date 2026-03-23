'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Users, ChevronRight, Loader2, X } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useRouter } from 'next/navigation';
import { getCitiesRegions, homeSearch } from '@/lib/services/global';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';

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
  const locationRef = useRef(null);

  const [howMany, setHowMany] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [previewResults, setPreviewResults] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef(null);

  // fetch locations
  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const response = await getCitiesRegions();
        const locations = response?.data || response || [];
        setAllLocations(Array.isArray(locations) ? locations : []);
        setFilteredLocations(Array.isArray(locations) ? locations : []);
      } catch (error) {
        console.log('Error fetching cities:', error);
        setAllLocations([]);
        setFilteredLocations([]);
      }
    };
    fetchAllLocations();
  }, []);

  // Close location dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocation(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build search query URL from current filter values
  const buildSearchUrl = useCallback((location, dateRange, guests) => {
    const params = new URLSearchParams();
    if (location) params.set('location', String(location).toLowerCase());
    if (dateRange?.from) params.set('start_date', dateRange.from.toISOString().split('T')[0]);
    if (dateRange?.to) params.set('end_date', dateRange.to.toISOString().split('T')[0]);
    const qty = (guests?.adults || 1) + (guests?.children || 0) + (guests?.infants || 0);
    params.set('quantity', String(qty));
    return `/search?${params.toString()}`;
  }, []);

  // Fetch preview results when location is set (dates/guests optional)
  const fetchPreviewResults = useCallback(async (location, dateRange, guests) => {
    if (!location) return;

    setPreviewLoading(true);
    setShowPreview(true);
    try {
      const params = {
        location: String(location).toLowerCase(),
        quantity: (guests?.adults || 1) + (guests?.children || 0) + (guests?.infants || 0),
      };
      if (dateRange?.from) params.start_date = dateRange.from.toISOString().split('T')[0];
      if (dateRange?.to) params.end_date = dateRange.to.toISOString().split('T')[0];
      const response = await homeSearch(params);
      const items = (response?.data || []).slice(0, 4);
      setPreviewResults(items.map((item) => mapProductToItemCard(item)));
    } catch {
      setPreviewResults([]);
    } finally {
      setPreviewLoading(false);
    }
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
    const updated = { ...howMany, [type]: howMany[type] + 1 };
    setHowMany(updated);
    setValue(`howMany.${type}`, updated[type]);
    fetchPreviewResults(watchedWhereTo, watchedFrom, updated);
  };

  const handleDecrement = (type) => {
    const min = type === 'adults' ? 1 : 0;
    const updated = { ...howMany, [type]: Math.max(howMany[type] - 1, min) };
    setHowMany(updated);
    setValue(`howMany.${type}`, updated[type]);
    fetchPreviewResults(watchedWhereTo, watchedFrom, updated);
  };

  const onSubmit = async (data) => {
    const startDate = data?.dateRange?.from ? data.dateRange.from.toISOString().split('T')[0] : '';
    const endDate = data?.dateRange?.to ? data.dateRange.to.toISOString().split('T')[0] : '';
    const quantity = data?.howMany?.adults + data?.howMany?.children + data?.howMany?.infants;

    router.push(`/search?location=${encodeURIComponent(String(data?.whereTo).toLowerCase())}&start_date=${startDate}&end_date=${endDate}&quantity=${quantity}`);

    setShowCalendar(false);
    setShowLocation(false);
    setShowHowMany(false);
    setShowPreview(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHasTyped(true);
    setShowLocation(true);

    if (value.trim() === '') {
      setFilteredLocations(allLocations);
      setHasTyped(false);
    } else {
      const filtered = allLocations.filter((loc) => loc.name.toLowerCase().startsWith(value.toLowerCase()));
      setFilteredLocations(filtered);
    }
  };

  const handleInputClick = () => {
    setShowLocation(true);
    setShowCalendar(false);
    setShowHowMany(false);
    if (!hasTyped) {
      setFilteredLocations(allLocations);
    }
  };

  return (
    <div className="relative w-full max-w-[720px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Connected Filter Fields */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:-space-x-px">
          {/* Where To */}
          <div className="flex-1 relative" ref={locationRef}>
            <div
              onClick={handleInputClick}
              className="flex items-center gap-3 rounded-xl border border-[#cccccc80] bg-white px-6 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-r-none"
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              <MapPin size={20} className="flex-shrink-0" style={{ color: '#142a38b2' }} />
              <input
                type="text"
                placeholder="Where To?"
                value={inputValue}
                onChange={handleInputChange}
                onClick={handleInputClick}
                className="w-full bg-transparent focus:outline-none text-sm font-medium"
                style={{ color: '#5a5a5a', fontFamily: 'inherit' }}
                autoComplete="off"
              />
            </div>

            {/* Location Dropdown */}
            {showLocation && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-52 overflow-y-auto z-[70]">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc) => (
                    <div
                      key={loc.id}
                      onClick={() => {
                        const locValue = loc.slug || loc.name;
                        setValue('whereTo', locValue);
                        setInputValue(loc.name);
                        setShowLocation(false);
                        fetchPreviewResults(locValue, watchedFrom, howMany);
                      }}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                        <span>{loc.name}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{loc.type}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center">No locations found</div>
                )}
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
              className="flex items-center gap-3 rounded-xl border border-[#cccccc80] bg-white px-6 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-none"
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              <Calendar size={20} className="flex-shrink-0" style={{ color: '#142a38b2' }} />
              <span className="text-sm font-medium" style={{ color: '#5a5a5a' }}>
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
              <div onMouseLeave={() => setShowCalendar(false)} className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-2 z-[70]">
                <Controller
                  name="dateRange"
                  control={control}
                  render={({ field }) => (
                    <DayPicker
                      mode="range"
                      selected={field.value}
                      disabled={{ before: new Date() }}
                      onSelect={(value) => {
                        field.onChange(value);
                        if (value?.from && value?.to && value.from.getTime() !== value.to.getTime()) {
                          setShowCalendar(false);
                          fetchPreviewResults(watchedWhereTo, value, howMany);
                        }
                      }}
                      className="scale-90 origin-top-right"
                    />
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
              className="flex items-center gap-3 rounded-xl border border-[#cccccc80] bg-white px-6 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-l-none"
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              <Users size={20} className="flex-shrink-0" style={{ color: '#142a38b2' }} />
              <span className="text-sm font-medium" style={{ color: '#5a5a5a' }}>
                {total || 1} {total === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>

            {/* Guests Dropdown */}
            {showHowMany && (
              <div onMouseLeave={() => setShowHowMany(false)} className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-4 z-[70] w-64">
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
        </div>

        {/* Hidden submit for Enter key */}
        <button type="submit" className="sr-only" aria-label="Search" />

        {/* Error Messages */}
        {(errors.whereTo || errors.dateRange || errors.howMany) && (
          <div className="text-red-500 text-xs mt-2">{errors.whereTo?.message || errors.dateRange?.message || 'Please fill all required fields'}</div>
        )}
      </form>

      {/* Preview Results Dropdown */}
      {showPreview && (
        <div
          ref={previewRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
          style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
        >
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
            aria-label="Close preview"
          >
            <X size={14} className="text-gray-400" />
          </button>
          {previewLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Searching...</span>
            </div>
          ) : previewResults.length > 0 ? (
            <>
              {previewResults.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 pr-10"
                >
                  <span className="text-sm font-semibold text-[#142a38] truncate text-left">{item.title}</span>
                  <span className="rounded-md bg-[#759c8d]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#759c8d]">{item.category}</span>
                  <span className="text-sm font-medium text-[#5a5a5a] text-right">{item.price || ''}</span>
                </Link>
              ))}
              <Link
                href={buildSearchUrl(watchedWhereTo, watchedFrom, watchedhowMany)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-[#759c8d] hover:bg-[#759c8d]/5 transition-colors border-t border-gray-100"
              >
                See More
                <ChevronRight size={14} />
              </Link>
            </>
          ) : (
            <div className="py-6 text-center text-sm text-gray-400">No results found for this search</div>
          )}
        </div>
      )}
    </div>
  );
}
