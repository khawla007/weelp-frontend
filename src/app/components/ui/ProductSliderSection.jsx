'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CarouselShell from '@/app/components/ui/CarouselShell';
import ItemCard from '@/app/components/ui/item-card';

const PRODUCT_BREAKPOINTS = {
  450: { slidesPerView: 1, spaceBetween: 18 },
  640: { slidesPerView: 2, spaceBetween: 18 },
  768: { slidesPerView: 3, spaceBetween: 18 },
  1024: { slidesPerView: 4, spaceBetween: 18 },
  1440: { slidesPerView: 5, spaceBetween: 18 },
};

/**
 * Shared product carousel section used across pages (homepage, city, etc.).
 *
 * @param {object[]} items          - Pre-mapped ItemCard props from mapProductToItemCard()
 * @param {string}   title          - Section heading text
 * @param {string}   navigationId   - Unique prefix for carousel nav button CSS classes
 * @param {string}   headerAction   - "navigation" (arrows) | "cta" (link button)
 * @param {string}   ctaHref        - CTA link href (only when headerAction="cta")
 * @param {string}   ctaLabel       - CTA link label (only when headerAction="cta")
 * @param {string}   className      - Optional wrapper class overrides
 */
export default function ProductSliderSection({ items = [], title, navigationId, headerAction = 'navigation', ctaHref, ctaLabel, className = '' }) {
  if (!items.length) return null;

  return (
    <section className={`container-page flex flex-col gap-6 md:gap-8 pb-10 lg:pb-24 ${className}`}>
      <div className="flex items-center justify-between">
        <SectionHeader title={title} />

        {headerAction === 'navigation' && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              className={`${navigationId}-prev flex size-9 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#1A1918] transition-all duration-200 hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40`}
              aria-label={`Previous ${title}`}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              className={`${navigationId}-next flex size-9 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#1A1918] transition-all duration-200 hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40`}
              aria-label={`Next ${title}`}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {headerAction === 'cta' && ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className="weelp-city-cta-button rounded-[10px] px-4 py-[10px] transition hover:opacity-95"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600, fontSize: '14px' }}
          >
            {ctaLabel}
          </Link>
        )}
      </div>

      <CarouselShell
        items={items}
        navigationPrefix={headerAction === 'navigation' ? navigationId : undefined}
        breakpoints={PRODUCT_BREAKPOINTS}
        slideClassName="!h-auto"
        showMobilePagination
        renderSlide={(card) => <ItemCard {...card} variant="full" />}
      />
    </section>
  );
}
