'use client';

import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const pad2 = (value) => String(value).padStart(2, '0');
const EMPTY_PARTS = { hour: '', minute: '', period: '' };
const HOURS = Array.from({ length: 12 }, (_, index) => pad2(index + 1));
const MINUTES = Array.from({ length: 60 }, (_, index) => pad2(index));
const PERIODS = ['AM', 'PM'];
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parse24HourTime(value) {
  const match = typeof value === 'string' ? value.match(TIME_PATTERN) : null;
  if (!match) return { ...EMPTY_PARTS };

  const hour24 = Number(match[1]);
  return {
    hour: pad2(((hour24 + 11) % 12) + 1),
    minute: match[2],
    period: hour24 >= 12 ? 'PM' : 'AM',
  };
}

export function to24HourTime({ hour, minute, period }) {
  if (!hour || !minute || !period) return '';

  let hour24 = Number(hour) % 12;
  if (period === 'PM') hour24 += 12;
  return `${pad2(hour24)}:${minute}`;
}

export default function TransferPickupTimePicker({ value, onChange }) {
  const [parts, setParts] = useState(() => parse24HourTime(value));

  useEffect(() => {
    setParts(parse24HourTime(value));
  }, [value]);

  const updatePart = (key, nextValue) => {
    const next = { ...parts, [key]: nextValue };
    setParts(next);
    onChange(to24HourTime(next));
  };

  const triggerClassName =
    'h-11 min-w-0 rounded-xl border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-weelp-sage-deep/50 focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/30 dark:shadow-none';
  const itemClassName = 'text-sm focus:bg-weelp-sage-deep focus:text-white data-[state=checked]:bg-weelp-sage-deep data-[state=checked]:text-white';
  const controls = [
    { key: 'hour', label: 'Pickup hour', placeholder: 'Hour', options: HOURS },
    { key: 'minute', label: 'Pickup minute', placeholder: 'Min', options: MINUTES },
    { key: 'period', label: 'Pickup period', placeholder: 'AM/PM', options: PERIODS },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-weelp-sage-deep/10 text-weelp-sage-text dark:bg-weelp-sage-deep/20">
          <Clock3 aria-hidden="true" className="h-4 w-4" />
        </span>
        <span>
          Pickup Time{' '}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
          <span className="sr-only"> required</span>
        </span>
      </div>

      <div role="group" aria-label="Pickup time" className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-2 rounded-2xl border border-border bg-muted/30 p-2">
        {controls.map((control, index) => (
          <div key={control.key} className="contents">
            {index === 1 && (
              <span aria-hidden="true" className="font-semibold text-muted-foreground">
                :
              </span>
            )}
            <Select value={parts[control.key]} onValueChange={(nextValue) => updatePart(control.key, nextValue)}>
              <SelectTrigger aria-label={control.label} aria-required="true" className={triggerClassName}>
                <SelectValue placeholder={control.placeholder} />
              </SelectTrigger>
              <SelectContent className="z-[200] max-h-60 min-w-[5rem]">
                {control.options.map((option) => (
                  <SelectItem key={option} value={option} className={itemClassName}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Your driver will arrive at the selected pickup time.</p>
    </div>
  );
}
