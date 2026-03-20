'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import CarouselShell from '@/app/components/ui/CarouselShell';
import ItemCard from '@/app/components/ui/item-card';
import { mapBlogToItemCard } from '@/lib/mapProductToItemCard';

const BLOG_BREAKPOINTS = {
  450: { slidesPerView: 1, spaceBetween: 16 },
  640: { slidesPerView: 2, spaceBetween: 20 },
  768: { slidesPerView: 3, spaceBetween: 24 },
  1024: { slidesPerView: 4, spaceBetween: 28 },
};

export default function CityBlogSlider({ blogs = [] }) {
  const cards = blogs.map(mapBlogToItemCard);

  if (!cards.length) return null;

  return (
    <section className="mx-auto flex w-full max-w-[1480px] flex-col items-center gap-7 px-4 sm:px-6 xl:px-0 py-12">
      <div className="flex w-full items-center justify-between">
        <h2
          className="text-[28px] text-[#273f4e]"
          style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 500 }}
        >
          Blogs
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="city-blogs-prev flex size-9 items-center justify-center rounded-full border border-[#d8dee4] bg-white text-[#4f566b] shadow-sm transition hover:bg-gray-50"
            aria-label="Previous blog"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="city-blogs-next flex size-9 items-center justify-center rounded-full border border-[#d8dee4] bg-white text-[#4f566b] shadow-sm transition hover:bg-gray-50"
            aria-label="Next blog"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <CarouselShell
        items={cards}
        navigationPrefix="city-blogs"
        breakpoints={BLOG_BREAKPOINTS}
        slideClassName="!h-auto"
        overflowVisible
        clipRight
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
