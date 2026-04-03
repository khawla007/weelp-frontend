// Testimonial Slider
'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Testimonial from '../Testimonial';

export const TestmonialSlider = ({ reviews = [] }) => {
  return (
    <div className="carousel-shell-wrapper testimonial-slider">
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        speed={8000}
        spaceBetween={20}
        loop={reviews.length > 4}
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
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <Testimonial username={review.user?.name} title={review.review_text} date={review.created_at} itemName={review.item?.name} rating={review.rating} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
