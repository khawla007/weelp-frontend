'use client';

import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import 'swiper/css';
import Testimonial from '@/app/components/Testimonial';
import SectionBadge from './SectionBadge';

const reviews = [
  {
    id: 1,
    user: { name: 'Stephanie Jonathon' },
    review_text: 'Weelp made our Kenya safari effortless. Every guide was knowledgeable and the itinerary was perfectly paced.',
    created_at: '2026-05-12',
    item: { name: 'Kenya Safari' },
    rating: 5,
  },
  {
    id: 2,
    user: { name: 'Daniel Carter' },
    review_text: 'Booking was seamless and the local experiences were unforgettable. Highly recommend.',
    created_at: '2026-04-28',
    item: { name: 'Paris City Tour' },
    rating: 5,
  },
  {
    id: 3,
    user: { name: 'Marvin Grant' },
    review_text: 'The desert safari in Dubai exceeded expectations. Support was there whenever we needed it.',
    created_at: '2026-06-03',
    item: { name: 'Desert Safari' },
    rating: 4,
  },
  {
    id: 4,
    user: { name: 'Aisha Rahman' },
    review_text: 'Authentic, well-organized, and great value. Weelp is now our go-to for travel.',
    created_at: '2026-03-19',
    item: { name: 'Marrakech Markets' },
    rating: 5,
  },
  {
    id: 5,
    user: { name: 'Luca Moretti' },
    review_text: 'Loved the flexibility and the curated experiences. Everything felt personal.',
    created_at: '2026-02-08',
    item: { name: 'Rome Food Walk' },
    rating: 5,
  },
];

const AboutTestimonials = () => {
  const swiperRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <section className="mb-10 w-full bg-weelp-sage-wash py-10 md:mb-16 md:py-16 lg:mb-24 lg:py-24">
      <div className="container-page">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <SectionBadge icon={Quote}>Traveler Stories</SectionBadge>
          <h2 className="text-foreground">Feedback from travelers around the world</h2>
          <p className="text-muted-foreground">4.9 average rating · 2k+ verified reviews</p>
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => swiperRef.current?.slidePrev()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-weelp-sage-deep text-weelp-sage-text transition-colors hover:bg-weelp-sage-deep hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => swiperRef.current?.slideNext()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-weelp-sage-deep text-weelp-sage-text transition-colors hover:bg-weelp-sage-deep hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <Swiper
          modules={[Navigation]}
          onSwiper={(s) => {
            swiperRef.current = s;
          }}
          speed={reducedMotion ? 0 : 500}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        >
          {reviews.map((r) => (
            <SwiperSlide key={r.id} className="h-auto">
              <div className="h-full rounded-[24px] border border-border bg-background p-6">
                <Testimonial username={r.user.name} title={r.review_text} date={r.created_at} itemName={r.item.name} rating={r.rating} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default AboutTestimonials;
