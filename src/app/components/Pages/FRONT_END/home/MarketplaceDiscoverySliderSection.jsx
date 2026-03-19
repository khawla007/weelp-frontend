'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ModernCarouselShell from '@/app/components/ui/ModernCarouselShell';

const MARKETPLACE_BREAKPOINTS = {
  640: {
    slidesPerView: 1.45,
    spaceBetween: 18,
  },
  768: {
    slidesPerView: 2.2,
    spaceBetween: 18,
  },
  1200: {
    slidesPerView: 3.4,
    spaceBetween: 18,
  },
  1440: {
    slidesPerView: 4,
    spaceBetween: 18,
  },
};

export default function MarketplaceDiscoverySliderSection({ cities = [] }) {
  return (
    <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-7 px-4 sm:px-6 xl:px-0">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[720px] space-y-2">
          <h2 className="font-home-heading text-[32px] font-extrabold text-[#18181B]">
            Where to next?
          </h2>
          <p className="text-[15px] font-normal leading-[1.4] text-[#71717A]">
            Browse featured cities with standout stays, local highlights, and flexible timing ideas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[10px]">
          <span className="rounded-[24px] bg-[#18181B] px-[18px] py-[10px] text-sm font-semibold text-white">
            Featured city
          </span>
          <button
            type="button"
            className="marketplace-discovery-prev rounded-full bg-[#F4F4F5] px-3 py-[10px] text-[#18181B] transition hover:bg-[#E4E4E7]"
            aria-label="Previous featured city"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="marketplace-discovery-next rounded-full bg-[#18181B] px-3 py-[10px] text-white transition hover:bg-[#27272A]"
            aria-label="Next featured city"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <ModernCarouselShell
        items={cities}
        navigationPrefix="marketplace-discovery"
        breakpoints={MARKETPLACE_BREAKPOINTS}
        className=""
        slideClassName="h-auto"
        renderSlide={(city) => (
          <Link
            href={city.href}
            className="group relative flex h-[264px] overflow-hidden rounded-[24px] transition-shadow duration-300 hover:shadow-[0_14px_30px_rgba(24,24,27,0.1)]"
          >
            <img
              src={city.image}
              alt={city.name}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="relative z-10 mt-auto flex w-full flex-col justify-end p-5 text-white">
              <h3 className="font-home-heading text-2xl font-bold">{city.name}</h3>
            </div>
          </Link>
        )}
      />
    </section>
  );
}
