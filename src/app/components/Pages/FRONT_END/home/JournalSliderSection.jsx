'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import ItemCard from '@/app/components/ui/item-card';
import ModernCarouselShell from '@/app/components/ui/ModernCarouselShell';

const JOURNAL_BREAKPOINTS = {
  640: {
    slidesPerView: 1.15,
    spaceBetween: 16,
  },
  768: {
    slidesPerView: 2.1,
    spaceBetween: 20,
  },
  1024: {
    slidesPerView: 3.1,
    spaceBetween: 24,
  },
  1280: {
    slidesPerView: 4.1,
    spaceBetween: 24,
  },
};

const FALLBACK_POSTS = [
  {
    category: 'City guide',
    title: 'How to spend 48 hours in Seoul without overplanning the trip',
    image: '/assets/images/home-tour-hero.jpg',
    href: '/blogs',
  },
  {
    category: 'Neighborhood picks',
    title: 'Where to stay near Agra for quieter mornings and easier access',
    image: '/assets/images/china.jpg',
    href: '/blogs',
  },
  {
    category: 'Travel note',
    title: 'Why Lisbon works best in shoulder season if you want views without the crush',
    image: '/assets/images/Automn.png',
    href: '/blogs',
  },
  {
    category: 'Planning tips',
    title: 'The case for booking fewer activities and leaving room for the unexpected',
    image: '/assets/images/special.png',
    href: '/blogs',
  },
];

function getMediaUrl(path) {
  if (!path) return '/assets/images/home-tour-hero.jpg';
  if (path.startsWith('http') || path.startsWith('/assets/')) return path;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function toBlogCards(blogs = []) {
  if (!blogs.length) return FALLBACK_POSTS;

  return blogs.map((blog) => {
    const featuredMedia = blog.media_gallery?.find((m) => m.is_featured);
    const image = getMediaUrl(featuredMedia?.url || blog.media_gallery?.[0]?.url);
    const category = blog.categories?.[0]?.category_name || 'Travel';

    return {
      title: blog.name,
      href: `/blogs/${blog.slug}`,
      image,
      category,
    };
  });
}

export default function JournalSliderSection({ blogs = [] }) {
  const posts = toBlogCards(blogs);

  return (
    <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-7 px-4 sm:px-6 xl:px-0">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[560px] space-y-[6px]">
          <h2 className="font-home-heading text-[28px] font-bold tracking-[-0.04em] text-[#18181B]">
            From the journal
          </h2>
          <p className="text-[15px] font-normal leading-[1.4] text-[#71717A]">
            Blog stories, destination notes, neighborhood guides, and planning advice that support discovery.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-[24px] bg-[#F4F4F5] px-[18px] py-[10px] text-[13px] font-semibold text-[#52525B]">
            Latest stories
          </span>
          <span className="rounded-[24px] bg-[#F4F4F5] px-[18px] py-[10px] text-[13px] font-semibold text-[#52525B]">
            Slide to explore
          </span>
          <button
            type="button"
            className="journal-slider-prev rounded-full bg-[#F4F4F5] px-3 py-[10px] text-[#18181B] transition hover:bg-[#E4E4E7]"
            aria-label="Previous journal post"
          >
            <ChevronLeft className="size-[18px]" />
          </button>
          <button
            type="button"
            className="journal-slider-next rounded-full bg-[#18181B] px-3 py-[10px] text-white transition hover:bg-[#27272A]"
            aria-label="Next journal post"
          >
            <ChevronRight className="size-[18px]" />
          </button>
        </div>
      </div>

      <ModernCarouselShell
        items={posts}
        navigationPrefix="journal-slider"
        breakpoints={JOURNAL_BREAKPOINTS}
        className=""
        slideClassName="!h-auto"
        renderSlide={(post) => (
          <ItemCard
            href={post.href}
            image={post.image}
            title={post.title}
            category={post.category}
            variant="compact"
          />
        )}
      />
    </section>
  );
}
