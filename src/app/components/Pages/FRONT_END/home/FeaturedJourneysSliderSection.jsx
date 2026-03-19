'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import ItemCard from '@/app/components/ui/item-card';
import ModernCarouselShell from '@/app/components/ui/ModernCarouselShell';

const JOURNEY_BREAKPOINTS = {
  640: {
    slidesPerView: 1.15,
    spaceBetween: 16,
  },
  768: {
    slidesPerView: 2.1,
    spaceBetween: 20,
  },
  1024: {
    slidesPerView: 3.1,
    spaceBetween: 24,
  },
  1280: {
    slidesPerView: 4.1,
    spaceBetween: 24,
  },
};

export default function FeaturedJourneysSliderSection({ journeys = [] }) {
  return (
    <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-7 px-4 sm:px-6 xl:px-0">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[560px] space-y-[6px]">
          <h2 className="font-home-heading text-[28px] font-bold tracking-[-0.04em] text-[#18181B]">
            Featured journeys
          </h2>
          <p className="text-[15px] font-normal leading-[1.4] text-[#71717A]">
            Featured package slider with curated itineraries, layered stays, and concierge-ready inclusions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-[24px] bg-[#F4F4F5] px-[18px] py-[10px] text-[13px] font-semibold text-[#52525B]">
            Featured packages
          </span>
          <span className="rounded-[24px] bg-[#F4F4F5] px-[18px] py-[10px] text-[13px] font-semibold text-[#52525B]">
            Slide to explore
          </span>
          <button
            type="button"
            className="featured-journeys-prev rounded-full bg-[#F4F4F5] px-3 py-[10px] text-[#18181B] transition hover:bg-[#E4E4E7]"
            aria-label="Previous featured journey"
          >
            <ChevronLeft className="size-[18px]" />
          </button>
          <button
            type="button"
            className="featured-journeys-next rounded-full bg-[#18181B] px-3 py-[10px] text-white transition hover:bg-[#27272A]"
            aria-label="Next featured journey"
          >
            <ChevronRight className="size-[18px]" />
          </button>
        </div>
      </div>

      <ModernCarouselShell
        items={journeys}
        navigationPrefix="featured-journeys"
        breakpoints={JOURNEY_BREAKPOINTS}
        className=""
        slideClassName="!h-auto"
        renderSlide={(journey) => (
          <ItemCard
            href={journey.href}
            image={journey.image}
            title={journey.title}
            category={journey.tag}
            excerpt={journey.blurb}
            price={journey.price}
          />
        )}
      />
    </section>
  );
}
