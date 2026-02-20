'use client';
// Blog slider {BlogCard}
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { BlogCard } from '../singleproductguide';

const BlogSlider = ({ data }) => {
  const [intialize, setInitialize] = useState('');
  useEffect(() => {
    setInitialize(true);
  }, []);

  if (intialize) {
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
            <SwiperSlide key={index}>
              <BlogCard imageSrc={val?.media_gallery?.[0]?.url} blogTitle={val?.name} {...val} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }
};

export default BlogSlider;
