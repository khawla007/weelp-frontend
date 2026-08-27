'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CarouselShell from '@/app/components/ui/CarouselShell';
import ItemCard from '@/app/components/ui/item-card';
import Reveal from '@/app/components/ui/Reveal';
import { SLIDER_NAV_BUTTON_CLASS } from '@/app/components/ui/sliderNavigationClasses';

const PRODUCT_BREAKPOINTS = {
  450: { slidesPerView: 1, spaceBetween: 18 },
  640: { slidesPerView: 2, spaceBetween: 18 },
  768: { slidesPerView: 2, spaceBetween: 18 },
  1024: { slidesPerView: 3, spaceBetween: 18 },
  1440: { slidesPerView: 4, spaceBetween: 18 },
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
 * @param {'stagger-right'} [carouselEntrance] - Optional slide entrance treatment
 * @param {'full'|'editorial'} [itemVariant] - Shared ItemCard composition
 * @param {string}   className      - Optional wrapper class overrides
 */
export default function ProductSliderSection({ items = [], title, navigationId, headerAction = 'navigation', ctaHref, ctaLabel, carouselEntrance, itemVariant = 'full', className = '' }) {
  if (!items.length) return null;

  const usesStaggeredEntrance = carouselEntrance === 'stagger-right';
  const SectionRoot = usesStaggeredEntrance ? Reveal : 'section';
  const HeaderRoot = usesStaggeredEntrance ? 'div' : Reveal;
  const sectionRootProps = usesStaggeredEntrance
    ? {
        as: 'section',
        initialHidden: true,
        'aria-label': title,
        'data-carousel-section-entrance': carouselEntrance,
      }
    : {};
  const headerRootProps = usesStaggeredEntrance ? { 'data-carousel-section-header': '' } : { initialHidden: true, variant: 'lift' };

  return (
    <SectionRoot {...sectionRootProps} className={`container-page flex flex-col gap-4 pb-7 md:gap-8 md:pb-16 lg:pb-24 ${className}`}>
      <HeaderRoot {...headerRootProps} className="flex items-center justify-between">
        <SectionHeader title={title} />

        {headerAction === 'navigation' && (
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" className={`${navigationId}-prev ${SLIDER_NAV_BUTTON_CLASS}`} aria-label={`Previous ${title} item`}>
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" className={`${navigationId}-next ${SLIDER_NAV_BUTTON_CLASS}`} aria-label={`Next ${title} item`}>
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {headerAction === 'cta' && ctaHref && ctaLabel && (
          <Link
            data-weelp-button-link
            href={ctaHref}
            className="weelp-city-cta-button rounded-[10px] px-4 py-[10px] transition-opacity duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none hover:opacity-95"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600, fontSize: '14px' }}
          >
            {ctaLabel}
          </Link>
        )}
      </HeaderRoot>

      <CarouselShell
        items={items}
        slidesPerView={1}
        navigationPrefix={headerAction === 'navigation' ? navigationId : undefined}
        breakpoints={PRODUCT_BREAKPOINTS}
        slideClassName={itemVariant === 'editorial' ? '!h-auto self-start sm:self-stretch' : '!h-auto'}
        showMobilePagination
        entrance={usesStaggeredEntrance ? carouselEntrance : undefined}
        observeReveal={usesStaggeredEntrance ? false : undefined}
        renderSlide={(card) => <ItemCard {...card} variant={itemVariant} />}
      />
    </SectionRoot>
  );
}
