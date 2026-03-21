'use client';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { SelectField } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/components/SelectField';
import { DashboardSearch } from './DashboardSearch';

/**
 * FilterBar - Shared component for Search + Type + Status filters
 * Used across all dashboard listing pages (Reviews, Addons, etc.)
 *
 * @param {object} form - React Hook Form instance
 * @param {string} searchName - Form field name for search (default: 'search')
 * @param {string} searchPlaceholder - Placeholder for search input
 * @param {string} typeFieldName - Form field name for type filter
 * @param {string} typePlaceholder - Placeholder for type select
 * @param {Array} typeOptions - Options for type select [{value, label}]
 * @param {string} statusFieldName - Form field name for status filter
 * @param {string} statusPlaceholder - Placeholder for status select
 * @param {Array} statusOptions - Options for status select [{value, label}]
 */
export function FilterBar({
  form,
  searchName = 'search',
  searchPlaceholder = 'Search...',
  typeFieldName = 'type',
  typePlaceholder = 'All Types',
  typeOptions = [],
  statusFieldName = 'status',
  statusPlaceholder = 'All Status',
  statusOptions = [],
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Search Input */}
      <DashboardSearch control={form.control} name={searchName} placeholder={searchPlaceholder} className="w-[500px]" />

      {/* Type Filter */}
      {typeOptions.length > 0 && (
        <div className="w-[180px] shrink-0">
          <FormField
            control={form.control}
            name={typeFieldName}
            defaultValue="all"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectField data={typeOptions} value={field.value} onChange={field.onChange} placeholder={typePlaceholder} className="w-[180px] focus:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Status Filter */}
      {statusOptions.length > 0 && (
        <div className="w-[180px] shrink-0">
          <FormField
            control={form.control}
            name={statusFieldName}
            defaultValue="all"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectField data={statusOptions} value={field.value} onChange={field.onChange} placeholder={statusPlaceholder} className="w-[180px] focus:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
