'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Testimonial from '../Testimonial';

export const TestmonialSlider = ({ reviews = [] }) => {
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const autoplayConfig = reducedMotion
    ? false
    : {
        delay: 0,
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
      };

  if (!reviews.length) return null;

  return (
    <div className="carousel-shell-wrapper testimonial-slider">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={autoplayConfig}
        speed={reducedMotion ? 0 : 8000}
        spaceBetween={20}
        loop={reviews.length > 4}
        navigation={{
          prevEl: '.testimonial-prev',
          nextEl: '.testimonial-next',
        }}
        pagination={{
          el: '.testimonial-pagination',
          clickable: true,
          dynamicBullets: true,
        }}
        breakpoints={{
          450: { slidesPerView: 1, spaceBetween: 10 },
          640: { slidesPerView: 2, spaceBetween: 15 },
          768: { slidesPerView: 3, spaceBetween: 15 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
        }}
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <Testimonial username={review.user?.name} title={review.review_text} date={review.created_at} itemName={review.item?.name} rating={review.rating} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous testimonial"
          className="testimonial-prev flex size-9 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#1A1918] transition-all duration-200 hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="testimonial-pagination flex items-center justify-center" />
        <button
          type="button"
          aria-label="Next testimonial"
          className="testimonial-next flex size-9 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#1A1918] transition-all duration-200 hover:border-[#588f7a] hover:text-[#588f7a] hover:shadow-[4px_4px_15px_rgba(88,143,122,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
};
