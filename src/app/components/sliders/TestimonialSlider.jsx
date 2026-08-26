'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Testimonial from '../Testimonial';
import Reveal from '@/app/components/ui/Reveal';
import '@/app/styles/swiper.css';

export const TestmonialSlider = ({ reviews = [], entrance, observeReveal = true }) => {
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

  const usesStaggeredEntrance = entrance === 'stagger-right';
  const Root = observeReveal ? Reveal : 'div';
  const revealProps = observeReveal ? { initialHidden: true, variant: 'lift' } : {};

  return (
    <Root {...revealProps} data-carousel-entrance={usesStaggeredEntrance ? entrance : undefined} className="carousel-shell-wrapper testimonial-slider">
      <Swiper
        modules={[Autoplay]}
        autoplay={autoplayConfig}
        speed={reducedMotion ? 0 : 8000}
        spaceBetween={20}
        loop={reviews.length > 4}
        breakpoints={{
          450: { slidesPerView: 1, spaceBetween: 10 },
          640: { slidesPerView: 2, spaceBetween: 15 },
          768: { slidesPerView: 3, spaceBetween: 15 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
        }}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={review.id} style={usesStaggeredEntrance ? { '--weelp-carousel-reveal-index': Math.min(index, 4) } : undefined}>
            <Testimonial username={review.user?.name} title={review.review_text} date={review.created_at} itemName={review.item?.name} rating={review.rating} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Root>
  );
};
