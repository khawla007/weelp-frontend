'use client';

import ReactRangeSliderInput from 'react-range-slider-input';
import { Star } from 'lucide-react';
import 'react-range-slider-input/dist/style.css';
import '@/app/styles/range-slider.css';

import { cn } from '@/lib/utils';

export const FILTER_FONT = { fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' };

export function ListingFilterPanel({ children, className, testId }) {
  return (
    <div data-testid={testId} className={cn('h-fit w-full rounded-[11.5px] border border-border bg-background p-4 shadow-sm dark:shadow-none sm:p-5 lg:max-w-xs lg:p-6 lg:px-7', className)}>
      {children}
    </div>
  );
}

export function ListingFilterSection({ title, children, className }) {
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-4 text-base font-medium text-foreground md:text-[16px] lg:text-[18px]" style={FILTER_FONT}>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function ListingPriceRange({ value, onChange, disabled = false }) {
  return (
    <ListingFilterSection title="Price">
      <div className={cn(disabled && 'pointer-events-none opacity-50')}>
        <ReactRangeSliderInput min={0} max={5000} step={10} value={value} onInput={onChange} ariaLabel={['Minimum price', 'Maximum price']} className="city-price-slider w-full" disabled={disabled} />
        <div className="mt-2 flex justify-between">
          <span className="text-[14px] font-medium text-weelp-steel" style={FILTER_FONT}>
            ${value[0]}
          </span>
          <span className="text-[14px] font-medium text-weelp-steel" style={FILTER_FONT}>
            ${value[1]}
          </span>
        </div>
      </div>
    </ListingFilterSection>
  );
}

export function ListingOptionGroup({ title, options, activeValues, onToggle, onClear, disabled = false }) {
  return (
    <ListingFilterSection title={title}>
      <div className={cn('flex max-h-72 flex-col gap-1 overflow-y-auto', disabled && 'pointer-events-none opacity-50')}>
        <label className="flex min-h-11 cursor-pointer items-center gap-2">
          <input type="checkbox" checked={activeValues.length === 0} onChange={onClear} disabled={disabled} className="size-[19px] rounded-[2px] accent-weelp-sage-deep" />
          <span className={cn('text-[18px] font-medium', activeValues.length === 0 ? 'text-weelp-sage-text' : 'text-weelp-steel')} style={FILTER_FONT}>
            All
          </span>
        </label>
        {options.map((option) => {
          const active = activeValues.includes(option.value);
          return (
            <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-2">
              <input type="checkbox" checked={active} onChange={() => onToggle(option.value)} disabled={disabled} className="size-[19px] rounded-[2px] accent-weelp-sage-deep" />
              <span className={cn('break-words text-[18px] font-medium', active ? 'text-weelp-sage-text' : 'text-weelp-steel')} style={FILTER_FONT}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </ListingFilterSection>
  );
}

export function ListingRatingFilter({ value, onChange, disabled = false }) {
  return (
    <ListingFilterSection title="Ratings">
      <div className={cn('flex flex-col gap-1', disabled && 'pointer-events-none opacity-50')}>
        <label className="flex min-h-11 cursor-pointer items-center gap-2">
          <input type="radio" name="rating" checked={value === 0} onChange={() => onChange(0)} disabled={disabled} className="size-[19px] accent-weelp-sage-deep" />
          <span className={cn('text-[18px] font-medium', value === 0 ? 'text-weelp-sage-text' : 'text-weelp-steel')} style={FILTER_FONT}>
            All
          </span>
        </label>
        {[5, 4, 3].map((rating) => (
          <label key={rating} className="flex min-h-11 cursor-pointer items-center gap-2" aria-label={`${rating} stars and up`}>
            <input type="radio" name="rating" checked={value === rating} onChange={() => onChange(rating)} disabled={disabled} className="size-[19px] accent-weelp-sage-deep" />
            <span className="flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={19} className={index < rating ? 'fill-warning stroke-none' : 'fill-none stroke-warning'} strokeWidth={2} />
              ))}
            </span>
          </label>
        ))}
      </div>
    </ListingFilterSection>
  );
}
