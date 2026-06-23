import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CityCard from '@/app/components/CityCard';
import BreadCrumb from '@/app/components/BreadCrumb';
import Reveal from '@/app/components/ui/Reveal';
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
    <section className="container-page flex flex-col gap-8 pb-10 md:pb-16 lg:pb-24">
      <BreadCrumb />

      <section className="weelp-hero-rise flex flex-col items-center gap-3 pt-6 text-center">
        <h1 className="text-3xl font-semibold text-foreground sm:text-5xl">
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
              Cities
            </span>
          </span>
        </h1>
        <p className="max-w-xl text-sm font-medium text-weelp-steel sm:text-lg">
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
              Explore destinations city by city and find the perfect place for your next trip.
            </span>
          </span>
        </p>
      </section>

      {isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">Something went wrong. Please try again later.</p>
        </div>
      ) : cities.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">No cities found.</p>
          {currentPage > 1 && (
            <Link href="/cities" className="text-brand-500 hover:underline">
              Back to first page
            </Link>
          )}
        </div>
      ) : (
        <>
          <h2 className="sr-only">All cities</h2>
          <Reveal as="section" initialHidden stagger={60} variant="lift" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {cities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </Reveal>

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
          className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm dark:shadow-none transition hover:bg-muted"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground shadow-sm dark:shadow-none">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {start > 1 && (
        <>
          <Link
            href="/cities?page=1"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-sm text-foreground shadow-sm dark:shadow-none transition hover:bg-muted"
          >
            1
          </Link>
          {start > 2 && <span className="px-1 text-muted-foreground">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={`/cities?page=${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`flex size-9 items-center justify-center rounded-full border text-sm shadow-sm dark:shadow-none transition ${
            page === currentPage ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:bg-muted'
          }`}
        >
          {page}
        </Link>
      ))}

      {end < lastPage && (
        <>
          {end < lastPage - 1 && <span className="px-1 text-muted-foreground">...</span>}
          <Link
            href={`/cities?page=${lastPage}`}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-sm text-foreground shadow-sm dark:shadow-none transition hover:bg-muted"
          >
            {lastPage}
          </Link>
        </>
      )}

      {currentPage < lastPage ? (
        <Link
          href={`/cities?page=${currentPage + 1}`}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm dark:shadow-none transition hover:bg-muted"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground shadow-sm dark:shadow-none">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
