// Review Slider — accepts real review data
'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import ReviewCard from '../ReviewCard';

const ReviewSlider = ({ reviews = [] }) => {
  if (reviews.length === 0) return null;

  return (
    <div className="carousel-shell-wrapper">
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        navigation={{
          prevEl: '.review-prev',
          nextEl: '.review-next',
        }}
        loop={false}
        watchOverflow={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
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
        className="w-full"
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <ReviewCard title={review.user?.name || 'Anonymous'} rating={review.rating} comment={review.review_text} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewSlider;
