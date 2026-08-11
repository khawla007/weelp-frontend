'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CarouselShell from '@/app/components/ui/CarouselShell';
import CityCard from '@/app/components/CityCard';
import Reveal from '@/app/components/ui/Reveal';
import { SLIDER_NAV_BUTTON_CLASS } from '@/app/components/ui/sliderNavigationClasses';

const DESTINATION_BREAKPOINTS = {
  450: { slidesPerView: 1.5, spaceBetween: 12 },
  640: { slidesPerView: 2.5, spaceBetween: 16 },
  768: { slidesPerView: 3, spaceBetween: 18 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1440: { slidesPerView: 5, spaceBetween: 22 },
};

export default function BrowseDestinationsSection({
  cities = [],
  title = 'Top Destinations',
  subtitleMode = 'count',
  navigationPrefix = 'browse-destinations',
  className = '',
  cardTextTone = 'overlay',
}) {
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
    <Reveal as="section" initialHidden className={`container-page flex flex-col gap-8 pb-10 md:pb-16 lg:pb-24 ${className}`}>
      <Reveal variant="lift" className="flex items-center justify-between">
        <SectionHeader title={title} />
        <div className="flex items-center gap-2">
          <button type="button" className={`${navigationPrefix}-prev ${SLIDER_NAV_BUTTON_CLASS}`} aria-label="Previous destination">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" className={`${navigationPrefix}-next ${SLIDER_NAV_BUTTON_CLASS}`} aria-label="Next destination">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </Reveal>

      <CarouselShell
        items={items}
        navigationPrefix={navigationPrefix}
        breakpoints={DESTINATION_BREAKPOINTS}
        slideClassName="!h-auto"
        showMobilePagination
        renderSlide={(city) => <CityCard city={city} subtitleMode={subtitleMode} textTone={cardTextTone} />}
      />
    </Reveal>
  );
}
