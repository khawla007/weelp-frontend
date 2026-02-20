'use client';
// Single Post Sliders
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { SingleProductReviewCard } from '@/app/components/ReviewCard';
import { ReviewCardCarouselAnimation } from '@/app/components/Animation/ProductAnimation';
import 'swiper/css';
import 'swiper/css/navigation';

const ReviewSlider = () => {
  const [initialize, setInitialize] = useState(null);
  useEffect(() => {
    setInitialize(true);
  }, []);
  if (initialize) {
    return (
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
        }}
        className="w-full py-8 "
      >
        {[...Array(6)].map((_, index) => (
          <SwiperSlide key={index}>
            <SingleProductReviewCard title={'Markus_K'} rating={4} comment={'Very well and good organized trip to the Desert West Quads, Falcon Show, Camelriding and Delicious Barbecue.'} />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }
  return <ReviewCardCarouselAnimation />;
};

export default ReviewSlider;

// Only Use In Single Product
export const SingleProductReviewSlider = () => {
  return (
    <div className="flex flex-col singleproduct_reviewslider">
      <h2 className={`text-lg sm:text-[28px] font-medium text-Nileblue`}>Featured Review</h2>
      <ReviewSlider />
    </div>
  );
};
