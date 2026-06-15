'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Users, ChevronRight, X, Search } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { WeelpCalendar, formatRange } from '@/components/calendar';
import { homeSearch } from '@/lib/services/global';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import { useCitiesRegions } from '@/hooks/useCitiesRegions';

const PANEL_MOTION_CLASS = 'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none';
const OPEN_PANEL_MOTION_CLASS = 'opacity-100 translate-y-0 scale-100 animate-in fade-in-0 slide-in-from-top-1';
const CLOSED_PANEL_MOTION_CLASS = 'pointer-events-none opacity-0 -translate-y-1 scale-[0.98]';
const ROW_MOTION_CLASS =
  'animate-in fade-in-0 slide-in-from-top-1 transition-[opacity,transform] duration-150 ease-out opacity-100 translate-y-0 motion-reduce:transition-none motion-reduce:transform-none';
const COUNT_MOTION_CLASS = 'transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:transform-none';
const COUNT_NUMBER_MOTION_CLASS = 'inline-block animate-in fade-in-0 zoom-in-95 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:transform-none';
const CONTROL_BUTTON_CLASS =
  'w-8 h-8 rounded-full border flex items-center justify-center hover:bg-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40';
const FIELD_TRIGGER_CLASS =
  'flex w-full items-center gap-3 rounded-xl border border-[#e4e4e7] bg-white px-6 py-[18px] text-left shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40';
const PANEL_EXIT_MS = 160;
const CLOSED_PANEL_A11Y_PROPS = { 'aria-hidden': true, inert: true };

export default function FilterBar({ appearance = 'card' }) {
  const { data: allLocations, loading: locationsLoading } = useCitiesRegions();
  const isPill = appearance === 'pill';
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
  const previewRequestIdRef = useRef(0);
  const panelTimersRef = useRef({});
  const [locationPresence, setLocationPresence] = useState({ isMounted: false, state: 'closed' });
  const [calendarPresence, setCalendarPresence] = useState({ isMounted: false, state: 'closed' });
  const [guestsPresence, setGuestsPresence] = useState({ isMounted: false, state: 'closed' });

  const getPanelMotionClass = (state) => `${PANEL_MOTION_CLASS} ${state === 'open' ? OPEN_PANEL_MOTION_CLASS : CLOSED_PANEL_MOTION_CLASS}`;

  const clearPanelTimer = useCallback((panelName) => {
    if (panelTimersRef.current[panelName]) {
      window.clearTimeout(panelTimersRef.current[panelName]);
      panelTimersRef.current[panelName] = null;
    }
  }, []);

  const openPanel = useCallback(
    (panelName, setPanelPresence) => {
      clearPanelTimer(panelName);
      setPanelPresence({ isMounted: true, state: 'open' });
    },
    [clearPanelTimer],
  );

  const closePanel = useCallback(
    (panelName, setPanelPresence) => {
      clearPanelTimer(panelName);
      setPanelPresence((current) => (current.isMounted ? { isMounted: true, state: 'closed' } : current));
      panelTimersRef.current[panelName] = window.setTimeout(() => {
        setPanelPresence({ isMounted: false, state: 'closed' });
      }, PANEL_EXIT_MS);
    },
    [clearPanelTimer],
  );

  const openLocationPanel = useCallback(() => {
    setShowLocation(true);
    openPanel('location', setLocationPresence);
  }, [openPanel]);

  const closeLocationPanel = useCallback(() => {
    setShowLocation(false);
    closePanel('location', setLocationPresence);
  }, [closePanel]);

  const openCalendarPanel = useCallback(() => {
    setShowCalendar(true);
    openPanel('calendar', setCalendarPresence);
  }, [openPanel]);

  const closeCalendarPanel = useCallback(() => {
    setShowCalendar(false);
    closePanel('calendar', setCalendarPresence);
  }, [closePanel]);

  const openGuestsPanel = useCallback(() => {
    setShowHowMany(true);
    openPanel('guests', setGuestsPresence);
  }, [openPanel]);

  const closeGuestsPanel = useCallback(() => {
    setShowHowMany(false);
    closePanel('guests', setGuestsPresence);
  }, [closePanel]);

  useEffect(() => {
    return () => {
      Object.values(panelTimersRef.current).forEach((timer) => {
        if (timer) window.clearTimeout(timer);
      });
    };
  }, []);

  // Mirror the shared cities/regions list into the filtered state once it arrives,
  // unless the user has already started typing a filter.
  useEffect(() => {
    if (!hasTyped) {
      setFilteredLocations(allLocations);
    }
  }, [allLocations, hasTyped]);

  // Close location dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        closeLocationPanel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeLocationPanel]);

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
      if (dateRange?.from) params.start_date = dateRange.from.toISOString().split('T')[0];
      if (dateRange?.to) params.end_date = dateRange.to.toISOString().split('T')[0];
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

  const { control, setValue } = useForm({
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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHasTyped(true);
    openLocationPanel();

    if (value.trim() === '') {
      setFilteredLocations(allLocations);
      setHasTyped(false);
    } else {
      const filtered = allLocations.filter((loc) => loc.name.toLowerCase().startsWith(value.toLowerCase()));
      setFilteredLocations(filtered);
    }
  };

  const handleInputClick = () => {
    openLocationPanel();
    closeCalendarPanel();
    closeGuestsPanel();
    if (!hasTyped) {
      setFilteredLocations(allLocations);
    }
  };

  return (
    <div className={isPill ? 'relative w-full' : 'relative w-full max-w-[860px]'}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        {/* Connected Filter Fields */}
        <div
          className={
            isPill
              ? 'grid grid-cols-1 items-stretch sm:grid-cols-[minmax(0,1fr)_minmax(210px,1fr)_minmax(0,1fr)_auto] sm:gap-0'
              : 'grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(210px,1fr)_minmax(0,1fr)] sm:gap-0'
          }
        >
          {/* Where To */}
          <div className="flex-1 relative" ref={locationRef}>
            <div
              onClick={handleInputClick}
              className={
                isPill
                  ? 'flex items-center gap-3 bg-transparent px-6 h-14 cursor-pointer relative sm:border-l sm:border-[#e4e4e7] sm:first:border-l-0'
                  : 'flex items-center gap-3 rounded-xl border border-[#e4e4e7] bg-white px-6 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-r-none'
              }
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              <MapPin size={20} className="flex-shrink-0" style={{ color: '#435a67' }} />
              <input
                type="text"
                placeholder="Where to?"
                aria-label="Where to?"
                aria-autocomplete="list"
                aria-controls="filter-location-panel"
                aria-expanded={showLocation ? 'true' : 'false'}
                aria-haspopup="listbox"
                role="combobox"
                value={inputValue}
                onChange={handleInputChange}
                onClick={handleInputClick}
                className="w-full bg-transparent border-0 focus:outline-none text-sm font-medium placeholder:text-[#71717a]"
                style={{ color: '#71717a', fontFamily: 'inherit' }}
                autoComplete="off"
              />
            </div>

            {/* Location Dropdown */}
            {locationPresence.isMounted && (
              <div
                data-testid="filter-location-panel"
                id="filter-location-panel"
                data-state={locationPresence.state}
                role="listbox"
                aria-label="Location suggestions"
                {...(locationPresence.state === 'closed' ? CLOSED_PANEL_A11Y_PROPS : {})}
                className={`absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-72 overflow-y-auto z-[70] ${getPanelMotionClass(locationPresence.state)}`}
              >
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc, index) => (
                    <button
                      key={loc.id}
                      type="button"
                      role="option"
                      aria-label={`${loc.name} ${loc.type}`}
                      aria-selected={inputValue === loc.name ? 'true' : 'false'}
                      onClick={() => {
                        const locValue = loc.slug || loc.name;
                        setValue('whereTo', locValue);
                        setInputValue(loc.name);
                        setHasTyped(false);
                        setFilteredLocations(allLocations);
                        closeLocationPanel();
                        fetchPreviewResults(locValue, watchedFrom, howMany);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 hover:bg-zinc-100 cursor-pointer text-left text-sm ${ROW_MOTION_CLASS}`}
                      style={{ transitionDelay: `${index * 35}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-zinc-400 flex-shrink-0" />
                        <span>{loc.name}</span>
                      </div>
                      <span className="text-[12px] uppercase tracking-wider text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">{loc.type}</span>
                    </button>
                  ))
                ) : locationsLoading ? null : (
                  <div className="px-4 py-3 text-sm text-zinc-400 text-center">No cities match that yet.</div>
                )}
              </div>
            )}
          </div>

          {/* When */}
          <div className="flex-1 relative">
            <button
              type="button"
              aria-label="Choose dates"
              aria-expanded={showCalendar ? 'true' : 'false'}
              aria-haspopup="dialog"
              onClick={() => {
                const opening = !showCalendar;
                if (opening) {
                  openCalendarPanel();
                } else {
                  closeCalendarPanel();
                }
                closeLocationPanel();
                closeGuestsPanel();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openCalendarPanel();
                  closeLocationPanel();
                  closeGuestsPanel();
                }
              }}
              className={
                isPill
                  ? 'flex w-full items-center gap-3 bg-transparent px-6 h-14 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 sm:border-l sm:border-[#e4e4e7]'
                  : `${FIELD_TRIGGER_CLASS} sm:rounded-none`
              }
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              <Calendar size={20} className="flex-shrink-0" style={{ color: '#435a67' }} />
              <span className="block min-w-[180px] truncate whitespace-nowrap text-sm font-medium" style={{ color: '#71717a' }}>
                {watchedFrom?.from && watchedFrom?.to ? formatRange(new Date(watchedFrom.from), new Date(watchedFrom.to)) : 'When?'}
              </span>
            </button>

            {/* Calendar Dropdown */}
            {calendarPresence.isMounted && (
              <div
                data-testid="filter-calendar-panel"
                id="filter-calendar-panel"
                data-state={calendarPresence.state}
                role="dialog"
                aria-label="Date selector"
                {...(calendarPresence.state === 'closed' ? CLOSED_PANEL_A11Y_PROPS : {})}
                onMouseLeave={closeCalendarPanel}
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-lg shadow-lg border p-2 z-[70] ${getPanelMotionClass(calendarPresence.state)}`}
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
                          closeCalendarPanel();
                          fetchPreviewResults(watchedWhereTo, value, howMany);
                        }
                      }}
                      showClear
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* How Many */}
          <div className="flex-1 relative">
            <button
              type="button"
              aria-label="Choose guests"
              aria-expanded={showHowMany ? 'true' : 'false'}
              aria-haspopup="dialog"
              onClick={() => {
                if (showHowMany) {
                  closeGuestsPanel();
                } else {
                  openGuestsPanel();
                }
                closeLocationPanel();
                closeCalendarPanel();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openGuestsPanel();
                  closeLocationPanel();
                  closeCalendarPanel();
                }
              }}
              className={
                isPill
                  ? 'flex w-full items-center gap-3 bg-transparent px-6 h-14 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 sm:border-l sm:border-[#e4e4e7]'
                  : `${FIELD_TRIGGER_CLASS} sm:rounded-l-none`
              }
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
            >
              <Users size={20} className="flex-shrink-0" style={{ color: '#435a67' }} />
              <span data-testid="filter-guest-total" className={`text-sm font-medium ${COUNT_MOTION_CLASS}`} style={{ color: '#71717a' }}>
                <span key={total || 1} className={COUNT_NUMBER_MOTION_CLASS}>
                  {total || 1}
                </span>
                {` ${total === 1 ? 'Guest' : 'Guests'}`}
              </span>
            </button>

            {/* Guests Dropdown */}
            {guestsPresence.isMounted && (
              <div
                data-testid="filter-guests-panel"
                id="filter-guests-panel"
                data-state={guestsPresence.state}
                role="dialog"
                aria-label="Guest selector"
                {...(guestsPresence.state === 'closed' ? CLOSED_PANEL_A11Y_PROPS : {})}
                onMouseLeave={closeGuestsPanel}
                className={`absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-4 z-[70] w-64 ${getPanelMotionClass(guestsPresence.state)}`}
              >
                <p className="text-[12px] text-[#52525b] mb-3 pb-2 border-b border-[#e4e4e7] leading-snug">Adults 13+, children 2 to 12, infants under 2.</p>
                {['adults', 'children', 'infants'].map((type) => (
                  <div key={type} className="flex justify-between items-center mb-3">
                    <div>
                      <span className="font-medium capitalize text-sm">{type}</span>
                      <span className="text-xs text-zinc-500 block">{type === 'adults' ? '13+ years' : type === 'children' ? '2-12 years' : 'Under 2'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" aria-label={`Decrease ${type}`} onClick={() => handleDecrement(type)} className={CONTROL_BUTTON_CLASS}>
                        -
                      </button>
                      <span className={`w-6 text-center ${COUNT_MOTION_CLASS}`}>{howMany[type]}</span>
                      <button type="button" aria-label={`Increase ${type}`} onClick={() => handleIncrement(type)} className={CONTROL_BUTTON_CLASS}>
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isPill && (
            <div className="flex items-center justify-end p-2 sm:p-1.5">
              <Link
                href={buildSearchUrl(watchedWhereTo, watchedFrom, watchedhowMany)}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-weelp-sage-deep px-7 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-weelp-sage-deep/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 motion-reduce:transition-none"
              >
                <Search className="size-4" strokeWidth={2} />
                Search escapes
              </Link>
            </div>
          )}
        </div>
      </form>

      {/* Preview Results Dropdown */}
      {showPreview && (
        <div
          ref={previewRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden z-50"
          style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
        >
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors z-10"
            aria-label="Close preview"
          >
            <X size={14} className="text-zinc-400" />
          </button>
          {previewLoading ? (
            <div role="status" aria-label="Loading preview results" className="space-y-2 px-4 py-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  data-testid="filter-preview-skeleton-row"
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2.5 animate-pulse motion-reduce:animate-none"
                >
                  <span className="h-3 rounded bg-zinc-200" />
                  <span className="h-5 w-20 rounded-md bg-zinc-200" />
                  <span className="ml-auto h-3 w-14 rounded bg-zinc-200" />
                </div>
              ))}
            </div>
          ) : previewResults.length > 0 ? (
            <div data-testid="filter-preview-results" data-state="open" className={`${PANEL_MOTION_CLASS} ${OPEN_PANEL_MOTION_CLASS}`}>
              {previewResults.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-b-0 pr-10"
                >
                  <span className="text-sm font-semibold text-[#18181b] truncate text-left">{item.title}</span>
                  <span className="rounded-md bg-weelp-sage-deep/15 px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wider text-weelp-copy">{item.category}</span>
                  <span className="text-sm font-medium text-[#71717a] text-right">{item.price || ''}</span>
                </Link>
              ))}
              <Link
                href={buildSearchUrl(watchedWhereTo, watchedFrom, watchedhowMany)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-weelp-copy hover:text-weelp-sage-deep hover:bg-weelp-sage-deep/5 transition-colors border-t border-zinc-100"
              >
                See all matches
                <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-zinc-400">Nothing matches that combination yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
