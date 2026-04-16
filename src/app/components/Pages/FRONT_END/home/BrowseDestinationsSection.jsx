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

const STATIC_DESTINATIONS = [
  { id: 1, name: 'Paris', slug: 'paris', image: '/assets/Card.webp', activitiesCount: 150 },
  { id: 2, name: 'Florence', slug: 'florence', image: '/assets/Card.webp', activitiesCount: 85 },
  { id: 3, name: 'Istanbul', slug: 'istanbul', image: '/assets/Card.webp', activitiesCount: 120 },
  { id: 4, name: 'Bangkok', slug: 'bangkok', image: '/assets/Card.webp', activitiesCount: 200 },
  { id: 5, name: 'Tokyo', slug: 'tokyo', image: '/assets/Card.webp', activitiesCount: 175 },
];

export default function BrowseDestinationsSection({ cities = [], title = 'Top Destination', subtitleMode = 'count', navigationPrefix = 'browse-destinations' }) {
  const apiCities = cities.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.featured_image || c.feature_image || c.image || '/assets/Card.webp',
    activitiesCount: c.activities_count ?? 0,
    starting_price: c.starting_price ?? null,
    currency: c.currency ?? null,
  }));
  const items = apiCities.length > 0 ? apiCities : STATIC_DESTINATIONS;

  return (
    <section className="container mx-auto flex flex-col gap-8 px-4 pb-[100px]">
      <div className="flex items-center justify-between">
        <SectionHeader title={title} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${navigationPrefix}-prev flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] shadow-sm transition hover:bg-gray-50`}
            aria-label="Previous destination"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className={`${navigationPrefix}-next flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] shadow-sm transition hover:bg-gray-50`}
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
        renderSlide={(city) => <CityCard city={city} subtitleMode={subtitleMode} />}
      />
    </section>
  );
}
