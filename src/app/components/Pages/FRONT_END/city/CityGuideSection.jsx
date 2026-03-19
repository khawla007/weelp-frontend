'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import ItemCard from '@/app/components/ui/item-card';
import ModernCarouselShell from '@/app/components/ui/ModernCarouselShell';
import { mapBlogToItemCard } from '@/lib/mapProductToItemCard';

const SLIDER_BREAKPOINTS = {
  640: { slidesPerView: 1.15, spaceBetween: 16 },
  768: { slidesPerView: 2.1, spaceBetween: 20 },
  1024: { slidesPerView: 3.1, spaceBetween: 24 },
  1280: { slidesPerView: 4.1, spaceBetween: 24 },
};

export default function CityGuideSection({ title = 'Blogs', data = [] }) {
  const cards = data.map(mapBlogToItemCard);

  if (!cards.length) return null;

  return (
    <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-7 px-4 sm:px-6 xl:px-0 py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[560px] space-y-[6px]">
          <h2 className="font-home-heading text-[28px] font-bold tracking-[-0.04em] text-[var(--weelp-home-ink)]">
            {title}
          </h2>
          <p className="text-[15px] font-normal leading-[1.4] text-[var(--weelp-home-copy)]">
            Stories, guides, and tips for your trip
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="city-guides-prev rounded-full bg-[#F4F4F5] px-3 py-[10px] text-[#18181B] transition hover:bg-[#E4E4E7]"
            aria-label="Previous guide"
          >
            <ChevronLeft className="size-[18px]" />
          </button>
          <button
            type="button"
            className="city-guides-next rounded-full bg-[#18181B] px-3 py-[10px] text-white transition hover:bg-[#27272A]"
            aria-label="Next guide"
          >
            <ChevronRight className="size-[18px]" />
          </button>
        </div>
      </div>

      <ModernCarouselShell
        items={cards}
        navigationPrefix="city-guides"
        breakpoints={SLIDER_BREAKPOINTS}
        slideClassName="!h-auto"
        renderSlide={(card) => (
          <ItemCard
            href={card.href}
            image={card.image}
            title={card.title}
            category={card.category}
            variant="compact"
          />
        )}
      />
    </section>
  );
}
