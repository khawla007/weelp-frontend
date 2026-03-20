'use client';

import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CarouselShell from '@/app/components/ui/CarouselShell';
import CityActivityCard from './CityActivityCard';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';

const SLIDER_BREAKPOINTS = {
  450: { slidesPerView: 1, spaceBetween: 16 },
  640: { slidesPerView: 2, spaceBetween: 18 },
  768: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1440: { slidesPerView: 5, spaceBetween: 20 },
};

export default function CityActivitiesSlider({ title = 'Top activities', subtitle, items = [], navigationId }) {
  const { city } = useParams();
  const navPrefix = navigationId || title.toLowerCase().replace(/\s+/g, '-');

  const cards = items.map((item) => mapProductToItemCard(item, city));

  if (!cards.length) return null;

  return (
    <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-12 px-4 sm:px-6 xl:px-0 py-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2
            className="text-[32px] text-[#273f4e]"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 700 }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-[15px] text-[#6b7b8d]"
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400 }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${navPrefix}-prev flex size-9 items-center justify-center rounded-full border border-[#d8dee4] bg-white text-[#4f566b] shadow-sm transition hover:bg-gray-50`}
            aria-label={`Previous ${title}`}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className={`${navPrefix}-next flex size-9 items-center justify-center rounded-full border border-[#d8dee4] bg-white text-[#4f566b] shadow-sm transition hover:bg-gray-50`}
            aria-label={`Next ${title}`}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <CarouselShell
        items={cards}
        navigationPrefix={navPrefix}
        breakpoints={SLIDER_BREAKPOINTS}
        slideClassName="!h-auto"
        overflowVisible
        clipRight
        renderSlide={(card) => (
          <CityActivityCard
            href={card.href}
            image={card.image}
            title={card.title}
            rating={card.rating}
            reviewCount={card.reviewCount}
            price={card.price}
            discount={card.discount}
          />
        )}
      />
    </section>
  );
}
