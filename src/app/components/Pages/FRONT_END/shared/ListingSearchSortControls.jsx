'use client';

import { ChevronDown, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FILTER_FONT } from './ListingFilterPanel';

export default function ListingSearchSortControls({
  searchParams,
  sortOptions,
  defaultSort,
  sortLabel = 'Sort listings',
  searchLabel = 'Search listings',
  searchFormLabel = 'Search listings form',
  searchPlaceholder = 'Search listings',
  sortIdBase = 'listing-sort',
  onSearch,
  onSort,
  desktop = false,
}) {
  return (
    <>
      <ListingSearchControl searchParams={searchParams} searchLabel={searchLabel} searchFormLabel={searchFormLabel} searchPlaceholder={searchPlaceholder} onSearch={onSearch} desktop={desktop} />
      <ListingSortControl searchParams={searchParams} sortOptions={sortOptions} defaultSort={defaultSort} sortLabel={sortLabel} sortIdBase={sortIdBase} onSort={onSort} desktop={desktop} />
    </>
  );
}

export function ListingSearchControl({ searchParams, searchLabel = 'Search listings', searchFormLabel = 'Search listings form', searchPlaceholder = 'Search listings', onSearch, desktop = false }) {
  const submitSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSearch(String(formData.get('search') || '').trim());
  };

  return (
    <form aria-label={searchFormLabel} className={desktop ? 'flex min-w-0 gap-2' : 'col-span-2 flex min-w-0 gap-2'} onSubmit={submitSearch}>
      <Input
        key={`${searchLabel}-${desktop}-${searchParams.get('search') || ''}`}
        name="search"
        type="search"
        aria-label={searchLabel}
        defaultValue={searchParams.get('search') || ''}
        placeholder={searchPlaceholder}
        className="min-h-11 min-w-0"
      />
      <Button
        type="submit"
        size="icon"
        variant="outline"
        className="size-11 shrink-0 border-weelp-sage-deep bg-weelp-sage-deep text-white hover:!border-weelp-sage-deep hover:!bg-background hover:!text-weelp-sage-deep"
        aria-label="Submit search"
      >
        <Search />
      </Button>
    </form>
  );
}

export function ListingSortControl({ searchParams, sortOptions, defaultSort, sortLabel = 'Sort listings', sortIdBase = 'listing-sort', onSort, desktop = false }) {
  const sortId = `${sortIdBase}-${desktop ? 'desktop' : 'mobile'}`;

  return (
    <div className={desktop ? 'relative ml-auto w-fit' : 'relative min-w-0'}>
      <label className="sr-only" htmlFor={sortId}>
        {sortLabel}
      </label>
      <select
        id={sortId}
        aria-label={sortLabel}
        className="min-h-11 w-full appearance-none rounded-[7.86px] border border-[rgba(67,90,103,0.26)] bg-muted py-2 pl-4 pr-10 text-sm font-medium text-weelp-steel transition hover:bg-background md:text-base"
        style={FILTER_FONT}
        value={searchParams.get('sort_by') || defaultSort}
        onChange={(event) => onSort(event.target.value)}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-weelp-steel" />
    </div>
  );
}
