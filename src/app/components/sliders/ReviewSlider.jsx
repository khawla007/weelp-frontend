// Single Post Sliders
'use client';
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ReviewCard from '../ReviewCard';
import { ReviewCardCarouselAnimation } from '../Animation/ProductAnimation';

const ReviewSlider = () => {
  const [initialize, setInitialize] = useState(null);
  useEffect(() => {
    setInitialize(true);
  }, []);
  if (initialize) {
    return (
      // <div>
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        navigation={true}
        loop={true}
        autoplay={{
          delay: 2000,
        }}
        breakpoints={{
          450: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 2,
          },
          1440: {
            slidesPerView: 3,
          },
        }}
        className="w-full py-8"
      >
        {[...Array(6)].map((_, index) => (
          <SwiperSlide key={index}>
            <ReviewCard title={'Markus_K'} rating={4} comment={'Very well and good organized trip to the Desert West Quads, Falcon Show, Camelriding and Delicious Barbecue.'} />
          </SwiperSlide>
        ))}
      </Swiper>
      // </div>
    );
  }
  return <ReviewCardCarouselAnimation />;
};

export default ReviewSlider;
