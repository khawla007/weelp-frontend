'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { WeelpCalendar } from './WeelpCalendar';
import { formatRange, formatSingle } from './format';

const TRIGGER_FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40';

const TRIGGER_VARIANTS = {
  hero: `flex w-full items-center gap-3 rounded-xl border border-border bg-card px-6 py-[18px] text-left shadow-[0_3px_9px_rgba(0,0,0,0.04)] dark:shadow-none cursor-pointer ${TRIGGER_FOCUS}`,
  form: `flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm hover:border-weelp-sage-deep/40 ${TRIGGER_FOCUS}`,
  compact: `inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:border-weelp-sage-deep/40 ${TRIGGER_FOCUS}`,
};

function WeelpDateField({
  variant = 'form',
  label,
  placeholder = 'Select date',
  icon: Icon = CalendarIcon,
  mode = 'range',
  value,
  onChange,
  months = 2,
  align = 'start',
  minDate,
  maxDate,
  disablePast = false,
  disabled,
  showClear = true,
  formatRange: formatRangeProp = formatRange,
  formatSingle: formatSingleProp = formatSingle,
  triggerClassName,
  panelClassName,
  closeOnRangeComplete = true,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);

  const display = React.useMemo(() => {
    if (mode === 'range') return value?.from && value?.to ? formatRangeProp(value.from, value.to) : '';
    return value ? formatSingleProp(value) : '';
  }, [mode, value, formatRangeProp, formatSingleProp]);

  const disabledRule = disabled || (minDate && maxDate ? { before: minDate, after: maxDate } : minDate ? { before: minDate } : maxDate ? { after: maxDate } : undefined);

  const handleSelect = (next) => {
    onChange?.(next);
    const isRangeComplete = mode === 'range' && next?.from && next?.to && next.from.getTime() !== next.to.getTime();
    const isSingleSet = mode === 'single' && next;
    if ((isRangeComplete && closeOnRangeComplete) || isSingleSet) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(TRIGGER_VARIANTS[variant], triggerClassName)} aria-haspopup="dialog" aria-expanded={open}>
          {Icon ? <Icon size={20} className="flex-shrink-0 text-muted-foreground" /> : null}
          <span className="flex min-w-0 flex-1 flex-col">
            {label ? <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</span> : null}
            <span className={cn('truncate text-sm font-medium', display ? 'text-foreground' : 'text-muted-foreground')}>{display || placeholder}</span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className={cn('w-auto p-3', panelClassName)} sideOffset={6}>
        <WeelpCalendar mode={mode} months={months} selected={value} onSelect={handleSelect} disablePast={disablePast} disabled={disabledRule} showClear={showClear} {...rest} />
      </PopoverContent>
    </Popover>
  );
}

export { WeelpDateField };
