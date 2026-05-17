'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CarouselShell from '@/app/components/ui/CarouselShell';
import CityCard from '@/app/components/CityCard';

const DESTINATION_BREAKPOINTS = {
  450: { slidesPerView: 1.5, spaceBetween: 12 },
  640: { slidesPerView: 2.5, spaceBetween: 16 },
  768: { slidesPerView: 3, spaceBetween: 18 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1440: { slidesPerView: 5, spaceBetween: 22 },
};

export default function BrowseDestinationsSection({ cities = [], title = 'Top Destinations', subtitleMode = 'count', navigationPrefix = 'browse-destinations', className = '' }) {
  const items = cities.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.featured_image || c.feature_image || c.image || '/assets/Card.webp',
    activitiesCount: c.activities_count ?? 0,
    starting_price: c.starting_price ?? null,
    currency: c.currency ?? null,
  }));
  if (!items.length) return null;

  return (
    <section className={`container-page flex flex-col gap-8 pb-10 lg:pb-24 ${className}`}>
      <div className="flex items-center justify-between">
        <SectionHeader title={title} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${navigationPrefix}-prev flex size-11 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#18181b] transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 motion-reduce:transition-none hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40`}
            aria-label="Previous destination"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className={`${navigationPrefix}-next flex size-11 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#18181b] transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 motion-reduce:transition-none hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40`}
            aria-label="Next destination"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <CarouselShell
        items={items}
        navigationPrefix={navigationPrefix}
        breakpoints={DESTINATION_BREAKPOINTS}
        slideClassName="!h-auto"
        showMobilePagination
        renderSlide={(city) => <CityCard city={city} subtitleMode={subtitleMode} />}
      />
    </section>
  );
}
