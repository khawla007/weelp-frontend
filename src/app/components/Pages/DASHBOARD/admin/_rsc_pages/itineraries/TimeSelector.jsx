'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function TimeSelector({ id, value, onChange }) {
  const parts = from24h(value);

  const setPart = (key, v) => {
    const next = { ...parts, [key]: v };
    onChange(to24h(next.hour, next.minute, next.ampm));
  };

  const triggerCls = 'h-8 rounded-full border-0 bg-[#558e7b] px-3 text-sm font-medium text-white focus:ring-2 focus:ring-[#558e7b]/40 [&>svg]:text-white [&>svg]:opacity-100';
  const itemCls = 'text-sm focus:bg-[#558e7b] focus:text-white data-[state=checked]:bg-[#558e7b] data-[state=checked]:text-white';

  return (
    <div className="flex items-center gap-1">
      <Select value={parts.hour} onValueChange={(v) => setPart('hour', v)}>
        <SelectTrigger className={`${triggerCls} w-16`} id={id}>
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
}
