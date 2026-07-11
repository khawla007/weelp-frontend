import { ChevronLeft, ChevronRight } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import ItemCard from '@/app/components/ui/item-card';
import SectionHeader from '@/app/components/ui/SectionHeader';
import BreadCrumb from '@/app/components/BreadCrumb';
import Reveal from '@/app/components/ui/Reveal';
import { getCityData, getCityItemsByType } from '@/lib/services/cities';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import CityListingControls, { CityListingToolbar } from './CityListingControls';

/** Plural URL param → singular API param */
const TYPE_MAP = {
  activities: 'activity',
  packages: 'package',
  itineraries: 'itinerary',
};

/** Plural URL param → display label */
const TYPE_LABELS = {
  activities: 'Activities',
  packages: 'Packages',
  itineraries: 'Itineraries',
};

/**
 * Shared listing page for city activities, packages, or itineraries.
 * Used by the thin page.js wrappers in each item-type directory.
 *
 * @param {{ citySlug: string, itemType: 'activities'|'packages'|'itineraries', searchParams: object }} props
 */
export default async function CityItemsListing({ citySlug, itemType, searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { page: pageParam } = resolvedSearchParams;
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const apiType = TYPE_MAP[itemType];
  const label = TYPE_LABELS[itemType];

  // Fetch city info + items in parallel
  const filters = normalizeListingFilters(resolvedSearchParams);
  const query = { page: currentPage, per_page: 10, ...filters };
  const [cityResponse, itemsResponse] = await Promise.all([getCityData(citySlug), getCityItemsByType(citySlug, apiType, query)]);

  const cityName = cityResponse?.data?.name || citySlug;
  const isError = !itemsResponse?.success;
  const items = itemsResponse?.success ? itemsResponse.data || [] : [];
  const lastPage = itemsResponse?.last_page ?? 1;
  const hasActiveFilters = Object.keys(filters).length > 0;

  const basePath = `/cities/${citySlug}/${itemType}`;

  return (
    <section className="container-page flex flex-col gap-8 pb-10 md:pb-16 lg:pb-24">
      <div data-testid="listing-heading" className="flex flex-col gap-4 pt-[70px]">
        <BreadCrumb />
        <div className="weelp-rise-mask weelp-rise-mask--block -mt-0.5 w-full">
          <div className="weelp-rise-item w-full" style={{ '--weelp-rise-delay': '200ms' }}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader superTitle={`Explore ${cityName}`} title={`All ${label}`} titleSize="lg" subtitle={`Discover the best ${label.toLowerCase()} in ${cityName}.`} />
              {!isError && (
                <div className="hidden shrink-0 lg:block lg:-translate-y-6">
                  <CityListingToolbar />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div data-testid="listing-layout" className={`grid items-start gap-6 ${isError ? '' : 'lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-6'}`}>
        {!isError && (
          <aside data-testid="listing-sidebar" className="min-w-0 lg:col-start-1 lg:row-start-1">
            <CityListingControls categories={itemsResponse?.available_categories || []} tags={itemsResponse?.available_tags || []} />
          </aside>
        )}
        <div data-testid="listing-results" className={`flex min-w-0 flex-col gap-6 ${isError ? '' : 'lg:col-start-2 lg:row-start-1'}`}>
          {isError ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-lg text-muted-foreground">Something went wrong. Please try again later.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No {label.toLowerCase()} found in {cityName}.
              </p>
              {currentPage > 1 && (
                <NavigationLink href={{ pathname: basePath, query: filters }} className="inline-flex min-h-11 items-center text-brand-500 hover:underline">
                  Back to first page
                </NavigationLink>
              )}
              {hasActiveFilters && (
                <NavigationLink href={basePath} className="inline-flex min-h-11 items-center text-brand-500 hover:underline">
                  Clear filters
                </NavigationLink>
              )}
            </div>
          ) : (
            <>
              <Reveal initialHidden stagger={60} variant="lift" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => {
                  const cardProps = mapProductToItemCard(item, citySlug);
                  return <ItemCard key={cardProps.id} {...cardProps} />;
                })}
              </Reveal>

              {lastPage > 1 && <Pagination currentPage={currentPage} lastPage={lastPage} basePath={basePath} query={filters} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Pagination({ currentPage, lastPage, basePath, query }) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(lastPage, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const pageHref = (page) => ({ pathname: basePath, query: { ...query, page } });

  return (
    <nav className="flex max-w-full flex-wrap items-center justify-center gap-2 pt-4" aria-label="Pagination">
      {currentPage > 1 ? (
        <NavigationLink
          href={pageHref(currentPage - 1)}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm dark:shadow-none transition hover:bg-muted"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </NavigationLink>
      ) : (
        <span className="flex size-11 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground shadow-sm dark:shadow-none">
          <ChevronLeft className="size-4" />
        </span>
      )}

      <span data-testid="mobile-page-status" className="inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground sm:hidden">
        Page {currentPage} of {lastPage}
      </span>

      <span data-testid="desktop-page-links" className="hidden sm:contents">
        {start > 1 && (
          <>
            <NavigationLink
              href={pageHref(1)}
              className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-sm text-foreground shadow-sm dark:shadow-none transition hover:bg-muted"
            >
              1
            </NavigationLink>
            {start > 2 && <span className="px-1 text-muted-foreground">...</span>}
          </>
        )}

        {pages.map((page) => (
          <NavigationLink
            key={page}
            href={pageHref(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`flex size-11 items-center justify-center rounded-full border text-sm shadow-sm dark:shadow-none transition ${
              page === currentPage ? 'border-foreground bg-foreground text-white' : 'border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            {page}
          </NavigationLink>
        ))}

        {end < lastPage && (
          <>
            {end < lastPage - 1 && <span className="px-1 text-muted-foreground">...</span>}
            <NavigationLink
              href={pageHref(lastPage)}
              className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-sm text-foreground shadow-sm dark:shadow-none transition hover:bg-muted"
            >
              {lastPage}
            </NavigationLink>
          </>
        )}
      </span>

      {currentPage < lastPage ? (
        <NavigationLink
          href={pageHref(currentPage + 1)}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm dark:shadow-none transition hover:bg-muted"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </NavigationLink>
      ) : (
        <span className="flex size-11 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground shadow-sm dark:shadow-none">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

function normalizeListingFilters(searchParams) {
  const query = {};
  const stringKeys = ['search', 'categories', 'tags', 'sort_by'];
  const numericKeys = ['min_price', 'max_price', 'min_rating'];

  stringKeys.forEach((key) => {
    const value = typeof searchParams[key] === 'string' ? searchParams[key].trim() : '';
    if (!value) return;
    query[key] = key === 'categories' || key === 'tags' ? [...new Set(value.split(',').filter(Boolean))].sort().join(',') : value;
  });
  numericKeys.forEach((key) => {
    const value = searchParams[key];
    if (typeof value === 'string' && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && (key !== 'min_rating' || Number(value) <= 5)) query[key] = value;
  });

  return query;
}
