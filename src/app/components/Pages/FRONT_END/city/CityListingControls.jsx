'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ListingFilterPanel, ListingOptionGroup, ListingPriceRange, ListingRatingFilter } from '@/app/components/Pages/FRONT_END/shared/ListingFilterPanel';
import ListingSearchSortControls, { ListingSearchControl, ListingSortControl } from '@/app/components/Pages/FRONT_END/shared/ListingSearchSortControls';

const DEFAULT_SORT = 'id_desc';
let pendingQuery = null;
let committedQuery = '';
let queryPathname = null;

const SORT_OPTIONS = [
  { value: DEFAULT_SORT, label: 'Newest' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
];

const csvValues = (value) => (value ? value.split(',').filter(Boolean) : []);

export default function CityListingControls({ categories = [], tags = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();
  const activeCategories = csvValues(searchParams.get('categories'));
  const activeTags = csvValues(searchParams.get('tags'));
  const activeRating = Number(searchParams.get('min_rating') || 0);
  const priceKey = `${searchParams.get('min_price') || 0}-${searchParams.get('max_price') || 5000}`;

  useEffect(() => {
    queryPathname = pathname;
    committedQuery = currentQuery;
    pendingQuery = null;
  }, [currentQuery]);

  const navigate = (mutations) => {
    const sourceParams = queryPathname === pathname ? (pendingQuery !== null ? pendingQuery : committedQuery) : currentQuery;
    const params = new URLSearchParams(sourceParams);
    params.delete('page');
    Object.entries(mutations).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || (key === 'sort_by' && value === DEFAULT_SORT)) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    pendingQuery = params;
    queryPathname = pathname;
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const toggleCsvValue = (key, value) => {
    if (!value) {
      navigate({ [key]: '' });
      return;
    }
    const sourceParams = queryPathname === pathname && pendingQuery !== null ? pendingQuery : searchParams;
    const values = new Set(csvValues(sourceParams.get(key)));
    if (values.has(value)) values.delete(value);
    else values.add(value);
    navigate({ [key]: [...values].sort().join(',') });
  };

  const submitPrices = ([minimum, maximum]) => {
    navigate({
      min_price: String(minimum),
      max_price: String(maximum),
    });
  };

  return (
    <div className="flex flex-col gap-4" aria-label="Listing controls">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 lg:hidden">
        <ListingSearchSortControls
          searchParams={searchParams}
          sortOptions={SORT_OPTIONS}
          defaultSort={DEFAULT_SORT}
          searchLabel="Search listings"
          searchFormLabel="Search city listings"
          searchPlaceholder="Search listings"
          sortLabel="Sort listings"
          sortIdBase="listing-sort"
          onSearch={(value) => navigate({ search: value })}
          onSort={(value) => navigate({ sort_by: value })}
        />
        <div data-testid="mobile-listing-filters" className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" className="min-h-11 w-full rounded-[11.5px]" aria-label="Open filters">
                <SlidersHorizontal /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] max-w-[85vw] overflow-y-auto p-4 sm:w-[360px] sm:p-5">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow the results for this city.</SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <ListingFilterPanel className="p-0 shadow-none sm:p-0">
                  <FilterFields
                    key={`mobile-${priceKey}`}
                    categories={categories}
                    tags={tags}
                    activeCategories={activeCategories}
                    activeTags={activeTags}
                    activeRating={activeRating}
                    searchParams={searchParams}
                    onToggle={toggleCsvValue}
                    onPriceChange={submitPrices}
                    onRatingChange={(rating) => navigate({ min_rating: rating ? String(rating) : '' })}
                  />
                </ListingFilterPanel>
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

      <div data-testid="desktop-listing-filters" className="hidden lg:block">
        <ListingFilterPanel testId="listing-filter-panel" className="sticky top-28">
          <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
            <ListingSearchControl
              searchParams={searchParams}
              searchLabel="Search listings"
              searchFormLabel="Search city listings"
              searchPlaceholder="Search listings"
              onSearch={(value) => navigate({ search: value })}
              desktop
            />
            <FilterFields
              key={`desktop-${priceKey}`}
              categories={categories}
              tags={tags}
              activeCategories={activeCategories}
              activeTags={activeTags}
              activeRating={activeRating}
              searchParams={searchParams}
              onToggle={toggleCsvValue}
              onPriceChange={submitPrices}
              onRatingChange={(rating) => navigate({ min_rating: rating ? String(rating) : '' })}
            />
          </div>
        </ListingFilterPanel>
      </div>

      {(activeCategories.length > 0 || activeTags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {activeCategories.map((slug) => (
            <FilterChip key={`category-${slug}`} label={categories.find((item) => item.slug === slug)?.name || slug} onRemove={() => toggleCsvValue('categories', slug)} />
          ))}
          {activeTags.map((slug) => (
            <FilterChip key={`tag-${slug}`} label={tags.find((item) => item.slug === slug)?.name || slug} onRemove={() => toggleCsvValue('tags', slug)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CityListingToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key, value) => {
    const sharedQuery = queryPathname === pathname ? (pendingQuery !== null ? pendingQuery : committedQuery) : searchParams.toString();
    const params = new URLSearchParams(sharedQuery);
    params.delete('page');
    if (!value || (key === 'sort_by' && value === DEFAULT_SORT)) params.delete(key);
    else params.set(key, value);
    pendingQuery = params;
    queryPathname = pathname;
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <ListingSortControl
      searchParams={searchParams}
      sortOptions={SORT_OPTIONS}
      defaultSort={DEFAULT_SORT}
      sortLabel="Sort listings"
      sortIdBase="listing-sort"
      onSort={(value) => update('sort_by', value)}
      desktop
    />
  );
}

function FilterFields({ categories, tags, activeCategories, activeTags, activeRating, searchParams, onToggle, onPriceChange, onRatingChange }) {
  const [priceRange, setPriceRange] = useState([Number(searchParams.get('min_price') || 0), Number(searchParams.get('max_price') || 5000)]);
  const priceTimer = useRef(null);

  useEffect(() => () => clearTimeout(priceTimer.current), []);

  const changePrice = (nextRange) => {
    setPriceRange(nextRange);
    clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => onPriceChange(nextRange), 500);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
      <ListingOptionGroup
        title="Categories"
        options={categories.map((option) => ({ value: option.slug, label: option.name }))}
        activeValues={activeCategories}
        onToggle={(value) => onToggle('categories', value)}
        onClear={() => onToggle('categories', '')}
      />
      <ListingOptionGroup
        title="Tags"
        options={tags.map((option) => ({ value: option.slug, label: option.name }))}
        activeValues={activeTags}
        onToggle={(value) => onToggle('tags', value)}
        onClear={() => onToggle('tags', '')}
      />
      <ListingPriceRange value={priceRange} onChange={changePrice} />
      <ListingRatingFilter value={activeRating} onChange={onRatingChange} />
    </div>
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
