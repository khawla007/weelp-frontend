'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CarouselShell from '@/app/components/ui/CarouselShell';
import ItemCard from '@/app/components/ui/item-card';
import { mapBlogToItemCard } from '@/lib/mapProductToItemCard';

const STATIC_BLOGS = [
  { id: 1, href: '#', image: '/assets/Card.webp', title: 'Best Places for Solo Travel', category: 'Solo' },
  { id: 2, href: '#', image: '/assets/Card.webp', title: 'Your Gang, Your Rules', category: 'Friends' },
  { id: 3, href: '#', image: '/assets/Card.webp', title: 'Your Gang, Your Rules', category: 'Friends' },
  { id: 4, href: '#', image: '/assets/Card.webp', title: 'Best Places for Winter', category: 'Curated' },
  { id: 5, href: '#', image: '/assets/Card.webp', title: 'Hidden Gems of Europe', category: 'Travel' },
];

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
export default function BlogSection({ blogs = [], title = 'Your Guide', navigationId = 'blog-section', className = 'pb-14 md:pb-20 lg:pb-24' }) {
  const apiItems = blogs.map((b) => mapBlogToItemCard(b));
  const items = apiItems.length > 0 ? apiItems : STATIC_BLOGS;

  return (
    <section className={`mx-auto flex w-full max-w-7xl flex-col gap-6 md:gap-8 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="flex items-center justify-between">
        <SectionHeader title={title} />
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            className={`${navigationId}-prev flex size-9 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#1A1918] transition-all duration-200 hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40`}
            aria-label="Previous post"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className={`${navigationId}-next flex size-9 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#1A1918] transition-all duration-200 hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40`}
            aria-label="Next post"
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
        renderSlide={(item) => <ItemCard href={item.href} image={item.image} title={item.title} category={item.category} variant="compact" />}
      />
    </section>
  );
}
