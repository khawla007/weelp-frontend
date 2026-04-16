'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Calendar, Users, ChevronRight, Loader2, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { getCitiesRegions } from '@/lib/services/global';
import { toursSearch } from '@/lib/services/tours';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

export default function ToursFilterBar() {
  const [cities, setCities] = useState([]);

  // From / To state
  const [from, setFrom] = useState(null);
  const [filteredFromCities, setFilteredFromCities] = useState([]);
  const [fromInputValue, setFromInputValue] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const fromRef = useRef(null);
  const [fromHasTyped, setFromHasTyped] = useState(false);

  const [to, setTo] = useState(null);
  const [filteredToCities, setFilteredToCities] = useState([]);
  const [toInputValue, setToInputValue] = useState('');
  const [showToDropdown, setShowToDropdown] = useState(false);
  const toRef = useRef(null);
  const [toHasTyped, setToHasTyped] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [showCalendar, setShowCalendar] = useState(false);

  // Guests state
  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    infants: 0,
  });
  const [showGuests, setShowGuests] = useState(false);

  // Search results state
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const resultsRef = useRef(null);

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await getCitiesRegions();
        const cityList = Array.isArray(response) ? response : response?.data || [];
        setCities(cityList);
        setFilteredFromCities(cityList);
        setFilteredToCities(cityList);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      }
    };
    fetchCities();
  }, []);

  // Close from dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) {
        setShowFromDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close to dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toRef.current && !toRef.current.contains(e.target)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const hasAny = from || to || dateRange.from || dateRange.to ||
                   guests.adults + guests.children + guests.infants > 0;

    if (!hasAny) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const performSearch = async () => {
        setResultsLoading(true);
        try {
          const params = {
            from: from?.slug,
            to: to?.slug,
            start_date: dateRange.from ? dateRange.from.toISOString().split('T')[0] : undefined,
            end_date: dateRange.to ? dateRange.to.toISOString().split('T')[0] : undefined,
            quantity: guests.adults + guests.children + guests.infants || undefined,
          };

          const response = await toursSearch(params);
          const items = Array.isArray(response) ? response : response?.data || [];

          setResults(items.slice(0, 4));
          setShowResults(true);
        } catch (error) {
          console.error('Error searching tours:', error);
          setResults([]);
          setShowResults(false);
        } finally {
          setResultsLoading(false);
        }
      };

      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [from, to, dateRange, guests]);

  // From city input handler
  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setFromInputValue(value);
    setFromHasTyped(true);
    setShowFromDropdown(true);

    if (value.trim() === '') {
      setFilteredFromCities(cities);
      setFromHasTyped(false);
    } else {
      const filtered = cities.filter((city) =>
        city.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredFromCities(filtered);
    }
  };

  const handleFromInputClick = () => {
    setShowFromDropdown(true);
    setShowToDropdown(false);
    setShowCalendar(false);
    setShowGuests(false);
    if (!fromHasTyped) {
      setFilteredFromCities(cities);
    }
  };

  // To city input handler
  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToInputValue(value);
    setToHasTyped(true);
    setShowToDropdown(true);

    if (value.trim() === '') {
      setFilteredToCities(cities);
      setToHasTyped(false);
    } else {
      const filtered = cities.filter((city) =>
        city.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredToCities(filtered);
    }
  };

  const handleToInputClick = () => {
    setShowToDropdown(true);
    setShowFromDropdown(false);
    setShowCalendar(false);
    setShowGuests(false);
    if (!toHasTyped) {
      setFilteredToCities(cities);
    }
  };

  // Guest increment/decrement
  const handleGuestIncrement = (type) => {
    const maxes = { adults: 10, children: 10, infants: 5 };
    if (guests[type] < maxes[type]) {
      setGuests({ ...guests, [type]: guests[type] + 1 });
    }
  };

  const handleGuestDecrement = (type) => {
    const mins = { adults: 1, children: 0, infants: 0 };
    if (guests[type] > mins[type]) {
      setGuests({ ...guests, [type]: guests[type] - 1 });
    }
  };

  const totalGuests = guests.adults + guests.children + guests.infants;

  const handleResetFilters = () => {
    setFrom(null);
    setFromInputValue('');
    setFromHasTyped(false);
    setFilteredFromCities(cities);
    setShowFromDropdown(false);

    setTo(null);
    setToInputValue('');
    setToHasTyped(false);
    setFilteredToCities(cities);
    setShowToDropdown(false);

    setDateRange({ from: null, to: null });
    setShowCalendar(false);

    setGuests({ adults: 0, children: 0, infants: 0 });
    setShowGuests(false);

    setResults([]);
    setShowResults(false);
  };

  // Build URL for result row
  const buildResultUrl = (row) => {
    if (!row) return '/';

    const city_slug = row.city_slug || '';
    const item_type = row.type === 'activity' ? 'activities' : 'itineraries';
    const item_slug = row.slug || '';

    if (city_slug && item_slug) {
      return `/cities/${city_slug}/${item_type}/${item_slug}`;
    }
    if (item_slug) {
      return `/${item_type}/${item_slug}`;
    }
    return '/';
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:-space-x-px">
        {/* From */}
        <div className="flex-1 relative" ref={fromRef}>
          <div
            onClick={handleFromInputClick}
            className="flex items-center gap-3 rounded-xl border border-[#cccccc80] bg-white px-4 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-r-none"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
          >
            <MapPin size={20} className="flex-shrink-0" style={{ color: '#142a38b2' }} />
            <input
              type="text"
              placeholder="From?"
              value={fromInputValue}
              onChange={handleFromInputChange}
              onClick={handleFromInputClick}
              className="w-full bg-transparent border-0 focus:outline-none text-sm font-medium placeholder:text-[#5a5a5a]"
              style={{ color: '#5a5a5a', fontFamily: 'inherit' }}
              autoComplete="off"
            />
          </div>

          {/* From Dropdown */}
          {showFromDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border max-h-52 overflow-y-auto overflow-x-hidden z-[110] min-w-full w-max">
              {filteredFromCities.length > 0 ? (
                filteredFromCities.map((city) => (
                  <div
                    key={city.id}
                    onClick={() => {
                      setFrom(city);
                      setFromInputValue(city.name);
                      setShowFromDropdown(false);
                    }}
                    className="flex items-center justify-between gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="whitespace-nowrap">{city.name}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {city.type || 'city'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">No locations found</div>
              )}
            </div>
          )}
        </div>

        {/* Where To */}
        <div className="flex-1 relative" ref={toRef}>
          <div
            onClick={handleToInputClick}
            className="flex items-center gap-3 rounded-xl border border-[#cccccc80] bg-white px-4 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-none"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
          >
            <MapPin size={20} className="flex-shrink-0" style={{ color: '#142a38b2' }} />
            <input
              type="text"
              placeholder="Where To?"
              value={toInputValue}
              onChange={handleToInputChange}
              onClick={handleToInputClick}
              className="w-full bg-transparent border-0 focus:outline-none text-sm font-medium placeholder:text-[#5a5a5a]"
              style={{ color: '#5a5a5a', fontFamily: 'inherit' }}
              autoComplete="off"
            />
          </div>

          {/* Where To Dropdown */}
          {showToDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border max-h-52 overflow-y-auto overflow-x-hidden z-[110] min-w-full w-max">
              {filteredToCities.length > 0 ? (
                filteredToCities.map((city) => (
                  <div
                    key={city.id}
                    onClick={() => {
                      setTo(city);
                      setToInputValue(city.name);
                      setShowToDropdown(false);
                    }}
                    className="flex items-center justify-between gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="whitespace-nowrap">{city.name}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {city.type || 'city'}
                    </span>
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
              const opening = !showCalendar;
              if (opening && dateRange.from && dateRange.to) {
                setDateRange({ from: null, to: null });
              }
              setShowCalendar(opening);
              setShowFromDropdown(false);
              setShowToDropdown(false);
              setShowGuests(false);
            }}
            className="flex items-center gap-3 rounded-xl border border-[#cccccc80] bg-white px-4 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-none"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
          >
            <Calendar size={20} className="flex-shrink-0" style={{ color: '#142a38b2' }} />
            <span className="text-sm font-medium" style={{ color: '#5a5a5a' }}>
              {dateRange?.from && dateRange?.to
                ? `${dateRange.from.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                  })} - ${dateRange.to.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                  })}`
                : 'When?'}
            </span>
          </div>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div
              onMouseLeave={() => setShowCalendar(false)}
              className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-2 z-[110]"
            >
              <DayPicker
                mode="range"
                selected={dateRange}
                disabled={{ before: new Date() }}
                onSelect={(value) => {
                  setDateRange(value || { from: null, to: null });
                  if (value?.from && value?.to && value.from.getTime() !== value.to.getTime()) {
                    setShowCalendar(false);
                  }
                }}
                className="scale-90 origin-top-right"
                style={{ '--rdp-accent-color': '#558e7b', '--rdp-accent-background': '#558e7b' }}
              />
            </div>
          )}
        </div>

        {/* How Many */}
        <div className="flex-1 relative">
          <div
            onClick={() => {
              setShowGuests(!showGuests);
              setShowFromDropdown(false);
              setShowToDropdown(false);
              setShowCalendar(false);
            }}
            className="flex items-center gap-3 rounded-xl border border-[#cccccc80] bg-white px-4 py-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.04)] cursor-pointer sm:rounded-l-none"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
          >
            <Users size={20} className="flex-shrink-0" style={{ color: '#142a38b2' }} />
            <span className="text-sm font-medium" style={{ color: '#5a5a5a' }}>
              {totalGuests > 0 ? `${totalGuests} ${totalGuests === 1 ? 'Guest' : 'Guests'}` : 'How Many?'}
            </span>
          </div>

          {/* Guests Dropdown */}
          {showGuests && (
            <div
              onMouseLeave={() => setShowGuests(false)}
              className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-4 z-[110] w-64"
            >
              {['adults', 'children', 'infants'].map((type) => (
                <div key={type} className="flex justify-between items-center mb-3 last:mb-0">
                  <div>
                    <span className="font-medium capitalize text-sm">{type}</span>
                    <span className="text-xs text-gray-500 block">
                      {type === 'adults' ? '13+ years' : type === 'children' ? '2-12 years' : 'Under 2'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleGuestDecrement(type)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{guests[type]}</span>
                    <button
                      type="button"
                      onClick={() => handleGuestIncrement(type)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[100]"
          style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}
        >
          <button
            type="button"
            onClick={handleResetFilters}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
            aria-label="Close results"
          >
            <X size={18} className="text-red-500" />
          </button>

          {resultsLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((item) => (
                <NavigationLink
                  key={`${item.id}-${item.type}`}
                  href={buildResultUrl(item)}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 pr-10"
                >
                  <span className="text-sm font-semibold text-[#142a38] truncate text-left">
                    {item.name || item.title}
                  </span>
                  <span className="rounded-md bg-[#759c8d]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#759c8d]">
                    {item.type || 'item'}
                  </span>
                  <span className="text-sm font-medium text-[#5a5a5a] text-right">
                    {item.price ? `$${item.price}` : ''}
                  </span>
                </NavigationLink>
              ))}
            </>
          ) : (
            <div className="py-6 text-center text-sm text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
