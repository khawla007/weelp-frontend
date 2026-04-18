'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Calendar as CalendarIcon, MapPin, Minus, Plus, Users } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import LocationComboboxPublic from './LocationComboboxPublic';
import { getPublicTransfersFiltered } from '@/lib/services/transfers';

/**
 * Live-filter transfers search — mirrors home-page FilterBar UX.
 * No submit button; results fire automatically on pickup/destination/passengers change.
 *
 * Props:
 *  - onResults: (transfers[]) => void
 *  - onLoadingChange: (loading: boolean) => void
 *  - onSubmitted: (meta) => void — fires whenever a filter request is dispatched
 *      meta: { pickupAt, passengers, origin, destination }
 */
const pad2 = (n) => String(n).padStart(2, '0');
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 1;
  return { value: String(h), label: pad2(h) };
});
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
  value: String(i),
  label: pad2(i),
}));
const AMPM_OPTIONS = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
];

const to24h = (hour12, minute, ampm) => {
  let h = parseInt(hour12, 10) % 12;
  if (ampm === 'PM') h += 12;
  return `${pad2(h)}:${pad2(parseInt(minute, 10) || 0)}`;
};

const from24h = (hhmm) => {
  const [h, m] = (hhmm || '10:00').split(':').map((n) => parseInt(n, 10) || 0);
  const hh = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return { hour: String(hh), minute: String(m), ampm };
};

export default function TransferSearchForm({ onResults, onLoadingChange, onSubmitted }) {
  const [dateOpen, setDateOpen] = useState(false);
  const [paxOpen, setPaxOpen] = useState(false);
  const [paxTouched, setPaxTouched] = useState(false);

  const { control, setValue, watch } = useForm({
    defaultValues: {
      pickup: null,
      destination: null,
      date: null,
      time: '10:00',
      adults: 1,
      children: 0,
      infants: 0,
    },
  });

  const adults = watch('adults');
  const children = watch('children');
  const infants = watch('infants');
  const date = watch('date');
  const time = watch('time');
  const pickup = watch('pickup');
  const destination = watch('destination');

  const totalPassengers = adults + children + infants;

  const handleSwap = () => {
    setValue('pickup', destination, { shouldValidate: false });
    setValue('destination', pickup, { shouldValidate: false });
  };

  const increment = (key) => {
    const current = watch(key);
    setValue(key, current + 1, { shouldValidate: false });
    setPaxTouched(true);
  };

  const decrement = (key) => {
    const current = watch(key);
    const min = key === 'adults' ? 1 : 0;
    setValue(key, Math.max(current - 1, min), { shouldValidate: false });
    setPaxTouched(true);
  };

  // Live filter: fire whenever pickup or destination changes (or passengers while locations set).
  const debounceRef = useRef(null);
  const reqIdRef = useRef(0);
  useEffect(() => {
    if (!pickup && !destination) {
      onResults?.([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const reqId = ++reqIdRef.current;
      try {
        onLoadingChange?.(true);
        const passengers = adults + children + infants;
        let pickupAtIso = null;
        if (date) {
          const d = date instanceof Date ? date : new Date(date);
          if (!Number.isNaN(d.getTime())) {
            const [h, m] = (time || '10:00').split(':').map((n) => parseInt(n, 10) || 0);
            const pad = (n) => String(n).padStart(2, '0');
            pickupAtIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}:00`;
          }
        }
        onSubmitted?.({
          pickupAt: pickupAtIso,
          passengers,
          adults,
          children,
          infants,
          origin: pickup,
          destination,
        });
        const params = {
          origin_type: pickup?.locatable_type,
          origin_id: pickup?.locatable_id,
          destination_type: destination?.locatable_type,
          destination_id: destination?.locatable_id,
          passengers,
        };
        const response = await getPublicTransfersFiltered(params);
        // Drop stale responses if a newer request fired while this was in-flight.
        if (reqId !== reqIdRef.current) return;
        onResults?.(response?.data ?? []);
      } catch (err) {
        console.error('[TransferSearchForm] filter error', err);
        if (reqId === reqIdRef.current) onResults?.([]);
      } finally {
        if (reqId === reqIdRef.current) onLoadingChange?.(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pickup, destination, adults, children, infants, date, time]);

  const formatDate = (d) => {
    if (!d) return 'When?';
    try {
      const datePart = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const [h, m] = (time || '10:00').split(':').map((n) => parseInt(n, 10) || 0);
      const hh = ((h + 11) % 12) + 1;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const timePart = `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
      return `${datePart}, ${timePart}`;
    } catch {
      return 'When?';
    }
  };

  return (
    <div className="mx-auto md:w-[735px] w-full relative flex flex-col gap-4">
      <div className="relative flex items-stretch bg-white rounded-xl border border-[#cccccc80] shadow-[0_3.39px_8.89px_#0000000a]">
        {/* Pickup */}
        <div className="flex-1 min-w-0 border-r border-[#cccccc80]">
          <Controller
            name="pickup"
            control={control}
            render={({ field }) => (
              <LocationComboboxPublic
                value={field.value}
                onChange={field.onChange}
                placeholder="Pickup Location"
                icon={MapPin}
              />
            )}
          />
        </div>

        {/* Swap button - absolute between pickup & destination */}
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap pickup and destination"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:left-1/4 z-20 w-[27px] h-[27px] rounded-full bg-white border border-[#cccccc80] flex items-center justify-center shadow-[0_3.39px_8.89px_#0000000a] hover:bg-[#f3f5f5]"
        >
          <ArrowLeftRight className="h-3 w-3 text-[#273f4e]" />
        </button>

        {/* Destination */}
        <div className="flex-1 min-w-0 border-r border-[#cccccc80]">
          <Controller
            name="destination"
            control={control}
            render={({ field }) => (
              <LocationComboboxPublic
                value={field.value}
                onChange={field.onChange}
                placeholder="Destination"
                icon={MapPin}
              />
            )}
          />
        </div>

        {/* Date */}
        <div className="flex-1 min-w-0 border-r border-[#cccccc80]">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="flex w-full items-center gap-2 py-[18px] px-4 text-left bg-transparent outline-none">
                <CalendarIcon className="h-5 w-5 shrink-0 text-[#5a5a5a]" />
                <span className={`truncate text-xs sm:text-sm font-medium ${date ? 'text-[#273f4e]' : 'text-[#5a5a5a]'}`}>{formatDate(date)}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-2"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={(e) => {
                const target = e.target;
                if (target instanceof Element && target.closest('[data-radix-popper-content-wrapper], [data-radix-select-viewport], [role="listbox"]')) {
                  e.preventDefault();
                }
              }}
            >
              <div className="flex items-center gap-2 px-2 pt-1 pb-2 border-b border-[#cccccc80] mb-1">
                <span className="text-xs font-medium text-[#273f4e] shrink-0">Pickup time</span>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => {
                    const parts = from24h(field.value);
                    const setPart = (key, v) => {
                      const next = { ...parts, [key]: v };
                      field.onChange(to24h(next.hour, next.minute, next.ampm));
                    };
                    const triggerCls = "h-8 rounded-full border-0 bg-[#558e7b] px-3 text-sm font-medium text-white focus:ring-2 focus:ring-[#558e7b]/40 [&>svg]:text-white [&>svg]:opacity-100";
                    const itemCls = "text-sm focus:bg-[#558e7b] focus:text-white data-[state=checked]:bg-[#558e7b] data-[state=checked]:text-white";
                    return (
                      <div className="flex items-center gap-1 flex-1">
                        <Select value={parts.hour} onValueChange={(v) => setPart('hour', v)}>
                          <SelectTrigger className={`${triggerCls} w-16`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[200] max-h-56 min-w-[4rem]">
                            {HOUR_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className={itemCls}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-[#273f4e] font-semibold">:</span>
                        <Select value={parts.minute} onValueChange={(v) => setPart('minute', v)}>
                          <SelectTrigger className={`${triggerCls} w-16`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[200] max-h-56 min-w-[4rem]">
                            {MINUTE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className={itemCls}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={parts.ampm} onValueChange={(v) => setPart('ampm', v)}>
                          <SelectTrigger className={`${triggerCls} w-16`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[200] min-w-[4rem]">
                            {AMPM_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className={itemCls}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }}
                />
                <button
                  type="button"
                  onClick={() => setDateOpen(false)}
                  disabled={!date}
                  className="rounded-md bg-[#558e7b] px-3 py-1 text-xs font-medium text-white hover:bg-[#558e7b]/90 disabled:opacity-40"
                >
                  Done
                </button>
              </div>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DayPicker
                    mode="single"
                    selected={field.value || undefined}
                    disabled={{ before: new Date() }}
                    onSelect={(value) => field.onChange(value || null)}
                    className="scale-90 origin-top-right [&_.rdp-selected_.rdp-day\_button]:!bg-[#558e7b] [&_.rdp-selected_.rdp-day\_button]:!text-white [&_.rdp-selected_.rdp-day\_button]:!border-0"
                    style={{ '--rdp-accent-color': '#558e7b', '--rdp-accent-background': '#558e7b' }}
                  />
                )}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Passengers */}
        <div className="flex-1 min-w-0">
          <Popover open={paxOpen} onOpenChange={setPaxOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="flex w-full items-center gap-2 py-[18px] px-4 text-left bg-transparent outline-none">
                <Users className="h-5 w-5 shrink-0 text-[#5a5a5a]" />
                <span className={`truncate text-xs sm:text-sm font-medium ${paxTouched ? 'text-[#273f4e]' : 'text-[#5a5a5a]'}`}>
                  {paxTouched ? `${totalPassengers} ${totalPassengers === 1 ? 'Person' : 'People'}` : 'How Many?'}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-4" align="end">
              <div className="flex flex-col gap-4">
                {[
                  { key: 'adults', label: 'Adults', sub: '13 or above', value: adults, min: 1 },
                  { key: 'children', label: 'Children', sub: 'Age 2-12', value: children, min: 0 },
                  { key: 'infants', label: 'Infants', sub: 'Under 2', value: infants, min: 0 },
                ].map((row) => (
                  <div key={row.key} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-[#273f4e] text-sm">{row.label}</h3>
                      <span className="text-xs text-[#5a5a5a]">{row.sub}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decrement(row.key)}
                        disabled={row.value <= row.min}
                        className="w-8 h-8 rounded-full border border-[#cccccc80] flex items-center justify-center text-[#273f4e] hover:bg-[#f3f5f5] disabled:opacity-40"
                        aria-label={`Decrease ${row.label}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-semibold text-[#273f4e] w-5 text-center">{row.value}</span>
                      <button
                        type="button"
                        onClick={() => increment(row.key)}
                        className="w-8 h-8 rounded-full border border-[#57947d] flex items-center justify-center text-[#57947d] hover:bg-[#f3f5f5]"
                        aria-label={`Increase ${row.label}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

    </div>
  );
}
