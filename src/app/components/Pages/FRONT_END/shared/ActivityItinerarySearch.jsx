'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, ChevronRight, ChevronDown, X, Search } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { WeelpCalendar, formatRange } from '@/components/calendar';
import { homeSearch } from '@/lib/services/global';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import { useCitiesRegions } from '@/hooks/useCitiesRegions';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { useNavigationStore } from '@/lib/store/useNavigationStore';
import { buildDiscoverySearchUrl, formatDiscoveryDate, parseDiscoverySearchParams } from './discoverySearchParams';

const PANEL_MOTION_CLASS = 'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none';
const OPEN_PANEL_MOTION_CLASS = 'opacity-100 translate-y-0 scale-100 animate-in fade-in-0 slide-in-from-top-1';
const ROW_MOTION_CLASS =
  'animate-in fade-in-0 slide-in-from-top-1 transition-[opacity,transform] duration-150 ease-out opacity-100 translate-y-0 motion-reduce:transition-none motion-reduce:transform-none';
const COUNT_MOTION_CLASS = 'transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:transform-none';
const COUNT_NUMBER_MOTION_CLASS = 'inline-block animate-in fade-in-0 zoom-in-95 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:transform-none';
const CONTROL_BUTTON_CLASS =
  'size-11 rounded-full border flex items-center justify-center hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 disabled:cursor-not-allowed disabled:opacity-50';
const FIELD_TRIGGER_CLASS =
  'flex w-full items-center gap-3 rounded-xl border border-border bg-card px-6 py-[18px] text-left shadow-[0_3px_9px_rgba(0,0,0,0.04)] dark:shadow-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40';
const PANEL_BASE_CLASS = 'border border-border bg-card shadow-lg dark:shadow-none rounded-lg';

function ActivityItinerarySearch({ presentation, initialQuery = '', controlsSlot = null, isSearching = false, onSearchStart }) {
  const router = useRouter();
  const { setNavigating } = useNavigationStore();
  const { data: allLocations, loading: locationsLoading } = useCitiesRegions();
  const isPill = presentation === 'home';
  const isModal = presentation === 'modal';
  const instanceId = useId();
  const locationPanelId = `${instanceId}-discovery-locations`;
  const parsedInitialQuery = useMemo(() => parseDiscoverySearchParams(initialQuery), [initialQuery]);
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
  const [previewResults, setPreviewResults] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeLocationIndex, setActiveLocationIndex] = useState(-1);
  const previewRef = useRef(null);
  const previewRequestIdRef = useRef(0);
  const pendingLocationRef = useRef(parsedInitialQuery.location);
  const userEditedLocationRef = useRef(false);

  const openOnly = useCallback((panel) => {
    setShowLocation(panel === 'location');
    setShowCalendar(panel === 'calendar');
    setShowHowMany(panel === 'guests');
  }, []);

  const resetPreview = useCallback(() => {
    previewRequestIdRef.current += 1;
    setPreviewLoading(false);
    setPreviewResults([]);
    setShowPreview(false);
  }, []);

  // Mirror the shared cities/regions list into the filtered state once it arrives,
  // unless the user has already started typing a filter.
  useEffect(() => {
    if (!hasTyped) {
      setFilteredLocations(allLocations);
    }
  }, [allLocations, hasTyped]);

  // Fetch preview results when location is set (dates/guests optional)
  const fetchPreviewResults = useCallback(async (location, dateRange, guests) => {
    if (!location) {
      previewRequestIdRef.current += 1;
      return;
    }

    const requestId = previewRequestIdRef.current + 1;
    previewRequestIdRef.current = requestId;
    setPreviewLoading(true);
    setShowPreview(true);
    try {
      const params = {
        location: String(location).toLowerCase(),
        quantity: (guests?.adults || 1) + (guests?.children || 0) + (guests?.infants || 0),
      };
      if (dateRange?.from) params.start_date = formatDiscoveryDate(dateRange.from);
      if (dateRange?.to) params.end_date = formatDiscoveryDate(dateRange.to);
      const response = await homeSearch(params);
      if (previewRequestIdRef.current !== requestId) return;
      const items = (response?.data || []).slice(0, 5);
      setPreviewResults(items.map((item) => mapProductToItemCard(item)));
    } catch {
      if (previewRequestIdRef.current !== requestId) return;
      setPreviewResults([]);
    } finally {
      if (previewRequestIdRef.current === requestId) {
        setPreviewLoading(false);
      }
    }
  }, []);

  const { control, setValue, reset } = useForm({
    defaultValues: {
      whereTo: '',
      dateRange: parsedInitialQuery.dateRange,
      howMany: parsedInitialQuery.guests,
    },
  });

  const watchedWhereTo = useWatch({ control, name: 'whereTo' });
  const watchedFrom = useWatch({ control, name: 'dateRange' });
  const watchedhowMany = useWatch({ control, name: 'howMany' });

  const total = watchedhowMany?.adults + watchedhowMany?.children + watchedhowMany?.infants;

  useEffect(() => {
    pendingLocationRef.current = parsedInitialQuery.location;
    userEditedLocationRef.current = false;
    resetPreview();
    setActiveLocationIndex(-1);
    setInputValue('');
    setHowMany(parsedInitialQuery.guests);
    reset({
      whereTo: '',
      dateRange: parsedInitialQuery.dateRange,
      howMany: parsedInitialQuery.guests,
    });
  }, [parsedInitialQuery, reset, resetPreview]);

  useEffect(() => {
    const pendingLocation = pendingLocationRef.current;
    if (!pendingLocation || userEditedLocationRef.current) return;

    const match = allLocations.find((location) => {
      const slug = String(location.slug || '')
        .trim()
        .toLowerCase();
      const name = String(location.name || '')
        .trim()
        .toLowerCase();
      return slug === pendingLocation || name === pendingLocation;
    });

    if (match) {
      const locationValue = match.slug || match.name;
      setValue('whereTo', locationValue);
      setInputValue(match.name);
      pendingLocationRef.current = '';
      return;
    }

    if (!locationsLoading) {
      setValue('whereTo', '');
      setInputValue('');
      pendingLocationRef.current = '';
    }
  }, [allLocations, locationsLoading, parsedInitialQuery.location, setValue]);

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

  const handleLocationSelect = (location) => {
    const locationValue = location.slug || location.name;
    userEditedLocationRef.current = false;
    pendingLocationRef.current = '';
    setValue('whereTo', locationValue);
    setInputValue(location.name);
    setHasTyped(false);
    setFilteredLocations(allLocations);
    setActiveLocationIndex(-1);
    setShowLocation(false);
    fetchPreviewResults(locationValue, watchedFrom, howMany);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    userEditedLocationRef.current = true;
    pendingLocationRef.current = '';
    resetPreview();
    setValue('whereTo', '');
    setInputValue(value);
    setHasTyped(true);
    setActiveLocationIndex(-1);
    openOnly('location');

    if (value.trim() === '') {
      setFilteredLocations(allLocations);
      setHasTyped(false);
    } else {
      const filtered = allLocations.filter((loc) => loc.name.toLowerCase().startsWith(value.toLowerCase()));
      setFilteredLocations(filtered);
    }
  };

  const handleInputClick = () => {
    openOnly('location');
    setActiveLocationIndex(-1);
    if (!hasTyped) {
      setFilteredLocations(allLocations);
    }
  };

  const handleLocationKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!showLocation) openOnly('location');
      if (filteredLocations.length === 0) return;

      setActiveLocationIndex((currentIndex) => {
        if (event.key === 'ArrowDown') {
          return currentIndex >= filteredLocations.length - 1 ? 0 : currentIndex + 1;
        }
        return currentIndex <= 0 ? filteredLocations.length - 1 : currentIndex - 1;
      });
      return;
    }

    if (event.key === 'Enter' && showLocation && activeLocationIndex >= 0) {
      event.preventDefault();
      handleLocationSelect(filteredLocations[activeLocationIndex]);
      return;
    }

    if (event.key === 'Escape' && showLocation) {
      event.preventDefault();
      setShowLocation(false);
      setActiveLocationIndex(-1);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    onSearchStart?.();
    setNavigating(true);
    router.push(
      buildDiscoverySearchUrl({
        location: watchedWhereTo,
        dateRange: watchedFrom,
        guests: watchedhowMany,
      }),
    );
    openOnly(null);
  };

  return (
    <div className={isPill ? 'relative w-full' : 'relative w-full max-w-[860px]'}>
      <form onSubmit={handleSearch}>
        {controlsSlot}
        {/* Connected Filter Fields */}
        <div
          className={
            isPill
              ? 'grid grid-cols-1 items-stretch gap-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(210px,1fr)_minmax(0,1fr)_auto] sm:gap-0'
              : 'grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(190px,1fr)_minmax(0,1fr)_auto] sm:gap-0'
          }
        >
          {/* Where To */}
          <Popover
            open={showLocation}
            onOpenChange={(open) => {
              setShowLocation(open);
              if (open) {
                setShowCalendar(false);
                setShowHowMany(false);
              }
            }}
          >
            <PopoverPrimitive.Anchor asChild>
              <div className="flex-1 relative">
                <div
                  onClick={handleInputClick}
                  className={
                    isPill
                      ? 'relative flex min-h-16 items-center gap-3 rounded-2xl bg-muted/45 px-4 py-3 cursor-pointer sm:h-24 sm:rounded-none sm:bg-transparent sm:px-7 sm:py-0 sm:before:absolute sm:before:left-0 sm:before:top-1/2 sm:before:-translate-y-1/2 sm:before:h-8 sm:before:w-px sm:before:bg-border sm:first:before:hidden'
                      : 'flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] dark:shadow-none cursor-pointer sm:rounded-r-none'
                  }
                  style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
                >
                  <MapPin size={20} className="flex-shrink-0" style={{ color: 'hsl(var(--weelp-steel))' }} />
                  {isPill ? (
                    <div className="flex flex-1 flex-col leading-tight">
                      <span className="text-base font-semibold text-weelp-sage-text">Where to?</span>
                      <input
                        type="text"
                        placeholder="Search destinations"
                        aria-label="Where to?"
                        aria-autocomplete="list"
                        aria-controls={locationPanelId}
                        aria-activedescendant={showLocation && activeLocationIndex >= 0 ? `${locationPanelId}-option-${activeLocationIndex}` : undefined}
                        aria-expanded={showLocation ? 'true' : 'false'}
                        aria-haspopup="listbox"
                        role="combobox"
                        value={inputValue}
                        onChange={handleInputChange}
                        onClick={handleInputClick}
                        onKeyDown={handleLocationKeyDown}
                        className="w-full bg-transparent border-0 focus:outline-none text-sm font-normal placeholder:text-muted-foreground"
                        style={{ color: 'rgb(var(--label-rgb))', fontFamily: 'inherit' }}
                        autoComplete="off"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Where to?"
                      aria-label="Where to?"
                      aria-autocomplete="list"
                      aria-controls={locationPanelId}
                      aria-activedescendant={showLocation && activeLocationIndex >= 0 ? `${locationPanelId}-option-${activeLocationIndex}` : undefined}
                      aria-expanded={showLocation ? 'true' : 'false'}
                      aria-haspopup="listbox"
                      role="combobox"
                      value={inputValue}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                      onKeyDown={handleLocationKeyDown}
                      className="w-full bg-transparent border-0 focus:outline-none text-sm font-medium placeholder:text-muted-foreground"
                      style={{ color: 'rgb(var(--label-rgb))', fontFamily: 'inherit' }}
                      autoComplete="off"
                    />
                  )}
                </div>
              </div>
            </PopoverPrimitive.Anchor>
            <PopoverContent
              data-testid="filter-location-panel"
              id={locationPanelId}
              role="listbox"
              aria-label="Location suggestions"
              align="start"
              sideOffset={4}
              collisionPadding={16}
              onOpenAutoFocus={(event) => event.preventDefault()}
              className={`${PANEL_BASE_CLASS} w-[var(--radix-popover-trigger-width)] min-w-[260px] max-h-[min(18rem,var(--radix-popover-content-available-height,18rem))] overflow-y-auto p-0 text-foreground`}
            >
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc, index) => (
                  <button
                    key={loc.id}
                    id={`${locationPanelId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-label={`${loc.name} ${loc.type}`}
                    aria-selected={inputValue === loc.name ? 'true' : 'false'}
                    onClick={() => handleLocationSelect(loc)}
                    onMouseEnter={() => setActiveLocationIndex(index)}
                    className={`flex w-full items-center justify-between px-4 py-2 hover:bg-muted cursor-pointer text-left text-sm ${
                      activeLocationIndex === index ? 'bg-muted' : ''
                    } ${ROW_MOTION_CLASS}`}
                    style={{ transitionDelay: `${index * 35}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                      <span>{loc.name}</span>
                    </div>
                    <span className="text-[12px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{loc.type}</span>
                  </button>
                ))
              ) : locationsLoading ? null : (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">No cities match that yet.</div>
              )}
            </PopoverContent>
          </Popover>

          {/* When */}
          <Popover
            open={showCalendar}
            onOpenChange={(open) => {
              setShowCalendar(open);
              if (open) {
                setShowLocation(false);
                setShowHowMany(false);
              }
            }}
          >
            <div className="flex-1 relative">
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Choose dates"
                  className={
                    isPill
                      ? 'relative flex w-full min-h-16 items-center gap-3 rounded-2xl bg-muted/45 px-4 py-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 sm:h-24 sm:rounded-none sm:bg-transparent sm:px-7 sm:py-0 sm:before:absolute sm:before:left-0 sm:before:top-1/2 sm:before:-translate-y-1/2 sm:before:h-8 sm:before:w-px sm:before:bg-border'
                      : `${FIELD_TRIGGER_CLASS} sm:rounded-none`
                  }
                  style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
                >
                  <Calendar size={20} className="flex-shrink-0" style={{ color: 'hsl(var(--weelp-steel))' }} />
                  {isPill ? (
                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="text-base font-semibold text-weelp-sage-text">When?</span>
                      <span className="block min-w-[140px] truncate whitespace-nowrap text-sm font-normal" style={{ color: 'rgb(var(--label-rgb))' }}>
                        {watchedFrom?.from && watchedFrom?.to ? formatRange(new Date(watchedFrom.from), new Date(watchedFrom.to)) : 'Add dates'}
                      </span>
                    </span>
                  ) : (
                    <span className="block min-w-[180px] truncate whitespace-nowrap text-sm font-medium" style={{ color: 'rgb(var(--label-rgb))' }}>
                      {watchedFrom?.from && watchedFrom?.to ? formatRange(new Date(watchedFrom.from), new Date(watchedFrom.to)) : 'When?'}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
            </div>
            <PopoverContent
              data-testid="filter-calendar-panel"
              role="dialog"
              aria-label="Date selector"
              align="center"
              sideOffset={4}
              collisionPadding={16}
              className={`${PANEL_BASE_CLASS} w-auto max-w-[min(640px,calc(100vw-2rem))] p-2 text-foreground`}
            >
              <Controller
                name="dateRange"
                control={control}
                render={({ field }) => (
                  <WeelpCalendar
                    mode="range"
                    months={2}
                    selected={field.value}
                    disablePast
                    onSelect={(value) => {
                      field.onChange(value);
                      if (value?.from && value?.to && value.from.getTime() !== value.to.getTime()) {
                        setShowCalendar(false);
                        fetchPreviewResults(watchedWhereTo, value, howMany);
                      }
                    }}
                    showClear
                  />
                )}
              />
            </PopoverContent>
          </Popover>

          {/* How Many */}
          <Popover
            open={showHowMany}
            onOpenChange={(open) => {
              setShowHowMany(open);
              if (open) {
                setShowLocation(false);
                setShowCalendar(false);
              }
            }}
          >
            <div className="flex-1 relative">
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Choose guests"
                  className={
                    isPill
                      ? 'relative flex w-full min-h-16 items-center gap-3 rounded-2xl bg-muted/45 px-4 py-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 sm:h-24 sm:rounded-none sm:bg-transparent sm:px-7 sm:py-0 sm:before:absolute sm:before:left-0 sm:before:top-1/2 sm:before:-translate-y-1/2 sm:before:h-8 sm:before:w-px sm:before:bg-border'
                      : `${FIELD_TRIGGER_CLASS} sm:rounded-l-none`
                  }
                  style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
                >
                  <Users size={20} className="flex-shrink-0" style={{ color: 'hsl(var(--weelp-steel))' }} />
                  {isPill ? (
                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="text-base font-semibold text-weelp-sage-text">Who?</span>
                      <span data-testid="discovery-guest-total" className={`text-sm font-normal ${COUNT_MOTION_CLASS}`} style={{ color: 'rgb(var(--label-rgb))' }}>
                        <span key={total || 1} className={COUNT_NUMBER_MOTION_CLASS}>
                          {total || 1}
                        </span>
                        {` ${total === 1 ? 'Guest' : 'Guests'}`}
                      </span>
                    </span>
                  ) : (
                    <span data-testid="discovery-guest-total" className={`text-sm font-medium ${COUNT_MOTION_CLASS}`} style={{ color: 'rgb(var(--label-rgb))' }}>
                      <span key={total || 1} className={COUNT_NUMBER_MOTION_CLASS}>
                        {total || 1}
                      </span>
                      {` ${total === 1 ? 'Guest' : 'Guests'}`}
                    </span>
                  )}
                  {isPill && <ChevronDown size={18} className="ml-auto flex-shrink-0" style={{ color: 'rgb(var(--label-rgb))' }} />}
                </button>
              </PopoverTrigger>
            </div>
            <PopoverContent
              data-testid="filter-guests-panel"
              role="dialog"
              aria-label="Guest selector"
              align="end"
              sideOffset={4}
              collisionPadding={16}
              className={`${PANEL_BASE_CLASS} w-64 p-4 text-foreground`}
            >
              <p className="text-[12px] text-copy mb-3 pb-2 border-b border-border leading-snug">Adults 13+, children 2 to 12, infants under 2.</p>
              {['adults', 'children', 'infants'].map((type) => (
                <div key={type} className="flex justify-between items-center mb-3">
                  <div>
                    <span className="font-medium capitalize text-sm">{type}</span>
                    <span className="text-xs text-muted-foreground block">{type === 'adults' ? '13+ years' : type === 'children' ? '2-12 years' : 'Under 2'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Decrease ${type}`}
                      onClick={() => handleDecrement(type)}
                      disabled={howMany[type] <= (type === 'adults' ? 1 : 0)}
                      className={CONTROL_BUTTON_CLASS}
                    >
                      -
                    </button>
                    <span className={`w-6 text-center ${COUNT_MOTION_CLASS}`}>{howMany[type]}</span>
                    <button type="button" aria-label={`Increase ${type}`} onClick={() => handleIncrement(type)} className={CONTROL_BUTTON_CLASS}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </PopoverContent>
          </Popover>

          {!isModal && (
            <div className={`flex items-center justify-stretch sm:justify-end ${isPill ? 'sm:pr-5' : 'sm:pl-2'}`}>
              <button
                type="submit"
                aria-label="Search trips"
                className={
                  isPill
                    ? 'inline-flex h-[52px] min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-weelp-sage-deep px-8 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-weelp-sage-deep/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 motion-reduce:transition-none sm:h-16 sm:w-auto sm:min-w-[200px] sm:px-10'
                    : 'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-[18px] text-sm font-semibold text-Bluewhale shadow-[0_3px_9px_rgba(0,0,0,0.04)] transition-colors hover:bg-weelp-sage-wash hover:text-weelp-sage-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 motion-reduce:transition-none'
                }
              >
                <Search className="size-4" strokeWidth={2} />
                {isPill ? 'Search escapes' : 'Search'}
              </button>
            </div>
          )}
        </div>

        {isModal && (
          <button
            type="submit"
            aria-label="Search trips"
            disabled={isSearching}
            className="mx-auto mt-4 flex h-11 min-w-[160px] items-center justify-center rounded-full bg-weelp-sage-deep px-8 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-[background-color,box-shadow,transform] duration-200 ease-[var(--weelp-ease-out)] hover:bg-weelp-sage-hover hover:shadow-black/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait disabled:opacity-90 motion-reduce:transition-none"
          >
            {isSearching ? <span data-testid="search-submit-loader" className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" /> : 'Search'}
          </button>
        )}
      </form>

      {/* Preview Results Dropdown */}
      {showPreview && (
        <div
          ref={previewRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl shadow-lg dark:shadow-none border border-border overflow-hidden z-50"
          style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
        >
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors z-10"
            aria-label="Close preview"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
          {previewLoading ? (
            <div role="status" aria-label="Loading preview results" className="space-y-2 px-4 py-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  data-testid="filter-preview-skeleton-row"
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg bg-muted px-3 py-2.5 animate-pulse motion-reduce:animate-none"
                >
                  <span className="h-3 rounded bg-muted" />
                  <span className="h-5 w-20 rounded-md bg-muted" />
                  <span className="ml-auto h-3 w-14 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : previewResults.length > 0 ? (
            <div data-testid="filter-preview-results" data-state="open" className={`${PANEL_MOTION_CLASS} ${OPEN_PANEL_MOTION_CLASS}`}>
              {previewResults.map((item) => (
                <NavigationLink
                  key={item.id}
                  href={item.href}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 hover:bg-muted transition-colors border-b border-border last:border-b-0 pr-10"
                >
                  <span className="text-sm font-semibold text-foreground truncate text-left">{item.title}</span>
                  <span className="rounded-md bg-weelp-sage-deep/15 px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wider text-weelp-copy">{item.category}</span>
                  <span className="text-sm font-medium text-muted-foreground text-right">{item.price || ''}</span>
                </NavigationLink>
              ))}
              <NavigationLink
                href={buildDiscoverySearchUrl({
                  location: watchedWhereTo,
                  dateRange: watchedFrom,
                  guests: watchedhowMany,
                })}
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-weelp-copy hover:text-weelp-sage-text hover:bg-weelp-sage-deep/5 transition-colors border-t border-border"
              >
                See all matches
                <ChevronRight size={14} />
              </NavigationLink>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">Nothing matches that combination yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

export function HomeActivityItinerarySearch(props) {
  return <ActivityItinerarySearch presentation="home" {...props} />;
}

export function CompactActivityItinerarySearch(props) {
  return <ActivityItinerarySearch presentation="compact" {...props} />;
}

export function ResultsActivityItinerarySearch(props) {
  return <ActivityItinerarySearch presentation="results" {...props} />;
}

export function ModalActivityItinerarySearch(props) {
  return <ActivityItinerarySearch presentation="modal" {...props} />;
}
