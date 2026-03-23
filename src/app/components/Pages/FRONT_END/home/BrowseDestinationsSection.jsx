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

export default function BrowseDestinationsSection({ cities = [] }) {
  const apiCities = cities.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.featured_image || c.image || '/assets/Card.webp',
    activitiesCount: c.activities_count ?? 0,
  }));
  const items = apiCities.length > 0 ? apiCities : STATIC_DESTINATIONS;

  return (
    <section className="container mx-auto flex flex-col gap-8 px-4 pb-[70px]">
      <div className="flex items-center justify-between">
        <SectionHeader
          superTitle="Plan where to next"
          title="Browse standout destinations"
          titleSize="lg"
          subtitle="Start with cities and landmarks travelers save most, then let Weelp shape the rest of the journey."
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="browse-destinations-prev flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] shadow-sm transition hover:bg-gray-50"
            aria-label="Previous destination"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="browse-destinations-next flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] shadow-sm transition hover:bg-gray-50"
            aria-label="Next destination"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <CarouselShell items={items} navigationPrefix="browse-destinations" breakpoints={DESTINATION_BREAKPOINTS} slideClassName="!h-auto" renderSlide={(city) => <CityCard city={city} />} />
    </section>
  );
}
