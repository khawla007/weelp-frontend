'use client';

import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

import ModernCarouselShell from '@/app/components/ui/ModernCarouselShell';

const TESTIMONIAL_BREAKPOINTS = {
  768: {
    slidesPerView: 1.35,
    spaceBetween: 18,
  },
  1200: {
    slidesPerView: 2.2,
    spaceBetween: 20,
  },
  1440: {
    slidesPerView: 2.6,
    spaceBetween: 20,
  },
};

export default function TestimonialsSliderSection({ testimonials = [] }) {
  return (
    <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-7 px-4 sm:px-6 xl:px-0">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--weelp-home-muted)]">
            Testimonials
          </p>
          <h2 className="font-home-heading text-3xl font-bold tracking-[-0.04em] text-[var(--weelp-home-ink)] md:text-[2.6rem]">
            Travelers love how calm this feels
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="testimonials-prev rounded-full bg-[var(--weelp-home-soft)] p-3 text-[var(--weelp-home-ink)] transition hover:bg-[#dce8ec]"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="testimonials-next rounded-full bg-[var(--weelp-home-ink)] p-3 text-white transition hover:bg-[#17394f]"
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <ModernCarouselShell
        items={testimonials}
        navigationPrefix="testimonials"
        breakpoints={TESTIMONIAL_BREAKPOINTS}
        className=""
        slideClassName="h-auto"
        renderSlide={(testimonial, index) => (
          <article
            className={`flex h-full flex-col justify-between gap-5 rounded-[24px] border border-[var(--weelp-home-border)] bg-white p-7 shadow-[0_14px_34px_rgba(24,24,27,0.05)] ${
              index === 0 ? 'xl:min-h-[250px]' : 'xl:opacity-95'
            }`}
          >
            <div className="flex items-center gap-1 text-[var(--weelp-home-accent)]">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Star key={starIndex} className="size-4 fill-current" />
              ))}
            </div>
            <p className="text-[15px] leading-7 text-[#3F3F46]">{testimonial.quote}</p>
            <div>
              <p className="font-home-heading text-lg font-semibold text-[var(--weelp-home-ink)]">{testimonial.name}</p>
              <p className="text-sm text-[var(--weelp-home-copy)]">{testimonial.role}</p>
            </div>
          </article>
        )}
      />
    </section>
  );
}
