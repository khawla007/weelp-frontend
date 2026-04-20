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
export default function BlogSection({ blogs = [], title = 'Your Guide', navigationId = 'blog-section', className = 'pb-12 md:pb-16 lg:pb-[100px]' }) {
  const apiItems = blogs.map((b) => mapBlogToItemCard(b));
  const items = apiItems.length > 0 ? apiItems : STATIC_BLOGS;

  return (
    <section className={`container mx-auto flex flex-col gap-6 md:gap-8 px-4 ${className}`}>
      <div className="flex items-center justify-between">
        <SectionHeader title={title} />
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            className={`${navigationId}-prev flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] shadow-sm transition hover:bg-gray-50`}
            aria-label="Previous post"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className={`${navigationId}-next flex size-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] shadow-sm transition hover:bg-gray-50`}
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
