'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CarouselShell from '@/app/components/ui/CarouselShell';
import ItemCard from '@/app/components/ui/item-card';
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
      <div className="flex items-center justify-between">
        <SectionHeader title={title} />
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            className={`${navigationId}-prev flex size-11 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#1A1918] transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 motion-reduce:transition-none hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40`}
            aria-label="Previous blog post"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className={`${navigationId}-next flex size-11 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#1A1918] transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 motion-reduce:transition-none hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40`}
            aria-label="Next blog post"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <CarouselShell
        items={items}
        navigationPrefix={navigationId}
        breakpoints={BLOG_BREAKPOINTS}
        slideClassName="!h-auto"
        showMobilePagination
        renderSlide={(item) => <ItemCard href={item.href} image={item.image} title={item.title} category={item.category} variant="compact" />}
      />
    </section>
  );
}
