'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Calendar as CalendarIcon, MapPin, Minus, Plus, Users } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeelpCalendar } from '@/components/calendar';
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
    <div className="relative mx-auto flex w-full flex-col gap-4 md:w-[735px]">
      <div
        data-transfer-search-grid
        className="relative grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_10px_30px_rgba(24,24,27,0.08)] dark:shadow-none sm:flex sm:items-stretch sm:rounded-xl sm:shadow-none"
      >
        {/* Pickup */}
        <div data-testid="transfer-pickup-field" className="col-span-2 min-w-0 border-b border-border sm:col-span-1 sm:flex-1 sm:border-r sm:border-b-0">
          <Controller name="pickup" control={control} render={({ field }) => <LocationComboboxPublic value={field.value} onChange={field.onChange} placeholder="Pickup Location" icon={MapPin} />} />
        </div>

        {/* Swap button - absolute between pickup & destination */}
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap pickup and destination"
          className="absolute left-1/2 top-[58px] z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-[4px_4px_12px_rgba(0,0,0,0.1)] dark:shadow-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:left-1/4 sm:top-1/2 lg:h-[27px] lg:w-[27px]"
        >
          <ArrowLeftRight className="h-3 w-3 text-foreground" />
        </button>

        {/* Destination */}
        <div data-testid="transfer-destination-field" className="col-span-2 min-w-0 border-b border-border sm:col-span-1 sm:flex-1 sm:border-r sm:border-b-0">
          <Controller name="destination" control={control} render={({ field }) => <LocationComboboxPublic value={field.value} onChange={field.onChange} placeholder="Destination" icon={MapPin} />} />
        </div>

        {/* Date */}
        <div className="min-w-0 border-r border-border sm:flex-1">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="flex w-full items-center gap-2 py-[18px] px-4 text-left bg-transparent outline-none">
                <CalendarIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className={`truncate text-xs sm:text-sm font-medium ${date ? 'text-foreground' : 'text-muted-foreground'}`}>{formatDate(date)}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              data-testid="transfer-date-popover"
              collisionPadding={16}
              className="max-h-[var(--radix-popover-content-available-height)] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto p-0 sm:w-auto sm:p-2"
              align="center"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={(e) => {
                const target = e.target;
                if (target instanceof Element && target.closest('[data-radix-popper-content-wrapper], [data-radix-select-viewport], [role="listbox"]')) {
                  e.preventDefault();
                }
              }}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 border-b border-border px-1 pb-2 pt-1 sm:px-2">
                <span className="w-full shrink-0 text-xs font-medium text-foreground sm:w-auto">Pickup time</span>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => {
                    const parts = from24h(field.value);
                    const setPart = (key, v) => {
                      const next = { ...parts, [key]: v };
                      field.onChange(to24h(next.hour, next.minute, next.ampm));
                    };
                    const triggerCls =
                      'h-8 rounded-full border-0 bg-weelp-sage-deep px-2 text-sm font-medium text-white focus:ring-2 focus:ring-weelp-sage-deep/40 [&>svg]:text-white [&>svg]:opacity-100 sm:px-3';
                    const itemCls = 'text-sm focus:bg-weelp-sage-deep focus:text-white data-[state=checked]:bg-weelp-sage-deep data-[state=checked]:text-white';
                    return (
                      <div data-testid="transfer-time-controls" className="flex min-w-0 flex-1 items-center gap-1">
                        <Select value={parts.hour} onValueChange={(v) => setPart('hour', v)}>
                          <SelectTrigger data-testid="transfer-time-hour" className={`${triggerCls} w-[58px] sm:w-16`}>
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
                        <span className="text-foreground font-semibold">:</span>
                        <Select value={parts.minute} onValueChange={(v) => setPart('minute', v)}>
                          <SelectTrigger data-testid="transfer-time-minute" className={`${triggerCls} w-[58px] sm:w-16`}>
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
                          <SelectTrigger data-testid="transfer-time-period" className={`${triggerCls} w-[58px] sm:w-16`}>
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
                  className="shrink-0 rounded-md bg-weelp-sage-deep px-2 py-1 text-xs font-medium text-white hover:bg-weelp-sage-hover disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-3"
                >
                  Done
                </button>
              </div>
              <Controller
                name="date"
                control={control}
                render={({ field }) => <WeelpCalendar mode="single" months={1} selected={field.value || undefined} disablePast onSelect={(value) => field.onChange(value || null)} showClear />}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Passengers */}
        <div className="min-w-0 sm:flex-1">
          <Popover open={paxOpen} onOpenChange={setPaxOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="flex w-full items-center gap-2 py-[18px] px-4 text-left bg-transparent outline-none">
                <Users className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className={`truncate text-xs sm:text-sm font-medium ${paxTouched ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {paxTouched ? `${totalPassengers} ${totalPassengers === 1 ? 'Person' : 'People'}` : 'How Many?'}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent data-testid="transfer-passenger-popover" collisionPadding={16} className="w-[calc(100vw-2rem)] max-w-[280px] p-4" align="center">
              <div className="flex flex-col gap-4">
                {[
                  { key: 'adults', label: 'Adults', sub: '13 or above', value: adults, min: 1 },
                  { key: 'children', label: 'Children', sub: 'Age 2-12', value: children, min: 0 },
                  { key: 'infants', label: 'Infants', sub: 'Under 2', value: infants, min: 0 },
                ].map((row) => (
                  <div key={row.key} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{row.label}</h3>
                      <span className="text-xs text-muted-foreground">{row.sub}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decrement(row.key)}
                        disabled={row.value <= row.min}
                        className="h-11 w-11 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-40 lg:h-8 lg:w-8"
                        aria-label={`Decrease ${row.label}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-semibold text-foreground w-5 text-center">{row.value}</span>
                      <button
                        type="button"
                        onClick={() => increment(row.key)}
                        className="h-11 w-11 rounded-full border border-weelp-sage-deep flex items-center justify-center text-weelp-sage-text hover:bg-muted lg:h-8 lg:w-8"
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
