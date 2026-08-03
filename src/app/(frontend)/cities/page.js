import { ChevronLeft, ChevronRight } from 'lucide-react';
import CityCard from '@/app/components/CityCard';
import BreadCrumb from '@/app/components/BreadCrumb';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import Reveal from '@/app/components/ui/Reveal';
import CitiesListingControls, { CitiesListingToolbar } from '@/app/components/Pages/FRONT_END/cities/CitiesListingControls';
import { getAllCities } from '@/lib/services/cities';

export const metadata = {
  title: 'All Cities | Weelp',
  description: 'Browse all cities and find your next travel destination with Weelp.',
};

export default async function CitiesPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { page: pageParam } = resolvedSearchParams;
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const filters = normalizeCityFilters(resolvedSearchParams);
  const response = await getAllCities(currentPage, 6, filters);

  const isError = !response?.success;
  const cities = response?.success ? response.data : [];
  const lastPage = response?.last_page ?? 1;
  const total = response?.total ?? 0;
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <section className="container-page flex flex-col gap-6 pb-10 md:gap-8 md:pb-16 lg:pb-24">
      <div data-testid="cities-heading-stack" className="flex flex-col gap-4 pt-6 md:pt-[70px]">
        <BreadCrumb />
        <div className="weelp-rise-mask weelp-rise-mask--block -mt-0.5 w-full">
          <div className="weelp-rise-item w-full" style={{ '--weelp-rise-delay': '200ms' }}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold tracking-[0.2px] text-muted-foreground">Explore destinations</span>
                <h1 className="text-[28px] leading-tight text-foreground sm:text-[36px]">All Cities</h1>
                <p className="max-w-[520px] text-sm font-medium leading-[1.5] text-muted-foreground sm:text-base">Find cities by country, season, activity count, or name.</p>
              </div>
              {!isError && (
                <div className="hidden shrink-0 lg:flex lg:-translate-y-6 lg:flex-col lg:items-end lg:gap-2">
                  <p className="text-sm font-medium text-muted-foreground">{total} cities</p>
                  <CitiesListingToolbar />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">Something went wrong. Please try again later.</p>
        </div>
      ) : cities.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">No cities found.</p>
          {currentPage > 1 && (
            <NavigationLink href={{ pathname: '/cities', query: filters }} className="text-brand-500 hover:underline">
              Back to first page
            </NavigationLink>
          )}
          {hasActiveFilters && (
            <NavigationLink href="/cities" className="text-brand-500 hover:underline">
              Clear filters
            </NavigationLink>
          )}
        </div>
      ) : (
        <div data-testid="cities-listing-layout" className="grid items-start gap-5 md:gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,3fr)] lg:gap-6">
          <aside data-testid="cities-listing-sidebar" className="min-w-0 lg:col-start-1 lg:row-start-1">
            <CitiesListingControls countries={response?.available_countries || []} seasons={response?.available_seasons || []} />
          </aside>
          <div data-testid="cities-listing-results" className="flex min-w-0 flex-col gap-5 md:gap-6 lg:col-start-2 lg:row-start-1">
            <h2 className="sr-only">All cities</h2>
            <Reveal as="section" initialHidden stagger={60} variant="lift" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {cities.map((city) => (
                <CityCard key={city.id} city={city} className="h-[300px] sm:h-[320px] lg:h-[300px] xl:h-[340px]" />
              ))}
            </Reveal>

            {lastPage > 1 && <Pagination currentPage={currentPage} lastPage={lastPage} query={filters} />}
          </div>
        </div>
      )}
    </section>
  );
}

function Pagination({ currentPage, lastPage, query }) {
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

  const pageHref = (page) => ({ pathname: '/cities', query: { ...query, page } });

  return (
    <nav className="flex max-w-full flex-wrap items-center justify-center gap-2 pt-4" aria-label="Pagination">
      {currentPage > 1 ? (
        <NavigationLink
          data-weelp-button-link
          href={pageHref(currentPage - 1)}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-muted dark:shadow-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </NavigationLink>
      ) : (
        <span className="flex size-11 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground shadow-sm dark:shadow-none">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {start > 1 && (
        <>
          <NavigationLink
            data-weelp-button-link
            href={pageHref(1)}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-sm text-foreground shadow-sm transition hover:bg-muted dark:shadow-none"
          >
            1
          </NavigationLink>
          {start > 2 && <span className="px-1 text-muted-foreground">...</span>}
        </>
      )}

      {pages.map((page) => (
        <NavigationLink
          key={page}
          data-weelp-button-link
          href={pageHref(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`flex size-11 items-center justify-center rounded-full border text-sm shadow-sm transition dark:shadow-none ${
            page === currentPage ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:bg-muted'
          }`}
        >
          {page}
        </NavigationLink>
      ))}

      {end < lastPage && (
        <>
          {end < lastPage - 1 && <span className="px-1 text-muted-foreground">...</span>}
          <NavigationLink
            data-weelp-button-link
            href={pageHref(lastPage)}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-sm text-foreground shadow-sm transition hover:bg-muted dark:shadow-none"
          >
            {lastPage}
          </NavigationLink>
        </>
      )}

      {currentPage < lastPage ? (
        <NavigationLink
          data-weelp-button-link
          href={pageHref(currentPage + 1)}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-muted dark:shadow-none"
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

function normalizeCityFilters(searchParams) {
  const query = {};
  ['search', 'country', 'season', 'sort_by'].forEach((key) => {
    const value = typeof searchParams[key] === 'string' ? searchParams[key].trim() : '';
    if (value) query[key] = value;
  });

  return query;
}
