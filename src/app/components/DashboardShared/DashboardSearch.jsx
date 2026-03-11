'use client';

import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DashboardSearch - Reusable search input for dashboard sidebar filters
 *
 * @param {Control} control - React Hook Form control object (required)
 * @param {string} name - Form field name (default: "search")
 * @param {string} placeholder - Input placeholder text (default: "Search...")
 * @param {boolean} disabled - Disable the input (default: false)
 * @param {string} ariaLabel - Accessibility label (default: placeholder value)
 * @param {string} className - Additional CSS classes
 */
export function DashboardSearch({
  control,
  name = 'search',
  placeholder = 'Search...',
  disabled = false,
  ariaLabel,
  className,
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel || placeholder}
            className={cn(
              'w-full bg-white focus-visible:ring-secondaryDark pl-9',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...field}
          />
        </div>
      )}
    />
  );
}
