// Review Slider — accepts real review data
'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import ReviewCard from '../ReviewCard';
import '@/app/styles/swiper.css';

const ReviewSlider = ({ reviews = [] }) => {
  if (reviews.length === 0) return null;

  return (
    <div className="carousel-shell-wrapper">
      <Swiper
        modules={[Navigation, Autoplay]}
        slidesPerView={1}
        spaceBetween={16}
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
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1280: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
        }}
        className="w-full"
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id} className="!h-auto">
            <ReviewCard title={review.user?.name || 'Anonymous'} rating={review.rating} comment={review.review_text} itemLabel={formatReviewItemLabel(review.item)} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

const formatReviewItemLabel = (item) => {
  if (!item?.name) return null;

  const type = item.type ? `${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}` : 'Experience';
  return `${type}: ${item.name}`;
};

export default ReviewSlider;
