import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CityCard from '@/app/components/CityCard';
import SectionHeader from '@/app/components/ui/SectionHeader';
import BreadCrumb from '@/app/components/BreadCrumb';
import { getAllCities } from '@/lib/services/cities';

export const metadata = {
  title: 'All Cities | Weelp',
  description: 'Browse all cities and find your next travel destination with Weelp.',
};

export default async function CitiesPage({ searchParams }) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const response = await getAllCities(currentPage, 10);

  const isError = !response?.success;
  const cities = response?.success ? response.data : [];
  const lastPage = response?.last_page ?? 1;
  const total = response?.total ?? 0;

  return (
    <section className="container mx-auto flex flex-col gap-8 px-4 py-10">
      <BreadCrumb />
      <SectionHeader superTitle="Discover your next adventure" title="All Cities" titleSize="lg" subtitle="Browse all destinations and find the perfect city for your next trip." />

      {isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-lg text-[#6f7680]">Something went wrong. Please try again later.</p>
        </div>
      ) : cities.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-lg text-[#6f7680]">No cities found.</p>
          {currentPage > 1 && (
            <Link href="/cities" className="text-brand-500 hover:underline">
              Back to first page
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {cities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>

          {lastPage > 1 && <Pagination currentPage={currentPage} lastPage={lastPage} />}
        </>
      )}
    </section>
  );
}

function Pagination({ currentPage, lastPage }) {
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

  return (
    <nav className="flex items-center justify-center gap-2 pt-4" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={`/cities?page=${currentPage - 1}`}
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
          <Link href="/cities?page=1" className="flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-sm text-[#1A1918] shadow-sm transition hover:bg-gray-50">
            1
          </Link>
          {start > 2 && <span className="px-1 text-[#6f7680]">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={`/cities?page=${page}`}
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
            href={`/cities?page=${lastPage}`}
            className="flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-sm text-[#1A1918] shadow-sm transition hover:bg-gray-50"
          >
            {lastPage}
          </Link>
        </>
      )}

      {currentPage < lastPage ? (
        <Link
          href={`/cities?page=${currentPage + 1}`}
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
