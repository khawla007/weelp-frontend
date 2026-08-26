'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CarouselShell from '@/app/components/ui/CarouselShell';
import CityCard from '@/app/components/CityCard';
import Reveal from '@/app/components/ui/Reveal';
import { SLIDER_NAV_BUTTON_CLASS } from '@/app/components/ui/sliderNavigationClasses';

const DESTINATION_BREAKPOINTS = {
  450: { slidesPerView: 1, spaceBetween: 18 },
  640: { slidesPerView: 2, spaceBetween: 18 },
  768: { slidesPerView: 2, spaceBetween: 18 },
  1024: { slidesPerView: 3, spaceBetween: 18 },
  1440: { slidesPerView: 4, spaceBetween: 18 },
};

export default function BrowseDestinationsSection({
  cities = [],
  title = 'Top Destinations',
  subtitleMode = 'count',
  navigationPrefix = 'browse-destinations',
  className = '',
  carouselEntrance,
}) {
  const items = cities.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.featured_image || c.feature_image || c.image || '/assets/Card.webp',
    activitiesCount: c.activities_count ?? 0,
    starting_price: c.starting_price ?? null,
    currency: c.currency ?? null,
    blogsCount: c.blogs_count ?? c.blogsCount ?? 0,
  }));
  if (!items.length) return null;

  const usesStaggeredEntrance = carouselEntrance === 'stagger-right';
  const HeaderRoot = usesStaggeredEntrance ? 'div' : Reveal;
  const sectionRootProps = usesStaggeredEntrance
    ? {
        'aria-label': title,
        'data-carousel-section-entrance': carouselEntrance,
      }
    : {};
  const headerRootProps = usesStaggeredEntrance ? { 'data-carousel-section-header': '' } : { variant: 'lift' };

  return (
    <Reveal as="section" initialHidden {...sectionRootProps} className={`container-page flex flex-col gap-8 pb-10 md:pb-16 lg:pb-24 ${className}`}>
      <HeaderRoot {...headerRootProps} className="flex items-center justify-between">
        <SectionHeader title={title} />
        <div className="flex items-center gap-2">
          <button type="button" className={`${navigationPrefix}-prev ${SLIDER_NAV_BUTTON_CLASS}`} aria-label="Previous destination">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" className={`${navigationPrefix}-next ${SLIDER_NAV_BUTTON_CLASS}`} aria-label="Next destination">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </HeaderRoot>

      <CarouselShell
        items={items}
        slidesPerView={1}
        navigationPrefix={navigationPrefix}
        breakpoints={DESTINATION_BREAKPOINTS}
        slideClassName="!h-auto"
        showMobilePagination
        entrance={usesStaggeredEntrance ? carouselEntrance : undefined}
        observeReveal={usesStaggeredEntrance ? false : undefined}
        renderSlide={(city) => <CityCard city={city} subtitleMode={subtitleMode} />}
      />
    </Reveal>
  );
}
