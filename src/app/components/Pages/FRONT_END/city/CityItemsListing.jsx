import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ItemCard from '@/app/components/ui/item-card';
import SectionHeader from '@/app/components/ui/SectionHeader';
import BreadCrumb from '@/app/components/BreadCrumb';
import { getCityData, getCityItemsByType } from '@/lib/services/cities';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';

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
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const apiType = TYPE_MAP[itemType];
  const label = TYPE_LABELS[itemType];

  // Fetch city info + items in parallel
  const [cityResponse, itemsResponse] = await Promise.all([getCityData(citySlug), getCityItemsByType(citySlug, apiType, currentPage, 10)]);

  const cityName = cityResponse?.data?.name || citySlug;
  const isError = !itemsResponse?.success;
  const items = itemsResponse?.success ? itemsResponse.data || [] : [];
  const lastPage = itemsResponse?.last_page ?? 1;

  const basePath = `/cities/${citySlug}/${itemType}`;

  return (
    <section className="container mx-auto flex flex-col gap-8 px-4 py-[70px]">
      <BreadCrumb />
      <SectionHeader superTitle={`Explore ${cityName}`} title={`All ${label}`} titleSize="lg" subtitle={`Discover the best ${label.toLowerCase()} in ${cityName}.`} />

      {isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-lg text-[#6f7680]">Something went wrong. Please try again later.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-lg text-[#6f7680]">
            No {label.toLowerCase()} found in {cityName}.
          </p>
          {currentPage > 1 && (
            <Link href={basePath} className="text-brand-500 hover:underline">
              Back to first page
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {items.map((item) => {
              const cardProps = mapProductToItemCard(item, citySlug);
              return <ItemCard key={cardProps.id} {...cardProps} />;
            })}
          </div>

          {lastPage > 1 && <Pagination currentPage={currentPage} lastPage={lastPage} basePath={basePath} />}
        </>
      )}
    </section>
  );
}

function Pagination({ currentPage, lastPage, basePath }) {
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

  const pageHref = (page) => `${basePath}?page=${page}`;

  return (
    <nav className="flex items-center justify-center gap-2 pt-4" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] shadow-sm transition hover:bg-gray-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-gray-100 text-gray-400 shadow-sm">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {start > 1 && (
        <>
          <Link href={pageHref(1)} className="flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-sm text-[#1A1918] shadow-sm transition hover:bg-gray-50">
            1
          </Link>
          {start > 2 && <span className="px-1 text-[#6f7680]">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`flex size-9 items-center justify-center rounded-full border text-sm shadow-sm transition ${
            page === currentPage ? 'border-[#1A1918] bg-[#1A1918] text-white' : 'border-[#E5E4E1] bg-white text-[#1A1918] hover:bg-gray-50'
          }`}
        >
          {page}
        </Link>
      ))}

      {end < lastPage && (
        <>
          {end < lastPage - 1 && <span className="px-1 text-[#6f7680]">...</span>}
          <Link
            href={pageHref(lastPage)}
            className="flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-sm text-[#1A1918] shadow-sm transition hover:bg-gray-50"
          >
            {lastPage}
          </Link>
        </>
      )}

      {currentPage < lastPage ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] shadow-sm transition hover:bg-gray-50"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-gray-100 text-gray-400 shadow-sm">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
