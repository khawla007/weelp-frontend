'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import CarouselShell from '@/app/components/ui/CarouselShell';
import Reveal from '@/app/components/ui/Reveal';
import SectionHeader from '@/app/components/ui/SectionHeader';
import { SLIDER_NAV_BUTTON_CLASS } from '@/app/components/ui/sliderNavigationClasses';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';

import GoldActivityCard from './GoldActivityCard';

const PRODUCT_BREAKPOINTS = {
  450: { slidesPerView: 1, spaceBetween: 18 },
  640: { slidesPerView: 2, spaceBetween: 18 },
  768: { slidesPerView: 2, spaceBetween: 18 },
  1024: { slidesPerView: 3, spaceBetween: 18 },
  1440: { slidesPerView: 4, spaceBetween: 18 },
};

const TITLE = 'Top activities';
const NAVIGATION_PREFIX = 'top-activities';

export default function GoldTopActivitiesSection({ activities = [] }) {
  if (!activities.length) return null;

  const cards = activities.map((activity) => {
    const mappedActivity = mapProductToItemCard(activity);

    return {
      ...mappedActivity,
      category: activity.categories?.[0]?.name || mappedActivity.category,
      wishlistItem: activity,
    };
  });

  return (
    <section className="container-page flex flex-col gap-4 pb-7 md:gap-8 md:pb-16 lg:pb-24">
      <Reveal initialHidden variant="lift" className="flex items-center justify-between">
        <SectionHeader title={TITLE} />

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className={`${NAVIGATION_PREFIX}-prev ${SLIDER_NAV_BUTTON_CLASS}`} aria-label={`Previous ${TITLE} item`}>
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" className={`${NAVIGATION_PREFIX}-next ${SLIDER_NAV_BUTTON_CLASS}`} aria-label={`Next ${TITLE} item`}>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </Reveal>

      <CarouselShell
        items={cards}
        navigationPrefix={NAVIGATION_PREFIX}
        breakpoints={PRODUCT_BREAKPOINTS}
        slideClassName="!h-auto"
        showMobilePagination
        renderSlide={(card) => <GoldActivityCard item={card} wishlistItem={card.wishlistItem} />}
      />
    </section>
  );
}
