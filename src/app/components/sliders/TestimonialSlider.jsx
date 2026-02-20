// Testimonial Slider
'use client';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Testimonial from '../Testimonial';
import { TestimonialCarouselAnimation } from '../Animation/ProductAnimation';

export const TestmonialSlider = () => {
  const [initialize, setInitialize] = useState(null);
  useEffect(() => {
    setInitialize(true);
  }, []);
  if (initialize) {
    return (
      <div>
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          speed={8000}
          spaceBetween={20}
          loop={true}
          breakpoints={{
            450: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
          className=""
        >
          {[...Array(6)].map((_, index) => (
            <SwiperSlide key={index}>
              {/* <DestinationCard /> */}
              <Testimonial />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }
  return <TestimonialCarouselAnimation />;
};
