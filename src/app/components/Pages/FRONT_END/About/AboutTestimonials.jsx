'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import AboutImage from './AboutImage';
import BlurRevealHeading from './BlurRevealHeading';
import SectionBadge from './SectionBadge';
import styles from './AboutPage.module.css';

const reviews = [
  {
    id: 1,
    name: 'Stephanie Jonathon',
    descriptor: 'Kenya Safari',
    text: 'Weelp made our Kenya safari effortless. Every guide was knowledgeable and the itinerary was perfectly paced.',
    rating: 5,
    image: '/assets/images/about-story.jpg',
    avatar: '/assets/images/team-1.jpg',
  },
  {
    id: 2,
    name: 'Daniel Carter',
    descriptor: 'Paris City Tour',
    text: 'Booking was seamless and the local experiences were unforgettable. Highly recommend.',
    rating: 5,
    image: '/assets/images/CountryBanner.jpeg',
    avatar: '/assets/images/team-2.jpg',
  },
  {
    id: 3,
    name: 'Marvin Grant',
    descriptor: 'Desert Safari',
    text: 'The desert safari in Dubai exceeded expectations. Support was there whenever we needed it.',
    rating: 4,
    image: '/assets/images/hero_redesigned_bg.jpeg',
    avatar: '/assets/images/team-3.jpg',
  },
];

const AboutTestimonials = () => {
  const swiperRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const syncEdges = useCallback((swiper) => {
    setAtStart(Boolean(swiper.isBeginning));
    setAtEnd(Boolean(swiper.isEnd));
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event) => setReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <section data-about-section="testimonials" className={`bg-weelp-sage-wash ${styles.testimonialSection}`}>
      <div className={`container-page ${styles.testimonialInner}`}>
        <div className={styles.testimonialHeader}>
          <SectionBadge icon={Quote}>Traveler Stories</SectionBadge>
          <BlurRevealHeading className="section-opener mt-5 max-w-[20ch] text-foreground">Feedback from travelers around the world</BlurRevealHeading>
          <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex gap-1 text-yellow-400" aria-label="4.9 out of 5 stars">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={16} fill="currentColor" aria-hidden="true" />
              ))}
            </span>
            <span>4.9 average · 2k+ verified reviews</span>
          </div>
        </div>

        <div role="region" aria-label="Traveler testimonials" aria-live="polite" className="relative">
          <Swiper
            modules={[Navigation]}
            slidesPerView={1}
            speed={reducedMotion ? 0 : 650}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              syncEdges(swiper);
            }}
            onSlideChange={syncEdges}
            onReachBeginning={syncEdges}
            onReachEnd={syncEdges}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <article className={styles.testimonialSlide}>
                  <div className={`${styles.testimonialImage} ${styles.imageShell}`}>
                    <AboutImage
                      src={review.image}
                      alt={`${review.name} on ${review.descriptor}`}
                      fallbackLabel="Traveler image unavailable"
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className={`object-cover ${styles.imageZoom}`}
                    />
                  </div>
                  <div className={`bg-weelp-sage-deep p-7 text-white md:p-10 lg:p-12 ${styles.testimonialPanel}`}>
                    <div>
                      <div className="mb-8 flex items-center justify-between gap-4">
                        <Quote size={40} aria-hidden="true" className="text-white/70" />
                        <span className="flex gap-1 text-yellow-400" aria-label={`${review.rating} out of 5 stars`}>
                          {Array.from({ length: review.rating }, (_, index) => (
                            <Star key={index} size={16} fill="currentColor" aria-hidden="true" />
                          ))}
                        </span>
                      </div>
                      <blockquote className="text-xl leading-[1.55] text-white md:text-2xl">“{review.text}”</blockquote>
                    </div>

                    <div className="mt-10 border-t border-white/25 pt-7 pr-28">
                      <div className="flex items-center">
                        <div className="flex items-center gap-4">
                          <span className="relative h-12 w-12 overflow-hidden rounded-full border border-white/30">
                            <AboutImage src={review.avatar} alt={`${review.name} avatar`} fallbackLabel="Reviewer avatar unavailable" fill sizes="48px" className="object-cover" />
                          </span>
                          <span>
                            <strong className="block text-sm font-semibold text-white">{review.name}</strong>
                            <span className="mt-1 block text-xs text-white/65">{review.descriptor}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className={`flex gap-2 ${styles.testimonialControls}`}>
            <button
              type="button"
              aria-label="Previous testimonial"
              disabled={atStart}
              onClick={() => swiperRef.current?.slidePrev()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white disabled:opacity-35"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              disabled={atEnd}
              onClick={() => swiperRef.current?.slideNext()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white disabled:opacity-35"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTestimonials;
