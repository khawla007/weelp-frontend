'use client';
// Blog slider {BlogCard}
import React, { Children } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useIsClient } from '@/hooks/useIsClient';
// import { BlogCard } from '../singleproductguide';

export const SliderLayout = ({ data, children, item }) => {
  const isClient = useIsClient();
  if (isClient) {
    return (
      <div className="">
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          navigation={true}
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
          {data.map((val, index) => (
            <SwiperSlide key={index}> {typeof item === 'function' && item()}</SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }
};
