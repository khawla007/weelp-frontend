'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CarouselShell from '@/app/components/ui/CarouselShell';
import ItemCard from '@/app/components/ui/item-card';
import Reveal from '@/app/components/ui/Reveal';
import { COMPACT_SLIDER_NAV_BUTTON_CLASS } from '@/app/components/ui/sliderNavigationClasses';
import { mapBlogToItemCard } from '@/lib/mapProductToItemCard';

const BLOG_BREAKPOINTS = {
  450: { slidesPerView: 1, spaceBetween: 10 },
  640: { slidesPerView: 2, spaceBetween: 15 },
  768: { slidesPerView: 3, spaceBetween: 15 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1440: { slidesPerView: 5, spaceBetween: 20 },
};

/**
 * Shared blog carousel section used across pages (homepage, city, etc.).
 *
 * @param {object[]} blogs   - Raw blog objects from API
 * @param {string}   title   - Section heading (default: "Your Guide")
 * @param {string}   navigationId - Unique prefix for carousel nav buttons
 * @param {string}   className - Optional wrapper class overrides
 */
export default function BlogSection({ blogs = [], title = 'Your Guide', navigationId = 'blog-section', className = '' }) {
  const items = blogs.map((b) => mapBlogToItemCard(b));
  if (!items.length) return null;

  return (
    <section className={`container-page flex flex-col gap-6 md:gap-8 pb-10 md:pb-16 lg:pb-24 ${className}`}>
      <Reveal initialHidden variant="lift" className="flex items-center justify-between">
        <SectionHeader title={title} />
        <div className="hidden sm:flex items-center gap-2">
          <button type="button" className={`${navigationId}-prev ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Previous blog post">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" className={`${navigationId}-next ${COMPACT_SLIDER_NAV_BUTTON_CLASS}`} aria-label="Next blog post">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </Reveal>

      <Reveal initialHidden variant="lift" delay={120}>
        <CarouselShell
          items={items}
          navigationPrefix={navigationId}
          breakpoints={BLOG_BREAKPOINTS}
          slideClassName="!h-auto"
          showMobilePagination
          renderSlide={(item) => <ItemCard href={item.href} image={item.image} title={item.title} category={item.category} publishedAt={item.publishedAt} variant="compact" />}
        />
      </Reveal>
    </section>
  );
}
