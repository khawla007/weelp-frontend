'use client';

import { X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { ListingFilterPanel, ListingOptionGroup } from '@/app/components/Pages/FRONT_END/shared/ListingFilterPanel';
import ListingSearchSortControls, { ListingSearchControl, ListingSortControl } from '@/app/components/Pages/FRONT_END/shared/ListingSearchSortControls';

const DEFAULT_SORT = 'name_asc';

const SORT_OPTIONS = [
  { value: DEFAULT_SORT, label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'activities_desc', label: 'Most activities' },
  { value: 'country_asc', label: 'Country: A to Z' },
  { value: 'id_desc', label: 'Newest' },
];

export default function CitiesListingControls({ countries = [], seasons = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCountry = searchParams.get('country') || '';
  const selectedSeason = searchParams.get('season') || '';
  const searchValue = searchParams.get('search') || '';
  const selectedSort = searchParams.get('sort_by') || DEFAULT_SORT;
  const hasActiveFilters = Boolean(searchValue || selectedCountry || selectedSeason || selectedSort !== DEFAULT_SORT);

  const update = (mutations) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    Object.entries(mutations).forEach(([key, value]) => {
      if (!value || (key === 'sort_by' && value === DEFAULT_SORT)) params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setSingleFilter = (key, currentValue, nextValue) => {
    update({ [key]: currentValue === nextValue ? '' : nextValue });
  };

  return (
    <div className="flex flex-col gap-4" aria-label="City listing controls">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 lg:hidden">
        <ListingSearchSortControls
          searchParams={searchParams}
          sortOptions={SORT_OPTIONS}
          defaultSort={DEFAULT_SORT}
          searchLabel="Search cities"
          searchFormLabel="Search cities form"
          searchPlaceholder="Search cities"
          sortLabel="Sort cities"
          sortIdBase="cities-sort"
          onSearch={(value) => update({ search: value })}
          onSort={(value) => update({ sort_by: value })}
        />
        <div data-testid="mobile-city-filters" className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" className="min-h-11 w-full rounded-[11.5px]" aria-label="Open city filters">
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] max-w-[85vw] overflow-y-auto p-4 sm:w-[360px] sm:p-5">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow the city list.</SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <CityFilterPanel
                  countries={countries}
                  seasons={seasons}
                  selectedCountry={selectedCountry}
                  selectedSeason={selectedSeason}
                  searchParams={searchParams}
                  onSearch={(value) => update({ search: value })}
                  onCountryChange={(value) => setSingleFilter('country', selectedCountry, value)}
                  onSeasonChange={(value) => setSingleFilter('season', selectedSeason, value)}
                  className="p-0 shadow-none sm:p-0"
                />
              </div>
              <SheetClose asChild>
                <Button type="button" variant="outline" className="mt-4 min-h-11 w-full rounded-[11.5px]">
                  Done
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div data-testid="desktop-city-filters" className="hidden lg:block">
        <CityFilterPanel
          countries={countries}
          seasons={seasons}
          selectedCountry={selectedCountry}
          selectedSeason={selectedSeason}
          searchParams={searchParams}
          onSearch={(value) => update({ search: value })}
          onCountryChange={(value) => setSingleFilter('country', selectedCountry, value)}
          onSeasonChange={(value) => setSingleFilter('season', selectedSeason, value)}
          className="sticky top-28"
        />
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {searchValue && <FilterChip label={`Search: ${searchValue}`} onRemove={() => update({ search: '' })} />}
          {selectedCountry && <FilterChip label={countries.find((country) => country.slug === selectedCountry)?.name || selectedCountry} onRemove={() => update({ country: '' })} />}
          {selectedSeason && <FilterChip label={seasons.find((season) => season.slug === selectedSeason)?.name || selectedSeason} onRemove={() => update({ season: '' })} />}
          {selectedSort !== DEFAULT_SORT && (
            <FilterChip label={SORT_OPTIONS.find((option) => option.value === selectedSort)?.label || selectedSort} onRemove={() => update({ sort_by: DEFAULT_SORT })} />
          )}
          <NavigationLink
            href={pathname}
            className="inline-flex min-h-11 items-center rounded-[11.5px] border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition hover:border-weelp-sage-deep hover:text-weelp-sage-deep"
          >
            Clear all
          </NavigationLink>
        </div>
      )}
    </div>
  );
}

export function CitiesListingToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (!value || (key === 'sort_by' && value === DEFAULT_SORT)) params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <ListingSortControl
      searchParams={searchParams}
      sortOptions={SORT_OPTIONS}
      defaultSort={DEFAULT_SORT}
      sortLabel="Sort cities"
      sortIdBase="cities-sort"
      onSort={(value) => update('sort_by', value)}
      desktop
    />
  );
}

function CityFilterPanel({ countries, seasons, selectedCountry, selectedSeason, searchParams, onSearch, onCountryChange, onSeasonChange, className }) {
  return (
    <ListingFilterPanel testId="cities-filter-panel" className={className}>
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        <ListingSearchControl searchParams={searchParams} searchLabel="Search cities" searchFormLabel="Search cities form" searchPlaceholder="Search cities" onSearch={onSearch} desktop />
        <ListingOptionGroup
          title="Country"
          options={countries.map((country) => ({ value: country.slug, label: country.name }))}
          activeValues={selectedCountry ? [selectedCountry] : []}
          onToggle={onCountryChange}
          onClear={() => onCountryChange('')}
        />
        <ListingOptionGroup
          title="Season"
          options={seasons.map((season) => ({ value: season.slug, label: season.name }))}
          activeValues={selectedSeason ? [selectedSeason] : []}
          onToggle={onSeasonChange}
          onClear={() => onSeasonChange('')}
        />
      </div>
    </ListingFilterPanel>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <Button type="button" variant="outline" className="min-h-11 max-w-full px-3" onClick={onRemove} aria-label={`Remove ${label} filter`}>
      <span className="truncate">{label}</span>
      <X />
    </Button>
  );
}
